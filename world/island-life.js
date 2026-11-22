import { groundHeight } from './island-ground.js';
import { tideStars } from './island-quest.js';

function makeFox(T) {
  const copper = new T.MeshStandardMaterial({ color: '#c67443', roughness: 0.85, flatShading: true });
  const cream = new T.MeshStandardMaterial({ color: '#f6dfb8', roughness: 1 });
  const ink = new T.MeshStandardMaterial({ color: '#473b40', roughness: 1 });
  const round = new T.SphereGeometry(1, 8, 6),
    point = new T.ConeGeometry(1, 1, 4);
  function part(parent, geometry, material, position, scale) {
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }
  const body = new T.Group();
  part(body, round, copper, [0, 0.52, 0], [0.27, 0.29, 0.54]);
  const head = new T.Group();
  head.position.set(0, 0.8, 0.37);
  body.add(head);
  part(head, round, copper, [0, 0.04, 0], [0.29, 0.28, 0.27]);
  for (const side of [-1, 1]) {
    const ear = part(head, point, copper, [side * 0.18, 0.35, -0.015], [0.14, 0.32, 0.13]);
    ear.rotation.z = -side * 0.16;
    part(head, point, ink, [side * 0.19, 0.4, 0.003], [0.073, 0.14, 0.073]);
    part(head, round, ink, [side * 0.18, 0.085, 0.193], [0.031, 0.04, 0.031]);
  }
  part(head, round, cream, [0, -0.035, 0.2], [0.17, 0.12, 0.21]);
  part(head, round, ink, [0, -0.014, 0.39], [0.069, 0.055, 0.045]);
  const tail = new T.Group();
  tail.position.set(0, 0.48, -0.34);
  body.add(tail);
  const plume = part(tail, round, copper, [0, 0.13, -0.31], [0.19, 0.2, 0.42]);
  plume.rotation.x = 0.38;
  const tip = part(tail, round, cream, [0, 0.26, -0.62], [0.12, 0.14, 0.18]);
  tip.rotation.x = 0.43;
  const legs = [];
  for (const side of [-1, 1])
    for (const z of [-0.29, 0.27]) {
      const leg = new T.Group();
      leg.position.set(side * 0.155, 0.46, z);
      body.add(leg);
      part(leg, round, copper, [0, -0.14, 0], [0.073, 0.18, 0.078]);
      part(leg, round, ink, [0, -0.32, 0.018], [0.068, 0.1, 0.083]);
      legs.push(leg);
    }
  body.scale.setScalar(1.19);
  return { body, tail, legs, head };
}
function makeGull(T, light, dark) {
  const bird = new T.Group();
  const body = new T.Mesh(new T.SphereGeometry(1, 8, 5), light);
  body.scale.set(0.37, 0.13, 0.14);
  bird.add(body);
  const wings = [];
  for (const side of [-1, 1]) {
    const wing = new T.Group();
    wing.position.z = side * 0.06;
    bird.add(wing);
    const geo = new T.BufferGeometry();
    geo.setAttribute(
      'position',
      new T.Float32BufferAttribute(
        [
          0.2,
          0.03,
          0,
          -0.34,
          0.04,
          0,
          -0.05,
          0.15,
          side * 0.64,
          0.2,
          0.03,
          0,
          -0.05,
          0.15,
          side * 0.64,
          0.19,
          0.16,
          side * 0.5,
          0.19,
          0.16,
          side * 0.5,
          -0.05,
          0.15,
          side * 0.64,
          -0.31,
          0.1,
          side * 1.03,
        ],
        3
      )
    );
    geo.computeVertexNormals();
    geo.addGroup(0, 6, 0);
    geo.addGroup(6, 3, 1);
    wing.add(new T.Mesh(geo, [light, dark]));
    wings.push(wing);
  }
  return { bird, wings };
}
function makeRowboat(T) {
  const boat = new T.Group();
  const stations = [
    [-1.52, 0.055],
    [-1, 0.45],
    [0, 0.59],
    [0.92, 0.45],
    [1.54, 0.04],
  ];
  const vertices = [],
    faces = [];
  for (const [z, half] of stations) {
    for (const [x, y] of [
      [-half, 0.28],
      [-half * 0.81, 0.01],
      [0, -0.14],
      [half * 0.81, 0.01],
      [half, 0.28],
    ]) {
      vertices.push(x, y + 0.055 * Math.abs(z), z);
    }
  }
  for (let row = 0; row < stations.length - 1; row++)
    for (let col = 0; col < 4; col++) {
      const a = row * 5 + col;
      faces.push(a, a + 5, a + 1, a + 1, a + 5, a + 6);
    }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(faces);
  geometry.computeVertexNormals();
  const cedar = new T.MeshStandardMaterial({ color: '#b27d5f', side: T.DoubleSide, roughness: 0.8 });
  boat.add(new T.Mesh(geometry, cedar));
  const trim = new T.MeshStandardMaterial({ color: '#edbb8e', roughness: 0.76 });
  for (const side of [-1, 1]) {
    const edge = new T.CatmullRomCurve3(
      stations.map(([z, half]) => new T.Vector3(side * half, 0.28 + 0.055 * Math.abs(z), z))
    );
    boat.add(new T.Mesh(new T.TubeGeometry(edge, 12, 0.038, 5, false), trim));
  }
  for (const z of [-0.62, 0.46]) {
    const seat = new T.Mesh(new T.BoxGeometry(0.98, 0.07, 0.23), trim);
    seat.position.set(0, 0.19, z);
    boat.add(seat);
  }
  const oar = new T.Group(),
    shaft = new T.Mesh(new T.BoxGeometry(0.045, 0.045, 1.9), trim);
  const blade = new T.Mesh(new T.BoxGeometry(0.14, 0.045, 0.45), cedar);
  blade.position.z = -0.95;
  oar.add(shaft, blade);
  oar.position.set(0.04, 0.3, 0);
  oar.rotation.y = 0.39;
  boat.add(oar);
  boat.position.set(3.25, -0.99, 17.65);
  boat.rotation.y = -0.08;
  return boat;
}

function makeAurora(T) {
  const geometry = new T.PlaneGeometry(1, 1, 144, 10);
  const material = new T.ShaderMaterial({
    transparent: true,
    side: T.DoubleSide,
    depthWrite: false,
    blending: T.AdditiveBlending,
    uniforms: { time: { value: 0 }, strength: { value: 0 }, bearing: { value: 0 } },
    vertexShader: `varying vec2 vUv;
      uniform float time;uniform float bearing;
      void main(){
        vUv=uv;
        float a=(uv.x-.5)*3.65;
        float fold=sin(3.0*a+time*.12)+.48*sin(7.0*a-time*.20);
        float radius=29.5+fold*1.7+uv.y*1.4;
        float height=.3+1.1*fold+uv.y*(8.0+2.0*cos(5.0*a+time*.2));
        gl_Position=projectionMatrix*modelViewMatrix*vec4(-sin(a+bearing)*radius,height,-cos(a+bearing)*radius,1.0);
      }`,
    fragmentShader: `varying vec2 vUv;
      uniform float time;uniform float strength;
      void main(){
        float a=vUv.x*6.2831853;float y=vUv.y;
        float strand=.5+.5*sin(a*64.0+3.6*sin(a*9.0+time*.22));
        float strands=.72+.15*strand+.10*sin(a*143.0+strand+time*.11);
        float rise=y-.13-.075*sin(2.3*a+time*.09)-.04*sin(5.0*a-time*.15);
        float fade=smoothstep(-.14,.07,rise)*exp(-3.1*max(0.,rise))*smoothstep(.0,.19,y)*(1.-smoothstep(.68,1.,y));
        fade*=smoothstep(0.,.12,vUv.x)*(1.-smoothstep(.88,1.,vUv.x));
        vec3 lower=mix(vec3(.035,.72,.39),vec3(.095,.46,.88),.5+.5*sin(a*3.0));
        vec3 col=mix(lower,vec3(.76,.24,.51),y);
        gl_FragColor=vec4(col,strength*fade*strands*(.52+.12*sin(4.0*a+time*.15)));
        #include <colorspace_fragment>
      }`,
  });
  const curtain = new T.Mesh(geometry, material);
  curtain.frustumCulled = false;
  curtain.visible = false;
  return curtain;
}

export function addIslandLife(T, scene, landing) {
  const boat = makeRowboat(T);
  scene.add(boat);
  const fox = makeFox(T);
  scene.add(fox.body);
  fox.body.position.set(landing.x - 1, groundHeight(landing.x - 1, landing.z), landing.z);
  const plumage = new T.MeshStandardMaterial({ color: '#eee8da', side: T.DoubleSide, roughness: 1 });
  const wingtips = new T.MeshStandardMaterial({ color: '#5c6978', side: T.DoubleSide, roughness: 1 });
  const flock = Array.from({ length: 4 }, () => {
    const gull = makeGull(T, plumage, wingtips);
    scene.add(gull.bird);
    return gull;
  });
  const stars = new Map(),
    amber = new T.MeshBasicMaterial({ color: '#fff0c6' }),
    rose = new T.MeshBasicMaterial({ color: '#f6b59c' });
  const diamond = new T.OctahedronGeometry(0.53),
    hoop = new T.TorusGeometry(0.6, 0.028, 6, 30);
  for (const star of tideStars) {
    const group = new T.Group(),
      core = new T.Mesh(diamond, amber),
      orbit = new T.Mesh(hoop, rose);
    group.userData.star = star.id;
    core.scale.set(0.61, 1, 0.61);
    orbit.rotation.x = 0.88;
    group.add(core, orbit);
    group.position.set(star.x, groundHeight(star.x, star.z) + 1.22, star.z);
    scene.add(group);
    stars.set(star.id, { group, core, height: group.position.y });
  }
  const aurora = makeAurora(T);
  scene.add(aurora);
  const flecks = new Float32Array(3 * 18),
    burstGeometry = new T.BufferGeometry();
  const position = new T.BufferAttribute(flecks, 3);
  burstGeometry.setAttribute('position', position);
  const burst = new T.Points(
    burstGeometry,
    new T.PointsMaterial({ color: '#ffe0b7', size: 0.17, transparent: true, depthWrite: false })
  );
  burst.visible = false;
  burst.frustumCulled = false;
  scene.add(burst);
  let burstAge = 2,
    greetingAge = 2,
    lit = false,
    brightness = 0;
  function setCollected(collected, discovery) {
    for (const [id, star] of stars) star.group.visible = !collected.has(id);
    lit = collected.size === stars.size;
    if (discovery) {
      const star = stars.get(discovery);
      burst.position.copy(star.group.position);
      burstAge = 0;
    }
  }
  function update(time, dt, avatar, still, bearing) {
    boat.position.y = -0.99 + (still ? 0 : 0.078 * Math.sin(time * 1.36));
    boat.rotation.z = still ? 0 : 0.053 * Math.sin(time * 1.36 + 0.7);
    boat.rotation.x = still ? 0 : 0.023 * Math.sin(time * 1.04);
    const position3 = fox.body.position,
      dx = avatar.x - position3.x,
      dz = avatar.z - position3.z,
      d = Math.hypot(dx, dz);
    const step = Math.max(0, d - 1.48) * (still ? 1 : 1 - Math.exp(-5.5 * dt));
    if (d > 9) {
      position3.x = avatar.x - 0.92;
      position3.z = avatar.z + 0.96;
    } else if (d > 0.01) {
      position3.x += (dx * step) / d;
      position3.z += (dz * step) / d;
    }
    if (step > 0.003) fox.body.rotation.y = Math.atan2(dx, dz);
    const running = !still && d > 1.65,
      beat = running ? Math.sin(time * 14) : 0;
    const pounce = still || burstAge > 0.65 ? 0 : Math.sin((burstAge / 0.65) * Math.PI) * 0.52;
    greetingAge += dt;
    const greeting = !still && greetingAge < 0.8 ? Math.sin((Math.PI * greetingAge) / 0.8) : 0;
    position3.y =
      groundHeight(position3.x, position3.z) + Math.abs(beat) * 0.081 + pounce + greeting * 0.28;
    fox.legs.forEach((leg, i) => {
      leg.rotation.x = beat * (i === 1 || i === 2 ? 0.53 : -0.53);
    });
    fox.tail.rotation.y = still
      ? 0.18
      : 0.27 * Math.sin(time * (running ? 8 : 2.7)) + greeting * 0.66 * Math.sin(greetingAge * 29);
    fox.head.rotation.z = (!running && !still ? 0.08 * Math.sin(time * 1.8) : 0) + greeting * 0.26;
    flock.forEach(({ bird, wings }, i) => {
      const a = 0.78 + time * 0.14 + i * 0.23;
      bird.position.set(
        Math.cos(a) * 21 + i * 0.6,
        8.1 + i * 0.47 + 0.8 * Math.sin(a * 2 + i),
        -6 + Math.sin(a) * 13 + i
      );
      bird.rotation.y = Math.atan2(-Math.cos(a) * 13, -Math.sin(a) * 21);
      bird.rotation.z = 0.11 * Math.sin(a);
      const flap = still
        ? 0.18
        : 0.1 + 0.34 * Math.sin(time * 4.5 + i) * (0.5 + 0.5 * Math.cos(time * 0.65 + i));
      wings[0].rotation.x = flap;
      wings[1].rotation.x = -flap;
    });
    for (const { group, core, height } of stars.values()) {
      group.position.y = height + (still ? 0 : 0.15 * Math.sin(time * 2.4 + group.position.x));
      core.rotation.y = time * 1.2;
      group.rotation.y = time * 0.5 + group.position.z;
    }
    brightness = still
      ? Number(lit)
      : brightness + (Number(lit) - brightness) * (1 - Math.exp(-2.2 * dt));
    aurora.visible = lit || brightness > 0.01;
    aurora.material.uniforms.strength.value = brightness;
    aurora.material.uniforms.time.value = time;
    aurora.material.uniforms.bearing.value = bearing;
    burstAge += dt;
    burst.visible = !still && burstAge < 0.83;
    if (burst.visible) {
      for (let i = 0; i < 18; i++) {
        const theta = i * 2.39996,
          r = burstAge * (1.2 + (i % 4) * 0.4);
        flecks[i * 3] = Math.cos(theta) * r;
        flecks[i * 3 + 1] = burstAge * (2.1 + (i % 3) * 0.7) - 2.8 * burstAge * burstAge;
        flecks[i * 3 + 2] = Math.sin(theta) * r;
      }
      position.needsUpdate = true;
      burst.material.opacity = 1 - burstAge / 0.83;
    }
  }
  return {
    stars,
    foxPosition: fox.body.position,
    greet() {
      greetingAge = 0;
    },
    setCollected,
    update,
  };
}
