'use strict';
(()=>{
 const status=document.getElementById('offlineStatus'),update=document.getElementById('updateApp'),retry=document.getElementById('retryOffline'),install=document.getElementById('installApp'),hint=document.getElementById('installHint');
 let registration=null,applyingUpdate=false,prompt=null;
 const standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 if(standalone)hint.textContent='ホーム画面からアプリとして起動しています。';
 function showUpdate(){if(registration?.waiting){update.hidden=false;update.disabled=false;}}
 function offlineState(){
  const worker=navigator.serviceWorker.controller||registration?.active;if(!worker)return;
  const channel=new MessageChannel();const timeout=setTimeout(()=>{channel.port1.close();status.textContent='オフライン準備を確認できません。接続中に「準備を確認」を押してください。';},5000);
  channel.port1.onmessage=e=>{clearTimeout(timeout);channel.port1.close();status.textContent=e.data.ready?'オフライン準備完了。この端末で、なぞり・判定・書き順を使えます。':'教材の保存が完了していません。接続して準備を確認してください。';};
  worker.postMessage({type:'CHECK_OFFLINE'},[channel.port2]);
 }
 function watchWorker(worker){if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed')showUpdate();if(worker.state==='activated')offlineState();if(worker.state==='redundant')status.textContent='教材の保存に失敗しました。接続・ログイン状態を確認して、準備をやり直してください。';});}
 async function register(){
  if(!('serviceWorker' in navigator)||!window.isSecureContext){status.textContent='この環境ではオフライン保存を利用できません。オンラインでお使いください。';retry.disabled=true;return;}
  status.textContent='オフライン用の教材を準備しています…';retry.disabled=true;
  try{registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});registration.addEventListener('updatefound',()=>watchWorker(registration.installing));watchWorker(registration.installing);showUpdate();if(registration.active)offlineState();}
  catch{status.textContent='オフライン準備を完了できませんでした。オンラインで開き、ログイン状態を確認して「準備を確認」を押してください。';}
  finally{retry.disabled=false;}
 }
 retry.onclick=async()=>{if(!registration){await register();return;}retry.disabled=true;try{await registration.update();showUpdate();offlineState();}catch{status.textContent='更新を確認できません。インターネット接続を確認してください。';}finally{retry.disabled=false;}};
 update.onclick=()=>{if(!registration?.waiting)return;applyingUpdate=true;update.disabled=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});};
 if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('controllerchange',()=>{if(applyingUpdate)location.reload();else offlineState();});
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;if(!standalone)install.hidden=false;});
 install.onclick=async()=>{if(!prompt)return;await prompt.prompt();await prompt.userChoice;prompt=null;install.hidden=true;};
 window.addEventListener('appinstalled',()=>{install.hidden=true;hint.textContent='ホーム画面への追加が完了しました。';});
 window.addEventListener('load',register);
})();
