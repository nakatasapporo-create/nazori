'use strict';
const $=id=>document.getElementById(id);
const basic=Array.from('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん');
const extra=Array.from('がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉゃゅょっ');
const groups={hira:[...basic,...extra],kata:[...basic,...extra].map(c=>String.fromCharCode(c.charCodeAt(0)+96)).concat('ヴ','ー'),num:[...Array.from('0123456789'),'10']};
const readings=['れい','いち','に','さん','よん','ご','ろく','なな','はち','きゅう','じゅう'];
const fallback='"UD Digi Kyokasho N-R","Yu Kyokasho",serif';
let fontFamily=fallback,fontReady=false,kind='hira',index=0,color='#337f72',strokes=[],active=null,total=0,credited=false,timer,frame=0,missingLayer=null;
const canvas=$('canvas'),ctx=canvas.getContext('2d');let w=1,h=1;
const gridSize=256,model=document.createElement('canvas');model.width=model.height=gridSize;
const modelCtx=model.getContext('2d',{willReadFrequently:true});let target=null;
function char(){return groups[kind][index]}
function reading(){const c=char();if(kind==='num')return readings[index];if(c==='ー')return 'ちょうおん';if(c==='ヲ'||c==='を')return 'お';return c}
function speak(text){
 if(!$('sound').checked)return;
 if(!('speechSynthesis' in window)){ $('audioNote').textContent='この たんまつでは よみあげが つかえません';return;}
 const voices=speechSynthesis.getVoices(),voice=voices.find(v=>v.lang.toLowerCase().startsWith('ja'));
 if(voices.length&&!voice){$('audioNote').textContent='にほんごの 音声を たんまつに 追加してください';return;}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';if(voice)u.voice=voice;u.rate=.7;u.pitch=1;u.onerror=e=>{if(e.error!=='interrupted'&&e.error!=='canceled')$('audioNote').textContent='音声を 再生できませんでした。もういちど おしてね';};speechSynthesis.speak(u);
}
function renderLetters(){const frag=document.createDocumentFragment();groups[kind].forEach((c,i)=>{const b=document.createElement('button');b.textContent=c;b.className=i===index?'selected':'';b.setAttribute('aria-pressed',String(i===index));b.setAttribute('aria-label',c+' をえらぶ');b.onclick=()=>select(i);frag.append(b)});$('letters').replaceChildren(frag);}
function stopDrawing(){if(active){const id=active.id;active=null;if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}}
function resetResult(){missingLayer=null;$('result').hidden=true;clearTimeout(timer);$('spark').classList.remove('show');}
function select(i){stopDrawing();strokeGuide.stop();index=(i+groups[kind].length)%groups[kind].length;strokes=[];credited=false;resetResult();renderLetters();buildTarget();strokeGuide.setCharacter(window.STROKE_DATA[char()]);draw();canvas.setAttribute('aria-label',char()+' のなぞり練習。指やペンで線を描けます');$('currentChar').textContent=char();$('feedback').textContent=char()+' を なぞってみよう';if($('auto').checked)speak(reading());const selected=$('letters').querySelector('.selected');if(selected){const list=$('letters');if(selected.offsetTop<list.scrollTop||selected.offsetTop+selected.offsetHeight>list.scrollTop+list.clientHeight)list.scrollTop=selected.offsetTop-10;}}
const guidePaths=new Map();
function glyph(context,size,fill){
 if(!guidePaths.has(char()))guidePaths.set(char(),window.STROKE_DATA[char()].map(d=>new Path2D(d)));
 context.save();context.scale(size/109,size/109);context.strokeStyle=fill;context.lineWidth=3;context.lineCap='round';context.lineJoin='round';for(const path of guidePaths.get(char()))context.stroke(path);context.restore();
}
function buildTarget(){modelCtx.clearRect(0,0,gridSize,gridSize);glyph(modelCtx,gridSize,'#000');const data=modelCtx.getImageData(0,0,gridSize,gridSize).data;target=new Uint8Array(gridSize*gridSize);for(let i=0;i<target.length;i++)target[i]=data[i*4+3]>=64?1:0;}
function draw(){
 ctx.clearRect(0,0,w,h);ctx.save();glyph(ctx,w,'rgba(52,76,51,'+$('guide').value+')');ctx.restore();
 if(missingLayer)ctx.drawImage(missingLayer,0,0,w,h);
 for(const s of strokes){ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=s.width*w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();s.points.forEach((p,i)=>i?ctx.lineTo(p.x*w,p.y*h):ctx.moveTo(p.x*w,p.y*h));if(s.points.length===1){ctx.arc(s.points[0].x*w,s.points[0].y*h,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();}else ctx.stroke();}
}
function scheduleDraw(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;draw()});}
function resize(){stopDrawing();const r=canvas.getBoundingClientRect();w=r.width;h=r.height;if(!w||!h)return;const d=Math.min(window.devicePixelRatio||1,3);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);draw();}
function point(e){const r=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};}
canvas.addEventListener('pointerdown',e=>{
 if(!fontReady||e.button!==0||($('pencilOnly').checked&&e.pointerType!=='pen'))return;
 if(active){if(e.pointerType==='pen'&&active.type==='touch'){strokes.pop();stopDrawing();}else return;}
 e.preventDefault();resetResult();canvas.setPointerCapture(e.pointerId);active={id:e.pointerId,type:e.pointerType,color,width:Number($('width').value)/w,points:[point(e)]};strokes.push(active);$('feedback').textContent='なぞれたら「たしかめる」を おしてね';scheduleDraw();
});
canvas.addEventListener('pointermove',e=>{if(!active||active.id!==e.pointerId)return;e.preventDefault();const events=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():[];for(const item of events.length?events:[e])active.points.push(point(item));scheduleDraw();});
canvas.addEventListener('pointerup',e=>{if(active&&active.id===e.pointerId){active.points.push(point(e));stopDrawing();scheduleDraw();}});
const end=e=>{if(active&&active.id===e.pointerId)active=null;};canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);canvas.addEventListener('contextmenu',e=>e.preventDefault());
function showMissing(mask){const layer=document.createElement('canvas');layer.width=layer.height=gridSize;const lc=layer.getContext('2d'),im=lc.createImageData(gridSize,gridSize);for(let i=0;i<mask.length;i++)if(mask[i]){im.data[i*4]=223;im.data[i*4+1]=145;im.data[i*4+2]=39;im.data[i*4+3]=180;}lc.putImageData(im,0,0);missingLayer=layer;}
function check(){
 stopDrawing();stopGuide();if(!fontReady)return;
 if(!strokes.length){$('feedback').textContent='まずは もじを なぞってみよう';speak('もじを なぞってみよう');return;}
 const result=TraceScoring.assess(target,strokes,$('level').value,gridSize);
 if(!result.valid){$('feedback').textContent='おてほんを よみこめませんでした。ページを ひらきなおしてください';return;}
 const coverage=Math.round(result.coverage*100),precision=Math.round(result.precision*100);
 $('result').hidden=false;$('coverage').value=coverage;$('precision').value=precision;$('coverageValue').textContent=coverage+'%';$('precisionValue').textContent=precision+'%';
 missingLayer=null;
 if(result.passed){if(!credited){total++;credited=true;$('count').textContent='きょうの「できた！」 '+total+' こ';}$('feedback').textContent='じょうずに なぞれたね！';$('spark').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('spark').classList.remove('show'),1400);$('resultHelp').textContent='おてほんに そって なぞれました。つぎも やってみよう。';speak('じょうずに なぞれたね');}
 else if(result.precision<result.thresholds.precision){$('feedback').textContent='おてほんの うえを、ゆっくり なぞろう';$('resultHelp').textContent='はみだした せんは「ひとつ もどす」で けせるよ。';speak('おてほんの うえを ゆっくり なぞろう');}
 else{$('feedback').textContent='あと すこし！ のこりも なぞってみよう';$('resultHelp').textContent='オレンジの ところを なぞってみよう。';showMissing(result.missing);speak('あと すこし のこりも なぞってみよう');}
 draw();requestAnimationFrame(()=>$('result').scrollIntoView({block:'nearest',behavior:'auto'}));
}
document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{kind=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-pressed',String(t===b));});$('letters').scrollTop=0;select(0);});
document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{color=b.dataset.color;document.querySelectorAll('[data-color]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));});
$('prev').onclick=()=>select(index-1);$('next').onclick=()=>select(index+1);
$('clear').onclick=()=>{stopDrawing();stopGuide();strokes=[];credited=false;resetResult();draw();$('feedback').textContent='もういちど なぞってみよう';};
$('undo').onclick=()=>{stopDrawing();stopGuide();strokes.pop();resetResult();draw();$('feedback').textContent='つづきを なぞってみよう';};
$('listen').onclick=()=>speak(reading());$('guide').onchange=draw;$('level').onchange=()=>{resetResult();draw();$('feedback').textContent='なぞれたら「たしかめる」を おしてね';};
$('sound').onchange=()=>{if(!$('sound').checked&&'speechSynthesis' in window)speechSynthesis.cancel();};
$('pencilOnly').onchange=()=>{stopDrawing();$('inputHint').textContent=$('pencilOnly').checked?'Apple Pencilで なぞってね':'ゆび・Apple Pencilで なぞってね';};
// Settings require a continuous one-second hold, including keyboard activation.
(function setupSettingsHold(){
 const button=$('settings');let hold=null,holdTimer=null;
 function cancel(){
  const previous=hold;hold=null;clearTimeout(holdTimer);holdTimer=null;button.classList.remove('holding');
  if(previous?.type==='pointer'&&button.hasPointerCapture(previous.id))button.releasePointerCapture(previous.id);
 }
 function begin(input){
  if(hold)return;
  hold=input;button.classList.add('holding');
  holdTimer=setTimeout(()=>{
   if(!hold)return;
   const open=$('panel').hidden;$('panel').hidden=!open;button.setAttribute('aria-expanded',String(open));cancel();
  },1000);
 }
 button.addEventListener('pointerdown',e=>{
  if(e.button!==0||hold)return;e.preventDefault();button.focus({preventScroll:true});
  button.setPointerCapture(e.pointerId);begin({type:'pointer',id:e.pointerId});
 });
 button.addEventListener('pointermove',e=>{
  if(hold?.type!=='pointer'||hold.id!==e.pointerId)return;
  const r=button.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)cancel();
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>{if(hold?.type==='pointer'&&hold.id===e.pointerId)cancel();});
 button.addEventListener('keydown',e=>{if(e.key!==' '&&e.key!=='Enter')return;e.preventDefault();if(!e.repeat)begin({type:'key',key:e.key});});
 button.addEventListener('keyup',e=>{if(e.key!==' '&&e.key!=='Enter')return;e.preventDefault();if(hold?.type==='key'&&hold.key===e.key)cancel();});
 button.addEventListener('click',e=>e.preventDefault());
 button.addEventListener('contextmenu',e=>e.preventDefault());
 button.addEventListener('blur',cancel);window.addEventListener('blur',cancel);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
})();
// End settings hold.

$('done').onclick=check;
const strokeGuide=new StrokeGuide($('strokeOverlay'),{status:$('strokeStatus'),onChange:(playing,visible)=>{
 $('playStrokes').setAttribute('aria-pressed',String(playing));$('playStrokes').textContent=playing?'↻ はじめから':'▶ かきじゅん';$('stopStrokes').disabled=!visible;$('stepStroke').disabled=playing;
}});
function stopGuide(){strokeGuide.stop();$('strokeStatus').textContent='「かきじゅん」で おてほんが うごくよ';}
$('playStrokes').onclick=()=>{resetResult();draw();strokeGuide.start('all',Number($('animationSpeed').value));};
$('stepStroke').onclick=()=>{resetResult();draw();strokeGuide.start('step',Number($('animationSpeed').value));};
$('stopStrokes').onclick=stopGuide;
$('animationSpeed').onchange=stopGuide;
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopGuide();});
new ResizeObserver(resize).observe(canvas);select(0);$('done').disabled=true;$('inputHint').textContent='おてほんを よみこみちゅう…';
async function initFont(){let loaded=false;try{loaded=await Promise.race([document.fonts.load('600 100px "Klee One"').then(f=>f.length>0),new Promise(resolve=>setTimeout(()=>resolve(false),5000))]);}catch{}fontFamily=loaded?'"Klee One",'+fallback:fallback;document.documentElement.style.setProperty('--writing-font',fontFamily);$('fontnote').textContent=loaded?'文字選択の表示：Klee One。練習のお手本・書き順・形の判定は、同じKanjiVGの線を使っています。':'文字選択の表示：端末の代替フォント。練習のお手本・書き順・形の判定は、同じKanjiVGの線を使っています。';fontReady=true;buildTarget();resize();$('done').disabled=false;$('inputHint').textContent='ゆび・Apple Pencilで なぞってね';}
initFont();
