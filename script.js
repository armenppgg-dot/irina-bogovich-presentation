const slideFiles = [
  "slide-01.jpg",
  "slide-02.jpg",
  "slide-03.jpg",
  "slide-04.jpg",
  "slide-05.jpg",
  "slide-06.jpg",
  "slide-07.jpg",
  "slide-08.png",
  "slide-09.jpg",
  "slide-10.jpg",
  "slide-11.jpg",
  "slide-12.jpg",
  "slide-13.jpg",
  "slide-14.jpg",
  "slide-15.jpg",
  "slide-16.jpg",
  "slide-17.png",
];

const slides = slideFiles.map((fileName, index) => ({
  image: `assets/images/${fileName}`,
  alt: `Слайд ${index + 1}`,
}));

const audioTrack = "assets/assets/audio/music.mp3";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const slideInterval = prefersReducedMotion ? 5500 : 4500;
const transitionDuration = prefersReducedMotion ? 0 : 1100;

const elements = {
  layers: Array.from(document.querySelectorAll(".slide")),
  counter: document.getElementById("slide-counter"),
  prevButton: document.getElementById("prev-button"),
  playButton: document.getElementById("play-button"),
  nextButton: document.getElementById("next-button"),
  audioButton: document.getElementById("audio-button"),
  audio: document.getElementById("background-audio"),
};

let currentIndex = 0;
let activeLayerIndex = 0;
let isPlaying = true;
let isTransitioning = false;
let autoplayTimer = 0;
let audioUnlockBound = false;

const normalizeIndex = (index) => {
  const total = slides.length;
  return ((index % total) + total) % total;
};

const renderSlide = (layer, slide) => {
  const image = layer.querySelector(".slide-image");
  image.src = slide.image;
  image.alt = slide.alt;
};

const updateCounter = () => {
  elements.counter.textContent = `${currentIndex + 1} / ${slides.length}`;
};

const stopAutoplay = () => {
  if (!autoplayTimer) {
    return;
  }

  window.clearTimeout(autoplayTimer);
  autoplayTimer = 0;
};

const preloadUpcomingSlides = () => {
  for (let offset = 1; offset <= 2; offset += 1) {
    const slide = slides[normalizeIndex(currentIndex + offset)];
    const image = new Image();
    image.src = slide.image;
  }
};

const scheduleAutoplay = () => {
  stopAutoplay();

  if (!isPlaying || slides.length < 2 || document.hidden) {
    return;
  }

  autoplayTimer = window.setTimeout(() => {
    showSlide(currentIndex + 1);
  }, slideInterval);
};

const updatePlayButton = () => {
  elements.playButton.textContent = isPlaying ? "Пауза" : "Старт";
  elements.playButton.setAttribute("aria-pressed", String(isPlaying));
};

const updateAudioButton = () => {
  if (!audioTrack) {
    elements.audioButton.disabled = true;
    elements.audioButton.textContent = "Музыка: файл не задан";
    return;
  }

  elements.audioButton.disabled = false;
  elements.audioButton.textContent = elements.audio.paused
    ? "Включить музыку"
    : "Выключить музыку";
};

const bindAudioUnlock = () => {
  if (audioUnlockBound || !audioTrack) {
    return;
  }

  audioUnlockBound = true;

  const unlockAudio = async () => {
    try {
      await elements.audio.play();
      updateAudioButton();
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    } catch (_error) {
      // iPhone can still reject until the next direct user interaction.
    }
  };

  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
};

const startBackgroundAudio = async () => {
  if (!audioTrack) {
    return;
  }

  try {
    await elements.audio.play();
    updateAudioButton();
  } catch (_error) {
    bindAudioUnlock();
  }
};

function showSlide(index) {
  if (!slides.length || isTransitioning) {
    return;
  }

  const nextIndex = normalizeIndex(index);

  if (nextIndex === currentIndex) {
    scheduleAutoplay();
    return;
  }

  const activeLayer = elements.layers[activeLayerIndex];
  const nextLayerIndex = activeLayerIndex === 0 ? 1 : 0;
  const nextLayer = elements.layers[nextLayerIndex];

  isTransitioning = true;
  stopAutoplay();
  currentIndex = nextIndex;

  renderSlide(nextLayer, slides[currentIndex]);
  nextLayer.setAttribute("aria-hidden", "false");
  activeLayer.setAttribute("aria-hidden", "true");

  requestAnimationFrame(() => {
    nextLayer.classList.add("is-active");
    activeLayer.classList.remove("is-active");
    updateCounter();
    preloadUpcomingSlides();

    window.setTimeout(() => {
      activeLayerIndex = nextLayerIndex;
      isTransitioning = false;
      scheduleAutoplay();
    }, transitionDuration);
  });
}

const toggleAutoplay = () => {
  isPlaying = !isPlaying;
  updatePlayButton();

  if (isPlaying) {
    scheduleAutoplay();
    return;
  }

  stopAutoplay();
};

const toggleAudio = async () => {
  if (!audioTrack) {
    return;
  }

  if (elements.audio.paused) {
    try {
      await elements.audio.play();
    } catch (_error) {
      elements.audio.pause();
    }
  } else {
    elements.audio.pause();
  }

  updateAudioButton();
};

const init = () => {
  if (!slides.length) {
    return;
  }

  if (audioTrack) {
    elements.audio.src = audioTrack;
  }

  renderSlide(elements.layers[activeLayerIndex], slides[currentIndex]);
  renderSlide(elements.layers[1], slides[currentIndex]);
  updateCounter();
  updatePlayButton();
  updateAudioButton();
  preloadUpcomingSlides();
  scheduleAutoplay();
  startBackgroundAudio();

  elements.prevButton.addEventListener("click", () => showSlide(currentIndex - 1));
  elements.nextButton.addEventListener("click", () => showSlide(currentIndex + 1));
  elements.playButton.addEventListener("click", toggleAutoplay);
  elements.audioButton.addEventListener("click", toggleAudio);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
      return;
    }

    scheduleAutoplay();
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
