/* ======================= ぐるぐる — evolving mascot (original design) ======================= */
const EVO=[
 {min:0,ja:'たまご',ko:'알',dja:'なにかが うまれそう…',dko:'무언가 태어날 것 같아…'},
 {min:1,ja:'ぐるぴよ',ko:'구루삐요',dja:'からを やぶって とびだした！',dko:'껍질을 깨고 나왔어!'},
 {min:3,ja:'ぐるりん',ko:'구루링',dja:'ハングルが すこし よめるように なった',dko:'한글을 조금 읽을 수 있게 됐어'},
 {min:6,ja:'ぐるぐる',ko:'구루구루',dja:'しっぽの うずまきが じまん',dko:'꼬리의 소용돌이가 자랑'},
 {min:8,ja:'キングぐるぐる',ko:'킹 구루구루',dja:'ステップ0を マスターした おうさま',dko:'스텝0을 마스터한 왕'},
 {min:16,ja:'はねぐるぐる',ko:'날개 구루구루',dja:'ちいさな はねが はえてきた',dko:'작은 날개가 돋아났어'},
 {min:32,ja:'そらぐるぐる',ko:'하늘 구루구루',dja:'ステップ1を こえて そらへ！',dko:'스텝1을 넘어 하늘로!'},
 {min:52,ja:'まほうぐるぐる',ko:'마법 구루구루',dja:'ことばの まほうを おぼえた',dko:'말의 마법을 익혔어'},
 {min:72,ja:'ぐるぐるはかせ',ko:'구루구루 박사',dja:'ぶんぽうなら おまかせ',dko:'문법이라면 맡겨 줘'},
 {min:120,ja:'ぐるぐるヒーロー',ko:'구루구루 히어로',dja:'どんな もんだいも こわくない',dko:'어떤 문제도 무섭지 않아'},
 {min:170,ja:'にじぐるぐる',ko:'무지개 구루구루',dja:'にじの ように ことばが ひろがる',dko:'무지개처럼 말이 퍼져 나가'},
 {min:230,ja:'ほしぐるぐる',ko:'별 구루구루',dja:'ほしの ように かがやく じつりょく',dko:'별처럼 빛나는 실력'},
 {min:290,ja:'レジェンドぐるぐる',ko:'레전드 구루구루',dja:'すべてを マスターした でんせつ',dko:'모든 것을 마스터한 전설'}
];
const evoStage=n=>{let s=0;EVO.forEach((e,i)=>{if(n>=e.min)s=i});return s};
const spiral=(cx,cy,r,turns=2.2,start=0)=>{let d='';const N=60;for(let i=0;i<=N;i++){const t=i/N,a=start+t*turns*Math.PI*2,rr=r*(1-t*.92);d+=(i?'L':'M')+(cx+Math.cos(a)*rr).toFixed(1)+' '+(cy+Math.sin(a)*rr).toFixed(1)}return d};
function mascotSVG(stage,cls=''){
  const O='#4a4660',B='#f6b3c9',B2='#f9cad9',S='#d8789c',W='#fffdf8';
  const eyes=(x1,x2,y,r=4.2)=>`<g fill="${O}"><ellipse cx="${x1}" cy="${y}" rx="${r*.82}" ry="${r}"/><ellipse cx="${x2}" cy="${y}" rx="${r*.82}" ry="${r}"/></g><g fill="#fff"><circle cx="${x1+1.2}" cy="${y-1.6}" r="${r*.32}"/><circle cx="${x2+1.2}" cy="${y-1.6}" r="${r*.32}"/></g>`;
  const cheeks=(x1,x2,y)=>`<g fill="#f08fb0" opacity=".55"><ellipse cx="${x1}" cy="${y}" rx="5" ry="3"/><ellipse cx="${x2}" cy="${y}" rx="5" ry="3"/></g>`;
  const mouth=(x,y)=>`<path d="M${x-4} ${y} q2 3 4 0 q2 3 4 0" fill="none" stroke="${O}" stroke-width="2" stroke-linecap="round"/>`;
  let g='';
  if(stage===0){
    g=`<ellipse cx="60" cy="108" rx="26" ry="4" fill="${O}" opacity=".12"/>
    <g class="m-wob"><path d="M60 18 C84 18 96 52 96 72 C96 94 80 106 60 106 C40 106 24 94 24 72 C24 52 36 18 60 18Z" fill="${W}" stroke="${O}" stroke-width="3"/>
    <path d="${spiral(60,66,18,2.3,-1.2)}" fill="none" stroke="${S}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="40" cy="44" r="4" fill="${B2}"/><circle cx="82" cy="54" r="3" fill="${B2}"/><circle cx="76" cy="90" r="4.5" fill="${B2}"/></g>`;
  }else if(stage===1){
    g=`<ellipse cx="60" cy="108" rx="28" ry="4" fill="${O}" opacity=".12"/>
    <g class="m-bob"><circle cx="60" cy="60" r="28" fill="${B}" stroke="${O}" stroke-width="3"/>
    <path d="${spiral(60,30,9,1.6,1.4)}" fill="none" stroke="${O}" stroke-width="3" stroke-linecap="round"/>
    ${eyes(50,70,58)}${cheeks(43,77,67)}${mouth(60,68)}</g>
    <path d="M26 74 L34 66 L42 76 L50 66 L60 77 L70 66 L78 76 L86 66 L94 74 C94 96 80 106 60 106 C40 106 26 96 26 74Z" fill="${W}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="${spiral(62,92,7,1.5,0)}" fill="none" stroke="${S}" stroke-width="3" stroke-linecap="round"/>`;
  }else{
    const big=stage>=3,R=big?38:33,cy=big?66:68;
    g=`<ellipse cx="60" cy="110" rx="${R}" ry="4" fill="${O}" opacity=".12"/><g class="m-bob">
    ${big?`<path d="M${60+R-6} ${cy+14} C${60+R+14} ${cy+16} ${60+R+18} ${cy-8} ${60+R+6} ${cy-14}" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M${60+R-6} ${cy+14} C${60+R+14} ${cy+16} ${60+R+18} ${cy-8} ${60+R+6} ${cy-14}" fill="none" stroke="${B}" stroke-width="4" stroke-linecap="round"/><path d="${spiral(60+R+6,cy-20,8,1.7,2)}" fill="none" stroke="${S}" stroke-width="3.5" stroke-linecap="round"/>`:''}
    <ellipse cx="${60-R*.62}" cy="${cy-R*.78}" rx="8" ry="11" transform="rotate(-24 ${60-R*.62} ${cy-R*.78})" fill="${B}" stroke="${O}" stroke-width="3"/>
    <ellipse cx="${60+R*.62}" cy="${cy-R*.78}" rx="8" ry="11" transform="rotate(24 ${60+R*.62} ${cy-R*.78})" fill="${B}" stroke="${O}" stroke-width="3"/>
    <ellipse cx="${60-R*.55}" cy="${cy+R*.9}" rx="10" ry="6" fill="${B}" stroke="${O}" stroke-width="3"/><ellipse cx="${60+R*.55}" cy="${cy+R*.9}" rx="10" ry="6" fill="${B}" stroke="${O}" stroke-width="3"/>
    <circle cx="60" cy="${cy}" r="${R}" fill="${B}" stroke="${O}" stroke-width="3"/>
    <ellipse cx="60" cy="${cy+R*.42}" rx="${R*.58}" ry="${R*.42}" fill="${B2}"/>
    <path d="${spiral(60,cy+R*.42,R*.3,2,0)}" fill="none" stroke="${S}" stroke-width="3" stroke-linecap="round"/>
    ${big?`<path d="M${60-R} ${cy+4} q-9 2 -8 10" fill="none" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path d="M${60+R} ${cy+4} q9 2 8 10" fill="none" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`:''}
    <path d="${spiral(60,cy-R*.62,big?7:6,1.6,3)}" fill="none" stroke="${S}" stroke-width="3" stroke-linecap="round"/>
    ${eyes(60-R*.36,60+R*.36,cy-4,big?5:4.6)}${cheeks(60-R*.62,60+R*.62,cy+7)}${mouth(60,cy+8)}`;
    const Y='#fbe29a',crown=`<path d="M38 ${cy-R-2} L42 ${cy-R-22} L52 ${cy-R-10} L60 ${cy-R-26} L68 ${cy-R-10} L78 ${cy-R-22} L82 ${cy-R-2}Z" fill="${Y}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><circle cx="60" cy="${cy-R-12}" r="3.5" fill="${S}"/>`;
    const star=(x,y,r)=>{let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;d+=(i?'L':'M')+(x+Math.cos(a)*rr).toFixed(1)+' '+(y+Math.sin(a)*rr).toFixed(1)}return `<path d="${d}Z" fill="${Y}" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>`};
    const wings=`<g fill="${W}" stroke="${O}" stroke-width="3" stroke-linejoin="round"><path d="M26 58 C8 40 -2 58 4 70 C-2 78 8 90 20 84 C14 94 26 100 30 86Z"/><path d="M94 58 C112 40 122 58 116 70 C122 78 112 90 100 84 C106 94 94 100 90 86Z"/></g><g fill="none" stroke="${B}" stroke-width="2.5" stroke-linecap="round"><path d="M12 64 q8 2 14 8"/><path d="M108 64 q-8 2 -14 8"/></g>`;
    const rainbow=['#f6b3c9','#fbe29a','#b9e6cf','#b5d8f2'].map((c,i)=>`<path d="M${8+i*6} 74 A${52-i*6} ${52-i*6} 0 0 1 ${112-i*6} 74" fill="none" stroke="${c}" stroke-width="6"/>`).join('');
    const tw=`<g fill="${Y}" stroke="${O}" stroke-width="2" class="m-tw"><path d="M14 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z"/><path d="M104 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/></g>`;
    let back='',front='';
    if(stage===5||stage===6||stage===12)back+=wings;
    if(stage===10||stage===12)back=rainbow+back;
    if(stage===9)back+=`<path d="M32 46 C10 78 14 104 30 112 L90 112 C106 104 110 78 88 46Z" fill="#f5a3a3" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`;
    if(stage===11)back+=`<ellipse cx="60" cy="14" rx="22" ry="6" fill="none" stroke="${Y}" stroke-width="5"/><ellipse cx="60" cy="14" rx="22" ry="6" fill="none" stroke="${O}" stroke-width="1.5" opacity=".5"/>`;
    if(stage===4||stage===12)front+=crown;
    if(stage===6)front+=star(40,90,7);
    if(stage===7)front+=`<ellipse cx="60" cy="32" rx="32" ry="6.5" fill="#c9b6f0" stroke="${O}" stroke-width="3"/><path d="M38 31 C44 18 54 6 70 -2 C66 8 72 20 82 31Z" fill="#c9b6f0" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><path d="M40 27 Q60 33 80 27" fill="none" stroke="${Y}" stroke-width="4"/>${star(64,15,5.5)}`;
    if(stage===8)front+=`<g fill="none" stroke="${O}" stroke-width="2.5"><circle cx="${60-R*.36}" cy="${cy-4}" r="8.5"/><circle cx="${60+R*.36}" cy="${cy-4}" r="8.5"/><path d="M${60-R*.36+8.5} ${cy-5} q${R*.36-8.5} -4 ${(R*.36-8.5)*2} 0"/></g><path d="M44 30 v8 q16 7 32 0 v-8Z" fill="${O}"/><path d="M26 26 L60 12 L94 26 L60 40Z" fill="${O}" stroke="${O}" stroke-width="2" stroke-linejoin="round"/><path d="M60 26 L88 30 L88 44" fill="none" stroke="${Y}" stroke-width="2.5" stroke-linecap="round"/><circle cx="88" cy="46" r="3.5" fill="${Y}"/>`;
    if(stage===9)front+=`<path d="M23 52 Q60 36 97 52" fill="none" stroke="#e86a6a" stroke-width="7" stroke-linecap="round"/><path d="M96 50 l12 -6 M96 52 l13 4" stroke="#e86a6a" stroke-width="5" stroke-linecap="round"/>${star(60,44,5)}`;
    if(stage===11)front+=[[14,46],[106,46],[22,18],[98,18]].map(p=>star(p[0],p[1],6)).join('');
    const ext=stage>=5;
    g=(ext?'<g transform="translate(8.4 10) scale(.86)">':'')+g.replace('<g class="m-bob">','<g class="m-bob">'+back)+front+'</g>';
    if(stage===4||stage===12)g+=tw;
    if(ext)g+='</g>';
  }
  return `<svg class="mascot ${cls}" viewBox="0 0 120 120" role="img" aria-label="${esc(EVO[stage][LANG])}">${g}</svg>`;
}
function evoCard(){
  const t=T(),n=done.length,s=evoStage(n),e=EVO[s],nx=EVO[s+1];
  const left=nx?nx.min-n:0,pct=nx?((n-e.min)/(nx.min-e.min))*100:100;
  return `<div class="evo"><div class="evo-m">${mascotSVG(s)}</div><div class="evo-t">
    <span class="lv">Lv.${s+1}</span><b class="nm">${esc(e[LANG])}</b><p>${esc(LANG==='ko'?e.dko:e.dja)}</p>
    <div class="bar"><i style="width:${pct}%"></i></div><small>${nx?t.evoLeft(left):t.evoMax}</small></div></div>`;
}
function dexHTML(){
  const t=T(),s=evoStage(done.length);
  return `<div class="dex">${EVO.map((e,i)=>`<div class="dx ${i<=s?'got':''}">${mascotSVG(i,i<=s?'':'sil')}<b>${i<=s?esc(e[LANG]):'？？？'}</b><small>${t.dexReq(e.min)}</small></div>`).join('')}</div>`;
}
function showEvolution(from,to){
  const t=T(),el=document.createElement('div');el.className='evo-ov';el.setAttribute('role','dialog');
  el.innerHTML=`<div class="evo-box"><p class="evo-q">${t.evoWhat(EVO[from][LANG])}</p><div class="evo-stage"><div class="evo-a">${mascotSVG(from)}</div><div class="evo-b">${mascotSVG(to)}</div></div><p class="evo-done">${t.evoDone(EVO[to][LANG])}</p><button class="btn pink block" id="evoOk">${t.evoOk}</button></div>`;
  document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));
  setTimeout(()=>{el.classList.add('flash');buzz([30,40,60])},1500);
  setTimeout(()=>{el.classList.add('done');const b=el.querySelector('.evo-b').getBoundingClientRect();confetti(b.left+b.width/2,b.top+b.height/2,30)},1900);
  el.querySelector('#evoOk').onclick=()=>{el.classList.remove('show');setTimeout(()=>el.remove(),300)};
}
