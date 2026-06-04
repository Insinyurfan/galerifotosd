const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{6,32}$/;

export function getYouTubeId(input = "") {
  const value = input.trim();
  if (!value) return "";

  if (YOUTUBE_ID_PATTERN.test(value) && !value.includes("/")) {
    return value;
  }

  const patterns = [
    /youtube\.com\/watch\?[^#]*v=([A-Za-z0-9_-]{6,32})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,32})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,32})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{6,32})/,
    /youtu\.be\/([A-Za-z0-9_-]{6,32})/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  try {
    const url = new URL(value);
    const videoId = url.searchParams.get("v");
    return videoId && YOUTUBE_ID_PATTERN.test(videoId) ? videoId : "";
  } catch {
    return "";
  }
}

export function getYouTubeEmbedUrl(input = "") {
  const videoId = getYouTubeId(input);
  if (!videoId) return "";
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getYouTubeWatchUrl(input = "") {
  const videoId = getYouTubeId(input);
  if (!videoId) return input;
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getYouTubeThumbnailUrl(input = "") {
  const videoId = getYouTubeId(input);
  if (!videoId) return "";
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
