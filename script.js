// ============================================================
//  CONFETTI
// ============================================================
const confCanvas=document.getElementById('confettiCanvas');
const confCtx=confCanvas.getContext('2d');
let confParticles=[];
function resizeConf(){confCanvas.width=window.innerWidth;confCanvas.height=window.innerHeight;}
resizeConf();window.addEventListener('resize',resizeConf);
function launchConfetti(count){
  const cols=['#ff6eb4','#ffd700','#ff3366','#c084fc','#6BCB77','#fb923c','#fff'];
  for(let i=0;i<(count||40);i++){
    confParticles.push({
      x:Math.random()*confCanvas.width,y:confCanvas.height*.35,
      vx:(Math.random()-.5)*14,vy:(Math.random()*-12)-4,
      color:cols[Math.floor(Math.random()*cols.length)],
      size:Math.random()*9+5,gravity:.5,alpha:1,
      shape:Math.random()<.5?'circle':'rect',
      rot:Math.random()*360,rotv:(Math.random()-.5)*10
    });
  }
  if(!confRunning)runConf();
}
let confRunning=false;
function runConf(){
  confRunning=true;
  confCtx.clearRect(0,0,confCanvas.width,confCanvas.height);
  confParticles=confParticles.filter(p=>p.alpha>.04);
  confParticles.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;p.vy+=p.gravity;p.vx*=.99;p.alpha-=.013;p.rot+=p.rotv;
    confCtx.save();confCtx.globalAlpha=p.alpha;confCtx.fillStyle=p.color;
    confCtx.translate(p.x,p.y);confCtx.rotate(p.rot*Math.PI/180);
    if(p.shape==='circle'){confCtx.beginPath();confCtx.arc(0,0,p.size/2,0,Math.PI*2);confCtx.fill();}
    else{confCtx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2);}
    confCtx.restore();
  });
  if(confParticles.length>0)requestAnimationFrame(runConf);
  else{confRunning=false;confCtx.clearRect(0,0,confCanvas.width,confCanvas.height);}
}

// ============================================================
//  MASCOT
// ============================================================
const mascotEl=document.getElementById('mascot');
// Cycle mascots: Labubu 🧸, Hello Kitty 🐱🎀, Princess Peach 👸, MMA fighter 🥋
const mascots=['🧸','🎀','👸','🥋'];
let mascotIdx=0;
mascotEl.addEventListener('click',()=>{
  mascotIdx=(mascotIdx+1)%mascots.length;
  mascotEl.textContent=mascots[mascotIdx];
  mascotReact('cheer');
  doSpeak(['You are amazing, Safia!','Keep going, princess!','You are a math champion!','Hi-ya! Kick that problem!'][mascotIdx]);
});
function mascotReact(type){
  mascotEl.classList.remove('cheer','oops');
  void mascotEl.offsetWidth;
  mascotEl.classList.add(type);
}

// ============================================================
//  POP TEXT
// ============================================================
const popEl=document.getElementById('popText');
const popWordsGood=['🌸 PERFECT!','🎀 YES!','👑 QUEEN!','🥊 KICK IT!','💫 AMAZING!','🌟 SUPER!','🍑 GREAT!'];
const popWordsBad=['💪 TRY AGAIN!','🥊 FIGHT ON!','🧸 YOU GOT THIS!'];
function showPop(text,color){
  popEl.textContent=text||popWordsGood[Math.floor(Math.random()*popWordsGood.length)];
  popEl.style.color=color||'#ffd700';
  popEl.classList.remove('hide');void popEl.offsetWidth;
  popEl.classList.add('show');
  setTimeout(()=>{popEl.classList.replace('show','hide');},950);
}

// ============================================================
//  STREAK
// ============================================================
let currentStreak=0;
const streakEl=document.getElementById('streakBadge');
function updateStreakBadge(){
  if(currentStreak>=2){
    streakEl.style.display='block';
    streakEl.textContent='🔥 '+currentStreak+' in a row!';
    streakEl.classList.remove('fire');void streakEl.offsetWidth;
    streakEl.classList.add('fire');
  } else streakEl.style.display='none';
}
function buildStreakDots(n){
  const row=document.getElementById('streakDots');row.innerHTML='';
  for(let i=0;i<n;i++){const d=document.createElement('div');d.className='streak-dot';d.id='sdot_'+i;row.appendChild(d);}
}
function lightDot(idx){
  const d=document.getElementById('sdot_'+idx);
  if(d){d.classList.add('lit');setTimeout(()=>d.classList.add('fire'),100);}
}

// ============================================================
//  MILESTONE / TROPHIES
// ============================================================
let pendingMilestones=[];
function showMilestone(emoji,title,sub){
  pendingMilestones.push({emoji,title,sub});
  if(!document.getElementById('milestoneOverlay').classList.contains('show'))showNextMilestone();
}
function showNextMilestone(){
  if(!pendingMilestones.length)return;
  const m=pendingMilestones.shift();
  document.getElementById('milestoneEmoji').textContent=m.emoji;
  document.getElementById('milestoneTitle').textContent=m.title;
  document.getElementById('milestoneSub').textContent=m.sub;
  document.getElementById('milestoneOverlay').classList.add('show');
  launchConfetti(100);
}
window.closeMilestone=function(){
  document.getElementById('milestoneOverlay').classList.remove('show');
  setTimeout(showNextMilestone,400);
};

// Trophies — Princess Peach / Hello Kitty / Labubu / MMA themed
const TROPHIES=[
  {id:'first_correct', icon:'🌸', name:'First Bloom',    check:(sc,p)=>sc>=1},
  {id:'five_stars',    icon:'🎀', name:'Kitty Bow',      check:(sc,p)=>sc>=5},
  {id:'ten_stars',     icon:'🍑', name:'Peach Princess', check:(sc,p)=>sc>=10},
  {id:'twenty_stars',  icon:'👑', name:'Kingdom Queen',  check:(sc,p)=>sc>=20},
  {id:'counting',      icon:'🔢', name:'Count Champion', check:(sc,p)=>p.counting?.completed},
  {id:'carry',         icon:'🌺', name:'Carry Master',   check:(sc,p)=>p.carry_add?.completed},
  {id:'borrow',        icon:'🥊', name:'Borrow Fighter', check:(sc,p)=>p.borrow_sub?.completed},
  {id:'logic',         icon:'🧠', name:'Logic Genius',   check:(sc,p)=>p.logic?.completed},
  {id:'money',         icon:'🪙', name:'Coin Collector', check:(sc,p)=>p.money?.completed},
  {id:'time',          icon:'⏰', name:'Clock Master',   check:(sc,p)=>p.time?.completed},
  {id:'fractions',     icon:'🍕', name:'Fraction Star',  check:(sc,p)=>p.fractions?.completed},
  {id:'calendar',      icon:'📅', name:'Calendar Whiz',  check:(sc,p)=>p.calendar?.completed},
  {id:'half_levels',   icon:'🧸', name:'Labubu Award',   check:(sc,p)=>Object.values(p).filter(v=>v?.completed).length>=10},
  {id:'all_levels',    icon:'🏆', name:'Full Kingdom',   check:(sc,p)=>Object.values(p).filter(v=>v?.completed).length>=20},
  {id:'perfect',       icon:'💎', name:'Diamond Star',   check:(sc,p)=>Object.values(p).some(v=>v?.score>=100)},
  {id:'mma_streak',    icon:'🥋', name:'MMA Champion',   check:(sc,p)=>sc>=3},
];
let trophyData={};
try{const t=localStorage.getItem('safia-trophies-v2');if(t)trophyData=JSON.parse(t);}catch(e){}
let totalStarsEarned=0;
try{const ts=localStorage.getItem('safia-totalstars');if(ts)totalStarsEarned=parseInt(ts)||0;}catch(e){}

function checkTrophies(prevStars,newStars,prog){
  TROPHIES.forEach(t=>{
    if(!trophyData[t.id]&&t.check(newStars,prog)){
      trophyData[t.id]=true;
      localStorage.setItem('safia-trophies-v2',JSON.stringify(trophyData));
      showMilestone(t.icon,'Trophy Unlocked!',t.name+' 🎉');
    }
  });
}
function renderTrophyShelf(){
  const row=document.getElementById('trophyRow');if(!row)return;
  row.innerHTML='';
  TROPHIES.forEach(t=>{
    const div=document.createElement('div');
    div.className='trophy-item'+(trophyData[t.id]?' earned':'');
    div.innerHTML=`<span class="trophy-icon">${trophyData[t.id]?t.icon:'🔒'}</span><div class="trophy-name">${t.name}</div>`;
    row.appendChild(div);
  });
}

// ============================================================
//  DAILY BONUS
// ============================================================
function checkDailyBonus(){
  const today=new Date().toDateString();
  if(localStorage.getItem('safia-lastbonus')===today){document.getElementById('dailyBonusWrap').innerHTML='';return;}
  document.getElementById('dailyBonusWrap').innerHTML=`
    <div class="daily-card">
      <div class="daily-title">🎁 Daily Princess Bonus! Play today for +3 ⭐ bonus stars!</div>
      <button class="daily-claim" onclick="claimDaily()">👑 Claim My Crown! 🌸</button>
    </div>`;
}
window.claimDaily=function(){
  localStorage.setItem('safia-lastbonus',new Date().toDateString());
  totalStarsEarned+=3;
  localStorage.setItem('safia-totalstars',String(totalStarsEarned));
  document.getElementById('dailyBonusWrap').innerHTML='<div style="text-align:center;font-family:Fredoka One,cursive;font-size:1.3rem;color:var(--gold);padding:10px;">🎁 +3 Crown Stars! 👑</div>';
  launchConfetti(60);showPop('👑 +3 Stars!','#ffd700');mascotReact('cheer');
};

// ============================================================
//  SPEECH
// ============================================================
function doSpeak(text){
  if(!text||!window.speechSynthesis)return;
  try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=0.85;u.pitch=1.1;window.speechSynthesis.speak(u);}catch(e){}
}

// ============================================================
//  AUDIO
// ============================================================
let audioCtx=null;
function getACtx(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();return audioCtx;}
document.addEventListener('click',()=>{try{if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();}catch(e){}},{once:false});
function playTone(freq,type,dur,vol){try{const ctx=getACtx();const o=ctx.createOscillator();const g=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(freq,ctx.currentTime);g.gain.setValueAtTime(vol||0.1,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+dur);}catch(e){}}
function playCorrectSound(){playTone(523,'sine',.15,.1);setTimeout(()=>playTone(659,'sine',.15,.1),120);setTimeout(()=>playTone(784,'sine',.25,.1),240);}
function playWrongSound(){playTone(300,'sawtooth',.15,.08);setTimeout(()=>playTone(250,'sawtooth',.2,.08),150);}
function playCelebrationSound(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',.2,.1),i*120));}

// ============================================================
//  THEME
// ============================================================
function setTheme(t){document.body.className='theme-'+t;localStorage.setItem('safia-theme-v2',t);}
function loadTheme(){setTheme(localStorage.getItem('safia-theme-v2')||'peach');}

// ============================================================
//  MISTAKE PATTERNS
// ============================================================
let mistakePatterns={};
try{const s=localStorage.getItem('safia-mistakes');if(s)mistakePatterns=JSON.parse(s);}catch(e){}
function updateMistakePatternsDisplay(){
  const ps=document.getElementById('patternSummary'),pt=document.getElementById('patternTags');
  if(!pt)return;
  const p=Object.entries(mistakePatterns).sort((a,b)=>b[1].count-a[1].count).slice(0,3);
  if(!p.length){if(ps)ps.style.display='none';return;}
  if(ps)ps.style.display='block';
  pt.innerHTML=p.map(([t,d])=>`<span class="pattern-tag ${d.count>5?'high':''}">${t} (${d.count})</span>`).join('');
}

// ============================================================
//  BADGES (original 6)
// ============================================================
let badges={counting:false,addition:false,subtraction:false,borrow:false,carry:false,logic:false,moneyFractions:false,timeCalendar:false,dataShapes:false,wordWizard:false};
try{const s=localStorage.getItem('safia-badges');if(s)badges=Object.assign(badges,JSON.parse(s));}catch(e){}
function checkBadges(){
  if(progress.counting?.completed)badges.counting=true;
  if(progress.missing_add?.completed&&progress.add_three?.completed)badges.addition=true;
  if(progress.borrow_sub?.completed&&progress.sub_three?.completed)badges.subtraction=true;
  if(progress.borrow_sub?.score>=90)badges.borrow=true;
  if(progress.carry_add?.score>=90)badges.carry=true;
  if(progress.logic?.completed)badges.logic=true;
  if(progress.money?.completed&&progress.fractions?.completed)badges.moneyFractions=true;
  if(progress.time?.completed&&progress.calendar?.completed)badges.timeCalendar=true;
  if(progress.data_graphs?.completed&&progress.shapes_measurement?.completed)badges.dataShapes=true;
  if(progress.combo?.completed)badges.wordWizard=true;
  localStorage.setItem('safia-badges',JSON.stringify(badges));
  Object.entries(badges).forEach(([k,v])=>{
    const el=document.getElementById('badge'+k.charAt(0).toUpperCase()+k.slice(1));
    if(el){if(v)el.classList.add('unlocked');else el.classList.remove('unlocked');}
  });
}

// ============================================================
//  LEVEL DEFINITIONS — themed icons
// ============================================================
const LEVELS=[
  {id:'counting',    name:'Counting',       icon:'🌸'},
  {id:'grouping',    name:'Tens & Ones',    icon:'🎀'},
  {id:'missing_add', name:'Missing Number', icon:'🍑'},
  {id:'carry_add',   name:'Carry Addition', icon:'👑'},
  {id:'borrow_sub',  name:'Borrow Sub',     icon:'🥊'},
  {id:'add_three',   name:'Add Three',      icon:'🧸'},
  {id:'sub_three',   name:'Subtract Three', icon:'🌺'},
  {id:'compose_add', name:'Make a Sum',     icon:'💎'},
  {id:'compose_sub', name:'Find the Gap',   icon:'🦋'},
  {id:'fact_family', name:'Fact Family',    icon:'🏰'},
  {id:'logic',       name:'Logic Puzzles',  icon:'🧠'},
  {id:'money',       name:'Money Kingdom',  icon:'🪙'},
  {id:'time',        name:'Clock Tower',    icon:'⏰'},
  {id:'compare_numbers', name:'Compare & Double', icon:'⚖️'},
  {id:'fractions',   name:'Fraction Pizza', icon:'🍕'},
  {id:'number_sense', name:'Number Ninjas', icon:'🔢'},
  {id:'data_graphs', name:'Graph Garden',   icon:'📊'},
  {id:'shapes_measurement', name:'Shape Safari', icon:'🔺'},
  {id:'calendar',    name:'Calendar Castle', icon:'📅'},
  {id:'combo',       name:'Grand Finale',   icon:'🏆'}
];

let progress={};
LEVELS.forEach(l=>{progress[l.id]={completed:false,score:0};});
try{const s=localStorage.getItem('safia-progress');if(s)progress=Object.assign(progress,JSON.parse(s));}catch(e){}

let currentLevel=null,questions=[],qIndex=0,score=0,wrong=0,answered=false;

// ============================================================
//  HELPERS
// ============================================================
function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function buildLevel(eqFn,pool){
  const eqs=[];let g=0;
  while(eqs.length<10&&g++<500){const p=eqFn();if(p)eqs.push(p);}
  const words=shuffle(pool).slice(0,5);
  return[...eqs.slice(0,7).map(p=>({...p,category:'equation',hasHint:true})),
         ...eqs.slice(7,10).map(p=>({...p,category:'equation',hasHint:false})),
         ...words.slice(0,2).map(p=>({...p,category:'word',hasHint:true})),
         ...words.slice(2,5).map(p=>({...p,category:'word',hasHint:false}))];
}

// ============================================================
//  QUESTION TYPE REGISTRY
//  Each question has a `kind` (or a legacy `type` mapped via
//  KIND_BY_TYPE) that selects how it renders its input and how
//  its answer is checked. New topics register a new kind here
//  instead of adding another isXxx branch to renderQuestion/checkAnswer.
// ============================================================
const KIND_BY_TYPE={fact_family:'fact_family',compose_add:'compose_pair',compose_sub:'compose_pair'};
function kindOf(q){return q.kind||KIND_BY_TYPE[q.type]||'numeric';}

function gv(id){const v=document.getElementById(id)?.value;return v&&v.trim()!==''?parseInt(v):NaN;}

let mcSelectedIdx=null;
function selectChoice(i){
  mcSelectedIdx=i;
  document.querySelectorAll('.mc-choice').forEach((el,idx)=>el.classList.toggle('selected',idx===i));
}

let selectedCoins=[];
function toggleCoin(i,v){
  const btn=document.getElementById('coin'+i);
  const pos=selectedCoins.indexOf(i);
  if(pos===-1){selectedCoins.push(i);btn.classList.add('selected');}
  else{selectedCoins.splice(selectedCoins.indexOf(i),1);btn.classList.remove('selected');}
  const cents=selectedCoins.reduce((sum,idx)=>sum+coinValueAt(idx),0);
  const totalEl=document.getElementById('coinTotal');
  if(totalEl)totalEl.textContent=formatCents(cents);
}
let currentCoinValues=[];
function coinValueAt(idx){return currentCoinValues[idx];}
function formatCents(c){return c>=100?`$${(c/100).toFixed(2)}`:`${c}¢`;}
function coinLabel(v){return v===25?'🪙 25¢':v===10?'🪙 10¢':v===5?'🪙 5¢':'🪙 1¢';}

const QUESTION_TYPES={
  numeric:{
    inputHtml(q){return `<input class="answer-input" id="answerInput" type="number" placeholder="Type your answer… 🌸">`;},
    bindEnter(){document.getElementById('answerInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')checkAnswer();});},
    check(q){
      const raw=document.getElementById('answerInput')?.value;
      if(!raw)return{status:'empty',message:'Type your answer! 🌸'};
      return{status:parseInt(raw)===q.answer?'correct':'wrong',message:`🥊 Answer: ${friendlyAnswer(q)}`};
    }
  },
  fact_family:{
    inputHtml(q){return `<div class="fact-rows">${[1,2,3,4].map(i=>`<div class="fact-row"><span style="color:var(--muted);">${i}.</span><input class="fact-input" id="f${i}a" type="number" placeholder="?"><span style="color:var(--pink);font-size:1.2rem;">${i<=2?'+':'−'}</span><input class="fact-input" id="f${i}b" type="number" placeholder="?"><span style="color:var(--pink);font-size:1.2rem;">=</span><input class="fact-input" id="f${i}c" type="number" placeholder="?"></div>`).join('')}</div>`;},
    bindEnter(){['f1a','f1b','f1c','f2a','f2b','f2c','f3a','f3b','f3c','f4a','f4b','f4c'].forEach(id=>document.getElementById(id)?.addEventListener('keydown',e=>{if(e.key==='Enter')checkAnswer();}));},
    check(q){
      const facts=[1,2,3,4].map(i=>({a:gv(`f${i}a`),b:gv(`f${i}b`),c:gv(`f${i}c`)}));
      if(facts.some(f=>isNaN(f.a)||isNaN(f.b)||isNaN(f.c)))return{status:'empty',message:'Please fill all four facts! 🌸'};
      const cf=[{a:q.a,b:q.b,c:q.total},{a:q.b,b:q.a,c:q.total},{a:q.total,b:q.a,c:q.b},{a:q.total,b:q.b,c:q.a}];
      const used=new Set();let allOk=true;
      facts.forEach((fact,idx)=>{
        let ok=false;
        for(let i=0;i<cf.length;i++){if(used.has(i))continue;const c=cf[i];if(idx<2){if((fact.a===c.a&&fact.b===c.b&&fact.c===c.c)||(fact.a===c.b&&fact.b===c.a&&fact.c===c.c)){ok=true;used.add(i);break;}}else{if(fact.a===c.a&&fact.b===c.b&&fact.c===c.c){ok=true;used.add(i);break;}}}
        const rowIds=[['f1a','f1b','f1c'],['f2a','f2b','f2c'],['f3a','f3b','f3c'],['f4a','f4b','f4c']][idx];
        rowIds.forEach(id=>document.getElementById(id).style.borderColor=ok?'#6BCB77':'#ff3366');
        if(!ok)allOk=false;
      });
      return{status:(allOk&&used.size===4)?'correct':'wrong',message:`🥊 Correct facts: ${friendlyAnswer(q)}`};
    }
  },
  compose_pair:{
    inputHtml(q){const sym=q.type==='compose_add'?'+':'−';return `<div class="compose-rows">${[1,2].map(i=>`<div class="compose-row"><input class="compose-input" id="c${i}a" type="number" placeholder="?"><span class="compose-sym">${sym}</span><input class="compose-input" id="c${i}b" type="number" placeholder="?"><span class="compose-eq">= ${q.target}</span></div>`).join('')}</div>`;},
    bindEnter(){['c1a','c1b','c2a','c2b'].forEach(id=>document.getElementById(id)?.addEventListener('keydown',e=>{if(e.key==='Enter')checkAnswer();}));},
    check(q){
      const rows=[{a:gv('c1a'),b:gv('c1b')},{a:gv('c2a'),b:gv('c2b')}];
      if(rows.some(r=>isNaN(r.a)||isNaN(r.b)))return{status:'empty',message:'Fill both rows! 🌸'};
      const ok=q.type==='compose_add'?rows.every(r=>r.a>0&&r.b>0&&r.a+r.b===q.target)&&!(rows[0].a===rows[1].a&&rows[0].b===rows[1].b):rows.every(r=>r.a>r.b&&r.a-r.b===q.target)&&!(rows[0].a===rows[1].a&&rows[0].b===rows[1].b);
      return{status:ok?'correct':'wrong',message:'🥊 Try different pairs!'};
    }
  },
  multiple_choice:{
    inputHtml(q){mcSelectedIdx=null;return `<div class="mc-grid">${q.choices.map((c,i)=>`<button type="button" class="mc-choice" id="mc${i}">${c.label}</button>`).join('')}</div>`;},
    bindEnter(q){
      document.querySelectorAll('.mc-choice').forEach((el,i)=>{
        el.addEventListener('click',()=>selectChoice(i));
      });
    },
    check(q){
      if(mcSelectedIdx===null)return{status:'empty',message:'Pick an answer! 🌸'};
      const ok=q.choices[mcSelectedIdx].correct;
      const correctLabel=q.choices.find(c=>c.correct).label;
      return{status:ok?'correct':'wrong',message:`🥊 Answer: ${correctLabel}`};
    }
  },
  coin_picker:{
    inputHtml(q){
      selectedCoins=[];currentCoinValues=q.coins;
      return `<div class="coin-tray">${q.coins.map((v,i)=>`<button type="button" class="coin-btn" id="coin${i}">${coinLabel(v)}</button>`).join('')}</div><div class="coin-total" id="coinTotal">${formatCents(0)}</div>`;
    },
    bindEnter(q){
      document.querySelectorAll('.coin-btn').forEach((el,i)=>{
        el.addEventListener('click',()=>toggleCoin(i,q.coins[i]));
      });
    },
    check(q){
      if(!selectedCoins.length)return{status:'empty',message:'Tap some coins! 🌸'};
      const sum=selectedCoins.reduce((s,idx)=>s+q.coins[idx],0);
      return{status:sum===q.target?'correct':'wrong',message:`🥊 Target was ${formatCents(q.target)}, you picked ${formatCents(sum)}`};
    }
  }
};

// ============================================================
//  VIDEO DATA
// ============================================================
const LEVEL_VIDEOS={
  counting:    {url:'https://www.youtube.com/results?search_query=jack+hartmann+count+to+20+kids',title:'🔢 Count to 20 – Jack Hartmann'},
  grouping:    {url:'https://www.youtube.com/results?search_query=tens+and+ones+place+value+song+kids',title:'📦 Tens & Ones Place Value Song'},
  missing_add: {url:'https://www.youtube.com/results?search_query=missing+number+addition+kids+math',title:'❓ Finding the Missing Number'},
  carry_add:   {url:'https://www.youtube.com/results?search_query=addition+with+regrouping+song+numberock',title:'➕ Addition with Regrouping'},
  borrow_sub:  {url:'https://www.youtube.com/results?search_query=subtraction+with+regrouping+borrowing+song+kids',title:'➖ Subtraction with Borrowing'},
  add_three:   {url:'https://www.youtube.com/results?search_query=adding+three+numbers+kids+math+song',title:'🧸 Adding Three Numbers'},
  sub_three:   {url:'https://www.youtube.com/results?search_query=subtracting+two+digit+numbers+kids+math',title:'🌺 Subtracting Step by Step'},
  compose_add: {url:'https://www.youtube.com/results?search_query=number+bonds+ways+to+make+a+number+kids',title:'💎 Number Bonds Song'},
  compose_sub: {url:'https://www.youtube.com/results?search_query=number+bonds+subtraction+kids+math+song',title:'🦋 Number Bonds & Differences'},
  fact_family: {url:'https://www.youtube.com/results?search_query=fact+family+song+kids+math',title:'🏰 Fact Families Song'},
  logic:       {url:'https://www.youtube.com/results?search_query=patterns+for+kids+math+logic+song',title:'🧠 Patterns & Logic for Kids'},
  money:       {url:'https://www.youtube.com/results?search_query=counting+coins+money+kids+math+song',title:'🪙 Counting Coins Song'},
  time:        {url:'https://www.youtube.com/results?search_query=telling+time+hour+half+hour+kids+song',title:'⏰ Telling Time Song'},
  compare_numbers: {url:'https://www.youtube.com/results?search_query=comparing+numbers+greater+less+than+kids+song',title:'⚖️ Greater Than, Less Than Song'},
  fractions:   {url:'https://www.youtube.com/results?search_query=halves+fourths+fractions+kids+song',title:'🍕 Halves & Fourths Song'},
  number_sense: {url:'https://www.youtube.com/results?search_query=skip+counting+by+2+5+10+kids+song',title:'🔢 Skip Counting Song'},
  data_graphs: {url:'https://www.youtube.com/results?search_query=bar+graphs+picture+graphs+kids+math',title:'📊 Reading Graphs for Kids'},
  shapes_measurement: {url:'https://www.youtube.com/results?search_query=2d+shapes+sides+corners+kids+song',title:'🔺 Shapes & Measuring Song'},
  calendar:    {url:'https://www.youtube.com/results?search_query=days+of+the+week+months+seasons+kids+song',title:'📅 Days, Months & Seasons Song'},
  combo:       {url:'https://www.youtube.com/results?search_query=mixed+math+practice+kids+addition+subtraction',title:'🏆 Mixed Maths Practice'}
};
function makeVideoBtn(url,title){return `<a class="video-btn" href="${url}" target="_blank" rel="noopener">▶️ ${title}</a>`;}
function makeNrichBtn(url){return `<a class="nrich-btn" href="${url}" target="_blank" rel="noopener">📘 Open on NRICH</a>`;}

// ============================================================
//  HINT ENGINE — full original logic
// ============================================================
function bubble(text){return `<div style="background:var(--card);border-radius:14px;padding:12px 16px;margin:8px 0;color:var(--text);line-height:1.7;">${text}</div>`;}
function wrap(borderColor,icon,title,body){return `<div style="background:linear-gradient(135deg,var(--card),var(--panel));border-radius:22px;padding:18px;border:3px solid ${borderColor};font-size:.95rem;"><div style="color:${borderColor};font-weight:800;font-size:1.05rem;text-align:center;margin-bottom:12px;">${icon} ${title}</div>${body}</div>`;}
function numChip(n,bg){return `<span style="display:inline-flex;align-items:center;justify-content:center;background:${bg||'#ff6eb4'};color:#1a0a1e;min-width:38px;height:38px;border-radius:9px;font-size:1.2rem;font-weight:bold;padding:0 5px;margin:2px;">${n}</span>`;}
function colBox(rows){const lines=rows.map(r=>`<div style="font-family:'Courier New';font-size:1.5rem;color:${r.color||'#ff6eb4'};text-align:right;padding:1px 0;">${r.text}</div>`).join('');return `<div style="background:var(--bg);border-radius:12px;padding:12px 22px;display:inline-block;min-width:110px;">${lines}</div>`;}

// ── Core subtraction ──────────────────────────────────────────
function subtractColumn(big,small){
  const oB=big%10,oS=small%10,tB=Math.floor(big/10),tS=Math.floor(small/10);
  const needBorrow=oB<oS,ans=big-small,pad=String(big).length;
  if(!needBorrow){
    const oneAns=oB-oS,tenAns=tB-tS;
    return wrap('#6BCB77','➖',`${big} − ${small}`,
      bubble(`<strong style="color:var(--gold);">Right side (ones):</strong> Is ${oB} bigger than or equal to ${oS}? <strong style="color:#6BCB77;">YES ✅</strong><br>${oB} − ${oS} = <strong>${oneAns}</strong>`)
      +bubble(`<strong style="color:var(--gold);">Left side (tens):</strong> ${tB} − ${tS} = <strong>${tenAns}</strong>`)
      +`<div style="text-align:center;margin:10px 0;">${colBox([{text:'  '+big},{text:'− '+String(small).padStart(pad,' ')},{text:'─────',color:'#9e8fc9'},{text:'  '+ans,color:'#6BCB77'}])}</div>`
      +bubble(`<strong style="color:#6BCB77;">✅ ${big} − ${small} = ${ans} 🌸</strong>`));
  } else {
    const borrowedOnes=oB+10,newTens=tB-1,oneAns=borrowedOnes-oS,tenAns=newTens-tS;
    const oSteps=Array.from({length:oneAns},(_,i)=>oS+i+1);
    return wrap('#ff3366','➖',`${big} − ${small} (with borrowing)`,
      bubble(`<strong style="color:var(--gold);">Right side (ones):</strong> Is ${oB} bigger than or equal to ${oS}? <strong style="color:#ff3366;">NO ❌</strong><br>${oB} is less than ${oS} — we need to <strong>borrow</strong>.`)
      +bubble(`<strong style="color:var(--gold);">Borrowing:</strong><br>
        Take 1 ten from the left: <strong>${tB} → ${newTens}</strong><br>
        Add that 10 to the right: <strong>${oB} → ${borrowedOnes}</strong> (because 10 + ${oB} = ${borrowedOnes})<br><br>
        <div style="text-align:center;">${colBox([
          {text:'  '+newTens,color:'#ffd700'},
          {text:'\u0336'+tB+'|'+oB+' \u2192 '+newTens+'|'+borrowedOnes,color:'#d4a8c7'},
          {text:'− '+String(small).padStart(pad,' ')},
          {text:'─────',color:'#9e8fc9'}
        ])}</div>`)
      +bubble(`<strong style="color:var(--gold);">Right side (ones): ${borrowedOnes} − ${oS}</strong><br>
        Count from ${oS} up to ${borrowedOnes}:<br>
        ${numChip(oS,'#C77DFF')} → ${oSteps.map((n,i)=>numChip(n,i===oSteps.length-1?'#6BCB77':'#ff6eb4')).join(' ')}<br>
        <em>${oSteps.join(', ')}</em> → <strong style="color:#6BCB77;">${oneAns}</strong>`)
      +bubble(`<strong style="color:var(--gold);">Left side (tens): ${newTens} − ${tS} = ${tenAns}</strong>`)
      +`<div style="text-align:center;margin:10px 0;">${colBox([{text:'  '+big},{text:'− '+String(small).padStart(pad,' ')},{text:'─────',color:'#9e8fc9'},{text:'  '+ans,color:'#6BCB77'}])}</div>`
      +bubble(`<strong style="color:#6BCB77;">✅ ${big} − ${small} = ${ans} 🌸</strong>`));
  }
}

// ── Core addition ─────────────────────────────────────────────
function addColumn(a,b){
  const oA=a%10,oB=b%10,tA=Math.floor(a/10),tB=Math.floor(b/10);
  const onesSum=oA+oB,needCarry=onesSum>9,onesWrite=onesSum%10,carry=Math.floor(onesSum/10),ans=a+b,pad=String(a).length;
  const bigO=Math.max(oA,oB),smO=Math.min(oA,oB);
  const oSteps=Array.from({length:smO},(_,i)=>bigO+i+1);
  if(!needCarry){
    return wrap('#6BCB77','➕',`${a} + ${b}`,
      bubble(`<strong style="color:var(--gold);">Right side (ones): ${oA} + ${oB}</strong><br>
        Count from <strong>${bigO}</strong> up <strong>${smO}</strong> step${smO!==1?'s':''}:<br>
        ${numChip(bigO,'#C77DFF')} → ${oSteps.map((n,i)=>numChip(n,i===oSteps.length-1?'#6BCB77':'#ff6eb4')).join(' ')}<br>
        ${oSteps.length?'<em>'+oSteps.join(', ')+'</em> → ':''}<strong style="color:#6BCB77;">${onesSum}</strong><br>
        ${onesSum} is 9 or less — <strong>no carrying needed</strong>.`)
      +bubble(`<strong style="color:var(--gold);">Left side (tens): ${tA} + ${tB} = ${tA+tB}</strong>`)
      +`<div style="text-align:center;margin:10px 0;">${colBox([{text:'  '+a},{text:'+ '+String(b).padStart(pad,' ')},{text:'─────',color:'#9e8fc9'},{text:'  '+ans,color:'#6BCB77'}])}</div>`
      +bubble(`<strong style="color:#6BCB77;">✅ ${a} + ${b} = ${ans} 🌸</strong>`));
  } else {
    return wrap('#6BCB77','➕',`${a} + ${b} (with carrying)`,
      bubble(`<strong style="color:var(--gold);">Right side (ones): ${oA} + ${oB}</strong><br>
        Count from <strong>${bigO}</strong> up <strong>${smO}</strong> step${smO!==1?'s':''}:<br>
        ${numChip(bigO,'#C77DFF')} → ${oSteps.map(n=>numChip(n,'#ff6eb4')).join(' ')}<br>
        Total = <strong>${onesSum}</strong><br>
        <strong style="color:#ff6eb4;">⚠️ ${onesSum} is bigger than 9!</strong> The biggest we can write on the right is 9.<br>
        So we write <strong style="color:#6BCB77;">${onesWrite}</strong> on the right and carry <strong style="color:#ffd700;">${carry}</strong> to the left.`)
      +bubble(`<strong style="color:var(--gold);">Left side (tens): ${tA} + ${tB} + ${carry} (carried) = ${tA+tB+carry}</strong>`)
      +`<div style="text-align:center;margin:10px 0;">${colBox([{text:'  '+carry,color:'#ffd700'},{text:'  '+a},{text:'+ '+String(b).padStart(pad,' ')},{text:'─────',color:'#9e8fc9'},{text:'  '+ans,color:'#6BCB77'}])}</div>`
      +bubble(`<strong style="color:#6BCB77;">✅ ${a} + ${b} = ${ans} 🌸</strong>`));
  }
}
// Guaranteed-carry version used by carry_add level
function addColumnCarry(a,b){ return addColumn(a,b); }

// ── Public named hints ────────────────────────────────────────
function hintAdd(a,b)       { return addColumn(a,b); }
function hintSub(a,b)       { return subtractColumn(a,b); }

function hintCarryAdd(a,b){
  const oA=a%10,oB=b%10,tA=Math.floor(a/10),tB=Math.floor(b/10);
  const onesSum=oA+oB,onesWrite=onesSum%10,carry=Math.floor(onesSum/10),ans=a+b,pad=String(a).length;
  const bigO=Math.max(oA,oB),smO=Math.min(oA,oB);
  const oSteps=Array.from({length:smO},(_,i)=>bigO+i+1);
  return wrap('#6BCB77','➕',`${a} + ${b} (with carrying)`,
    bubble(`<strong style="color:var(--gold);">Right side (ones): ${oA} + ${oB}</strong><br>
      Count from <strong>${bigO}</strong> up <strong>${smO}</strong> step${smO!==1?'s':''}:<br>
      ${numChip(bigO,'#C77DFF')} → ${oSteps.map(n=>numChip(n,'#ff6eb4')).join(' ')}<br>
      <em>${oSteps.join(', ')}</em> → Total = <strong>${onesSum}</strong><br><br>
      <strong style="color:#ff6eb4;">⚠️ ${onesSum} is bigger than 9!</strong> The biggest we can write on the right is 9.<br>
      So we write <strong style="color:#6BCB77;">${onesWrite}</strong> on the right and carry <strong style="color:#ffd700;">${carry}</strong> to the left.`)
    +bubble(`<strong style="color:var(--gold);">Left side (tens): ${tA} + ${tB} + ${carry} (carried) = ${tA+tB+carry}</strong>`)
    +`<div style="text-align:center;margin:10px 0;">${colBox([
        {text:'  '+carry,color:'#ffd700'},
        {text:'  '+a},
        {text:'+ '+String(b).padStart(pad,' ')},
        {text:'─────',color:'#9e8fc9'},
        {text:'  '+ans,color:'#6BCB77'}
      ])}</div>`
    +bubble(`<strong style="color:#6BCB77;">✅ ${a} + ${b} = ${ans} 🌸</strong>`));
}

function hintBorrowSub(a,b){
  const oA=a%10,oB=b%10,tA=Math.floor(a/10),tB=Math.floor(b/10);
  const borrowedOnes=oA+10,newTens=tA-1,oneAns=borrowedOnes-oB,tenAns=newTens-tB;
  const ans=a-b,pad=String(a).length;
  const oSteps=Array.from({length:oneAns},(_,i)=>oB+i+1);
  return wrap('#ff3366','➖',`${a} − ${b} (with borrowing)`,
    bubble(`<strong style="color:var(--gold);">Right side (ones):</strong> Is ${oA} bigger than or equal to ${oB}? <strong style="color:#ff3366;">NO ❌</strong><br>
      ${oA} is less than ${oB} — we need to <strong>borrow</strong>.`)
    +bubble(`<strong style="color:var(--gold);">Borrowing:</strong><br>
      Take 1 ten from the left: <strong>${tA} → ${newTens}</strong><br>
      Add that 10 to the right: <strong>${oA} → ${borrowedOnes}</strong> (because 10 + ${oA} = ${borrowedOnes})<br><br>
      <div style="text-align:center;">${colBox([
        {text:'  '+newTens,color:'#ffd700'},
        {text:'\u0336'+tA+'|'+oA+' \u2192 '+newTens+'|'+borrowedOnes,color:'#d4a8c7'},
        {text:'− '+String(b).padStart(pad,' ')},
        {text:'─────',color:'#9e8fc9'}
      ])}</div>`)
    +bubble(`<strong style="color:var(--gold);">Right side (ones): ${borrowedOnes} − ${oB}</strong><br>
      Count from ${oB} up to ${borrowedOnes}:<br>
      ${numChip(oB,'#C77DFF')} → ${oSteps.map((n,i)=>numChip(n,i===oSteps.length-1?'#6BCB77':'#ff6eb4')).join(' ')}<br>
      <em>${oSteps.join(', ')}</em> → <strong style="color:#6BCB77;">${oneAns}</strong>`)
    +bubble(`<strong style="color:var(--gold);">Left side (tens): ${newTens} − ${tB} = ${tenAns}</strong>`)
    +`<div style="text-align:center;margin:10px 0;">${colBox([
        {text:'  '+a},
        {text:'− '+String(b).padStart(pad,' ')},
        {text:'─────',color:'#9e8fc9'},
        {text:'  '+ans,color:'#6BCB77'}
      ])}</div>`
    +bubble(`<strong style="color:#6BCB77;">✅ ${a} − ${b} = ${ans} 🌸</strong>`));
}

// Missing add: a + ? = total  →  total − a
function hintMissingAddSimple(total,a){
  const ans=total-a;
  return wrap('#6BCB77','❓','MISSING NUMBER — ADDITION',
    bubble(`<strong style="color:var(--gold);">We have: ${a} + ? = ${total}</strong><br>
      We have <strong>${a}</strong> and a number we don't know. Together they make <strong>${total}</strong>.<br>
      To find the missing number, we subtract <strong>${a}</strong> from <strong>${total}</strong>.`)
    +subtractColumn(total,a)
    +bubble(`<strong style="color:#6BCB77;">✅ The missing number is ${ans} 🌸 &nbsp; Check: ${a} + ${ans} = ${total} ✓</strong>`));
}

// Missing sub: total − ? = result  →  total − result
function hintMissingSubSmall(total,result){
  const ans=total-result;
  return wrap('#ff3366','❓','MISSING NUMBER — SUBTRACTION',
    bubble(`<strong style="color:var(--gold);">We have: ${total} − ? = ${result}</strong><br>
      We subtract a number we don't know from <strong>${total}</strong> to get <strong>${result}</strong>.<br>
      To find the missing number, we subtract <strong>${result}</strong> from <strong>${total}</strong>.`)
    +subtractColumn(total,result)
    +bubble(`<strong style="color:#6BCB77;">✅ The missing number is ${ans} 🌸 &nbsp; Check: ${total} − ${ans} = ${result} ✓</strong>`));
}

// Missing 3-add: total = a + b + ?  →  step1: a+b, step2: total−(a+b)
function hintMissingThreeAdd(total,a,b){
  const known=a+b,ans=total-known;
  return wrap('#6BCB77','❓','MISSING NUMBER — THREE ADDENDS',
    bubble(`<strong style="color:var(--gold);">We have: ${total} = ${a} + ${b} + ?</strong><br>
      We know two numbers (${a} and ${b}) and the total (${total}). Let's find the third.`)
    +bubble(`<strong style="color:var(--gold);">Step 1 — Add the numbers we know: ${a} + ${b}</strong>`)
    +addColumn(a,b)
    +bubble(`<strong style="color:var(--gold);">Step 2 — Subtract from the total: ${total} − ${known}</strong>`)
    +subtractColumn(total,known)
    +bubble(`<strong style="color:#6BCB77;">✅ The missing number is ${ans} 🌸 &nbsp; Check: ${a} + ${b} + ${ans} = ${total} ✓</strong>`));
}

// Add three numbers
function hintAddThree(a,b,c){
  const step1=a+b,step2=step1+c;
  return wrap('#6BCB77','🧸',`${a} + ${b} + ${c}`,
    bubble(`<strong style="color:var(--gold);">We have three numbers to add: ${a} + ${b} + ${c}</strong><br>
      We add them <strong>two at a time</strong>. First add ${a} + ${b}, then add ${c} to the result.`)
    +bubble(`<strong style="color:var(--gold);">Step 1 — Add ${a} + ${b}:</strong>`)
    +addColumn(a,b)
    +bubble(`<strong style="color:var(--gold);">Step 2 — Add ${c} to the result (${step1} + ${c}):</strong>`)
    +addColumn(step1,c)
    +bubble(`<strong style="color:#6BCB77;">✅ ${a} + ${b} + ${c} = ${step2} 🌸</strong>`));
}

// Subtract three numbers
function hintSubThree(total,b,c){
  const step1=total-b,step2=step1-c;
  return wrap('#ff3366','🌺',`${total} − ${b} − ${c}`,
    bubble(`<strong style="color:var(--gold);">We have to subtract two numbers from ${total}.</strong><br>
      We subtract them <strong>one at a time</strong>. First subtract ${b}, then subtract ${c} from the result.`)
    +bubble(`<strong style="color:var(--gold);">Step 1 — Subtract ${b} from ${total}:</strong>`)
    +subtractColumn(total,b)
    +bubble(`<strong style="color:var(--gold);">Step 2 — Subtract ${c} from the result (${step1} − ${c}):</strong>`)
    +subtractColumn(step1,c)
    +bubble(`<strong style="color:#6BCB77;">✅ ${total} − ${b} − ${c} = ${step2} 🌸</strong>`));
}

// Compose add: find two pairs that sum to target
function hintComposeAdd(target){
  const e=target>10?7:3,ans=target-e,e2=e+3,ans2=target-e2;
  return wrap('#6BCB77','💎',`Make a Sum — two pairs that add to ${target}`,
    bubble(`<strong style="color:var(--gold);">We need TWO different pairs of numbers that add up to ${target}.</strong><br>
      Think of it like this: what two numbers fit together to make ${target}?`)
    +bubble(`<strong style="color:var(--gold);">Let's find the first pair.</strong><br>
      Pick any number less than ${target}. Let's use <strong>${e}</strong>.<br>
      So now we have: <strong>${e} + ? = ${target}</strong><br>
      To find the missing number, we subtract ${e} from ${target}:`)
    +subtractColumn(target,e)
    +bubble(`So our first pair is: ${numChip(e,'#ff6eb4')} + ${numChip(ans,'#6BCB77')} = ${numChip(target,'#ffd700')} ✅`)
    +bubble(`<strong style="color:var(--gold);">Now let's find the second pair.</strong><br>
      Pick a different number — not ${e}. Let's use <strong>${e2}</strong>.<br>
      So now we have: <strong>${e2} + ? = ${target}</strong><br>
      Subtract ${e2} from ${target}:`)
    +subtractColumn(target,e2)
    +bubble(`So our second pair is: ${numChip(e2,'#ff6eb4')} + ${numChip(ans2,'#6BCB77')} = ${numChip(target,'#ffd700')} ✅<br><br>
      <strong style="color:#6BCB77;">Now it's your turn, Safia! Choose your own two numbers and find their pairs. 🌸</strong>`));
}

// Compose sub: find two pairs with a given difference
function hintComposeSub(diff){
  const big=diff+2,small=big-diff,small2=3,big2=small2+diff;
  return wrap('#ff3366','🦋',`Find the Gap — two pairs with a difference of ${diff}`,
    bubble(`<strong style="color:var(--gold);">We need TWO different pairs where the bigger number minus the smaller equals ${diff}.</strong><br>
      The <strong>gap</strong> between the two numbers must always be ${diff}.`)
    +bubble(`<strong style="color:var(--gold);">🍪 Cookie Story:</strong><br>
      In a minus problem, the <strong>first number is always the Boss</strong> (the whole tray). The other numbers are the parts.`)
    +bubble(`<strong style="color:var(--gold);">Case 1 — We know the Boss: ${big} − ? = ${diff}</strong><br><br>
      "Safia, you have <strong>${big}</strong> cookies. You eat some, and <strong>${diff}</strong> are left. How many did you eat?"<br><br>
      Since we know the Boss is <strong>${big}</strong>, we <strong>subtract</strong> the ${diff} we still have:<br>
      <strong>${big} − ${diff} = ?</strong>`)
    +subtractColumn(big,diff)
    +bubble(`✅ <strong>${big} − ${small} = ${diff}</strong><br>
      Check: ${big} − ${small} = ${diff} ✓<br><br>
      <em>Rule: If we know the Big Boss, we subtract to find the missing friend.</em>`)
    +bubble(`<strong style="color:var(--gold);">Case 2 — The Boss is hiding: ? − ${small2} = ${diff}</strong><br><br>
      "Safia, there is a Mystery Bag of cookies. You take out <strong>${small2}</strong> and eat them. <strong>${diff}</strong> are still left. How many were in the bag at the start?"<br><br>
      To find the bag's starting amount, we put back the <strong>${small2}</strong> we took out.<br>
      We <strong>add</strong>: <strong>${diff} + ${small2} = ?</strong>`)
    +addColumn(diff,small2)
    +bubble(`✅ <strong>${big2} − ${small2} = ${diff}</strong><br>
      Check: ${big2} − ${small2} = ${diff} ✓<br><br>
      <em>Rule: If the Big Boss is hiding, we add the friends together to find him!</em>`)
    +bubble(`<strong style="color:var(--gold);">Summary for Safia:</strong><br>
      ${numChip(big,'#ffd700')} − <strong style="color:#ff6eb4;">?</strong> = ${numChip(diff,'#6BCB77')} &nbsp;→&nbsp; Boss is here → <strong>subtract</strong> (${big} − ${diff} = ${small})<br>
      <strong style="color:#ff6eb4;">?</strong> − ${numChip(small2,'#ff6eb4')} = ${numChip(diff,'#6BCB77')} &nbsp;→&nbsp; Boss is hiding → <strong>add</strong> (${diff} + ${small2} = ${big2})<br><br>
      <strong style="color:#6BCB77;">Now pick your own two pairs, Safia! 🌸</strong>`));
}

// Fact family
function hintFactFamily(a,b,total){
  return wrap('#C77DFF','🏰',`Fact Family — ${a}, ${b}, and ${total}`,
    bubble(`<strong style="color:var(--gold);">Every Fact Family has a "Math Family" with special roles:</strong><br><br>
      <div style="display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;margin:8px 0;">
        <div style="text-align:center;">
          <div style="background:#ffd700;color:#1a0a1e;border-radius:50%;width:60px;height:60px;display:inline-flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:bold;">${total}</div>
          <div style="color:#ffd700;font-size:.85rem;margin-top:4px;font-weight:800;">👑 BIG BOSS</div>
        </div>
        <div style="color:var(--muted);font-size:1.5rem;">↕</div>
        <div style="text-align:center;">
          <div style="background:#ff6eb4;color:#1a0a1e;border-radius:50%;width:50px;height:50px;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:bold;">${a}</div>
          <div style="color:#ff6eb4;font-size:.85rem;margin-top:4px;font-weight:800;">🤝 FRIEND</div>
        </div>
        <div style="text-align:center;">
          <div style="background:#ff6eb4;color:#1a0a1e;border-radius:50%;width:50px;height:50px;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:bold;">${b}</div>
          <div style="color:#ff6eb4;font-size:.85rem;margin-top:4px;font-weight:800;">🤝 FRIEND</div>
        </div>
      </div>`)
    +bubble(`<strong style="color:var(--gold);">➕ The PLUS rule — Friends join to make the Boss:</strong><br>
      <em>"The two Small Friends join together. It doesn't matter who stands first — they always equal the Big Boss."</em><br><br>
      <div style="display:flex;align-items:center;gap:8px;margin:6px 0;flex-wrap:wrap;">
        ${numChip(a,'#ff6eb4')} <span style="color:var(--gold);font-size:1.3rem;">+</span> ${numChip(b,'#ff6eb4')} <span style="color:#fff;font-size:1.3rem;">=</span> ${numChip(total,'#ffd700')} <span style="color:#6BCB77;">✅ Friend + Friend = Big Boss</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin:6px 0;flex-wrap:wrap;">
        ${numChip(b,'#ff6eb4')} <span style="color:var(--gold);font-size:1.3rem;">+</span> ${numChip(a,'#ff6eb4')} <span style="color:#fff;font-size:1.3rem;">=</span> ${numChip(total,'#ffd700')} <span style="color:#6BCB77;">✅ Friend + Friend = Big Boss</span>
      </div>`)
    +bubble(`<strong style="color:var(--gold);">➖ The MINUS rule — Boss gives to find a Friend:</strong><br>
      <em>"We ALWAYS start with the Big Boss. We take away one Small Friend to find the other Small Friend."</em><br><br>
      <div style="display:flex;align-items:center;gap:8px;margin:6px 0;flex-wrap:wrap;">
        ${numChip(total,'#ffd700')} <span style="color:#ff3366;font-size:1.3rem;">−</span> ${numChip(a,'#ff6eb4')} <span style="color:#fff;font-size:1.3rem;">=</span> ${numChip(b,'#6BCB77')} <span style="color:#6BCB77;">✅ Big Boss − Friend = Friend</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin:6px 0;flex-wrap:wrap;">
        ${numChip(total,'#ffd700')} <span style="color:#ff3366;font-size:1.3rem;">−</span> ${numChip(b,'#ff6eb4')} <span style="color:#fff;font-size:1.3rem;">=</span> ${numChip(a,'#6BCB77')} <span style="color:#6BCB77;">✅ Big Boss − Friend = Friend</span>
      </div>`)
    +bubble(`<strong style="color:#ff3366;">🍪 Why can't we write ${b} − ${a} = ${total}?</strong><br>
      "Safia, imagine you only have <strong>${b}</strong> cookies on your plate. Can someone eat <strong>${a}</strong> cookies and leave you with MORE than you started?${a>b?" No! You don't have enough!":""} The Big Boss <strong>${total}</strong> must always be the <strong>first</strong> number in a minus fact."`)
    +bubble(`<strong style="color:var(--gold);">🔎 Safia's Quick Check:</strong><br>
      <span style="color:#6BCB77;">✅ Plus fact?</span> The Big Boss <strong>(${total})</strong> must be <strong>at the END</strong> (after =)<br>
      <span style="color:#6BCB77;">✅ Minus fact?</span> The Big Boss <strong>(${total})</strong> must be <strong>at the FRONT</strong> (before −)<br>
      <span style="color:#ff3366;">❌ If you see a small number at the start of a minus — it needs fixing!</span>`)
    +bubble(`<strong style="color:#6BCB77;">✅ All four facts for ${a}, ${b}, ${total}:</strong><br>
      ${numChip(a,'#ff6eb4')} + ${numChip(b,'#ff6eb4')} = ${numChip(total,'#ffd700')} &nbsp;|&nbsp; ${numChip(b,'#ff6eb4')} + ${numChip(a,'#ff6eb4')} = ${numChip(total,'#ffd700')}<br>
      ${numChip(total,'#ffd700')} − ${numChip(a,'#ff6eb4')} = ${numChip(b,'#6BCB77')} &nbsp;|&nbsp; ${numChip(total,'#ffd700')} − ${numChip(b,'#ff6eb4')} = ${numChip(a,'#6BCB77')}`)
  );
}
function eqFactFamily(){
  // Never generate a===b — that gives only 2 unique facts, not 4
  let a,b,g=0;
  do{a=rnd(3,12);b=rnd(3,12);g++;}while(a===b&&g<200);
  const total=a+b;
  return{type:'fact_family',category:'equation',hasHint:true,question:`Using ${a}, ${b}, and ${total}, fill in all four facts:`,a,b,total,hint:hintFactFamily(a,b,total)};
}

// ============================================================
//  MONEY HINTS
// ============================================================
function coinChip(v){
  const label=v===25?'25¢':v===10?'10¢':v===5?'5¢':'1¢';
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--coin-gold),var(--card) 85%);border:2px solid var(--coin-silver);color:#1a0a1e;font-weight:900;font-size:.7rem;margin:2px;">${label}</span>`;
}
function coinRow(coins){return coins.map(v=>coinChip(v)).join('');}
function hintMoneyCount(coins){
  const total=coins.reduce((a,b)=>a+b,0);
  let running=0;const steps=coins.map(v=>{running+=v;return running;});
  return wrap('#ffd700','🪙','Counting Coins',
    bubble(`We have these coins:<br>${coinRow(coins)}`)
    +bubble(`Count up one coin at a time: ${coins.map(v=>'+'+v).join(' ')}<br>Running total: ${steps.join('¢, ')}¢`)
    +bubble(`<strong style="color:#6BCB77;">✅ Total = ${total}¢ 🌸</strong>`));
}
function hintMoneyMake(target,combo){
  return wrap('#ffd700','🪙',`Make ${target}¢`,
    bubble(`Tap coins that add up to exactly <strong>${target}¢</strong>.`)
    +bubble(`One way: ${coinRow(combo)} → ${combo.join('¢ + ')}¢ = <strong style="color:#6BCB77;">${target}¢</strong> 🌸<br><em>There might be other ways too — any combo that adds up to ${target}¢ works!</em>`));
}

// ============================================================
//  TIME HINTS
// ============================================================
function clockFaceSvg(hour,minute){
  const cx=60,cy=60;
  const hourAngle=((hour%12)+minute/60)*30-90;
  const minuteAngle=minute*6-90;
  const hx=(cx+28*Math.cos(hourAngle*Math.PI/180)).toFixed(1),hy=(cy+28*Math.sin(hourAngle*Math.PI/180)).toFixed(1);
  const mx=(cx+44*Math.cos(minuteAngle*Math.PI/180)).toFixed(1),my=(cy+44*Math.sin(minuteAngle*Math.PI/180)).toFixed(1);
  const ticks=Array.from({length:12},(_,i)=>{
    const a=i*30-90,r1=46,r2=52;
    const x1=(cx+r1*Math.cos(a*Math.PI/180)).toFixed(1),y1=(cy+r1*Math.sin(a*Math.PI/180)).toFixed(1);
    const x2=(cx+r2*Math.cos(a*Math.PI/180)).toFixed(1),y2=(cy+r2*Math.sin(a*Math.PI/180)).toFixed(1);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--border)" stroke-width="2"/>`;
  }).join('');
  // NOTE: must stay a single line — renderQuestion() runs q.question.replace(/\n/g,'<br>')
  // on the whole question string, and a stray <br> inside <svg> breaks HTML5's foreign-content
  // parsing rules, silently dropping every element after it.
  return `<svg width="150" height="150" viewBox="0 0 120 120" style="display:block;margin:10px auto;">`
    +`<circle cx="${cx}" cy="${cy}" r="54" fill="var(--clock-face)" stroke="var(--border)" stroke-width="4"/>`
    +ticks
    +`<line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="var(--clock-hand)" stroke-width="5" stroke-linecap="round"/>`
    +`<line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="var(--clock-hand)" stroke-width="3" stroke-linecap="round"/>`
    +`<circle cx="${cx}" cy="${cy}" r="4" fill="var(--gold)"/>`
    +`</svg>`;
}
function formatTime(hour,minute){const h12=hour%12===0?12:hour%12;return `${h12}:${minute===0?'00':minute}`;}
function hintTime(hour,minute){
  return wrap('#ffd700','⏰','Reading the Clock',
    bubble(`The short hand (hour hand) points close to <strong>${hour}</strong>.`)
    +bubble(minute===0
      ?`The long hand (minute hand) points straight up at <strong>12</strong> — that means it's exactly <strong>${hour} o'clock</strong>.`
      :`The long hand (minute hand) points straight down at <strong>6</strong> — that means it's <strong>half past ${hour}</strong>.`)
    +bubble(`<strong style="color:#6BCB77;">✅ The time is ${formatTime(hour,minute)} 🌸</strong>`));
}

// ============================================================
//  COMPARING HINTS
// ============================================================
function hintCompareSymbol(a,b,sym){
  const word=sym==='<'?'smaller than':sym==='>'?'bigger than':'the same as';
  return wrap('#ffd700','⚖️',`Comparing ${a} and ${b}`,
    bubble(`Which number is bigger — <strong>${a}</strong> or <strong>${b}</strong>?<br>Think of a number line: numbers further right are bigger.`)
    +bubble(`<strong>${a}</strong> is ${word} <strong>${b}</strong>.`)
    +bubble(`<strong style="color:#6BCB77;">✅ ${a} ${sym} ${b} 🌸</strong>`));
}
function hintTrueFalse(a,b,shown,sum){
  return wrap('#ffd700','🔎','Is It True?',
    bubble(`Let's check: ${a} + ${b} = ?`)
    +addColumn(a,b)
    +bubble(shown===sum
      ?`The equation says ${a} + ${b} = ${shown}, and that's exactly right!<br><strong style="color:#6BCB77;">✅ TRUE</strong> 🌸`
      :`The equation says ${a} + ${b} = ${shown}, but we just worked out it's really ${sum}.<br><strong style="color:#ff3366;">❌ FALSE</strong> — the real answer is ${sum}.`));
}
function hintDouble(n){
  return wrap('#6BCB77','✨',`Double ${n}`,
    bubble(`Doubling means adding a number to itself: <strong>${n} + ${n}</strong>.`)
    +addColumn(n,n)
    +bubble(`<strong style="color:#6BCB77;">✅ Double ${n} = ${2*n} 🌸</strong>`));
}
function hintNearDouble(n){
  const m=n+1;
  return wrap('#6BCB77','✨',`${n} + ${m} (a near double!)`,
    bubble(`${n} and ${m} are almost the same number! Double ${n} is <strong>${2*n}</strong>.`)
    +bubble(`${m} is just <strong>1 more</strong> than ${n}, so ${n} + ${m} is just <strong>1 more</strong> than double ${n}.`)
    +bubble(`<strong style="color:#6BCB77;">✅ ${n} + ${m} = ${2*n} + 1 = ${n+m} 🌸</strong>`));
}

// ============================================================
//  LEVEL GENERATORS (identical logic, themed flavour text)
// ============================================================
function eqCounting(){if(rnd(0,1)===0){const a=rnd(2,14),b=rnd(1,6);return{type:'counting_add',category:'equation',hasHint:true,question:`${a} + ${b} = ?`,answer:a+b,hint:addColumn(a,b)};}else{const a=rnd(6,18),b=rnd(1,5);return{type:'counting_sub',category:'equation',hasHint:true,question:`${a} − ${b} = ?`,answer:a-b,hint:subtractColumn(a,b)};}}
function eqGrouping(){const t=rnd(0,1);if(t===0){const tens=rnd(1,7),ones=rnd(0,9),total=tens*10+ones;const hint=`<div style="background:var(--card);border-radius:14px;padding:12px;color:var(--text);">${numChip(tens,'#ff6eb4')} tens = <strong>${tens*10}</strong>, plus ${numChip(ones,'#ffd700')} ones = <strong>${ones}</strong><br>So: ${tens*10} + ${ones} = <strong style="color:#6BCB77;">${total}</strong> 🌸</div>`;return{type:'grouping',category:'equation',hasHint:true,question:`${tens} tens and ${ones} ones = ?`,answer:total,hint};}else{const n=rnd(11,79),tens=Math.floor(n/10),ones=n%10;const hint=`<div style="background:var(--card);border-radius:14px;padding:12px;color:var(--text);">${n} = <strong>${tens}</strong> tens and <strong style="color:#ffd700;">${ones}</strong> ones<br>The ones digit is the number on the right: <strong style="color:#6BCB77;">${ones}</strong> 🌸</div>`;return{type:'grouping',category:'equation',hasHint:true,question:`${n} = ___ tens and ___ ones.\nHow many ones?`,answer:ones,hint};}}
function eqMissingAdd(){
  const t=rnd(0,3);
  if(t===0){const a=rnd(2,9),total=rnd(a+3,18),ans=total-a;return{type:'missing_add',category:'equation',hasHint:true,question:`? + ${a} = ${total}`,answer:ans,hint:hintMissingAddSimple(total,a)};}
  if(t===1){const a=rnd(2,9),total=rnd(a+3,18),ans=total-a;return{type:'missing_add',category:'equation',hasHint:true,question:`${a} + ? = ${total}`,answer:ans,hint:hintMissingAddSimple(total,a)};}
  if(t===2){const total=rnd(12,25),result=rnd(5,total-3),ans=total-result;return{type:'missing_add',category:'equation',hasHint:true,question:`${total} − ? = ${result}`,answer:ans,hint:hintMissingSubSmall(total,result)};}
  const a=rnd(3,8),b=rnd(3,8),total=rnd(a+b+3,30),ans=total-a-b;return{type:'missing_add',category:'equation',hasHint:true,question:`${total} = ${a} + ${b} + ?`,answer:ans,hint:hintMissingThreeAdd(total,a,b)};
}
function eqCarryAdd(){let a,b,g=0;do{a=rnd(14,67);b=rnd(13,55);g++;}while(((a%10)+(b%10)<10||a+b>99)&&g<200);return{type:'carry_add',category:'equation',hasHint:true,question:`${a} + ${b} = ?`,answer:a+b,hint:hintCarryAdd(a,b)};}
function eqBorrowSub(){let a,b,g=0;do{a=rnd(22,91);b=rnd(13,a-5);g++;}while(((a%10)>=(b%10)||a-b<5)&&g<200);return{type:'borrow_sub',category:'equation',hasHint:true,question:`${a} − ${b} = ?`,answer:a-b,hint:hintBorrowSub(a,b)};}
function eqAddThree(){let a,b,c,g=0;do{a=rnd(10,33);b=rnd(10,33);c=rnd(10,33);g++;}while((a+b+c>95||a+b+c<38)&&g<200);return{type:'add_three',category:'equation',hasHint:true,question:`${a} + ${b} + ${c} = ?`,answer:a+b+c,hint:hintAddThree(a,b,c)};}
function eqSubThree(){let total,b,c,g=0;do{total=rnd(45,85);b=rnd(12,total-15);c=rnd(8,total-b-5);g++;}while((total-b-c<10||total-b-c>40)&&g<200);return{type:'sub_three',category:'equation',hasHint:true,question:`${total} − ${b} − ${c} = ?`,answer:total-b-c,hint:hintSubThree(total,b,c)};}
function eqComposeAdd(){const targets=[10,12,14,15,16,18,20,22,24,25];const target=targets[rnd(0,targets.length-1)];return{type:'compose_add',category:'equation',hasHint:true,question:`Find TWO ways to make <strong>${target}</strong> by adding two numbers.`,target,hint:hintComposeAdd(target)};}
function eqComposeSub(){const diffs=[4,5,6,7,8,9,10,11,12];const diff=diffs[rnd(0,diffs.length-1)];return{type:'compose_sub',category:'equation',hasHint:true,question:`Find TWO pairs with a difference of <strong>${diff}</strong>.`,target:diff,hint:hintComposeSub(diff)};}
const LOGIC_EMOJI_POOL=['🌸','🎀','🍑','🌺','👑','🧸','🦋','⭐','🔴','🟡','🔵','🟢'];
function eqLogic(){
  const t=rnd(0,3);
  if(t===0){
    const p=[{pattern:"🌸🎀🌸🎀",next:"🌸"},{pattern:"🍑🌺🍑🌺",next:"🍑"},{pattern:"👑🧸👑🧸",next:"👑"}][rnd(0,2)];
    const distractors=shuffle(LOGIC_EMOJI_POOL.filter(e=>e!==p.next&&!p.pattern.includes(e))).slice(0,3);
    const choices=shuffle([{label:p.next,correct:true},...distractors.map(l=>({label:l,correct:false}))]);
    return{type:'logic',kind:'multiple_choice',hasHint:true,question:`What comes next?\n${p.pattern} __?`,choices,hint:wrap('#6BCB77','🧠','Patterns',bubble(`The pattern repeats: <strong>${p.pattern}</strong> — look at what comes after each pair!`)+bubble(`<strong style="color:#6BCB77;">✅ Next is ${p.next}! 🌸</strong>`))};
  }
  if(t===1){
    const p=[{q:"If it's raining, we use an umbrella.\nIt is raining today. What do we use?",correct:"Umbrella",choices:["Umbrella","A fan","Sunglasses","A kite"]},{q:"Finish your vegetables → get dessert.\nSafia finished her vegetables. Does she get dessert?",correct:"Yes",choices:["Yes","No"]}][rnd(0,1)];
    const choices=shuffle(p.choices.map(c=>({label:c,correct:c===p.correct})));
    return{type:'logic',kind:'multiple_choice',hasHint:true,question:p.q,choices,hint:wrap('#6BCB77','🧠','Think It Through',bubble(`Read the rule carefully, then follow it for Safia's situation.`)+bubble(`<strong style="color:#6BCB77;">✅ ${p.correct}! 🌸</strong>`))};
  }
  if(t===2){
    const p=[{q:"Which doesn't belong?\n🌸🌺🧸🌻",answer:"🧸",options:["🌸","🌺","🧸","🌻"]},{q:"Which doesn't belong?\n🔴🟡🔵🟢⭐",answer:"⭐",options:["🔴","🟡","🔵","🟢","⭐"]}][rnd(0,1)];
    const choices=shuffle(p.options.map(o=>({label:o,correct:o===p.answer})));
    return{type:'logic',kind:'multiple_choice',hasHint:true,question:p.q,choices,hint:wrap('#6BCB77','🧠','Odd One Out',bubble(`Most of these belong to the same group — one is different!`)+bubble(`<strong style="color:#6BCB77;">✅ ${p.answer} doesn't belong! 🌸</strong>`))};
  }
  const p=[{q:"What comes next?\n2, 4, 6, 8, __?",answer:10,step:2},{q:"What comes next?\n5, 10, 15, 20, __?",answer:25,step:5}][rnd(0,1)];
  return{type:'logic',kind:'numeric',hasHint:true,question:p.q,answer:p.answer,hint:wrap('#6BCB77','🧠','Number Patterns',bubble(`Each number is <strong>${p.step}</strong> more than the last one.`)+bubble(`<strong style="color:#6BCB77;">✅ ${p.answer}! 🌸</strong>`))};
}

// ── Money ────────────────────────────────────────────────────
const COIN_VALUES=[1,5,10,25];
function eqMoney(){
  const t=rnd(0,2);
  if(t===0){
    const n=rnd(2,4);
    const coins=Array.from({length:n},()=>COIN_VALUES[rnd(0,3)]);
    const total=coins.reduce((a,b)=>a+b,0);
    return{type:'money_count',kind:'numeric',hasHint:true,question:`How many cents is this?<br>${coinRow(coins)}`,answer:total,hint:hintMoneyCount(coins)};
  }
  if(t===1){
    const combo=Array.from({length:rnd(2,3)},()=>COIN_VALUES[rnd(0,3)]);
    const target=combo.reduce((a,b)=>a+b,0);
    const distractors=Array.from({length:rnd(1,2)},()=>COIN_VALUES[rnd(0,3)]);
    const coins=shuffle([...combo,...distractors]);
    return{type:'money_make',kind:'coin_picker',hasHint:true,question:`Tap coins to make exactly <strong>${target}¢</strong>.`,coins,target,hint:hintMoneyMake(target,combo)};
  }
  const opts=[{q:5,a:'nickel'},{q:10,a:'dime'},{q:25,a:'quarter'}][rnd(0,2)];
  return{type:'money_equiv',kind:'numeric',hasHint:true,question:`How many pennies (1¢) equal one ${opts.a} (${opts.q}¢)?`,answer:opts.q,
    hint:wrap('#ffd700','🪙',`Pennies in a ${opts.a}`,bubble(`A ${opts.a} is worth ${opts.q}¢, and each penny is worth 1¢.<br>So it takes <strong style="color:#6BCB77;">${opts.q}</strong> pennies to equal one ${opts.a}! 🌸`))};
}

// ── Time ─────────────────────────────────────────────────────
function eqTime(){
  const hour=rnd(1,12),minute=rnd(0,1)*30;
  const correct=formatTime(hour,minute);
  const distractors=new Set();
  while(distractors.size<3){
    const dh=rnd(1,12),dm=rnd(0,1)*30,label=formatTime(dh,dm);
    if(label!==correct)distractors.add(label);
  }
  const choices=shuffle([{label:correct,correct:true},...[...distractors].map(l=>({label:l,correct:false}))]);
  return{type:'time_read',kind:'multiple_choice',hasHint:true,question:`What time does this clock show?${clockFaceSvg(hour,minute)}`,choices,hint:hintTime(hour,minute)};
}

// ── Comparing (symbols, true/false, doubles) ────────────────────
function eqCompare(){
  const t=rnd(0,2);
  if(t===0){
    const a=rnd(1,50);
    const b=rnd(0,3)===0?a:rnd(1,50);
    const sym=a<b?'<':a>b?'>':'=';
    const choices=shuffle(['<','>','='].map(s=>({label:s,correct:s===sym})));
    return{type:'compare_symbol',kind:'multiple_choice',hasHint:true,question:`${a} ___ ${b}`,choices,hint:hintCompareSymbol(a,b,sym)};
  }
  if(t===1){
    const a=rnd(2,15),b=rnd(2,15),sum=a+b;
    const showFalse=rnd(0,1)===0;
    let shown=sum;
    if(showFalse){let g=0;do{shown=sum+(rnd(1,3)*(rnd(0,1)?1:-1));g++;}while((shown===sum||shown<0)&&g<50);}
    const correct=shown===sum;
    const choices=[{label:'✅ True',correct:correct},{label:'❌ False',correct:!correct}];
    return{type:'compare_truefalse',kind:'multiple_choice',hasHint:true,question:`${a} + ${b} = ${shown}. True or False?`,choices,hint:hintTrueFalse(a,b,shown,sum)};
  }
  const n=rnd(1,10);
  if(rnd(0,1)===0)return{type:'compare_double',kind:'numeric',hasHint:true,question:`Double ${n} = ${n} + ${n} = ?`,answer:2*n,hint:hintDouble(n)};
  return{type:'compare_double',kind:'numeric',hasHint:true,question:`${n} + ${n+1} = ? <br><span style="font-size:.8em;color:var(--muted);">(near double!)</span>`,answer:n+(n+1),hint:hintNearDouble(n)};
}

// ── Fractions ────────────────────────────────────────────────
function pieSliceSvg(parts,shadedCount){const cx=50,cy=50,r=44;let svg=`<svg width="100" height="100" viewBox="0 0 100 100">`;for(let i=0;i<parts;i++){const a0=(i/parts)*2*Math.PI-Math.PI/2,a1=((i+1)/parts)*2*Math.PI-Math.PI/2;const x0=(cx+r*Math.cos(a0)).toFixed(1),y0=(cy+r*Math.sin(a0)).toFixed(1);const x1=(cx+r*Math.cos(a1)).toFixed(1),y1=(cy+r*Math.sin(a1)).toFixed(1);const largeArc=(a1-a0)>Math.PI?1:0;const fill=i<shadedCount?'var(--pink)':'var(--card)';svg+=`<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${largeArc} 1 ${x1},${y1} Z" fill="${fill}" stroke="var(--border)" stroke-width="2"/>`;}svg+=`</svg>`;return svg;}
function hintFraction(parts,shaded,label){const wholeWord=parts===2?'2 equal parts (halves)':'4 equal parts (fourths)';return wrap('#C77DFF','🍕',`Understanding ${label}`,bubble(`The shape is cut into <strong>${wholeWord}</strong>.`)+bubble(`${shaded} out of ${parts} parts are shaded pink, so that's <strong style="color:#6BCB77;">${label}</strong> shaded! 🌸`)+`<div style="text-align:center;">${pieSliceSvg(parts,shaded)}</div>`);}
function eqFractions(){
  const parts=rnd(0,1)===0?2:4;
  const shaded=rnd(1,parts-1);
  const targetLabel=`${shaded}/${parts}`;
  const pool=[];[2,4].forEach(p=>{for(let s=1;s<p;s++)pool.push({p,s});});
  const distractors=shuffle(pool.filter(o=>!(o.p===parts&&o.s===shaded))).slice(0,3);
  const options=shuffle([{p:parts,s:shaded,correct:true},...distractors.map(d=>({...d,correct:false}))]);
  const choices=options.map(o=>({label:pieSliceSvg(o.p,o.s),correct:o.correct}));
  return{type:'fraction_identify',kind:'multiple_choice',hasHint:true,question:`Which shape has <strong>${targetLabel}</strong> shaded?`,choices,hint:hintFraction(parts,shaded,targetLabel)};
}

// ── Number Sense (skip-counting, ordinals, number words) ───────
const ORDINAL_WORDS=['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th'];
const NUMBER_WORDS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
function eqNumberSense(){
  const t=rnd(0,2);
  if(t===0){
    const step=[2,5,10][rnd(0,2)];
    const start=rnd(0,4)*step;
    const seq=[start,start+step,start+2*step,start+3*step];
    const answer=start+4*step;
    return{type:'skip_count',kind:'numeric',hasHint:true,question:`${seq.join(', ')}, __?`,answer,hint:wrap('#6BCB77','🔢',`Skip Counting by ${step}s`,bubble(`Each number is <strong>${step}</strong> more than the last: ${seq.join(' → ')} → ?`)+bubble(`<strong style="color:#6BCB77;">✅ ${seq[3]} + ${step} = ${answer} 🌸</strong>`))};
  }
  if(t===1){
    const n=rnd(1,10);
    const correct=ORDINAL_WORDS[n-1];
    const distractors=shuffle(ORDINAL_WORDS.filter(w=>w!==correct)).slice(0,3);
    const choices=shuffle([{label:correct,correct:true},...distractors.map(l=>({label:l,correct:false}))]);
    return{type:'ordinal',kind:'multiple_choice',hasHint:true,question:`Safia is number ${n} in line. What is her place called?`,choices,hint:wrap('#6BCB77','🏅','Ordinal Numbers',bubble(`Ordinal numbers tell us the ORDER of something: 1st, 2nd, 3rd, 4th...`)+bubble(`Number <strong>${n}</strong> in order is called <strong style="color:#6BCB77;">${correct}</strong>! 🌸`))};
  }
  const n=rnd(1,20);
  const correct=NUMBER_WORDS[n];
  return{type:'number_word',kind:'numeric',hasHint:true,question:`What number is this word? "<strong>${correct}</strong>"`,answer:n,hint:wrap('#6BCB77','🔤','Number Words',bubble(`"${correct}" is how we write the number <strong style="color:#6BCB77;">${n}</strong> in words! 🌸`))};
}

// ── Data & Graphs ────────────────────────────────────────────
function barChartHtml(items){const max=Math.max(...items.map(i=>i.value));const bars=items.map((it,i)=>{const h=10+Math.round((it.value/max)*80);const color=`var(--chart-${(i%4)+1})`;return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:0;"><div style="font-weight:900;color:${color};font-size:.85rem;">${it.value}</div><div style="width:100%;max-width:36px;height:${h}px;background:${color};border-radius:6px 6px 0 0;margin:0 auto;"></div><div style="font-size:1.3rem;">${it.emoji}</div><div style="font-size:.6rem;color:var(--muted);text-align:center;">${it.label}</div></div>`;}).join('');return `<div style="display:flex;align-items:flex-end;justify-content:center;gap:8px;padding:12px 8px 6px;background:var(--card);border-radius:16px;margin:10px 0;">${bars}</div>`;}
function eqDataGraphs(){
  const pool=[{label:'Bows',emoji:'🎀'},{label:'Stickers',emoji:'🌸'},{label:'Labubus',emoji:'🧸'},{label:'Crowns',emoji:'👑'}];
  let items,g=0;
  do{items=shuffle(pool).slice(0,rnd(3,4)).map(c=>({...c,value:rnd(1,12)}));g++;}while(new Set(items.map(i=>i.value)).size<items.length&&g<50);
  const chart=barChartHtml(items);
  const t=rnd(0,2);
  if(t===0){
    const maxVal=Math.max(...items.map(i=>i.value));
    const correctItem=items.find(i=>i.value===maxVal);
    const choices=shuffle(items.map(i=>({label:i.label,correct:i===correctItem})));
    return{type:'graph_most',kind:'multiple_choice',hasHint:true,question:`Which has the MOST?${chart}`,choices,hint:wrap('#ffd700','📊','Reading the Graph',bubble(`Look for the <strong>tallest</strong> bar!`)+bubble(`<strong style="color:#6BCB77;">✅ ${correctItem.label} has the most, with ${maxVal}! 🌸</strong>`))};
  }
  if(t===1){
    const [a,b]=shuffle(items).slice(0,2);
    const bigger=a.value>b.value?a:b,smaller=a.value>b.value?b:a;
    return{type:'graph_diff',kind:'numeric',hasHint:true,question:`How many more ${bigger.label} than ${smaller.label}?${chart}`,answer:bigger.value-smaller.value,hint:wrap('#ffd700','📊','Comparing Bars',bubble(`${bigger.label}: ${bigger.value}, ${smaller.label}: ${smaller.value}`)+subtractColumn(bigger.value,smaller.value))};
  }
  const total=items.reduce((s,i)=>s+i.value,0);
  return{type:'graph_total',kind:'numeric',hasHint:true,question:`What is the total of all the bars?${chart}`,answer:total,hint:wrap('#ffd700','📊','Adding It All Up',bubble(`Add every bar together: ${items.map(i=>i.value).join(' + ')} = <strong style="color:#6BCB77;">${total}</strong> 🌸`))};
}

// ── Shapes & Measurement ─────────────────────────────────────
const SHAPE_SIDES={circle:0,square:4,rectangle:4,triangle:3,pentagon:5,hexagon:6};
const SHAPE_NAMES={circle:'Circle',square:'Square',rectangle:'Rectangle',triangle:'Triangle',pentagon:'Pentagon',hexagon:'Hexagon'};
function shapeSvg(type){const common='width="100" height="100" viewBox="0 0 100 100"',style='fill="var(--pink)" stroke="var(--border)" stroke-width="4"';if(type==='circle')return `<svg ${common}><circle cx="50" cy="50" r="40" ${style}/></svg>`;if(type==='square')return `<svg ${common}><rect x="14" y="14" width="72" height="72" ${style}/></svg>`;if(type==='rectangle')return `<svg ${common}><rect x="8" y="26" width="84" height="48" ${style}/></svg>`;if(type==='triangle')return `<svg ${common}><polygon points="50,10 90,90 10,90" ${style}/></svg>`;if(type==='pentagon')return `<svg ${common}><polygon points="50,8 90,38 75,88 25,88 10,38" ${style}/></svg>`;return `<svg ${common}><polygon points="30,10 70,10 92,50 70,90 30,90 8,50" ${style}/></svg>`;}
function lengthBlocksHtml(n){return Array.from({length:n},()=>`<span style="display:inline-block;width:22px;height:22px;background:var(--chart-1);border:2px solid var(--border);border-radius:4px;margin:1px;"></span>`).join('');}
function eqShapes(){
  const shapes=['circle','square','rectangle','triangle','pentagon','hexagon'];
  const t=rnd(0,2);
  if(t===0){
    const shape=shapes[rnd(0,5)],sides=SHAPE_SIDES[shape];
    return{type:'shape_sides',kind:'numeric',hasHint:true,question:`How many straight sides does this shape have?${shapeSvg(shape)}`,answer:sides,hint:wrap('#C77DFF','🔺',`${SHAPE_NAMES[shape]} Sides`,bubble(sides===0?`A circle is round all the way — it has <strong style="color:#6BCB77;">no straight sides</strong>! 🌸`:`Count each straight edge: a ${SHAPE_NAMES[shape].toLowerCase()} has <strong style="color:#6BCB77;">${sides}</strong> sides! 🌸`))};
  }
  if(t===1){
    const shape=shapes[rnd(0,5)];
    const distractors=shuffle(shapes.filter(s=>s!==shape)).slice(0,3);
    const choices=shuffle([{label:SHAPE_NAMES[shape],correct:true},...distractors.map(s=>({label:SHAPE_NAMES[s],correct:false}))]);
    return{type:'shape_name',kind:'multiple_choice',hasHint:true,question:`What shape is this?${shapeSvg(shape)}`,choices,hint:wrap('#C77DFF','🔺','Naming Shapes',bubble(`This shape has ${SHAPE_SIDES[shape]===0?'no straight sides — it is round':SHAPE_SIDES[shape]+' sides'}.`)+bubble(`<strong style="color:#6BCB77;">✅ It's a ${SHAPE_NAMES[shape]}! 🌸</strong>`))};
  }
  const n=rnd(3,10);
  return{type:'length_blocks',kind:'numeric',hasHint:true,question:`How many blocks long is this? ${lengthBlocksHtml(n)}`,answer:n,hint:wrap('#C77DFF','📏','Measuring Length',bubble(`Count each block one at a time, left to right.`)+bubble(`<strong style="color:#6BCB77;">✅ It's ${n} blocks long! 🌸</strong>`))};
}

// ── Calendar ─────────────────────────────────────────────────
const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const SEASONS=['Spring','Summer','Autumn','Winter'];
function eqCalendar(){
  const t=rnd(0,2);
  if(t===0){
    const i=rnd(0,6),dir=rnd(0,1);
    const correct=dir===0?DAYS[(i+1)%7]:DAYS[(i+6)%7];
    const distractors=shuffle(DAYS.filter(d=>d!==correct)).slice(0,3);
    const choices=shuffle([{label:correct,correct:true},...distractors.map(l=>({label:l,correct:false}))]);
    return{type:'calendar_day',kind:'multiple_choice',hasHint:true,question:dir===0?`What day comes AFTER ${DAYS[i]}?`:`What day comes BEFORE ${DAYS[i]}?`,choices,hint:wrap('#ff85c8','📅','Days of the Week',bubble(`The days in order: ${DAYS.join(' → ')} → (back to ${DAYS[0]})`)+bubble(`<strong style="color:#6BCB77;">✅ ${correct}! 🌸</strong>`))};
  }
  if(t===1){
    const i=rnd(0,11),dir=rnd(0,1);
    const correct=MONTHS[dir===0?(i+1)%12:(i+11)%12];
    const distractors=shuffle(MONTHS.filter(m=>m!==correct)).slice(0,3);
    const choices=shuffle([{label:correct,correct:true},...distractors.map(l=>({label:l,correct:false}))]);
    return{type:'calendar_month',kind:'multiple_choice',hasHint:true,question:dir===0?`What month comes AFTER ${MONTHS[i]}?`:`What month comes BEFORE ${MONTHS[i]}?`,choices,hint:wrap('#ff85c8','📅','Months of the Year',bubble(`The 12 months in order: ${MONTHS.join(', ')}`)+bubble(`<strong style="color:#6BCB77;">✅ ${correct}! 🌸</strong>`))};
  }
  const clue=[{clue:'It is snowing and very cold outside ❄️.',answer:'Winter'},{clue:'Flowers are blooming and it rains a little 🌸.',answer:'Spring'},{clue:'It is hot and Safia goes swimming ☀️.',answer:'Summer'},{clue:'Leaves are falling and turning orange 🍂.',answer:'Autumn'}][rnd(0,3)];
  const distractors=shuffle(SEASONS.filter(s=>s!==clue.answer)).slice(0,3);
  const choices=shuffle([{label:clue.answer,correct:true},...distractors.map(l=>({label:l,correct:false}))]);
  return{type:'calendar_season',kind:'multiple_choice',hasHint:true,question:`${clue.clue} Which season is it?`,choices,hint:wrap('#ff85c8','📅','Seasons',bubble(`The 4 seasons in order: ${SEASONS.join(' → ')} → (back to ${SEASONS[0]})`)+bubble(`<strong style="color:#6BCB77;">✅ ${clue.answer}! 🌸</strong>`))};
}

// ── Grand Finale — mixed review grab-bag ────────────────────
function eqCombo(){
  const generators=[eqCarryAdd,eqBorrowSub,eqMissingAdd,eqCompare,eqMoney,eqTime];
  return generators[rnd(0,generators.length-1)]();
}

const wordsCounting=[
  {type:'word',question:"Safia has 8 🌸 stickers. Mum gives 5 more. How many now?",answer:13,hint:addColumn(8,5)},
  {type:'word',question:"14 🎀 bows on a shelf. 6 fall off. How many left?",answer:8,hint:subtractColumn(14,6)},
  {type:'word',question:"Safia counted 9 🌸 stickers, then found 4 more under her pillow. How many now?",answer:13,hint:addColumn(9,4)},
  {type:'word',question:"Safia had 17 🎀 bows. She gave 5 to her sister. How many are left?",answer:12,hint:subtractColumn(17,5)},
  {type:'word',question:"Safia sees 6 crowns 👑 on the shelf and 7 more in the box. How many crowns in total?",answer:13,hint:addColumn(6,7)}
];
const wordsGrouping=[
  {type:'word',question:"3 bundles of 10 🌺 flowers + 4 loose. How many total?",answer:34,hint:wrap('#6BCB77','🎀','Tens and Ones',bubble(`3 tens = <strong>30</strong>, plus 4 ones = <strong>4</strong><br>30 + 4 = <strong style="color:#6BCB77;">34</strong> 🌸`))},
  {type:'word',question:"2 bundles of 10 🎀 bows + 7 loose. How many total?",answer:27,hint:wrap('#6BCB77','🎀','Tens and Ones',bubble(`2 tens = <strong>20</strong>, plus 7 ones = <strong>7</strong><br>20 + 7 = <strong style="color:#6BCB77;">27</strong> 🌸`))},
  {type:'word',question:"46 has how many tens?",answer:4,hint:wrap('#6BCB77','🎀','Tens and Ones',bubble(`46 = <strong>4</strong> tens and <strong>6</strong> ones. The tens digit is <strong style="color:#6BCB77;">4</strong> 🌸`))},
  {type:'word',question:"5 bundles of 10 🍑 peaches + 3 loose. How many total?",answer:53,hint:wrap('#6BCB77','🎀','Tens and Ones',bubble(`5 tens = <strong>50</strong>, plus 3 ones = <strong>3</strong><br>50 + 3 = <strong style="color:#6BCB77;">53</strong> 🌸`))},
  {type:'word',question:"38 has how many ones?",answer:8,hint:wrap('#6BCB77','🎀','Tens and Ones',bubble(`38 = 3 tens and <strong>8</strong> ones. The ones digit is <strong style="color:#6BCB77;">8</strong> 🌸`))}
];
const wordsMissingAdd=[
  {type:'word',question:"Safia has some 🧸 Labubus. Gets 5 more → now 13. How many did she start with?",answer:8,hint:hintMissingAddSimple(13,5)},
  {type:'word',question:"? + 9 = 15. What is the missing number?",answer:6,hint:hintMissingAddSimple(15,9)},
  {type:'word',question:"17 − ? = 8. What is the missing number?",answer:9,hint:hintMissingSubSmall(17,8)},
  {type:'word',question:"Safia had some 🌸 stickers. She gave away 6 and has 9 left. How many did she start with?",answer:15,hint:addColumn(6,9)},
  {type:'word',question:"5 + ? + 3 = 12. What is the missing number?",answer:4,hint:hintMissingThreeAdd(12,5,3)}
];
const wordsCarryAdd=[
  {type:'word',question:"37 pink 🌸 + 45 peach 🍑 flowers. Total?",answer:82,hint:hintCarryAdd(37,45)},
  {type:'word',question:"28 gold 👑 coins + 34 silver coins. Total?",answer:62,hint:hintCarryAdd(28,34)},
  {type:'word',question:"56 🌺 flowers + 27 more. Total?",answer:83,hint:hintCarryAdd(56,27)},
  {type:'word',question:"Safia has 49 stickers. She gets 26 more. How many now?",answer:75,hint:hintCarryAdd(49,26)},
  {type:'word',question:"17 + 68 = ?",answer:85,hint:hintCarryAdd(17,68)}
];
const wordsBorrowSub=[
  {type:'word',question:"Safia had 52 🎀 bows. She shared 27. How many left?",answer:25,hint:hintBorrowSub(52,27)},
  {type:'word',question:"63 🎀 bows. Safia gives away 28. How many left?",answer:35,hint:hintBorrowSub(63,28)},
  {type:'word',question:"81 − 47 = ?",answer:34,hint:hintBorrowSub(81,47)},
  {type:'word',question:"Safia had 74 stickers. She used 39 for a project. How many left?",answer:35,hint:hintBorrowSub(74,39)},
  {type:'word',question:"52 − 18 = ?",answer:34,hint:hintBorrowSub(52,18)}
];
const wordsAddThree=[
  {type:'word',question:"19 🌸 + 21 🎀 + 30 🍑 = Total?",answer:70,hint:hintAddThree(19,21,30)},
  {type:'word',question:"12 🌸 + 15 🎀 + 20 🍑 = Total?",answer:47,hint:hintAddThree(12,15,20)},
  {type:'word',question:"Safia collects 8 shells, 11 shells, and 14 shells on three days. Total?",answer:33,hint:hintAddThree(8,11,14)},
  {type:'word',question:"25 + 13 + 9 = ?",answer:47,hint:hintAddThree(25,13,9)},
  {type:'word',question:"Safia has 17 crowns, 6 crowns, and 22 crowns in three boxes. Total?",answer:45,hint:hintAddThree(17,6,22)}
];
const wordsSubThree=[
  {type:'word',question:"75 🌸 stickers. Gave away 28 and 19. How many left?",answer:28,hint:hintSubThree(75,28,19)},
  {type:'word',question:"60 🌺 stickers. Gave away 15 and 12. How many left?",answer:33,hint:hintSubThree(60,15,12)},
  {type:'word',question:"88 − 30 − 25 = ?",answer:33,hint:hintSubThree(88,30,25)},
  {type:'word',question:"Safia had 50 coins. She spent 14 then 9 more. How many left?",answer:27,hint:hintSubThree(50,14,9)},
  {type:'word',question:"72 − 18 − 21 = ?",answer:33,hint:hintSubThree(72,18,21)}
];
const wordsComposeAdd=[
  {type:'compose_add',kind:'compose_pair',question:"Find TWO ways to make <strong>15</strong> using two groups of 🌸 stickers.",target:15,hint:hintComposeAdd(15)},
  {type:'compose_add',kind:'compose_pair',question:"Find TWO ways to make <strong>12</strong> using two groups of 🎀 bows.",target:12,hint:hintComposeAdd(12)},
  {type:'compose_add',kind:'compose_pair',question:"Find TWO ways to make <strong>18</strong> using two groups of 🍑 peaches.",target:18,hint:hintComposeAdd(18)},
  {type:'compose_add',kind:'compose_pair',question:"Find TWO ways to make <strong>10</strong> using two groups of 👑 crowns.",target:10,hint:hintComposeAdd(10)},
  {type:'compose_add',kind:'compose_pair',question:"Find TWO ways to make <strong>20</strong> using two groups of 🌺 flowers.",target:20,hint:hintComposeAdd(20)}
];
const wordsComposeSub=[
  {type:'compose_sub',kind:'compose_pair',question:"Find TWO pairs of numbers with a difference of <strong>8</strong> 🦋.",target:8,hint:hintComposeSub(8)},
  {type:'compose_sub',kind:'compose_pair',question:"Find TWO pairs of numbers with a difference of <strong>5</strong> 🦋.",target:5,hint:hintComposeSub(5)},
  {type:'compose_sub',kind:'compose_pair',question:"Find TWO pairs of numbers with a difference of <strong>10</strong> 🦋.",target:10,hint:hintComposeSub(10)},
  {type:'compose_sub',kind:'compose_pair',question:"Find TWO pairs of numbers with a difference of <strong>6</strong> 🦋.",target:6,hint:hintComposeSub(6)},
  {type:'compose_sub',kind:'compose_pair',question:"Find TWO pairs of numbers with a difference of <strong>9</strong> 🦋.",target:9,hint:hintComposeSub(9)}
];
const wordsFactFamily=[
  {type:'fact_family',kind:'fact_family',question:"Using 5, 7, and 12, fill in all four facts:",a:5,b:7,total:12,hint:hintFactFamily(5,7,12)},
  {type:'fact_family',kind:'fact_family',question:"Using 4, 9, and 13, fill in all four facts:",a:4,b:9,total:13,hint:hintFactFamily(4,9,13)},
  {type:'fact_family',kind:'fact_family',question:"Using 6, 8, and 14, fill in all four facts:",a:6,b:8,total:14,hint:hintFactFamily(6,8,14)},
  {type:'fact_family',kind:'fact_family',question:"Using 3, 10, and 13, fill in all four facts:",a:3,b:10,total:13,hint:hintFactFamily(3,10,13)},
  {type:'fact_family',kind:'fact_family',question:"Using 7, 6, and 13, fill in all four facts:",a:7,b:6,total:13,hint:hintFactFamily(7,6,13)}
];
const wordsLogic=[
  {type:'word',question:"3 pink 🌸 + 2 peach 🍑. Total flowers?",answer:5,hint:addColumn(3,2)},
  {type:'word',kind:'multiple_choice',question:"What comes next?\n🎀🧸🎀🧸 __?",choices:[{label:'🎀',correct:true},{label:'🌺',correct:false},{label:'⭐',correct:false},{label:'🔵',correct:false}],hint:wrap('#6BCB77','🧠','Patterns',bubble('The pattern repeats: 🎀🧸🎀🧸 — next is 🎀! 🌸'))},
  {type:'word',kind:'multiple_choice',question:"Which doesn't belong?\n🍎🍌🍇🐻",choices:[{label:'🐻',correct:true},{label:'🍎',correct:false},{label:'🍌',correct:false},{label:'🍇',correct:false}],hint:wrap('#6BCB77','🧠','Odd One Out',bubble('🍎🍌🍇 are all fruit — 🐻 is not! 🌸'))},
  {type:'word',question:"What comes next? 3, 6, 9, 12, __?",answer:15,hint:wrap('#6BCB77','🧠','Number Patterns',bubble('Each number is <strong>3</strong> more than the last: 12 + 3 = <strong style="color:#6BCB77;">15</strong> 🌸'))},
  {type:'word',kind:'multiple_choice',question:"Safia always brushes her teeth before bed. Tonight she's going to bed. What will she do first?",choices:[{label:'Brush her teeth',correct:true},{label:'Eat breakfast',correct:false},{label:'Go to school',correct:false}],hint:wrap('#6BCB77','🧠','Think It Through',bubble('Safia ALWAYS brushes her teeth before bed — so that comes first! 🌸'))}
];
const wordsMoney=[
  {type:'word',kind:'numeric',question:"Safia has 2 dimes and 3 pennies 🪙. How many cents does she have in total?",answer:23,hint:hintMoneyCount([10,10,1,1,1])},
  {type:'word',kind:'numeric',question:"A hair clip costs 30¢. Safia pays with 1 quarter and 1 nickel. How many cents did she pay?",answer:30,hint:hintMoneyCount([25,5])},
  {type:'word',kind:'numeric',question:"Safia had 50¢ and spent 20¢ on a sticker. How many cents does she have left?",answer:30,hint:wrap('#ffd700','🪙','Spending Money',bubble(`Start with 50¢, spend 20¢: 50 − 20 = <strong style="color:#6BCB77;">30¢</strong> left! 🌸`))},
  {type:'word',kind:'numeric',question:"Safia has 4 nickels 🪙. How many cents is that?",answer:20,hint:hintMoneyCount([5,5,5,5])},
  {type:'word',kind:'numeric',question:"A crown costs 50¢. Safia has 1 quarter and 2 dimes (45¢). How many more cents does she need?",answer:5,hint:wrap('#ffd700','🪙','How Much More?',bubble(`Safia has 45¢ and needs 50¢: 50 − 45 = <strong style="color:#6BCB77;">5¢</strong> more! 🌸`))}
];
const wordsTime=[
  {type:'word',kind:'numeric',question:"It is 3 o'clock. In 2 hours, what o'clock will it be?",answer:5,hint:hintTime(3,0)},
  {type:'word',kind:'numeric',question:"It is 10 o'clock. What o'clock was it 3 hours ago?",answer:7,hint:hintTime(10,0)},
  {type:'word',kind:'numeric',question:"Safia's ballet class starts at 4 o'clock and lasts 1 hour. What o'clock does it end?",answer:5,hint:hintTime(4,0)},
  {type:'word',kind:'numeric',question:"Safia wakes up at 7 o'clock. She has breakfast 1 hour later. What o'clock is breakfast?",answer:8,hint:hintTime(7,0)},
  {type:'word',kind:'numeric',question:"It is 8 o'clock. In 3 hours it will be recess. What o'clock is recess?",answer:11,hint:hintTime(8,0)}
];
const wordsCompare=[
  {type:'word',kind:'numeric',question:"Safia has 12 stickers. Layla has 7 stickers. How many more does Safia have?",answer:5,hint:hintCompareSymbol(12,7,'>')},
  {type:'word',kind:'numeric',question:"There are 9 apples and 14 oranges. How many fewer apples are there than oranges?",answer:5,hint:hintCompareSymbol(9,14,'<')},
  {type:'word',kind:'numeric',question:"Double 9 is the same as 9 + 9. What is double 9?",answer:18,hint:hintDouble(9)},
  {type:'word',kind:'multiple_choice',question:"Is 23 greater than 18?",choices:[{label:'✅ Yes',correct:true},{label:'❌ No',correct:false}],hint:hintCompareSymbol(23,18,'>')},
  {type:'word',kind:'multiple_choice',question:"Is 14 greater than 20?",choices:[{label:'✅ Yes',correct:false},{label:'❌ No',correct:true}],hint:hintCompareSymbol(14,20,'<')}
];
const wordsFractions=[
  {type:'word',kind:'multiple_choice',question:"Safia cuts a pizza into 2 equal pieces and eats 1. What fraction did she eat?",choices:[{label:'1/2',correct:true},{label:'1/4',correct:false},{label:'2/4',correct:false},{label:'3/4',correct:false}],hint:hintFraction(2,1,'1/2')},
  {type:'word',kind:'multiple_choice',question:"A cookie is cut into 4 equal pieces. Safia eats 1 piece. What fraction is left?",choices:[{label:'3/4',correct:true},{label:'1/4',correct:false},{label:'1/2',correct:false},{label:'2/4',correct:false}],hint:hintFraction(4,3,'3/4')},
  {type:'word',kind:'multiple_choice',question:"Which is bigger: 1/2 of a cake or 1/4 of the same cake?",choices:[{label:'1/2',correct:true},{label:'1/4',correct:false}],hint:wrap('#C77DFF','🍰','Comparing Fractions',bubble('When you cut something into FEWER, BIGGER pieces (halves), each piece is bigger than if you cut it into MORE, smaller pieces (fourths)!')+bubble('<strong style="color:#6BCB77;">✅ 1/2 is bigger than 1/4 🌸</strong>'))},
  {type:'word',kind:'multiple_choice',question:"A chocolate bar is split into 4 equal squares. Safia and 3 friends each take 1 square. What fraction does each person get?",choices:[{label:'1/4',correct:true},{label:'1/2',correct:false},{label:'2/4',correct:false},{label:'4/4',correct:false}],hint:hintFraction(4,1,'1/4')},
  {type:'word',kind:'multiple_choice',question:"Safia colors 3 out of 4 equal boxes. What fraction is colored?",choices:[{label:'3/4',correct:true},{label:'1/4',correct:false},{label:'2/4',correct:false},{label:'4/4',correct:false}],hint:hintFraction(4,3,'3/4')}
];
const wordsNumberSense=[
  {type:'word',kind:'numeric',question:"Count by 10s: 20, 30, 40, __?",answer:50,hint:wrap('#6BCB77','🔢','Skip Counting',bubble('Add 10 each time: 20 → 30 → 40 → <strong style="color:#6BCB77;">50</strong> 🌸'))},
  {type:'word',kind:'numeric',question:"Count by 2s: 6, 8, 10, __?",answer:12,hint:wrap('#6BCB77','🔢','Skip Counting',bubble('Add 2 each time: 6 → 8 → 10 → <strong style="color:#6BCB77;">12</strong> 🌸'))},
  {type:'word',kind:'multiple_choice',question:"Safia finished the race in 3rd place. Who finished right before her?",choices:[{label:'2nd place',correct:true},{label:'1st place',correct:false},{label:'4th place',correct:false},{label:'5th place',correct:false}],hint:wrap('#6BCB77','🏅','Ordinal Numbers',bubble('2nd comes right before 3rd! 🌸'))},
  {type:'word',kind:'numeric',question:'Write the number for "fifteen".',answer:15,hint:wrap('#6BCB77','🔤','Number Words',bubble('"fifteen" = <strong style="color:#6BCB77;">15</strong> 🌸'))},
  {type:'word',kind:'numeric',question:"Safia is 7th in line. Layla is right behind her. What place is Layla in?",answer:8,hint:wrap('#6BCB77','🏅','Ordinal Numbers',bubble('Right behind 7th is <strong style="color:#6BCB77;">8th</strong>! 🌸'))}
];
const wordsDataGraphs=[
  {type:'word',kind:'numeric',question:"A tally chart shows: 🌸🌸🌸🌸🌸 (5 stickers) and 🎀🎀🎀 (3 bows). How many items in total?",answer:8,hint:wrap('#ffd700','📊','Tally Marks',bubble('5 + 3 = <strong style="color:#6BCB77;">8</strong> 🌸'))},
  {type:'word',kind:'numeric',question:"Safia's pictograph shows 6 crowns and 2 tiaras. How many more crowns than tiaras?",answer:4,hint:wrap('#ffd700','📊','Reading a Pictograph',bubble('6 − 2 = <strong style="color:#6BCB77;">4</strong> 🌸'))},
  {type:'word',kind:'multiple_choice',question:"A bar graph shows: Pink bars = 9, Gold bars = 4. Which color has fewer?",choices:[{label:'Gold',correct:true},{label:'Pink',correct:false}],hint:wrap('#ffd700','📊','Reading Bars',bubble('4 is less than 9, so Gold has fewer. 🌸'))},
  {type:'word',kind:'numeric',question:"A table shows Safia read 3 books on Monday and 5 books on Tuesday. How many books in total?",answer:8,hint:wrap('#ffd700','📊','Reading a Table',bubble('3 + 5 = <strong style="color:#6BCB77;">8</strong> 🌸'))},
  {type:'word',kind:'numeric',question:"A picture graph shows 7 pink flowers and 2 peach flowers. How many more pink than peach?",answer:5,hint:wrap('#ffd700','📊','Comparing Rows',bubble('7 − 2 = <strong style="color:#6BCB77;">5</strong> 🌸'))}
];
const wordsShapes=[
  {type:'word',kind:'numeric',question:"A square has how many corners?",answer:4,hint:wrap('#C77DFF','🔺','Corners',bubble('A square has 4 straight sides and <strong style="color:#6BCB77;">4</strong> corners! 🌸'))},
  {type:'word',kind:'multiple_choice',question:"Which shape has 3 sides?",choices:[{label:'Triangle',correct:true},{label:'Square',correct:false},{label:'Hexagon',correct:false},{label:'Circle',correct:false}],hint:wrap('#C77DFF','🔺','Shapes',bubble('A triangle has <strong style="color:#6BCB77;">3</strong> sides! 🌸'))},
  {type:'word',kind:'numeric',question:"Safia's ribbon is 9 crayons long. Layla's ribbon is 6 crayons long. How much longer is Safia's ribbon?",answer:3,hint:wrap('#C77DFF','📏','Comparing Lengths',bubble('9 − 6 = <strong style="color:#6BCB77;">3</strong> 🌸'))},
  {type:'word',kind:'multiple_choice',question:"Which shape has NO straight sides?",choices:[{label:'Circle',correct:true},{label:'Square',correct:false},{label:'Triangle',correct:false},{label:'Pentagon',correct:false}],hint:wrap('#C77DFF','🔺','Circles',bubble('A circle is round all the way around — <strong style="color:#6BCB77;">no straight sides</strong>! 🌸'))},
  {type:'word',kind:'numeric',question:"A caterpillar is 7 cubes long. It grows 2 more cubes. How long is it now?",answer:9,hint:wrap('#C77DFF','📏','Measuring',bubble('7 + 2 = <strong style="color:#6BCB77;">9</strong> 🌸'))}
];
const wordsCalendar=[
  {type:'word',kind:'multiple_choice',question:"How many days are in a week?",choices:[{label:'7',correct:true},{label:'5',correct:false},{label:'10',correct:false},{label:'12',correct:false}],hint:wrap('#ff85c8','📅','Weeks',bubble('A week has <strong style="color:#6BCB77;">7</strong> days! 🌸'))},
  {type:'word',kind:'multiple_choice',question:"How many months are in a year?",choices:[{label:'12',correct:true},{label:'7',correct:false},{label:'10',correct:false},{label:'4',correct:false}],hint:wrap('#ff85c8','📅','Months',bubble('A year has <strong style="color:#6BCB77;">12</strong> months! 🌸'))},
  {type:'word',kind:'multiple_choice',question:"How many seasons are there in a year?",choices:[{label:'4',correct:true},{label:'2',correct:false},{label:'7',correct:false},{label:'12',correct:false}],hint:wrap('#ff85c8','📅','Seasons',bubble('There are <strong style="color:#6BCB77;">4</strong> seasons: Spring, Summer, Autumn, Winter! 🌸'))},
  {type:'word',kind:'multiple_choice',question:"Which day comes right after Friday?",choices:[{label:'Saturday',correct:true},{label:'Sunday',correct:false},{label:'Monday',correct:false},{label:'Thursday',correct:false}],hint:wrap('#ff85c8','📅','Days',bubble('Friday → <strong style="color:#6BCB77;">Saturday</strong>! 🌸'))},
  {type:'word',kind:'multiple_choice',question:"Which month comes right after December?",choices:[{label:'January',correct:true},{label:'November',correct:false},{label:'February',correct:false},{label:'March',correct:false}],hint:wrap('#ff85c8','📅','Months',bubble('After December, the year starts over with <strong style="color:#6BCB77;">January</strong>! 🌸'))}
];
const wordsCombo=[
  {type:'word',kind:'numeric',question:"Safia has 15 stickers. Layla has 9. How many MORE does Safia have?",answer:6,hint:hintCompareSymbol(15,9,'>')},
  {type:'word',kind:'numeric',question:"There are 8 red apples and 13 green apples. How many FEWER red apples are there?",answer:5,hint:hintCompareSymbol(8,13,'<')},
  {type:'word',kind:'numeric',question:"Safia had 6 crowns. She found 7 more in the treasure chest. How many crowns does she have now?",answer:13,hint:addColumn(6,7)},
  {type:'word',kind:'numeric',question:"Safia had 9 bows. After giving some to Layla, she has 4 left. How many did she give away?",answer:5,hint:hintMissingSubSmall(9,4)},
  {type:'word',kind:'numeric',question:"Safia had some Labubus. She got 5 more and now has 12. How many did she start with?",answer:7,hint:hintMissingAddSimple(12,5)},
  {type:'word',kind:'numeric',question:"Safia wants to put 10 flowers into two vases with a different amount in each. If one vase gets 4, how many go in the other?",answer:6,hint:hintMissingAddSimple(10,4)},
  {type:'word',kind:'numeric',question:"Safia read 14 pages. Her goal was 20 pages. How many more pages does she need to read?",answer:6,hint:hintMissingAddSimple(20,14)},
  {type:'word',kind:'numeric',question:"A crown has 45¢ of jewels. Safia has 3 dimes and 1 nickel (35¢). How many more cents does she need?",answer:10,hint:hintMissingAddSimple(45,35)}
];

function generateLevel(id){
  const map={counting:{eqFn:eqCounting,pool:wordsCounting},grouping:{eqFn:eqGrouping,pool:wordsGrouping},missing_add:{eqFn:eqMissingAdd,pool:wordsMissingAdd},carry_add:{eqFn:eqCarryAdd,pool:wordsCarryAdd},borrow_sub:{eqFn:eqBorrowSub,pool:wordsBorrowSub},add_three:{eqFn:eqAddThree,pool:wordsAddThree},sub_three:{eqFn:eqSubThree,pool:wordsSubThree},compose_add:{eqFn:eqComposeAdd,pool:wordsComposeAdd},compose_sub:{eqFn:eqComposeSub,pool:wordsComposeSub},fact_family:{eqFn:eqFactFamily,pool:wordsFactFamily},logic:{eqFn:eqLogic,pool:wordsLogic},money:{eqFn:eqMoney,pool:wordsMoney},time:{eqFn:eqTime,pool:wordsTime},compare_numbers:{eqFn:eqCompare,pool:wordsCompare},fractions:{eqFn:eqFractions,pool:wordsFractions},number_sense:{eqFn:eqNumberSense,pool:wordsNumberSense},data_graphs:{eqFn:eqDataGraphs,pool:wordsDataGraphs},shapes_measurement:{eqFn:eqShapes,pool:wordsShapes},calendar:{eqFn:eqCalendar,pool:wordsCalendar},combo:{eqFn:eqCombo,pool:wordsCombo}};
  const d=map[id];return d?buildLevel(d.eqFn,d.pool):[];
}

// ============================================================
//  RENDER
// ============================================================
function renderHome(){
  const grid=document.getElementById('levelsGrid');
  if(grid){
    grid.innerHTML='';
    LEVELS.forEach(level=>{
      const p=progress[level.id];
      const stars=p.completed?(p.score>=90?'⭐⭐⭐':p.score>=70?'⭐⭐':'⭐'):'';
      const btn=document.createElement('div');
      btn.className='level-btn';
      btn.innerHTML=`<div class="level-icon">${level.icon}</div><div class="level-name">${level.name}</div><div class="level-stars">${stars||'&nbsp;'}</div>`;
      btn.onclick=()=>startLevel(level);
      grid.appendChild(btn);
    });
  }
  updateProgressStats();
  checkBadges();
  renderTrophyShelf();
}
window.showPracticeMenu=function(){renderHome();showScreen('practiceMenuScreen');};

function updateProgressStats(){
  const m=LEVELS.filter(l=>progress[l.id]?.completed).length;
  const pct=Math.round(m/LEVELS.length*100)||0;
  document.getElementById('progressStats').textContent=`${m} of ${LEVELS.length} levels mastered (${pct}%)`;
  document.getElementById('progressBarFill').style.width=pct+'%';
  document.getElementById('progressLabel').textContent=`${m}/${LEVELS.length} mastered · 56 SOAR`;
}

function startLevel(level){
  currentLevel=level;questions=generateLevel(level.id);
  qIndex=0;score=0;wrong=0;answered=false;currentStreak=0;
  document.getElementById('quizLevelLabel').textContent=`${level.icon} ${level.name}`;
  const vd=LEVEL_VIDEOS[level.id];
  if(vd)document.getElementById('quizVideoArea').innerHTML=makeVideoBtn(vd.url,vd.title);
  buildStreakDots(Math.min(questions.length,5));
  updateStreakBadge();
  showScreen('quizScreen');renderQuestion();
}

function renderQuestion(){
  const q=questions[qIndex],total=questions.length;
  document.getElementById('quizQCounter').textContent=`Q${qIndex+1}/${total}`;
  document.getElementById('scoreCorrect').textContent=score;
  document.getElementById('scoreWrong').textContent=wrong;
  document.getElementById('scorePercent').textContent=(score+wrong)?Math.round(score/(score+wrong)*100)+'%':'—';
  document.getElementById('quizProgressBar').style.width=(qIndex/total*100)+'%';
  document.getElementById('feedback').className='feedback';
  document.getElementById('checkButton').style.display='block';
  document.getElementById('nextButton').style.display='none';
  answered=false;
  const hb=document.getElementById('hintButton');hb.style.display=q.hasHint?'block':'none';hb.disabled=false;

  const labels={counting_add:'🌸 Counting',counting_sub:'🌸 Counting',grouping:'🎀 Tens & Ones',missing_add:'🍑 Missing',carry_add:'👑 Carry',borrow_sub:'🥊 Borrow',add_three:'🧸 Add Three',sub_three:'🌺 Sub Three',compose_add:'💎 Make a Sum',compose_sub:'🦋 Find the Gap',fact_family:'🏰 Fact Family',logic:'🧠 Logic',word:'📖 Word Problem',money_count:'🪙 Money',money_make:'🪙 Money',money_equiv:'🪙 Money',time_read:'⏰ Clock',compare_symbol:'⚖️ Compare',compare_truefalse:'⚖️ True/False',compare_double:'✨ Doubles',fraction_identify:'🍕 Fractions',skip_count:'🔢 Skip Count',ordinal:'🏅 Ordinal',number_word:'🔤 Number Words',graph_most:'📊 Graphs',graph_diff:'📊 Graphs',graph_total:'📊 Graphs',shape_sides:'🔺 Shapes',shape_name:'🔺 Shapes',length_blocks:'📏 Length',calendar_day:'📅 Calendar',calendar_month:'📅 Calendar',calendar_season:'📅 Calendar'};
  const badge=labels[q.type]||'🌸 Maths';
  const card=document.getElementById('questionCard');
  card.className='content-card content-card--quiz'+(q.category==='word'?' word-card':'');

  const typeDef=QUESTION_TYPES[kindOf(q)];
  const inputHtml=typeDef.inputHtml(q);

  // Inject card structure WITHOUT hint content embedded — hint HTML contains quotes/backticks that corrupt template literals
  card.innerHTML=`<div class="q-type-badge">${badge}</div><div class="question-text">${q.question.replace(/\n/g,'<br>')}</div>${inputHtml}<div class="hint-box" id="hintDisplay"></div>`;

  // Set hint safely via .innerHTML AFTER the element exists in the DOM
  const hintDisplay=document.getElementById('hintDisplay');
  if(hintDisplay&&q.hint) hintDisplay.innerHTML=q.hint;

  typeDef.bindEnter(q);
}

function showHint(){document.getElementById('hintDisplay').classList.add('show');document.getElementById('hintButton').disabled=true;}

function friendlyAnswer(q){
  if(q.type==='compose_add')return'e.g. 7+8 and 6+9';
  if(q.type==='compose_sub')return'e.g. 12−4 and 13−5';
  if(q.type==='fact_family')return`${q.a}+${q.b}=${q.total}, ${q.b}+${q.a}=${q.total}, ${q.total}−${q.a}=${q.b}, ${q.total}−${q.b}=${q.a}`;
  return String(q.answer);
}

function handleCorrect(){
  score++;currentStreak++;
  updateStreakBadge();lightDot(Math.min(qIndex,4));
  playCorrectSound();
  launchConfetti(currentStreak>=3?55:25);
  const popWord=currentStreak>=4?'👑 QUEEN!':currentStreak>=3?'🔥 ON FIRE!':'🌸 PERFECT!';
  showPop(popWord,currentStreak>=3?'#ffd700':'#ff6eb4');
  mascotReact('cheer');
  document.getElementById('feedback').className='feedback show ok';
  document.getElementById('feedback').textContent=currentStreak>=3?`🔥 ${currentStreak} in a row, Princess Safia!`:'🌸 Correct! You\'re amazing!';
  document.getElementById('scoreCorrect').textContent=score;
  const cv=document.getElementById('scoreCorrect');cv.classList.remove('bump');void cv.offsetWidth;cv.classList.add('bump');
  totalStarsEarned++;localStorage.setItem('safia-totalstars',String(totalStarsEarned));
  checkTrophies(totalStarsEarned-1,totalStarsEarned,progress);
  document.getElementById('checkButton').style.display='none';
  document.getElementById('nextButton').style.display='block';
  document.getElementById('hintButton').disabled=true;
}
function handleWrong(msg){
  wrong++;currentStreak=0;updateStreakBadge();
  playWrongSound();mascotReact('oops');
  document.getElementById('scoreWrong').textContent=wrong;
  document.getElementById('feedback').className='feedback show bad';
  document.getElementById('feedback').textContent=msg||'🥊 Keep fighting, Safia!';
  document.getElementById('checkButton').style.display='none';
  document.getElementById('nextButton').style.display='block';
  document.getElementById('hintButton').disabled=true;
}

function checkAnswer(){
  if(answered)return;
  const q=questions[qIndex];
  const result=QUESTION_TYPES[kindOf(q)].check(q);
  if(result.status==='empty'){alert(result.message);return;}
  answered=true;
  if(result.status==='correct')handleCorrect();else handleWrong(result.message);
}

function nextQuestion(){qIndex++;if(qIndex>=questions.length)showResults();else renderQuestion();}

function showResults(){
  const total=questions.length,pct=Math.round(score/total*100),passed=pct>=70;
  if(passed)progress[currentLevel.id]={completed:true,score:pct};
  localStorage.setItem('safia-progress',JSON.stringify(progress));
  checkBadges();checkTrophies(totalStarsEarned,totalStarsEarned,progress);
  playCelebrationSound();
  if(pct>=90){launchConfetti(140);showPop('👑 PERFECT QUEEN!','#ffd700');}
  else if(pct>=70){launchConfetti(70);showPop('🌸 GREAT JOB!','#ff6eb4');}
  document.getElementById('resultEmoji').textContent=pct>=90?'👑':pct>=70?'🌸':'🥊';
  document.getElementById('resultTitle').textContent=pct>=90?'Perfect Queen, Safia!':pct>=70?'Great job, Princess!':'Keep training, Fighter!';
  const starsEl=document.getElementById('resultStars');
  starsEl.className='result-stars animate';
  const starCount=pct>=90?3:pct>=70?2:1;
  starsEl.innerHTML='<span>⭐</span>'.repeat(starCount);
  document.getElementById('resultMessage').innerHTML=`You got ${score}/${total} correct (${pct}%) 🌸`;
  const idx=LEVELS.findIndex(l=>l.id===currentLevel.id);
  const nb=document.getElementById('nextLevelButton');
  if(passed&&idx<LEVELS.length-1){nb.style.display='block';nb.onclick=()=>startLevel(LEVELS[idx+1]);}
  else nb.style.display='none';
  document.getElementById('retryButton').onclick=()=>startLevel(currentLevel);
  renderHome();showScreen('resultScreen');
}

function goHome(){renderHome();showScreen('practiceMenuScreen');}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}
function saveProgress(){const b=new Blob([JSON.stringify(progress)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='safia-progress.json';a.click();}
function loadProgress(){document.getElementById('loadFile').click();}
function handleLoadFile(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{Object.assign(progress,JSON.parse(ev.target.result));renderHome();alert('Progress loaded! 🌸');}catch{alert('Could not read that file.');}};r.readAsText(f);}

// ============================================================
//  SOAR (full 56 activities + themed icons/colours)
// ============================================================
const SOAR_VIDEOS_BY_ID={
  beatClock:{url:'https://www.youtube.com/results?search_query=counting+fast+kids+how+many+timer',title:'⏰ Counting – Beat the Clock'},
  canYouBuild:{url:'https://www.youtube.com/results?search_query=3d+shapes+building+blocks+kids',title:'🏗️ 3D Shapes & Building'},
  howLongAreYou:{url:'https://www.youtube.com/results?search_query=measuring+length+kids+non+standard+units',title:'📏 Measuring Length for Kids'},
  makingFootprints:{url:'https://www.youtube.com/results?search_query=3d+shapes+faces+edges+vertices+kids',title:'🦶 3D Shapes – Faces & Edges'},
  longCreatures:{url:'https://www.youtube.com/results?search_query=comparing+lengths+longer+shorter+kids',title:'🐛 Comparing Lengths'},
  packing:{url:'https://www.youtube.com/results?search_query=sorting+and+classifying+objects+kids+math',title:'📦 Sorting & Classifying'},
  tubesTunnels:{url:'https://www.youtube.com/results?search_query=size+length+big+small+kids+learning',title:'🧻 Length & Size Concepts'},
  dice:{url:'https://www.youtube.com/results?search_query=counting+dice+numbers+kids+song',title:'🎲 Counting with Dice'},
  mudKitchen:{url:'https://www.youtube.com/results?search_query=capacity+full+empty+kids+math+learning',title:'🍲 Capacity & Measurement'},
  patternMaking:{url:'https://www.youtube.com/results?search_query=patterns+for+kids+abab+repeating+pattern+song',title:'🎨 Pattern Making Song'},
  cooking:{url:'https://www.youtube.com/results?search_query=counting+cooking+with+kids+math+recipe',title:'🥄 Counting in Cooking'},
  numberBook:{url:'https://www.youtube.com/results?search_query=counting+numbers+1+to+10+kids+song',title:'📘 Numbers & Counting Song'},
  smallWorld:{url:'https://www.youtube.com/results?search_query=sorting+animals+positional+language+kids',title:'🐏 Sorting & Position Words'},
  shutTheBox:{url:'https://www.youtube.com/results?search_query=shut+the+box+game+kids+dice+math',title:'🎲 Shut the Box'},
  strikeItOut:{url:'https://www.youtube.com/results?search_query=strike+it+out+number+line+addition+subtraction+kids',title:'✏️ Strike It Out'},
  seeingSquares:{url:'https://www.youtube.com/results?search_query=seeing+squares+dots+grid+game+kids',title:'🟦 Seeing Squares'},
  boardBlock:{url:'https://www.youtube.com/results?search_query=triangles+pegboard+shapes+game+kids',title:'🔺 Board Block'},
  sameLengthTrains:{url:'https://www.youtube.com/results?search_query=cuisenaire+rods+same+length+trains+kids',title:'🚂 Same Length Trains'},
  sortTheStreet:{url:'https://www.youtube.com/results?search_query=sort+classify+houses+properties+kids+math',title:'🏠 Sort the Street'},
  hundredSquareJigsaw:{url:'https://www.youtube.com/results?search_query=100+square+number+grid+jigsaw+kids',title:'🧩 100 Square Jigsaw'},
  polyPlugRectangles:{url:'https://www.youtube.com/results?search_query=rectangles+arrays+multiplication+kids+math',title:'🟣 Poly Plug Rectangles'},
  matchingNumbers:{url:'https://www.youtube.com/results?search_query=number+matching+pairs+memory+game+kids',title:'🃏 Matching Numbers'},
  tablesTeaser:{url:'https://www.youtube.com/results?search_query=multiplication+square+times+table+kids',title:'📊 Tables Teaser'},
  stopTheClock:{url:'https://www.youtube.com/results?search_query=stop+the+clock+telling+time+kids+game',title:'🕐 Stop the Clock'},
  fourTriangles:{url:'https://www.youtube.com/results?search_query=four+triangles+shapes+puzzle+kids',title:'🔺 Four Triangles'},
  oneBigTriangle:{url:'https://www.youtube.com/results?search_query=number+bonds+add+to+ten+puzzle+kids',title:'🔟 One Big Triangle'},
  cuisenaireCounting:{url:'https://www.youtube.com/results?search_query=cuisenaire+rods+counting+combinations+kids',title:'🟥 Cuisenaire Counting'},
  alwaysSometimesNever:{url:'https://www.youtube.com/results?search_query=always+sometimes+never+math+statements+kids',title:'🤔 Always Sometimes or Never?'},
  inceyWincey:{url:'https://www.youtube.com/results?search_query=incey+wincey+spider+number+line+game+kids',title:'🕷️ Incey Wincey Spider'},
  butterflyFlowers:{url:'https://www.youtube.com/results?search_query=butterfly+number+bonds+addition+kids+activity',title:'🦋 Butterfly Flowers'},
  robotMonsters:{url:'https://www.youtube.com/results?search_query=measuring+height+adding+numbers+kids+math',title:'🤖 Robot Monsters'},
  guessTheHouses:{url:'https://www.youtube.com/results?search_query=guess+the+rule+sorting+game+kids+logic',title:'🏡 Guess the Houses'},
  totality:{url:'https://youtu.be/Gvb10ahRRB0',title:'🎯 Totality (Video)'},
  wallpaper:{url:'https://www.youtube.com/results?search_query=ordering+area+size+smallest+largest+kids',title:'🖼️ Wallpaper'},
  nim7:{url:'https://youtu.be/A86TGIdPeO8',title:'🔢 Nim-7 (Video)'},
  breakItUp:{url:'https://www.youtube.com/results?search_query=interlocking+cubes+breaking+splitting+patterns+kids',title:'🧱 Break It Up!'},
  enCounters:{url:'https://www.youtube.com/results?search_query=describing+position+colour+counting+game+kids',title:'⭕ En-Counters'},
  paperPatchwork:{url:'https://www.youtube.com/results?search_query=paper+folding+shapes+patterns+kids+origami',title:'📄 Paper Patchwork'},
  eightnessOfEight:{url:'https://youtu.be/FX4me1Ffrn0',title:'🔴 Eightness of Eight (Video)'},
  ladybirdBox:{url:'https://www.youtube.com/results?search_query=ladybird+grid+puzzle+rows+columns+kids',title:'🐞 Ladybird Box'},
  niceOrNasty:{url:'https://www.youtube.com/results?search_query=nice+nasty+dice+place+value+game+kids',title:'😈 Nice or Nasty'},
  factorsMultiples:{url:'https://www.youtube.com/results?search_query=factors+multiples+game+math+kids',title:'🔢 Factors and Multiples'},
  trainTactics:{url:'https://www.youtube.com/results?search_query=train+number+line+strategy+game+kids',title:'🚂 Train Tactics'},
  dottySix:{url:'https://www.youtube.com/results?search_query=dotty+six+dice+addition+game+kids',title:'🎲 Dotty Six'},
  diceyOperations:{url:'https://www.youtube.com/results?search_query=dicey+operations+addition+subtraction+strategy+kids',title:'🎰 Dicey Operations'},
  fourGo:{url:'https://www.youtube.com/results?search_query=four+go+multiplication+number+line+game',title:'4️⃣ Four Go'},
  firstConnectThree:{url:'https://www.youtube.com/results?search_query=connect+three+coordinates+game+kids+math',title:'🔗 First Connect Three'},
  whatShape:{url:'https://www.youtube.com/results?search_query=guess+my+shape+properties+kids+math',title:'🔷 What Shape?'},
  guessDominoes:{url:'https://www.youtube.com/results?search_query=dominoes+game+kids+number+matching',title:'🁣 Guess Dominoes'},
  spirallingDecimals:{url:'https://www.youtube.com/results?search_query=decimals+number+line+kids+math',title:'🌀 Spiralling Decimals'},
  gotIt:{url:'https://youtu.be/WXSr9_WPZ0o',title:'🎯 Got It (Video)'},
  boardBlockChallenge:{url:'https://www.youtube.com/results?search_query=board+block+challenge+triangles+quadrilaterals+game',title:'🔺 Board Block Challenge'},
  makingSticks:{url:'https://www.youtube.com/results?search_query=making+sticks+cuisenaire+triangle+math',title:'📏 Making Sticks'},
  doughnutPercents:{url:'https://www.youtube.com/results?search_query=percentages+fractions+decimals+kids+circle',title:'🍩 Doughnut Percents'},
  lessMore:{url:'https://www.youtube.com/results?search_query=greater+less+than+comparing+numbers+kids',title:'⚖️ Less or More'},
  play37:{url:'https://www.youtube.com/results?search_query=addition+subtraction+strategy+game+kids+37',title:'3️⃣7️⃣ Play 37'}
};

const NRICH_LINKS_BY_ID={
  beatClock:'https://nrich.maths.org/eyfs-activities/beat-clock',
  canYouBuild:'https://nrich.maths.org/eyfs-activities/can-you-build',
  howLongAreYou:'https://nrich.maths.org/eyfs-activities/how-long-are-you',
  makingFootprints:'https://nrich.maths.org/eyfs-activities/making-footprints',
  longCreatures:'https://nrich.maths.org/eyfs-activities/long-creatures',
  packing:'https://nrich.maths.org/eyfs-activities/packing',
  tubesTunnels:'https://nrich.maths.org/eyfs-activities/tubes-and-tunnels',
  dice:'https://nrich.maths.org/eyfs-activities/dice',
  mudKitchen:'https://nrich.maths.org/eyfs-activities/mud-kitchen',
  patternMaking:'https://nrich.maths.org/eyfs-activities/pattern-making',
  cooking:'https://nrich.maths.org/eyfs-activities/cooking-children',
  numberBook:'https://nrich.maths.org/eyfs-activities/number-book',
  smallWorld:'https://nrich.maths.org/eyfs-activities/small-world-play',
  shutTheBox:'https://nrich.maths.org/games/shut-the-box-two',
  strikeItOut:'https://nrich.maths.org/games/strike-it-out-two',
  seeingSquares:'https://nrich.maths.org/games/seeing-squares-two',
  boardBlock:'https://nrich.maths.org/games/board-block-two',
  sameLengthTrains:'https://nrich.maths.org/problems/same-length-trains',
  sortTheStreet:'https://nrich.maths.org/problems/sort-the-street',
  hundredSquareJigsaw:'https://nrich.maths.org/problems/100-square-jigsaw',
  polyPlugRectangles:'https://nrich.maths.org/problems/poly-plug-rectangles',
  matchingNumbers:'https://nrich.maths.org/games/matching-numbers-two',
  tablesTeaser:'https://nrich.maths.org/problems/tables-teaser',
  stopTheClock:'https://nrich.maths.org/games/stop-the-clock-two',
  fourTriangles:'https://nrich.maths.org/problems/four-triangles-puzzle',
  oneBigTriangle:'https://nrich.maths.org/problems/one-big-triangle',
  cuisenaireCounting:'https://nrich.maths.org/problems/cuisenaire-counting',
  alwaysSometimesNever:'https://nrich.maths.org/problems/always-sometimes-or-never-ks1',
  inceyWincey:'https://nrich.maths.org/games/incey-wincey-spider-two',
  butterflyFlowers:'https://nrich.maths.org/problems/butterfly-flowers',
  robotMonsters:'https://nrich.maths.org/problems/robot-monsters',
  guessTheHouses:'https://nrich.maths.org/games/guess-the-houses-two',
  totality:'https://nrich.maths.org/games/totality-two',
  wallpaper:'https://nrich.maths.org/problems/wallpaper',
  nim7:'https://nrich.maths.org/games/nim-7-two',
  breakItUp:'https://nrich.maths.org/problems/break-it-up',
  enCounters:'https://nrich.maths.org/games/en-counters-two',
  paperPatchwork:'https://nrich.maths.org/problems/paper-patchwork-1',
  eightnessOfEight:'https://nrich.maths.org/problems/eightness-of-eight',
  ladybirdBox:'https://nrich.maths.org/problems/ladybird-box',
  niceOrNasty:'https://nrich.maths.org/games/nice-or-nasty-two',
  factorsMultiples:'https://nrich.maths.org/games/factors-and-multiples-game-two',
  trainTactics:'https://nrich.maths.org/games/train-tactics-two',
  dottySix:'https://nrich.maths.org/games/dotty-six-two',
  diceyOperations:'https://nrich.maths.org/games/dicey-operations-line-two',
  fourGo:'https://nrich.maths.org/games/four-go-two',
  firstConnectThree:'https://nrich.maths.org/games/first-connect-three-two',
  whatShape:'https://nrich.maths.org/problems/what-shape-two',
  guessDominoes:'https://nrich.maths.org/problems/guess-dominoes-two',
  spirallingDecimals:'https://nrich.maths.org/problems/spiralling-decimals-two',
  gotIt:'https://nrich.maths.org/games/got-it-two',
  boardBlockChallenge:'https://nrich.maths.org/problems/board-block-challenge-two',
  makingSticks:'https://nrich.maths.org/problems/making-sticks',
  doughnutPercents:'https://nrich.maths.org/problems/doughnut-percents',
  lessMore:'https://nrich.maths.org/problems/less-more',
  play37:'https://nrich.maths.org/problems/play-37'
};

// All 56 SOAR activities — icons swapped to Princess Peach / Hello Kitty / Labubu / MMA theme
const soarActivities=[
  {id:'beatClock',icon:'⏰🌸',title:'Beat the Clock',age:'3-5',desc:'How many jumps in one minute?',aim:'Compare quantities and talk about time',instructions:['Set a timer for 1 minute.','Do star jumps, hops, or write your name as many times as you can!','Count how many you did.','Try again – can you do more? 🌸'],illustration:'🕐⭐ ➔ 🏃‍♀️ 1️⃣2️⃣3️⃣',hint:'Quick actions = lots more! Slow actions = fewer.',questions:['What can you do more of in a minute – star jumps or twirls?','Can you put on your tiara in under a minute? 👑']},
  {id:'canYouBuild',icon:'🏗️🎀',title:'Can You Build This?',age:'3-5',desc:'Copy a model with blocks',aim:'Explore shapes and positions',instructions:['An adult builds a simple model with 4-5 blocks.','Look closely! Can you make yours exactly the same?','Use the same pieces in the same place.','Check – is your model the same? 🌸'],illustration:'🟦🟥 ➔ 🏰 (copy the castle!)',hint:'Look at where each block goes – on top, next to, behind.',questions:['Which block is on top? Which is underneath?','How do you turn that brick to match?']},
  {id:'howLongAreYou',icon:'📏🍑',title:'How Long Are You?',age:'3-5',desc:'Measure yourself with everyday things',aim:'Compare length using non-standard units',instructions:['Lie down and have an adult mark your head and feet.','Measure with pencils or crayons – end to end, no gaps!','Count how many you are tall. 🌸','Try with LEGO bricks or hair clips!'],illustration:'🧍‍♀️ ➔ 🖍️🖍️🖍️🖍️ (20 crayons tall!)',hint:'If things are shorter, you need more of them.',questions:['How many LEGO bricks tall are you?','Are you taller than Mum\'s handbag? 👜']},
  {id:'makingFootprints',icon:'🦶🌺',title:'Making Footprints',age:'3-5',desc:'Press shapes into soft dough',aim:'Explore faces of 3D shapes',instructions:['Get some soft dough or playdough.','Press different blocks into it to make "footprints".','Run your finger around the edge.','Can you find another block with the same footprint? 🌸'],illustration:'🧊🔺 ➔ ⏺️⏸️ (cube makes a square!)',hint:'The flat side of the block makes the print.',questions:['What shape is the footprint of a cube? A sphere?','Can you guess which block made each footprint?']},
  {id:'longCreatures',icon:'🐛🎀',title:'Long Creatures',age:'3-5',desc:'Make worms, snakes, caterpillars',aim:'Compare lengths',instructions:['Use thin card, playdough, or linking cubes.','Make a long creature – a snake or a glittery caterpillar! 🌸','Now make another – longer or shorter?','Compare with a friend\'s creature.'],illustration:'🐍📏 ➔ longer · shorter · longest',hint:'Fold paper like an accordion to make it stretch!',questions:['How can you make it longer? Shorter?','Whose creature is the longest? How do you know?']},
  {id:'packing',icon:'📦🌸',title:'Packing',age:'3-5',desc:'Sort toys into boxes',aim:'Sort and classify',instructions:['Get some boxes or trays.','Choose toys – teddies, cars, or hair accessories! 🎀','Put them into boxes by type.','How many in each box? Which has most?'],illustration:'🧸🧸 | 🚗🚕 | 🎀🎀 (sorted!)',hint:'Look for things that are the same kind.',questions:['Are there more teddies or cars?','Could you sort them by colour instead?']},
  {id:'tubesTunnels',icon:'🧻🍑',title:'Tubes and Tunnels',age:'3-5',desc:'Play with cardboard tubes',aim:'Explore size, length, position',instructions:['Find different tubes – paper towel rolls, wrapping paper tubes.','Roll them? Blow through them?','Make a tunnel for toy cars or unicorns! 🦄','Can you stack them? Make a telescope?'],illustration:'📦🧻🚗 (car goes through tunnel!)',hint:'Wider tubes let bigger things through.',questions:['Which tube is longest? Widest?','Can you make a tunnel that turns a corner?']},
  {id:'dice',icon:'🎲👑',title:'Dice',age:'3-5',desc:'Roll and count',aim:'Match numerals to amounts',instructions:['Get a big dice and some toys (teddies or cars!).','Roll the dice. Count the dots.','Take that many toys! 🌸','Roll again – more or fewer?'],illustration:'🎲⚀ ➔ 🧸🧸🧸 (3 Labubus)',hint:'The dots tell you how many. Count carefully!',questions:['What number did you roll? Can you write it?','Have you got enough teddies for a tea party? 🍵']},
  {id:'mudKitchen',icon:'🍲🌺',title:'Mud Kitchen',age:'3-5',desc:'Cook with mud and water',aim:'Explore size, capacity, weight',instructions:['Get pots, pans, spoons, and mud (or sand or water).','Make mud pies, soups, and Princess Peach cake! 🍑','Fill different containers – which holds more?','Use big spoons and little spoons.'],illustration:'🥘🌊 (fill the pot!)',hint:'Bigger containers hold more mud.',questions:['Which pan is biggest? Which holds the most?','Is the pot full? How do you know?']},
  {id:'patternMaking',icon:'🎨🎀',title:'Pattern Making',age:'3-5',desc:'Make and describe patterns',aim:'Recognise and extend patterns',instructions:['Use coloured beads, hair clips, or stickers! 🌸','Make a pattern: pink, gold, pink, gold…','Say the pattern out loud.','Can you make a different pattern?'],illustration:'🌸🌻🌸🌻 ➔ next is 🌸',hint:'Patterns repeat. What comes next?',questions:['What is the rule of your pattern?','Can you clap your pattern?']},
  {id:'cooking',icon:'🥄🍑',title:'Cooking With Safia',age:'3-5',desc:'Follow a simple recipe',aim:'Measure and count ingredients',instructions:['Find a simple recipe – like playdough cookies or a Peach smoothie! 🍑','Count the cups of flour, spoonfuls of sugar.','Mix it all together!','Talk as you go – "I need one more cup." 🌸'],illustration:'🥣 1 cup flour, 2 spoons sugar',hint:'Count the spoonfuls carefully.',questions:['How many cups do we need?','What if we add too much sugar?']},
  {id:'numberBook',icon:'📘🌸',title:'Princess Number Book',age:'3-5',desc:'Make a book of your favourite number',aim:'Collect groups and count',instructions:['Choose a number – like 4! 🌸','Go on a hunt – find 4 bows, 4 stickers, 4 leaves.','Stick them in a book or take photos.','Write the number on each page with glitter! ✨'],illustration:'4 bows 🎀🎀🎀🎀 · 4 stickers 🌸🌸🌸🌸',hint:'Count each thing carefully. Touch and say the number.',questions:['Do you have 4 of everything?','Which page is your favourite? 🌸']},
  {id:'smallWorld',icon:'🐏🧸',title:'Labubu World',age:'3-5',desc:'Build a kingdom for your toys',aim:'Use language of position and size',instructions:['Get Labubus, Hello Kitty toys, and little boxes! 🧸','Build fields and castles.','Put each character in their special spot.','Talk about it – "Labubu is next to the castle!" 🏰'],illustration:'🧸🎀 | 👑 (the kingdom!)',hint:'Bigger characters might need bigger castles!',questions:['How many characters fit in this castle?','Which character has the biggest space? Why?']},
  {id:'shutTheBox',icon:'🎲🎀',title:'Shut the Box for Two',age:'5-7',desc:'Turn over cards matching dice rolls',aim:'Use number knowledge with dice sums',instructions:['Make cards 1–12. Place all face up.','Roll two dice. Turn over cards matching the numbers.','If you can\'t flip any more, add the remaining — lower score wins!','Swap and play again! 🌸'],illustration:'🎲🎲 ➔ 4+5 → flip 4️⃣ and 5️⃣',hint:'Try to flip cards that give you the most options.',questions:['Which cards are hardest to flip? Why?','What is the best score you can get?']},
  {id:'strikeItOut',icon:'✏️🌸',title:'Strike It Out for Two',age:'5-11',desc:'Cross out numbers on a number line!',aim:'Practise addition and subtraction strategically',instructions:['Draw a number line 0–20.','Cross out one number, then another, circle their sum or difference.','Must start with the circled number next time.','Player who stops opponent wins! 🌸'],illustration:'0─1─2─3…20  ✂️ cross · ⭕ circle',hint:'Think ahead — trap your opponent!',questions:['Can you cross out ALL numbers?','What\'s the most you can cross out?']},
  {id:'seeingSquares',icon:'🟦🎀',title:'Seeing Squares for Two',age:'5-11',desc:'Place dots to make squares on a grid!',aim:'Visualise squares including tilted ones',instructions:['Choose a colour each. Take turns drawing a dot.','First to place 4 dots forming a square wins! 🌸','Squares can be ANY size and can tilt!','Block your partner!'],illustration:'· ● · ●\n· · · ·\n· ● · ● ← square!',hint:'A tilted square still has 4 equal sides.',questions:['How do you know it\'s a square?','Can you find a strategy to always win?']},
  {id:'boardBlock',icon:'🔺🌸',title:'Board Block for Two',age:'5-7',desc:'Place triangle bands on a pegboard!',aim:'Explore properties of triangles',instructions:['Take turns adding a band around 3 pegs to make a triangle.','Triangles must NOT overlap.','Can\'t make a triangle = you lose! 🌸','Try playing to LOSE!'],illustration:'⬡ peg board → △ △ △',hint:'Think about which pegs are still free!',questions:['What are winning strategies?','How does it change playing to lose?']},
  {id:'sameLengthTrains',icon:'🚂🍑',title:'Same Length Trains',age:'5-7',desc:'Make trains the same length using one colour',aim:'Explore equal lengths and number relationships',instructions:['Make a train 20cm long using mixed colours.','Now make trains the SAME length using ONLY one colour.','How many different single-colour trains can you make? 🌸'],illustration:'Yellow (5): ⬜⬜⬜⬜⬜ (5 whites) or 🟥🟥 (2 reds+1 white)',hint:'Which colours divide evenly into the total?',questions:['How do you know you\'ve found ALL trains?','What if the total were 12?']},
  {id:'sortTheStreet',icon:'🏠🎀',title:'Sort the Princess Street',age:'5-7',desc:'Sort houses by colour, roof, floors and more!',aim:'Sort and classify using multiple properties',instructions:['Look at 9 houses. Sort them into two groups.','Tell your adult your rule! 🌸','Now sort them a DIFFERENT way.','How many ways can you find?'],illustration:'🏠🌸 🏠💛 🏠💙 → sort by door colour!',hint:'Try roof colour, then floors, then chimney side.',questions:['Which way makes the most equal groups?','Can you sort into 3 groups?']},
  {id:'hundredSquareJigsaw',icon:'🧩👑',title:'100 Square Jigsaw',age:'5-7',desc:'Put the 100 square back together!',aim:'Explore number patterns and place value',instructions:['Print puzzle pieces (search "100 Square Jigsaw NRICH").','Mix them up! Put the 100 square back like a jigsaw. 🌸','Use number patterns to help.'],illustration:'1  2  3 … 10\n11 12 13 … 20  🧩',hint:'The last digit in each column is always the same!',questions:['What patterns do you look for?','What\'s the hardest piece? Why?']},
  {id:'polyPlugRectangles',icon:'🟣🌸',title:'Secret Rectangle',age:'5-11',desc:'Find the hidden rectangle!',aim:'Understand multiplication as arrays',instructions:['One player secretly colours a rectangle on a 5×5 grid.','Other player picks spots to test – inside or outside?','Find it with as FEW tests as possible! 🌸'],illustration:'? ? ? ?\n? ■ ■ ?\n? ■ ■ ?\n? ? ? ? ← find me!',hint:'Test the middle first – it gives the most info!',questions:['Which totals are easiest to find? Why?','How few tests do you really need?']},
  {id:'matchingNumbers',icon:'🃏🎀',title:'Number Memory Match',age:'5-7',desc:'Memory game – match ways to show a number!',aim:'See numbers in many representations',instructions:['Make cards: dice faces, tallies, numerals, dots, fingers.','Shuffle and place face-down in a grid.','Flip two cards – same number = keep them! 🌸','Most pairs wins.'],illustration:'🎴 flip → ⚃ and 4 → Match! 🌸',hint:'Remember where cards are – use your memory!',questions:['How many ways can you show 5?','Can you make your OWN extra cards?']},
  {id:'tablesTeaser',icon:'📊🍑',title:'Tables Teaser',age:'5-7',desc:'Work out the secret row and column headings!',aim:'Explore multiplication patterns',instructions:['Draw a 3×3 grid. Pick 3 secret numbers for headings.','Fill in: each cell = row heading × column heading.','Show the filled grid – can partner work out the headings? 🌸'],illustration:'  ? ?  ?\n? 4 6 10\n? 6 9 15\n? 10 15 25',hint:'Find the smallest number – what two multiply to make it?',questions:['Why does 20 appear twice?','Can you make a puzzle where a number appears 3 times?']},
  {id:'stopTheClock',icon:'🕐🌸',title:'Stop the Clock for Two',age:'5-7',desc:'Move clock hands to hit 12 o\'clock!',aim:'Tell time and calculate time intervals',instructions:['Set a clock to 6 o\'clock.','Take turns: move forward ½ hour or 1 hour.','Land EXACTLY on 12 = WIN! 🌸'],illustration:'🕕 → ½hr or 1hr → 🕛 WIN!',hint:'Work backwards from 12!',questions:['What if you\'re at 10:30?','Can you always win if you go first?']},
  {id:'fourTriangles',icon:'🔺🎀',title:'Four Triangles Puzzle',age:'5-11',desc:'Cut a square into 4 triangles and rearrange!',aim:'Explore shapes systematically',instructions:['Cut a square diagonally both ways – 4 triangles!','Rearrange to make different shapes. 🌸','Long sides touch long sides; short touch short.','How many DIFFERENT shapes can you make?'],illustration:'◼ → cut → △△△△ → rearrange!',hint:'Flip and rotate. Two shapes are the same if one is a rotation.',questions:['How do you know two shapes are different?','How many shapes can you find?']},
  {id:'oneBigTriangle',icon:'🔟🌸',title:'One Big Triangle',age:'5-7',desc:'Arrange 9 triangles so touching numbers add to 10!',aim:'Practise number bonds to 10',instructions:['Print the 9 triangles from NRICH "One Big Triangle".','Arrange them to form ONE big triangle.','Numbers that TOUCH must add to 10. 🌸'],illustration:'△△△ → fit so 3+7, 4+6, 5+5 = 10',hint:'Find pairs that make 10: 1+9, 2+8, 3+7, 4+6, 5+5.',questions:['How did you get started?','Is there more than one solution?']},
  {id:'cuisenaireCounting',icon:'🟥🎀',title:'Cuisenaire Counting',age:'5-7',desc:'How many ways to fill a yellow rod?',aim:'Explore combinations and systematic working',instructions:['Yellow rod = 5 units. White = 1. Red = 2.','Fill yellow rod using ONLY white and red rods.','Record every way! 🌸','Try with dark green (6 units).'],illustration:'Yellow (5): WWWWW or RWWW or WRRW ...',hint:'Work from all whites, then swap one for a red.',questions:['How many ways for yellow? Dark green?','Can you see a pattern?']},
  {id:'alwaysSometimesNever',icon:'🤔🌸',title:'Always, Sometimes or Never?',age:'5-7',desc:'Are these maths statements always, sometimes or never true?',aim:'Reason about number and shape properties',instructions:['Read each statement aloud.','Decide: ALWAYS, SOMETIMES or NEVER true? 🌸','Find an example or counter-example!'],illustration:'✅ ALWAYS | 🌸 SOMETIMES | ❌ NEVER',hint:'For "sometimes" – say WHEN it is and isn\'t true.',questions:['Can you rewrite a "sometimes" as "always"?','Which surprised you?']},
  {id:'inceyWincey',icon:'🕷️🍑',title:'Incey Wincey Spider',age:'5-7',desc:'Move the spider up or down the drainpipe!',aim:'Explore a vertical number track',instructions:['Draw a drainpipe track (numbers bottom to top).','Sunshine = spider UP ☀️. Rain = spider DOWN 🌧️.','Take turns rolling a die and moving.','Sunshine wins at top; Rain wins at bottom! 🌸'],illustration:'☀️ roll → spider climbs ⬆️',hint:'It\'s like a number line stood on its end!',questions:['How long to reach one end?','Try with two dice – does strategy help?']},
  {id:'butterflyFlowers',icon:'🦋🌸',title:'Butterfly Flowers',age:'5-7',desc:'Match butterfly pairs that add to the flower number!',aim:'Practise number bonds',instructions:['Each flower has a number. Find TWO butterflies whose numbers ADD to the flower\'s number.','Place the pair on their flower. 🌸','Which pair has NO flower? Which flower has NO pair?'],illustration:'Flower 🌸8: butterflies 3️⃣ + 5️⃣',hint:'Add each butterfly pair until you find the flower match.',questions:['Which pair has no flower? Why?','Which flower can\'t have a pair? Why?']},
  {id:'robotMonsters',icon:'🤖🎀',title:'Robot Monsters',age:'5-7',desc:'Build robots and measure their heights!',aim:'Add measurements, work systematically',instructions:['Print robot head, body and leg pieces from NRICH.','Each piece has a height in cm.','Head + Body + Legs = height! 🌸','Find the tallest and shortest robots.'],illustration:'Head (3) + Body (5) + Legs (4) = 12cm 🤖',hint:'Tallest = pick biggest piece from each category.',questions:['Can you find ALL heights?','How do you know you haven\'t missed any?']},
  {id:'guessTheHouses',icon:'🏡🌸',title:'Guess the Kingdom Rule',age:'5-7',desc:'Ask questions to discover the secret rule!',aim:'Develop logical questioning',instructions:['Adult picks a secret rule (e.g. "pink roof houses").','Show house cards one at a time: "Does this fit your rule?" 🌸','YES = into the Box. NO = outside.','Figure out the rule in as few cards as possible!'],illustration:'🏠 → "Yes" 🌸 / "No" 💛 → figure out the rule!',hint:'Pick cards that differ in only ONE property.',questions:['Least cards needed?','What types of questions help most?']},
  {id:'totality',icon:'🎯🍑',title:'Totality for Two',age:'5-11',desc:'Slide a counter to hit the target total!',aim:'Practise addition and strategic thinking',instructions:['Slide a counter along connected numbers on NRICH Totality board.','Choose a target (e.g. 20). Add as you go.','Reach the target EXACTLY = WIN! 🌸'],illustration:'web of numbers → slide → add → 🎯 target!',hint:'Work backwards from target.',questions:['Can you find a winning strategy?','What if you change the target?']},
  {id:'wallpaper',icon:'🖼️🌸',title:'Princess Wallpaper',age:'5-7',desc:'Order wallpaper pieces from smallest to largest area!',aim:'Compare and estimate area',instructions:['Print NRICH "Wallpaper" pieces.','Arrange in order: smallest to largest. 🌸','How are you comparing them?'],illustration:'🖼️ tiny → 🖼️ small → 🖼️ medium → 🖼️ large',hint:'Try overlapping pieces or counting pattern repeats.',questions:['How did you order them?','Were any tricky? Why?']},
  {id:'nim7',icon:'🔢🥊',title:'Nim-7 (MMA Edition!)',age:'5-14',desc:'Take 1 or 2 counters – grab the last one to WIN!',aim:'Develop logical and strategic thinking',instructions:['Place 7 counters. Take turns: take 1 OR 2.','Take the LAST counter = WIN! 🥊','Swap who goes first each game.','Can you find the winning strategy?'],illustration:'●●●●●●● → take 1 or 2 → WIN!',hint:'Work backwards: if 3 left on YOUR turn, can you always win?',questions:['Does it matter who goes first?','What with different starting numbers?']},
  {id:'breakItUp',icon:'🧱🌸',title:'Break It Up!',age:'5-11',desc:'How many ways to break 7 cubes into 2 pieces?',aim:'Explore patterns and systematic working',instructions:['Get 7 interlocking cubes.','Break the stick into exactly 2 pieces.','Count all the ways! 🌸','Try with 8 cubes, then 6. What pattern?'],illustration:'■■■■■■■ → ■|■■■■■■ etc.',hint:'Each "break point" gives a different way.',questions:['What do you notice vs the number of cubes?','How many ways with 20 cubes?']},
  {id:'enCounters',icon:'⭕🎀',title:'En-Counters for Two',age:'5-7',desc:'Recreate a secret counter pattern from descriptions!',aim:'Use language of colour, position and order',instructions:['Adult arranges counters and describes them aloud.','You copy from the description! 🌸','Ask questions if you need to.','Compare – are they the same? Then swap!'],illustration:'Adult: "One pink counter. One gold below it." → copy! 🌸',hint:'Ask about colour, position, and distance.',questions:['Which questions helped most?','What language makes descriptions clearest?']},
  {id:'paperPatchwork',icon:'📄🌸',title:'Paper Patchwork',age:'5-7',desc:'Fold paper and make beautiful patchwork patterns!',aim:'Explore shapes through folding',instructions:['Fold an A4 sheet in half along the special crease.','What shape do you get? 🌸','Make the same shape in A4, A5, A6 in two colours.','Arrange them to make a Princess Patchwork! 🌸'],illustration:'A4 folded → new shape → 🌸 patchwork!',hint:'Fold carefully – precision matters.',questions:['What shape when you fold?','Can each patchwork be a different design?']},
  {id:'eightnessOfEight',icon:'🔴🌸',title:'Eightness of Eight',age:'5-7',desc:'8 counters rearranged – it\'s still 8! ✨',aim:'Understand that a number stays the same however arranged',instructions:['Watch the NRICH video (link below).','8 counters rearrange – still 8! 🌸','Describe what stays the same; what changes.','Show the "twelve-ness of twelve" your own way! ✨'],illustration:'●●●●●●●● → arrange differently → still 8! 🌸',hint:'The NUMBER doesn\'t change – only the arrangement does.',questions:['What is always the same?','Make a video showing "twelve-ness of twelve"!']},
  {id:'ladybirdBox',icon:'🐞👑',title:'Ladybird Princess Puzzle',age:'5-11',desc:'6 ladybirds – every row and column must have exactly 2!',aim:'Work systematically',instructions:['Draw a 3×3 grid.','Place 6 ladybirds so EVERY row has exactly 2 AND every column has exactly 2. 🌸','How many solutions can you find?'],illustration:'🐞 _ 🐞\n_ 🐞 🐞\n🐞 🐞 _ ← does this work?',hint:'There are 3 ways to place 2 in the first row. Try each!',questions:['How many different solutions?','How do you know you\'ve found them all?']},
  {id:'niceOrNasty',icon:'😈🌸',title:'Nice or Nasty',age:'5-11',desc:'Roll dice and place digits – be nice OR nasty!',aim:'Develop place value strategically',instructions:['Draw 4 boxes: _ _ _ _ (thousands, hundreds, tens, ones).','Roll a 0–9 dice – place the digit before rolling again.','After 4 rolls each, highest total wins! 🌸','Nasty version: place in YOUR opponent\'s boxes!'],illustration:'Roll 7 → place as: 7_ _ or _7_ or _ _7?',hint:'Save big digits for hundreds/thousands!',questions:['Best place for a 9? A 1?','Can you find a strategy that always wins?']},
  {id:'factorsMultiples',icon:'🔢🌺',title:'Factors & Multiples Game',age:'7-11',desc:'Chain factors and multiples – block your opponent!',aim:'Explore factors, multiples and divisibility',instructions:['Numbers 1–100 in a grid.','Circle any even number first.','Next: circle a factor OR multiple of the previous number.','Can\'t go = LOSE! 🌸'],illustration:'Circle 6 → can circle 2, 3, 12, 18, 24…',hint:'Avoid leaving your opponent lots of options.',questions:['Which numbers give most options?','Can you find a winning strategy?']},
  {id:'trainTactics',icon:'🚂🍑',title:'Train Tactics for Two',age:'5-11',desc:'Move trains along a number line – reach your target!',aim:'Practise number bonds along a number line',instructions:['Number line 0–20. Two trains start at 0.','Move EITHER train forward 1, 2 or 3 spaces.','Can\'t land on the other train.','Land EXACTLY on 20 = WIN! 🌸'],illustration:'Train A at 7, Train B at 12 → move by 2\nGoal: land on 20 🏁',hint:'Think which moves leave opponent weak. Work back from 20!',questions:['Better to go first or second?','What positions are winning?']},
  {id:'dottySix',icon:'🎲🌸',title:'Dotty Six for Two',age:'5-7',desc:'Roll dice and fill a grid – get a line of 6 dots!',aim:'Practise addition and strategic thinking',instructions:['Two 3×3 grids – one each.','Roll two dice. Put that many dots in ONE square.','First to get a row, column or diagonal totalling 6 = WIN! 🌸'],illustration:'Roll 2+4=6 → put 6 in one square → win?',hint:'Each row/column must total exactly 6.',questions:['Better to go for one line or block opponent?','What rolls are most useful?']},
  {id:'diceyOperations',icon:'🎰🍑',title:'Dicey Operations',age:'7-11',desc:'Use dice digits to make calculations – closest wins!',aim:'Practise addition/subtraction with strategy',instructions:['Draw: _ _ _ + _ _ _ (or minus).','Roll 6 times. ALL players write that digit in one blank.','After 6 rolls, calculate. Closest to TARGET wins! 🌸'],illustration:'Target: 1000\nRoll 6,3,8,1,4,2 → arrange as 638+412=1050?',hint:'Big digits go in hundreds/thousands!',questions:['Which roll is hardest to place?','Can you find a strategy to get close?']},
  {id:'fourGo',icon:'4️⃣🌸',title:'Four Go for Two',age:'7-11',desc:'Multiply to claim squares – four in a row wins!',aim:'Develop multiplication and strategic thinking',instructions:['6×6 grid with products. Factors 1–6 at the bottom.','Choose TWO factors and multiply.','Claim that product square.','Four in a row = WIN! 🌸'],illustration:'3 × 4 = 12 → claim 12\n6 × 6 = 36 → claim 36',hint:'Which products appear most? Some can be made multiple ways!',questions:['Which products appear most? Why?','Can you block opponent and build your own row?']},
  {id:'firstConnectThree',icon:'🔗🎀',title:'First Connect Three',age:'7-11',desc:'Plot coordinates – get three in a row!',aim:'Practise coordinates and multiplication',instructions:['Grid with x and y axes 0–5.','Roll two dice to get x and y coordinates.','Plot and claim that point. 🌸','First to THREE in a row wins!'],illustration:'Roll 3, then 4 → plot (3,4) ✓\nThree in a row → WIN! 🌸',hint:'Build in TWO directions at once!',questions:['Which coordinates are hardest to get?','Can you spot when opponent is about to win?']},
  {id:'whatShape',icon:'🔷🌸',title:'What Shape?',age:'5-11',desc:'Ask yes/no questions to identify a secret shape!',aim:'Develop knowledge of shape properties',instructions:['One player secretly picks a 2D shape.','Ask YES/NO questions about its properties.','"Does it have 4 sides?", "Are all sides equal?" 🌸','Guess the shape in as FEW questions as possible!'],illustration:'🔷 secret shape\n"More than 4 sides?" → Yes\n→ Could be hexagon!',hint:'Start broad (number of sides) then narrow down.',questions:['Minimum questions needed?','Can you always find it in 3?']},
  {id:'guessDominoes',icon:'🁣🌸',title:'Guess the Domino',age:'5-7',desc:'Ask questions to find the hidden domino!',aim:'Explore number properties and reasoning',instructions:['One player picks a domino and hides it.','Ask YES/NO questions: "Is one side 6?", "Do both add to more than 8?" 🌸','Guess the domino in as few questions as possible!'],illustration:'Hidden: [3|5]\n"Total > 7?" → Yes\n"Any side = 6?" → No → 3+5?',hint:'Ask about the total first, then narrow down each side.',questions:['Best first question?','Can you always guess in 4?']},
  {id:'spirallingDecimals',icon:'🌀🍑',title:'Spiralling Decimals',age:'9-14',desc:'Place decimal numbers on a number line!',aim:'Develop decimal place value understanding',instructions:['Roll a dice 3 times for 3 digits (e.g. 3, 7, 1).','Each player arranges as a decimal: 0.371, 0.713…','Place on the number line.','Closest to the TARGET wins! 🌸'],illustration:'Digits: 2,8,5\n0.285, 0.528, 0.852…\nTarget: 0.5 → which is closest?',hint:'Think about tenths, hundredths, thousandths.',questions:['How do you decide?','Which digit matters most?']},
  {id:'gotIt',icon:'🎯🌸',title:'Got It for Two',age:'5-14',desc:'Add numbers to reach the target – Got It!',aim:'Strategic addition and number reasoning',instructions:['Choose a target (e.g. 23) and range (1–4).','Take turns adding a number from the range.','First to reach target EXACTLY = "Got It!" 🌸','Find the winning strategy!'],illustration:'Target: 23, Range: 1-4\nTotal 18 → add 1? or 4?',hint:'Work backwards from target.',questions:['Does it matter who goes first?','What if you change the target or range?']},
  {id:'boardBlockChallenge',icon:'🔺🎀',title:'Board Block Challenge',age:'7-11',desc:'Fit triangles AND quadrilaterals on a pegboard!',aim:'Explore properties of shapes',instructions:['Take turns: stretch a band around 3 or 4 pegs (triangle or quadrilateral).','No overlapping bands. 🌸','Can\'t make any shape = LOSE!'],illustration:'⬡ board: △ band or ▱ band',hint:'Quadrilaterals use more space – block opponent!',questions:['Which shapes appear most? Why?','Triangles or quadrilaterals better?']},
  {id:'makingSticks',icon:'📏🌺',title:'Making Sticks',age:'5-7',desc:'Can 3 sticks make a triangle?',aim:'Explore the triangle inequality',instructions:['Cut straws into lengths 1–10 cm.','Choose ANY 3 sticks and try to make a triangle.','Record YES or NO.','Find the RULE! 🌸'],illustration:'3+4+5 → YES ✅\n1+2+3 → NO ❌',hint:'Two shorter sides must ADD to MORE than the longest!',questions:['Can you always make a triangle with 3 equal sticks?','What about two equal and one different?']},
  {id:'doughnutPercents',icon:'🍩🌸',title:'Princess Doughnut Percents',age:'9-14',desc:'Work out what percentage each topping covers!',aim:'Understand percentages as parts of a whole',instructions:['Draw a circle (the royal doughnut! 🍩).','Divide into sections for pink icing, sprinkles, glitter, gold.','Label each as a fraction, then convert to %.','Check: all percentages add to 100%! 🌸'],illustration:'🍩 Half pink (50%) + Quarter sprinkles (25%) + Quarter glitter (25%) = 100% ✓',hint:'Fraction → % : divide top by bottom, × 100.',questions:['If pink covers 3/8, what % is that?','Can you make a doughnut where each topping = 10%?']},
  {id:'lessMore',icon:'⚖️🌸',title:'Less or More',age:'5-7',desc:'Find numbers that make the inequality true!',aim:'Understand < > = symbols',instructions:['Write an inequality like ___ < 50 or ___ > 30.','Fill in the blank with a number that makes it TRUE.','Find as many numbers as you can! 🌸'],illustration:'___ < 8 → 7 ✓ 0 ✓ -1 ✓\n20 < ___ < 25 → 21, 22, 23, 24 ✓',hint:'Think about the number line.',questions:['Are there infinitely many that make ___ < 8 true?','What if you can only use 1–100?']},
  {id:'play37',icon:'3️⃣7️⃣🥊',title:'Play 37 (MMA Edition!)',age:'7-11',desc:'Add 1–5 to reach 37 – can\'t repeat your opponent\'s last number!',aim:'Develop strategic addition and reasoning',instructions:['Add any number 1–5 to a running total (starts at 0).','BUT: can\'t use the same number your opponent just used.','First to reach EXACTLY 37 = WIN! 🥊'],illustration:'Total: 0\nP1 adds 4 → 4\nP2 can\'t add 4! Adds 3 → 7\n...reach 37 exactly!',hint:'Work backwards from 37. Find winning positions!',questions:['Does first move matter?','What\'s the pattern of winning positions? 🥊']}
];

let soarProgress={};
try{const s=localStorage.getItem('safia-soar');if(s)soarProgress=JSON.parse(s);}catch(e){}

window.showSoarMenu=function(){
  const grid=document.getElementById('soarLevelsGrid');grid.innerHTML='';
  const groups={'3-5':[],'5-7':[],'5-11':[],'7-11':[],'9-14':[]};
  soarActivities.forEach((act,idx)=>{(groups[act.age]||groups['5-11']).push({act,idx});});
  const labels={'3-5':'🌸 Ages 3–5','5-7':'🎀 Ages 5–7','5-11':'👑 Ages 5–11','7-11':'🌺 Ages 7–11','9-14':'🧸 Ages 9–14'};
  ['3-5','5-7','5-11','7-11','9-14'].forEach(age=>{
    const items=groups[age];if(!items||!items.length)return;
    const hdr=document.createElement('div');hdr.className='age-group-header';hdr.textContent=labels[age];grid.appendChild(hdr);
    items.forEach(({act,idx})=>{
      const btn=document.createElement('div');btn.className='soar-level-btn';
      const done=soarProgress[idx]?' ✅':'';
      btn.innerHTML=`<div class="soar-icon">${act.icon}</div><div class="soar-title">${act.title}${done}</div><div class="soar-desc">${act.desc}</div>`;
      btn.addEventListener('click',()=>showSoarActivity(idx));
      grid.appendChild(btn);
    });
  });
  showScreen('soarMenuScreen');
};

function showSoarActivity(index){
  const act=soarActivities[index];
  const vid=SOAR_VIDEOS_BY_ID[act.id];
  const instList=act.instructions.map(t=>`<li style="margin-bottom:8px;">🌸 ${t}</li>`).join('');
  const questDiv=act.questions.map(q=>`<div class="talk-bubble">🤔 <strong>Try asking:</strong> ${q}</div>`).join('');
  const doneBtn=soarProgress[index]
    ?`<button class="soar-btn secondary" style="background:var(--gold);color:#1a0a1e;" onclick="window.unmarkDone(${index})">↩️ Mark undone</button>`
    :`<button class="soar-btn secondary" onclick="window.markDone(${index})">✅ I did it! 🌸</button>`;
  document.getElementById('soarActivityContent').innerHTML=`
    <div class="content-card content-card--soar">
      <div class="activity-header">
        <span class="activity-icon">${act.icon}</span>
        <div><div class="activity-title">${act.title}</div><span class="activity-age">age ${act.age}</span></div>
      </div>
      <p style="background:var(--card);padding:10px;border-radius:20px;border:1px solid var(--border);">🎯 ${act.aim}</p>
      <div class="illustration">
        <div style="font-size:1.8rem;margin-bottom:8px;">🌸 Let's try!</div>
        <div style="font-size:1.4rem;background:var(--bg);padding:14px;border-radius:16px;">${act.illustration}</div>
      </div>
      <div style="text-align:center;margin:10px 0;">
        ${vid?`<a class="video-btn" href="${vid.url}" target="_blank" rel="noopener">▶️ ${vid.title}</a>`:''}
        ${NRICH_LINKS_BY_ID[act.id]?makeNrichBtn(NRICH_LINKS_BY_ID[act.id]):''}
      </div>
      <div style="margin:14px 0;">
        <div style="font-weight:800;color:var(--gold);margin-bottom:8px;">📋 Easy steps:</div>
        <ul style="list-style-type:none;padding-left:5px;">${instList}</ul>
      </div>
      <div class="hint-box" id="soarHintBox">💡 <strong>Hint:</strong> ${act.hint}</div>
      ${questDiv}
      <div class="btn-row">
        <button class="soar-btn" onclick="document.getElementById('soarHintBox').classList.toggle('show')">💡 Show hint</button>
        ${doneBtn}
      </div>
      <p style="font-size:.7rem;color:var(--muted);text-align:center;margin-top:10px;">Keep exploring – maths is everywhere, Princess! 🌸</p>
    </div>`;
  showScreen('soarActivityScreen');
}
window.markDone=function(i){
  soarProgress[i]=true;localStorage.setItem('safia-soar',JSON.stringify(soarProgress));
  totalStarsEarned++;localStorage.setItem('safia-totalstars',String(totalStarsEarned));
  launchConfetti(50);showPop('🌸 DONE!','#ff6eb4');
  checkTrophies(totalStarsEarned-1,totalStarsEarned,progress);
  alert('🌸 Amazing, Safia! Activity complete! Keep soaring! 👑');
  showSoarActivity(i);
};
window.unmarkDone=function(i){soarProgress[i]=false;localStorage.setItem('safia-soar',JSON.stringify(soarProgress));showSoarActivity(i);};
window.showHome=function(){showScreen('homeScreen');renderHome();checkDailyBonus();};

// ============================================================
//  INIT
// ============================================================
loadTheme();
updateMistakePatternsDisplay();
checkBadges();
renderTrophyShelf();
checkDailyBonus();
renderHome();
if(window.speechSynthesis){
  window.speechSynthesis.getVoices();
  if(window.speechSynthesis.onvoiceschanged!==undefined)window.speechSynthesis.onvoiceschanged=()=>window.speechSynthesis.getVoices();
}
