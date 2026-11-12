/* ======================= 진도 동기화 · 복습(간격 반복) · 연속 학습 · TOPIK 모의고사 · 학생 진도(선생님) · 장소(지도) ======================= */
const ST2={
ja:{rev:'復習',revS:n=>n?`今日の復習 ${n}枚`:'今日の復習は完了！',streak:n=>`🔥 ${n}日連続`,revT:'復習カード',revLead:'間違えた問題と覚えた単語を、忘れるころにもう一度。',revStart:'復習をはじめる',revNone:'いま復習するカードはありません。レッスンやクイズを進めると自動で追加されます。',
 know:'わかった',dont:'わからなかった',show:'答えを見る',revDone:n=>`${n}枚 復習しました！`,again:'つづけて復習',total:n=>`登録カード ${n}枚`,
 mock:'TOPIK模擬テスト',mockS:'本番のように時間をはかって解く',mockLead:'このコースの問題から本番形式で出題します（参考スコア）。途中で答えは表示されません。',mI:'TOPIK I（1・2級）',mII:'TOPIK II（3〜6級）',mIs:'ステップ1〜3 · 40問 · 40分',mIIs:'ステップ4〜6 · 50問 · 50分',
 left:'残り',submit:'提出する',submitC:'もう一度押すと提出します',prev:'← 前へ',next:'次へ →',unans:n=>`未回答 ${n}問`,res:'模擬テスト結果',est:l=>l?`推定：${l}級相当`:'推定：級外（もう少し！）',byStep:'ステップ別の正答率',wrong:'間違えた問題',mHist:'これまでの記録',ref:'※コースの問題から作った参考スコアです。',
 sp:'学習の進度',spDone:n=>`修了 ${n}回`,spLast:'最近終えたレッスン',spQuiz:'クイズ平均',spWeak:'苦手な項目',spMock:'模擬テスト',spDays:n=>`学習日数 ${n}日`,spNone:'まだ同期された記録がありません',spUpd:'最終更新',
 synced:'学習記録を同期しました'},
ko:{rev:'복습',revS:n=>n?`오늘 복습 ${n}장`:'오늘 복습 완료!',streak:n=>`🔥 ${n}일 연속`,revT:'복습 카드',revLead:'틀린 문제와 외운 단어를 잊을 때쯤 다시 보여 줘요.',revStart:'복습 시작',revNone:'지금 복습할 카드가 없어요. 레슨과 퀴즈를 하면 자동으로 추가돼요.',
 know:'알았어요',dont:'몰랐어요',show:'답 보기',revDone:n=>`${n}장 복습했어요!`,again:'이어서 복습',total:n=>`등록 카드 ${n}장`,
 mock:'TOPIK 모의고사',mockS:'실전처럼 시간을 재고 풀기',mockLead:'이 코스의 문제로 실전 형식으로 출제해요 (참고 점수). 풀이 중에는 정답이 보이지 않아요.',mI:'TOPIK I (1·2급)',mII:'TOPIK II (3~6급)',mIs:'스텝 1~3 · 40문제 · 40분',mIIs:'스텝 4~6 · 50문제 · 50분',
 left:'남은 시간',submit:'제출하기',submitC:'한 번 더 누르면 제출돼요',prev:'← 이전',next:'다음 →',unans:n=>`안 푼 문제 ${n}개`,res:'모의고사 결과',est:l=>l?`추정: ${l}급 수준`:'추정: 급수 외 (조금만 더!)',byStep:'스텝별 정답률',wrong:'틀린 문제',mHist:'지난 기록',ref:'※ 코스 문제로 만든 참고 점수예요.',
 sp:'학습 진도',spDone:n=>`완료 ${n}회`,spLast:'최근 끝낸 레슨',spQuiz:'퀴즈 평균',spWeak:'약한 항목',spMock:'모의고사',spDays:n=>`공부한 날 ${n}일`,spNone:'아직 동기화된 기록이 없어요',spUpd:'마지막 업데이트',
 synced:'학습 기록을 동기화했어요'}};
const S2=()=>ST2[LANG];
const today=()=>{const d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*6e4)/864e5)};
const SRS_INT=[0,1,3,7,14,30,60];

/* ---------- 진도 동기화 ---------- */
const SYNC_KEYS=['done','visited','test','srs','qbest','mocks','days'];
function progLocal(){const got={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^kk-got-\d+$/.test(k))got[k.slice(7)]=store.get(k.slice(3),[])}}catch(e){}
  const o={got};SYNC_KEYS.forEach(k=>o[k]=store.get(k,k==='visited'||k==='srs'||k==='qbest'?{}:k==='test'?null:[]));return o}
function progMerge(a,b){
  const u=(x,y)=>[...new Set([...(x||[]),...(y||[])])];
  const o={done:u(a.done,b.done).sort((x,y)=>x-y),visited:{},got:{},srs:{...(a.srs||{})},qbest:{...(a.qbest||{})},days:u(a.days,b.days).sort((x,y)=>x-y).slice(-500)};
  for(const v of [a.visited||{},b.visited||{}])for(const n in v)o.visited[n]={...(o.visited[n]||{}),...v[n]};
  for(const g of [a.got||{},b.got||{}])for(const n in g)o.got[n]=u(o.got[n],g[n]);
  for(const k in b.srs||{})if(!o.srs[k]||(b.srs[k].t||0)>(o.srs[k].t||0))o.srs[k]=b.srs[k];
  for(const k in b.qbest||{})o.qbest[k]=Math.max(o.qbest[k]||0,b.qbest[k]);
  const ta=a.test,tb=b.test;o.test=!ta?tb||null:!tb?ta:(ta.at>=tb.at?ta:tb);
  const ms={};[...(a.mocks||[]),...(b.mocks||[])].forEach(m=>{if(m&&m.at)ms[m.at+m.type]=m});o.mocks=Object.values(ms).sort((x,y)=>x.at-y.at).slice(-40);
  return o}
let syncing=false,pushT=0,lastPushed='';
function progApply(o){
  done.splice(0,done.length,...o.done);rawSet('done',o.done);
  for(const n in o.visited)visited[n]=o.visited[n];rawSet('visited',visited);
  for(const n in o.got)rawSet('got-'+n,o.got[n]);
  ['test','srs','qbest','mocks','days'].forEach(k=>rawSet(k,o[k]));
}
const rawSet=(k,v)=>{try{localStorage.setItem('kk-'+k,JSON.stringify(v))}catch(e){}};
async function progSync(){
  if(!authed()||AUTH!=='in'||syncing||!navigator.onLine)return;syncing=true;
  try{const r=await api('GET','/progress'),loc0=progLocal(),m=progMerge(loc0,r.data||{});
    const before=JSON.stringify(loc0);progApply(m);const js=JSON.stringify(m);
    if(js!==JSON.stringify(r.data||{})){await api('PUT','/progress',{data:m});}
    lastPushed=js;if(before!==JSON.stringify(progLocal())&&route().v!=='print')render(true)}
  catch(e){}
  syncing=false}
function progPushSoon(){if(!authed()||AUTH!=='in')return;clearTimeout(pushT);pushT=setTimeout(async()=>{const d=progLocal(),js=JSON.stringify(d);if(js===lastPushed)return;try{await api('PUT','/progress',{data:d});lastPushed=js}catch(e){}},2500)}
let hooked=false;function hookStore(){if(hooked)return;hooked=true;const set0=store.set;store.set=(k,v)=>{set0(k,v);if(SYNC_KEYS.includes(k)||/^got-\d+$/.test(k))progPushSoon()}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')progSync()});

/* ---------- 연속 학습 · 복습 ---------- */
function markDay(){const d=store.get('days',[]),t=today();if(d[d.length-1]!==t){d.push(t);store.set('days',d.slice(-500))}}
function streak(){const d=new Set(store.get('days',[]));let t=today();if(!d.has(t))t--;let n=0;while(d.has(t)){n++;t--}return n}
function srsAdd(key,box=0){const s=store.get('srs',{});if(s[key]&&box===0){s[key].b=0;s[key].d=today();s[key].n=(s[key].n||0)+1;s[key].t=Date.now()}else if(!s[key])s[key]={b:box,d:today()+SRS_INT[box],n:box?0:1,t:Date.now()};else return;store.set('srs',s)}
function srsAddWords(no){const l=L.find(x=>x.no===no);if(!l)return;const s=store.get('srs',{});let ch=0;words(V(l)).forEach(w=>{const k='w:'+w.k;if(!s[k]){s[k]={b:1,d:today()+1,n:0,t:Date.now()};ch=1}});if(ch)store.set('srs',s)}
const srsDue=()=>{const s=store.get('srs',{}),t=today();return Object.keys(s).filter(k=>s[k].d<=t).sort((a,b)=>s[a].d-s[b].d||s[b].n-s[a].n)};
function srsItem(key){
  if(key.startsWith('w:')){const k=key.slice(2),w=ALLW.find(x=>x.k===k);return w?{type:'w',w}:null}
  const m=/^q:(\d+):(\d+)$/.exec(key);if(!m)return null;const l=L.find(x=>x.no===+m[1]);if(!l)return null;const q=V(l).quiz[+m[2]];return q?{type:'q',q,no:+m[1]}:null}
let RV=null;
function reviewCard(){if(teachView())return '';const n=srsDue().length,st=streak(),tot=Object.keys(store.get('srs',{})).length;if(!tot&&!st)return '';
  return `<a class="card rvc" href="#/review"><span class="ic">🔁</span><div><b>${S2().revS(n)}</b><small>${st?S2().streak(st)+' · ':''}${S2().total(tot)}</small></div>${n?`<span class="ub2">${n}</span>`:''}<span class="go">›</span></a>`}
function mockCard(){if(teachView())return '';return `<a class="card ttc mkc" href="#/mock"><span class="ic">📝</span><div><b>${S2().mock}</b><small>${S2().mockS}</small></div><span class="go">›</span></a>`}
function vReview(){
  const o=S2();
  if(!RV){const n=srsDue().length;return `<section class="card lhero" style="--c:var(--mint)"><span class="g">🔁</span><span class="no">${o.streak(streak())}</span><h1>${o.revT}</h1><div class="sub">${o.revLead}</div></section>
    ${n?`<button class="btn pink block cta2" id="rvGo">▶ ${o.revStart}（${n}）</button>`:`<div class="card empty2">${o.revNone}</div>`}`}
  if(RV.i>=RV.keys.length)return `<section class="card result" style="background:var(--mint)"><div class="stars">🎉</div><p>${o.revDone(RV.done)}</p><div class="btns">${srsDue().length?`<button class="btn pink block" id="rvMore">${o.again}</button>`:''}<a class="btn block" href="#/">${T().back||'OK'}</a></div></section>`;
  const it=srsItem(RV.keys[RV.i]);if(!it){RV.i++;return vReview()}
  const head=`<div class="qhead"><div class="bar"><i style="width:${RV.i/RV.keys.length*100}%"></i></div><b>${RV.i+1} / ${RV.keys.length}</b></div>`;
  if(it.type==='w')return `<div class="qwrap">${head}<div class="card rvw ${RV.open?'open':''}"><button class="big" lang="ko" data-say="${esc(it.w.k)}">${esc(it.w.k)} 🔊</button>
    ${RV.open?`<div class="mean">${esc(it.w.m)}</div>${it.w.p?`<div class="pr" lang="ko">［${esc(it.w.p)}］</div>`:''}<div class="rvb"><button class="btn" data-g="0">😣 ${o.dont}</button><button class="btn mint" data-g="1">😊 ${o.know}</button></div>`:`<button class="btn yellow block" id="rvShow">${o.show}</button>`}</div></div>`;
  const q=it.q,ans=RV.ans;
  return `<div class="qwrap">${head}<div class="card qcard"><span class="qn">${T().no(it.no)}</span><div class="qq">${esc(q.q)}</div>
    <div class="opts">${q.o.map((x,j)=>{let c='';if(ans!=null){c=j===q.a?'ok':j===ans?'ng':'dim'}return `<button class="opt ${c}" data-j="${j}" ${ans!=null?'disabled':''}${isKo(x)?' lang="ko"':''}><span class="l">${'ABCD'[j]}</span><span class="ot">${esc(x)}</span></button>`}).join('')}</div>
    ${ans!=null?`<div class="fb ${ans===q.a?'ok':'ng'}"><b>${ans===q.a?T().ok:T().ng}</b>${esc(q.e||'')}</div><button class="btn pink block" id="rvNext">${T().nextQ}</button>`:''}</div></div>`;
}
function srsGrade(key,ok){const s=store.get('srs',{}),x=s[key];if(!x)return;if(ok){x.b=Math.min(SRS_INT.length-1,(x.b||0)+1);x.d=today()+SRS_INT[x.b]}else{x.b=0;x.n=(x.n||0)+1;x.d=today()+1}x.t=Date.now();store.set('srs',s);markDay()}
function bindReview(){
  bindSay($('#app'));
  const g=$('#rvGo')||$('#rvMore');if(g)g.onclick=()=>{RV={keys:srsDue().slice(0,20),i:0,done:0,open:false,ans:null};render(true)};
  if(!RV)return;const key=RV.keys[RV.i];
  const sh=$('#rvShow');if(sh)sh.onclick=()=>{RV.open=true;render(true);const it=srsItem(key);if(it&&it.type==='w')say(it.w.k)};
  $$('#app [data-g]').forEach(b=>b.onclick=()=>{srsGrade(key,b.dataset.g==='1');RV.i++;RV.done++;RV.open=false;render(true)});
  $$('#app .opt').forEach(b=>b.onclick=()=>{const it=srsItem(key);RV.ans=+b.dataset.j;srsGrade(key,RV.ans===it.q.a);if(isKo(it.q.o[it.q.a]))say(it.q.o[it.q.a]);render(true)});
  const n=$('#rvNext');if(n)n.onclick=()=>{RV.i++;RV.done++;RV.ans=null;render(true)};
}

/* ---------- TOPIK 모의고사 ---------- */
let MK=null,mkTimer=0;
const MKT={I:{steps:[1,2,3],n:40,min:40,lv:[[.7,2],[.4,1]]},II:{steps:[4,5,6],n:50,min:50,lv:[[.77,6],[.63,5],[.5,4],[.4,3]]}};
function mockStart(type){const c=MKT[type];const per=Math.ceil(c.n/c.steps.length);let qs=[];c.steps.forEach(s=>pick(stepPool(s),per).forEach(q=>qs.push({...q,step:s})));qs=pick(qs,c.n);
  MK={type,qs,ans:Array(qs.length).fill(null),i:0,end:Date.now()+c.min*6e4,done:false};clearInterval(mkTimer);mkTimer=setInterval(mockTick,1000)}
function mockTick(){if(!MK||MK.done){clearInterval(mkTimer);return}const left=MK.end-Date.now();if(left<=0)return mockFinish();const el=$('#mkLeft');if(el)el.textContent=fmtLeft(left)}
const fmtLeft=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(s/60)}:${pad2(s%60)}`};
function mockFinish(){if(!MK||MK.done)return;clearInterval(mkTimer);const c=MKT[MK.type];let sc=0;const by={};
  MK.qs.forEach((q,i)=>{const ok=MK.ans[i]===q.a;if(ok)sc++;const b=by[q.step]=by[q.step]||[0,0];b[1]++;if(ok)b[0]++});
  const r=sc/MK.qs.length,lv=(c.lv.find(x=>r>=x[0])||[0,0])[1];Object.assign(MK,{done:true,score:sc,by,lvl:lv});
  const ms=store.get('mocks',[]);ms.push({type:MK.type,score:sc,total:MK.qs.length,lvl:lv,at:Math.floor(Date.now()/1000)});store.set('mocks',ms.slice(-40));markDay();
  if(route().v==='mock')render(true)}
function vMock(){
  const o=S2();
  if(!MK){const hist=store.get('mocks',[]).slice(-6).reverse();
    return `<section class="card lhero" style="--c:var(--orange)"><span class="g">📝</span><span class="no">TOPIK</span><h1>${o.mock}</h1><div class="sub">${o.mockLead}</div></section>
    <div class="mkch"><button class="card mkb" data-mk="I"><b>${o.mI}</b><small>${o.mIs}</small></button><button class="card mkb" data-mk="II"><b>${o.mII}</b><small>${o.mIIs}</small></button></div>
    ${hist.length?`<div class="h2"><span>${o.mHist}</span></div><div class="card mkh">${hist.map(m=>`<div><span>${new Date(m.at*1000).toLocaleDateString(loc())} · TOPIK ${m.type}</span><b>${m.score}/${m.total}</b><em>${m.lvl?m.lvl+(LANG==='ko'?'급':'級'):'—'}</em></div>`).join('')}</div>`:''}<p class="note">${o.ref}</p>`}
  if(MK.done){const wr=MK.qs.map((q,i)=>({q,i,a:MK.ans[i]})).filter(x=>x.a!==x.q.a);
    return `<section class="card result" style="background:var(--orange)"><p class="rt">${o.res} · TOPIK ${MK.type}</p><div class="sc">${MK.score}<span> / ${MK.qs.length}</span></div><p class="rr">${o.est(MK.lvl)}</p>
      <div class="tbars">${Object.entries(MK.by).map(([s,b])=>`<div class="tb ${b[0]/b[1]>=.6?'ok':'ng'}"><span>STEP ${s}</span><i style="--w:${b[0]/b[1]*100}%"></i><b>${Math.round(b[0]/b[1]*100)}%</b></div>`).join('')}</div>
      <div class="btns"><button class="btn pink block" id="mkAgain">↻ ${LANG==='ko'?'다시 보기':'もう一度'}</button><a class="btn block" href="#/review">🔁 ${o.rev}</a></div></section>
      ${wr.length?`<div class="h2"><span>${o.wrong} (${wr.length})</span></div><ol class="qkey">${wr.map(x=>`<li class="card"><b><span class="qn">Q${x.i+1}</span>${esc(x.q.q)}</b><div class="qo">${x.q.o.map((t,j)=>`<span class="${j===x.q.a?'ok':j===x.a?'ng':''}"${isKo(t)?' lang="ko"':''}>${'ABCD'[j]}. ${esc(t)}</span>`).join('')}</div>${x.q.e?`<small>${esc(x.q.e)}</small>`:''}</li>`).join('')}</ol>`:''}<p class="note">${o.ref}</p>`}
  const q=MK.qs[MK.i],un=MK.ans.filter(x=>x==null).length;
  return `<div class="mkbar card"><b>TOPIK ${MK.type}</b><span>⏱ ${o.left} <b id="mkLeft">${fmtLeft(MK.end-Date.now())}</b></span><span>${o.unans(un)}</span></div>
    <div class="card qcard"><span class="qn">Q${MK.i+1} / ${MK.qs.length}</span><div class="qq">${esc(q.q)}</div>
    <div class="opts">${q.o.map((x,j)=>`<button class="opt ${MK.ans[MK.i]===j?'sel':''}" data-j="${j}"${isKo(x)?' lang="ko"':''}><span class="l">${'ABCD'[j]}</span><span class="ot">${esc(x)}</span></button>`).join('')}</div>
    <div class="mknav"><button class="btn" id="mkPrev" ${MK.i?'':'disabled'}>${o.prev}</button><button class="btn" id="mkNext" ${MK.i<MK.qs.length-1?'':'disabled'}>${o.next}</button></div></div>
    <div class="mkgrid">${MK.qs.map((_,i)=>`<button class="${i===MK.i?'cur':''} ${MK.ans[i]!=null?'ans':''}" data-go="${i}">${i+1}</button>`).join('')}</div>
    <button class="btn pink block" id="mkSubmit">${o.submit}</button>`;
}
function bindMock(){
  $$('#app [data-mk]').forEach(b=>b.onclick=()=>{mockStart(b.dataset.mk);render(true);scrollTo(0,0)});
  const ag=$('#mkAgain');if(ag)ag.onclick=()=>{MK=null;render(true);scrollTo(0,0)};
  if(!MK||MK.done)return;
  $$('#app .opt').forEach(b=>b.onclick=()=>{MK.ans[MK.i]=+b.dataset.j;if(MK.i<MK.qs.length-1)MK.i++;render(true)});
  const p=$('#mkPrev');if(p)p.onclick=()=>{MK.i--;render(true)};const n=$('#mkNext');if(n)n.onclick=()=>{MK.i++;render(true)};
  $$('#app [data-go]').forEach(b=>b.onclick=()=>{MK.i=+b.dataset.go;render(true)});
  const s=$('#mkSubmit');s.onclick=()=>{if(MK.ans.some(x=>x==null)&&!armed('mk',s,S2().submitC))return;mockFinish();scrollTo(0,0)};
}

/* ---------- 선생님: 학생 진도 ---------- */
let SP={id:0,d:null,err:false};
async function loadSP(id){SP={id,d:null,err:false};try{SP.d=await api('GET',`/students/${id}/progress`)}catch(e){SP.err=true}if(route().v==='student')render(true)}
function vStudent(id){
  const o=S2();if(SP.id!==id)loadSP(id);if(SP.err)return emptyCard(S_().err);if(!SP.d)return '<div class="card"><div class="dl-bar"><i style="width:40%"></i></div></div>';
  const d=SP.d.data||{},st=SP.d.student,dn=d.done||[],qb=d.qbest||{},qv=Object.values(qb),srs=d.srs||{};
  const weak=Object.entries(srs).filter(([k,v])=>v.n>0).sort((a,b)=>b[1].n-a[1].n).slice(0,8).map(([k,v])=>{const it=srsItem(k);return it?(it.type==='w'?`${it.w.k}（${it.w.m}）`:`${T().no(it.no)}: ${it.q.q}`)+` ×${v.n}`:null}).filter(Boolean);
  const days=(d.days||[]).length,ms=(d.mocks||[]).slice(-5).reverse();
  return `<div class="card bkh">${peerHead(st)}</div>
  ${!SP.d.updatedAt?emptyCard(o.spNone):`<div class="spg"><div class="card"><b>${dn.length}</b><small>${LANG==='ko'?'완료한 레슨':'修了レッスン'}</small></div><div class="card"><b>${qv.length?Math.round(qv.reduce((a,b)=>a+b,0)/qv.length*100)+'%':'—'}</b><small>${o.spQuiz}</small></div><div class="card"><b>${days}</b><small>${LANG==='ko'?'공부한 날':'学習日数'}</small></div></div>
  <div class="h2"><span>${o.spLast}</span></div><div class="card sll">${dn.slice(-8).reverse().map(n=>{const l=L.find(x=>x.no===n);return l?`<a class="sprow" href="#/l/${n}"><span>${T().no(n)} ${esc(V(l).title)}</span>${qb[n]!=null?`<b>${Math.round(qb[n]*100)}%</b>`:''}</a>`:''}).join('')||'—'}</div>
  ${weak.length?`<div class="h2"><span>${o.spWeak}</span></div><div class="card sll"><ul class="ul">${weak.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></div>`:''}
  ${ms.length?`<div class="h2"><span>${o.spMock}</span></div><div class="card mkh">${ms.map(m=>`<div><span>${new Date(m.at*1000).toLocaleDateString(loc())} · TOPIK ${m.type}</span><b>${m.score}/${m.total}</b><em>${m.lvl||'—'}</em></div>`).join('')}</div>`:''}
  <p class="note">${o.spUpd}: ${new Date(SP.d.updatedAt*1000).toLocaleString(loc())}</p>`}`;
}

/* ---------- 장소 · 지도 (Leaflet + OpenStreetMap, 검색은 Nominatim) ---------- */
const PL_={ja:{online:'オンライン',offline:'対面',both:'オンライン・対面',modeQ:'レッスンの形式',places:'レッスンできる場所',addPlace:'＋ 場所を追加',pickT:'場所をえらぶ',search:'駅名・店名・住所で検索',searchB:'検索',here:'📍 現在地',tap:'地図をタップしてピンを立てることもできます',pname:'場所の名前（例：博多駅前のカフェ）',use:'この場所にする',none:'結果がありません',map:'地図',enter:'入室する',online2:'💻 オンライン',noPlace:'場所を選んでください',url:'ビデオ通話リンク（任意）',urlPh:'未入力ならプロフィールのリンク、なければ自動で作成',meetUrl:'いつものビデオ通話リンク（Zoom・Google Meetなど）',intro:'自己紹介（生徒に表示）',tags:'得意分野（カンマ区切り）',tagsPh:'例）会話, 発音, TOPIK',profile:'プロフィールを見る',all:'すべて',del:'削除',cancel:'閉じる',saved:'場所を保存しました',far:'地図を読み込めませんでした'},
 ko:{online:'온라인',offline:'대면',both:'온라인·대면',modeQ:'수업 방식',places:'수업 가능한 장소',addPlace:'＋ 장소 추가',pickT:'장소 고르기',search:'역 이름·가게 이름·주소로 검색',searchB:'검색',here:'📍 현재 위치',tap:'지도를 눌러 핀을 꽂을 수도 있어요',pname:'장소 이름 (예: 하카타역 앞 카페)',use:'이 장소로 정하기',none:'결과가 없어요',map:'지도',enter:'입장하기',online2:'💻 온라인',noPlace:'장소를 골라 주세요',url:'화상 통화 링크 (선택)',urlPh:'비워 두면 프로필 링크, 없으면 자동으로 만들어요',meetUrl:'자주 쓰는 화상 통화 링크 (Zoom·Google Meet 등)',intro:'자기소개 (학생에게 보여요)',tags:'잘하는 분야 (쉼표로 구분)',tagsPh:'예) 회화, 발음, TOPIK',profile:'프로필 보기',all:'전체',del:'삭제',cancel:'닫기',saved:'장소를 저장했어요',far:'지도를 불러오지 못했어요'}};
const PX=()=>PL_[LANG];
const gmap=p=>`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
const modeChip=(s)=>s.mode==='offline'&&s.place?`<span class="mchip off">📍 ${esc(s.place.name)}</span>`:`<span class="mchip on">💻 ${PX().online}</span>`;
const modesBadges=m=>{const p=PX();return `${m!=='offline'?`<span class="mchip on">💻 ${p.online}</span>`:''}${m!=='online'?`<span class="mchip off">📍 ${p.offline}</span>`:''}`};
let leafP=null;
function loadLeaflet(){if(window.L_&&window.L_.map)return Promise.resolve(window.L_);if(leafP)return leafP;
  leafP=new Promise((res,rej)=>{const c=document.createElement('link');c.rel='stylesheet';c.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';document.head.appendChild(c);
    const keep=window.L;const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    s.onload=()=>{window.L_=window.L;if(keep!==undefined)window.L=keep;res(window.L_)};s.onerror=()=>{leafP=null;rej(new Error('leaflet'))};document.head.appendChild(s)});
  return leafP}
function tiles(Lf,map){Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map)}
const pinIcon=Lf=>Lf.divIcon({className:'pin',html:'<span>📍</span>',iconSize:[34,34],iconAnchor:[17,32]});
async function miniMap(el,places){
  if(!el||!places.length)return;try{const Lf=await loadLeaflet();if(!el.isConnected)return;const map=Lf.map(el,{scrollWheelZoom:false,attributionControl:true});tiles(Lf,map);
    const ms=places.map(p=>Lf.marker([p.lat,p.lng],{icon:pinIcon(Lf)}).addTo(map).bindPopup(`<b>${esc(p.name)}</b><br>${esc(p.addr||'')}<br><a href="${gmap(p)}" target="_blank" rel="noopener">Google Maps</a>`));
    if(ms.length===1)map.setView([places[0].lat,places[0].lng],15);else map.fitBounds(Lf.latLngBounds(places.map(p=>[p.lat,p.lng])).pad(.25))}
  catch(e){el.innerHTML=`<p class="note">${PX().far}</p>`}
}
// 장소 고르기 (전체 화면 시트)
function pickPlace(start){return new Promise(async resolve=>{
  const o=PX(),ov=document.createElement('div');ov.className='sheet';
  ov.innerHTML=`<div class="sheet-in card"><div class="shh"><b>${o.pickT}</b><button class="ibtn sm" data-x aria-label="${o.cancel}">${icon.x}</button></div>
    <form class="pps"><input name="q" type="search" placeholder="${o.search}" enterkeyhint="search" autocomplete="off"><button class="btn sm sky" type="submit">${o.searchB}</button></form>
    <div class="ppr"></div><div class="ppm"></div><p class="note">${o.tap} · <button class="lnk" data-here>${o.here}</button></p>
    <input class="ppn" name="name" maxlength="60" placeholder="${o.pname}"><small class="ppa"></small>
    <button class="btn pink block" data-ok disabled>${o.use}</button></div>`;
  document.body.appendChild(ov);document.body.classList.add('noscroll');
  const close=v=>{ov.remove();document.body.classList.remove('noscroll');resolve(v)};
  ov.querySelector('[data-x]').onclick=()=>close(null);ov.onclick=e=>{if(e.target===ov)close(null)};
  let sel=start?{...start}:null,map,mk,Lf;
  const nm=ov.querySelector('.ppn'),ad=ov.querySelector('.ppa'),ok=ov.querySelector('[data-ok]'),rs=ov.querySelector('.ppr');
  const upd=()=>{ok.disabled=!(sel&&nm.value.trim());ad.textContent=sel&&sel.addr?sel.addr:''};nm.oninput=upd;
  const place=(lat,lng,name,addr,zoom)=>{sel={lat,lng,name:name||nm.value,addr:addr||''};if(name&&!nm.value)nm.value=name.slice(0,60);
    if(map){if(mk)mk.setLatLng([lat,lng]);else mk=Lf.marker([lat,lng],{icon:pinIcon(Lf),draggable:true}).addTo(map).on('dragend',e=>{const p=e.target.getLatLng();reverse(p.lat,p.lng)});map.setView([lat,lng],zoom||Math.max(map.getZoom(),16))}upd()};
  const nomi=async(path,qs)=>{const r=await fetch(`https://nominatim.openstreetmap.org/${path}?format=jsonv2&accept-language=${LANG==='ko'?'ko,ja':'ja'}&${qs}`);return r.json()};
  const reverse=async(lat,lng)=>{sel={...(sel||{}),lat,lng};upd();try{const j=await nomi('reverse',`lat=${lat}&lon=${lng}&zoom=18`);sel.addr=j.display_name||'';if(!nm.value&&j.name)nm.value=j.name.slice(0,60);upd()}catch(e){}};
  ov.querySelector('.pps').onsubmit=async e=>{e.preventDefault();const v=e.target.q.value.trim();if(!v)return;rs.innerHTML='<div class="dl-bar"><i style="width:40%"></i></div>';
    try{const j=await nomi('search',`q=${encodeURIComponent(v)}&limit=6&countrycodes=jp,kr`);
      rs.innerHTML=j.length?j.map((x,i)=>`<button type="button" class="ppi" data-i="${i}"><b>${esc(x.name||x.display_name.split(',')[0])}</b><small>${esc(x.display_name)}</small></button>`).join(''):`<p class="note">${o.none}</p>`;
      rs.querySelectorAll('.ppi').forEach(b=>b.onclick=()=>{const x=j[+b.dataset.i];rs.innerHTML='';nm.value='';place(+x.lat,+x.lon,x.name||x.display_name.split(',')[0],x.display_name,17)})}
    catch(err){rs.innerHTML=`<p class="note">${o.none}</p>`}};
  ov.querySelector('[data-here]').onclick=()=>navigator.geolocation&&navigator.geolocation.getCurrentPosition(p=>{nm.value='';place(p.coords.latitude,p.coords.longitude,'','',17);reverse(p.coords.latitude,p.coords.longitude)},()=>{},{timeout:8000});
  ok.onclick=()=>close({...sel,name:nm.value.trim()});
  try{Lf=await loadLeaflet();map=Lf.map(ov.querySelector('.ppm'));tiles(Lf,map);
    const c=start||(ME&&ME.places&&ME.places[0])||{lat:33.5902,lng:130.4207};map.setView([c.lat,c.lng],start?16:13);
    if(start){nm.value=start.name||'';place(start.lat,start.lng,start.name,start.addr,16)}
    map.on('click',e=>{reverse(e.latlng.lat,e.latlng.lng);place(e.latlng.lat,e.latlng.lng,'',sel&&sel.addr)});
    setTimeout(()=>map.invalidateSize(),200)}
  catch(e){ov.querySelector('.ppm').innerHTML=`<p class="note">${o.far}</p>`}
})}

/* ---------- 선생님 프로필 페이지 ---------- */
let TP={id:0,d:null,err:false};
async function loadTP(id){TP={id,d:null,err:false};try{TP.d=await api('GET','/teachers/'+id)}catch(e){TP.err=true}if(route().v==='teacher')render(true)}
function vTeacher(id){
  const o=S_(),p=PX();if(TP.id!==id)loadTP(id);if(TP.err)return emptyCard(o.err);if(!TP.d)return '<div class="card"><div class="dl-bar"><i style="width:40%"></i></div></div>';
  const x=TP.d,by={};(x.upcoming||[]).forEach(s=>{const k=fDay(s.start);(by[k]=by[k]||[]).push(s)});
  return `<section class="card tpro">${avatar(x,'xl')}<b class="mn">${esc(x.name)}</b>${x.rating!=null?`<span>${stars(x.rating)} ${x.rating} · ${BX().revN(x.reviews)}</span>`:''}<small>${esc(x.bio||'')}</small><div class="mchips">${modesBadges(x.modes)}</div>
    ${x.tags&&x.tags.length?`<div class="tags">${x.tags.map(t=>`<span>#${esc(t)}</span>`).join('')}</div>`:''}${tagChips(x.ptags)}${commonN(x.ptags)&&ME.id!==x.id?`<span class="cmn">💞 ${PFX().common(commonN(x.ptags))}</span>`:''}${snsLinks(x.sns)}</section>
  ${mediaBlock(x)}
  ${x.intro?`<div class="card tintro">${esc(x.intro).replace(/\n/g,'<br>')}</div>`:''}
  ${x.places&&x.places.length?`<div class="h2"><span>📍 ${p.places}</span></div><div class="card tmap"><div class="mapbox" id="tpMap"></div>${x.places.map(pl=>`<a class="plrow" href="${gmap(pl)}" target="_blank" rel="noopener"><b>${esc(pl.name)}</b><small>${esc(pl.addr||'')}</small></a>`).join('')}</div>`:''}
  ${Object.keys(by).length?`<div class="h2"><span>🗓 ${o.free(x.freeSlots)}</span></div><div class="card sll">${Object.entries(by).slice(0,7).map(([k,ls])=>`<div class="sld"><b>${k}</b><div>${ls.map(s=>`<span class="slc ${s.mode}">${fTime(s.start)}<small>${s.mode==='offline'&&s.place?'📍'+esc(s.place.name):'💻'}</small></span>`).join('')}</div></div>`).join('')}</div>`:''}
  ${revBlock(x.id)}
  ${x.match?`<a class="btn block pink" href="#/chat/${x.match.id}">💬 ${o.chat} · ${o.st[x.match.status]}</a>`:isStudentMe()?`<form class="apf card" data-id="${x.id}" style="padding:14px"><textarea name="message" maxlength="1000" rows="3" placeholder="${esc(o.applyPh)}"></textarea><button class="btn pink block" type="submit">${o.apply}</button></form>`:''}`;
}
function bindTeacher(){if(TP.d)miniMap($('#tpMap'),TP.d.places||[]);bindLessons();bindRev()}

/* ---------- 푸시 알림 설정 ---------- */
const NT={ja:{t:'通知',on:'プッシュ通知をオンにする',off:'通知をオフにする',onS:'メッセージ・予約・レッスン前のリマインダーをお知らせします',enabled:'通知はオンです 🔔',denied:'通知がブロックされています。ブラウザの設定から許可してください',ios:'iPhoneでは「ホーム画面に追加」したアプリから通知をオンにできます',unsup:'このブラウザは通知に対応していません'},
 ko:{t:'알림',on:'푸시 알림 켜기',off:'알림 끄기',onS:'메시지·예약·레슨 전 리마인더를 알려 드려요',enabled:'알림이 켜져 있어요 🔔',denied:'알림이 차단돼 있어요. 브라우저 설정에서 허용해 주세요',ios:'iPhone에서는 "홈 화면에 추가"한 앱에서 알림을 켤 수 있어요',unsup:'이 브라우저는 알림을 지원하지 않아요'}};
const NX=()=>NT[LANG];
const pushOK=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
let PUSHST=null;
async function pushState(){if(!pushOK())return 'unsup';if(Notification.permission==='denied')return 'denied';try{const r=await navigator.serviceWorker.getRegistration();const s=r&&await r.pushManager.getSubscription();return s?'on':'off'}catch(e){return 'off'}}
function pushCard(){if(!lessonsOn())return '';const o=NX(),st=PUSHST;
  if(st===null){pushState().then(v=>{PUSHST=v;const el=$('#pushBox');if(el)el.outerHTML=pushCard();bindPush()});return '<div id="pushBox"></div>'}
  const ios=isIOS&&!standalone();
  return `<div class="card pushc ${st}" id="pushBox"><span class="ic">🔔</span><div><b>${st==='on'?o.enabled:o.t}</b><small>${st==='denied'?o.denied:st==='unsup'?(ios?o.ios:o.unsup):o.onS}</small></div>
    ${st==='off'?`<button class="btn sm pink" id="pushOn">${o.on}</button>`:st==='on'?`<button class="lnk" id="pushOff">${o.off}</button>`:''}</div>`}
const b64ab=s=>{const b=atob((s+'='.repeat((4-s.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0))};
function bindPush(){
  const on=$('#pushOn');if(on)on.onclick=async()=>{on.disabled=true;try{
    if(await Notification.requestPermission()!=='granted'){PUSHST='denied';render(true);return}
    const reg=await navigator.serviceWorker.ready,{key}=await api('GET','/push');
    const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ab(key)});
    await api('POST','/push',{...sub.toJSON(),test:LANG});PUSHST='on';render(true)}catch(e){on.disabled=false;toast(A().err)}};
  const off=$('#pushOff');if(off)off.onclick=async()=>{try{const r=await navigator.serviceWorker.ready,s=await r.pushManager.getSubscription();if(s){await api('DELETE','/push',{endpoint:s.endpoint});await s.unsubscribe()}PUSHST='off';render(true)}catch(e){toast(A().err)}};
}

/* ---------- 수업 기록 · 숙제 ---------- */
const NO={ja:{t:'レッスン記録',empty:'まだ終わったレッスンはありません',summary:'今日やったこと',good:'よかった点',hw:'宿題',write:'記録を書く',save:'保存',hwSubmit:'宿題を提出',hwPh:'宿題の答えを書いてください',photo:'📷 写真を添付',fb:'先生からのフィードバック',fbPh:'フィードバックを書く',fbSave:'フィードバックを送る',noNote:'先生の記録を待っています',submitted:'提出済み',todoT:'記録を書くレッスン',todoS:'提出する宿題',todoFb:'フィードバック待ち',open:'記録を見る',sent:'送信しました',upcoming:'予定'},
 ko:{t:'수업 기록',empty:'아직 끝난 레슨이 없어요',summary:'오늘 한 내용',good:'잘한 점',hw:'숙제',write:'기록 쓰기',save:'저장',hwSubmit:'숙제 제출',hwPh:'숙제 답을 써 주세요',photo:'📷 사진 첨부',fb:'선생님 피드백',fbPh:'피드백 쓰기',fbSave:'피드백 보내기',noNote:'선생님 기록을 기다리고 있어요',submitted:'제출함',todoT:'기록을 쓸 레슨',todoS:'제출할 숙제',todoFb:'피드백 대기',open:'기록 보기',sent:'보냈어요',upcoming:'예정'}};
const NOX=()=>NO[LANG];
let NTS={id:0,d:null,err:false};
async function loadNotes(id){try{NTS={id,d:await api('GET',`/matches/${id}/notes`),err:false}}catch(e){NTS={id,d:null,err:true}}if(route().v==='notes')render(true)}
function vNotes(id){
  const o=NOX();if(NTS.id!==id){NTS={id,d:null,err:false};loadNotes(id)}
  if(NTS.err)return emptyCard(S_().err);if(!NTS.d)return '<div class="card"><div class="dl-bar"><i style="width:40%"></i></div></div>';
  const t=NTS.d.match.side==='teacher',ns=NTS.d.notes.filter(n=>n.booked);
  return `<div class="card bkh">${peerHead(NTS.d.match.peer,`<a class="btn sm" href="#/chat/${id}">💬</a>`)}</div>
  ${ns.length?ns.map(n=>{const fut=n.start>Date.now()/1000;return `<div class="card note" data-id="${n.id}">
    <div class="lw"><b>${fDay(n.start)}</b><span>${fTime(n.start)} · ${n.dur}${S_().min}</span>${modeChip(n)}${n.lessonNo?`<a class="mchip" href="#/l/${n.lessonNo}">📖 ${T().no(n.lessonNo)}</a>`:''}</div>
    ${t?`<form class="ntf" data-id="${n.id}"><label>${o.summary}<textarea name="summary" rows="2" maxlength="2000">${esc(n.summary)}</textarea></label><label>${o.good}<textarea name="good" rows="2" maxlength="1000">${esc(n.good)}</textarea></label><label>${o.hw}<textarea name="homework" rows="2" maxlength="1000">${esc(n.homework)}</textarea></label><button class="btn sm sky" type="submit">${o.save}</button></form>`
      :n.noteAt?`<dl class="ndl">${n.summary?`<dt>${o.summary}</dt><dd>${esc(n.summary)}</dd>`:''}${n.good?`<dt>${o.good}</dt><dd>${esc(n.good)}</dd>`:''}${n.homework?`<dt>✏️ ${o.hw}</dt><dd>${esc(n.homework)}</dd>`:''}</dl>`:`<p class="note">${fut?o.upcoming:o.noNote}</p>`}
    ${n.homework||n.hwAt?`<div class="hwb"><b>✏️ ${o.hw}${n.hwAt?` · ${o.submitted}`:''}</b>
      ${t?`${n.hwText?`<p>${esc(n.hwText).replace(/\n/g,'<br>')}</p>`:''}${n.hwImage?`<img class="hwimg" src="${n.hwImage}" alt="">`:''}${!n.hwAt?`<p class="note">—</p>`:''}`
        :`<form class="hwf" data-id="${n.id}"><textarea name="text" rows="3" maxlength="3000" placeholder="${o.hwPh}">${esc(n.hwText)}</textarea>${n.hwImage?`<img class="hwimg" src="${n.hwImage}" alt="">`:''}<div class="hwa"><label class="btn sm">${o.photo}<input type="file" accept="image/*" hidden data-hwimg="${n.id}"></label><button class="btn sm pink" type="submit">${o.hwSubmit}</button></div></form>`}</div>`:''}
    ${n.noteAt&&(n.hwAt||n.fbText)?`<div class="fbb"><b>💮 ${o.fb}</b>${t?`<form class="fbf" data-id="${n.id}"><textarea name="text" rows="2" maxlength="2000" placeholder="${o.fbPh}">${esc(n.fbText)}</textarea><button class="btn sm mint" type="submit">${o.fbSave}</button></form>`:n.fbText?`<p>${esc(n.fbText).replace(/\n/g,'<br>')}</p>`:''}</div>`:''}
  </div>`}).join(''):emptyCard(o.empty)}`;
}
async function shrinkImage(file,max=1600){const url=URL.createObjectURL(file),img=new Image();img.src=url;await img.decode();let w=img.naturalWidth,h=img.naturalHeight;const r=Math.min(1,max/Math.max(w,h));w=Math.round(w*r);h=Math.round(h*r);
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,w,h);g.drawImage(img,0,0,w,h);URL.revokeObjectURL(url);return new Promise(r2=>c.toBlob(r2,'image/jpeg',.85))}
function bindNotes(id){
  const o=NOX(),done=()=>{toast(o.sent);loadNotes(id);sumSoon()};
  $$('.ntf').forEach(f=>f.onsubmit=async e=>{e.preventDefault();try{await api('PUT',`/slots/${f.dataset.id}/note`,{summary:f.summary.value,good:f.good.value,homework:f.homework.value});done()}catch(err){toast(A().err)}});
  $$('.hwf').forEach(f=>f.onsubmit=async e=>{e.preventDefault();try{await api('POST',`/slots/${f.dataset.id}/homework`,{text:f.text.value});done()}catch(err){toast(A().err)}});
  $$('.fbf').forEach(f=>f.onsubmit=async e=>{e.preventDefault();try{await api('PUT',`/slots/${f.dataset.id}/feedback`,{text:f.text.value});done()}catch(err){toast(A().err)}});
  $$('[data-hwimg]').forEach(i=>i.onchange=async()=>{const f=i.files[0];if(!f)return;toast(S_().uploading);try{const ta=i.closest('form').text;if(ta&&ta.value.trim())await api('POST',`/slots/${i.dataset.hwimg}/homework`,{text:ta.value});const b=await shrinkImage(f);const r=await fetch(`/api/slots/${i.dataset.hwimg}/hwimage`,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'image/jpeg'},body:b});if(!r.ok)throw 0;done()}catch(e){toast(S_().photoErr)}});
}
let TODO=null;
async function loadTodo(){if(!lessonsOn())return;try{TODO=await api('GET','/todo');if(route().v==='lessons')render(true)}catch(e){}}
function todoBlock(){
  if(!TODO){return ''}const o=NOX(),t=isTeacherMe(),list=t?TODO.teacher:TODO.student;if(!list.length)return '';
  return `<div class="h2"><span>📒 ${t?o.todoT:o.todoS}</span><span class="tag">${list.length}</span></div>${list.map(s=>`<a class="card mrow todo" href="#/notes/${s.matchId}">${peerHead(s.with)}<p class="mn2">📅 ${esc(fWhen(s.start,s.dur))} · ${o.open} ›</p></a>`).join('')}`}

/* ======================= 배치3: 음성 · 말하기 연습 · 수강권 · 신고/차단 · 후기 · 관리자 · 캘린더 ======================= */
const B3={ja:{rec:'録音',stop:'停止',send:'送信',recNo:'マイクを使えません',voice:'音声',speak:'話す練習',speakS:'お手本を聞いて、まねして録音してみましょう',mine:'自分の声',model:'お手本',toT:'先生に送る',sentT:'先生に送りました',pick:'文をえらぶ',
  credits:n=>n==null?'回数券なし':`🎫 残り ${n}回`,cSet:'回数券',cOff:'使わない',cOn:'回数券を使う',noCredit:'回数券が残っていません。先生に相談してください',sysC:n=>`🎫 回数券：残り${n}回`,
  more:'その他',report:'通報する',reportPh:'理由を書いてください',reportSend:'通報して送信',block:'ブロック',unblock:'ブロック解除',blockedT:'ブロック中のため送れません',reported:'通報しました。運営が確認します',
  rev:'レビュー',revN:n=>`${n}件`,revW:'レビューを書く',revPh:'レッスンの感想（任意）',revSave:'投稿する',revDone:'レビューを投稿しました',noRev:'まだレビューはありません',
  ics:'カレンダーに追加',icsAll:'すべての予定をカレンダーへ',
  stats:'サービス状況',st:{users:'ユーザー',students:'学生',teachers:'先生',pending:'承認待ち',active7:'7日アクティブ',matches:'マッチング中',upcoming:'予定レッスン',done:'実施レッスン',msgs7:'7日メッセージ',reports:'未対応の通報',tests:'実力テスト'},
  reps:'通報',resolve:'対応済みにする',suspend:'利用停止',unsuspend:'停止解除',suspended:'停止中'},
 ko:{rec:'녹음',stop:'정지',send:'보내기',recNo:'마이크를 사용할 수 없어요',voice:'음성',speak:'말하기 연습',speakS:'원어민 음성을 듣고 따라 말해 녹음해 보세요',mine:'내 목소리',model:'원어민',toT:'선생님께 보내기',sentT:'선생님께 보냈어요',pick:'문장 고르기',
  credits:n=>n==null?'수강권 없음':`🎫 남은 ${n}회`,cSet:'수강권',cOff:'사용 안 함',cOn:'수강권 사용',noCredit:'남은 수강권이 없어요. 선생님과 상의해 주세요',sysC:n=>`🎫 수강권: 남은 ${n}회`,
  more:'더보기',report:'신고하기',reportPh:'이유를 적어 주세요',reportSend:'신고 보내기',block:'차단',unblock:'차단 해제',blockedT:'차단 중이라 보낼 수 없어요',reported:'신고했어요. 운영자가 확인할게요',
  rev:'후기',revN:n=>`${n}개`,revW:'후기 쓰기',revPh:'레슨 소감 (선택)',revSave:'올리기',revDone:'후기를 올렸어요',noRev:'아직 후기가 없어요',
  ics:'캘린더에 추가',icsAll:'모든 일정을 캘린더로',
  stats:'서비스 현황',st:{users:'사용자',students:'학생',teachers:'선생님',pending:'승인 대기',active7:'7일 활성',matches:'매칭 중',upcoming:'예정 레슨',done:'진행한 레슨',msgs7:'7일 메시지',reports:'미처리 신고',tests:'실력 테스트'},
  reps:'신고',resolve:'처리 완료',suspend:'이용 정지',unsuspend:'정지 해제',suspended:'정지됨'}};
const BX=()=>B3[LANG];
const stars=r=>r==null?'':`<span class="stars2">${'★'.repeat(Math.round(r))}${'☆'.repeat(5-Math.round(r))}</span>`;

/* ---------- 녹음기 ---------- */
let REC=null;
async function recStart(onTick){
  const st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
  const mt=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus','audio/webm'].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))||'';
  const mr=new MediaRecorder(st,mt?{mimeType:mt}:{}),chunks=[];mr.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  const t0=Date.now(),iv=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);onTick&&onTick(s);if(s>=120)recStop()},250);
  REC={mr,st,iv,t0,done:new Promise(res=>mr.onstop=()=>{clearInterval(iv);st.getTracks().forEach(t=>t.stop());const type=(mr.mimeType||'audio/webm').split(';')[0];res({blob:new Blob(chunks,{type}),sec:Math.round((Date.now()-t0)/1000),type})})};
  mr.start(250);return REC}
function recStop(){if(REC&&REC.mr.state!=='inactive')REC.mr.stop();const d=REC&&REC.done;REC=null;return d}
async function sendVoice(matchId,rec,text){const r=await fetch(`/api/matches/${matchId}/voice?sec=${rec.sec}${text?'&text='+encodeURIComponent(text):''}`,{method:'POST',credentials:'same-origin',headers:{'Content-Type':rec.type},body:rec.blob});if(!r.ok)throw Object.assign(new Error('voice'),{status:r.status})}

/* ---------- 채팅 확장: 음성 메시지 · 녹음 버튼 · 더보기(신고/차단) · 수강권 ---------- */
function voiceHTML(x){const me=x.from===ME.id,b=x.body||{};return `<div class="cm ${me?'me':''} ${me&&x.read?'rd':''}" data-id="${x.id}"><div class="cb vb">${b.text?`<small lang="ko">🎙 ${esc(b.text)}</small>`:`<small>🎙 ${BX().voice} · ${b.sec||0}s</small>`}<audio controls preload="none" src="/api/voice/${esc(b.f)}"></audio></div><time>${fTime(x.at)}${me?`<i class="rk">${S_().read}</i>`:''}</time></div>`}
function chatExtras(){
  const m=CH.m,o=BX(),t=m.side==='teacher';if(!m)return '';
  const cr=m.status==='accepted'?(t?`<div class="crd"><span>🎫 ${o.cSet}</span>${m.credits==null?`<button class="btn sm" data-cr="5">${o.cOn}</button>`:`<button class="btn sm" data-cr="${m.credits-1}" ${m.credits?'':'disabled'}>−</button><b>${m.credits}</b><button class="btn sm" data-cr="${m.credits+1}">＋</button><button class="lnk" data-cr="null">${o.cOff}</button>`}</div>`:m.credits!=null?`<div class="crd"><b>${o.credits(m.credits)}</b></div>`:''):'';
  return `${cr}<details class="more"><summary>⋯ ${o.more}</summary><div class="morein">${m.blocked?`<button class="btn sm" data-blk="0">${o.unblock}</button>`:`<button class="btn sm" data-blk="1">🚫 ${o.block}</button>`}
    <form class="repf"><textarea name="r" rows="2" maxlength="1000" placeholder="${o.reportPh}"></textarea><button class="btn sm" type="submit">⚠️ ${o.reportSend}</button></form></div></details>`}
function bindChatExtras(){
  const m=CH.m;if(!m)return;
  $$('#chead [data-cr]').forEach(b=>b.onclick=async()=>{const v=b.dataset.cr==='null'?null:+b.dataset.cr;try{CH.m=await api('PUT',`/matches/${m.id}/credits`,{credits:v});chatHead();chatPull()}catch(e){toast(A().err)}});
  $$('#chead [data-blk]').forEach(b=>b.onclick=async()=>{try{await api(b.dataset.blk==='1'?'POST':'DELETE','/block',{userId:m.peer.id});chatPull(true)}catch(e){toast(A().err)}});
  const rf=$('#chead .repf');if(rf)rf.onsubmit=async e=>{e.preventDefault();try{await api('POST','/report',{userId:m.peer.id,matchId:m.id,reason:rf.r.value});toast(BX().reported);rf.reset()}catch(err){toast(A().err)}};
}
function recButtonBind(){
  const f=$('#cin');if(!f||f.querySelector('.recb')||!navigator.mediaDevices||!window.MediaRecorder||!CH.m||CH.m.status!=='accepted')return;
  const b=document.createElement('button');b.type='button';b.className='btn recb';b.textContent='🎙';b.setAttribute('aria-label',BX().rec);f.insertBefore(b,f.firstChild);
  b.onclick=async()=>{if(REC){b.disabled=true;const r=await recStop();b.disabled=false;b.classList.remove('on');b.textContent='🎙';if(r.sec<1)return;try{await sendVoice(CH.id,r);chatPull()}catch(e){toast(A().err)}return}
    try{await recStart(s=>{b.textContent='⏹ '+s+'s'});b.classList.add('on')}catch(e){toast(BX().recNo)}};
}

/* ---------- 레슨 안 말하기 연습 ---------- */
function pSpeak(l){const p=PL(l.no);if(!p||!p.d||teachView())return '';const o=BX();
  return `<div class="blk"><h3>🎙 ${o.speak}</h3><div class="card spk" id="spk"><p class="note" style="margin:0">${o.speakS}</p><select id="spkSel" aria-label="${o.pick}">${p.d.map((x,i)=>`<option value="${i}">${esc(x[1])}</option>`).join('')}</select>
    <div class="spkb"><button class="btn sky" id="spkModel">▶ ${o.model}</button><button class="btn pink" id="spkRec">🎙 ${o.rec}</button></div><div id="spkOut"></div></div></div>`}
let SPK=null;
function bindSpeak(l){const sel=$('#spkSel');if(!sel)return;const o=BX(),p=PL(l.no),line=()=>p.d[+sel.value][1];
  $('#spkModel').onclick=e=>say(line(),e.currentTarget);
  const rb=$('#spkRec');rb.onclick=async()=>{if(REC){const r=await recStop();rb.textContent='🎙 '+o.rec;rb.classList.remove('on');SPK={...r,url:URL.createObjectURL(r.blob),text:line()};paint();return}
    try{await recStart(s=>{rb.textContent='⏹ '+o.stop+' '+s+'s'});rb.classList.add('on')}catch(e){toast(o.recNo)}};
  const paint=async()=>{const out=$('#spkOut');if(!out||!SPK)return;let ms=SOC.matches;if(lessonsOn()&&!ms){try{ms=SOC.matches=(await api('GET','/matches')).matches}catch(e){ms=[]}}
    const acc=(ms||[]).filter(m=>m.status==='accepted');
    out.innerHTML=`<div class="spkr"><span>${o.mine}</span><audio controls src="${SPK.url}"></audio></div>${acc.length?`<div class="spks">${acc.length>1?`<select id="spkTo">${acc.map(m=>`<option value="${m.id}">${esc(m.peer.name)}</option>`).join('')}</select>`:''}<button class="btn mint" id="spkSend">📤 ${o.toT}</button></div>`:''}`;
    const sb=$('#spkSend');if(sb)sb.onclick=async()=>{sb.disabled=true;try{await sendVoice(+(($('#spkTo')||{}).value||acc[0].id),SPK,SPK.text);toast(o.sentT)}catch(e){toast(A().err);sb.disabled=false}}};
}

/* ---------- 후기 ---------- */
let RVW={id:0,d:null};
async function loadRev(id){try{RVW={id,d:await api('GET',`/teachers/${id}/reviews`)}}catch(e){RVW={id,d:{reviews:[],canWrite:false}}}const el=$('#revBox');if(el){el.innerHTML=revInner();bindRev()}}
function revBlock(id){if(RVW.id!==id){RVW={id,d:null};loadRev(id)}return `<div class="h2"><span>⭐ ${BX().rev}</span></div><div id="revBox">${revInner()}</div>`}
function revInner(){const o=BX(),d=RVW.d;if(!d)return '<div class="card"><div class="dl-bar"><i style="width:40%"></i></div></div>';const mine=d.reviews.find(r=>r.mine);
  return `${d.canWrite?`<form class="card revf" id="revf"><div class="rstars">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="rating" value="${n}" ${mine&&mine.rating===n?'checked':''} required><span>★</span></label>`).join('')}</div><textarea name="text" rows="2" maxlength="1000" placeholder="${o.revPh}">${esc(mine?mine.text:'')}</textarea><button class="btn sm pink" type="submit">${o.revSave}</button></form>`:''}
  ${d.reviews.length?d.reviews.map(r=>`<div class="card revi">${stars(r.rating)}<b>${esc(r.name)}</b><small>${new Date(r.at*1000).toLocaleDateString(loc())}</small>${r.text?`<p>${esc(r.text)}</p>`:''}</div>`).join(''):emptyCard(o.noRev)}`}
function bindRev(){const f=$('#revf');if(f)f.onsubmit=async e=>{e.preventDefault();const r=(f.querySelector('[name=rating]:checked')||{}).value;if(!r)return;try{await api('POST',`/teachers/${RVW.id}/reviews`,{rating:+r,text:f.text.value});toast(BX().revDone);loadRev(RVW.id)}catch(err){toast(A().err)}}}

/* ---------- 캘린더(.ics) ---------- */
function icsFor(list){const z=d=>new Date(d*1000).toISOString().replace(/[-:]/g,'').replace(/\.\d+/,''),e=t=>String(t||'').replace(/[\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//guruguru//lessons//JA',...list.flatMap(s=>['BEGIN:VEVENT',`UID:gg-slot-${s.id}@guruguru.app`,`DTSTAMP:${z(Date.now()/1000)}`,`DTSTART:${z(s.start)}`,`DTEND:${z(s.start+s.dur*60)}`,
    `SUMMARY:${e((LANG==='ko'?'한국어 레슨':'韓国語レッスン')+(s.with?' · '+s.with.name:''))}`,s.place?`LOCATION:${e(s.place.name+(s.place.addr?' '+s.place.addr:''))}`:s.url?`LOCATION:${e(s.url)}`:'',s.url?`URL:${s.url}`:'','BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:Lesson','END:VALARM','END:VEVENT'].filter(Boolean)),'END:VCALENDAR'].join('\r\n')}
function dlICS(list,name){const b=new Blob([icsFor(list)],{type:'text/calendar'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}

/* ---------- 관리자 확장 ---------- */
let ADM={stats:null,reports:null};
async function loadAdm(){try{const [s,r]=await Promise.all([api('GET','/admin/stats'),api('GET','/admin/reports')]);ADM={stats:s,reports:r.reports}}catch(e){}if(route().v==='admin'){const el=$('#admX');if(el){el.innerHTML=admInner();bindAdm()}}}
function adminExtra(){if(!ADM.stats)loadAdm();return `<div id="admX">${admInner()}</div>`}
function admInner(){const o=BX();if(!ADM.stats)return '';const s=ADM.stats;
  return `<div class="h2 first"><span>📊 ${o.stats}</span></div><div class="stg">${Object.keys(o.st).map(k=>`<div class="card ${k==='reports'&&s[k]?'warn':''}"><b>${s[k]}</b><small>${o.st[k]}</small></div>`).join('')}</div>
  ${ADM.reports&&ADM.reports.length?`<div class="h2"><span>⚠️ ${o.reps}</span></div>${ADM.reports.slice(0,20).map(r=>`<div class="card rep ${r.resolved?'ok':''}"><small>${new Date(r.at*1000).toLocaleString(loc())}</small><b>${esc(r.reporter.name||'—')} → ${esc(r.target.name||'—')} <small>${esc(r.target.email||'')}</small></b><p>${esc(r.reason||'—')}</p>${r.resolved?'':`<button class="btn sm" data-rres="${r.id}">${o.resolve}</button>`}</div>`).join('')}`:''}`}
function bindAdm(){$$('[data-rres]').forEach(b=>b.onclick=async()=>{try{await api('POST','/admin/reports/'+b.dataset.rres,{});loadAdm()}catch(e){toast(A().err)}})}

/* ======================= 배치4: 태그(매칭앱식) · 소개 사진/영상 · SNS ======================= */
const TAGC=[['personality',{ja:'性格',ko:'성격'},[['cheerful','明るい','밝은'],['calm','落ち着いた','차분한'],['talkative','おしゃべり','수다쟁이'],['listener','聞き上手','잘 들어주는'],['kind','やさしい','다정한'],['funny','ユーモア','유머러스'],['passion','熱血','열정적'],['careful','しっかり者','꼼꼼한'],['mypace','マイペース','마이페이스'],['shy','人見知り','낯가림']]],
 ['interest',{ja:'好きなこと',ko:'관심사'},[['kpop','K-POP','K-POP'],['drama','ドラマ','드라마'],['movie','映画','영화'],['anime','アニメ','애니'],['webtoon','ウェブトゥーン','웹툰'],['music','音楽','음악'],['food','グルメ','맛집'],['cooking','料理','요리'],['travel','旅行','여행'],['cafe','カフェ巡り','카페 투어'],['game','ゲーム','게임'],['sports','スポーツ','스포츠'],['books','読書','독서'],['photo','写真','사진'],['fashion','ファッション','패션'],['beauty','美容','뷰티']]],
 ['style',{ja:'学び方',ko:'배우는 방식'},[['slow','ゆっくり丁寧','천천히 차근차근'],['talk','たくさん話したい','말을 많이'],['grammar','文法しっかり','문법 탄탄'],['pron','発音重視','발음 중시'],['chat','楽しく雑談','즐거운 수다'],['hw','宿題ほしい','숙제 좋아요'],['topik','TOPIK対策','TOPIK 대비'],['biz','ビジネス','비즈니스'],['kids','子ども向け','어린이']]],
 ['time',{ja:'都合のいい時間',ko:'편한 시간'},[['morning','朝','아침'],['daytime','昼間','낮'],['evening','平日の夜','평일 저녁'],['weekend','週末','주말']]]];
const TAGL={};TAGC.forEach(c=>c[2].forEach(t=>TAGL[t[0]]={ja:t[1],ko:t[2],cat:c[0]}));
const tagName=id=>TAGL[id]?TAGL[id][LANG]:id;
const PF={ja:{tags:'わたしのタグ',tagsS:'性格・好きなこと・学び方をえらぶと、相性のいい相手が見つかりやすくなります',common:n=>`共通 ${n}`,photos:'紹介写真',photosS:'授業の様子や自分らしい写真（最大6枚）',addPhoto:'＋ 写真',video:'自己紹介動画',videoS:'60秒以内のショート動画（任意）',addVideo:'＋ 動画をアップロード',delVideo:'動画を削除',tooLong:'60秒以内の動画にしてください',tooBig:'ファイルが大きすぎます（40MBまで）',sns:'SNS',snsS:'Instagram などのリンク（任意）',web:'ブログ・サイト（https://）',yt:'YouTube（https://）',media:'写真・動画'},
 ko:{tags:'나의 태그',tagsS:'성격·관심사·배우는 방식을 고르면 잘 맞는 상대를 찾기 쉬워져요',common:n=>`공통 ${n}`,photos:'소개 사진',photosS:'수업 모습이나 나다운 사진 (최대 6장)',addPhoto:'＋ 사진',video:'자기소개 영상',videoS:'60초 이내 짧은 영상 (선택)',addVideo:'＋ 영상 올리기',delVideo:'영상 삭제',tooLong:'60초 이내 영상으로 해 주세요',tooBig:'파일이 너무 커요 (40MB까지)',sns:'SNS',snsS:'Instagram 등 링크 (선택)',web:'블로그·사이트 (https://)',yt:'YouTube (https://)',media:'사진·영상'}};
const PFX=()=>PF[LANG];
const myTags=()=>new Set((ME&&ME.ptags)||[]);
const commonN=tags=>{const m=myTags();return (tags||[]).filter(t=>m.has(t)).length};
function tagChips(tags,max=99){const m=myTags();const ts=[...(tags||[])].sort((a,b)=>m.has(b)-m.has(a)).slice(0,max);return ts.length?`<div class="ptags">${ts.map(t=>`<span class="pt ${m.has(t)&&ME&&ME.ptags!==tags?'same':''} c-${TAGL[t]?TAGL[t].cat:''}">${esc(tagName(t))}</span>`).join('')}${(tags||[]).length>max?`<span class="pt more">+${tags.length-max}</span>`:''}</div>`:''}
function tagPicker(sel){const s=new Set(sel||[]);return `<div class="fl"><span>🏷 ${PFX().tags}</span><small class="fls">${PFX().tagsS}</small>${TAGC.map(c=>`<div class="tpg"><b>${c[1][LANG]}</b><div class="tpc">${c[2].map(t=>`<label class="tpk c-${c[0]}"><input type="checkbox" name="ptags" value="${t[0]}" ${s.has(t[0])?'checked':''}><span>${LANG==='ko'?t[2]:t[1]}</span></label>`).join('')}</div></div>`).join('')}</div>`}
function snsFields(sn){sn=sn||{};const p=PFX();return `<div class="fl"><span>🔗 ${p.sns}</span><small class="fls">${p.snsS}</small><div class="snsf">
  <label><i>Instagram @</i><input name="sns_instagram" maxlength="30" value="${esc(sn.instagram||'')}" autocapitalize="off"></label>
  <label><i>X @</i><input name="sns_x" maxlength="15" value="${esc(sn.x||'')}" autocapitalize="off"></label>
  <label><i>TikTok @</i><input name="sns_tiktok" maxlength="24" value="${esc(sn.tiktok||'')}" autocapitalize="off"></label>
  <label><i>${p.yt}</i><input name="sns_youtube" type="url" maxlength="200" value="${esc(sn.youtube||'')}"></label>
  <label><i>${p.web}</i><input name="sns_web" type="url" maxlength="200" value="${esc(sn.web||'')}"></label></div></div>`}
const SNSI={instagram:['📸','Instagram',h=>`https://www.instagram.com/${h}/`],x:['𝕏','X',h=>`https://x.com/${h}`],tiktok:['🎵','TikTok',h=>`https://www.tiktok.com/@${h}`],youtube:['▶️','YouTube',u=>u],web:['🌐','Web',u=>u]};
function snsLinks(sn){sn=sn||{};const ks=Object.keys(SNSI).filter(k=>sn[k]);return ks.length?`<div class="snsl">${ks.map(k=>`<a class="btn sm" href="${esc(SNSI[k][2](sn[k]))}" target="_blank" rel="noopener nofollow">${SNSI[k][0]} ${SNSI[k][1]}</a>`).join('')}</div>`:''}
function mediaBlock(x){const g=x.gallery||[];return `${x.video?`<div class="card tvid"><video src="${esc(x.video)}" controls playsinline preload="metadata"></video></div>`:''}${g.length?`<div class="gal">${g.map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="" loading="lazy"></a>`).join('')}</div>`:''}`}
function mediaEditor(u){if(u.role!=='teacher')return '';const p=PFX(),g=u.gallery||[];
  return `<div class="h2"><span>🖼 ${p.media}</span></div><section class="card medit">
    <b>${p.photos}</b><small>${p.photosS}</small><div class="gal ed">${g.map(x=>`<span><img src="${esc(x)}" alt=""><button data-gdel="${esc(x.split('/').pop())}" aria-label="del">×</button></span>`).join('')}${g.length<6?`<label class="gadd">${p.addPhoto}<input type="file" accept="image/*" multiple hidden id="galIn"></label>`:''}</div>
    <b>${p.video}</b><small>${p.videoS}</small>${u.video?`<video src="${esc(u.video)}" controls playsinline preload="metadata"></video><button class="lnk danger" id="vidDel">${p.delVideo}</button>`:''}<label class="btn sm">${p.addVideo}<input type="file" accept="video/mp4,video/quicktime,video/webm" hidden id="vidIn"></label>
  </section>`}
function bindMedia(){
  const gi=$('#galIn');if(gi)gi.onchange=async()=>{for(const f of [...gi.files].slice(0,6-((ME.gallery||[]).length))){toast(S_().uploading);try{const b=await shrinkImage(f,1280);const r=await fetch('/api/me/gallery',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'image/jpeg'},body:b});if(!r.ok)throw 0;setMe(await r.json())}catch(e){toast(S_().photoErr)}}render(true)};
  $$('[data-gdel]').forEach(b=>b.onclick=async()=>{try{setMe(await api('DELETE','/me/gallery/'+b.dataset.gdel));render(true)}catch(e){toast(A().err)}});
  const vd=$('#vidDel');if(vd)vd.onclick=async()=>{try{setMe(await api('DELETE','/me/video'));render(true)}catch(e){toast(A().err)}};
  const vi=$('#vidIn');if(vi)vi.onchange=async()=>{const f=vi.files[0];if(!f)return;const p=PFX();if(f.size>40*1024*1024)return toast(p.tooBig);
    const dur=await new Promise(res=>{const v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=()=>{res(v.duration);URL.revokeObjectURL(v.src)};v.onerror=()=>res(0);v.src=URL.createObjectURL(f)});
    if(dur>61)return toast(p.tooLong);toast(S_().uploading);
    const type=/quicktime|\.mov$/i.test(f.type||f.name)?'video/quicktime':/webm/.test(f.type)?'video/webm':'video/mp4';
    try{const r=await fetch('/api/me/video',{method:'POST',credentials:'same-origin',headers:{'Content-Type':type},body:f});if(!r.ok)throw 0;setMe(await r.json());toast(A().saved);render(true)}catch(e){toast(A().err)}};
}
