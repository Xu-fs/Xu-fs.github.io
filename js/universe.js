(function () {
  if (/^\/x-?garge\/?/.test(window.location.pathname)) return;
  if (/phone|pad|pod|iphone|ipod|ios|ipad|android|mobile|blackberry|iemobile|mqqbrowser|juc|fennec|wosbrowser|browserng|webos|symbian|windows phone/i.test(navigator.userAgent)) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.getElementById("universe");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var stars = [];
  var meteors = [];
  var starCount = 170;
  var maxMeteors = 9;
  var meteorChance = 0.055;

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    for (var i = 0; i < starCount; i += 1) {
      stars.push({
        x: random(0, canvas.width),
        y: random(0, canvas.height),
        radius: random(0.45, 1.8),
        alpha: random(0.25, 0.95),
        speed: random(0.004, 0.014),
        phase: random(0, Math.PI * 2)
      });
    }
  }

  function createMeteor() {
    meteors.push({
      x: random(canvas.width * 0.25, canvas.width * 1.05),
      y: random(-60, canvas.height * 0.28),
      length: random(110, 210),
      speed: random(8, 14),
      alpha: random(0.55, 0.95)
    });
  }

  function drawBackground() {
    var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#071426");
    gradient.addColorStop(0.5, "#0b1d35");
    gradient.addColorStop(1, "#10233c");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawStars() {
    stars.forEach(function (star) {
      star.phase += star.speed;
      var opacity = star.alpha * (0.65 + Math.sin(star.phase) * 0.35);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawMeteors() {
    if (Math.random() < meteorChance && meteors.length < maxMeteors) createMeteor();

    meteors = meteors.filter(function (meteor) {
      meteor.x -= meteor.speed;
      meteor.y += meteor.speed * 0.42;

      var tailX = meteor.x + meteor.length;
      var tailY = meteor.y - meteor.length * 0.42;
      var gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
      gradient.addColorStop(0, "rgba(255,255,255," + meteor.alpha + ")");
      gradient.addColorStop(0.28, "rgba(125,211,252," + meteor.alpha * 0.6 + ")");
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      return meteor.x > -meteor.length && meteor.y < canvas.height + meteor.length;
    });
  }

  function draw() {
    drawBackground();
    drawStars();
    drawMeteors();
    window.requestAnimationFrame(draw);
  }

  resize();
  createStars();
  draw();
  window.addEventListener("resize", function () {
    resize();
    createStars();
  }, { passive: true });
})();
