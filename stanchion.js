/* Brass stanchion pair with velvet rope, procedurally built.
   Bundled with esbuild from C:/side/objects/src/createStanchionRopeBarrierModel.ts
   (+ stanchionGeometry.ts), `three` external. Look-dev/composer exports
   tree-shaken; their dead three/examples imports stripped.
   Generated — rebuild from source, don't hand-edit. */
// src/createStanchionRopeBarrierModel.ts
import * as THREE2 from "three";

// src/stanchionGeometry.ts
import * as THREE from "three";
var NEAR = new THREE.Vector3(-0.38, 0, 0.85);
var FAR = new THREE.Vector3(0.66, 0, -1.05);
var RING_Y = 0.875;
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
function buildBase(at) {
  const pts = [];
  const prof = [
    [0, 0],
    [0.17, 0],
    [0.174, 6e-3],
    [0.174, 0.034],
    [0.166, 0.04],
    [0.12, 0.052],
    [0.07, 0.058],
    [0.052, 0.064],
    [0.048, 0.088],
    [0, 0.09]
  ];
  for (const [r, y] of prof) pts.push(new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 48);
  g.translate(at.x, 0, at.z);
  g.computeVertexNormals();
  return g;
}
function buildPole(at) {
  const geos = [];
  const pole = new THREE.CylinderGeometry(0.05, 0.05, 0.82, 32, 4);
  pole.translate(at.x, 0.08 + 0.41, at.z);
  geos.push(pole);
  const seam = new THREE.TorusGeometry(0.0455, 35e-4, 8, 32).rotateX(Math.PI / 2);
  seam.translate(at.x, 0.485, at.z);
  geos.push(seam);
  return merge(geos);
}
function buildCap(at) {
  const pts = [];
  const prof = [
    [0.046, 0],
    [0.05, 8e-3],
    [0.06, 0.045],
    [0.063, 0.07],
    [0.063, 0.085],
    [0.052, 0.098],
    [0.028, 0.104],
    [0, 0.106]
  ];
  for (const [r, y] of prof) pts.push(new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 40);
  g.translate(at.x, 0.9, at.z);
  g.computeVertexNormals();
  return g;
}
function buildCollarRing(at) {
  const g = new THREE.TorusGeometry(0.062, 9e-3, 10, 36);
  g.rotateX(Math.PI / 2.35);
  g.translate(at.x, RING_Y, at.z);
  return g;
}
function ropeSpine() {
  const a = new THREE.Vector3(NEAR.x + 0.075, RING_Y - 0.015, NEAR.z - 0.06);
  const b = new THREE.Vector3(FAR.x - 0.07, RING_Y - 0.015, FAR.z + 0.06);
  const pts = [];
  const sag = 0.27;
  for (let i = 0; i <= 16; i += 1) {
    const t = i / 16;
    const p = a.clone().lerp(b, t);
    const c = Math.cosh((t - 0.5) * 2.4) - 1;
    const cMax = Math.cosh(0.5 * 2.4) - 1;
    p.y -= sag * (1 - c / cMax);
    pts.push(p);
  }
  return new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
}
function buildRope() {
  const spine = ropeSpine();
  const geos = [];
  const STRANDS = 3, TURNS = 11, SPINE_R = 0.032, STRAND_R = 0.024;
  const SAMPLES = 220;
  for (let s = 0; s < STRANDS; s += 1) {
    const phase = s / STRANDS * Math.PI * 2;
    const pts = [];
    for (let i = 0; i <= SAMPLES; i += 1) {
      const t = i / SAMPLES;
      const p = spine.getPointAt(t);
      const tan = spine.getTangentAt(t);
      const up = new THREE.Vector3(0, 1, 0);
      const n = new THREE.Vector3().crossVectors(tan, up).normalize();
      const b2 = new THREE.Vector3().crossVectors(tan, n).normalize();
      const ang = phase + t * TURNS * Math.PI * 2;
      pts.push(p.clone().addScaledVector(n, SPINE_R * Math.cos(ang)).addScaledVector(b2, SPINE_R * Math.sin(ang)));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
    geos.push(new THREE.TubeGeometry(curve, 240, STRAND_R, 10, false));
  }
  return merge(geos);
}
function endCap(t) {
  const spine = ropeSpine();
  const p = spine.getPointAt(t);
  const tan = spine.getTangentAt(t);
  if (t < 0.5) tan.negate();
  const g = new THREE.CylinderGeometry(0.034, 0.05, 0.15, 20);
  const dome = new THREE.SphereGeometry(0.035, 16, 10);
  dome.translate(0, 0.075, 0);
  const merged = merge([g, dome]);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan.normalize());
  merged.applyQuaternion(q);
  merged.translate(p.x + tan.x * 0.06, p.y + tan.y * 0.06, p.z + tan.z * 0.06);
  return merged;
}
function buildEndCapNear() {
  return endCap(0);
}
function buildEndCapFar() {
  return endCap(1);
}
function hook(at, toward) {
  const g = new THREE.TorusGeometry(0.02, 6e-3, 8, 24);
  const dir = toward.clone().sub(at).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  g.applyQuaternion(q);
  g.translate(at.x, at.y, at.z);
  return g;
}
function buildHookNear() {
  const spine = ropeSpine();
  const p = spine.getPointAt(0).addScaledVector(spine.getTangentAt(0).negate(), 0.1);
  return hook(p, new THREE.Vector3(NEAR.x, RING_Y, NEAR.z));
}
function buildHookFar() {
  const spine = ropeSpine();
  const p = spine.getPointAt(1).addScaledVector(spine.getTangentAt(1), 0.1);
  return hook(p, new THREE.Vector3(FAR.x, RING_Y, FAR.z));
}

// src/createStanchionRopeBarrierModel.ts
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
function makeReferenceTextureSet(spec, options) {
  return null;
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
function createStanchionRopeBarrierModel(options = {}) {
  const root = new THREE2.Group();
  root.name = "Stanchion Rope Barrier";
  root.userData.reconstructionEvidence = { "itemFamily": null, "subtype": null, "componentAdapter": null, "route": null, "exactnessTier": null, "referenceCamera": { "solved": false, "fovDegrees": 35, "aspect": 1, "orientation": { "yaw": 15, "pitch": -4, "roll": 0 }, "positionHint": [0.6, 0.55, 3], "note": "Slightly below post-top height, 3/4; near post left-front, far post right-back." }, "approximationNotes": [] };
  root.userData.materialPipeline = {};
  root.userData.materialReferenceRegistry = null;
  const materialMap = {};
  materialMap["brassMetal"] = createSculptMaterial(
    "brassMetal",
    { "id": "brassMetal", "name": "Aged brass", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#a8853e", "color": "#a8853e", "albedo": { "dominant": "#a8853e", "secondary": ["#c8a45c", "#7c6128", "#8f7434"], "samplingNotes": "sampled from reference" }, "colorVariation": { "palette": ["#a8853e", "#c8a45c", "#7c6128", "#8f7434"], "pattern": "patina-mottle", "amplitude": 0.14, "heightCorrelation": 0.4 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.25, "role": "patina tone variation" }, { "id": "meso", "frequency": 16, "amplitude": 0.12, "role": "patina smudges + panel lines" }, { "id": "micro", "frequency": 64, "amplitude": 0.06, "role": "micro roughness breakup" }], "roughness": { "base": 0.32, "variation": 0.12, "map": "independent-procedural-field", "localResponse": "patina duller, polished bands brighter" }, "metalness": { "base": 1, "variation": 0 }, "normal": { "pattern": "patina + machining (independent)", "strength": 0.18, "scale": 18, "space": "tangent" }, "bump": { "pattern": "panel-lines", "amplitude": 6e-3, "scale": 22 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.45, "contactShadowBias": 0.35, "notes": "base crevices" }, "wear": { "edgeWear": 0.25, "scratches": [], "chips": [] }, "dirt": { "amount": 0.12, "cavityBias": 0.6, "color": "#4a3a20" }, "localOverrides": [], "shaderNotes": ["Aged brass with patina smudges; env reflections essential.", "Agent-vision metalness/roughness correction after analyze_texture."], "notes": "Aged brass with patina smudges; env reflections essential.", "finishClass": "candy-coat", "texturePalette": ["#B5B3AD", "#54462A", "#61502F", "#CFBD8E", "#B3B0A7"], "proceduralTexture": "gradient-smoke", "clearcoat": { "base": 0.6, "variation": 0 }, "clearcoatRoughness": { "base": 0.15, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 0.7, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\stanchion\\mat\\crop-brassMetal.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/stanchion/pbr/brassMetal/brassmetal_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/stanchion/pbr/brassMetal/brassmetal_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/stanchion/pbr/brassMetal/brassmetal_height.png", "channel": "height" }, "normal": { "path": "evidence/stanchion/pbr/brassMetal/brassmetal_normal.png", "channel": "normal" }, "ao": { "path": "evidence/stanchion/pbr/brassMetal/brassmetal_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["chromeSteel"] = createSculptMaterial(
    "chromeSteel",
    { "id": "chromeSteel", "name": "Chrome", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#d8dade", "color": "#d8dade", "albedo": { "dominant": "#d8dade", "secondary": ["#a0a4aa", "#f0f2f5"], "samplingNotes": "sampled from reference" }, "colorVariation": { "palette": ["#d8dade", "#a0a4aa", "#f0f2f5"], "pattern": "patina-mottle", "amplitude": 0.14, "heightCorrelation": 0.4 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.25, "role": "patina tone variation" }, { "id": "meso", "frequency": 16, "amplitude": 0.12, "role": "polish streaks" }, { "id": "micro", "frequency": 64, "amplitude": 0.06, "role": "micro roughness breakup" }], "roughness": { "base": 0.12, "variation": 0.12, "map": "independent-procedural-field", "localResponse": "patina duller, polished bands brighter" }, "metalness": { "base": 1, "variation": 0 }, "normal": { "pattern": "patina + machining (independent)", "strength": 0.18, "scale": 18, "space": "tangent" }, "bump": { "pattern": "panel-lines", "amplitude": 6e-3, "scale": 22 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.45, "contactShadowBias": 0.35, "notes": "base crevices" }, "wear": { "edgeWear": 0.25, "scratches": [], "chips": [] }, "dirt": { "amount": 0.12, "cavityBias": 0.6, "color": "#4a3a20" }, "localOverrides": [], "shaderNotes": ["Polished chrome hardware.", "Agent-vision metalness/roughness correction after analyze_texture."], "notes": "Polished chrome hardware.", "finishClass": "brushed-steel", "texturePalette": ["#C4C4C3", "#766F60", "#7B7975", "#B5AFAF", "#B7A4A7"], "proceduralTexture": "brushed", "clearcoat": { "base": 0, "variation": 0 }, "clearcoatRoughness": { "base": 0, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 1, "anisotropy": { "base": 1 }, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\stanchion\\mat\\crop-chromeSteel.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/stanchion/pbr/chromeSteel/chromesteel_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/stanchion/pbr/chromeSteel/chromesteel_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/stanchion/pbr/chromeSteel/chromesteel_height.png", "channel": "height" }, "normal": { "path": "evidence/stanchion/pbr/chromeSteel/chromesteel_normal.png", "channel": "normal" }, "ao": { "path": "evidence/stanchion/pbr/chromeSteel/chromesteel_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["velvetRope"] = createSculptMaterial(
    "velvetRope",
    { "id": "velvetRope", "name": "Red velvet rope", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#8e1622", "color": "#8e1622", "albedo": { "dominant": "#8e1622", "secondary": ["#600c16", "#b02836"], "samplingNotes": "sampled from reference" }, "colorVariation": { "palette": ["#8e1622", "#600c16", "#b02836"], "pattern": "patina-mottle", "amplitude": 0.14, "heightCorrelation": 0.4 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.25, "role": "patina tone variation" }, { "id": "meso", "frequency": 16, "amplitude": 0.12, "role": "fiber nap variation" }, { "id": "micro", "frequency": 64, "amplitude": 0.06, "role": "micro roughness breakup" }], "roughness": { "base": 0.75, "variation": 0.12, "map": "independent-procedural-field", "localResponse": "patina duller, polished bands brighter" }, "metalness": { "base": 0, "variation": 0 }, "normal": { "pattern": "patina + machining (independent)", "strength": 0.18, "scale": 18, "space": "tangent" }, "bump": { "pattern": "panel-lines", "amplitude": 6e-3, "scale": 22 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.45, "contactShadowBias": 0.35, "notes": "base crevices" }, "wear": { "edgeWear": 0.25, "scratches": [], "chips": [] }, "dirt": { "amount": 0.12, "cavityBias": 0.6, "color": "#4a3a20" }, "localOverrides": [], "shaderNotes": ["Deep red velvet: sheen 1.0, sheenColor #c04050, sheenRoughness 0.5; twisted strand geometry carries the form.", "Agent-vision metalness/roughness correction after analyze_texture."], "notes": "Deep red velvet: sheen 1.0, sheenColor #c04050, sheenRoughness 0.5; twisted strand geometry carries the form.", "sheen": { "value": 1, "color": "#c04050", "roughness": 0.5 }, "finishClass": "painted-metal", "texturePalette": ["#958888", "#835F62", "#967276", "#B7979C", "#C1B6B7"], "proceduralTexture": "flat-clearcoat", "clearcoat": { "base": 1, "variation": 0 }, "clearcoatRoughness": { "base": 0.05, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 1, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\stanchion\\mat\\crop-velvetRope.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/stanchion/pbr/velvetRope/velvetrope_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/stanchion/pbr/velvetRope/velvetrope_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/stanchion/pbr/velvetRope/velvetrope_height.png", "channel": "height" }, "normal": { "path": "evidence/stanchion/pbr/velvetRope/velvetrope_normal.png", "channel": "normal" }, "ao": { "path": "evidence/stanchion/pbr/velvetRope/velvetrope_ao.png", "channel": "ao" } } } },
    options
  );
  {
    const bm = materialMap["brassMetal"];
    bm.map = null;
    bm.roughnessMap = null;
    bm.aoMap = null;
    bm.color.set("#96763a");
    bm.roughness = 0.3;
    bm.metalness = 1;
    bm.envMapIntensity = 0.75;
    bm.needsUpdate = true;
    const cm = materialMap["chromeSteel"];
    cm.map = null;
    cm.roughnessMap = null;
    cm.color.set("#c8ccd2");
    cm.roughness = 0.16;
    cm.metalness = 1;
    cm.envMapIntensity = 0.7;
    cm.needsUpdate = true;
  }
  const nodes = { root };
  const meshes = {};
  const sockets = {};
  const colliders = {};
  const destructionGroups = {};
  const attachment_root_0 = null;
  const endpoint_root_0 = makeAttachmentEndpoint(attachment_root_0);
  const node_root_0 = new THREE2.Group();
  node_root_0.name = "Stanchion Rope Barrier__pivot";
  node_root_0.scale.set(1, 1, 1);
  if (endpoint_root_0) {
    node_root_0.position.copy(endpoint_root_0.start);
    node_root_0.rotation.set(0, 0, 0);
  } else {
    node_root_0.position.set(0, 0, 0);
    node_root_0.rotation.set(0, 0, 0);
  }
  node_root_0.userData.sculptComponent = { "id": "root", "name": "Stanchion Rope Barrier", "level": "macro", "role": "body", "importance": 1, "confidence": 0.5, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Group pivot; geometry in children.", "geometryDescriptor": { "topologyIntent": "container", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": null, "attachment": null, "dimensions": { "width": 2.2, "height": 1.1, "depth": 1.6, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0, "microRoughness": 0, "bumpAmplitude": 0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_root_0.userData.actionProfile = { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } };
  (nodes["root"] ?? root).add(node_root_0);
  nodes["root"] = node_root_0;
  const mesh_root_0Geometry = endpoint_root_0 ? new THREE2.CylinderGeometry(endpoint_root_0.endRadius, endpoint_root_0.baseRadius, endpoint_root_0.length, 32, 12) : new THREE2.CylinderGeometry(0.5, 0.5, 1, 48, 16);
  if (!endpoint_root_0) {
    mesh_root_0Geometry.scale(1, 1, 1);
  }
  const mesh_root_0 = new THREE2.Mesh(
    mesh_root_0Geometry,
    materialMap["brassMetal"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_root_0.name = "Stanchion Rope Barrier";
  if (endpoint_root_0) {
    mesh_root_0.position.copy(endpoint_root_0.midpoint);
    mesh_root_0.quaternion.copy(endpoint_root_0.quaternion);
  }
  mesh_root_0.castShadow = options.castShadow ?? true;
  mesh_root_0.receiveShadow = options.receiveShadow ?? true;
  mesh_root_0.userData.sculptComponent = { "id": "root", "name": "Stanchion Rope Barrier", "level": "macro", "role": "body", "importance": 1, "confidence": 0.5, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Group pivot; geometry in children.", "geometryDescriptor": { "topologyIntent": "container", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": null, "attachment": null, "dimensions": { "width": 2.2, "height": 1.1, "depth": 1.6, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0, "microRoughness": 0, "bumpAmplitude": 0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  mesh_root_0.visible = false;
  node_root_0.add(mesh_root_0);
  meshes["root"] = mesh_root_0;
  colliders["root"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." };
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_root_0);
  const attachment_postNearBase_1 = null;
  const endpoint_postNearBase_1 = makeAttachmentEndpoint(attachment_postNearBase_1);
  const node_postNearBase_1 = new THREE2.Group();
  node_postNearBase_1.name = "Near post base__pivot";
  node_postNearBase_1.scale.set(1, 1, 1);
  if (endpoint_postNearBase_1) {
    node_postNearBase_1.position.copy(endpoint_postNearBase_1.start);
    node_postNearBase_1.rotation.set(0, 0, 0);
  } else {
    node_postNearBase_1.position.set(-0.35, 0.03, 0.45);
    node_postNearBase_1.rotation.set(0, 0, 0);
  }
  node_postNearBase_1.userData.sculptComponent = { "id": "postNearBase", "name": "Near post base", "level": "macro", "role": "base", "importance": 0.95, "confidence": 0.92, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Domed disc + rim band + collar; radial panel lines as bump.", "geometryDescriptor": { "topologyIntent": "lathe base", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": null, "dimensions": { "width": 0.34, "height": 0.06, "depth": 0.34, "units": "relative", "confidence": 0.92 }, "transform": { "position": [-0.35, 0.03, 0.45], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "base", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postNearBase", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "radialPanels", "what": "pie-segment panel lines + rim facets", "evidence": "evidence/stanchion/di/zone-r2c0.png" }], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_postNearBase_1.userData.actionProfile = { "animationRole": "base", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postNearBase", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["root"] ?? root).add(node_postNearBase_1);
  nodes["postNearBase"] = node_postNearBase_1;
  const mesh_postNearBase_1Geometry = buildBase(NEAR);
  const mesh_postNearBase_1 = new THREE2.Mesh(
    mesh_postNearBase_1Geometry,
    materialMap["brassMetal"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_postNearBase_1.name = "Near post base";
  if (endpoint_postNearBase_1) {
    mesh_postNearBase_1.position.copy(endpoint_postNearBase_1.midpoint);
    mesh_postNearBase_1.quaternion.copy(endpoint_postNearBase_1.quaternion);
  }
  mesh_postNearBase_1.castShadow = options.castShadow ?? true;
  mesh_postNearBase_1.receiveShadow = options.receiveShadow ?? true;
  mesh_postNearBase_1.userData.sculptComponent = { "id": "postNearBase", "name": "Near post base", "level": "macro", "role": "base", "importance": 0.95, "confidence": 0.92, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Domed disc + rim band + collar; radial panel lines as bump.", "geometryDescriptor": { "topologyIntent": "lathe base", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": null, "dimensions": { "width": 0.34, "height": 0.06, "depth": 0.34, "units": "relative", "confidence": 0.92 }, "transform": { "position": [-0.35, 0.03, 0.45], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "base", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postNearBase", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "radialPanels", "what": "pie-segment panel lines + rim facets", "evidence": "evidence/stanchion/di/zone-r2c0.png" }], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_postNearBase_1.add(mesh_postNearBase_1);
  meshes["postNearBase"] = mesh_postNearBase_1;
  node_postNearBase_1.updateWorldMatrix(true, false);
  mesh_postNearBase_1.quaternion.identity();
  mesh_postNearBase_1.position.copy(node_postNearBase_1.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["postNearBase"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["postNearBase"] ??= [];
  destructionGroups["postNearBase"].push(node_postNearBase_1);
  const attachment_postNearPole_2 = { "parentSocket": "postNearBase.collar", "localStart": [-0.35, 0.05, 0.45], "localEnd": [-0.35, 0.9, 0.45], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 };
  const endpoint_postNearPole_2 = makeAttachmentEndpoint(attachment_postNearPole_2);
  const node_postNearPole_2 = new THREE2.Group();
  node_postNearPole_2.name = "Near post pole__pivot";
  node_postNearPole_2.scale.set(1, 1, 1);
  if (endpoint_postNearPole_2) {
    node_postNearPole_2.position.copy(endpoint_postNearPole_2.start);
    node_postNearPole_2.rotation.set(0, 0, 0);
  } else {
    node_postNearPole_2.position.set(-0.35, 0.48, 0.45);
    node_postNearPole_2.rotation.set(0, 0, 0);
  }
  node_postNearPole_2.userData.sculptComponent = { "id": "postNearPole", "name": "Near post pole", "level": "macro", "role": "column", "importance": 1, "confidence": 0.92, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Plain cylinder pole + seam torus; assembled revolved solids.", "geometryDescriptor": { "topologyIntent": "cylinder column", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "postNearBase", "attachment": { "parentSocket": "postNearBase.collar", "localStart": [-0.35, 0.05, 0.45], "localEnd": [-0.35, 0.9, 0.45], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.09, "height": 0.85, "depth": 0.09, "units": "relative", "confidence": 0.92 }, "transform": { "position": [-0.35, 0.48, 0.45], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "column", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postNearPole", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "poleSeam", "what": "seam ring at mid height", "evidence": "evidence/stanchion/di/zone-r1c0.png" }], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_postNearPole_2.userData.actionProfile = { "animationRole": "column", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postNearPole", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["postNearBase"] ?? root).add(node_postNearPole_2);
  nodes["postNearPole"] = node_postNearPole_2;
  const mesh_postNearPole_2Geometry = buildPole(NEAR);
  const mesh_postNearPole_2 = new THREE2.Mesh(
    mesh_postNearPole_2Geometry,
    materialMap["brassMetal"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_postNearPole_2.name = "Near post pole";
  if (endpoint_postNearPole_2) {
    mesh_postNearPole_2.position.copy(endpoint_postNearPole_2.midpoint);
    mesh_postNearPole_2.quaternion.copy(endpoint_postNearPole_2.quaternion);
  }
  mesh_postNearPole_2.castShadow = options.castShadow ?? true;
  mesh_postNearPole_2.receiveShadow = options.receiveShadow ?? true;
  mesh_postNearPole_2.userData.sculptComponent = { "id": "postNearPole", "name": "Near post pole", "level": "macro", "role": "column", "importance": 1, "confidence": 0.92, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Plain cylinder pole + seam torus; assembled revolved solids.", "geometryDescriptor": { "topologyIntent": "cylinder column", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "postNearBase", "attachment": { "parentSocket": "postNearBase.collar", "localStart": [-0.35, 0.05, 0.45], "localEnd": [-0.35, 0.9, 0.45], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.09, "height": 0.85, "depth": 0.09, "units": "relative", "confidence": 0.92 }, "transform": { "position": [-0.35, 0.48, 0.45], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "column", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postNearPole", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "poleSeam", "what": "seam ring at mid height", "evidence": "evidence/stanchion/di/zone-r1c0.png" }], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_postNearPole_2.add(mesh_postNearPole_2);
  meshes["postNearPole"] = mesh_postNearPole_2;
  node_postNearPole_2.updateWorldMatrix(true, false);
  mesh_postNearPole_2.quaternion.identity();
  mesh_postNearPole_2.position.copy(node_postNearPole_2.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["postNearPole"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["postNearPole"] ??= [];
  destructionGroups["postNearPole"].push(node_postNearPole_2);
  const attachment_postNearCap_3 = { "parentSocket": "postNearPole.top", "localStart": [-0.35, 0.9, 0.45], "localEnd": [-0.35, 1.01, 0.45], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 };
  const endpoint_postNearCap_3 = makeAttachmentEndpoint(attachment_postNearCap_3);
  const node_postNearCap_3 = new THREE2.Group();
  node_postNearCap_3.name = "Near post crown cap__pivot";
  node_postNearCap_3.scale.set(1, 1, 1);
  if (endpoint_postNearCap_3) {
    node_postNearCap_3.position.copy(endpoint_postNearCap_3.start);
    node_postNearCap_3.rotation.set(0, 0, 0);
  } else {
    node_postNearCap_3.position.set(-0.35, 0.95, 0.45);
    node_postNearCap_3.rotation.set(0, 0, 0);
  }
  node_postNearCap_3.userData.sculptComponent = { "id": "postNearCap", "name": "Near post crown cap", "level": "meso", "role": "cap", "importance": 0.85, "confidence": 0.92, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Flared cone frustum widening upward + rounded top disc.", "geometryDescriptor": { "topologyIntent": "lathe cap", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "postNearPole", "attachment": { "parentSocket": "postNearPole.top", "localStart": [-0.35, 0.9, 0.45], "localEnd": [-0.35, 1.01, 0.45], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.12, "height": 0.12, "depth": 0.12, "units": "relative", "confidence": 0.92 }, "transform": { "position": [-0.35, 0.95, 0.45], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "cap", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postNearCap", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_postNearCap_3.userData.actionProfile = { "animationRole": "cap", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postNearCap", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["postNearPole"] ?? root).add(node_postNearCap_3);
  nodes["postNearCap"] = node_postNearCap_3;
  const mesh_postNearCap_3Geometry = buildCap(NEAR);
  const mesh_postNearCap_3 = new THREE2.Mesh(
    mesh_postNearCap_3Geometry,
    materialMap["brassMetal"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_postNearCap_3.name = "Near post crown cap";
  if (endpoint_postNearCap_3) {
    mesh_postNearCap_3.position.copy(endpoint_postNearCap_3.midpoint);
    mesh_postNearCap_3.quaternion.copy(endpoint_postNearCap_3.quaternion);
  }
  mesh_postNearCap_3.castShadow = options.castShadow ?? true;
  mesh_postNearCap_3.receiveShadow = options.receiveShadow ?? true;
  mesh_postNearCap_3.userData.sculptComponent = { "id": "postNearCap", "name": "Near post crown cap", "level": "meso", "role": "cap", "importance": 0.85, "confidence": 0.92, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Flared cone frustum widening upward + rounded top disc.", "geometryDescriptor": { "topologyIntent": "lathe cap", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "postNearPole", "attachment": { "parentSocket": "postNearPole.top", "localStart": [-0.35, 0.9, 0.45], "localEnd": [-0.35, 1.01, 0.45], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.12, "height": 0.12, "depth": 0.12, "units": "relative", "confidence": 0.92 }, "transform": { "position": [-0.35, 0.95, 0.45], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "cap", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postNearCap", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_postNearCap_3.add(mesh_postNearCap_3);
  meshes["postNearCap"] = mesh_postNearCap_3;
  node_postNearCap_3.updateWorldMatrix(true, false);
  mesh_postNearCap_3.quaternion.identity();
  mesh_postNearCap_3.position.copy(node_postNearCap_3.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["postNearCap"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["postNearCap"] ??= [];
  destructionGroups["postNearCap"].push(node_postNearCap_3);
  const attachment_postNearRing_4 = { "parentSocket": "postNearPole.neck", "localStart": [-0.35, 0.86, 0.45], "localEnd": [-0.35, 0.89, 0.45], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 };
  const endpoint_postNearRing_4 = makeAttachmentEndpoint(attachment_postNearRing_4);
  const node_postNearRing_4 = new THREE2.Group();
  node_postNearRing_4.name = "Near post collar ring__pivot";
  node_postNearRing_4.scale.set(1, 1, 1);
  if (endpoint_postNearRing_4) {
    node_postNearRing_4.position.copy(endpoint_postNearRing_4.start);
    node_postNearRing_4.rotation.set(0, 0, 0);
  } else {
    node_postNearRing_4.position.set(-0.35, 0.875, 0.45);
    node_postNearRing_4.rotation.set(0, 0, 0);
  }
  node_postNearRing_4.userData.sculptComponent = { "id": "postNearRing", "name": "Near post collar ring", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.92, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Free chrome torus around pole under the cap.", "geometryDescriptor": { "topologyIntent": "torus hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "postNearPole", "attachment": { "parentSocket": "postNearPole.neck", "localStart": [-0.35, 0.86, 0.45], "localEnd": [-0.35, 0.89, 0.45], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.14, "height": 0.02, "depth": 0.14, "units": "relative", "confidence": 0.92 }, "transform": { "position": [-0.35, 0.875, 0.45], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postNearRing", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "chromeSteel", "materialLayers": ["chromeSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(216, 218, 222, 1.0)", "secondaryAlbedo": "rgba(160, 164, 170, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r0c0.png"] } };
  node_postNearRing_4.userData.actionProfile = { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postNearRing", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["postNearPole"] ?? root).add(node_postNearRing_4);
  nodes["postNearRing"] = node_postNearRing_4;
  const mesh_postNearRing_4Geometry = buildCollarRing(NEAR);
  const mesh_postNearRing_4 = new THREE2.Mesh(
    mesh_postNearRing_4Geometry,
    materialMap["chromeSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_postNearRing_4.name = "Near post collar ring";
  if (endpoint_postNearRing_4) {
    mesh_postNearRing_4.position.copy(endpoint_postNearRing_4.midpoint);
    mesh_postNearRing_4.quaternion.copy(endpoint_postNearRing_4.quaternion);
  }
  mesh_postNearRing_4.castShadow = options.castShadow ?? true;
  mesh_postNearRing_4.receiveShadow = options.receiveShadow ?? true;
  mesh_postNearRing_4.userData.sculptComponent = { "id": "postNearRing", "name": "Near post collar ring", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.92, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Free chrome torus around pole under the cap.", "geometryDescriptor": { "topologyIntent": "torus hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "postNearPole", "attachment": { "parentSocket": "postNearPole.neck", "localStart": [-0.35, 0.86, 0.45], "localEnd": [-0.35, 0.89, 0.45], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.14, "height": 0.02, "depth": 0.14, "units": "relative", "confidence": 0.92 }, "transform": { "position": [-0.35, 0.875, 0.45], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postNearRing", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "chromeSteel", "materialLayers": ["chromeSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(216, 218, 222, 1.0)", "secondaryAlbedo": "rgba(160, 164, 170, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r0c0.png"] } };
  node_postNearRing_4.add(mesh_postNearRing_4);
  meshes["postNearRing"] = mesh_postNearRing_4;
  node_postNearRing_4.updateWorldMatrix(true, false);
  mesh_postNearRing_4.quaternion.identity();
  mesh_postNearRing_4.position.copy(node_postNearRing_4.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["postNearRing"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["postNearRing"] ??= [];
  destructionGroups["postNearRing"].push(node_postNearRing_4);
  const attachment_postFarBase_5 = null;
  const endpoint_postFarBase_5 = makeAttachmentEndpoint(attachment_postFarBase_5);
  const node_postFarBase_5 = new THREE2.Group();
  node_postFarBase_5.name = "Far post base__pivot";
  node_postFarBase_5.scale.set(1, 1, 1);
  if (endpoint_postFarBase_5) {
    node_postFarBase_5.position.copy(endpoint_postFarBase_5.start);
    node_postFarBase_5.rotation.set(0, 0, 0);
  } else {
    node_postFarBase_5.position.set(0.62, 0.03, -0.55);
    node_postFarBase_5.rotation.set(0, 0, 0);
  }
  node_postFarBase_5.userData.sculptComponent = { "id": "postFarBase", "name": "Far post base", "level": "macro", "role": "base", "importance": 0.95, "confidence": 0.75, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Domed disc + rim band + collar; radial panel lines as bump.", "geometryDescriptor": { "topologyIntent": "lathe base", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": null, "dimensions": { "width": 0.34, "height": 0.06, "depth": 0.34, "units": "relative", "confidence": 0.75 }, "transform": { "position": [0.62, 0.03, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "base", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postFarBase", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "radialPanels", "what": "pie-segment panel lines + rim facets", "evidence": "evidence/stanchion/di/zone-r2c0.png" }], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_postFarBase_5.userData.actionProfile = { "animationRole": "base", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postFarBase", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["root"] ?? root).add(node_postFarBase_5);
  nodes["postFarBase"] = node_postFarBase_5;
  const mesh_postFarBase_5Geometry = buildBase(FAR);
  const mesh_postFarBase_5 = new THREE2.Mesh(
    mesh_postFarBase_5Geometry,
    materialMap["brassMetal"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_postFarBase_5.name = "Far post base";
  if (endpoint_postFarBase_5) {
    mesh_postFarBase_5.position.copy(endpoint_postFarBase_5.midpoint);
    mesh_postFarBase_5.quaternion.copy(endpoint_postFarBase_5.quaternion);
  }
  mesh_postFarBase_5.castShadow = options.castShadow ?? true;
  mesh_postFarBase_5.receiveShadow = options.receiveShadow ?? true;
  mesh_postFarBase_5.userData.sculptComponent = { "id": "postFarBase", "name": "Far post base", "level": "macro", "role": "base", "importance": 0.95, "confidence": 0.75, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Domed disc + rim band + collar; radial panel lines as bump.", "geometryDescriptor": { "topologyIntent": "lathe base", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": null, "dimensions": { "width": 0.34, "height": 0.06, "depth": 0.34, "units": "relative", "confidence": 0.75 }, "transform": { "position": [0.62, 0.03, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "base", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postFarBase", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "radialPanels", "what": "pie-segment panel lines + rim facets", "evidence": "evidence/stanchion/di/zone-r2c0.png" }], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_postFarBase_5.add(mesh_postFarBase_5);
  meshes["postFarBase"] = mesh_postFarBase_5;
  node_postFarBase_5.updateWorldMatrix(true, false);
  mesh_postFarBase_5.quaternion.identity();
  mesh_postFarBase_5.position.copy(node_postFarBase_5.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["postFarBase"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["postFarBase"] ??= [];
  destructionGroups["postFarBase"].push(node_postFarBase_5);
  const attachment_postFarPole_6 = { "parentSocket": "postFarBase.collar", "localStart": [0.62, 0.05, -0.55], "localEnd": [0.62, 0.9, -0.55], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 };
  const endpoint_postFarPole_6 = makeAttachmentEndpoint(attachment_postFarPole_6);
  const node_postFarPole_6 = new THREE2.Group();
  node_postFarPole_6.name = "Far post pole__pivot";
  node_postFarPole_6.scale.set(1, 1, 1);
  if (endpoint_postFarPole_6) {
    node_postFarPole_6.position.copy(endpoint_postFarPole_6.start);
    node_postFarPole_6.rotation.set(0, 0, 0);
  } else {
    node_postFarPole_6.position.set(0.62, 0.48, -0.55);
    node_postFarPole_6.rotation.set(0, 0, 0);
  }
  node_postFarPole_6.userData.sculptComponent = { "id": "postFarPole", "name": "Far post pole", "level": "macro", "role": "column", "importance": 1, "confidence": 0.75, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Plain cylinder pole + seam torus; assembled revolved solids.", "geometryDescriptor": { "topologyIntent": "cylinder column", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "postFarBase", "attachment": { "parentSocket": "postFarBase.collar", "localStart": [0.62, 0.05, -0.55], "localEnd": [0.62, 0.9, -0.55], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.09, "height": 0.85, "depth": 0.09, "units": "relative", "confidence": 0.75 }, "transform": { "position": [0.62, 0.48, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "column", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postFarPole", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "poleSeam", "what": "seam ring at mid height", "evidence": "evidence/stanchion/di/zone-r1c0.png" }], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_postFarPole_6.userData.actionProfile = { "animationRole": "column", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postFarPole", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["postFarBase"] ?? root).add(node_postFarPole_6);
  nodes["postFarPole"] = node_postFarPole_6;
  const mesh_postFarPole_6Geometry = buildPole(FAR);
  const mesh_postFarPole_6 = new THREE2.Mesh(
    mesh_postFarPole_6Geometry,
    materialMap["brassMetal"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_postFarPole_6.name = "Far post pole";
  if (endpoint_postFarPole_6) {
    mesh_postFarPole_6.position.copy(endpoint_postFarPole_6.midpoint);
    mesh_postFarPole_6.quaternion.copy(endpoint_postFarPole_6.quaternion);
  }
  mesh_postFarPole_6.castShadow = options.castShadow ?? true;
  mesh_postFarPole_6.receiveShadow = options.receiveShadow ?? true;
  mesh_postFarPole_6.userData.sculptComponent = { "id": "postFarPole", "name": "Far post pole", "level": "macro", "role": "column", "importance": 1, "confidence": 0.75, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Plain cylinder pole + seam torus; assembled revolved solids.", "geometryDescriptor": { "topologyIntent": "cylinder column", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "postFarBase", "attachment": { "parentSocket": "postFarBase.collar", "localStart": [0.62, 0.05, -0.55], "localEnd": [0.62, 0.9, -0.55], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.09, "height": 0.85, "depth": 0.09, "units": "relative", "confidence": 0.75 }, "transform": { "position": [0.62, 0.48, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "column", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postFarPole", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "poleSeam", "what": "seam ring at mid height", "evidence": "evidence/stanchion/di/zone-r1c0.png" }], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_postFarPole_6.add(mesh_postFarPole_6);
  meshes["postFarPole"] = mesh_postFarPole_6;
  node_postFarPole_6.updateWorldMatrix(true, false);
  mesh_postFarPole_6.quaternion.identity();
  mesh_postFarPole_6.position.copy(node_postFarPole_6.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["postFarPole"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["postFarPole"] ??= [];
  destructionGroups["postFarPole"].push(node_postFarPole_6);
  const attachment_postFarCap_7 = { "parentSocket": "postFarPole.top", "localStart": [0.62, 0.9, -0.55], "localEnd": [0.62, 1.01, -0.55], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 };
  const endpoint_postFarCap_7 = makeAttachmentEndpoint(attachment_postFarCap_7);
  const node_postFarCap_7 = new THREE2.Group();
  node_postFarCap_7.name = "Far post crown cap__pivot";
  node_postFarCap_7.scale.set(1, 1, 1);
  if (endpoint_postFarCap_7) {
    node_postFarCap_7.position.copy(endpoint_postFarCap_7.start);
    node_postFarCap_7.rotation.set(0, 0, 0);
  } else {
    node_postFarCap_7.position.set(0.62, 0.95, -0.55);
    node_postFarCap_7.rotation.set(0, 0, 0);
  }
  node_postFarCap_7.userData.sculptComponent = { "id": "postFarCap", "name": "Far post crown cap", "level": "meso", "role": "cap", "importance": 0.85, "confidence": 0.75, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Flared cone frustum widening upward + rounded top disc.", "geometryDescriptor": { "topologyIntent": "lathe cap", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "postFarPole", "attachment": { "parentSocket": "postFarPole.top", "localStart": [0.62, 0.9, -0.55], "localEnd": [0.62, 1.01, -0.55], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.12, "height": 0.12, "depth": 0.12, "units": "relative", "confidence": 0.75 }, "transform": { "position": [0.62, 0.95, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "cap", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postFarCap", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_postFarCap_7.userData.actionProfile = { "animationRole": "cap", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postFarCap", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["postFarPole"] ?? root).add(node_postFarCap_7);
  nodes["postFarCap"] = node_postFarCap_7;
  const mesh_postFarCap_7Geometry = buildCap(FAR);
  const mesh_postFarCap_7 = new THREE2.Mesh(
    mesh_postFarCap_7Geometry,
    materialMap["brassMetal"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_postFarCap_7.name = "Far post crown cap";
  if (endpoint_postFarCap_7) {
    mesh_postFarCap_7.position.copy(endpoint_postFarCap_7.midpoint);
    mesh_postFarCap_7.quaternion.copy(endpoint_postFarCap_7.quaternion);
  }
  mesh_postFarCap_7.castShadow = options.castShadow ?? true;
  mesh_postFarCap_7.receiveShadow = options.receiveShadow ?? true;
  mesh_postFarCap_7.userData.sculptComponent = { "id": "postFarCap", "name": "Far post crown cap", "level": "meso", "role": "cap", "importance": 0.85, "confidence": 0.75, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Flared cone frustum widening upward + rounded top disc.", "geometryDescriptor": { "topologyIntent": "lathe cap", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "postFarPole", "attachment": { "parentSocket": "postFarPole.top", "localStart": [0.62, 0.9, -0.55], "localEnd": [0.62, 1.01, -0.55], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.12, "height": 0.12, "depth": 0.12, "units": "relative", "confidence": 0.75 }, "transform": { "position": [0.62, 0.95, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "cap", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postFarCap", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "brassMetal", "materialLayers": ["brassMetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_postFarCap_7.add(mesh_postFarCap_7);
  meshes["postFarCap"] = mesh_postFarCap_7;
  node_postFarCap_7.updateWorldMatrix(true, false);
  mesh_postFarCap_7.quaternion.identity();
  mesh_postFarCap_7.position.copy(node_postFarCap_7.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["postFarCap"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["postFarCap"] ??= [];
  destructionGroups["postFarCap"].push(node_postFarCap_7);
  const attachment_postFarRing_8 = { "parentSocket": "postFarPole.neck", "localStart": [0.62, 0.86, -0.55], "localEnd": [0.62, 0.89, -0.55], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 };
  const endpoint_postFarRing_8 = makeAttachmentEndpoint(attachment_postFarRing_8);
  const node_postFarRing_8 = new THREE2.Group();
  node_postFarRing_8.name = "Far post collar ring__pivot";
  node_postFarRing_8.scale.set(1, 1, 1);
  if (endpoint_postFarRing_8) {
    node_postFarRing_8.position.copy(endpoint_postFarRing_8.start);
    node_postFarRing_8.rotation.set(0, 0, 0);
  } else {
    node_postFarRing_8.position.set(0.62, 0.875, -0.55);
    node_postFarRing_8.rotation.set(0, 0, 0);
  }
  node_postFarRing_8.userData.sculptComponent = { "id": "postFarRing", "name": "Far post collar ring", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.75, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Free chrome torus around pole under the cap.", "geometryDescriptor": { "topologyIntent": "torus hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "postFarPole", "attachment": { "parentSocket": "postFarPole.neck", "localStart": [0.62, 0.86, -0.55], "localEnd": [0.62, 0.89, -0.55], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.14, "height": 0.02, "depth": 0.14, "units": "relative", "confidence": 0.75 }, "transform": { "position": [0.62, 0.875, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postFarRing", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "chromeSteel", "materialLayers": ["chromeSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(216, 218, 222, 1.0)", "secondaryAlbedo": "rgba(160, 164, 170, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r0c0.png"] } };
  node_postFarRing_8.userData.actionProfile = { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postFarRing", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["postFarPole"] ?? root).add(node_postFarRing_8);
  nodes["postFarRing"] = node_postFarRing_8;
  const mesh_postFarRing_8Geometry = buildCollarRing(FAR);
  const mesh_postFarRing_8 = new THREE2.Mesh(
    mesh_postFarRing_8Geometry,
    materialMap["chromeSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_postFarRing_8.name = "Far post collar ring";
  if (endpoint_postFarRing_8) {
    mesh_postFarRing_8.position.copy(endpoint_postFarRing_8.midpoint);
    mesh_postFarRing_8.quaternion.copy(endpoint_postFarRing_8.quaternion);
  }
  mesh_postFarRing_8.castShadow = options.castShadow ?? true;
  mesh_postFarRing_8.receiveShadow = options.receiveShadow ?? true;
  mesh_postFarRing_8.userData.sculptComponent = { "id": "postFarRing", "name": "Far post collar ring", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.75, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Free chrome torus around pole under the cap.", "geometryDescriptor": { "topologyIntent": "torus hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "postFarPole", "attachment": { "parentSocket": "postFarPole.neck", "localStart": [0.62, 0.86, -0.55], "localEnd": [0.62, 0.89, -0.55], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.14, "height": 0.02, "depth": 0.14, "units": "relative", "confidence": 0.75 }, "transform": { "position": [0.62, 0.875, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "postFarRing", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "chromeSteel", "materialLayers": ["chromeSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(216, 218, 222, 1.0)", "secondaryAlbedo": "rgba(160, 164, 170, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r0c0.png"] } };
  node_postFarRing_8.add(mesh_postFarRing_8);
  meshes["postFarRing"] = mesh_postFarRing_8;
  node_postFarRing_8.updateWorldMatrix(true, false);
  mesh_postFarRing_8.quaternion.identity();
  mesh_postFarRing_8.position.copy(node_postFarRing_8.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["postFarRing"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["postFarRing"] ??= [];
  destructionGroups["postFarRing"].push(node_postFarRing_8);
  const attachment_rope_9 = { "parentSocket": "postNearRing.hook", "localStart": [-0.28, 0.86, 0.42], "localEnd": [0.55, 0.86, -0.5], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 };
  const endpoint_rope_9 = makeAttachmentEndpoint(attachment_rope_9);
  const node_rope_9 = new THREE2.Group();
  node_rope_9.name = "Velvet rope span__pivot";
  node_rope_9.scale.set(1, 1, 1);
  if (endpoint_rope_9) {
    node_rope_9.position.copy(endpoint_rope_9.start);
    node_rope_9.rotation.set(0, 0, 0);
  } else {
    node_rope_9.position.set(0.14, 0.7, -0.05);
    node_rope_9.rotation.set(0, 0, 0);
  }
  node_rope_9.userData.sculptComponent = { "id": "rope", "name": "Velvet rope span", "level": "macro", "role": "rope", "importance": 1, "confidence": 0.9, "primitive": "curve-sweep", "topologyClass": "fiber-strand", "topologyRationale": "3 helical strands twisted about a catenary spine from near hook to far hook; sag to y~0.55.", "geometryDescriptor": { "topologyIntent": "curve-sweep rope", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": { "parentSocket": "postNearRing.hook", "localStart": [-0.28, 0.86, 0.42], "localEnd": [0.55, 0.86, -0.5], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 1.2, "height": 0.42, "depth": 0.2, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.14, 0.7, -0.05], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "rope", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "rope", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "velvetRope", "materialLayers": ["velvetRope"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "twistPitch", "what": "3-strand twist, pitch ~1.1 strand diameters", "evidence": "evidence/stanchion/di/zone-r1c1.png" }], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_rope_9.userData.actionProfile = { "animationRole": "rope", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "rope", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["root"] ?? root).add(node_rope_9);
  nodes["rope"] = node_rope_9;
  const mesh_rope_9Geometry = buildRope();
  const mesh_rope_9 = new THREE2.Mesh(
    mesh_rope_9Geometry,
    materialMap["velvetRope"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_rope_9.name = "Velvet rope span";
  if (endpoint_rope_9) {
    mesh_rope_9.position.copy(endpoint_rope_9.midpoint);
    mesh_rope_9.quaternion.copy(endpoint_rope_9.quaternion);
  }
  mesh_rope_9.castShadow = options.castShadow ?? true;
  mesh_rope_9.receiveShadow = options.receiveShadow ?? true;
  mesh_rope_9.userData.sculptComponent = { "id": "rope", "name": "Velvet rope span", "level": "macro", "role": "rope", "importance": 1, "confidence": 0.9, "primitive": "curve-sweep", "topologyClass": "fiber-strand", "topologyRationale": "3 helical strands twisted about a catenary spine from near hook to far hook; sag to y~0.55.", "geometryDescriptor": { "topologyIntent": "curve-sweep rope", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": { "parentSocket": "postNearRing.hook", "localStart": [-0.28, 0.86, 0.42], "localEnd": [0.55, 0.86, -0.5], "contactType": "embedded", "embedDepth": 0.03, "overlap": 0.03, "gapTolerance": 0.01 }, "dimensions": { "width": 1.2, "height": 0.42, "depth": 0.2, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.14, 0.7, -0.05], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "rope", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "rope", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "velvetRope", "materialLayers": ["velvetRope"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "twistPitch", "what": "3-strand twist, pitch ~1.1 strand diameters", "evidence": "evidence/stanchion/di/zone-r1c1.png" }], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(168, 133, 62, 1.0)", "secondaryAlbedo": "rgba(200, 164, 92, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r2c0.png"] } };
  node_rope_9.add(mesh_rope_9);
  meshes["rope"] = mesh_rope_9;
  node_rope_9.updateWorldMatrix(true, false);
  mesh_rope_9.quaternion.identity();
  mesh_rope_9.position.copy(node_rope_9.getWorldPosition(new THREE2.Vector3()).negate());
  {
    const vm = mesh_rope_9.material;
    vm.map = null;
    vm.roughnessMap = null;
    vm.normalMap = null;
    vm.aoMap = null;
    vm.bumpMap = null;
    vm.color.set("#7a1220");
    vm.roughness = 0.85;
    vm.metalness = 0;
    vm.clearcoat = 0;
    vm.sheen = 1;
    vm.sheenColor = new THREE2.Color("#c04050");
    vm.sheenRoughness = 0.45;
    vm.envMapIntensity = 0.15;
    vm.needsUpdate = true;
  }
  colliders["rope"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["rope"] ??= [];
  destructionGroups["rope"].push(node_rope_9);
  const attachment_ropeEndNear_10 = { "parentSocket": "rope.start", "localStart": [-0.28, 0.86, 0.42], "localEnd": [-0.2, 0.79, 0.37], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 };
  const endpoint_ropeEndNear_10 = makeAttachmentEndpoint(attachment_ropeEndNear_10);
  const node_ropeEndNear_10 = new THREE2.Group();
  node_ropeEndNear_10.name = "Rope end cap (near)__pivot";
  node_ropeEndNear_10.scale.set(1, 1, 1);
  if (endpoint_ropeEndNear_10) {
    node_ropeEndNear_10.position.copy(endpoint_ropeEndNear_10.start);
    node_ropeEndNear_10.rotation.set(0, 0, 0);
  } else {
    node_ropeEndNear_10.position.set(-0.24, 0.83, 0.4);
    node_ropeEndNear_10.rotation.set(0, 0, 0);
  }
  node_ropeEndNear_10.userData.sculptComponent = { "id": "ropeEndNear", "name": "Rope end cap (near)", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Chrome cylinder cap + screw dots at rope start.", "geometryDescriptor": { "topologyIntent": "cylinder hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "rope", "attachment": { "parentSocket": "rope.start", "localStart": [-0.28, 0.86, 0.42], "localEnd": [-0.2, 0.79, 0.37], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.05, "height": 0.09, "depth": 0.05, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.24, 0.83, 0.4], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "ropeEndNear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "chromeSteel", "materialLayers": ["chromeSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(216, 218, 222, 1.0)", "secondaryAlbedo": "rgba(160, 164, 170, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r0c0.png"] } };
  node_ropeEndNear_10.userData.actionProfile = { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "ropeEndNear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["rope"] ?? root).add(node_ropeEndNear_10);
  nodes["ropeEndNear"] = node_ropeEndNear_10;
  const mesh_ropeEndNear_10Geometry = buildEndCapNear();
  const mesh_ropeEndNear_10 = new THREE2.Mesh(
    mesh_ropeEndNear_10Geometry,
    materialMap["chromeSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_ropeEndNear_10.name = "Rope end cap (near)";
  if (endpoint_ropeEndNear_10) {
    mesh_ropeEndNear_10.position.copy(endpoint_ropeEndNear_10.midpoint);
    mesh_ropeEndNear_10.quaternion.copy(endpoint_ropeEndNear_10.quaternion);
  }
  mesh_ropeEndNear_10.castShadow = options.castShadow ?? true;
  mesh_ropeEndNear_10.receiveShadow = options.receiveShadow ?? true;
  mesh_ropeEndNear_10.userData.sculptComponent = { "id": "ropeEndNear", "name": "Rope end cap (near)", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Chrome cylinder cap + screw dots at rope start.", "geometryDescriptor": { "topologyIntent": "cylinder hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "rope", "attachment": { "parentSocket": "rope.start", "localStart": [-0.28, 0.86, 0.42], "localEnd": [-0.2, 0.79, 0.37], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.05, "height": 0.09, "depth": 0.05, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.24, 0.83, 0.4], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "ropeEndNear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "chromeSteel", "materialLayers": ["chromeSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(216, 218, 222, 1.0)", "secondaryAlbedo": "rgba(160, 164, 170, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r0c0.png"] } };
  node_ropeEndNear_10.add(mesh_ropeEndNear_10);
  meshes["ropeEndNear"] = mesh_ropeEndNear_10;
  node_ropeEndNear_10.updateWorldMatrix(true, false);
  mesh_ropeEndNear_10.quaternion.identity();
  mesh_ropeEndNear_10.position.copy(node_ropeEndNear_10.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["ropeEndNear"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["ropeEndNear"] ??= [];
  destructionGroups["ropeEndNear"].push(node_ropeEndNear_10);
  const attachment_ropeEndFar_11 = { "parentSocket": "rope.end", "localStart": [0.55, 0.86, -0.5], "localEnd": [0.46, 0.79, -0.43], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 };
  const endpoint_ropeEndFar_11 = makeAttachmentEndpoint(attachment_ropeEndFar_11);
  const node_ropeEndFar_11 = new THREE2.Group();
  node_ropeEndFar_11.name = "Rope end cap (far)__pivot";
  node_ropeEndFar_11.scale.set(1, 1, 1);
  if (endpoint_ropeEndFar_11) {
    node_ropeEndFar_11.position.copy(endpoint_ropeEndFar_11.start);
    node_ropeEndFar_11.rotation.set(0, 0, 0);
  } else {
    node_ropeEndFar_11.position.set(0.5, 0.83, -0.46);
    node_ropeEndFar_11.rotation.set(0, 0, 0);
  }
  node_ropeEndFar_11.userData.sculptComponent = { "id": "ropeEndFar", "name": "Rope end cap (far)", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Chrome cylinder cap at rope end.", "geometryDescriptor": { "topologyIntent": "cylinder hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "rope", "attachment": { "parentSocket": "rope.end", "localStart": [0.55, 0.86, -0.5], "localEnd": [0.46, 0.79, -0.43], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.05, "height": 0.09, "depth": 0.05, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.5, 0.83, -0.46], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "ropeEndFar", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "chromeSteel", "materialLayers": ["chromeSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(216, 218, 222, 1.0)", "secondaryAlbedo": "rgba(160, 164, 170, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r0c0.png"] } };
  node_ropeEndFar_11.userData.actionProfile = { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "ropeEndFar", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["rope"] ?? root).add(node_ropeEndFar_11);
  nodes["ropeEndFar"] = node_ropeEndFar_11;
  const mesh_ropeEndFar_11Geometry = buildEndCapFar();
  const mesh_ropeEndFar_11 = new THREE2.Mesh(
    mesh_ropeEndFar_11Geometry,
    materialMap["chromeSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_ropeEndFar_11.name = "Rope end cap (far)";
  if (endpoint_ropeEndFar_11) {
    mesh_ropeEndFar_11.position.copy(endpoint_ropeEndFar_11.midpoint);
    mesh_ropeEndFar_11.quaternion.copy(endpoint_ropeEndFar_11.quaternion);
  }
  mesh_ropeEndFar_11.castShadow = options.castShadow ?? true;
  mesh_ropeEndFar_11.receiveShadow = options.receiveShadow ?? true;
  mesh_ropeEndFar_11.userData.sculptComponent = { "id": "ropeEndFar", "name": "Rope end cap (far)", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Chrome cylinder cap at rope end.", "geometryDescriptor": { "topologyIntent": "cylinder hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "rope", "attachment": { "parentSocket": "rope.end", "localStart": [0.55, 0.86, -0.5], "localEnd": [0.46, 0.79, -0.43], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 0.01 }, "dimensions": { "width": 0.05, "height": 0.09, "depth": 0.05, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.5, 0.83, -0.46], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "ropeEndFar", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "chromeSteel", "materialLayers": ["chromeSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(216, 218, 222, 1.0)", "secondaryAlbedo": "rgba(160, 164, 170, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r0c0.png"] } };
  node_ropeEndFar_11.add(mesh_ropeEndFar_11);
  meshes["ropeEndFar"] = mesh_ropeEndFar_11;
  node_ropeEndFar_11.updateWorldMatrix(true, false);
  mesh_ropeEndFar_11.quaternion.identity();
  mesh_ropeEndFar_11.position.copy(node_ropeEndFar_11.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["ropeEndFar"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["ropeEndFar"] ??= [];
  destructionGroups["ropeEndFar"].push(node_ropeEndFar_11);
  const attachment_hookNear_12 = { "parentSocket": "postNearRing.rim", "localStart": [-0.32, 0.875, 0.44], "localEnd": [-0.27, 0.845, 0.42], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 0.01 };
  const endpoint_hookNear_12 = makeAttachmentEndpoint(attachment_hookNear_12);
  const node_hookNear_12 = new THREE2.Group();
  node_hookNear_12.name = "Swivel hook (near)__pivot";
  node_hookNear_12.scale.set(1, 1, 1);
  if (endpoint_hookNear_12) {
    node_hookNear_12.position.copy(endpoint_hookNear_12.start);
    node_hookNear_12.rotation.set(0, 0, 0);
  } else {
    node_hookNear_12.position.set(-0.3, 0.865, 0.435);
    node_hookNear_12.rotation.set(0, 0, 0);
  }
  node_hookNear_12.userData.sculptComponent = { "id": "hookNear", "name": "Swivel hook (near)", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Chrome hook loop clipping end cap into the near collar ring.", "geometryDescriptor": { "topologyIntent": "torus hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "ropeEndNear", "attachment": { "parentSocket": "postNearRing.rim", "localStart": [-0.32, 0.875, 0.44], "localEnd": [-0.27, 0.845, 0.42], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 0.01 }, "dimensions": { "width": 0.04, "height": 0.05, "depth": 0.02, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.3, 0.865, 0.435], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hookNear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "chromeSteel", "materialLayers": ["chromeSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(216, 218, 222, 1.0)", "secondaryAlbedo": "rgba(160, 164, 170, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r0c0.png"] } };
  node_hookNear_12.userData.actionProfile = { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hookNear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["ropeEndNear"] ?? root).add(node_hookNear_12);
  nodes["hookNear"] = node_hookNear_12;
  const mesh_hookNear_12Geometry = buildHookNear();
  const mesh_hookNear_12 = new THREE2.Mesh(
    mesh_hookNear_12Geometry,
    materialMap["chromeSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_hookNear_12.name = "Swivel hook (near)";
  if (endpoint_hookNear_12) {
    mesh_hookNear_12.position.copy(endpoint_hookNear_12.midpoint);
    mesh_hookNear_12.quaternion.copy(endpoint_hookNear_12.quaternion);
  }
  mesh_hookNear_12.castShadow = options.castShadow ?? true;
  mesh_hookNear_12.receiveShadow = options.receiveShadow ?? true;
  mesh_hookNear_12.userData.sculptComponent = { "id": "hookNear", "name": "Swivel hook (near)", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Chrome hook loop clipping end cap into the near collar ring.", "geometryDescriptor": { "topologyIntent": "torus hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "ropeEndNear", "attachment": { "parentSocket": "postNearRing.rim", "localStart": [-0.32, 0.875, 0.44], "localEnd": [-0.27, 0.845, 0.42], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 0.01 }, "dimensions": { "width": 0.04, "height": 0.05, "depth": 0.02, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.3, 0.865, 0.435], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hookNear", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "chromeSteel", "materialLayers": ["chromeSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(216, 218, 222, 1.0)", "secondaryAlbedo": "rgba(160, 164, 170, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r0c0.png"] } };
  node_hookNear_12.add(mesh_hookNear_12);
  meshes["hookNear"] = mesh_hookNear_12;
  node_hookNear_12.updateWorldMatrix(true, false);
  mesh_hookNear_12.quaternion.identity();
  mesh_hookNear_12.position.copy(node_hookNear_12.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["hookNear"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["hookNear"] ??= [];
  destructionGroups["hookNear"].push(node_hookNear_12);
  const attachment_hookFar_13 = { "parentSocket": "postFarRing.rim", "localStart": [0.59, 0.875, -0.53], "localEnd": [0.54, 0.845, -0.5], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 0.01 };
  const endpoint_hookFar_13 = makeAttachmentEndpoint(attachment_hookFar_13);
  const node_hookFar_13 = new THREE2.Group();
  node_hookFar_13.name = "Swivel hook (far)__pivot";
  node_hookFar_13.scale.set(1, 1, 1);
  if (endpoint_hookFar_13) {
    node_hookFar_13.position.copy(endpoint_hookFar_13.start);
    node_hookFar_13.rotation.set(0, 0, 0);
  } else {
    node_hookFar_13.position.set(0.57, 0.865, -0.52);
    node_hookFar_13.rotation.set(0, 0, 0);
  }
  node_hookFar_13.userData.sculptComponent = { "id": "hookFar", "name": "Swivel hook (far)", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Chrome hook loop at the far ring.", "geometryDescriptor": { "topologyIntent": "torus hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "ropeEndFar", "attachment": { "parentSocket": "postFarRing.rim", "localStart": [0.59, 0.875, -0.53], "localEnd": [0.54, 0.845, -0.5], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 0.01 }, "dimensions": { "width": 0.04, "height": 0.05, "depth": 0.02, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.57, 0.865, -0.52], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hookFar", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "chromeSteel", "materialLayers": ["chromeSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(216, 218, 222, 1.0)", "secondaryAlbedo": "rgba(160, 164, 170, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r0c0.png"] } };
  node_hookFar_13.userData.actionProfile = { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hookFar", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } };
  (nodes["ropeEndFar"] ?? root).add(node_hookFar_13);
  nodes["hookFar"] = node_hookFar_13;
  const mesh_hookFar_13Geometry = buildHookFar();
  const mesh_hookFar_13 = new THREE2.Mesh(
    mesh_hookFar_13Geometry,
    materialMap["chromeSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_hookFar_13.name = "Swivel hook (far)";
  if (endpoint_hookFar_13) {
    mesh_hookFar_13.position.copy(endpoint_hookFar_13.midpoint);
    mesh_hookFar_13.quaternion.copy(endpoint_hookFar_13.quaternion);
  }
  mesh_hookFar_13.castShadow = options.castShadow ?? true;
  mesh_hookFar_13.receiveShadow = options.receiveShadow ?? true;
  mesh_hookFar_13.userData.sculptComponent = { "id": "hookFar", "name": "Swivel hook (far)", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Chrome hook loop at the far ring.", "geometryDescriptor": { "topologyIntent": "torus hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "ropeEndFar", "attachment": { "parentSocket": "postFarRing.rim", "localStart": [0.59, 0.875, -0.53], "localEnd": [0.54, 0.845, -0.5], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 0.01 }, "dimensions": { "width": 0.04, "height": 0.05, "depth": 0.02, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.57, 0.865, -0.52], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hookFar", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "brassMetal" } }, "material": "chromeSteel", "materialLayers": ["chromeSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.32, "microRoughness": 0.1, "bumpAmplitude": 6e-3, "normalPattern": "patina + panel lines", "displacementPattern": "", "occlusionPattern": "base crevices", "edgeWearPattern": "polished highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(216, 218, 222, 1.0)", "secondaryAlbedo": "rgba(160, 164, 170, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/stanchion/di/zone-r0c0.png"] } };
  node_hookFar_13.add(mesh_hookFar_13);
  meshes["hookFar"] = mesh_hookFar_13;
  node_hookFar_13.updateWorldMatrix(true, false);
  mesh_hookFar_13.quaternion.identity();
  mesh_hookFar_13.position.copy(node_hookFar_13.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["hookFar"] = { "type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["hookFar"] ??= [];
  destructionGroups["hookFar"].push(node_hookFar_13);
  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups };
  root.userData.lookDevTargets = { "qualityPriority": "reference-fidelity", "materialPass": { "albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": { "requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry" }, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"] }, "lightingPass": { "requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"] }, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."] };
  root.userData.actionReadiness = {
    note: "Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets."
  };
  return root;
}
export {
  createStanchionRopeBarrierModel
};
