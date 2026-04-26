(function () {
  var PAGE_SELECTOR = "#body-wrap.type-music #article-container .music-markdown";
  var DEFAULT_REPO = "Xu-fs/Blog_Music";
  var DEFAULT_BRANCH = "master";
  var I18N = {
    unknownArtist: "\u672a\u77e5\u6b4c\u624b",
    emptyDesc: "\u8fd9\u9996\u6b4c\u8fd8\u6ca1\u6709\u5199\u7b80\u4ecb\u3002",
    unnamedPlaylist: "\u672a\u547d\u540d\u6b4c\u5355",
    play: "\u64ad\u653e",
    playAll: "\u64ad\u653e\u5168\u90e8",
    openSection: "\u8fdb\u5165\u677f\u5757",
    songsSuffix: " \u9996",
    groupsSuffix: " \u7ec4",
    backHome: "\u8fd4\u56de\u97f3\u4e50\u9996\u9875",
    repoLabel: "GitHub Repo",
    cdnLabel: "jsDelivr CDN"
  };

  function textOf(node) {
    return node ? node.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeKey(node) {
    var key = textOf(node).toLowerCase();
    if (/^(\u6807\u9898|\u6b4c\u540d|\u6b4c\u66f2|title)$/.test(key)) return "title";
    if (/^(\u6b4c\u624b|\u827a\u4eba|artist)$/.test(key)) return "artist";
    if (/^(\u7b80\u4ecb|\u63cf\u8ff0|\u8bf4\u660e|desc)$/.test(key)) return "desc";
    if (/^(\u97f3\u9891|\u97f3\u6e90|\u97f3\u4e50|audio)$/.test(key)) return "audio";
    if (/^(\u5c01\u9762|\u56fe\u7247|cover)$/.test(key)) return "cover";
    if (/^(\u6392\u540d|rank)$/.test(key)) return "rank";
    if (/^(\u6b4c\u5355|playlist)$/.test(key)) return "playlist";
    return key;
  }

  function resolveAssetUrl(value, repo, branch) {
    if (!value) return "";
    if (/^https?:\/\//i.test(value) || /^\/\//.test(value)) return value;

    var cleanPath = String(value).replace(/^\.?\//, "");
    return "https://cdn.jsdelivr.net/gh/" + repo + "@" + branch + "/" + cleanPath;
  }

  function parseTable(table) {
    if (!table) return [];

    var headers = Array.prototype.map.call(table.querySelectorAll("thead th"), normalizeKey);
    var rows = table.querySelectorAll("tbody tr");

    return Array.prototype.map.call(rows, function (row) {
      var item = {};
      Array.prototype.forEach.call(row.children, function (cell, index) {
        item[headers[index] || ("field_" + index)] = textOf(cell);
      });
      return item;
    }).filter(function (item) {
      return item.title || item.playlist;
    });
  }

  function parseTables(root) {
    return Array.prototype.slice.call(root.querySelectorAll("table")).map(parseTable);
  }

  function buildTrack(item, repo, branch, sourceType, fallbackLabel, index) {
    return {
      title: item.title || (fallbackLabel + " " + index),
      artist: item.artist || I18N.unknownArtist,
      desc: item.desc || "",
      cover: resolveAssetUrl(item.cover, repo, branch),
      audio: resolveAssetUrl(item.audio, repo, branch),
      rank: item.rank || "",
      playlist: item.playlist || "",
      sourceType: sourceType
    };
  }

  function createFallbackCover(title) {
    return '<div class="music-cover-fallback">' + escapeHtml(title.slice(0, 12)) + "</div>";
  }

  function createCoverMarkup(track) {
    return track.cover
      ? '<img src="' + escapeHtml(track.cover) + '" alt="' + escapeHtml(track.title) + '" loading="lazy">'
      : createFallbackCover(track.title);
  }

  function ensurePlayerContainer() {
    var existing = document.getElementById("music-fixed-player");
    if (existing) return existing;

    var container = document.createElement("div");
    container.id = "music-fixed-player";
    document.body.appendChild(container);
    return container;
  }

  function destroyPlayer() {
    window.__musicPageTracks = null;
    window.__musicPageCurrentIndex = 0;
    var container = document.getElementById("music-fixed-player");
    if (container) container.innerHTML = "";
  }

  function updateNativePlayer(index, autoplay) {
    var tracks = window.__musicPageTracks || [];
    var player = document.getElementById("music-native-audio");
    var title = document.querySelector(".music-fixed-title");
    var artist = document.querySelector(".music-fixed-artist");
    var badge = document.querySelector(".music-fixed-count");
    var playButton = document.querySelector(".music-fixed-play");
    if (!player || !tracks.length) return;

    var safeIndex = Math.max(0, Math.min(index, tracks.length - 1));
    var track = tracks[safeIndex];
    window.__musicPageCurrentIndex = safeIndex;

    if (title) title.textContent = track.title || "";
    if (artist) artist.textContent = track.artist || "";
    if (badge) badge.textContent = (safeIndex + 1) + " / " + tracks.length;

    if (player.getAttribute("src") !== track.audio) {
      player.setAttribute("src", track.audio);
      player.load();
    }

    if (playButton) playButton.textContent = "▶";

    if (autoplay) {
      player.play().then(function () {
        if (playButton) playButton.textContent = "❚❚";
      }).catch(function () {});
    }
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ":" + String(secs).padStart(2, "0");
  }

  function syncProgress() {
    var player = document.getElementById("music-native-audio");
    var fill = document.querySelector(".music-fixed-progress-fill");
    var current = document.querySelector(".music-fixed-time-current");
    var duration = document.querySelector(".music-fixed-time-duration");
    if (!player) return;

    var ratio = player.duration ? (player.currentTime / player.duration) * 100 : 0;
    if (fill) fill.style.width = ratio + "%";
    if (current) current.textContent = formatTime(player.currentTime);
    if (duration) duration.textContent = formatTime(player.duration);
  }

  function seekByClientX(clientX) {
    var player = document.getElementById("music-native-audio");
    var seek = document.querySelector(".music-fixed-progress");
    if (!player || !seek || !player.duration) return;

    var rect = seek.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    player.currentTime = player.duration * ratio;
    syncProgress();
  }

  function togglePlay() {
    var player = document.getElementById("music-native-audio");
    var playButton = document.querySelector(".music-fixed-play");
    if (!player) return;

    if (player.paused) {
      player.play().then(function () {
        if (playButton) playButton.textContent = "❚❚";
      }).catch(function () {});
    } else {
      player.pause();
      if (playButton) playButton.textContent = "▶";
    }
  }

  function togglePlaylistPanel() {
    var panel = document.querySelector(".music-fixed-playlist");
    var listButton = document.querySelector('[data-player-toggle="list"]');
    if (!panel) return;
    panel.hidden = !panel.hidden;
    if (listButton) {
      listButton.classList.toggle("is-active", !panel.hidden);
    }
  }

  function initFixedPlayer(tracks) {
    if (!tracks.length) return;
    destroyPlayer();
    var container = ensurePlayerContainer();
    window.__musicPageTracks = tracks.slice();
    window.__musicPageCurrentIndex = 0;

    container.innerHTML = [
      '<div class="music-fixed-shell">',
      '  <div class="music-fixed-progress" data-player-seek="true">',
      '    <div class="music-fixed-progress-fill"></div>',
      '  </div>',
      '  <div class="music-fixed-row">',
      '    <div class="music-fixed-controls">',
      '      <button class="music-fixed-icon" type="button" data-player-nav="prev">◀◀</button>',
      '      <button class="music-fixed-play" type="button" data-player-toggle="play">▶</button>',
      '      <button class="music-fixed-icon" type="button" data-player-nav="next">▶▶</button>',
      '      <button class="music-fixed-icon music-fixed-list-toggle" type="button" data-player-toggle="list">☰</button>',
      '    </div>',
      '    <div class="music-fixed-meta">',
      '      <div class="music-fixed-label">\u5e95\u90e8\u64ad\u653e\u5668</div>',
      '      <h3 class="music-fixed-title"></h3>',
      '      <p class="music-fixed-artist"></p>',
      '    </div>',
      '    <div class="music-fixed-side">',
      '      <span class="music-fixed-time-current">0:00</span>',
      '      <span class="music-fixed-time-sep">/</span>',
      '      <span class="music-fixed-time-duration">0:00</span>',
      '      <span class="music-fixed-count"></span>',
      '    </div>',
      '  </div>',
      '  <audio id="music-native-audio" class="music-fixed-audio" preload="metadata"></audio>',
      '  <div class="music-fixed-playlist" hidden>',
           tracks.map(function (track, index) {
             return [
               '<button class="music-fixed-track" type="button" data-track-index="' + index + '">',
               '  <span class="music-fixed-track-name">' + escapeHtml(track.title) + "</span>",
               '  <span class="music-fixed-track-artist">' + escapeHtml(track.artist) + "</span>",
               "</button>"
             ].join("");
           }).join(""),
      '  </div>',
      "</div>"
    ].join("");

    var audio = container.querySelector("#music-native-audio");
    var isSeeking = false;

    audio.addEventListener("timeupdate", syncProgress);
    audio.addEventListener("loadedmetadata", syncProgress);
    audio.addEventListener("pause", function () {
      var playButton = document.querySelector(".music-fixed-play");
      if (playButton) playButton.textContent = "▶";
    });
    audio.addEventListener("play", function () {
      var playButton = document.querySelector(".music-fixed-play");
      if (playButton) playButton.textContent = "❚❚";
    });
    audio.addEventListener("ended", function () {
      var nextIndex = (window.__musicPageCurrentIndex + 1) % window.__musicPageTracks.length;
      updateNativePlayer(nextIndex, true);
    });

    container.addEventListener("click", function (event) {
      var button = event.target.closest("[data-player-nav]");
      if (button) {
        var total = window.__musicPageTracks.length;
        var current = window.__musicPageCurrentIndex;
        var nextIndex = button.getAttribute("data-player-nav") === "prev"
          ? (current - 1 + total) % total
          : (current + 1) % total;
        updateNativePlayer(nextIndex, true);
        return;
      }

      var toggle = event.target.closest("[data-player-toggle]");
      if (toggle) {
        var mode = toggle.getAttribute("data-player-toggle");
        if (mode === "play") togglePlay();
        if (mode === "list") togglePlaylistPanel();
        return;
      }

      var seek = event.target.closest("[data-player-seek]");
      if (seek && audio.duration) {
        seekByClientX(event.clientX);
      }
    });

    container.addEventListener("mousedown", function (event) {
      var seek = event.target.closest("[data-player-seek]");
      if (!seek || !audio.duration) return;
      isSeeking = true;
      seekByClientX(event.clientX);
      event.preventDefault();
    });

    window.addEventListener("mousemove", function (event) {
      if (!isSeeking) return;
      seekByClientX(event.clientX);
    });

    window.addEventListener("mouseup", function () {
      isSeeking = false;
    });

    updateNativePlayer(0, false);
    syncProgress();
  }

  function bindPlayActions(root) {
    if (root.dataset.musicBound === "true") return;

    root.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-track-index]");
      if (!trigger || !(window.__musicPageTracks && window.__musicPageTracks.length)) return;

      var index = Number(trigger.getAttribute("data-track-index"));
      if (!Number.isFinite(index)) return;
      updateNativePlayer(index, true);
    });

    root.dataset.musicBound = "true";
  }

  function renderLanding(root, dailyTracks) {
    var daily = dailyTracks[0];
    var app = document.createElement("div");
    app.className = "music-home";
    app.innerHTML = [
      '<section class="music-home-hero">',
      '  <p class="music-home-eyebrow">Music Home</p>',
      '  <h1 class="music-home-title">\u5148\u9009\u62e9\u8981\u8fdb\u7684\u677f\u5757\uff0c\u518d\u8fdb\u53bb\u770b\u6b4c\u3002</h1>',
      '  <p class="music-home-subtitle">\u97f3\u4e50\u9996\u9875\u5148\u53ea\u663e\u793a 3 \u4e2a\u5927\u677f\u5757\uff1a\u97f3\u4e50\u5206\u4eab\u3001\u6392\u884c\u699c\u3001\u6b4c\u5355\u3002\u70b9\u8fdb\u53bb\u624d\u770b\u8be6\u7ec6\u5185\u5bb9\uff0c\u5e95\u90e8\u64ad\u653e\u5668\u4f1a\u9ed8\u8ba4\u8f7d\u5165\u6bcf\u65e5\u63a8\u8350\u3002</p>',
      "</section>",
      daily ? [
        '<section class="music-daily-card">',
        '  <div class="music-daily-copy">',
        '    <p class="music-daily-eyebrow">\u6bcf\u65e5\u63a8\u8350</p>',
        '    <h2 class="music-daily-title">' + escapeHtml(daily.title) + "</h2>",
        '    <p class="music-daily-artist">' + escapeHtml(daily.artist) + "</p>",
        '    <p class="music-daily-desc">' + escapeHtml(daily.desc || I18N.emptyDesc) + "</p>",
        '    <div class="music-daily-actions">',
        '      <button class="music-cta" type="button" data-track-index="0">' + I18N.play + "</button>",
        '      <a class="music-cta music-cta-secondary" href="/music/share/">\u53bb\u97f3\u4e50\u5206\u4eab</a>',
        "    </div>",
        "  </div>",
        '  <div class="music-daily-cover">' + createCoverMarkup(daily) + "</div>",
        "</section>"
      ].join("") : "",
      '<section class="music-home-grid">',
      '  <a class="music-entry music-entry-main" href="/music/share/">',
      '    <span class="music-entry-tag">Main Board</span>',
      '    <h2 class="music-entry-title">\u97f3\u4e50\u5206\u4eab</h2>',
      '    <p class="music-entry-desc">\u4e3b\u677f\u5757\uff0c\u70b9\u8fdb\u53bb\u770b\u63a8\u8350\u6b4c\u66f2\u548c\u4e3b\u64ad\u653e\u754c\u9762\u3002</p>',
      '    <span class="music-entry-action">' + I18N.openSection + "</span>",
      "  </a>",
      '  <a class="music-entry" href="/music/rank/">',
      '    <span class="music-entry-tag">Ranking</span>',
      '    <h2 class="music-entry-title">\u6392\u884c\u699c</h2>',
      '    <p class="music-entry-desc">\u67e5\u770b\u8fd1\u671f\u6700\u5e38\u5faa\u73af\u7684\u6b4c\uff0c\u6309\u699c\u5355\u98ce\u683c\u5c55\u793a\u3002</p>',
      '    <span class="music-entry-action">' + I18N.openSection + "</span>",
      "  </a>",
      '  <a class="music-entry" href="/music/playlist/">',
      '    <span class="music-entry-tag">Playlist</span>',
      '    <h2 class="music-entry-title">\u6b4c\u5355</h2>',
      '    <p class="music-entry-desc">\u6309\u901a\u52e4\u3001\u591c\u95f4\u3001\u5b66\u4e60\u7b49\u4e3b\u9898\u6574\u7406\u66f2\u76ee\u3002</p>',
      '    <span class="music-entry-action">' + I18N.openSection + "</span>",
      "  </a>",
      "</section>"
    ].join("");

    root.parentNode.insertBefore(app, root);
    root.setAttribute("aria-hidden", "true");
  }

  function renderSectionNav() {
    return [
      '<nav class="music-subnav">',
      '  <a href="/music/">\u97f3\u4e50\u9996\u9875</a>',
      '  <a href="/music/share/">\u97f3\u4e50\u5206\u4eab</a>',
      '  <a href="/music/rank/">\u6392\u884c\u699c</a>',
      '  <a href="/music/playlist/">\u6b4c\u5355</a>',
      "</nav>"
    ].join("");
  }

  function renderSharePage(root, tracks, repo, branch) {
    var featured = tracks[0];
    var app = document.createElement("div");
    app.className = "music-detail music-detail-share";
    app.innerHTML = [
      renderSectionNav(),
      '<section class="music-share-shell">',
      '  <div class="music-share-main">',
      '    <div class="music-share-stage">',
      '      <div class="music-share-cover">' + createCoverMarkup(featured) + "</div>",
      '      <div class="music-share-copy">',
      '        <p class="music-share-eyebrow">Share Main</p>',
      '        <h1 class="music-share-title">' + escapeHtml(featured.title) + "</h1>",
      '        <p class="music-share-artist">' + escapeHtml(featured.artist) + "</p>",
      '        <p class="music-share-desc">' + escapeHtml(featured.desc || I18N.emptyDesc) + "</p>",
      '        <div class="music-share-actions">',
      '          <button class="music-cta" type="button" data-track-index="0">' + I18N.play + "</button>",
      '          <button class="music-cta music-cta-secondary" type="button" data-track-index="0">' + I18N.playAll + "</button>",
      "        </div>",
      "      </div>",
      "    </div>",
      '    <div class="music-share-list">',
             tracks.map(function (track, index) {
               return [
                 '<article class="music-share-row">',
                 '  <div class="music-share-row-index">' + String(index + 1).padStart(2, "0") + "</div>",
                 '  <div class="music-share-row-cover">' + createCoverMarkup(track) + "</div>",
                 '  <div class="music-share-row-main">',
                 '    <h3>' + escapeHtml(track.title) + "</h3>",
                 '    <p>' + escapeHtml(track.artist) + "</p>",
                 "  </div>",
                 '  <button class="music-share-row-action" type="button" data-track-index="' + index + '">' + I18N.play + "</button>",
                 "</article>"
               ].join("");
             }).join(""),
      "    </div>",
      "  </div>",
      '  <aside class="music-share-side">',
      '    <div class="music-side-card">',
      '      <p class="music-side-eyebrow">\u8d44\u6e90\u4f9d\u8d56</p>',
      '      <h2 class="music-side-title">\u97f3\u4e50\u5206\u4eab</h2>',
      '      <p class="music-side-desc">\u8fd9\u4e2a\u677f\u5757\u662f\u97f3\u4e50\u4e13\u533a\u7684\u4e3b\u9875\uff0c\u98ce\u683c\u504f\u300c\u6b63\u5728\u64ad\u653e\u300d\u89c6\u56fe\u3002</p>',
      '      <div class="music-side-meta"><span>' + I18N.repoLabel + '</span><strong>' + escapeHtml(repo) + "</strong></div>",
      '      <div class="music-side-meta"><span>' + I18N.cdnLabel + '</span><strong>main / jsDelivr</strong></div>',
      '      <div class="music-side-meta"><span>\u66f2\u76ee</span><strong>' + tracks.length + I18N.songsSuffix + "</strong></div>",
      '      <a class="music-side-link" href="https://cdn.jsdelivr.net/gh/' + escapeHtml(repo) + "@" + escapeHtml(branch) + '/" target="_blank" rel="noopener">jsDelivr</a>',
      "    </div>",
      "  </aside>",
      "</section>"
    ].join("");

    root.parentNode.insertBefore(app, root);
    root.setAttribute("aria-hidden", "true");
  }

  function renderRankPage(root, tracks) {
    var app = document.createElement("div");
    app.className = "music-detail";
    app.innerHTML = [
      renderSectionNav(),
      '<section class="music-panel">',
      '  <p class="music-panel-eyebrow">Ranking</p>',
      '  <h1 class="music-panel-title">\u6392\u884c\u699c</h1>',
      '  <p class="music-panel-desc">\u8fd9\u4e00\u9875\u53ea\u5c55\u793a\u699c\u5355\uff0c\u5e95\u90e8\u64ad\u653e\u5668\u4f1a\u9ed8\u8ba4\u52a0\u8f7d\u672c\u9875\u5168\u90e8\u6b4c\u66f2\u3002</p>',
      '  <div class="music-rank-list">',
             tracks.map(function (track, index) {
               return [
                 '<article class="music-rank-card">',
                 '  <div class="music-rank-no">' + escapeHtml(track.rank || String(index + 1)) + "</div>",
                 '  <div class="music-rank-thumb">' + createCoverMarkup(track) + "</div>",
                 '  <div class="music-rank-copy">',
                 '    <h3>' + escapeHtml(track.title) + "</h3>",
                 '    <p class="music-rank-artist">' + escapeHtml(track.artist) + "</p>",
                 '    <p class="music-rank-desc">' + escapeHtml(track.desc || I18N.emptyDesc) + "</p>",
                 "  </div>",
                 '  <button class="music-rank-action" type="button" data-track-index="' + index + '">' + I18N.play + "</button>",
                 "</article>"
               ].join("");
             }).join(""),
      "  </div>",
      "</section>"
    ].join("");

    root.parentNode.insertBefore(app, root);
    root.setAttribute("aria-hidden", "true");
  }

  function renderPlaylistPage(root, tracks) {
    var groups = tracks.reduce(function (result, track, index) {
      var key = track.playlist || I18N.unnamedPlaylist;
      if (!result[key]) result[key] = { items: [], startIndex: index };
      result[key].items.push(track);
      return result;
    }, {});

    var app = document.createElement("div");
    app.className = "music-detail";
    app.innerHTML = [
      renderSectionNav(),
      '<section class="music-panel">',
      '  <p class="music-panel-eyebrow">Playlist</p>',
      '  <h1 class="music-panel-title">\u6b4c\u5355</h1>',
      '  <p class="music-panel-desc">\u540c\u540d\u6b4c\u5355\u4f1a\u81ea\u52a8\u5f52\u7c7b\u6210\u4e00\u4e2a\u6b4c\u5355\u5361\u7247\u3002</p>',
      '  <div class="music-playlist-grid">',
             Object.keys(groups).map(function (name) {
               var group = groups[name];
               return [
                 '<article class="music-playlist-card">',
                 '  <div class="music-playlist-head">',
                 '    <div>',
                 '      <p class="music-playlist-eyebrow">Playlist</p>',
                 '      <h3 class="music-playlist-title">' + escapeHtml(name) + "</h3>",
                 "    </div>",
                 '    <button class="music-playlist-action" type="button" data-track-index="' + group.startIndex + '">' + I18N.play + "</button>",
                 "  </div>",
                 '  <ul class="music-playlist-list">',
                       group.items.map(function (item) {
                         return [
                           "<li>",
                           '  <span class="music-playlist-track">' + escapeHtml(item.title) + "</span>",
                           '  <span class="music-playlist-artist">' + escapeHtml(item.artist) + "</span>",
                           "</li>"
                         ].join("");
                       }).join(""),
                 "  </ul>",
                 "</article>"
               ].join("");
             }).join(""),
      "  </div>",
      "</section>"
    ].join("");

    root.parentNode.insertBefore(app, root);
    root.setAttribute("aria-hidden", "true");
  }

  function renderPage(root) {
    var view = root.dataset.musicView || "landing";
    var repo = root.dataset.musicRepo || DEFAULT_REPO;
    var branch = root.dataset.musicBranch || DEFAULT_BRANCH;
    var tables = parseTables(root);

    if (view === "landing") {
      var dailyTracks = (tables[0] || []).map(function (item, index) {
        return buildTrack(item, repo, branch, "daily", "daily", index + 1);
      }).filter(function (track) {
        return track.audio;
      });

      renderLanding(root, dailyTracks);
      if (dailyTracks.length) {
        initFixedPlayer(dailyTracks);
        bindPlayActions(root.parentNode);
      } else {
        destroyPlayer();
      }
      return;
    }

    var tracks = (tables[0] || []).map(function (item, index) {
      return buildTrack(item, repo, branch, view, view, index + 1);
    }).filter(function (track) {
      return track.audio;
    });

    if (!tracks.length) return;

    if (view === "share") {
      renderSharePage(root, tracks, repo, branch);
    } else if (view === "rank") {
      renderRankPage(root, tracks);
    } else if (view === "playlist") {
      renderPlaylistPage(root, tracks);
    }

    initFixedPlayer(tracks);
    bindPlayActions(root.parentNode);
  }

  function buildPage() {
    var root = document.querySelector(PAGE_SELECTOR);
    if (!root) {
      document.body.classList.remove("music-page-active");
      destroyPlayer();
      return;
    }

    if (root.dataset.musicEnhanced === "true") return;

    document.body.classList.add("music-page-active");
    renderPage(root);
    root.dataset.musicEnhanced = "true";
  }

  buildPage();
  document.addEventListener("DOMContentLoaded", buildPage);
  window.addEventListener("load", buildPage);
  document.addEventListener("pjax:complete", buildPage);
})();
