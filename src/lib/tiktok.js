export function getTikTokVideoId(url = "") {
  const match = url.match(/\/video\/(\d+)/);
  return match?.[1] || "";
}

export function getTikTokEmbedUrl(url = "") {
  const videoId = getTikTokVideoId(url);
  if (!videoId) return "";

  const params = new URLSearchParams({
    controls: "1",
    progress_bar: "1",
    play_button: "1",
    volume_control: "1",
    fullscreen_button: "1",
    timestamp: "1",
    autoplay: "0",
    music_info: "1",
    description: "0",
    rel: "0",
  });

  return `https://www.tiktok.com/player/v1/${videoId}?${params.toString()}`;
}
