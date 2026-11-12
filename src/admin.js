/* ======================= 관리자 콘솔 (#/admin, 도메인/admin 은 여기로 이동) ======================= */
const AD={
ja:{t:'管理コンソール',tabs:{dash:'ダッシュボード',users:'会員',matches:'マッチング・レッスン',reports:'通報',logs:'記録'},search:'名前・メールで検索',all:'すべて',
 f:{student:'学生',teacher:'先生',pending:'承認待ち',suspended:'停止中',admin:'管理者'},grades:{normal:'一般',silver:'シルバー',gold:'ゴールド',vip:'VIP'},grade:'会員等級',memo:'管理メモ（本人には見えません）',memoSave:'メモを保存',
 created:'登録',last:'最終ログイン',signups:'新規登録（30日）',pendingT:'承認待ちの先生',recentLogin:'最近のログイン',approve:'承認',reject:'不承認',toStu:'学生にする',suspend:'利用停止',unsuspend:'停止解除',
 makeAdmin:'管理者にする',removeAdmin:'管理者を外す',profile:'プロフィール',tests:'実力テスト履歴',prog:'学習記録',matches:'マッチング',lessons:'レッスン',revGot:'受けたレビュー',revGave:'書いたレビュー',reports:'通報',logins:'ログイン履歴',
 done:'修了',days:'学習日',cards:'復習カード',none:'なし',actions:'管理者の操作',loginLog:'ログイン記録',msgs:'メッセージ',upcoming:'予定',past:'実施済み',resolve:'対応済みにする',resolved:'対応済み',open:'未対応',
 act:{approve:'先生承認',reject:'先生不承認',student:'学生に変更',suspend:'利用停止',unsuspend:'停止解除',grade:'等級変更',memo:'メモ',makeAdmin:'管理者任命',removeAdmin:'管理者解除',resolveReport:'通報対応'},n:n=>`${n}件`,users:n=>`${n}人`,view:'詳細'},
ko:{t:'관리 콘솔',tabs:{dash:'대시보드',users:'회원',matches:'매칭·레슨',reports:'신고',logs:'기록'},search:'이름·이메일로 검색',all:'전체',
 f:{student:'학생',teacher:'선생님',pending:'승인 대기',suspended:'정지됨',admin:'관리자'},grades:{normal:'일반',silver:'실버',gold:'골드',vip:'VIP'},grade:'회원 등급',memo:'관리 메모 (본인에게는 안 보여요)',memoSave:'메모 저장',
 created:'가입',last:'마지막 로그인',signups:'신규 가입 (30일)',pendingT:'승인 대기 선생님',recentLogin:'최근 로그인',approve:'승인',reject:'반려',toStu:'학생으로',suspend:'이용 정지',unsuspend:'정지 해제',
 makeAdmin:'관리자로 지정',removeAdmin:'관리자 해제',profile:'프로필',tests:'실력 테스트 기록',prog:'학습 기록',matches:'매칭',lessons:'레슨',revGot:'받은 후기',revGave:'쓴 후기',reports:'신고',logins:'로그인 기록',
 done:'완료',days:'공부한 날',cards:'복습 카드',none:'없음',actions:'관리자 작업',loginLog:'로그인 기록',msgs:'메시지',upcoming:'예정',past:'진행함',resolve:'처리 완료',resolved:'처리됨',open:'미처리',
 act:{approve:'선생님 승인',reject:'선생님 반려',student:'학생으로 변경',suspend:'이용 정지',unsuspend:'정지 해제',grade:'등급 변경',memo:'메모',makeAdmin:'관리자 지정',removeAdmin:'관리자 해제',resolveReport:'신고 처리'},n:n=>`${n}건`,users:n=>`${n}명`,view:'상세'}};
const ADX=()=>AD[LANG];
let ADC={users:null,detail:null,did:0,matches:null,lessons:null,logs:null,q:'',f:'all'};
const fdt=t=>t?new Date(t*1000).toLocaleString(loc(),{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
const fd=t=>t?new Date(t*1000).toLocaleDateString(loc()):'—';
const gradeB=g=>g&&g!=='normal'?`<span class="gb g-${g}">${ADX().grades[g]}</span>`:'';
async function adLoad(k){try{
  if(k==='users')ADC.users=(await api('GET','/admin/users')).users;
  if(k==='detail')ADC.detail=await api('GET','/admin/users/'+ADC.did);
  if(k==='matches'){const [a,b]=await Promise.all([api('GET','/admin/matches'),api('GET','/admin/lessons')]);ADC.matches=a.matches;ADC.lessons=b.lessons}
  if(k==='logs')ADC.logs=await api('GET','/admin/logs');
  if(k==='dash'){await loadAdm();if(!ADC.users)ADC.users=(await api('GET','/admin/users')).users;if(!ADC.logs)ADC.logs=await api('GET','/admin/logs')}
}catch(e){toast(A().err)}if(route().v==='admin')render(true)}
const spin='<div class="card"><div class="dl-bar"><i style="width:40%"></i></div></div>';
function vAdmin(){
  const r=route(),o=ADX(),tab=r.sub==='u'?'users':(r.sub||'dash');
  const nav=`<div class="h2 first"><span>🛡 ${o.t}</span></div><div class="fchips adtabs">${Object.entries(o.tabs).map(([k,v])=>`<a href="#/admin${k==='dash'?'':'/'+k}" class="${k===tab?'on':''}">${v}</a>`).join('')}</div>`;
  let body='';
  if(r.sub==='u'){if(ADC.did!==r.id){ADC.did=r.id;ADC.detail=null;adLoad('detail')}body=ADC.detail?adUser(ADC.detail):spin}
  else if(tab==='users'){if(!ADC.users)adLoad('users');body=ADC.users?adUsers():spin}
  else if(tab==='matches'){if(!ADC.matches)adLoad('matches');body=ADC.matches?adMatches():spin}
  else if(tab==='reports'){if(!ADM.reports)loadAdm();body=adReports()}
  else if(tab==='logs'){if(!ADC.logs)adLoad('logs');body=ADC.logs?adLogs():spin}
  else{if(!ADM.stats||!ADC.users||!ADC.logs)adLoad('dash');body=ADM.stats&&ADC.users?adDash():spin}
  return nav+body;
}
function adDash(){const o=ADX(),s=ADM.stats,su=s.signups||[],mx=Math.max(1,...su.map(x=>x.n)),pend=ADC.users.filter(u=>u.teacherStatus==='pending');
  return `${admInner().replace(/<div class="h2 first">[\s\S]*?<\/div>/,'').replace(/<div class="h2"><span>⚠️[\s\S]*$/,'')}
  <div class="h2"><span>📈 ${o.signups}</span></div><div class="card bars">${su.length?su.map(x=>`<div title="${x.d}: ${x.n}"><i style="height:${x.n/mx*100}%"></i><small>${x.d.slice(5)}</small></div>`).join(''):`<p class="note">${o.none}</p>`}</div>
  ${pend.length?`<div class="h2"><span>⏳ ${o.pendingT}</span><span class="tag">${pend.length}</span></div>${pend.map(adRow).join('')}`:''}
  ${ADC.logs?`<div class="h2"><span>🔑 ${o.recentLogin}</span></div><div class="card adl">${ADC.logs.logins.slice(0,10).map(l=>`<a href="#/admin/u/${l.uid}"><b>${esc(l.name||l.email)}</b><span>${fdt(l.at)}</span></a>`).join('')}</div>`:''}`}
function adRow(u){const o=ADX();return `<a class="card urow2" href="#/admin/u/${u.id}">${avatar(u)}<div class="ui"><b>${esc(u.name||'—')} ${gradeB(u.grade)}</b><small>${esc(u.email)}</small><div class="rbs">${roleBadges(u)}${u.suspended?`<span class="rb st-rejected">${o.f.suspended}</span>`:''}</div></div><small class="ul">${o.last}<br>${fd(u.lastLogin)}</small></a>`}
function adFilter(u){const f=ADC.f,q=ADC.q.trim().toLowerCase();
  if(q&&!(`${u.name} ${u.email}`.toLowerCase().includes(q)))return false;
  return f==='all'||(f==='student'&&u.role==='student')||(f==='teacher'&&u.role==='teacher'&&u.teacherStatus==='approved')||(f==='pending'&&u.teacherStatus==='pending')||(f==='suspended'&&u.suspended)||(f==='admin'&&u.admin)||(f.startsWith('g-')&&(u.grade||'normal')===f.slice(2))}
function adUsers(){const o=ADX(),list=ADC.users.filter(adFilter);
  return `<label class="search"><span aria-hidden="true">🔍</span><input id="adQ" type="search" placeholder="${o.search}" value="${esc(ADC.q)}" autocomplete="off"></label>
  <div class="fchips adf">${[['all',o.all],...Object.entries(o.f),...Object.entries(o.grades).filter(([k])=>k!=='normal').map(([k,v])=>['g-'+k,'★ '+v])].map(([k,v])=>`<button data-af="${k}" class="${ADC.f===k?'on':''}">${v}</button>`).join('')}</div>
  <p class="wcount">${o.users(list.length)}</p><div id="adList">${list.map(adRow).join('')||`<p class="empty">${o.none}</p>`}</div>`}
function adSec(t,inner){return `<div class="h2"><span>${t}</span></div><div class="card adsec">${inner}</div>`}
function adUser(d){const o=ADX(),u=d.user,a=A(),me=ME;
  const kv=(k,v)=>v?`<div><span>${k}</span><b>${v}</b></div>`:'';
  return `<a class="lnk" href="#/admin/users">← ${o.tabs.users}</a>
  <section class="card mecard">${avatar(u,'lg')}<div><b class="mn">${esc(u.name||'—')} ${gradeB(u.grade)}</b><small>${esc(u.email)}${u.googleName?' · '+esc(u.googleName):''}</small><div class="rbs">${roleBadges(u)}${u.suspended?`<span class="rb st-rejected">${o.f.suspended}</span>`:''}</div>
    <small>${o.created} ${fd(u.createdAt)} · ${o.last} ${fdt(u.lastLogin)}</small></div></section>
  <section class="card adact">
    <label><span>${o.grade}</span><select id="adGrade">${Object.entries(o.grades).map(([k,v])=>`<option value="${k}" ${u.grade===k?'selected':''}>${v}</option>`).join('')}</select></label>
    <div class="ua">${u.role==='teacher'&&u.teacherStatus!=='approved'?`<button class="btn sm mint" data-ua="approve">${o.approve}</button>`:''}${u.role==='teacher'&&u.teacherStatus==='pending'?`<button class="btn sm" data-ua="reject">${o.reject}</button>`:''}${u.role==='teacher'&&!u.admin?`<button class="btn sm" data-ua="student">${o.toStu}</button>`:''}
      ${u.admin||u.superAdmin?'':u.suspended?`<button class="btn sm" data-ua="unsuspend">${o.unsuspend}</button>`:`<button class="btn sm ghost" data-ua="suspend">${o.suspend}</button>`}
      ${ME&&ME.superAdmin&&!u.superAdmin?(u.admin?`<button class="btn sm" data-ua="removeAdmin">${o.removeAdmin}</button>`:`<button class="btn sm yellow" data-ua="makeAdmin">🛡 ${o.makeAdmin}</button>`):''}</div>
    <label><span>${o.memo}</span><textarea id="adMemo" rows="3" maxlength="2000">${esc(u.memo||'')}</textarea></label><button class="btn sm" id="adMemoSave">${o.memoSave}</button></section>
  ${adSec('👤 '+o.profile,`<div class="mekv">${kv(a.level,esc(a.levels[u.level]||''))}${kv(a.goal,esc(u.goal))}${kv(a.bio,esc(u.bio))}${kv(PX().intro,esc(u.intro||'').replace(/\n/g,'<br>'))}${u.role==='teacher'?kv(PX().modeQ,PX()[u.modes||'online']):''}${kv(PX().places,(u.places||[]).map(p=>esc(p.name)).join(', '))}${kv(PX().meetUrl,u.meetUrl?esc(u.meetUrl):'')}</div>${tagChips(u.ptags)}${(u.tags||[]).length?`<div class="tags">${u.tags.map(t=>`<span>#${esc(t)}</span>`).join('')}</div>`:''}${snsLinks(u.sns)}${mediaBlock(u)}`)}
  ${adSec('🧪 '+o.tests,d.tests.length?d.tests.map(t=>`<div class="adr"><span>${fdt(t.at)}</span><b>STEP ${t.step}</b><em>${t.score}/${t.total}</em></div>`).join(''):o.none)}
  ${adSec('📚 '+o.prog,`<div class="spg"><div class="card"><b>${d.progress.done}</b><small>${o.done}</small></div><div class="card"><b>${d.progress.days}</b><small>${o.days}</small></div><div class="card"><b>${d.progress.srs}</b><small>${o.cards}</small></div></div>${d.progress.mocks.map(m=>`<div class="adr"><span>${fd(m.at)} · TOPIK ${m.type}</span><b>${m.score}/${m.total}</b><em>${m.lvl||'—'}</em></div>`).join('')}`)}
  ${adSec('💬 '+o.matches,d.matches.length?d.matches.map(m=>`<div class="adr"><a href="#/admin/u/${m.peer.id}">${esc(m.peer.name)}</a><span>${stPill(m.status)}</span><em>${o.msgs} ${m.msgs}</em></div>`).join(''):o.none)}
  ${adSec('📅 '+o.lessons,d.lessons.length?d.lessons.map(l=>`<div class="adr"><span>${fdt(l.start)} · ${l.dur}${S_().min}</span><b>${esc(l.teacher)} → ${esc(l.student)}</b><em>${l.mode==='offline'?'📍':'💻'}</em></div>`).join(''):o.none)}
  ${d.reviewsGot.length||d.reviewsGave.length?adSec('⭐ '+(u.role==='teacher'?o.revGot:o.revGave),[...d.reviewsGot,...d.reviewsGave].map(r=>`<div class="adr"><span>${stars(r.rating)} ${esc(r.name)}</span><b>${esc(r.text||'')}</b><em>${fd(r.at)}</em></div>`).join('')):''}
  ${d.reports.length?adSec('⚠️ '+o.reports,d.reports.map(r=>`<div class="adr"><span>${fd(r.at)} · ${esc(r.from||'—')} → ${esc(r.to||'—')}</span><b>${esc(r.reason||'')}</b><em>${r.resolved?o.resolved:o.open}</em></div>`).join('')):''}
  ${adSec('🔑 '+o.logins,d.logins.length?d.logins.map(l=>`<div class="adr"><span>${fdt(l.at)}</span><b class="ua2">${esc(l.ua||'')}</b><em>${esc(l.ip||'')}</em></div>`).join(''):o.none)}`}
function adMatches(){const o=ADX(),t=Date.now()/1000,up=ADC.lessons.filter(l=>l.start>t),past=ADC.lessons.filter(l=>l.start<=t);
  const lrow=l=>`<div class="adr"><span>${fdt(l.start)} · ${l.dur}${S_().min} ${l.mode==='offline'?'📍'+esc(l.place?l.place.name:''):'💻'}</span><b><a href="#/admin/u/${l.teacher.id}">${esc(l.teacher.name)}</a> → <a href="#/admin/u/${l.student.id}">${esc(l.student.name)}</a></b><em>${l.lessonNo?T().no(l.lessonNo):''}</em></div>`;
  return `${adSec('💬 '+o.matches+' · '+o.n(ADC.matches.length),ADC.matches.map(m=>`<div class="adr"><span>${fd(m.at)}</span><b><a href="#/admin/u/${m.teacher.id}">${esc(m.teacher.name)}</a> ⇄ <a href="#/admin/u/${m.student.id}">${esc(m.student.name)}</a></b><em>${stPill(m.status)} ${m.msgs}</em></div>`).join('')||o.none)}
  ${adSec('📅 '+o.upcoming+' · '+o.n(up.length),up.reverse().map(lrow).join('')||o.none)}${adSec('✅ '+o.past+' · '+o.n(past.length),past.map(lrow).join('')||o.none)}`}
function adReports(){const o=ADX();if(!ADM.reports)return spin;
  return ADM.reports.length?ADM.reports.map(r=>`<div class="card rep ${r.resolved?'ok':''}"><small>${fdt(r.at)}</small><b><a href="#/admin/u/${r.reporter.id}">${esc(r.reporter.name||'—')}</a> → <a href="#/admin/u/${r.target.id}">${esc(r.target.name||'—')}</a> <small>${esc(r.target.email||'')}</small></b><p>${esc(r.reason||'—')}</p>${r.resolved?`<small>${o.resolved}</small>`:`<button class="btn sm" data-rres="${r.id}">${o.resolve}</button>`}</div>`).join(''):`<p class="empty">${o.none}</p>`}
function adLogs(){const o=ADX(),L2=ADC.logs;
  return `${adSec('🛡 '+o.actions,L2.logs.length?L2.logs.map(l=>`<div class="adr"><span>${fdt(l.at)}</span><b>${esc(l.admin_name||'')} · ${o.act[l.action]||esc(l.action)}${l.target_id?` → <a href="#/admin/u/${l.target_id}">${esc(l.target_name||'')}</a>`:''}</b><em>${esc(l.detail&&o.grades[l.detail]?o.grades[l.detail]:l.detail||'')}</em></div>`).join(''):o.none)}
  ${adSec('🔑 '+o.loginLog,L2.logins.map(l=>`<div class="adr"><span>${fdt(l.at)}</span><b><a href="#/admin/u/${l.uid}">${esc(l.name||l.email)}</a></b><em class="ua2">${esc((l.ua||'').replace(/^Mozilla\/5\.0 \(/,'(').slice(0,60))}</em></div>`).join('')||o.none)}`}
function bindAdmin(){
  bindAdm();
  const q0=$('#adQ');if(q0)q0.oninput=()=>{ADC.q=q0.value;$('#adList').innerHTML=ADC.users.filter(adFilter).map(adRow).join('')||`<p class="empty">${ADX().none}</p>`};
  $$('[data-af]').forEach(b=>b.onclick=()=>{ADC.f=b.dataset.af;render(true)});
  const act=async body=>{try{const u=await api('POST','/admin/users/'+ADC.did,body);if(ADC.detail)ADC.detail.user={...ADC.detail.user,...u};if(ADC.users)ADC.users=ADC.users.map(x=>x.id===u.id?u:x);ADC.logs=null;toast(A().saved);render(true)}catch(e){toast(e.status===403?'403':A().err)}};
  $$('[data-ua]').forEach(b=>b.onclick=()=>{b.disabled=true;act({action:b.dataset.ua})});
  const g=$('#adGrade');if(g)g.onchange=()=>act({action:'grade',grade:g.value});
  const ms=$('#adMemoSave');if(ms)ms.onclick=()=>act({action:'memo',memo:$('#adMemo').value});
}
