/* ======================= AUTH · ROLE =======================
   백엔드(/api)가 있으면 Google 로그인 → 프로필 → 학생/선생 화면.
   백엔드가 없거나 꺼져 있으면 AUTH='off' 로 예전처럼 동작.            */
let AUTH='boot',ME=null,ACFG=null;
const AT={
ja:{me:'マイ',loginT:'ようこそ！',loginP:'Googleアカウントでログインすると、<br>あなたに合った画面で学べます。',loginErr:'ログインできませんでした。もう一度お試しください。',loginNote:'ログインすると利用規約とプライバシーに同意したものとみなします。登録するのは名前・メール・プロフィールだけです。',
 obT:'はじめに教えてください',obP:'あとからマイページで変更できます。',name:'表示名',namePh:'例）はな',role:'あなたは？',student:'学生',studentS:'韓国語を勉強する',teacher:'先生',teacherS:'授業をする',
 level:'いまのレベル',levels:{zero:'はじめて',hangul:'ハングルは読める',beginner:'初級',intermediate:'中級',advanced:'上級'},goal:'学ぶ目的（任意）',goalPh:'例）旅行、ドラマ、TOPIK',bio:'ひとこと紹介（任意）',bioPh:'例）福岡で韓国語を教えています',
 lang:'表示言語',save:'はじめる',saveE:'保存',saving:'保存中…',teacherNote:'先生は管理者の承認後に授業資料（교사용 지도안）が開きます。承認までは学生画面です。',
 pending:'先生の承認待ちです',pendingS:'承認されると授業資料が開きます。',rejected:'先生の申請は承認されませんでした',rejectedS:'学生画面でご利用いただけます。',
 hi:n=>`こんにちは、${n}さん`,tHi:n=>`${n} 先生`,tHero:'授業資料',tHeroS:'教案・지도안・プリントをまとめて',tPrints:'📦 指導案・プリント',tGuide:'🧭 カリキュラム',tNext:'授業を選ぶ ↓',
 profile:'プロフィール',edit:'編集',logout:'ログアウト',del:'アカウント削除',delC:'もう一度押すと削除します',admin:'先生の承認',roleBadge:{student:'学生',teacher:'先生',pending:'承認待ち',approved:'承認済み',rejected:'不承認',admin:'管理者'},
 users:'ユーザー',approve:'承認',reject:'不承認',toStu:'学生にする',none:'まだいません',lastL:'最終ログイン',offline:'オフライン中です',saved:'保存しました',err:'エラーが発生しました'},
ko:{me:'마이',loginT:'환영해요!',loginP:'Google 계정으로 로그인하면<br>나에게 맞는 화면으로 공부할 수 있어요.',loginErr:'로그인하지 못했어요. 다시 시도해 주세요.',loginNote:'로그인하면 이용 약관과 개인정보 처리에 동의한 것으로 봅니다. 저장하는 정보는 이름·이메일·프로필뿐이에요.',
 obT:'먼저 알려 주세요',obP:'나중에 마이 페이지에서 바꿀 수 있어요.',name:'표시 이름',namePh:'예) 김선생',role:'어떤 분이세요?',student:'학생',studentS:'한국어를 공부해요',teacher:'선생님',teacherS:'수업을 해요',
 level:'지금 수준',levels:{zero:'처음',hangul:'한글은 읽을 수 있음',beginner:'초급',intermediate:'중급',advanced:'고급'},goal:'공부 목적 (선택)',goalPh:'예) 여행, 드라마, TOPIK',bio:'한 줄 소개 (선택)',bioPh:'예) 후쿠오카에서 한국어를 가르쳐요',
 lang:'표시 언어',save:'시작하기',saveE:'저장',saving:'저장 중…',teacherNote:'선생님은 관리자 승인 후에 수업 자료(교사용 지도안)가 열려요. 승인 전까지는 학생 화면으로 보여요.',
 pending:'선생님 승인 대기 중',pendingS:'승인되면 수업 자료가 열려요.',rejected:'선생님 신청이 승인되지 않았어요',rejectedS:'학생 화면으로 이용할 수 있어요.',
 hi:n=>`안녕하세요, ${n} 님`,tHi:n=>`${n} 선생님`,tHero:'수업 자료',tHeroS:'지도안·교안·프린트를 한곳에',tPrints:'📦 지도안·프린트',tGuide:'🧭 커리큘럼',tNext:'수업 고르기 ↓',
 profile:'프로필',edit:'수정',logout:'로그아웃',del:'계정 삭제',delC:'한 번 더 누르면 삭제돼요',admin:'선생님 승인',roleBadge:{student:'학생',teacher:'선생님',pending:'승인 대기',approved:'승인됨',rejected:'반려',admin:'관리자'},
 users:'사용자',approve:'승인',reject:'반려',toStu:'학생으로',none:'아직 없어요',lastL:'마지막 로그인',offline:'오프라인이에요',saved:'저장했어요',err:'오류가 났어요'}
};
const A=()=>AT[LANG];
const authed=()=>AUTH!=='off'&&!!ME;
/* 선생 화면(지도안·수업 흐름·지도 메모) — 백엔드가 없으면 예전처럼 한국어 화면=선생 화면 */
const teachView=()=>AUTH==='off'?LANG==='ko':!!ME&&ME.view==='teacher';
/* 교사용 지도안 PDF 를 보여 줄지 */
const canTeach=()=>AUTH==='off'||(!!ME&&ME.view==='teacher');
const docsFor=()=>canTeach()?DOCS:DOCS.filter(d=>d[0]!=='guide');

async function api(m,p,body){
  const r=await fetch('/api'+p,{method:m,credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  let j=null;if(/json/.test(r.headers.get('content-type')||''))try{j=await r.json()}catch(e){}
  if(!r.ok)throw Object.assign(new Error((j&&j.error)||r.status),{status:r.status});
  return j;
}
const withTO=(p,ms)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))]);
function setMe(u){ME=u;store.set('me',u);AUTH=!u?'out':u.profileDone?'in':'profile';if(!u&&typeof sseStop==='function'){sseStop();SOC.matches=null;SOC.sum={unread:0,requests:0,next:null}}}

async function authBoot(){
  const cached=store.get('me',null);
  if(cached){ME=cached;AUTH=cached.profileDone?'in':'profile';render(false)}
  try{ACFG=await withTO(api('GET','/config'),6000)}catch(e){ACFG=null}
  if(!ACFG||!ACFG.auth){
    // 백엔드 미설정(404·HTML) → 예전 동작. 네트워크 오류인데 로그인 기록이 있으면 그대로 유지(오프라인)
    if(cached&&!navigator.onLine)return;
    ME=null;AUTH='off';store.set('me',null);return render(false);
  }
  try{setMe(await api('GET','/me'));if(ME.lang&&!store.get('lang',null)){LANG=ME.lang;applyLang()}}
  catch(e){if(e.status===401)setMe(null);else if(!cached){AUTH='off'}}
  render(false);
}

/* ---------- Google Identity Services ---------- */
let gisP=null;
function loadGis(){
  if(gisP)return gisP;
  gisP=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=()=>res(window.google);s.onerror=()=>{gisP=null;rej(new Error('gis'))};document.head.appendChild(s)});
  return gisP;
}
async function mountGoogle(el){
  try{
    const g=await loadGis();if(!el.isConnected)return;
    // 홈 화면 앱(standalone)은 팝업이 막히기 쉬워 리디렉트 방식으로
    const redirect=standalone();
    g.accounts.id.initialize({client_id:ACFG.googleClientId,ux_mode:redirect?'redirect':'popup',login_uri:redirect?location.origin+'/api/auth/google/redirect':undefined,
      callback:redirect?undefined:onCredential,auto_select:false,itp_support:true});
    el.innerHTML='';g.accounts.id.renderButton(el,{theme:'outline',size:'large',shape:'pill',text:'continue_with',width:Math.min(300,el.clientWidth||300),locale:LANG==='ko'?'ko':'ja'});
  }catch(e){el.innerHTML=`<p class="note">${A().err}</p>`}
}
async function onCredential(r){
  try{setMe(await api('POST','/auth/google',{credential:r.credential}));
    if(ME.lang&&!store.get('lang',null)){LANG=ME.lang;applyLang()}
    if(location.hash!=='#/')location.hash='#/';render(false)}
  catch(e){toast(A().loginErr)}
}

/* ---------- 화면: 로그인 · 프로필 입력 ---------- */
function vLogin(err){
  const a=A();
  return `<div class="auth"><div class="card auth-c">
    <div class="auth-m">${mascotSVG(3,'big')}</div>
    <h1 class="jua">${a.loginT}</h1><p>${a.loginP}</p>
    ${err?`<p class="auth-err">${a.loginErr}</p>`:''}
    <div id="gbtn" class="gbtn"><div class="dl-bar"><i style="width:40%"></i></div></div>
    <p class="note">${a.loginNote}<br><a href="privacy.html" target="_blank">${LANG==='ko'?'개인정보 처리방침':'プライバシー'}</a> · <a href="terms.html" target="_blank">${LANG==='ko'?'이용 약관':'利用規約'}</a></p>
  </div></div>`;
}
function profileForm(u,first){
  const a=A(),role=u.role||'',lv=u.level||'';
  return `<form id="pf" class="pform" autocomplete="off">
    <label class="fl"><span>${a.name}</span><input name="name" maxlength="40" required value="${esc(u.name||'')}" placeholder="${a.namePh}"></label>
    <div class="fl"><span>${a.role}</span><div class="roles">
      <label class="rc" style="--c:var(--mint)"><input type="radio" name="role" value="student" ${role==='student'?'checked':''} required><b>🎒 ${a.student}</b><small>${a.studentS}</small></label>
      <label class="rc" style="--c:var(--yellow)"><input type="radio" name="role" value="teacher" ${role==='teacher'?'checked':''}><b>🧑‍🏫 ${a.teacher}</b><small>${a.teacherS}</small></label></div></div>
    <div class="only-s">
      <label class="fl"><span>${a.level}</span><select name="level"><option value=""></option>${Object.entries(a.levels).map(([k,v])=>`<option value="${k}" ${lv===k?'selected':''}>${v}</option>`).join('')}</select></label>
      <label class="fl"><span>${a.goal}</span><input name="goal" maxlength="200" value="${esc(u.goal||'')}" placeholder="${a.goalPh}"></label></div>
    <div class="only-t">
      <label class="fl"><span>${a.bio}</span><input name="bio" maxlength="200" value="${esc(u.bio||'')}" placeholder="${a.bioPh}"></label>
      ${u.teacherStatus==='approved'||u.admin?'':`<p class="note tnote">${a.teacherNote}</p>`}</div>
    <div class="fl"><span>${a.lang}</span><div class="seg2"><label><input type="radio" name="lang" value="ja" ${(u.lang||LANG)==='ja'?'checked':''}><span>日本語</span></label><label><input type="radio" name="lang" value="ko" ${(u.lang||LANG)==='ko'?'checked':''}><span lang="ko">한국어</span></label></div></div>
    <button class="btn pink block" type="submit">${first?a.save:a.saveE}</button>
  </form>`;
}
function vOnboard(){
  const a=A();
  return `<div class="auth"><div class="card auth-c wide"><div class="auth-m sm">${mascotSVG(2,'big')}</div><h1 class="jua">${a.obT}</h1><p>${a.obP}</p>${profileForm(ME,true)}</div></div>`;
}
function bindProfileForm(after){
  const f=$('#pf');if(!f)return;
  const sync=()=>{const r=(f.querySelector('[name=role]:checked')||{}).value;f.dataset.role=r||''};
  f.addEventListener('change',sync);sync();
  f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f),b=Object.fromEntries(fd.entries()),btn=f.querySelector('[type=submit]'),lbl=btn.textContent;
    btn.disabled=true;btn.textContent=A().saving;
    try{const was=ME&&ME.profileDone;setMe(await api('PUT','/me',b));if(b.lang&&b.lang!==LANG){LANG=b.lang;store.set('lang',LANG);applyLang()}
      toast(A().saved);if(after)after(was);else render(false)}
    catch(e){btn.disabled=false;btn.textContent=lbl;toast(navigator.onLine?A().err:A().offline)}};
}

/* ---------- 마이 페이지 · 관리자 ---------- */
const roleBadges=u=>{const b=A().roleBadge,out=[];
  if(u.admin)out.push(`<span class="rb ad">${b.admin}</span>`);
  if(u.role==='teacher')out.push(`<span class="rb te">${b.teacher}</span>`,u.admin?'':`<span class="rb st-${u.teacherStatus}">${b[u.teacherStatus]||''}</span>`);
  else if(u.role)out.push(`<span class="rb su">${b.student}</span>`);
  return out.join('')};
function avatar(u,cls=''){const n=(u.name||u.email||'?').trim();return u.picture?`<img class="av ${cls}" src="${esc(u.picture)}" alt="" referrerpolicy="no-referrer">`:`<span class="av ${cls}">${esc(n[0])}</span>`}
let editMe=false,delArm=0;
function vMe(){
  const a=A(),u=ME;if(!u)return '';
  return `<div class="h2 first"><span>${a.profile}</span>${editMe?'':`<button class="btn sm" id="meEdit">${a.edit}</button>`}</div>
    <section class="card mecard">${avatarEdit(u)}<div><b class="mn">${esc(u.name)}</b><small>${esc(u.email)}</small><div class="rbs">${roleBadges(u)}</div>${u.customPicture?`<button class="lnk" id="avDel">${S_().photoDel}</button>`:`<small class="avh">📷 ${S_().photo}</small>`}</div></section>
    ${statusBanner()}
    ${editMe?`<section class="card">${profileForm(u,false)}</section>`:`<section class="card mekv">
      ${u.role==='student'?`<div><span>${a.level}</span><b>${esc(a.levels[u.level]||'—')}</b></div><div><span>${a.goal}</span><b>${esc(u.goal||'—')}</b></div><div><span>${TT().title}</span><b>${u.test?`STEP ${u.test.step} (${u.test.score}/${u.test.total})`:'—'} <a class="btn sm" href="#/test">🧪</a></b></div>`:`<div><span>${a.bio}</span><b>${esc(u.bio||'—')}</b></div>`}</section>`}
    ${u.admin?`<a class="btn block yellow" href="#/admin">🛡 ${a.admin}</a>`:''}
    <div class="mebtns"><button class="btn block" id="meOut">${a.logout}</button><button class="btn block ghost" id="meDel">${a.del}</button></div>`;
}
function bindMe(){
  const e=$('#meEdit');if(e)e.onclick=()=>{editMe=true;render(true)};bindAvatar();
  bindProfileForm(()=>{editMe=false;render(false)});
  $('#meOut').onclick=logout;
  $('#meDel').onclick=async ev=>{if(Date.now()-delArm>4000){delArm=Date.now();ev.target.textContent=A().delC;return}
    try{await api('DELETE','/me');setMe(null);store.set('me',null);location.hash='#/';render(false)}catch(e){toast(A().err)}};
}
async function logout(){try{await api('POST','/auth/logout')}catch(e){}
  try{window.google&&google.accounts.id.disableAutoSelect()}catch(e){}
  setMe(null);location.hash='#/';render(false)}
function statusBanner(){
  if(!authed()||ME.role!=='teacher'||ME.admin)return '';
  const a=A(),s=ME.teacherStatus;
  if(s==='pending')return `<div class="card sbanner pend"><span>⏳</span><p><b>${a.pending}</b>${a.pendingS}</p></div>`;
  if(s==='rejected')return `<div class="card sbanner rej"><span>ℹ️</span><p><b>${a.rejected}</b>${a.rejectedS}</p></div>`;
  return '';
}
let adminUsers=null;
function vAdmin(){
  const a=A();
  if(!adminUsers){loadAdmin();return `<div class="h2 first"><span>${a.admin}</span></div><div class="card"><div class="dl-bar"><i style="width:40%"></i></div></div>`}
  const fmt=t=>t?new Date(t*1000).toLocaleDateString(LANG==='ko'?'ko-KR':'ja-JP'):'—';
  return `<div class="h2 first"><span>${a.admin}</span><small>${a.users} ${adminUsers.length}</small></div>
   <div class="ulist">${adminUsers.length?adminUsers.map(u=>`<div class="card urow ${u.teacherStatus==='pending'?'pend':''}">${avatar(u)}<div class="ui"><b>${esc(u.name||'—')}</b><small>${esc(u.email)}</small><div class="rbs">${roleBadges(u)}</div>
     ${u.role==='teacher'&&u.bio?`<small class="ub">${esc(u.bio)}</small>`:''}${u.role==='student'&&(u.level||u.goal)?`<small class="ub">${esc(a.levels[u.level]||'')} ${esc(u.goal||'')}</small>`:''}<small class="ub">${a.lastL} ${fmt(u.lastLogin)}</small></div>
     ${u.admin?'':`<div class="ua">${u.role==='teacher'&&u.teacherStatus!=='approved'?`<button class="btn sm mint" data-act="approve" data-id="${u.id}">${a.approve}</button>`:''}${u.role==='teacher'&&u.teacherStatus==='pending'?`<button class="btn sm" data-act="reject" data-id="${u.id}">${a.reject}</button>`:''}${u.role==='teacher'&&u.teacherStatus==='approved'?`<button class="btn sm" data-act="student" data-id="${u.id}">${a.toStu}</button>`:''}</div>`}
   </div>`).join(''):`<p class="empty">${a.none}</p>`}</div>`;
}
async function loadAdmin(){try{adminUsers=(await api('GET','/admin/users')).users}catch(e){adminUsers=[];toast(A().err)}if(route().v==='admin')render(true)}
function bindAdmin(){$$('[data-act]').forEach(b=>b.onclick=async()=>{b.disabled=true;
  try{const u=await api('POST','/admin/users/'+b.dataset.id,{action:b.dataset.act});adminUsers=adminUsers.map(x=>x.id===u.id?u:x);render(true)}catch(e){b.disabled=false;toast(A().err)}})}

/* ---------- 선생님 홈 ---------- */
function teacherHero(){
  const a=A(),m=TMx(),t=T(),st=store.get('tlast',0),l0=L.find(x=>x.no===st)||L[0],l=V(l0);
  return `<section class="card hero thero"><span class="sticker s1">★</span>
    <div class="th-top">${ME?avatar(ME,'lg'):''}<div><small>${a.tHero}</small><b class="jua">${ME?esc(a.tHi(ME.name)):m.mode}</b><span>${a.tHeroS}</span></div></div>
    <div class="tnext card"><small>${st?m.recent:m.next}</small><b>${t.no(l.no)} ${esc(l.title)}</b><span>${esc(l.sub)}</span>
      <div class="tnb"><a class="btn pink" href="#/l/${l.no}/plan">📋 ${m.prep}</a><a class="btn" href="${pdfUrl(l.no,'guide')}" data-dl="${esc(lessonDl(l.no,'guide'))}">📘 ${m.guidePdf}</a></div></div>
    <div class="th-btns two"><a class="btn block" href="#/prints">🖨 ${m.prints}</a><a class="btn block" href="#/guide">🧭 ${m.cur}</a></div>
  </section>`;
}

/* ---------- 라우트 가드 ---------- */
function authGate(r){
  if(AUTH==='boot'){topbar('main');tabbar(null);$('#app').innerHTML=`<div class="auth"><div class="auth-m">${mascotSVG(3,'big')}</div></div>`;return true}
  if(AUTH==='out'){document.body.dataset.view='login';topbar('main');tabbar(null);$('#app').innerHTML=`<div class="view">${vLogin(r.v==='login-error')}</div>`;mountGoogle($('#gbtn'));return true}
  if(AUTH==='profile'){document.body.dataset.view='login';topbar('main');tabbar(null);$('#app').innerHTML=`<div class="view">${vOnboard()}</div>`;bindProfileForm(()=>{location.hash='#/';render(false)});return true}
  if((r.v==='print'&&r.t==='guide'&&!canTeach())||(r.v==='admin'&&!(ME&&ME.admin))||((r.v==='me'||r.v==='admin')&&AUTH==='off')||((r.v==='lessons'||r.v==='chat'||r.v==='book')&&!lessonsOn())){location.replace('#/');return true}
  return false;
}
/* 앱으로 돌아올 때 역할 변경(승인 등)을 반영 */
let meAt=0;
async function refreshMe(){
  if(!authed()||!navigator.onLine||Date.now()-meAt<30000)return;meAt=Date.now();
  try{const u=await api('GET','/me'),before=JSON.stringify([ME.view,ME.teacherStatus,ME.role,ME.name]);setMe(u);
    if(JSON.stringify([u.view,u.teacherStatus,u.role,u.name])!==before&&route().v!=='print')render(true)}
  catch(e){if(e.status===401){setMe(null);render(false)}}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshMe()});
