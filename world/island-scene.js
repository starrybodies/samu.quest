import * as T from '../assets/vendor/three.module.min.js';
import { buildLandmark, buildTraveler, buildBeacon } from './island-models.js';
import { locations, doorway, walkable, walkingRoute, groundHeight, addLandscape, beaconLocation } from './island-ground.js';

import { landing, tideStars } from './island-quest.js';
import { addIslandLife } from './island-life.js';

const limit=(x,min,max)=>Math.max(min,Math.min(max,x));
export function createIsland({host,canvas,context,markers,starMarkers,foxButton,places,onNearby,onArrive,onStar,onLost}) {
  const renderer=new T.WebGLRenderer({canvas,context,antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,matchMedia('(pointer:coarse)').matches ? 1.5 : 1.75));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;
  canvas.tabIndex=0;canvas.setAttribute('aria-label','Island walk. Use WASD or arrow keys to move, and Enter to visit a nearby landmark.');
  host.append(canvas);
  const scene=new T.Scene(); scene.background=new T.Color('#8998ac');scene.fog=new T.Fog('#8190a3',85,165);
  const camera=new T.OrthographicCamera(-32,32,19,-19,.15,235);
  const sky=new T.HemisphereLight(0xd7e6f3,0x655a5c,1.15);scene.add(sky);
  const sun=new T.DirectionalLight(0xffdbbd,2.05);sun.position.set(-25,47,26);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-34,right:34,top:30,bottom:-30,near:1,far:98});
  sun.shadow.normalBias=.045;sun.shadow.bias=-.00028;scene.add(sun,sun.target);
  const rim=new T.DirectionalLight(0xadc5e4,1.05);rim.position.set(18,11,-22);scene.add(rim);
  const {land,waterMaterial}=addLandscape(T,scene);
  const buildings=[],lamps=new Map(),anchors=new Map(),entries=new Map();
  const landingRing=new T.TorusGeometry(.89,.041,6,40);
  const lightOrb=new T.SphereGeometry(.16,12,8);
  for(const place of locations){
    const group=buildLandmark(T,place.id), y=groundHeight(place.x,place.z);
    group.position.set(place.x,y,place.z);group.rotation.y=place.turn;group.userData.place=place.id;scene.add(group);buildings.push(group);
    const e=doorway(place), floor=groundHeight(e.x,e.z);
    const color=places.get(place.id).color;
    const ring=new T.Mesh(landingRing,new T.MeshBasicMaterial({color,transparent:true,opacity:.65}));
    ring.rotation.x=Math.PI/2;ring.position.set(e.x,floor+.14,e.z);scene.add(ring);
    const orb=new T.Mesh(lightOrb,new T.MeshBasicMaterial({color}));orb.position.set(e.x,floor+1.47,e.z);scene.add(orb);
    const signal=new T.Mesh(new T.ConeGeometry(.82,3.9,16,1,true),new T.MeshBasicMaterial({color,transparent:true,opacity:.09,side:T.DoubleSide,depthWrite:false}));
    signal.position.set(place.x,y+3.45,place.z);signal.visible=false;scene.add(signal);
    lamps.set(place.id,{ring,orb,signal,y:orb.position.y});
    anchors.set(place.id,new T.Vector3(place.x,y+place.height+.28,place.z));
    entries.set(place.id,e);
  }
  const lighthouse=buildBeacon(T), by=groundHeight(beaconLocation.x,beaconLocation.z);
  lighthouse.position.set(beaconLocation.x,by,beaconLocation.z);scene.add(lighthouse);
  const beam=new T.Group();beam.position.set(beaconLocation.x,by+3.56,beaconLocation.z);
  const beamCone=new T.Mesh(new T.ConeGeometry(1.8,10,20,1,true),new T.MeshBasicMaterial({color:'#ffdcc5',transparent:true,opacity:.16,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending}));
  beamCone.rotation.z=Math.PI/2;beamCone.position.x=5;beam.add(beamCone);beam.visible=false;scene.add(beam);
  const avatar=buildTraveler(T);avatar.position.set(landing.x,0,landing.z);avatar.rotation.y=Math.PI;scene.add(avatar);
  const life=addIslandLife(T,scene,landing);
  let collected=new Set(),twilight=0;
  const daylight=sun.color.clone(),evening=new T.Color('#f7bcb0');
  const skyDay=sky.color.clone(),skyNight=new T.Color('#99abc9');
  const avatarHalo=new T.Mesh(new T.RingGeometry(.36,.49,32),new T.MeshBasicMaterial({color:'#fff3fd',side:T.DoubleSide}));
  avatarHalo.rotation.x=-Math.PI/2;scene.add(avatarHalo);
  const targetRing=new T.Mesh(new T.RingGeometry(.36,.45,28),new T.MeshBasicMaterial({color:'#f7b79e',side:T.DoubleSide}));
  targetRing.rotation.x=-Math.PI/2;targetRing.visible=false;scene.add(targetRing);
  const startBounds=host.getBoundingClientRect();
  let yaw=0.13,zoom=startBounds.width/startBounds.height<.9?1.90:1.45,follow=new T.Vector2(0,0),width=1,height=1;
  let route=[],arriveAt=null,nearest=null,paused=false,disposed=false;
  let frameID=0,last=0,time=0,stride=0,dirty=true,hasFrame=false;
  const keys=new Set(),projected=new T.Vector3(),ray=new T.Raycaster();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const events=new AbortController(),signal=events.signal;
  const addEvent=(target,event,fn,options={})=>target.addEventListener(event,fn,{...options,signal});
  const phase=()=>!document.hidden&&!paused&&!disposed;
  function cameraFor(dt=1){
    const level=limit((zoom-1)*1.24,0,.94);
    const aspect=width/height;
    // On portrait screens, leave room to see the winding trail ahead of the traveler.
    const lead=aspect<.9 ? 11.5*level : 0;
    const lookX=avatar.position.x*level-Math.sin(yaw)*lead;
    const lookZ=avatar.position.z*level-Math.cos(yaw)*lead;
    const damp=reduced.matches?1:1-Math.exp(-7*dt);
    follow.x+=(lookX-follow.x)*damp;follow.y+=(lookZ-follow.y)*damp;
    const minSpan = aspect<.9 ? 43/aspect : Math.max(34.5,56/aspect);
    const vertical = minSpan/zoom;
    camera.top=vertical/2;camera.bottom=-vertical/2;camera.right=vertical*aspect/2;camera.left=-camera.right;
    const centerY=1.6+twilight*1.9;
    camera.position.set(follow.x+Math.sin(yaw)*64,centerY+47-twilight*16,follow.y+Math.cos(yaw)*64);
    camera.lookAt(follow.x,centerY,follow.y);camera.updateProjectionMatrix();camera.updateMatrixWorld();
  }
  function positionMarkers(){
    function pin(marker,anchor,yOffset=0){
      projected.copy(anchor);projected.y+=yOffset;projected.project(camera);
      const x=(projected.x*.5+.5)*width,y=(-projected.y*.5+.5)*height;
      marker.style.visibility=projected.z < -1 || projected.z > 1||x<9||y<12||x>width-9||y>height-16?'hidden':'';
      marker.style.transform='translate('+Math.round(x)+'px,'+Math.round(y)+'px) translate(-50%,-100%)';
    }
    pin(foxButton,life.foxPosition,.12);
    for(const [id,marker] of markers)pin(marker,anchors.get(id));
    for(const [id,marker] of starMarkers)if(!collected.has(id))pin(marker,life.stars.get(id).group.position,.46);
  }
  function resize(){
    const r=host.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);
    renderer.setSize(width,height,false);cameraFor();dirty=true;request();
  }
  function visitNearby(){
    let shortest=2.2,found=null;
    for(const [id,e] of entries){
      const d=Math.hypot(avatar.position.x-e.x,avatar.position.z-e.z);
      if(d<shortest){found=id;shortest=d;}
    }
    if(found!==nearest){nearest=found;onNearby(nearest);}
  }
  function placeAt(x,z,dx,dz,moving){
    avatar.position.x=x;avatar.position.z=z;
    if(moving)avatar.rotation.y=Math.atan2(dx,dz);
    const y=groundHeight(x,z);
    avatar.position.y=y+(moving && !reduced.matches ? .07*Math.abs(Math.sin(stride)) : 0);
    avatar.rotation.z=moving && !reduced.matches ? .048*Math.sin(stride) : 0;
    avatarHalo.position.set(x,y+.102,z);
  }
  function clearTravel(){route=[];arriveAt=null;targetRing.visible=false;}
  function routeTo(to,id){
    const from={x:avatar.position.x,z:avatar.position.z};
    const path=walkingRoute(from,to);
    if(!path.length)return;
    route=path;arriveAt=id;targetRing.visible=true;targetRing.position.set(to.x,groundHeight(to.x,to.z)+.16,to.z);
    dirty=true;request();
  }
  function placeTraveler(id){
    clearTravel();
    const entry=entries.get(id);
    if(!entry)return;
    placeAt(entry.x,entry.z,0,-1,false);visitNearby();dirty=true;request();
  }
  function travelTo(id){
    const e=entries.get(id);
    if(!e)return;
    if(reduced.matches || Math.hypot(avatar.position.x-e.x,avatar.position.z-e.z)<.65){
      placeTraveler(id);onArrive(id);return;
    }
    routeTo(e,id);
  }
  function travelToStar(id){
    const star=tideStars.find(item=>item.id===id);
    if(!star||collected.has(id))return;
    if(reduced.matches){
      clearTravel();placeAt(star.x,star.z,0,0,false);onStar(id);dirty=true;request();
    }else routeTo(star,null);
  }
  function move(dt){
    let horizontal=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
    let vertical=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
    let x=avatar.position.x,z=avatar.position.z,dx=0,dz=0;
    if(horizontal||vertical){
      clearTravel();
      const len=Math.hypot(horizontal,vertical);horizontal/=len;vertical/=len;
      dx=horizontal*Math.cos(yaw)-vertical*Math.sin(yaw); dz=-horizontal*Math.sin(yaw)-vertical*Math.cos(yaw);
      const step=dt*6.2;
      if(walkable(x+dx*step,z))x+=dx*step;
      if(walkable(x,z+dz*step))z+=dz*step;
    }else if(route.length){
      const next=route[0],d=Math.hypot(next.x-x,next.z-z),step=Math.min(d,dt*10.6);
      if(d>.001){dx=(next.x-x)/d;dz=(next.z-z)/d;x+=dx*step;z+=dz*step;}
      if(d-step<.025)route.shift();
    }
    const moving=Math.hypot(avatar.position.x-x,avatar.position.z-z)>.0001;
    if(moving)stride+=dt*10;
    placeAt(x,z,dx,dz,moving);visitNearby();
    for(const star of tideStars)if(!collected.has(star.id)&&Math.hypot(x-star.x,z-star.z)<.88)onStar(star.id);
    if(!route.length&&targetRing.visible){
      const label=arriveAt;clearTravel();
      if(label)onArrive(label);
    }
    return moving;
  }
  function draw(now){
    frameID=0;
    if(disposed||document.hidden)return;
    const dt=Math.min(.65,Math.max(0,(now-(last||now))/1000));
    const active=keys.size||route.length;
    if(!dirty&&!active&&!paused&&!reduced.matches&&now-last<32) { request(); return; }
    last=now;
    // Keep keyboard collision steps short on slower GPUs while preserving walking speed.
    const steps=Math.max(1,Math.ceil(dt/.05));
    let moving=false;
    for(let i=0;i<steps&&!paused;i++)moving=move(dt/steps)||moving;
    if(!paused&&!reduced.matches)time+=dt;
    const target=Number(collected.size===tideStars.length);
    twilight=reduced.matches?target:twilight+(target-twilight)*(1-Math.exp(-dt*2.2));
    sun.color.lerpColors(daylight,evening,twilight);sun.intensity=2.05-.75*twilight;
    sky.color.lerpColors(skyDay,skyNight,twilight);sky.intensity=1.15-.18*twilight;
    waterMaterial.uniforms.aurora.value=twilight;
    life.update(time,paused?0:dt,avatar.position,reduced.matches,yaw);
    waterMaterial.uniforms.time.value=time;
    beam.rotation.y=reduced.matches?-.6:time*.55;
    for(const {orb,y} of lamps.values())orb.position.y=y+(reduced.matches?0:.095*Math.sin(time*1.45+y));
    cameraFor(hasFrame?dt:1);positionMarkers();renderer.render(scene,camera);dirty=false;hasFrame=true;
    if(phase()&&(!reduced.matches||active||moving))request();
  }
  function request(){if(!frameID&&!disposed&&!document.hidden)frameID=requestAnimationFrame(draw);}
  function changeZoom(factor){zoom=limit(zoom*factor,.83,2.35);dirty=true;request();}
  function frame(){zoom=1;yaw=.13;follow.set(0,0);dirty=true;request();}
  function setCollected(value,discovery){
    collected=new Set(value);life.setCollected(collected,discovery);dirty=true;request();
  }
  function setVisited(visited){
    for(const [id,objects] of lamps){
      objects.signal.visible=visited.has(id);objects.ring.material.opacity=visited.has(id)?1:.65;
      objects.orb.scale.setScalar(visited.has(id)?1.72:1);
    }
    const lit=visited.size===locations.length;beam.visible=lit;
    lighthouse.userData.lamp.material.emissiveIntensity=lit?2.8:.24;
    dirty=true;request();
  }
  function setPaused(value){
    paused=value;keys.clear();if(value){clearTravel();}last=0;dirty=true;request();
  }
  function pick(x,y){
    const r=canvas.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1),camera);
    const availableStars=[...life.stars.values()].map(star=>star.group).filter(group=>group.visible);
    const hit=ray.intersectObjects([...buildings,...availableStars,land],true)[0];
    if(!hit)return;
    let group=hit.object;
    while(group&&!group.userData.place&&!group.userData.star)group=group.parent;
    if(group?.userData.star)travelToStar(group.userData.star);
    else if(group?.userData.place)travelTo(group.userData.place);
    else if(walkable(hit.point.x,hit.point.z))routeTo({x:hit.point.x,z:hit.point.z},null);
  }
  let pointer=null;
  addEvent(canvas,'pointerdown',e=>{
    if(paused||pointer||e.button!==0)return;
    canvas.focus({preventScroll:true});pointer={id:e.pointerId,x:e.clientX,y:e.clientY,previous:e.clientX,drag:false};canvas.setPointerCapture(e.pointerId);
  });
  addEvent(canvas,'pointermove',e=>{
    if(!pointer||pointer.id!==e.pointerId)return;
    if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>7)pointer.drag=true;
    if(pointer.drag){yaw-=(e.clientX-pointer.previous)*.008;dirty=true;request();}
    pointer.previous=e.clientX;
  });
  addEvent(canvas,'pointerup',e=>{
    if(!pointer||pointer.id!==e.pointerId)return;
    const tap=!pointer.drag;pointer=null;
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(!paused&&tap)pick(e.clientX,e.clientY);
  });
  addEvent(canvas,'pointercancel',()=>{pointer=null;});
  addEvent(canvas,'wheel',e=>{if(!paused){e.preventDefault();changeZoom(Math.exp(-limit(e.deltaY,-170,170)*.0018));}},{passive:false});
  const movementKeys=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);
  addEvent(window,'keydown',e=>{
    const focus=document.activeElement;
    if(paused||e.ctrlKey||e.altKey||e.metaKey || (focus!==document.body && focus!==canvas && !focus?.closest('.place-marker')))return;
    const key=e.key.toLowerCase();
    if(movementKeys.has(key)){e.preventDefault();if(focus!==canvas)canvas.focus({preventScroll:true});keys.add(key);dirty=true;request();}
    else if(focus===canvas&&(key==='e'||key==='enter')&&nearest&&!e.repeat){e.preventDefault();onArrive(nearest);}
  });
  addEvent(window,'keyup',e=>keys.delete(e.key.toLowerCase()));
  addEvent(canvas,'blur',()=>keys.clear());
  addEvent(window,'blur',()=>{keys.clear();pointer=null;});
  addEvent(document,'visibilitychange',()=>{keys.clear();last=0;if(!document.hidden){dirty=true;request();}});
  addEvent(canvas,'webglcontextlost',e=>{e.preventDefault();if(!disposed)onLost();});
  addEvent(reduced,'change',()=>{dirty=true;request();});
  const observer=new ResizeObserver(resize);observer.observe(host);
  function dispose(){
    disposed=true;cancelAnimationFrame(frameID);events.abort();observer.disconnect();
    const geometries=new Set(),materials=new Set();
    scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();canvas.remove();
  }
  placeAt(avatar.position.x,avatar.position.z,0,0,false);resize();
  cancelAnimationFrame(frameID);frameID=0;
  try{draw(performance.now());}catch(error){dispose();throw error;}
  return {travelTo,travelToStar,placeTraveler,greet(){life.greet();dirty=true;request();},setVisited,setCollected,setPaused,zoom:changeZoom,frame,focus:()=>canvas.focus({preventScroll:true}),dispose};
}
