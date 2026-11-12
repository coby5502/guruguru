/* ======================= 레슨 · 매칭 · 일정 · 채팅 · 실력 테스트 · 프로필 사진 =======================
   백엔드(/api)가 켜져 있고 로그인한 경우에만 레슨 탭이 보인다. 실력 테스트는 로그인 없이도 가능(결과는 기기에 저장). */
const SO={
ja:{tab:'レッスン',next:'予定のレッスン',noNext:'まだ予約はありません',myT:'私の先生',myS:'私の生徒',find:'先生を探す',findS:'気になる先生にレッスンを申し込みましょう',noTeachers:'まだ登録された先生がいません',noMine:'まだ先生がいません。下の「先生を探す」から申し込みましょう',
 reqs:'新しい申し込み',noReqs:'新しい申し込みはありません',apply:'申し込む',applyPh:'先生へのメッセージ（任意）\n例）旅行で使える会話を練習したいです',send:'送信',applied:'申し込みました！先生の返事を待ちましょう',
 st:{pending:'申込中',accepted:'マッチング中',declined:'見送り',ended:'終了',canceled:'取り消し'},chat:'チャット',book:'予約する',accept:'承諾する',decline:'お断りする',cancelReq:'申し込みを取り消す',end:'マッチングを終了',endC:'もう一度押すと終了します',
 free:n=>`空き ${n}枠`,slotsT:'レッスン可能な時間',slotsS:'生徒が予約できる時間を開けましょう',date:'日付',time:'開始',dur:'長さ',repeat:'繰り返し',once:'1回だけ',weeks:n=>`毎週・${n}週`,add:'時間を追加',min:'分',
 added:n=>`${n}枠を追加しました`,overlap:'重なる時間・過去の時間は追加されませんでした',noSlots:'開いている時間はありません',booked:'予約済み',del:'削除',cancel:'予約キャンセル',cancelC:'もう一度押すとキャンセル',
 lessonNo:'授業の回',prep:n=>`第${n}回を予習する`,save:'保存',noPh:'例）12',pickT:'予約する時間を選ぶ',pickNone:'いま予約できる時間がありません。チャットで相談してみましょう',confirm:t=>`${t} で予約する`,bookedT:'予約しました！',taken:'その時間は予約できませんでした',
 chatPh:'メッセージを入力',closed:'このマッチングは終了しました',waitT:'先生の返事を待っています',reqBanner:'レッスンの申し込みが届きました',
 sys:{request:'レッスンを申し込みました',accepted:'マッチングしました 🎉',declined:'今回は見送りになりました',canceled:'申し込みが取り消されました',ended:'マッチングが終了しました',book:t=>`📅 ${t} に予約しました`,unbook:t=>`🗓 ${t} の予約が取り消されました`},
 newMsg:'新しいメッセージが届きました',newReq:'新しいレッスンの申し込みが届きました',updated:'予定が更新されました',err:'読み込めませんでした',retry:'もう一度',today:'今日',tomorrow:'明日',
 photo:'写真を変更',photoDel:'写真を削除',photoErr:'画像を読み込めませんでした',uploading:'アップロード中…',testOf:t=>`実力テスト：ステップ${t.step}（${t.score}/${t.total}）`,noTest:'実力テスト未受験',
 openSlots:'時間を開ける',teacherOf:n=>`${n} 先生`,hint:'実力テストを受けておくと、先生があなたのレベルに合わせて準備できます',past:'過去のマッチング',read:'既読',you:'あなた',
 nextCard:'次のレッスン',goChat:'チャットを開く',msgs:'件の未読'},
ko:{tab:'레슨',next:'예정된 레슨',noNext:'아직 예약이 없어요',myT:'내 선생님',myS:'내 학생',find:'선생님 찾기',findS:'마음에 드는 선생님께 레슨을 신청해 보세요',noTeachers:'아직 등록된 선생님이 없어요',noMine:'아직 선생님이 없어요. 아래 "선생님 찾기"에서 신청해 보세요',
 reqs:'새 신청',noReqs:'새 신청이 없어요',apply:'신청하기',applyPh:'선생님께 보낼 메시지 (선택)\n예) 여행 회화를 연습하고 싶어요',send:'보내기',applied:'신청했어요! 선생님의 답을 기다려요',
 st:{pending:'신청 중',accepted:'매칭됨',declined:'거절됨',ended:'종료',canceled:'취소됨'},chat:'채팅',book:'예약하기',accept:'수락',decline:'거절',cancelReq:'신청 취소',end:'매칭 종료',endC:'한 번 더 누르면 종료돼요',
 free:n=>`예약 가능 ${n}개`,slotsT:'수업 가능 시간',slotsS:'학생이 예약할 수 있는 시간을 열어 두세요',date:'날짜',time:'시작',dur:'길이',repeat:'반복',once:'한 번',weeks:n=>`매주 ${n}주`,add:'시간 추가',min:'분',
 added:n=>`${n}개를 추가했어요`,overlap:'겹치거나 지난 시간은 추가되지 않았어요',noSlots:'열린 시간이 없어요',booked:'예약됨',del:'삭제',cancel:'예약 취소',cancelC:'한 번 더 누르면 취소돼요',
 lessonNo:'수업 회차',prep:n=>`제${n}회 예습하기`,save:'저장',noPh:'예) 12',pickT:'예약할 시간 고르기',pickNone:'지금 예약할 수 있는 시간이 없어요. 채팅으로 상의해 보세요',confirm:t=>`${t}로 예약하기`,bookedT:'예약했어요!',taken:'그 시간은 예약할 수 없었어요',
 chatPh:'메시지 입력',closed:'이 매칭은 종료됐어요',waitT:'선생님의 답을 기다리고 있어요',reqBanner:'레슨 신청이 왔어요',
 sys:{request:'레슨을 신청했어요',accepted:'매칭됐어요 🎉',declined:'이번에는 거절됐어요',canceled:'신청이 취소됐어요',ended:'매칭이 종료됐어요',book:t=>`📅 ${t} 예약했어요`,unbook:t=>`🗓 ${t} 예약이 취소됐어요`},
 newMsg:'새 메시지가 왔어요',newReq:'새 레슨 신청이 왔어요',updated:'일정이 바뀌었어요',err:'불러오지 못했어요',retry:'다시 시도',today:'오늘',tomorrow:'내일',
 photo:'사진 바꾸기',photoDel:'사진 삭제',photoErr:'이미지를 읽지 못했어요',uploading:'올리는 중…',testOf:t=>`실력 테스트: 스텝 ${t.step} (${t.score}/${t.total})`,noTest:'실력 테스트 미응시',
 openSlots:'시간 열기',teacherOf:n=>`${n} 선생님`,hint:'실력 테스트를 해 두면 선생님이 내 수준에 맞춰 준비할 수 있어요',past:'지난 매칭',read:'읽음',you:'나',
 nextCard:'다음 레슨',goChat:'채팅 열기',msgs:'개 안 읽음'}
};
const S_=()=>SO[LANG];
const SOC={matches:null,teachers:null,schedule:null,slots:null,sum:{unread:0,requests:0,next:null},err:false,busy:0};
const loc=()=>LANG==='ko'?'ko-KR':'ja-JP';
const pad2=n=>String(n).padStart(2,'0');
function fDay(sec){const d=new Date(sec*1000),t=new Date();t.setHours(0,0,0,0);const diff=Math.round((new Date(d).setHours(0,0,0,0)-t)/864e5);
  const base=`${d.getMonth()+1}/${d.getDate()}(${d.toLocaleDateString(loc(),{weekday:'short'})})`;return diff===0?`${S_().today} ${base}`:diff===1?`${S_().tomorrow} ${base}`:base}
const fTime=sec=>{const d=new Date(sec*1000);return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`};
const fWhen=(sec,dur)=>`${fDay(sec)} ${fTime(sec)}${dur?(LANG==='ko'?` (${dur}분)`:`（${dur}分）`):''}`;
const isTeacherMe=()=>!!ME&&ME.role==='teacher'&&ME.view==='teacher';
const isStudentMe=()=>!!ME&&ME.role==='student';
const lessonsOn=()=>authed()&&AUTH==='in'&&(isTeacherMe()||isStudentMe());

/* ---------- 요약 · 실시간 ---------- */
let sumT=0;
async function loadSummary(){if(!lessonsOn())return;try{SOC.sum=await api('GET','/summary');paintBadge()}catch(e){}}
function sumSoon(){clearTimeout(sumT);sumT=setTimeout(loadSummary,250)}
function paintBadge(){const a=$('#tabs a[href="#/lessons"]');if(!a)return;const n=(SOC.sum.unread||0)+(SOC.sum.requests||0)+(SOC.sum.todo||0);
  let b=a.querySelector('.tbadge');if(!n){if(b)b.remove();return}if(!b){b=document.createElement('b');b.className='tbadge';a.appendChild(b)}b.textContent=n>99?'99+':n}
let ES=null,esOk=false;
function sseStart(){if(ES||!lessonsOn()||!window.EventSource)return;
  ES=new EventSource('/api/events');ES.onopen=()=>{esOk=true};ES.onerror=()=>{esOk=false};
  ES.onmessage=e=>{let d;try{d=JSON.parse(e.data)}catch(_){return}onEvent(d)}}
function sseStop(){if(ES){ES.close();ES=null;esOk=false}}
function onEvent(d){
  const r=route();sumSoon();
  if(r.v==='chat'&&d.matchId===r.id){if(d.t==='read')$$('#cmsgs .cm.me').forEach(x=>x.classList.add('rd'));else chatPull();return}
  if(r.v==='notes'&&d.matchId===r.id){loadNotes(r.id);return}
  if(r.v==='lessons'||r.v==='book'){loadHub(true);return}
  if(d.t==='msg')toast(S_().newMsg);else if(d.t==='match')toast(S_().newReq);else if(d.t==='slot')toast(S_().updated);
}
setInterval(()=>{if(document.visibilityState!=='visible'||!lessonsOn())return;if(!esOk)loadSummary();const r=route();if(r.v==='chat'&&!esOk)chatPull()},15000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&lessonsOn()){loadSummary();const r=route();if(r.v==='chat')chatPull();if(r.v==='lessons')loadHub(true)}});
function socialTick(){hookStore();if(authed()&&AUTH==='in'&&!socialTick.pg){socialTick.pg=1;progSync()}if(!authed())socialTick.pg=0;
  if(lessonsOn()){sseStart();if(!socialTick.done){socialTick.done=1;loadSummary()}}else{sseStop();socialTick.done=0}}

/* ---------- 데이터 ---------- */
async function loadHub(silent){
  if(!lessonsOn())return;SOC.busy++;
  try{const t=isTeacherMe();const [m,s,x]=await Promise.all([api('GET','/matches'),api('GET','/schedule'),t?api('GET','/slots'):api('GET','/teachers')]);
    SOC.matches=m.matches;SOC.schedule=s.lessons;SOC.at=Date.now();loadTodo();if(t)SOC.slots=x.slots;else SOC.teachers=x.teachers;SOC.err=false}
  catch(e){SOC.err=true}
  SOC.busy--;const r=route();if(r.v==='lessons'||(r.v==='book'&&!silent))render(true);sumSoon();
}

/* ---------- 공통 조각 ---------- */
const stPill=s=>`<span class="spill s-${s}">${S_().st[s]}</span>`;
const testLine=t=>t?`<span class="tline">🧪 ${esc(S_().testOf(t))}</span>`:'';
function peerHead(p,extra=''){const a=A();return `<div class="ph2">${avatar(p)}<div class="pi"><b>${esc(p.name)}</b>${p.role==='student'?`<small>${esc([a.levels[p.level]||'',p.goal].filter(Boolean).join(' · '))}</small>${testLine(p.test)}`:`<small>${esc(p.bio||'')}</small>`}</div>${extra}</div>`}
function lessonItem(s){const o=S_(),t=isTeacherMe(),soon=s.start-Date.now()/1000<36*3600;
  return `<div class="card lsn ${soon?'soon':''}" data-id="${s.id}">
    <div class="lw"><b>${fDay(s.start)}</b><span>${fTime(s.start)} · ${s.dur}${o.min}</span>${modeChip(s)}</div>
    ${s.mode==='offline'&&s.place?`<a class="plrow" href="${gmap(s.place)}" target="_blank" rel="noopener"><b>📍 ${esc(s.place.name)}</b><small>${esc(s.place.addr||'')} · ${PX().map} ↗</small></a>`
      :s.url?`<a class="btn ${soon?'pink':''} block" href="${esc(s.url)}" target="_blank" rel="noopener">💻 ${PX().enter}</a>`:''}
    ${peerHead(s.with,`${t&&s.with?`<a class="btn sm" href="#/student/${s.with.id}" aria-label="${S2().sp}">📊</a>`:''}${s.matchId?`<a class="btn sm" href="#/chat/${s.matchId}">💬</a>`:''}`)}
    ${t?`<form class="lno" data-id="${s.id}"><label>${o.lessonNo}<input name="no" type="number" min="1" max="290" inputmode="numeric" value="${s.lessonNo||''}" placeholder="${o.noPh}"></label><button class="btn sm" type="submit">${o.save}</button></form>`
       :s.lessonNo?`<a class="btn sm mint block" href="#/l/${s.lessonNo}">📖 ${o.prep(s.lessonNo)}</a>`:''}
    <div class="lsf"><button class="lnk" data-ics="${s.id}">📆 ${BX().ics}</button><button class="lnk danger" data-cancel="${s.id}">${o.cancel}</button></div></div>`}
function emptyCard(txt){return `<div class="card empty2">${txt}</div>`}

/* ---------- 레슨 허브 ---------- */
function vLessons(){
  const o=S_();
  if(SOC.matches===null){if(!SOC.busy)loadHub();return `<div class="h2 first"><span>${o.tab}</span></div>${SOC.err?`<div class="card empty2">${o.err}<button class="btn sm" id="hubRetry">${o.retry}</button></div>`:'<div class="card"><div class="dl-bar"><i style="width:40%"></i></div></div>'}`}
  if(!SOC.busy&&Date.now()-(SOC.at||0)>3000)setTimeout(()=>loadHub(true),0);
  const t=isTeacherMe(),ms=SOC.matches,act=ms.filter(m=>m.status==='accepted'),pend=ms.filter(m=>m.status==='pending'),old=ms.filter(m=>!['accepted','pending'].includes(m.status));
  const mrow=m=>`<a class="card mrow" href="#/chat/${m.id}">${peerHead(m.peer)}<div class="mr">${stPill(m.status)}${m.unread?`<b class="ub2">${m.unread}</b>`:''}</div>
    ${m.last&&m.last.kind!=='sys'?`<p class="ml">${esc(m.last.body)}</p>`:''}${m.next?`<p class="mn2">📅 ${esc(fWhen(m.next.start,m.next.dur))}</p>`:''}</a>`;
  let h=`<div class="h2 first"><span>${o.tab}</span></div>${pushCard()}`+todoBlock();
  if(t){
    h+=`<div class="h2"><span>📨 ${o.reqs}</span>${pend.length?`<span class="tag">${pend.length}</span>`:''}</div>`;
    h+=pend.length?pend.map(m=>`<div class="card req">${peerHead(m.peer)}${m.last&&m.last.kind!=='sys'?`<p class="ml q">${esc(m.last.body)}</p>`:''}
      <div class="rbtn"><button class="btn mint" data-act="accept" data-id="${m.id}">${o.accept}</button><button class="btn" data-act="decline" data-id="${m.id}">${o.decline}</button><a class="btn sm" href="#/chat/${m.id}">💬</a></div></div>`).join(''):emptyCard(o.noReqs);
  }
  h+=`<div class="h2"><span>📅 ${o.next}</span>${SOC.schedule.length>1?`<button class="lnk" data-ics="all">📆 ${BX().icsAll}</button>`:''}</div>`+(SOC.schedule.length?SOC.schedule.map(lessonItem).join(''):emptyCard(o.noNext));
  h+=`<div class="h2"><span>${t?'🎒 '+o.myS:'🧑‍🏫 '+o.myT}</span></div>`;
  const mine=t?act:[...act,...pend];
  h+=mine.length?mine.map(m=>mrow(m)+(!t&&m.status==='accepted'?`<a class="btn block sky bk" href="#/book/${m.id}">📅 ${o.book}</a>`:t?`<a class="btn block bk" href="#/student/${m.peer.id}">📊 ${S2().sp}</a>`:'')).join(''):emptyCard(t?(LANG==='ko'?'아직 매칭된 학생이 없어요':'まだマッチングした生徒はいません'):o.noMine);
  if(t)h+=slotsEditor();
  else{
    if(!ME.test)h+=`<a class="card hint" href="#/test">🧪 ${o.hint}</a>`;
    const p=PX(),fl=SOC.tf||'all',tl=SOC.teachers.filter(x=>fl==='all'||x.modes===fl||x.modes==='both');
    h+=`<div class="h2"><span>🔍 ${o.find}</span></div><p class="note" style="margin:0 2px 10px">${o.findS}</p>
      <div class="fchips tfil">${[['all',p.all],['online','💻 '+p.online],['offline','📍 '+p.offline]].map(([k,v])=>`<button data-tf="${k}" class="${fl===k?'on':''}">${v}</button>`).join('')}</div>`;
    h+=tl.length?tl.map(x=>`<div class="card tcard">${peerHead(x,x.freeSlots?`<span class="spill s-free">${o.free(x.freeSlots)}</span>`:'')}
      <div class="mchips">${modesBadges(x.modes)}${(x.places||[]).slice(0,2).map(pl=>`<span class="mchip pl">📍 ${esc(pl.name)}</span>`).join('')}${(x.tags||[]).slice(0,3).map(t=>`<span class="mchip tg">#${esc(t)}</span>`).join('')}</div>
      <a class="lnk" href="#/teacher/${x.id}">${x.rating!=null?stars(x.rating)+' '+x.rating+' ('+x.reviews+') · ':''}${p.profile} ›</a>
      ${x.match?`<a class="btn block" href="#/chat/${x.match.id}">💬 ${o.chat} · ${o.st[x.match.status]}</a>`
        :`<details class="apply"><summary class="btn pink block">${o.apply}</summary><form class="apf" data-id="${x.id}"><textarea name="message" maxlength="1000" rows="3" placeholder="${esc(o.applyPh)}"></textarea><button class="btn pink block" type="submit">${o.send}</button></form></details>`}</div>`).join(''):emptyCard(o.noTeachers);
  }
  if(old.length)h+=`<details class="old"><summary>${o.past} (${old.length})</summary>${old.map(mrow).join('')}</details>`;
  return h;
}
function slotsEditor(){
  const o=S_(),d=new Date(Date.now()+864e5),ds=`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  const free=(SOC.slots||[]).filter(s=>!s.booked),by={};free.forEach(s=>{const k=fDay(s.start);(by[k]=by[k]||[]).push(s)});
  const p=PX(),pls=(ME&&ME.places)||[],md=SOC.mode||((ME&&ME.modes)==='offline'?'offline':'online');
  return `<div class="h2" id="slots"><span>🕒 ${o.slotsT}</span></div><p class="note" style="margin:0 2px 10px">${o.slotsS}</p>
  <form class="card slf" id="slf"><div class="mseg"><span>${p.modeQ}</span><div class="seg2">${['online','offline'].map(k=>`<label><input type="radio" name="mode" value="${k}" ${md===k?'checked':''}><span>${k==='online'?'💻 '+p.online:'📍 '+p.offline}</span></label>`).join('')}</div></div>
    ${md==='offline'?`<div class="plpick"><span>${p.places}</span><div class="plc">${pls.map((pl,i)=>`<label class="plchip"><input type="radio" name="pi" value="${i}" ${i===(SOC.pi||0)?'checked':''}><span>📍 ${esc(pl.name)}</span><button type="button" data-pdel="${i}" aria-label="${p.del}">×</button></label>`).join('')}<button type="button" class="btn sm" id="plAdd">${p.addPlace}</button></div>${pls.length?`<div class="mapbox sm" id="slMap"></div>`:''}</div>`
      :`<label class="wide"><span>${p.url}</span><input name="url" type="url" inputmode="url" placeholder="${esc(ME&&ME.meetUrl?ME.meetUrl:p.urlPh)}"></label>`}<label><span>${o.date}</span><input type="date" name="date" value="${ds}" min="${new Date().toISOString().slice(0,10)}" required></label>
    <label><span>${o.time}</span><input type="time" name="time" value="19:00" step="300" required></label>
    <label><span>${o.dur}</span><select name="dur">${[30,45,50,60,90].map(n=>`<option value="${n}" ${n===60?'selected':''}>${n}${o.min}</option>`).join('')}</select></label>
    <label><span>${o.repeat}</span><select name="rep"><option value="1">${o.once}</option>${[2,4,8,12].map(n=>`<option value="${n}">${o.weeks(n)}</option>`).join('')}</select></label>
    <button class="btn sky block" type="submit">＋ ${o.add}</button></form>
  ${free.length?`<div class="card sll">${Object.entries(by).map(([k,ls])=>`<div class="sld"><b>${k}</b><div>${ls.map(s=>`<span class="slc ${s.mode}">${fTime(s.start)}<small>${s.dur}${o.min} ${s.mode==='offline'&&s.place?'📍'+esc(s.place.name):'💻'}</small><button data-del="${s.id}" aria-label="${o.del}">×</button></span>`).join('')}</div></div>`).join('')}</div>`:emptyCard(o.noSlots)}`;
}
const arm={};
function armed(key,el,msg){if(arm[key]&&Date.now()-arm[key]<4000){delete arm[key];return true}arm[key]=Date.now();el.textContent=msg;return false}
function bindLessons(){
  const o=S_(),app=$('#app');bindPush();
  const rb=$('#hubRetry');if(rb)rb.onclick=()=>loadHub();
  app.querySelectorAll('[data-ics]').forEach(b=>b.onclick=()=>{const l=b.dataset.ics==='all'?SOC.schedule:SOC.schedule.filter(s=>s.id===+b.dataset.ics);dlICS(l,'guruguru-lessons.ics')});
  app.querySelectorAll('[data-act]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await api('POST','/matches/'+b.dataset.id,{action:b.dataset.act});if(b.dataset.act==='accept')location.hash='#/chat/'+b.dataset.id;else loadHub()}catch(e){toast(A().err);b.disabled=false}});
  app.querySelectorAll('.apf').forEach(f=>f.onsubmit=async e=>{e.preventDefault();const btn=f.querySelector('button');btn.disabled=true;
    try{const m=await api('POST','/matches',{teacherId:+f.dataset.id,message:f.message.value});toast(o.applied);location.hash='#/chat/'+m.id}
    catch(err){btn.disabled=false;toast(err.status===429?A().err+' (429)':A().err);loadHub()}});
  app.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=async()=>{if(!armed('c'+b.dataset.cancel,b,o.cancelC))return;try{await api('POST',`/slots/${b.dataset.cancel}/cancel`);loadHub()}catch(e){toast(A().err)}});
  app.querySelectorAll('.lno').forEach(f=>f.onsubmit=async e=>{e.preventDefault();try{await api('PUT','/slots/'+f.dataset.id,{lessonNo:+f.no.value||null});toast(A().saved);loadHub()}catch(err){toast(A().err)}});
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{try{await api('DELETE','/slots/'+b.dataset.del);loadHub()}catch(e){toast(A().err)}});
  app.querySelectorAll('[data-tf]').forEach(b=>b.onclick=()=>{SOC.tf=b.dataset.tf;render(true)});
  const f=$('#slf');
  if(f){f.querySelectorAll('[name=mode]').forEach(r=>r.onchange=()=>{SOC.mode=r.value;render(true)});
    f.querySelectorAll('[name=pi]').forEach(r=>r.onchange=()=>{SOC.pi=+r.value});
    const savePl=async list=>{try{setMe(await api('PUT','/me/places',{places:list}));render(true)}catch(e){toast(A().err)}};
    const ad=$('#plAdd');if(ad)ad.onclick=async()=>{const pl=await pickPlace();if(pl){const list=[...(ME.places||[]),pl];SOC.pi=list.length-1;await savePl(list);toast(PX().saved)}};
    f.querySelectorAll('[data-pdel]').forEach(b=>b.onclick=e=>{e.preventDefault();const list=[...(ME.places||[])];list.splice(+b.dataset.pdel,1);SOC.pi=0;savePl(list)});
    if($('#slMap'))miniMap($('#slMap'),ME.places||[]);}
  if(f)f.onsubmit=async e=>{e.preventDefault();const [y,mo,d]=f.date.value.split('-').map(Number),[hh,mi]=f.time.value.split(':').map(Number),dur=+f.dur.value,rep=+f.rep.value,slots=[];
    for(let i=0;i<rep;i++){const dt=new Date(y,mo-1,d+7*i,hh,mi,0,0);slots.push({start:Math.floor(dt.getTime()/1000),dur})}
    const btn=f.querySelector('button');btn.disabled=true;
    const md=(f.querySelector('[name=mode]:checked')||{}).value||'online',pl=md==='offline'?(ME.places||[])[(f.querySelector('[name=pi]:checked')||{}).value|0]:null;
    if(md==='offline'&&!pl){toast(PX().noPlace);btn.disabled=false;return}
    try{const r=await api('POST','/slots',{slots,mode:md,place:pl,url:f.url?f.url.value.trim():''});SOC.slots=r.slots;toast(o.added(r.made)+(r.skipped?' · '+o.overlap:''));render(true)}
    catch(err){btn.disabled=false;toast(err.status===400?o.overlap:A().err)}};
}

/* ---------- 예약 ---------- */
let BK={id:0,slots:null,sel:0,err:false};
async function loadBook(id){BK={id,slots:null,sel:0,err:false};
  try{const m=SOC.matches&&SOC.matches.find(x=>x.id===id)||await api('GET','/matches/'+id);BK.m=m;BK.slots=(await api('GET','/slots?teacher='+m.peer.id)).slots}catch(e){BK.err=true}
  if(route().v==='book')render(true)}
function vBook(id){
  const o=S_();if(BK.id!==id){loadBook(id);BK.id=id}
  if(BK.err)return emptyCard(o.err);
  if(!BK.slots)return '<div class="card"><div class="dl-bar"><i style="width:40%"></i></div></div>';
  const by={};BK.slots.forEach(s=>{const k=fDay(s.start);(by[k]=by[k]||[]).push(s)});const sel=BK.slots.find(s=>s.id===BK.sel);
  return `<div class="card bkh">${peerHead(BK.m.peer)}</div><div class="h2"><span>${o.pickT}</span></div>
    ${BK.slots.length?Object.entries(by).map(([k,ls])=>`<div class="card bkd"><b>${k}</b><div class="bks">${ls.map(s=>`<button class="slb ${s.mode} ${s.id===BK.sel?'on':''}" data-s="${s.id}">${fTime(s.start)}<small>${s.dur}${o.min}</small><em>${s.mode==='offline'&&s.place?'📍 '+esc(s.place.name):'💻 '+PX().online}</em></button>`).join('')}</div></div>`).join('')
      :`<div class="card empty2">${o.pickNone}<a class="btn sm" href="#/chat/${id}">💬 ${o.chat}</a></div>`}
    ${sel&&sel.mode==='offline'&&sel.place?`<div class="card tmap"><div class="mapbox" id="bkMap"></div><a class="plrow" href="${gmap(sel.place)}" target="_blank" rel="noopener"><b>📍 ${esc(sel.place.name)}</b><small>${esc(sel.place.addr||'')}</small></a></div>`:''}
    ${sel?`<div class="lbar"><div class="in"><button class="btn pink" id="bkGo">${esc(o.confirm(fWhen(sel.start,sel.dur)))}</button></div></div>`:''}`;
}
function bindBook(id){
  $$('.slb').forEach(b=>b.onclick=()=>{BK.sel=+b.dataset.s;render(true)});
  const sel=BK.slots&&BK.slots.find(s=>s.id===BK.sel);if(sel&&sel.place&&$('#bkMap'))miniMap($('#bkMap'),[sel.place]);
  const g=$('#bkGo');if(g)g.onclick=async()=>{g.disabled=true;try{await api('POST',`/slots/${BK.sel}/book`);toast(S_().bookedT);confetti(innerWidth/2,innerHeight-120,16);SOC.matches=null;location.hash='#/chat/'+id}
    catch(e){toast(e.status===402?BX().noCredit:S_().taken);loadBook(id)}};
}

/* ---------- 채팅 ---------- */
let CH={id:0,last:0,m:null,busy:false};
function sysText(b){const s=S_().sys;if(!b)return '';if(b.t==='credits')return BX().sysC(b.n);if(b.t==='book'||b.t==='unbook')return s[b.t](fWhen(b.start,b.dur));return s[b.t]||''}
function msgHTML(x){
  if(x.kind==='voice')return voiceHTML(x);
  if(x.kind==='sys')return `<div class="cs">${esc(sysText(x.body))}</div>`;
  const me=x.from===ME.id;
  return `<div class="cm ${me?'me':''} ${me&&x.read?'rd':''}" data-id="${x.id}"><div class="cb">${esc(x.body).replace(/\n/g,'<br>')}</div><time>${fTime(x.at)}${me?`<i class="rk">${S_().read}</i>`:''}</time></div>`}
function vChat(id){
  return `<div class="chat" id="chat"><div id="chead" class="chead"></div><div class="cmsgs" id="cmsgs"><div class="card"><div class="dl-bar"><i style="width:40%"></i></div></div></div>
  <div id="cfoot" class="cfoot"></div></div>`;
}
function chatHead(){
  const o=S_(),m=CH.m,t=m.side==='teacher';
  $('#chead').innerHTML=`<div class="card chc">${peerHead(m.peer,stPill(m.status))}
    ${m.status==='accepted'?`<div class="cact">${t?`<a class="btn sm sky" href="#/lessons">🕒 ${o.openSlots}</a><a class="btn sm" href="#/student/${m.peer.id}">📊 ${S2().sp}</a>`:`<a class="btn sm sky" href="#/book/${m.id}">📅 ${o.book}</a>`}${m.next?`<span class="mn2">📅 ${esc(fWhen(m.next.start,m.next.dur))}</span>`:''}<a class="btn sm" href="#/notes/${m.id}">📒 ${NOX().t}</a><button class="lnk danger" id="chEnd">${o.end}</button></div>`:''}
    ${m.status==='ended'?`<div class="cact"><a class="btn sm" href="#/notes/${m.id}">📒 ${NOX().t}</a></div>`:''}
    ${m.status==='pending'&&t?`<div class="cact"><b class="rq">📨 ${o.reqBanner}</b><button class="btn sm mint" data-ca="accept">${o.accept}</button><button class="btn sm" data-ca="decline">${o.decline}</button></div>`:''}
    ${m.status==='pending'&&!t?`<div class="cact"><span class="mn2">⏳ ${o.waitT}</span><button class="lnk danger" data-ca="cancel">${o.cancelReq}</button></div>`:''}${chatExtras()}</div>`;
  $$('#chead [data-ca]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await api('POST','/matches/'+m.id,{action:b.dataset.ca});SOC.matches=null;chatPull(true)}catch(e){toast(A().err);b.disabled=false}});
  const e=$('#chEnd');if(e)e.onclick=async()=>{if(!armed('end'+m.id,e,o.endC))return;try{await api('POST','/matches/'+m.id,{action:'end'});SOC.matches=null;chatPull(true)}catch(err){toast(A().err)}};
  bindChatExtras();
  const open=['pending','accepted'].includes(m.status)&&!m.blocked,f=$('#cfoot');
  if(!open)f.innerHTML=`<p class="cclosed">${m.blocked?BX().blockedT:o.closed}</p>`;
  else if(!f.querySelector('form')){f.innerHTML=`<form class="cin" id="cin"><textarea name="b" rows="1" maxlength="1000" placeholder="${o.chatPh}" enterkeyhint="send"></textarea><button class="btn pink" type="submit" aria-label="${o.send}">➤</button></form>`;bindChatInput()}
  recButtonBind();
}
async function chatPull(full){
  const r=route();if(r.v!=='chat'||CH.busy)return;const id=r.id;CH.busy=true;
  try{const d=await api('GET',`/matches/${id}/messages${full||!CH.last?'':'?after='+CH.last}`);if(route().v!=='chat'||route().id!==id)return;
    const box=$('#cmsgs'),stick=box.scrollHeight-box.scrollTop-box.clientHeight<80||!CH.last;
    if(full||!CH.last)box.innerHTML='';
    const stChanged=!CH.m||CH.m.status!==d.match.status||JSON.stringify(CH.m.next)!==JSON.stringify(d.match.next);CH.m=d.match;if(stChanged||full)chatHead();
    if(d.messages.length){box.insertAdjacentHTML('beforeend',d.messages.map(msgHTML).join(''));CH.last=d.messages.at(-1).id}
    if(stick)scrollChat();sumSoon()}
  catch(e){if(!CH.last)$('#cmsgs').innerHTML=emptyCard(S_().err)}
  finally{CH.busy=false}
}
const scrollChat=()=>{const b=$('#cmsgs');if(b)b.scrollTop=b.scrollHeight;scrollTo(0,document.body.scrollHeight)};
function bindChat(id){CH={id,last:0,m:null,busy:false};chatPull(true)}
function bindChatInput(){
  const f=$('#cin'),ta=f.b;
  const grow=()=>{ta.style.height='auto';ta.style.height=Math.min(140,ta.scrollHeight)+'px'};ta.oninput=grow;
  ta.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&matchMedia('(pointer:fine)').matches){e.preventDefault();f.requestSubmit()}};
  f.onsubmit=async e=>{e.preventDefault();const v=ta.value.trim();if(!v)return;const btn=f.querySelector('button');btn.disabled=true;
    try{await api('POST',`/matches/${CH.id}/messages`,{body:v});ta.value='';grow();await chatPull()}catch(err){toast(err.status===409?S_().closed:A().err)}
    btn.disabled=false;ta.focus()};
}

/* ---------- 홈 카드 ---------- */
function nextLessonCard(){
  if(!lessonsOn())return '';const o=S_(),n=SOC.sum.next,u=(SOC.sum.unread||0)+(SOC.sum.requests||0);
  if(!n&&!u)return '';
  return `<a class="card nlc" href="${n&&n.matchId?'#/chat/'+n.matchId:'#/lessons'}"><span class="ic">📅</span><div><small>${n?o.nextCard:o.tab}</small>
    <b>${n?esc(fWhen(n.start,n.dur)):''}${n&&n.with?` · ${esc(n.with.role==='teacher'?o.teacherOf(n.with.name):n.with.name)}`:''}</b>
    ${u?`<span class="ub2">${u}${o.msgs}</span>`:''}</div><span class="go">›</span></a>`}

/* ---------- 프로필 사진 ---------- */
async function uploadAvatar(file){
  const o=S_();if(!file)return;toast(o.uploading);
  let blob;
  try{const url=URL.createObjectURL(file),img=new Image();img.src=url;await img.decode();
    const w=img.naturalWidth,h=img.naturalHeight,s=Math.min(w,h),c=document.createElement('canvas');c.width=c.height=320;
    const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,320,320);g.drawImage(img,(w-s)/2,(h-s)/2,s,s,0,0,320,320);URL.revokeObjectURL(url);
    blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.86));if(!blob)throw 0}
  catch(e){toast(o.photoErr);return}
  try{const r=await fetch('/api/me/avatar',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'image/jpeg'},body:blob});if(!r.ok)throw 0;setMe(await r.json());toast(A().saved);render(true)}
  catch(e){toast(A().err)}
}
function avatarEdit(u){const o=S_();return `<label class="avbtn" title="${o.photo}">${avatar(u,'lg')}<span class="avcam">📷</span><input type="file" id="avIn" accept="image/*" hidden></label>`}
function bindAvatar(){
  const i=$('#avIn');if(i)i.onchange=()=>uploadAvatar(i.files[0]);
  const d=$('#avDel');if(d)d.onclick=async()=>{try{setMe(await api('DELETE','/me/avatar'));render(true)}catch(e){toast(A().err)}};
}

/* ======================= 실력 테스트 ======================= */
const TS={ja:{title:'実力テスト',lead:'いまのレベルをチェックして、どこから始めればいいかをお知らせします。ステップごとに4問・最大28問（約5分）。',start:'テストを始める',retake:'もう一度受ける',idk:'わからない',
  stepQ:(s,k)=>`ステップ${s} · ${k} / 4`,resT:'テスト結果',rec:n=>`おすすめ：ステップ${n}から`,allClear:'全ステップクリア！すばらしい実力です',go:n=>`ステップ${n}を始める`,saved:'結果を保存しました（申し込んだ先生にも表示されます）',
  last:(t,d)=>`前回：ステップ${t.step}（${t.score}/${t.total}・${d}）`,homeT:'実力テスト',homeS:'5分でレベルチェック・どこから始めるかが分かります',pass:'クリア',fail:'もう少し',quit:'やめる',score:'正解'},
 ko:{title:'실력 테스트',lead:'지금 실력을 확인하고 어디서부터 시작하면 좋을지 알려 드려요. 스텝마다 4문제, 최대 28문제(약 5분).',start:'테스트 시작',retake:'다시 하기',idk:'모르겠어요',
  stepQ:(s,k)=>`스텝 ${s} · ${k} / 4`,resT:'테스트 결과',rec:n=>`추천: 스텝 ${n}부터`,allClear:'모든 스텝 통과! 훌륭한 실력이에요',go:n=>`스텝 ${n} 시작하기`,saved:'결과를 저장했어요 (신청한 선생님에게도 보여요)',
  last:(t,d)=>`지난번: 스텝 ${t.step} (${t.score}/${t.total} · ${d})`,homeT:'실력 테스트',homeS:'5분 만에 레벨 체크 · 어디서 시작할지 알려 드려요',pass:'통과',fail:'조금 더',quit:'그만두기',score:'정답'}};
const TT=()=>TS[LANG];
let TST=null;
const myTest=()=>authed()&&ME.test?ME.test:store.get('test',null);
function stepPool(n){const ls=L.filter(l=>stepOfLesson(l.no)===n);const pool=[];ls.forEach(l0=>{const l=V(l0);(l.quiz||[]).forEach(q=>{if(q&&q.o&&q.o.length>1)pool.push(q)})});return pool}
function pick(arr,k){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,k)}
function testStart(){TST={step:0,k:0,qs:pick(stepPool(0),4),ok:0,res:[],ans:null,done:false,score:0,total:0}}
function testCard(){const t=TT(),r=myTest();
  return `<a class="card ttc" href="#/test"><span class="ic">🧪</span><div><b>${t.homeT}</b><small>${r?esc(t.last(r,new Date(r.at*1000).toLocaleDateString(loc()))):t.homeS}</small></div><span class="go">›</span></a>`}
function vTest(){
  const t=TT(),r=myTest();
  if(!TST)return `<section class="card lhero tsh" style="--c:var(--purple)"><span class="g">🧪</span><span class="no">${t.title}</span><h1>${t.title}</h1><div class="sub">${t.lead}</div></section>
    ${r?`<div class="card empty2">${esc(t.last(r,new Date(r.at*1000).toLocaleDateString(loc())))}<a class="btn sm" href="#/s/${r.step}">${t.go(r.step)}</a></div>`:''}
    <button class="btn pink block cta2" id="tsGo">▶ ${r?t.retake:t.start}</button>`;
  if(TST.done){const rec=TST.rec,ok=TST.res.every(x=>x.pass);
    return `<section class="card result tres"><div class="stars">🧪</div><p class="rt">${t.resT}</p><div class="sc">${TST.score}<span> / ${TST.total}</span></div>
      <p class="rr">${ok?t.allClear:t.rec(rec)}</p>
      <div class="tbars">${TST.res.map(x=>`<div class="tb ${x.pass?'ok':'ng'}"><span>STEP ${x.step}</span><i style="--w:${x.ok/4*100}%"></i><b>${x.ok}/4</b></div>`).join('')}</div>
      ${TST.saved?`<p class="note">${t.saved}</p>`:''}
      <div class="btns"><a class="btn pink block" href="#/s/${rec}">${t.go(rec)}</a><button class="btn block" id="tsAgain">${t.retake}</button></div></section>`}
  const q=TST.qs[TST.k],ans=TST.ans;
  return `<div class="qwrap"><div class="qhead"><div class="bar"><i style="width:${(TST.step*4+TST.k)/28*100}%"></i></div><b>${t.stepQ(TST.step,TST.k+1)}</b></div>
    <div class="card qcard"><span class="qn" style="--c:${cv(SCOL[TST.step])}">STEP ${TST.step}</span><div class="qq">${esc(q.q)}</div>
    <div class="opts">${q.o.map((x,j)=>{let c='';if(ans!=null){c=j===q.a?'ok':j===ans?'ng':'dim'}return `<button class="opt ${c}" data-j="${j}" ${ans!=null?'disabled':''}${isKo(x)?' lang="ko"':''}><span class="l">${'ABCD'[j]}</span><span class="ot">${esc(x)}</span></button>`}).join('')}</div>
    <button class="btn block ghost idk" data-j="-1" ${ans!=null?'disabled':''}>🤔 ${t.idk}</button></div>
    <button class="lnk" id="tsQuit">${t.quit}</button></div>`;
}
async function testFinish(){
  const res=TST.res,last=res[res.length-1];TST.rec=last.pass?Math.min(6,last.step+(last.step<6?1:0)):last.step;
  TST.score=res.reduce((a,x)=>a+x.ok,0);TST.total=res.length*4;TST.done=true;
  const rec={step:TST.rec,score:TST.score,total:TST.total,at:Math.floor(Date.now()/1000)};store.set('test',rec);
  if(authed()&&AUTH==='in'){try{setMe(await api('POST','/me/test',rec));TST.saved=true}catch(e){}}
  if(route().v==='test')render(true);
}
function bindTest(){
  const g=$('#tsGo');if(g)g.onclick=()=>{testStart();render(true)};
  const a=$('#tsAgain');if(a)a.onclick=()=>{testStart();render(true);scrollTo(0,0)};
  const qt=$('#tsQuit');if(qt)qt.onclick=()=>{TST=null;render(true)};
  if(!TST||TST.done)return;
  $$('#app .opt,#app .idk').forEach(b=>b.onclick=()=>{if(TST.ans!=null)return;const j=+b.dataset.j,q=TST.qs[TST.k];TST.ans=j<0?-1:j;
    if(j===q.a){TST.ok++;buzz(15)}else buzz([30,40,30]);render(true);
    setTimeout(()=>{if(!TST||route().v!=='test')return;TST.ans=null;TST.k++;
      if(TST.k>=TST.qs.length){const pass=TST.ok>=3;TST.res.push({step:TST.step,ok:TST.ok,pass});
        if(pass&&TST.step<6){TST.step++;TST.k=0;TST.ok=0;TST.qs=pick(stepPool(TST.step),4)}else return testFinish()}
      render(true)},j===q.a?550:1100)});
}
