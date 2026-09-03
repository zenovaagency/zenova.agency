/** Fullscreen triangle. No geometry, no matrices. */
export const VERT = /* glsl */ `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

/**
 * Domain-warped fBm gradient.
 *
 * Two things here are deliberate and worth not "simplifying" later:
 *
 * 1. The base ramp is entirely blue (paper -> sky-soft -> sky -> brand).
 *    Blush is applied afterwards as a separate lobe, admitted only where
 *    the base is still pale. Interpolating saturated blue straight into
 *    pink is what produces the lavender cast that every generated
 *    gradient has, so the two never mix at full strength.
 *
 * 2. The text safe zone restricts the palette to PAPER..SKY_SOFT, whose
 *    luminances are 0.946 and 0.789. Against ink #0B3558 (L 0.033) that
 *    is 12.0:1 and 10.1:1, so the headline cannot lose contrast wherever
 *    the pointer pushes the field. A hard luminance floor backs it up.
 */
export const FRAG = /* glsl */ `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_pointer;  // 0..1, y up
uniform vec4  u_safe;     // cx, cy, rx, ry — text safe-zone ellipse

const vec3 PAPER    = vec3(0.965, 0.976, 1.000); // #F6F9FF
const vec3 SKY_SOFT = vec3(0.749, 0.878, 1.000); // #BFE0FF
const vec3 SKY      = vec3(0.435, 0.714, 1.000); // #6FB6FF
const vec3 BRAND    = vec3(0.000, 0.420, 1.000); // #006BFF
const vec3 BLUSH    = vec3(1.000, 0.682, 0.796); // #FFAECB

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),                hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

// Real sRGB -> linear, so the luminance floor below is an actual WCAG
// relative luminance and not an eyeballed approximation.
vec3 toLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}

float relLum(vec3 c) {
  return dot(toLinear(c), vec3(0.2126, 0.7152, 0.0722));
}

void main() {
  vec2  uv     = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2  p      = vec2(uv.x * aspect, uv.y);
  float t      = u_time * 0.05;

  // Pointer displacement — the field bends toward the cursor and settles
  // when it stops. This is the whole "interactive" of the hero.
  // Displace along d itself rather than its normalised direction. normalize()
  // is discontinuous at d = 0, which printed a hard starburst exactly where
  // the pointer sits; scaling by d keeps the field smooth through the centre.
  vec2 d = (uv - u_pointer) * vec2(aspect, 1.0);
  p += d * exp(-dot(d, d) * 2.6) * 0.72;

  // Domain warp: fbm of fbm of fbm. Organic flow, not concentric blobs.
  vec2 q = vec2(fbm(p * 1.6 + vec2(0.0, t)),
                fbm(p * 1.6 + vec2(5.2, 1.3 - t)));
  vec2 r = vec2(fbm(p * 1.6 + 3.4 * q + vec2(1.7, 9.2)),
                fbm(p * 1.6 + 3.4 * q + vec2(8.3, 2.8)));
  float f = fbm(p * 1.6 + 3.6 * r);

  // Bias the saturated end of the ramp to the right and low - away from the
  // headline. The safe zone then has far less to flatten, so the right half
  // of the hero keeps its colour.
  f = clamp(f * 1.25 - 0.24 + (1.0 - uv.y) * 0.18
            + smoothstep(0.30, 1.0, uv.x) * 0.34, 0.0, 1.0);

  vec3 col = mix(PAPER, SKY_SOFT, smoothstep(0.00, 0.42, f));
  col      = mix(col,   SKY,      smoothstep(0.40, 0.70, f));
  col      = mix(col,   BRAND,    smoothstep(0.68, 0.95, f));

  // Blush: a single soft lobe in the upper right, gated to mid and low values
  // of the field so it never lands on saturated blue. Blue mixed into pink at
  // full strength is what turns a gradient lavender, which is the one colour
  // this palette must not produce.
  float lobe = exp(-pow(distance(uv * vec2(aspect, 1.0),
                                 vec2(aspect * 0.90, 0.74)), 2.0) * 2.6);
  lobe *= smoothstep(0.80, 0.24, f) * (0.62 + 0.38 * sin(u_time * 0.18));
  col = mix(col, BLUSH, clamp(lobe, 0.0, 1.0) * 0.5);

  // Text safe zone — a soft-edged rectangle, not an ellipse.
  // An ellipse inscribed around the text block leaves its four corners
  // outside the mask, and measurement showed that is exactly where the
  // darkest pixels land. A Chebyshev distance covers the block fully.
  vec2  sq   = abs(uv - u_safe.xy) / max(u_safe.zw, vec2(1e-4));
  float safe = 1.0 - smoothstep(1.00, 1.70, max(sq.x, sq.y));
  col = mix(col, mix(PAPER, SKY_SOFT, f * 0.85), safe);

  // Hard luminance floor inside the safe zone. 0.62 linear gives >= 8:1
  // against #0B3558 and >= 4.7:1 against the softer sub-copy colour, so
  // both clear AA wherever the pointer pushes the field.
  float floorL = 0.62 * safe;
  for (int i = 0; i < 3; i++) {
    float L = relLum(col);
    col = mix(col, vec3(1.0), clamp((floorL - L) / max(1.0 - L, 0.001), 0.0, 1.0));
  }

  // Dissolve into the page.
  col = mix(col, PAPER, 1.0 - smoothstep(0.0, 0.26, uv.y));

  // Grain, computed here rather than fetched as a texture.
  col += (hash(gl_FragCoord.xy + fract(u_time) * 100.0) - 0.5) * 0.028;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
