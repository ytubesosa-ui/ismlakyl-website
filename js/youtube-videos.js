
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("youtube-videos");
  if (!container) return;

  try {
const response = await fetch("/api/youtube");    
	  if (!response.ok) throw new Error("Video listesi alınamadı");

    const videos = await response.json();
    if (!Array.isArray(videos)) {
      throw new Error("Geçersiz video verisi");
    }

    const fragment = document.createDocumentFragment();

    videos.forEach((video) => {
      if (!/^[a-zA-Z0-9_-]{11}$/.test(video.id)) return;

      const column = document.createElement("div");
      column.className = "col-md-4";

      const card = document.createElement("div");
card.className = "card shadow border-0 rounded-4 h-100 overflow-hidden youtube-video-card";
      const link = document.createElement("a");
      link.href = `https://www.youtube.com/watch?v=${video.id}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const img = document.createElement("img");
      img.src = video.thumbnail;
      img.alt = video.title || "ISML AKYL YouTube Video";
      img.className = "card-img-top";
		img.style.aspectRatio = "16 / 9";
img.style.objectFit = "cover";
      img.loading = "lazy";

      const body = document.createElement("div");
      body.className = "card-body text-center";
		const title = document.createElement("h3");
const decoder = document.createElement("textarea");
decoder.innerHTML = video.title || "ISML AKYL Videosu";
title.textContent = decoder.value;
title.className = "video-title";
title.style.fontSize = "16px";
title.style.fontWeight = "700";
title.style.lineHeight = "1.4";
		title.style.display = "-webkit-box";
title.style.webkitBoxOrient = "vertical";
title.style.webkitLineClamp = "2";
title.style.overflow = "hidden";
title.style.minHeight = "45px";
title.style.marginBottom = "15px";

      const button = document.createElement("a");
      button.href = link.href;
      button.target = "_blank";
      button.rel = "noopener noreferrer";
      button.className = "btn btn-primary";
      button.textContent = "VİDEOYU İZLE";
      link.appendChild(img);
		body.appendChild(title);
      body.appendChild(button);
      card.append(link, body);
      column.appendChild(card);
      fragment.appendChild(column);
    });

    if (fragment.childNodes.length > 0) {
      container.replaceChildren(fragment);
    }
  } catch (error) {
    console.error("YouTube videos:", error);
  }
});
// JavaScript Document
