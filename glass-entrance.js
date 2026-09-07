/* Glazed entrance system, procedurally built.
   Bundled with esbuild from C:/side/objects/src/createGlazedEntranceSystemModel.ts
   (+ glassdoorGeometry.ts), `three` external. Look-dev/composer exports tree-shaken;
   their dead three/examples imports stripped. Generated — rebuild from source. */
// src/createGlazedEntranceSystemModel.ts
import * as THREE2 from "three";

// src/glassdoorGeometry.ts
import * as THREE from "three";
var LEAF_X = [-0.9, -0.31, 0.31, 0.9];
var HANDLE_X = [-0.66, -0.07, 0.07, 0.66];
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
  const D = 0.26;
  geos.push(box(0.08, 2.3, D, -1.26, 1.15, 0));
  geos.push(box(0.08, 2.3, D, 1.26, 1.15, 0));
  geos.push(box(2.6, 0.09, D, 0, 2.26, 0));
  geos.push(box(0.07, 2.18, 0.09, 0, 1.11, 0.09));
  return merge(geos);
}
function buildSideReturnGlass() {
  const g = new THREE.PlaneGeometry(0.2, 2.05);
  g.rotateY(-Math.PI / 2);
  g.translate(-1.31, 1.15, 0);
  return g;
}
function buildLeaf(cx) {
  const geos = [];
  const W = 0.58, H = 2.1, CY = 1.12, Z = 0.1, D = 0.05;
  const stile = 0.055, rail = 0.055;
  geos.push(box(stile, H, D, cx - W / 2 + stile / 2, CY, Z));
  geos.push(box(stile, H, D, cx + W / 2 - stile / 2, CY, Z));
  geos.push(box(W - 2 * stile, rail, D, cx, CY + H / 2 - rail / 2, Z));
  geos.push(box(W - 2 * stile, 0.09, D, cx, CY - H / 2 + 0.045, Z));
  geos.push(box(W - 2 * stile, 0.03, D * 0.9, cx, CY + H / 2 - rail - 0.015, Z));
  return merge(geos);
}
function buildLeafGlass(cx) {
  const g = new THREE.PlaneGeometry(0.47, 1.94);
  g.translate(cx, 1.1, 0.1);
  return g;
}
function buildHandle(hx) {
  const geos = [];
  const CY = 1.05, LEN = 0.88, Z = 0.16, GAP = 0.05;
  for (const dx of [-GAP / 2, GAP / 2]) {
    const bar = new THREE.CylinderGeometry(0.013, 0.013, LEN, 14);
    bar.translate(hx + dx, CY, Z);
    geos.push(bar);
  }
  for (const dy of [LEN / 2 - 0.06, -(LEN / 2 - 0.06)]) {
    const cross = new THREE.CylinderGeometry(9e-3, 9e-3, GAP + 0.026, 10).rotateZ(Math.PI / 2);
    cross.translate(hx, CY + dy, Z);
    geos.push(cross);
    const mount = new THREE.CylinderGeometry(9e-3, 9e-3, 0.055, 10).rotateX(Math.PI / 2);
    mount.translate(hx, CY + dy, Z - 0.03);
    geos.push(mount);
  }
  return merge(geos);
}
function buildCloser(cx) {
  const geos = [];
  geos.push(box(0.3, 0.05, 0.06, cx, 2.14, 0.13));
  const end = new THREE.CylinderGeometry(0.024, 0.024, 0.06, 12).rotateX(Math.PI / 2);
  end.translate(cx - 0.15, 2.14, 0.13);
  geos.push(end);
  return merge(geos);
}
function buildSill() {
  const geos = [];
  geos.push(box(2.5, 0.028, 0.24, 0, 0.016, 0));
  geos.push(box(2.54, 0.012, 0.26, 0, 6e-3, 0));
  return merge(geos);
}

// src/createGlazedEntranceSystemModel.ts
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
function createGlazedEntranceSystemModel(options = {}) {
  const root = new THREE2.Group();
  root.name = "Glazed Entrance System";
  root.userData.reconstructionEvidence = { "itemFamily": null, "subtype": null, "componentAdapter": null, "route": null, "exactnessTier": null, "referenceCamera": { "solved": false, "fovDegrees": 30, "aspect": 1, "orientation": { "yaw": -26, "pitch": 1, "roll": 0 }, "positionHint": [-2.2, 1.15, 4.8], "note": "3/4 from left near mid-height." }, "approximationNotes": [] };
  root.userData.materialPipeline = {};
  root.userData.materialReferenceRegistry = null;
  const materialMap = {};
  materialMap["bronzeFrame"] = createSculptMaterial(
    "bronzeFrame",
    { "id": "bronzeFrame", "name": "Dark bronze aluminum", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#4a423c", "color": "#4a423c", "albedo": { "dominant": "#4a423c", "secondary": ["#6a6058", "#38322c"], "samplingNotes": "sampled from reference" }, "colorVariation": { "palette": ["#4a423c", "#6a6058", "#38322c"], "pattern": "subtle", "amplitude": 0.06, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.1, "role": "broad tone" }, { "id": "meso", "frequency": 24, "amplitude": 0.08, "role": "vertical brush lines" }, { "id": "micro", "frequency": 80, "amplitude": 0.04, "role": "micro breakup" }], "roughness": { "base": 0.4, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brush-line variation" }, "metalness": { "base": 0.9, "variation": 0 }, "normal": { "pattern": "brush (independent)", "strength": 0.1, "scale": 30, "space": "tangent" }, "bump": { "pattern": "brush", "amplitude": 2e-3, "scale": 40 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.4, "contactShadowBias": 0.3, "notes": "frame corners" }, "wear": { "edgeWear": 0.08, "scratches": [], "chips": [] }, "dirt": { "amount": 0.02, "cavityBias": 0.5, "color": "#1a1614" }, "localOverrides": [], "shaderNotes": ["Dark brushed bronze; vertical brush; env edge highlights.", "Agent-vision metalness/roughness correction after analyze_texture."], "notes": "Dark brushed bronze; vertical brush; env edge highlights.", "finishClass": "painted-metal", "texturePalette": ["#312C26", "#322D27", "#443F38", "#35302A", "#353129"], "proceduralTexture": "flat-clearcoat", "clearcoat": { "base": 1, "variation": 0 }, "clearcoatRoughness": { "base": 0.05, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 1, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\glassdoor\\mat\\crop-bronzeFrame.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.751, "estimatedFidelity": 0.751, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/glassdoor/pbr/bronzeFrame/bronzeframe_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/glassdoor/pbr/bronzeFrame/bronzeframe_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/glassdoor/pbr/bronzeFrame/bronzeframe_height.png", "channel": "height" }, "normal": { "path": "evidence/glassdoor/pbr/bronzeFrame/bronzeframe_normal.png", "channel": "normal" }, "ao": { "path": "evidence/glassdoor/pbr/bronzeFrame/bronzeframe_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["clearGlass"] = createSculptMaterial(
    "clearGlass",
    { "id": "clearGlass", "name": "Clear glass", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#dfe4e2", "color": "#dfe4e2", "albedo": { "dominant": "#dfe4e2", "secondary": ["#c8cecc"], "samplingNotes": "sampled from reference" }, "colorVariation": { "palette": ["#dfe4e2", "#c8cecc"], "pattern": "subtle", "amplitude": 0.06, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.1, "role": "broad tone" }, { "id": "meso", "frequency": 24, "amplitude": 0.08, "role": "vertical brush lines" }, { "id": "micro", "frequency": 80, "amplitude": 0.04, "role": "micro breakup" }], "roughness": { "base": 0.03, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brush-line variation" }, "metalness": { "base": 0, "variation": 0 }, "normal": { "pattern": "brush (independent)", "strength": 0.1, "scale": 30, "space": "tangent" }, "bump": { "pattern": "brush", "amplitude": 2e-3, "scale": 40 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.4, "contactShadowBias": 0.3, "notes": "frame corners" }, "wear": { "edgeWear": 0.08, "scratches": [], "chips": [] }, "dirt": { "amount": 0.02, "cavityBias": 0.5, "color": "#1a1614" }, "localOverrides": [], "shaderNotes": ["Transmission ~0.9 so the backdrop shows through; slight gray tint; streak reflections from env.", "Agent-vision metalness/roughness correction after analyze_texture."], "notes": "Transmission ~0.9 so the backdrop shows through; slight gray tint; streak reflections from env.", "transmission": { "base": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "finishClass": "plastic", "texturePalette": ["#BBBDBC", "#BCBEBC", "#BDBEBE", "#D5D6D5", "#DEE0DF"], "proceduralTexture": "flat-clearcoat", "clearcoat": { "base": 0.2, "variation": 0 }, "clearcoatRoughness": { "base": 0.3, "variation": 0 }, "envMapIntensity": 0.7, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\glassdoor\\mat\\crop-clearGlass.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.714, "estimatedFidelity": 0.714, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/glassdoor/pbr/clearGlass/clearglass_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/glassdoor/pbr/clearGlass/clearglass_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/glassdoor/pbr/clearGlass/clearglass_height.png", "channel": "height" }, "normal": { "path": "evidence/glassdoor/pbr/clearGlass/clearglass_normal.png", "channel": "normal" }, "ao": { "path": "evidence/glassdoor/pbr/clearGlass/clearglass_ao.png", "channel": "ao" } } } },
    options
  );
  materialMap["stainlessBar"] = createSculptMaterial(
    "stainlessBar",
    { "id": "stainlessBar", "name": "Stainless hardware", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#b4b8bc", "color": "#b4b8bc", "albedo": { "dominant": "#b4b8bc", "secondary": ["#8c9094", "#d4d8dc"], "samplingNotes": "sampled from reference" }, "colorVariation": { "palette": ["#b4b8bc", "#8c9094", "#d4d8dc"], "pattern": "subtle", "amplitude": 0.06, "heightCorrelation": 0.3 }, "textureResolution": 1024, "textureProjection": { "mode": "triplanar-procedural", "repeat": [3, 3], "anisotropy": 8, "texelDensityIntent": "stable" }, "surfaceFrequencyBands": [{ "id": "macro", "frequency": 2, "amplitude": 0.1, "role": "broad tone" }, { "id": "meso", "frequency": 24, "amplitude": 0.08, "role": "vertical brush lines" }, { "id": "micro", "frequency": 80, "amplitude": 0.04, "role": "micro breakup" }], "roughness": { "base": 0.25, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "brush-line variation" }, "metalness": { "base": 1, "variation": 0 }, "normal": { "pattern": "brush (independent)", "strength": 0.1, "scale": 30, "space": "tangent" }, "bump": { "pattern": "brush", "amplitude": 2e-3, "scale": 40 }, "displacement": { "pattern": "none", "amplitude": 0, "scale": 1, "silhouetteAffects": false }, "ambientOcclusion": { "cavityStrength": 0.4, "contactShadowBias": 0.3, "notes": "frame corners" }, "wear": { "edgeWear": 0.08, "scratches": [], "chips": [] }, "dirt": { "amount": 0.02, "cavityBias": 0.5, "color": "#1a1614" }, "localOverrides": [], "shaderNotes": ["Bars, closers, sill.", "Agent-vision metalness/roughness correction after analyze_texture."], "notes": "Bars, closers, sill.", "finishClass": "brushed-steel", "texturePalette": ["#222220", "#B4B6B3", "#B2B4B1", "#4F4F4B", "#2D2A23"], "proceduralTexture": "brushed", "clearcoat": { "base": 0, "variation": 0 }, "clearcoatRoughness": { "base": 0, "variation": 0 }, "transmission": { "base": 0, "variation": 0 }, "ior": { "base": 1.5, "value": 1.5 }, "envMapIntensity": 1, "anisotropy": { "base": 1 }, "referencePbr": { "version": "1", "sourceImage": "C:\\side\\objects\\evidence\\glassdoor\\mat\\crop-stainlessBar.png", "extractor": "forge/stage1_intake/extract_pbr_evidence.py", "method": "single-image inference", "verdict": "pass", "usable": true, "confidence": 0.82, "estimatedFidelity": 0.82, "targetThreshold": 0.7, "hardLimit": "single-image PBR extraction is an estimate; 70%+ extraction confidence still needs render screenshot review", "maps": { "albedo": { "path": "evidence/glassdoor/pbr/stainlessBar/stainlessbar_albedo.png", "channel": "albedo" }, "roughness": { "path": "evidence/glassdoor/pbr/stainlessBar/stainlessbar_roughness.png", "channel": "roughness" }, "height": { "path": "evidence/glassdoor/pbr/stainlessBar/stainlessbar_height.png", "channel": "height" }, "normal": { "path": "evidence/glassdoor/pbr/stainlessBar/stainlessbar_normal.png", "channel": "normal" }, "ao": { "path": "evidence/glassdoor/pbr/stainlessBar/stainlessbar_ao.png", "channel": "ao" } } } },
    options
  );
  {
    const bf = materialMap["bronzeFrame"];
    bf.map = null;
    bf.roughnessMap = null;
    bf.clearcoat = 0;
    bf.sheen = 0;
    bf.color.set("#5a5148");
    bf.roughness = 0.42;
    bf.metalness = 0.85;
    bf.envMapIntensity = 0.75;
    bf.needsUpdate = true;
    const cg = materialMap["clearGlass"];
    cg.map = null;
    cg.roughnessMap = null;
    cg.clearcoat = 0;
    cg.color.set("#eef2f0");
    cg.roughness = 0.03;
    cg.metalness = 0;
    cg.transparent = true;
    cg.transmission = 0.9;
    cg.ior = 1.5;
    cg.thickness = 0.01;
    cg.envMapIntensity = 0.9;
    cg.side = THREE2.DoubleSide;
    cg.needsUpdate = true;
    const sbm = materialMap["stainlessBar"];
    sbm.map = null;
    sbm.roughnessMap = null;
    sbm.clearcoat = 0;
    sbm.color.set("#a4a8ac");
    sbm.roughness = 0.3;
    sbm.metalness = 1;
    sbm.envMapIntensity = 0.55;
    sbm.needsUpdate = true;
  }
  const nodes = { root };
  const meshes = {};
  const sockets = {};
  const colliders = {};
  const destructionGroups = {};
  const attachment_root_0 = null;
  const endpoint_root_0 = makeAttachmentEndpoint(attachment_root_0);
  const node_root_0 = new THREE2.Group();
  node_root_0.name = "Glazed Entrance System__pivot";
  node_root_0.scale.set(1, 1, 1);
  if (endpoint_root_0) {
    node_root_0.position.copy(endpoint_root_0.start);
    node_root_0.rotation.set(0, 0, 0);
  } else {
    node_root_0.position.set(0, 0, 0);
    node_root_0.rotation.set(0, 0, 0);
  }
  node_root_0.userData.sculptComponent = { "id": "root", "name": "Glazed Entrance System", "level": "macro", "role": "body", "importance": 1, "confidence": 0.5, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Group pivot.", "geometryDescriptor": { "topologyIntent": "container", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": null, "attachment": null, "dimensions": { "width": 2.6, "height": 2.3, "depth": 0.28, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } }, "material": "bronzeFrame", "materialLayers": ["bronzeFrame"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0, "microRoughness": 0, "bumpAmplitude": 0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(74, 66, 60, 1.0)", "secondaryAlbedo": "rgba(106, 96, 88, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c0.png"] } };
  node_root_0.userData.actionProfile = { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } };
  (nodes["root"] ?? root).add(node_root_0);
  nodes["root"] = node_root_0;
  const mesh_root_0Geometry = endpoint_root_0 ? new THREE2.CylinderGeometry(endpoint_root_0.endRadius, endpoint_root_0.baseRadius, endpoint_root_0.length, 32, 12) : new THREE2.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_root_0) {
    mesh_root_0Geometry.scale(1, 1, 1);
  }
  const mesh_root_0 = new THREE2.Mesh(
    mesh_root_0Geometry,
    materialMap["bronzeFrame"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_root_0.name = "Glazed Entrance System";
  if (endpoint_root_0) {
    mesh_root_0.position.copy(endpoint_root_0.midpoint);
    mesh_root_0.quaternion.copy(endpoint_root_0.quaternion);
  }
  mesh_root_0.castShadow = options.castShadow ?? true;
  mesh_root_0.receiveShadow = options.receiveShadow ?? true;
  mesh_root_0.userData.sculptComponent = { "id": "root", "name": "Glazed Entrance System", "level": "macro", "role": "body", "importance": 1, "confidence": 0.5, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Group pivot.", "geometryDescriptor": { "topologyIntent": "container", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": null, "attachment": null, "dimensions": { "width": 2.6, "height": 2.3, "depth": 0.28, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "root", "pivot": { "mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "base" } }, "material": "bronzeFrame", "materialLayers": ["bronzeFrame"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0, "microRoughness": 0, "bumpAmplitude": 0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(74, 66, 60, 1.0)", "secondaryAlbedo": "rgba(106, 96, 88, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c0.png"] } };
  mesh_root_0.visible = false;
  node_root_0.add(mesh_root_0);
  meshes["root"] = mesh_root_0;
  colliders["root"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it." };
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_root_0);
  const attachment_frame_1 = null;
  const endpoint_frame_1 = makeAttachmentEndpoint(attachment_frame_1);
  const node_frame_1 = new THREE2.Group();
  node_frame_1.name = "Perimeter frame + mullion__pivot";
  node_frame_1.scale.set(1, 1, 1);
  if (endpoint_frame_1) {
    node_frame_1.position.copy(endpoint_frame_1.start);
    node_frame_1.rotation.set(0, 0, 0);
  } else {
    node_frame_1.position.set(0, 1.15, 0);
    node_frame_1.rotation.set(0, 0, 0);
  }
  node_frame_1.userData.sculptComponent = { "id": "frame", "name": "Perimeter frame + mullion", "level": "macro", "role": "frame", "importance": 1, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Deep bronze box ring + center mullion; deep left return.", "geometryDescriptor": { "topologyIntent": "extrude frame", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": null, "dimensions": { "width": 2.6, "height": 2.3, "depth": 0.28, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 1.15, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "frame", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "frame", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "bronzeFrame", "materialLayers": ["bronzeFrame"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "brushLines", "what": "vertical brush texture on rails", "evidence": "evidence/glassdoor/di/zone-r1c0.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(74, 66, 60, 1.0)", "secondaryAlbedo": "rgba(106, 96, 88, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c0.png"] } };
  node_frame_1.userData.actionProfile = { "animationRole": "frame", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "frame", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["root"] ?? root).add(node_frame_1);
  nodes["frame"] = node_frame_1;
  const mesh_frame_1Geometry = buildFrame();
  const mesh_frame_1 = new THREE2.Mesh(
    mesh_frame_1Geometry,
    materialMap["bronzeFrame"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_frame_1.name = "Perimeter frame + mullion";
  if (endpoint_frame_1) {
    mesh_frame_1.position.copy(endpoint_frame_1.midpoint);
    mesh_frame_1.quaternion.copy(endpoint_frame_1.quaternion);
  }
  mesh_frame_1.castShadow = options.castShadow ?? true;
  mesh_frame_1.receiveShadow = options.receiveShadow ?? true;
  mesh_frame_1.userData.sculptComponent = { "id": "frame", "name": "Perimeter frame + mullion", "level": "macro", "role": "frame", "importance": 1, "confidence": 0.9, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Deep bronze box ring + center mullion; deep left return.", "geometryDescriptor": { "topologyIntent": "extrude frame", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "root", "attachment": null, "dimensions": { "width": 2.6, "height": 2.3, "depth": 0.28, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 1.15, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "frame", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "frame", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "bronzeFrame", "materialLayers": ["bronzeFrame"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "brushLines", "what": "vertical brush texture on rails", "evidence": "evidence/glassdoor/di/zone-r1c0.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(74, 66, 60, 1.0)", "secondaryAlbedo": "rgba(106, 96, 88, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c0.png"] } };
  node_frame_1.add(mesh_frame_1);
  meshes["frame"] = mesh_frame_1;
  node_frame_1.updateWorldMatrix(true, false);
  mesh_frame_1.quaternion.identity();
  mesh_frame_1.position.copy(node_frame_1.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["frame"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["frame"] ??= [];
  destructionGroups["frame"].push(node_frame_1);
  const attachment_sideReturn_2 = { "parentSocket": "frame.leftReturn", "localStart": [-1.29, 0.1, 0], "localEnd": [-1.29, 2.2, 0], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_sideReturn_2 = makeAttachmentEndpoint(attachment_sideReturn_2);
  const node_sideReturn_2 = new THREE2.Group();
  node_sideReturn_2.name = "Glazed side return__pivot";
  node_sideReturn_2.scale.set(1, 1, 1);
  if (endpoint_sideReturn_2) {
    node_sideReturn_2.position.copy(endpoint_sideReturn_2.start);
    node_sideReturn_2.rotation.set(0, 0, 0);
  } else {
    node_sideReturn_2.position.set(-1.29, 1.15, 0);
    node_sideReturn_2.rotation.set(0, 0, 0);
  }
  node_sideReturn_2.userData.sculptComponent = { "id": "sideReturn", "name": "Glazed side return", "level": "macro", "role": "panel", "importance": 0.85, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Glass panel + bronze framing on the left return face.", "geometryDescriptor": { "topologyIntent": "plane-card panel", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.leftReturn", "localStart": [-1.29, 0.1, 0], "localEnd": [-1.29, 2.2, 0], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.26, "height": 2.1, "depth": 0.02, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-1.29, 1.15, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "panel", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "sideReturn", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "clearGlass", "materialLayers": ["clearGlass"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(223, 228, 226, 0.2)", "secondaryAlbedo": "rgba(200, 206, 204, 0.3)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_sideReturn_2.userData.actionProfile = { "animationRole": "panel", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "sideReturn", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["frame"] ?? root).add(node_sideReturn_2);
  nodes["sideReturn"] = node_sideReturn_2;
  const mesh_sideReturn_2Geometry = buildSideReturnGlass();
  const mesh_sideReturn_2 = new THREE2.Mesh(
    mesh_sideReturn_2Geometry,
    materialMap["clearGlass"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_sideReturn_2.name = "Glazed side return";
  if (endpoint_sideReturn_2) {
    mesh_sideReturn_2.position.copy(endpoint_sideReturn_2.midpoint);
    mesh_sideReturn_2.quaternion.copy(endpoint_sideReturn_2.quaternion);
  }
  mesh_sideReturn_2.castShadow = options.castShadow ?? true;
  mesh_sideReturn_2.receiveShadow = options.receiveShadow ?? true;
  mesh_sideReturn_2.userData.sculptComponent = { "id": "sideReturn", "name": "Glazed side return", "level": "macro", "role": "panel", "importance": 0.85, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Glass panel + bronze framing on the left return face.", "geometryDescriptor": { "topologyIntent": "plane-card panel", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.leftReturn", "localStart": [-1.29, 0.1, 0], "localEnd": [-1.29, 2.2, 0], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.26, "height": 2.1, "depth": 0.02, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-1.29, 1.15, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "panel", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "sideReturn", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "clearGlass", "materialLayers": ["clearGlass"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(223, 228, 226, 0.2)", "secondaryAlbedo": "rgba(200, 206, 204, 0.3)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_sideReturn_2.add(mesh_sideReturn_2);
  meshes["sideReturn"] = mesh_sideReturn_2;
  node_sideReturn_2.updateWorldMatrix(true, false);
  mesh_sideReturn_2.quaternion.identity();
  mesh_sideReturn_2.position.copy(node_sideReturn_2.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["sideReturn"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["sideReturn"] ??= [];
  destructionGroups["sideReturn"].push(node_sideReturn_2);
  const attachment_leaf1_3 = { "parentSocket": "frame.head", "localStart": [-0.9, 2.18, 0.1], "localEnd": [-0.9, 0.06, 0.1], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 };
  const endpoint_leaf1_3 = makeAttachmentEndpoint(attachment_leaf1_3);
  const node_leaf1_3 = new THREE2.Group();
  node_leaf1_3.name = "Door leaf 1__pivot";
  node_leaf1_3.scale.set(1, 1, 1);
  if (endpoint_leaf1_3) {
    node_leaf1_3.position.copy(endpoint_leaf1_3.start);
    node_leaf1_3.rotation.set(0, 0, 0);
  } else {
    node_leaf1_3.position.set(-0.9, 1.12, 0.1);
    node_leaf1_3.rotation.set(0, 0, 0);
  }
  node_leaf1_3.userData.sculptComponent = { "id": "leaf1", "name": "Door leaf 1", "level": "macro", "role": "door", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Bronze stile/rail frame w/ full clear-glass panel + top-rail step.", "geometryDescriptor": { "topologyIntent": "box door", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.head", "localStart": [-0.9, 2.18, 0.1], "localEnd": [-0.9, 0.06, 0.1], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.58, "height": 2.1, "depth": 0.06, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.9, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leaf1", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "bronzeFrame" } }, "material": "bronzeFrame", "materialLayers": ["bronzeFrame"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(74, 66, 60, 1.0)", "secondaryAlbedo": "rgba(106, 96, 88, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c0.png"] } };
  node_leaf1_3.userData.actionProfile = { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leaf1", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "bronzeFrame" } };
  (nodes["frame"] ?? root).add(node_leaf1_3);
  nodes["leaf1"] = node_leaf1_3;
  const mesh_leaf1_3Geometry = buildLeaf(LEAF_X[0]);
  const mesh_leaf1_3 = new THREE2.Mesh(
    mesh_leaf1_3Geometry,
    materialMap["bronzeFrame"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_leaf1_3.name = "Door leaf 1";
  if (endpoint_leaf1_3) {
    mesh_leaf1_3.position.copy(endpoint_leaf1_3.midpoint);
    mesh_leaf1_3.quaternion.copy(endpoint_leaf1_3.quaternion);
  }
  mesh_leaf1_3.castShadow = options.castShadow ?? true;
  mesh_leaf1_3.receiveShadow = options.receiveShadow ?? true;
  mesh_leaf1_3.userData.sculptComponent = { "id": "leaf1", "name": "Door leaf 1", "level": "macro", "role": "door", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Bronze stile/rail frame w/ full clear-glass panel + top-rail step.", "geometryDescriptor": { "topologyIntent": "box door", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.head", "localStart": [-0.9, 2.18, 0.1], "localEnd": [-0.9, 0.06, 0.1], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.58, "height": 2.1, "depth": 0.06, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.9, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leaf1", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "bronzeFrame" } }, "material": "bronzeFrame", "materialLayers": ["bronzeFrame"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(74, 66, 60, 1.0)", "secondaryAlbedo": "rgba(106, 96, 88, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c0.png"] } };
  node_leaf1_3.add(mesh_leaf1_3);
  meshes["leaf1"] = mesh_leaf1_3;
  node_leaf1_3.updateWorldMatrix(true, false);
  mesh_leaf1_3.quaternion.identity();
  mesh_leaf1_3.position.copy(node_leaf1_3.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["leaf1"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["leaf1"] ??= [];
  destructionGroups["leaf1"].push(node_leaf1_3);
  const attachment_glass1_4 = { "parentSocket": "leaf1.rebate", "localStart": [-0.9, 0.1, 0.1], "localEnd": [-0.9, 2.14, 0.1], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_glass1_4 = makeAttachmentEndpoint(attachment_glass1_4);
  const node_glass1_4 = new THREE2.Group();
  node_glass1_4.name = "Leaf glass 1__pivot";
  node_glass1_4.scale.set(1, 1, 1);
  if (endpoint_glass1_4) {
    node_glass1_4.position.copy(endpoint_glass1_4.start);
    node_glass1_4.rotation.set(0, 0, 0);
  } else {
    node_glass1_4.position.set(-0.9, 1.12, 0.1);
    node_glass1_4.rotation.set(0, 0, 0);
  }
  node_glass1_4.userData.sculptComponent = { "id": "glass1", "name": "Leaf glass 1", "level": "meso", "role": "glazing", "importance": 0.85, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Clear transmission glass panel.", "geometryDescriptor": { "topologyIntent": "plane-card glazing", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf1", "attachment": { "parentSocket": "leaf1.rebate", "localStart": [-0.9, 0.1, 0.1], "localEnd": [-0.9, 2.14, 0.1], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.48, "height": 1.98, "depth": 0.01, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.9, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glass1", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "clearGlass", "materialLayers": ["clearGlass"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "streakReflections", "what": "tall soft reflection streaks", "evidence": "evidence/glassdoor/di/zone-r1c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(223, 228, 226, 0.2)", "secondaryAlbedo": "rgba(200, 206, 204, 0.3)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_glass1_4.userData.actionProfile = { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glass1", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["leaf1"] ?? root).add(node_glass1_4);
  nodes["glass1"] = node_glass1_4;
  const mesh_glass1_4Geometry = buildLeafGlass(LEAF_X[0]);
  const mesh_glass1_4 = new THREE2.Mesh(
    mesh_glass1_4Geometry,
    materialMap["clearGlass"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_glass1_4.name = "Leaf glass 1";
  if (endpoint_glass1_4) {
    mesh_glass1_4.position.copy(endpoint_glass1_4.midpoint);
    mesh_glass1_4.quaternion.copy(endpoint_glass1_4.quaternion);
  }
  mesh_glass1_4.castShadow = options.castShadow ?? true;
  mesh_glass1_4.receiveShadow = options.receiveShadow ?? true;
  mesh_glass1_4.userData.sculptComponent = { "id": "glass1", "name": "Leaf glass 1", "level": "meso", "role": "glazing", "importance": 0.85, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Clear transmission glass panel.", "geometryDescriptor": { "topologyIntent": "plane-card glazing", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf1", "attachment": { "parentSocket": "leaf1.rebate", "localStart": [-0.9, 0.1, 0.1], "localEnd": [-0.9, 2.14, 0.1], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.48, "height": 1.98, "depth": 0.01, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.9, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glass1", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "clearGlass", "materialLayers": ["clearGlass"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "streakReflections", "what": "tall soft reflection streaks", "evidence": "evidence/glassdoor/di/zone-r1c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(223, 228, 226, 0.2)", "secondaryAlbedo": "rgba(200, 206, 204, 0.3)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_glass1_4.add(mesh_glass1_4);
  meshes["glass1"] = mesh_glass1_4;
  node_glass1_4.updateWorldMatrix(true, false);
  mesh_glass1_4.quaternion.identity();
  mesh_glass1_4.position.copy(node_glass1_4.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["glass1"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["glass1"] ??= [];
  destructionGroups["glass1"].push(node_glass1_4);
  const attachment_leaf2_5 = { "parentSocket": "frame.head", "localStart": [-0.31, 2.18, 0.1], "localEnd": [-0.31, 0.06, 0.1], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 };
  const endpoint_leaf2_5 = makeAttachmentEndpoint(attachment_leaf2_5);
  const node_leaf2_5 = new THREE2.Group();
  node_leaf2_5.name = "Door leaf 2__pivot";
  node_leaf2_5.scale.set(1, 1, 1);
  if (endpoint_leaf2_5) {
    node_leaf2_5.position.copy(endpoint_leaf2_5.start);
    node_leaf2_5.rotation.set(0, 0, 0);
  } else {
    node_leaf2_5.position.set(-0.31, 1.12, 0.1);
    node_leaf2_5.rotation.set(0, 0, 0);
  }
  node_leaf2_5.userData.sculptComponent = { "id": "leaf2", "name": "Door leaf 2", "level": "macro", "role": "door", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Bronze stile/rail frame w/ full clear-glass panel + top-rail step.", "geometryDescriptor": { "topologyIntent": "box door", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.head", "localStart": [-0.31, 2.18, 0.1], "localEnd": [-0.31, 0.06, 0.1], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.58, "height": 2.1, "depth": 0.06, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.31, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leaf2", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "bronzeFrame" } }, "material": "bronzeFrame", "materialLayers": ["bronzeFrame"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(74, 66, 60, 1.0)", "secondaryAlbedo": "rgba(106, 96, 88, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c0.png"] } };
  node_leaf2_5.userData.actionProfile = { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leaf2", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "bronzeFrame" } };
  (nodes["frame"] ?? root).add(node_leaf2_5);
  nodes["leaf2"] = node_leaf2_5;
  const mesh_leaf2_5Geometry = buildLeaf(LEAF_X[1]);
  const mesh_leaf2_5 = new THREE2.Mesh(
    mesh_leaf2_5Geometry,
    materialMap["bronzeFrame"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_leaf2_5.name = "Door leaf 2";
  if (endpoint_leaf2_5) {
    mesh_leaf2_5.position.copy(endpoint_leaf2_5.midpoint);
    mesh_leaf2_5.quaternion.copy(endpoint_leaf2_5.quaternion);
  }
  mesh_leaf2_5.castShadow = options.castShadow ?? true;
  mesh_leaf2_5.receiveShadow = options.receiveShadow ?? true;
  mesh_leaf2_5.userData.sculptComponent = { "id": "leaf2", "name": "Door leaf 2", "level": "macro", "role": "door", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Bronze stile/rail frame w/ full clear-glass panel + top-rail step.", "geometryDescriptor": { "topologyIntent": "box door", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.head", "localStart": [-0.31, 2.18, 0.1], "localEnd": [-0.31, 0.06, 0.1], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.58, "height": 2.1, "depth": 0.06, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.31, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leaf2", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "bronzeFrame" } }, "material": "bronzeFrame", "materialLayers": ["bronzeFrame"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(74, 66, 60, 1.0)", "secondaryAlbedo": "rgba(106, 96, 88, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c0.png"] } };
  node_leaf2_5.add(mesh_leaf2_5);
  meshes["leaf2"] = mesh_leaf2_5;
  node_leaf2_5.updateWorldMatrix(true, false);
  mesh_leaf2_5.quaternion.identity();
  mesh_leaf2_5.position.copy(node_leaf2_5.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["leaf2"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["leaf2"] ??= [];
  destructionGroups["leaf2"].push(node_leaf2_5);
  const attachment_glass2_6 = { "parentSocket": "leaf2.rebate", "localStart": [-0.31, 0.1, 0.1], "localEnd": [-0.31, 2.14, 0.1], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_glass2_6 = makeAttachmentEndpoint(attachment_glass2_6);
  const node_glass2_6 = new THREE2.Group();
  node_glass2_6.name = "Leaf glass 2__pivot";
  node_glass2_6.scale.set(1, 1, 1);
  if (endpoint_glass2_6) {
    node_glass2_6.position.copy(endpoint_glass2_6.start);
    node_glass2_6.rotation.set(0, 0, 0);
  } else {
    node_glass2_6.position.set(-0.31, 1.12, 0.1);
    node_glass2_6.rotation.set(0, 0, 0);
  }
  node_glass2_6.userData.sculptComponent = { "id": "glass2", "name": "Leaf glass 2", "level": "meso", "role": "glazing", "importance": 0.85, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Clear transmission glass panel.", "geometryDescriptor": { "topologyIntent": "plane-card glazing", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf2", "attachment": { "parentSocket": "leaf2.rebate", "localStart": [-0.31, 0.1, 0.1], "localEnd": [-0.31, 2.14, 0.1], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.48, "height": 1.98, "depth": 0.01, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.31, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glass2", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "clearGlass", "materialLayers": ["clearGlass"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(223, 228, 226, 0.2)", "secondaryAlbedo": "rgba(200, 206, 204, 0.3)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_glass2_6.userData.actionProfile = { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glass2", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["leaf2"] ?? root).add(node_glass2_6);
  nodes["glass2"] = node_glass2_6;
  const mesh_glass2_6Geometry = buildLeafGlass(LEAF_X[1]);
  const mesh_glass2_6 = new THREE2.Mesh(
    mesh_glass2_6Geometry,
    materialMap["clearGlass"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_glass2_6.name = "Leaf glass 2";
  if (endpoint_glass2_6) {
    mesh_glass2_6.position.copy(endpoint_glass2_6.midpoint);
    mesh_glass2_6.quaternion.copy(endpoint_glass2_6.quaternion);
  }
  mesh_glass2_6.castShadow = options.castShadow ?? true;
  mesh_glass2_6.receiveShadow = options.receiveShadow ?? true;
  mesh_glass2_6.userData.sculptComponent = { "id": "glass2", "name": "Leaf glass 2", "level": "meso", "role": "glazing", "importance": 0.85, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Clear transmission glass panel.", "geometryDescriptor": { "topologyIntent": "plane-card glazing", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf2", "attachment": { "parentSocket": "leaf2.rebate", "localStart": [-0.31, 0.1, 0.1], "localEnd": [-0.31, 2.14, 0.1], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.48, "height": 1.98, "depth": 0.01, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.31, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glass2", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "clearGlass", "materialLayers": ["clearGlass"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(223, 228, 226, 0.2)", "secondaryAlbedo": "rgba(200, 206, 204, 0.3)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_glass2_6.add(mesh_glass2_6);
  meshes["glass2"] = mesh_glass2_6;
  node_glass2_6.updateWorldMatrix(true, false);
  mesh_glass2_6.quaternion.identity();
  mesh_glass2_6.position.copy(node_glass2_6.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["glass2"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["glass2"] ??= [];
  destructionGroups["glass2"].push(node_glass2_6);
  const attachment_leaf3_7 = { "parentSocket": "frame.head", "localStart": [0.31, 2.18, 0.1], "localEnd": [0.31, 0.06, 0.1], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 };
  const endpoint_leaf3_7 = makeAttachmentEndpoint(attachment_leaf3_7);
  const node_leaf3_7 = new THREE2.Group();
  node_leaf3_7.name = "Door leaf 3__pivot";
  node_leaf3_7.scale.set(1, 1, 1);
  if (endpoint_leaf3_7) {
    node_leaf3_7.position.copy(endpoint_leaf3_7.start);
    node_leaf3_7.rotation.set(0, 0, 0);
  } else {
    node_leaf3_7.position.set(0.31, 1.12, 0.1);
    node_leaf3_7.rotation.set(0, 0, 0);
  }
  node_leaf3_7.userData.sculptComponent = { "id": "leaf3", "name": "Door leaf 3", "level": "macro", "role": "door", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Bronze stile/rail frame w/ full clear-glass panel + top-rail step.", "geometryDescriptor": { "topologyIntent": "box door", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.head", "localStart": [0.31, 2.18, 0.1], "localEnd": [0.31, 0.06, 0.1], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.58, "height": 2.1, "depth": 0.06, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.31, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leaf3", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "bronzeFrame" } }, "material": "bronzeFrame", "materialLayers": ["bronzeFrame"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(74, 66, 60, 1.0)", "secondaryAlbedo": "rgba(106, 96, 88, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c0.png"] } };
  node_leaf3_7.userData.actionProfile = { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leaf3", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "bronzeFrame" } };
  (nodes["frame"] ?? root).add(node_leaf3_7);
  nodes["leaf3"] = node_leaf3_7;
  const mesh_leaf3_7Geometry = buildLeaf(LEAF_X[2]);
  const mesh_leaf3_7 = new THREE2.Mesh(
    mesh_leaf3_7Geometry,
    materialMap["bronzeFrame"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_leaf3_7.name = "Door leaf 3";
  if (endpoint_leaf3_7) {
    mesh_leaf3_7.position.copy(endpoint_leaf3_7.midpoint);
    mesh_leaf3_7.quaternion.copy(endpoint_leaf3_7.quaternion);
  }
  mesh_leaf3_7.castShadow = options.castShadow ?? true;
  mesh_leaf3_7.receiveShadow = options.receiveShadow ?? true;
  mesh_leaf3_7.userData.sculptComponent = { "id": "leaf3", "name": "Door leaf 3", "level": "macro", "role": "door", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Bronze stile/rail frame w/ full clear-glass panel + top-rail step.", "geometryDescriptor": { "topologyIntent": "box door", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.head", "localStart": [0.31, 2.18, 0.1], "localEnd": [0.31, 0.06, 0.1], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.58, "height": 2.1, "depth": 0.06, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.31, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leaf3", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "bronzeFrame" } }, "material": "bronzeFrame", "materialLayers": ["bronzeFrame"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(74, 66, 60, 1.0)", "secondaryAlbedo": "rgba(106, 96, 88, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c0.png"] } };
  node_leaf3_7.add(mesh_leaf3_7);
  meshes["leaf3"] = mesh_leaf3_7;
  node_leaf3_7.updateWorldMatrix(true, false);
  mesh_leaf3_7.quaternion.identity();
  mesh_leaf3_7.position.copy(node_leaf3_7.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["leaf3"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["leaf3"] ??= [];
  destructionGroups["leaf3"].push(node_leaf3_7);
  const attachment_glass3_8 = { "parentSocket": "leaf3.rebate", "localStart": [0.31, 0.1, 0.1], "localEnd": [0.31, 2.14, 0.1], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_glass3_8 = makeAttachmentEndpoint(attachment_glass3_8);
  const node_glass3_8 = new THREE2.Group();
  node_glass3_8.name = "Leaf glass 3__pivot";
  node_glass3_8.scale.set(1, 1, 1);
  if (endpoint_glass3_8) {
    node_glass3_8.position.copy(endpoint_glass3_8.start);
    node_glass3_8.rotation.set(0, 0, 0);
  } else {
    node_glass3_8.position.set(0.31, 1.12, 0.1);
    node_glass3_8.rotation.set(0, 0, 0);
  }
  node_glass3_8.userData.sculptComponent = { "id": "glass3", "name": "Leaf glass 3", "level": "meso", "role": "glazing", "importance": 0.85, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Clear transmission glass panel.", "geometryDescriptor": { "topologyIntent": "plane-card glazing", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf3", "attachment": { "parentSocket": "leaf3.rebate", "localStart": [0.31, 0.1, 0.1], "localEnd": [0.31, 2.14, 0.1], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.48, "height": 1.98, "depth": 0.01, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.31, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glass3", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "clearGlass", "materialLayers": ["clearGlass"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(223, 228, 226, 0.2)", "secondaryAlbedo": "rgba(200, 206, 204, 0.3)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_glass3_8.userData.actionProfile = { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glass3", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["leaf3"] ?? root).add(node_glass3_8);
  nodes["glass3"] = node_glass3_8;
  const mesh_glass3_8Geometry = buildLeafGlass(LEAF_X[2]);
  const mesh_glass3_8 = new THREE2.Mesh(
    mesh_glass3_8Geometry,
    materialMap["clearGlass"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_glass3_8.name = "Leaf glass 3";
  if (endpoint_glass3_8) {
    mesh_glass3_8.position.copy(endpoint_glass3_8.midpoint);
    mesh_glass3_8.quaternion.copy(endpoint_glass3_8.quaternion);
  }
  mesh_glass3_8.castShadow = options.castShadow ?? true;
  mesh_glass3_8.receiveShadow = options.receiveShadow ?? true;
  mesh_glass3_8.userData.sculptComponent = { "id": "glass3", "name": "Leaf glass 3", "level": "meso", "role": "glazing", "importance": 0.85, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Clear transmission glass panel.", "geometryDescriptor": { "topologyIntent": "plane-card glazing", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf3", "attachment": { "parentSocket": "leaf3.rebate", "localStart": [0.31, 0.1, 0.1], "localEnd": [0.31, 2.14, 0.1], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.48, "height": 1.98, "depth": 0.01, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.31, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glass3", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "clearGlass", "materialLayers": ["clearGlass"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(223, 228, 226, 0.2)", "secondaryAlbedo": "rgba(200, 206, 204, 0.3)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_glass3_8.add(mesh_glass3_8);
  meshes["glass3"] = mesh_glass3_8;
  node_glass3_8.updateWorldMatrix(true, false);
  mesh_glass3_8.quaternion.identity();
  mesh_glass3_8.position.copy(node_glass3_8.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["glass3"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["glass3"] ??= [];
  destructionGroups["glass3"].push(node_glass3_8);
  const attachment_leaf4_9 = { "parentSocket": "frame.head", "localStart": [0.9, 2.18, 0.1], "localEnd": [0.9, 0.06, 0.1], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 };
  const endpoint_leaf4_9 = makeAttachmentEndpoint(attachment_leaf4_9);
  const node_leaf4_9 = new THREE2.Group();
  node_leaf4_9.name = "Door leaf 4__pivot";
  node_leaf4_9.scale.set(1, 1, 1);
  if (endpoint_leaf4_9) {
    node_leaf4_9.position.copy(endpoint_leaf4_9.start);
    node_leaf4_9.rotation.set(0, 0, 0);
  } else {
    node_leaf4_9.position.set(0.9, 1.12, 0.1);
    node_leaf4_9.rotation.set(0, 0, 0);
  }
  node_leaf4_9.userData.sculptComponent = { "id": "leaf4", "name": "Door leaf 4", "level": "macro", "role": "door", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Bronze stile/rail frame w/ full clear-glass panel + top-rail step.", "geometryDescriptor": { "topologyIntent": "box door", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.head", "localStart": [0.9, 2.18, 0.1], "localEnd": [0.9, 0.06, 0.1], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.58, "height": 2.1, "depth": 0.06, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.9, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leaf4", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "bronzeFrame" } }, "material": "bronzeFrame", "materialLayers": ["bronzeFrame"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(74, 66, 60, 1.0)", "secondaryAlbedo": "rgba(106, 96, 88, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c0.png"] } };
  node_leaf4_9.userData.actionProfile = { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leaf4", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "bronzeFrame" } };
  (nodes["frame"] ?? root).add(node_leaf4_9);
  nodes["leaf4"] = node_leaf4_9;
  const mesh_leaf4_9Geometry = buildLeaf(LEAF_X[3]);
  const mesh_leaf4_9 = new THREE2.Mesh(
    mesh_leaf4_9Geometry,
    materialMap["bronzeFrame"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_leaf4_9.name = "Door leaf 4";
  if (endpoint_leaf4_9) {
    mesh_leaf4_9.position.copy(endpoint_leaf4_9.midpoint);
    mesh_leaf4_9.quaternion.copy(endpoint_leaf4_9.quaternion);
  }
  mesh_leaf4_9.castShadow = options.castShadow ?? true;
  mesh_leaf4_9.receiveShadow = options.receiveShadow ?? true;
  mesh_leaf4_9.userData.sculptComponent = { "id": "leaf4", "name": "Door leaf 4", "level": "macro", "role": "door", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Bronze stile/rail frame w/ full clear-glass panel + top-rail step.", "geometryDescriptor": { "topologyIntent": "box door", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.head", "localStart": [0.9, 2.18, 0.1], "localEnd": [0.9, 0.06, 0.1], "contactType": "embedded", "embedDepth": 0.02, "overlap": 0.02, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.58, "height": 2.1, "depth": 0.06, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.9, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "door", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": true, "fractureGroup": "leaf4", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1, "debrisMaterial": "bronzeFrame" } }, "material": "bronzeFrame", "materialLayers": ["bronzeFrame"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(74, 66, 60, 1.0)", "secondaryAlbedo": "rgba(106, 96, 88, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c0.png"] } };
  node_leaf4_9.add(mesh_leaf4_9);
  meshes["leaf4"] = mesh_leaf4_9;
  node_leaf4_9.updateWorldMatrix(true, false);
  mesh_leaf4_9.quaternion.identity();
  mesh_leaf4_9.position.copy(node_leaf4_9.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["leaf4"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["leaf4"] ??= [];
  destructionGroups["leaf4"].push(node_leaf4_9);
  const attachment_glass4_10 = { "parentSocket": "leaf4.rebate", "localStart": [0.9, 0.1, 0.1], "localEnd": [0.9, 2.14, 0.1], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_glass4_10 = makeAttachmentEndpoint(attachment_glass4_10);
  const node_glass4_10 = new THREE2.Group();
  node_glass4_10.name = "Leaf glass 4__pivot";
  node_glass4_10.scale.set(1, 1, 1);
  if (endpoint_glass4_10) {
    node_glass4_10.position.copy(endpoint_glass4_10.start);
    node_glass4_10.rotation.set(0, 0, 0);
  } else {
    node_glass4_10.position.set(0.9, 1.12, 0.1);
    node_glass4_10.rotation.set(0, 0, 0);
  }
  node_glass4_10.userData.sculptComponent = { "id": "glass4", "name": "Leaf glass 4", "level": "meso", "role": "glazing", "importance": 0.85, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Clear transmission glass panel.", "geometryDescriptor": { "topologyIntent": "plane-card glazing", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf4", "attachment": { "parentSocket": "leaf4.rebate", "localStart": [0.9, 0.1, 0.1], "localEnd": [0.9, 2.14, 0.1], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.48, "height": 1.98, "depth": 0.01, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.9, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glass4", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "clearGlass", "materialLayers": ["clearGlass"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(223, 228, 226, 0.2)", "secondaryAlbedo": "rgba(200, 206, 204, 0.3)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_glass4_10.userData.actionProfile = { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glass4", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["leaf4"] ?? root).add(node_glass4_10);
  nodes["glass4"] = node_glass4_10;
  const mesh_glass4_10Geometry = buildLeafGlass(LEAF_X[3]);
  const mesh_glass4_10 = new THREE2.Mesh(
    mesh_glass4_10Geometry,
    materialMap["clearGlass"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_glass4_10.name = "Leaf glass 4";
  if (endpoint_glass4_10) {
    mesh_glass4_10.position.copy(endpoint_glass4_10.midpoint);
    mesh_glass4_10.quaternion.copy(endpoint_glass4_10.quaternion);
  }
  mesh_glass4_10.castShadow = options.castShadow ?? true;
  mesh_glass4_10.receiveShadow = options.receiveShadow ?? true;
  mesh_glass4_10.userData.sculptComponent = { "id": "glass4", "name": "Leaf glass 4", "level": "meso", "role": "glazing", "importance": 0.85, "confidence": 0.9, "primitive": "plane-card", "topologyClass": "conforming-shell", "topologyRationale": "Clear transmission glass panel.", "geometryDescriptor": { "topologyIntent": "plane-card glazing", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf4", "attachment": { "parentSocket": "leaf4.rebate", "localStart": [0.9, 0.1, 0.1], "localEnd": [0.9, 2.14, 0.1], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.48, "height": 1.98, "depth": 0.01, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.9, 1.12, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "glazing", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "glass4", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "clearGlass", "materialLayers": ["clearGlass"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(223, 228, 226, 0.2)", "secondaryAlbedo": "rgba(200, 206, 204, 0.3)", "materialClass": "glass", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_glass4_10.add(mesh_glass4_10);
  meshes["glass4"] = mesh_glass4_10;
  node_glass4_10.updateWorldMatrix(true, false);
  mesh_glass4_10.quaternion.identity();
  mesh_glass4_10.position.copy(node_glass4_10.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["glass4"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["glass4"] ??= [];
  destructionGroups["glass4"].push(node_glass4_10);
  const attachment_handle1_11 = { "parentSocket": "leaf1.stile", "localStart": [-0.66, 0.62, 0.13], "localEnd": [-0.66, 1.5, 0.13], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 };
  const endpoint_handle1_11 = makeAttachmentEndpoint(attachment_handle1_11);
  const node_handle1_11 = new THREE2.Group();
  node_handle1_11.name = "Double-bar pull 1__pivot";
  node_handle1_11.scale.set(1, 1, 1);
  if (endpoint_handle1_11) {
    node_handle1_11.position.copy(endpoint_handle1_11.start);
    node_handle1_11.rotation.set(0, 0, 0);
  } else {
    node_handle1_11.position.set(-0.66, 1.05, 0.16);
    node_handle1_11.rotation.set(0, 0, 0);
  }
  node_handle1_11.userData.sculptComponent = { "id": "handle1", "name": "Double-bar pull 1", "level": "meso", "role": "handle", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Two parallel stainless bars + cross standoffs at the meeting stile.", "geometryDescriptor": { "topologyIntent": "cylinder handle", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf1", "attachment": { "parentSocket": "leaf1.stile", "localStart": [-0.66, 0.62, 0.13], "localEnd": [-0.66, 1.5, 0.13], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.09, "height": 0.9, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.66, 1.05, 0.16], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handle1", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "crossStandoffs", "what": "short cross standoffs joining the bar pair", "evidence": "evidence/glassdoor/di/zone-r1c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_handle1_11.userData.actionProfile = { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handle1", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["leaf1"] ?? root).add(node_handle1_11);
  nodes["handle1"] = node_handle1_11;
  const mesh_handle1_11Geometry = buildHandle(HANDLE_X[0]);
  const mesh_handle1_11 = new THREE2.Mesh(
    mesh_handle1_11Geometry,
    materialMap["stainlessBar"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_handle1_11.name = "Double-bar pull 1";
  if (endpoint_handle1_11) {
    mesh_handle1_11.position.copy(endpoint_handle1_11.midpoint);
    mesh_handle1_11.quaternion.copy(endpoint_handle1_11.quaternion);
  }
  mesh_handle1_11.castShadow = options.castShadow ?? true;
  mesh_handle1_11.receiveShadow = options.receiveShadow ?? true;
  mesh_handle1_11.userData.sculptComponent = { "id": "handle1", "name": "Double-bar pull 1", "level": "meso", "role": "handle", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Two parallel stainless bars + cross standoffs at the meeting stile.", "geometryDescriptor": { "topologyIntent": "cylinder handle", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf1", "attachment": { "parentSocket": "leaf1.stile", "localStart": [-0.66, 0.62, 0.13], "localEnd": [-0.66, 1.5, 0.13], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.09, "height": 0.9, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.66, 1.05, 0.16], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handle1", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{ "id": "crossStandoffs", "what": "short cross standoffs joining the bar pair", "evidence": "evidence/glassdoor/di/zone-r1c1.png" }], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_handle1_11.add(mesh_handle1_11);
  meshes["handle1"] = mesh_handle1_11;
  node_handle1_11.updateWorldMatrix(true, false);
  mesh_handle1_11.quaternion.identity();
  mesh_handle1_11.position.copy(node_handle1_11.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["handle1"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["handle1"] ??= [];
  destructionGroups["handle1"].push(node_handle1_11);
  const attachment_handle2_12 = { "parentSocket": "leaf2.stile", "localStart": [-0.07, 0.62, 0.13], "localEnd": [-0.07, 1.5, 0.13], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 };
  const endpoint_handle2_12 = makeAttachmentEndpoint(attachment_handle2_12);
  const node_handle2_12 = new THREE2.Group();
  node_handle2_12.name = "Double-bar pull 2__pivot";
  node_handle2_12.scale.set(1, 1, 1);
  if (endpoint_handle2_12) {
    node_handle2_12.position.copy(endpoint_handle2_12.start);
    node_handle2_12.rotation.set(0, 0, 0);
  } else {
    node_handle2_12.position.set(-0.07, 1.05, 0.16);
    node_handle2_12.rotation.set(0, 0, 0);
  }
  node_handle2_12.userData.sculptComponent = { "id": "handle2", "name": "Double-bar pull 2", "level": "meso", "role": "handle", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Two parallel stainless bars + cross standoffs at the meeting stile.", "geometryDescriptor": { "topologyIntent": "cylinder handle", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf2", "attachment": { "parentSocket": "leaf2.stile", "localStart": [-0.07, 0.62, 0.13], "localEnd": [-0.07, 1.5, 0.13], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.09, "height": 0.9, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.07, 1.05, 0.16], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handle2", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_handle2_12.userData.actionProfile = { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handle2", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["leaf2"] ?? root).add(node_handle2_12);
  nodes["handle2"] = node_handle2_12;
  const mesh_handle2_12Geometry = buildHandle(HANDLE_X[1]);
  const mesh_handle2_12 = new THREE2.Mesh(
    mesh_handle2_12Geometry,
    materialMap["stainlessBar"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_handle2_12.name = "Double-bar pull 2";
  if (endpoint_handle2_12) {
    mesh_handle2_12.position.copy(endpoint_handle2_12.midpoint);
    mesh_handle2_12.quaternion.copy(endpoint_handle2_12.quaternion);
  }
  mesh_handle2_12.castShadow = options.castShadow ?? true;
  mesh_handle2_12.receiveShadow = options.receiveShadow ?? true;
  mesh_handle2_12.userData.sculptComponent = { "id": "handle2", "name": "Double-bar pull 2", "level": "meso", "role": "handle", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Two parallel stainless bars + cross standoffs at the meeting stile.", "geometryDescriptor": { "topologyIntent": "cylinder handle", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf2", "attachment": { "parentSocket": "leaf2.stile", "localStart": [-0.07, 0.62, 0.13], "localEnd": [-0.07, 1.5, 0.13], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.09, "height": 0.9, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.07, 1.05, 0.16], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handle2", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_handle2_12.add(mesh_handle2_12);
  meshes["handle2"] = mesh_handle2_12;
  node_handle2_12.updateWorldMatrix(true, false);
  mesh_handle2_12.quaternion.identity();
  mesh_handle2_12.position.copy(node_handle2_12.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["handle2"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["handle2"] ??= [];
  destructionGroups["handle2"].push(node_handle2_12);
  const attachment_handle3_13 = { "parentSocket": "leaf3.stile", "localStart": [0.07, 0.62, 0.13], "localEnd": [0.07, 1.5, 0.13], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 };
  const endpoint_handle3_13 = makeAttachmentEndpoint(attachment_handle3_13);
  const node_handle3_13 = new THREE2.Group();
  node_handle3_13.name = "Double-bar pull 3__pivot";
  node_handle3_13.scale.set(1, 1, 1);
  if (endpoint_handle3_13) {
    node_handle3_13.position.copy(endpoint_handle3_13.start);
    node_handle3_13.rotation.set(0, 0, 0);
  } else {
    node_handle3_13.position.set(0.07, 1.05, 0.16);
    node_handle3_13.rotation.set(0, 0, 0);
  }
  node_handle3_13.userData.sculptComponent = { "id": "handle3", "name": "Double-bar pull 3", "level": "meso", "role": "handle", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Two parallel stainless bars + cross standoffs at the meeting stile.", "geometryDescriptor": { "topologyIntent": "cylinder handle", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf3", "attachment": { "parentSocket": "leaf3.stile", "localStart": [0.07, 0.62, 0.13], "localEnd": [0.07, 1.5, 0.13], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.09, "height": 0.9, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.07, 1.05, 0.16], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handle3", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_handle3_13.userData.actionProfile = { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handle3", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["leaf3"] ?? root).add(node_handle3_13);
  nodes["handle3"] = node_handle3_13;
  const mesh_handle3_13Geometry = buildHandle(HANDLE_X[2]);
  const mesh_handle3_13 = new THREE2.Mesh(
    mesh_handle3_13Geometry,
    materialMap["stainlessBar"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_handle3_13.name = "Double-bar pull 3";
  if (endpoint_handle3_13) {
    mesh_handle3_13.position.copy(endpoint_handle3_13.midpoint);
    mesh_handle3_13.quaternion.copy(endpoint_handle3_13.quaternion);
  }
  mesh_handle3_13.castShadow = options.castShadow ?? true;
  mesh_handle3_13.receiveShadow = options.receiveShadow ?? true;
  mesh_handle3_13.userData.sculptComponent = { "id": "handle3", "name": "Double-bar pull 3", "level": "meso", "role": "handle", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Two parallel stainless bars + cross standoffs at the meeting stile.", "geometryDescriptor": { "topologyIntent": "cylinder handle", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf3", "attachment": { "parentSocket": "leaf3.stile", "localStart": [0.07, 0.62, 0.13], "localEnd": [0.07, 1.5, 0.13], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.09, "height": 0.9, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.07, 1.05, 0.16], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handle3", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_handle3_13.add(mesh_handle3_13);
  meshes["handle3"] = mesh_handle3_13;
  node_handle3_13.updateWorldMatrix(true, false);
  mesh_handle3_13.quaternion.identity();
  mesh_handle3_13.position.copy(node_handle3_13.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["handle3"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["handle3"] ??= [];
  destructionGroups["handle3"].push(node_handle3_13);
  const attachment_handle4_14 = { "parentSocket": "leaf4.stile", "localStart": [0.66, 0.62, 0.13], "localEnd": [0.66, 1.5, 0.13], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 };
  const endpoint_handle4_14 = makeAttachmentEndpoint(attachment_handle4_14);
  const node_handle4_14 = new THREE2.Group();
  node_handle4_14.name = "Double-bar pull 4__pivot";
  node_handle4_14.scale.set(1, 1, 1);
  if (endpoint_handle4_14) {
    node_handle4_14.position.copy(endpoint_handle4_14.start);
    node_handle4_14.rotation.set(0, 0, 0);
  } else {
    node_handle4_14.position.set(0.66, 1.05, 0.16);
    node_handle4_14.rotation.set(0, 0, 0);
  }
  node_handle4_14.userData.sculptComponent = { "id": "handle4", "name": "Double-bar pull 4", "level": "meso", "role": "handle", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Two parallel stainless bars + cross standoffs at the meeting stile.", "geometryDescriptor": { "topologyIntent": "cylinder handle", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf4", "attachment": { "parentSocket": "leaf4.stile", "localStart": [0.66, 0.62, 0.13], "localEnd": [0.66, 1.5, 0.13], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.09, "height": 0.9, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.66, 1.05, 0.16], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handle4", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_handle4_14.userData.actionProfile = { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handle4", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["leaf4"] ?? root).add(node_handle4_14);
  nodes["handle4"] = node_handle4_14;
  const mesh_handle4_14Geometry = buildHandle(HANDLE_X[3]);
  const mesh_handle4_14 = new THREE2.Mesh(
    mesh_handle4_14Geometry,
    materialMap["stainlessBar"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_handle4_14.name = "Double-bar pull 4";
  if (endpoint_handle4_14) {
    mesh_handle4_14.position.copy(endpoint_handle4_14.midpoint);
    mesh_handle4_14.quaternion.copy(endpoint_handle4_14.quaternion);
  }
  mesh_handle4_14.castShadow = options.castShadow ?? true;
  mesh_handle4_14.receiveShadow = options.receiveShadow ?? true;
  mesh_handle4_14.userData.sculptComponent = { "id": "handle4", "name": "Double-bar pull 4", "level": "meso", "role": "handle", "importance": 0.85, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Two parallel stainless bars + cross standoffs at the meeting stile.", "geometryDescriptor": { "topologyIntent": "cylinder handle", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf4", "attachment": { "parentSocket": "leaf4.stile", "localStart": [0.66, 0.62, 0.13], "localEnd": [0.66, 1.5, 0.13], "contactType": "embedded", "embedDepth": 5e-3, "overlap": 5e-3, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.09, "height": 0.9, "depth": 0.08, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.66, 1.05, 0.16], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "handle", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "handle4", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_handle4_14.add(mesh_handle4_14);
  meshes["handle4"] = mesh_handle4_14;
  node_handle4_14.updateWorldMatrix(true, false);
  mesh_handle4_14.quaternion.identity();
  mesh_handle4_14.position.copy(node_handle4_14.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["handle4"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["handle4"] ??= [];
  destructionGroups["handle4"].push(node_handle4_14);
  const attachment_closer1_15 = { "parentSocket": "leaf1.top", "localStart": [-1, 2.1, 0.11], "localEnd": [-1, 2.16, 0.15], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_closer1_15 = makeAttachmentEndpoint(attachment_closer1_15);
  const node_closer1_15 = new THREE2.Group();
  node_closer1_15.name = "Overhead closer 1__pivot";
  node_closer1_15.scale.set(1, 1, 1);
  if (endpoint_closer1_15) {
    node_closer1_15.position.copy(endpoint_closer1_15.start);
    node_closer1_15.rotation.set(0, 0, 0);
  } else {
    node_closer1_15.position.set(-1, 2.13, 0.13);
    node_closer1_15.rotation.set(0, 0, 0);
  }
  node_closer1_15.userData.sculptComponent = { "id": "closer1", "name": "Overhead closer 1", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Slim stainless overhead closer at the leaf top.", "geometryDescriptor": { "topologyIntent": "box hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf1", "attachment": { "parentSocket": "leaf1.top", "localStart": [-1, 2.1, 0.11], "localEnd": [-1, 2.16, 0.15], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.3, "height": 0.05, "depth": 0.07, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-1, 2.13, 0.13], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closer1", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_closer1_15.userData.actionProfile = { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closer1", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["leaf1"] ?? root).add(node_closer1_15);
  nodes["closer1"] = node_closer1_15;
  const mesh_closer1_15Geometry = buildCloser(LEAF_X[0] - 0.1);
  const mesh_closer1_15 = new THREE2.Mesh(
    mesh_closer1_15Geometry,
    materialMap["stainlessBar"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_closer1_15.name = "Overhead closer 1";
  if (endpoint_closer1_15) {
    mesh_closer1_15.position.copy(endpoint_closer1_15.midpoint);
    mesh_closer1_15.quaternion.copy(endpoint_closer1_15.quaternion);
  }
  mesh_closer1_15.castShadow = options.castShadow ?? true;
  mesh_closer1_15.receiveShadow = options.receiveShadow ?? true;
  mesh_closer1_15.userData.sculptComponent = { "id": "closer1", "name": "Overhead closer 1", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Slim stainless overhead closer at the leaf top.", "geometryDescriptor": { "topologyIntent": "box hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf1", "attachment": { "parentSocket": "leaf1.top", "localStart": [-1, 2.1, 0.11], "localEnd": [-1, 2.16, 0.15], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.3, "height": 0.05, "depth": 0.07, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-1, 2.13, 0.13], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closer1", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_closer1_15.add(mesh_closer1_15);
  meshes["closer1"] = mesh_closer1_15;
  node_closer1_15.updateWorldMatrix(true, false);
  mesh_closer1_15.quaternion.identity();
  mesh_closer1_15.position.copy(node_closer1_15.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["closer1"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["closer1"] ??= [];
  destructionGroups["closer1"].push(node_closer1_15);
  const attachment_closer2_16 = { "parentSocket": "leaf2.top", "localStart": [-0.41000000000000003, 2.1, 0.11], "localEnd": [-0.41000000000000003, 2.16, 0.15], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_closer2_16 = makeAttachmentEndpoint(attachment_closer2_16);
  const node_closer2_16 = new THREE2.Group();
  node_closer2_16.name = "Overhead closer 2__pivot";
  node_closer2_16.scale.set(1, 1, 1);
  if (endpoint_closer2_16) {
    node_closer2_16.position.copy(endpoint_closer2_16.start);
    node_closer2_16.rotation.set(0, 0, 0);
  } else {
    node_closer2_16.position.set(-0.41000000000000003, 2.13, 0.13);
    node_closer2_16.rotation.set(0, 0, 0);
  }
  node_closer2_16.userData.sculptComponent = { "id": "closer2", "name": "Overhead closer 2", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Slim stainless overhead closer at the leaf top.", "geometryDescriptor": { "topologyIntent": "box hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf2", "attachment": { "parentSocket": "leaf2.top", "localStart": [-0.41000000000000003, 2.1, 0.11], "localEnd": [-0.41000000000000003, 2.16, 0.15], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.3, "height": 0.05, "depth": 0.07, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.41000000000000003, 2.13, 0.13], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closer2", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_closer2_16.userData.actionProfile = { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closer2", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["leaf2"] ?? root).add(node_closer2_16);
  nodes["closer2"] = node_closer2_16;
  const mesh_closer2_16Geometry = buildCloser(LEAF_X[1] - 0.1);
  const mesh_closer2_16 = new THREE2.Mesh(
    mesh_closer2_16Geometry,
    materialMap["stainlessBar"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_closer2_16.name = "Overhead closer 2";
  if (endpoint_closer2_16) {
    mesh_closer2_16.position.copy(endpoint_closer2_16.midpoint);
    mesh_closer2_16.quaternion.copy(endpoint_closer2_16.quaternion);
  }
  mesh_closer2_16.castShadow = options.castShadow ?? true;
  mesh_closer2_16.receiveShadow = options.receiveShadow ?? true;
  mesh_closer2_16.userData.sculptComponent = { "id": "closer2", "name": "Overhead closer 2", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Slim stainless overhead closer at the leaf top.", "geometryDescriptor": { "topologyIntent": "box hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf2", "attachment": { "parentSocket": "leaf2.top", "localStart": [-0.41000000000000003, 2.1, 0.11], "localEnd": [-0.41000000000000003, 2.16, 0.15], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.3, "height": 0.05, "depth": 0.07, "units": "relative", "confidence": 0.9 }, "transform": { "position": [-0.41000000000000003, 2.13, 0.13], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closer2", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_closer2_16.add(mesh_closer2_16);
  meshes["closer2"] = mesh_closer2_16;
  node_closer2_16.updateWorldMatrix(true, false);
  mesh_closer2_16.quaternion.identity();
  mesh_closer2_16.position.copy(node_closer2_16.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["closer2"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["closer2"] ??= [];
  destructionGroups["closer2"].push(node_closer2_16);
  const attachment_closer3_17 = { "parentSocket": "leaf3.top", "localStart": [0.21, 2.1, 0.11], "localEnd": [0.21, 2.16, 0.15], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_closer3_17 = makeAttachmentEndpoint(attachment_closer3_17);
  const node_closer3_17 = new THREE2.Group();
  node_closer3_17.name = "Overhead closer 3__pivot";
  node_closer3_17.scale.set(1, 1, 1);
  if (endpoint_closer3_17) {
    node_closer3_17.position.copy(endpoint_closer3_17.start);
    node_closer3_17.rotation.set(0, 0, 0);
  } else {
    node_closer3_17.position.set(0.21, 2.13, 0.13);
    node_closer3_17.rotation.set(0, 0, 0);
  }
  node_closer3_17.userData.sculptComponent = { "id": "closer3", "name": "Overhead closer 3", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Slim stainless overhead closer at the leaf top.", "geometryDescriptor": { "topologyIntent": "box hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf3", "attachment": { "parentSocket": "leaf3.top", "localStart": [0.21, 2.1, 0.11], "localEnd": [0.21, 2.16, 0.15], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.3, "height": 0.05, "depth": 0.07, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.21, 2.13, 0.13], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closer3", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_closer3_17.userData.actionProfile = { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closer3", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["leaf3"] ?? root).add(node_closer3_17);
  nodes["closer3"] = node_closer3_17;
  const mesh_closer3_17Geometry = buildCloser(LEAF_X[2] - 0.1);
  const mesh_closer3_17 = new THREE2.Mesh(
    mesh_closer3_17Geometry,
    materialMap["stainlessBar"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_closer3_17.name = "Overhead closer 3";
  if (endpoint_closer3_17) {
    mesh_closer3_17.position.copy(endpoint_closer3_17.midpoint);
    mesh_closer3_17.quaternion.copy(endpoint_closer3_17.quaternion);
  }
  mesh_closer3_17.castShadow = options.castShadow ?? true;
  mesh_closer3_17.receiveShadow = options.receiveShadow ?? true;
  mesh_closer3_17.userData.sculptComponent = { "id": "closer3", "name": "Overhead closer 3", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Slim stainless overhead closer at the leaf top.", "geometryDescriptor": { "topologyIntent": "box hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf3", "attachment": { "parentSocket": "leaf3.top", "localStart": [0.21, 2.1, 0.11], "localEnd": [0.21, 2.16, 0.15], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.3, "height": 0.05, "depth": 0.07, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.21, 2.13, 0.13], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closer3", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_closer3_17.add(mesh_closer3_17);
  meshes["closer3"] = mesh_closer3_17;
  node_closer3_17.updateWorldMatrix(true, false);
  mesh_closer3_17.quaternion.identity();
  mesh_closer3_17.position.copy(node_closer3_17.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["closer3"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["closer3"] ??= [];
  destructionGroups["closer3"].push(node_closer3_17);
  const attachment_closer4_18 = { "parentSocket": "leaf4.top", "localStart": [0.8, 2.1, 0.11], "localEnd": [0.8, 2.16, 0.15], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_closer4_18 = makeAttachmentEndpoint(attachment_closer4_18);
  const node_closer4_18 = new THREE2.Group();
  node_closer4_18.name = "Overhead closer 4__pivot";
  node_closer4_18.scale.set(1, 1, 1);
  if (endpoint_closer4_18) {
    node_closer4_18.position.copy(endpoint_closer4_18.start);
    node_closer4_18.rotation.set(0, 0, 0);
  } else {
    node_closer4_18.position.set(0.8, 2.13, 0.13);
    node_closer4_18.rotation.set(0, 0, 0);
  }
  node_closer4_18.userData.sculptComponent = { "id": "closer4", "name": "Overhead closer 4", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Slim stainless overhead closer at the leaf top.", "geometryDescriptor": { "topologyIntent": "box hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf4", "attachment": { "parentSocket": "leaf4.top", "localStart": [0.8, 2.1, 0.11], "localEnd": [0.8, 2.16, 0.15], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.3, "height": 0.05, "depth": 0.07, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.8, 2.13, 0.13], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closer4", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_closer4_18.userData.actionProfile = { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closer4", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["leaf4"] ?? root).add(node_closer4_18);
  nodes["closer4"] = node_closer4_18;
  const mesh_closer4_18Geometry = buildCloser(LEAF_X[3] - 0.1);
  const mesh_closer4_18 = new THREE2.Mesh(
    mesh_closer4_18Geometry,
    materialMap["stainlessBar"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_closer4_18.name = "Overhead closer 4";
  if (endpoint_closer4_18) {
    mesh_closer4_18.position.copy(endpoint_closer4_18.midpoint);
    mesh_closer4_18.quaternion.copy(endpoint_closer4_18.quaternion);
  }
  mesh_closer4_18.castShadow = options.castShadow ?? true;
  mesh_closer4_18.receiveShadow = options.receiveShadow ?? true;
  mesh_closer4_18.userData.sculptComponent = { "id": "closer4", "name": "Overhead closer 4", "level": "meso", "role": "hardware", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Slim stainless overhead closer at the leaf top.", "geometryDescriptor": { "topologyIntent": "box hardware", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "leaf4", "attachment": { "parentSocket": "leaf4.top", "localStart": [0.8, 2.1, 0.11], "localEnd": [0.8, 2.16, 0.15], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 0.3, "height": 0.05, "depth": 0.07, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0.8, 2.13, 0.13], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "hardware", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "closer4", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_closer4_18.add(mesh_closer4_18);
  meshes["closer4"] = mesh_closer4_18;
  node_closer4_18.updateWorldMatrix(true, false);
  mesh_closer4_18.quaternion.identity();
  mesh_closer4_18.position.copy(node_closer4_18.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["closer4"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["closer4"] ??= [];
  destructionGroups["closer4"].push(node_closer4_18);
  const attachment_sill_19 = { "parentSocket": "frame.bottom", "localStart": [-1.2, 0.02, 0.02], "localEnd": [1.2, 0.02, 0.02], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 };
  const endpoint_sill_19 = makeAttachmentEndpoint(attachment_sill_19);
  const node_sill_19 = new THREE2.Group();
  node_sill_19.name = "Chrome sill strip__pivot";
  node_sill_19.scale.set(1, 1, 1);
  if (endpoint_sill_19) {
    node_sill_19.position.copy(endpoint_sill_19.start);
    node_sill_19.rotation.set(0, 0, 0);
  } else {
    node_sill_19.position.set(0, 0.02, 0.02);
    node_sill_19.rotation.set(0, 0, 0);
  }
  node_sill_19.userData.sculptComponent = { "id": "sill", "name": "Chrome sill strip", "level": "meso", "role": "trim", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Bright aluminum sill at the floor.", "geometryDescriptor": { "topologyIntent": "box trim", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.bottom", "localStart": [-1.2, 0.02, 0.02], "localEnd": [1.2, 0.02, 0.02], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 2.5, "height": 0.03, "depth": 0.24, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0.02, 0.02], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "trim", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "sill", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_sill_19.userData.actionProfile = { "animationRole": "trim", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "sill", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } };
  (nodes["frame"] ?? root).add(node_sill_19);
  nodes["sill"] = node_sill_19;
  const mesh_sill_19Geometry = buildSill();
  const mesh_sill_19 = new THREE2.Mesh(
    mesh_sill_19Geometry,
    materialMap["stainlessBar"] ?? new THREE2.MeshStandardMaterial({ color: 8947848 })
  );
  mesh_sill_19.name = "Chrome sill strip";
  if (endpoint_sill_19) {
    mesh_sill_19.position.copy(endpoint_sill_19.midpoint);
    mesh_sill_19.quaternion.copy(endpoint_sill_19.quaternion);
  }
  mesh_sill_19.castShadow = options.castShadow ?? true;
  mesh_sill_19.receiveShadow = options.receiveShadow ?? true;
  mesh_sill_19.userData.sculptComponent = { "id": "sill", "name": "Chrome sill strip", "level": "meso", "role": "trim", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Bright aluminum sill at the floor.", "geometryDescriptor": { "topologyIntent": "box trim", "edgeTreatment": { "type": "rounded", "bevelRadius": 3e-3, "segments": 2 }, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "computed smooth vertex normals" }, "parent": "frame", "attachment": { "parentSocket": "frame.bottom", "localStart": [-1.2, 0.02, 0.02], "localEnd": [1.2, 0.02, 0.02], "contactType": "embedded", "embedDepth": 0.01, "overlap": 0.01, "gapTolerance": 5e-3 }, "dimensions": { "width": 2.5, "height": 0.03, "depth": 0.24, "units": "relative", "confidence": 0.9 }, "transform": { "position": [0, 0.02, 0.02], "rotation": [0, 0, 0], "scale": [1, 1, 1] }, "actionProfile": { "animationRole": "trim", "pivot": { "mode": "custom", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9 }, "transformChannels": { "translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true }, "sockets": [], "collider": { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" }, "constraints": [], "destruction": { "breakable": false, "fractureGroup": "sill", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bronzeFrame" } }, "material": "stainlessBar", "materialLayers": ["stainlessBar"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": { "macroRoughness": 0.4, "microRoughness": 0.12, "bumpAmplitude": 2e-3, "normalPattern": "vertical brush", "displacementPattern": "", "occlusionPattern": "frame corners", "edgeWearPattern": "", "notes": "" }, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": { "dominantAlbedo": "rgba(180, 184, 188, 1.0)", "secondaryAlbedo": "rgba(140, 144, 148, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.9, "evidenceRefs": ["full-object", "evidence/glassdoor/di/zone-r1c1.png"] } };
  node_sill_19.add(mesh_sill_19);
  meshes["sill"] = mesh_sill_19;
  node_sill_19.updateWorldMatrix(true, false);
  mesh_sill_19.quaternion.identity();
  mesh_sill_19.position.copy(node_sill_19.getWorldPosition(new THREE2.Vector3()).negate());
  colliders["sill"] = { "type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "proxy" };
  destructionGroups["sill"] ??= [];
  destructionGroups["sill"].push(node_sill_19);
  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups };
  root.userData.lookDevTargets = { "qualityPriority": "reference-fidelity", "materialPass": { "albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": { "requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry" }, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"] }, "lightingPass": { "requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"] }, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."] };
  root.userData.actionReadiness = {
    note: "Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets."
  };
  return root;
}
export {
  createGlazedEntranceSystemModel
};
