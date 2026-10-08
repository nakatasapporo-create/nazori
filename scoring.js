/* Shape comparison in a fixed square grid; independent of visible pen thickness. */
(function(root){
'use strict';
const levels={easy:{radius:10,coverage:.70,precision:.75,component:.45},normal:{radius:7,coverage:.82,precision:.86,component:.65},careful:{radius:4,coverage:.90,precision:.93,component:.80}};
function distances(mask,n){
 const d=new Float32Array(n*n);for(let i=0;i<d.length;i++)d[i]=mask[i]?0:1e6;
 const diagonal=Math.SQRT2;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x;let v=d[i];if(x)v=Math.min(v,d[i-1]+1);if(y)v=Math.min(v,d[i-n]+1);if(x&&y)v=Math.min(v,d[i-n-1]+diagonal);if(x<n-1&&y)v=Math.min(v,d[i-n+1]+diagonal);d[i]=v;}
 for(let y=n-1;y>=0;y--)for(let x=n-1;x>=0;x--){const i=y*n+x;let v=d[i];if(x<n-1)v=Math.min(v,d[i+1]+1);if(y<n-1)v=Math.min(v,d[i+n]+1);if(x<n-1&&y<n-1)v=Math.min(v,d[i+n+1]+diagonal);if(x&&y<n-1)v=Math.min(v,d[i+n-1]+diagonal);d[i]=v;}return d;
}
function assess(target,strokes,level='normal',n=256){
 const options=levels[level]||levels.normal,radius=options.radius*n/256;
 const nearTarget=distances(target,n),trace=new Uint8Array(n*n);let samples=0,aligned=0,targetCount=0;
 for(const v of target)targetCount+=!!v;
 if(!targetCount)return {valid:false,reason:'empty-target'};
 function sample(p,weight=1){const x=Math.round(p.x*(n-1)),y=Math.round(p.y*(n-1));samples+=weight;if(x<0||y<0||x>=n||y>=n)return;const i=y*n+x;trace[i]=1;if(nearTarget[i]<=radius)aligned+=weight;}
 for(const s of strokes){if(!s.points.length)continue;sample(s.points[0]);for(let j=1;j<s.points.length;j++){const a=s.points[j-1],b=s.points[j];const len=Math.hypot(b.x-a.x,b.y-a.y)*(n-1);if(len<.001)continue;const steps=Math.ceil(len);for(let k=1;k<=steps;k++)sample({x:a.x+(b.x-a.x)*k/steps,y:a.y+(b.y-a.y)*k/steps},len/steps);}}
 const nearTrace=distances(trace,n),missing=new Uint8Array(n*n);let covered=0;
 for(let i=0;i<target.length;i++)if(target[i]){if(nearTrace[i]<=radius)covered++;else missing[i]=1;}
 // Require disconnected marks (e.g. dakuten) as well as the main character.
 const seen=new Uint8Array(n*n);let componentCoverage=1;
 for(let start=0;start<target.length;start++){
  if(!target[start]||seen[start])continue;
  const queue=[start];seen[start]=1;let hit=0;
  for(let q=0;q<queue.length;q++){const i=queue[q],x=i%n,y=Math.floor(i/n);if(!missing[i])hit++;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=n||ny>=n)continue;const j=ny*n+nx;if(target[j]&&!seen[j]){seen[j]=1;queue.push(j);}}
  }
  if(queue.length>=8)componentCoverage=Math.min(componentCoverage,hit/queue.length);
 }
 const coverage=covered/targetCount,precision=samples?aligned/samples:0;
 return {valid:true,coverage,precision,componentCoverage,passed:componentCoverage>=options.component&&samples>0&&coverage>=options.coverage&&precision>=options.precision,missing,thresholds:options};
}
const api={assess,distances,levels};if(typeof module==='object'&&module.exports)module.exports=api;else root.TraceScoring=api;
})(typeof globalThis!=='undefined'?globalThis:this);
