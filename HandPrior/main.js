// Lightweight interactions for the project page.

document.addEventListener("DOMContentLoaded", () => {
  setupCopyBibtex();
  setupViewportVideoPlayback();
  setupCarousels();
});

// Left/right paging for in-the-wild carousels (one page = current viewport width).
function setupCarousels() {
  document.querySelectorAll(".carousel").forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const prev = carousel.querySelector(".carousel-btn.prev");
    const next = carousel.querySelector(".carousel-btn.next");
    if (!track || !prev || !next) return;

    const page = () => track.clientWidth + 16; // include gap

    const updateButtons = () => {
      const maxScroll = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft >= maxScroll;
    };

    prev.addEventListener("click", () => {
      track.scrollBy({ left: -page(), behavior: "smooth" });
    });
    next.addEventListener("click", () => {
      track.scrollBy({ left: page(), behavior: "smooth" });
    });
    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();
  });
}

// Copy BibTeX to clipboard.
function setupCopyBibtex() {
  const btn = document.querySelector(".copy-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const code = btn.parentElement.querySelector("code");
    if (!code) return;

    const text = code.innerText;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-secure contexts.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    const original = btn.textContent;
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("copied");
    }, 1600);
  });
}

// Play videos only while visible; pause when scrolled away to save resources.
// Real <video> elements are added later when placeholders are replaced.
function setupViewportVideoPlayback() {
  const videos = document.querySelectorAll("video");
  if (!videos.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise) playPromise.catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.25 }
  );

  videos.forEach((video) => observer.observe(video));
}
