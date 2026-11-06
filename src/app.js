/* ======================= i18n ======================= */
const KOQ={
1:[{q:'"우유"의 뜻은?',e:'우유＝牛乳. 한자어입니다.'},{q:'입술을 옆으로 당기고 "ウ"라고 하는 모음은?',e:'ㅡ는 "イ" 입 모양 그대로 "ウ". ㅜ는 입술을 둥글게.'},{q:'세로 모음(ㅏ·ㅓ 등)은 ㅇ의 어디에 붙나요?',o:['오른쪽','아래','왼쪽'],e:'세로 모음은 오른쪽(아), 가로 모음은 아래(오)에 붙습니다.'},{q:'"여우"의 뜻은?',e:'여우＝きつね. 여유(余裕)와 한 글자 차이니 주의.'}],
2:[{q:'"바다"의 뜻은?',e:'바다＝海. ㄷ이 어중에서 유성음이 됩니다.'},{q:'"고기"의 두 번째 ㄱ은 어떻게 들리나요?',o:['k(무성음)','g(유성음)','소리 없음'],e:'모음 사이의 ㄱ은 유성음 g로 납니다.'},{q:'"지도"를 한자로 쓰면?',e:'지도＝地図. 한자어는 소리 대응으로 외우면 쉽습니다.'},{q:'소리가 없고 모음의 "자리"가 되는 자음은?',e:'ㅇ은 글자 첫머리에서 소리가 없습니다.'}],
3:[{q:'숨을 세게 내는 소리(격음)는?',e:'카가 격음. 까는 경음, 가는 평음입니다.'},{q:'"아빠"의 뜻은?',e:'아빠＝パパ. 오빠는 여성이 부르는 오빠.'},{q:'"싸다"의 뜻은?',e:'싸다＝安い, 비싸다＝高い, 짜다＝しょっぱい.'},{q:'경음을 발음하는 요령은?',o:['숨을 세게 낸다','목을 조이고 숨을 내지 않는다','코로 숨을 낸다'],e:'"っか"의 "か"처럼 목을 조여서 냅니다.'}],
4:[{q:'"개"와 "게"의 발음은?',o:['완전히 다르다','거의 같다','게는 소리가 없다'],e:'ㅐ와 ㅔ는 현재 거의 같은 소리. 개＝犬, 게＝カニ.'},{q:'ㅗ ＋ ㅏ ＝ ?',e:'ㅗ＋ㅏ＝ㅘ.'},{q:'"회사"를 한자로 쓰면?',e:'회사＝会社.'},{q:'"의사"의 뜻은?',e:'의사＝医者(意思도 같은 철자). 의자＝椅子.'}],
5:[{q:'"옷"의 발음은?',e:'받침 ㅅ은 [ㄷ] 소리. 옷＝[옫].'},{q:'"さんま"의 "ん"에 가까운 받침은?',e:'입술을 닫는 "ん"이므로 ㅁ.'},{q:'"밥"의 뜻은?',e:'밥＝ご飯. 밤＝夜·栗, 방＝部屋.'},{q:'"앞"의 발음은?',e:'받침 ㅍ은 [ㅂ] 소리. 앞＝[압].'}],
6:[{q:'"음악"의 발음은?',e:'ㅁ이 다음 ㅇ 자리로 넘어가 [으막].'},{q:'"한국어"의 발음은?',e:'ㄱ이 넘어가 [한구거].'},{q:'"값"의 발음은?',e:'ㅄ은 왼쪽 ㅂ을 읽어 [갑].'},{q:'"고양이"의 발음은?',e:'ㅇ 받침은 넘어가지 않으므로 그대로 [고양이].'}],
7:[{q:'"ふくおか"를 한글로 쓰면?',e:'어두의 ふ→후, 어중의 く·か→쿠·카.'},{q:'내가 떠날 때 남아 있는 사람에게 하는 말은?',e:'계세요＝남는 사람에게, 가세요＝떠나는 사람에게.'},{q:'"감사합니다"의 발음은?',e:'ㅂ이 ㄴ 앞에서 [ㅁ]이 됩니다(비음화).'},{q:'"とうきょう"를 한글로 쓰면?',e:'어두는 평음, 장음은 쓰지 않으므로 도쿄.'}],
8:[{q:'"선생님"의 뜻은?',e:'선생님＝先生.'},{q:'"꽃"의 발음은?',e:'받침 ㅊ은 [ㄷ] 소리.'},{q:'"일본어"의 발음은?',e:'ㄴ이 넘어가 [일보너].'},{q:'목을 조여서 내는 소리(경음)는?',e:'따가 경음, 타가 격음, 다가 평음.'},{q:'"まつもと"를 한글로 쓰면?',e:'"つ"는 쓰, 어중의 "と"는 토.'}]
};
if(typeof KOQ_EXT!=='undefined')Object.assign(KOQ,KOQ_EXT);
const KOG={'縦棒（ㅇの右につく）':'세로 모음 (ㅇ 오른쪽에)','横棒（ㅇの下につく）':'가로 모음 (ㅇ 아래에)','基本子音（平音）':'기본 자음 (평음)','激音（息を強く）':'격음 (숨을 세게)','濃音（のどを詰める）':'경음 (목을 조여서)','ㅐ・ㅔ の仲間':'ㅐ·ㅔ 계열','ㅗ・ㅜ ＋ 母音':'ㅗ·ㅜ ＋ 모음'};
const TBL={ja:{2:'가나다表',3:'3段比較表',5:'7つの代表音',6:'発音の変化',7:'あいさつ表現'},ko:{2:'가나다표',3:'3단 비교표',5:'7가지 대표음',6:'발음 변화',7:'인사 표현'}};
const TCOLS={3:['','평음','격음','경음'],5:['대표음','받침 글자','예','일본어로 치면'],6:['철자','발음','뜻(일본어)'],7:['한국어','발음','뜻·장면(일본어)']};
if(typeof TBL_EXT!=='undefined'){Object.assign(TBL.ja,TBL_EXT.ja);Object.assign(TBL.ko,TBL_EXT.ko)}
if(typeof TCOLS_EXT!=='undefined')Object.assign(TCOLS,TCOLS_EXT);
const SHEETKO=[['읽기','소리 내어 읽고 뜻 말하기'],['받아쓰기','교사가 읽는 단어를 한글로 쓰기'],['듣고 구별하기','교사가 하나를 읽고 학생이 ○ 표시']];
const STEPS_KO=[['입문','한글과 발음','1~8회','약 2개월','한글 읽기','모음·자음·받침·연음화'],['초급 전반','자기소개와 일상 기초','9~32회','약 8개월','TOPIK 1급','-입니다·은/는·해요체·과거형·수사'],['초급 후반','생활 속 대화','33~72회','약 1년 반','TOPIK 2급','합니다체·관형형·-(으)면·불규칙 활용'],['중급 전반','이유와 경험 말하기','73~120회','약 2년 반','TOPIK 3급','인용문·-는데·반말·작문 200~300자'],['중급 후반','사회 주제와 논리','121~170회','약 3년 반','TOPIK 4급','한다체·사회 주제·논술 600~700자'],['고급 전반','전문적인 글','171~230회','약 4년 반','TOPIK 5급','논설·강연·속담·사자성어'],['고급 후반','원어민에 가까운 운용','231~290회','약 6년','TOPIK 6급','전문적인 글·230점 이상 안정']];

const I={
ja:{brand:'ぐるぐる',gotCount:(n,m)=>`覚えた ${n} / ${m}`,gotStamp:'覚えた！',stepsT:'ステップ',stepsSub:'7ステップ · 全290回',stepOf:n=>`ステップ${n}`,lessonsN:n=>`${n}回`,ready:'教案あり',prep:'準備中',studying:'学習中',complete:'完了',syllabus:'授業一覧',prepNote:'このステップの教案は準備中です。文法と内容の予定を確認できます。',backStep:'ステップへ',goal:'目標',dex:'ぐるぐる ずかん',dexSub:'授業を完了すると しんか！',evoLeft:n=>`あと${n}回で しんか！`,evoMax:'ぜんぶ マスター！',dexReq:n=>n?`${n}回 完了`:'スタート',evoWhat:n=>`${n}が ひかりはじめた…！`,evoDone:n=>`じゃーん！ ${n} とうじょう！`,evoOk:'やったー！',home:'ホーム',words:'単語帳',guide:'ガイド',lang:'한국어',langAria:'한국어로 바꾸기',theme:'テーマ切替',back:'ホームへ',
 heroP:'ハングルゼロからTOPIK 6級まで。<br>タップで聞いて、カードで覚えて、クイズで確認！',prog:'ステップ0 ハングルと発音',unit:'回',
 again:'もう一度ふりかえる',cont:'つづきから',start:'さっそくはじめる',lessonQ:(n,t)=>`第${n}回「${t}」`,
 instT:'アプリみたいに使える！',instA:'ホーム画面に追加すると、オフラインでも開けます',instI:'共有ボタン →「ホーム画面に追加」で、アプリのように使えます',instB:'追加',close:'閉じる',
 classes:'ステップ0の授業',all8:'全8回',tapOpen:'タップで開く',wod:'今日のひとこと',tapPlay:'タップで再生',listen:'🔊 きく',future:'これからのステップ',soon:'準備中',done:'✓ 完了',next:'NEXT!',
 foot:'一歩ずつ、いっしょに。',no:n=>`第${n}回`,noOf:n=>`ステップ${stepOfLesson(n)} · 第${n}回`,tabs:['学ぶ','単語','クイズ'],toCards:'単語カードへ →',toQuiz:'クイズに挑戦 →',
 scroll:'横にスクロール →',test:'小テスト',showA:'答えを表示',hideA:'答えを隠す',points:'ここがポイント',print:'📄 プリント',printSub:'PDFで保存・印刷できます',
 hwT:'今週の宿題',noCards:'この回は単語カードはありません',flip:'タップでうら返す',flipBack:'タップで表に戻る',got:'✓ 覚えた',gotBtn:'覚えた！',list:'単語リスト',cnt:n=>`${n}語`,allGot:'全部覚えた！クイズに挑戦しよう 🎉',
 perfect:'パーフェクト！すごい！',good:'よくできました！',retryMsg:'もう一度チャレンジしよう！',toNext:n=>`第${n}回へすすむ →`,fin:'ステップ0 修了！ホームへ',retry:'もう一度',review:'単語カードで復習',
 ok:'せいかい！',ng:'ざんねん…',nextQ:'次の問題 →',result:'結果を見る →',search:'韓国語・日本語で検索',all:'すべて',none:'見つかりませんでした',
 noVoice:'このブラウザは音声に対応していません',addVoice:'音が出ないときは端末の設定で韓国語の音声を追加してください',pBack:'← 戻る',pPrint:'🖨 印刷',view:'👀 見る・印刷',
 docs:{text:['学習テキスト','学生用 · 日本語'],guide:['교사용 지도안','先生用 · 韓国語'],work:['ワークシート','授業中の練習'],hw:['宿題プリント','復習＋音読チェック']},
 flowT:'授業の流れ（60分）',practice:'練習アクティビティ',hw:'宿題',tip:'指導のコツ'},
ko:{brand:'ぐるぐる',gotCount:(n,m)=>`외운 단어 ${n} / ${m}`,gotStamp:'외웠어요!',stepsT:'스텝',stepsSub:'7스텝 · 전 290회',stepOf:n=>`스텝${n}`,lessonsN:n=>`${n}회`,ready:'교안 있음',prep:'준비 중',studying:'학습 중',complete:'완료',syllabus:'수업 목록',prepNote:'이 스텝의 교안은 준비 중입니다. 문법과 내용 계획을 확인할 수 있어요.',backStep:'스텝으로',goal:'목표',dex:'구루구루 도감',dexSub:'수업을 완료하면 진화!',evoLeft:n=>`${n}회 더 하면 진화!`,evoMax:'전부 마스터!',dexReq:n=>n?`${n}회 완료`:'시작',evoWhat:n=>`${n}가 빛나기 시작했어…!`,evoDone:n=>`짜잔! ${n} 등장!`,evoOk:'야호!',home:'홈',words:'단어장',guide:'가이드',lang:'日本語',langAria:'日本語に切り替え',theme:'테마 변경',back:'홈으로',
 heroP:'한글 기초부터 TOPIK 6급까지.<br>눌러서 듣고, 카드로 외우고, 퀴즈로 확인!',prog:'스텝0 한글과 발음',unit:'회',
 again:'다시 복습하기',cont:'이어서 하기',start:'바로 시작하기',lessonQ:(n,t)=>`제${n}회 "${t}"`,
 instT:'앱처럼 쓸 수 있어요!',instA:'홈 화면에 추가하면 오프라인에서도 열 수 있어요',instI:'공유 버튼 → "홈 화면에 추가"로 앱처럼 쓸 수 있어요',instB:'추가',close:'닫기',
 classes:'스텝0 수업',all8:'전 8회',tapOpen:'눌러서 열기',wod:'오늘의 한마디',tapPlay:'눌러서 재생',listen:'🔊 듣기',future:'앞으로의 스텝',soon:'준비 중',done:'✓ 완료',next:'NEXT!',
 foot:'한 걸음씩, 함께.',no:n=>`제${n}회`,noOf:n=>`스텝${stepOfLesson(n)} · 제${n}회`,tabs:['배우기','단어','퀴즈'],toCards:'단어 카드로 →',toQuiz:'퀴즈 도전 →',
 scroll:'옆으로 스크롤 →',test:'소테스트',showA:'정답 보기',hideA:'정답 숨기기',points:'지도 포인트',print:'📄 프린트',printSub:'PDF로 저장·인쇄할 수 있어요',
 hwT:'숙제',noCards:'이번 회차는 단어 카드가 없어요',flip:'눌러서 뒤집기',flipBack:'눌러서 앞면으로',got:'✓ 외웠어요',gotBtn:'외웠어요!',list:'단어 목록',cnt:n=>`${n}개`,allGot:'전부 외웠어요! 퀴즈에 도전해 봐요 🎉',
 perfect:'만점! 대단해요!',good:'잘했어요!',retryMsg:'한 번 더 도전해 봐요!',toNext:n=>`제${n}회로 →`,fin:'스텝0 수료! 홈으로',retry:'다시 풀기',review:'단어 카드로 복습',
 ok:'정답!',ng:'아쉬워요…',nextQ:'다음 문제 →',result:'결과 보기 →',search:'한국어·일본어로 검색',all:'전체',none:'찾을 수 없어요',
 noVoice:'이 브라우저는 음성을 지원하지 않아요',addVoice:'소리가 안 나면 기기 설정에서 한국어 음성을 추가해 주세요',pBack:'← 돌아가기',pPrint:'🖨 인쇄',view:'👀 보기·인쇄',
 docs:{text:['学習テキスト','학생용 · 일본어'],guide:['교사용 지도안','선생님용 · 한국어'],work:['ワークシート','수업 중 연습 · 일본어'],hw:['宿題プリント','복습＋음독 체크 · 일본어']},
 flowT:'수업 진행 (60분)',practice:'연습 활동',hw:'숙제',tip:'지도 팁'}
};
let LANG=(()=>{try{const v=localStorage.getItem('kk-lang');if(v)return JSON.parse(v)}catch(e){}return /^ko/i.test(navigator.language||'')?'ko':'ja'})();
const T=()=>I[LANG];
/* lesson view-model in current language */
function V(l){
  if(LANG==='ja')return l;
  const k=KO[l.no],q=KOQ[l.no];
  return {...l,title:k.title,sub:k.sub,goals:k.goals,points:k.points,
    letters:l.letters&&l.letters.map(g=>({...g,g:KOG[g.g]||g.g})),
    table:l.table&&{...l.table,cols:TCOLS[l.no]||l.table.cols},
    sheet:l.sheet&&l.sheet.map((s,i)=>({...s,t:s.kt||SHEETKO[i][0],d:s.kd||SHEETKO[i][1]})),
    quiz:l.quiz.map((x,i)=>({...x,q:q[i].q,e:q[i].e,o:q[i].o||x.o}))};
}

const STEPS=[
 {n:0,name:'入門',sub:'ハングルと発音',range:'第1〜8回',total:'約2ヶ月',goal:'ハングルが読める',key:'母音・子音・パッチム・連音化'},
 {n:1,name:'初級前半',sub:'自己紹介と日常の基本',range:'第9〜32回',total:'約8ヶ月',goal:'TOPIK 1級',key:'-입니다・은/는・해요体・過去形・数詞'},
 {n:2,name:'初級後半',sub:'生活の中のやりとり',range:'第33〜72回',total:'約1年半',goal:'TOPIK 2級',key:'합니다体・連体形・-(으)면・不規則活用'},
 {n:3,name:'中級前半',sub:'理由と経験を語る',range:'第73〜120回',total:'約2年半',goal:'TOPIK 3級',key:'引用文・-는데・パンマル・作文200〜300字'},
 {n:4,name:'中級後半',sub:'社会の話題と論理',range:'第121〜170回',total:'約3年半',goal:'TOPIK 4級',key:'한다体・社会テーマ・論説文600〜700字'},
 {n:5,name:'上級前半',sub:'専門的な文章へ',range:'第171〜230回',total:'約4年半',goal:'TOPIK 5級',key:'論説・講演・ことわざ・四字熟語'},
 {n:6,name:'上級後半',sub:'ネイティブに近い運用',range:'第231〜290回',total:'約6年',goal:'TOPIK 6級',key:'専門的な文章・230点以上を安定'}
];
const ST=i=>{const s=STEPS[i];if(LANG==='ja')return s;const k=STEPS_KO[i];return {...s,name:k[0],sub:k[1],range:k[2],total:k[3],goal:k[4],key:k[5]}};
const COL=['pink','yellow','mint','sky','purple','orange','pink','mint'];
const SCOL=['pink','yellow','mint','sky','purple','orange','red'];
const cv=c=>`var(--${c})`,cs=c=>c==='red'?'var(--pink-s)':`var(--${c}-s)`;

/* ======================= utils ======================= */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const isKo=s=>/[가-힣ㄱ-ㆎ]/.test(s);
const store={get(k,d){try{const v=localStorage.getItem('kk-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('kk-'+k,JSON.stringify(v))}catch(e){}}};
let done=store.get('done',[]);
try{const old=JSON.parse(localStorage.getItem('step0-done')||'null');if(Array.isArray(old)&&!done.length){done=old;store.set('done',done)}}catch(e){}
let visited=store.get('visited',{});
const tEl=$('#toast');let tT;
function toast(m){tEl.textContent=m;tEl.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>tEl.classList.remove('show'),2400)}
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};

/* speech: pre-recorded natural voice (Supertonic) → fallback to device TTS */
const AUDIO=/*__AUDIO__*/{};
const cleanSay=t=>String(t).replace(/○○/g,'다나카').replace(/[［］\[\]○]/g,'').replace(/（.*?）/g,'').trim();
let koVoice=null,warned=false,curA=null;const acache={};
function loadVoice(){try{const vs=speechSynthesis.getVoices().filter(v=>/^ko/i.test(v.lang));
  const rank=v=>(/natural|neural|premium|enhanced|online/i.test(v.name)?4:0)+(/google|yuna|sunhi|heami|injoon|sora/i.test(v.name)?2:0)+(v.localService?0:1);
  koVoice=vs.sort((a,b)=>rank(b)-rank(a))[0]||null}catch(e){}}
if('speechSynthesis' in window){loadVoice();speechSynthesis.onvoiceschanged=loadVoice}
function ttsFallback(t){
  if(!('speechSynthesis' in window)){if(!warned){warned=true;toast(T().noVoice)}return}
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t.replace(/ \/ /g,', '));u.lang='ko-KR';u.rate=.85;if(koVoice)u.voice=koVoice;speechSynthesis.speak(u);
    if(!koVoice&&!warned)setTimeout(()=>{loadVoice();if(!koVoice&&!warned){warned=true;toast(T().addVoice)}},400)}catch(e){}
}
function say(t,el){
  if(el){el.classList.add('playing');setTimeout(()=>el.classList.remove('playing'),350)}
  const c=cleanSay(t),h=AUDIO[c];
  try{if(curA){curA.pause();curA.currentTime=0}}catch(e){}
  try{speechSynthesis&&speechSynthesis.cancel()}catch(e){}
  if(!h)return ttsFallback(c);
  const a=acache[h]||(acache[h]=new Audio('audio/'+h+'.mp3'));curA=a;
  try{a.currentTime=0;const p=a.play();if(p&&p.catch)p.catch(()=>ttsFallback(c))}catch(e){ttsFallback(c)}
}
function preload(list){list.forEach(t=>{const h=AUDIO[cleanSay(t)];if(h&&!acache[h]){const a=new Audio();a.preload='auto';a.src='audio/'+h+'.mp3';acache[h]=a}})}
function confetti(x,y,n=14){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const em=['★','♥','✿','●','한','글'],cl=['--pink','--yellow','--mint','--sky','--purple','--orange'];
  for(let i=0;i<n;i++){const s=document.createElement('span');s.className='cf';s.textContent=em[i%em.length];
    s.style.left=x+'px';s.style.top=y+'px';s.style.color=`var(${cl[i%cl.length]})`;
    const a=Math.random()*Math.PI*2,d=50+Math.random()*100;s.style.setProperty('--x',Math.cos(a)*d+'px');s.style.setProperty('--y',Math.sin(a)*d-40+'px');s.style.setProperty('--r',(Math.random()*360-180)+'deg');
    document.body.appendChild(s);setTimeout(()=>s.remove(),1100)}
}
function words(l){
  if(l.words)return l.words.map(w=>({k:w[0],m:w[1],p:w[2]||'',no:l.no}));
  return (l.sheet?l.sheet[0].items:[]).map(x=>{const m=x[1].match(/^［(.+?)］(.*)$/);return {k:x[0],m:m?m[2]:x[1],p:m?m[1]:'',no:l.no}});
}
const ALLW=L.flatMap(words);
const nextIdx=()=>{const i=L.findIndex(l=>!done.includes(l.no));return i<0?0:i};
const icon={
 back:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
 moon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
 x:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
 words:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="14" height="16" rx="2.5"/><path d="M7 9h6M7 13h4"/><path d="M17 8h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9"/></svg>',
 me:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
 guide:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>'
};

/* ======================= chrome ======================= */
const langBtn=()=>`<button class="lang" id="langBtn" aria-label="${T().langAria}"><span class="${LANG==='ja'?'on':''}">あ</span><span class="${LANG==='ko'?'on':''}" lang="ko">가</span></button>`;
function topbar(mode,l){
  const t=T();
  $('#topbar').innerHTML=mode==='lesson'
    ?`<a href="#/s/${stepOfLesson(l.no)}" class="ibtn" aria-label="${t.backStep}">${icon.back}</a><div class="ttl">${t.no(l.no)} ${esc(V(l).title)}</div>${langBtn()}`
    :mode==='step'?`<a href="#/" class="ibtn" aria-label="${t.back}">${icon.back}</a><div class="ttl">${t.stepOf(l)} · ${esc(ST(l).name)}</div>${langBtn()}`
    :`<a href="#/" class="brand"><span class="brand-mark">${mascotSVG(3,'mini')}</span><span class="bt">${t.brand}<small>guruguru</small></span></a><div class="tr">${langBtn()}<button class="ibtn" id="themeBtn" aria-label="${t.theme}">${icon.moon}</button></div>`;
  $('#langBtn').onclick=()=>{LANG=LANG==='ja'?'ko':'ja';store.set('lang',LANG);applyLang();render(true)};
  const tb=$('#themeBtn');if(tb)tb.onclick=toggleTheme;
}
function tabbar(active){
  const t=T();document.body.classList.toggle('hide-tab',!active);
  $('#tabs').innerHTML=[['home','#/'],['words','#/words'],['guide','#/guide'],...(authed()?[['me','#/me']]:[])].map(([k,h])=>`<a href="${h}" class="${k===active||(k==='me'&&active==='admin')?'on':''}" ${k===active?'aria-current="page"':''}>${icon[k]}<span>${k==='me'?A().me:t[k]}</span></a>`).join('');
}
function applyLang(){document.documentElement.lang=LANG;document.title=LANG==='ko'?'ぐるぐる guruguru｜한글부터 TOPIK 6급까지':'ぐるぐる guruguru｜ハングルからTOPIK 6級まで'}

/* ======================= STEPS (uniform) ======================= */
function stepLessons(n){
  if(n===0)return L.filter(l=>l.no<=8).map(l=>({no:l.no,ja:l.title,ko:KO[l.no].title,g:LANG==='ko'?KO[l.no].sub:l.sub,ready:true}));
  const s=SYL[n];return s.items.map((x,i)=>{const no=s.from+i;return {no,ja:x[0],ko:x[1],g:x[2],ready:L.some(l=>l.no===no)}});
}
const stepOfLesson=no=>{for(let n=6;n>=0;n--){if(n===0||no>=SYL[n].from)return n}return 0};
function stepStat(n){const ls=stepLessons(n),d=ls.filter(x=>done.includes(x.no)).length,r=ls.filter(x=>x.ready).length;return {total:ls.length,done:d,ready:r}}
function stepCard(n){
  const t=T(),s=ST(n),st=stepStat(n),c=SCOL[n];
  const state=st.done===st.total?t.complete:st.ready?t.studying:t.prep;
  return `<a href="#/s/${n}" class="stc ${st.ready?'':'soon'}" style="--c:${cv(c)};--cs:${cs(c)}">
    <div class="stn"><span>STEP</span><b>${n}</b></div>
    <div class="stb"><div class="sth"><b>${esc(s.name)}</b><span class="pill ${st.ready?'on':''}">${state}</span></div>
    <small>${esc(s.sub)} · ${esc(s.range)}</small>
    <div class="bar"><i style="width:${st.done/st.total*100}%"></i></div>
    <div class="stf"><span>🎯 ${esc(s.goal)}</span><span>${st.done} / ${t.lessonsN(st.total)}</span></div></div></a>`;
}
function vStep(n){
  const t=T(),s=ST(n),st=stepStat(n),c=SCOL[n],ls=stepLessons(n),ni=L[nextIdx()].no;
  return `<section class="card lhero" style="--c:${cv(c)}"><span class="g">${n}</span><span class="no">${t.stepOf(n)} · ${esc(s.range)} · ${esc(s.total)}</span><h1>${esc(s.name)}</h1><div class="sub">${esc(s.sub)}</div>
    <div class="goals"><div>🎯 ${t.goal}: ${esc(s.goal)}</div><div>📚 ${esc(s.key)}</div></div>
    <div class="prog" style="margin:14px 0 0"><div class="prog-top"><span>${t.syllabus}</span><span>${st.done} / ${t.lessonsN(st.total)}</span></div><div class="bar"><i style="width:${st.done/st.total*100}%"></i></div></div></section>
  ${st.ready?'':`<p class="note" style="margin:14px 2px 0">${t.prepNote}</p>`}
  <details class="sdl"><summary>📦 ${DT().bundle}<small>${DT().bundleS}</small></summary>${bundleGrid(n)}<p class="note">${DT().ios}</p></details>
  <div class="llist">${ls.map(x=>{const d=done.includes(x.no),isn=x.ready&&x.no===ni&&!d;
    const inner=`<span class="ln">${x.no}</span><span class="lt"><b>${esc(LANG==='ko'?x.ko:x.ja)}</b><small lang="${/[\uac00-\ud7a3]/.test(x.g)?'ko':'ja'}">${esc(x.g)}</small></span><span class="ls ${d?'done':isn?'next':x.ready?'':'soon'}">${d?'✓':isn?'NEXT':x.ready?'▶':t.prep}</span>`;
    return x.ready?`<a href="#/l/${x.no}" class="lrow">${inner}</a>`:`<div class="lrow off">${inner}</div>`}).join('')}</div>
  <div class="stnav">${n>0?`<a href="#/s/${n-1}" class="btn sm">← ${t.stepOf(n-1)}</a>`:'<span></span>'}${n<6?`<a href="#/s/${n+1}" class="btn sm">${t.stepOf(n+1)} →</a>`:''}</div>`;
}

/* ======================= HOME ======================= */
let deferredPrompt=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;if(route().v==='home')render(true)});
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone;
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function vHome(){
  const t=T(),ni=nextIdx(),nl=V(L[ni]),cnt=done.length,all=cnt>=L.length;
  const day=Math.floor(Date.now()/864e5),w=ALLW[day%ALLW.length];
  const inst=!standalone()&&!store.get('hideInstall',false)&&(deferredPrompt||isIOS);
  const tv=authed()&&ME.view==='teacher';
  return `${statusBanner()}${tv?teacherHero():`<section class="card hero">
    <span class="sticker s1">★</span>
    ${authed()?`<div class="hello">${esc(A().hi(ME.name))}</div>`:''}
    ${evoCard()}
    <div class="prog"><div class="prog-top"><span>${t.stepOf(stepOfLesson(nl.no))} · ${esc(ST(stepOfLesson(nl.no)).name)}</span><span>${stepStat(stepOfLesson(nl.no)).done} / ${t.lessonsN(stepStat(stepOfLesson(nl.no)).total)}</span></div><div class="bar"><i style="width:${stepStat(stepOfLesson(nl.no)).done/stepStat(stepOfLesson(nl.no)).total*100}%"></i></div></div>
    <a href="#/l/${nl.no}" class="btn pink block cta"><span class="play">▶</span><span class="ctat">${all?t.again:cnt?t.cont:t.start}<small>${esc(t.lessonQ(nl.no,nl.title))}</small></span></a>
  </section>`}
  ${inst?`<div class="card install"><span class="ic">📲</span><p><b>${t.instT}</b>${deferredPrompt?t.instA:t.instI}</p>${deferredPrompt?`<button class="btn sm mint" id="instBtn">${t.instB}</button>`:''}<button class="ibtn sm" id="instX" aria-label="${t.close}">${icon.x}</button></div>`:''}
  <div class="h2"><span>${t.stepsT}</span><small>${t.stepsSub}</small></div>
  <div class="steps">${[0,1,2,3,4,5,6].map(stepCard).join('')}</div>
  ${tv?'':`<div class="h2"><span>${t.dex}</span><small>${t.dexSub}</small></div>
  ${dexHTML()}`}
  <div class="h2"><span>${t.wod}</span><small>${t.tapPlay}</small></div>
  <button class="card wod" id="wod"><div class="wodt"><div class="k" lang="ko">${esc(w.k)}</div><div class="kn" lang="ja">${esc(kn(w))}</div><div class="m">${w.p?`<span lang="ko">［${esc(w.p)}］</span> `:''}${esc(w.m)}</div></div><span class="btn sm yellow sp">${t.listen}</span></button>
  <div class="foot"><div class="jua" lang="ko">한 걸음씩!</div>${t.foot}</div>`;
}
function bindHome(){
  const w=$('#wod');if(w)w.onclick=()=>say(w.querySelector('.k').textContent,w);
  const ib=$('#instBtn');if(ib)ib.onclick=async()=>{deferredPrompt.prompt();try{await deferredPrompt.userChoice}catch(e){}deferredPrompt=null;render(true)};
  const ix=$('#instX');if(ix)ix.onclick=()=>{store.set('hideInstall',true);render(true)};
}

/* ======================= LESSON ======================= */
const TABK=['learn','cards','quiz'];
let fcState={i:0,flip:false,got:new Set()},qState=null;
function vLesson(no,tab){
  const i=L.findIndex(x=>x.no===no);const l=V(L[i]),c=COL[i%COL.length],t=T();
  visited[no]=visited[no]||{};visited[no][tab]=1;store.set('visited',visited);
  const v=visited[no],ok=k=>k==='quiz'?done.includes(no):!!v[k];
  let h=`<section class="card lhero" style="--c:${cv(c)}"><span class="g" lang="ko">${l.big}</span><span class="no">${t.noOf(l.no)}</span><h1>${esc(l.title)}</h1><div class="sub">${esc(l.sub)}</div>
    ${tab==='learn'?`<div class="goals">${l.goals.map(g=>`<div>🎯 ${esc(g)}</div>`).join('')}</div>`:''}</section>
    <div class="seg"><nav role="tablist">${TABK.map((k,j)=>`<a href="#/l/${no}/${k}" role="tab" aria-selected="${k===tab}" class="${k===tab?'on':''} ${ok(k)&&k!==tab?'ok':''}"><i>${ok(k)&&k!==tab?'✓':j+1}</i>${t.tabs[j]}</a>`).join('')}</nav></div>
    <div class="panel" id="panel" style="--c:${cv(c)}">${tab==='learn'?pLearn(l):tab==='cards'?pCards(l):pQuiz(l)}</div>`;
  const nxt=tab==='learn'?['cards',t.toCards]:tab==='cards'?['quiz',t.toQuiz]:null;
  if(nxt)h+=`<div class="lbar"><div class="in"><a href="#/l/${no}/${nxt[0]}" class="btn pink">${nxt[1]}</a></div></div>`;
  return h;
}
function pLearn(l){
  const t=T();let h='';
  if(l.letters)l.letters.forEach(g=>{h+=`<div class="blk"><h3>${esc(g.g)}<em>${t.tapPlay} 🔊</em></h3><div class="tiles">${g.items.map(x=>`<button class="tile" data-say="${x[0]}"><span class="sp">🔊</span><div class="k" lang="ko">${x[1]}</div><div class="s" lang="ko">${x[0]}</div><div class="r" lang="ja">${esc(x[2])}</div></button>`).join('')}</div></div>`});
  if(l.table){const lf=l.table.left||[],wide=l.table.cols.length>4;
    h+=`<div class="blk"><h3>${TBL[LANG][l.no]}<em>${wide?t.scroll:t.tapPlay+' 🔊'}</em></h3><div class="tbl${wide?'':' fit'}"><table><thead><tr>${l.table.cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${l.table.rows.map(r=>`<tr>${r.map((c,k)=>{
      if((l.no===2||l.no===3)&&k===0)return `<td class="lab"${isKo(c)?' lang="ko"':''}>${c}</td>`;
      if(lf.includes(k))return `<td class="l" lang="ja">${esc(c)}</td>`;
      if(c!=='—'&&isKo(c)&&!/^［/.test(c)&&!/ㄱ ㅋ|ㄷ ㅌ|ㅂ ㅍ/.test(c)){const sv=(l.no===6||l.no===7)&&k===1?r[0]:c.replace(/［.*$/,'').replace(/（.*$/,'');return /[\uac00-\ud7a3]/.test(sv)?`<td class="ko" lang="ko" data-say="${esc(sv)}">${esc(c)}</td>`:`<td class="ko" lang="ko">${esc(c)}</td>`}
      return `<td>${esc(c)}</td>`}).join('')}</tr>`).join('')}</tbody></table></div></div>`}
  if(l.sheet)h+=`<div class="blk"><h3>${t.test}<em><button class="btn sm yellow" id="ansBtn">${t.showA}</button></em></h3><div class="sheetg" id="sheet">${l.sheet.map(s=>`<div class="sh"><h4>${s.t}</h4><small>${s.d}</small><ol>${s.items.map(x=>`<li><span lang="ko" class="ko">${esc(x[0])}</span><span class="ans" lang="ja">${esc(x[1])}</span></li>`).join('')}</ol></div>`).join('')}</div></div>`;
  h+=`<div class="blk"><h3>${t.points}</h3><div class="bubbles">${l.points.map((p,k)=>`<div class="bub" style="--c:${cv(COL[(k+2)%6])}"><b>${esc(p[0])}</b>${esc(p[1])}</div>`).join('')}</div></div>`;
  if(teachView()){const k0=KO[l.no],L0=L.find(x=>x.no===l.no),k=LANG==='ko'?k0:{flow:L0.flow.map(f=>[f[1],f[2]]),practice:L0.practice,homework:L0.homework,memo:L0.memo};let acc=0;
    h+=`<div class="blk"><h3>⏱ ${t.flowT}</h3><div class="card teach"><div class="timebar">${l.flow.map((f,j)=>`<div style="flex:${f[0]};background:${cv(COL[j%6])}">${f[0]>=7?f[0]+(LANG==='ko'?'분':'分'):''}</div>`).join('')}</div>
      <div class="flow">${l.flow.map((f,j)=>{const s=acc;acc+=f[0];return `<div class="fi"><div class="t"><i style="background:${cv(COL[j%6])}"></i>${s}~${acc}${LANG==='ko'?'분':'分'}</div><div><b>${esc(k.flow[j][0])}</b><p>${esc(k.flow[j][1])}</p></div></div>`}).join('')}</div>
      <div class="cols2"><div><h4>${t.practice}</h4><ul class="ul">${k.practice.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div><div><h4>${t.hw}</h4><ul class="ul">${k.homework.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div></div>
      <h4>💡 ${t.tip}</h4><div class="memo">${esc(k.memo)}</div></div></div>`;
  }else{
    h+=`<div class="blk"><h3>🏠 ${t.hwT}</h3><div class="card teach"><ul class="ul">${l.homework.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div></div>`;
  }
  h+=`<div class="blk"><h3>${t.print}<em>${t.printSub}</em></h3>${printCards(l.no)}</div>`;
  return h;
}
function pCards(l){
  const t=T(),ws=words(l);if(!ws.length)return `<p class="empty">${t.noCards}</p>`;
  const f=fcState;if(f.i>=ws.length)f.i=0;const w=ws[f.i];
  return `<div class="deck"><div class="fc ${f.flip?'flip':''}" id="fc" role="button" tabindex="0" aria-label="${t.flip}">
    <div class="face front"><span class="cnt">${f.i+1} / ${ws.length}</span><span class="stamp${f.got.has(w.k)?' on':''}">${t.gotStamp}</span><div class="big" lang="ko">${esc(w.k)}</div><span class="hint">${t.flip}</span></div>
    <div class="face back"><span class="cnt">${f.i+1} / ${ws.length}</span><div class="mean" lang="ja">${esc(w.m)}</div>${w.p?`<div class="pr" lang="ko">［${esc(w.p)}］</div>`:''}<div class="pr" lang="ko">${esc(w.k)}</div><div class="kn2" lang="ja">${esc(kn(w))}</div><span class="hint">${t.flipBack}</span></div>
  </div></div>
  <div class="fctrl"><button class="ibtn big" id="fPrev" aria-label="prev">◀</button><div class="fmid"><button class="btn sky" id="fSay">${t.listen}</button><button class="btn ${f.got.has(w.k)?'mint':''}" id="fGot">${f.got.has(w.k)?t.got:t.gotBtn}</button></div><button class="ibtn big" id="fNext" aria-label="next">▶</button></div>
  <div class="gotc"><span>${t.gotCount(f.got.size,ws.length)}</span>${f.got.size===ws.length?`<a href="#/l/${l.no}/quiz" class="btn sm pink">${t.toQuiz}</a>`:''}</div>
  <div class="dots">${ws.map((x,j)=>`<i class="${j===f.i?'on':''} ${f.got.has(x.k)?'got':''}"></i>`).join('')}</div>
  <div class="blk"><h3>${t.list}<em>${t.cnt(ws.length)}</em></h3><div class="wlist">${ws.map(x=>wrow(x,false)).join('')}</div></div>`;
}
const kn=w=>KANA(w.p||w.k);
const wrow=(x,lb)=>`<button class="wrow" data-say="${esc(x.k)}"><span class="kw"><span class="k" lang="ko">${esc(x.k)}</span><span class="kn" lang="ja">${esc(kn(x))}</span></span><span class="m" lang="ja">${x.p?`<span class="p" lang="ko">［${esc(x.p)}］</span>`:''}${esc(x.m)}</span>${lb?`<span class="lb">${x.no}</span>`:''}<span class="sp">🔊</span></button>`;
function pQuiz(l){
  const t=T(),q=qState;
  if(q.i>=l.quiz.length){
    const n=l.quiz.length,s=q.score,st=s===n?3:s>=n*.6?2:1;
    return `<div class="qwrap"><div class="card result"><div class="stars">${'★'.repeat(st)}${'☆'.repeat(3-st)}</div><div class="sc">${s}<span> / ${n}</span></div><p>${s===n?t.perfect:s>=n*.6?t.good:t.retryMsg}</p>
      <div class="btns">${L.some(x=>x.no===l.no+1)?`<a href="#/l/${l.no+1}" class="btn pink block">${t.toNext(l.no+1)}</a>`:`<a href="#/s/${stepOfLesson(l.no)}" class="btn pink block">${t.backStep} →</a>`}<button class="btn block" id="qRetry">${t.retry}</button><a href="#/l/${l.no}/cards" class="btn block">${t.review}</a></div></div></div>`;
  }
  const it=l.quiz[q.i],ans=q.ans;
  return `<div class="qwrap"><div class="qhead"><div class="bar"><i style="width:${q.i/l.quiz.length*100}%"></i></div><b>${q.i+1} / ${l.quiz.length}</b></div>
    <div class="card qcard"><span class="qn">Q${q.i+1}</span><div class="qq">${esc(it.q)}</div>
    <div class="opts">${it.o.map((o,j)=>{let c='';if(ans!=null){c=j===it.a?'ok':j===ans?'ng':'dim'}return `<button class="opt ${c}" data-j="${j}" ${ans!=null?'disabled':''}${isKo(o)?' lang="ko"':''}><span class="l">${'ABC'[j]}</span><span class="ot">${esc(o)}</span></button>`}).join('')}</div>
    ${ans!=null?`<div class="fb ${ans===it.a?'ok':'ng'}" role="status"><b>${ans===it.a?t.ok:t.ng}</b>${esc(it.e)}</div><button class="btn pink block" id="qNext">${q.i+1<l.quiz.length?t.nextQ:t.result}</button>`:''}
    </div></div>`;
}
function bindSay(root=document){root.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>say(b.dataset.say,b))}
function bindLesson(no,tab){
  const l=V(L.find(x=>x.no===no)),t=T(),panel=$('#panel');
  if(!panel)return;
  bindSay(panel);preload([...panel.querySelectorAll('[data-say]')].slice(0,40).map(e=>e.dataset.say));
  const ab=$('#ansBtn');if(ab)ab.onclick=()=>{const s=$('#sheet');s.classList.toggle('show-ans');ab.textContent=s.classList.contains('show-ans')?t.hideA:t.showA};
  if(tab==='cards'&&$('#fc')){
    const ws=words(l),f=fcState;
    const re=()=>{panel.innerHTML=pCards(l);bindLesson(no,tab)};
    const go=d=>{f.i=(f.i+d+ws.length)%ws.length;f.flip=false;re();say(ws[f.i].k)};
    const fc=$('#fc');const flip=()=>{f.flip=!f.flip;fc.classList.toggle('flip',f.flip);if(!f.flip)say(ws[f.i].k)};
    let sx=null,sy=null,moved=false;
    fc.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;moved=false},{passive:true});
    fc.addEventListener('touchmove',e=>{if(sx==null)return;const dx=e.touches[0].clientX-sx;if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(e.touches[0].clientY-sy)){moved=true;fc.style.transform=`translateX(${dx*.6}px) rotate(${dx*.03}deg)${f.flip?' rotateY(180deg)':''}`}},{passive:true});
    fc.addEventListener('touchend',e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;fc.style.transform='';if(moved&&Math.abs(dx)>60){go(dx<0?1:-1)}});
    fc.onclick=()=>{if(!moved)flip();moved=false};
    fc.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();flip()}if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)};
    $('#fPrev').onclick=()=>go(-1);$('#fNext').onclick=()=>go(1);
    $('#fSay').onclick=e=>say(ws[f.i].k,e.currentTarget);
    let busy=false;
    $('#fGot').onclick=e=>{if(busy)return;const k=ws[f.i].k,btn=e.currentTarget;
      if(f.got.has(k)){f.got.delete(k);store.set('got-'+no,[...f.got]);re();return}
      busy=true;f.got.add(k);store.set('got-'+no,[...f.got]);buzz(15);
      btn.classList.add('mint');btn.textContent=t.got;
      const sp=$('#fc .stamp');if(sp)sp.classList.add('on','pop');
      const di=$$('.dots i')[f.i];if(di)di.classList.add('got');
      const gc=$('.gotc span');if(gc)gc.textContent=t.gotCount(f.got.size,ws.length);
      const r=btn.getBoundingClientRect();confetti(r.left+r.width/2,r.top,8);
      setTimeout(()=>{busy=false;if(!panel.isConnected)return;if(f.got.size===ws.length){toast(t.allGot);re();return}
        let j=f.i;for(let s=1;s<=ws.length;s++){const c=(f.i+s)%ws.length;if(!f.got.has(ws[c].k)){j=c;break}}
        f.i=j;f.flip=false;re();say(ws[f.i].k)},650)};
  }
  if(tab==='quiz'){
    const q=qState;
    $$('.opt').forEach(o=>o.onclick=()=>{
      const j=+o.dataset.j,it=l.quiz[q.i];q.ans=j;
      if(j===it.a){q.score++;buzz(20);const r=o.getBoundingClientRect();confetti(r.left+r.width/2,r.top+r.height/2)}else buzz([40,60,40]);
      if(isKo(it.o[it.a]))say(it.o[it.a]);
      panel.innerHTML=pQuiz(l);bindLesson(no,tab);const nb=$('#qNext');if(nb)nb.scrollIntoView({block:'nearest',behavior:'smooth'})});
    const nb=$('#qNext');if(nb)nb.onclick=()=>{q.i++;q.ans=null;
      if(q.i>=l.quiz.length&&!done.includes(no)){const s0=evoStage(done.length);done.push(no);store.set('done',done);const s1=evoStage(done.length);if(s1>s0)setTimeout(()=>showEvolution(s0,s1),1400)}
      panel.innerHTML=pQuiz(l);bindLesson(no,tab);
      const seg=$('.seg');if(seg)window.scrollTo({top:Math.max(0,seg.getBoundingClientRect().top+scrollY-70),behavior:'smooth'});
      if(q.i>=l.quiz.length){setTimeout(()=>{const r=$('.result');if(r){const b=r.getBoundingClientRect();confetti(b.left+b.width/2,b.top+80,24)}},250);
        const si=$('.seg a[href$="/quiz"] i');if(si)si.textContent='✓'}};
    const rb=$('#qRetry');if(rb)rb.onclick=()=>{qState={no,i:0,score:0,ans:null};panel.innerHTML=pQuiz(l);bindLesson(no,tab)};
  }
}

/* ======================= WORDS ======================= */
let wf={q:'',no:0};
function vWords(){
  const t=T();
  return `<div class="h2 first"><span>${t.words}</span><span class="tag">${t.cnt(ALLW.length)}</span></div>
  <label class="search"><span aria-hidden="true">🔍</span><input id="wq" type="search" inputmode="search" enterkeyhint="search" placeholder="${t.search}" value="${esc(wf.q)}" autocomplete="off" autocorrect="off" spellcheck="false"><button class="clr" id="wclr" aria-label="clear" ${wf.q?'':'hidden'}>${icon.x}</button></label>
  <div class="fchips" id="wchips"><button data-n="0" class="${wf.no===0?'on':''}">${t.all}</button>${L.map(l0=>{const l=V(l0);return `<button data-n="${l.no}" class="${wf.no===l.no?'on':''}">${t.no(l.no)} ${esc(l.title)}</button>`}).join('')}</div>
  <p class="wcount" id="wc"></p>
  <div class="wlist" id="wl"></div>`;
}
function bindWords(){
  const t=T();
  const draw=()=>{const q=wf.q.trim().toLowerCase();const r=ALLW.filter(w=>(!wf.no||w.no===wf.no)&&(!q||(w.k+w.m+w.p).toLowerCase().includes(q)));
    $('#wc').textContent=t.cnt(r.length);
    $('#wl').innerHTML=r.length?r.map(x=>wrow(x,true)).join(''):`<p class="empty">${t.none}</p>`;bindSay($('#wl'))};
  const inp=$('#wq'),clr=$('#wclr');
  inp.oninput=e=>{wf.q=e.target.value;clr.hidden=!wf.q;draw()};
  inp.onkeydown=e=>{if(e.key==='Enter')inp.blur()};
  inp.onfocus=()=>document.body.classList.add('typing');inp.onblur=()=>document.body.classList.remove('typing');
  clr.onclick=e=>{e.preventDefault();wf.q='';inp.value='';clr.hidden=true;draw();inp.focus()};
  $$('#wchips button').forEach(b=>b.onclick=()=>{wf.no=+b.dataset.n;$$('#wchips button').forEach(x=>x.classList.toggle('on',x===b));
    const p=b.parentElement;p.scrollTo({left:b.offsetLeft-(p.clientWidth-b.offsetWidth)/2,behavior:'smooth'});draw()});
  draw();
}

/* ======================= GUIDE ======================= */
const GT={
ja:{t:'カリキュラムガイド',tag:'7ステップ',lead:'週1回60分 × 1対1で、約6年でTOPIK 6級へ。',leadP:'語順・助詞・漢字語が似ているのが日本語話者の強み。つまずきやすい発音と敬語には最初から時間をかけます。',
 road:['ロードマップ','7つのステップと目標'],study:'▶ 学習する',roadN:'※ 期間は目安。各ステップの到達目標を満たしたら次へ進みます。',
 prints:['プリント集（PDF）','4種類 × 全290回・ステップまとめ'],printsN:'A4サイズ。ワークシートと宿題の最後のページは解答。교사용 지도안は韓国語です。',
 topik:['TOPIKの形式と合格ライン','TOPIK I・II'],kv:[['TOPIK I（1〜2級）','聞き30・読み40／200点'],['TOPIK II（3〜6級）','聞き50・書き4・読み50／300点'],['書き（TOPIK II）','51・52 空欄／53 グラフ説明／54 論説文']],lv:'級',pt:'点〜',topikN:'※ 日程・形式は公式サイト（topik.go.kr）で確認。',
 lesson:['60分授業の流れ','毎回この流れで進めます'],flow:['あいさつ・フリートーク','宿題チェック・復習','新しい文法・語彙','練習（会話・ロールプレイ）','発音・聞き取り','まとめ・宿題'],min:'分',lessonN:'宿題は週2〜3時間。初級はドリルと音読、中級は作文とシャドーイング、上級は論説文と要約。',
 mats:['使用教材','メイン教材＋オリジナル教案'],matsSub:['ステップ0 · ハングル導入','ステップ1・2 · メイン教科書','ステップ1・2 · 宿題用','ステップ1〜4 · 語彙','ステップ1・2 · 試験対策','ステップ3〜6 · 試験対策'],matsN:'TOPIK公式サイトの過去問（無料）を模擬試験に使います。教材は購入時に最新版を確認してください。',foot:'いっしょに始めましょう'},
ko:{t:'커리큘럼 가이드',tag:'7스텝',lead:'주 1회 60분 1:1 수업으로, 약 6년에 TOPIK 6급까지.',leadP:'어순·조사·한자어가 비슷한 것이 일본어 화자의 강점. 막히기 쉬운 발음과 존댓말에는 처음부터 시간을 들입니다.',
 road:['로드맵','7개 스텝과 목표'],study:'▶ 학습하기',roadN:'※ 기간은 기준. 각 스텝의 도달 목표를 채우면 다음으로 넘어갑니다.',
 prints:['프린트 모음 (PDF)','4종 × 전 290회·스텝 묶음'],printsN:'A4 크기. 워크시트와 숙제의 마지막 페이지는 정답. 학생용 자료는 일본어, 교사용 지도안은 한국어입니다.',
 topik:['TOPIK 형식과 합격 기준','TOPIK I·II'],kv:[['TOPIK I (1~2급)','듣기 30·읽기 40 / 200점'],['TOPIK II (3~6급)','듣기 50·쓰기 4·읽기 50 / 300점'],['쓰기 (TOPIK II)','51·52 빈칸 / 53 그래프 설명 / 54 논술']],lv:'급',pt:'점~',topikN:'※ 일정·형식은 공식 사이트(topik.go.kr)에서 확인하세요.',
 lesson:['60분 수업 흐름','매번 이 흐름으로 진행합니다'],flow:['인사·프리토킹','숙제 확인·복습','새 문법·어휘','연습(회화·롤플레이)','발음·듣기','정리·숙제'],min:'분',lessonN:'숙제는 주 2~3시간. 초급은 드릴과 음독, 중급은 작문과 섀도잉, 고급은 논술과 요약.',
 mats:['사용 교재','메인 교재 ＋ 자체 교안'],matsSub:['스텝0 · 한글 도입','스텝1·2 · 메인 교과서','스텝1·2 · 숙제용','스텝1~4 · 어휘','스텝1·2 · 시험 대비','스텝3~6 · 시험 대비'],matsN:'TOPIK 공식 사이트의 기출문제(무료)를 모의고사로 씁니다. 교재는 구입 시 최신판을 확인하세요.',foot:'함께 시작해요'}
};
function vGuide(open){
  const g=GT[LANG],t=T();
  const lv=(n,v,max,c)=>`<div class="lv"><span>${n}${g.lv}</span><div class="tr"><i style="width:${v/max*100}%;background:${cv(c)}"></i></div><span>${v}${g.pt}</span></div>`;
  const flow=[5,10,20,15,7,3];let acc=0;
  const books=['『1時間でハングルが読めるようになる本』','『できる韓国語 初級Ⅰ・Ⅱ』','『韓国語文法ドリル』','『hanaの韓国語単語』','『TOPIK I 総合対策』','『TOPIK II 総合対策』'],bc=['pink','mint','sky','yellow','purple','orange'];
  return `<div class="h2 first"><span>${g.t}</span><span class="tag">${g.tag}</span></div>
  <div class="card lead"><b>${g.lead}</b><p>${g.leadP}</p></div>
  <div class="acc">
   <details open><summary><span class="e" style="--c:var(--yellow)">길</span><span class="st2">${g.road[0]}<small>${g.road[1]}</small></span></summary><div class="in"><div class="road">${STEPS.map((_,i)=>{const s=ST(i);return `<div class="rs" style="--c:${cv(SCOL[i])}"><span class="n">${s.n}</span><div><b>${s.name}：${s.sub}</b><small>${s.range} · ${s.total} · ${esc(s.key)}</small><div class="rg"><span class="g">🎯 ${s.goal}</span><a href="#/s/${i}" class="g go">${g.study}</a></div></div></div>`}).join('')}</div><p class="note">${g.roadN}</p></div></details>
   <details id="printsAcc"><summary><span class="e" style="--c:var(--pink)">종</span><span class="st2">${g.prints[0]}<small>${g.prints[1]}</small></span></summary><div class="in"><b class="dlh">📦 ${DT().bundle}</b><small class="dls">${DT().bundleS}</small>${STEP_RANGE.map((r,sn)=>`<div class="bstep"><b>${t.stepOf(sn)} <small>${t.no?'':''}${r[0]}–${r[1]}</small></b>${bundleGrid(sn)}</div>`).join('')}
     <b class="dlh">📄 ${DT().lessons}</b>${STEP_RANGE.map((r,sn)=>`<details class="pstep"><summary>${t.stepOf(sn)} · ${r[0]}–${r[1]}</summary><div class="plist">${L.filter(l=>l.no>=r[0]&&l.no<=r[1]).sort((a,b)=>a.no-b.no).map(l0=>{const l=V(l0);return `<div class="pl"><b>${t.no(l.no)} ${esc(l.title)}</b><span>${docsFor().map(d=>`<a class="chip" href="${pdfUrl(l.no,d[0])}" data-dl="${esc(lessonDl(l.no,d[0]))}">${d[3]} ${t.docs[d[0]][0]}</a>`).join('')}<a class="chip all" href="${pdfUrl(l.no,'text')}" data-dl="${esc(lessonDlAll(l.no))}" data-label="${esc(t.no(l.no))} · ${DT().all}">⬇ ${DT().all}</a></span></div>`}).join('')}</div></details>`).join('')}<p class="note">${g.printsN}</p></div></details>
   <details><summary><span class="e" style="--c:var(--mint)">시</span><span class="st2">${g.topik[0]}<small>${g.topik[1]}</small></span></summary><div class="in">
     <div class="kv">${g.kv.map(k=>`<div><span>${k[0]}</span><b>${k[1]}</b></div>`).join('')}</div>
     <div style="margin-top:12px">${lv(1,80,200,'mint')}${lv(2,140,200,'mint')}${lv(3,120,300,'sky')}${lv(4,150,300,'sky')}${lv(5,190,300,'purple')}${lv(6,230,300,'pink')}</div>
     <p class="note">${g.topikN}</p></div></details>
   <details><summary><span class="e" style="--c:var(--sky)">수</span><span class="st2">${g.lesson[0]}<small>${g.lesson[1]}</small></span></summary><div class="in"><div class="timebar">${flow.map((f,k)=>`<div style="flex:${f};background:${cv(COL[k])}">${f>=7?f+g.min:''}</div>`).join('')}</div><div class="flow">${flow.map((f,k)=>{const s=acc;acc+=f;return `<div class="fi"><div class="t"><i style="background:${cv(COL[k])}"></i>${s}~${acc}${g.min}</div><div><b>${g.flow[k]}</b></div></div>`}).join('')}</div><p class="note">${g.lessonN}</p></div></details>
   <details><summary><span class="e" style="--c:var(--orange)">책</span><span class="st2">${g.mats[0]}<small>${g.mats[1]}</small></span></summary><div class="in">
     ${books.map((b,i)=>`<div class="mat"><span class="bk" style="--c:${cv(bc[i])}"></span><div><b lang="ja">${b}</b><small>${g.matsSub[i]}</small></div></div>`).join('')}
     <p class="note">${g.matsN}</p></div></details>
  </div>
  <div class="foot"><div class="jua" lang="ko">함께 시작해요!</div>${g.foot}</div>`;
}

/* ======================= router ======================= */
function route(){const h=location.hash.replace(/^#\/?/,'').split('/');
  if(h[0]==='l'&&h[1]&&L.some(l=>l.no===+h[1]))return {v:'lesson',no:+h[1],tab:TABK.includes(h[2])?h[2]:'learn'};
  if(h[0]==='print'&&h[1]&&/^s\d$/.test(h[1]))return {v:'print',no:0,sn:+h[1].slice(1),t:h[2]||'text'};
  if(h[0]==='print'&&h[1])return {v:'print',no:+h[1],t:h[2]||'text'};
  if(h[0]==='s'&&h[1]!=null&&/^[0-6]$/.test(h[1]))return {v:'step',n:+h[1]};
  if(h[0]==='words')return {v:'words'};if(h[0]==='guide')return {v:'guide',open:h[1]||''};
  if(h[0]==='me')return {v:'me'};if(h[0]==='admin')return {v:'admin'};if(h[0]==='login-error')return {v:'login-error'};return {v:'home'}}
let last=null;const scrollMem={};
function render(keep){
  const r=route();if(authGate(r))return;
  const key=r.v==='lesson'?`l${r.no}-${r.tab}`:r.v==='print'?`p${r.sn!=null?'s'+r.sn:r.no}${r.t}`:r.v==='step'?`s${r.n}`:r.v;
  if(last)scrollMem[last]=scrollY;
  if(r.v==='lesson'){
    if(!last||!last.startsWith(`l${r.no}-`))fcState={i:0,flip:false,got:new Set(store.get('got-'+r.no,[]))};
    if(r.tab==='quiz'&&(!qState||qState.no!==r.no||last!==key&&!keep))qState={no:r.no,i:0,score:0,ans:null};
  }
  document.body.classList.toggle('pmode',r.v==='print');
  document.body.dataset.view=r.v;
  const html=r.v==='print'?(r.sn!=null?vPrintStep(r.sn,r.t):vPrint(r.no,r.t)):r.v==='lesson'?vLesson(r.no,r.tab):r.v==='step'?vStep(r.n):r.v==='words'?vWords():r.v==='guide'?vGuide(r.open):r.v==='me'?vMe():r.v==='admin'?vAdmin():vHome();
  if(r.v==='lesson')topbar('lesson',L.find(x=>x.no===r.no));else if(r.v==='step')topbar('step',r.n);else topbar('main');
  tabbar(r.v==='lesson'||r.v==='print'?null:r.v==='step'?'home':r.v==='login-error'?'home':r.v);
  $('#app').innerHTML=r.v==='print'||keep?html:`<div class="view">${html}</div>`;
  if(r.v==='print'){const pb=$('#pBtn');if(pb)pb.onclick=()=>print()}
  else if(r.v==='lesson')bindLesson(r.no,r.tab);else if(r.v==='words')bindWords();else if(r.v==='home')bindHome();else if(r.v==='me')bindMe();else if(r.v==='admin')bindAdmin();
  if(r.v==='guide'&&r.open==='prints'&&!keep){const d=$('#printsAcc');if(d){d.open=true;setTimeout(()=>d.scrollIntoView({block:'start'}),30)}}
  if(keep){}else if(r.v==='lesson'&&last&&last.startsWith(`l${r.no}-`)){const seg=$('.seg');const y=seg?seg.getBoundingClientRect().top+scrollY-60:0;if(scrollY>y)scrollTo(0,y)}
  else scrollTo(0,scrollMem[key]&&r.v!=='lesson'?scrollMem[key]:0);
  last=key;
}
addEventListener('hashchange',()=>render(false));
if('scrollRestoration' in history)history.scrollRestoration='manual';
applyLang();authBoot();

/* theme */
const root=document.documentElement;
{const th=store.get('theme',null);if(th)root.dataset.theme=th}
function toggleTheme(){const dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;root.dataset.theme=dark?'light':'dark';store.set('theme',root.dataset.theme);
  $$('meta[name="theme-color"]').forEach(m=>m.content=dark?'#faf6f0':'#1f1c2b')}

/* no zoom (pinch / double-tap) */
['gesturestart','gesturechange','gestureend'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});

/* PWA */
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
