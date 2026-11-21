// Coordinates are shared by terrain, paths, placement, and navigation.
export const locations = [
  { id:'observatory', x:-11.1, z:-7.5, turn:.42, height:4.9 },
  { id:'glasshouse', x:.4, z:-11.0, turn:.04, height:4.0 },
  { id:'workshop', x:12.9, z:-6.8, turn:-.65, height:4.4 },
  { id:'library', x:16.0, z:1.8, turn:-.74, height:3.8 },
  { id:'stage', x:7.5, z:9.2, turn:-.43, height:4.0 },
  { id:'field-station', x:-11.3, z:5.2, turn:.71, height:4.0 }
];
const TAU = 2 * Math.PI;
const smooth = t => { t = Math.max(0,Math.min(1,t)); return t*t*(3-2*t); };
export function seeded(seed) {
  return () => { seed = (Math.imul(1664525,seed)+1013904223) >>> 0; return seed / 4294967296; };
}
function shoreline(angle) {
  return 1 + .045*Math.sin(3*angle+.6) + .047*Math.cos(5*angle-.15) + .032*Math.sin(8*angle);
}
function edgeRatio(x,z) {
  return Math.hypot(x/23.6,z/16.4) / shoreline(Math.atan2(z/16.4,x/23.6));
}
function hill(x,z) {
  const ridge = 3.4*Math.exp(-((x+10)**2/105 + (z+8)**2/35)) + 1.6*Math.exp(-((x-2)**2/120 + (z+10)**2/30));
  return 1.75 + ridge + .33*Math.sin(x*.22)*Math.cos(z*.21) - 1.17*smooth((edgeRatio(x,z)-.84)/.16);
}
export function groundHeight(x,z) {
  let y = hill(x,z);
  for (const p of locations) {
    const t = smooth((4.55-Math.hypot(x-p.x,z-p.z))/1.65);
    if (t > 0) y += (hill(p.x,p.z)-y)*t;
  }
  return y;
}
export function doorway(p) { return {x:p.x+3.65*Math.sin(p.turn),z:p.z+3.65*Math.cos(p.turn)}; }
export const beaconLocation = {x:17.85,z:-8.1};
export function walkable(x,z) {
  if (edgeRatio(x,z) > .937 || Math.hypot(x,z) < 1.5 || Math.hypot(x-beaconLocation.x,z-beaconLocation.z)<1.05) return false;
  return !locations.some(p => {
    const dx=x-p.x, dz=z-p.z, c=Math.cos(p.turn), s=Math.sin(p.turn);
    return Math.abs(c*dx-s*dz) < 3.28 && Math.abs(s*dx+c*dz) < 2.65;
  });
}
function clearLine(from,to) {
  const n=Math.ceil(Math.hypot(to.x-from.x,to.z-from.z)/.45);
  for(let i=1;i<=n;i++) if(!walkable(from.x+(to.x-from.x)*i/n,from.z+(to.z-from.z)*i/n)) return false;
  return true;
}
// A small eight-way grid keeps tap travel on land and outside the buildings.
export function walkingRoute(from,to) {
  if (!walkable(to.x,to.z)) return [];
  if (clearLine(from,to)) return [to];
  const key=(x,z)=>(x+36)*100+(z+28);
  const candidates = point => {
    const options=[];
    for(let dx=-1;dx<=1;dx++) for(let dz=-1;dz<=1;dz++) {
      const p={x:Math.round(point.x)+dx,z:Math.round(point.z)+dz};
      if (walkable(p.x,p.z) && clearLine(point,p)) options.push(p);
    }
    return options.sort((a,b)=>Math.hypot(a.x-point.x,a.z-point.z)-Math.hypot(b.x-point.x,b.z-point.z));
  };
  const start=candidates(from)[0], goal=candidates(to)[0];
  if (!start || !goal) return [];
  const startKey=key(start.x,start.z), goalKey=key(goal.x,goal.z);
  const open=[{...start,cost:0,estimate:0}], previous=new Map(), costs=new Map([[startKey,0]]);
  while (open.length) {
    let best=0;
    for(let i=1;i<open.length;i++) if(open[i].estimate<open[best].estimate) best=i;
    const node=open.splice(best,1)[0], nodeKey=key(node.x,node.z);
    if(node.cost>costs.get(nodeKey)) continue;
    if(nodeKey===goalKey) {
      const result=[to];
      let step=node;
      while(step) { result.unshift({x:step.x,z:step.z}); step=previous.get(key(step.x,step.z)); }
      const smoothPath=[]; let cur=from;
      for(let i=0;i<result.length;) {
        let j=result.length-1;
        while(j>i && !clearLine(cur,result[j])) j--;
        cur=result[j]; smoothPath.push(cur); i=j+1;
      }
      return smoothPath;
    }
    for(let dx=-1;dx<=1;dx++) for(let dz=-1;dz<=1;dz++) {
      if(!dx && !dz) continue;
      const x=node.x+dx,z=node.z+dz, next=key(x,z), cost=node.cost+Math.hypot(dx,dz);
      if(cost>=(costs.get(next)??Infinity) || !walkable(x,z) || !clearLine(node,{x,z})) continue;
      costs.set(next,cost); previous.set(next,node);
      open.push({x,z,cost,estimate:cost+Math.hypot(x-goal.x,z-goal.z)});
    }
  }
  return [];
}
export function addLandscape(T,scene) {
  const rng=seeded(71403), segments=104, rings=19;
  const top=[], colors=[], cliff=[], cliffColors=[];
  const point=(i,f)=>{
    const a=TAU*i/segments, r=shoreline(a)*f;
    const x=Math.cos(a)*23.6*r,z=Math.sin(a)*16.4*r;
    return [x,groundHeight(x,z),z];
  };
  const shade = new T.Color();
  function triangle(dst, rgb, a,b,c,base,variation) {
    shade.set(base).multiplyScalar(1+(rng()-.5)*variation);
    for(const p of [a,b,c]) {dst.push(...p);rgb.push(shade.r,shade.g,shade.b);}
  }
  for(let ring=1;ring<=rings;ring++) for(let i=0;i<segments;i++) {
    const frac=ring/rings, a=point(i,frac), b=point(i+1,frac);
    const c=point(i,(ring-1)/rings), d=point(i+1,(ring-1)/rings);
    const meadow = frac>.975 ? '#9e9f8d' : frac>.922 ? '#98a38e' : '#9baf94';
    triangle(top,colors,a,c,b,meadow,.13);
    if(ring>1) triangle(top,colors,b,c,d,meadow,.13);
    if(ring===rings) {
      const a1=[a[0]*1.018,-.25+.48*Math.sin(i*.64),a[2]*1.018];
      const b1=[b[0]*1.018,-.25+.48*Math.sin((i+1)*.64),b[2]*1.018];
      const a2=[a[0]*1.047,-1.72,a[2]*1.047],b2=[b[0]*1.047,-1.72,b[2]*1.047];
      triangle(cliff,cliffColors,a,b,a1,'#929aab',.36);triangle(cliff,cliffColors,b,b1,a1,'#718596',.32);
      triangle(cliff,cliffColors,a1,b1,a2,'#526c82',.34);triangle(cliff,cliffColors,b1,b2,a2,'#668a98',.34);
    }
  }
  function surface(positions,rgb) {
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geometry.setAttribute('color',new T.Float32BufferAttribute(rgb,3)); geometry.computeVertexNormals();
    const m=new T.Mesh(geometry,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));
    m.receiveShadow=true; scene.add(m); return m;
  }
  const land=surface(top,colors); surface(cliff,cliffColors);
  // Shallow submerged shelves sample the same irregular shore as the cliffs.
  const surf=[], surfColors=[];
  for(let i=0;i<segments;i++) {
    const a=point(i,1.035), b=point(i+1,1.035), c=point(i,1.063+.009*Math.sin(i*.57)), d=point(i+1,1.063+.009*Math.sin((i+1)*.57));
    for(const p of [a,b,c,d]) p[1]=-1.025;
    triangle(surf,surfColors,a,b,c,'#aeebe2',.18);triangle(surf,surfColors,b,d,c,'#89d9d4',.18);
  }
  surface(surf,surfColors);
  const paths=[];
  function makePath(points,width) {
    const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,0,z)));
    const ribbon=[], rgb=[], left=[],right=[];
    for(let i=0;i<=48;i++) {
      const p=curve.getPoint(i/48),d=curve.getTangent(i/48),w=width*(1+.035*Math.sin(i*.28));
      paths.push([p.x,p.z]);
      for(const [edge,sign] of [[left,1],[right,-1]]) {
        const x=p.x+d.z*w*sign,z=p.z-d.x*w*sign;
        edge.push([x,groundHeight(x,z)+.081,z]);
      }
      if(i) {triangle(ribbon,rgb,left[i-1],left[i],right[i-1],'#dbd8c2',.055);triangle(ribbon,rgb,left[i],right[i],right[i-1],'#d4cebe',.04);}
    }
    surface(ribbon,rgb);
  }
  for(const p of locations){
    const e=doorway(p),len=Math.hypot(e.x,e.z);
    makePath([[e.x/len*2.5,e.z/len*2.5],[e.x*.54-.5,e.z*.55+.8],[e.x,e.z]],.60);
  }
  makePath([[0,2.65],[-1.7,7.3],[.2,12.4],[1.6,15.0]],.65);
  const material=(color)=>new T.MeshLambertMaterial({color});
  const add=(geometry,mat,x,y,z)=>{
    const mesh=new T.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.receiveShadow=true;scene.add(mesh);return mesh;
  };
  const plazaY=groundHeight(0,0);
  add(new T.CylinderGeometry(3.35,3.55,.28,44),material('#bdcdd1'),0,plazaY+.1,0);
  const inlay=add(new T.TorusGeometry(2.75,.065,5,60),new T.MeshBasicMaterial({color:'#f7b79e'}),0,plazaY+.27,0);inlay.rotation.x=Math.PI/2;
  // Three woven filaments bring the original portfolio cover into the plaza.
  const filamentColors=['#f7b79e','#9cc9ee','#f3a2d9'];
  const plinth=add(new T.CylinderGeometry(1.16,1.36,.47,32),material('#363938'),0,plazaY+.37,0);
  for(const [k,color] of filamentColors.entries()){
    const points=[];
    for(let i=0;i<=38;i++){
      const u=i/38, turn=u*TAU*1.05+k*TAU/3, radius=.28+.48*Math.sin(Math.PI*u);
      points.push(new T.Vector3(Math.cos(turn)*radius,plinth.position.y+.23+u*3.15,Math.sin(turn)*radius));
    }
    const strand=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),40,.079,6,false),
      new T.MeshPhongMaterial({color,emissive:color,emissiveIntensity:.15,shininess:90,specular:0xffede0}));
    scene.add(strand);
  }
  // Trees, coastal boulders, and flowers are instanced so their number has little draw cost.
  const category=new Map(), temp=new T.Object3D();
  function instance(group,geo,color,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0) {
    if(!category.has(group)) category.set(group,{geo:geo(),items:[]});
    temp.position.set(x,y,z);temp.rotation.set(rx,ry,rz);temp.scale.set(sx,sy,sz);temp.updateMatrix();
    category.get(group).items.push([temp.matrix.clone(),new T.Color(color)]);
  }
  const trunk=()=>new T.CylinderGeometry(.13,.18,1,5), cone=()=>new T.ConeGeometry(1,1,7), stone=()=>new T.DodecahedronGeometry(1,0),bud=()=>new T.IcosahedronGeometry(1,0);
  for(let i=0;i<1150;i++) {
    const x=(rng()-.5)*48,z=(rng()-.5)*33;
    const e=edgeRatio(x,z);
    if(e>.953 || e<.20 || locations.some(p=>Math.hypot(p.x-x,p.z-z)<4.2) || Math.hypot(x-beaconLocation.x,z-beaconLocation.z)<2.2 || paths.some(p=>(x-p[0])**2+(z-p[1])**2<2.05)) continue;
    const y=groundHeight(x,z),v=rng();
    if(v < (e>.67 ? .23 : .07)) {
      const h=(1.4+rng()*2.2)*(z>6?.75:1), r=h*.25,turn=rng()*TAU;
      instance('trunks',trunk,'#826768',x,y+h*.30,z,1,h*.6,1);
      instance('trees',cone,'#374f51',x,y+h*.46,z,r,h*.52,r,0,turn);
      instance('trees',cone,'#4d6964',x,y+h*.64,z,r*.80,h*.57,r*.8,0,turn+.5);
      instance('trees',cone,'#69877a',x,y+h*.84,z,r*.55,h*.52,r*.55,0,turn);
    } else if(v<.32 && e>.68) {
      const a=.28+rng()*.58; instance('stone',stone,'#95a5ae',x,y+.04,z,a,a*.69,a*.75,.3,rng()*TAU,.12);
    } else if(v<.70) {
      const color=['#e5bdcd','#f3a2d9','#9ad3b2','#9cc9ee'][Math.floor(rng()*4)];
      for(let j=0;j<3;j++){const fx=x+(rng()-.5)*.6,fz=z+(rng()-.5)*.6;
        instance('buds',bud,color,fx,groundHeight(fx,fz)+.18,fz,.1,.20,.09,.13,rng()*TAU,.1);}
    }
  }
  // The small public dock marks the starting path.
  const plank=()=>new T.BoxGeometry(1,1,1);
  for(let i=0;i<14;i++)instance('dock',plank,i%2?'#ad9690':'#bea79c',1.7,.32,15.0+i*.29,1.65,.13,.26);
  for(const x of [.94,2.46]) for(const z of [15.2,17.4,18.65]) instance('posts',trunk,'#627887',x,-.39,z,1.45,2.10,1.45);
  for(const p of locations){
    const e=doorway(p);
    for(const sign of [-1,1]){
      const x=e.x+Math.cos(p.turn)*1.27*sign,z=e.z-Math.sin(p.turn)*1.27*sign,y=groundHeight(x,z);
      instance('lamps',trunk,'#607f90',x,y+.46,z,.77,.94,.77);
      instance('globes',bud,'#fff0d6',x,y+1.01,z,.16,.23,.16);
    }
  }
  // Distant Gulf Islands frame the far water.
  for(let i=0;i<30;i++){
    const a=TAU*i/30;const radius=87+rng()*50,x=Math.sin(a)*radius,z=Math.cos(a)*radius;
    instance('distant',stone,'#57779b',x,-2.8,z,5+rng()*10,1.8+rng()*3.5,4+rng()*9,0,rng()*TAU);
  }
  for(const [name,{geo,items}] of category){
    const mat=name==='globes'? new T.MeshBasicMaterial():new T.MeshLambertMaterial({flatShading:true});
    const mesh=new T.InstancedMesh(geo,mat,items.length);
    items.forEach(([matrix,color],i)=>{mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,color);});
    mesh.castShadow=['trunks','trees','stone','dock','posts'].includes(name);mesh.receiveShadow=true;scene.add(mesh);
  }
  const waterMaterial=new T.ShaderMaterial({
    uniforms:{time:{value:0}},
    vertexShader:'varying vec3 pos; void main(){vec4 w=modelMatrix*vec4(position,1.);pos=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:`
      varying vec3 pos; uniform float time;
      void main() {
        vec2 p=pos.xz;
        float scale=length(p/vec2(25.,18.));
        float shore=1.-smoothstep(1.,1.58,scale);
        vec3 color=mix(vec3(.085,.134,.18),vec3(.25,.42,.48),shore*.88);
        float ripple=sin(p.y*2.5+sin(p.x*.52+time*.28)*1.6+time*.56);
        float flicker=sin(p.x*1.05+p.y*.30+sin(p.y*.8-time*.25));
        float line=smoothstep(.92,1.,ripple)*smoothstep(.12,.99,flicker);
        color+=vec3(.24,.28,.31)*line*(.30+.7*shore);
        float lavender=exp(-abs(p.x-18.+p.y*.3)*.095);
        color+=vec3(.17,.095,.12)*lavender*(.3+line*.8);
        float farwater=smoothstep(65.,190.,length(p));
        color=mix(color,vec3(.36,.43,.52),farwater);
        gl_FragColor=vec4(color,1.);
      }`,side:T.DoubleSide
  });
  const water=add(new T.PlaneGeometry(440,440),waterMaterial,0,-1.12,0);water.rotation.x=-Math.PI/2;
  return {land,waterMaterial};
}
