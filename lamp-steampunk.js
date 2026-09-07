/* Steampunk desk lamp, procedurally built.
   Bundled with esbuild from C:/side/objects/src/createSteampunkDeskLampModel.ts
   (+ lampGeometry.ts) with `three` left external so it resolves through this
   project's importmap. The look-dev/composer/controls exports from the original
   were tree-shaken out; their dead addon imports are stripped so nothing tries to
   fetch three/examples paths this page cannot resolve. Do not hand-edit — rebuild
   from source if the lamp changes. */
// src/createSteampunkDeskLampModel.ts
import * as THREE2 from "three";

// src/lampGeometry.ts
import * as THREE from "three";
var J1 = new THREE.Vector3(0, 0.66, 0);
var J2 = new THREE.Vector3(0.7, 1.52, 0);
var J3 = new THREE.Vector3(0.09, 2.19, 0);
var HEAD_DIR = new THREE.Vector3(-0.9, -0.436, 0).normalize();
function merge(geos) {
  let total = 0;
  const parts = geos.map((g) => g.index ? g.toNonIndexed() : g);
  for (const g of parts) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3);
  const norm = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  let o = 0;
  for (const g of parts) {
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array, o * 3);
    if (g.attributes.normal) norm.set(g.attributes.normal.array, o * 3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
    o += n;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(norm, 3));
  out.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return out;
}
function placed(g, m) {
  g.applyMatrix4(m);
  return g;
}
var T = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z);
function orient(g, dir, at) {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const m = new THREE.Matrix4().compose(at, q, new THREE.Vector3(1, 1, 1));
  return placed(g, m);
}
function buildBaseIron() {
  const pts = [];
  const prof = [
    [0, 0],
    [0.5, 0],
    [0.53, 0.02],
    [0.545, 0.06],
    [0.53, 0.1],
    [0.5, 0.115],
    [0.44, 0.12],
    [0.42, 0.14],
    [0.38, 0.155],
    [0.34, 0.16],
    [0, 0.16]
  ];
  for (const [r, y] of prof) pts.push(new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 64);
  g.computeVertexNormals();
  return g;
}
function buildBrassRing() {
  const geos = [];
  const ring = new THREE.CylinderGeometry(0.345, 0.345, 0.028, 48, 1, false);
  geos.push(placed(ring, T(0, 0.172, 0)));
  for (let i = 0; i < 6; i += 1) {
    const a = i / 6 * Math.PI * 2 + 0.3;
    const s = new THREE.CylinderGeometry(0.016, 0.016, 0.014, 12);
    geos.push(placed(s, T(0.29 * Math.cos(a), 0.19, 0.29 * Math.sin(a))));
  }
  return merge(geos);
}
function buildCopperRiser() {
  const geos = [];
  geos.push(placed(new THREE.CylinderGeometry(0.21, 0.225, 0.05, 40), T(0, 0.21, 0)));
  geos.push(placed(new THREE.CylinderGeometry(0.16, 0.16, 0.16, 40), T(0, 0.31, 0)));
  geos.push(placed(new THREE.CylinderGeometry(0.19, 0.17, 0.05, 40), T(0, 0.415, 0)));
  geos.push(placed(new THREE.TorusGeometry(0.185, 0.012, 10, 40).rotateX(Math.PI / 2), T(0, 0.44, 0)));
  return merge(geos);
}
function buildBracket() {
  const geos = [];
  geos.push(placed(new THREE.CylinderGeometry(0.13, 0.15, 0.07, 32), T(0, 0.475, 0)));
  for (const zs of [-0.062, 0.062]) {
    const plate = new THREE.BoxGeometry(0.16, 0.2, 0.025, 2, 3, 1);
    geos.push(placed(plate, T(0, 0.6, zs)));
    const cap = new THREE.CylinderGeometry(0.08, 0.08, 0.025, 24).rotateX(Math.PI / 2);
    geos.push(placed(cap, T(0, 0.685, zs)));
  }
  return merge(geos);
}
function buildGear(radius, thickness, at, teeth = 32) {
  const geos = [];
  const shape = new THREE.Shape();
  const depth = radius * 0.1;
  const steps = teeth * 4;
  for (let i = 0; i <= steps; i += 1) {
    const a = i / steps * Math.PI * 2;
    const tooth = Math.sign(Math.sin(a * teeth)) * 0.5 + 0.5;
    const r = radius - depth * (1 - tooth);
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const gear = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 4 });
  gear.translate(0, 0, -thickness / 2);
  geos.push(placed(gear, T(at.x, at.y, at.z)));
  const hub = new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, thickness + 0.03, 28).rotateX(Math.PI / 2);
  geos.push(placed(hub, T(at.x, at.y, at.z)));
  const screw = new THREE.CylinderGeometry(radius * 0.34, radius * 0.34, thickness + 0.05, 24).rotateX(Math.PI / 2);
  geos.push(placed(screw, T(at.x, at.y, at.z)));
  const slot = new THREE.BoxGeometry(radius * 0.56, radius * 0.1, 0.012);
  geos.push(placed(slot, T(at.x, at.y, at.z + thickness / 2 + 0.026)));
  return merge(geos);
}
function buildArmBar(a, b, width) {
  const geos = [];
  const len = a.distanceTo(b);
  const dir = b.clone().sub(a).normalize();
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const w = width;
  const shape = new THREE.Shape();
  const hl = len / 2;
  shape.moveTo(-hl, -w / 2);
  shape.lineTo(hl, -w / 2);
  shape.absarc(hl, 0, w / 2, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(-hl, w / 2);
  shape.absarc(-hl, 0, w / 2, Math.PI / 2, 3 * Math.PI / 2, false);
  const slot = new THREE.Path();
  const sl = len * 0.28;
  const sw = w * 0.28;
  slot.moveTo(-sl, -sw / 2);
  slot.lineTo(sl, -sw / 2);
  slot.absarc(sl, 0, sw / 2, -Math.PI / 2, Math.PI / 2, false);
  slot.lineTo(-sl, sw / 2);
  slot.absarc(-sl, 0, sw / 2, Math.PI / 2, 3 * Math.PI / 2, false);
  shape.holes.push(slot);
  const bar = new THREE.ExtrudeGeometry(shape, { depth: 0.055, bevelEnabled: true, bevelThickness: 6e-3, bevelSize: 6e-3, bevelSegments: 2, curveSegments: 12 });
  bar.translate(0, 0, -0.0275);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
  geos.push(placed(bar, new THREE.Matrix4().compose(mid, q, new THREE.Vector3(1, 1, 1))));
  for (const t of [0.12, 0.88]) {
    const p = a.clone().lerp(b, t);
    const s = new THREE.CylinderGeometry(0.014, 0.014, 0.08, 12).rotateX(Math.PI / 2);
    geos.push(placed(s, T(p.x, p.y, p.z)));
  }
  return merge(geos);
}
function buildPiston(a, b) {
  const len = a.distanceTo(b);
  const dir = b.clone().sub(a).normalize();
  const geos = [];
  const bodyLen = len * 0.52;
  const body = new THREE.CylinderGeometry(0.036, 0.036, bodyLen, 20);
  body.translate(0, bodyLen / 2, 0);
  const rod = new THREE.CylinderGeometry(0.017, 0.017, len - bodyLen, 14);
  rod.translate(0, bodyLen + (len - bodyLen) / 2, 0);
  const collar = new THREE.CylinderGeometry(0.042, 0.042, 0.03, 20);
  collar.translate(0, bodyLen, 0);
  for (const g of [body, rod, collar]) geos.push(orient(g, dir, a));
  return merge(geos);
}
function buildHeadCap() {
  const geos = [];
  const axisAt = J3.clone().addScaledVector(HEAD_DIR, 0.2);
  const mk = (g, along) => geos.push(orient(g, HEAD_DIR, axisAt.clone().addScaledVector(HEAD_DIR, along)));
  const drum = new THREE.CylinderGeometry(0.185, 0.185, 0.3, 40);
  drum.translate(0, 0.15, 0);
  mk(drum, 0);
  const strap = new THREE.BoxGeometry(0.07, 0.22, 0.05, 1, 2, 1);
  geos.push(orient(strap, HEAD_DIR, J3.clone().addScaledVector(HEAD_DIR, 0.1)));
  for (const [d, r] of [[0.44, 0.2], [0.48, 0.205], [0.52, 0.21]]) {
    const ring = new THREE.CylinderGeometry(r, r, 0.035, 40);
    ring.translate(0, 0, 0);
    mk(ring, d);
  }
  const plate = new THREE.CylinderGeometry(0.12, 0.16, 0.06, 32);
  mk(plate, 0.17);
  const nipple = new THREE.CylinderGeometry(0.035, 0.045, 0.09, 16);
  mk(nipple, 0.1);
  return merge(geos);
}
function cageR(t) {
  const collar = 0.205;
  return Math.max(0.03, collar * Math.sin(Math.acos(Math.min(1, Math.max(0, (t - 0.12) / 0.88)))) * (1 - 0.08 * t));
}
function buildCage() {
  const geos = [];
  const start = J3.clone().addScaledVector(HEAD_DIR, 0.54);
  const L = 0.6;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), HEAD_DIR);
  const basis = (t, ang) => {
    const r = cageR(t);
    const local = new THREE.Vector3(r * Math.cos(ang), t * L, r * Math.sin(ang)).applyQuaternion(q);
    return start.clone().add(local);
  };
  const RIBS = 10;
  for (let i = 0; i < RIBS; i += 1) {
    const ang = i / RIBS * Math.PI * 2;
    const pts = [];
    for (let s = 0; s <= 10; s += 1) pts.push(basis(s / 10, ang));
    const curve = new THREE.CatmullRomCurve3(pts);
    geos.push(new THREE.TubeGeometry(curve, 24, 0.012, 8, false));
  }
  for (const t of [0, 0.28, 0.56, 0.8]) {
    const r = cageR(t);
    const ring = new THREE.TorusGeometry(r, t === 0 ? 0.014 : 0.011, 8, 40);
    ring.rotateX(Math.PI / 2);
    const at = start.clone().addScaledVector(HEAD_DIR, t * L);
    const m = new THREE.Matrix4().compose(at, q, new THREE.Vector3(1, 1, 1));
    geos.push(placed(ring, m));
  }
  const nose = new THREE.SphereGeometry(0.035, 12, 8);
  geos.push(placed(nose, T(...basis(1, 0).toArray())));
  return merge(geos);
}
function buildBulbOuter() {
  const g = new THREE.CapsuleGeometry(0.085, 0.26, 8, 24);
  const at = J3.clone().addScaledVector(HEAD_DIR, 0.88);
  return orient(g, HEAD_DIR, at);
}
function buildBulbInner() {
  const g = new THREE.CapsuleGeometry(0.045, 0.3, 8, 20);
  const at = J3.clone().addScaledVector(HEAD_DIR, 0.88);
  return orient(g, HEAD_DIR, at);
}
function bulbCenter() {
  return J3.clone().addScaledVector(HEAD_DIR, 0.95);
}
function buildCable() {
  const nipple = J3.clone().addScaledVector(HEAD_DIR, 0.08).add(new THREE.Vector3(0.03, 0.08, 0));
  const pts = [
    nipple,
    nipple.clone().add(new THREE.Vector3(0.16, 0.16, 0.05)),
    new THREE.Vector3(0.68, 2.5, 0.12),
    new THREE.Vector3(1, 2.05, 0.2),
    new THREE.Vector3(1.12, 1.3, 0.28),
    new THREE.Vector3(1.05, 0.5, 0.34),
    new THREE.Vector3(1.12, 0.035, 0.38),
    new THREE.Vector3(1.6, 0.03, 0.46),
    new THREE.Vector3(2.05, 0.035, 0.55)
  ];
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
  return new THREE.TubeGeometry(curve, 90, 0.014, 10, false);
}
function inPlaneNormal(a, b) {
  const d = b.clone().sub(a).normalize();
  return new THREE.Vector3(d.y, -d.x, 0);
}
function buildPistonLower() {
  const n = inPlaneNormal(J1, J2);
  const a = J1.clone().lerp(J2, 0.12).addScaledVector(n, 0.1).add(new THREE.Vector3(0, 0, 0.03));
  const b = J1.clone().lerp(J2, 0.95).addScaledVector(n, 0.045).add(new THREE.Vector3(0, 0, 0.03));
  return buildPiston(a, b);
}
function buildPistonUpper() {
  const n = inPlaneNormal(J2, J3);
  const a = J2.clone().lerp(J3, 0.1).addScaledVector(n, -0.095).add(new THREE.Vector3(0, 0, 0.03));
  const b = J2.clone().lerp(J3, 0.93).addScaledVector(n, -0.045).add(new THREE.Vector3(0, 0, 0.03));
  return buildPiston(a, b);
}

// src/createSteampunkDeskLampModel.ts
function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function readLayerNumber(value, keys, fallback) {
  if (typeof value === "number") return value;
  if (value && typeof value === "object") {
    const record = value;
    for (const key of keys) {
      if (typeof record[key] === "number") return record[key];
    }
  }
  return fallback;
}
function hexToRgb(hex) {
  const normalized = /^#[0-9a-f]{3}$/i.test(hex) ? "#" + hex.slice(1).split("").map((part) => part + part).join("") : hex;
  const value = /^#[0-9a-f]{6}$/i.test(normalized) ? Number.parseInt(normalized.slice(1), 16) : 9075295;
  return [clampAlbedoChannel(value >> 16 & 255), clampAlbedoChannel(value >> 8 & 255), clampAlbedoChannel(value & 255)];
}
function materialPalette(spec) {
  const palette = spec.colorVariation?.palette;
  if (Array.isArray(palette) && palette.length > 0) return palette.filter((value) => typeof value === "string");
  const secondary = spec.albedo?.secondary;
  const colors = [spec.baseColor ?? spec.color ?? spec.albedo?.dominant, ...Array.isArray(secondary) ? secondary : []];
  return colors.filter((value) => typeof value === "string" && value.startsWith("#"));
}
function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}
function clampAlbedoChannel(value) {
  return Math.max(30, Math.min(240, Math.round(value)));
}
function clampPbrF0(value) {
  return Math.max(0.02, Math.min(1, value));
}
function clampPbrIor(value) {
  return Math.max(1, Math.min(2.5, value));
}
function clampPbrMetalness(value) {
  return value >= 0.5 ? 1 : 0;
}
function clampedAlbedoColor(spec) {
  const source = typeof spec.baseColor === "string" ? spec.baseColor : "#8A7A5F";
  const [red, green, blue] = hexToRgb(source);
  return new THREE2.Color(red / 255, green / 255, blue / 255);
}
function smoothCurve(value) {
  return value * value * (3 - 2 * value);
}
function periodicHash(x, y, seed, periodX, periodY) {
  const wrappedX = (x % periodX + periodX) % periodX;
  const wrappedY = (y % periodY + periodY) % periodY;
  let value = Math.imul(wrappedX + seed * 17, 374761393) ^ Math.imul(wrappedY + seed * 31, 668265263);
  value = Math.imul(value ^ value >>> 13, 1274126177);
  return ((value ^ value >>> 16) >>> 0) / 4294967295;
}
function periodicValueNoise(u, v, seed, periodX, periodY) {
  const x = u * periodX;
  const y = v * periodY;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothCurve(x - x0);
  const ty = smoothCurve(y - y0);
  const a = periodicHash(x0, y0, seed, periodX, periodY);
  const b = periodicHash(x0 + 1, y0, seed, periodX, periodY);
  const c = periodicHash(x0, y0 + 1, seed, periodX, periodY);
  const d = periodicHash(x0 + 1, y0 + 1, seed, periodX, periodY);
  return THREE2.MathUtils.lerp(THREE2.MathUtils.lerp(a, b, tx), THREE2.MathUtils.lerp(c, d, tx), ty);
}
function surfaceBands(spec) {
  const source = Array.isArray(spec.surfaceFrequencyBands) ? spec.surfaceFrequencyBands : [];
  const parsed = source.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const band = item;
    const frequency = typeof band.frequency === "number" ? band.frequency : 0;
    const amplitude = typeof band.amplitude === "number" ? band.amplitude : 0;
    if (frequency <= 0 || amplitude <= 0) return [];
    const stretch = Array.isArray(band.stretch) ? band.stretch : [1, 1];
    const description = `${String(band.pattern ?? "")} ${String(band.role ?? "")}`.toLowerCase();
    return [{
      frequency,
      amplitude,
      stretchX: typeof stretch[0] === "number" ? Math.max(0.1, stretch[0]) : 1,
      stretchY: typeof stretch[1] === "number" ? Math.max(0.1, stretch[1]) : 1,
      ridge: /(ridge|groove|grain|fiber|striated|crack)/.test(description)
    }];
  });
  return parsed.length > 0 ? parsed : [
    { frequency: 2, amplitude: 0.42, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 12, amplitude: 0.22, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 56, amplitude: 0.08, stretchX: 1, stretchY: 1, ridge: false }
  ];
}
function sampleSurface(u, v, bands, seed) {
  let value = 0;
  let weight = 0;
  for (let index = 0; index < bands.length; index += 1) {
    const band = bands[index];
    const periodX = Math.max(1, Math.round(band.frequency * band.stretchX));
    const periodY = Math.max(1, Math.round(band.frequency * band.stretchY));
    let sample = periodicValueNoise(u, v, seed + index * 1013, periodX, periodY);
    if (band.ridge) sample = 1 - Math.abs(sample * 2 - 1);
    value += sample * band.amplitude;
    weight += band.amplitude;
  }
  return weight > 0 ? clamp01(value / weight) : 0.5;
}
function mixPalette(colors, value) {
  if (colors.length === 1) return colors[0];
  const scaled = clamp01(value) * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const a = colors[index];
  const b = colors[index + 1];
  return [
    Math.round(THREE2.MathUtils.lerp(a[0], b[0], mix)),
    Math.round(THREE2.MathUtils.lerp(a[1], b[1], mix)),
    Math.round(THREE2.MathUtils.lerp(a[2], b[2], mix))
  ];
}
function parseRgba(value) {
  const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(value);
  if (!match) return [138, 122, 95];
  return [clampAlbedoChannel(Number(match[1])), clampAlbedoChannel(Number(match[2])), clampAlbedoChannel(Number(match[3]))];
}
function sampleColorGradient(gradient, u, v) {
  const stops = gradient.stops.length >= 2 ? gradient.stops : [{ offset: 0, color: "rgba(138,122,95,1)" }, { offset: 1, color: "rgba(138,122,95,1)" }];
  let t;
  if (gradient.type === "radial") {
    const [cx, cy] = gradient.axis;
    const dx = u - cx;
    const dy = v - cy;
    const maxRadius = Math.max(1e-3, Math.hypot(Math.max(cx, 1 - cx), Math.max(cy, 1 - cy)));
    t = clamp01(Math.hypot(dx, dy) / maxRadius);
  } else {
    const [ax, ay] = gradient.axis;
    const projection = (u - 0.5) * ax + (v - 0.5) * ay;
    const maxProjection = 0.5 * (Math.abs(ax) + Math.abs(ay)) || 0.5;
    t = clamp01(projection / maxProjection + 0.5);
  }
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.max(0, Math.floor(scaled)));
  const mix = scaled - index;
  const a = parseRgba(stops[index].color);
  const b = parseRgba(stops[index + 1].color);
  return [
    THREE2.MathUtils.lerp(a[0], b[0], mix),
    THREE2.MathUtils.lerp(a[1], b[1], mix),
    THREE2.MathUtils.lerp(a[2], b[2], mix)
  ];
}
function writePixel(data, offset, red, green, blue) {
  data[offset] = Math.max(0, Math.min(255, Math.round(red)));
  data[offset + 1] = Math.max(0, Math.min(255, Math.round(green)));
  data[offset + 2] = Math.max(0, Math.min(255, Math.round(blue)));
  data[offset + 3] = 255;
}
function makeCanvas(size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}
function createMapTexture(canvas, colorSpace, spec, options) {
  const texture = new THREE2.CanvasTexture(canvas);
  const projection = spec.textureProjection && typeof spec.textureProjection === "object" ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [2, 2];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE2.RepeatWrapping;
  texture.wrapT = THREE2.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === "number" ? repeat[0] : 2,
    typeof repeat[1] === "number" ? repeat[1] : 2
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}
function referenceMapUrl(spec, channel) {
  const reference = spec.referencePbr;
  if (!reference || typeof reference !== "object") return null;
  if (reference.usable === false) return null;
  const confidence = typeof reference.confidence === "number" ? reference.confidence : typeof reference.estimatedFidelity === "number" ? reference.estimatedFidelity : 0;
  const threshold = typeof reference.targetThreshold === "number" ? reference.targetThreshold : 0.7;
  if (confidence < threshold) return null;
  const maps = reference.maps;
  if (!maps || typeof maps !== "object") return null;
  const map = maps[channel];
  if (!map || typeof map !== "object") return null;
  const record = map;
  const url = typeof record.url === "string" && record.url.trim() ? record.url : record.path;
  return typeof url === "string" && url.trim() ? url : null;
}
function createLoadedMapTexture(url, colorSpace, spec, options) {
  const texture = new THREE2.TextureLoader().load(url);
  const projection = spec.textureProjection && typeof spec.textureProjection === "object" ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [1, 1];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE2.RepeatWrapping;
  texture.wrapT = THREE2.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === "number" ? repeat[0] : 1,
    typeof repeat[1] === "number" ? repeat[1] : 1
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}
function makeReferenceTextureSet(spec, options) {
  return null;
  const albedo = referenceMapUrl(spec, "albedo");
  const roughness = referenceMapUrl(spec, "roughness");
  const height = referenceMapUrl(spec, "height");
  const normal = referenceMapUrl(spec, "normal");
  const ao = referenceMapUrl(spec, "ao");
  if (!albedo || !roughness || !height || !normal || !ao) return null;
  return {
    albedo: createLoadedMapTexture(albedo, THREE2.SRGBColorSpace, spec, options),
    roughness: createLoadedMapTexture(roughness, THREE2.NoColorSpace, spec, options),
    height: createLoadedMapTexture(height, THREE2.NoColorSpace, spec, options),
    normal: createLoadedMapTexture(normal, THREE2.NoColorSpace, spec, options),
    ao: createLoadedMapTexture(ao, THREE2.NoColorSpace, spec, options),
    source: "reference-pixel-extraction"
  };
}
function makeProceduralTextureSet(id, spec, options) {
  if (typeof document === "undefined") return null;
  const qualityFirst = (options.qualityPriority ?? "reference-fidelity") === "reference-fidelity";
  const requested = options.textureSize ?? spec.textureResolution;
  const requestedSize = typeof requested === "number" && Number.isFinite(requested) ? requested : qualityFirst ? 1024 : 512;
  const size = Math.max(256, Math.min(2048, 2 ** Math.round(Math.log2(requestedSize))));
  const canvases = {
    albedo: makeCanvas(size),
    roughness: makeCanvas(size),
    height: makeCanvas(size),
    normal: makeCanvas(size),
    ao: makeCanvas(size)
  };
  const contexts = {
    albedo: canvases.albedo.getContext("2d"),
    roughness: canvases.roughness.getContext("2d"),
    height: canvases.height.getContext("2d"),
    normal: canvases.normal.getContext("2d"),
    ao: canvases.ao.getContext("2d")
  };
  if (!contexts.albedo || !contexts.roughness || !contexts.height || !contexts.normal || !contexts.ao) return null;
  const images = {
    albedo: contexts.albedo.createImageData(size, size),
    roughness: contexts.roughness.createImageData(size, size),
    height: contexts.height.createImageData(size, size),
    normal: contexts.normal.createImageData(size, size),
    ao: contexts.ao.createImageData(size, size)
  };
  const seed = hashString(id);
  const bands = surfaceBands(spec);
  const heightField = new Float32Array(size * size);
  const roughnessField = new Float32Array(size * size);
  const palette = materialPalette(spec);
  const fallback = typeof spec.baseColor === "string" ? spec.baseColor : "#8A7A5F";
  const colors = (palette.length >= 2 ? palette : [fallback, "#6E614B", "#A08F70"]).map(hexToRgb);
  const baseRoughness = clamp01(readLayerNumber(spec.roughness, ["base"], 0.76));
  const roughnessVariation = clamp01(readLayerNumber(spec.roughness, ["variation"], 0.18));
  const colorAmplitude = clamp01(readLayerNumber(spec.colorVariation, ["amplitude", "variation"], 0.18));
  const heightCorrelation = clamp01(readLayerNumber(spec.colorVariation, ["heightCorrelation"], 0.3));
  const colorGradient = spec.colorGradient;
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const index = y * size + x;
      const height = sampleSurface(u, v, bands, seed + 101);
      const roughNoise = sampleSurface(u, v, bands, seed + 7001);
      const colorNoise = sampleSurface(u, v, bands, seed + 15013);
      heightField[index] = height;
      roughnessField[index] = clamp01(baseRoughness + (roughNoise - 0.5) * roughnessVariation * 2);
      let color;
      if (colorGradient) {
        color = sampleColorGradient(colorGradient, u, v);
      } else {
        const paletteValue = clamp01(
          0.5 + (colorNoise - 0.5) * colorAmplitude * 2 + (height - 0.5) * heightCorrelation
        );
        color = mixPalette(colors, paletteValue);
      }
      writePixel(images.albedo.data, index * 4, color[0], color[1], color[2]);
    }
  }
  const normalStrength = Math.max(0.05, readLayerNumber(spec.normal, ["strength", "amplitude"], 0.35));
  const aoStrength = clamp01(readLayerNumber(spec.ambientOcclusion, ["cavityStrength", "strength"], 0.35));
  for (let y = 0; y < size; y += 1) {
    const up = (y - 1 + size) % size * size;
    const down = (y + 1) % size * size;
    for (let x = 0; x < size; x += 1) {
      const left = (x - 1 + size) % size;
      const right = (x + 1) % size;
      const index = y * size + x;
      const center = heightField[index];
      const dx = (heightField[y * size + right] - heightField[y * size + left]) * normalStrength * 6;
      const dy = (heightField[down + x] - heightField[up + x]) * normalStrength * 6;
      const inverseLength = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const normalX = -dx * inverseLength;
      const normalY = -dy * inverseLength;
      const normalZ = inverseLength;
      const neighborAverage = (heightField[y * size + left] + heightField[y * size + right] + heightField[up + x] + heightField[down + x]) * 0.25;
      const cavity = Math.max(0, neighborAverage - center);
      const ao = clamp01(1 - aoStrength * (cavity * 12 + (1 - center) * 0.16));
      const offset = index * 4;
      const heightByte = center * 255;
      const roughnessByte = roughnessField[index] * 255;
      writePixel(images.height.data, offset, heightByte, heightByte, heightByte);
      writePixel(images.roughness.data, offset, roughnessByte, roughnessByte, roughnessByte);
      writePixel(
        images.normal.data,
        offset,
        (normalX * 0.5 + 0.5) * 255,
        (normalY * 0.5 + 0.5) * 255,
        (normalZ * 0.5 + 0.5) * 255
      );
      writePixel(images.ao.data, offset, ao * 255, ao * 255, ao * 255);
    }
  }
  contexts.albedo.putImageData(images.albedo, 0, 0);
  contexts.roughness.putImageData(images.roughness, 0, 0);
  contexts.height.putImageData(images.height, 0, 0);
  contexts.normal.putImageData(images.normal, 0, 0);
  contexts.ao.putImageData(images.ao, 0, 0);
  return {
    albedo: createMapTexture(canvases.albedo, THREE2.SRGBColorSpace, spec, options),
    roughness: createMapTexture(canvases.roughness, THREE2.NoColorSpace, spec, options),
    height: createMapTexture(canvases.height, THREE2.NoColorSpace, spec, options),
    normal: createMapTexture(canvases.normal, THREE2.NoColorSpace, spec, options),
    ao: createMapTexture(canvases.ao, THREE2.NoColorSpace, spec, options),
    source: "procedural"
  };
}
function createSculptMaterial(id, spec, options, denseComponent = false) {
  const textures = makeReferenceTextureSet(spec, options) ?? makeProceduralTextureSet(id, spec, options);
  const material = new THREE2.MeshPhysicalMaterial({
    color: textures ? 16777215 : clampedAlbedoColor(spec),
    roughness: textures ? 1 : clamp01(readLayerNumber(spec.roughness, ["base"], 0.76)),
    metalness: clampPbrMetalness(readLayerNumber(spec.metalness, ["base"], 0)),
    clearcoat: clamp01(readLayerNumber(spec.clearcoat, ["base", "amount"], 0)),
    clearcoatRoughness: clamp01(readLayerNumber(spec.clearcoatRoughness, ["base"], 0.25)),
    transmission: clamp01(readLayerNumber(spec.transmission, ["base", "amount"], 0)),
    ior: clampPbrIor(readLayerNumber(spec.ior, ["base", "value"], 1.5)),
    thickness: Math.max(0, readLayerNumber(spec.thickness, ["base", "amount"], 0)),
    attenuationDistance: Math.max(1e-3, readLayerNumber(spec.attenuationDistance, ["base", "value"], Infinity)),
    attenuationColor: new THREE2.Color(typeof spec.attenuationColor === "string" ? spec.attenuationColor : "#ffffff"),
    sheen: clamp01(readLayerNumber(spec.sheen, ["base", "amount"], 0)),
    sheenColor: new THREE2.Color(typeof spec.sheenColor === "string" ? spec.sheenColor : "#ffffff"),
    sheenRoughness: clamp01(readLayerNumber(spec.sheenRoughness, ["base"], 1)),
    iridescence: clamp01(readLayerNumber(spec.iridescence, ["base", "amount"], 0)),
    iridescenceIOR: clampPbrIor(readLayerNumber(spec.iridescenceIOR, ["base", "value"], 1.3)),
    anisotropy: clamp01(readLayerNumber(spec.anisotropy, ["base", "amount"], 0)),
    anisotropyRotation: readLayerNumber(spec.anisotropy, ["rotation"], 0),
    specularIntensity: clampPbrF0(readLayerNumber(spec.specularF0 ?? spec.f0 ?? spec.specularIntensity, ["base", "value"], 1)),
    specularColor: new THREE2.Color(typeof spec.specularColor === "string" ? spec.specularColor : "#ffffff"),
    emissive: new THREE2.Color(typeof spec.emissive === "string" ? spec.emissive : "#000000"),
    emissiveIntensity: Math.max(0, readLayerNumber(spec.emissiveIntensity, ["base"], 1)),
    opacity: clamp01(readLayerNumber(spec.opacity, ["base"], 1)),
    transparent: readLayerNumber(spec.transmission, ["base", "amount"], 0) > 0 || readLayerNumber(spec.opacity, ["base"], 1) < 1,
    alphaTest: Math.max(0, readLayerNumber(spec.alpha, ["cutoff", "alphaTest"], 0)),
    wireframe: options.wireframe ?? false,
    side: spec.doubleSided === true ? THREE2.DoubleSide : THREE2.FrontSide,
    flatShading: spec.flatShading === true
  });
  if (textures) {
    material.map = textures.albedo;
    material.roughnessMap = textures.roughness;
    material.normalMap = textures.normal;
    material.normalScale.setScalar(Math.max(0.05, readLayerNumber(spec.normal, ["strength", "amplitude"], 0.35)));
    material.aoMap = textures.ao;
    material.aoMap.channel = 0;
    material.aoMapIntensity = readLayerNumber(spec.ambientOcclusion, ["cavityStrength", "strength"], 0.35);
    const denseMesh = denseComponent || spec.denseMesh === true || spec.geometryDensity === "dense" || spec.topologyClass === "dense";
    const bumpScale = Math.max(0, readLayerNumber(spec.bump, ["amplitude", "strength"], 0));
    const effectiveBumpScale = denseMesh ? Math.max(0.05, bumpScale) : bumpScale;
    if (effectiveBumpScale > 0) {
      material.bumpMap = textures.height;
      material.bumpScale = effectiveBumpScale;
    }
    const displacementScale = Math.max(0, readLayerNumber(spec.displacement, ["amplitude", "strength"], 0));
    const effectiveDisplacementScale = denseMesh ? Math.max(5e-3, displacementScale) : displacementScale;
    if (effectiveDisplacementScale > 0) {
      material.displacementMap = textures.height;
      material.displacementScale = effectiveDisplacementScale;
      material.displacementBias = -effectiveDisplacementScale * 0.5;
    }
  }
  material.envMapIntensity = readLayerNumber(spec, ["envMapIntensity"], 0.8);
  material.userData.sculptMaterial = spec;
  material.userData.proceduralMapsIndependent = true;
  material.userData.pbrConstraints = { albedoRange: [30, 240], binaryMetalness: true, f0Range: [0.02, 1], iorRange: [1, 2.5] };
  material.userData.pbrTextureSource = textures?.source ?? "flat-fallback";
  material.userData.referencePbr = spec.referencePbr ?? null;
  material.userData.referenceMaterialId = spec.referenceMaterialId ?? spec.materialReference?.profileId ?? null;
  material.userData.materialEvidence = spec.materialEvidence ?? null;
  material.userData.validationViews = spec.materialReference?.validationViews ?? [];
  material.needsUpdate = true;
  return material;
}
function readVector3(value, fallback) {
  if (Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === "number")) {
    return new THREE2.Vector3(value[0], value[1], value[2]);
  }
  return new THREE2.Vector3(fallback[0], fallback[1], fallback[2]);
}
function readNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function makeAttachmentEndpoint(attachment) {
  if (!attachment || typeof attachment !== "object") return null;
  const record = attachment;
  const start = readVector3(record.localStart, [0, 0, 0]);
  const end = readVector3(record.localEnd, [0, 1, 0]);
  const delta = end.clone().sub(start);
  const length = delta.length();
  if (length <= 1e-4) return null;
  const direction = delta.clone().normalize();
  const quaternion = new THREE2.Quaternion().setFromUnitVectors(new THREE2.Vector3(0, 1, 0), direction);
  const baseRadius = Math.max(5e-3, readNumber(record.baseRadius, 0.06));
  const endRadius = Math.max(3e-3, readNumber(record.endRadius, baseRadius * 0.55));
  return {
    start,
    midpoint: delta.multiplyScalar(0.5),
    quaternion,
    length,
    baseRadius,
    endRadius
  };
}
function createSteampunkDeskLampModel(options = {}) {
  const root = new THREE2.Group();
  root.name = "Steampunk Desk Lamp";
  root.userData.reconstructionEvidence = { "itemFamily": null, "subtype": null, "componentAdapter": null, "route": null, "exactnessTier": null, "referenceCamera": { "solved": false, "fovDegrees": 35, "aspect": 1, "orientation": { "yaw": 18, "pitch": 8, "roll": 0 }, "positionHint": [1, 1.6, 3.2], "note": "3/4 view slightly above, lamp faces down-left. Matched by eye." }, "approximationNotes": [] };
  root.userData.materialPipeline = {};
  root.userData.materialReferenceRegistry = null;
  const materialMap = {};
  materialMap["agedCopper"] = createSculptMaterial(
    "agedCopper",
    { "id": "agedCopper", "name": "Aged copper", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#a5573a", "color": "#a5573a", "albedo": { "dominant": "#a5573a", "secondary": ["#c98862", "#7e3f28", "#5e2f1e"], "samplingNotes": "sampled from reference part regions" }, "colorVariation": { "palette": ["#a5573a", "#c98862", "#7e3f28", "#5e2f1e"], "pattern": "patina-mottle", "amplitude": 0.15, "heightCorrelation": 0.4 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "object-scale stable wear" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.3, "role": "broad patina / tone variation" }, { "id": "meso", "frequency": 14, "amplitude": 0.18, "role": "patina mottling + edge wear" }, { "id": "micro", "frequency": 60, "amplitude": 0.08, "role": "micro roughness breakup under grazing light" }], "roughness": { "base": 0.42, "variation": 0.14, "map": "independent-procedural-field", "localResponse": "higher roughness in patina cavities, lower on worn edges" }, "metalness": { "base": 1, "variation": 0 }, "normal": { "pattern": "wear + machining marks (independent of albedo)", "strength": 0.2, "scale": 14, "space": "tangent" }, "bump": { "pattern": "machining-rings", "amplitude": 8e-3, "scale": 20 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.5, "contactShadowBias": 0.4, "notes": "dark patina in crevices" }, "wear": { "edgeWear": 0.35, "scratches": [], "chips": [] }, "dirt": { "amount": 0.15, "cavityBias": 0.7, "color": "#231913" }, "localOverrides": [{ "id": "edgeWear", "mask": "curvature-bright", "effect": "roughness -0.15, albedo toward #c98862", "evidence": "evidence/lamp/di/zone-r1c1.png" }], "shaderNotes": ["Aged copper: patina-dark cavities, worn-bright edges; envMap needed for metal read.", "Agent-vision correction: analyze_texture finish class set dielectric-ish metalness on real metals; corrected (copper/steel/brass 1.0, iron 0.6, glass/fabric 0.0)."], "notes": "Aged copper: patina-dark cavities, worn-bright edges; envMap needed for metal read.", "finishClass": "candy-coat", "texturePalette": ["#86766B", "#8F7768", "#B9957F", "#826856", "#70655A"], "proceduralTexture": "gradient-smoke", "clearcoat": { "base": 0.6, "variation": 0 }, "clearcoatRoughness": { "base": 0.15, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 0.7, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\lamp\\mat\\crop-agedCopper.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/lamp/pbr/agedCopper/agedcopper_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/lamp/pbr/agedCopper/agedcopper_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/lamp/pbr/agedCopper/agedcopper_height.png", "channel": "height" }, "normal": { "path": "evidence/lamp/pbr/agedCopper/agedcopper_normal.png", "channel": "normal" }, "ao": { "path": "evidence/lamp/pbr/agedCopper/agedcopper_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["brushedSteel"] = createSculptMaterial(
    "brushedSteel",
    { "id": "brushedSteel", "name": "Brushed steel", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#c9c9cd", "color": "#c9c9cd", "albedo": { "dominant": "#c9c9cd", "secondary": ["#96989e", "#e2e2e6"], "samplingNotes": "sampled from reference part regions" }, "colorVariation": { "palette": ["#c9c9cd", "#96989e", "#e2e2e6"], "pattern": "patina-mottle", "amplitude": 0.15, "heightCorrelation": 0.4 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "object-scale stable wear" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.3, "role": "broad patina / tone variation" }, { "id": "meso", "frequency": 14, "amplitude": 0.18, "role": "brush lines along axis" }, { "id": "micro", "frequency": 60, "amplitude": 0.08, "role": "micro roughness breakup under grazing light" }], "roughness": { "base": 0.3, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "higher roughness in patina cavities, lower on worn edges" }, "metalness": { "base": 1, "variation": 0 }, "normal": { "pattern": "wear + machining marks (independent of albedo)", "strength": 0.2, "scale": 14, "space": "tangent" }, "bump": { "pattern": "machining-rings", "amplitude": 8e-3, "scale": 20 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.5, "contactShadowBias": 0.4, "notes": "dark patina in crevices" }, "wear": { "edgeWear": 0.35, "scratches": [], "chips": [] }, "dirt": { "amount": 0.15, "cavityBias": 0.7, "color": "#231913" }, "localOverrides": [], "shaderNotes": ["Brushed steel: mild anisotropic sheen on piston bodies; gears slightly duller.", "Agent-vision correction: analyze_texture finish class set dielectric-ish metalness on real metals; corrected (copper/steel/brass 1.0, iron 0.6, glass/fabric 0.0)."], "notes": "Brushed steel: mild anisotropic sheen on piston bodies; gears slightly duller.", "finishClass": "candy-coat", "texturePalette": ["#614F43", "#978A7F", "#9A948C", "#7C776F", "#787572"], "proceduralTexture": "gradient-smoke", "clearcoat": { "base": 0.6, "variation": 0 }, "clearcoatRoughness": { "base": 0.15, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 0.7, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\lamp\\mat\\crop-brushedSteel.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/lamp/pbr/brushedSteel/brushedsteel_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/lamp/pbr/brushedSteel/brushedsteel_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/lamp/pbr/brushedSteel/brushedsteel_height.png", "channel": "height" }, "normal": { "path": "evidence/lamp/pbr/brushedSteel/brushedsteel_normal.png", "channel": "normal" }, "ao": { "path": "evidence/lamp/pbr/brushedSteel/brushedsteel_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["brassMetal"] = createSculptMaterial(
    "brassMetal",
    { "id": "brassMetal", "name": "Brass", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#9a7a3a", "color": "#9a7a3a", "albedo": { "dominant": "#9a7a3a", "secondary": ["#ba9852", "#6f5526"], "samplingNotes": "sampled from reference part regions" }, "colorVariation": { "palette": ["#9a7a3a", "#ba9852", "#6f5526"], "pattern": "patina-mottle", "amplitude": 0.15, "heightCorrelation": 0.4 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "object-scale stable wear" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.3, "role": "broad patina / tone variation" }, { "id": "meso", "frequency": 14, "amplitude": 0.18, "role": "ring machining marks" }, { "id": "micro", "frequency": 60, "amplitude": 0.08, "role": "micro roughness breakup under grazing light" }], "roughness": { "base": 0.42, "variation": 0.1, "map": "independent-procedural-field", "localResponse": "higher roughness in patina cavities, lower on worn edges" }, "metalness": { "base": 1, "variation": 0 }, "normal": { "pattern": "wear + machining marks (independent of albedo)", "strength": 0.2, "scale": 14, "space": "tangent" }, "bump": { "pattern": "machining-rings", "amplitude": 8e-3, "scale": 20 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.5, "contactShadowBias": 0.4, "notes": "dark patina in crevices" }, "wear": { "edgeWear": 0.35, "scratches": [], "chips": [] }, "dirt": { "amount": 0.15, "cavityBias": 0.7, "color": "#231913" }, "localOverrides": [], "shaderNotes": ["Brass ring band; warmer/darker than copper highlights.", "Agent-vision correction: analyze_texture finish class set dielectric-ish metalness on real metals; corrected (copper/steel/brass 1.0, iron 0.6, glass/fabric 0.0)."], "notes": "Brass ring band; warmer/darker than copper highlights.", "finishClass": "painted-metal", "texturePalette": ["#68493A", "#554032", "#5F402D", "#6A533B", "#4B3D2A"], "proceduralTexture": "flat-clearcoat", "clearcoat": { "base": 1, "variation": 0 }, "clearcoatRoughness": { "base": 0.05, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 1, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\lamp\\mat\\crop-brassMetal.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.824, "estimatedFidelity": 0.824, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/lamp/pbr/brassMetal/brassmetal_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/lamp/pbr/brassMetal/brassmetal_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/lamp/pbr/brassMetal/brassmetal_height.png", "channel": "height" }, "normal": { "path": "evidence/lamp/pbr/brassMetal/brassmetal_normal.png", "channel": "normal" }, "ao": { "path": "evidence/lamp/pbr/brassMetal/brassmetal_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["blackIron"] = createSculptMaterial(
    "blackIron",
    { "id": "blackIron", "name": "Black iron", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#1d1d1f", "color": "#1d1d1f", "albedo": { "dominant": "#1d1d1f", "secondary": ["#3c3c40", "#141416"], "samplingNotes": "sampled from reference part regions" }, "colorVariation": { "palette": ["#1d1d1f", "#3c3c40", "#141416"], "pattern": "patina-mottle", "amplitude": 0.15, "heightCorrelation": 0.4 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "object-scale stable wear" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.3, "role": "broad patina / tone variation" }, { "id": "meso", "frequency": 14, "amplitude": 0.18, "role": "scratch strokes" }, { "id": "micro", "frequency": 60, "amplitude": 0.08, "role": "micro roughness breakup under grazing light" }], "roughness": { "base": 0.55, "variation": 0.12, "map": "independent-procedural-field", "localResponse": "higher roughness in patina cavities, lower on worn edges" }, "metalness": { "base": 0.6, "variation": 0 }, "normal": { "pattern": "wear + machining marks (independent of albedo)", "strength": 0.2, "scale": 14, "space": "tangent" }, "bump": { "pattern": "machining-rings", "amplitude": 8e-3, "scale": 20 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.5, "contactShadowBias": 0.4, "notes": "dark patina in crevices" }, "wear": { "edgeWear": 0.35, "scratches": [], "chips": [] }, "dirt": { "amount": 0.15, "cavityBias": 0.7, "color": "#231913" }, "localOverrides": [{ "id": "ironScratches", "mask": "sparse stroke mask", "effect": "albedo +#3c3c40 strokes, roughness -0.1", "evidence": "evidence/lamp/di/zone-r2c1.png" }], "shaderNotes": ["Near-black iron with light scratches; semi-metallic.", "Agent-vision correction: analyze_texture finish class set dielectric-ish metalness on real metals; corrected (copper/steel/brass 1.0, iron 0.6, glass/fabric 0.0)."], "notes": "Near-black iron with light scratches; semi-metallic.", "finishClass": "worn-composite", "texturePalette": ["#50493E", "#5B5A58", "#514E47", "#191917", "#1A1916"], "proceduralTexture": "mottle", "clearcoat": { "base": 0, "variation": 0 }, "clearcoatRoughness": { "base": 0, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 0.5, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\lamp\\mat\\crop-blackIron.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/lamp/pbr/blackIron/blackiron_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/lamp/pbr/blackIron/blackiron_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/lamp/pbr/blackIron/blackiron_height.png", "channel": "height" }, "normal": { "path": "evidence/lamp/pbr/blackIron/blackiron_normal.png", "channel": "normal" }, "ao": { "path": "evidence/lamp/pbr/blackIron/blackiron_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["glowTube"] = createSculptMaterial(
    "glowTube",
    { "id": "glowTube", "name": "Glow tube", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#8fe8ff", "color": "#8fe8ff", "albedo": { "dominant": "#8fe8ff", "secondary": ["#dcfaff", "#4fc3e8"], "samplingNotes": "sampled from reference part regions" }, "colorVariation": { "palette": ["#8fe8ff", "#dcfaff", "#4fc3e8"], "pattern": "patina-mottle", "amplitude": 0.15, "heightCorrelation": 0.4 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "object-scale stable wear" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.3, "role": "broad patina / tone variation" }, { "id": "meso", "frequency": 14, "amplitude": 0.18, "role": "none" }, { "id": "micro", "frequency": 60, "amplitude": 0.08, "role": "micro roughness breakup under grazing light" }], "roughness": { "base": 0.2, "variation": 0, "map": "independent-procedural-field", "localResponse": "higher roughness in patina cavities, lower on worn edges" }, "metalness": { "base": 0, "variation": 0 }, "normal": { "pattern": "wear + machining marks (independent of albedo)", "strength": 0.2, "scale": 14, "space": "tangent" }, "bump": { "pattern": "machining-rings", "amplitude": 8e-3, "scale": 20 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.5, "contactShadowBias": 0.4, "notes": "dark patina in crevices" }, "wear": { "edgeWear": 0.35, "scratches": [], "chips": [] }, "dirt": { "amount": 0.15, "cavityBias": 0.7, "color": "#231913" }, "localOverrides": [], "shaderNotes": ["Cyan emissive tube: bright core + softer envelope; PointLight practical tints cage interior.", "Agent-vision correction: analyze_texture finish class set dielectric-ish metalness on real metals; corrected (copper/steel/brass 1.0, iron 0.6, glass/fabric 0.0)."], "notes": "Cyan emissive tube: bright core + softer envelope; PointLight practical tints cage interior.", "emissive": { "palette": ["#8fe8ff"], "intensity": 2.2 }, "finishClass": "gem-metal", "texturePalette": ["#A6BEC2", "#A6C2CE", "#A6BDC3", "#849AA3", "#737A7C"], "proceduralTexture": "gradient-smoke", "clearcoat": { "base": 0.6, "variation": 0 }, "clearcoatRoughness": { "base": 0.06, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 1.3, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\lamp\\mat\\crop-glowTube.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/lamp/pbr/glowTube/glowtube_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/lamp/pbr/glowTube/glowtube_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/lamp/pbr/glowTube/glowtube_height.png", "channel": "height" }, "normal": { "path": "evidence/lamp/pbr/glowTube/glowtube_normal.png", "channel": "normal" }, "ao": { "path": "evidence/lamp/pbr/glowTube/glowtube_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["cableBraid"] = createSculptMaterial(
    "cableBraid",
    { "id": "cableBraid", "name": "Braided cable", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#8f7f63", "color": "#8f7f63", "albedo": { "dominant": "#8f7f63", "secondary": ["#6f6350", "#a3927a"], "samplingNotes": "sampled from reference part regions" }, "colorVariation": { "palette": ["#8f7f63", "#6f6350", "#a3927a"], "pattern": "patina-mottle", "amplitude": 0.15, "heightCorrelation": 0.4 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "object-scale stable wear" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.3, "role": "broad patina / tone variation" }, { "id": "meso", "frequency": 14, "amplitude": 0.18, "role": "braid ridges (helical)" }, { "id": "micro", "frequency": 60, "amplitude": 0.08, "role": "micro roughness breakup under grazing light" }], "roughness": { "base": 0.7, "variation": 0.1, "map": "independent-procedural-field", "localResponse": "higher roughness in patina cavities, lower on worn edges" }, "metalness": { "base": 0, "variation": 0 }, "normal": { "pattern": "wear + machining marks (independent of albedo)", "strength": 0.2, "scale": 14, "space": "tangent" }, "bump": { "pattern": "machining-rings", "amplitude": 8e-3, "scale": 20 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.5, "contactShadowBias": 0.4, "notes": "dark patina in crevices" }, "wear": { "edgeWear": 0.35, "scratches": [], "chips": [] }, "dirt": { "amount": 0.15, "cavityBias": 0.7, "color": "#231913" }, "localOverrides": [], "shaderNotes": ["Tan cloth braid; bump stripes twisted along the tube.", "Agent-vision correction: analyze_texture finish class set dielectric-ish metalness on real metals; corrected (copper/steel/brass 1.0, iron 0.6, glass/fabric 0.0)."], "notes": "Tan cloth braid; bump stripes twisted along the tube.", "finishClass": "worn-composite", "texturePalette": ["#8f7f63", "#6f6350", "#a3927a", "#5c5140", "#7a6c55"], "proceduralTexture": "mottle", "clearcoat": { "base": 0, "variation": 0 }, "clearcoatRoughness": { "base": 0, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 0.5, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\lamp\\mat\\crop-cableBraid.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/lamp/pbr/cableBraid/cablebraid_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/lamp/pbr/cableBraid/cablebraid_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/lamp/pbr/cableBraid/cablebraid_height.png", "channel": "height" }, "normal": { "path": "evidence/lamp/pbr/cableBraid/cablebraid_normal.png", "channel": "normal" }, "ao": { "path": "evidence/lamp/pbr/cableBraid/cablebraid_ao.png", "channel": "ao" } } } },
    options
  );
  const nodes = { root };
  const meshes = {};
  const sockets = {};
  const colliders = {};
  const destructionGroups = {};
  const attachment_root_0 = null;
  const endpoint_root_0 = makeAttachmentEndpoint(attachment_root_0);
  const node_root_0 = new THREE2.Group();
  node_root_0.name = "Steampunk Desk Lamp__pivot";
  node_root_0.scale.set(1, 1, 1);
  if (endpoint_root_0) {
    node_root_0.position.copy(endpoint_root_0.start);
    node_root_0.rotation.set(0, 0, 0);
  } else {
    node_root_0.position.set(0, 0, 0);
    node_root_0.rotation.set(0, 0, 0);
  }
  node_root_0.userData.sculptComponent = { "id": "root", "name": "Steampunk Desk Lamp", "level": "macro", "role": "body", "importance": 1, "confidence": 0.5, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Pure Group pivot; geometry lives in children.", "geometryDescriptor": { "topologyIntent": "container group", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": null, "attachment": null, "dimensions": { "width": 2.1, "height": 2.6, "depth": 1.1, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0, "microRoughness": 0, "bumpAmplitude": 0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_root_0.userData.actionProfile = { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } };
  (nodes["root"] ?? root).add(node_root_0);
  nodes["root"] = node_root_0;
  const mesh_root_0Geometry = endpoint_root_0 ? new THREE2.CylinderGeometry(endpoint_root_0.endRadius, endpoint_root_0.baseRadius, endpoint_root_0.length, 32, 12) : new THREE2.CylinderGeometry(0.5, 0.5, 1, 48, 16);
  if (!endpoint_root_0) {
    mesh_root_0Geometry.scale(1, 1, 1);
  }
  const mesh_root_0 = new THREE2.Mesh(
    mesh_root_0Geometry,
    materialMap["agedCopper"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_root_0.name = "Steampunk Desk Lamp";
  if (endpoint_root_0) {
    mesh_root_0.position.copy(endpoint_root_0.midpoint);
    mesh_root_0.quaternion.copy(endpoint_root_0.quaternion);
  }
  mesh_root_0.castShadow = options.castShadow ?? true;
  mesh_root_0.receiveShadow = options.receiveShadow ?? true;
  mesh_root_0.userData.sculptComponent = { "id": "root", "name": "Steampunk Desk Lamp", "level": "macro", "role": "body", "importance": 1, "confidence": 0.5, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Pure Group pivot; geometry lives in children.", "geometryDescriptor": { "topologyIntent": "container group", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": null, "attachment": null, "dimensions": { "width": 2.1, "height": 2.6, "depth": 1.1, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0, "microRoughness": 0, "bumpAmplitude": 0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  mesh_root_0.visible = false;
  node_root_0.add(mesh_root_0);
  meshes["root"] = mesh_root_0;
  colliders["root"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." };
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_root_0);
  const attachment_baseIron_1 = null;
  const endpoint_baseIron_1 = makeAttachmentEndpoint(attachment_baseIron_1);
  const node_baseIron_1 = new THREE2.Group();
  node_baseIron_1.name = "Black iron tiered base__pivot";
  node_baseIron_1.scale.set(1, 1, 1);
  if (endpoint_baseIron_1) {
    node_baseIron_1.position.copy(endpoint_baseIron_1.start);
    node_baseIron_1.rotation.set(0, 0, 0);
  } else {
    node_baseIron_1.position.set(0, 0.08, 0);
    node_baseIron_1.rotation.set(0, 0, 0);
  }
  node_baseIron_1.userData.sculptComponent = { "id": "baseIron", "name": "Black iron tiered base", "level": "macro", "role": "body", "importance": 0.9, "confidence": 0.85, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Lathe profile: domed edge + two machined ring steps; rotationally symmetric.", "geometryDescriptor": { "topologyIntent": "lathe body", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": null, "dimensions": { "width": 1.05, "height": 0.17, "depth": 1.05, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0, 0.08, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "body", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "baseIron", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "blackIron", "materialLayers": ["blackIron"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "ironScratches", "what": "light scratch marks on faces", "evidence": "evidence/lamp/di/zone-r2c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(29, 29, 31, 1.0)", "secondaryAlbedo": "rgba(60, 60, 64, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.85, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_baseIron_1.userData.actionProfile = { "animationRole": "body", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "baseIron", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["root"] ?? root).add(node_baseIron_1);
  nodes["baseIron"] = node_baseIron_1;
  const mesh_baseIron_1Geometry = buildBaseIron();
  const mesh_baseIron_1 = new THREE2.Mesh(
    mesh_baseIron_1Geometry,
    materialMap["blackIron"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_baseIron_1.name = "Black iron tiered base";
  if (endpoint_baseIron_1) {
    mesh_baseIron_1.position.copy(endpoint_baseIron_1.midpoint);
    mesh_baseIron_1.quaternion.copy(endpoint_baseIron_1.quaternion);
  }
  mesh_baseIron_1.castShadow = options.castShadow ?? true;
  mesh_baseIron_1.receiveShadow = options.receiveShadow ?? true;
  mesh_baseIron_1.userData.sculptComponent = { "id": "baseIron", "name": "Black iron tiered base", "level": "macro", "role": "body", "importance": 0.9, "confidence": 0.85, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Lathe profile: domed edge + two machined ring steps; rotationally symmetric.", "geometryDescriptor": { "topologyIntent": "lathe body", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": null, "dimensions": { "width": 1.05, "height": 0.17, "depth": 1.05, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0, 0.08, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "body", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "baseIron", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "blackIron", "materialLayers": ["blackIron"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "ironScratches", "what": "light scratch marks on faces", "evidence": "evidence/lamp/di/zone-r2c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(29, 29, 31, 1.0)", "secondaryAlbedo": "rgba(60, 60, 64, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.85, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_baseIron_1.add(mesh_baseIron_1);
  meshes["baseIron"] = mesh_baseIron_1;
  node_baseIron_1.updateWorldMatrix(true, false);
  mesh_baseIron_1.quaternion.identity();
  mesh_baseIron_1.position.copy(node_baseIron_1.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["baseIron"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["baseIron"] ??= [];
  destructionGroups["baseIron"].push(node_baseIron_1);
  const attachment_baseBrassRing_2 = { "parentSocket": "baseIron.topFace", "localStart": [0, 0.16, 0], "localEnd": [0, 0.19, 0], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 };
  const endpoint_baseBrassRing_2 = makeAttachmentEndpoint(attachment_baseBrassRing_2);
  const node_baseBrassRing_2 = new THREE2.Group();
  node_baseBrassRing_2.name = "Brass ring band__pivot";
  node_baseBrassRing_2.scale.set(1, 1, 1);
  if (endpoint_baseBrassRing_2) {
    node_baseBrassRing_2.position.copy(endpoint_baseBrassRing_2.start);
    node_baseBrassRing_2.rotation.set(0, 0, 0);
  } else {
    node_baseBrassRing_2.position.set(0, 0.17, 0);
    node_baseBrassRing_2.rotation.set(0, 0, 0);
  }
  node_baseBrassRing_2.userData.sculptComponent = { "id": "baseBrassRing", "name": "Brass ring band", "level": "meso", "role": "trim", "importance": 0.8, "confidence": 0.85, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Flat brass annulus on the base top face with small screws.", "geometryDescriptor": { "topologyIntent": "torus trim", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "baseIron", "attachment": { "parentSocket": "baseIron.topFace", "localStart": [0, 0.16, 0], "localEnd": [0, 0.19, 0], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.72, "height": 0.03, "depth": 0.72, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0, 0.17, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "trim", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "baseBrassRing", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "baseScrews", "what": "~6 small slotted screws around the ring", "evidence": "evidence/lamp/di/zone-r2c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(154, 122, 58, 1.0)", "secondaryAlbedo": "rgba(186, 152, 82, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.85, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_baseBrassRing_2.userData.actionProfile = { "animationRole": "trim", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "baseBrassRing", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["baseIron"] ?? root).add(node_baseBrassRing_2);
  nodes["baseBrassRing"] = node_baseBrassRing_2;
  const mesh_baseBrassRing_2Geometry = buildBrassRing();
  const mesh_baseBrassRing_2 = new THREE2.Mesh(
    mesh_baseBrassRing_2Geometry,
    materialMap["brassMetal"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_baseBrassRing_2.name = "Brass ring band";
  if (endpoint_baseBrassRing_2) {
    mesh_baseBrassRing_2.position.copy(endpoint_baseBrassRing_2.midpoint);
    mesh_baseBrassRing_2.quaternion.copy(endpoint_baseBrassRing_2.quaternion);
  }
  mesh_baseBrassRing_2.castShadow = options.castShadow ?? true;
  mesh_baseBrassRing_2.receiveShadow = options.receiveShadow ?? true;
  mesh_baseBrassRing_2.userData.sculptComponent = { "id": "baseBrassRing", "name": "Brass ring band", "level": "meso", "role": "trim", "importance": 0.8, "confidence": 0.85, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Flat brass annulus on the base top face with small screws.", "geometryDescriptor": { "topologyIntent": "torus trim", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "baseIron", "attachment": { "parentSocket": "baseIron.topFace", "localStart": [0, 0.16, 0], "localEnd": [0, 0.19, 0], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.72, "height": 0.03, "depth": 0.72, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0, 0.17, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "trim", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "baseBrassRing", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "baseScrews", "what": "~6 small slotted screws around the ring", "evidence": "evidence/lamp/di/zone-r2c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(154, 122, 58, 1.0)", "secondaryAlbedo": "rgba(186, 152, 82, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.85, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_baseBrassRing_2.add(mesh_baseBrassRing_2);
  meshes["baseBrassRing"] = mesh_baseBrassRing_2;
  node_baseBrassRing_2.updateWorldMatrix(true, false);
  mesh_baseBrassRing_2.quaternion.identity();
  mesh_baseBrassRing_2.position.copy(node_baseBrassRing_2.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["baseBrassRing"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["baseBrassRing"] ??= [];
  destructionGroups["baseBrassRing"].push(node_baseBrassRing_2);
  const attachment_baseCopperRiser_3 = { "parentSocket": "baseBrassRing.center", "localStart": [0, 0.19, 0], "localEnd": [0, 0.47, 0], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 };
  const endpoint_baseCopperRiser_3 = makeAttachmentEndpoint(attachment_baseCopperRiser_3);
  const node_baseCopperRiser_3 = new THREE2.Group();
  node_baseCopperRiser_3.name = "Copper riser stack__pivot";
  node_baseCopperRiser_3.scale.set(1, 1, 1);
  if (endpoint_baseCopperRiser_3) {
    node_baseCopperRiser_3.position.copy(endpoint_baseCopperRiser_3.start);
    node_baseCopperRiser_3.rotation.set(0, 0, 0);
  } else {
    node_baseCopperRiser_3.position.set(0, 0.32, 0);
    node_baseCopperRiser_3.rotation.set(0, 0, 0);
  }
  node_baseCopperRiser_3.userData.sculptComponent = { "id": "baseCopperRiser", "name": "Copper riser stack", "level": "meso", "role": "body", "importance": 0.8, "confidence": 0.85, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Flanged copper ring + drum + collar stacked on the brass plate.", "geometryDescriptor": { "topologyIntent": "cylinder body", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "baseIron", "attachment": { "parentSocket": "baseBrassRing.center", "localStart": [0, 0.19, 0], "localEnd": [0, 0.47, 0], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.42, "height": 0.28, "depth": 0.42, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0, 0.32, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "body", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "baseCopperRiser", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_baseCopperRiser_3.userData.actionProfile = { "animationRole": "body", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "baseCopperRiser", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["baseIron"] ?? root).add(node_baseCopperRiser_3);
  nodes["baseCopperRiser"] = node_baseCopperRiser_3;
  const mesh_baseCopperRiser_3Geometry = buildCopperRiser();
  const mesh_baseCopperRiser_3 = new THREE2.Mesh(
    mesh_baseCopperRiser_3Geometry,
    materialMap["agedCopper"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_baseCopperRiser_3.name = "Copper riser stack";
  if (endpoint_baseCopperRiser_3) {
    mesh_baseCopperRiser_3.position.copy(endpoint_baseCopperRiser_3.midpoint);
    mesh_baseCopperRiser_3.quaternion.copy(endpoint_baseCopperRiser_3.quaternion);
  }
  mesh_baseCopperRiser_3.castShadow = options.castShadow ?? true;
  mesh_baseCopperRiser_3.receiveShadow = options.receiveShadow ?? true;
  mesh_baseCopperRiser_3.userData.sculptComponent = { "id": "baseCopperRiser", "name": "Copper riser stack", "level": "meso", "role": "body", "importance": 0.8, "confidence": 0.85, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Flanged copper ring + drum + collar stacked on the brass plate.", "geometryDescriptor": { "topologyIntent": "cylinder body", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "baseIron", "attachment": { "parentSocket": "baseBrassRing.center", "localStart": [0, 0.19, 0], "localEnd": [0, 0.47, 0], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.42, "height": 0.28, "depth": 0.42, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0, 0.32, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "body", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "baseCopperRiser", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_baseCopperRiser_3.add(mesh_baseCopperRiser_3);
  meshes["baseCopperRiser"] = mesh_baseCopperRiser_3;
  node_baseCopperRiser_3.updateWorldMatrix(true, false);
  mesh_baseCopperRiser_3.quaternion.identity();
  mesh_baseCopperRiser_3.position.copy(node_baseCopperRiser_3.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["baseCopperRiser"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["baseCopperRiser"] ??= [];
  destructionGroups["baseCopperRiser"].push(node_baseCopperRiser_3);
  const attachment_pedestalBracket_4 = { "parentSocket": "baseCopperRiser.top", "localStart": [0, 0.47, 0], "localEnd": [0, 0.66, 0], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 };
  const endpoint_pedestalBracket_4 = makeAttachmentEndpoint(attachment_pedestalBracket_4);
  const node_pedestalBracket_4 = new THREE2.Group();
  node_pedestalBracket_4.name = "Copper clevis bracket__pivot";
  node_pedestalBracket_4.scale.set(1, 1, 1);
  if (endpoint_pedestalBracket_4) {
    node_pedestalBracket_4.position.copy(endpoint_pedestalBracket_4.start);
    node_pedestalBracket_4.rotation.set(0, 0, 0);
  } else {
    node_pedestalBracket_4.position.set(0, 0.55, 0);
    node_pedestalBracket_4.rotation.set(0, 0, 0);
  }
  node_pedestalBracket_4.userData.sculptComponent = { "id": "pedestalBracket", "name": "Copper clevis bracket", "level": "meso", "role": "bracket", "importance": 0.8, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Fork/clevis plates holding gear joint 1.", "geometryDescriptor": { "topologyIntent": "extrude bracket", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "baseCopperRiser", "attachment": { "parentSocket": "baseCopperRiser.top", "localStart": [0, 0.47, 0], "localEnd": [0, 0.66, 0], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.3, "height": 0.24, "depth": 0.22, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0, 0.55, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "bracket", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "pedestalBracket", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_pedestalBracket_4.userData.actionProfile = { "animationRole": "bracket", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "pedestalBracket", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["baseCopperRiser"] ?? root).add(node_pedestalBracket_4);
  nodes["pedestalBracket"] = node_pedestalBracket_4;
  const mesh_pedestalBracket_4Geometry = buildBracket();
  const mesh_pedestalBracket_4 = new THREE2.Mesh(
    mesh_pedestalBracket_4Geometry,
    materialMap["agedCopper"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_pedestalBracket_4.name = "Copper clevis bracket";
  if (endpoint_pedestalBracket_4) {
    mesh_pedestalBracket_4.position.copy(endpoint_pedestalBracket_4.midpoint);
    mesh_pedestalBracket_4.quaternion.copy(endpoint_pedestalBracket_4.quaternion);
  }
  mesh_pedestalBracket_4.castShadow = options.castShadow ?? true;
  mesh_pedestalBracket_4.receiveShadow = options.receiveShadow ?? true;
  mesh_pedestalBracket_4.userData.sculptComponent = { "id": "pedestalBracket", "name": "Copper clevis bracket", "level": "meso", "role": "bracket", "importance": 0.8, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Fork/clevis plates holding gear joint 1.", "geometryDescriptor": { "topologyIntent": "extrude bracket", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "baseCopperRiser", "attachment": { "parentSocket": "baseCopperRiser.top", "localStart": [0, 0.47, 0], "localEnd": [0, 0.66, 0], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.3, "height": 0.24, "depth": 0.22, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0, 0.55, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "bracket", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "pedestalBracket", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_pedestalBracket_4.add(mesh_pedestalBracket_4);
  meshes["pedestalBracket"] = mesh_pedestalBracket_4;
  node_pedestalBracket_4.updateWorldMatrix(true, false);
  mesh_pedestalBracket_4.quaternion.identity();
  mesh_pedestalBracket_4.position.copy(node_pedestalBracket_4.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["pedestalBracket"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["pedestalBracket"] ??= [];
  destructionGroups["pedestalBracket"].push(node_pedestalBracket_4);
  const attachment_joint1Gear_5 = { "parentSocket": "pedestalBracket.pin", "localStart": [0, 0.66, -0.05], "localEnd": [0, 0.66, 0.05], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 };
  const endpoint_joint1Gear_5 = makeAttachmentEndpoint(attachment_joint1Gear_5);
  const node_joint1Gear_5 = new THREE2.Group();
  node_joint1Gear_5.name = "Gear joint 1 (base)__pivot";
  node_joint1Gear_5.scale.set(1, 1, 1);
  if (endpoint_joint1Gear_5) {
    node_joint1Gear_5.position.copy(endpoint_joint1Gear_5.start);
    node_joint1Gear_5.rotation.set(0, 0, 0);
  } else {
    node_joint1Gear_5.position.set(0, 0.66, 0);
    node_joint1Gear_5.rotation.set(0, 0, 0);
  }
  node_joint1Gear_5.userData.sculptComponent = { "id": "joint1Gear", "name": "Gear joint 1 (base)", "level": "meso", "role": "joint", "importance": 0.95, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Knurled silver spur gear (~32 fine teeth) + slotted hub screw; hinge axis z.", "geometryDescriptor": { "topologyIntent": "extrude joint", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "pedestalBracket", "attachment": { "parentSocket": "pedestalBracket.pin", "localStart": [0, 0.66, -0.05], "localEnd": [0, 0.66, 0.05], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.32, "height": 0.32, "depth": 0.1, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0, 0.66, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "joint", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "joint1Gear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "brushedSteel", "materialLayers": ["brushedSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "hubScrew1", "what": "large slotted hub screw", "evidence": "evidence/lamp/di/zone-r2c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(201, 201, 205, 1.0)", "secondaryAlbedo": "rgba(150, 152, 158, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_joint1Gear_5.userData.actionProfile = { "animationRole": "joint", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "joint1Gear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["pedestalBracket"] ?? root).add(node_joint1Gear_5);
  nodes["joint1Gear"] = node_joint1Gear_5;
  const mesh_joint1Gear_5Geometry = buildGear(0.16, 0.16, J1);
  const mesh_joint1Gear_5 = new THREE2.Mesh(
    mesh_joint1Gear_5Geometry,
    materialMap["brushedSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_joint1Gear_5.name = "Gear joint 1 (base)";
  if (endpoint_joint1Gear_5) {
    mesh_joint1Gear_5.position.copy(endpoint_joint1Gear_5.midpoint);
    mesh_joint1Gear_5.quaternion.copy(endpoint_joint1Gear_5.quaternion);
  }
  mesh_joint1Gear_5.castShadow = options.castShadow ?? true;
  mesh_joint1Gear_5.receiveShadow = options.receiveShadow ?? true;
  mesh_joint1Gear_5.userData.sculptComponent = { "id": "joint1Gear", "name": "Gear joint 1 (base)", "level": "meso", "role": "joint", "importance": 0.95, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Knurled silver spur gear (~32 fine teeth) + slotted hub screw; hinge axis z.", "geometryDescriptor": { "topologyIntent": "extrude joint", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "pedestalBracket", "attachment": { "parentSocket": "pedestalBracket.pin", "localStart": [0, 0.66, -0.05], "localEnd": [0, 0.66, 0.05], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.32, "height": 0.32, "depth": 0.1, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0, 0.66, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "joint", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "joint1Gear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "brushedSteel", "materialLayers": ["brushedSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "hubScrew1", "what": "large slotted hub screw", "evidence": "evidence/lamp/di/zone-r2c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(201, 201, 205, 1.0)", "secondaryAlbedo": "rgba(150, 152, 158, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_joint1Gear_5.add(mesh_joint1Gear_5);
  meshes["joint1Gear"] = mesh_joint1Gear_5;
  node_joint1Gear_5.updateWorldMatrix(true, false);
  mesh_joint1Gear_5.quaternion.identity();
  mesh_joint1Gear_5.position.copy(node_joint1Gear_5.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["joint1Gear"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["joint1Gear"] ??= [];
  destructionGroups["joint1Gear"].push(node_joint1Gear_5);
  const attachment_armLower_6 = { "parentSocket": "joint1Gear.hinge", "localStart": [0, 0.66, 0], "localEnd": [0.48, 1.56, 0], "contactType": "embedded", "embedDepth": 0.05, "overlap": 0.05, "gapTolerance": 0.01 };
  const endpoint_armLower_6 = makeAttachmentEndpoint(attachment_armLower_6);
  const node_armLower_6 = new THREE2.Group();
  node_armLower_6.name = "Lower arm bar__pivot";
  node_armLower_6.scale.set(1, 1, 1);
  if (endpoint_armLower_6) {
    node_armLower_6.position.copy(endpoint_armLower_6.start);
    node_armLower_6.rotation.set(0, 0, 0);
  } else {
    node_armLower_6.position.set(0.24, 1.09, 0);
    node_armLower_6.rotation.set(0, 0, 0);
  }
  node_armLower_6.userData.sculptComponent = { "id": "armLower", "name": "Lower arm bar", "level": "macro", "role": "limb", "importance": 1, "confidence": 0.85, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Copper bar with elongated through-slot; pivots at joint1, rises ~63 deg up-right.", "geometryDescriptor": { "topologyIntent": "box limb", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "joint1Gear", "attachment": { "parentSocket": "joint1Gear.hinge", "localStart": [0, 0.66, 0], "localEnd": [0.48, 1.56, 0], "contactType": "embedded", "embedDepth": 0.05, "overlap": 0.05, "gapTolerance": 0.01 }, "dimensions": { "width": 1.1, "height": 0.14, "depth": 0.1, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.24, 1.09, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "limb", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "armLower", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "armSlot", "what": "elongated through-slot cutout", "evidence": "evidence/lamp/di/zone-r1c1.png" }, { "id": "strapScrews", "what": "small slotted screws on strap plates", "evidence": "evidence/lamp/di/zone-r0c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_armLower_6.userData.actionProfile = { "animationRole": "limb", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "armLower", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["joint1Gear"] ?? root).add(node_armLower_6);
  nodes["armLower"] = node_armLower_6;
  const mesh_armLower_6Geometry = buildArmBar(J1, J2, 0.14);
  const mesh_armLower_6 = new THREE2.Mesh(
    mesh_armLower_6Geometry,
    materialMap["agedCopper"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_armLower_6.name = "Lower arm bar";
  if (endpoint_armLower_6) {
    mesh_armLower_6.position.copy(endpoint_armLower_6.midpoint);
    mesh_armLower_6.quaternion.copy(endpoint_armLower_6.quaternion);
  }
  mesh_armLower_6.castShadow = options.castShadow ?? true;
  mesh_armLower_6.receiveShadow = options.receiveShadow ?? true;
  mesh_armLower_6.userData.sculptComponent = { "id": "armLower", "name": "Lower arm bar", "level": "macro", "role": "limb", "importance": 1, "confidence": 0.85, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Copper bar with elongated through-slot; pivots at joint1, rises ~63 deg up-right.", "geometryDescriptor": { "topologyIntent": "box limb", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "joint1Gear", "attachment": { "parentSocket": "joint1Gear.hinge", "localStart": [0, 0.66, 0], "localEnd": [0.48, 1.56, 0], "contactType": "embedded", "embedDepth": 0.05, "overlap": 0.05, "gapTolerance": 0.01 }, "dimensions": { "width": 1.1, "height": 0.14, "depth": 0.1, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.24, 1.09, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "limb", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "armLower", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "armSlot", "what": "elongated through-slot cutout", "evidence": "evidence/lamp/di/zone-r1c1.png" }, { "id": "strapScrews", "what": "small slotted screws on strap plates", "evidence": "evidence/lamp/di/zone-r0c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_armLower_6.add(mesh_armLower_6);
  meshes["armLower"] = mesh_armLower_6;
  node_armLower_6.updateWorldMatrix(true, false);
  mesh_armLower_6.quaternion.identity();
  mesh_armLower_6.position.copy(node_armLower_6.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["armLower"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["armLower"] ??= [];
  destructionGroups["armLower"].push(node_armLower_6);
  const attachment_pistonLower_7 = { "parentSocket": "armLower.side", "localStart": [0.08, 0.74, 0.09], "localEnd": [0.44, 1.42, 0.09], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 };
  const endpoint_pistonLower_7 = makeAttachmentEndpoint(attachment_pistonLower_7);
  const node_pistonLower_7 = new THREE2.Group();
  node_pistonLower_7.name = "Lower piston__pivot";
  node_pistonLower_7.scale.set(1, 1, 1);
  if (endpoint_pistonLower_7) {
    node_pistonLower_7.position.copy(endpoint_pistonLower_7.start);
    node_pistonLower_7.rotation.set(0, 0, 0);
  } else {
    node_pistonLower_7.position.set(0.28, 1.02, 0.09);
    node_pistonLower_7.rotation.set(0, 0, 0);
  }
  node_pistonLower_7.userData.sculptComponent = { "id": "pistonLower", "name": "Lower piston", "level": "meso", "role": "actuator", "importance": 0.8, "confidence": 0.85, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Brushed-steel piston: fat cylinder + thinner rod, parallel to lower arm bar.", "geometryDescriptor": { "topologyIntent": "cylinder actuator", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "armLower", "attachment": { "parentSocket": "armLower.side", "localStart": [0.08, 0.74, 0.09], "localEnd": [0.44, 1.42, 0.09], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.9, "height": 0.08, "depth": 0.08, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.28, 1.02, 0.09], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "actuator", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "pistonLower", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "brushedSteel", "materialLayers": ["brushedSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(201, 201, 205, 1.0)", "secondaryAlbedo": "rgba(150, 152, 158, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_pistonLower_7.userData.actionProfile = { "animationRole": "actuator", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "pistonLower", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["armLower"] ?? root).add(node_pistonLower_7);
  nodes["pistonLower"] = node_pistonLower_7;
  const mesh_pistonLower_7Geometry = buildPistonLower();
  const mesh_pistonLower_7 = new THREE2.Mesh(
    mesh_pistonLower_7Geometry,
    materialMap["brushedSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_pistonLower_7.name = "Lower piston";
  if (endpoint_pistonLower_7) {
    mesh_pistonLower_7.position.copy(endpoint_pistonLower_7.midpoint);
    mesh_pistonLower_7.quaternion.copy(endpoint_pistonLower_7.quaternion);
  }
  mesh_pistonLower_7.castShadow = options.castShadow ?? true;
  mesh_pistonLower_7.receiveShadow = options.receiveShadow ?? true;
  mesh_pistonLower_7.userData.sculptComponent = { "id": "pistonLower", "name": "Lower piston", "level": "meso", "role": "actuator", "importance": 0.8, "confidence": 0.85, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Brushed-steel piston: fat cylinder + thinner rod, parallel to lower arm bar.", "geometryDescriptor": { "topologyIntent": "cylinder actuator", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "armLower", "attachment": { "parentSocket": "armLower.side", "localStart": [0.08, 0.74, 0.09], "localEnd": [0.44, 1.42, 0.09], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.9, "height": 0.08, "depth": 0.08, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.28, 1.02, 0.09], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "actuator", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "pistonLower", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "brushedSteel", "materialLayers": ["brushedSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(201, 201, 205, 1.0)", "secondaryAlbedo": "rgba(150, 152, 158, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_pistonLower_7.add(mesh_pistonLower_7);
  meshes["pistonLower"] = mesh_pistonLower_7;
  node_pistonLower_7.updateWorldMatrix(true, false);
  mesh_pistonLower_7.quaternion.identity();
  mesh_pistonLower_7.position.copy(node_pistonLower_7.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["pistonLower"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["pistonLower"] ??= [];
  destructionGroups["pistonLower"].push(node_pistonLower_7);
  const attachment_joint2Gear_8 = { "parentSocket": "armLower.end", "localStart": [0.48, 1.56, -0.05], "localEnd": [0.48, 1.56, 0.05], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 };
  const endpoint_joint2Gear_8 = makeAttachmentEndpoint(attachment_joint2Gear_8);
  const node_joint2Gear_8 = new THREE2.Group();
  node_joint2Gear_8.name = "Gear joint 2 (elbow)__pivot";
  node_joint2Gear_8.scale.set(1, 1, 1);
  if (endpoint_joint2Gear_8) {
    node_joint2Gear_8.position.copy(endpoint_joint2Gear_8.start);
    node_joint2Gear_8.rotation.set(0, 0, 0);
  } else {
    node_joint2Gear_8.position.set(0.48, 1.56, 0);
    node_joint2Gear_8.rotation.set(0, 0, 0);
  }
  node_joint2Gear_8.userData.sculptComponent = { "id": "joint2Gear", "name": "Gear joint 2 (elbow)", "level": "meso", "role": "joint", "importance": 0.95, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Largest knurled gear + slotted hub at the elbow.", "geometryDescriptor": { "topologyIntent": "extrude joint", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "armLower", "attachment": { "parentSocket": "armLower.end", "localStart": [0.48, 1.56, -0.05], "localEnd": [0.48, 1.56, 0.05], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.38, "height": 0.38, "depth": 0.1, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.48, 1.56, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "joint", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "joint2Gear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "brushedSteel", "materialLayers": ["brushedSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(201, 201, 205, 1.0)", "secondaryAlbedo": "rgba(150, 152, 158, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_joint2Gear_8.userData.actionProfile = { "animationRole": "joint", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "joint2Gear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["armLower"] ?? root).add(node_joint2Gear_8);
  nodes["joint2Gear"] = node_joint2Gear_8;
  const mesh_joint2Gear_8Geometry = buildGear(0.19, 0.075, J2);
  const mesh_joint2Gear_8 = new THREE2.Mesh(
    mesh_joint2Gear_8Geometry,
    materialMap["brushedSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_joint2Gear_8.name = "Gear joint 2 (elbow)";
  if (endpoint_joint2Gear_8) {
    mesh_joint2Gear_8.position.copy(endpoint_joint2Gear_8.midpoint);
    mesh_joint2Gear_8.quaternion.copy(endpoint_joint2Gear_8.quaternion);
  }
  mesh_joint2Gear_8.castShadow = options.castShadow ?? true;
  mesh_joint2Gear_8.receiveShadow = options.receiveShadow ?? true;
  mesh_joint2Gear_8.userData.sculptComponent = { "id": "joint2Gear", "name": "Gear joint 2 (elbow)", "level": "meso", "role": "joint", "importance": 0.95, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Largest knurled gear + slotted hub at the elbow.", "geometryDescriptor": { "topologyIntent": "extrude joint", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "armLower", "attachment": { "parentSocket": "armLower.end", "localStart": [0.48, 1.56, -0.05], "localEnd": [0.48, 1.56, 0.05], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.38, "height": 0.38, "depth": 0.1, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.48, 1.56, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "joint", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "joint2Gear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "brushedSteel", "materialLayers": ["brushedSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(201, 201, 205, 1.0)", "secondaryAlbedo": "rgba(150, 152, 158, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_joint2Gear_8.add(mesh_joint2Gear_8);
  meshes["joint2Gear"] = mesh_joint2Gear_8;
  node_joint2Gear_8.updateWorldMatrix(true, false);
  mesh_joint2Gear_8.quaternion.identity();
  mesh_joint2Gear_8.position.copy(node_joint2Gear_8.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["joint2Gear"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["joint2Gear"] ??= [];
  destructionGroups["joint2Gear"].push(node_joint2Gear_8);
  const attachment_armUpper_9 = { "parentSocket": "joint2Gear.hinge", "localStart": [0.48, 1.56, 0], "localEnd": [0.05, 2.41, 0], "contactType": "embedded", "embedDepth": 0.05, "overlap": 0.05, "gapTolerance": 0.01 };
  const endpoint_armUpper_9 = makeAttachmentEndpoint(attachment_armUpper_9);
  const node_armUpper_9 = new THREE2.Group();
  node_armUpper_9.name = "Upper arm bar__pivot";
  node_armUpper_9.scale.set(1, 1, 1);
  if (endpoint_armUpper_9) {
    node_armUpper_9.position.copy(endpoint_armUpper_9.start);
    node_armUpper_9.rotation.set(0, 0, 0);
  } else {
    node_armUpper_9.position.set(0.26, 1.98, 0);
    node_armUpper_9.rotation.set(0, 0, 0);
  }
  node_armUpper_9.userData.sculptComponent = { "id": "armUpper", "name": "Upper arm bar", "level": "macro", "role": "limb", "importance": 1, "confidence": 0.85, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Copper bar + slot, pivots at elbow, rises ~117 deg up-left to the head joint.", "geometryDescriptor": { "topologyIntent": "box limb", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "joint2Gear", "attachment": { "parentSocket": "joint2Gear.hinge", "localStart": [0.48, 1.56, 0], "localEnd": [0.05, 2.41, 0], "contactType": "embedded", "embedDepth": 0.05, "overlap": 0.05, "gapTolerance": 0.01 }, "dimensions": { "width": 0.95, "height": 0.13, "depth": 0.1, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.26, 1.98, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "limb", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "armUpper", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "armSlotUpper", "what": "elongated through-slot", "evidence": "evidence/lamp/di/zone-r1c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_armUpper_9.userData.actionProfile = { "animationRole": "limb", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "armUpper", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["joint2Gear"] ?? root).add(node_armUpper_9);
  nodes["armUpper"] = node_armUpper_9;
  const mesh_armUpper_9Geometry = buildArmBar(J2, J3, 0.13);
  const mesh_armUpper_9 = new THREE2.Mesh(
    mesh_armUpper_9Geometry,
    materialMap["agedCopper"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_armUpper_9.name = "Upper arm bar";
  if (endpoint_armUpper_9) {
    mesh_armUpper_9.position.copy(endpoint_armUpper_9.midpoint);
    mesh_armUpper_9.quaternion.copy(endpoint_armUpper_9.quaternion);
  }
  mesh_armUpper_9.castShadow = options.castShadow ?? true;
  mesh_armUpper_9.receiveShadow = options.receiveShadow ?? true;
  mesh_armUpper_9.userData.sculptComponent = { "id": "armUpper", "name": "Upper arm bar", "level": "macro", "role": "limb", "importance": 1, "confidence": 0.85, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Copper bar + slot, pivots at elbow, rises ~117 deg up-left to the head joint.", "geometryDescriptor": { "topologyIntent": "box limb", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "joint2Gear", "attachment": { "parentSocket": "joint2Gear.hinge", "localStart": [0.48, 1.56, 0], "localEnd": [0.05, 2.41, 0], "contactType": "embedded", "embedDepth": 0.05, "overlap": 0.05, "gapTolerance": 0.01 }, "dimensions": { "width": 0.95, "height": 0.13, "depth": 0.1, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.26, 1.98, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "limb", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "armUpper", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "armSlotUpper", "what": "elongated through-slot", "evidence": "evidence/lamp/di/zone-r1c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_armUpper_9.add(mesh_armUpper_9);
  meshes["armUpper"] = mesh_armUpper_9;
  node_armUpper_9.updateWorldMatrix(true, false);
  mesh_armUpper_9.quaternion.identity();
  mesh_armUpper_9.position.copy(node_armUpper_9.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["armUpper"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["armUpper"] ??= [];
  destructionGroups["armUpper"].push(node_armUpper_9);
  const attachment_pistonUpper_10 = { "parentSocket": "armUpper.side", "localStart": [0.42, 1.62, -0.09], "localEnd": [0.12, 2.3, -0.09], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 };
  const endpoint_pistonUpper_10 = makeAttachmentEndpoint(attachment_pistonUpper_10);
  const node_pistonUpper_10 = new THREE2.Group();
  node_pistonUpper_10.name = "Upper piston__pivot";
  node_pistonUpper_10.scale.set(1, 1, 1);
  if (endpoint_pistonUpper_10) {
    node_pistonUpper_10.position.copy(endpoint_pistonUpper_10.start);
    node_pistonUpper_10.rotation.set(0, 0, 0);
  } else {
    node_pistonUpper_10.position.set(0.3, 1.94, -0.09);
    node_pistonUpper_10.rotation.set(0, 0, 0);
  }
  node_pistonUpper_10.userData.sculptComponent = { "id": "pistonUpper", "name": "Upper piston", "level": "meso", "role": "actuator", "importance": 0.8, "confidence": 0.85, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Steel piston pair beneath the upper arm bar.", "geometryDescriptor": { "topologyIntent": "cylinder actuator", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "armUpper", "attachment": { "parentSocket": "armUpper.side", "localStart": [0.42, 1.62, -0.09], "localEnd": [0.12, 2.3, -0.09], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.8, "height": 0.07, "depth": 0.07, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.3, 1.94, -0.09], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "actuator", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "pistonUpper", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "brushedSteel", "materialLayers": ["brushedSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(201, 201, 205, 1.0)", "secondaryAlbedo": "rgba(150, 152, 158, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_pistonUpper_10.userData.actionProfile = { "animationRole": "actuator", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "pistonUpper", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["armUpper"] ?? root).add(node_pistonUpper_10);
  nodes["pistonUpper"] = node_pistonUpper_10;
  const mesh_pistonUpper_10Geometry = buildPistonUpper();
  const mesh_pistonUpper_10 = new THREE2.Mesh(
    mesh_pistonUpper_10Geometry,
    materialMap["brushedSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_pistonUpper_10.name = "Upper piston";
  if (endpoint_pistonUpper_10) {
    mesh_pistonUpper_10.position.copy(endpoint_pistonUpper_10.midpoint);
    mesh_pistonUpper_10.quaternion.copy(endpoint_pistonUpper_10.quaternion);
  }
  mesh_pistonUpper_10.castShadow = options.castShadow ?? true;
  mesh_pistonUpper_10.receiveShadow = options.receiveShadow ?? true;
  mesh_pistonUpper_10.userData.sculptComponent = { "id": "pistonUpper", "name": "Upper piston", "level": "meso", "role": "actuator", "importance": 0.8, "confidence": 0.85, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Steel piston pair beneath the upper arm bar.", "geometryDescriptor": { "topologyIntent": "cylinder actuator", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "armUpper", "attachment": { "parentSocket": "armUpper.side", "localStart": [0.42, 1.62, -0.09], "localEnd": [0.12, 2.3, -0.09], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.8, "height": 0.07, "depth": 0.07, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.3, 1.94, -0.09], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "actuator", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "pistonUpper", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "brushedSteel", "materialLayers": ["brushedSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(201, 201, 205, 1.0)", "secondaryAlbedo": "rgba(150, 152, 158, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_pistonUpper_10.add(mesh_pistonUpper_10);
  meshes["pistonUpper"] = mesh_pistonUpper_10;
  node_pistonUpper_10.updateWorldMatrix(true, false);
  mesh_pistonUpper_10.quaternion.identity();
  mesh_pistonUpper_10.position.copy(node_pistonUpper_10.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["pistonUpper"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["pistonUpper"] ??= [];
  destructionGroups["pistonUpper"].push(node_pistonUpper_10);
  const attachment_joint3Gear_11 = { "parentSocket": "armUpper.end", "localStart": [0.05, 2.41, -0.045], "localEnd": [0.05, 2.41, 0.045], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 };
  const endpoint_joint3Gear_11 = makeAttachmentEndpoint(attachment_joint3Gear_11);
  const node_joint3Gear_11 = new THREE2.Group();
  node_joint3Gear_11.name = "Gear joint 3 (head)__pivot";
  node_joint3Gear_11.scale.set(1, 1, 1);
  if (endpoint_joint3Gear_11) {
    node_joint3Gear_11.position.copy(endpoint_joint3Gear_11.start);
    node_joint3Gear_11.rotation.set(0, 0, 0);
  } else {
    node_joint3Gear_11.position.set(0.05, 2.41, 0);
    node_joint3Gear_11.rotation.set(0, 0, 0);
  }
  node_joint3Gear_11.userData.sculptComponent = { "id": "joint3Gear", "name": "Gear joint 3 (head)", "level": "meso", "role": "joint", "importance": 0.9, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Smaller knurled gear + slotted hub at the head.", "geometryDescriptor": { "topologyIntent": "extrude joint", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "armUpper", "attachment": { "parentSocket": "armUpper.end", "localStart": [0.05, 2.41, -0.045], "localEnd": [0.05, 2.41, 0.045], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.26, "height": 0.26, "depth": 0.09, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.05, 2.41, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "joint", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "joint3Gear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "brushedSteel", "materialLayers": ["brushedSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(201, 201, 205, 1.0)", "secondaryAlbedo": "rgba(150, 152, 158, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_joint3Gear_11.userData.actionProfile = { "animationRole": "joint", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "joint3Gear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["armUpper"] ?? root).add(node_joint3Gear_11);
  nodes["joint3Gear"] = node_joint3Gear_11;
  const mesh_joint3Gear_11Geometry = buildGear(0.13, 0.065, J3);
  const mesh_joint3Gear_11 = new THREE2.Mesh(
    mesh_joint3Gear_11Geometry,
    materialMap["brushedSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_joint3Gear_11.name = "Gear joint 3 (head)";
  if (endpoint_joint3Gear_11) {
    mesh_joint3Gear_11.position.copy(endpoint_joint3Gear_11.midpoint);
    mesh_joint3Gear_11.quaternion.copy(endpoint_joint3Gear_11.quaternion);
  }
  mesh_joint3Gear_11.castShadow = options.castShadow ?? true;
  mesh_joint3Gear_11.receiveShadow = options.receiveShadow ?? true;
  mesh_joint3Gear_11.userData.sculptComponent = { "id": "joint3Gear", "name": "Gear joint 3 (head)", "level": "meso", "role": "joint", "importance": 0.9, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Smaller knurled gear + slotted hub at the head.", "geometryDescriptor": { "topologyIntent": "extrude joint", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "armUpper", "attachment": { "parentSocket": "armUpper.end", "localStart": [0.05, 2.41, -0.045], "localEnd": [0.05, 2.41, 0.045], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.26, "height": 0.26, "depth": 0.09, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.05, 2.41, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "joint", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "joint3Gear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "brushedSteel", "materialLayers": ["brushedSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(201, 201, 205, 1.0)", "secondaryAlbedo": "rgba(150, 152, 158, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_joint3Gear_11.add(mesh_joint3Gear_11);
  meshes["joint3Gear"] = mesh_joint3Gear_11;
  node_joint3Gear_11.updateWorldMatrix(true, false);
  mesh_joint3Gear_11.quaternion.identity();
  mesh_joint3Gear_11.position.copy(node_joint3Gear_11.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["joint3Gear"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["joint3Gear"] ??= [];
  destructionGroups["joint3Gear"].push(node_joint3Gear_11);
  const attachment_headCap_12 = { "parentSocket": "joint3Gear.hinge", "localStart": [0.05, 2.41, 0], "localEnd": [-0.32, 2.1, 0], "contactType": "embedded", "embedDepth": 0.05, "overlap": 0.05, "gapTolerance": 0.01 };
  const endpoint_headCap_12 = makeAttachmentEndpoint(attachment_headCap_12);
  const node_headCap_12 = new THREE2.Group();
  node_headCap_12.name = "Head cap drum__pivot";
  node_headCap_12.scale.set(1, 1, 1);
  if (endpoint_headCap_12) {
    node_headCap_12.position.copy(endpoint_headCap_12.start);
    node_headCap_12.rotation.set(0, 0, 0);
  } else {
    node_headCap_12.position.set(-0.18, 2.22, 0);
    node_headCap_12.rotation.set(0, 0, 0);
  }
  node_headCap_12.userData.sculptComponent = { "id": "headCap", "name": "Head cap drum", "level": "macro", "role": "head", "importance": 1, "confidence": 0.85, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Copper drum with 3 raised rim rings + top nipple (cable entry); axis aims down-left ~220 deg.", "geometryDescriptor": { "topologyIntent": "lathe head", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "joint3Gear", "attachment": { "parentSocket": "joint3Gear.hinge", "localStart": [0.05, 2.41, 0], "localEnd": [-0.32, 2.1, 0], "contactType": "embedded", "embedDepth": 0.05, "overlap": 0.05, "gapTolerance": 0.01 }, "dimensions": { "width": 0.4, "height": 0.42, "depth": 0.4, "units": "relative", "confidence": 0.85 }, "transform": { "position": [-0.18, 2.22, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "head", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "headCap", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "capRings", "what": "3 raised rings at drum rim", "evidence": "evidence/lamp/di/zone-r0c1.png" }, { "id": "cableNipple", "what": "small dark steel nipple on top where cable enters", "evidence": "evidence/lamp/di/zone-r0c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_headCap_12.userData.actionProfile = { "animationRole": "head", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "headCap", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["joint3Gear"] ?? root).add(node_headCap_12);
  nodes["headCap"] = node_headCap_12;
  const mesh_headCap_12Geometry = buildHeadCap();
  const mesh_headCap_12 = new THREE2.Mesh(
    mesh_headCap_12Geometry,
    materialMap["agedCopper"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_headCap_12.name = "Head cap drum";
  if (endpoint_headCap_12) {
    mesh_headCap_12.position.copy(endpoint_headCap_12.midpoint);
    mesh_headCap_12.quaternion.copy(endpoint_headCap_12.quaternion);
  }
  mesh_headCap_12.castShadow = options.castShadow ?? true;
  mesh_headCap_12.receiveShadow = options.receiveShadow ?? true;
  mesh_headCap_12.userData.sculptComponent = { "id": "headCap", "name": "Head cap drum", "level": "macro", "role": "head", "importance": 1, "confidence": 0.85, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Copper drum with 3 raised rim rings + top nipple (cable entry); axis aims down-left ~220 deg.", "geometryDescriptor": { "topologyIntent": "lathe head", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "joint3Gear", "attachment": { "parentSocket": "joint3Gear.hinge", "localStart": [0.05, 2.41, 0], "localEnd": [-0.32, 2.1, 0], "contactType": "embedded", "embedDepth": 0.05, "overlap": 0.05, "gapTolerance": 0.01 }, "dimensions": { "width": 0.4, "height": 0.42, "depth": 0.4, "units": "relative", "confidence": 0.85 }, "transform": { "position": [-0.18, 2.22, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "head", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "headCap", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "capRings", "what": "3 raised rings at drum rim", "evidence": "evidence/lamp/di/zone-r0c1.png" }, { "id": "cableNipple", "what": "small dark steel nipple on top where cable enters", "evidence": "evidence/lamp/di/zone-r0c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_headCap_12.add(mesh_headCap_12);
  meshes["headCap"] = mesh_headCap_12;
  node_headCap_12.updateWorldMatrix(true, false);
  mesh_headCap_12.quaternion.identity();
  mesh_headCap_12.position.copy(node_headCap_12.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["headCap"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["headCap"] ??= [];
  destructionGroups["headCap"].push(node_headCap_12);
  const attachment_cage_13 = { "parentSocket": "headCap.rim", "localStart": [-0.32, 2.1, 0], "localEnd": [-0.78, 1.72, 0], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 };
  const endpoint_cage_13 = makeAttachmentEndpoint(attachment_cage_13);
  const node_cage_13 = new THREE2.Group();
  node_cage_13.name = "Wire cage__pivot";
  node_cage_13.scale.set(1, 1, 1);
  if (endpoint_cage_13) {
    node_cage_13.position.copy(endpoint_cage_13.start);
    node_cage_13.rotation.set(0, 0, 0);
  } else {
    node_cage_13.position.set(-0.55, 1.92, 0);
    node_cage_13.rotation.set(0, 0, 0);
  }
  node_cage_13.userData.sculptComponent = { "id": "cage", "name": "Wire cage", "level": "meso", "role": "guard", "importance": 0.95, "confidence": 0.85, "primitive": "instanced-cluster", "topologyClass": "fiber-strand", "topologyRationale": "Wire cage of finite-radius tube strands (ribs + rings), not a zero-thickness shell.", "geometryDescriptor": { "topologyIntent": "instanced-cluster guard", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "headCap", "attachment": { "parentSocket": "headCap.rim", "localStart": [-0.32, 2.1, 0], "localEnd": [-0.78, 1.72, 0], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.42, "height": 0.6, "depth": 0.42, "units": "relative", "confidence": 0.85 }, "transform": { "position": [-0.55, 1.92, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "guard", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "cage", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "cageRibs", "what": "~10 ribs following bullet profile", "evidence": "evidence/lamp/di/zone-r0c0.png" }, { "id": "cageRings", "what": "3 circumferential rings", "evidence": "evidence/lamp/di/zone-r0c0.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_cage_13.userData.actionProfile = { "animationRole": "guard", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "cage", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["headCap"] ?? root).add(node_cage_13);
  nodes["cage"] = node_cage_13;
  const mesh_cage_13Geometry = buildCage();
  const mesh_cage_13 = new THREE2.Mesh(
    mesh_cage_13Geometry,
    materialMap["agedCopper"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_cage_13.name = "Wire cage";
  if (endpoint_cage_13) {
    mesh_cage_13.position.copy(endpoint_cage_13.midpoint);
    mesh_cage_13.quaternion.copy(endpoint_cage_13.quaternion);
  }
  mesh_cage_13.castShadow = options.castShadow ?? true;
  mesh_cage_13.receiveShadow = options.receiveShadow ?? true;
  mesh_cage_13.userData.sculptComponent = { "id": "cage", "name": "Wire cage", "level": "meso", "role": "guard", "importance": 0.95, "confidence": 0.85, "primitive": "instanced-cluster", "topologyClass": "fiber-strand", "topologyRationale": "Wire cage of finite-radius tube strands (ribs + rings), not a zero-thickness shell.", "geometryDescriptor": { "topologyIntent": "instanced-cluster guard", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "headCap", "attachment": { "parentSocket": "headCap.rim", "localStart": [-0.32, 2.1, 0], "localEnd": [-0.78, 1.72, 0], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 0.42, "height": 0.6, "depth": 0.42, "units": "relative", "confidence": 0.85 }, "transform": { "position": [-0.55, 1.92, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "guard", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "cage", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "agedCopper", "materialLayers": ["agedCopper"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "cageRibs", "what": "~10 ribs following bullet profile", "evidence": "evidence/lamp/di/zone-r0c0.png" }, { "id": "cageRings", "what": "3 circumferential rings", "evidence": "evidence/lamp/di/zone-r0c0.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(165, 87, 58, 1.0)", "secondaryAlbedo": "rgba(201, 136, 98, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_cage_13.add(mesh_cage_13);
  meshes["cage"] = mesh_cage_13;
  node_cage_13.updateWorldMatrix(true, false);
  mesh_cage_13.quaternion.identity();
  mesh_cage_13.position.copy(node_cage_13.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["cage"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["cage"] ??= [];
  destructionGroups["cage"].push(node_cage_13);
  const attachment_bulbTube_14 = { "parentSocket": "headCap.socket", "localStart": [-0.35, 2.08, 0], "localEnd": [-0.68, 1.8, 0], "contactType": "embedded", "embedDepth": 0.04, "overlap": 0.04, "gapTolerance": 0.01 };
  const endpoint_bulbTube_14 = makeAttachmentEndpoint(attachment_bulbTube_14);
  const node_bulbTube_14 = new THREE2.Group();
  node_bulbTube_14.name = "Glow tube bulb__pivot";
  node_bulbTube_14.scale.set(1, 1, 1);
  if (endpoint_bulbTube_14) {
    node_bulbTube_14.position.copy(endpoint_bulbTube_14.start);
    node_bulbTube_14.rotation.set(0, 0, 0);
  } else {
    node_bulbTube_14.position.set(-0.5, 1.96, 0);
    node_bulbTube_14.rotation.set(0, 0, 0);
  }
  node_bulbTube_14.userData.sculptComponent = { "id": "bulbTube", "name": "Glow tube bulb", "level": "meso", "role": "emitter", "importance": 0.95, "confidence": 0.85, "primitive": "capsule", "topologyClass": "continuous-sculpt", "topologyRationale": "Fat capsule tube along head axis, cyan emissive core + softer envelope; practical light.", "geometryDescriptor": { "topologyIntent": "capsule emitter", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "headCap", "attachment": { "parentSocket": "headCap.socket", "localStart": [-0.35, 2.08, 0], "localEnd": [-0.68, 1.8, 0], "contactType": "embedded", "embedDepth": 0.04, "overlap": 0.04, "gapTolerance": 0.01 }, "dimensions": { "width": 0.2, "height": 0.45, "depth": 0.2, "units": "relative", "confidence": 0.85 }, "transform": { "position": [-0.5, 1.96, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "emitter", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "bulbTube", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "glowTube", "materialLayers": ["glowTube"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(143, 232, 255, 1.0)", "secondaryAlbedo": "rgba(220, 250, 255, 1.0)", "materialClass": "glass", "materialClassConfidence": 0.85, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_bulbTube_14.userData.actionProfile = { "animationRole": "emitter", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "bulbTube", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["headCap"] ?? root).add(node_bulbTube_14);
  nodes["bulbTube"] = node_bulbTube_14;
  const mesh_bulbTube_14Geometry = buildBulbOuter();
  const mesh_bulbTube_14 = new THREE2.Mesh(
    mesh_bulbTube_14Geometry,
    materialMap["glowTube"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_bulbTube_14.name = "Glow tube bulb";
  if (endpoint_bulbTube_14) {
    mesh_bulbTube_14.position.copy(endpoint_bulbTube_14.midpoint);
    mesh_bulbTube_14.quaternion.copy(endpoint_bulbTube_14.quaternion);
  }
  mesh_bulbTube_14.castShadow = options.castShadow ?? true;
  mesh_bulbTube_14.receiveShadow = options.receiveShadow ?? true;
  mesh_bulbTube_14.userData.sculptComponent = { "id": "bulbTube", "name": "Glow tube bulb", "level": "meso", "role": "emitter", "importance": 0.95, "confidence": 0.85, "primitive": "capsule", "topologyClass": "continuous-sculpt", "topologyRationale": "Fat capsule tube along head axis, cyan emissive core + softer envelope; practical light.", "geometryDescriptor": { "topologyIntent": "capsule emitter", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "headCap", "attachment": { "parentSocket": "headCap.socket", "localStart": [-0.35, 2.08, 0], "localEnd": [-0.68, 1.8, 0], "contactType": "embedded", "embedDepth": 0.04, "overlap": 0.04, "gapTolerance": 0.01 }, "dimensions": { "width": 0.2, "height": 0.45, "depth": 0.2, "units": "relative", "confidence": 0.85 }, "transform": { "position": [-0.5, 1.96, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "emitter", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "bulbTube", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "glowTube", "materialLayers": ["glowTube"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(143, 232, 255, 1.0)", "secondaryAlbedo": "rgba(220, 250, 255, 1.0)", "materialClass": "glass", "materialClassConfidence": 0.85, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_bulbTube_14.add(mesh_bulbTube_14);
  meshes["bulbTube"] = mesh_bulbTube_14;
  {
    const outer = mesh_bulbTube_14.material;
    outer.transparent = true;
    outer.opacity = 0.4;
    outer.emissive = new THREE2.Color("#4fd8f8");
    outer.emissiveIntensity = 2.6;
    outer.color.set("#57c8e6");
    outer.roughness = 0.15;
    const coreMat = new THREE2.MeshBasicMaterial({ color: "#8fe8ff", toneMapped: false });
    node_bulbTube_14.updateWorldMatrix(true, false);
    const bulbCancel = node_bulbTube_14.getWorldPosition(new THREE2.Vector3()).negate();
    const core = new THREE2.Mesh(buildBulbInner(), coreMat);
    core.position.copy(bulbCancel);
    core.userData.explodeWithParent = true;
    node_bulbTube_14.add(core);
    meshes["bulbTube.core"] = core;
    const practical = new THREE2.PointLight("#8fe8ff", 9, 3.5, 2);
    practical.position.copy(bulbCenter().add(bulbCancel));
    node_bulbTube_14.add(practical);
  }
  node_bulbTube_14.updateWorldMatrix(true, false);
  mesh_bulbTube_14.quaternion.identity();
  mesh_bulbTube_14.position.copy(node_bulbTube_14.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["bulbTube"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["bulbTube"] ??= [];
  destructionGroups["bulbTube"].push(node_bulbTube_14);
  const attachment_cable_15 = { "parentSocket": "headCap.nipple", "localStart": [-0.08, 2.42, 0], "localEnd": [1.7, 0.02, 0.3], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 };
  const endpoint_cable_15 = makeAttachmentEndpoint(attachment_cable_15);
  const node_cable_15 = new THREE2.Group();
  node_cable_15.name = "Braided cable__pivot";
  node_cable_15.scale.set(1, 1, 1);
  if (endpoint_cable_15) {
    node_cable_15.position.copy(endpoint_cable_15.start);
    node_cable_15.rotation.set(0, 0, 0);
  } else {
    node_cable_15.position.set(0.7, 1.1, 0.1);
    node_cable_15.rotation.set(0, 0, 0);
  }
  node_cable_15.userData.sculptComponent = { "id": "cable", "name": "Braided cable", "level": "meso", "role": "cable", "importance": 0.8, "confidence": 0.85, "primitive": "tube", "topologyClass": "fiber-strand", "topologyRationale": "Tan braided cloth cable: exits head nipple, loops right, falls to floor, trails right.", "geometryDescriptor": { "topologyIntent": "tube cable", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "headCap", "attachment": { "parentSocket": "headCap.nipple", "localStart": [-0.08, 2.42, 0], "localEnd": [1.7, 0.02, 0.3], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 1.6, "height": 2.3, "depth": 0.4, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.7, 1.1, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "cable", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "cable", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "cableBraid", "materialLayers": ["cableBraid"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "braidRidges", "what": "braid ridge texture", "evidence": "evidence/lamp/di/zone-r0c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(176, 161, 132, 1.0)", "secondaryAlbedo": "rgba(140, 126, 100, 1.0)", "materialClass": "fabric", "materialClassConfidence": 0.8, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_cable_15.userData.actionProfile = { "animationRole": "cable", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "cable", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } };
  (nodes["headCap"] ?? root).add(node_cable_15);
  nodes["cable"] = node_cable_15;
  const mesh_cable_15Geometry = buildCable();
  const mesh_cable_15 = new THREE2.Mesh(
    mesh_cable_15Geometry,
    materialMap["cableBraid"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_cable_15.name = "Braided cable";
  if (endpoint_cable_15) {
    mesh_cable_15.position.copy(endpoint_cable_15.midpoint);
    mesh_cable_15.quaternion.copy(endpoint_cable_15.quaternion);
  }
  mesh_cable_15.castShadow = options.castShadow ?? true;
  mesh_cable_15.receiveShadow = options.receiveShadow ?? true;
  mesh_cable_15.userData.sculptComponent = { "id": "cable", "name": "Braided cable", "level": "meso", "role": "cable", "importance": 0.8, "confidence": 0.85, "primitive": "tube", "topologyClass": "fiber-strand", "topologyRationale": "Tan braided cloth cable: exits head nipple, loops right, falls to floor, trails right.", "geometryDescriptor": { "topologyIntent": "tube cable", "edgeTreatment": { "type": "rounded", "bevelRadius": 0.01, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "headCap", "attachment": { "parentSocket": "headCap.nipple", "localStart": [-0.08, 2.42, 0], "localEnd": [1.7, 0.02, 0.3], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 1.6, "height": 2.3, "depth": 0.4, "units": "relative", "confidence": 0.85 }, "transform": { "position": [0.7, 1.1, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "cable", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.85 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "cable", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "agedCopper" } }, "material": "cableBraid", "materialLayers": ["cableBraid"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "braidRidges", "what": "braid ridge texture", "evidence": "evidence/lamp/di/zone-r0c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.15, "bumpAmplitude": 0.01, "normalPattern": "metal wear", "displacementPattern": "", "occlusionPattern": "cavity patina", "edgeWearPattern": "worn-bright edges", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(176, 161, 132, 1.0)", "secondaryAlbedo": "rgba(140, 126, 100, 1.0)", "materialClass": "fabric", "materialClassConfidence": 0.8, "evidenceRefs": ["full-object", "evidence/lamp/di/zone-r1c1.png"] } };
  node_cable_15.add(mesh_cable_15);
  meshes["cable"] = mesh_cable_15;
  node_cable_15.updateWorldMatrix(true, false);
  mesh_cable_15.quaternion.identity();
  mesh_cable_15.position.copy(node_cable_15.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["cable"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["cable"] ??= [];
  destructionGroups["cable"].push(node_cable_15);
  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups };
  root.userData.lookDevTargets = { "qualityPriority": "reference-fidelity", "materialPass": { "albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": { "requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry" }, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"] }, "lightingPass": { "requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"] }, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."] };
  root.userData.actionReadiness = {
    note: "Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets."
  };
  return root;
}
export {
  createSteampunkDeskLampModel
};
