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

export function getImageCandidates(url = "") {
  const fileId = getDriveFileId(url);
  if (!fileId) return [url].filter(Boolean);

  return [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    url,
  ].filter((candidate, index, candidates) => candidate && candidates.indexOf(candidate) === index);
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

export function getDriveViewUrl(url = "") {
  const fileId = getDriveFileId(url);
  if (!fileId) return url;
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function getDirectDriveUrlFromId(fileId = "") {
  if (!fileId.trim()) return "";
  return `https://drive.google.com/uc?export=view&id=${fileId.trim()}`;
}
