/**
 * Liquid glass — the hero background.
 *
 * One fragment shader on a full-bleed quad, no library. A domain-warped fbm
 * field in the site's light ramp (paper → sky-soft → sky → brand) slowly
 * flows; thin caustic ridges catch the light; and the cursor acts as a lens
 * that bends the field toward itself and sends a soft ripple out from it.
 *
 * CONTRAST. The headline sits in the middle of this, in ink. Saturated sky
 * and brand are only allowed toward the edges (`edge`), and a "calm zone"
 * pulls the centre back to near-paper, so the darkest pixel behind the type
 * stays light enough for ink to clear 7:1. The verification pass samples the
 * canvas under the headline to check that.
 *
 * COST. Rendered at ~60% of CSS pixels (DPR capped at 1.5) — the field is
 * soft by nature, so upscaling is invisible. Paused offscreen, in hidden tabs,
 * and entirely static under reduced motion (one frame, then stop). Without
 * WebGL nothing happens and the static CSS gradient behind the canvas stays.
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_lens;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse * u_res - 0.5 * u_res) / u_res.y;

  // The lens: pull the field toward the cursor and ripple outward from it.
  vec2 d = p - m;
  float r = length(d);
  float lens = exp(-r * r * 9.0) * u_lens;
  p -= d * lens * 0.42;
  p += 0.018 * sin(r * 30.0 - u_time * 2.6) * (d / (r + 1e-4)) * lens;

  float t = u_time * 0.045;
  vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t)), fbm(p * 1.3 + vec2(5.2, 1.3) - t));
  vec2 w = vec2(fbm(p * 1.5 + 3.2 * q + vec2(1.7, 9.2) + t * 1.4),
                fbm(p * 1.5 + 3.2 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.1 + 2.4 * w);

  vec3 paper = vec3(0.965, 0.976, 1.0);
  vec3 skySoft = vec3(0.749, 0.878, 1.0);
  vec3 sky = vec3(0.435, 0.714, 1.0);
  vec3 brand = vec3(0.0, 0.42, 1.0);
  vec3 blush = vec3(1.0, 0.682, 0.796);

  // Saturation is only allowed away from the centre, where the type is.
  float edge = smoothstep(0.28, 0.95, length((uv - vec2(0.5, 0.5)) * vec2(1.0, 1.35)));

  vec3 col = mix(paper, skySoft, smoothstep(0.25, 0.7, f));
  col = mix(col, sky, smoothstep(0.5, 0.85, f) * (0.25 + 0.75 * edge));
  col = mix(col, brand, smoothstep(0.62, 0.95, f + length(w) * 0.18) * 0.6 * edge);

  // Caustics: thin bright ridges where the warped field folds.
  float ridge = 1.0 - abs(sin(f * 11.0 + length(q) * 4.0 + u_time * 0.12));
  col += pow(ridge, 10.0) * 0.14;

  // A warm bloom in one corner, as the static gradient has.
  col = mix(col, blush, smoothstep(0.75, 0.0, length(uv - vec2(1.0, 0.0))) * 0.16);

  // Calm zone behind the headline.
  float calm = smoothstep(0.62, 0.0, length((uv - vec2(0.5, 0.54)) * vec2(1.05, 1.7)));
  col = mix(col, paper, calm * 0.62);

  // Glass glint at the lens, and a fade into the page at the bottom edge.
  col += lens * 0.05;
  col = mix(col, paper, smoothstep(0.22, 0.0, uv.y));

  gl_FragColor = vec4(col, 1.0);
}
`;

export function mountLiquid(canvas: HTMLCanvasElement, area: HTMLElement) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');
  const uLens = gl.getUniformLocation(prog, 'u_lens');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Render resolution: soft field, so ~60% of CSS pixels is plenty.
  const resize = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
    const w = Math.max(1, Math.round(canvas.clientWidth * scale));
    const h = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  // Spring-smoothed pointer. Target is in 0..1 canvas space, y up.
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, lens: 0, tlens: 0 };
  if (finePointer && !reduced) {
    area.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
      mouse.tlens = 1;
    });
    area.addEventListener('pointerleave', () => {
      mouse.tlens = 0;
    });
  }

  let raf = 0;
  let visible = true;
  let last = performance.now();
  let time = 6; // start mid-flow, not at the noise origin
  let frames = 0;

  const draw = () => {
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, time);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uLens, mouse.lens);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frames++;
    if (frames === 1) canvas.dataset.ready = '';
  };

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    mouse.x += (mouse.tx - mouse.x) * 0.07;
    mouse.y += (mouse.ty - mouse.y) * 0.07;
    mouse.lens += (mouse.tlens - mouse.lens) * 0.05;
    draw();
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (raf || reduced || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  // Exposed for verification: how many frames have been drawn.
  (canvas as HTMLCanvasElement & { __frames?: () => number }).__frames = () => frames;

  if (reduced) {
    draw();
    addEventListener('resize', draw);
    return;
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  draw();
  start();
}
