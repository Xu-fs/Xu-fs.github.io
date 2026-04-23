(function () {
  if (/^\/x-?garge\/?/.test(window.location.pathname)) return;

  function renderPresetNav() {
    var menus = document.getElementById("menus");
    if (!menus || menus.querySelector(".main-preset-nav")) return;

    menus.innerHTML = [
      '<div class="main-preset-nav" aria-label="主页预设导航">',
      '<a class="main-preset-link" href="/x-garge/">x-garge🚗</a>',
      '<a class="main-preset-link" href="javascript:void(0)">预设2</a>',
      '<a class="main-preset-link" href="javascript:void(0)">预设3</a>',
      '<a class="main-preset-link" href="javascript:void(0)">预设4</a>',
      "</div>"
    ].join("");
  }

  function renderHeroTitle() {
    var title = document.getElementById("site-title");
    var text = "欢迎来到BIGe的博客😏";
    if (!title || title.dataset.typedTitle === text) return;

    title.dataset.typedTitle = text;
    title.setAttribute("aria-label", text);
    title.innerHTML = Array.from(text).map(function (char, index) {
      var safeChar = char === " " ? "&nbsp;" : char;
      return '<span class="hero-title-char" aria-hidden="true" style="animation-delay:' + (index * 0.11) + 's">' + safeChar + "</span>";
    }).join("");
  }

  function updateMainNav() {
    document.body.classList.toggle("main-nav-visible", window.scrollY > 8);
  }

  function initMainNav() {
    renderPresetNav();
    renderHeroTitle();
    updateMainNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMainNav);
  } else {
    initMainNav();
  }

  window.addEventListener("scroll", updateMainNav, { passive: true });
})();
