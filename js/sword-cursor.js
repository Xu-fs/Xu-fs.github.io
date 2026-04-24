(function () {
  if (/phone|pad|pod|iphone|ipod|ios|ipad|android|mobile|blackberry|iemobile|mqqbrowser|juc|fennec|wosbrowser|browserng|webos|symbian|windows phone/i.test(navigator.userAgent)) return;
  if (window.matchMedia && (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;

  var canvas = document.getElementById("sword-cursor-effects");
  if (!canvas) return;

  document.documentElement.classList.add("cursor-sword-enabled");

  var ctx = canvas.getContext("2d");
  var pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var particles = [];
  var slashes = [];
  var sparks = [];
  var rafId = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function addTrail(x, y, burst) {
    var count = burst ? 12 : 5;
    for (var i = 0; i < count; i += 1) {
      particles.push({
        x: x + random(-3, 3),
        y: y + random(-3, 3),
        vx: random(-0.95, 0.95),
        vy: random(-1.45, 0.6),
        size: burst ? random(2.3, 5.4) : random(1.4, 3.1),
        life: burst ? random(42, 68) : random(30, 48),
        maxLife: burst ? 68 : 48,
        hue: burst ? random(190, 225) : random(200, 235)
      });
    }
  }

  function addSlash(x, y) {
    slashes.push({
      x: x,
      y: y,
      length: random(72, 118),
      angle: random(-1.05, -0.35),
      width: random(10, 16),
      alpha: 1,
      life: 15,
      maxLife: 15
    });

    for (var i = 0; i < 18; i += 1) {
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(random(-1.1, 0.45)) * random(1.4, 6.4),
        vy: Math.sin(random(-1.1, 0.45)) * random(1.4, 6.4),
        size: random(1.5, 3.8),
        life: random(16, 28),
        maxLife: 28
      });
    }
  }

  function drawParticle(particle) {
    var alpha = particle.life / particle.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "hsla(" + particle.hue + ", 100%, 72%, 1)";
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawSlash(slash) {
    var progress = 1 - slash.life / slash.maxLife;
    var dx = Math.cos(slash.angle) * slash.length;
    var dy = Math.sin(slash.angle) * slash.length;
    var grad = ctx.createLinearGradient(slash.x, slash.y, slash.x + dx, slash.y + dy);
    grad.addColorStop(0, "rgba(255,255,255," + slash.alpha + ")");
    grad.addColorStop(0.3, "rgba(125,211,252," + slash.alpha + ")");
    grad.addColorStop(0.72, "rgba(196,181,253," + slash.alpha * 0.9 + ")");
    grad.addColorStop(1, "rgba(255,255,255,0)");

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = grad;
    ctx.lineWidth = slash.width * (1 - progress * 0.35);
    ctx.lineCap = "round";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(147, 197, 253, 0.9)";
    ctx.beginPath();
    ctx.moveTo(slash.x - dx * 0.16, slash.y - dy * 0.16);
    ctx.lineTo(slash.x + dx, slash.y + dy);
    ctx.stroke();
    ctx.restore();
  }

  function drawSpark(spark) {
    var alpha = spark.life / spark.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(function (particle) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.98;
      particle.vy += 0.03;
      particle.life -= 1;
      if (particle.life <= 0) return false;
      drawParticle(particle);
      return true;
    });

    sparks = sparks.filter(function (spark) {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vx *= 0.97;
      spark.vy *= 0.97;
      spark.vy += 0.04;
      spark.life -= 1;
      if (spark.life <= 0) return false;
      drawSpark(spark);
      return true;
    });

    slashes = slashes.filter(function (slash) {
      slash.life -= 1;
      slash.alpha = slash.life / slash.maxLife;
      if (slash.life <= 0) return false;
      drawSlash(slash);
      return true;
    });

    rafId = window.requestAnimationFrame(update);
  }

  window.addEventListener("mousemove", function (event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    addTrail(pointer.x, pointer.y, false);
  }, { passive: true });

  window.addEventListener("mousedown", function (event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    addTrail(pointer.x, pointer.y, true);
    addSlash(pointer.x, pointer.y);
  }, { passive: true });

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pagehide", function () {
    if (rafId) window.cancelAnimationFrame(rafId);
  }, { passive: true });

  resize();
  update();
})();
