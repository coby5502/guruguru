/* ======================= ハングル → カタカナ読み（学習者向けの目安） ======================= */
const KANA=(()=>{
  const ROW={k:'カキクケコ',g:'ガギグゲゴ',n:'ナニヌネノ',t:'タティトゥテト',d:'ダディドゥデド',r:'ラリルレロ',m:'マミムメモ',p:'パピプペポ',b:'バビブベボ',s:'サシスセソ',c:'チャチチュチェチョ',j:'ジャジジュジェジョ',h:'ハヒフヘホ','':'アイウエオ'};
  const split=s=>s.match(/チャ|チュ|チェ|チョ|ジャ|ジュ|ジェ|ジョ|ティ|トゥ|ディ|ドゥ|./g);
  const cell=(c,v)=>split(ROW[c])['aiueo'.indexOf(v)];
  const SM={a:'ャ',u:'ュ',o:'ョ',e:'ェ'},WS={a:'ァ',o:'ォ',e:'ェ',i:'ィ'};
  // 母音: [y/w, base]
  const V=[['','a'],['','e'],['y','a'],['y','e'],['','o'],['','e'],['y','o'],['y','e'],['','o'],['w','a'],['w','e'],['w','e'],['y','o'],['','u'],['w','o'],['w','e'],['w','i'],['y','u'],['','u'],['ui','i'],['','i']];
  // 初声: [無声, 有声化後]
  const I=[['k','g'],['k','k'],['n','n'],['t','d'],['t','t'],['r','r'],['m','m'],['p','b'],['p','p'],['s','s'],['s','s'],['',''],['c','j'],['c','c'],['c','c'],['k','k'],['t','t'],['p','p'],['h','h']];
  const TENSE=[1,4,8,10,14];
  // 終声 → 代表音: k n t l m p ng
  const F=[null,'k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t'];
  const syl=(c,v,voiced)=>{
    const [y,b]=V[v];const ci=voiced?I[c][1]:I[c][0];
    if(y==='y'){if(ci==='')return {a:'ヤ',u:'ユ',o:'ヨ',e:'イェ'}[b];if(ci==='s')return {a:'シャ',u:'シュ',o:'ショ',e:'シェ'}[b];if(ci==='c'||ci==='j')return cell(ci,b);return cell(ci,'i')+SM[b]}
    if(y==='w'){if(ci==='')return {a:'ワ',o:'ウォ',e:'ウェ',i:'ウィ'}[b];return cell(ci,'u').replace(/ゥ$/,'')+WS[b]}
    if(y==='ui')return ci===''?'ウイ':cell(ci,'i');
    return cell(ci,b);
  };
  return function(word){
    return String(word).split(/(\s+)/).map(w=>{
      const S=[...w].map(ch=>{const n=ch.charCodeAt(0)-0xAC00;return n>=0&&n<11172?{c:Math.floor(n/588),v:Math.floor(n%588/28),f:n%28}:{x:ch}});
      // 連音化（ㅇの前でパッチムが移る）
      for(let i=0;i<S.length-1;i++){const a=S[i],b=S[i+1];if(a.x||b.x||b.c!==11||!a.f||a.f===21)continue;
        const mv={1:0,2:1,4:2,7:3,8:5,16:6,17:7,19:9,20:10,22:12,23:14,24:15,25:16,26:17}[a.f];
        const cp={3:[1,10],5:[4,12],6:[0,2],9:[8,0],10:[8,6],11:[8,7],12:[8,9],13:[8,16],14:[8,17],15:[0,5],18:[17,10]}[a.f];
        if(a.f===27){a.f=0;continue}
        if(cp){a.f=cp[0];b.c=cp[1];continue}
        if(mv!==undefined){b.c=mv;a.f=0}}
      let out='';
      S.forEach((s,i)=>{
        if(s.x){out+=/[ぁ-ヿ]/.test(s.x)?s.x:'';return}
        const prev=S[i-1],voiced=i>0&&prev&&!prev.x&&(!prev.f||['n','l','m','ng'].includes(F[prev.f]));
        if(TENSE.includes(s.c)&&i>0&&prev&&!prev.x&&!prev.f)out+='ッ';
        out+=syl(s.c,s.v,voiced&&!TENSE.includes(s.c));
        if(s.f){const fr=F[s.f],nx=S[i+1],obs=nx&&!nx.x&&[0,1,3,4,7,8,9,10,12,13,14,15,16,17].includes(nx.c);
          out+=fr==='n'||fr==='ng'?'ン':fr==='m'?'ム':fr==='l'?'ル':obs?'ッ':fr==='k'?'ク':fr==='p'?'プ':'ッ'}
      });
      return out;
    }).join('').replace(/\s+/g,' ');
  };
})();
