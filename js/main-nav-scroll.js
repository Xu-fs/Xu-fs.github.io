(function () {
  if (/^\/x-?garge\/?/.test(window.location.pathname)) return;

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

  function renderHeroTypewriter() {
    var siteInfo = document.getElementById("site-info");
    if (!siteInfo || siteInfo.querySelector(".hero-typewriter")) return;

    var lines = [
      "\u795d\u4f60\u65e9\u3001\u5348\u3001\u665a\u5b89",
      "Good afternoon\uFF0Cgood evening\uFF0Cand good night."
    ];
    var typewriter = document.createElement("div");
    typewriter.className = "hero-typewriter";
    typewriter.setAttribute("aria-label", lines.join(" "));
    typewriter.innerHTML = [
      '<span class="hero-type-text"></span>',
      '<span class="hero-type-cursor" aria-hidden="true"></span>'
    ].join("");
    siteInfo.appendChild(typewriter);

    var target = typewriter.querySelector(".hero-type-text");
    var lineIndex = 0;
    var charIndex = 0;
    var deleting = false;

    function tick() {
      var current = lines[lineIndex];
      target.textContent = current.slice(0, charIndex);

      if (!deleting && charIndex < current.length) {
        charIndex += 1;
        window.setTimeout(tick, 76);
        return;
      }

      if (!deleting) {
        deleting = true;
        window.setTimeout(tick, 1500);
        return;
      }

      if (charIndex > 0) {
        charIndex -= 1;
        window.setTimeout(tick, 42);
        return;
      }

      deleting = false;
      lineIndex = (lineIndex + 1) % lines.length;
      window.setTimeout(tick, 360);
    }

    window.setTimeout(tick, 1350);
  }

  function updateMainNav() {
    document.body.classList.toggle("main-nav-visible", window.scrollY > 8);
  }

  function initMainNav() {
    renderFriendNav();
    renderHeroTitle();
    renderHeroTypewriter();
    updateMainNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMainNav);
  } else {
    initMainNav();
  }

  window.addEventListener("scroll", updateMainNav, { passive: true });
})();
