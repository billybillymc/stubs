/* LED poster display case, procedurally built.
   Bundled with esbuild from C:/side/objects/src/createLEDPosterDisplayCaseModel.ts
   (+ posterGeometry.ts), `three` external so it resolves through this page's
   importmap. Look-dev/composer exports tree-shaken; their dead three/examples
   imports stripped. Generated — rebuild from source, don't hand-edit. */
// src/createLEDPosterDisplayCaseModel.ts
import * as THREE2 from "three";

// src/posterGeometry.ts
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
function ring(outerW, outerH, rail, d, z) {
  const iw = outerW - 2 * rail;
  const ih = outerH - 2 * rail;
  return [
    box(outerW, rail, d, 0, (outerH - rail) / 2, z),
    box(outerW, rail, d, 0, -(outerH - rail) / 2, z),
    box(rail, ih, d, -(outerW - rail) / 2, 0, z),
    box(rail, ih, d, (outerW - rail) / 2, 0, z)
  ];
}
function buildCaseBody() {
  const geos = [];
  geos.push(...ring(1, 1.35, 0.045, 0.1, -0.01));
  geos.push(box(0.94, 1.29, 0.012, 0, 0, -0.055));
  return merge(geos);
}
function buildDoorFrame() {
  const geos = [];
  geos.push(...ring(1, 1.35, 0.06, 0.035, 0.0575));
  geos.push(...ring(0.9, 1.25, 0.014, 0.012, 0.045));
  return merge(geos);
}
function buildGlass() {
  const g = new THREE.PlaneGeometry(0.88, 1.23);
  g.translate(0, 0, 0.05);
  return g;
}
function buildLedRing() {
  return merge(ring(0.86, 1.21, 0.022, 6e-3, 0.018));
}
function buildLedDots() {
  const geos = [];
  const w = 0.86 - 0.022, h = 1.21 - 0.022;
  const dot = (x, y) => {
    const s = new THREE.SphereGeometry(5e-3, 6, 5);
    s.translate(x, y, 0.022);
    geos.push(s);
  };
  const nx = Math.floor(w / 0.032), ny = Math.floor(h / 0.032);
  for (let i = 0; i <= nx; i += 1) {
    const x = -w / 2 + i / nx * w;
    dot(x, h / 2);
    dot(x, -h / 2);
  }
  for (let j = 1; j < ny; j += 1) {
    const y = -h / 2 + j / ny * h;
    dot(w / 2, y);
    dot(-w / 2, y);
  }
  return merge(geos);
}
function buildMatWarm() {
  return merge(ring(0.76, 1.06, 0.05, 4e-3, 8e-3));
}
function buildMatRecess() {
  return merge(ring(0.88, 1.23, 0.045, 4e-3, 5e-3));
}
function buildMoulding() {
  const geos = [];
  geos.push(...ring(0.68, 0.94, 0.03, 0.012, 0.014));
  geos.push(...ring(0.64, 0.9, 0.012, 0.018, 0.018));
  return merge(geos);
}
function buildPoster() {
  const g = new THREE.PlaneGeometry(0.62, 0.86);
  g.translate(0, 0, 0.011);
  return g;
}
function buildBracket(y) {
  const geos = [];
  geos.push(box(0.02, 0.14, 0.085, -0.503, y, -0.095));
  geos.push(box(0.055, 0.14, 0.012, -0.522, y, -0.139));
  for (const dy of [-0.045, 0.045]) {
    const s = new THREE.CylinderGeometry(8e-3, 8e-3, 8e-3, 10).rotateX(Math.PI / 2);
    s.translate(-0.538, y + dy, -0.132);
    geos.push(s);
  }
  return merge(geos);
}
function buildHinge(y) {
  const geos = [];
  geos.push(box(0.014, 0.09, 0.026, -0.499, y, 0.052));
  const pin = new THREE.CylinderGeometry(7e-3, 7e-3, 0.1, 10);
  pin.translate(-0.505, y, 0.052);
  geos.push(pin);
  return merge(geos);
}
function buildLock() {
  const geos = [];
  const body = new THREE.CylinderGeometry(0.02, 0.022, 0.022, 20).rotateX(Math.PI / 2);
  body.translate(0.455, 0, 0.082);
  geos.push(body);
  const key = new THREE.BoxGeometry(5e-3, 0.018, 6e-3);
  key.translate(0.455, 0, 0.092);
  geos.push(key);
  return merge(geos);
}

// src/createLEDPosterDisplayCaseModel.ts
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
function createLEDPosterDisplayCaseModel(options = {}) {
  const root = new THREE2.Group();
  root.name = "LED Poster Display Case";
  root.userData.reconstructionEvidence = { "itemFamily": null, "subtype": null, "componentAdapter": null, "route": null, "exactnessTier": null, "referenceCamera": { "solved": false, "fovDegrees": 30, "aspect": 1, "orientation": { "yaw": -28, "pitch": 2, "roll": 0 }, "positionHint": [-1.6, 0, 3], "note": "3/4 from the left, near eye level." }, "approximationNotes": [] };
  root.userData.materialPipeline = {};
  root.userData.materialReferenceRegistry = null;
  const materialMap = {};
  materialMap["blackAluminum"] = createSculptMaterial(
    "blackAluminum",
    { "id": "blackAluminum", "name": "Black brushed aluminum", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#191a1c", "color": "#191a1c", "albedo": { "dominant": "#141416", "secondary": ["#26282c", "#0c0c0e"], "samplingNotes": "sampled from reference regions" }, "colorVariation": { "palette": ["#141416", "#26282c", "#0c0c0e"], "pattern": "subtle", "amplitude": 0.08, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.2, "role": "broad tone variation" }, { "id": "meso", "frequency": 18, "amplitude": 0.12, "role": "vertical brush lines" }, { "id": "micro", "frequency": 70, "amplitude": 0.06, "role": "micro roughness breakup" }], "roughness": { "base": 0.9, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brush-line variation" }, "metalness": { "base": 0, "variation": 0 }, "normal": { "pattern": "brush lines / print grain (independent)", "strength": 0.15, "scale": 20, "space": "tangent" }, "bump": { "pattern": "brush", "amplitude": 4e-3, "scale": 26 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.4, "contactShadowBias": 0.3, "notes": "frame inner corners" }, "wear": { "edgeWear": 0.1, "scratches": [], "chips": [] }, "dirt": { "amount": 0.05, "cavityBias": 0.5, "color": "#101012" }, "localOverrides": [], "shaderNotes": ["Case/door/bracket metal; vertical brush anisotropy hint; edge highlights."], "notes": "Case/door/bracket metal; vertical brush anisotropy hint; edge highlights.", "finishClass": "worn-composite", "texturePalette": ["#141416", "#1e2022", "#0c0c0e", "#26282c", "#101012"], "proceduralTexture": "mottle", "clearcoat": { "base": 0, "variation": 0 }, "clearcoatRoughness": { "base": 0, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 0.5, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\poster\\mat\\crop-blackAluminum.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/poster/pbr/blackAluminum/blackaluminum_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/poster/pbr/blackAluminum/blackaluminum_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/poster/pbr/blackAluminum/blackaluminum_height.png", "channel": "height" }, "normal": { "path": "evidence/poster/pbr/blackAluminum/blackaluminum_normal.png", "channel": "normal" }, "ao": { "path": "evidence/poster/pbr/blackAluminum/blackaluminum_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["steelHardware"] = createSculptMaterial(
    "steelHardware",
    { "id": "steelHardware", "name": "Steel hardware", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#96989c", "color": "#96989c", "albedo": { "dominant": "#96989c", "secondary": ["#64666a", "#c0c2c6"], "samplingNotes": "sampled from reference regions" }, "colorVariation": { "palette": ["#96989c", "#64666a", "#c0c2c6"], "pattern": "subtle", "amplitude": 0.08, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.2, "role": "broad tone variation" }, { "id": "meso", "frequency": 18, "amplitude": 0.12, "role": "machining marks" }, { "id": "micro", "frequency": 70, "amplitude": 0.06, "role": "micro roughness breakup" }], "roughness": { "base": 0.5, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brush-line variation" }, "metalness": { "base": 0, "variation": 0 }, "normal": { "pattern": "brush lines / print grain (independent)", "strength": 0.15, "scale": 20, "space": "tangent" }, "bump": { "pattern": "brush", "amplitude": 4e-3, "scale": 26 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.4, "contactShadowBias": 0.3, "notes": "frame inner corners" }, "wear": { "edgeWear": 0.1, "scratches": [], "chips": [] }, "dirt": { "amount": 0.05, "cavityBias": 0.5, "color": "#101012" }, "localOverrides": [], "shaderNotes": ["Hinges + lock."], "notes": "Hinges + lock.", "finishClass": "painted-metal", "texturePalette": ["#191816", "#191817", "#151513", "#181716", "#3A3B3A"], "proceduralTexture": "flat-clearcoat", "clearcoat": { "base": 1, "variation": 0 }, "clearcoatRoughness": { "base": 0.05, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 1, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\poster\\mat\\crop-steelHardware.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.768, "estimatedFidelity": 0.768, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/poster/pbr/steelHardware/steelhardware_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/poster/pbr/steelHardware/steelhardware_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/poster/pbr/steelHardware/steelhardware_height.png", "channel": "height" }, "normal": { "path": "evidence/poster/pbr/steelHardware/steelhardware_normal.png", "channel": "normal" }, "ao": { "path": "evidence/poster/pbr/steelHardware/steelhardware_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["glassClear"] = createSculptMaterial(
    "glassClear",
    { "id": "glassClear", "name": "Glass", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#e6ebf0", "color": "#e6ebf0", "albedo": { "dominant": "#e6ebf0", "secondary": ["#ffffff"], "samplingNotes": "sampled from reference regions" }, "colorVariation": { "palette": ["#e6ebf0", "#ffffff"], "pattern": "subtle", "amplitude": 0.08, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.2, "role": "broad tone variation" }, { "id": "meso", "frequency": 18, "amplitude": 0.12, "role": "smudge patches" }, { "id": "micro", "frequency": 70, "amplitude": 0.06, "role": "micro roughness breakup" }], "roughness": { "base": 0.35, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brush-line variation" }, "metalness": { "base": 1, "variation": 0 }, "normal": { "pattern": "brush lines / print grain (independent)", "strength": 0.15, "scale": 20, "space": "tangent" }, "bump": { "pattern": "brush", "amplitude": 4e-3, "scale": 26 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.4, "contactShadowBias": 0.3, "notes": "frame inner corners" }, "wear": { "edgeWear": 0.1, "scratches": [], "chips": [] }, "dirt": { "amount": 0.05, "cavityBias": 0.5, "color": "#101012" }, "localOverrides": [], "shaderNotes": ["Thin glazing: transmission 0.92, subtle diagonal streak via env; fingerprint smudges as local roughness (approximate)."], "notes": "Thin glazing: transmission 0.92, subtle diagonal streak via env; fingerprint smudges as local roughness (approximate).", "transmission": { "base": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "finishClass": "brushed-steel", "texturePalette": ["#7C776E", "#8B867E", "#959088", "#AAA8A4", "#BDBCB9"], "proceduralTexture": "brushed", "clearcoat": { "base": 0, "variation": 0 }, "clearcoatRoughness": { "base": 0, "variation": 0 }, "envMapIntensity": 1, "anisotropy": { "base": 1 }, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\poster\\mat\\crop-glassClear.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/poster/pbr/glassClear/glassclear_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/poster/pbr/glassClear/glassclear_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/poster/pbr/glassClear/glassclear_height.png", "channel": "height" }, "normal": { "path": "evidence/poster/pbr/glassClear/glassclear_normal.png", "channel": "normal" }, "ao": { "path": "evidence/poster/pbr/glassClear/glassclear_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["ledEmissive"] = createSculptMaterial(
    "ledEmissive",
    { "id": "ledEmissive", "name": "LED strip", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#ffe6bf", "color": "#ffe6bf", "albedo": { "dominant": "#ffe6bf", "secondary": ["#fff4e0"], "samplingNotes": "sampled from reference regions" }, "colorVariation": { "palette": ["#ffe6bf", "#fff4e0"], "pattern": "subtle", "amplitude": 0.08, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.2, "role": "broad tone variation" }, { "id": "meso", "frequency": 18, "amplitude": 0.12, "role": "emitter dots" }, { "id": "micro", "frequency": 70, "amplitude": 0.06, "role": "micro roughness breakup" }], "roughness": { "base": 0.35, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brush-line variation" }, "metalness": { "base": 1, "variation": 0 }, "normal": { "pattern": "brush lines / print grain (independent)", "strength": 0.15, "scale": 20, "space": "tangent" }, "bump": { "pattern": "brush", "amplitude": 4e-3, "scale": 26 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.4, "contactShadowBias": 0.3, "notes": "frame inner corners" }, "wear": { "edgeWear": 0.1, "scratches": [], "chips": [] }, "dirt": { "amount": 0.05, "cavityBias": 0.5, "color": "#101012" }, "localOverrides": [], "shaderNotes": ["Warm-white emissive band, emitter dots brighter; practical RectArea/point lights tint interior."], "notes": "Warm-white emissive band, emitter dots brighter; practical RectArea/point lights tint interior.", "emissive": { "palette": ["#ffe6bf"], "intensity": 2.5 }, "finishClass": "brushed-steel", "texturePalette": ["#F5F2EA", "#FCFBF0", "#CCCAC4", "#16140F", "#BDBDBC"], "proceduralTexture": "brushed", "clearcoat": { "base": 0, "variation": 0 }, "clearcoatRoughness": { "base": 0, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 1, "anisotropy": { "base": 1 }, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\poster\\mat\\crop-ledEmissive.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/poster/pbr/ledEmissive/ledemissive_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/poster/pbr/ledEmissive/ledemissive_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/poster/pbr/ledEmissive/ledemissive_height.png", "channel": "height" }, "normal": { "path": "evidence/poster/pbr/ledEmissive/ledemissive_normal.png", "channel": "normal" }, "ao": { "path": "evidence/poster/pbr/ledEmissive/ledemissive_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["matBoardMat"] = createSculptMaterial(
    "matBoardMat",
    { "id": "matBoardMat", "name": "Mat board", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#f2e2c8", "color": "#f2e2c8", "albedo": { "dominant": "#f2e2c8", "secondary": ["#c8b8a0", "#2a2a2c"], "samplingNotes": "sampled from reference regions" }, "colorVariation": { "palette": ["#f2e2c8", "#c8b8a0", "#2a2a2c"], "pattern": "subtle", "amplitude": 0.08, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.2, "role": "broad tone variation" }, { "id": "meso", "frequency": 18, "amplitude": 0.12, "role": "paper grain" }, { "id": "micro", "frequency": 70, "amplitude": 0.06, "role": "micro roughness breakup" }], "roughness": { "base": 0.6, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brush-line variation" }, "metalness": { "base": 0.05, "variation": 0 }, "normal": { "pattern": "brush lines / print grain (independent)", "strength": 0.15, "scale": 20, "space": "tangent" }, "bump": { "pattern": "brush", "amplitude": 4e-3, "scale": 26 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.4, "contactShadowBias": 0.3, "notes": "frame inner corners" }, "wear": { "edgeWear": 0.1, "scratches": [], "chips": [] }, "dirt": { "amount": 0.05, "cavityBias": 0.5, "color": "#101012" }, "localOverrides": [], "shaderNotes": ["Warm lit mat ring; darker recess ring #2a2a2c just inside the door frame."], "notes": "Warm lit mat ring; darker recess ring #2a2a2c just inside the door frame.", "finishClass": "plastic", "texturePalette": ["#e2d0b0", "#cdbb9c", "#efdfc2", "#bfae90", "#d8c6a8"], "proceduralTexture": "flat-clearcoat", "clearcoat": { "base": 0.2, "variation": 0 }, "clearcoatRoughness": { "base": 0.3, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 0.7, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\poster\\mat\\crop-matBoardMat.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.716, "estimatedFidelity": 0.716, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/poster/pbr/matBoardMat/matboardmat_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/poster/pbr/matBoardMat/matboardmat_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/poster/pbr/matBoardMat/matboardmat_height.png", "channel": "height" }, "normal": { "path": "evidence/poster/pbr/matBoardMat/matboardmat_normal.png", "channel": "normal" }, "ao": { "path": "evidence/poster/pbr/matBoardMat/matboardmat_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["posterArt"] = createSculptMaterial(
    "posterArt",
    { "id": "posterArt", "name": "Poster print (projection)", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#503c8c", "color": "#503c8c", "albedo": { "dominant": "#503c8c", "secondary": ["#f050c8", "#40d8f0"], "samplingNotes": "sampled from reference regions" }, "colorVariation": { "palette": ["#503c8c", "#f050c8", "#40d8f0"], "pattern": "subtle", "amplitude": 0.08, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.2, "role": "broad tone variation" }, { "id": "meso", "frequency": 18, "amplitude": 0.12, "role": "print grain" }, { "id": "micro", "frequency": 70, "amplitude": 0.06, "role": "micro roughness breakup" }], "roughness": { "base": 0.18, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brush-line variation" }, "metalness": { "base": 0.35, "variation": 0 }, "normal": { "pattern": "brush lines / print grain (independent)", "strength": 0.15, "scale": 20, "space": "tangent" }, "bump": { "pattern": "brush", "amplitude": 4e-3, "scale": 26 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.4, "contactShadowBias": 0.3, "notes": "frame inner corners" }, "wear": { "edgeWear": 0.1, "scratches": [], "chips": [] }, "dirt": { "amount": 0.05, "cavityBias": 0.5, "color": "#101012" }, "localOverrides": [], "shaderNotes": ["PROJECTION: albedo map = evidence/poster/poster-delit.png (rectified + de-lit reference crop). Slight emissive of same map (backlit ~0.35). Glare/fingerprints partially baked (stated limitation)."], "notes": "PROJECTION: albedo map = evidence/poster/poster-delit.png (rectified + de-lit reference crop). Slight emissive of same map (backlit ~0.35). Glare/fingerprints partially baked (stated limitation).", "emissive": { "map": "same-as-albedo", "intensity": 0.35 }, "finishClass": "candy-coat", "texturePalette": ["#4F486B", "#5A5A7B", "#444B69", "#3B375A", "#27293E"], "proceduralTexture": "gradient-smoke", "clearcoat": { "base": 0.6, "variation": 0 }, "clearcoatRoughness": { "base": 0.15, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 0.7, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\poster\\mat\\crop-posterArt-small.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.827, "estimatedFidelity": 0.827, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/poster/pbr/posterArt/posterart_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/poster/pbr/posterArt/posterart_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/poster/pbr/posterArt/posterart_height.png", "channel": "height" }, "normal": { "path": "evidence/poster/pbr/posterArt/posterart_normal.png", "channel": "normal" }, "ao": { "path": "evidence/poster/pbr/posterArt/posterart_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["bronzeMoulding"] = createSculptMaterial(
    "bronzeMoulding",
    { "id": "bronzeMoulding", "name": "Bronze moulding", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#6e5c46", "color": "#6e5c46", "albedo": { "dominant": "#6e5c46", "secondary": ["#3c3228", "#8a7458"], "samplingNotes": "sampled from reference regions" }, "colorVariation": { "palette": ["#6e5c46", "#3c3228", "#8a7458"], "pattern": "subtle", "amplitude": 0.08, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.2, "role": "broad tone variation" }, { "id": "meso", "frequency": 18, "amplitude": 0.12, "role": "bevel facets" }, { "id": "micro", "frequency": 70, "amplitude": 0.06, "role": "micro roughness breakup" }], "roughness": { "base": 0.5, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brush-line variation" }, "metalness": { "base": 0, "variation": 0 }, "normal": { "pattern": "brush lines / print grain (independent)", "strength": 0.15, "scale": 20, "space": "tangent" }, "bump": { "pattern": "brush", "amplitude": 4e-3, "scale": 26 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.4, "contactShadowBias": 0.3, "notes": "frame inner corners" }, "wear": { "edgeWear": 0.1, "scratches": [], "chips": [] }, "dirt": { "amount": 0.05, "cavityBias": 0.5, "color": "#101012" }, "localOverrides": [], "shaderNotes": ["Beveled picture-frame moulding."], "notes": "Beveled picture-frame moulding.", "finishClass": "painted-metal", "texturePalette": ["#3E3666", "#3B356B", "#383B75", "#3A3C73", "#333060"], "proceduralTexture": "flat-clearcoat", "clearcoat": { "base": 1, "variation": 0 }, "clearcoatRoughness": { "base": 0.05, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 1, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\poster\\mat\\crop-bronzeMoulding.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.751, "estimatedFidelity": 0.751, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/poster/pbr/bronzeMoulding/bronzemoulding_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/poster/pbr/bronzeMoulding/bronzemoulding_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/poster/pbr/bronzeMoulding/bronzemoulding_height.png", "channel": "height" }, "normal": { "path": "evidence/poster/pbr/bronzeMoulding/bronzemoulding_normal.png", "channel": "normal" }, "ao": { "path": "evidence/poster/pbr/bronzeMoulding/bronzemoulding_ao.png", "channel": "ao" } } } },
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
  node_root_0.name = "LED Poster Display Case__pivot";
  node_root_0.scale.set(1, 1, 1);
  if (endpoint_root_0) {
    node_root_0.position.copy(endpoint_root_0.start);
    node_root_0.rotation.set(0, 0, 0);
  } else {
    node_root_0.position.set(0, 0, 0);
    node_root_0.rotation.set(0, 0, 0);
  }
  node_root_0.userData.sculptComponent = { "id": "root", "name": "LED Poster Display Case", "level": "macro", "role": "body", "importance": 1, "confidence": 0.5, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Group pivot; geometry in children.", "geometryDescriptor": { "topologyIntent": "container", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": null, "attachment": null, "dimensions": { "width": 1, "height": 1.35, "depth": 0.2, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } }, "material": "blackAluminum", "materialLayers": ["blackAluminum"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0, "microRoughness": 0, "bumpAmplitude": 0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(25, 26, 28, 1.0)", "secondaryAlbedo": "rgba(58, 60, 64, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_root_0.userData.actionProfile = { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } };
  (nodes["root"] ?? root).add(node_root_0);
  nodes["root"] = node_root_0;
  const mesh_root_0Geometry = endpoint_root_0 ? new THREE2.CylinderGeometry(endpoint_root_0.endRadius, endpoint_root_0.baseRadius, endpoint_root_0.length, 32, 12) : new THREE2.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_root_0) {
    mesh_root_0Geometry.scale(1, 1, 1);
  }
  const mesh_root_0 = new THREE2.Mesh(
    mesh_root_0Geometry,
    materialMap["blackAluminum"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_root_0.name = "LED Poster Display Case";
  if (endpoint_root_0) {
    mesh_root_0.position.copy(endpoint_root_0.midpoint);
    mesh_root_0.quaternion.copy(endpoint_root_0.quaternion);
  }
  mesh_root_0.castShadow = options.castShadow ?? true;
  mesh_root_0.receiveShadow = options.receiveShadow ?? true;
  mesh_root_0.userData.sculptComponent = { "id": "root", "name": "LED Poster Display Case", "level": "macro", "role": "body", "importance": 1, "confidence": 0.5, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Group pivot; geometry in children.", "geometryDescriptor": { "topologyIntent": "container", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": null, "attachment": null, "dimensions": { "width": 1, "height": 1.35, "depth": 0.2, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } }, "material": "blackAluminum", "materialLayers": ["blackAluminum"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0, "microRoughness": 0, "bumpAmplitude": 0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(25, 26, 28, 1.0)", "secondaryAlbedo": "rgba(58, 60, 64, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  mesh_root_0.visible = false;
  node_root_0.add(mesh_root_0);
  meshes["root"] = mesh_root_0;
  colliders["root"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." };
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_root_0);
  const attachment_caseBody_1 = null;
  const endpoint_caseBody_1 = makeAttachmentEndpoint(attachment_caseBody_1);
  const node_caseBody_1 = new THREE2.Group();
  node_caseBody_1.name = "Case body shell__pivot";
  node_caseBody_1.scale.set(1, 1, 1);
  if (endpoint_caseBody_1) {
    node_caseBody_1.position.copy(endpoint_caseBody_1.start);
    node_caseBody_1.rotation.set(0, 0, 0);
  } else {
    node_caseBody_1.position.set(0, 0, -0.01);
    node_caseBody_1.rotation.set(0, 0, 0);
  }
  node_caseBody_1.userData.sculptComponent = { "id": "caseBody", "name": "Case body shell", "level": "macro", "role": "body", "importance": 1, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Deep rectangular shell: 4 side walls + back panel; mitered look via bevel.", "geometryDescriptor": { "topologyIntent": "box body", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": null, "dimensions": { "width": 1, "height": 1.35, "depth": 0.1, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, -0.01], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "body", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "caseBody", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "blackAluminum", "materialLayers": ["blackAluminum"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "brushTexture", "what": "vertical brush lines on rails", "evidence": "evidence/poster/di/zone-r1c0.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(25, 26, 28, 1.0)", "secondaryAlbedo": "rgba(58, 60, 64, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_caseBody_1.userData.actionProfile = { "animationRole": "body", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "caseBody", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } };
  (nodes["root"] ?? root).add(node_caseBody_1);
  nodes["caseBody"] = node_caseBody_1;
  const mesh_caseBody_1Geometry = buildCaseBody();
  const mesh_caseBody_1 = new THREE2.Mesh(
    mesh_caseBody_1Geometry,
    materialMap["blackAluminum"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_caseBody_1.name = "Case body shell";
  if (endpoint_caseBody_1) {
    mesh_caseBody_1.position.copy(endpoint_caseBody_1.midpoint);
    mesh_caseBody_1.quaternion.copy(endpoint_caseBody_1.quaternion);
  }
  mesh_caseBody_1.castShadow = options.castShadow ?? true;
  mesh_caseBody_1.receiveShadow = options.receiveShadow ?? true;
  mesh_caseBody_1.userData.sculptComponent = { "id": "caseBody", "name": "Case body shell", "level": "macro", "role": "body", "importance": 1, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Deep rectangular shell: 4 side walls + back panel; mitered look via bevel.", "geometryDescriptor": { "topologyIntent": "box body", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": null, "dimensions": { "width": 1, "height": 1.35, "depth": 0.1, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, -0.01], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "body", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "caseBody", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "blackAluminum", "materialLayers": ["blackAluminum"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "brushTexture", "what": "vertical brush lines on rails", "evidence": "evidence/poster/di/zone-r1c0.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(25, 26, 28, 1.0)", "secondaryAlbedo": "rgba(58, 60, 64, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_caseBody_1.add(mesh_caseBody_1);
  meshes["caseBody"] = mesh_caseBody_1;
  node_caseBody_1.updateWorldMatrix(true, false);
  mesh_caseBody_1.quaternion.identity();
  mesh_caseBody_1.position.copy(node_caseBody_1.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["caseBody"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["caseBody"] ??= [];
  destructionGroups["caseBody"].push(node_caseBody_1);
  const attachment_doorFrame_2 = { "parentSocket": "caseBody.front", "localStart": [0, 0, 0.04], "localEnd": [0, 0, 0.08], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_doorFrame_2 = makeAttachmentEndpoint(attachment_doorFrame_2);
  const node_doorFrame_2 = new THREE2.Group();
  node_doorFrame_2.name = "Door frame__pivot";
  node_doorFrame_2.scale.set(1, 1, 1);
  if (endpoint_doorFrame_2) {
    node_doorFrame_2.position.copy(endpoint_doorFrame_2.start);
    node_doorFrame_2.rotation.set(0, 0, 0);
  } else {
    node_doorFrame_2.position.set(0, 0, 0.055);
    node_doorFrame_2.rotation.set(0, 0, 0);
  }
  node_doorFrame_2.userData.sculptComponent = { "id": "doorFrame", "name": "Door frame", "level": "macro", "role": "door", "importance": 0.95, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Raised front rectangular ring, hinged left; step reveal to case.", "geometryDescriptor": { "topologyIntent": "extrude door", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "caseBody", "attachment": { "parentSocket": "caseBody.front", "localStart": [0, 0, 0.04], "localEnd": [0, 0, 0.08], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 1, "height": 1.35, "depth": 0.045, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0.055], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "doorFrame", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "blackAluminum" } }, "material": "blackAluminum", "materialLayers": ["blackAluminum"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(25, 26, 28, 1.0)", "secondaryAlbedo": "rgba(58, 60, 64, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_doorFrame_2.userData.actionProfile = { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "doorFrame", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "blackAluminum" } };
  (nodes["caseBody"] ?? root).add(node_doorFrame_2);
  nodes["doorFrame"] = node_doorFrame_2;
  const mesh_doorFrame_2Geometry = buildDoorFrame();
  const mesh_doorFrame_2 = new THREE2.Mesh(
    mesh_doorFrame_2Geometry,
    materialMap["blackAluminum"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_doorFrame_2.name = "Door frame";
  if (endpoint_doorFrame_2) {
    mesh_doorFrame_2.position.copy(endpoint_doorFrame_2.midpoint);
    mesh_doorFrame_2.quaternion.copy(endpoint_doorFrame_2.quaternion);
  }
  mesh_doorFrame_2.castShadow = options.castShadow ?? true;
  mesh_doorFrame_2.receiveShadow = options.receiveShadow ?? true;
  mesh_doorFrame_2.userData.sculptComponent = { "id": "doorFrame", "name": "Door frame", "level": "macro", "role": "door", "importance": 0.95, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Raised front rectangular ring, hinged left; step reveal to case.", "geometryDescriptor": { "topologyIntent": "extrude door", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "caseBody", "attachment": { "parentSocket": "caseBody.front", "localStart": [0, 0, 0.04], "localEnd": [0, 0, 0.08], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 1, "height": 1.35, "depth": 0.045, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0.055], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "doorFrame", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "blackAluminum" } }, "material": "blackAluminum", "materialLayers": ["blackAluminum"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(25, 26, 28, 1.0)", "secondaryAlbedo": "rgba(58, 60, 64, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_doorFrame_2.add(mesh_doorFrame_2);
  meshes["doorFrame"] = mesh_doorFrame_2;
  node_doorFrame_2.updateWorldMatrix(true, false);
  mesh_doorFrame_2.quaternion.identity();
  mesh_doorFrame_2.position.copy(node_doorFrame_2.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["doorFrame"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["doorFrame"] ??= [];
  destructionGroups["doorFrame"].push(node_doorFrame_2);
  const attachment_glassPanel_3 = { "parentSocket": "doorFrame.rebate", "localStart": [0, 0, 0.045], "localEnd": [0, 0, 0.055], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_glassPanel_3 = makeAttachmentEndpoint(attachment_glassPanel_3);
  const node_glassPanel_3 = new THREE2.Group();
  node_glassPanel_3.name = "Glass panel__pivot";
  node_glassPanel_3.scale.set(1, 1, 1);
  if (endpoint_glassPanel_3) {
    node_glassPanel_3.position.copy(endpoint_glassPanel_3.start);
    node_glassPanel_3.rotation.set(0, 0, 0);
  } else {
    node_glassPanel_3.position.set(0, 0, 0.05);
    node_glassPanel_3.rotation.set(0, 0, 0);
  }
  node_glassPanel_3.userData.sculptComponent = { "id": "glassPanel", "name": "Glass panel", "level": "meso", "role": "glazing", "importance": 0.8, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Thin glazing inside door frame; diagonal streak + fingerprints.", "geometryDescriptor": { "topologyIntent": "plane-card glazing", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "doorFrame", "attachment": { "parentSocket": "doorFrame.rebate", "localStart": [0, 0, 0.045], "localEnd": [0, 0, 0.055], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.88, "height": 1.23, "depth": 6e-3, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0.05], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glassPanel", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "glassClear", "materialLayers": ["glassClear"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(230, 235, 240, 0.15)", "secondaryAlbedo": "rgba(255, 255, 255, 0.3)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_glassPanel_3.userData.actionProfile = { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glassPanel", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } };
  (nodes["doorFrame"] ?? root).add(node_glassPanel_3);
  nodes["glassPanel"] = node_glassPanel_3;
  const mesh_glassPanel_3Geometry = buildGlass();
  const mesh_glassPanel_3 = new THREE2.Mesh(
    mesh_glassPanel_3Geometry,
    materialMap["glassClear"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_glassPanel_3.name = "Glass panel";
  if (endpoint_glassPanel_3) {
    mesh_glassPanel_3.position.copy(endpoint_glassPanel_3.midpoint);
    mesh_glassPanel_3.quaternion.copy(endpoint_glassPanel_3.quaternion);
  }
  mesh_glassPanel_3.castShadow = options.castShadow ?? true;
  mesh_glassPanel_3.receiveShadow = options.receiveShadow ?? true;
  mesh_glassPanel_3.userData.sculptComponent = { "id": "glassPanel", "name": "Glass panel", "level": "meso", "role": "glazing", "importance": 0.8, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Thin glazing inside door frame; diagonal streak + fingerprints.", "geometryDescriptor": { "topologyIntent": "plane-card glazing", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "doorFrame", "attachment": { "parentSocket": "doorFrame.rebate", "localStart": [0, 0, 0.045], "localEnd": [0, 0, 0.055], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.88, "height": 1.23, "depth": 6e-3, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0.05], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glassPanel", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "glassClear", "materialLayers": ["glassClear"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(230, 235, 240, 0.15)", "secondaryAlbedo": "rgba(255, 255, 255, 0.3)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_glassPanel_3.add(mesh_glassPanel_3);
  meshes["glassPanel"] = mesh_glassPanel_3;
  node_glassPanel_3.updateWorldMatrix(true, false);
  mesh_glassPanel_3.quaternion.identity();
  mesh_glassPanel_3.position.copy(node_glassPanel_3.getWorldPosition(new THREE2.Vector3()).negate());
  {
    const gm = mesh_glassPanel_3.material;
    gm.transparent = true;
    gm.transmission = 0;
    gm.opacity = 0.1;
    gm.roughness = 0.03;
    gm.metalness = 0;
    gm.color.set("#ffffff");
    gm.envMapIntensity = 0.5;
    gm.side = THREE2.DoubleSide;
    gm.map = null;
    gm.roughnessMap = null;
    gm.normalMap = null;
    gm.aoMap = null;
    gm.bumpMap = null;
    gm.needsUpdate = true;
  }
  colliders["glassPanel"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["glassPanel"] ??= [];
  destructionGroups["glassPanel"].push(node_glassPanel_3);
  const attachment_ledStrip_4 = { "parentSocket": "caseBody.interiorPerimeter", "localStart": [0, 0, 5e-3], "localEnd": [0, 0, 0.025], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_ledStrip_4 = makeAttachmentEndpoint(attachment_ledStrip_4);
  const node_ledStrip_4 = new THREE2.Group();
  node_ledStrip_4.name = "LED strip ring__pivot";
  node_ledStrip_4.scale.set(1, 1, 1);
  if (endpoint_ledStrip_4) {
    node_ledStrip_4.position.copy(endpoint_ledStrip_4.start);
    node_ledStrip_4.rotation.set(0, 0, 0);
  } else {
    node_ledStrip_4.position.set(0, 0, 0.015);
    node_ledStrip_4.rotation.set(0, 0, 0);
  }
  node_ledStrip_4.userData.sculptComponent = { "id": "ledStrip", "name": "LED strip ring", "level": "meso", "role": "emitter", "importance": 0.8, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Thin warm emissive band lining the case interior perimeter; emitter dots.", "geometryDescriptor": { "topologyIntent": "extrude emitter", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "caseBody", "attachment": { "parentSocket": "caseBody.interiorPerimeter", "localStart": [0, 0, 5e-3], "localEnd": [0, 0, 0.025], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.86, "height": 1.21, "depth": 0.02, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0.015], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "emitter", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "ledStrip", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "ledEmissive", "materialLayers": ["ledEmissive"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "emitterDots", "what": "individual LED dots visible right/bottom", "evidence": "evidence/poster/corner-br.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(255, 230, 191, 1.0)", "secondaryAlbedo": "rgba(255, 244, 224, 1.0)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_ledStrip_4.userData.actionProfile = { "animationRole": "emitter", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "ledStrip", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } };
  (nodes["caseBody"] ?? root).add(node_ledStrip_4);
  nodes["ledStrip"] = node_ledStrip_4;
  const mesh_ledStrip_4Geometry = buildLedRing();
  const mesh_ledStrip_4 = new THREE2.Mesh(
    mesh_ledStrip_4Geometry,
    materialMap["ledEmissive"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_ledStrip_4.name = "LED strip ring";
  if (endpoint_ledStrip_4) {
    mesh_ledStrip_4.position.copy(endpoint_ledStrip_4.midpoint);
    mesh_ledStrip_4.quaternion.copy(endpoint_ledStrip_4.quaternion);
  }
  mesh_ledStrip_4.castShadow = options.castShadow ?? true;
  mesh_ledStrip_4.receiveShadow = options.receiveShadow ?? true;
  mesh_ledStrip_4.userData.sculptComponent = { "id": "ledStrip", "name": "LED strip ring", "level": "meso", "role": "emitter", "importance": 0.8, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Thin warm emissive band lining the case interior perimeter; emitter dots.", "geometryDescriptor": { "topologyIntent": "extrude emitter", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "caseBody", "attachment": { "parentSocket": "caseBody.interiorPerimeter", "localStart": [0, 0, 5e-3], "localEnd": [0, 0, 0.025], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.86, "height": 1.21, "depth": 0.02, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0.015], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "emitter", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "ledStrip", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "ledEmissive", "materialLayers": ["ledEmissive"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "emitterDots", "what": "individual LED dots visible right/bottom", "evidence": "evidence/poster/corner-br.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(255, 230, 191, 1.0)", "secondaryAlbedo": "rgba(255, 244, 224, 1.0)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_ledStrip_4.add(mesh_ledStrip_4);
  meshes["ledStrip"] = mesh_ledStrip_4;
  node_ledStrip_4.updateWorldMatrix(true, false);
  mesh_ledStrip_4.quaternion.identity();
  mesh_ledStrip_4.position.copy(node_ledStrip_4.getWorldPosition(new THREE2.Vector3()).negate());
  {
    const lm = mesh_ledStrip_4.material;
    lm.emissive.set("#ffe6bf");
    lm.emissiveIntensity = 1.15;
    lm.color.set("#3a3225");
    const cancel = node_ledStrip_4.getWorldPosition(new THREE2.Vector3()).negate();
    const dots = new THREE2.Mesh(buildLedDots(), new THREE2.MeshBasicMaterial({ color: "#fff4dc", toneMapped: false }));
    dots.position.copy(cancel);
    dots.userData.explodeWithParent = true;
    node_ledStrip_4.add(dots);
    meshes["ledStrip.dots"] = dots;
    for (const [px, py] of [[0, 0.55], [0, -0.55], [-0.38, 0], [0.38, 0]]) {
      const pl = new THREE2.PointLight("#ffe6bf", 0.3, 1, 2);
      pl.position.set(px + cancel.x, py + cancel.y, 0.02 + cancel.z);
      node_ledStrip_4.add(pl);
    }
  }
  colliders["ledStrip"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["ledStrip"] ??= [];
  destructionGroups["ledStrip"].push(node_ledStrip_4);
  const attachment_matBoard_5 = { "parentSocket": "caseBody.interior", "localStart": [0, 0, 4e-3], "localEnd": [0, 0, 0.012], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_matBoard_5 = makeAttachmentEndpoint(attachment_matBoard_5);
  const node_matBoard_5 = new THREE2.Group();
  node_matBoard_5.name = "Lit mat board__pivot";
  node_matBoard_5.scale.set(1, 1, 1);
  if (endpoint_matBoard_5) {
    node_matBoard_5.position.copy(endpoint_matBoard_5.start);
    node_matBoard_5.rotation.set(0, 0, 0);
  } else {
    node_matBoard_5.position.set(0, 0, 8e-3);
    node_matBoard_5.rotation.set(0, 0, 0);
  }
  node_matBoard_5.userData.sculptComponent = { "id": "matBoard", "name": "Lit mat board", "level": "meso", "role": "liner", "importance": 0.8, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Warm off-white mat ring + darker recess gap ring behind LED plane.", "geometryDescriptor": { "topologyIntent": "plane-card liner", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "caseBody", "attachment": { "parentSocket": "caseBody.interior", "localStart": [0, 0, 4e-3], "localEnd": [0, 0, 0.012], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.8, "height": 1.16, "depth": 4e-3, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 8e-3], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "liner", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "matBoard", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "matBoardMat", "materialLayers": ["matBoardMat"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(242, 226, 200, 1.0)", "secondaryAlbedo": "rgba(200, 184, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_matBoard_5.userData.actionProfile = { "animationRole": "liner", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "matBoard", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } };
  (nodes["caseBody"] ?? root).add(node_matBoard_5);
  nodes["matBoard"] = node_matBoard_5;
  const mesh_matBoard_5Geometry = buildMatWarm();
  const mesh_matBoard_5 = new THREE2.Mesh(
    mesh_matBoard_5Geometry,
    materialMap["matBoardMat"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_matBoard_5.name = "Lit mat board";
  if (endpoint_matBoard_5) {
    mesh_matBoard_5.position.copy(endpoint_matBoard_5.midpoint);
    mesh_matBoard_5.quaternion.copy(endpoint_matBoard_5.quaternion);
  }
  mesh_matBoard_5.castShadow = options.castShadow ?? true;
  mesh_matBoard_5.receiveShadow = options.receiveShadow ?? true;
  mesh_matBoard_5.userData.sculptComponent = { "id": "matBoard", "name": "Lit mat board", "level": "meso", "role": "liner", "importance": 0.8, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Warm off-white mat ring + darker recess gap ring behind LED plane.", "geometryDescriptor": { "topologyIntent": "plane-card liner", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "caseBody", "attachment": { "parentSocket": "caseBody.interior", "localStart": [0, 0, 4e-3], "localEnd": [0, 0, 0.012], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.8, "height": 1.16, "depth": 4e-3, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 8e-3], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "liner", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "matBoard", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "matBoardMat", "materialLayers": ["matBoardMat"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(242, 226, 200, 1.0)", "secondaryAlbedo": "rgba(200, 184, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_matBoard_5.add(mesh_matBoard_5);
  meshes["matBoard"] = mesh_matBoard_5;
  node_matBoard_5.updateWorldMatrix(true, false);
  mesh_matBoard_5.quaternion.identity();
  mesh_matBoard_5.position.copy(node_matBoard_5.getWorldPosition(new THREE2.Vector3()).negate());
  {
    const mm = mesh_matBoard_5.material;
    mm.map = null;
    mm.color.set("#dcc9a6");
    mm.envMapIntensity = 0.25;
    mm.roughness = 0.7;
    mm.needsUpdate = true;
    const cancel = node_matBoard_5.getWorldPosition(new THREE2.Vector3()).negate();
    const recess = new THREE2.Mesh(buildMatRecess(), new THREE2.MeshStandardMaterial({ color: "#2a2a2c", roughness: 0.8, metalness: 0.1 }));
    recess.position.copy(cancel);
    recess.userData.explodeWithParent = true;
    node_matBoard_5.add(recess);
    meshes["matBoard.recess"] = recess;
  }
  colliders["matBoard"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["matBoard"] ??= [];
  destructionGroups["matBoard"].push(node_matBoard_5);
  const attachment_innerMoulding_6 = { "parentSocket": "matBoard.opening", "localStart": [0, 0, 8e-3], "localEnd": [0, 0, 0.02], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_innerMoulding_6 = makeAttachmentEndpoint(attachment_innerMoulding_6);
  const node_innerMoulding_6 = new THREE2.Group();
  node_innerMoulding_6.name = "Bronze moulding__pivot";
  node_innerMoulding_6.scale.set(1, 1, 1);
  if (endpoint_innerMoulding_6) {
    node_innerMoulding_6.position.copy(endpoint_innerMoulding_6.start);
    node_innerMoulding_6.rotation.set(0, 0, 0);
  } else {
    node_innerMoulding_6.position.set(0, 0, 0.012);
    node_innerMoulding_6.rotation.set(0, 0, 0);
  }
  node_innerMoulding_6.userData.sculptComponent = { "id": "innerMoulding", "name": "Bronze moulding", "level": "meso", "role": "trim", "importance": 0.8, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Beveled bronze picture-frame moulding around the artwork.", "geometryDescriptor": { "topologyIntent": "extrude trim", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "matBoard", "attachment": { "parentSocket": "matBoard.opening", "localStart": [0, 0, 8e-3], "localEnd": [0, 0, 0.02], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.68, "height": 0.94, "depth": 0.015, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0.012], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "trim", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "innerMoulding", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "bronzeMoulding", "materialLayers": ["bronzeMoulding"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(110, 92, 70, 1.0)", "secondaryAlbedo": "rgba(60, 50, 40, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_innerMoulding_6.userData.actionProfile = { "animationRole": "trim", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "innerMoulding", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } };
  (nodes["matBoard"] ?? root).add(node_innerMoulding_6);
  nodes["innerMoulding"] = node_innerMoulding_6;
  const mesh_innerMoulding_6Geometry = buildMoulding();
  const mesh_innerMoulding_6 = new THREE2.Mesh(
    mesh_innerMoulding_6Geometry,
    materialMap["bronzeMoulding"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_innerMoulding_6.name = "Bronze moulding";
  if (endpoint_innerMoulding_6) {
    mesh_innerMoulding_6.position.copy(endpoint_innerMoulding_6.midpoint);
    mesh_innerMoulding_6.quaternion.copy(endpoint_innerMoulding_6.quaternion);
  }
  mesh_innerMoulding_6.castShadow = options.castShadow ?? true;
  mesh_innerMoulding_6.receiveShadow = options.receiveShadow ?? true;
  mesh_innerMoulding_6.userData.sculptComponent = { "id": "innerMoulding", "name": "Bronze moulding", "level": "meso", "role": "trim", "importance": 0.8, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Beveled bronze picture-frame moulding around the artwork.", "geometryDescriptor": { "topologyIntent": "extrude trim", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "matBoard", "attachment": { "parentSocket": "matBoard.opening", "localStart": [0, 0, 8e-3], "localEnd": [0, 0, 0.02], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.68, "height": 0.94, "depth": 0.015, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0.012], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "trim", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "innerMoulding", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "bronzeMoulding", "materialLayers": ["bronzeMoulding"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(110, 92, 70, 1.0)", "secondaryAlbedo": "rgba(60, 50, 40, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_innerMoulding_6.add(mesh_innerMoulding_6);
  meshes["innerMoulding"] = mesh_innerMoulding_6;
  node_innerMoulding_6.updateWorldMatrix(true, false);
  mesh_innerMoulding_6.quaternion.identity();
  mesh_innerMoulding_6.position.copy(node_innerMoulding_6.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["innerMoulding"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["innerMoulding"] ??= [];
  destructionGroups["innerMoulding"].push(node_innerMoulding_6);
  const attachment_posterPlane_7 = { "parentSocket": "innerMoulding.rebate", "localStart": [0, 0, 8e-3], "localEnd": [0, 0, 0.012], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_posterPlane_7 = makeAttachmentEndpoint(attachment_posterPlane_7);
  const node_posterPlane_7 = new THREE2.Group();
  node_posterPlane_7.name = "Poster artwork__pivot";
  node_posterPlane_7.scale.set(1, 1, 1);
  if (endpoint_posterPlane_7) {
    node_posterPlane_7.position.copy(endpoint_posterPlane_7.start);
    node_posterPlane_7.rotation.set(0, 0, 0);
  } else {
    node_posterPlane_7.position.set(0, 0, 0.01);
    node_posterPlane_7.rotation.set(0, 0, 0);
  }
  node_posterPlane_7.userData.sculptComponent = { "id": "posterPlane", "name": "Poster artwork", "level": "meso", "role": "artwork", "importance": 1, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "material-only", "topologyRationale": "Flat print carrying the projected reference texture (rectified + de-lit); slight backlit emissive.", "geometryDescriptor": { "topologyIntent": "plane-card artwork", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "innerMoulding", "attachment": { "parentSocket": "innerMoulding.rebate", "localStart": [0, 0, 8e-3], "localEnd": [0, 0, 0.012], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.62, "height": 0.86, "depth": 2e-3, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0.01], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "artwork", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "posterPlane", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "posterArt", "materialLayers": ["posterArt"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "projection", "what": "texture = evidence/poster/poster-delit.png", "evidence": "evidence/poster/poster-delit.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(80, 60, 140, 1.0)", "secondaryAlbedo": "rgba(240, 80, 200, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_posterPlane_7.userData.actionProfile = { "animationRole": "artwork", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "posterPlane", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } };
  (nodes["innerMoulding"] ?? root).add(node_posterPlane_7);
  nodes["posterPlane"] = node_posterPlane_7;
  const mesh_posterPlane_7Geometry = buildPoster();
  const mesh_posterPlane_7 = new THREE2.Mesh(
    mesh_posterPlane_7Geometry,
    materialMap["posterArt"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_posterPlane_7.name = "Poster artwork";
  if (endpoint_posterPlane_7) {
    mesh_posterPlane_7.position.copy(endpoint_posterPlane_7.midpoint);
    mesh_posterPlane_7.quaternion.copy(endpoint_posterPlane_7.quaternion);
  }
  mesh_posterPlane_7.castShadow = options.castShadow ?? true;
  mesh_posterPlane_7.receiveShadow = options.receiveShadow ?? true;
  mesh_posterPlane_7.userData.sculptComponent = { "id": "posterPlane", "name": "Poster artwork", "level": "meso", "role": "artwork", "importance": 1, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "material-only", "topologyRationale": "Flat print carrying the projected reference texture (rectified + de-lit); slight backlit emissive.", "geometryDescriptor": { "topologyIntent": "plane-card artwork", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "innerMoulding", "attachment": { "parentSocket": "innerMoulding.rebate", "localStart": [0, 0, 8e-3], "localEnd": [0, 0, 0.012], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.62, "height": 0.86, "depth": 2e-3, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0.01], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "artwork", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "posterPlane", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "posterArt", "materialLayers": ["posterArt"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "projection", "what": "texture = evidence/poster/poster-delit.png", "evidence": "evidence/poster/poster-delit.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(80, 60, 140, 1.0)", "secondaryAlbedo": "rgba(240, 80, 200, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_posterPlane_7.add(mesh_posterPlane_7);
  meshes["posterPlane"] = mesh_posterPlane_7;
  node_posterPlane_7.updateWorldMatrix(true, false);
  mesh_posterPlane_7.quaternion.identity();
  mesh_posterPlane_7.position.copy(node_posterPlane_7.getWorldPosition(new THREE2.Vector3()).negate());
  {
    const loader = new THREE2.TextureLoader();
    const posterTex = loader.load("evidence/poster/poster-delit.png", () => {
      window.__posterTexLoaded = true;
    });
    posterTex.colorSpace = THREE2.SRGBColorSpace;
    posterTex.anisotropy = 8;
    const pm = mesh_posterPlane_7.material;
    pm.map = posterTex;
    pm.color.set("#ffffff");
    pm.emissive.set("#ffffff");
    pm.emissiveMap = posterTex;
    pm.emissiveIntensity = 0.35;
    pm.roughness = 0.65;
    pm.needsUpdate = true;
  }
  colliders["posterPlane"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["posterPlane"] ??= [];
  destructionGroups["posterPlane"].push(node_posterPlane_7);
  const attachment_bracketTop_8 = { "parentSocket": "caseBody.leftRail", "localStart": [-0.5, 0.42, -0.04], "localEnd": [-0.54, 0.42, -0.13], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_bracketTop_8 = makeAttachmentEndpoint(attachment_bracketTop_8);
  const node_bracketTop_8 = new THREE2.Group();
  node_bracketTop_8.name = "Wall bracket (top)__pivot";
  node_bracketTop_8.scale.set(1, 1, 1);
  if (endpoint_bracketTop_8) {
    node_bracketTop_8.position.copy(endpoint_bracketTop_8.start);
    node_bracketTop_8.rotation.set(0, 0, 0);
  } else {
    node_bracketTop_8.position.set(-0.52, 0.42, -0.08);
    node_bracketTop_8.rotation.set(0, 0, 0);
  }
  node_bracketTop_8.userData.sculptComponent = { "id": "bracketTop", "name": "Wall bracket (top)", "level": "meso", "role": "mount", "importance": 0.8, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Black L-bracket, case-left to wall, 2 screws.", "geometryDescriptor": { "topologyIntent": "extrude mount", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "caseBody", "attachment": { "parentSocket": "caseBody.leftRail", "localStart": [-0.5, 0.42, -0.04], "localEnd": [-0.54, 0.42, -0.13], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.05, "height": 0.14, "depth": 0.1, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.52, 0.42, -0.08], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "mount", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "bracketTop", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "blackAluminum" } }, "material": "blackAluminum", "materialLayers": ["blackAluminum"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(25, 26, 28, 1.0)", "secondaryAlbedo": "rgba(58, 60, 64, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_bracketTop_8.userData.actionProfile = { "animationRole": "mount", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "bracketTop", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "blackAluminum" } };
  (nodes["caseBody"] ?? root).add(node_bracketTop_8);
  nodes["bracketTop"] = node_bracketTop_8;
  const mesh_bracketTop_8Geometry = buildBracket(0.42);
  const mesh_bracketTop_8 = new THREE2.Mesh(
    mesh_bracketTop_8Geometry,
    materialMap["blackAluminum"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_bracketTop_8.name = "Wall bracket (top)";
  if (endpoint_bracketTop_8) {
    mesh_bracketTop_8.position.copy(endpoint_bracketTop_8.midpoint);
    mesh_bracketTop_8.quaternion.copy(endpoint_bracketTop_8.quaternion);
  }
  mesh_bracketTop_8.castShadow = options.castShadow ?? true;
  mesh_bracketTop_8.receiveShadow = options.receiveShadow ?? true;
  mesh_bracketTop_8.userData.sculptComponent = { "id": "bracketTop", "name": "Wall bracket (top)", "level": "meso", "role": "mount", "importance": 0.8, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Black L-bracket, case-left to wall, 2 screws.", "geometryDescriptor": { "topologyIntent": "extrude mount", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "caseBody", "attachment": { "parentSocket": "caseBody.leftRail", "localStart": [-0.5, 0.42, -0.04], "localEnd": [-0.54, 0.42, -0.13], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.05, "height": 0.14, "depth": 0.1, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.52, 0.42, -0.08], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "mount", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "bracketTop", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "blackAluminum" } }, "material": "blackAluminum", "materialLayers": ["blackAluminum"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(25, 26, 28, 1.0)", "secondaryAlbedo": "rgba(58, 60, 64, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_bracketTop_8.add(mesh_bracketTop_8);
  meshes["bracketTop"] = mesh_bracketTop_8;
  node_bracketTop_8.updateWorldMatrix(true, false);
  mesh_bracketTop_8.quaternion.identity();
  mesh_bracketTop_8.position.copy(node_bracketTop_8.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["bracketTop"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["bracketTop"] ??= [];
  destructionGroups["bracketTop"].push(node_bracketTop_8);
  const attachment_bracketBottom_9 = { "parentSocket": "caseBody.leftRail", "localStart": [-0.5, -0.42, -0.04], "localEnd": [-0.54, -0.42, -0.13], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_bracketBottom_9 = makeAttachmentEndpoint(attachment_bracketBottom_9);
  const node_bracketBottom_9 = new THREE2.Group();
  node_bracketBottom_9.name = "Wall bracket (bottom)__pivot";
  node_bracketBottom_9.scale.set(1, 1, 1);
  if (endpoint_bracketBottom_9) {
    node_bracketBottom_9.position.copy(endpoint_bracketBottom_9.start);
    node_bracketBottom_9.rotation.set(0, 0, 0);
  } else {
    node_bracketBottom_9.position.set(-0.52, -0.42, -0.08);
    node_bracketBottom_9.rotation.set(0, 0, 0);
  }
  node_bracketBottom_9.userData.sculptComponent = { "id": "bracketBottom", "name": "Wall bracket (bottom)", "level": "meso", "role": "mount", "importance": 0.8, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Mirror of top bracket.", "geometryDescriptor": { "topologyIntent": "extrude mount", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "caseBody", "attachment": { "parentSocket": "caseBody.leftRail", "localStart": [-0.5, -0.42, -0.04], "localEnd": [-0.54, -0.42, -0.13], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.05, "height": 0.14, "depth": 0.1, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.52, -0.42, -0.08], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "mount", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "bracketBottom", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "blackAluminum" } }, "material": "blackAluminum", "materialLayers": ["blackAluminum"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(25, 26, 28, 1.0)", "secondaryAlbedo": "rgba(58, 60, 64, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_bracketBottom_9.userData.actionProfile = { "animationRole": "mount", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "bracketBottom", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "blackAluminum" } };
  (nodes["caseBody"] ?? root).add(node_bracketBottom_9);
  nodes["bracketBottom"] = node_bracketBottom_9;
  const mesh_bracketBottom_9Geometry = buildBracket(-0.42);
  const mesh_bracketBottom_9 = new THREE2.Mesh(
    mesh_bracketBottom_9Geometry,
    materialMap["blackAluminum"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_bracketBottom_9.name = "Wall bracket (bottom)";
  if (endpoint_bracketBottom_9) {
    mesh_bracketBottom_9.position.copy(endpoint_bracketBottom_9.midpoint);
    mesh_bracketBottom_9.quaternion.copy(endpoint_bracketBottom_9.quaternion);
  }
  mesh_bracketBottom_9.castShadow = options.castShadow ?? true;
  mesh_bracketBottom_9.receiveShadow = options.receiveShadow ?? true;
  mesh_bracketBottom_9.userData.sculptComponent = { "id": "bracketBottom", "name": "Wall bracket (bottom)", "level": "meso", "role": "mount", "importance": 0.8, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Mirror of top bracket.", "geometryDescriptor": { "topologyIntent": "extrude mount", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "caseBody", "attachment": { "parentSocket": "caseBody.leftRail", "localStart": [-0.5, -0.42, -0.04], "localEnd": [-0.54, -0.42, -0.13], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.05, "height": 0.14, "depth": 0.1, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.52, -0.42, -0.08], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "mount", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "bracketBottom", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "blackAluminum" } }, "material": "blackAluminum", "materialLayers": ["blackAluminum"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(25, 26, 28, 1.0)", "secondaryAlbedo": "rgba(58, 60, 64, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_bracketBottom_9.add(mesh_bracketBottom_9);
  meshes["bracketBottom"] = mesh_bracketBottom_9;
  node_bracketBottom_9.updateWorldMatrix(true, false);
  mesh_bracketBottom_9.quaternion.identity();
  mesh_bracketBottom_9.position.copy(node_bracketBottom_9.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["bracketBottom"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["bracketBottom"] ??= [];
  destructionGroups["bracketBottom"].push(node_bracketBottom_9);
  const attachment_hingeTop_10 = { "parentSocket": "doorFrame.leftEdge", "localStart": [-0.5, 0.38, 0.03], "localEnd": [-0.5, 0.38, 0.06], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_hingeTop_10 = makeAttachmentEndpoint(attachment_hingeTop_10);
  const node_hingeTop_10 = new THREE2.Group();
  node_hingeTop_10.name = "Hinge (top)__pivot";
  node_hingeTop_10.scale.set(1, 1, 1);
  if (endpoint_hingeTop_10) {
    node_hingeTop_10.position.copy(endpoint_hingeTop_10.start);
    node_hingeTop_10.rotation.set(0, 0, 0);
  } else {
    node_hingeTop_10.position.set(-0.5, 0.38, 0.045);
    node_hingeTop_10.rotation.set(0, 0, 0);
  }
  node_hingeTop_10.userData.sculptComponent = { "id": "hingeTop", "name": "Hinge (top)", "level": "meso", "role": "hinge", "importance": 0.8, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Small steel hinge, door left edge upper.", "geometryDescriptor": { "topologyIntent": "box hinge", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "doorFrame", "attachment": { "parentSocket": "doorFrame.leftEdge", "localStart": [-0.5, 0.38, 0.03], "localEnd": [-0.5, 0.38, 0.06], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.018, "height": 0.09, "depth": 0.03, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.5, 0.38, 0.045], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hinge", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hingeTop", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "steelHardware", "materialLayers": ["steelHardware"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(150, 152, 156, 1.0)", "secondaryAlbedo": "rgba(100, 102, 106, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_hingeTop_10.userData.actionProfile = { "animationRole": "hinge", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hingeTop", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } };
  (nodes["doorFrame"] ?? root).add(node_hingeTop_10);
  nodes["hingeTop"] = node_hingeTop_10;
  const mesh_hingeTop_10Geometry = buildHinge(0.38);
  const mesh_hingeTop_10 = new THREE2.Mesh(
    mesh_hingeTop_10Geometry,
    materialMap["steelHardware"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_hingeTop_10.name = "Hinge (top)";
  if (endpoint_hingeTop_10) {
    mesh_hingeTop_10.position.copy(endpoint_hingeTop_10.midpoint);
    mesh_hingeTop_10.quaternion.copy(endpoint_hingeTop_10.quaternion);
  }
  mesh_hingeTop_10.castShadow = options.castShadow ?? true;
  mesh_hingeTop_10.receiveShadow = options.receiveShadow ?? true;
  mesh_hingeTop_10.userData.sculptComponent = { "id": "hingeTop", "name": "Hinge (top)", "level": "meso", "role": "hinge", "importance": 0.8, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Small steel hinge, door left edge upper.", "geometryDescriptor": { "topologyIntent": "box hinge", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "doorFrame", "attachment": { "parentSocket": "doorFrame.leftEdge", "localStart": [-0.5, 0.38, 0.03], "localEnd": [-0.5, 0.38, 0.06], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.018, "height": 0.09, "depth": 0.03, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.5, 0.38, 0.045], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hinge", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hingeTop", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "steelHardware", "materialLayers": ["steelHardware"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(150, 152, 156, 1.0)", "secondaryAlbedo": "rgba(100, 102, 106, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_hingeTop_10.add(mesh_hingeTop_10);
  meshes["hingeTop"] = mesh_hingeTop_10;
  node_hingeTop_10.updateWorldMatrix(true, false);
  mesh_hingeTop_10.quaternion.identity();
  mesh_hingeTop_10.position.copy(node_hingeTop_10.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["hingeTop"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["hingeTop"] ??= [];
  destructionGroups["hingeTop"].push(node_hingeTop_10);
  const attachment_hingeBottom_11 = { "parentSocket": "doorFrame.leftEdge", "localStart": [-0.5, -0.38, 0.03], "localEnd": [-0.5, -0.38, 0.06], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_hingeBottom_11 = makeAttachmentEndpoint(attachment_hingeBottom_11);
  const node_hingeBottom_11 = new THREE2.Group();
  node_hingeBottom_11.name = "Hinge (bottom)__pivot";
  node_hingeBottom_11.scale.set(1, 1, 1);
  if (endpoint_hingeBottom_11) {
    node_hingeBottom_11.position.copy(endpoint_hingeBottom_11.start);
    node_hingeBottom_11.rotation.set(0, 0, 0);
  } else {
    node_hingeBottom_11.position.set(-0.5, -0.38, 0.045);
    node_hingeBottom_11.rotation.set(0, 0, 0);
  }
  node_hingeBottom_11.userData.sculptComponent = { "id": "hingeBottom", "name": "Hinge (bottom)", "level": "meso", "role": "hinge", "importance": 0.8, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Small steel hinge, door left edge lower.", "geometryDescriptor": { "topologyIntent": "box hinge", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "doorFrame", "attachment": { "parentSocket": "doorFrame.leftEdge", "localStart": [-0.5, -0.38, 0.03], "localEnd": [-0.5, -0.38, 0.06], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.018, "height": 0.09, "depth": 0.03, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.5, -0.38, 0.045], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hinge", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hingeBottom", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "steelHardware", "materialLayers": ["steelHardware"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(150, 152, 156, 1.0)", "secondaryAlbedo": "rgba(100, 102, 106, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_hingeBottom_11.userData.actionProfile = { "animationRole": "hinge", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hingeBottom", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } };
  (nodes["doorFrame"] ?? root).add(node_hingeBottom_11);
  nodes["hingeBottom"] = node_hingeBottom_11;
  const mesh_hingeBottom_11Geometry = buildHinge(-0.38);
  const mesh_hingeBottom_11 = new THREE2.Mesh(
    mesh_hingeBottom_11Geometry,
    materialMap["steelHardware"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_hingeBottom_11.name = "Hinge (bottom)";
  if (endpoint_hingeBottom_11) {
    mesh_hingeBottom_11.position.copy(endpoint_hingeBottom_11.midpoint);
    mesh_hingeBottom_11.quaternion.copy(endpoint_hingeBottom_11.quaternion);
  }
  mesh_hingeBottom_11.castShadow = options.castShadow ?? true;
  mesh_hingeBottom_11.receiveShadow = options.receiveShadow ?? true;
  mesh_hingeBottom_11.userData.sculptComponent = { "id": "hingeBottom", "name": "Hinge (bottom)", "level": "meso", "role": "hinge", "importance": 0.8, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Small steel hinge, door left edge lower.", "geometryDescriptor": { "topologyIntent": "box hinge", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "doorFrame", "attachment": { "parentSocket": "doorFrame.leftEdge", "localStart": [-0.5, -0.38, 0.03], "localEnd": [-0.5, -0.38, 0.06], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.018, "height": 0.09, "depth": 0.03, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.5, -0.38, 0.045], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hinge", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "hingeBottom", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "steelHardware", "materialLayers": ["steelHardware"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(150, 152, 156, 1.0)", "secondaryAlbedo": "rgba(100, 102, 106, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_hingeBottom_11.add(mesh_hingeBottom_11);
  meshes["hingeBottom"] = mesh_hingeBottom_11;
  node_hingeBottom_11.updateWorldMatrix(true, false);
  mesh_hingeBottom_11.quaternion.identity();
  mesh_hingeBottom_11.position.copy(node_hingeBottom_11.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["hingeBottom"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["hingeBottom"] ??= [];
  destructionGroups["hingeBottom"].push(node_hingeBottom_11);
  const attachment_camLock_12 = { "parentSocket": "doorFrame.rightRail", "localStart": [0.47, 0, 0.055], "localEnd": [0.47, 0, 0.085], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_camLock_12 = makeAttachmentEndpoint(attachment_camLock_12);
  const node_camLock_12 = new THREE2.Group();
  node_camLock_12.name = "Cam lock__pivot";
  node_camLock_12.scale.set(1, 1, 1);
  if (endpoint_camLock_12) {
    node_camLock_12.position.copy(endpoint_camLock_12.start);
    node_camLock_12.rotation.set(0, 0, 0);
  } else {
    node_camLock_12.position.set(0.47, 0, 0.07);
    node_camLock_12.rotation.set(0, 0, 0);
  }
  node_camLock_12.userData.sculptComponent = { "id": "camLock", "name": "Cam lock", "level": "meso", "role": "lock", "importance": 0.8, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Circular keyed cam lock on right rail mid-height.", "geometryDescriptor": { "topologyIntent": "cylinder lock", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "doorFrame", "attachment": { "parentSocket": "doorFrame.rightRail", "localStart": [0.47, 0, 0.055], "localEnd": [0.47, 0, 0.085], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.045, "height": 0.045, "depth": 0.03, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.47, 0, 0.07], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "lock", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "camLock", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "steelHardware", "materialLayers": ["steelHardware"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(150, 152, 156, 1.0)", "secondaryAlbedo": "rgba(100, 102, 106, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_camLock_12.userData.actionProfile = { "animationRole": "lock", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "camLock", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } };
  (nodes["doorFrame"] ?? root).add(node_camLock_12);
  nodes["camLock"] = node_camLock_12;
  const mesh_camLock_12Geometry = buildLock();
  const mesh_camLock_12 = new THREE2.Mesh(
    mesh_camLock_12Geometry,
    materialMap["steelHardware"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_camLock_12.name = "Cam lock";
  if (endpoint_camLock_12) {
    mesh_camLock_12.position.copy(endpoint_camLock_12.midpoint);
    mesh_camLock_12.quaternion.copy(endpoint_camLock_12.quaternion);
  }
  mesh_camLock_12.castShadow = options.castShadow ?? true;
  mesh_camLock_12.receiveShadow = options.receiveShadow ?? true;
  mesh_camLock_12.userData.sculptComponent = { "id": "camLock", "name": "Cam lock", "level": "meso", "role": "lock", "importance": 0.8, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Circular keyed cam lock on right rail mid-height.", "geometryDescriptor": { "topologyIntent": "cylinder lock", "edgeTreatment": { "type": "rounded", "bevelRadius": 4e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "doorFrame", "attachment": { "parentSocket": "doorFrame.rightRail", "localStart": [0.47, 0, 0.055], "localEnd": [0.47, 0, 0.085], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.045, "height": 0.045, "depth": 0.03, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.47, 0, 0.07], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "lock", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "camLock", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "blackAluminum" } }, "material": "steelHardware", "materialLayers": ["steelHardware"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.1, "bumpAmplitude": 5e-3, "normalPattern": "brush lines", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(150, 152, 156, 1.0)", "secondaryAlbedo": "rgba(100, 102, 106, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/poster/corner-tr.png"] } };
  node_camLock_12.add(mesh_camLock_12);
  meshes["camLock"] = mesh_camLock_12;
  node_camLock_12.updateWorldMatrix(true, false);
  mesh_camLock_12.quaternion.identity();
  mesh_camLock_12.position.copy(node_camLock_12.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["camLock"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["camLock"] ??= [];
  destructionGroups["camLock"].push(node_camLock_12);
  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups };
  root.userData.lookDevTargets = { "qualityPriority": "reference-fidelity", "materialPass": { "albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": { "requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry" }, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"] }, "lightingPass": { "requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"] }, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."] };
  root.userData.actionReadiness = {
    note: "Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets."
  };
  return root;
}
export {
  createLEDPosterDisplayCaseModel
};
