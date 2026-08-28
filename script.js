// Safia's & Safaan's Math Dojo — interaction/render/animation layer.
// Content and question-generation logic live in mathdata.js (loaded before this file).
// iOS Safari only fires CSS :active on elements with a touch listener somewhere in the
// ancestor chain — this one-time no-op listener makes the "pressed game button" effect
// (see style.css .btn/.icon-btn/.mc-choice/.coin-btn/.level-tile :active rules) work on tap.
document.body.addEventListener('touchstart', ()=>{}, {passive:true});

// ============================================================
//  CONFETTI
// ============================================================
const confCanvas=document.getElementById('confettiCanvas');
const confCtx=confCanvas.getContext('2d');
let confParticles=[];
function resizeConf(){confCanvas.width=window.innerWidth;confCanvas.height=window.innerHeight;}
resizeConf();window.addEventListener('resize',resizeConf);
function launchConfetti(count){
  const cols=['#17C7C7','#FFB020','#FF5C3D','#2FE6A7','#3DDCDC','#FFC94D','#fff'];
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
// Cycle mascots: MMA fighter 🥋, racer 🏎️, champion 🏆, Labubu 🧸
const mascots=['🥋','🏎️','🏆','🧸'];
let mascotIdx=0;
mascotEl.addEventListener('click',()=>{
  mascotIdx=(mascotIdx+1)%mascots.length;
  mascotEl.textContent=mascots[mascotIdx];
  mascotReact('cheer');
  doSpeak(['Hi-ya! Kick that problem!','Vroom vroom, keep going!','You are a champion!','Keep training, you got this!'][mascotIdx]);
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
const popWordsGood=['✅ PERFECT!','🏁 YES!','🏆 CHAMPION!','🥊 KICK IT!','💫 AMAZING!','🌟 SUPER!','🔧 GREAT!'];
const popWordsBad=['💪 TRY AGAIN!','🥊 FIGHT ON!','🧸 YOU GOT THIS!'];
function showPop(text,color){
  popEl.textContent=text||popWordsGood[Math.floor(Math.random()*popWordsGood.length)];
  popEl.style.color=color||'#FFB020';
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

// TROPHIES comes from mathdata.js (16 racing/dojo-themed trophies).
let trophyData={};
try{const t=localStorage.getItem('mathdojo-trophies');if(t)trophyData=JSON.parse(t);}catch(e){}
let totalStarsEarned=0;
try{const ts=localStorage.getItem('mathdojo-stars');if(ts)totalStarsEarned=parseInt(ts)||0;}catch(e){}

function checkTrophies(prevStars,newStars,prog){
  TROPHIES.forEach(t=>{
    if(!trophyData[t.id]&&t.check(newStars,prog)){
      trophyData[t.id]=true;
      localStorage.setItem('mathdojo-trophies',JSON.stringify(trophyData));
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
  if(localStorage.getItem('mathdojo-lastbonus')===today){document.getElementById('dailyBonusWrap').innerHTML='';return;}
  document.getElementById('dailyBonusWrap').innerHTML=`
    <div class="daily-card">
      <div class="daily-title">🎁 Daily Dojo Bonus! Play today for +3 ⭐ bonus stars!</div>
      <button class="daily-claim" onclick="claimDaily()">🏁 Claim My Bonus!</button>
    </div>`;
}
window.claimDaily=function(){
  localStorage.setItem('mathdojo-lastbonus',new Date().toDateString());
  totalStarsEarned+=3;
  updateTopBarStars();
  persistAll();
  document.getElementById('dailyBonusWrap').innerHTML='<div style="text-align:center;font-family:var(--font-display);font-size:1.3rem;color:var(--amber-400);padding:10px;">🎁 +3 Stars!</div>';
  launchConfetti(60);showPop('🏆 +3 Stars!','#FFB020');mascotReact('cheer');
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
//  BADGES — data-driven off BADGES_DEF (mathdata.js)
// ============================================================
let badges={};
BADGES_DEF.forEach(b=>{badges[b.key]=false;});
try{const s=localStorage.getItem('mathdojo-badges');if(s)Object.assign(badges,JSON.parse(s));}catch(e){}
function checkBadges(){
  BADGES_DEF.forEach(b=>{badges[b.key]=!!b.check(progress);});
  localStorage.setItem('mathdojo-badges',JSON.stringify(badges));
  Object.entries(badges).forEach(([k,v])=>{
    const el=document.getElementById('badge'+k.charAt(0).toUpperCase()+k.slice(1));
    if(el){if(v)el.classList.add('unlocked');else el.classList.remove('unlocked');}
  });
}

// ============================================================
//  PROGRESS STATE — LEVELS comes from mathdata.js
// ============================================================
let progress={};
LEVELS.forEach(l=>{progress[l.id]={completed:false,score:0};});
try{const s=localStorage.getItem('mathdojo-progress');if(s)progress=Object.assign(progress,JSON.parse(s));}catch(e){}

let currentLevel=null,questions=[],qIndex=0,score=0,wrong=0,answered=false;

// ============================================================
//  PERSISTENCE — writes every localStorage key in one call
// ============================================================
function persistAll(){
  localStorage.setItem('mathdojo-progress',JSON.stringify(progress));
  localStorage.setItem('mathdojo-soar',JSON.stringify(soarProgress));
  localStorage.setItem('mathdojo-trophies',JSON.stringify(trophyData));
  localStorage.setItem('mathdojo-badges',JSON.stringify(badges));
  localStorage.setItem('mathdojo-stars',String(totalStarsEarned));
}

// ============================================================
//  QUESTION TYPE REGISTRY
//  Each question has a `kind` (or a legacy `type` mapped via
//  KIND_BY_TYPE from mathdata.js) that selects how it renders its
//  input and how its answer is checked.
// ============================================================
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

const QUESTION_TYPES={
  numeric:{
    inputHtml(q){return `<input class="answer-input" id="answerInput" type="number" placeholder="Type your answer…">`;},
    bindEnter(){document.getElementById('answerInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')checkAnswer();});},
    check(q){
      const raw=document.getElementById('answerInput')?.value;
      if(!raw)return{status:'empty',message:'Type your answer!'};
      return{status:parseInt(raw)===q.answer?'correct':'wrong',message:`🥊 Answer: ${friendlyAnswer(q)}`};
    }
  },
  fact_family:{
    inputHtml(q){return `<div class="fact-rows">${[1,2,3,4].map(i=>`<div class="fact-row"><span style="color:var(--text-secondary);">${i}.</span><input class="fact-input" id="f${i}a" type="number" placeholder="?"><span style="color:var(--coral-400);font-size:1.2rem;">${i<=2?'+':'−'}</span><input class="fact-input" id="f${i}b" type="number" placeholder="?"><span style="color:var(--coral-400);font-size:1.2rem;">=</span><input class="fact-input" id="f${i}c" type="number" placeholder="?"></div>`).join('')}</div>`;},
    bindEnter(){['f1a','f1b','f1c','f2a','f2b','f2c','f3a','f3b','f3c','f4a','f4b','f4c'].forEach(id=>document.getElementById(id)?.addEventListener('keydown',e=>{if(e.key==='Enter')checkAnswer();}));},
    check(q){
      const facts=[1,2,3,4].map(i=>({a:gv(`f${i}a`),b:gv(`f${i}b`),c:gv(`f${i}c`)}));
      if(facts.some(f=>isNaN(f.a)||isNaN(f.b)||isNaN(f.c)))return{status:'empty',message:'Please fill all four facts!'};
      const cf=[{a:q.a,b:q.b,c:q.total},{a:q.b,b:q.a,c:q.total},{a:q.total,b:q.a,c:q.b},{a:q.total,b:q.b,c:q.a}];
      const used=new Set();let allOk=true;
      facts.forEach((fact,idx)=>{
        let ok=false;
        for(let i=0;i<cf.length;i++){if(used.has(i))continue;const c=cf[i];if(idx<2){if((fact.a===c.a&&fact.b===c.b&&fact.c===c.c)||(fact.a===c.b&&fact.b===c.a&&fact.c===c.c)){ok=true;used.add(i);break;}}else{if(fact.a===c.a&&fact.b===c.b&&fact.c===c.c){ok=true;used.add(i);break;}}}
        const rowIds=[['f1a','f1b','f1c'],['f2a','f2b','f2c'],['f3a','f3b','f3c'],['f4a','f4b','f4c']][idx];
        rowIds.forEach(id=>{const el=document.getElementById(id);el.classList.remove('correct','wrong');el.classList.add(ok?'correct':'wrong');});
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
      if(rows.some(r=>isNaN(r.a)||isNaN(r.b)))return{status:'empty',message:'Fill both rows!'};
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
      if(mcSelectedIdx===null)return{status:'empty',message:'Pick an answer!'};
      const ok=q.choices[mcSelectedIdx].correct;
      const correctLabel=q.choices.find(c=>c.correct).label;
      document.querySelectorAll('.mc-choice').forEach((el,i)=>{
        if(i===mcSelectedIdx)el.classList.add(ok?'correct':'wrong');
        else if(q.choices[i].correct)el.classList.add('correct');
      });
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
      if(!selectedCoins.length)return{status:'empty',message:'Tap some coins!'};
      const sum=selectedCoins.reduce((s,idx)=>s+q.coins[idx],0);
      return{status:sum===q.target?'correct':'wrong',message:`🥊 Target was ${formatCents(q.target)}, you picked ${formatCents(sum)}`};
    }
  }
};

// ============================================================
//  VIDEO / NRICH LINK BUTTONS
// ============================================================
function makeVideoBtn(url,title){return `<a class="video-btn" href="${url}" target="_blank" rel="noopener">▶️ ${title}</a>`;}
function makeNrichBtn(url){return `<a class="nrich-btn" href="${url}" target="_blank" rel="noopener">📘 Open on NRICH</a>`;}

// ============================================================
//  RENDER HELPERS (SVG) — no mathdata.js equivalent, kept here
//  as presentation-only helpers called by mathdata.js's generators.
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
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--border-strong)" stroke-width="2"/>`;
  }).join('');
  // NOTE: must stay a single line — renderQuestion() runs q.question.replace(/\n/g,'<br>')
  // on the whole question string, and a stray <br> inside <svg> breaks HTML5's foreign-content
  // parsing rules, silently dropping every element after it.
  return `<svg width="150" height="150" viewBox="0 0 120 120" style="display:block;margin:10px auto;">`
    +`<circle cx="${cx}" cy="${cy}" r="54" fill="var(--clock-face)" stroke="var(--border-strong)" stroke-width="4"/>`
    +ticks
    +`<line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="var(--clock-hand)" stroke-width="5" stroke-linecap="round"/>`
    +`<line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="var(--clock-hand)" stroke-width="3" stroke-linecap="round"/>`
    +`<circle cx="${cx}" cy="${cy}" r="4" fill="var(--color-reward)"/>`
    +`</svg>`;
}
function formatTime(hour,minute){const h12=hour%12===0?12:hour%12;return `${h12}:${minute===0?'00':minute}`;}
function pieSliceSvg(parts,shadedCount){
  const cx=50,cy=50,r=44;let svg=`<svg width="100" height="100" viewBox="0 0 100 100">`;
  for(let i=0;i<parts;i++){
    const a0=(i/parts)*2*Math.PI-Math.PI/2,a1=((i+1)/parts)*2*Math.PI-Math.PI/2;
    const x0=(cx+r*Math.cos(a0)).toFixed(1),y0=(cy+r*Math.sin(a0)).toFixed(1);
    const x1=(cx+r*Math.cos(a1)).toFixed(1),y1=(cy+r*Math.sin(a1)).toFixed(1);
    const largeArc=(a1-a0)>Math.PI?1:0;
    const fill=i<shadedCount?'var(--color-accent)':'var(--surface-2)';
    svg+=`<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${largeArc} 1 ${x1},${y1} Z" fill="${fill}" stroke="var(--border-strong)" stroke-width="2"/>`;
  }
  svg+=`</svg>`;return svg;
}
function barChartHtml(items){
  const max=Math.max(...items.map(i=>i.value));
  const bars=items.map((it,i)=>{
    const h=10+Math.round((it.value/max)*80);
    const color=`var(--chart-${(i%4)+1})`;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:0;"><div style="font-weight:900;color:${color};font-size:.85rem;">${it.value}</div><div style="width:100%;max-width:36px;height:${h}px;background:${color};border-radius:6px 6px 0 0;margin:0 auto;"></div><div style="font-size:1.3rem;">${it.emoji}</div><div style="font-size:.6rem;color:var(--text-muted);text-align:center;">${it.label}</div></div>`;
  }).join('');
  return `<div style="display:flex;align-items:flex-end;justify-content:center;gap:8px;padding:12px 8px 6px;background:var(--surface-2);border-radius:16px;margin:10px 0;">${bars}</div>`;
}
function shapeSvg(type){
  const common='width="100" height="100" viewBox="0 0 100 100"',style='fill="var(--color-primary)" stroke="var(--border-strong)" stroke-width="4"';
  if(type==='circle')return `<svg ${common}><circle cx="50" cy="50" r="40" ${style}/></svg>`;
  if(type==='square')return `<svg ${common}><rect x="14" y="14" width="72" height="72" ${style}/></svg>`;
  if(type==='rectangle')return `<svg ${common}><rect x="8" y="26" width="84" height="48" ${style}/></svg>`;
  if(type==='triangle')return `<svg ${common}><polygon points="50,10 90,90 10,90" ${style}/></svg>`;
  if(type==='pentagon')return `<svg ${common}><polygon points="50,8 90,38 75,88 25,88 10,38" ${style}/></svg>`;
  if(type==='hexagon')return `<svg ${common}><polygon points="30,10 70,10 92,50 70,90 30,90 8,50" ${style}/></svg>`;
  return `<svg ${common}><polygon points="30,6 70,6 94,30 94,70 70,94 30,94 6,70 6,30" ${style}/></svg>`;
}
function lengthBlocksHtml(n){return Array.from({length:n},()=>`<span style="display:inline-block;width:22px;height:22px;background:var(--chart-1);border:2px solid var(--border-strong);border-radius:4px;margin:1px;"></span>`).join('');}

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
      btn.className='level-tile';
      btn.innerHTML=`<div class="level-icon">${level.icon}</div><div class="level-name">${level.name}</div><div class="level-stars">${stars||'&nbsp;'}</div>`;
      btn.onclick=()=>startLevel(level);
      grid.appendChild(btn);
    });
  }
  updateProgressStats();
  checkBadges();
  renderTrophyShelf();
  updateTopBarStars();
  const gymStat=document.getElementById('gymHomeStat');
  if(gymStat)gymStat.textContent=`Today ${mmSheet.daily.done}/16`;
}
window.showPracticeMenu=function(){renderHome();showScreen('practiceMenuScreen');};

function updateProgressStats(){
  const m=LEVELS.filter(l=>progress[l.id]?.completed).length;
  const pct=Math.round(m/LEVELS.length*100)||0;
  document.getElementById('progressStats').textContent=`${m} of ${LEVELS.length} levels mastered (${pct}%)`;
  document.getElementById('progressBarFill').style.width=pct+'%';
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

  const badge=TYPE_LABELS[q.type]||'Maths';
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

function handleCorrect(){
  score++;currentStreak++;
  updateStreakBadge();lightDot(Math.min(qIndex,4));
  playCorrectSound();
  launchConfetti(currentStreak>=3?55:25);
  const popWord=currentStreak>=4?'🏆 CHAMPION!':currentStreak>=3?'🔥 ON FIRE!':'✅ PERFECT!';
  showPop(popWord,currentStreak>=3?'#FFB020':'#17C7C7');
  mascotReact('cheer');
  document.getElementById('feedback').className='feedback show ok';
  document.getElementById('feedback').textContent=currentStreak>=3?`🔥 ${currentStreak} in a row!`:'✅ Correct! Great work!';
  document.getElementById('scoreCorrect').textContent=score;
  const cv=document.getElementById('scoreCorrect');cv.classList.remove('bump');void cv.offsetWidth;cv.classList.add('bump');
  totalStarsEarned++;
  updateTopBarStars();
  checkTrophies(totalStarsEarned-1,totalStarsEarned,progress);
  persistAll();
  document.getElementById('checkButton').style.display='none';
  document.getElementById('nextButton').style.display='block';
  document.getElementById('hintButton').disabled=true;
}
function handleWrong(msg){
  wrong++;currentStreak=0;updateStreakBadge();
  playWrongSound();mascotReact('oops');
  document.getElementById('scoreWrong').textContent=wrong;
  document.getElementById('feedback').className='feedback show bad';
  document.getElementById('feedback').textContent=msg||'🥊 Keep fighting!';
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
  checkBadges();checkTrophies(totalStarsEarned,totalStarsEarned,progress);
  persistAll();
  playCelebrationSound();
  if(pct>=90){launchConfetti(140);showPop('🏆 PERFECT RUN!','#FFB020');}
  else if(pct>=70){launchConfetti(70);showPop('🏁 GREAT JOB!','#17C7C7');}
  document.getElementById('resultEmoji').textContent=pct>=90?'🏆':pct>=70?'🏁':'🔧';
  document.getElementById('resultTitle').textContent=pct>=90?'Perfect Run!':pct>=70?'Great Job!':'Keep Training!';
  const starsEl=document.getElementById('resultStars');
  starsEl.className='result-stars animate';
  const starCount=pct>=90?3:pct>=70?2:1;
  starsEl.innerHTML='<span>⭐</span>'.repeat(starCount);
  document.getElementById('resultMessage').innerHTML=`You got ${score}/${total} correct (${pct}%)`;
  const idx=LEVELS.findIndex(l=>l.id===currentLevel.id);
  const nb=document.getElementById('nextLevelButton');
  if(passed&&idx<LEVELS.length-1){nb.style.display='block';nb.onclick=()=>startLevel(LEVELS[idx+1]);}
  else nb.style.display='none';
  document.getElementById('retryButton').onclick=()=>startLevel(currentLevel);
  renderHome();showScreen('resultScreen');
}

// ============================================================
//  NAVIGATION — persistent TopBar back button + QuickNav tabs
// ============================================================
const BACK_TARGET={practiceMenuScreen:'homeScreen',soarMenuScreen:'homeScreen',soarActivityScreen:'soarMenuScreen',quizScreen:'practiceMenuScreen',resultScreen:'practiceMenuScreen',
  gymScreen:'homeScreen',drillScreen:'gymScreen',flashScreen:'gymScreen',trainerScreen:'gymScreen',dailyScreen:'gymScreen',columnScreen:'gymScreen',gymResultScreen:'gymScreen',sheetResultScreen:'gymScreen'};
const TAB_FOR_SCREEN={homeScreen:'home',practiceMenuScreen:'levels',soarMenuScreen:'soar',soarActivityScreen:'soar',quizScreen:'levels',resultScreen:'levels',
  gymScreen:'gym',drillScreen:'gym',flashScreen:'gym',trainerScreen:'gym',dailyScreen:'gym',columnScreen:'gym',gymResultScreen:'gym',sheetResultScreen:'gym'};
const SCREEN_TITLES={homeScreen:"🏁 Safia's & Safaan's Math Dojo",practiceMenuScreen:'🏎️ Practice Math',soarMenuScreen:'🦅 SOAR Adventures',soarActivityScreen:'🦅 SOAR Activity',quizScreen:'🥊 Quiz',resultScreen:'🏆 Result',
  gymScreen:'🧠 Mental Math Gym',drillScreen:'⏱️ Speed Drill',flashScreen:'🃏 Flash Cards',trainerScreen:'🌉 Learn a Trick',dailyScreen:"📋 Today's Sheet",columnScreen:'🧮 Carry & Borrow',gymResultScreen:'🏁 Drill Result',sheetResultScreen:'🏆 Sheet Result'};

function updateTopBar(screenId){
  const t=document.getElementById('topBarTitle');
  if(t)t.textContent=SCREEN_TITLES[screenId]||"🏁 Safia's & Safaan's Math Dojo";
  const back=document.getElementById('topBarBack');
  if(back)back.classList.toggle('is-hidden',screenId==='homeScreen');
}
function setActiveQuickNavTab(screenId){
  const active=TAB_FOR_SCREEN[screenId]||'home';
  document.querySelectorAll('.quicknav__tab').forEach(el=>el.classList.toggle('quicknav__tab--active',el.dataset.tab===active));
}
function handleBack(){
  const current=document.querySelector('.screen.active');
  if(!current)return;
  const target=BACK_TARGET[current.id];
  if(target)showScreen(target);
}
function updateTopBarStars(){
  const el=document.getElementById('topBarStars');
  if(el)el.textContent='★ '+totalStarsEarned;
}

function goHome(){renderHome();showScreen('practiceMenuScreen');}
function showScreen(id){
  const current=document.querySelector('.screen.active');
  if(current&&current.id==='drillScreen'&&id!=='drillScreen')stopDrillTimers();
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  updateTopBar(id);
  setActiveQuickNavTab(id);
}

// ============================================================
//  SAVE / LOAD — covers progress, SOAR completion, trophies,
//  badges and total stars (a full backup, not just level progress).
// ============================================================
function buildSaveBundle(){
  return {version:1,savedAt:new Date().toISOString(),progress,soarProgress,trophyData,badges,totalStarsEarned,
    mmCards,mmMisses,mmBest,mmSets,mmSession,mmSheet};
}
function saveProgress(){
  const b=new Blob([JSON.stringify(buildSaveBundle(),null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='math-dojo-progress.json';a.click();
}
function loadProgress(){document.getElementById('loadFile').click();}
function handleLoadFile(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{
    try{
      const data=JSON.parse(ev.target.result);
      if(!data.version){
        // Legacy save (bare progress object) — merge as level progress only.
        Object.assign(progress,data);
      }else{
        if(data.progress)Object.assign(progress,data.progress);
        if(data.soarProgress)Object.assign(soarProgress,data.soarProgress);
        if(data.trophyData)Object.assign(trophyData,data.trophyData);
        if(data.badges)Object.assign(badges,data.badges);
        if(typeof data.totalStarsEarned==='number')totalStarsEarned=data.totalStarsEarned;
        if(data.mmCards)Object.assign(mmCards,data.mmCards);
        if(data.mmMisses)Object.assign(mmMisses,data.mmMisses);
        if(data.mmBest)mmBest=data.mmBest;
        if(Array.isArray(data.mmSets)&&data.mmSets.length)mmSets=data.mmSets;
        if(typeof data.mmSession==='number')mmSession=data.mmSession;
        if(data.mmSheet)mmSheet=data.mmSheet;
      }
      persistAll();persistMM();
      renderHome();checkBadges();renderTrophyShelf();updateTopBarStars();renderWeakFactsPanel();
      alert('Progress loaded!');
    }catch{alert('Could not read that file.');}
  };
  r.readAsText(f);
}

// ============================================================
//  SOAR — SOAR_ACTIVITIES / SOAR_VIDEOS_BY_ID / NRICH_LINKS_BY_ID
//  all come from mathdata.js.
// ============================================================
let soarProgress={};
try{const s=localStorage.getItem('mathdojo-soar');if(s)soarProgress=JSON.parse(s);}catch(e){}

window.showSoarMenu=function(){
  const grid=document.getElementById('soarLevelsGrid');grid.innerHTML='';
  const groups={'3-5':[],'5-7':[],'5-11':[],'7-11':[],'9-14':[]};
  SOAR_ACTIVITIES.forEach((act,idx)=>{(groups[act.age]||groups['5-11']).push({act,idx});});
  const labels={'3-5':'🏎️ Ages 3–5','5-7':'🏁 Ages 5–7','5-11':'🏆 Ages 5–11','7-11':'⚙️ Ages 7–11','9-14':'🥋 Ages 9–14'};
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
  const act=SOAR_ACTIVITIES[index];
  const vid=SOAR_VIDEOS_BY_ID[act.id];
  const instList=act.instructions.map(t=>`<li style="margin-bottom:8px;">🏁 ${t}</li>`).join('');
  const questDiv=act.questions.map(q=>`<div class="talk-bubble">🤔 <strong>Try asking:</strong> ${q}</div>`).join('');
  const doneBtn=soarProgress[index]
    ?`<button class="btn btn--reward" onclick="window.unmarkDone(${index})">↩️ Mark undone</button>`
    :`<button class="btn btn--primary" onclick="window.markDone(${index})">✅ I did it!</button>`;
  document.getElementById('soarActivityContent').innerHTML=`
    <div class="content-card content-card--soar">
      <div class="activity-header">
        <span class="activity-icon">${act.icon}</span>
        <div><div class="activity-title">${act.title}</div><span class="activity-age">age ${act.age}</span></div>
      </div>
      <p style="background:var(--surface-2);padding:10px;border-radius:20px;border:1px solid var(--border-strong);">🎯 ${act.aim}</p>
      <div class="illustration">
        <div style="font-size:1.8rem;margin-bottom:8px;">🏁 Let's try!</div>
        <div style="font-size:1.4rem;background:var(--bg-app-deep);padding:14px;border-radius:16px;">${act.illustration}</div>
      </div>
      <div style="text-align:center;margin:10px 0;">
        ${vid?`<a class="video-btn" href="${vid.url}" target="_blank" rel="noopener">▶️ ${vid.title}</a>`:''}
        ${NRICH_LINKS_BY_ID[act.id]?makeNrichBtn(NRICH_LINKS_BY_ID[act.id]):''}
      </div>
      <div style="margin:14px 0;">
        <div style="font-weight:800;color:var(--amber-400);margin-bottom:8px;">📋 Easy steps:</div>
        <ul style="list-style-type:none;padding-left:5px;">${instList}</ul>
      </div>
      <div class="hint-box" id="soarHintBox">💡 <strong>Hint:</strong> ${act.hint}</div>
      ${questDiv}
      <div class="btn-row">
        <button class="btn btn--reward" onclick="document.getElementById('soarHintBox').classList.toggle('show')">💡 Show hint</button>
        ${doneBtn}
      </div>
      <p style="font-size:.7rem;color:var(--text-muted);text-align:center;margin-top:10px;">Keep exploring – math is everywhere! 🏁</p>
    </div>`;
  showScreen('soarActivityScreen');
}
window.markDone=function(i){
  soarProgress[i]=true;
  totalStarsEarned++;
  updateTopBarStars();
  launchConfetti(50);showPop('✅ DONE!','#17C7C7');
  checkTrophies(totalStarsEarned-1,totalStarsEarned,progress);
  persistAll();
  alert('Amazing! Activity complete! Keep soaring! 🦅');
  showSoarActivity(i);
};
window.unmarkDone=function(i){soarProgress[i]=false;persistAll();showSoarActivity(i);};
window.showHome=function(){showScreen('homeScreen');renderHome();checkDailyBonus();};

// ============================================================
//  MENTAL MATH GYM — FACT_SETS/randFact/buildDrill/choicesFor/
//  strategyFor/trainerFact/trainerSteps/gradeCard/flashDeck/
//  mastery/weakFacts/todayKey/dailySheet/dailyHint/columnSheet/
//  columnPlan all come from mentalmath.js.
// ============================================================
let mmCards={};    try{const s=localStorage.getItem('tm-mm-cards');  if(s)mmCards=JSON.parse(s);}catch(e){}
let mmMisses={};   try{const s=localStorage.getItem('tm-mm-misses'); if(s)mmMisses=JSON.parse(s);}catch(e){}
let mmBest=null;   try{const s=localStorage.getItem('tm-mm-best');   if(s)mmBest=JSON.parse(s);}catch(e){}
let mmSets=[...ALL_SET_IDS]; try{const s=localStorage.getItem('tm-mm-sets'); if(s){const p=JSON.parse(s); if(Array.isArray(p)&&p.length)mmSets=p;}}catch(e){}
let mmSession=0;   try{const s=localStorage.getItem('tm-mm-session');if(s)mmSession=parseInt(s)||0;}catch(e){}
let mmSheet={key:null,daily:{done:0,correct:0},column:{done:0,correct:0}};
try{const s=localStorage.getItem('tm-mm-sheet'); if(s)mmSheet=JSON.parse(s);}catch(e){}
if(mmSheet.key!==todayKey())mmSheet={key:todayKey(),daily:{done:0,correct:0},column:{done:0,correct:0}};

function persistMM(){
  localStorage.setItem('tm-mm-cards',JSON.stringify(mmCards));
  localStorage.setItem('tm-mm-misses',JSON.stringify(mmMisses));
  localStorage.setItem('tm-mm-best',JSON.stringify(mmBest));
  localStorage.setItem('tm-mm-sets',JSON.stringify(mmSets));
  localStorage.setItem('tm-mm-session',String(mmSession));
  localStorage.setItem('tm-mm-sheet',JSON.stringify(mmSheet));
}

// ── the drill's setInterval clock + auto-advance setTimeout — cleaned up
// whenever navigation leaves drillScreen (see the guard in showScreen()),
// and at the moment a drill finishes, so nothing keeps ticking in the background.
let mmClockHandle=null, mmAdvanceHandle=null;
function stopDrillTimers(){
  if(mmClockHandle){clearInterval(mmClockHandle);mmClockHandle=null;}
  if(mmAdvanceHandle){clearTimeout(mmAdvanceHandle);mmAdvanceHandle=null;}
}

// ── weak-facts panel — replaces the old vestigial mistakePatterns mechanism,
// reusing the same #patternSummary/#patternTags DOM slot and .pattern-tag CSS.
function renderWeakFactsPanel(){
  const ps=document.getElementById('patternSummary'),pt=document.getElementById('patternTags');
  if(!pt)return;
  const weak=weakFacts(mmMisses,6);
  if(!weak.length){if(ps)ps.style.display='none';return;}
  if(ps)ps.style.display='block';
  pt.innerHTML=weak.map(w=>`<span class="pattern-tag ${w.count>5?'high':''}">${w.display} (${w.count})</span>`).join('');
}

// ── shared keypad — screen tag routes a keypress to that screen's own render
// function, which always redraws from current state (mmEntry is only ever
// reset by the "start a new question/step" functions, never by a render fn),
// so re-rendering on every keystroke is always safe.
function mmKeypadHtml(screen,onSubmit){
  const digits=['1','2','3','4','5','6','7','8','9'].map(d=>`<button type="button" class="btn btn--ghost" onclick="mmPressKey('${d}','${screen}')">${d}</button>`).join('');
  return `<div class="keypad">${digits}<button type="button" class="btn btn--ghost" onclick="mmPressKey('del','${screen}')">⌫</button><button type="button" class="btn btn--ghost" onclick="mmPressKey('0','${screen}')">0</button><button type="button" class="btn btn--primary" onclick="${onSubmit}">✓</button></div>`;
}
function mmPressKey(k,screen){
  if(k==='del')mmEntry=mmEntry.slice(0,-1);
  else if(mmEntry.length<3)mmEntry+=k;
  if(screen==='drill')renderDrillQuestion();
  else if(screen==='trainer')renderTrainerStep();
  else if(screen==='daily')renderSheetProblem();
  else if(screen==='column')renderColumnStep();
}

// ── Gym hub ──
function renderGym(){
  const chipsHtml=FACT_SETS.map(fs=>{
    const on=mmSets.includes(fs.id);
    return `<button type="button" class="chip${on?' chip--active':''}" onclick="toggleMMSet('${fs.id}')"><span>${fs.icon}</span>${fs.label}</button>`;
  }).join('');
  const weakCount=Object.keys(mmMisses||{}).length;
  const tiles=[
    {icon:'📋',name:"Today's sheet",line:'16 problems. Add, take away and shop money.',stat:`${mmSheet.daily.done}/16`,color:'success',full:true,onclick:'startDaily()'},
    {icon:'🧮',name:'Carry & borrow',line:'Big numbers, drawn out step by step.',stat:`${mmSheet.column.done}/12`,color:'amber',onclick:'startColumn()'},
    {icon:'⏱️',name:'Speed drill',line:'20 facts, fast. Beat your best time.',stat:mmBest?`${mmBest.time}s`:'new',color:'cyan1',onclick:'startDrill()'},
    {icon:'🃏',name:'Flash cards',line:'Flip a card. Say the answer out loud.',stat:`${mastery(mmCards)}%`,color:'coral',onclick:'startFlash()'},
    {icon:'🌉',name:'Learn a trick',line:'A hard sum, broken into little steps.',stat:weakCount?`${weakCount} to fix`:'go',color:'cyan2',onclick:'startTrainer()'},
  ];
  const tilesHtml=tiles.map(t=>`
    <button type="button" class="gym-tile gym-tile--${t.color}${t.full?' gym-tile--full':''}" onclick="${t.onclick}">
      <span class="gym-tile__icon">${t.icon}</span>
      <span class="gym-tile__body"><span class="gym-tile__name">${t.name}</span><span class="gym-tile__line">${t.line}</span></span>
      <span class="gym-tile__stat">${t.stat}</span>
    </button>`).join('');
  document.getElementById('gymContent').innerHTML=`
    <div style="text-align:center;margin-bottom:14px;">
      <div style="font-size:2rem;">🧠</div>
      <div style="font-family:var(--font-display);font-size:1.6rem;color:var(--coral-400);margin-top:4px;">Mental Math Gym</div>
      <div style="color:var(--text-secondary);font-size:.9rem;">Fast facts, in your head. No paper, no fingers.</div>
    </div>
    <div class="gym-tile-grid">${tilesHtml}</div>
    <div class="content-card" style="margin-top:14px;">
      <div style="font-family:var(--font-display);color:var(--cyan-300);font-size:1.05rem;margin-bottom:4px;">Pick what to practise</div>
      <div style="color:var(--text-muted);font-size:.75rem;font-weight:700;margin-bottom:10px;">Tap one to turn it on or off.</div>
      <div class="chip-row">${chipsHtml}</div>
    </div>`;
}
function showGym(){stopDrillTimers();renderGym();showScreen('gymScreen');}
function toggleMMSet(id){
  let sets=mmSets.includes(id)?mmSets.filter(x=>x!==id):[...mmSets,id];
  if(!sets.length)sets=[id];
  mmSets=sets;persistMM();renderGym();
}

// ── Speed drill ──
let mmQueue=[],mmIdx=0,mmScore=0,mmWrong=0,mmStreak=0,mmElapsed=0,mmEntry='',mmFeedback=null,mmReview=[];
function startDrill(){
  mmQueue=buildDrill(20,mmSets,mmMisses);
  mmIdx=0;mmScore=0;mmWrong=0;mmStreak=0;mmEntry='';mmElapsed=0;mmFeedback=null;mmReview=[];
  stopDrillTimers();
  mmClockHandle=setInterval(()=>{mmElapsed++;updateDrillClock();},1000);
  showScreen('drillScreen');
  renderDrillQuestion();
}
function mmClockLabel(){return `${Math.floor(mmElapsed/60)}:${String(mmElapsed%60).padStart(2,'0')}`;}
function updateDrillClock(){
  const el=document.getElementById('mmClock');if(el)el.textContent=mmClockLabel();
  const youFill=document.getElementById('mmYouFill');if(youFill)youFill.style.width=Math.round(mmIdx/mmQueue.length*100)+'%';
  if(mmBest){
    const ghostIdx=Math.min(mmQueue.length,Math.floor(mmElapsed/(mmBest.time/mmQueue.length)));
    const gf=document.getElementById('mmGhostFill');if(gf)gf.style.width=Math.round(ghostIdx/mmQueue.length*100)+'%';
    const gl=document.getElementById('mmGhostLabel');if(gl)gl.textContent=`${ghostIdx} facts by now`;
  }
}
function renderDrillQuestion(){
  const f=mmQueue[mmIdx];
  const isChoice=mmIdx%3===2;
  const answered=!!mmFeedback;
  const dotsHtml=Array.from({length:5},(_,i)=>`<div class="streak-dot${i<Math.min(mmStreak,5)?' lit':''}"></div>`).join('');
  let inputHtml='';
  if(!answered){
    if(isChoice){
      inputHtml=`<div class="mc-grid">${choicesFor(f).map(c=>`<button type="button" class="mc-choice" onclick="submitDrillAnswer('${c.label}')">${c.label}</button>`).join('')}</div>`;
    }else{
      inputHtml=`<div class="keypad-display">${mmEntry===''?'·':mmEntry}</div>${mmKeypadHtml('drill',"submitDrillAnswer(mmEntry)")}`;
    }
  }
  const feedbackHtml=mmFeedback?`<div class="feedback show ${mmFeedback.ok?'ok':'bad'}">${mmFeedback.msg}</div>`:'';
  document.getElementById('drillContent').innerHTML=`
    <div class="content-card" style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;color:var(--text-secondary);font-size:.75rem;font-weight:800;">
        <span>⏱️ Speed drill</span><span id="mmClock" style="font-family:var(--font-display);font-size:1.1rem;color:var(--amber-400);">${mmClockLabel()}</span><span>${mmIdx+1} / ${mmQueue.length}</span>
      </div>
      <div class="progress-bar" style="margin-top:10px;"><div class="progress-bar__fill" id="mmYouFill" style="width:${Math.round(mmIdx/mmQueue.length*100)}%;"></div></div>
      <div class="ghost-label-row" style="color:var(--cyan-300);"><span>YOU</span><span>${mmScore} right</span></div>
      ${mmBest?`<div class="progress-bar progress-bar--thin" style="margin-top:6px;"><div class="progress-bar__fill progress-bar__fill--ghost" id="mmGhostFill" style="width:0%;"></div></div><div class="ghost-label-row" style="color:var(--text-muted);"><span>👻 YOUR BEST</span><span id="mmGhostLabel">no run yet</span></div>`:''}
    </div>
    <div class="content-card content-card--quiz">
      <div class="streak-row" style="margin-bottom:12px;">${dotsHtml}</div>
      <div class="question-text" style="font-size:2.2rem;">${f.display}</div>
      <div style="text-align:center;color:var(--text-muted);font-size:.72rem;font-weight:800;margin-top:-6px;margin-bottom:10px;">${(SET_LABEL[f.set]||'').toUpperCase()}</div>
      ${inputHtml}
      ${feedbackHtml}
    </div>`;
  updateDrillClock();
}
function submitDrillAnswer(value){
  if(mmFeedback)return;
  if(value===''||value===null||value===undefined)return;
  const f=mmQueue[mmIdx];
  const ok=parseInt(value,10)===f.answer;
  if(ok){if(mmMisses[f.id]){mmMisses[f.id]-=1;if(mmMisses[f.id]<=0)delete mmMisses[f.id];}}
  else{mmMisses[f.id]=(mmMisses[f.id]||0)+1;mmReview.push(f);}
  persistMM();renderWeakFactsPanel();
  mmScore=ok?mmScore+1:mmScore;
  mmWrong=ok?mmWrong:mmWrong+1;
  mmStreak=ok?mmStreak+1:0;
  mmFeedback=ok?{ok:true,msg:mmStreak>=4?`🔥 ${mmStreak} in a row!`:'Yes!'}:{ok:false,msg:`It was ${f.answer}`};
  if(ok&&mmStreak>0&&mmStreak%5===0)launchConfetti(20);
  renderDrillQuestion();
  clearTimeout(mmAdvanceHandle);
  mmAdvanceHandle=setTimeout(advanceDrill,ok?550:1400);
}
function advanceDrill(){
  mmAdvanceHandle=null;
  const next=mmIdx+1;
  if(next>=mmQueue.length){finishDrill();return;}
  mmIdx=next;mmEntry='';mmFeedback=null;
  renderDrillQuestion();
}
function finishDrill(){
  stopDrillTimers();
  const time=mmElapsed;
  const beat=mmScore>=Math.round(mmQueue.length*0.7)&&(!mmBest||time<mmBest.time);
  if(beat)mmBest={time,score:mmScore};
  mmSession++;
  totalStarsEarned+=(mmScore>=15?3:1);
  updateTopBarStars();
  persistMM();persistAll();
  launchConfetti(mmScore>=18?90:45);
  showGymResult(beat);
}
function showGymResult(beat){
  const n=mmQueue.length||20,time=mmElapsed;
  const emoji=beat?'🏁':mmScore>=16?'🧠':'💪';
  const title=beat?'New personal best!':mmScore>=16?'Sharp work':'Good workout';
  const message=beat?'Faster than your last run — the ghost never stood a chance.'
    :mmReview.length?'A few facts slowed you down. They will come back around.'
    :'Every fact answered. Try a tighter set next time.';
  const review=mmReview.slice(0,5).map(f=>{
    const display=f.missing?f.display.replace('?',String(f.answer)):`${f.display} = ${f.answer}`;
    return `<div style="display:flex;justify-content:space-between;gap:10px;font-size:.95rem;"><span style="font-family:var(--font-display);color:var(--text-primary);">${display}</span><span style="color:var(--text-secondary);">${strategyFor(f).name}</span></div>`;
  }).join('');
  document.getElementById('gymResultContent').innerHTML=`
    <div class="result-card" style="border-color:var(--cyan-500);box-shadow:0 0 32px rgba(23,199,199,.2);">
      <div class="result-emoji">${emoji}</div>
      <div class="result-title">${title}</div>
      <div style="display:flex;justify-content:center;gap:22px;margin-top:12px;">
        <div><div style="font-family:var(--font-display);font-size:1.4rem;color:var(--amber-400);">${time}s</div><div style="color:var(--text-muted);font-size:.68rem;font-weight:800;">TIME</div></div>
        <div><div style="font-family:var(--font-display);font-size:1.4rem;color:var(--color-success);">${mmScore}/${n}</div><div style="color:var(--text-muted);font-size:.68rem;font-weight:800;">CORRECT</div></div>
        <div><div style="font-family:var(--font-display);font-size:1.4rem;color:var(--cyan-300);">${(time/n).toFixed(1)}</div><div style="color:var(--text-muted);font-size:.68rem;font-weight:800;">SEC / FACT</div></div>
      </div>
      <div class="result-message">${message}</div>
      ${review?`<div class="content-card" style="margin-top:16px;text-align:left;"><div style="font-family:var(--font-display);color:var(--coral-400);font-size:.95rem;margin-bottom:8px;">Worth another look</div><div style="display:flex;flex-direction:column;gap:6px;">${review}</div></div>`:''}
      <div class="btn-row" style="margin-top:18px;">
        <button class="btn btn--primary" onclick="startDrill()">Run again</button>
        <button class="btn btn--accent" onclick="startTrainer()">Coach me</button>
        <button class="btn btn--ghost" onclick="showGym()">Gym</button>
      </div>
    </div>`;
  showScreen('gymResultScreen');
}

// ── Flash cards ──
let mmDeck=[],mmFlipped=false;
function startFlash(){
  mmDeck=flashDeck(mmCards,mmSession,mmSets,12);
  mmIdx=0;mmFlipped=false;
  stopDrillTimers();
  showScreen('flashScreen');
  renderFlashCard();
}
function renderFlashCard(){
  const c=mmDeck[mmIdx];
  const strat=mmFlipped?strategyFor(c):{name:'',line:''};
  document.getElementById('flashContent').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;color:var(--text-secondary);font-size:.75rem;font-weight:800;">
      <span>🃏 Flash cards</span><span>${mmIdx+1} / ${mmDeck.length}</span>
    </div>
    <div class="flashcard" onclick="flipFlashCard()">
      <div class="flashcard__front">${c.display}</div>
      ${mmFlipped?`<div class="flashcard__answer">${c.answer}</div><div class="flashcard__strategy"><div class="flashcard__strategy-name">${strat.name}</div><div class="flashcard__strategy-line">${strat.line}</div></div>`:`<div class="flashcard__prompt">Say it out loud, then tap the card</div>`}
    </div>
    ${mmFlipped?`<div class="btn-row" style="margin-top:14px;"><button class="btn btn--accent" onclick="gradeFlashCard(false)">Tricky</button><button class="btn btn--primary" onclick="gradeFlashCard(true)">Got it</button></div>`:''}
    <button class="btn btn--ghost" style="width:100%;margin-top:12px;" onclick="showGym()">End workout</button>`;
}
function flipFlashCard(){mmFlipped=!mmFlipped;renderFlashCard();}
function gradeFlashCard(easy){
  const card=mmDeck[mmIdx];
  mmCards=gradeCard(mmCards,card.id,easy,mmSession);
  if(!easy)mmMisses[card.id]=(mmMisses[card.id]||0)+1;
  else if(mmMisses[card.id]){mmMisses[card.id]-=1;if(mmMisses[card.id]<=0)delete mmMisses[card.id];}
  persistMM();renderWeakFactsPanel();
  const next=mmIdx+1;
  if(next>=mmDeck.length){
    mmSession++;persistMM();
    launchConfetti(40);
    showGym();
  }else{
    mmIdx=next;mmFlipped=false;renderFlashCard();
  }
}

// ── Learn a trick (strategy coach) ──
let mmFact=null,mmSteps=[],mmStep=0,mmScaffold=0,mmCleanStreak=0,mmTrainerDone=false;
function startTrainer(){
  mmScaffold=0;mmCleanStreak=0;
  stopDrillTimers();
  showScreen('trainerScreen');
  loadTrainerFact();
}
function loadTrainerFact(){
  const f=trainerFact();
  const all=trainerSteps(f);
  mmFact=f;
  mmSteps=mmScaffold===0?all:mmScaffold===1?all.slice(-2):all.slice(-1);
  mmStep=0;mmEntry='';mmFeedback=null;mmTrainerDone=false;
  renderTrainerStep();
}
function nextTrainerFact(){loadTrainerFact();}
function renderTrainerStep(){
  const labels=['Coach: every step','Coach: two steps','Coach: on your own'];
  const rowsHtml=mmSteps.map((st,i)=>{
    const done=i<mmStep;
    const isCurrent=i===mmStep&&!mmTrainerDone;
    const slot=done?String(st.answer):(isCurrent?(mmEntry===''?'?':mmEntry):'·');
    const cls=done?'is-done':(isCurrent?'is-current':'');
    return `<div class="trainer-step ${cls}"><div class="trainer-step__text">${st.text}</div><div class="trainer-step__slot">${slot}</div></div>`;
  }).join('');
  const feedbackHtml=mmFeedback?`<div class="feedback show ${mmFeedback.ok?'ok':'bad'}">${mmFeedback.msg}</div>`:'';
  const keysHtml=mmTrainerDone?'':`<div class="keypad-display">${mmEntry===''?'·':mmEntry}</div>${mmKeypadHtml('trainer','submitTrainerStep()')}`;
  const nextBtn=mmTrainerDone?`<button class="btn btn--primary" style="width:100%;margin-top:12px;" onclick="nextTrainerFact()">Next one ▶</button>`:'';
  document.getElementById('trainerContent').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;color:var(--text-secondary);font-size:.75rem;font-weight:800;">
      <span>🌉 Strategy coach</span><span>${labels[mmScaffold]}</span>
    </div>
    <div class="content-card content-card--quiz" style="border-top-color:var(--color-accent);">
      <div class="question-text" style="font-size:2rem;">${mmFact.display}</div>
      ${rowsHtml}
      ${feedbackHtml}
      ${keysHtml}
      ${nextBtn}
    </div>
    <button class="btn btn--ghost" style="width:100%;margin-top:12px;" onclick="showGym()">End workout</button>`;
}
function submitTrainerStep(){
  if(mmEntry==='')return;
  const step=mmSteps[mmStep];
  const ok=parseInt(mmEntry,10)===step.answer;
  if(!ok){
    mmEntry='';mmCleanStreak=0;
    mmFeedback={ok:false,msg:`Not quite — it is ${step.answer}. Say it with me.`};
    renderTrainerStep();
    return;
  }
  const next=mmStep+1;
  mmEntry='';
  if(next<mmSteps.length){
    mmStep=next;mmFeedback=null;
    renderTrainerStep();
    return;
  }
  mmStep=next;mmTrainerDone=true;
  const run=mmCleanStreak+1;
  let msg='Solved it!';
  if(run>=3&&mmScaffold<2){
    mmScaffold+=1;
    msg=mmScaffold===1?'Nice — fewer steps from here.':'Straight to the answer now. You have got this.';
    mmCleanStreak=0;
  }else{
    mmCleanStreak=run;
  }
  launchConfetti(20);
  mmFeedback={ok:true,msg};
  renderTrainerStep();
}

// ── Today's sheet & Carry/borrow — shared start/finish, per-kind renderers ──
let mmSheetKind='daily',mmSheetIdx=0,mmSheetItems=[],mmSheetCorrect=0,mmSheetSolved=false;
function startSheet(kind){
  const items=kind==='daily'?dailySheet(todayKey()):columnSheet(todayKey());
  const prog=mmSheet[kind];
  const start=prog.done>=items.length?0:prog.done;
  mmSheetKind=kind;mmSheetItems=items;mmSheetIdx=start;mmSheetCorrect=start?prog.correct:0;
  mmEntry='';mmSheetSolved=false;mmFeedback=null;
  stopDrillTimers();
  if(kind==='daily'){showScreen('dailyScreen');renderSheetProblem();}
  else{showScreen('columnScreen');loadColumnStep();}
}
function startDaily(){startSheet('daily');}
function startColumn(){startSheet('column');}
function nextSheetItem(){
  const next=mmSheetIdx+1;
  mmSheet[mmSheetKind]={done:next,correct:mmSheetCorrect};
  persistMM();
  if(next>=mmSheetItems.length){
    totalStarsEarned+=3;
    updateTopBarStars();
    persistAll();
    launchConfetti(80);
    showSheetResult();
    return;
  }
  mmSheetIdx=next;mmEntry='';mmFeedback=null;mmSheetSolved=false;
  if(mmSheetKind==='daily')renderSheetProblem();
  else loadColumnStep();
}
function showSheetResult(){
  const n=mmSheetItems.length,c=mmSheetCorrect;
  const emoji=c===n?'🏆':c>=n*0.75?'🧠':'💪';
  const title=mmSheetKind==='daily'?"Today's sheet is done":'Carry & borrow done';
  const message=c===n?'Every single one. Come back tomorrow for a fresh sheet.':'Sheet finished. Tomorrow brings a new set of problems.';
  document.getElementById('sheetResultContent').innerHTML=`
    <div class="result-card" style="border-color:var(--color-success);box-shadow:0 0 32px rgba(47,230,167,.18);">
      <div class="result-emoji">${emoji}</div>
      <div class="result-title" style="color:var(--color-success);">${title}</div>
      <div style="font-family:var(--font-display);font-size:1.8rem;color:var(--amber-400);margin-top:6px;">${c}/${n}</div>
      <div class="result-message">${message}</div>
      <div class="btn-row" style="margin-top:18px;">
        <button class="btn btn--primary" onclick="startSheet('${mmSheetKind}')">Do it again</button>
        <button class="btn btn--ghost" onclick="showGym()">Gym</button>
      </div>
    </div>`;
  showScreen('sheetResultScreen');
}

// ── Today's sheet renderer ──
function renderSheetProblem(){
  const p=mmSheetItems[mmSheetIdx];
  const pct=Math.round(mmSheetIdx/Math.max(1,mmSheetItems.length)*100);
  const itemsHtml=(p.items||[]).map(it=>`<div style="display:flex;align-items:center;gap:10px;background:var(--surface-2);border:2px solid var(--border-strong);border-radius:var(--radius-md);padding:8px 14px;"><span style="font-size:1.4rem;">${it.emoji}</span><span style="flex:1;font-weight:700;font-size:.95rem;">${it.name}</span><span style="font-family:var(--font-display);color:var(--amber-400);font-size:1.1rem;">$${it.price}</span></div>`).join('');
  const noteLine=p.note?`<div style="color:var(--text-secondary);font-size:.95rem;margin-top:8px;font-weight:700;">You hand over $${p.note}.</div>`:'';
  const body=p.kind==='word'
    ?`<div style="font-size:1.1rem;line-height:1.55;color:var(--text-primary);font-weight:700;">${p.text}</div><div style="display:flex;flex-direction:column;gap:6px;margin-top:12px;">${itemsHtml}</div>${noteLine}`
    :`<div class="question-text" style="font-size:2.2rem;">${p.display}</div>`;
  const feedbackHtml=mmFeedback?`<div class="feedback show ${mmFeedback.ok?'ok':'bad'}">${mmFeedback.msg}</div>`:'';
  const belowHtml=mmSheetSolved
    ?`<button class="btn btn--primary" style="width:100%;margin-top:14px;" onclick="nextSheetItem()">Next ▶</button>`
    :`<div class="keypad-display">${mmEntry===''?'·':mmEntry}</div>${mmKeypadHtml('daily','submitDaily()')}`;
  document.getElementById('dailyContent').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;color:var(--text-secondary);font-size:.75rem;font-weight:800;margin-bottom:8px;">
      <span>📋 Today's sheet</span><span>${p.group||''}</span><span>${mmSheetIdx+1} / ${mmSheetItems.length}</span>
    </div>
    <div class="progress-bar progress-bar--thin" style="margin-bottom:12px;"><div class="progress-bar__fill" style="width:${pct}%;background:var(--color-success);"></div></div>
    <div class="content-card content-card--quiz" style="border-top-color:var(--color-success);">
      ${body}
      ${feedbackHtml}
      ${belowHtml}
    </div>
    <button class="btn btn--ghost" style="width:100%;margin-top:12px;" onclick="showGym()">Pause sheet</button>`;
}
function submitDaily(){
  if(mmEntry===''||mmSheetSolved)return;
  const p=mmSheetItems[mmSheetIdx];
  const ok=parseInt(mmEntry,10)===p.answer;
  mmSheetSolved=true;
  if(ok){mmSheetCorrect++;launchConfetti(15);}
  mmFeedback=ok?{ok:true,msg:'That is it!'}:{ok:false,msg:`It comes to ${p.answer}. ${dailyHint(p)}`};
  renderSheetProblem();
}

// ── Carry & borrow renderer — a real column-sum drawing, updated live as
// each guided step is answered via the `reveal` keys columnPlan() sends back.
let mmPlan=null,mmPlanStep=0,mmDraw={above:'',aboveOnes:'',strike:false,resTens:'',resOnes:''};
function loadColumnStep(){
  const p=mmSheetItems[mmSheetIdx];
  mmPlan=columnPlan(p);
  mmPlanStep=0;mmEntry='';mmFeedback=null;mmSheetSolved=false;
  mmDraw={above:'',aboveOnes:'',strike:false,resTens:'',resOnes:''};
  renderColumnStep();
}
function applyColumnReveal(reveal){
  if(reveal.carry!==undefined)mmDraw.above=String(reveal.carry);
  if(reveal.tensNew!==undefined){mmDraw.above=String(reveal.tensNew);mmDraw.strike=true;}
  if(reveal.onesNew!==undefined)mmDraw.aboveOnes=String(reveal.onesNew);
  if(reveal.resOnes!==undefined)mmDraw.resOnes=String(reveal.resOnes);
  if(reveal.resTens!==undefined)mmDraw.resTens=String(reveal.resTens);
}
function renderColumnStep(){
  const p=mmSheetItems[mmSheetIdx];
  const pct=Math.round(mmSheetIdx/Math.max(1,mmSheetItems.length)*100);
  const step=mmPlan.steps[mmPlanStep]||null;
  const a10=Math.floor(p.a/10),a1=p.a%10,b10=Math.floor(p.b/10),b1=p.b%10;
  const aboveColor=p.op==='+'?'var(--amber-400)':'var(--color-success)';
  const drawHtml=`
    <div class="column-math">
      <div class="column-math__above"></div>
      <div class="column-math__above" style="color:${aboveColor};">${mmDraw.above}</div>
      <div class="column-math__above" style="color:${aboveColor};">${mmDraw.aboveOnes}</div>
      <div class="column-math__digit"></div>
      <div class="column-math__digit${mmDraw.strike?' strike':''}">${a10}</div>
      <div class="column-math__digit${mmDraw.strike?' strike':''}">${a1}</div>
      <div class="column-math__digit column-math__op">${p.op==='+'?'+':'−'}</div>
      <div class="column-math__digit">${b10}</div>
      <div class="column-math__digit">${b1}</div>
      <div class="column-math__rule"></div>
      <div class="column-math__digit"></div>
      <div class="column-math__digit column-math__result">${mmDraw.resTens}</div>
      <div class="column-math__digit column-math__result">${mmDraw.resOnes}</div>
    </div>`;
  const wordHtml=p.kind==='word'?`<div style="font-size:1.05rem;line-height:1.55;color:var(--text-primary);font-weight:700;margin-bottom:10px;">${p.text}</div>`:'';
  const solvedHtml=mmSheetSolved
    ?`<div style="text-align:center;margin-top:10px;font-family:var(--font-display);font-size:1.1rem;color:var(--cyan-300);">So ${p.a} ${p.op==='+'?'+':'−'} ${p.b} = ${p.answer}.</div>
       <div style="text-align:center;margin-top:6px;color:var(--text-secondary);font-size:.95rem;font-weight:700;line-height:1.5;">${mmPlan.note}</div>
       <button class="btn btn--reward" style="width:100%;margin-top:14px;" onclick="nextSheetItem()">Next ▶</button>`
    :'';
  const stepHtml=(!mmSheetSolved&&step)?`<div style="margin-top:16px;background:var(--surface-2);border:2px solid var(--coral-500);border-radius:var(--radius-md);padding:14px;font-size:1.05rem;font-weight:700;text-align:center;line-height:1.5;">${step.text}</div>`:'';
  const feedbackHtml=mmFeedback?`<div class="feedback show ${mmFeedback.ok?'ok':'bad'}" style="margin-top:12px;">${mmFeedback.msg}</div>`:'';
  const controlsHtml=(!mmSheetSolved&&step)
    ?(step.kind==='yesno'
        ?`<div class="btn-row" style="margin-top:14px;"><button class="btn btn--primary" onclick="answerColumnYesNo('yes')">Yes</button><button class="btn btn--accent" onclick="answerColumnYesNo('no')">No</button></div>`
        :`<div style="margin-top:14px;"><div class="keypad-display">${mmEntry===''?'·':mmEntry}</div>${mmKeypadHtml('column','submitColumn()')}</div>`)
    :'';
  document.getElementById('columnContent').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;color:var(--text-secondary);font-size:.75rem;font-weight:800;margin-bottom:8px;">
      <span>🧮 Carry &amp; borrow</span><span>${p.group||''}</span><span>${mmSheetIdx+1} / ${mmSheetItems.length}</span>
    </div>
    <div class="progress-bar progress-bar--thin" style="margin-bottom:12px;"><div class="progress-bar__fill" style="width:${pct}%;background:var(--color-reward);"></div></div>
    <div class="content-card content-card--quiz" style="border-top-color:var(--color-reward);">
      ${wordHtml}
      ${drawHtml}
      ${stepHtml}
      ${feedbackHtml}
      ${controlsHtml}
      ${solvedHtml}
    </div>
    <button class="btn btn--ghost" style="width:100%;margin-top:12px;" onclick="showGym()">Pause sheet</button>`;
}
function advanceColumnStep(step){
  applyColumnReveal(step.reveal||{});
  const next=mmPlanStep+1;
  if(next>=mmPlan.steps.length){
    mmSheetCorrect++;
    mmPlanStep=next;mmSheetSolved=true;mmEntry='';
    mmFeedback={ok:true,msg:'Solved it, step by step.'};
    launchConfetti(25);
  }else{
    mmPlanStep=next;mmEntry='';mmFeedback=null;
  }
  renderColumnStep();
}
function submitColumn(){
  if(mmEntry===''||mmSheetSolved)return;
  const step=mmPlan.steps[mmPlanStep];
  if(parseInt(mmEntry,10)!==step.answer){
    mmEntry='';
    mmFeedback={ok:false,msg:`Not that one — it is ${step.answer}.`};
    renderColumnStep();
    return;
  }
  advanceColumnStep(step);
}
function answerColumnYesNo(v){
  if(mmSheetSolved)return;
  const step=mmPlan.steps[mmPlanStep];
  if(v!==step.answer){
    mmFeedback={ok:false,msg:step.answer==='no'?'Look again — the top ones digit is smaller, so we need to borrow.':'The top ones digit is big enough here.'};
    renderColumnStep();
    return;
  }
  advanceColumnStep(step);
}

// ============================================================
//  INIT
// ============================================================
renderWeakFactsPanel();
checkBadges();
renderTrophyShelf();
checkDailyBonus();
renderHome();
updateTopBar('homeScreen');
setActiveQuickNavTab('homeScreen');
updateTopBarStars();
if(window.speechSynthesis){
  window.speechSynthesis.getVoices();
  if(window.speechSynthesis.onvoiceschanged!==undefined)window.speechSynthesis.onvoiceschanged=()=>window.speechSynthesis.getVoices();
}
