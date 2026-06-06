import { useContext } from "react";
import { SiteSettingsContext } from "../contexts/siteSettingsContext.js";

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) throw new Error("useSiteSettings harus digunakan di dalam SiteSettingsProvider.");
  return context;
}
