(() => {
 'use strict';
 const form=document.getElementById('unlockForm'),input=document.getElementById('password'),status=document.getElementById('status'),button=document.getElementById('enter');
 let busy=false;
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;
  if(!crypto.subtle||typeof DecompressionStream==='undefined'){status.textContent='请使用新版手机浏览器或电脑浏览器打开此网址。';return;}
  busy=true;button.disabled=true;status.textContent='正在打开回忆，第一次可能需要稍等片刻……';
  let password=input.value;input.value='';
  try{
   let bytes;
   try{
    const response=await fetch(new URL('memoir.bin',location.href),{credentials:'omit',cache:'no-store'});
    if(!response.ok)throw new Error();bytes=new Uint8Array(await response.arrayBuffer());
    if(bytes.length<65||new TextDecoder().decode(bytes.subarray(0,4))!=='GPM1')throw new Error();
   }catch{status.textContent='照片还没加载好，请检查网络后重新输入密码。';return;}
   let clear;
   try{
    const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);password='';
    const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes.subarray(4,36),iterations:600000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt']);
    clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.subarray(36,48)},key,bytes.subarray(48));
   }catch{status.textContent='密码不对，或者文件未完整下载。请再试一次。';input.focus();return;}
   const stream=new Blob([clear]).stream().pipeThrough(new DecompressionStream('gzip'));
   const html=await new Response(stream).text();
   document.open();document.write(html);document.close();
  }catch{status.textContent='暂时无法展开回忆，请刷新后重试。';}
  finally{password='';busy=false;button.disabled=false;}
 });
})();
