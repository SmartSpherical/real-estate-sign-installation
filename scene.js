/* 3D real-estate post sign.
   Hero: the sign assembles from its parts and turns slowly; scrolling breaks it into
   a labelled exploded diagram. Process: it gets installed on a lawn, step by step:
   pin drop → utility locates → post & panel → open house → SOLD. */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const S = window.SITE;
const SC = () => window.SCROLL || { hero: 0, stats: 0, process: 0, anyVisible: true };
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = matchMedia("(max-width: 860px)").matches;
const canvas = document.getElementById("scene");

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const bounce = (t) => { t = clamp(t); const n = 7.5625, d = 2.75;
  if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; };
const ready = () => window.dispatchEvent(new Event("scene-ready"));

function fail(err) {
  console.warn("3D scene disabled:", err);
  document.documentElement.classList.add("no-webgl");
  canvas.style.display = "none";
  ready();
}

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" }); } catch (e) { fail(e); }
if (renderer) init().catch(fail);

async function init() {
  try { await Promise.race([document.fonts.load('800 100px "Inter Tight"'), new Promise((r) => setTimeout(r, 2500))]); } catch {}
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const SHADOWS = !isMobile;
  renderer.shadowMap.enabled = SHADOWS;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const BG_HERO = new THREE.Color(0x08090b), BG_PROC = new THREE.Color(0x0a0f18);
  scene.background = BG_HERO.clone();
  scene.fog = new THREE.Fog(0x0a0f18, 16, 40);

  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 120);

  /* ---------- lights ---------- */
  const hemi = new THREE.HemisphereLight(0x8fa8d8, 0x1d2a18, 0.55); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe8cc, 2.0);
  key.position.set(-5, 8, 7);
  if (SHADOWS) {
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
    key.shadow.bias = -0.0008; key.shadow.radius = 4;
  }
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x6aa2ff, 1.4); rim.position.set(6, 3, -6); scene.add(rim);
  const spot = new THREE.SpotLight(0xffc27a, 0, 9, 0.5, 0.6, 1.2); scene.add(spot, spot.target);

  /* ---------- materials ---------- */
  const white = new THREE.MeshStandardMaterial({ color: 0xf3f2ee, roughness: 0.42, metalness: 0.05 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xc9ccd2, roughness: 0.3, metalness: 1 });

  /* ---------- the sign ---------- */
  const rig = new THREE.Group(); scene.add(rig);
  const pivot = new THREE.Group(); rig.add(pivot);
  const CX = 0.97, CY = 1.72;                      // visual centre of the sign
  pivot.position.set(-CX, -CY, 0);
  const shadowed = (m) => { if (SHADOWS) { m.castShadow = true; m.receiveShadow = true; } return m; };

  const parts = {};
  const part = (name, obj, home) => { obj.position.copy(home); pivot.add(obj); parts[name] = { obj, home: home.clone(), homeRot: obj.rotation.clone() }; return obj; };

  part("post", shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.13, 4.0, 0.13), white)), new THREE.Vector3(0, 1.4, 0));
  const capGeo = new THREE.ConeGeometry(0.11, 0.16, 4); capGeo.rotateY(Math.PI / 4);
  part("cap", shadowed(new THREE.Mesh(capGeo, white)), new THREE.Vector3(0, 3.48, 0));
  part("arm", shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.1, 0.1), white)), new THREE.Vector3(1.03, 3.05, 0));
  const brace = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.06), white));
  brace.rotation.z = Math.atan2(0.42, 0.5); part("brace", brace, new THREE.Vector3(0.31, 2.8, 0));

  // hanging panel (pivots on the arm so it can swing)
  const panelTex = panelTexture(S.hero.panelText || "FOR SALE");
  const panelMats = [white, white, white, white, new THREE.MeshStandardMaterial({ map: panelTex, roughness: 0.5 }), white];
  const swing = new THREE.Group();
  const hookGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.24, 6);
  [-0.6, 0.6].forEach((x) => { const h = new THREE.Mesh(hookGeo, metal); h.position.set(x, -0.11, 0); swing.add(h); });
  const panel = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 0.035), panelMats));
  panel.position.y = -0.72; swing.add(panel);
  // SOLD slash sticker
  const slash = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.3), new THREE.MeshStandardMaterial({ map: slashTexture(), transparent: true, roughness: 0.5 }));
  slash.position.set(0, -0.72, 0.022); slash.rotation.z = 0.33; slash.scale.setScalar(0.0001); swing.add(slash);
  part("panel", swing, new THREE.Vector3(1.15, 3.0, 0));

  // riders hang below the panel
  const makeRider = (tex) => {
    const g = new THREE.Group();
    [-0.5, 0.5].forEach((x) => { const h = new THREE.Mesh(hookGeo, metal); h.scale.y = 0.4; h.position.set(x, -0.05, 0); g.add(h); });
    const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.3, 0.03), [white, white, white, white, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }), white]));
    m.position.y = -0.25; g.add(m); return g;
  };
  const riderSold = makeRider(riderTexture("SOLD", "#e5322d", "#ffffff"));
  const riderOpen = makeRider(riderTexture("OPEN HOUSE", "#111214", "#ffb547"));
  riderSold.position.set(0, -1.22, 0); riderOpen.position.set(0, -1.22, 0);
  swing.add(riderSold, riderOpen);

  // brochure box on the post
  const brochure = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.12), new THREE.MeshStandardMaterial({ color: 0xe9e7e1, roughness: 0.2, transparent: true, opacity: 0.92 })));
  part("brochure", brochure, new THREE.Vector3(-0.14, 1.2, 0.06));

  // exploded-view offsets and labels
  const EXP = {
    post: [new THREE.Vector3(-0.9, -0.7, -0.2), new THREE.Euler(0, 0, 0.12)],
    cap: [new THREE.Vector3(-0.9, 0.9, 0.3), new THREE.Euler(0.4, 0.6, 0)],
    arm: [new THREE.Vector3(0.5, 0.9, -0.4), new THREE.Euler(0, 0, -0.14)],
    brace: [new THREE.Vector3(-0.3, 0.55, 0.7), new THREE.Euler(0, 0, 0.3)],
    panel: [new THREE.Vector3(0.75, -0.15, 1.1), new THREE.Euler(0, -0.35, 0.05)],
    brochure: [new THREE.Vector3(-0.8, -0.6, 0.9), new THREE.Euler(0, 0.5, 0)],
  };
  const LABELS = [
    ["post", { en: "POST · 6 FT", zh: "立柱 · 6英尺" }, [-0.5, 0.2, 0.1]],
    ["arm", { en: "ARM · 4 FT", zh: "横臂 · 4英尺" }, [0.4, 0.28, 0]],
    ["panel", { en: "PANEL · 24×36 IN", zh: "招牌 · 24×36英寸" }, [0.98, -0.5, 0]],
    ["brochure", { en: "BROCHURE BOX", zh: "宣传册盒" }, [-0.2, -0.32, 0]],
    ["cap", { en: "POST CAP", zh: "柱帽" }, [0, 0.22, 0]],
  ];
  const labelSprites = LABELS.map(([name, txt, off]) => {
    const s = textSprite(" ", 0.24); s.userData = { txt, name, off: new THREE.Vector3(...off) }; pivot.add(s); return s;
  });
  const setLabelLang = () => {
    const lang = window.SITE_API?.lang || "en";
    labelSprites.forEach((s) => updateSprite(s, s.userData.txt[lang] || s.userData.txt.en, 0.24));
  };
  setLabelLang();
  window.addEventListener("langchange", setLabelLang);

  /* ---------- the lot: lawn, sidewalk, houses ---------- */
  const lot = new THREE.Group(); scene.add(lot);
  const lawnMat = new THREE.MeshStandardMaterial({ map: grassTexture(), roughness: 1, transparent: true, opacity: 0, color: 0x9fb48f });
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), lawnMat);
  lawn.rotation.x = -Math.PI / 2; if (SHADOWS) lawn.receiveShadow = true; lot.add(lawn);
  const walkMat = new THREE.MeshStandardMaterial({ color: 0x6b6d72, roughness: 0.9, transparent: true, opacity: 0 });
  const walk = new THREE.Mesh(new THREE.BoxGeometry(60, 0.06, 1.4), walkMat); walk.position.set(0, 0.03, 2.6); if (SHADOWS) walk.receiveShadow = true; lot.add(walk);
  const poolMat = new THREE.MeshBasicMaterial({ map: radialTexture("255,190,110"), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), poolMat); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.02; lot.add(pool);

  const houses = new THREE.Group(); lot.add(houses);
  const houseMats = [];
  const addHouse = (x, z, w, h, d, lit) => {
    const g = new THREE.Group();
    const bodyM = new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: .9, transparent: true, opacity: 0 }); houseMats.push(bodyM);
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyM); body.position.y = h / 2; g.add(body);
    const shape = new THREE.Shape(); shape.moveTo(-w / 2 - .2, 0); shape.lineTo(0, h * 0.55); shape.lineTo(w / 2 + .2, 0); shape.lineTo(-w / 2 - .2, 0);
    const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: d + 0.3, bevelEnabled: false }); roofGeo.translate(0, 0, -(d + 0.3) / 2);
    const roofM = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: .8, transparent: true, opacity: 0 }); houseMats.push(roofM);
    const roof = new THREE.Mesh(roofGeo, roofM); roof.position.y = h; g.add(roof);
    lit.forEach(([wx, wy, ww, wh]) => {
      const wm = new THREE.MeshBasicMaterial({ color: 0xb98345, transparent: true, opacity: 0 }); houseMats.push(wm); wm.userData.window = true;
      const win = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), wm); win.position.set(wx, wy, d / 2 + 0.01); g.add(win);
    });
    g.position.set(x, 0, z); houses.add(g);
  };
  addHouse(-1.5, -13, 6.5, 3.4, 4, [[-2, 1.1, .9, 1.1], [-0.6, 1.1, .9, 1.1], [1.9, 2.5, 1.1, .8], [-1.3, 2.5, 1.1, .8], [1.1, .85, .7, 1.7]]);
  addHouse(-11, -15, 5.5, 3, 4, [[-1.2, 1.1, .8, .9], [1.2, 2.3, .9, .7]]);
  addHouse(8, -15, 5, 3.2, 4, [[0, 2.4, 1, .7], [-1.4, 1, .8, .9]]);

  /* ---------- Book: map pin + ripple ---------- */
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xffb547, emissive: 0xffb547, emissiveIntensity: 0.8, roughness: 0.3, transparent: true, opacity: 0 });
  const pin = new THREE.Group();
  const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), pinMat); pinHead.position.y = 0.42;
  const pinTip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 24), pinMat); pinTip.rotation.x = Math.PI; pinTip.position.y = 0.21;
  pin.add(pinHead, pinTip); lot.add(pin);
  const rippleMat = new THREE.MeshBasicMaterial({ color: 0xffb547, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ripple = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), rippleMat); ripple.rotation.x = -Math.PI / 2; ripple.position.y = 0.03; lot.add(ripple);

  /* ---------- Locate: flags + paint ---------- */
  const flags = [];
  const FLAG_DATA = [[-1.4, 0.9, 0xffd23f], [-0.9, -0.8, 0xffd23f], [1.3, 0.7, 0xff3b30], [1.7, -0.6, 0xff3b30], [-0.2, 1.5, 0xff8a00], [0.6, -1.4, 0xff8a00]];
  FLAG_DATA.forEach(([x, z, col]) => {
    const g = new THREE.Group();
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.55, 5), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
    stick.position.y = 0.275; g.add(stick);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.13), new THREE.MeshStandardMaterial({ color: col, side: THREE.DoubleSide, emissive: col, emissiveIntensity: 0.25 }));
    f.position.set(0.1, 0.49, 0); g.add(f);
    g.position.set(x, 0, z); g.rotation.y = Math.random() * Math.PI; g.scale.setScalar(0.0001);
    g.userData.flag = f; lot.add(g); flags.push(g);
  });
  const paint = new THREE.Group(); lot.add(paint);
  const paintMats = [];
  [[0xffd23f, -1.15, 0.15, 0.6], [0xff3b30, 1.5, 0.05, -0.4], [0xff8a00, 0.2, 0, 1.3]].forEach(([col, x, z, rot]) => {
    const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false }); paintMats.push(m);
    for (let i = -3; i <= 3; i++) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.3), m);
      dash.rotation.x = -Math.PI / 2; dash.rotation.z = rot;
      dash.position.set(x + Math.sin(rot) * i * 0.42, 0.025, z + Math.cos(rot) * i * 0.42); paint.add(dash);
    }
  });
  const safeMat = new THREE.MeshBasicMaterial({ color: 0x3ddc84, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const safe = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.33, 40), safeMat); safe.rotation.x = -Math.PI / 2; safe.position.y = 0.03; lot.add(safe);

  /* ---------- Open house: directional stake signs ---------- */
  const arrows = [];
  const arrowTex = arrowTexture();
  [[-3.2, 1.6, 0.5], [3.4, 1.9, -0.6], [-5.5, -1.5, 0.3]].forEach(([x, z, ry]) => {
    const g = new THREE.Group();
    const board = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.45, 0.02), [white, white, white, white, new THREE.MeshStandardMaterial({ map: arrowTex }), white]));
    board.position.y = 0.55; g.add(board);
    [-0.25, 0.25].forEach((sx) => { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 5), metal); st.position.set(sx, 0.2, 0); g.add(st); });
    g.position.set(x, 0, z); g.rotation.y = ry; g.scale.setScalar(0.0001); lot.add(g); arrows.push(g);
  });

  /* ---------- confetti for SOLD ---------- */
  const CONF = isMobile ? 120 : 220;
  const cGeo = new THREE.BufferGeometry(), cPos = new Float32Array(CONF * 3), cCol = new Float32Array(CONF * 3), cVel = [];
  const palette = [new THREE.Color(0xffb547), new THREE.Color(0xe5322d), new THREE.Color(0xffffff)];
  for (let i = 0; i < CONF; i++) {
    const c = palette[i % 3]; cCol.set([c.r, c.g, c.b], i * 3);
    cVel.push(new THREE.Vector3((Math.random() - .5) * 4, 2 + Math.random() * 3.5, (Math.random() - .2) * 3));
  }
  cGeo.setAttribute("position", new THREE.BufferAttribute(cPos, 3));
  cGeo.setAttribute("color", new THREE.BufferAttribute(cCol, 3));
  const confetti = new THREE.Points(cGeo, new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0, depthWrite: false }));
  confetti.frustumCulled = false; lot.add(confetti);
  let confettiAt = -1, wasSold = false;

  /* ---------- floating dust ---------- */
  const DUST = isMobile ? 220 : 500;
  const dGeo = new THREE.BufferGeometry(), dPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) { dPos[i * 3] = (Math.random() - .5) * 30; dPos[i * 3 + 1] = (Math.random() - .5) * 18; dPos[i * 3 + 2] = (Math.random() - .5) * 14; }
  dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
  const dustMat = new THREE.PointsMaterial({ size: 0.035, color: 0xffe2b8, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending, map: radialTexture("255,255,255") });
  const dust = new THREE.Points(dGeo, dustMat); scene.add(dust);

  /* ---------- post-processing ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.45, 0.5, 0.86);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- layout ---------- */
  let aspect = 1;
  const visH = (d) => 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = aspect = w / h; camera.updateProjectionMatrix();
  }
  resize(); addEventListener("resize", resize);

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; });

  /* ---------- animation ---------- */
  const t0 = performance.now();
  let smoothP = 0;
  const v3 = new THREE.Vector3();
  ready();

  function applyExplode(k, time) {
    for (const [name, [off, rot]] of Object.entries(EXP)) {
      const p = parts[name]; if (!p) continue;
      const wob = Math.sin(time * 0.9 + off.x * 3) * 0.05 * k;
      p.obj.position.set(p.home.x + off.x * k, p.home.y + off.y * k + wob, p.home.z + off.z * k);
      p.obj.rotation.set(p.homeRot.x + rot.x * k, p.homeRot.y + rot.y * k, p.homeRot.z + rot.z * k);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const sc = SC();
    if (document.hidden || !sc.anyVisible) return;
    const time = (now - t0) / 1000;
    mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05;

    const procMode = sc.process > 0 || document.getElementById("process").getBoundingClientRect().top < innerHeight;
    smoothP += ((procMode ? sc.process : 0) - smoothP) * (reduced ? 1 : 0.1);
    const pp = smoothP;
    const wind = Math.sin(time * 1.3) * 0.035 + Math.sin(time * 2.9) * 0.012;

    let lotO = 0, labelO = 0;

    if (!procMode) {
      /* ===== HERO + STATS ===== */
      const D = 12, vh = visH(D), vw = vh * aspect;
      camera.position.set(0, 0, D); camera.lookAt(0, 0, 0);
      const intro = reduced ? 0 : 1 - easeOut((time - 0.5) / 2.0);
      const u = clamp(sc.hero) + clamp(sc.stats) * 1.2;
      const explode = Math.max(intro * 2.2, smooth(0.2, 1.3, u) * 0.75);
      applyExplode(explode, time);
      labelO = smooth(0.45, 1.1, u) * (1 - intro);

      const s = (isMobile ? 0.34 : 0.66) * vh / 3.5 * lerp(1, 0.66, smooth(0.3, 1.5, u));
      rig.scale.setScalar(s);
      rig.position.set(
        isMobile ? 0 : lerp(vw * 0.24, vw * 0.2, smooth(0, 1.5, u)),
        isMobile ? lerp(vh * 0.2, vh * 0.12, smooth(0.2, 1.5, u)) : lerp(vh * 0.02, vh * 0.07, smooth(0.2, 1.5, u)),
        0
      );
      rig.rotation.set(
        mouse.sy * 0.08 + lerp(0.05, 0.15, smooth(0.3, 2, u)),
        -0.5 + Math.sin(time * 0.3) * 0.28 + mouse.sx * 0.35 + lerp(0, 0.35, smooth(0.2, 1.6, u)),
        0
      );
      swing.rotation.x = wind * 1.6;
      riderOpen.visible = false; riderSold.visible = true; riderSold.rotation.x = wind * 1.2;
      riderSold.position.y = -1.22;
      slash.scale.setScalar(0.0001);
      spot.intensity = 0;
      scene.background.copy(BG_HERO);
      dustMat.opacity = 0.45;
    } else {
      /* ===== PROCESS: install on a lawn ===== */
      applyExplode(0, time);
      const D = isMobile ? 16 : 9.5, vh = visH(D), vw = vh * aspect;
      const signX = isMobile ? 0 : vw * 0.17;
      rig.scale.setScalar(1);
      rig.rotation.set(0, -0.12, 0);
      rig.position.set(signX, CY, 0);
      lot.position.set(signX, 0, 0);
      const orbit = easeInOut(pp);
      const lookY = isMobile ? 1.75 - vh * 0.06 : 1.75;
      camera.position.set(lerp(-2.8, 1.8, orbit) + mouse.sx * 0.35, lerp(3.4, 2.1, orbit) - mouse.sy * 0.25, D);
      camera.lookAt(0, lookY, 0);
      scene.background.lerpColors(BG_HERO, BG_PROC, smooth(0, 0.06, pp));
      dustMat.opacity = 0.25;

      lotO = smooth(0, 0.07, pp);

      // 1 · Book: pin drops, ripple
      const pinK = clamp((pp - 0.02) / 0.1);
      pin.position.set(0, lerp(4, 0, bounce(pinK)), 0);
      pinMat.opacity = smooth(0.01, 0.04, pp) * (1 - smooth(0.32, 0.4, pp));
      pin.rotation.y = time * 1.5;
      const rk = clamp((pp - 0.1) / 0.1);
      ripple.scale.setScalar(0.2 + rk * 1.6); rippleMat.opacity = (1 - rk) * 0.8 * (rk > 0 ? 1 : 0);

      // 2 · Locate: flags pop, paint lines, safe ring
      flags.forEach((f, i) => {
        const k = clamp((pp - 0.21 - i * 0.018) / 0.04);
        f.scale.setScalar(Math.max(0.0001, easeOut(k) * (k < 1 ? 1 + Math.sin(k * Math.PI) * 0.3 : 1)));
        f.userData.flag.rotation.y = Math.sin(time * 3 + i) * 0.4;
      });
      paintMats.forEach((m, i) => (m.opacity = smooth(0.24 + i * 0.03, 0.3 + i * 0.03, pp) * 0.85));
      safeMat.opacity = smooth(0.33, 0.37, pp) * (1 - smooth(0.44, 0.48, pp));

      // 3 · Install: post drops in, arm + brace + cap, panel swings in
      const postK = clamp((pp - 0.4) / 0.06);
      parts.post.obj.position.y = parts.post.home.y + lerp(5, 0, bounce(postK));
      parts.post.obj.rotation.z = (1 - clamp((pp - 0.5) / 0.1)) * 0.078; // leans until plumbed
      const armK = easeOut(clamp((pp - 0.47) / 0.05));
      for (const n of ["arm", "brace", "cap"]) {
        const p = parts[n];
        p.obj.position.set(p.home.x + (1 - armK) * 3, p.home.y + (1 - armK) * 1.5, p.home.z);
        p.obj.visible = armK > 0.001;
      }
      parts.post.obj.visible = postK > 0.001;
      const panelK = clamp((pp - 0.52) / 0.06);
      swing.visible = panelK > 0.001;
      swing.position.y = parts.panel.home.y + (1 - easeOut(panelK)) * 2.5;
      const settle = clamp((pp - 0.57) / 0.14);
      swing.rotation.x = (1 - panelK) * -1.1 + Math.sin(settle * 18) * 0.35 * (1 - settle) * (panelK >= 1 ? 1 : 0) + wind;
      parts.brochure.obj.visible = pp > 0.56;
      parts.brochure.obj.scale.setScalar(Math.max(0.0001, easeOut(clamp((pp - 0.56) / 0.03))));
      spot.intensity = smooth(0.55, 0.6, pp) * 11;

      // 4 · Open house rider + directionals
      const ohIn = clamp((pp - 0.62) / 0.05), ohOut = clamp((pp - 0.8) / 0.04);
      riderOpen.visible = ohIn > 0 && ohOut < 1;
      riderOpen.position.y = -1.22 + (1 - bounce(ohIn)) * 1.4 - ohOut * 2.2;
      riderOpen.rotation.x = wind * 1.4 + ohOut * 1.4;
      riderOpen.rotation.z = ohOut * 0.6;
      arrows.forEach((a, i) => {
        const k = clamp((pp - 0.65 - i * 0.025) / 0.04) * (1 - clamp((pp - 0.8 - i * 0.01) / 0.03));
        a.scale.setScalar(Math.max(0.0001, easeOut(k)));
      });

      // 5 · SOLD
      const soldIn = clamp((pp - 0.84) / 0.05);
      riderSold.visible = soldIn > 0;
      riderSold.position.y = -1.22 + (1 - bounce(soldIn)) * 1.6;
      riderSold.rotation.x = wind * 1.4;
      const slashK = clamp((pp - 0.89) / 0.025);
      slash.scale.set(Math.max(0.0001, easeOut(slashK) * (1 + (1 - slashK) * 0.6)), Math.max(0.0001, easeOut(slashK)), 1);
      const sold = pp > 0.9;
      if (sold && !wasSold && !reduced) confettiAt = time;
      wasSold = sold;
    }

    /* shared visibility */
    if (!procMode) {
      for (const n of ["post", "arm", "brace", "cap", "brochure"]) { parts[n].obj.visible = true; parts[n].obj.scale.setScalar(1); }
      swing.visible = true; swing.position.y = parts.panel.home.y;
      flags.forEach((f) => f.scale.setScalar(0.0001)); arrows.forEach((a) => a.scale.setScalar(0.0001));
      pinMat.opacity = 0; rippleMat.opacity = 0; safeMat.opacity = 0; paintMats.forEach((m) => (m.opacity = 0));
      wasSold = false; confettiAt = -1;
    }
    lot.visible = procMode;
    lawnMat.opacity = lotO; walkMat.opacity = lotO;
    houseMats.forEach((m) => (m.opacity = m.userData.window ? lotO * (0.6 + 0.25 * Math.sin(time * 0.7 + m.id)) : lotO));
    poolMat.opacity = procMode ? spot.intensity / 11 * 0.3 : 0;

    labelSprites.forEach((s) => {
      const p = parts[s.userData.name]; if (!p) return;
      v3.copy(p.obj.position).add(s.userData.off); s.position.copy(v3);
      s.material.opacity = labelO;
      s.visible = labelO > 0.01;
    });

    spot.position.set(rig.position.x + 0.2, 0.15, 2.2);
    spot.target.position.set(rig.position.x + 0.3, 2.2, 0);
    key.target.position.set(rig.position.x, 0, 0);

    // confetti
    if (confettiAt >= 0) {
      const ct = time - confettiAt;
      const a = cGeo.attributes.position.array;
      for (let i = 0; i < CONF; i++) {
        const v = cVel[i];
        a[i * 3] = 0.3 + v.x * ct;
        a[i * 3 + 1] = Math.max(0.02, 2.3 + v.y * ct - 2.9 * ct * ct);
        a[i * 3 + 2] = 0.3 + v.z * ct;
      }
      cGeo.attributes.position.needsUpdate = true;
      confetti.material.opacity = clamp(1 - (ct - 2.2) / 1.2);
      if (ct > 3.5) confettiAt = -2;
    } else confetti.material.opacity = 0;

    const p = dGeo.attributes.position.array;
    for (let i = 0; i < DUST; i++) { p[i * 3 + 1] += 0.002 + (i % 7) * 0.0003; if (p[i * 3 + 1] > 9) p[i * 3 + 1] = -9; }
    dGeo.attributes.position.needsUpdate = true;
    dust.rotation.y = time * 0.02;

    composer.render();
  }
  requestAnimationFrame(frame);
}

/* ---------------- textures & helpers ---------------- */
const FONT = '"Inter Tight", "Helvetica Neue", Arial, sans-serif';

function canvasTex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

function fitText(x, text, maxW, size, weight = 800) {
  let s = size; x.font = `${weight} ${s}px ${FONT}`;
  while (x.measureText(text).width > maxW && s > 10) { s -= 4; x.font = `${weight} ${s}px ${FONT}`; }
  return s;
}

function panelTexture(text) {
  const c = document.createElement("canvas"); c.width = 1200; c.height = 800;
  const x = c.getContext("2d");
  x.fillStyle = "#f7f6f2"; x.fillRect(0, 0, 1200, 800);
  x.fillStyle = "#111214"; x.fillRect(0, 0, 1200, 120);
  x.fillStyle = "#ffb547"; x.fillRect(0, 120, 1200, 16);
  x.fillStyle = "#f7f6f2"; x.font = `600 54px ${FONT}`; x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText("★  ★  ★", 600, 62);
  x.fillStyle = "#111214"; x.textBaseline = "alphabetic";
  const words = text.toUpperCase().split(" ");
  if (words.length > 1) {
    fitText(x, words[0], 1000, 150, 600); x.fillText(words[0], 600, 330);
    const rest = words.slice(1).join(" ");
    fitText(x, rest, 1080, 330, 900); x.fillText(rest, 600, 610);
  } else { fitText(x, text, 1080, 300, 900); x.fillText(text, 600, 520); }
  x.fillStyle = "#111214"; x.fillRect(0, 690, 1200, 110);
  x.strokeStyle = "#ffb547"; x.lineWidth = 9; x.lineJoin = "round";
  x.beginPath(); x.moveTo(520, 770); x.lineTo(520, 735); x.lineTo(560, 705); x.lineTo(600, 735); x.lineTo(600, 770); x.closePath(); x.stroke();
  x.fillStyle = "#f7f6f2"; x.font = `700 44px ${FONT}`; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText("SIGN HERE", 625, 745);
  return canvasTex(c);
}

function riderTexture(text, bg, fg) {
  const c = document.createElement("canvas"); c.width = 1040; c.height = 240;
  const x = c.getContext("2d");
  x.fillStyle = bg; x.fillRect(0, 0, 1040, 240);
  x.strokeStyle = fg; x.globalAlpha = 0.25; x.lineWidth = 6; x.strokeRect(14, 14, 1012, 212); x.globalAlpha = 1;
  x.fillStyle = fg; x.textAlign = "center"; x.textBaseline = "middle";
  fitText(x, text, 900, 170, 900); x.fillText(text, 520, 128);
  return canvasTex(c);
}

function slashTexture() {
  const c = document.createElement("canvas"); c.width = 1200; c.height = 200;
  const x = c.getContext("2d");
  x.fillStyle = "#e5322d"; x.fillRect(0, 0, 1200, 200);
  x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.font = `900 150px ${FONT}`;
  x.fillText("SOLD!", 600, 108);
  return canvasTex(c);
}

function arrowTexture() {
  const c = document.createElement("canvas"); c.width = 600; c.height = 360;
  const x = c.getContext("2d");
  x.fillStyle = "#111214"; x.fillRect(0, 0, 600, 360);
  x.fillStyle = "#ffb547"; x.textAlign = "center"; x.font = `900 76px ${FONT}`; x.fillText("OPEN", 300, 100); x.fillText("HOUSE", 300, 180);
  x.beginPath(); x.moveTo(140, 250); x.lineTo(400, 250); x.lineTo(400, 215); x.lineTo(480, 275); x.lineTo(400, 335); x.lineTo(400, 300); x.lineTo(140, 300); x.closePath(); x.fill();
  return canvasTex(c);
}

function grassTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 512;
  const x = c.getContext("2d");
  x.fillStyle = "#1d2b17"; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const l = 10 + Math.random() * 16, h = 85 + Math.random() * 30;
    x.strokeStyle = `hsl(${h} 35% ${l}%)`; x.lineWidth = 1;
    const px = Math.random() * 512, py = Math.random() * 512;
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + (Math.random() - .5) * 3, py - 3 - Math.random() * 5); x.stroke();
  }
  const t = canvasTex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(18, 12); return t;
}

function radialTexture(rgb) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(0.35, `rgba(${rgb},.35)`); g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return canvasTex(c);
}

function textSprite(str, h) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
  updateSprite(s, str, h); return s;
}
function updateSprite(s, str, h) {
  const c = document.createElement("canvas"), x = c.getContext("2d");
  const fs = 56, font = `500 ${fs}px "JetBrains Mono", "Noto Sans SC", monospace`;
  x.font = font; const w = Math.ceil(x.measureText(str).width);
  c.width = w + 80; c.height = fs + 36;
  x.font = font; x.textBaseline = "middle";
  x.fillStyle = "rgba(8,9,11,.75)"; x.strokeStyle = "rgba(255,181,71,.8)"; x.lineWidth = 3;
  x.beginPath(); x.roundRect ? x.roundRect(2, 2, c.width - 4, c.height - 4, 12) : x.rect(2, 2, c.width - 4, c.height - 4); x.fill(); x.stroke();
  x.fillStyle = "#ffb547"; x.beginPath(); x.arc(30, c.height / 2, 8, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#f2efe8"; x.fillText(str, 54, c.height / 2 + 2);
  s.material.map?.dispose(); s.material.map = canvasTex(c); s.material.needsUpdate = true;
  s.scale.set(h * c.width / c.height, h, 1);
}
