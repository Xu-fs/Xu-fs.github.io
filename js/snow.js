(function () {
  if (/^\/x-?garge\/?/.test(window.location.pathname)) return;
  if (/phone|pad|pod|iphone|ipod|ios|ipad|android|mobile|blackberry|iemobile|mqqbrowser|juc|fennec|wosbrowser|browserng|webos|symbian|windows phone/i.test(navigator.userAgent)) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.createElement("canvas");
  canvas.id = "snow";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  var ctx = canvas.getContext("2d");
  var flakes = [];
  var config = {
    flakeCount: 70,
    minRadius: 1.2,
    maxRadius: 3.8,
    minSpeed: 0.35,
    maxSpeed: 1.15,
    wind: 0.35
  };

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createFlake(initial) {
    return {
      x: random(0, canvas.width),
      y: initial ? random(0, canvas.height) : random(-canvas.height * 0.2, 0),
      radius: random(config.minRadius, config.maxRadius),
      speed: random(config.minSpeed, config.maxSpeed),
      drift: random(-config.wind, config.wind),
      phase: random(0, Math.PI * 2),
      opacity: random(0.35, 0.88)
    };
  }

  function resetFlakes() {
    flakes = [];
    for (var i = 0; i < config.flakeCount; i += 1) {
      flakes.push(createFlake(true));
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

    flakes.forEach(function (flake, index) {
      flake.phase += 0.01;
      flake.x += flake.drift + Math.sin(flake.phase) * 0.25;
      flake.y += flake.speed;

      if (flake.y > canvas.height + flake.radius) {
        flakes[index] = createFlake(false);
        return;
      }

      if (flake.x < -flake.radius) flake.x = canvas.width + flake.radius;
      if (flake.x > canvas.width + flake.radius) flake.x = -flake.radius;

      ctx.globalAlpha = flake.opacity;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    window.requestAnimationFrame(draw);
  }

  resize();
  resetFlakes();
  draw();
  window.addEventListener("resize", function () {
    resize();
    resetFlakes();
  }, { passive: true });
})();
