import { FRAG, VERT } from './gradient.frag';

/** Retina is wasted on a soft gradient; 1.5x is the point of diminishing return. */
const DPR_CAP = 1.5;
/** Pointer easing per frame. Low enough that the field drifts rather than snaps. */
const POINTER_LERP = 0.06;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[hero-canvas]', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * The interactive hero gradient.
 *
 * Plain TS rather than a framework island on purpose. The work here is
 * imperative WebGL that never re-renders from state, so a virtual DOM buys
 * nothing — and mounting React just to host it would have cost about 60 KB
 * gzip on the busiest page of the site.
 *
 * Draws over a static CSS gradient that is already in the served HTML, and
 * only reveals itself once the first frame is up. If WebGL is missing or the
 * reader asked for reduced motion, the static version simply stays.
 *
 * Returns a teardown function.
 */
export function initHeroCanvas(canvas: HTMLCanvasElement, safeSelector: string) {
  const noop = () => {};

  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  });
  if (!gl) return noop;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return noop;

  const program = gl.createProgram();
  if (!program) return noop;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[hero-canvas]', gl.getProgramInfoLog(program));
    return noop;
  }
  gl.useProgram(program);

  // One triangle big enough to cover the clip volume — cheaper than a quad,
  // and no diagonal seam.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, 'u_res');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uPointer = gl.getUniformLocation(program, 'u_pointer');
  const uSafe = gl.getUniformLocation(program, 'u_safe');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target = { x: 0.5, y: 0.58 };
  const smooth = { x: 0.5, y: 0.58 };
  const start = performance.now();

  // Cached: measuring the text block every frame would thrash layout.
  let safe: [number, number, number, number] = [0.34, 0.52, 0.42, 0.3];

  function measureSafe() {
    const host = canvas.getBoundingClientRect();
    const el = document.querySelector(safeSelector);
    if (!el || host.width === 0 || host.height === 0) return;
    const r = el.getBoundingClientRect();
    safe = [
      (r.left + r.width / 2 - host.left) / host.width,
      // uv.y points up; DOM y points down.
      1 - (r.top + r.height / 2 - host.top) / host.height,
      Math.max((r.width / 2 / host.width) * 1.05, 0.16),
      Math.max((r.height / 2 / host.height) * 1.1, 0.14),
    ];
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (w === 0 || h === 0) return;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl!.viewport(0, 0, w, h);
    }
    measureSafe();
  }

  function draw(now: number) {
    smooth.x += (target.x - smooth.x) * POINTER_LERP;
    smooth.y += (target.y - smooth.y) * POINTER_LERP;
    gl!.uniform2f(uRes, canvas.width, canvas.height);
    // Reduced motion freezes time at a composed-looking moment.
    gl!.uniform1f(uTime, reduced ? 14 : (now - start) / 1000);
    gl!.uniform2f(uPointer, smooth.x, smooth.y);
    gl!.uniform4f(uSafe, safe[0], safe[1], safe[2], safe[3]);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  let raf = 0;
  let running = false;

  function loop(now: number) {
    draw(now);
    raf = requestAnimationFrame(loop);
  }

  function play() {
    if (running || reduced) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }

  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function onPointer(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width;
    target.y = 1 - (e.clientY - r.top) / r.height;
  }

  resize();
  draw(performance.now());
  canvas.style.opacity = '1';
  canvas.dataset.gl = 'on';

  // Re-measure once the webfont settles, since the headline reflows.
  document.fonts?.ready.then(measureSafe).catch(() => {});

  if (!reduced) {
    window.addEventListener('pointermove', onPointer, { passive: true });
    play();
  }
  window.addEventListener('resize', resize);

  // Stop rendering the moment the hero leaves the viewport.
  const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause()), {
    threshold: 0,
  });
  io.observe(canvas);

  return () => {
    pause();
    io.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointer);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteBuffer(buffer);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
