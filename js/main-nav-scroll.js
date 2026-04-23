(function () {
  if (/^\/x-?garge\/?/.test(window.location.pathname)) return;

  function renderPresetNav() {
    var menus = document.getElementById("menus");
    if (!menus || menus.querySelector(".main-preset-nav")) return;

    var navLabel = "\u4e3b\u9875\u9884\u8bbe\u5bfc\u822a";
    var car = "\uD83D\uDE97";
    var preset = "\u9884\u8bbe";

    menus.innerHTML = [
      '<div class="main-preset-nav" aria-label="' + navLabel + '">',
      '<a class="main-preset-link" href="/x-garge/">x-garge' + car + '</a>',
      '<a class="main-preset-link" href="javascript:void(0)">' + preset + '2</a>',
      '<a class="main-preset-link" href="javascript:void(0)">' + preset + '3</a>',
      '<a class="main-preset-link" href="javascript:void(0)">' + preset + '4</a>',
      "</div>"
    ].join("");
  }

  function renderFriendNav() {
    var nav = document.getElementById("nav");
    if (!nav || nav.querySelector(".main-friend-nav")) return;

    var wrapper = document.createElement("div");
    wrapper.className = "main-friend-nav";
    var friendText = "\u53cb\u94fe";
    var visitText = "\u8bbf\u95ee\u7ad9\u70b9";
    wrapper.innerHTML = [
      '<button class="main-friend-toggle" type="button" aria-expanded="false">' + friendText + '</button>',
      '<div class="main-friend-panel is-hidden">',
      '<p class="main-friend-eyebrow">Friend Link</p>',
      '<a class="main-friend-card" href="https://p1ggy929.github.io/" target="_blank" rel="noopener">',
      '<strong class="main-friend-name">p1GgY</strong>',
      '<span class="main-friend-url">https://p1ggy929.github.io/</span>',
      '<span class="main-friend-action">' + visitText + '</span>',
      '</a>',
      "</div>"
    ].join("");
    nav.appendChild(wrapper);

    var toggle = wrapper.querySelector(".main-friend-toggle");
    var panel = wrapper.querySelector(".main-friend-panel");
    wrapper.addEventListener("mouseenter", function () {
      panel.classList.remove("is-hidden");
      toggle.setAttribute("aria-expanded", "true");
    });
    wrapper.addEventListener("mouseleave", function () {
      panel.classList.add("is-hidden");
      toggle.setAttribute("aria-expanded", "false");
    });
    wrapper.addEventListener("focusin", function () {
      panel.classList.remove("is-hidden");
      toggle.setAttribute("aria-expanded", "true");
    });
    wrapper.addEventListener("focusout", function () {
      window.setTimeout(function () {
        if (wrapper.contains(document.activeElement)) return;
        panel.classList.add("is-hidden");
        toggle.setAttribute("aria-expanded", "false");
      }, 0);
    });
  }

  function renderHeroTitle() {
    var title = document.getElementById("site-title");
    var text = "\u6b22\u8fce\u6765\u5230BIGe\u7684\u535a\u5ba2\uD83D\uDE0F";
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
    renderFriendNav();
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
