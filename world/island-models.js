// Original miniature architecture for Samu Quest. The scene supplies its Three.js instance.
// The portfolio's peach, sky, mint and rose are woven through cedar, iron and chalk.
const P = {
  ink: '#090909', graphite: '#151613', charcoal: '#353835', slate: '#52585a',
  stone: '#aaa79f', shale: '#706e69', footing: '#4d514d', chalk: '#eeeee8',
  cedar: '#9c7055', redwood: '#75513e', heartwood: '#4a3931', plank: '#bd9371',
  sand: '#d4bd9e', copper: '#b87856', burnished: '#cd8865', darkCopper: '#815741',
  peach: '#f7b79e', rose: '#f3a2d9', mutedRose: '#a26686', wine: '#674353',
  sky: '#9cc9ee', blueSlate: '#536d80', steel: '#92a5ad', skyGlass: '#bed8e9',
  mint: '#9ad3b2', mintGlass: '#bddbc7', patina: '#63877a', pine: '#476458',
  leaf: '#719878', cream: '#f0dfbd', lamp: '#ffe0b7', bright: '#fff3dc'
};
const TAU = Math.PI * 2;

/* All opaque details, including roof seams and individual cedar courses, share one
   vertex-colored draw. Separate batches preserve glow and translucent glass. */
function atelier(T) {
  const group = new T.Group();
  const batches = new Map();
  const cache = new Map();
  const identity = new T.Quaternion();
  const up = new T.Vector3(0, 1, 0);
  const matrix = new T.Matrix4();
  const normalMatrix = new T.Matrix3();
  const position = new T.Vector3();
  const normal = new T.Vector3();
  const colorValue = new T.Color();
  const v = p => new T.Vector3(...p);
  const primitive = (key, factory) => {
    if (!cache.has(key)) cache.set(key, factory());
    return cache.get(key);
  };
  function add(geometry, color, center, scale = [1, 1, 1], rotation, coat = 'paint') {
    const quaternion = Array.isArray(rotation)
      ? new T.Quaternion().setFromEuler(new T.Euler(...rotation)) : rotation || identity;
    matrix.compose(v(center), quaternion, v(scale));
    normalMatrix.getNormalMatrix(matrix);
    colorValue.set(color);
    if (!batches.has(coat)) batches.set(coat, { pos: [], norm: [], rgb: [], index: [] });
    const batch = batches.get(coat);
    const { position: vertices, normal: normals } = geometry.attributes;
    const base = batch.pos.length / 3;
    for (let i = 0; i < vertices.count; i++) {
      position.fromBufferAttribute(vertices, i).applyMatrix4(matrix);
      normal.fromBufferAttribute(normals, i).applyNormalMatrix(normalMatrix);
      batch.pos.push(position.x, position.y, position.z);
      batch.norm.push(normal.x, normal.y, normal.z);
      batch.rgb.push(colorValue.r, colorValue.g, colorValue.b);
    }
    if (geometry.index) {
      for (const i of geometry.index.array) batch.index.push(base + i);
    } else {
      for (let i = 0; i < vertices.count; i++) batch.index.push(base + i);
    }
  }
  const box = (x, y, z, width, height, depth, c, rot, coat) =>
    add(primitive('box', () => new T.BoxGeometry(1, 1, 1)), c, [x, y, z], [width, height, depth], rot, coat);
  const cyl = (x, y, z, top, bottom, height, c, n = 12, rot, coat) => {
    const ratio = top / bottom;
    const geom = primitive('cyl' + ratio + '/' + n, () => new T.CylinderGeometry(ratio, 1, 1, n));
    add(geom, c, [x,y,z], [bottom, height, bottom], rot, coat);
  };
  const ball = (x, y, z, width, height, depth, c, rot, coat) =>
    add(primitive('ball', () => new T.SphereGeometry(1, 10, 7)), c, [x,y,z], [width,height,depth], rot, coat);
  const beam = (from, to, width, c, coat) => {
    const a = v(from), b = v(to);
    const delta = b.clone().sub(a);
    const length = delta.length();
    if (!length) return;
    const middle = a.addScaledVector(delta, .5);
    const turn = new T.Quaternion().setFromUnitVectors(up, delta.multiplyScalar(1 / length));
    add(primitive('beam', () => new T.CylinderGeometry(1, 1, 1, 6)), c, middle.toArray(), [width, length, width], turn, coat);
  };
  function quad(a, b, c, d, color, coat) {
    const geom = new T.BufferGeometry();
    const points = d ? [...a,...b,...c,...d] : [...a,...b,...c];
    geom.setAttribute('position', new T.Float32BufferAttribute(points,3));
    geom.setIndex(d ? [0,1,2,0,2,3] : [0,1,2]);
    geom.computeVertexNormals();
    add(geom,color,[0,0,0],undefined,undefined,coat);
    geom.dispose();
  }
  // Solid polygon with its cross-section in the x/y plane, extruded along z.
  function slab(points, depth, z, color) {
    const shape = new T.Shape();
    points.forEach(([x,y], i) => i ? shape.lineTo(x,y) : shape.moveTo(x,y));
    shape.closePath();
    const geom = new T.ExtrudeGeometry(shape, {depth, bevelEnabled:false, curveSegments:8});
    add(geom, color, [0,0,z-depth/2]);
    geom.dispose();
  }
  function finish() {
    for (const [coat,batch] of batches) {
      const geom = new T.BufferGeometry();
      geom.setAttribute('position',new T.Float32BufferAttribute(batch.pos,3));
      geom.setAttribute('normal',new T.Float32BufferAttribute(batch.norm,3));
      geom.setAttribute('color',new T.Float32BufferAttribute(batch.rgb,3));
      geom.setIndex(batch.index);
      geom.computeBoundingSphere();
      const glass = coat === 'glass';
      const polished = coat === 'glaze';
      const material = coat === 'glow'
        ? new T.MeshBasicMaterial({ vertexColors:true, side:T.DoubleSide, toneMapped:false })
        : new T.MeshPhongMaterial({
            vertexColors:true, side:T.DoubleSide, transparent:glass, opacity:glass ? .32 : 1,
            depthWrite:!glass, specular:glass ? 0xb3c7cb : polished ? 0x7a6659 : 0x272726,
            shininess:glass ? 56 : polished ? 36 : 12
          });
      if (glass) material.forceSinglePass = true;
      const mesh = new T.Mesh(geom,material);
      mesh.name = coat;
      mesh.castShadow = coat === 'paint' || coat === 'glaze';
      mesh.receiveShadow = coat === 'paint' || coat === 'glaze';
      if (glass) mesh.renderOrder = 2;
      group.add(mesh);
    }
    cache.forEach(g => g.dispose());
    return group;
  }
  return {T, group, add, box, cyl, ball, beam, quad, slab, finish};
}

function gableRoof(a, cx, eave, cz, width, depth, rise, colors = [P.slate,P.mutedRose]) {
  const {box,beam,slab} = a;
  slab([[cx-width/2,eave-.08],[cx+width/2,eave-.08],[cx,eave+rise]],depth-.15,cz,P.cedar);
  [-1,1].forEach((side,i) => {
    const run = width / 2 + .17;
    const drop = rise * run / (width/2);
    box(cx+side*run/2,eave+rise-drop/2,cz,Math.hypot(run,drop),.11,depth+.36,colors[i],
      [0,0,-side*Math.atan2(drop,run)],'glaze');
    for (let j=0;j<5;j++) {
      const z=cz-depth/2+j*depth/4;
      beam([cx,eave+rise+.074,z],[cx+side*run,eave+rise-drop+.074,z],.027,P.steel,'glaze');
    }
    for (const end of [-1,1]) {
      const z=cz+end*(depth/2+.18);
      beam([cx,eave+rise+.02,z],[cx+side*run,eave+rise-drop+.02,z],.074,P.plank);
    }
  });
  box(cx,eave+rise+.065,cz,.13,.1,depth+.44,P.chalk,undefined,'glaze');
}
function frontWindow(a,x,y,z,w,h,pane=P.lamp) {
  const {box}=a;
  box(x,y,z,w+.13,h+.13,.12,P.graphite);
  box(x,y,z+.073,w,h,.035,pane,undefined,'glow');
  box(x,y,z+.102,.05,h,.045,P.steel);
  box(x,y+.06*h,z+.102,w,.055,.045,P.steel);
  box(x,y-h/2-.07,z+.04,w+.22,.09,.23,P.plank);
}
function steps(a, x, z, width, deck, count = 3) {
  for (let j=0;j<count;j++) {
    const height = deck*(count-j)/count;
    a.box(x,height/2,z+j*.24,width,height,.29,j%2 ? P.shale : P.stone);
  }
}
// Three silk-thin strands dip and rise across a measured span. Each segment
// occupies its actual place in the structure, so the pattern also reads in profile.
function filaments(a, x, y, z, width, amplitude) {
  const colors=[P.peach,P.sky,P.rose];
  for(let strand=0;strand<3;strand++) {
    const point=t=>[x+(t-.5)*width,y+amplitude*(Math.sin(TAU*t+strand*.83)*.61+(strand-1)*.28),
      z+.024*strand+.012*Math.cos(TAU*t+strand*.83)];
    for(let j=0;j<9;j++) a.beam(point(j/9),point((j+1)/9),width*.0049,colors[strand],'glow');
  }
}

function observatory(a) {
  const {T,add,cyl,box,beam,ball}=a;
  const cz=-.27;
  cyl(0,.14,cz,2.37,2.5,.28,P.shale,16);
  cyl(0,.37,cz,2.16,2.28,.18,P.stone,16);
  cyl(0,1.22,cz,1.97,2.06,1.60,P.stone,16);
  cyl(0,1.97,cz,2.19,2.14,.22,P.graphite,20);
  cyl(0,2.14,cz,2.22,2.24,.10,P.steel,20,undefined,'glaze');
  cyl(0,2.31,cz,1.90,1.96,.27,P.charcoal,20);
  for (let i=0;i<12;i++) {
    const t=i*TAU/12, s=Math.sin(t), c=Math.cos(t);
    if (i) {
      box(s*2.015,1.30,cz+c*2.015,.28,.62,.095,P.footing,[0,t,0]);
      box(s*2.073,1.30,cz+c*2.073,.17,.48,.055,P.lamp,[0,t,0],'glow');
    }
    box(s*2.055,.60,cz+c*2.055,.62,.08,.06,i%2?P.shale:P.sand,[0,t,0]);
  }
  // One rotating, standing-seam copper dome, with a clear slot for the telescope.
  const y=2.43, r=1.85, h=1.63, opening=.56, start=2.27+opening/2, span=TAU-opening;
  const point=(phi,lat,outset=0)=>[-(r+outset)*Math.cos(phi)*Math.sin(lat),
    y+(h+outset)*Math.cos(lat), cz+(r+outset)*Math.sin(phi)*Math.sin(lat)];
  const panels=15;
  for(let i=0;i<panels;i++) {
    const phi=start+i*span/panels;
    const pane=new T.SphereGeometry(1,3,6,phi,span/panels,0,Math.PI/2);
    add(pane,[P.burnished,P.copper,P.darkCopper,P.copper,P.burnished][i%5],[0,y,cz],[r,h,r],undefined,'glaze');
    pane.dispose();
    for(let j=0;j<4;j++) beam(point(phi,j*Math.PI/8,.015),point(phi,(j+1)*Math.PI/8,.015),
      .024,i%4===0?P.peach:P.darkCopper);
  }
  // Fine sky and copper latitudes cross the ridge seams like threads of the homepage weave.
  for(let k=0;k<2;k++) {
    const color=k?P.peach:P.sky;
    const at=t=>point(start+t*span,.96+k*.13+.07*Math.sin(t*TAU*2+k*.71),.035+k*.009);
    for(let j=0;j<35;j++) beam(at(j/35),at((j+1)/35),.017,color,'glow');
  }
  cyl(0,y-.012,cz,r+.065,r+.06,.105,P.charcoal,24);
  cyl(0,y+h,cz,.11,.21,.115,P.darkCopper,12,undefined,'glaze');
  const axisStart=[.60,2.84,cz+.69],axisEnd=[1.67,4.13,cz+1.93];
  beam(axisStart,axisEnd,.19,P.darkCopper,'glaze');
  const tube=(u)=>axisStart.map((x,i)=>x+(axisEnd[i]-x)*u);
  beam(tube(.78),tube(.97),.24,P.peach,'glaze');
  beam(tube(.963),tube(1),.26,P.ink);
  beam(tube(.998),tube(1.01),.19,P.sky,'glow');
  for(let i=0;i<20;i++){
    const p=t=>[2.19*Math.sin(t),2.57,cz+2.19*Math.cos(t)];
    const t=i*TAU/20, end=(i+1)*TAU/20;
    beam(p(t),p(end),.041,P.copper);
    if(i%2===0) beam([p(t)[0],2.17,p(t)[2]],p(t),.047,P.heartwood);
  }
  box(0,.84,cz+2.03,.66,1.13,.18,P.graphite);
  box(0,.93,cz+2.14,.38,.82,.04,P.copper);
  box(0,1.11,cz+2.17,.23,.22,.035,P.lamp,undefined,'glow');
  steps(a,0,cz+2.12,1.12,.37);
  ball(.23,.82,cz+2.19,.04,.04,.04,P.copper);
}

function fieldStation(a) {
  const {box,cyl,beam,ball}=a;
  const cx=-.58, z=-.38, w=3.86,d=2.60,fz=z+d/2;
  box(cx,.21,z,w+.18,.37,d+.20,P.shale);
  box(cx,1.30,z,w,1.85,d,P.cedar);
  for(let i=0;i<6;i++) box(cx,.58+.26*i,fz+.012,w,.036,.046,P.redwood);
  gableRoof(a,cx,2.22,z,w,d,.9,[P.slate,P.patina]);
  frontWindow(a,cx-.90,1.45,fz+.04,1.08,.71,P.mintGlass);
  box(cx+.56,1.02,fz+.055,.80,1.36,.12,P.patina);
  frontWindow(a,cx+.56,1.30,fz+.13,.34,.32,P.bright);
  for(const x of [cx-w/2+.05,cx+w/2-.05]) box(x,1.32,fz+.03,.14,1.9,.14,P.plank);
  box(cx,.34,fz+.29,w+.20,.20,.69,P.plank);
  steps(a,cx+.56,fz+.78,.93,.34,2);
  // A tilted solar rack has a powder-blue cell grid visible from the air.
  const px=2.30,pz=.28,tilt=-.34,cy=1.12,sw=1.38,sd=2.14;
  for(const dx of [-.49,.49]) for(const dz of [-.72,.72]) {
    const top=cy+Math.sin(-tilt)*dz-.05;
    box(px+dx,top/2,pz+dz,.10,top,.10,P.graphite);
  }
  const surface=(u,v,offset=.04)=>[px+u,cy-Math.sin(tilt)*v+offset,pz+Math.cos(tilt)*v];
  box(px,cy,pz,sw,.09,sd,P.blueSlate,[tilt,0,0],'glaze');
  for(let i=0;i<=4;i++) {
    let u=-sw/2+i*sw/4;
    beam(surface(u,-sd/2),surface(u,sd/2),i%4===0?.030:.014,i%4===0?P.chalk:P.mint,'glaze');
  }
  for(let i=0;i<=6;i++) {
    const v=-sd/2+i*sd/6;
    beam(surface(-sw/2,v),surface(sw/2,v),i%3===0?.027:.014,i%3===0?P.steel:P.steel,'glaze');
  }
  // Open triangular meteorological mast, side braces and anemometer.
  const mx=1.80,mz=-1.31;
  const leg=(angle,t)=>[mx+Math.cos(angle)*(.47-.40*t),.07+t*3.78,mz+Math.sin(angle)*(.47-.40*t)];
  for(let i=0;i<3;i++){
    const angle=i*TAU/3, next=(i+1)*TAU/3;
    beam(leg(angle,0),leg(angle,1),.055,P.cream);
    for(let j=0;j<3;j++) {
      beam(leg(angle,j/3),leg(next,(j+1)/3),.028,P.copper);
      beam(leg(next,(j+1)/3),leg(angle,(j+1)/3),.034,P.copper);
    }
  }
  cyl(mx,4.00,mz,.035,.035,.63,P.cream,6);
  for(let i=0;i<3;i++) {
    const t=i*TAU/3, x=mx+Math.cos(t)*.32,z=mz+Math.sin(t)*.32;
    beam([mx,4.13,mz],[x,4.13,z],.023,P.copper);
    ball(x,4.13,z,.105,.09,.095,P.mint,undefined,'glaze');
  }
  box(-2.51,.48,1.25,.43,.9,.48,P.patina);
  cyl(-2.51,.97,1.25,.32,.29,.10,P.copper);
}

function workshop(a) {
  const {box,slab,beam,cyl,ball}=a;
  const w=5.55,d=2.98,cz=-.41, fz=cz+d/2;
  box(0,.16,cz,w+.22,.32,d+.20,P.shale);
  box(0,1.20,cz,w,1.75,d,P.cedar);
  for(let i=0;i<10;i++) box(-2.50+i*.55,1.21,fz+.016,.055,1.74,.045,P.redwood);
  const tooth=w/3;
  for(let i=0;i<3;i++) {
    const left=-w/2+i*tooth, right=left+tooth, low=2.08,high=3.04;
    slab([[left,low-.03],[right,low-.03],[right,high]],d,cz,[P.slate,P.blueSlate,P.slate][i]);
    const dx=tooth+.14,dy=(high-low)*dx/tooth;
    box((left+right)/2,(low+high)/2+.03,cz,Math.hypot(dx,dy),.11,d+.23,[P.darkCopper,P.burnished,P.copper][i],
      [0,0,Math.atan2(dy,dx)],'glaze');
    for(let j=0;j<4;j++) {
      const z=cz-d/2+j*d/3;
      beam([left-.03,low+.05,z],[right+.03,high+.09,z],.026,P.steel,'glaze');
    }
    for(let j=0;j<3;j++) {
      const u=(j+.5)/3;
      const x=left+tooth*u,ph=.58*u;
      box(x,2.11+ph/2,fz+.012,.43,ph,.036,[P.mintGlass,P.rose,P.sky][(i+j)%3],undefined,'glow');
      const z=cz-d/2+(j+.50)*d/3;
      box(right+.015,2.57,z,.037,.62,d/3-.115,[P.mintGlass,P.sky,P.rose][j],undefined,'glow');
    }
    box(right,2.1,fz+.055,.10,1.71,.12,P.graphite);
  }
  frontWindow(a,-1.84,1.36,fz+.05,1.08,.69);
  frontWindow(a,.05,1.36,fz+.05,1.17,.69,P.bright);
  box(1.82,.97,fz+.08,.83,1.25,.16,P.graphite);
  box(1.82,1.06,fz+.18,.64,.98,.035,P.copper);
  box(1.82,1.23,fz+.21,.47,.37,.045,P.graphite);
  filaments(a,1.82,1.23,fz+.241,.43,.115);
  steps(a,1.82,fz+.31,1.07,.32,2);
  // Workbench, a lathe and two bright spools in front of the workshop.
  for(const x of [-1.55,-.10]) for(const z of [1.52,2.05]) box(x,.30,z,.10,.60,.10,P.heartwood);
  box(-.82,.66,1.78,1.82,.14,.76,P.plank);
  cyl(-1.37,.82,1.78,.13,.13,.23,P.steel);
  cyl(-1.06,.79,1.88,.12,.12,.16,P.rose);
  box(-.45,.86,1.72,.57,.20,.30,P.patina);
  ball(-.35,1.04,1.72,.14,.15,.14,P.copper);
  cyl(2.31,2.91,-1.08,.175,.19,2.05,P.patina,10);
  cyl(2.31,3.87,-1.08,.235,.235,.13,P.copper,10);
  cyl(2.31,3.94,-1.08,.13,.165,.05,P.ink,10);
  for(let i=0;i<3;i++) cyl(2.31,2.26+i*.50,-1.08,.205,.205,.07,P.copper,10);
}

function stage(a) {
  const {box,beam,cyl,ball,quad}=a;
  const back=-1.32,base=.43, spring=1.08;
  box(0,base/2,-.74,5.78,base,1.88,P.heartwood);
  box(0,base,-.72,5.92,.11,2.03,P.plank);
  // A rose pleated band shell, flanked by two iron arches.
  const arch=(angle,r,y,z)=>[r*Math.cos(angle),y+r*Math.sin(angle),z];
  const pieces=16;
  for(let i=0;i<pieces;i++){
    const t0=i*Math.PI/pieces,t1=(i+1)*Math.PI/pieces;
    const b0=arch(t0,2.27,spring,back), b1=arch(t1,2.27,spring,back);
    const k=i%2===0?.09:-.03;
    quad([0,.50,back-.08],[b0[0],b0[1],back+k],[b1[0],b1[1],back-k],null,
      [P.wine,P.mutedRose,P.rose,P.mutedRose][Math.floor(i/2)%4],'paint');
    beam([0,.50,back+.035],b0,.022,i%2?P.rose:P.steel,'glaze');
    for(const z of [back+.08,back-.39]) {
      beam(arch(t0,2.38,spring,z),arch(t1,2.38,spring,z),.083,P.charcoal,'glaze');
    }
    if(i%2===0) {
      beam(arch(t0,2.38,spring,back+.08),arch(t0,2.38,spring,back-.39),.050,P.steel,'glaze');
      const lamp=arch(t0,2.19,spring,back+.11);
      ball(...lamp,.060,.060,.060,i%4===0?P.mintGlass:P.rose,undefined,'glow');
    }
  }
  for(const x of [-2.38,2.38]) beam([x,.45,back+.075],[x,spring,back+.075],.075,P.copper);
  for(const side of [-1,1]) {
    const x=side*2.60;
    box(x,.97,-.82,.50,.95,.48,P.ink);
    box(x,1.67,-.82,.45,.46,.44,P.graphite);
    for(const y of [.82,1.14,1.65]) {
      cyl(x,y,-.564,.134,.134,.048,P.patina,10,[Math.PI/2,0,0]);
      cyl(x,y,-.532,.064,.064,.03,P.ink,10,[Math.PI/2,0,0]);
    }
  }
  filaments(a,0,.70,back+.23,3.43,.19);
  box(0,.78,-.71,.98,.62,.48,P.charcoal);
  box(0,1.12,-.71,1.20,.10,.57,P.graphite);
  for(const x of [-.35,.35]) cyl(x,1.19,-.70,.18,.18,.04,P.sky,12);
  for(let j=0;j<3;j++) {
    const zb=.49+j*.57, y=.20+j*.10;
    // Curved rows of cedar benches. A narrow center aisle stays open.
    for(const side of [-1,1]) for(let i=0;i<4;i++) {
      const x=side*(.62+i*.56), z=zb-.085*x*x;
      box(x,y,z,.63,.17,.27,j%2?P.plank:P.copper,[0,side*.12*(i+1),0]);
      if(i%2===0) box(x,y/2,z,.12,y,.16,P.shale);
    }
  }
  for(let i=0;i<7;i++) {
    const x=-2.40+i*.8;
    box(x,.31,.227,.24,.045,.028,i%2?P.lamp:P.rose,undefined,'glow');
  }
}

function glasshouse(a) {
  const {box,beam,quad,cyl,ball}=a;
  const w=5.41, cz=-.32;
  box(0,.13,cz,w+.29,.26,3.55,P.stone);
  box(0,.31,cz,w,.19,3.27,P.heartwood);
  const cross=[[-1.62,.39],[-1.62,1.77],[-1.44,2.31],[-.94,2.87],[0,3.18],
    [.94,2.87],[1.44,2.31],[1.62,1.77],[1.62,.39]];
  const pos=(x,j)=>[x,cross[j][1],cz+cross[j][0]];
  const frames=6, colors=[P.mint,P.mintGlass,P.skyGlass,P.sky,P.mintGlass];
  for(let i=0;i<=frames;i++) {
    const x=-w/2+w*i/frames;
    for(let j=0;j<cross.length-1;j++) {
      beam(pos(x,j),pos(x,j+1),.046,P.charcoal);
      if(i<frames) {
        const nx=x+w/frames;
        // Leave an open doorway on the front face at the entry.
        if(!(i===2||i===3) || j!==7)
          quad(pos(x,j),pos(nx,j),pos(nx,j+1),pos(x,j+1),colors[(i+j)%colors.length],'glass');
      }
    }
    if(i===0||i===frames) {
      for(let j=0;j<cross.length-1;j++) {
        quad([x,.39,cz],pos(x,j),pos(x,j+1),null,colors[j%colors.length],'glass');
      }
    }
  }
  for(let j=0;j<cross.length;j++) {
    beam(pos(-w/2,j),pos(w/2,j),j===4?.063:.035,j===4?P.copper:P.slate,'glaze');
  }
  for(let side of [-1,1]) {
    beam([-w/2,1.08,cz+side*1.63],[w/2,1.08,cz+side*1.63],.030,P.patina);
    const x=side*w/2;
    beam([x,.36,cz],[x,3.18,cz],.042,P.patina);
    beam([x,1.69,cz-1.62],[x,1.69,cz+1.62],.036,P.patina);
  }
  // Projecting entry with a ridged copper eyebrow above the doors.
  const fz=cz+1.77;
  box(0,.34,fz+.13,1.33,.19,.89,P.shale);
  for(let side of [-1,1]){
    box(side*.56,1.10,fz+.22,.09,1.42,.09,P.copper);
    beam([side*.66,1.79,fz+.31],[0,2.10,fz+.31],.055,P.copper);
    quad([side*.66,1.79,fz-.19],[side*.66,1.79,fz+.32],[0,2.10,fz+.32],[0,2.10,fz-.19],P.patina);
  }
  // A pressed copper leaf with a pale mint midrib above the garden gate.
  const leafTip=[.10,2.01,fz+.35], leafBase=[-.11,1.79,fz+.35];
  quad(leafBase,[-.16,1.94,fz+.35],leafTip,[.13,1.84,fz+.35],P.patina);
  beam(leafBase,leafTip,.015,P.mint,'glow');
  steps(a,0,fz+.66,1.05,.37,2);
  // Flower beds and a central orchid sit just below the glazed ridge.
  for(const side of [-1,1]) {
    box(side*1.74,.47,cz,1.21,.28,2.65,P.redwood);
    for(let i=0;i<8;i++){
      const t=i*2.235+side, z=cz-.98+(i%4)*.64, x=side*(1.38+.43*Math.abs(Math.sin(t)));
      const h=.35+.32*(i%3);
      beam([x,.61,z],[x+.12*Math.sin(t),.69+h,z+.06*Math.cos(t)],.031,P.pine);
      for(const angle of [-1,1]) {
        ball(x+angle*.12,.65+h*.55,z,.15,h*.49,.10,i%2?P.mint:P.leaf,[.18*Math.cos(t),t,-angle*.45]);
      }
      if(i%3===0) ball(x,.68+h,z,.14,.16,.14,P.rose);
    }
  }
  cyl(0,.64,cz-.22,.43,.29,.49,P.copper,10);
  beam([0,.88,cz-.22],[.08,2.45,cz-.14],.058,P.pine);
  for(let i=0;i<7;i++) {
    const t=i*TAU/7,z=cz-.14;
    ball(.08+.25*Math.cos(t),2.38,z+.25*Math.sin(t),.15,.25,.15,
      i%2?P.rose:P.peach,[.6*Math.sin(t),0,-.6*Math.cos(t)]);
  }
  ball(.08,2.51,cz-.14,.16,.15,.16,P.lamp,undefined,'glow');
  for(let side of [-1,1]){
    box(side*1.61,.47,fz,1.06,.33,.41,P.copper);
    for(let j=0;j<4;j++) {
      const x=side*1.61-.36+j*.24;
      ball(x,.77,fz,.135,.25,.11,j%2?P.leaf:P.mint,[0,0,Math.sin(j)*.37]);
      ball(x,.95,fz,.085,.09,.085,j%2?P.rose:P.peach);
    }
  }
}

function library(a) {
  const {box,beam,cyl,ball,quad}=a;
  const cz=-.48, width=4.59, depth=2.79, fz=cz+depth/2, eave=2.09;
  box(0,.20,cz,width+.21,.4,depth+.17,P.shale);
  box(0,1.23,cz,width,1.74,depth,P.redwood);
  for(let i=0;i<7;i++) {
    const y=.53+i*.225;
    box(0,y,fz+.008,width,.04,.043,P.cedar);
    for(const s of [-1,1]) box(s*(width/2+.006),y,cz,.044,.04,depth,P.heartwood);
  }
  gableRoof(a,0,eave,cz,width,depth,1.55,[P.graphite,P.slate]);
  // Two slightly bowed panels share a binding, like an open book seen edge on.
  const wy=2.53, wz=fz+.076;
  for(const side of [-1,1]) {
    const bx=side*.60, ox=side*.055;
    quad([ox,wy-.23,wz],[bx,wy-.12,wz-.025],[bx,wy+.33,wz-.025],[ox,wy+.19,wz],P.lamp,'glow');
    beam([ox,wy+.20,wz+.012],[bx,wy+.34,wz-.008],.034,P.copper,'glaze');
    beam([bx,wy-.13,wz-.016],[bx,wy+.34,wz-.016],.029,P.charcoal);
    for(let j=0;j<3;j++) {
      const line=wy-.10+j*.10;
      beam([side*.13,line,wz+.023],[side*.51,line+.088,wz+.001],.011,P.darkCopper);
    }
  }
  beam([0,wy-.26,wz],[0,wy+.205,wz],.032,P.copper,'glaze');
  for(let side of [-1,1]) {
    frontWindow(a,side*1.47,1.29,fz+.04,.70,.72);
    box(side*(width/2-.10),1.23,fz+.08,.131,1.75,.13,P.plank);
  }
  box(0,1.01,fz+.06,.82,1.25,.16,P.graphite);
  box(0,1.01,fz+.16,.63,1.12,.04,P.patina);
  frontWindow(a,0,1.18,fz+.18,.34,.37,P.lamp);
  box(0,.37,fz+.33,4.76,.16,.91,P.plank);
  steps(a,0,fz+.95,1.16,.36,2);
  // Public bookcase with colored spines, and a little open book on the stand.
  const bx=-2.00,bz=1.58;
  box(bx,.99,bz,1.13,1.03,.31,P.heartwood);
  for(const side of [-1,1]) box(bx+side*.56,.98,bz+.09,.08,1.24,.49,P.plank);
  for(const y of [.47,.92,1.40]) box(bx,y,bz+.08,1.18,.065,.48,P.plank);
  for(let row=0;row<2;row++)for(let i=0;i<6;i++) {
    const x=bx-.46+i*.174,h=.25+(i*7%4)*.034;
    box(x,.53+row*.47+h*.5,bz+.27,.125,h,.18,[P.steel,P.rose,P.copper,P.mutedRose,P.copper,P.peach][(i+row*2)%6],
      [0,0,(i===4?-.12:0)]);
    box(x,.61+row*.47,bz+.367,.083,.021,.008,P.cream);
  }
  const stand=1.72, z=1.73;
  box(stand,.53,z,.18,1.02,.18,P.heartwood);
  box(stand,1.05,z,.84,.09,.54,P.plank,[.18,0,0]);
  quad([stand,1.12,z+.22],[stand+.34,1.18,z+.20],[stand+.34,1.24,z-.18],[stand,1.17,z-.19],P.cream);
  quad([stand-.34,1.18,z+.20],[stand,1.12,z+.22],[stand,1.17,z-.19],[stand-.34,1.24,z-.18],P.sand);
  const chimney=-1.6;
  box(chimney,2.75,-1.26,.46,1.52,.51,P.footing);
  for(let i=0;i<6;i++) box(chimney,2.25+i*.23,-1.26,.47,.055,.54,i%2?P.shale:P.stone);
  box(chimney,3.49,-1.26,.58,.16,.65,P.sand);
  for(let side of [-1,1]) {
    box(side*.65,1.66,fz+.17,.12,.24,.14,P.lamp,undefined,'glow');
    ball(side*.65,1.83,fz+.17,.104,.052,.104,P.copper);
  }
}

const builders = {
  observatory, 'field-station':fieldStation, workshop, stage, glasshouse, library
};
export function buildLandmark(THREE,id) {
  const build=builders[id];
  if (!build || !Object.hasOwn(builders,id)) throw new RangeError('Unknown island landmark: ' + id);
  const model=atelier(THREE);
  build(model);
  const group=model.finish();
  group.name=id;
  return group;
}

export function buildTraveler(THREE) {
  const a=atelier(THREE);
  const {box,beam,ball,cyl,add}=a;
  for(const side of [-1,1]){
    box(side*.115,.22,.008,.148,.32,.15,P.ink,[side*.044,0,side*.037]);
    ball(side*.119,.085,.052,.112,.086,.159,P.redwood);
  }
  cyl(0,.58,0,.19,.25,.52,P.blueSlate,9);
  cyl(0,.77,0,.21,.213,.062,P.copper,10);
  ball(0,.916,0,.24,.238,.184,P.patina);
  // The opening in the traveler's coral cape faces forward, revealing the satchel.
  const geom=new THREE.CylinderGeometry(.15,.35,.70,13,1,true,Math.PI*.23,Math.PI*1.55);
  add(geom,P.peach,[0,.76,-.043],[1,1,.82]);
  geom.dispose();
  for(const side of [-1,1]) {
    beam([side*.184,1.03,-.085],[side*.29,.49,.113],.052,side===1?P.burnished:P.copper);
  }
  beam([-.161,1.059,.088],[.15,.62,.199],.036,P.sand);
  box(.14,.61,.201,.196,.14,.092,P.redwood,[0,-.19,.09]);
  cyl(0,1.116,.003,.184,.241,.106,P.cream,10);
  ball(0,1.335,0,.225,.235,.202,P.heartwood);
  ball(0,1.338,.075,.178,.185,.147,'#b7795d');
  for(const side of [-1,1]) {
    ball(side*.076,1.36,.206,.020,.019,.016,P.ink);
    ball(side*.18,1.345,.091,.040,.050,.031,'#b7795d');
  }
  ball(0,1.302,.220,.036,.040,.026,'#d29876');
  ball(0,1.492,-.039,.226,.127,.201,P.burnished);
  ball(-.064,1.556,-.103,.145,.085,.126,P.peach);
  cyl(0,1.102,0,.22,.20,.066,P.sky,10);
  const hand=[.24,.87,.10];
  beam([.17,.99,0],hand,.061,P.burnished);
  ball(...hand,.066,.059,.061,'#b7795d');
  beam([.34,.015,.15],[.26,1.46,.103],.032,P.darkCopper);
  ball(.26,1.50,.103,.076,.095,.061,P.copper,undefined,'glaze');
  ball(.26,1.526,.129,.052,.065,.047,P.sky,undefined,'glow');
  const group=a.finish();
  group.name='traveler';
  return group;
}

export function buildBeacon(THREE) {
  const a=atelier(THREE);
  const {cyl,box,beam}=a;
  cyl(0,.16,0,1.02,1.18,.32,P.shale,10);
  cyl(0,.37,0,.81,.97,.18,P.stone,10);
  cyl(0,1.00,0,.64,.81,1.10,P.chalk,14,undefined,'glaze');
  cyl(0,1.83,0,.56,.64,.56,P.graphite,14,undefined,'glaze');
  cyl(0,1.57,0,.65,.65,.074,P.peach,14,undefined,'glaze');
  cyl(0,2.46,0,.48,.56,.70,P.chalk,14,undefined,'glaze');
  cyl(0,2.86,0,.57,.48,.13,P.copper,12);
  cyl(0,3.04,0,.87,.51,.25,P.patina,12);
  cyl(0,3.19,0,.90,.90,.10,P.steel,12,undefined,'glaze');
  box(0,.86,.737,.34,.66,.09,P.heartwood);
  box(0,2.44,.512,.17,.26,.055,P.lamp,undefined,'glow');
  const at=(r,t,y)=>[r*Math.sin(t),y,r*Math.cos(t)];
  for(let i=0;i<12;i++) {
    const t=i*TAU/12,nt=(i+1)*TAU/12;
    beam(at(.82,t,3.24),at(.82,t,3.56),.023,P.graphite);
    beam(at(.82,t,3.56),at(.82,nt,3.56),.029,P.copper);
    if(i%2===0) beam(at(.51,t,3.23),at(.51,t,3.99),.045,P.steel,'glaze');
    a.quad(at(.50,t,3.27),at(.50,nt,3.27),at(.50,nt,3.94),at(.50,t,3.94),i%4<2?P.skyGlass:P.cream,'glass');
  }
  cyl(0,3.94,0,.59,.56,.089,P.copper,12);
  cyl(0,4.13,0,.105,.68,.34,P.burnished,12,undefined,'glaze');
  cyl(0,4.37,0,.025,.10,.18,P.copper,8);
  const group=a.finish();
  const lens=new THREE.Mesh(new THREE.CylinderGeometry(.21,.23,.39,12),
    new THREE.MeshStandardMaterial({color:P.chalk,emissive:P.peach,emissiveIntensity:.55,roughness:.19}));
  lens.position.y=3.59;
  lens.name='beacon lens';
  group.add(lens);
  group.name='coastal beacon';
  group.userData.lamp=lens;
  return group;
}
