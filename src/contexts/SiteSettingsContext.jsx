import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_SITE_SETTINGS } from "../constants/site.js";
import { supabase } from "../lib/supabase.js";
import { SiteSettingsContext } from "./siteSettingsContext.js";
const SITE_ASSETS_BUCKET = "site-assets";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getSafeFileName(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  return `${Date.now()}-${crypto.randomUUID()}.${extension.replace(/[^a-z0-9]/g, "")}`;
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();

    if (error) {
      setErrorMessage(error.message);
    } else if (data) {
      setSettings({ ...DEFAULT_SITE_SETTINGS, ...data });
      setErrorMessage("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = useCallback(async (changes) => {
    const payload = {
      ...changes,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("site_settings").update(payload).eq("id", 1).select().maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Pengaturan situs belum tersedia. Jalankan skrip setup Supabase terlebih dahulu.");

    setSettings((current) => ({ ...current, ...data }));
    setErrorMessage("");
    return data;
  }, []);

  const uploadImage = useCallback(
    async (file, folder, settingKey) => {
      if (!file?.type.startsWith("image/")) {
        throw new Error("File harus berupa gambar.");
      }
      if (file.size > MAX_IMAGE_SIZE) {
        throw new Error("Ukuran gambar maksimal 5 MB.");
      }

      const filePath = `${folder}/${getSafeFileName(file)}`;
      const { error: uploadError } = await supabase.storage.from(SITE_ASSETS_BUCKET).upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
      });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from(SITE_ASSETS_BUCKET).getPublicUrl(filePath);
      await saveSettings({ [settingKey]: data.publicUrl });
      return data.publicUrl;
    },
    [saveSettings]
  );

  const value = useMemo(
    () => ({ settings, loading, errorMessage, fetchSettings, saveSettings, uploadImage }),
    [errorMessage, fetchSettings, loading, saveSettings, settings, uploadImage]
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}
