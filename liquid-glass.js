(()=>{'use strict';
const root=document.documentElement,reduceMotion=matchMedia('(prefers-reduced-motion: reduce)'),reduceTransparency=matchMedia('(prefers-reduced-transparency: reduce)');
const surfaces=[['topbar','.topbar'],['dock','.mobile-nav'],['menu','.side-menu'],['notifications','.notification-panel']];
const disabled=new URLSearchParams(location.search).get('refract')==='off';
const lowPower=(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)||navigator.connection?.saveData===true;
const cache=new Map(),instances=[];
let frame=0,menuWasOpen=false;
function roundedRectDistance(x,y,w,h,r){const qx=Math.abs(x-w/2)-(w/2-r),qy=Math.abs(y-h/2)-(h/2-r);return Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-r}
function mapFor(w,h,r){
 const key=[w,h,r].join(':');if(cache.has(key))return cache.get(key);
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return null;
 const image=ctx.createImageData(w,h),data=image.data,bezel=18,peak=14;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const d=roundedRectDistance(x+.5,y+.5,w,h,r),inside=-d;
  let nx=0,ny=0;
  if(inside>=0&&inside<bezel){
   const dx=roundedRectDistance(x+1.5,y+.5,w,h,r)-roundedRectDistance(x-.5,y+.5,w,h,r);
   const dy=roundedRectDistance(x+.5,y+1.5,w,h,r)-roundedRectDistance(x+.5,y-.5,w,h,r);
   const len=Math.hypot(dx,dy)||1;nx=dx/len;ny=dy/len;
  }
  const strength=inside>=0&&inside<bezel?Math.sin((1-inside/bezel)*Math.PI)*peak:0;
  const i=(y*w+x)*4;data[i]=Math.max(0,Math.min(255,128+nx*strength));data[i+1]=Math.max(0,Math.min(255,128+ny*strength));data[i+2]=128;data[i+3]=255;
 }
 ctx.putImageData(image,0,0);const url=canvas.toDataURL('image/png');cache.set(key,url);return url;
}
function makeFilter(id,w,h,map){
 let svg=document.getElementById('lg-refraction-defs');
 if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='lg-refraction-defs';svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';document.body.append(svg)}
 let filter=document.getElementById(id);
 if(!filter){filter=document.createElementNS('http://www.w3.org/2000/svg','filter');filter.id=id;svg.append(filter)}
 filter.setAttribute('filterUnits','userSpaceOnUse');filter.setAttribute('primitiveUnits','userSpaceOnUse');
 filter.setAttribute('x','0');filter.setAttribute('y','0');filter.setAttribute('width',String(w));filter.setAttribute('height',String(h));
 filter.replaceChildren();
 const image=document.createElementNS(svg.namespaceURI,'feImage');image.setAttribute('href',map);image.setAttribute('x','0');image.setAttribute('y','0');image.setAttribute('width',String(w));image.setAttribute('height',String(h));image.setAttribute('preserveAspectRatio','none');image.setAttribute('result','bezel');filter.append(image);
 const style=getComputedStyle(root),rawScale=parseFloat(style.getPropertyValue('--lg-refraction')),scale=Number.isFinite(rawScale)?rawScale:28,rawDisp=parseFloat(style.getPropertyValue('--lg-dispersion')),disp=Number.isFinite(rawDisp)?rawDisp:.06,sign=getComputedStyle(root).getPropertyValue('--lg-flip').trim()==='-1'?-1:1;
 const passes=[];
 for(let n=0;n<3;n++){
  const shift=document.createElementNS(svg.namespaceURI,'feDisplacementMap');shift.setAttribute('in','SourceGraphic');shift.setAttribute('in2','bezel');shift.setAttribute('scale',String(scale*sign*(1+n*disp)));shift.setAttribute('xChannelSelector','R');shift.setAttribute('yChannelSelector','G');shift.setAttribute('result','shift'+n);filter.append(shift);
  const matrix=document.createElementNS(svg.namespaceURI,'feColorMatrix');matrix.setAttribute('in','shift'+n);matrix.setAttribute('type','matrix');
  const rows=['0 0 0 0 0','0 0 0 0 0','0 0 0 0 0','0 0 0 1 0'];rows[n]=n===0?'1 0 0 0 0':n===1?'0 1 0 0 0':'0 0 1 0 0';matrix.setAttribute('values',rows.join(' '));matrix.setAttribute('result','channel'+n);filter.append(matrix);passes.push('channel'+n);
 }
 const blend1=document.createElementNS(svg.namespaceURI,'feBlend');blend1.setAttribute('in',passes[0]);blend1.setAttribute('in2',passes[1]);blend1.setAttribute('mode','screen');blend1.setAttribute('result','rg');filter.append(blend1);
 const blend2=document.createElementNS(svg.namespaceURI,'feBlend');blend2.setAttribute('in','rg');blend2.setAttribute('in2',passes[2]);blend2.setAttribute('mode','screen');blend2.setAttribute('result','rgb');filter.append(blend2);
 const alpha=document.createElementNS(svg.namespaceURI,'feComposite');alpha.setAttribute('in','rgb');alpha.setAttribute('in2','SourceGraphic');alpha.setAttribute('operator','in');filter.append(alpha);
}
function apply(el,id){
 if(!el||el.getClientRects().length===0||getComputedStyle(el).visibility==='hidden')return;
 const rect=el.getBoundingClientRect(),w=Math.max(1,Math.ceil(rect.width)),h=Math.max(1,Math.ceil(rect.height));if(w*h>1800000)return;
 const radius=Math.min(36,Math.round(parseFloat(getComputedStyle(el).borderTopLeftRadius)||18));
 const map=mapFor(w,h,radius);if(!map)return;if(id==='topbar')el.dataset.lgMap=map;
 makeFilter('lg-filter-'+id,w,h,map);
 const blurValue=parseFloat(getComputedStyle(root).getPropertyValue(id==='menu'||id==='notifications'?'--blur-sheet':'--blur-a'));const blur=Number.isFinite(blurValue)?blurValue:(id==='menu'||id==='notifications'?18:8);
 el.style.setProperty('--lg-native-backdrop',`url("#lg-filter-${id}") blur(${blur}px) saturate(138%)`);
 el.style.backdropFilter='var(--lg-native-backdrop)';el.style.webkitBackdropFilter='var(--lg-native-backdrop)';
}
function refresh(){frame=0;if(disabled||reduceMotion.matches||reduceTransparency.matches||lowPower)return;
 surfaces.forEach(([id,selector])=>{const el=document.querySelector(selector);if(el){apply(el,id);if(!instances.some(x=>x.el===el)){const ro=new ResizeObserver(()=>schedule());ro.observe(el);instances.push({el,ro})}}});
}
function schedule(){if(!frame)frame=requestAnimationFrame(refresh)}
function clear(){surfaces.forEach(([,selector])=>{const el=document.querySelector(selector);if(el){el.style.removeProperty('backdrop-filter');el.style.removeProperty('-webkit-backdrop-filter');el.style.removeProperty('--lg-native-backdrop')}})}
if(disabled||reduceMotion.matches||reduceTransparency.matches||lowPower){root.dataset.refraction='off'}else{root.dataset.refraction='on';addEventListener('load',schedule,{once:true});addEventListener('resize',schedule,{passive:true});addEventListener('scroll',schedule,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();else schedule()});const menu=document.querySelector('#sideMenu'),menuTrigger=document.querySelector('#menuButton');
const observer=new MutationObserver(()=>{schedule();if(!menu||!menuTrigger)return;const open=menu.classList.contains('open');if(open&&!menuWasOpen)requestAnimationFrame(()=>menu.querySelector('button:not([disabled])')?.focus());if(!open&&menuWasOpen)menuTrigger.focus();menuWasOpen=open});
observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','aria-hidden']});
menu?.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const items=[...menu.querySelectorAll('button:not([disabled]),a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length);if(!items.length)return;const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.classList.contains('open'))document.querySelector('#closeMenu')?.click()});
schedule()}
window.addEventListener('pageshow',schedule);
window.addEventListener('lg:refraction-update',()=>{cache.clear();schedule()});
document.addEventListener('input',e=>{if(e.target.matches('#refraction,#disp,#off,#flip,#blur'))schedule()});
})();