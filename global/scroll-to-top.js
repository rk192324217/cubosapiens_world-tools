// global/scroll-to-top.js
document.addEventListener("DOMContentLoaded", () => {
  // 1. Dynamically inject the button into the HTML so you don't have to manually paste HTML into 15+ files!
  const btn = document.createElement("button");
  btn.id = "scrollToTopBtn";
  btn.title = "Go to top";
  btn.innerHTML = "&#8593;";
  document.body.appendChild(btn);

  // 2. Handle scroll logic
  window.onscroll = function() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      btn.style.display = "block";
    } else {
      btn.style.display = "none";
    }
  };

  // 3. Handle click logic
  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});