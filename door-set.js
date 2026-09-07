/* Double fire door set, procedurally built.
   Bundled with esbuild from C:/side/objects/src/createDoubleFireDoorSetModel.ts
   (+ doorGeometry.ts), `three` external. Look-dev/composer exports tree-shaken;
   their dead three/examples imports stripped. Generated — rebuild from source. */
// src/createDoubleFireDoorSetModel.ts
import * as THREE2 from "three";

// src/doorGeometry.ts
import * as THREE from "three";
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
var box = (w, h, d, x, y, z) => {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
};
function buildFrame() {
  const geos = [];
  const D = 0.13, ZC = 0;
  geos.push(box(0.07, 2.53, D, -0.99, 1.305, ZC));
  geos.push(box(0.07, 2.53, D, 0.99, 1.305, ZC));
  geos.push(box(2.05, 0.06, D, 0, 2.54, ZC));
  geos.push(box(2.05, 0.06, D, 0, 0.07, ZC));
  geos.push(box(1.91, 0.05, D * 0.9, 0, 2.115, ZC));
  return merge(geos);
}
function buildTransom() {
  const geos = [];
  geos.push(box(1.9, 0.38, 0.05, 0, 2.33, 0));
  geos.push(box(1.82, 0.3, 0.02, 0, 2.33, 0.03));
  return merge(geos);
}
function buildLeaf(cx) {
  const geos = [];
  geos.push(box(0.9, 2, 0.05, cx, 1.11, 5e-3));
  const rail = 0.075, W = 0.86, H = 1.96, zf = 0.036;
  geos.push(box(W, rail, 0.014, cx, 1.11 + H / 2 - rail / 2, zf));
  geos.push(box(W, rail, 0.014, cx, 1.11 - H / 2 + rail / 2, zf));
  geos.push(box(rail, H - 2 * rail, 0.014, cx - W / 2 + rail / 2, 1.11, zf));
  geos.push(box(rail, H - 2 * rail, 0.014, cx + W / 2 - rail / 2, 1.11, zf));
  geos.push(box(W, 0.22, 0.012, cx, 0.25, 0.034));
  return merge(geos);
}
function buildVision(sx) {
  const geos = [];
  const W = 0.13, H = 0.6, CY = 1.62, bez = 0.024, zb = 0.042;
  geos.push(box(W + 2 * bez, bez, 0.02, sx, CY + H / 2 + bez / 2, zb));
  geos.push(box(W + 2 * bez, bez, 0.02, sx, CY - H / 2 - bez / 2, zb));
  geos.push(box(bez, H, 0.02, sx - W / 2 - bez / 2, CY, zb));
  geos.push(box(bez, H, 0.02, sx + W / 2 + bez / 2, CY, zb));
  const glass = new THREE.PlaneGeometry(W, H);
  glass.translate(sx, CY, 0.033);
  geos.push(glass);
  return merge(geos);
}
function buildHandle(hx) {
  const geos = [];
  const bar = new THREE.CylinderGeometry(0.016, 0.016, 0.9, 16, 1);
  bar.translate(hx, 1.22, 0.1);
  geos.push(bar);
  for (const dy of [-0.38, 0.38]) {
    const so = new THREE.CylinderGeometry(0.011, 0.011, 0.07, 10).rotateX(Math.PI / 2);
    so.translate(hx, 1.22 + dy, 0.065);
    geos.push(so);
  }
  const capT = new THREE.SphereGeometry(0.016, 10, 8);
  capT.translate(hx, 1.67, 0.1);
  const capB = new THREE.SphereGeometry(0.016, 10, 8);
  capB.translate(hx, 0.77, 0.1);
  geos.push(capT, capB);
  return merge(geos);
}
function buildCloser(cx) {
  const geos = [];
  geos.push(box(0.32, 0.065, 0.075, cx, 2.055, 0.055));
  const end = new THREE.CylinderGeometry(0.032, 0.032, 0.075, 14).rotateX(Math.PI / 2);
  end.translate(cx - 0.16, 2.055, 0.055);
  geos.push(end);
  return merge(geos);
}
function buildHinges(jx) {
  const geos = [];
  for (const y of [0.5, 1.3, 2]) {
    geos.push(box(0.024, 0.11, 0.045, jx, y, 0.028));
    const pin = new THREE.CylinderGeometry(8e-3, 8e-3, 0.13, 10);
    pin.translate(jx - 8e-3, y, 0.045);
    geos.push(pin);
  }
  return merge(geos);
}
function buildHingePlates(jx) {
  const geos = [];
  for (const y of [0.5, 1.3, 2]) {
    geos.push(box(0.014, 0.1, 0.03, jx, y, 0.02));
  }
  return merge(geos);
}
function buildFeet() {
  const geos = [];
  for (const x of [-0.85, 0.85]) {
    const f = new THREE.CylinderGeometry(0.04, 0.045, 0.04, 18);
    f.translate(x, 0.02, 0.03);
    geos.push(f);
  }
  return merge(geos);
}

// src/createDoubleFireDoorSetModel.ts
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
function createDoubleFireDoorSetModel(options = {}) {
  const root = new THREE2.Group();
  root.name = "Double Fire Door Set";
  root.userData.reconstructionEvidence = { "itemFamily": null, "subtype": null, "componentAdapter": null, "route": null, "exactnessTier": null, "referenceCamera": { "solved": false, "fovDegrees": 32, "aspect": 1, "orientation": { "yaw": -24, "pitch": 1, "roll": 0 }, "positionHint": [-1.4, 1.25, 3.4], "note": "3/4 from left near mid-height." }, "approximationNotes": [] };
  root.userData.materialPipeline = {};
  root.userData.materialReferenceRegistry = null;
  const materialMap = {};
  materialMap["charcoalSteel"] = createSculptMaterial(
    "charcoalSteel",
    { "id": "charcoalSteel", "name": "Charcoal powder-coat", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#2b2d30", "color": "#2b2d30", "albedo": { "dominant": "#2b2d30", "secondary": ["#3c3f43", "#232528"], "samplingNotes": "sampled from reference" }, "colorVariation": { "palette": ["#2b2d30", "#3c3f43", "#232528"], "pattern": "subtle", "amplitude": 0.05, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.12, "role": "broad tone variation" }, { "id": "meso", "frequency": 20, "amplitude": 0.08, "role": "powder-coat grain / brush" }, { "id": "micro", "frequency": 80, "amplitude": 0.05, "role": "micro roughness breakup" }], "roughness": { "base": 0.55, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brighter bevel edges" }, "metalness": { "base": 0.4, "variation": 0 }, "normal": { "pattern": "powder grain (independent)", "strength": 0.1, "scale": 30, "space": "tangent" }, "bump": { "pattern": "grain", "amplitude": 2e-3, "scale": 40 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.45, "contactShadowBias": 0.35, "notes": "panel recesses" }, "wear": { "edgeWear": 0.1, "scratches": [], "chips": [] }, "dirt": { "amount": 0.03, "cavityBias": 0.5, "color": "#0c0c0e" }, "localOverrides": [], "shaderNotes": ["Dark powder-coat; subtle grain; env edge highlights carry the form.", "Agent-vision metalness/roughness correction after analyze_texture."], "notes": "Dark powder-coat; subtle grain; env edge highlights carry the form.", "finishClass": "worn-composite", "texturePalette": ["#373C3C", "#393D3E", "#3C3F42", "#3E4144", "#59544B"], "proceduralTexture": "mottle", "clearcoat": { "base": 0, "variation": 0 }, "clearcoatRoughness": { "base": 0, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 0.5, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\door\\mat\\crop-charcoalSteel.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.79, "estimatedFidelity": 0.79, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/door/pbr/charcoalSteel/charcoalsteel_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/door/pbr/charcoalSteel/charcoalsteel_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/door/pbr/charcoalSteel/charcoalsteel_height.png", "channel": "height" }, "normal": { "path": "evidence/door/pbr/charcoalSteel/charcoalsteel_normal.png", "channel": "normal" }, "ao": { "path": "evidence/door/pbr/charcoalSteel/charcoalsteel_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["stainlessSteel"] = createSculptMaterial(
    "stainlessSteel",
    { "id": "stainlessSteel", "name": "Stainless", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#b8bcc0", "color": "#b8bcc0", "albedo": { "dominant": "#b8bcc0", "secondary": ["#8c9096", "#d8dce0"], "samplingNotes": "sampled from reference" }, "colorVariation": { "palette": ["#b8bcc0", "#8c9096", "#d8dce0"], "pattern": "subtle", "amplitude": 0.05, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.12, "role": "broad tone variation" }, { "id": "meso", "frequency": 20, "amplitude": 0.08, "role": "powder-coat grain / brush" }, { "id": "micro", "frequency": 80, "amplitude": 0.05, "role": "micro roughness breakup" }], "roughness": { "base": 0.25, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brighter bevel edges" }, "metalness": { "base": 1, "variation": 0 }, "normal": { "pattern": "powder grain (independent)", "strength": 0.1, "scale": 30, "space": "tangent" }, "bump": { "pattern": "grain", "amplitude": 2e-3, "scale": 40 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.45, "contactShadowBias": 0.35, "notes": "panel recesses" }, "wear": { "edgeWear": 0.1, "scratches": [], "chips": [] }, "dirt": { "amount": 0.03, "cavityBias": 0.5, "color": "#0c0c0e" }, "localOverrides": [], "shaderNotes": ["Brushed stainless hardware.", "Agent-vision metalness/roughness correction after analyze_texture."], "notes": "Brushed stainless hardware.", "finishClass": "worn-composite", "texturePalette": ["#282B2D", "#393D40", "#4E4B43", "#565655", "#0E0F10"], "proceduralTexture": "mottle", "clearcoat": { "base": 0, "variation": 0 }, "clearcoatRoughness": { "base": 0, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 0.5, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\door\\mat\\crop-stainlessSteel.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/door/pbr/stainlessSteel/stainlesssteel_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/door/pbr/stainlessSteel/stainlesssteel_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/door/pbr/stainlessSteel/stainlesssteel_height.png", "channel": "height" }, "normal": { "path": "evidence/door/pbr/stainlessSteel/stainlesssteel_normal.png", "channel": "normal" }, "ao": { "path": "evidence/door/pbr/stainlessSteel/stainlesssteel_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["glassDark"] = createSculptMaterial(
    "glassDark",
    { "id": "glassDark", "name": "Vision glass", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#101216", "color": "#101216", "albedo": { "dominant": "#101216", "secondary": ["#464c58"], "samplingNotes": "sampled from reference" }, "colorVariation": { "palette": ["#101216", "#464c58"], "pattern": "subtle", "amplitude": 0.05, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.12, "role": "broad tone variation" }, { "id": "meso", "frequency": 20, "amplitude": 0.08, "role": "powder-coat grain / brush" }, { "id": "micro", "frequency": 80, "amplitude": 0.05, "role": "micro roughness breakup" }], "roughness": { "base": 0.05, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brighter bevel edges" }, "metalness": { "base": 0, "variation": 0 }, "normal": { "pattern": "powder grain (independent)", "strength": 0.1, "scale": 30, "space": "tangent" }, "bump": { "pattern": "grain", "amplitude": 2e-3, "scale": 40 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.45, "contactShadowBias": 0.35, "notes": "panel recesses" }, "wear": { "edgeWear": 0.1, "scratches": [], "chips": [] }, "dirt": { "amount": 0.03, "cavityBias": 0.5, "color": "#0c0c0e" }, "localOverrides": [], "shaderNotes": ["Near-black reflective glazing; env streaks; not transparent (dark interior).", "Agent-vision metalness/roughness correction after analyze_texture."], "notes": "Near-black reflective glazing; env streaks; not transparent (dark interior).", "envMapIntensity": 1, "finishClass": "painted-metal", "texturePalette": ["#635F59", "#584D41", "#594F43", "#090803", "#080804"], "proceduralTexture": "flat-clearcoat", "clearcoat": { "base": 1, "variation": 0 }, "clearcoatRoughness": { "base": 0.05, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\door\\mat\\crop-glassDark.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/door/pbr/glassDark/glassdark_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/door/pbr/glassDark/glassdark_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/door/pbr/glassDark/glassdark_height.png", "channel": "height" }, "normal": { "path": "evidence/door/pbr/glassDark/glassdark_normal.png", "channel": "normal" }, "ao": { "path": "evidence/door/pbr/glassDark/glassdark_ao.png", "channel": "ao" } } } },
    options
  );
  {
    const cs = materialMap["charcoalSteel"];
    cs.map = null;
    cs.roughnessMap = null;
    cs.color.set("#2b2d30");
    cs.roughness = 0.55;
    cs.metalness = 0.4;
    cs.envMapIntensity = 0.55;
    cs.needsUpdate = true;
    const ss = materialMap["stainlessSteel"];
    ss.map = null;
    ss.roughnessMap = null;
    ss.color.set("#b8bcc0");
    ss.roughness = 0.25;
    ss.metalness = 1;
    ss.envMapIntensity = 0.8;
    ss.needsUpdate = true;
  }
  const nodes = { root };
  const meshes = {};
  const sockets = {};
  const colliders = {};
  const destructionGroups = {};
  const attachment_root_0 = null;
  const endpoint_root_0 = makeAttachmentEndpoint(attachment_root_0);
  const node_root_0 = new THREE2.Group();
  node_root_0.name = "Double Fire Door Set__pivot";
  node_root_0.scale.set(1, 1, 1);
  if (endpoint_root_0) {
    node_root_0.position.copy(endpoint_root_0.start);
    node_root_0.rotation.set(0, 0, 0);
  } else {
    node_root_0.position.set(0, 0, 0);
    node_root_0.rotation.set(0, 0, 0);
  }
  node_root_0.userData.sculptComponent = { "id": "root", "name": "Double Fire Door Set", "level": "macro", "role": "body", "importance": 1, "confidence": 0.5, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Group pivot.", "geometryDescriptor": { "topologyIntent": "container", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": null, "attachment": null, "dimensions": { "width": 2.05, "height": 2.55, "depth": 0.14, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } }, "material": "charcoalSteel", "materialLayers": ["charcoalSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0, "microRoughness": 0, "bumpAmplitude": 0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(43, 45, 48, 1.0)", "secondaryAlbedo": "rgba(60, 63, 67, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_root_0.userData.actionProfile = { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } };
  (nodes["root"] ?? root).add(node_root_0);
  nodes["root"] = node_root_0;
  const mesh_root_0Geometry = endpoint_root_0 ? new THREE2.CylinderGeometry(endpoint_root_0.endRadius, endpoint_root_0.baseRadius, endpoint_root_0.length, 32, 12) : new THREE2.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_root_0) {
    mesh_root_0Geometry.scale(1, 1, 1);
  }
  const mesh_root_0 = new THREE2.Mesh(
    mesh_root_0Geometry,
    materialMap["charcoalSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_root_0.name = "Double Fire Door Set";
  if (endpoint_root_0) {
    mesh_root_0.position.copy(endpoint_root_0.midpoint);
    mesh_root_0.quaternion.copy(endpoint_root_0.quaternion);
  }
  mesh_root_0.castShadow = options.castShadow ?? true;
  mesh_root_0.receiveShadow = options.receiveShadow ?? true;
  mesh_root_0.userData.sculptComponent = { "id": "root", "name": "Double Fire Door Set", "level": "macro", "role": "body", "importance": 1, "confidence": 0.5, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Group pivot.", "geometryDescriptor": { "topologyIntent": "container", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": null, "attachment": null, "dimensions": { "width": 2.05, "height": 2.55, "depth": 0.14, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } }, "material": "charcoalSteel", "materialLayers": ["charcoalSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0, "microRoughness": 0, "bumpAmplitude": 0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(43, 45, 48, 1.0)", "secondaryAlbedo": "rgba(60, 63, 67, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  mesh_root_0.visible = false;
  node_root_0.add(mesh_root_0);
  meshes["root"] = mesh_root_0;
  colliders["root"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." };
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_root_0);
  const attachment_frame_1 = null;
  const endpoint_frame_1 = makeAttachmentEndpoint(attachment_frame_1);
  const node_frame_1 = new THREE2.Group();
  node_frame_1.name = "Perimeter frame__pivot";
  node_frame_1.scale.set(1, 1, 1);
  if (endpoint_frame_1) {
    node_frame_1.position.copy(endpoint_frame_1.start);
    node_frame_1.rotation.set(0, 0, 0);
  } else {
    node_frame_1.position.set(0, 1.3, 0);
    node_frame_1.rotation.set(0, 0, 0);
  }
  node_frame_1.userData.sculptComponent = { "id": "frame", "name": "Perimeter frame", "level": "macro", "role": "frame", "importance": 1, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Deep box ring: jambs + head + sill channel; left depth face visible.", "geometryDescriptor": { "topologyIntent": "extrude frame", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": null, "dimensions": { "width": 2.05, "height": 2.55, "depth": 0.13, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 1.3, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "frame", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "frame", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "charcoalSteel", "materialLayers": ["charcoalSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(43, 45, 48, 1.0)", "secondaryAlbedo": "rgba(60, 63, 67, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_frame_1.userData.actionProfile = { "animationRole": "frame", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "frame", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } };
  (nodes["root"] ?? root).add(node_frame_1);
  nodes["frame"] = node_frame_1;
  const mesh_frame_1Geometry = buildFrame();
  const mesh_frame_1 = new THREE2.Mesh(
    mesh_frame_1Geometry,
    materialMap["charcoalSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_frame_1.name = "Perimeter frame";
  if (endpoint_frame_1) {
    mesh_frame_1.position.copy(endpoint_frame_1.midpoint);
    mesh_frame_1.quaternion.copy(endpoint_frame_1.quaternion);
  }
  mesh_frame_1.castShadow = options.castShadow ?? true;
  mesh_frame_1.receiveShadow = options.receiveShadow ?? true;
  mesh_frame_1.userData.sculptComponent = { "id": "frame", "name": "Perimeter frame", "level": "macro", "role": "frame", "importance": 1, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Deep box ring: jambs + head + sill channel; left depth face visible.", "geometryDescriptor": { "topologyIntent": "extrude frame", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": null, "dimensions": { "width": 2.05, "height": 2.55, "depth": 0.13, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 1.3, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "frame", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "frame", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "charcoalSteel", "materialLayers": ["charcoalSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(43, 45, 48, 1.0)", "secondaryAlbedo": "rgba(60, 63, 67, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_frame_1.add(mesh_frame_1);
  meshes["frame"] = mesh_frame_1;
  node_frame_1.updateWorldMatrix(true, false);
  mesh_frame_1.quaternion.identity();
  mesh_frame_1.position.copy(node_frame_1.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["frame"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["frame"] ??= [];
  destructionGroups["frame"].push(node_frame_1);
  const attachment_transom_2 = { "parentSocket": "frame.head", "localStart": [0, 2.14, 0], "localEnd": [0, 2.5, 0], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_transom_2 = makeAttachmentEndpoint(attachment_transom_2);
  const node_transom_2 = new THREE2.Group();
  node_transom_2.name = "Transom panel__pivot";
  node_transom_2.scale.set(1, 1, 1);
  if (endpoint_transom_2) {
    node_transom_2.position.copy(endpoint_transom_2.start);
    node_transom_2.rotation.set(0, 0, 0);
  } else {
    node_transom_2.position.set(0, 2.32, 0);
    node_transom_2.rotation.set(0, 0, 0);
  }
  node_transom_2.userData.sculptComponent = { "id": "transom", "name": "Transom panel", "level": "macro", "role": "panel", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Framed flat panel above the leaves, full inner width.", "geometryDescriptor": { "topologyIntent": "box panel", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.head", "localStart": [0, 2.14, 0], "localEnd": [0, 2.5, 0], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 1.9, "height": 0.36, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 2.32, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "panel", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "transom", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "charcoalSteel", "materialLayers": ["charcoalSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(43, 45, 48, 1.0)", "secondaryAlbedo": "rgba(60, 63, 67, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_transom_2.userData.actionProfile = { "animationRole": "panel", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "transom", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } };
  (nodes["frame"] ?? root).add(node_transom_2);
  nodes["transom"] = node_transom_2;
  const mesh_transom_2Geometry = buildTransom();
  const mesh_transom_2 = new THREE2.Mesh(
    mesh_transom_2Geometry,
    materialMap["charcoalSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_transom_2.name = "Transom panel";
  if (endpoint_transom_2) {
    mesh_transom_2.position.copy(endpoint_transom_2.midpoint);
    mesh_transom_2.quaternion.copy(endpoint_transom_2.quaternion);
  }
  mesh_transom_2.castShadow = options.castShadow ?? true;
  mesh_transom_2.receiveShadow = options.receiveShadow ?? true;
  mesh_transom_2.userData.sculptComponent = { "id": "transom", "name": "Transom panel", "level": "macro", "role": "panel", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Framed flat panel above the leaves, full inner width.", "geometryDescriptor": { "topologyIntent": "box panel", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.head", "localStart": [0, 2.14, 0], "localEnd": [0, 2.5, 0], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 1.9, "height": 0.36, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 2.32, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "panel", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "transom", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "charcoalSteel", "materialLayers": ["charcoalSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(43, 45, 48, 1.0)", "secondaryAlbedo": "rgba(60, 63, 67, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_transom_2.add(mesh_transom_2);
  meshes["transom"] = mesh_transom_2;
  node_transom_2.updateWorldMatrix(true, false);
  mesh_transom_2.quaternion.identity();
  mesh_transom_2.position.copy(node_transom_2.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["transom"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["transom"] ??= [];
  destructionGroups["transom"].push(node_transom_2);
  const attachment_leafLeft_3 = { "parentSocket": "frame.leftJamb", "localStart": [-0.92, 1.07, 0.02], "localEnd": [-0.02, 1.07, 0.02], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 };
  const endpoint_leafLeft_3 = makeAttachmentEndpoint(attachment_leafLeft_3);
  const node_leafLeft_3 = new THREE2.Group();
  node_leafLeft_3.name = "Left door leaf__pivot";
  node_leafLeft_3.scale.set(1, 1, 1);
  if (endpoint_leafLeft_3) {
    node_leafLeft_3.position.copy(endpoint_leafLeft_3.start);
    node_leafLeft_3.rotation.set(0, 0, 0);
  } else {
    node_leafLeft_3.position.set(-0.47, 1.07, 0.02);
    node_leafLeft_3.rotation.set(0, 0, 0);
  }
  node_leafLeft_3.userData.sculptComponent = { "id": "leafLeft", "name": "Left door leaf", "level": "macro", "role": "door", "importance": 1, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Charcoal leaf: raised border ring + recessed field + kick rail.", "geometryDescriptor": { "topologyIntent": "box door", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.leftJamb", "localStart": [-0.92, 1.07, 0.02], "localEnd": [-0.02, 1.07, 0.02], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.9, "height": 2, "depth": 0.06, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.47, 1.07, 0.02], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leafLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "charcoalSteel" } }, "material": "charcoalSteel", "materialLayers": ["charcoalSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "recessField", "what": "raised border + recessed field", "evidence": "evidence/door/di/zone-r1c1.png" }, { "id": "kickRail", "what": "stepped bottom rail", "evidence": "evidence/door/di/zone-r2c1.png" }], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(43, 45, 48, 1.0)", "secondaryAlbedo": "rgba(60, 63, 67, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_leafLeft_3.userData.actionProfile = { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leafLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "charcoalSteel" } };
  (nodes["frame"] ?? root).add(node_leafLeft_3);
  nodes["leafLeft"] = node_leafLeft_3;
  const mesh_leafLeft_3Geometry = buildLeaf(-0.47);
  const mesh_leafLeft_3 = new THREE2.Mesh(
    mesh_leafLeft_3Geometry,
    materialMap["charcoalSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_leafLeft_3.name = "Left door leaf";
  if (endpoint_leafLeft_3) {
    mesh_leafLeft_3.position.copy(endpoint_leafLeft_3.midpoint);
    mesh_leafLeft_3.quaternion.copy(endpoint_leafLeft_3.quaternion);
  }
  mesh_leafLeft_3.castShadow = options.castShadow ?? true;
  mesh_leafLeft_3.receiveShadow = options.receiveShadow ?? true;
  mesh_leafLeft_3.userData.sculptComponent = { "id": "leafLeft", "name": "Left door leaf", "level": "macro", "role": "door", "importance": 1, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Charcoal leaf: raised border ring + recessed field + kick rail.", "geometryDescriptor": { "topologyIntent": "box door", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.leftJamb", "localStart": [-0.92, 1.07, 0.02], "localEnd": [-0.02, 1.07, 0.02], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.9, "height": 2, "depth": 0.06, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.47, 1.07, 0.02], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leafLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "charcoalSteel" } }, "material": "charcoalSteel", "materialLayers": ["charcoalSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "recessField", "what": "raised border + recessed field", "evidence": "evidence/door/di/zone-r1c1.png" }, { "id": "kickRail", "what": "stepped bottom rail", "evidence": "evidence/door/di/zone-r2c1.png" }], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(43, 45, 48, 1.0)", "secondaryAlbedo": "rgba(60, 63, 67, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_leafLeft_3.add(mesh_leafLeft_3);
  meshes["leafLeft"] = mesh_leafLeft_3;
  node_leafLeft_3.updateWorldMatrix(true, false);
  mesh_leafLeft_3.quaternion.identity();
  mesh_leafLeft_3.position.copy(node_leafLeft_3.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["leafLeft"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["leafLeft"] ??= [];
  destructionGroups["leafLeft"].push(node_leafLeft_3);
  const attachment_leafRight_4 = { "parentSocket": "frame.rightJamb", "localStart": [0.92, 1.07, 0.02], "localEnd": [0.02, 1.07, 0.02], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 };
  const endpoint_leafRight_4 = makeAttachmentEndpoint(attachment_leafRight_4);
  const node_leafRight_4 = new THREE2.Group();
  node_leafRight_4.name = "Right door leaf__pivot";
  node_leafRight_4.scale.set(1, 1, 1);
  if (endpoint_leafRight_4) {
    node_leafRight_4.position.copy(endpoint_leafRight_4.start);
    node_leafRight_4.rotation.set(0, 0, 0);
  } else {
    node_leafRight_4.position.set(0.47, 1.07, 0.02);
    node_leafRight_4.rotation.set(0, 0, 0);
  }
  node_leafRight_4.userData.sculptComponent = { "id": "leafRight", "name": "Right door leaf", "level": "macro", "role": "door", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Mirror of left leaf.", "geometryDescriptor": { "topologyIntent": "box door", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.rightJamb", "localStart": [0.92, 1.07, 0.02], "localEnd": [0.02, 1.07, 0.02], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.9, "height": 2, "depth": 0.06, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.47, 1.07, 0.02], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leafRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "charcoalSteel" } }, "material": "charcoalSteel", "materialLayers": ["charcoalSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(43, 45, 48, 1.0)", "secondaryAlbedo": "rgba(60, 63, 67, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_leafRight_4.userData.actionProfile = { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leafRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "charcoalSteel" } };
  (nodes["frame"] ?? root).add(node_leafRight_4);
  nodes["leafRight"] = node_leafRight_4;
  const mesh_leafRight_4Geometry = buildLeaf(0.47);
  const mesh_leafRight_4 = new THREE2.Mesh(
    mesh_leafRight_4Geometry,
    materialMap["charcoalSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_leafRight_4.name = "Right door leaf";
  if (endpoint_leafRight_4) {
    mesh_leafRight_4.position.copy(endpoint_leafRight_4.midpoint);
    mesh_leafRight_4.quaternion.copy(endpoint_leafRight_4.quaternion);
  }
  mesh_leafRight_4.castShadow = options.castShadow ?? true;
  mesh_leafRight_4.receiveShadow = options.receiveShadow ?? true;
  mesh_leafRight_4.userData.sculptComponent = { "id": "leafRight", "name": "Right door leaf", "level": "macro", "role": "door", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Mirror of left leaf.", "geometryDescriptor": { "topologyIntent": "box door", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.rightJamb", "localStart": [0.92, 1.07, 0.02], "localEnd": [0.02, 1.07, 0.02], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.9, "height": 2, "depth": 0.06, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.47, 1.07, 0.02], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leafRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "charcoalSteel" } }, "material": "charcoalSteel", "materialLayers": ["charcoalSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(43, 45, 48, 1.0)", "secondaryAlbedo": "rgba(60, 63, 67, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_leafRight_4.add(mesh_leafRight_4);
  meshes["leafRight"] = mesh_leafRight_4;
  node_leafRight_4.updateWorldMatrix(true, false);
  mesh_leafRight_4.quaternion.identity();
  mesh_leafRight_4.position.copy(node_leafRight_4.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["leafRight"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["leafRight"] ??= [];
  destructionGroups["leafRight"].push(node_leafRight_4);
  const attachment_visionLeft_5 = { "parentSocket": "leafLeft.cutout", "localStart": [-0.18, 1.3, 0.03], "localEnd": [-0.18, 1.94, 0.03], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_visionLeft_5 = makeAttachmentEndpoint(attachment_visionLeft_5);
  const node_visionLeft_5 = new THREE2.Group();
  node_visionLeft_5.name = "Vision slot (left)__pivot";
  node_visionLeft_5.scale.set(1, 1, 1);
  if (endpoint_visionLeft_5) {
    node_visionLeft_5.position.copy(endpoint_visionLeft_5.start);
    node_visionLeft_5.rotation.set(0, 0, 0);
  } else {
    node_visionLeft_5.position.set(-0.18, 1.62, 0.03);
    node_visionLeft_5.rotation.set(0, 0, 0);
  }
  node_visionLeft_5.userData.sculptComponent = { "id": "visionLeft", "name": "Vision slot (left)", "level": "meso", "role": "window", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Charcoal bezel ring + dark reflective glass slot, upper-mid, offset toward stile.", "geometryDescriptor": { "topologyIntent": "box window", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leafLeft", "attachment": { "parentSocket": "leafLeft.cutout", "localStart": [-0.18, 1.3, 0.03], "localEnd": [-0.18, 1.94, 0.03], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.14, "height": 0.62, "depth": 0.05, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.18, 1.62, 0.03], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "window", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "visionLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "glassDark", "materialLayers": ["glassDark"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(16, 18, 22, 1.0)", "secondaryAlbedo": "rgba(70, 76, 88, 1.0)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r0c1.png"] } };
  node_visionLeft_5.userData.actionProfile = { "animationRole": "window", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "visionLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } };
  (nodes["leafLeft"] ?? root).add(node_visionLeft_5);
  nodes["visionLeft"] = node_visionLeft_5;
  const mesh_visionLeft_5Geometry = buildVision(-0.18);
  const mesh_visionLeft_5 = new THREE2.Mesh(
    mesh_visionLeft_5Geometry,
    materialMap["glassDark"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_visionLeft_5.name = "Vision slot (left)";
  if (endpoint_visionLeft_5) {
    mesh_visionLeft_5.position.copy(endpoint_visionLeft_5.midpoint);
    mesh_visionLeft_5.quaternion.copy(endpoint_visionLeft_5.quaternion);
  }
  mesh_visionLeft_5.castShadow = options.castShadow ?? true;
  mesh_visionLeft_5.receiveShadow = options.receiveShadow ?? true;
  mesh_visionLeft_5.userData.sculptComponent = { "id": "visionLeft", "name": "Vision slot (left)", "level": "meso", "role": "window", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Charcoal bezel ring + dark reflective glass slot, upper-mid, offset toward stile.", "geometryDescriptor": { "topologyIntent": "box window", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leafLeft", "attachment": { "parentSocket": "leafLeft.cutout", "localStart": [-0.18, 1.3, 0.03], "localEnd": [-0.18, 1.94, 0.03], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.14, "height": 0.62, "depth": 0.05, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.18, 1.62, 0.03], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "window", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "visionLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "glassDark", "materialLayers": ["glassDark"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(16, 18, 22, 1.0)", "secondaryAlbedo": "rgba(70, 76, 88, 1.0)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r0c1.png"] } };
  node_visionLeft_5.add(mesh_visionLeft_5);
  meshes["visionLeft"] = mesh_visionLeft_5;
  node_visionLeft_5.updateWorldMatrix(true, false);
  mesh_visionLeft_5.quaternion.identity();
  mesh_visionLeft_5.position.copy(node_visionLeft_5.getWorldPosition(new THREE2.Vector3()).negate());
  {
    const gm = mesh_visionLeft_5.material;
    gm.map = null;
    gm.roughnessMap = null;
    gm.color.set("#181c24");
    gm.roughness = 0.07;
    gm.metalness = 0;
    gm.envMapIntensity = 1.3;
    gm.needsUpdate = true;
  }
  colliders["visionLeft"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["visionLeft"] ??= [];
  destructionGroups["visionLeft"].push(node_visionLeft_5);
  const attachment_visionRight_6 = { "parentSocket": "leafRight.cutout", "localStart": [0.18, 1.3, 0.03], "localEnd": [0.18, 1.94, 0.03], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_visionRight_6 = makeAttachmentEndpoint(attachment_visionRight_6);
  const node_visionRight_6 = new THREE2.Group();
  node_visionRight_6.name = "Vision slot (right)__pivot";
  node_visionRight_6.scale.set(1, 1, 1);
  if (endpoint_visionRight_6) {
    node_visionRight_6.position.copy(endpoint_visionRight_6.start);
    node_visionRight_6.rotation.set(0, 0, 0);
  } else {
    node_visionRight_6.position.set(0.18, 1.62, 0.03);
    node_visionRight_6.rotation.set(0, 0, 0);
  }
  node_visionRight_6.userData.sculptComponent = { "id": "visionRight", "name": "Vision slot (right)", "level": "meso", "role": "window", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Mirror of left slot.", "geometryDescriptor": { "topologyIntent": "box window", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leafRight", "attachment": { "parentSocket": "leafRight.cutout", "localStart": [0.18, 1.3, 0.03], "localEnd": [0.18, 1.94, 0.03], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.14, "height": 0.62, "depth": 0.05, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.18, 1.62, 0.03], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "window", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "visionRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "glassDark", "materialLayers": ["glassDark"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(16, 18, 22, 1.0)", "secondaryAlbedo": "rgba(70, 76, 88, 1.0)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r0c1.png"] } };
  node_visionRight_6.userData.actionProfile = { "animationRole": "window", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "visionRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } };
  (nodes["leafRight"] ?? root).add(node_visionRight_6);
  nodes["visionRight"] = node_visionRight_6;
  const mesh_visionRight_6Geometry = buildVision(0.18);
  const mesh_visionRight_6 = new THREE2.Mesh(
    mesh_visionRight_6Geometry,
    materialMap["glassDark"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_visionRight_6.name = "Vision slot (right)";
  if (endpoint_visionRight_6) {
    mesh_visionRight_6.position.copy(endpoint_visionRight_6.midpoint);
    mesh_visionRight_6.quaternion.copy(endpoint_visionRight_6.quaternion);
  }
  mesh_visionRight_6.castShadow = options.castShadow ?? true;
  mesh_visionRight_6.receiveShadow = options.receiveShadow ?? true;
  mesh_visionRight_6.userData.sculptComponent = { "id": "visionRight", "name": "Vision slot (right)", "level": "meso", "role": "window", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Mirror of left slot.", "geometryDescriptor": { "topologyIntent": "box window", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leafRight", "attachment": { "parentSocket": "leafRight.cutout", "localStart": [0.18, 1.3, 0.03], "localEnd": [0.18, 1.94, 0.03], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.14, "height": 0.62, "depth": 0.05, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.18, 1.62, 0.03], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "window", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "visionRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "glassDark", "materialLayers": ["glassDark"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(16, 18, 22, 1.0)", "secondaryAlbedo": "rgba(70, 76, 88, 1.0)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r0c1.png"] } };
  node_visionRight_6.add(mesh_visionRight_6);
  meshes["visionRight"] = mesh_visionRight_6;
  node_visionRight_6.updateWorldMatrix(true, false);
  mesh_visionRight_6.quaternion.identity();
  mesh_visionRight_6.position.copy(node_visionRight_6.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["visionRight"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["visionRight"] ??= [];
  destructionGroups["visionRight"].push(node_visionRight_6);
  const attachment_handleLeft_7 = { "parentSocket": "leafLeft.face", "localStart": [-0.1, 0.78, 0.05], "localEnd": [-0.1, 1.66, 0.05], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 };
  const endpoint_handleLeft_7 = makeAttachmentEndpoint(attachment_handleLeft_7);
  const node_handleLeft_7 = new THREE2.Group();
  node_handleLeft_7.name = "Bar pull (left)__pivot";
  node_handleLeft_7.scale.set(1, 1, 1);
  if (endpoint_handleLeft_7) {
    node_handleLeft_7.position.copy(endpoint_handleLeft_7.start);
    node_handleLeft_7.rotation.set(0, 0, 0);
  } else {
    node_handleLeft_7.position.set(-0.1, 1.2, 0.1);
    node_handleLeft_7.rotation.set(0, 0, 0);
  }
  node_handleLeft_7.userData.sculptComponent = { "id": "handleLeft", "name": "Bar pull (left)", "level": "meso", "role": "handle", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Long stainless bar on 2 standoffs beside the stile.", "geometryDescriptor": { "topologyIntent": "cylinder handle", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leafLeft", "attachment": { "parentSocket": "leafLeft.face", "localStart": [-0.1, 0.78, 0.05], "localEnd": [-0.1, 1.66, 0.05], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.03, "height": 0.9, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.1, 1.2, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handleLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_handleLeft_7.userData.actionProfile = { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handleLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } };
  (nodes["leafLeft"] ?? root).add(node_handleLeft_7);
  nodes["handleLeft"] = node_handleLeft_7;
  const mesh_handleLeft_7Geometry = buildHandle(-0.1);
  const mesh_handleLeft_7 = new THREE2.Mesh(
    mesh_handleLeft_7Geometry,
    materialMap["stainlessSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_handleLeft_7.name = "Bar pull (left)";
  if (endpoint_handleLeft_7) {
    mesh_handleLeft_7.position.copy(endpoint_handleLeft_7.midpoint);
    mesh_handleLeft_7.quaternion.copy(endpoint_handleLeft_7.quaternion);
  }
  mesh_handleLeft_7.castShadow = options.castShadow ?? true;
  mesh_handleLeft_7.receiveShadow = options.receiveShadow ?? true;
  mesh_handleLeft_7.userData.sculptComponent = { "id": "handleLeft", "name": "Bar pull (left)", "level": "meso", "role": "handle", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Long stainless bar on 2 standoffs beside the stile.", "geometryDescriptor": { "topologyIntent": "cylinder handle", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leafLeft", "attachment": { "parentSocket": "leafLeft.face", "localStart": [-0.1, 0.78, 0.05], "localEnd": [-0.1, 1.66, 0.05], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.03, "height": 0.9, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.1, 1.2, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handleLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_handleLeft_7.add(mesh_handleLeft_7);
  meshes["handleLeft"] = mesh_handleLeft_7;
  node_handleLeft_7.updateWorldMatrix(true, false);
  mesh_handleLeft_7.quaternion.identity();
  mesh_handleLeft_7.position.copy(node_handleLeft_7.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["handleLeft"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["handleLeft"] ??= [];
  destructionGroups["handleLeft"].push(node_handleLeft_7);
  const attachment_handleRight_8 = { "parentSocket": "leafRight.face", "localStart": [0.1, 0.78, 0.05], "localEnd": [0.1, 1.66, 0.05], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 };
  const endpoint_handleRight_8 = makeAttachmentEndpoint(attachment_handleRight_8);
  const node_handleRight_8 = new THREE2.Group();
  node_handleRight_8.name = "Bar pull (right)__pivot";
  node_handleRight_8.scale.set(1, 1, 1);
  if (endpoint_handleRight_8) {
    node_handleRight_8.position.copy(endpoint_handleRight_8.start);
    node_handleRight_8.rotation.set(0, 0, 0);
  } else {
    node_handleRight_8.position.set(0.1, 1.2, 0.1);
    node_handleRight_8.rotation.set(0, 0, 0);
  }
  node_handleRight_8.userData.sculptComponent = { "id": "handleRight", "name": "Bar pull (right)", "level": "meso", "role": "handle", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Mirror bar pull.", "geometryDescriptor": { "topologyIntent": "cylinder handle", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leafRight", "attachment": { "parentSocket": "leafRight.face", "localStart": [0.1, 0.78, 0.05], "localEnd": [0.1, 1.66, 0.05], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.03, "height": 0.9, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.1, 1.2, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handleRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_handleRight_8.userData.actionProfile = { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handleRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } };
  (nodes["leafRight"] ?? root).add(node_handleRight_8);
  nodes["handleRight"] = node_handleRight_8;
  const mesh_handleRight_8Geometry = buildHandle(0.1);
  const mesh_handleRight_8 = new THREE2.Mesh(
    mesh_handleRight_8Geometry,
    materialMap["stainlessSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_handleRight_8.name = "Bar pull (right)";
  if (endpoint_handleRight_8) {
    mesh_handleRight_8.position.copy(endpoint_handleRight_8.midpoint);
    mesh_handleRight_8.quaternion.copy(endpoint_handleRight_8.quaternion);
  }
  mesh_handleRight_8.castShadow = options.castShadow ?? true;
  mesh_handleRight_8.receiveShadow = options.receiveShadow ?? true;
  mesh_handleRight_8.userData.sculptComponent = { "id": "handleRight", "name": "Bar pull (right)", "level": "meso", "role": "handle", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Mirror bar pull.", "geometryDescriptor": { "topologyIntent": "cylinder handle", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leafRight", "attachment": { "parentSocket": "leafRight.face", "localStart": [0.1, 0.78, 0.05], "localEnd": [0.1, 1.66, 0.05], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.03, "height": 0.9, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.1, 1.2, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handleRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_handleRight_8.add(mesh_handleRight_8);
  meshes["handleRight"] = mesh_handleRight_8;
  node_handleRight_8.updateWorldMatrix(true, false);
  mesh_handleRight_8.quaternion.identity();
  mesh_handleRight_8.position.copy(node_handleRight_8.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["handleRight"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["handleRight"] ??= [];
  destructionGroups["handleRight"].push(node_handleRight_8);
  const attachment_closerLeft_9 = { "parentSocket": "leafLeft.top", "localStart": [-0.62, 2.03, 0.05], "localEnd": [-0.62, 2.11, 0.09], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_closerLeft_9 = makeAttachmentEndpoint(attachment_closerLeft_9);
  const node_closerLeft_9 = new THREE2.Group();
  node_closerLeft_9.name = "Door closer (left)__pivot";
  node_closerLeft_9.scale.set(1, 1, 1);
  if (endpoint_closerLeft_9) {
    node_closerLeft_9.position.copy(endpoint_closerLeft_9.start);
    node_closerLeft_9.rotation.set(0, 0, 0);
  } else {
    node_closerLeft_9.position.set(-0.62, 2.07, 0.07);
    node_closerLeft_9.rotation.set(0, 0, 0);
  }
  node_closerLeft_9.userData.sculptComponent = { "id": "closerLeft", "name": "Door closer (left)", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Stainless overhead closer box at leaf top.", "geometryDescriptor": { "topologyIntent": "box hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leafLeft", "attachment": { "parentSocket": "leafLeft.top", "localStart": [-0.62, 2.03, 0.05], "localEnd": [-0.62, 2.11, 0.09], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.34, "height": 0.07, "depth": 0.1, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.62, 2.07, 0.07], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closerLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_closerLeft_9.userData.actionProfile = { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closerLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } };
  (nodes["leafLeft"] ?? root).add(node_closerLeft_9);
  nodes["closerLeft"] = node_closerLeft_9;
  const mesh_closerLeft_9Geometry = buildCloser(-0.62);
  const mesh_closerLeft_9 = new THREE2.Mesh(
    mesh_closerLeft_9Geometry,
    materialMap["stainlessSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_closerLeft_9.name = "Door closer (left)";
  if (endpoint_closerLeft_9) {
    mesh_closerLeft_9.position.copy(endpoint_closerLeft_9.midpoint);
    mesh_closerLeft_9.quaternion.copy(endpoint_closerLeft_9.quaternion);
  }
  mesh_closerLeft_9.castShadow = options.castShadow ?? true;
  mesh_closerLeft_9.receiveShadow = options.receiveShadow ?? true;
  mesh_closerLeft_9.userData.sculptComponent = { "id": "closerLeft", "name": "Door closer (left)", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Stainless overhead closer box at leaf top.", "geometryDescriptor": { "topologyIntent": "box hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leafLeft", "attachment": { "parentSocket": "leafLeft.top", "localStart": [-0.62, 2.03, 0.05], "localEnd": [-0.62, 2.11, 0.09], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.34, "height": 0.07, "depth": 0.1, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.62, 2.07, 0.07], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closerLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_closerLeft_9.add(mesh_closerLeft_9);
  meshes["closerLeft"] = mesh_closerLeft_9;
  node_closerLeft_9.updateWorldMatrix(true, false);
  mesh_closerLeft_9.quaternion.identity();
  mesh_closerLeft_9.position.copy(node_closerLeft_9.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["closerLeft"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["closerLeft"] ??= [];
  destructionGroups["closerLeft"].push(node_closerLeft_9);
  const attachment_closerRight_10 = { "parentSocket": "leafRight.top", "localStart": [0.28, 2.01, 0.05], "localEnd": [0.28, 2.09, 0.09], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_closerRight_10 = makeAttachmentEndpoint(attachment_closerRight_10);
  const node_closerRight_10 = new THREE2.Group();
  node_closerRight_10.name = "Door closer (right)__pivot";
  node_closerRight_10.scale.set(1, 1, 1);
  if (endpoint_closerRight_10) {
    node_closerRight_10.position.copy(endpoint_closerRight_10.start);
    node_closerRight_10.rotation.set(0, 0, 0);
  } else {
    node_closerRight_10.position.set(0.28, 2.05, 0.07);
    node_closerRight_10.rotation.set(0, 0, 0);
  }
  node_closerRight_10.userData.sculptComponent = { "id": "closerRight", "name": "Door closer (right)", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Mirror closer.", "geometryDescriptor": { "topologyIntent": "box hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leafRight", "attachment": { "parentSocket": "leafRight.top", "localStart": [0.28, 2.01, 0.05], "localEnd": [0.28, 2.09, 0.09], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.34, "height": 0.07, "depth": 0.1, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.28, 2.05, 0.07], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closerRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_closerRight_10.userData.actionProfile = { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closerRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } };
  (nodes["leafRight"] ?? root).add(node_closerRight_10);
  nodes["closerRight"] = node_closerRight_10;
  const mesh_closerRight_10Geometry = buildCloser(0.28);
  const mesh_closerRight_10 = new THREE2.Mesh(
    mesh_closerRight_10Geometry,
    materialMap["stainlessSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_closerRight_10.name = "Door closer (right)";
  if (endpoint_closerRight_10) {
    mesh_closerRight_10.position.copy(endpoint_closerRight_10.midpoint);
    mesh_closerRight_10.quaternion.copy(endpoint_closerRight_10.quaternion);
  }
  mesh_closerRight_10.castShadow = options.castShadow ?? true;
  mesh_closerRight_10.receiveShadow = options.receiveShadow ?? true;
  mesh_closerRight_10.userData.sculptComponent = { "id": "closerRight", "name": "Door closer (right)", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Mirror closer.", "geometryDescriptor": { "topologyIntent": "box hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leafRight", "attachment": { "parentSocket": "leafRight.top", "localStart": [0.28, 2.01, 0.05], "localEnd": [0.28, 2.09, 0.09], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.34, "height": 0.07, "depth": 0.1, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.28, 2.05, 0.07], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closerRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_closerRight_10.add(mesh_closerRight_10);
  meshes["closerRight"] = mesh_closerRight_10;
  node_closerRight_10.updateWorldMatrix(true, false);
  mesh_closerRight_10.quaternion.identity();
  mesh_closerRight_10.position.copy(node_closerRight_10.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["closerRight"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["closerRight"] ??= [];
  destructionGroups["closerRight"].push(node_closerRight_10);
  const attachment_hingesLeft_11 = { "parentSocket": "frame.leftJamb", "localStart": [-0.94, 0.35, 0.02], "localEnd": [-0.94, 1.9, 0.02], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_hingesLeft_11 = makeAttachmentEndpoint(attachment_hingesLeft_11);
  const node_hingesLeft_11 = new THREE2.Group();
  node_hingesLeft_11.name = "Hinge set (left jamb)__pivot";
  node_hingesLeft_11.scale.set(1, 1, 1);
  if (endpoint_hingesLeft_11) {
    node_hingesLeft_11.position.copy(endpoint_hingesLeft_11.start);
    node_hingesLeft_11.rotation.set(0, 0, 0);
  } else {
    node_hingesLeft_11.position.set(-0.94, 1.1, 0.02);
    node_hingesLeft_11.rotation.set(0, 0, 0);
  }
  node_hingesLeft_11.userData.sculptComponent = { "id": "hingesLeft", "name": "Hinge set (left jamb)", "level": "meso", "role": "hinge", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "3 stainless butt hinges edge-on at the left jamb.", "geometryDescriptor": { "topologyIntent": "box hinge", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.leftJamb", "localStart": [-0.94, 0.35, 0.02], "localEnd": [-0.94, 1.9, 0.02], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.03, "height": 1.8, "depth": 0.05, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.94, 1.1, 0.02], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hinge", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hingesLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_hingesLeft_11.userData.actionProfile = { "animationRole": "hinge", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hingesLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } };
  (nodes["frame"] ?? root).add(node_hingesLeft_11);
  nodes["hingesLeft"] = node_hingesLeft_11;
  const mesh_hingesLeft_11Geometry = buildHinges(-0.945);
  const mesh_hingesLeft_11 = new THREE2.Mesh(
    mesh_hingesLeft_11Geometry,
    materialMap["stainlessSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_hingesLeft_11.name = "Hinge set (left jamb)";
  if (endpoint_hingesLeft_11) {
    mesh_hingesLeft_11.position.copy(endpoint_hingesLeft_11.midpoint);
    mesh_hingesLeft_11.quaternion.copy(endpoint_hingesLeft_11.quaternion);
  }
  mesh_hingesLeft_11.castShadow = options.castShadow ?? true;
  mesh_hingesLeft_11.receiveShadow = options.receiveShadow ?? true;
  mesh_hingesLeft_11.userData.sculptComponent = { "id": "hingesLeft", "name": "Hinge set (left jamb)", "level": "meso", "role": "hinge", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "3 stainless butt hinges edge-on at the left jamb.", "geometryDescriptor": { "topologyIntent": "box hinge", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.leftJamb", "localStart": [-0.94, 0.35, 0.02], "localEnd": [-0.94, 1.9, 0.02], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.03, "height": 1.8, "depth": 0.05, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.94, 1.1, 0.02], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hinge", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hingesLeft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_hingesLeft_11.add(mesh_hingesLeft_11);
  meshes["hingesLeft"] = mesh_hingesLeft_11;
  node_hingesLeft_11.updateWorldMatrix(true, false);
  mesh_hingesLeft_11.quaternion.identity();
  mesh_hingesLeft_11.position.copy(node_hingesLeft_11.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["hingesLeft"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["hingesLeft"] ??= [];
  destructionGroups["hingesLeft"].push(node_hingesLeft_11);
  const attachment_hingePlatesRight_12 = { "parentSocket": "frame.rightJamb", "localStart": [0.95, 0.35, 0.02], "localEnd": [0.95, 1.9, 0.02], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_hingePlatesRight_12 = makeAttachmentEndpoint(attachment_hingePlatesRight_12);
  const node_hingePlatesRight_12 = new THREE2.Group();
  node_hingePlatesRight_12.name = "Hinge plates (right)__pivot";
  node_hingePlatesRight_12.scale.set(1, 1, 1);
  if (endpoint_hingePlatesRight_12) {
    node_hingePlatesRight_12.position.copy(endpoint_hingePlatesRight_12.start);
    node_hingePlatesRight_12.rotation.set(0, 0, 0);
  } else {
    node_hingePlatesRight_12.position.set(0.95, 1.1, 0.02);
    node_hingePlatesRight_12.rotation.set(0, 0, 0);
  }
  node_hingePlatesRight_12.userData.sculptComponent = { "id": "hingePlatesRight", "name": "Hinge plates (right)", "level": "meso", "role": "hinge", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "3 small plates on the right frame edge.", "geometryDescriptor": { "topologyIntent": "box hinge", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.rightJamb", "localStart": [0.95, 0.35, 0.02], "localEnd": [0.95, 1.9, 0.02], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.02, "height": 1.8, "depth": 0.03, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.95, 1.1, 0.02], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hinge", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hingePlatesRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_hingePlatesRight_12.userData.actionProfile = { "animationRole": "hinge", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hingePlatesRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } };
  (nodes["frame"] ?? root).add(node_hingePlatesRight_12);
  nodes["hingePlatesRight"] = node_hingePlatesRight_12;
  const mesh_hingePlatesRight_12Geometry = buildHingePlates(0.95);
  const mesh_hingePlatesRight_12 = new THREE2.Mesh(
    mesh_hingePlatesRight_12Geometry,
    materialMap["stainlessSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_hingePlatesRight_12.name = "Hinge plates (right)";
  if (endpoint_hingePlatesRight_12) {
    mesh_hingePlatesRight_12.position.copy(endpoint_hingePlatesRight_12.midpoint);
    mesh_hingePlatesRight_12.quaternion.copy(endpoint_hingePlatesRight_12.quaternion);
  }
  mesh_hingePlatesRight_12.castShadow = options.castShadow ?? true;
  mesh_hingePlatesRight_12.receiveShadow = options.receiveShadow ?? true;
  mesh_hingePlatesRight_12.userData.sculptComponent = { "id": "hingePlatesRight", "name": "Hinge plates (right)", "level": "meso", "role": "hinge", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "3 small plates on the right frame edge.", "geometryDescriptor": { "topologyIntent": "box hinge", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.rightJamb", "localStart": [0.95, 0.35, 0.02], "localEnd": [0.95, 1.9, 0.02], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.02, "height": 1.8, "depth": 0.03, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.95, 1.1, 0.02], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hinge", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hingePlatesRight", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_hingePlatesRight_12.add(mesh_hingePlatesRight_12);
  meshes["hingePlatesRight"] = mesh_hingePlatesRight_12;
  node_hingePlatesRight_12.updateWorldMatrix(true, false);
  mesh_hingePlatesRight_12.quaternion.identity();
  mesh_hingePlatesRight_12.position.copy(node_hingePlatesRight_12.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["hingePlatesRight"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["hingePlatesRight"] ??= [];
  destructionGroups["hingePlatesRight"].push(node_hingePlatesRight_12);
  const attachment_feet_13 = { "parentSocket": "frame.sill", "localStart": [-0.85, 0, 0.04], "localEnd": [0.85, 0.04, 0.04], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_feet_13 = makeAttachmentEndpoint(attachment_feet_13);
  const node_feet_13 = new THREE2.Group();
  node_feet_13.name = "Adjustable feet__pivot";
  node_feet_13.scale.set(1, 1, 1);
  if (endpoint_feet_13) {
    node_feet_13.position.copy(endpoint_feet_13.start);
    node_feet_13.rotation.set(0, 0, 0);
  } else {
    node_feet_13.position.set(0, 0.02, 0.04);
    node_feet_13.rotation.set(0, 0, 0);
  }
  node_feet_13.userData.sculptComponent = { "id": "feet", "name": "Adjustable feet", "level": "meso", "role": "mount", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "2 chrome squat feet under the front corners.", "geometryDescriptor": { "topologyIntent": "cylinder mount", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.sill", "localStart": [-0.85, 0, 0.04], "localEnd": [0.85, 0.04, 0.04], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.08, "height": 0.04, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0.02, 0.04], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "mount", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "feet", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_feet_13.userData.actionProfile = { "animationRole": "mount", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "feet", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } };
  (nodes["frame"] ?? root).add(node_feet_13);
  nodes["feet"] = node_feet_13;
  const mesh_feet_13Geometry = buildFeet();
  const mesh_feet_13 = new THREE2.Mesh(
    mesh_feet_13Geometry,
    materialMap["stainlessSteel"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_feet_13.name = "Adjustable feet";
  if (endpoint_feet_13) {
    mesh_feet_13.position.copy(endpoint_feet_13.midpoint);
    mesh_feet_13.quaternion.copy(endpoint_feet_13.quaternion);
  }
  mesh_feet_13.castShadow = options.castShadow ?? true;
  mesh_feet_13.receiveShadow = options.receiveShadow ?? true;
  mesh_feet_13.userData.sculptComponent = { "id": "feet", "name": "Adjustable feet", "level": "meso", "role": "mount", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "2 chrome squat feet under the front corners.", "geometryDescriptor": { "topologyIntent": "cylinder mount", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.sill", "localStart": [-0.85, 0, 0.04], "localEnd": [0.85, 0.04, 0.04], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.08, "height": 0.04, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0.02, 0.04], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "mount", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "feet", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "charcoalSteel" } }, "material": "stainlessSteel", "materialLayers": ["stainlessSteel"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.55, "microRoughness": 0.15, "bumpAmplitude": 3e-3, "normalPattern": "powder-coat grain", "displacementPattern": "", "occlusionPattern": "panel recesses", "edgeWearPattern": "bevel highlights", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(184, 188, 192, 1.0)", "secondaryAlbedo": "rgba(140, 144, 150, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/door/di/zone-r1c1.png"] } };
  node_feet_13.add(mesh_feet_13);
  meshes["feet"] = mesh_feet_13;
  node_feet_13.updateWorldMatrix(true, false);
  mesh_feet_13.quaternion.identity();
  mesh_feet_13.position.copy(node_feet_13.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["feet"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["feet"] ??= [];
  destructionGroups["feet"].push(node_feet_13);
  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups };
  root.userData.lookDevTargets = { "qualityPriority": "reference-fidelity", "materialPass": { "albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": { "requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry" }, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"] }, "lightingPass": { "requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"] }, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."] };
  root.userData.actionReadiness = {
    note: "Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets."
  };
  return root;
}
export {
  createDoubleFireDoorSetModel
};
