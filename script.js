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
//  MISTAKE PATTERNS
// ============================================================
let mistakePatterns={};
try{const s=localStorage.getItem('mathdojo-mistakes');if(s)mistakePatterns=JSON.parse(s);}catch(e){}
function updateMistakePatternsDisplay(){
  const ps=document.getElementById('patternSummary'),pt=document.getElementById('patternTags');
  if(!pt)return;
  const p=Object.entries(mistakePatterns).sort((a,b)=>b[1].count-a[1].count).slice(0,3);
  if(!p.length){if(ps)ps.style.display='none';return;}
  if(ps)ps.style.display='block';
  pt.innerHTML=p.map(([t,d])=>`<span class="pattern-tag ${d.count>5?'high':''}">${t} (${d.count})</span>`).join('');
}

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
const BACK_TARGET={practiceMenuScreen:'homeScreen',soarMenuScreen:'homeScreen',soarActivityScreen:'soarMenuScreen',quizScreen:'practiceMenuScreen',resultScreen:'practiceMenuScreen'};
const TAB_FOR_SCREEN={homeScreen:'home',practiceMenuScreen:'levels',soarMenuScreen:'soar',soarActivityScreen:'soar',quizScreen:'levels',resultScreen:'levels'};
const SCREEN_TITLES={homeScreen:"🏁 Safia's & Safaan's Math Dojo",practiceMenuScreen:'🏎️ Practice Math',soarMenuScreen:'🦅 SOAR Adventures',soarActivityScreen:'🦅 SOAR Activity',quizScreen:'🥊 Quiz',resultScreen:'🏆 Result'};

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
  return {version:1,savedAt:new Date().toISOString(),progress,soarProgress,trophyData,badges,totalStarsEarned};
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
      }
      persistAll();
      renderHome();checkBadges();renderTrophyShelf();updateTopBarStars();
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
//  INIT
// ============================================================
updateMistakePatternsDisplay();
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
