const initReveals = () => {
  const reveals = document.querySelectorAll(".reveal:not(.is-visible)");
  const isPhone = window.matchMedia("(max-width: 739px)").matches;

  if (!reveals.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: isPhone ? 0.01 : 0.12,
      rootMargin: isPhone ? "240px 0px -4% 0px" : "120px 0px -8% 0px",
    },
  );

  reveals.forEach((element) => observer.observe(element));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReveals, { once: true });
} else {
  initReveals();
}
