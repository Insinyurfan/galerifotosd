import { FOLDER_CATEGORIES } from "../constants/media.js";
import { getDirectDriveUrlFromId } from "./drive.js";

const DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";
const GOOGLE_DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";

export function getDriveFolderId(url = "") {
  const patterns = [
    /\/folders\/([^/?#]+)/,
    /[?&]id=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  return url.trim();
}

function getMediaType(mimeType = "") {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "";
}

function cleanTitle(name = "") {
  return name.replace(/\.[^/.]+$/, "").trim() || name;
}

async function listFolderItems(folderId, apiKey) {
  const items = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({
      key: apiKey,
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType,description,createdTime)",
      pageSize: "1000",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });

    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(`${GOOGLE_DRIVE_FILES_URL}?${params.toString()}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "Gagal membaca folder Google Drive.");
    }

    items.push(...(result.files || []));
    pageToken = result.nextPageToken || "";
  } while (pageToken);

  return items;
}

function toMediaPayload(file, folderCategory) {
  const type = getMediaType(file.mimeType);
  if (!type) return null;

  return {
    title: cleanTitle(file.name),
    description: file.description || "",
    type,
    folder_category: folderCategory,
    drive_url: getDirectDriveUrlFromId(file.id),
  };
}

export async function importGoogleDriveFolder(folderUrl, apiKey) {
  const folderId = getDriveFolderId(folderUrl);

  if (!folderId) {
    throw new Error("Link folder Google Drive belum valid.");
  }

  if (!apiKey) {
    throw new Error("VITE_GOOGLE_DRIVE_API_KEY belum diisi.");
  }

  const rootItems = await listFolderItems(folderId, apiKey);
  const rootFolders = rootItems.filter((item) => item.mimeType === DRIVE_FOLDER_MIME);
  const importedItems = [];

  for (const category of FOLDER_CATEGORIES) {
    const categoryFolder = rootFolders.find((folder) => folder.name.toLowerCase() === category.toLowerCase());

    if (categoryFolder) {
      const categoryItems = await listFolderItems(categoryFolder.id, apiKey);
      importedItems.push(...categoryItems.map((file) => toMediaPayload(file, category)).filter(Boolean));
    }
  }

  if (!importedItems.length) {
    importedItems.push(...rootItems.map((file) => toMediaPayload(file, FOLDER_CATEGORIES[0])).filter(Boolean));
  }

  return importedItems;
}
