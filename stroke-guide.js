'use strict';
// Animation is a separate SVG layer: it never writes learner strokes or the score mask.
(function(root){
const NS='http://www.w3.org/2000/svg';
class StrokeGuide{
 constructor(svg,{status,onChange=()=>{}}){this.svg=svg;this.status=status;this.onChange=onChange;this.paths=[];this.lengths=[];this.cursor=0;this.frame=0;this.run=null;this.visible=false;}
 node(tag,attrs={}){const node=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);return node;}
 setCharacter(data){
  this.stop();this.svg.replaceChildren();this.paths=[];this.lengths=[];
  const lines=this.node('g',{fill:'none',stroke:'#2377b9','stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round',opacity:.8});this.svg.append(lines);
  for(const d of data){const path=this.node('path',{d});lines.append(path);const length=path.getTotalLength();path.setAttribute('stroke-dasharray',`${length} ${length}`);path.setAttribute('stroke-dashoffset',length);path.style.visibility='hidden';this.paths.push(path);this.lengths.push(length);}
  this.startMark=this.node('g');this.startMark.append(this.node('circle',{r:4.5,fill:'#fff7d6',stroke:'#876518','stroke-width':.6}));this.number=this.node('text',{'text-anchor':'middle','dominant-baseline':'central','font-size':5,'font-family':'sans-serif',fill:'#59450d'});this.startMark.append(this.number);this.svg.append(this.startMark);this.startMark.style.visibility='hidden';
  this.tip=this.node('circle',{r:2.5,fill:'#ea912d',stroke:'white','stroke-width':.7});this.svg.append(this.tip);this.tip.style.visibility='hidden';this.status.textContent='「かきじゅん」で おてほんが うごくよ';
 }
 stop(){if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.run=null;this.cursor=0;this.visible=false;for(const p of this.paths)p.style.visibility='hidden';if(this.startMark)this.startMark.style.visibility='hidden';if(this.tip)this.tip.style.visibility='hidden';this.onChange(false,false);}
 start(mode='all',speed=1.5){
  if(!this.paths.length)return;
  if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;
  const next=mode==='step'&&this.cursor<this.paths.length?this.cursor:0;
  if(mode==='all'||next===0){for(const p of this.paths)p.style.visibility='hidden';}
  this.visible=true;this.run={mode,speed,index:mode==='all'?0:next,began:null};this.beginStroke();
 }
 beginStroke(){
  const r=this.run,path=this.paths[r.index],length=this.lengths[r.index];
  // Time follows stroke length, with generous pauses for elementary learners.
  r.duration=Math.max(900,Math.min(3200,length*26))*r.speed;r.began=null;
  path.style.visibility='visible';path.setAttribute('stroke-dashoffset',length);
  const start=path.getPointAtLength(0);this.startMark.setAttribute('transform',`translate(${start.x} ${start.y})`);this.number.textContent=String(r.index+1);this.startMark.style.visibility='visible';this.tip.style.visibility='hidden';
  this.status.textContent=`${r.index+1} / ${this.paths.length} かくめ：まるから はじめよう`;this.onChange(true,true);
  this.frame=requestAnimationFrame(t=>this.tick(t));
 }
 tick(time){
  this.frame=0;const r=this.run;if(!r)return;
  if(r.began===null)r.began=time;
  const elapsed=time-r.began,progress=Math.min(1,Math.max(0,(elapsed-600)/r.duration));
  const path=this.paths[r.index],length=this.lengths[r.index];path.setAttribute('stroke-dashoffset',length*(1-progress));
  const point=path.getPointAtLength(length*progress);this.tip.setAttribute('cx',point.x);this.tip.setAttribute('cy',point.y);this.tip.style.visibility=elapsed<600?'hidden':'visible';
  if(elapsed>=600+r.duration+650){
   this.cursor=r.index+1;this.tip.style.visibility='hidden';this.startMark.style.visibility='hidden';
   if(r.mode==='all'&&this.cursor<this.paths.length){r.index=this.cursor;this.beginStroke();return;}
   this.run=null;this.onChange(false,true);this.status.textContent=this.cursor<this.paths.length?`つぎは ${this.cursor+1} かくめ。「ひとつずつ」を おしてね`:'おわり！ もういちど みても いいよ';return;
  }
  this.frame=requestAnimationFrame(t=>this.tick(t));
 }
}
root.StrokeGuide=StrokeGuide;
})(typeof window!=='undefined'?window:globalThis);
