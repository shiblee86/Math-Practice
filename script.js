// Safia's & Safaan's Math Dojo — interaction/render/animation layer.
// Content and question-generation logic live in mathdata.js (loaded before this file).
// iOS Safari only fires CSS :active on elements with a touch listener somewhere in the
// ancestor chain — this one-time no-op listener makes the "pressed game button" effect
// (see style.css .btn/.icon-btn/.mc-choice/.coin-btn/.level-tile :active rules) work on tap.
document.body.addEventListener('touchstart', ()=>{}, {passive:true});

// ============================================================
//  RACER PROFILES — two kids share this app. Every mathdojo-*/tm-mm-*
//  localStorage key is namespaced per racer via nk(); RACERS/DEFAULT_RACER
//  come from mathdata.js. loadRacerState() (defined further down, once all
//  the state variables it populates have been declared) does the actual
//  per-racer (re)load and is called once at boot and again on every swap.
// ============================================================
let activeRacer=DEFAULT_RACER;
try{const s=localStorage.getItem('mathdojo-active-racer'); if(s&&RACERS[s])activeRacer=s;}catch(e){}
function nkFor(base,racerId){ return base+'-'+racerId; }
function nk(base){ return nkFor(base,activeRacer); }

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
// Populated per-racer by loadRacerState() below.
let trophyData={};
let totalStarsEarned=0;

function checkTrophies(prevStars,newStars,prog){
  TROPHIES.forEach(t=>{
    if(!trophyData[t.id]&&t.check(newStars,prog)){
      trophyData[t.id]=true;
      localStorage.setItem(nk('mathdojo-trophies'),JSON.stringify(trophyData));
      showMilestone(t.icon,'Trophy Unlocked!',t.name+' 🎉');
    }
  });
}
// Trophies screen: 16 trophies + the 10 badges below them, same tile
// treatment, no idle glow animation (see style.css).
function renderTrophyShelf(){
  const r=RACERS[activeRacer];
  const grid=document.getElementById('trophiesGrid');
  if(grid){
    grid.innerHTML='';
    TROPHIES.forEach(t=>{
      const earned=!!trophyData[t.id];
      const div=document.createElement('div');
      div.className='trophy-tile'+(earned?' trophy-tile--earned':'');
      div.innerHTML=`<div class="trophy-tile__icon">${earned?t.icon:'🔒'}</div><div class="trophy-tile__name">${t.name}</div>`;
      grid.appendChild(div);
    });
  }
  const badgeGrid=document.getElementById('badgesGrid');
  if(badgeGrid){
    badgeGrid.innerHTML='';
    BADGES_DEF.forEach(b=>{
      const earned=!!badges[b.key];
      const div=document.createElement('div');
      div.className='trophy-tile'+(earned?' trophy-tile--earned':'');
      div.innerHTML=`<div class="trophy-tile__icon">${earned?b.icon:'🔒'}</div><div class="trophy-tile__name">${b.name}</div>`;
      badgeGrid.appendChild(div);
    });
  }
  const title=document.getElementById('trophiesHeadingTitle'); if(title)title.textContent=`🏆 ${r.name}'s trophy case`;
  const earnedCount=TROPHIES.filter(t=>trophyData[t.id]).length;
  const sub=document.getElementById('trophiesHeadingSub'); if(sub)sub.textContent=`${earnedCount} of 16 earned · one shelf per racer`;
}
function showTrophies(){ renderTrophyShelf(); showScreen('trophiesScreen'); }
window.showTrophies=showTrophies;

// Grown-up summary: the only screen showing both racers at once.
function renderGrownup(){
  const lanesHtml=Object.keys(RACERS).map(id=>{
    const r=RACERS[id];
    const bundle=id===activeRacer?buildRacerBundle():readRacerBundleFromStorage(id);
    const lane=laneLevels(id);
    const masteredCount=lane.filter(l=>bundle.progress[l.id]?.completed).length;
    const trophyCount=TROPHIES.filter(t=>bundle.trophyData[t.id]).length;
    const missEntries=weakFacts(bundle.mmMisses,3);
    const missChips=missEntries.length
      ? missEntries.map(m=>`<span class="miss-chip">${SET_LABEL[m.set]||m.set} · ${m.count} miss${m.count===1?'':'es'}</span>`).join('')
      : `<span class="miss-chip miss-chip--none">No misses yet</span>`;
    const pct=lane.length?Math.round(masteredCount/lane.length*100):0;
    return `<div class="grownup-card">
      <div class="grownup-card__header">
        <div class="racer-avatar" style="width:38px;height:38px;background:${r.color};font-size:14px;">${r.initial}</div>
        <div class="grownup-card__name">${r.name}</div>
        <div class="grownup-card__stars">★ ${bundle.totalStarsEarned}</div>
      </div>
      <div class="grownup-card__summary">${masteredCount} of ${lane.length} levels mastered, age ${r.age}.</div>
      <div class="progress-bar progress-bar--thin" style="margin-top:10px;"><div class="progress-bar__fill" style="width:${pct}%;background:var(--color-reward);"></div></div>
      <div class="grownup-card__meta">${masteredCount} of ${lane.length} levels · ${trophyCount} of 16 trophies</div>
      <div class="grownup-card__misses">${missChips}</div>
    </div>`;
  }).join('');
  const el=document.getElementById('grownupLanes'); if(el)el.innerHTML=lanesHtml;
}
function showGrownup(){ renderGrownup(); showScreen('grownupScreen'); }
window.showGrownup=showGrownup;

// ============================================================
//  DAILY BONUS
// ============================================================
function checkDailyBonus(){
  const today=new Date().toDateString();
  if(localStorage.getItem(nk('mathdojo-lastbonus'))===today){document.getElementById('dailyBonusWrap').innerHTML='';return;}
  document.getElementById('dailyBonusWrap').innerHTML=`
    <div class="daily-card">
      <div class="daily-title">🎁 Daily Dojo Bonus! Play today for +3 ⭐ bonus stars!</div>
      <button class="daily-claim" onclick="claimDaily()">🏁 Claim My Bonus!</button>
    </div>`;
}
window.claimDaily=function(){
  localStorage.setItem(nk('mathdojo-lastbonus'),new Date().toDateString());
  totalStarsEarned+=3;
  updateTopBarStars();
  persistAll();
  document.getElementById('dailyBonusWrap').innerHTML='<div style="text-align:center;font-family:var(--font-display);font-size:1.3rem;color:var(--amber-400);padding:10px;">🎁 +3 Stars!</div>';
  launchConfetti(60);showPop('🏆 +3 Stars!','#FFB020');
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
// Badges no longer render as a fixed row of 10 hardcoded circles toggled by
// id convention — they're generated tiles on the Trophies screen
// (renderTrophyShelf() above). This just keeps the `badges` data current.
function checkBadges(){
  BADGES_DEF.forEach(b=>{badges[b.key]=!!b.check(progress);});
  localStorage.setItem(nk('mathdojo-badges'),JSON.stringify(badges));
}

// ============================================================
//  PROGRESS STATE — LEVELS comes from mathdata.js
// ============================================================
let progress={};

let currentLevel=null,questions=[],qIndex=0,score=0,wrong=0,answered=false;

// ============================================================
//  PERSISTENCE — writes every localStorage key (for the active racer) in
//  one call
// ============================================================
function persistAll(){
  localStorage.setItem(nk('mathdojo-progress'),JSON.stringify(progress));
  localStorage.setItem(nk('mathdojo-soar'),JSON.stringify(soarProgress));
  localStorage.setItem(nk('mathdojo-trophies'),JSON.stringify(trophyData));
  localStorage.setItem(nk('mathdojo-badges'),JSON.stringify(badges));
  localStorage.setItem(nk('mathdojo-stars'),String(totalStarsEarned));
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
// ── racer-scoped level lane helpers ──
function laneLevels(racerId){ const r=RACERS[racerId||activeRacer]; return LEVELS.slice(r.from,r.to); }
function laneMasteredCount(racerId){ return laneLevels(racerId).filter(l=>progress[l.id]?.completed).length; }
function nextLaneLevel(){
  const lane=laneLevels();
  return lane.find(l=>!progress[l.id]?.completed) || lane[lane.length-1];
}

// ── Home: "what do I do right now" — next-up card, today card, 3 tiles ──
function renderHome(){
  const r=RACERS[activeRacer];
  const lane=laneLevels();
  const mastered=laneMasteredCount();
  const next=nextLaneLevel();
  const nextIdxInLane=lane.indexOf(next);

  const iconEl=document.getElementById('nextUpIcon'); if(iconEl)iconEl.textContent=next.icon;
  const eyebrow=document.getElementById('nextUpEyebrow'); if(eyebrow)eyebrow.textContent=`NEXT UP · LEVEL ${nextIdxInLane+1} OF ${lane.length}`;
  const nameEl=document.getElementById('nextUpName'); if(nameEl)nameEl.textContent=next.name;
  const startBtn=document.getElementById('nextUpStart'); if(startBtn)startBtn.onclick=()=>startLevel(next);

  const soarList=SOAR_ACTIVITIES.filter(a=>a.age===r.band);
  const soarSample=soarList[3]||soarList[0];
  const todayItems=[
    {icon:'🃏',label:'Flash cards — 5 cards',stat:mastery(mmCards)>=50?'done':'go',go:"showGym()"},
    {icon:'📋',label:'Daily assignment',stat:`${gymDaily.done}/16`,go:"showGym()"},
    {icon:'🦅',label:`SOAR quest — ${soarSample?soarSample.title:'Explore'}`,stat:'›',go:"showSoarMenu()"},
  ];
  const todayDoneCount=todayItems.filter(t=>t.stat==='done').length;
  const rowsHtml=todayItems.map(t=>`
    <div class="today-row${t.stat==='done'?' today-row--done':''}" onclick="${t.go}">
      <span class="today-row__icon">${t.icon}</span>
      <span class="today-row__label">${t.label}</span>
      <span class="today-row__stat">${t.stat}</span>
    </div>`).join('');
  const rowsEl=document.getElementById('todayRows'); if(rowsEl)rowsEl.innerHTML=rowsHtml;
  const noteEl=document.getElementById('todayNote'); if(noteEl)noteEl.textContent=`${todayDoneCount} of 3 done · +3★ daily bonus`;

  const tiles=[
    {icon:'🏎️',name:'Levels',line:`${mastered} of ${lane.length} mastered`,go:'showPracticeMenu()',cls:'dest-tile--primary'},
    {icon:'🦅',name:'SOAR',line:`${soarList.length} for ages ${r.band}`,go:'showSoarMenu()',cls:'dest-tile--accent'},
    {icon:'🧠',name:'Gym',line:`${gymDaily.done}/16 problems today`,go:'showGym()',cls:'dest-tile--reward'},
  ];
  const tilesHtml=tiles.map(t=>`
    <div class="dest-tile ${t.cls}" onclick="${t.go}">
      <div class="dest-tile__icon">${t.icon}</div>
      <div class="dest-tile__name">${t.name}</div>
      <div class="dest-tile__line">${t.line}</div>
    </div>`).join('');
  const tilesEl=document.getElementById('destTiles'); if(tilesEl)tilesEl.innerHTML=tilesHtml;

  checkBadges();
  updateTopBarStars();
}
function startNextLevel(){ startLevel(nextLaneLevel()); }

// ── Levels screen: this racer's lane only, every tile unlocked ──
function renderPracticeMenu(){
  const r=RACERS[activeRacer];
  const lane=laneLevels();
  const mastered=laneMasteredCount();
  const grid=document.getElementById('levelsGrid');
  if(grid){
    grid.innerHTML='';
    lane.forEach(level=>{
      const p=progress[level.id];
      const stars=p.completed?(p.score>=90?'⭐⭐⭐':p.score>=70?'⭐⭐':'⭐'):'';
      const btn=document.createElement('div');
      btn.className='level-tile';
      btn.innerHTML=`<div class="level-icon">${level.icon}</div><div class="level-name">${level.name}</div><div class="level-stars">${stars||'&nbsp;'}</div>`;
      btn.onclick=()=>startLevel(level);
      grid.appendChild(btn);
    });
  }
  const title=document.getElementById('levelsHeadingTitle'); if(title)title.textContent=`🏎️ ${r.name}'s levels`;
  const sub=document.getElementById('levelsHeadingSub'); if(sub)sub.textContent=`${mastered} of ${lane.length} mastered — tuned to age ${r.age}`;
  const otherId=activeRacer==='safia'?'safaan':'safia', other=RACERS[otherId];
  const foot=document.getElementById('laneFootnote');
  if(foot)foot.textContent=`${other.name}'s lane runs ${LEVELS[other.from].name} → ${LEVELS[other.to-1].name}. Nobody scrolls past levels they can't use.`;
  checkBadges();
  updateTopBarStars();
}
window.showPracticeMenu=function(){renderPracticeMenu();showScreen('practiceMenuScreen');};

function startLevel(level){
  currentLevel=level;questions=generateLevel(level.id);
  qIndex=0;score=0;wrong=0;answered=false;currentStreak=0;
  const vd=LEVEL_VIDEOS[level.id];
  const watchBtn=document.getElementById('watchButton');
  if(watchBtn){
    if(vd){watchBtn.href=vd.url;watchBtn.textContent='▶ Watch';watchBtn.style.display='inline-flex';}
    else watchBtn.style.display='none'; // clear any previous level's video link — it must not linger
  }
  showScreen('quizScreen');renderQuestion();
}

function updateQuizStatRow(){
  const row=document.getElementById('quizStatRow');
  if(!row)return;
  const answeredCount=score+wrong;
  if(!answeredCount){row.style.display='none';return;}
  const accuracy=Math.round(score/answeredCount*100);
  row.style.display='flex';
  row.innerHTML=`<span class="qs-pill qs-pill--ok">✅ ${score}</span><span class="qs-pill qs-pill--bad">🥊 ${wrong}</span><span class="qs-pill">${accuracy}%</span>`;
}

let hintStep=0;
function renderQuestion(){
  const q=questions[qIndex],total=questions.length;
  const meta=document.getElementById('quizHeadMeta'); if(meta)meta.textContent=`${currentLevel.icon} ${currentLevel.name} · Q${qIndex+1} of ${total}`;
  const headStars=document.getElementById('quizHeadStars'); if(headStars)headStars.textContent='★ '+totalStarsEarned;
  document.getElementById('quizProgressBar').style.width=(qIndex/total*100)+'%';
  document.getElementById('feedback').className='feedback';
  document.getElementById('checkButton').style.display='block';
  document.getElementById('nextButton').style.display='none';
  answered=false;
  hintStep=0;
  const hb=document.getElementById('hintButton');hb.style.display=q.hasHint?'block':'none';hb.disabled=false;
  updateQuizStatRow();

  const badge=TYPE_LABELS[q.type]||'Maths';
  const card=document.getElementById('questionCard');
  card.className='content-card content-card--quiz'+(q.category==='word'?' word-card':'');

  const typeDef=QUESTION_TYPES[kindOf(q)];
  const inputHtml=typeDef.inputHtml(q);

  // Inject card structure WITHOUT hint content embedded — hint HTML contains quotes/backticks that corrupt template literals
  card.innerHTML=`<div class="q-type-badge">${badge}</div><div class="question-text">${q.question.replace(/\n/g,'<br>')}</div>${inputHtml}<div class="hint-box" id="hintDisplay"></div>`;

  // Set hint safely via .innerHTML AFTER the element exists in the DOM
  renderHintContent(q);

  typeDef.bindEnter(q);
  // Chromebook keyboard play: the answer field always has focus, so a whole
  // level runs from the keyboard (see the quiz keydown listener below).
  if(kindOf(q)==='numeric')document.getElementById('answerInput')?.focus();
}

function showHint(){
  document.getElementById('hintDisplay').classList.add('show');
  document.getElementById('hintButton').disabled=true;
  document.getElementById('questionCard').classList.add('hint-open');
}

// ── Stepped worked-example hint panel — a column-method grid or a number
// strip, advanced one step at a time. Falls back to the plain prose/HTML
// hint (unchanged from before) when the question has no `work` descriptor —
// mirrors the design prototype's hintDrawn/hintPlain split exactly.
const HINT_COLORS={ink:'var(--text-primary)',amber:'var(--amber-400)',cyan:'var(--cyan-300)',muted:'var(--text-muted)',coral:'var(--coral-400)'};
function renderHintContent(q){
  const hintDisplay=document.getElementById('hintDisplay');
  if(!hintDisplay)return;
  const steps=workSteps(q.work);
  if(!steps){ if(q.hint)hintDisplay.innerHTML=q.hint; return; }
  const i=Math.max(0,Math.min(hintStep,steps.length-1));
  hintDisplay.innerHTML=renderHintStepHtml(steps,i);
}
function hintCellHtml(c,tall){
  const deco=c.strike?'text-decoration:line-through;text-decoration-color:var(--color-error);text-decoration-thickness:3px;':'';
  return `<div style="height:${tall?38:22}px;display:flex;align-items:${tall?'center':'flex-end'};justify-content:center;font-size:${tall?'2rem':'1.05rem'};color:${HINT_COLORS[c.color]||HINT_COLORS.ink};${deco}">${c.v}</div>`;
}
function hintPadRow(row,cols){
  const pad=cols-row.length;
  return pad>0 ? [row[0],...Array.from({length:pad},()=>({v:'',color:'ink',strike:false})),...row.slice(1)] : row;
}
function renderHintStepHtml(steps,i){
  const st=steps[i],hasPrev=i>0,hasNext=i<steps.length-1;
  let drawingHtml;
  if(st.mode==='strip'){
    drawingHtml=`<div style="display:flex;flex-wrap:wrap;gap:8px;background:var(--bg-app-deep);border:2px solid var(--border-strong);border-radius:var(--radius-md);padding:10px 14px;min-height:60px;align-items:center;">
      ${st.chips.map(ch=>`<div style="min-width:44px;text-align:center;"><div style="font-family:var(--font-display);font-size:1.4rem;color:${ch.hl?'var(--amber-400)':'var(--text-primary)'};line-height:1.1;">${ch.v}</div><div style="height:3px;background:${ch.hl?'var(--amber-500)':'var(--border-strong)'};margin:3px 5px;border-radius:2px;"></div><div style="font-size:.78rem;font-weight:900;color:${ch.hl?'var(--amber-400)':'var(--cyan-300)'};">${ch.count}</div></div>`).join('')}
    </div>`;
  }else{
    const cols=Math.max(st.carry.length,st.top.length,st.bot.length,st.res.length);
    drawingHtml=`<div style="display:grid;grid-template-columns:38px repeat(${cols-1},50px);justify-content:center;font-family:var(--font-display);background:var(--bg-app-deep);border:2px solid var(--border-strong);border-radius:var(--radius-md);padding:8px 14px 10px;">
      ${hintPadRow(st.carry,cols).map(c=>hintCellHtml(c,false)).join('')}
      ${hintPadRow(st.top,cols).map(c=>hintCellHtml(c,true)).join('')}
      ${hintPadRow(st.bot,cols).map(c=>hintCellHtml(c,true)).join('')}
      <div style="grid-column:1/-1;border-top:4px solid var(--text-primary);margin:3px 0 4px;"></div>
      ${hintPadRow(st.res,cols).map(c=>hintCellHtml(c,true)).join('')}
    </div>`;
  }
  return `<div style="display:flex;align-items:baseline;gap:10px;">
      <div style="font-family:var(--font-display);font-size:1.05rem;color:var(--amber-400);">Let's do it together</div>
      <div style="font-size:.75rem;font-weight:800;color:var(--text-muted);">Step ${i+1} of ${steps.length}</div>
    </div>
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-top:10px;">
      ${drawingHtml}
      ${st.side?`<div style="font-family:var(--font-display);font-size:1.3rem;color:var(--amber-400);background:var(--surface-1);border:2px dashed var(--amber-500);border-radius:var(--radius-md);padding:10px 16px;">${st.side}</div>`:''}
    </div>
    <div style="font-size:1rem;color:var(--text-primary);line-height:1.5;margin-top:10px;max-width:560px;">${st.say}</div>
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
      ${hasPrev?`<button class="btn btn--ghost" style="flex:0 0 auto;padding:10px 16px;" onclick="hintStepBack()">◀ Back</button>`:''}
      ${hasNext?`<button class="btn btn--reward" style="flex:0 0 auto;padding:10px 20px;" onclick="hintStepNext()">Next step ▶</button>`:''}
      ${hasPrev?`<button class="btn btn--ghost" style="flex:0 0 auto;padding:10px 16px;" onclick="hintStepRestart()">↻ Start again</button>`:''}
    </div>`;
}
function hintStepNext(){ const steps=workSteps(questions[qIndex].work); hintStep=Math.min(hintStep+1,steps.length-1); renderHintContent(questions[qIndex]); }
function hintStepBack(){ hintStep=Math.max(hintStep-1,0); renderHintContent(questions[qIndex]); }
function hintStepRestart(){ hintStep=0; renderHintContent(questions[qIndex]); }

function handleCorrect(){
  score++;currentStreak++;
  updateStreakBadge();
  playCorrectSound();
  launchConfetti(currentStreak>=3?55:25);
  const popWord=currentStreak>=4?'🏆 CHAMPION!':currentStreak>=3?'🔥 ON FIRE!':'✅ PERFECT!';
  showPop(popWord,currentStreak>=3?'#FFB020':'#17C7C7');
  document.getElementById('feedback').className='feedback show ok';
  document.getElementById('feedback').textContent=currentStreak>=3?`🔥 ${currentStreak} in a row!`:'✅ Correct! Great work!';
  updateQuizStatRow();
  totalStarsEarned++;
  updateTopBarStars();
  const headStars=document.getElementById('quizHeadStars'); if(headStars)headStars.textContent='★ '+totalStarsEarned;
  checkTrophies(totalStarsEarned-1,totalStarsEarned,progress);
  persistAll();
  document.getElementById('checkButton').style.display='none';
  document.getElementById('nextButton').style.display='block';
  document.getElementById('hintButton').disabled=true;
}
function handleWrong(msg){
  wrong++;currentStreak=0;updateStreakBadge();
  playWrongSound();
  document.getElementById('feedback').className='feedback show bad';
  document.getElementById('feedback').textContent=msg||'🥊 Keep fighting!';
  updateQuizStatRow();
  document.getElementById('checkButton').style.display='none';
  document.getElementById('nextButton').style.display='block';
  document.getElementById('hintButton').disabled=true;
}

function checkAnswer(){
  if(answered)return;
  const q=questions[qIndex];
  const result=QUESTION_TYPES[kindOf(q)].check(q);
  answered=true;
  // An empty answer counts as wrong now — no more alert() blocking keyboard play.
  if(result.status==='correct')handleCorrect();else handleWrong(result.message);
}

function nextQuestion(){qIndex++;if(qIndex>=questions.length)showResults();else renderQuestion();}

// Chromebook keyboard play: Enter checks when unchecked, advances when
// checked. One global listener (not per-input) so it works no matter which
// question kind is on screen.
window.addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;
  const current=document.querySelector('.screen.active');
  if(!current||current.id!=='quizScreen')return;
  e.preventDefault();
  if(answered)nextQuestion();else checkAnswer();
});

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
  starsEl.className='result-stars animate'; // one-shot star-drop celebration, not an ambient loop
  const starCount=pct>=90?3:pct>=70?2:1;
  starsEl.innerHTML='<span>⭐</span>'.repeat(starCount);
  document.getElementById('resultMessage').innerHTML=`You got ${score}/${total} correct (${pct}%)`;
  const practise=document.getElementById('resultPractise');
  if(practise)practise.innerHTML=wrong>0
    ?`<span class="result-practise__label">🎯 Next session, practise</span> ${currentLevel.name} — ${wrong} missed this run.`
    :`<span class="result-practise__label">🎯 Next session, practise</span> Nothing missed this run. Move on to the next level.`;
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
  gymScreen:'homeScreen',drillScreen:'gymScreen',dailyScreen:'gymScreen',columnScreen:'gymScreen',gymResultScreen:'gymScreen',sheetResultScreen:'gymScreen',tensScreen:'gymScreen',
  trophiesScreen:'homeScreen',grownupScreen:'homeScreen'};
const TAB_FOR_SCREEN={homeScreen:'home',practiceMenuScreen:'levels',soarMenuScreen:'soar',soarActivityScreen:'soar',quizScreen:'levels',resultScreen:'levels',
  gymScreen:'gym',drillScreen:'gym',dailyScreen:'gym',columnScreen:'gym',gymResultScreen:'gym',sheetResultScreen:'gym',tensScreen:'gym',
  trophiesScreen:'trophies'};
// grownupScreen deliberately has no TAB_FOR_SCREEN entry — it's a pinned rail
// link, not one of the 5 nav tabs, so no tab highlights while on it.

function updateTopBar(screenId){
  // The rail (>=900px) has no persistent back button — nav items switch
  // destinations directly, and nested screens (Quiz, SOAR activity,
  // Grown-up) draw their own inline back arrow. The narrow top strip
  // (<900px) keeps one, hidden on Home and on the Gym hub (which renders
  // its own back button, history-stack driven, inside #gymContent).
  const back=document.getElementById('topStripBack');
  if(back)back.classList.toggle('is-hidden',screenId==='homeScreen'||screenId==='gymScreen');
}
function setActiveQuickNavTab(screenId){
  const active=TAB_FOR_SCREEN[screenId];
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('nav-item--active',el.dataset.tab===active));
}
function handleBack(){
  const current=document.querySelector('.screen.active');
  if(!current)return;
  if(current.id==='gymScreen'){ gymBack(); return; }
  const target=BACK_TARGET[current.id];
  if(target)showScreen(target);
}
function updateTopBarStars(){
  const el=document.getElementById('topStripStars');
  if(el)el.textContent='★ '+totalStarsEarned;
  renderRacerChips();
  renderStatusColumn();
}
// Status column (wide only, shown beside Home/Levels/Trophies): stars +
// trophy progress, then the (existing) weak-facts "practice these" card,
// then a clickable teaser into the Trophies screen.
function renderStatusColumn(){
  const earned=TROPHIES.filter(t=>trophyData[t.id]).length;
  const pct=Math.round(earned/16*100);
  const next=TROPHIES[earned];
  const starsCard=document.getElementById('statusStarsCard');
  if(starsCard)starsCard.innerHTML=`<div class="status-card__stars">★ ${totalStarsEarned}</div>
    <div class="progress-bar progress-bar--thin" style="margin-top:8px;"><div class="progress-bar__fill" style="width:${pct}%;background:var(--color-reward);"></div></div>
    <div class="status-card__note">${next?`2 ★ to ${next.name} ${next.icon}`:'All 16 trophies earned!'}</div>`;
  const trophyCard=document.getElementById('statusTrophyCard');
  if(trophyCard){
    const recent=TROPHIES.slice(Math.max(0,earned-2),earned+1);
    const rowHtml=recent.map((t,i)=>{
      const isEarned=i<recent.length-1||earned>=TROPHIES.length;
      const show=i<Math.min(2,earned)?t.icon:'🔒';
      return `<div class="trophy-tile${i<Math.min(2,earned)?' trophy-tile--earned':''}" style="flex:1;"><div class="trophy-tile__icon">${show}</div></div>`;
    }).join('');
    trophyCard.innerHTML=`<div class="status-card__title">🏆 Trophies</div><div class="status-card__trophy-row">${rowHtml}</div><div class="status-card__footer">All 16 trophies ›</div>`;
  }
}
function renderRacerChips(){
  const r=RACERS[activeRacer];
  const chipHtml=(size)=>`<div class="racer-avatar" style="width:${size}px;height:${size}px;background:${r.color};font-size:${size*0.32}px;">${r.initial}</div>`;
  const rail=document.getElementById('railRacerChip');
  if(rail)rail.innerHTML=`${chipHtml(40)}<div class="rail__racer-name">${r.name}</div><div class="rail__racer-stat">★ ${totalStarsEarned} · swap ⇄</div>`;
  const strip=document.getElementById('topStripRacer');
  if(strip)strip.innerHTML=`${chipHtml(32)}<div class="topstrip__racer-name">${r.name} ⇄</div>`;
}

function goHome(){renderPracticeMenu();showScreen('practiceMenuScreen');}
const STATUS_COL_SCREENS=['homeScreen','practiceMenuScreen','trophiesScreen'];
function showScreen(id){
  const current=document.querySelector('.screen.active');
  if(current&&current.id==='drillScreen'&&id!=='drillScreen')stopDrillTimers();
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  updateTopBar(id);
  setActiveQuickNavTab(id);
  const statusCol=document.getElementById('statusCol');
  if(statusCol)statusCol.style.display=STATUS_COL_SCREENS.includes(id)?'':'none';
}

// ============================================================
//  SAVE / LOAD — covers progress, SOAR completion, trophies,
//  badges and total stars (a full backup, not just level progress).
// ============================================================
// v2: both racers' full bundles in one file (see readRacerBundleFromStorage/
// writeRacerBundleToStorage above). v1/legacy files stay flat and load into
// whichever racer is active at load time — see handleLoadFile below.
function buildSaveBundle(){
  const other=activeRacer==='safia'?'safaan':'safia';
  return {version:2,savedAt:new Date().toISOString(),activeRacer,
    racers:{[activeRacer]:buildRacerBundle(),[other]:readRacerBundleFromStorage(other)}};
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
        // Legacy save (bare progress object) — merge as level progress only,
        // into whichever racer is currently active.
        Object.assign(progress,data);
      }else if(data.version===2&&data.racers){
        // Full two-racer backup — write each racer straight to its own
        // namespaced keys, then reload live state if it touched the active one.
        Object.keys(RACERS).forEach(id=>{
          if(data.racers[id])writeRacerBundleToStorage(id,data.racers[id]);
        });
        if(data.racers[activeRacer])loadRacerState();
      }else{
        // v1 (single-profile) bundle — merge into the active racer, same as
        // ever; persistAll()/persistMM()/persistTens()/persistGym() below
        // write it under this racer's own namespaced keys.
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
        if(data.tensRecord)tensRecord=data.tensRecord;
        if(typeof data.gymSpeedRound==='boolean')gymSpeedRound=data.gymSpeedRound;
        if(data.gymDaily)gymDaily=data.gymDaily;
      }
      persistAll();persistMM();persistTens();persistGym();
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

// SOAR now shows only the active racer's own age band (3-5 or 7-11) — no
// sticky headers across all 5 buckets. Matches the redesign's SOAR data,
// which likewise only populates those two bands; activities filed under the
// other three buckets ('5-7'/'5-11'/'9-14') are unreachable by either racer.
window.showSoarMenu=function(){
  const r=RACERS[activeRacer];
  const grid=document.getElementById('soarLevelsGrid');grid.innerHTML='';
  SOAR_ACTIVITIES.forEach((act,idx)=>{
    if(act.age!==r.band)return;
    const btn=document.createElement('div');btn.className='soar-level-btn';
    const done=soarProgress[idx]?' ✅':'';
    btn.innerHTML=`<div class="soar-icon">${act.icon}</div><div class="soar-title">${act.title}${done}</div><div class="soar-desc">${act.desc}</div>`;
    btn.addEventListener('click',()=>showSoarActivity(idx));
    grid.appendChild(btn);
  });
  const sub=document.getElementById('soarHeadingSub'); if(sub)sub.textContent=`Showing ages ${r.band} for ${r.name}.`;
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
// State populated per-racer by loadRacerState() below.
let mmCards={};
let mmMisses={};
let mmBest=null;
let mmSets=[...DEFAULT_GYM_SETS];
let mmSession=0;
let mmSheet={key:null,daily:{done:0,correct:0},column:{done:0,correct:0}};
let tensRecord={key:null,done:0,correct:0,log:[]};
// ── Gym hub redesign state (own tm-mm-* keys, own persist function — see
// DESIGN.md) — the "speed round" toggle on the Daily assignment card, and the
// Daily assignment's own resumable-but-daily done/correct counter (distinct
// from the dormant old dailySheet()-based mmSheet.daily above).
let gymSpeedRound=true;
let gymDaily={key:null,done:0,correct:0};

function persistMM(){
  localStorage.setItem(nk('tm-mm-cards'),JSON.stringify(mmCards));
  localStorage.setItem(nk('tm-mm-misses'),JSON.stringify(mmMisses));
  localStorage.setItem(nk('tm-mm-best'),JSON.stringify(mmBest));
  localStorage.setItem(nk('tm-mm-sets'),JSON.stringify(mmSets));
  localStorage.setItem(nk('tm-mm-session'),String(mmSession));
  localStorage.setItem(nk('tm-mm-sheet'),JSON.stringify(mmSheet));
}
function persistTens(){
  localStorage.setItem(nk('tm-mm-tens'),JSON.stringify(tensRecord));
}
function persistGym(){
  localStorage.setItem(nk('tm-mm-speed'),gymSpeedRound?'1':'0');
  localStorage.setItem(nk('tm-mm-assign'),JSON.stringify(gymDaily));
}

// ============================================================
//  RACER LOAD / SWAP — (re)populates every piece of per-racer state above
//  from this racer's namespaced localStorage keys. Called once at boot
//  (see INIT, bottom of file) and again on every swapRacer().
// ============================================================
function loadRacerState(){
  trophyData={}; try{const t=localStorage.getItem(nk('mathdojo-trophies'));if(t)trophyData=JSON.parse(t);}catch(e){}
  totalStarsEarned=0; try{const ts=localStorage.getItem(nk('mathdojo-stars'));if(ts)totalStarsEarned=parseInt(ts)||0;}catch(e){}
  badges={}; BADGES_DEF.forEach(b=>{badges[b.key]=false;});
  try{const s=localStorage.getItem(nk('mathdojo-badges'));if(s)Object.assign(badges,JSON.parse(s));}catch(e){}
  progress={}; LEVELS.forEach(l=>{progress[l.id]={completed:false,score:0};});
  try{const s=localStorage.getItem(nk('mathdojo-progress'));if(s)progress=Object.assign(progress,JSON.parse(s));}catch(e){}
  soarProgress={}; try{const s=localStorage.getItem(nk('mathdojo-soar'));if(s)soarProgress=JSON.parse(s);}catch(e){}

  mmCards={};    try{const s=localStorage.getItem(nk('tm-mm-cards'));  if(s)mmCards=JSON.parse(s);}catch(e){}
  mmMisses={};   try{const s=localStorage.getItem(nk('tm-mm-misses')); if(s)mmMisses=JSON.parse(s);}catch(e){}
  mmBest=null;   try{const s=localStorage.getItem(nk('tm-mm-best'));   if(s)mmBest=JSON.parse(s);}catch(e){}
  mmSets=[...DEFAULT_GYM_SETS]; try{const s=localStorage.getItem(nk('tm-mm-sets')); if(s){const p=JSON.parse(s); if(Array.isArray(p))mmSets=p;}}catch(e){}
  mmSession=0;   try{const s=localStorage.getItem(nk('tm-mm-session'));if(s)mmSession=parseInt(s)||0;}catch(e){}
  mmSheet={key:null,daily:{done:0,correct:0},column:{done:0,correct:0}};
  try{const s=localStorage.getItem(nk('tm-mm-sheet')); if(s)mmSheet=JSON.parse(s);}catch(e){}
  if(mmSheet.key!==todayKey())mmSheet={key:todayKey(),daily:{done:0,correct:0},column:{done:0,correct:0}};
  tensRecord={key:null,done:0,correct:0,log:[]};
  try{const s=localStorage.getItem(nk('tm-mm-tens')); if(s)tensRecord=JSON.parse(s);}catch(e){}
  if(tensRecord.key!==todayKey())tensRecord={key:todayKey(),done:0,correct:0,log:[]};
  gymSpeedRound=true; try{const s=localStorage.getItem(nk('tm-mm-speed')); if(s!==null)gymSpeedRound=s==='1';}catch(e){}
  gymDaily={key:null,done:0,correct:0}; try{const s=localStorage.getItem(nk('tm-mm-assign')); if(s)gymDaily=JSON.parse(s);}catch(e){}
  if(gymDaily.key!==todayKey())gymDaily={key:todayKey(),done:0,correct:0};
}

function swapRacer(){
  activeRacer=activeRacer==='safia'?'safaan':'safia';
  try{localStorage.setItem('mathdojo-active-racer',activeRacer);}catch(e){}
  loadRacerState();

  // reset every transient (non-persisted) piece of play state so nothing
  // leaks between racers mid-session
  currentLevel=null;questions=[];qIndex=0;score=0;wrong=0;answered=false;currentStreak=0;
  mcSelectedIdx=null;selectedCoins=[];currentCoinValues=[];
  stopDrillTimers();
  gymNav='hub';gymHistory=[];gymPlay=null;gymTrick=null;gymFlash=null;
  mmQueue=[];mmIdx=0;mmScore=0;mmWrong=0;mmStreak=0;mmElapsed=0;mmEntry='';mmFeedback=null;mmReview=[];
  mmSheetKind='daily';mmSheetIdx=0;mmSheetItems=[];mmSheetCorrect=0;mmSheetSolved=false;
  mmPlan=null;mmPlanStep=0;mmDraw={above:'',aboveOnes:'',strike:false,resTens:'',resOnes:''};
  tensItems=[];tensView='play';tensIdx=0;tensStep=0;tensSolved=false;tensClean=true;tensFeedback=null;
  tensBlocks={bt:0,bo:0,rt:0,ro:0,gate:true};tensDraw={};

  renderHome();checkBadges();renderTrophyShelf();updateTopBarStars();renderWeakFactsPanel();checkDailyBonus();
  const current=document.querySelector('.screen.active');
  if(current&&(current.id==='quizScreen'||current.id==='resultScreen')){window.showHome();return;}
  // Refresh whatever racer-scoped screen is already open so it doesn't keep
  // showing the previous racer's lane/band/hub content.
  if(current&&current.id==='practiceMenuScreen')renderPracticeMenu();
  else if(current&&current.id==='soarMenuScreen')window.showSoarMenu();
  else if(current&&current.id==='trophiesScreen')renderTrophyShelf();
  else if(current&&current.id==='grownupScreen')renderGrownup();
  else if(current&&current.id==='gymScreen')showGym();
}
window.swapRacer=swapRacer;

// ============================================================
//  SAVE/LOAD v2 helpers — read/write ONE racer's full bundle directly
//  against its own namespaced keys, without disturbing the live in-memory
//  state of whichever racer is not currently active.
// ============================================================
function buildRacerBundle(){
  return {progress,soarProgress,trophyData,badges,totalStarsEarned,
    mmCards,mmMisses,mmBest,mmSets,mmSession,mmSheet,tensRecord,gymSpeedRound,gymDaily};
}
function readRacerBundleFromStorage(racerId){
  const g=(base,fallback)=>{ try{const s=localStorage.getItem(nkFor(base,racerId)); return s!=null?JSON.parse(s):fallback;}catch(e){return fallback;} };
  const progress={}; LEVELS.forEach(l=>{progress[l.id]={completed:false,score:0};});
  const loadedProgress=g('mathdojo-progress',null); if(loadedProgress)Object.assign(progress,loadedProgress);
  const badges={}; BADGES_DEF.forEach(b=>{badges[b.key]=false;});
  const loadedBadges=g('mathdojo-badges',null); if(loadedBadges)Object.assign(badges,loadedBadges);
  let totalStarsEarned=0; try{const ts=localStorage.getItem(nkFor('mathdojo-stars',racerId)); if(ts)totalStarsEarned=parseInt(ts)||0;}catch(e){}
  let mmSession=0; try{const s=localStorage.getItem(nkFor('tm-mm-session',racerId)); if(s)mmSession=parseInt(s)||0;}catch(e){}
  let gymSpeedRound=true; try{const s=localStorage.getItem(nkFor('tm-mm-speed',racerId)); if(s!==null)gymSpeedRound=s==='1';}catch(e){}
  return {
    progress, badges, totalStarsEarned, mmSession, gymSpeedRound,
    soarProgress:g('mathdojo-soar',{}),
    trophyData:g('mathdojo-trophies',{}),
    mmCards:g('tm-mm-cards',{}),
    mmMisses:g('tm-mm-misses',{}),
    mmBest:g('tm-mm-best',null),
    mmSets:g('tm-mm-sets',[...DEFAULT_GYM_SETS]),
    mmSheet:g('tm-mm-sheet',{key:null,daily:{done:0,correct:0},column:{done:0,correct:0}}),
    tensRecord:g('tm-mm-tens',{key:null,done:0,correct:0,log:[]}),
    gymDaily:g('tm-mm-assign',{key:null,done:0,correct:0}),
  };
}
function writeRacerBundleToStorage(racerId,data){
  const set=(base,val)=>{ try{localStorage.setItem(nkFor(base,racerId),typeof val==='string'?val:JSON.stringify(val));}catch(e){} };
  if(data.progress)set('mathdojo-progress',data.progress);
  if(data.soarProgress)set('mathdojo-soar',data.soarProgress);
  if(data.trophyData)set('mathdojo-trophies',data.trophyData);
  if(data.badges)set('mathdojo-badges',data.badges);
  if(typeof data.totalStarsEarned==='number')set('mathdojo-stars',String(data.totalStarsEarned));
  if(data.mmCards)set('tm-mm-cards',data.mmCards);
  if(data.mmMisses)set('tm-mm-misses',data.mmMisses);
  if(data.mmBest)set('tm-mm-best',data.mmBest);
  if(Array.isArray(data.mmSets))set('tm-mm-sets',data.mmSets);
  if(typeof data.mmSession==='number')set('tm-mm-session',String(data.mmSession));
  if(data.mmSheet)set('tm-mm-sheet',data.mmSheet);
  if(data.tensRecord)set('tm-mm-tens',data.tensRecord);
  if(typeof data.gymSpeedRound==='boolean')set('tm-mm-speed',data.gymSpeedRound?'1':'0');
  if(data.gymDaily)set('tm-mm-assign',data.gymDaily);
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
  else if(screen==='daily')renderSheetProblem();
  else if(screen==='column')renderColumnStep();
  else if(screen==='tens')renderTensScreen();
}

// ── Gym hub redesign — everything below (hub, daily/random detail, the
// pooled play flow, Learn a trick, Flash cards, and the grown-up summary)
// lives inside this one gymScreen/#gymContent mount, driven by gymNav +
// gymHistory (own history stack, own persistent back button rendered inside
// the content — see DESIGN.md). Tens & Ones, Carry & Borrow and Speed Drill
// keep their full dedicated screens further down this file — intact and
// tested — they are just no longer linked from this hub; their generators
// (tensSheet/columnSheet/randFact) now also feed this hub's pooled Daily
// assignment / Random mix / Flash cards instead.
let gymNav='hub', gymHistory=[];
let gymPlay=null, gymTrick=null, gymFlash=null;

function showGym(){
  stopDrillTimers();
  gymNav='hub';gymHistory=[];gymPlay=null;
  renderGymNav();
  showScreen('gymScreen');
}
function gymOpen(screen){ gymHistory.push(gymNav); gymNav=screen; renderGymNav(); }
function gymBack(){
  if(gymHistory.length){ gymNav=gymHistory.pop(); renderGymNav(); return; }
  showScreen('homeScreen');
}
function renderGymNav(){
  if(gymNav==='hub')renderGymHub();
  else if(gymNav==='daily'||gymNav==='random')renderGymDetail(gymNav);
  else if(gymNav==='play')renderGymPlay();
  else if(gymNav==='trick')renderGymTrick();
  else if(gymNav==='flash')renderGymFlash();
  else if(gymNav==='summary')renderGymSummary();
}
function gymDetailHeader(title){
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
    <button type="button" class="gym-back" onclick="gymBack()">‹</button>
    <div style="font-family:var(--font-display);font-size:1.3rem;color:var(--text-primary);">${title}</div>
  </div>`;
}
function gymIntroCard(icon,text,onclick,label){
  return `<div class="content-card content-card--quiz" style="text-align:center;">
    <div style="font-size:2.5rem;">${icon}</div>
    <div style="color:var(--text-secondary);font-size:1.05rem;margin-top:12px;line-height:1.5;">${text}</div>
    <button class="btn btn--primary" style="width:100%;margin-top:14px;" onclick="${onclick}">${label}</button>
  </div>`;
}
function gymProblemsPerSet(total,count){
  if(!count)return [];
  const base=Math.floor(total/count),extra=total%count;
  return Array.from({length:count},(_,i)=>base+(i<extra?1:0));
}
function gymToggleChip(id){
  mmSets=mmSets.includes(id)?mmSets.filter(x=>x!==id):[...mmSets,id];
  persistMM();renderGymNav();
}
function gymToggleSpeed(){ gymSpeedRound=!gymSpeedRound; persistGym(); renderGymNav(); }

function renderGymHub(){
  const n=mmSets.length;
  const chipsHtml=FACT_SETS.map(fs=>{
    const on=mmSets.includes(fs.id);
    return `<button type="button" class="chip${on?' chip--active':''}" onclick="gymToggleChip('${fs.id}')"><span>${fs.icon}</span>${fs.label}</button>`;
  }).join('');
  document.getElementById('gymContent').innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:22px;">
      <button type="button" class="gym-back" style="visibility:${gymHistory.length?'visible':'hidden'};" onclick="gymBack()">‹</button>
      <div style="flex:1;text-align:center;">
        <div style="font-size:30px;line-height:1;">🧠</div>
        <div style="font-family:var(--font-display);font-size:1.4rem;color:var(--text-primary);margin-top:6px;">Mental Math Gym</div>
        <div style="color:var(--text-secondary);font-size:.85rem;margin-top:2px;">Fast facts, in your head. No paper, no fingers.</div>
      </div>
      <div style="width:40px;flex-shrink:0;"></div>
    </div>
    <div class="gym-featured-row">
      <div class="gym-card gym-card--primary" onclick="gymOpen('daily')">
        <div class="gym-card__icon">📋</div>
        <div class="gym-card__name">Daily assignment</div>
        <div class="gym-card__line">Number and word problems from the sets you pick below.</div>
        <div class="gym-card__stat" style="color:var(--cyan-300);">${n} set${n===1?'':'s'} picked · ${gymDaily.done}/16 today</div>
        <div class="gym-speed-toggle" onclick="event.stopPropagation();gymToggleSpeed();">
          <span class="gym-speed-toggle__label">⚡ Speed round</span>
          <span class="gym-speed-switch${gymSpeedRound?' gym-speed-switch--on':''}"><span class="gym-speed-knob"></span></span>
        </div>
      </div>
      <div class="gym-card gym-card--reward" onclick="gymOpen('trick')">
        <div class="gym-card__icon">🌉</div>
        <div class="gym-card__name">Learn a trick</div>
        <div class="gym-card__line">A hard sum, broken into little steps.</div>
        <div class="gym-card__stat" style="color:var(--amber-400);">go</div>
      </div>
      <div class="gym-card gym-card--accent" onclick="gymOpen('flash')">
        <div class="gym-card__icon">🃏</div>
        <div class="gym-card__name">Flash cards</div>
        <div class="gym-card__line">Flip a card. Say the answer out loud.</div>
        <div class="gym-card__stat" style="color:var(--coral-300);">${mastery(mmCards)}% mastered</div>
      </div>
    </div>
    <div class="gym-random-row" onclick="gymOpen('random')">
      <div class="gym-random-row__icon">🎲</div>
      <div class="gym-random-row__body">
        <div class="gym-random-row__name">Random mix</div>
        <div class="gym-random-row__line">Mixes ${n} set${n===1?'':'s'} you picked</div>
      </div>
      <div class="gym-random-row__chevron">›</div>
    </div>
    <div class="content-card" style="margin-top:20px;">
      <div style="font-family:var(--font-display);color:var(--cyan-300);font-size:1.05rem;">Pick what to practise</div>
      <div style="color:var(--text-muted);font-size:.75rem;font-weight:700;margin-top:2px;">Tap to turn a set on or off — it changes what shows up in Daily assignment and Random.</div>
      <div class="chip-row" style="margin-top:12px;">${chipsHtml}</div>
    </div>
    <button class="btn btn--ghost" style="width:100%;margin-top:16px;" onclick="gymOpen('summary')">👪 Grown-up summary</button>`;
}

// ── Daily assignment / Random mix — chip-picked pooled problems, drawn from
// the real generators (tensSheet/columnSheet for their own two sets, randFact
// for the rest), not a fixed hand-built sheet like the old dailySheet(). ──
function gymDetailDescription(kind){
  const n=mmSets.length;
  if(kind==='daily')return `16 problems today — number and word problems, split evenly across the ${n} set${n===1?'':'s'} you picked below${gymSpeedRound?', with a speed round mixed in':''}.`;
  return `12 problems, a surprise mix pulled from the ${n} set${n===1?'':'s'} you picked below — numbers and word problems both.`;
}
function renderGymDetail(kind){
  const n=mmSets.length;
  const total=kind==='random'?12:16;
  const counts=gymProblemsPerSet(total,n);
  const rowsHtml=mmSets.map((id,i)=>{
    const set=FACT_SETS.find(s=>s.id===id);
    return `<div class="gym-set-row">
      <div class="gym-set-row__icon">${set.icon}</div>
      <div style="flex:1;"><div class="gym-set-row__name">${set.label}</div><div class="gym-set-row__count">${counts[i]} problems</div></div>
      <div class="gym-set-row__sample">${GYM_SET_SAMPLE[id]||''}</div>
    </div>`;
  }).join('');
  const startLabel=kind==='random'?'Start random mix ▶':'Start daily assignment ▶';
  document.getElementById('gymContent').innerHTML=gymDetailHeader(kind==='random'?'🎲 Random mix':'📋 Daily assignment')+`
    <div class="content-card content-card--quiz" style="text-align:center;">
      <div style="font-size:2.2rem;">${kind==='random'?'🎲':'📋'}</div>
      <div style="color:var(--text-secondary);font-size:1.05rem;margin-top:12px;line-height:1.5;">${gymDetailDescription(kind)}</div>
    </div>
    <div style="margin-top:16px;">
      <div style="color:var(--text-muted);font-size:.75rem;font-weight:700;margin-bottom:8px;">Problems will come from:</div>
      ${rowsHtml}
    </div>
    <button class="btn btn--primary" style="width:100%;margin-top:14px;${n===0?'opacity:.4;':''}" ${n===0?'disabled':''} onclick="gymStartPlay('${kind}')">${startLabel}</button>`;
}

function gymTensPool(){ return tensSheet(todayKey()); }
function gymCarryPool(){ return columnSheet(todayKey()); }
function gymFromPool(pool,setId){
  const p=mmPick(pool);
  if(p.kind==='word')return{kind:'word',text:p.text,items:p.items,note:p.note,answer:p.answer,setId};
  return{kind:'plain',display:p.display,answer:p.answer,setId};
}
function gymGenProblem(id){
  if(id==='tensOnes')return gymFromPool(gymTensPool(),id);
  if(id==='carry')return gymFromPool(gymCarryPool(),id);
  const f=randFact(id);
  return{kind:'plain',display:f.display,answer:f.answer,setId:id};
}
function gymBuildQueue(kind){
  const ids=mmSets.slice();
  const total=kind==='random'?12:16;
  const speed=kind==='daily'&&gymSpeedRound;
  const baseTotal=speed?total-4:total;
  const counts=gymProblemsPerSet(baseTotal,ids.length);
  let queue=[];
  ids.forEach((id,i)=>{ for(let k=0;k<counts[i];k++)queue.push(gymGenProblem(id)); });
  if(speed){ for(let k=0;k<4;k++)queue.push(Object.assign(gymGenProblem(mmPick(ids)),{speed:true})); }
  return queue.sort(()=>Math.random()-0.5);
}
function gymStartPlay(kind){
  if(!mmSets.length)return;
  gymHistory.push(gymNav);
  gymNav='play';
  gymPlay={kind,queue:gymBuildQueue(kind),idx:0,score:0,wrong:0,inputValue:'',feedback:null,done:false};
  renderGymNav();
}
function gymWordHtml(q){
  const itemsHtml=(q.items||[]).map(it=>`<div style="display:flex;align-items:center;gap:10px;background:var(--surface-2);border:2px solid var(--border-strong);border-radius:var(--radius-md);padding:8px 14px;margin-bottom:6px;"><span style="font-size:1.2rem;">${it.emoji}</span><span style="flex:1;font-weight:700;font-size:.9rem;">${it.name}</span><span style="font-family:var(--font-display);color:var(--amber-400);">$${it.price}</span></div>`).join('');
  const noteLine=q.note?`<div style="color:var(--text-secondary);font-size:.9rem;margin-top:6px;font-weight:700;">You hand over $${q.note}.</div>`:'';
  return `<div style="font-size:1.05rem;line-height:1.55;color:var(--text-primary);font-weight:700;text-align:left;">${q.text}</div><div style="margin-top:10px;">${itemsHtml}</div>${noteLine}`;
}
function renderGymPlay(){
  const p=gymPlay;
  if(!p)return;
  const title=p.kind==='random'?'🎲 Random mix':'📋 Daily assignment';
  if(p.done){
    document.getElementById('gymContent').innerHTML=gymDetailHeader(title)+`
      <div class="content-card content-card--quiz" style="text-align:center;">
        <div style="font-size:2.5rem;">🏁</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:var(--text-primary);margin-top:10px;">All done!</div>
        <div style="color:var(--text-secondary);margin-top:8px;">You got ${p.score} of ${p.queue.length} correct</div>
        <button class="btn btn--primary" style="width:100%;margin-top:14px;" onclick="gymFinishPlay()">Done</button>
      </div>`;
    return;
  }
  const q=p.queue[p.idx];
  const qHtml=q.kind==='word'?gymWordHtml(q):`<div class="question-text" style="font-size:2.2rem;">${q.display}</div>`;
  const feedbackHtml=p.feedback?`<div style="margin-top:14px;font-family:var(--font-display);font-size:1.1rem;color:${p.feedback.ok?'var(--mint-400)':'var(--coral-300)'};">${p.feedback.msg}</div>`:'';
  document.getElementById('gymContent').innerHTML=gymDetailHeader(title)+`
    <div style="color:var(--text-muted);font-size:.8rem;font-weight:700;margin-bottom:8px;">Question ${p.idx+1} of ${p.queue.length} · ${p.score} correct</div>
    <div class="content-card content-card--quiz">
      ${qHtml}
      <input type="number" value="${p.inputValue}" oninput="gymSetPlayInput(this.value)" ${p.feedback?'disabled':''} placeholder="Type your answer" style="display:block;margin:18px auto 0;width:160px;text-align:center;font-size:1.3rem;font-family:var(--font-display);padding:10px;border-radius:var(--radius-md);border:2px solid var(--border-strong);background:var(--surface-2);color:var(--text-primary);" />
      ${feedbackHtml}
    </div>
    ${p.feedback?`<button class="btn btn--primary" style="width:100%;margin-top:14px;" onclick="gymNextPlay()">Next ▶</button>`:`<button class="btn btn--primary" style="width:100%;margin-top:14px;" onclick="gymCheckPlay()">Check</button>`}`;
}
function gymSetPlayInput(v){ if(gymPlay)gymPlay.inputValue=v; }
function gymCheckPlay(){
  const p=gymPlay; if(!p||p.feedback)return;
  const q=p.queue[p.idx];
  const ok=parseInt(p.inputValue,10)===q.answer;
  p.feedback={ok,msg:ok?'✅ Correct!':`Answer: ${q.answer}`};
  p.score+=ok?1:0; p.wrong+=ok?0:1;
  if(ok)launchConfetti(10);
  renderGymPlay();
}
function gymNextPlay(){
  const p=gymPlay; if(!p)return;
  const next=p.idx+1;
  if(next>=p.queue.length){
    p.done=true;
    if(p.kind==='daily'){
      gymDaily.done=p.queue.length;gymDaily.correct=p.score;persistGym();
      totalStarsEarned+=3;updateTopBarStars();persistAll();
    }
    launchConfetti(p.kind==='daily'?60:30);
    renderGymPlay();
    return;
  }
  p.idx=next;p.inputValue='';p.feedback=null;
  renderGymPlay();
}
function gymFinishPlay(){ gymNav='hub';gymHistory=[];gymPlay=null;renderGymNav(); }

// ── Grown-up summary — reuses the Tens & Ones strategy tally (see
// tensReportHtml() further down, shared with the dormant tensScreen). ──
function renderGymSummary(){
  document.getElementById('gymContent').innerHTML=gymDetailHeader('👪 Grown-up summary')+tensReportHtml();
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
        <button class="btn btn--accent" onclick="showGym()">Coach me</button>
        <button class="btn btn--ghost" onclick="showGym()">Gym</button>
      </div>
    </div>`;
  showScreen('gymResultScreen');
}

// ── Flash cards — a deck of 5 drawn fresh from the picked sets each time (no
// spaced-repetition "due card" revival, unlike the dormant old flashDeck()-
// based flow — the redesign simplifies to a plain fresh draw); grading still
// updates the Leitner boxes (mmCards) so the hub's "N% mastered" stat and the
// weak-facts panel stay meaningful. ──
function gymStartFlash(){
  const ids=mmSets.length?mmSets:['add20','sub20','doubles','bridge','tensOnes'];
  const counts=gymProblemsPerSet(5,ids.length);
  let cards=[];
  ids.forEach((id,i)=>{ for(let k=0;k<counts[i];k++)cards.push(cappedFact(id)); });
  cards=cards.sort(()=>Math.random()-0.5).slice(0,5);
  if(!cards.length)cards=[cappedFact('add20')];
  gymFlash={cards,idx:0,flipped:false,done:false};
  renderGymNav();
}
function renderGymFlash(){
  const header=gymDetailHeader('🃏 Flash cards');
  if(!gymFlash){
    document.getElementById('gymContent').innerHTML=header+gymIntroCard('🃏','Flip a card, say the answer out loud, grade yourself.','gymStartFlash()','Start ▶');
    return;
  }
  if(gymFlash.done){
    document.getElementById('gymContent').innerHTML=header+gymIntroCard('🏁','Deck done! Shuffle in a new one whenever you like.','gymStartFlash()','New deck ▶');
    return;
  }
  const c=gymFlash.cards[gymFlash.idx];
  const strat=gymFlash.flipped?strategyFor(c):{name:'',line:''};
  const frontHtml=`<div class="flashcard__front">${c.display}</div><div class="flashcard__prompt">Tap to flip</div>`;
  const backHtml=`<div class="flashcard__answer">${c.answer}</div><div class="flashcard__strategy"><div class="flashcard__strategy-name">${strat.name}</div><div class="flashcard__strategy-line">${strat.line}</div></div>`;
  document.getElementById('gymContent').innerHTML=header+`
    <div style="color:var(--text-muted);font-size:.8rem;font-weight:700;margin-bottom:8px;">Card ${gymFlash.idx+1} of ${gymFlash.cards.length}</div>
    <div class="flashcard" onclick="gymFlipFlash()">${gymFlash.flipped?backHtml:frontHtml}</div>
    ${gymFlash.flipped?`<div class="btn-row" style="margin-top:14px;"><button class="btn btn--ghost" onclick="gymGradeFlash(false)">Tricky 🔁</button><button class="btn btn--primary" onclick="gymGradeFlash(true)">Got it ✅</button></div>`:''}`;
}
function gymFlipFlash(){ if(!gymFlash||gymFlash.flipped)return; gymFlash.flipped=true; renderGymFlash(); }
function gymGradeFlash(easy){
  const card=gymFlash.cards[gymFlash.idx];
  mmCards=gradeCard(mmCards,card.id,easy,mmSession);
  if(!easy)mmMisses[card.id]=(mmMisses[card.id]||0)+1;
  else if(mmMisses[card.id]){mmMisses[card.id]-=1;if(mmMisses[card.id]<=0)delete mmMisses[card.id];}
  persistMM();renderWeakFactsPanel();
  const next=gymFlash.idx+1;
  if(next>=gymFlash.cards.length){
    gymFlash.done=true;mmSession++;persistMM();
    launchConfetti(30);
  }else{
    gymFlash.idx=next;gymFlash.flipped=false;
  }
  renderGymFlash();
}

// ── Learn a trick — every step is shown stacked from the start (active
// highlighted, future dimmed), entered on a number keypad; a wrong answer
// clears the entry and stays on that step rather than advancing or revealing
// the answer. Step copy comes from mentalmath.js's rewritten trainerSteps(). ──
function gymStartTrick(){ gymTrick={f:trainerFact(),doneSteps:[],entry:'',wrongFlash:false,done:false}; renderGymNav(); }
function renderGymTrick(){
  const header=gymDetailHeader('🌉 Learn a trick');
  if(!gymTrick){
    document.getElementById('gymContent').innerHTML=header+gymIntroCard('🌉','A hard sum, broken into little steps, until it clicks.','gymStartTrick()','Start ▶');
    return;
  }
  if(gymTrick.done){
    document.getElementById('gymContent').innerHTML=header+gymIntroCard('✅',`Nailed it! ${gymTrick.f.display} = ${gymTrick.f.answer}.`,'gymStartTrick()','Try another ▶');
    return;
  }
  const steps=trainerSteps(gymTrick.f);
  const rowsHtml=steps.map((st,i)=>{
    const isDone=i<gymTrick.doneSteps.length;
    const isActive=i===gymTrick.doneSteps.length;
    let badge='·',color='var(--text-muted)';
    if(isDone){badge=gymTrick.doneSteps[i];color='var(--mint-400)';}
    else if(isActive){badge=gymTrick.entry||'·';color='var(--amber-400)';}
    const style=`display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 14px;border-radius:var(--radius-md);margin-bottom:8px;background:${isActive?'var(--surface-2)':'transparent'};border:2px solid ${isActive?'var(--amber-500)':'transparent'};opacity:${(!isActive&&!isDone)?.5:1};font-size:1.02rem;color:var(--text-primary);font-weight:${isActive?'700':'400'};`;
    return `<div style="${style}"><span>${st.text}</span><span style="font-family:var(--font-display);font-size:1.15rem;color:${color};min-width:40px;text-align:right;flex-shrink:0;">${badge}</span></div>`;
  }).join('');
  const wrongHtml=gymTrick.wrongFlash?`<div style="color:var(--coral-300);font-size:.9rem;font-weight:700;text-align:center;margin-top:8px;">Not quite — try again ✏️</div>`:'';
  const digits=['1','2','3','4','5','6','7','8','9'].map(d=>`<button type="button" class="btn btn--ghost" onclick="gymPressTrickKey('${d}')">${d}</button>`).join('');
  const keypadHtml=`<div class="keypad" style="margin-top:14px;">${digits}<button type="button" class="btn btn--ghost" onclick="gymPressTrickKey('del')">⌫</button><button type="button" class="btn btn--ghost" onclick="gymPressTrickKey('0')">0</button><button type="button" class="btn btn--primary" onclick="gymCommitTrickStep()">✓</button></div>`;
  document.getElementById('gymContent').innerHTML=header+`
    <div class="content-card content-card--quiz">
      <div style="font-family:var(--font-display);font-size:1.4rem;color:var(--text-primary);text-align:center;margin-bottom:14px;">${gymTrick.f.display}</div>
      ${rowsHtml}
    </div>
    ${wrongHtml}
    ${keypadHtml}`;
}
function gymPressTrickKey(k){
  if(!gymTrick||gymTrick.done)return;
  if(k==='del')gymTrick.entry=gymTrick.entry.slice(0,-1);
  else if(gymTrick.entry.length<3)gymTrick.entry+=k;
  gymTrick.wrongFlash=false;
  renderGymTrick();
}
function gymCommitTrickStep(){
  const t=gymTrick; if(!t||t.done)return;
  const steps=trainerSteps(t.f);
  const idx=t.doneSteps.length;
  const step=steps[idx]; if(!step)return;
  if(parseInt(t.entry,10)!==step.answer){ t.entry='';t.wrongFlash=true;renderGymTrick();return; }
  t.doneSteps=[...t.doneSteps,t.entry];
  t.entry='';t.wrongFlash=false;
  if(t.doneSteps.length>=steps.length){ t.done=true; launchConfetti(20); }
  renderGymTrick();
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
//  TENS & ONES — place-value add/subtract within 100.
//  tensSheet/tensSteps/tensNote/TENS_STRATEGY_LABEL/TENS_STRATEGY_NAME
//  come from mentalmath.js. Shares the keypad + mmEntry buffer with the
//  other step-driven Gym screens (trainer/daily/column) rather than a
//  separate entry variable, since only one such screen is ever active.
// ============================================================
let tensItems=[], tensView='play', tensIdx=0, tensStep=0, tensSolved=false, tensClean=true, tensFeedback=null;
let tensBlocks={bt:0,bo:0,rt:0,ro:0,gate:true};
let tensDraw={};

function startTens(){
  const today=todayKey();
  tensItems=tensSheet(today);
  if(tensRecord.key!==today)tensRecord={key:today,done:0,correct:0,log:[]};
  const start=tensRecord.done>=tensItems.length?0:tensRecord.done;
  if(start===0)tensRecord={key:today,done:0,correct:0,log:[]};
  persistTens();
  stopDrillTimers();
  tensView='play';
  loadTensProblem(start);
  showScreen('tensScreen');
}
function loadTensProblem(idx){
  const it=tensItems[idx];
  tensIdx=idx;tensStep=0;mmEntry='';tensFeedback=null;tensSolved=false;tensClean=true;tensDraw={};
  if(it.strategy==='blocks'){
    const a1=it.a%10,b1=it.b%10;
    if(it.op==='+'){
      const bt=Math.floor(it.a/10)+Math.floor(it.b/10),bo=a1+b1;
      tensBlocks={bt,bo,rt:0,ro:0,gate:bo<10};
    }else{
      tensBlocks={bt:Math.floor(it.a/10),bo:a1,rt:0,ro:0,gate:false};
    }
  }else{
    tensBlocks={bt:0,bo:0,rt:0,ro:0,gate:true};
  }
  renderTensScreen();
}
function currentTensSteps(){return tensSteps(tensItems[tensIdx]);}

function submitTensStep(val){
  const it=tensItems[tensIdx];
  const steps=currentTensSteps();
  const step=steps[tensStep];
  if(!step)return;
  const ok=step.kind==='yesno'?val===step.answer:parseInt(val,10)===step.answer;
  mmEntry='';
  if(!ok){
    tensClean=false;
    tensFeedback={ok:false,msg: step.kind==='yesno'
      ? (step.answer==='no'?'Look again — the top ones digit is smaller, so trade a ten.':'The top ones digit is big enough here.')
      : `Not that one — it is ${step.answer}.`};
    renderTensScreen();
    return;
  }
  tensDraw=Object.assign({},tensDraw,step.reveal||{});
  const next=tensStep+1;
  if(next>=steps.length){
    tensRecord.log.push({strategy:it.strategy,ok:tensClean});
    if(tensClean){tensRecord.correct++;launchConfetti(20);}
    tensStep=next;tensSolved=true;
    tensFeedback={ok:true,msg: tensClean?'Solved it, step by step.':'Got there. Try that one again tomorrow.'};
    persistTens();
  }else{
    tensStep=next;tensFeedback=null;
  }
  renderTensScreen();
}
function answerTensYesNo(v){submitTensStep(v);}
function submitTensKeypad(){if(mmEntry==='')return;submitTensStep(mmEntry);}

function nextTensProblem(){
  const next=tensIdx+1;
  tensRecord.done=next;
  persistTens();
  if(next>=tensItems.length){
    totalStarsEarned+=3;
    updateTopBarStars();
    persistAll();
    launchConfetti(80);
    tensView='result';
    renderTensScreen();
    return;
  }
  loadTensProblem(next);
}

function tradeTensBlocks(){
  const it=tensItems[tensIdx];
  if(it.op==='+'){
    tensBlocks.bo-=10;tensBlocks.bt+=1;tensBlocks.gate=tensBlocks.bo<10;
  }else{
    tensBlocks={bt:Math.floor(it.a/10),bo:it.a%10,rt:0,ro:0,gate:false};
  }
  renderTensScreen();
}
function takeTensRod(){
  const it=tensItems[tensIdx];
  if(tensBlocks.bt<=0)return;
  tensBlocks.rt+=1;tensBlocks.bt-=1;
  tensBlocks.gate=(tensBlocks.rt*10+tensBlocks.ro)===it.b;
  renderTensScreen();
}
function takeTensCube(){
  const it=tensItems[tensIdx];
  if(tensBlocks.bo<=0)return;
  tensBlocks.ro+=1;tensBlocks.bo-=1;
  tensBlocks.gate=(tensBlocks.rt*10+tensBlocks.ro)===it.b;
  renderTensScreen();
}

function tensBlocksHtml(it){
  const pipsHtml=Array.from({length:10},()=>`<span style="display:block;width:8px;height:4px;background:rgba(8,23,22,.45);border-radius:1px;"></span>`).join('');
  const canRemove=it.op==='-'&&!tensBlocks.gate;
  const rodsHtml=Array.from({length:tensBlocks.bt}).map(()=>
    `<button type="button" onclick="${canRemove?'takeTensRod()':''}" style="width:16px;height:76px;border-radius:4px;border:2px solid var(--cyan-300);background:var(--cyan-600);padding:0;cursor:${canRemove?'pointer':'default'};display:flex;flex-direction:column;gap:1px;align-items:center;justify-content:space-evenly;">${pipsHtml}</button>`
  ).join('');
  const cubesHtml=Array.from({length:tensBlocks.bo}).map(()=>
    `<button type="button" onclick="${canRemove?'takeTensCube()':''}" style="width:16px;height:16px;border-radius:3px;border:2px solid var(--amber-300);background:var(--amber-500);padding:0;cursor:${canRemove?'pointer':'default'};"></button>`
  ).join('');
  const removed=tensBlocks.rt*10+tensBlocks.ro;
  const canTrade=it.op==='+'?tensBlocks.bo>=10:(removed>0&&!tensBlocks.gate);
  const tradeLabel=it.op==='+'?'Trade 10 ones → 1 ten':'Put them all back';
  const blockTally=it.op==='+'
    ?(tensStep>=2?`${tensBlocks.bt} tens · ${tensBlocks.bo} ones`:'Count them yourself')
    :`Take away ${it.b} — removed ${removed}`;
  const blockHint=it.op==='+'
    ?(tensBlocks.bo>=10?'Too many loose cubes. Ten of them make a rod — trade them.':'Now count the rods and the cubes.')
    :(tensBlocks.gate?'Good. Count what is left.':`Tap blocks to take ${it.b} away. Tap a rod to remove a whole ten.`);
  return `<div style="background:var(--surface-2);border:2px solid var(--border-strong);border-radius:var(--radius-md);padding:12px;margin-bottom:12px;">
    <div style="display:flex;justify-content:space-between;color:var(--text-muted);font-size:.68rem;font-weight:800;margin-bottom:8px;"><span>TENS</span><span>ONES</span></div>
    <div style="display:flex;gap:14px;align-items:flex-start;">
      <div style="display:flex;flex-wrap:wrap;gap:5px;flex:0 0 auto;max-width:60%;">${rodsHtml}</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;align-content:flex-start;flex:1;">${cubesHtml}</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:12px;">
      <div style="font-family:var(--font-display);color:var(--cyan-300);font-size:1.05rem;">${blockTally}</div>
      ${canTrade?`<button type="button" class="btn btn--reward" style="flex:0 0 auto;padding:10px 14px;font-size:.85rem;" onclick="tradeTensBlocks()">${tradeLabel}</button>`:''}
    </div>
    <div style="color:var(--text-secondary);font-size:.85rem;font-weight:700;margin-top:8px;line-height:1.45;">${blockHint}</div>
  </div>`;
}
function tensColumnHtml(it){
  const a10=Math.floor(it.a/10),a1=it.a%10,b10=Math.floor(it.b/10),b1=it.b%10;
  const above=tensDraw.carry!==undefined?String(tensDraw.carry):(tensDraw.tensNew!==undefined?String(tensDraw.tensNew):'');
  const aboveOnes=tensDraw.onesNew!==undefined?String(tensDraw.onesNew):'';
  const strikeCls=tensDraw.tensNew!==undefined?'strike':'';
  const resTens=tensDraw.resTens!==undefined?String(tensDraw.resTens):'';
  const resOnes=tensDraw.resOnes!==undefined?String(tensDraw.resOnes):'';
  return `<div class="column-math">
    <div class="column-math__above"></div>
    <div class="column-math__above" style="color:var(--amber-400);">${above}</div>
    <div class="column-math__above" style="color:var(--amber-400);">${aboveOnes}</div>
    <div class="column-math__digit"></div>
    <div class="column-math__digit ${strikeCls}">${a10}</div>
    <div class="column-math__digit ${strikeCls}">${a1}</div>
    <div class="column-math__digit column-math__op">${it.op==='+'?'+':MINUS}</div>
    <div class="column-math__digit">${b10}</div>
    <div class="column-math__digit">${b1}</div>
    <div class="column-math__rule"></div>
    <div class="column-math__digit"></div>
    <div class="column-math__digit column-math__result">${resTens}</div>
    <div class="column-math__digit column-math__result">${resOnes}</div>
  </div>`;
}
function tensLineHtml(it){
  const b10=Math.floor(it.b/10)*10,b1=it.b%10;
  const mid=it.op==='+'?it.a+b10:it.a-b10;
  const lo=Math.min(it.a,it.answer),hi=Math.max(it.a,it.answer),span=Math.max(1,hi-lo);
  const pos=v=>6+((v-lo)/span)*88;
  const stops=[
    {label:String(it.a),left:pos(it.a).toFixed(1),color:'var(--cyan-300)'},
    {label:tensStep>=1?String(mid):'?',left:pos(mid).toFixed(1),color:'var(--amber-400)'},
    {label:tensStep>=2?String(it.answer):'?',left:pos(it.answer).toFixed(1),color:'var(--color-success)'},
  ];
  const sign=it.op==='+'?'+':MINUS;
  const hops=[
    {label:`${sign}${b10}`,left:(((pos(it.a))+(pos(mid)))/2).toFixed(1)},
    {label:`${sign}${b1}`,left:(((pos(mid))+(pos(it.answer)))/2).toFixed(1)},
  ];
  const stopsHtml=stops.map(s=>`<div style="position:absolute;top:0;transform:translateX(-50%);text-align:center;left:${s.left}%;"><div style="font-family:var(--font-display);font-size:1.1rem;color:${s.color};">${s.label}</div><div style="width:3px;height:16px;background:${s.color};margin:4px auto 0;"></div></div>`).join('');
  const hopsHtml=hops.map(h=>`<div style="position:absolute;top:48px;transform:translateX(-50%);color:var(--coral-400);font-family:var(--font-display);font-size:.95rem;white-space:nowrap;left:${h.left}%;">${h.label}</div>`).join('');
  return `<div style="background:var(--surface-2);border:2px solid var(--border-strong);border-radius:var(--radius-md);padding:18px 14px 12px;margin-bottom:12px;">
    <div style="position:relative;height:82px;">
      <div style="position:absolute;left:0;right:0;top:38px;height:3px;background:var(--border-strong);"></div>
      ${stopsHtml}${hopsHtml}
    </div>
  </div>`;
}
function tensStepsHtml(steps){
  return steps.map((s,i)=>{
    const done=i<tensStep;
    const current=i===tensStep&&!tensSolved;
    const text=i>tensStep?'Next step…':s.text;
    const slot=done?String(s.answer):(current?(mmEntry===''?'?':mmEntry):'·');
    const cls=done?'is-done':(current?'is-current':'');
    return `<div class="trainer-step ${cls}"><div class="trainer-step__text">${text}</div><div class="trainer-step__slot">${slot}</div></div>`;
  }).join('');
}

function renderTensScreen(){
  if(tensView==='result')renderTensResult();
  else if(tensView==='report')renderTensReport();
  else renderTensPlay();
}
function renderTensPlay(){
  const it=tensItems[tensIdx];
  const steps=currentTensSteps();
  const pct=Math.round(tensIdx/tensItems.length*100);
  const gated=!tensBlocks.gate;
  const step=steps[tensStep];
  const showYesNo=!tensSolved&&!gated&&step&&step.kind==='yesno';
  const showKeypad=!tensSolved&&!gated&&step&&step.kind!=='yesno';
  const visualHtml=it.strategy==='blocks'?tensBlocksHtml(it):it.strategy==='column'?tensColumnHtml(it):it.strategy==='line'?tensLineHtml(it):'';
  const feedbackHtml=tensFeedback?`<div class="feedback show ${tensFeedback.ok?'ok':'bad'}" style="margin-top:12px;">${tensFeedback.msg}</div>`:'';
  const yesNoHtml=showYesNo?`<div class="btn-row"><button class="btn btn--primary" onclick="answerTensYesNo('yes')">Yes</button><button class="btn btn--accent" onclick="answerTensYesNo('no')">No</button></div>`:'';
  const keypadHtml=showKeypad?`<div style="margin-top:14px;"><div class="keypad-display">${mmEntry===''?'·':mmEntry}</div>${mmKeypadHtml('tens','submitTensKeypad()')}</div>`:'';
  const solvedHtml=tensSolved?`<div><div style="text-align:center;margin-top:12px;font-family:var(--font-display);font-size:1.15rem;color:var(--cyan-300);">So ${it.a} ${it.op==='+'?'+':MINUS} ${it.b} = ${it.answer}.</div><div style="text-align:center;margin-top:6px;color:var(--text-secondary);font-size:.95rem;font-weight:700;line-height:1.5;">${tensNote(it)}</div><button class="btn btn--reward" style="width:100%;margin-top:14px;" onclick="nextTensProblem()">Next ▶</button></div>`:'';
  document.getElementById('tensContent').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;color:var(--text-secondary);font-size:.75rem;font-weight:800;margin-bottom:8px;">
      <span>🔟 Tens &amp; ones</span><span>${it.group}</span><span>${tensIdx+1} / ${tensItems.length}</span>
    </div>
    <div class="progress-bar progress-bar--thin" style="margin-bottom:12px;"><div class="progress-bar__fill" style="width:${pct}%;"></div></div>
    <div class="content-card content-card--quiz">
      <div class="q-type-badge">${TENS_STRATEGY_LABEL[it.strategy]}</div>
      <div class="question-text" style="font-size:2.2rem;margin-bottom:6px;">${it.display}</div>
      <div style="text-align:center;color:var(--text-muted);font-size:.8rem;font-weight:800;margin-bottom:12px;">${it.regroup?'This one needs a trade':'No trading needed'}</div>
      ${visualHtml}
      ${tensStepsHtml(steps)}
      ${feedbackHtml}
      ${yesNoHtml}
      ${keypadHtml}
      ${solvedHtml}
    </div>
    <button class="btn btn--ghost" style="width:100%;margin-top:12px;" onclick="showGym()">Pause sheet</button>`;
}
function renderTensResult(){
  const n=tensItems.length,c=tensRecord.correct;
  const message=c===n?'Every one first time. Tens and ones are clicking.':'Sheet finished. The summary shows which strategy needs another go.';
  document.getElementById('tensContent').innerHTML=`
    <div class="result-card" style="border-color:var(--cyan-500);box-shadow:0 0 32px rgba(23,199,199,.2);">
      <div class="result-emoji">🔟</div>
      <div class="result-title">Tens &amp; ones done</div>
      <div style="font-family:var(--font-display);font-size:1.8rem;color:var(--amber-400);margin-top:6px;">${c}/${n}</div>
      <div class="result-message">${message}</div>
      <div class="btn-row" style="margin-top:18px;">
        <button class="btn btn--primary" onclick="startTens()">Do it again</button>
        <button class="btn btn--accent" onclick="showTensReport()">Grown-up summary</button>
        <button class="btn btn--ghost" onclick="showGym()">Gym</button>
      </div>
    </div>`;
}
// Shared by the dormant tensScreen's own summary and the redesigned Gym
// hub's "Grown-up summary" screen (renderGymSummary()) — one strategy tally,
// two places it can be viewed from.
function tensReportHtml(){
  const tally={};
  tensRecord.log.forEach(l=>{const t=tally[l.strategy]||(tally[l.strategy]={n:0,ok:0});t.n++;if(l.ok)t.ok++;});
  const report=Object.keys(TENS_STRATEGY_NAME).map(k=>{
    const t=tally[k]||{n:0,ok:0};
    const pct=t.n?Math.round(t.ok/t.n*100):0;
    const color=!t.n?'var(--text-muted)':pct>=75?'var(--color-success)':pct>=40?'var(--amber-400)':'var(--coral-400)';
    return {name:TENS_STRATEGY_NAME[k],score:t.n?`${t.ok}/${t.n} clean`:'not yet',pct,color};
  });
  const weak=Object.keys(TENS_STRATEGY_NAME)
    .filter(k=>tally[k]&&tally[k].ok<tally[k].n)
    .map(k=>({label:`${TENS_STRATEGY_NAME[k]} (${tally[k].n-tally[k].ok} slip${tally[k].n-tally[k].ok===1?'':'s'})`,cls:tally[k].ok===0?'high':''}));
  if(!weak.length)weak.push({label:'No slips yet',cls:''});
  const rowsHtml=report.map(row=>`
    <div>
      <div style="display:flex;justify-content:space-between;font-size:.9rem;font-weight:800;margin-bottom:4px;"><span>${row.name}</span><span style="color:${row.color};">${row.score}</span></div>
      <div class="progress-bar progress-bar--thin"><div class="progress-bar__fill" style="width:${row.pct}%;background:${row.color};"></div></div>
    </div>`).join('');
  const weakHtml=weak.map(w=>`<span class="pattern-tag ${w.cls}">${w.label}</span>`).join('');
  return `
    <div style="text-align:center;margin-bottom:14px;">
      <div style="font-size:2rem;">👪</div>
      <div style="font-family:var(--font-display);font-size:1.5rem;color:var(--cyan-300);margin-top:4px;">Grown-up summary</div>
      <div style="color:var(--text-secondary);font-size:.9rem;">Applies place value to add and subtract within 100.</div>
    </div>
    <div class="content-card" style="margin-bottom:12px;">
      <div style="font-family:var(--font-display);color:var(--amber-400);font-size:1.05rem;margin-bottom:10px;">By strategy</div>
      <div style="display:flex;flex-direction:column;gap:10px;">${rowsHtml}</div>
    </div>
    <div class="pattern-section">
      <div class="pattern-title">🎯 Where the steps break down</div>
      <div class="chip-row">${weakHtml}</div>
      <div style="color:var(--text-secondary);font-size:.85rem;font-weight:700;margin-top:10px;line-height:1.5;">Clean means solved with no wrong steps. A strategy under 75% is the one to sit with — the standard is about understanding 45 as 4 tens and 5 ones, not about speed.</div>
    </div>`;
}
function renderTensReport(){
  document.getElementById('tensContent').innerHTML=tensReportHtml()+`<button class="btn btn--ghost" style="width:100%;margin-top:12px;" onclick="showGym()">Back to the gym</button>`;
}
function showTensReport(){
  tensView='report';
  stopDrillTimers();
  showScreen('tensScreen');
  renderTensScreen();
}

// ============================================================
//  INIT
// ============================================================
loadRacerState();
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
