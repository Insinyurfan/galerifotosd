export function getDriveFileId(url = "") {
  const patterns = [
    /\/file\/d\/([^/]+)/,
    /[?&]id=([^&]+)/,
    /\/d\/([^/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  return "";
}

export function getImageUrl(url = "") {
  const fileId = getDriveFileId(url);
  if (!fileId) return url;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}

export function getVideoEmbedUrl(url = "") {
  const fileId = getDriveFileId(url);
  if (!fileId) return "";
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function getDownloadUrl(url = "") {
  const fileId = getDriveFileId(url);
  if (!fileId) return url;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function getDirectDriveUrlFromId(fileId = "") {
  if (!fileId.trim()) return "";
  return `https://drive.google.com/uc?export=view&id=${fileId.trim()}`;
}
