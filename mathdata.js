// Turbo Math Dojo — game engine & content. Pure data/logic, no DOM.
// Ported from design_handoff_math_garage_redesign/mathdata.js (canonical content:
// levels, SOAR activities, trophies, badges, word-problem pools) merged with the
// richer per-level equation-generator sub-types from the previous "Safia's Math
// Kingdom" app (script.js), retargeted to the Turbo Math token palette below.
// Loaded as a plain global script (no ES modules) — must be included before script.js.
const CY='#17C7C7', CYL='#3DDCDC', COR='#FF5C3D', CORL='#FF8563', AMB='#FFB020', AMBL='#FFC94D',
      MINT='#2FE6A7', RED='#FF3B3B', INK='#F4FBFB', MUT='#A9C4C4', SURF1='#0D2828', SURF2='#123636', BORDER='#275C5C', PURP='#B98CFF';

function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(arr){return arr[rnd(0,arr.length-1)];}

// ── Hint-card formatting helpers ──────────────────────────────
function bubble(text){return `<div style="background:${SURF2};border-radius:14px;padding:12px 16px;margin:8px 0;color:${INK};line-height:1.7;font-size:.92rem;">${text}</div>`;}
function wrap(borderColor,icon,title,body){return `<div style="background:linear-gradient(135deg,${SURF2},${SURF1});border-radius:20px;padding:18px;border:3px solid ${borderColor};font-size:.95rem;"><div style="color:${borderColor};font-weight:900;font-size:1.05rem;text-align:center;margin-bottom:12px;font-family:var(--font-display);">${icon} ${title}</div>${body}</div>`;}
function numChip(n,bg){return `<span style="display:inline-flex;align-items:center;justify-content:center;background:${bg||CY};color:#0A1F1F;min-width:38px;height:38px;border-radius:9px;font-size:1.2rem;font-weight:900;padding:0 5px;margin:2px;">${n}</span>`;}
function colBox(rows){const lines=rows.map(r=>`<div style="font-family:'Courier New';font-size:1.5rem;color:${r.color||CY};text-align:right;padding:1px 0;">${r.text}</div>`).join('');return `<div style="background:#081716;border-radius:12px;padding:12px 22px;display:inline-block;min-width:110px;">${lines}</div>`;}
function coinChip(v){const label=v===25?'25¢':v===10?'10¢':v===5?'5¢':'1¢';return `<span style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 30%,${AMB},${SURF2} 85%);border:2px solid ${MUT};color:#0A1F1F;font-weight:900;font-size:.7rem;margin:2px;">${label}</span>`;}
function coinRow(coins){return coins.map(v=>coinChip(v)).join('');}
function formatCents(c){return c>=100?`$${(c/100).toFixed(2)}`:`${c}¢`;}
function coinLabel(v){return v===25?'25¢':v===10?'10¢':v===5?'5¢':'1¢';}

// ── Core addition / subtraction column hints ──────────────────
function subtractColumn(big,small){
  const oB=big%10,oS=small%10,tB=Math.floor(big/10),tS=Math.floor(small/10);
  const needBorrow=oB<oS,ans=big-small,pad=String(big).length;
  if(!needBorrow){
    const oneAns=oB-oS,tenAns=tB-tS;
    return wrap(MINT,'➖',`${big} − ${small}`,
      bubble(`<strong style="color:${AMB};">Right side (ones):</strong> Is ${oB} bigger than or equal to ${oS}? <strong style="color:${MINT};">YES</strong><br>${oB} − ${oS} = <strong>${oneAns}</strong>`)
      +bubble(`<strong style="color:${AMB};">Left side (tens):</strong> ${tB} − ${tS} = <strong>${tenAns}</strong>`)
      +`<div style="text-align:center;margin:10px 0;">${colBox([{text:'  '+big},{text:'− '+String(small).padStart(pad,' ')},{text:'─────',color:MUT},{text:'  '+ans,color:MINT}])}</div>`
      +bubble(`<strong style="color:${MINT};">${big} − ${small} = ${ans}</strong>`));
  }
  const borrowedOnes=oB+10,newTens=tB-1,oneAns=borrowedOnes-oS,tenAns=newTens-tS;
  const oSteps=Array.from({length:oneAns},(_,i)=>oS+i+1);
  return wrap(COR,'➖',`${big} − ${small} (with borrowing)`,
    bubble(`<strong style="color:${AMB};">Right side (ones):</strong> Is ${oB} bigger than or equal to ${oS}? <strong style="color:${COR};">NO</strong><br>${oB} is less than ${oS} — we need to <strong>borrow</strong>.`)
    +bubble(`<strong style="color:${AMB};">Borrowing:</strong><br>Take 1 ten from the left: <strong>${tB} → ${newTens}</strong><br>Add that 10 to the right: <strong>${oB} → ${borrowedOnes}</strong>`)
    +bubble(`<strong style="color:${AMB};">Right side: ${borrowedOnes} − ${oS}</strong><br>${numChip(oS,CORL)} → ${oSteps.map((n,i)=>numChip(n,i===oSteps.length-1?MINT:COR)).join(' ')}<br><strong style="color:${MINT};">${oneAns}</strong>`)
    +bubble(`<strong style="color:${AMB};">Left side: ${newTens} − ${tS} = ${tenAns}</strong>`)
    +`<div style="text-align:center;margin:10px 0;">${colBox([{text:'  '+big},{text:'− '+String(small).padStart(pad,' ')},{text:'─────',color:MUT},{text:'  '+ans,color:MINT}])}</div>`
    +bubble(`<strong style="color:${MINT};">${big} − ${small} = ${ans}</strong>`));
}
function addColumn(a,b){
  const oA=a%10,oB=b%10,tA=Math.floor(a/10),tB=Math.floor(b/10);
  const onesSum=oA+oB,needCarry=onesSum>9,onesWrite=onesSum%10,carry=Math.floor(onesSum/10),ans=a+b,pad=String(a).length;
  if(!needCarry){
    return wrap(MINT,'➕',`${a} + ${b}`,
      bubble(`<strong style="color:${AMB};">Right side (ones): ${oA} + ${oB} = ${onesSum}</strong><br>${onesSum} is 9 or less — no carrying needed.`)
      +bubble(`<strong style="color:${AMB};">Left side (tens): ${tA} + ${tB} = ${tA+tB}</strong>`)
      +`<div style="text-align:center;margin:10px 0;">${colBox([{text:'  '+a},{text:'+ '+String(b).padStart(pad,' ')},{text:'─────',color:MUT},{text:'  '+ans,color:MINT}])}</div>`
      +bubble(`<strong style="color:${MINT};">${a} + ${b} = ${ans}</strong>`));
  }
  return wrap(MINT,'➕',`${a} + ${b} (with carrying)`,
    bubble(`<strong style="color:${AMB};">Right side (ones): ${oA} + ${oB} = ${onesSum}</strong><br>That's bigger than 9! Write <strong style="color:${MINT};">${onesWrite}</strong>, carry <strong style="color:${AMB};">${carry}</strong>.`)
    +bubble(`<strong style="color:${AMB};">Left side (tens): ${tA} + ${tB} + ${carry} = ${tA+tB+carry}</strong>`)
    +`<div style="text-align:center;margin:10px 0;">${colBox([{text:'  '+carry,color:AMB},{text:'  '+a},{text:'+ '+String(b).padStart(pad,' ')},{text:'─────',color:MUT},{text:'  '+ans,color:MINT}])}</div>`
    +bubble(`<strong style="color:${MINT};">${a} + ${b} = ${ans}</strong>`));
}
const hintAdd=addColumn, hintSub=subtractColumn, hintCarryAdd=addColumn, hintBorrowSub=subtractColumn;

// ── Stepped worked-example generators (pure data — no HTML/DOM) ───────────
// These replace the old single-shot prose/HTML hints with an interactive,
// one-step-at-a-time drawing: a column-method grid for two-digit add/
// subtract, or a number-strip for count-on/count-up addition/subtraction.
// A generator sets a `work` descriptor on its question ({k,a,b} or, for
// chained two-operation problems, [{...},{...}]) alongside its existing
// `hint` string — script.js's renderHintPanel() prefers `work` when present
// and falls back to the plain-prose `hint` otherwise, exactly like the
// design prototype's hintDrawn/hintPlain split. A "cell" is {v,color,strike}
// and a "row" is an array of cells (sign column first); a "chip" is
// {v,count,hl}. Colors are token names resolved to CSS vars in script.js.
function hCell(v,color,strike){return {v:(v===''||v==null)?'':String(v),color:color||'ink',strike:!!strike};}
function hRow3(a,b,c){return [a,b,c];}
function hBlank3(){return hRow3(hCell(''),hCell(''),hCell(''));}

// Column method for two-digit addition/subtraction. Ported from the redesign
// prototype's addSteps/subSteps, with one fix: the prototype assumed an
// always-2-digit result and would silently mis-render a 3-digit carry total
// (reachable here via eqCarryAdd's 15-69 range, e.g. 69+69=138) — the result
// row below pads/spills to however many digits the total actually has.
function columnSteps(a,b,op){
  const at=Math.floor(a/10),ao=a%10,bt=Math.floor(b/10),bo=b%10;
  const top=(hl,strike)=>hRow3(hCell(''),hCell(at,hl==='tens'?'amber':'ink',strike),hCell(ao,hl==='ones'?'amber':'ink'));
  const bot=(hl)=>hRow3(hCell(op==='+'?'+':'−','coral'),hCell(bt,hl==='tens'?'amber':'ink'),hCell(bo,hl==='ones'?'amber':'ink'));

  if(op==='+'){
    const onesSum=ao+bo,carried=onesSum>9?1:0,onesDigit=onesSum%10;
    const tensSum=at+bt+carried,total=a+b,totalStr=String(total);
    const resultRow=()=>{
      const pad=Math.max(0,2-totalStr.length); // digit-portion width 2, same as every other row — grows only past 2 digits
      const cells=[hCell('')];
      for(let i=0;i<pad;i++)cells.push(hCell(''));
      for(const d of totalStr)cells.push(hCell(d,'cyan'));
      return cells;
    };
    const S=[];
    S.push({say:'Line the numbers up. Ones under ones, tens under tens.',side:'',carry:hBlank3(),top:top(),bot:bot(),res:hBlank3()});
    S.push({say:`Start with the ones. What is ${ao} + ${bo}?`,side:`${ao} + ${bo} = ${onesSum}`,carry:hBlank3(),top:top('ones'),bot:bot('ones'),res:hBlank3()});
    if(carried){
      S.push({say:`${onesSum} is more than 9. Keep the ${onesDigit} down in the ones, and move the 1 ten over to the tens.`,side:`${onesSum} = 1 ten and ${onesDigit} ones`,carry:hRow3(hCell(''),hCell(1,'cyan'),hCell('')),top:top('ones'),bot:bot('ones'),res:hRow3(hCell(''),hCell(''),hCell(onesDigit,'amber'))});
      S.push({say:`Now the tens. ${at} + ${bt}, and add the 1 we carried.`,side:`${at} + ${bt} + 1 = ${tensSum}`,carry:hRow3(hCell(''),hCell(1,'cyan'),hCell('')),top:top('tens'),bot:bot('tens'),res:tensSum<10?hRow3(hCell(''),hCell(tensSum,'amber'),hCell(onesDigit,'cyan')):resultRow()});
    }else{
      S.push({say:`${onesSum} is 9 or less, so there is nothing to carry. Write ${onesDigit} in the ones.`,side:'',carry:hBlank3(),top:top('ones'),bot:bot('ones'),res:hRow3(hCell(''),hCell(''),hCell(onesDigit,'amber'))});
      S.push({say:`Now the tens. ${at} + ${bt}.`,side:`${at} + ${bt} = ${tensSum}`,carry:hBlank3(),top:top('tens'),bot:bot('tens'),res:hRow3(hCell(''),hCell(tensSum,'amber'),hCell(onesDigit,'cyan'))});
    }
    S.push({say:`So ${a} + ${b} = ${total}.`,side:'',carry:carried?hRow3(hCell(''),hCell(1,'cyan'),hCell('')):hBlank3(),top:top(),bot:bot(),res:resultRow()});
    return S;
  }

  // Subtraction — every generator that calls columnSteps for '-' keeps the
  // minuend at or below 95, so the result never exceeds 2 digits.
  const ans=a-b;
  const S=[{say:'Line them up. Ones under ones, tens under tens.',side:'',carry:hBlank3(),top:top(),bot:bot(),res:hBlank3()}];

  if(at===bt){
    S.push({say:`Look at the tens. Both numbers have ${at} ten${at===1?'':'s'}. Same tens take each other away, so the tens make 0.`,side:`${at*10} − ${bt*10} = 0`,carry:hBlank3(),top:top('tens'),bot:bot('tens'),res:hRow3(hCell(''),hCell(0,'cyan'),hCell(''))});
    S.push({say:`That leaves just the ones. ${ao} take away ${bo}.`,side:`${ao} − ${bo} = ${ao-bo}`,carry:hBlank3(),top:top('ones'),bot:bot('ones'),res:hRow3(hCell(''),hCell(0,'cyan'),hCell(ao-bo,'amber'))});
    S.push({say:`So ${a} − ${b} = ${ans}. When the tens match, you only have to do the ones.`,side:'',carry:hBlank3(),top:top(),bot:bot(),res:hRow3(hCell(''),hCell(''),hCell(ans,'cyan'))});
    return S;
  }

  if(ao>=bo){
    S.push({say:`Look at the ones. Is ${ao} bigger than ${bo}? Yes, so we can take it away right away.`,side:`${ao} − ${bo} = ${ao-bo}`,carry:hBlank3(),top:top('ones'),bot:bot('ones'),res:hRow3(hCell(''),hCell(''),hCell(ao-bo,'amber'))});
    S.push({say:`Now the tens. ${at} take away ${bt}.`,side:`${at} − ${bt} = ${at-bt}`,carry:hBlank3(),top:top('tens'),bot:bot('tens'),res:hRow3(hCell(''),hCell(at-bt,'amber'),hCell(ao-bo,'cyan'))});
  }else{
    S.push({say:`Look at the ones. Is ${ao} bigger than ${bo}? No. So we need to borrow a ten.`,side:`${ao} is smaller than ${bo}`,carry:hBlank3(),top:top(),bot:bot(),res:hBlank3()});
    S.push({say:`Take one ten from the ${at}. Cross the ${at} out and write ${at-1} above it. Give that ten to the ones, so ${ao} becomes ${ao+10}.`,side:`${ao} + 10 = ${ao+10}`,carry:hRow3(hCell(''),hCell(at-1,'cyan'),hCell('')),top:hRow3(hCell(''),hCell(at,'muted',true),hCell(ao+10,'amber')),bot:bot(),res:hBlank3()});
    S.push({say:`Now the ones are easy. ${ao+10} take away ${bo}.`,side:`${ao+10} − ${bo} = ${ao+10-bo}`,carry:hRow3(hCell(''),hCell(at-1,'cyan'),hCell('')),top:hRow3(hCell(''),hCell(at,'muted',true),hCell(ao+10,'ink')),bot:bot('ones'),res:hRow3(hCell(''),hCell(''),hCell(ao+10-bo,'amber'))});
    S.push({say:`Then the tens. We have ${at-1} left, take away ${bt}.`,side:`${at-1} − ${bt} = ${at-1-bt}`,carry:hRow3(hCell(''),hCell(at-1,'cyan'),hCell('')),top:hRow3(hCell(''),hCell(at,'muted',true),hCell(ao+10,'ink')),bot:bot('tens'),res:hRow3(hCell(''),hCell(at-1-bt,'amber'),hCell(ao+10-bo,'cyan'))});
  }
  S.push({say:ans<10?`The tens made 0, so we do not write it. ${a} − ${b} = ${ans}.`:`So ${a} − ${b} = ${ans}.`,side:'',carry:hBlank3(),top:top(),bot:bot(),res:ans<10?hRow3(hCell(''),hCell(''),hCell(ans,'cyan')):hRow3(hCell(''),hCell(String(ans)[0],'cyan'),hCell(String(ans)[1],'cyan'))});
  return S;
}

// Number-strip method for single-digit/teen addition or subtraction with no
// regrouping, and for missing-number problems (count up from the known
// small number to the target). kind 'cup' = count on (addition); 'cdown' =
// count up to find a difference (subtraction or "how many more to reach").
function hChip(v,count,hl){return {v:String(v),count:count==null?'':String(count),hl:!!hl};}
function stripSteps(kind,a,b){
  const isAdd=kind==='cup';
  const big=isAdd?Math.max(a,b):a, small=isAdd?Math.min(a,b):b;
  const answer=isAdd?a+b:a-b;
  const howMany=isAdd?small:answer;
  const start=isAdd?big+1:small+1;
  const all=(hlLast)=>Array.from({length:howMany},(_,i)=>hChip(start+i,i+1,hlLast&&i===howMany-1));
  const sign=isAdd?'+':'−';
  const S=[];
  S.push({mode:'strip',say:`Which number is bigger? ${big} is the big number. ${small} is the small number.`,side:`${a} ${sign} ${b}`,chips:[]});
  S.push({mode:'strip',say:isAdd?`Start at the number after the big number. After ${big} comes ${start}.`:`Start at the number after the small number. After ${small} comes ${start}.`,side:`start at ${start}`,chips:[hChip(start,1,true)]});
  S.push({mode:'strip',say:isAdd?`Now count on ${small} numbers — one for every one in ${small}. Say them out loud and count on your fingers.`:`Now keep counting until you reach ${big}. Count how many numbers you say.`,side:'',chips:all(false)});
  S.push({mode:'strip',say:isAdd?`The last number we said is the answer. ${a} + ${b} = ${answer}.`:`We said ${answer} numbers, so ${a} − ${b} = ${answer}.`,side:`${a} ${sign} ${b} = ${answer}`,chips:all(true)});
  return S;
}
// Dispatcher: expands a question's `work` descriptor (single or chained)
// into one continuous step sequence for the hint panel.
function workSteps(work){
  if(!work)return null;
  const list=Array.isArray(work)?work:[work];
  let steps=[];
  list.forEach(w=>{
    const part=(w.k==='cup'||w.k==='cdown')?stripSteps(w.k,w.a,w.b):columnSteps(w.a,w.b,w.k==='add'?'+':'-');
    steps=steps.concat(part);
  });
  return steps;
}

function hintMissingAddSimple(total,a){const ans=total-a;return wrap(MINT,'❓','MISSING NUMBER — ADDITION',bubble(`We have: ${a} + ? = ${total}`)+subtractColumn(total,a)+bubble(`<strong style="color:${MINT};">The missing number is ${ans}. Check: ${a} + ${ans} = ${total} ✓</strong>`));}
function hintMissingSubSmall(total,result){const ans=total-result;return wrap(COR,'❓','MISSING NUMBER — SUBTRACTION',bubble(`We have: ${total} − ? = ${result}`)+subtractColumn(total,result)+bubble(`<strong style="color:${MINT};">The missing number is ${ans}. Check: ${total} − ${ans} = ${result} ✓</strong>`));}
function hintMissingThreeAdd(total,a,b){const known=a+b,ans=total-known;return wrap(MINT,'❓','MISSING NUMBER — THREE ADDENDS',bubble(`Step 1 — add what we know: ${a} + ${b}`)+addColumn(a,b)+bubble(`Step 2 — subtract from the total: ${total} − ${known}`)+subtractColumn(total,known)+bubble(`<strong style="color:${MINT};">Missing number: ${ans}. Check: ${a} + ${b} + ${ans} = ${total} ✓</strong>`));}
function hintAddThree(a,b,c){const s1=a+b,s2=s1+c;return wrap(MINT,'➕',`${a} + ${b} + ${c}`,bubble(`Add two at a time. Step 1 — ${a} + ${b}:`)+addColumn(a,b)+bubble(`Step 2 — add ${c} to ${s1}:`)+addColumn(s1,c)+bubble(`<strong style="color:${MINT};">${a} + ${b} + ${c} = ${s2}</strong>`));}
function hintSubThree(total,b,c){const s1=total-b,s2=s1-c;return wrap(COR,'➖',`${total} − ${b} − ${c}`,bubble(`Step 1 — subtract ${b} from ${total}:`)+subtractColumn(total,b)+bubble(`Step 2 — subtract ${c} from ${s1}:`)+subtractColumn(s1,c)+bubble(`<strong style="color:${MINT};">${total} − ${b} − ${c} = ${s2}</strong>`));}
function hintComposeAdd(target){const e=target>10?7:3,ans=target-e,e2=e+3,ans2=target-e2;return wrap(MINT,'💎',`Two pairs that add to ${target}`,bubble(`Pair 1 — pick ${e}: ${e} + ? = ${target}`)+subtractColumn(target,e)+bubble(`${numChip(e,COR)} + ${numChip(ans,MINT)} = ${numChip(target,AMB)}`)+bubble(`Pair 2 — pick ${e2}: ${e2} + ? = ${target}`)+subtractColumn(target,e2)+bubble(`${numChip(e2,COR)} + ${numChip(ans2,MINT)} = ${numChip(target,AMB)}<br><strong style="color:${MINT};">Now find your own two pairs!</strong>`));}
function hintComposeSub(diff){const big=diff+2,small=big-diff,small2=3,big2=small2+diff;return wrap(COR,'🦋',`Two pairs with a difference of ${diff}`,bubble(`Case 1 — Big number known: ${big} − ? = ${diff}`)+subtractColumn(big,diff)+bubble(`${numChip(big,AMB)} − ${numChip(small,COR)} = ${numChip(diff,MINT)}`)+bubble(`Case 2 — Big number hidden: ? − ${small2} = ${diff}. Add it back:`)+addColumn(diff,small2)+bubble(`${numChip(big2,AMB)} − ${numChip(small2,COR)} = ${numChip(diff,MINT)}<br><strong style="color:${MINT};">Now try your own pairs!</strong>`));}
function hintFactFamily(a,b,total){
  return wrap(PURP,'🏰',`Fact family — ${a}, ${b}, ${total}`,
    bubble(`<div style="display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;margin:8px 0;">
      <div style="text-align:center;"><div style="background:${AMB};color:#0A1F1F;border-radius:50%;width:60px;height:60px;display:inline-flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:900;">${total}</div><div style="color:${AMB};font-size:.85rem;margin-top:4px;font-weight:800;">BIGGEST</div></div>
      <div style="text-align:center;"><div style="background:${CY};color:#0A1F1F;border-radius:50%;width:50px;height:50px;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;">${a}</div><div style="color:${CY};font-size:.85rem;margin-top:4px;font-weight:800;">PART</div></div>
      <div style="text-align:center;"><div style="background:${CY};color:#0A1F1F;border-radius:50%;width:50px;height:50px;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;">${b}</div><div style="color:${CY};font-size:.85rem;margin-top:4px;font-weight:800;">PART</div></div></div>`)
    +bubble(`<strong style="color:${AMB};">Plus rule:</strong> the two parts join to make the biggest — order doesn't matter.<br>${numChip(a,CY)} + ${numChip(b,CY)} = ${numChip(total,AMB)} &nbsp;|&nbsp; ${numChip(b,CY)} + ${numChip(a,CY)} = ${numChip(total,AMB)}`)
    +bubble(`<strong style="color:${AMB};">Minus rule:</strong> always start from the biggest.<br>${numChip(total,AMB)} − ${numChip(a,CY)} = ${numChip(b,MINT)} &nbsp;|&nbsp; ${numChip(total,AMB)} − ${numChip(b,CY)} = ${numChip(a,MINT)}`));
}
function hintMoneyCount(coins){const total=coins.reduce((a,b)=>a+b,0);let running=0;const steps=coins.map(v=>{running+=v;return running;});return wrap(AMB,'🪙','Counting Coins',bubble(`We have: ${coinRow(coins)}`)+bubble(`Count up: ${coins.map(v=>'+'+v).join(' ')} → running total: ${steps.join('¢, ')}¢`)+bubble(`<strong style="color:${MINT};">Total = ${total}¢</strong>`));}
function hintMoneyMake(target,combo){return wrap(AMB,'🪙',`Make ${target}¢`,bubble(`Tap coins that add up to exactly ${target}¢.`)+bubble(`One way: ${coinRow(combo)} → ${combo.join('¢ + ')}¢ = <strong style="color:${MINT};">${target}¢</strong>`));}
function hintMoneyEquiv(q,ans,name){return wrap(AMB,'🪙',`Pennies in a ${name}`,bubble(`A ${name} is worth ${q}¢, and each penny is worth 1¢.<br>So it takes <strong style="color:${MINT};">${ans}</strong> pennies to equal one ${name}!`));}
function hintTime(hour,delta,answer){const dir=delta>=0?'forward':'back';return wrap(CY,'⏰','Telling time',bubble(`Start at <strong>${hour} o'clock</strong> and move ${Math.abs(delta)} hour${Math.abs(delta)!==1?'s':''} ${dir}.`)+bubble(`Count around the clock: ${Array.from({length:Math.abs(delta)},(_,i)=>dir==='forward'?((hour+i)%12)+1:((hour-i-1+12)%12)+1).join(' → ')}`)+bubble(`<strong style="color:${MINT};">It will be ${answer} o'clock.</strong>`));}
function hintTimeRead(hour,minute){return wrap(AMB,'⏰','Reading the Clock',bubble(`The short hand (hour hand) points close to <strong>${hour}</strong>.`)+bubble(minute===0?`The long hand (minute hand) points straight up at <strong>12</strong> — that means it's exactly <strong>${hour} o'clock</strong>.`:`The long hand (minute hand) points straight down at <strong>6</strong> — that means it's <strong>half past ${hour}</strong>.`)+bubble(`<strong style="color:${MINT};">The time is ${formatTime(hour,minute)}</strong>`));}
function hintCompareSymbol(a,b,sym){return wrap(CY,'⚖️','Comparing numbers',bubble(`Compare ${a} and ${b} on the number line — whichever is further along is bigger.`)+bubble(`<strong style="color:${MINT};">${a} ${sym} ${b}</strong>`));}
function hintTrueFalse(a,b,shown,sum){return wrap(shown===sum?MINT:COR,'🔎','Is It True?',bubble(`Let's check: ${a} + ${b} = ?`)+addColumn(a,b)+bubble(shown===sum?`The equation says ${a} + ${b} = ${shown}, and that's exactly right!<br><strong style="color:${MINT};">TRUE ✓</strong>`:`The equation says ${a} + ${b} = ${shown}, but we just worked out it's really ${sum}.<br><strong style="color:${RED};">FALSE</strong> — the real answer is ${sum}.`));}
function hintDouble(n){return wrap(CY,'✨','Doubles',bubble(`Double means add the number to itself: ${n} + ${n}.`)+addColumn(n,n));}
function hintNearDouble(n){const m=n+1;return wrap(MINT,'✨',`${n} + ${m} (a near double!)`,bubble(`${n} and ${m} are almost the same number! Double ${n} is <strong>${2*n}</strong>.`)+bubble(`${m} is just <strong>1 more</strong> than ${n}, so ${n} + ${m} is just <strong>1 more</strong> than double ${n}.`)+bubble(`<strong style="color:${MINT};">${n} + ${m} = ${2*n} + 1 = ${n+m}</strong>`));}
function hintFraction(denom,part,label){return wrap(PURP,'🍕','Fractions',bubble(`Split the whole into ${denom} equal pieces. ${part} of them is written as <strong>${label}</strong>.`));}
function hintFractionPie(parts,shaded,label){const wholeWord=parts===2?'2 equal parts (halves)':'4 equal parts (fourths)';return wrap(PURP,'🍕',`Understanding ${label}`,bubble(`The shape is cut into <strong>${wholeWord}</strong>.`)+bubble(`${shaded} out of ${parts} parts are shaded, so that's <strong style="color:${MINT};">${label}</strong> shaded!`)+`<div style="text-align:center;">${pieSliceSvg(parts,shaded)}</div>`);}
function hintShapeSides(shape,sides,name){return wrap(PURP,'🔺',`${name} Sides`,bubble(sides===0?`A circle is round all the way — it has <strong style="color:${MINT};">no straight sides</strong>!`:`Count each straight edge: a ${name.toLowerCase()} has <strong style="color:${MINT};">${sides}</strong> sides!`)+`<div style="text-align:center;">${shapeSvg(shape)}</div>`);}
function hintShapeName(sides){return wrap(PURP,'🔺','Naming Shapes',bubble(`This shape has ${sides===0?'no straight sides — it is round':sides+' sides'}.`));}
function hintLengthBlocks(n){return wrap(PURP,'📏','Measuring Length',bubble(`Count each block one at a time, left to right.`)+bubble(`<strong style="color:${MINT};">It's ${n} blocks long!</strong>`));}
function hintGraphMost(label,val){return wrap(AMB,'📊','Reading the Graph',bubble(`Look for the <strong>tallest</strong> bar!`)+bubble(`<strong style="color:${MINT};">${label} has the most, with ${val}!</strong>`));}
function hintGraphDiff(bigLabel,bigVal,smallLabel,smallVal){return wrap(AMB,'📊','Comparing Bars',bubble(`${bigLabel}: ${bigVal}, ${smallLabel}: ${smallVal}`)+subtractColumn(bigVal,smallVal));}
function hintGraphTotal(items,total){return wrap(AMB,'📊','Adding It All Up',bubble(`Add every bar together: ${items.join(' + ')} = <strong style="color:${MINT};">${total}</strong>`));}
function hintOrdinal(n,correct){return wrap(CY,'🏅','Ordinal Numbers',bubble(`Ordinal numbers tell us the ORDER of something: 1st, 2nd, 3rd, 4th...`)+bubble(`Number <strong>${n}</strong> in order is called <strong style="color:${MINT};">${correct}</strong>!`));}
function hintNumberWord(correct,n){return wrap(CY,'🔤','Number Words',bubble(`"${correct}" is how we write the number <strong style="color:${MINT};">${n}</strong> in words!`));}

// ── Days/months/seasons ─────────────────────────────────────
const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const SEASONS=['Winter','Spring','Summer','Autumn'];

// ── Equation generators (one per level id) ───────────────────
function eqCounting(){
  const t=rnd(0,2);
  if(t===0){const n=rnd(5,20),obj=pick(['🏎️','🏁','⭐','⚙️']);return{type:'counting_objects',category:'equation',hasHint:true,question:`Count them up:<br>${obj.repeat(n)}<br>How many are there?`,answer:n,hint:wrap(MINT,'🔢','Counting',bubble(`Count one at a time up to <strong style="color:${MINT};">${n}</strong>.`))};}
  if(t===1){const a=rnd(2,14),b=rnd(1,6);return{type:'counting_add',category:'equation',hasHint:true,question:`${a} + ${b} = ?`,answer:a+b,hint:addColumn(a,b),work:{k:'cup',a,b}};}
  const a=rnd(6,18),b=rnd(1,5);return{type:'counting_sub',category:'equation',hasHint:true,question:`${a} − ${b} = ?`,answer:a-b,hint:subtractColumn(a,b),work:{k:'cdown',a,b}};
}
function eqGrouping(){const tens=rnd(1,9),ones=rnd(0,9),total=tens*10+ones;return{type:'grouping',question:`${tens} bundle${tens!==1?'s':''} of 10 + ${ones} loose. How many total?`,answer:total,hint:wrap(MINT,'📦','Tens and Ones',bubble(`${tens} tens = <strong>${tens*10}</strong>, plus ${ones} ones = <strong>${ones}</strong><br>${tens*10} + ${ones} = <strong style="color:${MINT};">${total}</strong>`))};}
function eqMissingAdd(){const a=rnd(3,15),miss=rnd(2,12),total=a+miss;return{type:'missing_add',question:`${a} + ? = ${total}`,answer:miss,hint:hintMissingAddSimple(total,a),work:{k:'cdown',a:total,b:a}};}
function eqCarryAdd(){let a,b,g=0;do{a=rnd(15,69);b=rnd(15,69);g++;}while((a%10+b%10)<=9&&g<300);return{type:'carry_add',question:`${a} + ${b} = ?`,answer:a+b,hint:hintCarryAdd(a,b),work:{k:'add',a,b}};}
function eqBorrowSub(){let a,b,g=0;do{a=rnd(30,89);b=rnd(15,a-1);g++;}while((a%10)>=(b%10)&&g<300);return{type:'borrow_sub',question:`${a} − ${b} = ?`,answer:a-b,hint:hintBorrowSub(a,b),work:{k:'sub',a,b}};}
function eqAddThree(){const a=rnd(5,30),b=rnd(5,30),c=rnd(5,30);return{type:'add_three',question:`${a} + ${b} + ${c} = ?`,answer:a+b+c,hint:hintAddThree(a,b,c),work:[{k:'add',a,b},{k:'add',a:a+b,b:c}]};}
function eqSubThree(){const total=rnd(50,95),b=rnd(10,Math.floor(total/2)-2),c=rnd(10,total-b-5);return{type:'sub_three',question:`${total} − ${b} − ${c} = ?`,answer:total-b-c,hint:hintSubThree(total,b,c),work:[{k:'sub',a:total,b},{k:'sub',a:total-b,b:c}]};}
function eqComposeAdd(){const target=rnd(10,20);return{type:'compose_add',kind:'compose_pair',question:`Write two different pairs of numbers that add up to <strong>${target}</strong>.`,target,hint:hintComposeAdd(target)};}
function eqComposeSub(){const diff=rnd(4,10);return{type:'compose_sub',kind:'compose_pair',question:`Write two pairs where the big number take away the small number leaves <strong>${diff}</strong>.`,target:diff,hint:hintComposeSub(diff)};}
function eqFactFamily(){let a,b,g=0;do{a=rnd(3,12);b=rnd(3,12);g++;}while(a===b&&g<200);const total=a+b;return{type:'fact_family',question:`<strong>${a}</strong>, <strong>${b}</strong> and <strong>${total}</strong> are a number family.<br>Rows 1 and 2: make a plus fact. Rows 3 and 4: make a take-away fact.`,a,b,total,hint:hintFactFamily(a,b,total)};}

const LOGIC_EMOJI_POOL=['🏎️','🏁','⭐','🔧','🥊','🧸','🎀','⚙️','🔴','🟡','🔵','🟢'];
function eqLogic(){
  const t=rnd(0,3);
  if(t===0){
    const p=pick([{pattern:'🏁⚙️🏁⚙️',next:'🏁'},{pattern:'🏎️🥊🏎️🥊',next:'🏎️'},{pattern:'⭐🔧⭐🔧',next:'⭐'}]);
    const distractors=shuffle(LOGIC_EMOJI_POOL.filter(e=>e!==p.next&&!p.pattern.includes(e))).slice(0,3);
    const choices=shuffle([{label:p.next,correct:true},...distractors.map(l=>({label:l,correct:false}))]);
    return{type:'logic',kind:'multiple_choice',question:`What comes next?<br>${p.pattern} __?`,choices,hint:wrap(MINT,'🧠','Patterns',bubble(`The pattern repeats: <strong>${p.pattern}</strong> — look at what comes after each pair!`)+bubble(`<strong style="color:${MINT};">Next is ${p.next}!</strong>`))};
  }
  if(t===1){
    const p=pick([{q:"If it's raining, we use an umbrella.<br>It is raining today. What do we use?",correct:'Umbrella',choices:['Umbrella','A fan','Sunglasses','A kite']},{q:'Finish your homework → get screen time.<br>Safaan finished his homework. Does he get screen time?',correct:'Yes',choices:['Yes','No']}]);
    const choices=shuffle(p.choices.map(c=>({label:c,correct:c===p.correct})));
    return{type:'logic',kind:'multiple_choice',question:p.q,choices,hint:wrap(MINT,'🧠','Think It Through',bubble(`Read the rule carefully, then follow it.`)+bubble(`<strong style="color:${MINT};">${p.correct}!</strong>`))};
  }
  if(t===2){
    const p=pick([{q:'Which doesn\'t belong?<br>🏎️🏁🏆🐻',answer:'🐻',options:['🏎️','🏁','🏆','🐻']},{q:'Which doesn\'t belong?<br>🔴🟡🔵🟢⭐',answer:'⭐',options:['🔴','🟡','🔵','🟢','⭐']}]);
    const choices=shuffle(p.options.map(o=>({label:o,correct:o===p.answer})));
    return{type:'logic',kind:'multiple_choice',question:p.q,choices,hint:wrap(MINT,'🧠','Odd One Out',bubble(`Most of these belong to the same group — one is different!`)+bubble(`<strong style="color:${MINT};">${p.answer} doesn't belong!</strong>`))};
  }
  const step=pick([2,3,4,5]),start=rnd(1,10),seq=[start,start+step,start+2*step,start+3*step];
  return{type:'logic',kind:'numeric',question:`What comes next? ${seq.join(', ')}, __?`,answer:start+4*step,hint:wrap(CY,'🧠','Number patterns',bubble(`Each number is <strong>${step}</strong> more than the last: ${seq[3]} + ${step} = <strong style="color:${MINT};">${start+4*step}</strong>`))};
}

const COIN_VALUES=[1,5,10,25];
function eqMoney(){
  const t=rnd(0,2);
  if(t===0){const n=rnd(2,4),coins=Array.from({length:n},()=>pick(COIN_VALUES)),total=coins.reduce((a,b)=>a+b,0);return{type:'money_count',kind:'numeric',question:`How many cents is this?<br>${coinRow(coins)}`,answer:total,hint:hintMoneyCount(coins)};}
  if(t===1){const pool=shuffle([25,25,10,10,5,5,1,1,1]).slice(0,rnd(3,5));const target=pool.reduce((a,b)=>a+b,0);return{type:'money_make',kind:'coin_picker',question:`Tap coins that add up to exactly ${formatCents(target)}.`,coins:pool,target,hint:hintMoneyMake(target,pool)};}
  const opts=pick([{q:5,a:'nickel'},{q:10,a:'dime'},{q:25,a:'quarter'}]);
  return{type:'money_equiv',kind:'numeric',question:`How many pennies (1¢) equal one ${opts.a} (${opts.q}¢)?`,answer:opts.q,hint:hintMoneyEquiv(opts.q,opts.q,opts.a)};
}

function eqTime(){
  const t=rnd(0,1);
  if(t===0){const hour=rnd(1,11),delta=pick([1,2,3,-1,-2,-3]),answer=((hour+delta-1)%12+12)%12+1;return{type:'time',question:delta>0?`It is ${hour} o'clock. What o'clock will it be in ${delta} hour${delta!==1?'s':''}?`:`It is ${hour} o'clock. What o'clock was it ${-delta} hour${-delta!==1?'s':''} ago?`,answer,hint:hintTime(hour,delta,answer)};}
  const hour=rnd(1,12),minute=rnd(0,1)*30,correct=formatTime(hour,minute);
  const distractors=new Set();
  while(distractors.size<3){const dh=rnd(1,12),dm=rnd(0,1)*30,label=formatTime(dh,dm);if(label!==correct)distractors.add(label);}
  const choices=shuffle([{label:correct,correct:true},...[...distractors].map(l=>({label:l,correct:false}))]);
  return{type:'time_read',kind:'multiple_choice',question:`What time does this clock show?${clockFaceSvg(hour,minute)}`,choices,hint:hintTimeRead(hour,minute)};
}

function eqCompare(){
  const t=rnd(0,3);
  if(t===0){let a=rnd(5,40),b=rnd(5,40);while(a===b)b=rnd(5,40);const correct=a>b?a:b;return{type:'compare',kind:'multiple_choice',question:`Which is greater: ${a} or ${b}?`,choices:shuffle([{label:String(a),correct:a>b},{label:String(b),correct:b>a}]),hint:hintCompareSymbol(a,b,a>b?'>':'<')};}
  if(t===1){const a=rnd(1,50);const b=rnd(0,3)===0?a:rnd(1,50);const sym=a<b?'<':a>b?'>':'=';const choices=shuffle(['<','>','='].map(s=>({label:s,correct:s===sym})));return{type:'compare_symbol',kind:'multiple_choice',question:`${a} ___ ${b}`,choices,hint:hintCompareSymbol(a,b,sym)};}
  if(t===2){const a=rnd(2,15),b=rnd(2,15),sum=a+b;const showFalse=rnd(0,1)===0;let shown=sum;if(showFalse){let g=0;do{shown=sum+(rnd(1,3)*(rnd(0,1)?1:-1));g++;}while((shown===sum||shown<0)&&g<50);}const correct=shown===sum;const choices=[{label:'True',correct:correct},{label:'False',correct:!correct}];return{type:'compare_truefalse',kind:'multiple_choice',question:`${a} + ${b} = ${shown}. True or False?`,choices,hint:hintTrueFalse(a,b,shown,sum),work:{k:'cup',a,b}};}
  const n=rnd(1,10);
  if(rnd(0,1)===0)return{type:'compare_double',kind:'numeric',question:`Double ${n} = ${n} + ${n} = ?`,answer:2*n,hint:hintDouble(n),work:{k:'cup',a:n,b:n}};
  return{type:'compare_double',kind:'numeric',question:`${n} + ${n+1} = ? <br><span style="font-size:.8em;color:${MUT};">(near double!)</span>`,answer:n+(n+1),hint:hintNearDouble(n),work:{k:'cup',a:n,b:n+1}};
}

function eqFractions(){
  const t=rnd(0,1);
  if(t===0){const denom=pick([2,4]),num=rnd(1,denom-1),label=`${num}/${denom}`;const others=shuffle(['1/2','1/4','2/4','3/4'].filter(l=>l!==label)).slice(0,3);return{type:'fractions',kind:'multiple_choice',question:`A shape is split into ${denom} equal pieces. ${num} of them are colored. What fraction is that?`,choices:shuffle([{label,correct:true},...others.map(l=>({label:l,correct:false}))]),hint:hintFraction(denom,num,label)};}
  const parts=rnd(0,1)===0?2:4,shaded=rnd(1,parts-1),targetLabel=`${shaded}/${parts}`;
  const pool=[];[2,4].forEach(p=>{for(let s=1;s<p;s++)pool.push({p,s});});
  const distractors=shuffle(pool.filter(o=>!(o.p===parts&&o.s===shaded))).slice(0,3);
  const options=shuffle([{p:parts,s:shaded,correct:true},...distractors.map(d=>({...d,correct:false}))]);
  const choices=options.map(o=>({label:pieSliceSvg(o.p,o.s),correct:o.correct}));
  return{type:'fraction_identify',kind:'multiple_choice',question:`Which shape has <strong>${targetLabel}</strong> shaded?`,choices,hint:hintFractionPie(parts,shaded,targetLabel)};
}

const ORDINAL_WORDS=['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th'];
const NUMBER_WORDS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
function eqNumberSense(){
  const t=rnd(0,2);
  if(t===0){const step=pick([2,5,10]),start=rnd(0,4)*step,seq=[start,start+step,start+2*step];return{type:'number_sense',question:`Skip count: ${seq.join(', ')}, __?`,answer:start+3*step,hint:wrap(MINT,'🔢','Skip counting',bubble(`Add ${step} each time: ${seq[2]} + ${step} = <strong style="color:${MINT};">${start+3*step}</strong>`))};}
  if(t===1){const n=rnd(1,10);const correct=ORDINAL_WORDS[n-1];const distractors=shuffle(ORDINAL_WORDS.filter(w=>w!==correct)).slice(0,3);const choices=shuffle([{label:correct,correct:true},...distractors.map(l=>({label:l,correct:false}))]);return{type:'ordinal',kind:'multiple_choice',question:`Safia is number ${n} in line. What is her place called?`,choices,hint:hintOrdinal(n,correct)};}
  const n=rnd(1,20),correct=NUMBER_WORDS[n];return{type:'number_word',kind:'numeric',question:`What number is this word? "<strong>${correct}</strong>"`,answer:n,hint:hintNumberWord(correct,n)};
}

function eqDataGraphs(){
  const t=rnd(0,2);
  if(t===0){const a=rnd(6,15),b=rnd(1,a-1);return{type:'data_graphs',question:`A bar graph shows: Cyan bars = ${a}, Coral bars = ${b}. How many more Cyan than Coral?`,answer:a-b,hint:wrap(AMB,'📊','Reading bars',bubble(`${a} − ${b} = <strong style="color:${MINT};">${a-b}</strong>`)),work:{k:'cdown',a,b}};}
  const pool=[{label:'Cars',emoji:'🏎️'},{label:'Flags',emoji:'🏁'},{label:'Trophies',emoji:'🏆'},{label:'Gears',emoji:'⚙️'}];
  let items,g=0;
  do{items=shuffle(pool).slice(0,rnd(3,4)).map(c=>({...c,value:rnd(1,12)}));g++;}while(new Set(items.map(i=>i.value)).size<items.length&&g<50);
  const chart=barChartHtml(items);
  if(t===1){const maxVal=Math.max(...items.map(i=>i.value));const correctItem=items.find(i=>i.value===maxVal);const choices=shuffle(items.map(i=>({label:i.label,correct:i===correctItem})));return{type:'graph_most',kind:'multiple_choice',question:`Which has the MOST?${chart}`,choices,hint:hintGraphMost(correctItem.label,maxVal)};}
  const roll=rnd(0,1);
  if(roll===0){const [a,b]=shuffle(items).slice(0,2);const bigger=a.value>b.value?a:b,smaller=a.value>b.value?b:a;return{type:'graph_diff',kind:'numeric',question:`How many more ${bigger.label} than ${smaller.label}?${chart}`,answer:bigger.value-smaller.value,hint:hintGraphDiff(bigger.label,bigger.value,smaller.label,smaller.value),work:{k:'cdown',a:bigger.value,b:smaller.value}};}
  const total=items.reduce((s,i)=>s+i.value,0);return{type:'graph_total',kind:'numeric',question:`What is the total of all the bars?${chart}`,answer:total,hint:hintGraphTotal(items.map(i=>i.value),total)};
}

const SHAPE_SIDES={circle:0,square:4,rectangle:4,triangle:3,pentagon:5,hexagon:6,octagon:8};
const SHAPE_NAMES={circle:'Circle',square:'Square',rectangle:'Rectangle',triangle:'Triangle',pentagon:'Pentagon',hexagon:'Hexagon',octagon:'Octagon'};
function eqShapes(){
  const shapes=Object.keys(SHAPE_SIDES);
  const t=rnd(0,2);
  if(t===0){const shape=pick(shapes),sides=SHAPE_SIDES[shape];return{type:'shape_sides',kind:'numeric',question:`How many straight sides does this shape have?${shapeSvg(shape)}`,answer:sides,hint:hintShapeSides(shape,sides,SHAPE_NAMES[shape])};}
  if(t===1){const shape=pick(shapes);const distractors=shuffle(shapes.filter(s=>s!==shape)).slice(0,3);const choices=shuffle([{label:SHAPE_NAMES[shape],correct:true},...distractors.map(s=>({label:SHAPE_NAMES[s],correct:false}))]);return{type:'shape_name',kind:'multiple_choice',question:`What shape is this?${shapeSvg(shape)}`,choices,hint:hintShapeName(SHAPE_SIDES[shape])};}
  const n=rnd(3,10);return{type:'length_blocks',kind:'numeric',question:`How many blocks long is this? ${lengthBlocksHtml(n)}`,answer:n,hint:hintLengthBlocks(n)};
}

function eqCalendar(){
  const t=rnd(0,2);
  if(t===0){const i=rnd(0,6),dir=rnd(0,1);const correct=dir===0?DAYS[(i+1)%7]:DAYS[(i+6)%7];const distractors=shuffle(DAYS.filter(d=>d!==correct)).slice(0,3);const choices=shuffle([{label:correct,correct:true},...distractors.map(l=>({label:l,correct:false}))]);
    return{type:'calendar_day',kind:'multiple_choice',question:dir===0?`What day comes AFTER ${DAYS[i]}?`:`What day comes BEFORE ${DAYS[i]}?`,choices,hint:wrap('#FF85C8','📅','Days of the week',bubble(`In order: ${DAYS.join(' → ')} → (back to ${DAYS[0]})`)+bubble(`<strong style="color:${MINT};">${correct}</strong>`))};}
  if(t===1){const i=rnd(0,11),dir=rnd(0,1);const correct=MONTHS[dir===0?(i+1)%12:(i+11)%12];const distractors=shuffle(MONTHS.filter(m=>m!==correct)).slice(0,3);const choices=shuffle([{label:correct,correct:true},...distractors.map(l=>({label:l,correct:false}))]);
    return{type:'calendar_month',kind:'multiple_choice',question:dir===0?`What month comes AFTER ${MONTHS[i]}?`:`What month comes BEFORE ${MONTHS[i]}?`,choices,hint:wrap('#FF85C8','📅','Months of the year',bubble(`In order: ${MONTHS.join(', ')}`)+bubble(`<strong style="color:${MINT};">${correct}</strong>`))};}
  const clue=pick([{clue:'It is snowing and very cold outside.',answer:'Winter'},{clue:'Flowers are blooming and it rains a little.',answer:'Spring'},{clue:'It is hot and everyone goes swimming.',answer:'Summer'},{clue:'Leaves are falling and turning orange.',answer:'Autumn'}]);
  const distractors=shuffle(SEASONS.filter(s=>s!==clue.answer)).slice(0,3);const choices=shuffle([{label:clue.answer,correct:true},...distractors.map(l=>({label:l,correct:false}))]);
  return{type:'calendar_season',kind:'multiple_choice',question:`${clue.clue} Which season is it?`,choices,hint:wrap('#FF85C8','📅','Seasons',bubble(`In order: ${SEASONS.join(' → ')} → (back to ${SEASONS[0]})`)+bubble(`<strong style="color:${MINT};">${clue.answer}</strong>`))};
}
function eqCombo(){const generators=[eqCarryAdd,eqBorrowSub,eqMissingAdd,eqCompare,eqMoney,eqTime];return pick(generators)();}

// ── Word-problem pools (verbatim content, personalized to Safia & Safaan) ──
const N='Safia';
const wordsCounting=[
  {type:'word',question:`${N} has 8 🏎️ toy cars. Dad gives 5 more. How many now?`,answer:13,hint:addColumn(8,5)},
  {type:'word',question:'14 ⚙️ bolts on a shelf. 6 fall off. How many left?',answer:8,hint:subtractColumn(14,6)},
  {type:'word',question:`${N} counted 9 🏎️ cars, then found 4 more in the garage. How many now?`,answer:13,hint:addColumn(9,4)},
  {type:'word',question:`${N} had 17 🏁 flags. He gave 5 to his friend. How many are left?`,answer:12,hint:subtractColumn(17,5)},
  {type:'word',question:'6 🏆 trophies on the shelf and 7 more in the box. How many trophies in total?',answer:13,hint:addColumn(6,7)}
];
const wordsGrouping=[
  {type:'word',question:'3 bundles of 10 🔩 bolts + 4 loose. How many total?',answer:34,hint:wrap(MINT,'📦','Tens and Ones',bubble(`3 tens = <strong>30</strong>, plus 4 ones = <strong>4</strong><br>30 + 4 = <strong style="color:${MINT};">34</strong>`))},
  {type:'word',question:'2 bundles of 10 🏁 flags + 7 loose. How many total?',answer:27,hint:wrap(MINT,'📦','Tens and Ones',bubble(`2 tens = <strong>20</strong>, plus 7 ones = <strong>7</strong><br>20 + 7 = <strong style="color:${MINT};">27</strong>`))},
  {type:'word',question:'46 has how many tens?',answer:4,hint:wrap(MINT,'📦','Tens and Ones',bubble(`46 = <strong>4</strong> tens and <strong>6</strong> ones. The tens digit is <strong style="color:${MINT};">4</strong>`))},
  {type:'word',question:'5 bundles of 10 🏎️ cars + 3 loose. How many total?',answer:53,hint:wrap(MINT,'📦','Tens and Ones',bubble(`5 tens = <strong>50</strong>, plus 3 ones = <strong>3</strong><br>50 + 3 = <strong style="color:${MINT};">53</strong>`))},
  {type:'word',question:'38 has how many ones?',answer:8,hint:wrap(MINT,'📦','Tens and Ones',bubble(`38 = 3 tens and <strong>8</strong> ones. The ones digit is <strong style="color:${MINT};">8</strong>`))}
];
const wordsMissingAdd=[
  {type:'word',question:`${N} has some 🏎️ toy cars. Gets 5 more → now 13. How many did he start with?`,answer:8,hint:hintMissingAddSimple(13,5),work:{k:'cdown',a:13,b:5}},
  {type:'word',question:'? + 9 = 15. What is the missing number?',answer:6,hint:hintMissingAddSimple(15,9),work:{k:'cdown',a:15,b:9}},
  {type:'word',question:'17 − ? = 8. What is the missing number?',answer:9,hint:hintMissingSubSmall(17,8),work:{k:'cdown',a:17,b:8}},
  {type:'word',question:`${N} had some 🏁 flags. He gave away 6 and has 9 left. How many did he start with?`,answer:15,hint:addColumn(6,9),work:{k:'cup',a:6,b:9}},
  {type:'word',question:'5 + ? + 3 = 12. What is the missing number?',answer:4,hint:hintMissingThreeAdd(12,5,3)}
];
const wordsCarryAdd=[
  {type:'word',question:'37 red 🏎️ + 45 blue 🏎️ cars. Total?',answer:82,hint:hintCarryAdd(37,45),work:{k:'add',a:37,b:45}},
  {type:'word',question:'28 gold 🏆 trophies + 34 silver trophies. Total?',answer:62,hint:hintCarryAdd(28,34),work:{k:'add',a:28,b:34}},
  {type:'word',question:'56 ⚙️ gears + 27 more. Total?',answer:83,hint:hintCarryAdd(56,27),work:{k:'add',a:56,b:27}},
  {type:'word',question:`${N} has 49 stickers. He gets 26 more. How many now?`,answer:75,hint:hintCarryAdd(49,26),work:{k:'add',a:49,b:26}},
  {type:'word',question:'17 + 68 = ?',answer:85,hint:hintCarryAdd(17,68),work:{k:'add',a:17,b:68}}
];
const wordsBorrowSub=[
  {type:'word',question:`${N} had 52 🏁 flags. He shared 27. How many left?`,answer:25,hint:hintBorrowSub(52,27),work:{k:'sub',a:52,b:27}},
  {type:'word',question:`63 🏁 flags. ${N} gives away 28. How many left?`,answer:35,hint:hintBorrowSub(63,28),work:{k:'sub',a:63,b:28}},
  {type:'word',question:'81 − 47 = ?',answer:34,hint:hintBorrowSub(81,47),work:{k:'sub',a:81,b:47}},
  {type:'word',question:`${N} had 74 stickers. He used 39 for a project. How many left?`,answer:35,hint:hintBorrowSub(74,39),work:{k:'sub',a:74,b:39}},
  {type:'word',question:'52 − 18 = ?',answer:34,hint:hintBorrowSub(52,18),work:{k:'sub',a:52,b:18}}
];
const wordsAddThree=[
  {type:'word',question:'19 🏎️ + 21 🏁 + 30 🏆 = Total?',answer:70,hint:hintAddThree(19,21,30),work:[{k:'add',a:19,b:21},{k:'add',a:40,b:30}]},
  {type:'word',question:'12 🏎️ + 15 🏁 + 20 🏆 = Total?',answer:47,hint:hintAddThree(12,15,20),work:[{k:'add',a:12,b:15},{k:'add',a:27,b:20}]},
  {type:'word',question:`${N} collects 8 shells, 11 shells, and 14 shells on three days. Total?`,answer:33,hint:hintAddThree(8,11,14),work:[{k:'add',a:8,b:11},{k:'add',a:19,b:14}]},
  {type:'word',question:'25 + 13 + 9 = ?',answer:47,hint:hintAddThree(25,13,9),work:[{k:'add',a:25,b:13},{k:'add',a:38,b:9}]},
  {type:'word',question:`${N} has 17 medals, 6 medals, and 22 medals in three boxes. Total?`,answer:45,hint:hintAddThree(17,6,22),work:[{k:'add',a:17,b:6},{k:'add',a:23,b:22}]}
];
const wordsSubThree=[
  {type:'word',question:'75 🏎️ stickers. Gave away 28 and 19. How many left?',answer:28,hint:hintSubThree(75,28,19),work:[{k:'sub',a:75,b:28},{k:'sub',a:47,b:19}]},
  {type:'word',question:'60 ⚙️ stickers. Gave away 15 and 12. How many left?',answer:33,hint:hintSubThree(60,15,12),work:[{k:'sub',a:60,b:15},{k:'sub',a:45,b:12}]},
  {type:'word',question:'88 − 30 − 25 = ?',answer:33,hint:hintSubThree(88,30,25),work:[{k:'sub',a:88,b:30},{k:'sub',a:58,b:25}]},
  {type:'word',question:`${N} had 50 coins. He spent 14 then 9 more. How many left?`,answer:27,hint:hintSubThree(50,14,9),work:[{k:'sub',a:50,b:14},{k:'sub',a:36,b:9}]},
  {type:'word',question:'72 − 18 − 21 = ?',answer:33,hint:hintSubThree(72,18,21),work:[{k:'sub',a:72,b:18},{k:'sub',a:54,b:21}]}
];
const wordsComposeAdd=[
  {type:'compose_add',kind:'compose_pair',question:'Write two different pairs of 🏎️ cars that add up to <strong>15</strong>.',target:15,hint:hintComposeAdd(15)},
  {type:'compose_add',kind:'compose_pair',question:'Write two different pairs of 🏁 flags that add up to <strong>12</strong>.',target:12,hint:hintComposeAdd(12)},
  {type:'compose_add',kind:'compose_pair',question:'Write two different pairs of 🏆 trophies that add up to <strong>18</strong>.',target:18,hint:hintComposeAdd(18)},
  {type:'compose_add',kind:'compose_pair',question:'Write two different pairs of ⚙️ gears that add up to <strong>10</strong>.',target:10,hint:hintComposeAdd(10)},
  {type:'compose_add',kind:'compose_pair',question:'Write two different pairs of 🔩 bolts that add up to <strong>20</strong>.',target:20,hint:hintComposeAdd(20)}
];
const wordsComposeSub=[
  {type:'compose_sub',kind:'compose_pair',question:'Write two pairs where the big number take away the small number leaves <strong>8</strong>.',target:8,hint:hintComposeSub(8)},
  {type:'compose_sub',kind:'compose_pair',question:'Write two pairs where the big number take away the small number leaves <strong>5</strong>.',target:5,hint:hintComposeSub(5)},
  {type:'compose_sub',kind:'compose_pair',question:'Write two pairs where the big number take away the small number leaves <strong>10</strong>.',target:10,hint:hintComposeSub(10)},
  {type:'compose_sub',kind:'compose_pair',question:'Write two pairs where the big number take away the small number leaves <strong>6</strong>.',target:6,hint:hintComposeSub(6)},
  {type:'compose_sub',kind:'compose_pair',question:'Write two pairs where the big number take away the small number leaves <strong>9</strong>.',target:9,hint:hintComposeSub(9)}
];
const wordsFactFamily=[
  {type:'fact_family',question:'<strong>5</strong>, <strong>7</strong> and <strong>12</strong> are a number family.<br>Rows 1 and 2: make a plus fact. Rows 3 and 4: make a take-away fact.',a:5,b:7,total:12,hint:hintFactFamily(5,7,12)},
  {type:'fact_family',question:'<strong>4</strong>, <strong>9</strong> and <strong>13</strong> are a number family.<br>Rows 1 and 2: make a plus fact. Rows 3 and 4: make a take-away fact.',a:4,b:9,total:13,hint:hintFactFamily(4,9,13)},
  {type:'fact_family',question:'<strong>6</strong>, <strong>8</strong> and <strong>14</strong> are a number family.<br>Rows 1 and 2: make a plus fact. Rows 3 and 4: make a take-away fact.',a:6,b:8,total:14,hint:hintFactFamily(6,8,14)},
  {type:'fact_family',question:'<strong>3</strong>, <strong>10</strong> and <strong>13</strong> are a number family.<br>Rows 1 and 2: make a plus fact. Rows 3 and 4: make a take-away fact.',a:3,b:10,total:13,hint:hintFactFamily(3,10,13)},
  {type:'fact_family',question:'<strong>7</strong>, <strong>6</strong> and <strong>13</strong> are a number family.<br>Rows 1 and 2: make a plus fact. Rows 3 and 4: make a take-away fact.',a:7,b:6,total:13,hint:hintFactFamily(7,6,13)}
];
const wordsLogic=[
  {type:'word',question:'3 red 🏎️ + 2 blue 🏎️. Total cars?',answer:5,hint:addColumn(3,2)},
  {type:'word',kind:'multiple_choice',question:'What comes next?<br>🏁⚙️🏁⚙️ __?',choices:[{label:'🏁',correct:true},{label:'⭐',correct:false},{label:'🔵',correct:false},{label:'🏆',correct:false}],hint:wrap(MINT,'🧠','Patterns',bubble('The pattern repeats: 🏁⚙️🏁⚙️ — next is 🏁!'))},
  {type:'word',kind:'multiple_choice',question:'Which doesn\'t belong?<br>🏎️🏁🏆🐻',choices:[{label:'🐻',correct:true},{label:'🏎️',correct:false},{label:'🏁',correct:false},{label:'🏆',correct:false}],hint:wrap(MINT,'🧠','Odd one out',bubble('🏎️🏁🏆 are all racing things — 🐻 is not!'))},
  {type:'word',question:'What comes next? 3, 6, 9, 12, __?',answer:15,hint:wrap(MINT,'🧠','Number patterns',bubble(`Each number is <strong>3</strong> more: 12 + 3 = <strong style="color:${MINT};">15</strong>`))},
  {type:'word',kind:'multiple_choice',question:`${N} always checks his tires before a race. Tonight he's about to race. What will he do first?`,choices:[{label:'Check his tires',correct:true},{label:'Eat breakfast',correct:false},{label:'Go to school',correct:false}],hint:wrap(MINT,'🧠','Think it through',bubble(`${N} ALWAYS checks his tires before racing — that comes first!`))}
];
const wordsMoney=[
  {type:'word',kind:'numeric',question:`${N} has 2 dimes and 3 pennies. How many cents does he have in total?`,answer:23,hint:hintMoneyCount([10,10,1,1,1])},
  {type:'word',kind:'numeric',question:'A toy car costs 30¢. Safia pays with 1 quarter and 1 nickel. How many cents did she pay?',answer:30,hint:hintMoneyCount([25,5])},
  {type:'word',kind:'numeric',question:'Safia had 50¢ and spent 20¢ on a sticker. How many cents does she have left?',answer:30,hint:wrap(AMB,'🪙','Spending money',bubble(`50 − 20 = <strong style="color:${MINT};">30¢</strong> left!`))},
  {type:'word',kind:'numeric',question:'Safia has 4 nickels. How many cents is that?',answer:20,hint:hintMoneyCount([5,5,5,5])},
  {type:'word',kind:'numeric',question:'A trophy costs 50¢. Safia has 1 quarter and 2 dimes (45¢). How many more cents does she need?',answer:5,hint:wrap(AMB,'🪙','How much more?',bubble(`50 − 45 = <strong style="color:${MINT};">5¢</strong> more!`))}
];
const wordsTime=[
  {type:'word',kind:'numeric',question:"It is 3 o'clock. In 2 hours, what o'clock will it be?",answer:5,hint:hintTime(3,2,5)},
  {type:'word',kind:'numeric',question:"It is 10 o'clock. What o'clock was it 3 hours ago?",answer:7,hint:hintTime(10,-3,7)},
  {type:'word',kind:'numeric',question:"Safia's race starts at 4 o'clock and lasts 1 hour. What o'clock does it end?",answer:5,hint:hintTime(4,1,5)},
  {type:'word',kind:'numeric',question:"Safia wakes up at 7 o'clock. She has breakfast 1 hour later. What o'clock is breakfast?",answer:8,hint:hintTime(7,1,8)},
  {type:'word',kind:'numeric',question:"It is 8 o'clock. In 3 hours it will be pit-stop time. What o'clock is that?",answer:11,hint:hintTime(8,3,11)}
];
const wordsCompare=[
  {type:'word',kind:'numeric',question:'Safia has 12 toy cars. Safaan has 7 toy cars. How many more does Safia have?',answer:5,hint:hintCompareSymbol(12,7,'>')},
  {type:'word',kind:'numeric',question:'There are 9 red cars and 14 blue cars. How many fewer red than blue?',answer:5,hint:hintCompareSymbol(9,14,'<')},
  {type:'word',question:'Double 9 is the same as 9 + 9. What is double 9?',answer:18,hint:hintDouble(9)},
  {type:'word',kind:'multiple_choice',question:'Is 23 greater than 18?',choices:[{label:'Yes',correct:true},{label:'No',correct:false}],hint:hintCompareSymbol(23,18,'>')},
  {type:'word',kind:'multiple_choice',question:'Is 14 greater than 20?',choices:[{label:'Yes',correct:false},{label:'No',correct:true}],hint:hintCompareSymbol(14,20,'<')}
];
const wordsFractions=[
  {type:'word',kind:'multiple_choice',question:'A pizza is cut into 2 equal pieces and Safia eats 1. What fraction did she eat?',choices:[{label:'1/2',correct:true},{label:'1/4',correct:false},{label:'2/4',correct:false},{label:'3/4',correct:false}],hint:hintFraction(2,1,'1/2')},
  {type:'word',kind:'multiple_choice',question:'A pretzel is cut into 4 equal pieces. Safia eats 1 piece. What fraction is left?',choices:[{label:'3/4',correct:true},{label:'1/4',correct:false},{label:'1/2',correct:false},{label:'2/4',correct:false}],hint:hintFraction(4,3,'3/4')},
  {type:'word',kind:'multiple_choice',question:'Which is bigger: 1/2 of a track or 1/4 of the same track?',choices:[{label:'1/2',correct:true},{label:'1/4',correct:false}],hint:wrap(PURP,'🍕','Comparing fractions',bubble('Cutting into fewer, bigger pieces (halves) makes each piece bigger than fourths.')+bubble(`<strong style="color:${MINT};">1/2 is bigger than 1/4</strong>`))},
  {type:'word',kind:'multiple_choice',question:'A chocolate bar is split into 4 equal squares. Safia and 3 friends each take 1 square. What fraction does each person get?',choices:[{label:'1/4',correct:true},{label:'1/2',correct:false},{label:'2/4',correct:false},{label:'4/4',correct:false}],hint:hintFraction(4,1,'1/4')},
  {type:'word',kind:'multiple_choice',question:'Safia colors 3 out of 4 equal boxes. What fraction is colored?',choices:[{label:'3/4',correct:true},{label:'1/4',correct:false},{label:'2/4',correct:false},{label:'4/4',correct:false}],hint:hintFraction(4,3,'3/4')}
];
const wordsNumberSense=[
  {type:'word',kind:'numeric',question:'Count by 10s: 20, 30, 40, __?',answer:50,hint:wrap(MINT,'🔢','Skip counting',bubble(`20 → 30 → 40 → <strong style="color:${MINT};">50</strong>`))},
  {type:'word',kind:'numeric',question:'Count by 2s: 6, 8, 10, __?',answer:12,hint:wrap(MINT,'🔢','Skip counting',bubble(`6 → 8 → 10 → <strong style="color:${MINT};">12</strong>`))},
  {type:'word',kind:'multiple_choice',question:'Safia finished the race in 3rd place. Who finished right before her?',choices:[{label:'2nd place',correct:true},{label:'1st place',correct:false},{label:'4th place',correct:false},{label:'5th place',correct:false}],hint:wrap(CY,'🏅','Ordinal numbers',bubble('2nd comes right before 3rd!'))},
  {type:'word',kind:'numeric',question:'Write the number for "fifteen".',answer:15,hint:wrap(CY,'🔤','Number words',bubble(`"fifteen" = <strong style="color:${MINT};">15</strong>`))},
  {type:'word',kind:'numeric',question:'Safia is 7th in line. Safaan is right behind her. What place is Safaan in?',answer:8,hint:wrap(CY,'🏅','Ordinal numbers',bubble(`Right behind 7th is <strong style="color:${MINT};">8th</strong>!`))}
];
const wordsDataGraphs=[
  {type:'word',kind:'numeric',question:'A tally shows 5 cars and 3 flags. How many items in total?',answer:8,hint:wrap(AMB,'📊','Tally marks',bubble(`5 + 3 = <strong style="color:${MINT};">8</strong>`))},
  {type:'word',kind:'numeric',question:"Safia's pictograph shows 6 trophies and 2 medals. How many more trophies than medals?",answer:4,hint:wrap(AMB,'📊','Reading a pictograph',bubble(`6 − 2 = <strong style="color:${MINT};">4</strong>`))},
  {type:'word',kind:'multiple_choice',question:'A bar graph shows: Red bars = 9, Gold bars = 4. Which color has fewer?',choices:[{label:'Gold',correct:true},{label:'Red',correct:false}],hint:wrap(AMB,'📊','Reading bars',bubble('4 is less than 9, so Gold has fewer.'))},
  {type:'word',kind:'numeric',question:'A table shows Safia drove 3 laps on Monday and 5 laps on Tuesday. How many laps in total?',answer:8,hint:wrap(AMB,'📊','Reading a table',bubble(`3 + 5 = <strong style="color:${MINT};">8</strong>`))},
  {type:'word',kind:'numeric',question:'A picture graph shows 7 red cars and 2 blue cars. How many more red than blue?',answer:5,hint:wrap(AMB,'📊','Comparing rows',bubble(`7 − 2 = <strong style="color:${MINT};">5</strong>`))}
];
const wordsShapes=[
  {type:'word',kind:'numeric',question:'A square has how many corners?',answer:4,hint:wrap(PURP,'🔺','Corners',bubble(`A square has 4 straight sides and <strong style="color:${MINT};">4</strong> corners.`))},
  {type:'word',kind:'multiple_choice',question:'Which shape has 3 sides?',choices:[{label:'Triangle',correct:true},{label:'Square',correct:false},{label:'Hexagon',correct:false},{label:'Circle',correct:false}],hint:wrap(PURP,'🔺','Shapes',bubble(`A triangle has <strong style="color:${MINT};">3</strong> sides.`))},
  {type:'word',kind:'numeric',question:"Safia's track piece is 9 blocks long. Safaan's is 6 blocks long. How much longer is Safia's?",answer:3,hint:wrap(PURP,'📏','Comparing lengths',bubble(`9 − 6 = <strong style="color:${MINT};">3</strong>`))},
  {type:'word',kind:'multiple_choice',question:'Which shape has NO straight sides?',choices:[{label:'Circle',correct:true},{label:'Square',correct:false},{label:'Triangle',correct:false},{label:'Pentagon',correct:false}],hint:wrap(PURP,'🔺','Circles',bubble('A circle is round all the way around — no straight sides.'))},
  {type:'word',kind:'numeric',question:'A toy train is 7 cubes long. It grows 2 more cubes. How long is it now?',answer:9,hint:wrap(PURP,'📏','Measuring',bubble(`7 + 2 = <strong style="color:${MINT};">9</strong>`))}
];
const wordsCalendar=[
  {type:'word',kind:'multiple_choice',question:'How many days are in a week?',choices:[{label:'7',correct:true},{label:'5',correct:false},{label:'10',correct:false},{label:'12',correct:false}],hint:wrap('#FF85C8','📅','Weeks',bubble(`A week has <strong style="color:${MINT};">7</strong> days.`))},
  {type:'word',kind:'multiple_choice',question:'How many months are in a year?',choices:[{label:'12',correct:true},{label:'7',correct:false},{label:'10',correct:false},{label:'4',correct:false}],hint:wrap('#FF85C8','📅','Months',bubble(`A year has <strong style="color:${MINT};">12</strong> months.`))},
  {type:'word',kind:'multiple_choice',question:'How many seasons are there in a year?',choices:[{label:'4',correct:true},{label:'2',correct:false},{label:'7',correct:false},{label:'12',correct:false}],hint:wrap('#FF85C8','📅','Seasons',bubble('There are 4 seasons: Spring, Summer, Autumn, Winter.'))},
  {type:'word',kind:'multiple_choice',question:'Which day comes right after Friday?',choices:[{label:'Saturday',correct:true},{label:'Sunday',correct:false},{label:'Monday',correct:false},{label:'Thursday',correct:false}],hint:wrap('#FF85C8','📅','Days',bubble('Friday → Saturday!'))},
  {type:'word',kind:'multiple_choice',question:'Which month comes right after December?',choices:[{label:'January',correct:true},{label:'November',correct:false},{label:'February',correct:false},{label:'March',correct:false}],hint:wrap('#FF85C8','📅','Months',bubble('After December, the year starts over with January.'))}
];
const wordsCombo=[
  {type:'word',kind:'numeric',question:'Safia has 15 stickers. Safaan has 9. How many MORE does Safia have?',answer:6,hint:hintCompareSymbol(15,9,'>'),work:{k:'cdown',a:15,b:9}},
  {type:'word',kind:'numeric',question:'There are 8 red cars and 13 green cars. How many FEWER red cars are there?',answer:5,hint:hintCompareSymbol(8,13,'<'),work:{k:'cdown',a:13,b:8}},
  {type:'word',kind:'numeric',question:'Safia had 6 trophies. She won 7 more at the race. How many now?',answer:13,hint:addColumn(6,7),work:{k:'cup',a:6,b:7}},
  {type:'word',kind:'numeric',question:'Safia had 9 flags. After giving some to Safaan, she has 4 left. How many did she give away?',answer:5,hint:hintMissingSubSmall(9,4),work:{k:'cdown',a:9,b:4}},
  {type:'word',kind:'numeric',question:'Safia had some toy cars. She got 5 more and now has 12. How many did she start with?',answer:7,hint:hintMissingAddSimple(12,5),work:{k:'cdown',a:12,b:5}},
  {type:'word',kind:'numeric',question:'Safia wants to put 10 flags into two pit stops with a different amount in each. If one gets 4, how many go in the other?',answer:6,hint:hintMissingAddSimple(10,4),work:{k:'cdown',a:10,b:4}},
  {type:'word',kind:'numeric',question:'Safia drove 14 laps. Her goal was 20 laps. How many more laps does she need?',answer:6,hint:hintMissingAddSimple(20,14),work:{k:'cdown',a:20,b:14}},
  {type:'word',kind:'numeric',question:'A trophy has 45¢ of value. Safia has 3 dimes and 1 nickel (35¢). How many more cents does she need?',answer:10,hint:hintMissingAddSimple(45,35),work:{k:'cdown',a:45,b:35}}
];

function buildLevel(eqFn,pool){
  const eqs=[];let g=0;
  while(eqs.length<10&&g++<500){const p=eqFn();if(p)eqs.push(p);}
  const words=shuffle(pool).slice(0,5);
  return[...eqs.slice(0,7).map(p=>({...p,category:'equation',hasHint:true})),
         ...eqs.slice(7,10).map(p=>({...p,category:'equation',hasHint:false})),
         ...words.slice(0,2).map(p=>({...p,category:'word',hasHint:true})),
         ...words.slice(2,5).map(p=>({...p,category:'word',hasHint:false}))];
}

const LEVELS=[
  {id:'counting',    name:'Counting',       icon:'🏁'},
  {id:'grouping',    name:'Tens & Ones',    icon:'📦'},
  {id:'missing_add', name:'Missing Number', icon:'❓'},
  {id:'carry_add',   name:'Carry Addition', icon:'➕'},
  {id:'borrow_sub',  name:'Borrow Sub',     icon:'➖'},
  {id:'add_three',   name:'Add Three',      icon:'🔧'},
  {id:'sub_three',   name:'Subtract Three', icon:'🛠️'},
  {id:'compose_add', name:'Make a Sum',     icon:'💎'},
  {id:'compose_sub', name:'Find the Gap',   icon:'🦋'},
  {id:'fact_family', name:'Fact Family',    icon:'🏰'},
  {id:'logic',       name:'Logic Puzzles',  icon:'🧠'},
  {id:'money',       name:'Pit Stop Coins', icon:'🪙'},
  {id:'time',        name:'Clock Tower',    icon:'⏰'},
  {id:'compare_numbers', name:'Compare & Double', icon:'⚖️'},
  {id:'fractions',   name:'Fraction Track', icon:'🍕'},
  {id:'number_sense', name:'Number Ninjas', icon:'🔢'},
  {id:'data_graphs', name:'Graph Garage',   icon:'📊'},
  {id:'shapes_measurement', name:'Shape Safari', icon:'🔺'},
  {id:'calendar',    name:'Race Calendar',  icon:'📅'},
  {id:'combo',       name:'Grand Finale',   icon:'🏆'}
];

// Two racers share this app; each is scoped to its own slice of LEVELS (index
// range, not level ids — `from`/`to` are LEVELS.slice() bounds) and its own
// SOAR age band. The ranges deliberately overlap (levels 3-7): both kids can
// use the shared middle levels as review/stretch, while the outer edges
// (counting/tens&ones/missing-number for the younger; compose_sub-through-
// combo for the older) are exclusive to one racer. Ages/ranges confirmed with
// the customer per the redesign handoff.
const RACERS={
  safia:{id:'safia',name:'Safia',initial:'S',age:6,color:'var(--color-primary)',from:0,to:8,band:'3-5'},
  safaan:{id:'safaan',name:'Safaan',initial:'S',age:9,color:'var(--color-accent)',from:3,to:20,band:'7-11'},
};
const DEFAULT_RACER='safia';

const LEVEL_VIDEOS={
  counting:{url:'https://www.youtube.com/results?search_query=jack+hartmann+count+to+20+kids',title:'Count to 20 – Jack Hartmann'},
  grouping:{url:'https://www.youtube.com/results?search_query=tens+and+ones+place+value+song+kids',title:'Tens & Ones Place Value Song'},
  missing_add:{url:'https://www.youtube.com/results?search_query=missing+number+addition+kids+math',title:'Finding the Missing Number'},
  carry_add:{url:'https://www.youtube.com/results?search_query=addition+with+regrouping+song+numberock',title:'Addition with Regrouping'},
  borrow_sub:{url:'https://www.youtube.com/results?search_query=subtraction+with+regrouping+borrowing+song+kids',title:'Subtraction with Borrowing'},
  add_three:{url:'https://www.youtube.com/results?search_query=adding+three+numbers+kids+math+song',title:'Adding Three Numbers'},
  sub_three:{url:'https://www.youtube.com/results?search_query=subtracting+two+digit+numbers+kids+math',title:'Subtracting Step by Step'},
  compose_add:{url:'https://www.youtube.com/results?search_query=number+bonds+ways+to+make+a+number+kids',title:'Number Bonds Song'},
  compose_sub:{url:'https://www.youtube.com/results?search_query=number+bonds+subtraction+kids+math+song',title:'Number Bonds & Differences'},
  fact_family:{url:'https://www.youtube.com/results?search_query=fact+family+song+kids+math',title:'Fact Families Song'},
  logic:{url:'https://www.youtube.com/results?search_query=patterns+for+kids+math+logic+song',title:'Patterns & Logic for Kids'},
  money:{url:'https://www.youtube.com/results?search_query=counting+coins+money+kids+math+song',title:'Counting Coins Song'},
  time:{url:'https://www.youtube.com/results?search_query=telling+time+hour+half+hour+kids+song',title:'Telling Time Song'},
  compare_numbers:{url:'https://www.youtube.com/results?search_query=comparing+numbers+greater+less+than+kids+song',title:'Greater Than, Less Than Song'},
  fractions:{url:'https://www.youtube.com/results?search_query=halves+fourths+fractions+kids+song',title:'Halves & Fourths Song'},
  number_sense:{url:'https://www.youtube.com/results?search_query=skip+counting+by+2+5+10+kids+song',title:'Skip Counting Song'},
  data_graphs:{url:'https://www.youtube.com/results?search_query=bar+graphs+picture+graphs+kids+math',title:'Reading Graphs for Kids'},
  shapes_measurement:{url:'https://www.youtube.com/results?search_query=2d+shapes+sides+corners+kids+song',title:'Shapes & Measuring Song'},
  calendar:{url:'https://www.youtube.com/results?search_query=days+of+the+week+months+seasons+kids+song',title:'Days, Months & Seasons Song'},
  combo:{url:'https://www.youtube.com/results?search_query=mixed+math+practice+kids+addition+subtraction',title:'Mixed Maths Practice'}
};

const TROPHIES=[
  {id:'first_correct', icon:'🏁', name:'First Lap',        check:(sc)=>sc>=1},
  {id:'five_stars',    icon:'⭐', name:'Rising Star',       check:(sc)=>sc>=5},
  {id:'ten_stars',     icon:'🥇', name:'Track Champion',    check:(sc)=>sc>=10},
  {id:'twenty_stars',  icon:'🏆', name:'Grand Champion',    check:(sc)=>sc>=20},
  {id:'counting',      icon:'🔢', name:'Count Champion',    check:(sc,p)=>p.counting?.completed},
  {id:'carry',         icon:'➕', name:'Carry Master',      check:(sc,p)=>p.carry_add?.completed},
  {id:'borrow',        icon:'➖', name:'Borrow Fighter',    check:(sc,p)=>p.borrow_sub?.completed},
  {id:'logic',         icon:'🧠', name:'Logic Genius',      check:(sc,p)=>p.logic?.completed},
  {id:'money',         icon:'🪙', name:'Coin Collector',    check:(sc,p)=>p.money?.completed},
  {id:'time',          icon:'⏰', name:'Clock Master',      check:(sc,p)=>p.time?.completed},
  {id:'fractions',     icon:'🍕', name:'Fraction Star',     check:(sc,p)=>p.fractions?.completed},
  {id:'calendar',      icon:'📅', name:'Calendar Whiz',     check:(sc,p)=>p.calendar?.completed},
  {id:'half_levels',   icon:'🥈', name:'Halfway Hero',      check:(sc,p)=>Object.values(p).filter(v=>v?.completed).length>=10},
  {id:'all_levels',    icon:'👑', name:'Full Circuit',      check:(sc,p)=>Object.values(p).filter(v=>v?.completed).length>=20},
  {id:'perfect',       icon:'💎', name:'Diamond Lap',       check:(sc,p)=>Object.values(p).some(v=>v?.score>=100)},
  {id:'streak',        icon:'🔥', name:'Streak Champion',   check:(sc)=>sc>=3},
];

const BADGES_DEF=[
  {key:'counting',icon:'🏁',name:'Counting Racer',check:p=>p.counting?.completed},
  {key:'addition',icon:'➕',name:'Addition Champion',check:p=>p.missing_add?.completed&&p.add_three?.completed},
  {key:'subtraction',icon:'➖',name:'Subtraction Star',check:p=>p.borrow_sub?.completed&&p.sub_three?.completed},
  {key:'borrow',icon:'🛠️',name:'Borrowing Fighter',check:p=>(p.borrow_sub?.score||0)>=90},
  {key:'carry',icon:'🔧',name:'Carrying Master',check:p=>(p.carry_add?.score||0)>=90},
  {key:'logic',icon:'🧠',name:'Logic Master',check:p=>p.logic?.completed},
  {key:'moneyFractions',icon:'🪙',name:'Money & Fractions Star',check:p=>p.money?.completed&&p.fractions?.completed},
  {key:'timeCalendar',icon:'⏰',name:'Time & Calendar Champ',check:p=>p.time?.completed&&p.calendar?.completed},
  {key:'dataShapes',icon:'📊',name:'Data & Shapes Explorer',check:p=>p.data_graphs?.completed&&p.shapes_measurement?.completed},
  {key:'wordWizard',icon:'🏆',name:'Word Problem Wizard',check:p=>p.combo?.completed}
];

function generateLevel(id){
  const map={counting:{eqFn:eqCounting,pool:wordsCounting},grouping:{eqFn:eqGrouping,pool:wordsGrouping},missing_add:{eqFn:eqMissingAdd,pool:wordsMissingAdd},carry_add:{eqFn:eqCarryAdd,pool:wordsCarryAdd},borrow_sub:{eqFn:eqBorrowSub,pool:wordsBorrowSub},add_three:{eqFn:eqAddThree,pool:wordsAddThree},sub_three:{eqFn:eqSubThree,pool:wordsSubThree},compose_add:{eqFn:eqComposeAdd,pool:wordsComposeAdd},compose_sub:{eqFn:eqComposeSub,pool:wordsComposeSub},fact_family:{eqFn:eqFactFamily,pool:wordsFactFamily},logic:{eqFn:eqLogic,pool:wordsLogic},money:{eqFn:eqMoney,pool:wordsMoney},time:{eqFn:eqTime,pool:wordsTime},compare_numbers:{eqFn:eqCompare,pool:wordsCompare},fractions:{eqFn:eqFractions,pool:wordsFractions},number_sense:{eqFn:eqNumberSense,pool:wordsNumberSense},data_graphs:{eqFn:eqDataGraphs,pool:wordsDataGraphs},shapes_measurement:{eqFn:eqShapes,pool:wordsShapes},calendar:{eqFn:eqCalendar,pool:wordsCalendar},combo:{eqFn:eqCombo,pool:wordsCombo}};
  const d=map[id];return d?buildLevel(d.eqFn,d.pool):[];
}

const KIND_BY_TYPE={fact_family:'fact_family',compose_add:'compose_pair',compose_sub:'compose_pair',money:'coin_picker',compare:'multiple_choice',fractions:'multiple_choice',calendar_day:'multiple_choice',calendar_month:'multiple_choice',calendar_season:'multiple_choice'};
function kindOf(q){return q.kind||KIND_BY_TYPE[q.type]||'numeric';}
function friendlyAnswer(q){
  if(q.type==='compose_add')return'e.g. 7+8 and 6+9';
  if(q.type==='compose_sub')return'e.g. 12−4 and 13−5';
  if(q.type==='fact_family')return`${q.a}+${q.b}=${q.total}, ${q.b}+${q.a}=${q.total}, ${q.total}−${q.a}=${q.b}, ${q.total}−${q.b}=${q.a}`;
  return String(q.answer);
}
const TYPE_LABELS={counting_objects:'Counting',counting_add:'Counting',counting_sub:'Counting',grouping:'Tens & Ones',missing_add:'Missing',carry_add:'Carry',borrow_sub:'Borrow',add_three:'Add Three',sub_three:'Sub Three',compose_add:'Make a Sum',compose_sub:'Find the Gap',fact_family:'Fact Family',logic:'Logic',word:'Word Problem',money:'Money',money_count:'Money',money_make:'Money',money_equiv:'Money',time:'Clock',time_read:'Clock',compare:'Compare',compare_symbol:'Compare',compare_truefalse:'Compare',compare_double:'Compare',fractions:'Fractions',fraction_identify:'Fractions',number_sense:'Number Sense',skip_count:'Number Sense',ordinal:'Number Sense',number_word:'Number Sense',data_graphs:'Graphs',graph_most:'Graphs',graph_diff:'Graphs',graph_total:'Graphs',shapes:'Shapes',shape_sides:'Shapes',shape_name:'Shapes',length_blocks:'Shapes',calendar_day:'Calendar',calendar_month:'Calendar',calendar_season:'Calendar'};

// ── SOAR activities (56, verbatim content, personalized) ─────
const SOAR_VIDEOS_BY_ID={
  beatClock:{url:'https://www.youtube.com/results?search_query=counting+fast+kids+how+many+timer',title:'Counting – Beat the Clock'},
  canYouBuild:{url:'https://www.youtube.com/results?search_query=3d+shapes+building+blocks+kids',title:'3D Shapes & Building'},
  howLongAreYou:{url:'https://www.youtube.com/results?search_query=measuring+length+kids+non+standard+units',title:'Measuring Length for Kids'},
  makingFootprints:{url:'https://www.youtube.com/results?search_query=3d+shapes+faces+edges+vertices+kids',title:'3D Shapes – Faces & Edges'},
  longCreatures:{url:'https://www.youtube.com/results?search_query=comparing+lengths+longer+shorter+kids',title:'Comparing Lengths'},
  packing:{url:'https://www.youtube.com/results?search_query=sorting+and+classifying+objects+kids+math',title:'Sorting & Classifying'},
  tubesTunnels:{url:'https://www.youtube.com/results?search_query=size+length+big+small+kids+learning',title:'Length & Size Concepts'},
  dice:{url:'https://www.youtube.com/results?search_query=counting+dice+numbers+kids+song',title:'Counting with Dice'},
  mudKitchen:{url:'https://www.youtube.com/results?search_query=capacity+full+empty+kids+math+learning',title:'Capacity & Measurement'},
  patternMaking:{url:'https://www.youtube.com/results?search_query=patterns+for+kids+abab+repeating+pattern+song',title:'Pattern Making Song'},
  cooking:{url:'https://www.youtube.com/results?search_query=counting+cooking+with+kids+math+recipe',title:'Counting in Cooking'},
  numberBook:{url:'https://www.youtube.com/results?search_query=counting+numbers+1+to+10+kids+song',title:'Numbers & Counting Song'},
  smallWorld:{url:'https://www.youtube.com/results?search_query=sorting+animals+positional+language+kids',title:'Sorting & Position Words'},
  shutTheBox:{url:'https://www.youtube.com/results?search_query=shut+the+box+game+kids+dice+math',title:'Shut the Box'},
  strikeItOut:{url:'https://www.youtube.com/results?search_query=strike+it+out+number+line+addition+subtraction+kids',title:'Strike It Out'},
  seeingSquares:{url:'https://www.youtube.com/results?search_query=seeing+squares+dots+grid+game+kids',title:'Seeing Squares'},
  boardBlock:{url:'https://www.youtube.com/results?search_query=triangles+pegboard+shapes+game+kids',title:'Board Block'},
  sameLengthTrains:{url:'https://www.youtube.com/results?search_query=cuisenaire+rods+same+length+trains+kids',title:'Same Length Trains'},
  sortTheStreet:{url:'https://www.youtube.com/results?search_query=sort+classify+houses+properties+kids+math',title:'Sort the Street'},
  hundredSquareJigsaw:{url:'https://www.youtube.com/results?search_query=100+square+number+grid+jigsaw+kids',title:'100 Square Jigsaw'},
  polyPlugRectangles:{url:'https://www.youtube.com/results?search_query=rectangles+arrays+multiplication+kids+math',title:'Poly Plug Rectangles'},
  matchingNumbers:{url:'https://www.youtube.com/results?search_query=number+matching+pairs+memory+game+kids',title:'Matching Numbers'},
  tablesTeaser:{url:'https://www.youtube.com/results?search_query=multiplication+square+times+table+kids',title:'Tables Teaser'},
  stopTheClock:{url:'https://www.youtube.com/results?search_query=stop+the+clock+telling+time+kids+game',title:'Stop the Clock'},
  fourTriangles:{url:'https://www.youtube.com/results?search_query=four+triangles+shapes+puzzle+kids',title:'Four Triangles'},
  oneBigTriangle:{url:'https://www.youtube.com/results?search_query=number+bonds+add+to+ten+puzzle+kids',title:'One Big Triangle'},
  cuisenaireCounting:{url:'https://www.youtube.com/results?search_query=cuisenaire+rods+counting+combinations+kids',title:'Cuisenaire Counting'},
  alwaysSometimesNever:{url:'https://www.youtube.com/results?search_query=always+sometimes+never+math+statements+kids',title:'Always Sometimes or Never?'},
  inceyWincey:{url:'https://www.youtube.com/results?search_query=incey+wincey+spider+number+line+game+kids',title:'Incey Wincey Spider'},
  butterflyFlowers:{url:'https://www.youtube.com/results?search_query=butterfly+number+bonds+addition+kids+activity',title:'Butterfly Flowers'},
  robotMonsters:{url:'https://www.youtube.com/results?search_query=measuring+height+adding+numbers+kids+math',title:'Robot Monsters'},
  guessTheHouses:{url:'https://www.youtube.com/results?search_query=guess+the+rule+sorting+game+kids+logic',title:'Guess the Houses'},
  totality:{url:'https://youtu.be/Gvb10ahRRB0',title:'Totality (Video)'},
  wallpaper:{url:'https://www.youtube.com/results?search_query=ordering+area+size+smallest+largest+kids',title:'Wallpaper'},
  nim7:{url:'https://youtu.be/A86TGIdPeO8',title:'Nim-7 (Video)'},
  breakItUp:{url:'https://www.youtube.com/results?search_query=interlocking+cubes+breaking+splitting+patterns+kids',title:'Break It Up!'},
  enCounters:{url:'https://www.youtube.com/results?search_query=describing+position+colour+counting+game+kids',title:'En-Counters'},
  paperPatchwork:{url:'https://www.youtube.com/results?search_query=paper+folding+shapes+patterns+kids+origami',title:'Paper Patchwork'},
  eightnessOfEight:{url:'https://youtu.be/FX4me1Ffrn0',title:'Eightness of Eight (Video)'},
  ladybirdBox:{url:'https://www.youtube.com/results?search_query=ladybird+grid+puzzle+rows+columns+kids',title:'Ladybird Box'},
  niceOrNasty:{url:'https://www.youtube.com/results?search_query=nice+nasty+dice+place+value+game+kids',title:'Nice or Nasty'},
  factorsMultiples:{url:'https://www.youtube.com/results?search_query=factors+multiples+game+math+kids',title:'Factors and Multiples'},
  trainTactics:{url:'https://www.youtube.com/results?search_query=train+number+line+strategy+game+kids',title:'Train Tactics'},
  dottySix:{url:'https://www.youtube.com/results?search_query=dotty+six+dice+addition+game+kids',title:'Dotty Six'},
  diceyOperations:{url:'https://www.youtube.com/results?search_query=dicey+operations+addition+subtraction+strategy+kids',title:'Dicey Operations'},
  fourGo:{url:'https://www.youtube.com/results?search_query=four+go+multiplication+number+line+game',title:'Four Go'},
  firstConnectThree:{url:'https://www.youtube.com/results?search_query=connect+three+coordinates+game+kids+math',title:'First Connect Three'},
  whatShape:{url:'https://www.youtube.com/results?search_query=guess+my+shape+properties+kids+math',title:'What Shape?'},
  guessDominoes:{url:'https://www.youtube.com/results?search_query=dominoes+game+kids+number+matching',title:'Guess Dominoes'},
  spirallingDecimals:{url:'https://www.youtube.com/results?search_query=decimals+number+line+kids+math',title:'Spiralling Decimals'},
  gotIt:{url:'https://youtu.be/WXSr9_WPZ0o',title:'Got It (Video)'},
  boardBlockChallenge:{url:'https://www.youtube.com/results?search_query=board+block+challenge+triangles+quadrilaterals+game',title:'Board Block Challenge'},
  makingSticks:{url:'https://www.youtube.com/results?search_query=making+sticks+cuisenaire+triangle+math',title:'Making Sticks'},
  doughnutPercents:{url:'https://www.youtube.com/results?search_query=percentages+fractions+decimals+kids+circle',title:'Doughnut Percents'},
  lessMore:{url:'https://www.youtube.com/results?search_query=greater+less+than+comparing+numbers+kids',title:'Less or More'},
  play37:{url:'https://www.youtube.com/results?search_query=addition+subtraction+strategy+game+kids+37',title:'Play 37'}
};
const NRICH_LINKS_BY_ID={
  beatClock:'https://nrich.maths.org/eyfs-activities/beat-clock',canYouBuild:'https://nrich.maths.org/eyfs-activities/can-you-build',howLongAreYou:'https://nrich.maths.org/eyfs-activities/how-long-are-you',makingFootprints:'https://nrich.maths.org/eyfs-activities/making-footprints',longCreatures:'https://nrich.maths.org/eyfs-activities/long-creatures',packing:'https://nrich.maths.org/eyfs-activities/packing',tubesTunnels:'https://nrich.maths.org/eyfs-activities/tubes-and-tunnels',dice:'https://nrich.maths.org/eyfs-activities/dice',mudKitchen:'https://nrich.maths.org/eyfs-activities/mud-kitchen',patternMaking:'https://nrich.maths.org/eyfs-activities/pattern-making',cooking:'https://nrich.maths.org/eyfs-activities/cooking-children',numberBook:'https://nrich.maths.org/eyfs-activities/number-book',smallWorld:'https://nrich.maths.org/eyfs-activities/small-world-play',shutTheBox:'https://nrich.maths.org/games/shut-the-box-two',strikeItOut:'https://nrich.maths.org/games/strike-it-out-two',seeingSquares:'https://nrich.maths.org/games/seeing-squares-two',boardBlock:'https://nrich.maths.org/games/board-block-two',sameLengthTrains:'https://nrich.maths.org/problems/same-length-trains',sortTheStreet:'https://nrich.maths.org/problems/sort-the-street',hundredSquareJigsaw:'https://nrich.maths.org/problems/100-square-jigsaw',polyPlugRectangles:'https://nrich.maths.org/problems/poly-plug-rectangles',matchingNumbers:'https://nrich.maths.org/games/matching-numbers-two',tablesTeaser:'https://nrich.maths.org/problems/tables-teaser',stopTheClock:'https://nrich.maths.org/games/stop-the-clock-two',fourTriangles:'https://nrich.maths.org/problems/four-triangles-puzzle',oneBigTriangle:'https://nrich.maths.org/problems/one-big-triangle',cuisenaireCounting:'https://nrich.maths.org/problems/cuisenaire-counting',alwaysSometimesNever:'https://nrich.maths.org/problems/always-sometimes-or-never-ks1',inceyWincey:'https://nrich.maths.org/games/incey-wincey-spider-two',butterflyFlowers:'https://nrich.maths.org/problems/butterfly-flowers',robotMonsters:'https://nrich.maths.org/problems/robot-monsters',guessTheHouses:'https://nrich.maths.org/games/guess-the-houses-two',totality:'https://nrich.maths.org/games/totality-two',wallpaper:'https://nrich.maths.org/problems/wallpaper',nim7:'https://nrich.maths.org/games/nim-7-two',breakItUp:'https://nrich.maths.org/problems/break-it-up',enCounters:'https://nrich.maths.org/games/en-counters-two',paperPatchwork:'https://nrich.maths.org/problems/paper-patchwork-1',eightnessOfEight:'https://nrich.maths.org/problems/eightness-of-eight',ladybirdBox:'https://nrich.maths.org/problems/ladybird-box',niceOrNasty:'https://nrich.maths.org/games/nice-or-nasty-two',factorsMultiples:'https://nrich.maths.org/games/factors-and-multiples-game-two',trainTactics:'https://nrich.maths.org/games/train-tactics-two',dottySix:'https://nrich.maths.org/games/dotty-six-two',diceyOperations:'https://nrich.maths.org/games/dicey-operations-line-two',fourGo:'https://nrich.maths.org/games/four-go-two',firstConnectThree:'https://nrich.maths.org/games/first-connect-three-two',whatShape:'https://nrich.maths.org/problems/what-shape-two',guessDominoes:'https://nrich.maths.org/problems/guess-dominoes-two',spirallingDecimals:'https://nrich.maths.org/problems/spiralling-decimals-two',gotIt:'https://nrich.maths.org/games/got-it-two',boardBlockChallenge:'https://nrich.maths.org/problems/board-block-challenge-two',makingSticks:'https://nrich.maths.org/problems/making-sticks',doughnutPercents:'https://nrich.maths.org/problems/doughnut-percents',lessMore:'https://nrich.maths.org/problems/less-more',play37:'https://nrich.maths.org/problems/play-37'
};
const SOAR_ACTIVITIES=[
{id:'beatClock',icon:'⏰🏁',title:'Beat the Clock',age:'3-5',desc:'How many jumps in one minute?',aim:'Compare quantities and talk about time',instructions:['Set a timer for 1 minute.','Do star jumps, hops, or write your name as many times as you can!','Count how many you did.','Try again – can you do more?'],illustration:'🕐⭐ ➔ 🏃 1️⃣2️⃣3️⃣',hint:'Quick actions = lots more! Slow actions = fewer.',questions:['What can you do more of in a minute – star jumps or hops?','Can you put on your helmet in under a minute?']},
{id:'canYouBuild',icon:'🏗️🔧',title:'Can You Build This?',age:'3-5',desc:'Copy a model with blocks',aim:'Explore shapes and positions',instructions:['An adult builds a simple model with 4-5 blocks.','Look closely! Can you make yours exactly the same?','Use the same pieces in the same place.','Check – is your model the same?'],illustration:'🟦🟥 ➔ 🏎️ (copy the car!)',hint:'Look at where each block goes – on top, next to, behind.',questions:['Which block is on top? Which is underneath?','How do you turn that brick to match?']},
{id:'howLongAreYou',icon:'📏🏁',title:'How Long Are You?',age:'3-5',desc:'Measure yourself with everyday things',aim:'Compare length using non-standard units',instructions:['Lie down and have an adult mark your head and feet.','Measure with pencils or crayons – end to end, no gaps!','Count how many you are tall.','Try with LEGO bricks or toy cars!'],illustration:'🧍 ➔ 🖍️🖍️🖍️🖍️ (20 crayons tall!)',hint:'If things are shorter, you need more of them.',questions:['How many LEGO bricks tall are you?','Are you taller than the toy garage?']},
{id:'makingFootprints',icon:'🦶⚙️',title:'Making Footprints',age:'3-5',desc:'Press shapes into soft dough',aim:'Explore faces of 3D shapes',instructions:['Get some soft dough or playdough.','Press different blocks into it to make "footprints".','Run your finger around the edge.','Can you find another block with the same footprint?'],illustration:'🧊🔺 ➔ ⏺️⏸️ (cube makes a square!)',hint:'The flat side of the block makes the print.',questions:['What shape is the footprint of a cube? A sphere?','Can you guess which block made each footprint?']},
{id:'longCreatures',icon:'🐛🏁',title:'Long Creatures',age:'3-5',desc:'Make worms, snakes, caterpillars',aim:'Compare lengths',instructions:['Use thin card, playdough, or linking cubes.','Make a long creature – a snake or caterpillar!','Now make another – longer or shorter?','Compare with a friend\'s creature.'],illustration:'🐍📏 ➔ longer · shorter · longest',hint:'Fold paper like an accordion to make it stretch!',questions:['How can you make it longer? Shorter?','Whose creature is the longest? How do you know?']},
{id:'packing',icon:'📦🏎️',title:'Packing',age:'3-5',desc:'Sort toys into boxes',aim:'Sort and classify',instructions:['Get some boxes or trays.','Choose toys – cars, trucks, or blocks!','Put them into boxes by type.','How many in each box? Which has most?'],illustration:'🏎️🏎️ | 🚚🚛 | 🔧🔧 (sorted!)',hint:'Look for things that are the same kind.',questions:['Are there more cars or trucks?','Could you sort them by colour instead?']},
{id:'tubesTunnels',icon:'🧻🏁',title:'Tubes and Tunnels',age:'3-5',desc:'Play with cardboard tubes',aim:'Explore size, length, position',instructions:['Find different tubes – paper towel rolls, wrapping paper tubes.','Roll them? Blow through them?','Make a tunnel for toy cars!','Can you stack them? Make a telescope?'],illustration:'📦🧻🏎️ (car goes through tunnel!)',hint:'Wider tubes let bigger things through.',questions:['Which tube is longest? Widest?','Can you make a tunnel that turns a corner?']},
{id:'dice',icon:'🎲🏆',title:'Dice',age:'3-5',desc:'Roll and count',aim:'Match numerals to amounts',instructions:['Get a big dice and some toys (cars or trucks!).','Roll the dice. Count the dots.','Take that many toys!','Roll again – more or fewer?'],illustration:'🎲⚀ ➔ 🏎️🏎️🏎️ (3 cars)',hint:'The dots tell you how many. Count carefully!',questions:['What number did you roll? Can you write it?','Have you got enough cars for a race?']},
{id:'mudKitchen',icon:'🍲⚙️',title:'Mud Kitchen',age:'3-5',desc:'Cook with mud and water',aim:'Explore size, capacity, weight',instructions:['Get pots, pans, spoons, and mud (or sand or water).','Make mud pies and engine "fuel"!','Fill different containers – which holds more?','Use big spoons and little spoons.'],illustration:'🥘🌊 (fill the tank!)',hint:'Bigger containers hold more.',questions:['Which pan is biggest? Which holds the most?','Is the pot full? How do you know?']},
{id:'patternMaking',icon:'🎨🏁',title:'Pattern Making',age:'3-5',desc:'Make and describe patterns',aim:'Recognise and extend patterns',instructions:['Use coloured blocks, buttons, or stickers!','Make a pattern: red, gold, red, gold…','Say the pattern out loud.','Can you make a different pattern?'],illustration:'🔴🟡🔴🟡 ➔ next is 🔴',hint:'Patterns repeat. What comes next?',questions:['What is the rule of your pattern?','Can you clap your pattern?']},
{id:'cooking',icon:'🥄🏆',title:'Cooking With Safia',age:'3-5',desc:'Follow a simple recipe',aim:'Measure and count ingredients',instructions:['Find a simple recipe – like playdough cookies or a smoothie!','Count the cups of flour, spoonfuls of sugar.','Mix it all together!','Talk as you go – "I need one more cup."'],illustration:'🥣 1 cup flour, 2 spoons sugar',hint:'Count the spoonfuls carefully.',questions:['How many cups do we need?','What if we add too much sugar?']},
{id:'numberBook',icon:'📘🏁',title:'Safia\'s Number Book',age:'3-5',desc:'Make a book of your favourite number',aim:'Collect groups and count',instructions:['Choose a number – like 4!','Go on a hunt – find 4 cars, 4 stickers, 4 leaves.','Stick them in a book or take photos.','Write the number on each page!'],illustration:'4 cars 🏎️🏎️🏎️🏎️ · 4 stickers ⭐⭐⭐⭐',hint:'Count each thing carefully. Touch and say the number.',questions:['Do you have 4 of everything?','Which page is your favourite?']},
{id:'smallWorld',icon:'🏗️🔧',title:'Garage World',age:'3-5',desc:'Build a garage for your toys',aim:'Use language of position and size',instructions:['Get toy cars, trucks, and little boxes!','Build roads and garages.','Put each vehicle in its special spot.','Talk about it – "The truck is next to the garage!"'],illustration:'🏎️🚚 | 🏗️ (the garage!)',hint:'Bigger vehicles might need bigger garages!',questions:['How many vehicles fit in this garage?','Which vehicle has the biggest space? Why?']},
{id:'shutTheBox',icon:'🎲🏁',title:'Shut the Box for Two',age:'5-7',desc:'Turn over cards matching dice rolls',aim:'Use number knowledge with dice sums',instructions:['Make cards 1–12. Place all face up.','Roll two dice. Turn over cards matching the numbers.','If you can\'t flip any more, add the remaining — lower score wins!','Swap and play again!'],illustration:'🎲🎲 ➔ 4+5 → flip 4️⃣ and 5️⃣',hint:'Try to flip cards that give you the most options.',questions:['Which cards are hardest to flip? Why?','What is the best score you can get?']},
{id:'strikeItOut',icon:'✏️🏁',title:'Strike It Out for Two',age:'5-11',desc:'Cross out numbers on a number line!',aim:'Practise addition and subtraction strategically',instructions:['Draw a number line 0–20.','Cross out one number, then another, circle their sum or difference.','Must start with the circled number next time.','Player who stops opponent wins!'],illustration:'0─1─2─3…20  ✂️ cross · ⭕ circle',hint:'Think ahead — trap your opponent!',questions:['Can you cross out ALL numbers?','What\'s the most you can cross out?']},
{id:'seeingSquares',icon:'🟦🏁',title:'Seeing Squares for Two',age:'5-11',desc:'Place dots to make squares on a grid!',aim:'Visualise squares including tilted ones',instructions:['Choose a colour each. Take turns drawing a dot.','First to place 4 dots forming a square wins!','Squares can be ANY size and can tilt!','Block your partner!'],illustration:'· ● · ●\n· · · ·\n· ● · ● ← square!',hint:'A tilted square still has 4 equal sides.',questions:['How do you know it\'s a square?','Can you find a strategy to always win?']},
{id:'boardBlock',icon:'🔺🏁',title:'Board Block for Two',age:'5-7',desc:'Place triangle bands on a pegboard!',aim:'Explore properties of triangles',instructions:['Take turns adding a band around 3 pegs to make a triangle.','Triangles must NOT overlap.','Can\'t make a triangle = you lose!','Try playing to LOSE!'],illustration:'⬡ peg board → △ △ △',hint:'Think about which pegs are still free!',questions:['What are winning strategies?','How does it change playing to lose?']},
{id:'sameLengthTrains',icon:'🚂🏆',title:'Same Length Trains',age:'5-7',desc:'Make trains the same length using one colour',aim:'Explore equal lengths and number relationships',instructions:['Make a train 20cm long using mixed colours.','Now make trains the SAME length using ONLY one colour.','How many different single-colour trains can you make?'],illustration:'Yellow (5): ⬜⬜⬜⬜⬜ (5 whites) or 🟥🟥 (2 reds+1 white)',hint:'Which colours divide evenly into the total?',questions:['How do you know you\'ve found ALL trains?','What if the total were 12?']},
{id:'sortTheStreet',icon:'🏠🏁',title:'Sort the Street',age:'5-7',desc:'Sort houses by colour, roof, floors and more!',aim:'Sort and classify using multiple properties',instructions:['Look at 9 houses. Sort them into two groups.','Tell your adult your rule!','Now sort them a DIFFERENT way.','How many ways can you find?'],illustration:'🏠🔴 🏠🟡 🏠🔵 → sort by door colour!',hint:'Try roof colour, then floors, then chimney side.',questions:['Which way makes the most equal groups?','Can you sort into 3 groups?']},
{id:'hundredSquareJigsaw',icon:'🧩🏆',title:'100 Square Jigsaw',age:'5-7',desc:'Put the 100 square back together!',aim:'Explore number patterns and place value',instructions:['Print puzzle pieces (search "100 Square Jigsaw NRICH").','Mix them up! Put the 100 square back like a jigsaw.','Use number patterns to help.'],illustration:'1  2  3 … 10\n11 12 13 … 20  🧩',hint:'The last digit in each column is always the same!',questions:['What patterns do you look for?','What\'s the hardest piece? Why?']},
{id:'polyPlugRectangles',icon:'🟣🏁',title:'Secret Rectangle',age:'5-11',desc:'Find the hidden rectangle!',aim:'Understand multiplication as arrays',instructions:['One player secretly colours a rectangle on a 5×5 grid.','Other player picks spots to test – inside or outside?','Find it with as FEW tests as possible!'],illustration:'? ? ? ?\n? ■ ■ ?\n? ■ ■ ?\n? ? ? ? ← find me!',hint:'Test the middle first – it gives the most info!',questions:['Which totals are easiest to find? Why?','How few tests do you really need?']},
{id:'matchingNumbers',icon:'🃏🏁',title:'Number Memory Match',age:'5-7',desc:'Memory game – match ways to show a number!',aim:'See numbers in many representations',instructions:['Make cards: dice faces, tallies, numerals, dots, fingers.','Shuffle and place face-down in a grid.','Flip two cards – same number = keep them!','Most pairs wins.'],illustration:'🎴 flip → ⚃ and 4 → Match!',hint:'Remember where cards are – use your memory!',questions:['How many ways can you show 5?','Can you make your OWN extra cards?']},
{id:'tablesTeaser',icon:'📊🏆',title:'Tables Teaser',age:'5-7',desc:'Work out the secret row and column headings!',aim:'Explore multiplication patterns',instructions:['Draw a 3×3 grid. Pick 3 secret numbers for headings.','Fill in: each cell = row heading × column heading.','Show the filled grid – can partner work out the headings?'],illustration:'  ? ?  ?\n? 4 6 10\n? 6 9 15\n? 10 15 25',hint:'Find the smallest number – what two multiply to make it?',questions:['Why does 20 appear twice?','Can you make a puzzle where a number appears 3 times?']},
{id:'stopTheClock',icon:'🕐🏁',title:'Stop the Clock for Two',age:'5-7',desc:'Move clock hands to hit 12 o\'clock!',aim:'Tell time and calculate time intervals',instructions:['Set a clock to 6 o\'clock.','Take turns: move forward ½ hour or 1 hour.','Land EXACTLY on 12 = WIN!'],illustration:'🕕 → ½hr or 1hr → 🕛 WIN!',hint:'Work backwards from 12!',questions:['What if you\'re at 10:30?','Can you always win if you go first?']},
{id:'fourTriangles',icon:'🔺🏁',title:'Four Triangles Puzzle',age:'5-11',desc:'Cut a square into 4 triangles and rearrange!',aim:'Explore shapes systematically',instructions:['Cut a square diagonally both ways – 4 triangles!','Rearrange to make different shapes.','Long sides touch long sides; short touch short.','How many DIFFERENT shapes can you make?'],illustration:'◼ → cut → △△△△ → rearrange!',hint:'Flip and rotate. Two shapes are the same if one is a rotation.',questions:['How do you know two shapes are different?','How many shapes can you find?']},
{id:'oneBigTriangle',icon:'🔟🏁',title:'One Big Triangle',age:'5-7',desc:'Arrange 9 triangles so touching numbers add to 10!',aim:'Practise number bonds to 10',instructions:['Print the 9 triangles from NRICH "One Big Triangle".','Arrange them to form ONE big triangle.','Numbers that TOUCH must add to 10.'],illustration:'△△△ → fit so 3+7, 4+6, 5+5 = 10',hint:'Find pairs that make 10: 1+9, 2+8, 3+7, 4+6, 5+5.',questions:['How did you get started?','Is there more than one solution?']},
{id:'cuisenaireCounting',icon:'🟥🏁',title:'Cuisenaire Counting',age:'5-7',desc:'How many ways to fill a yellow rod?',aim:'Explore combinations and systematic working',instructions:['Yellow rod = 5 units. White = 1. Red = 2.','Fill yellow rod using ONLY white and red rods.','Record every way!','Try with dark green (6 units).'],illustration:'Yellow (5): WWWWW or RWWW or WRRW ...',hint:'Work from all whites, then swap one for a red.',questions:['How many ways for yellow? Dark green?','Can you see a pattern?']},
{id:'alwaysSometimesNever',icon:'🤔🏁',title:'Always, Sometimes or Never?',age:'5-7',desc:'Are these maths statements always, sometimes or never true?',aim:'Reason about number and shape properties',instructions:['Read each statement aloud.','Decide: ALWAYS, SOMETIMES or NEVER true?','Find an example or counter-example!'],illustration:'✅ ALWAYS | 🤔 SOMETIMES | ❌ NEVER',hint:'For "sometimes" – say WHEN it is and isn\'t true.',questions:['Can you rewrite a "sometimes" as "always"?','Which surprised you?']},
{id:'inceyWincey',icon:'🕷️🏁',title:'Incey Wincey Spider',age:'5-7',desc:'Move the spider up or down the drainpipe!',aim:'Explore a vertical number track',instructions:['Draw a drainpipe track (numbers bottom to top).','Sunshine = spider UP ☀️. Rain = spider DOWN 🌧️.','Take turns rolling a die and moving.','Sunshine wins at top; Rain wins at bottom!'],illustration:'☀️ roll → spider climbs ⬆️',hint:'It\'s like a number line stood on its end!',questions:['How long to reach one end?','Try with two dice – does strategy help?']},
{id:'butterflyFlowers',icon:'🦋🏁',title:'Butterfly Flowers',age:'5-7',desc:'Match butterfly pairs that add to the flower number!',aim:'Practise number bonds',instructions:['Each flower has a number. Find TWO butterflies whose numbers ADD to the flower\'s number.','Place the pair on their flower.','Which pair has NO flower? Which flower has NO pair?'],illustration:'Flower 8: butterflies 3️⃣ + 5️⃣',hint:'Add each butterfly pair until you find the flower match.',questions:['Which pair has no flower? Why?','Which flower can\'t have a pair? Why?']},
{id:'robotMonsters',icon:'🤖🏁',title:'Robot Monsters',age:'5-7',desc:'Build robots and measure their heights!',aim:'Add measurements, work systematically',instructions:['Print robot head, body and leg pieces from NRICH.','Each piece has a height in cm.','Head + Body + Legs = height!','Find the tallest and shortest robots.'],illustration:'Head (3) + Body (5) + Legs (4) = 12cm 🤖',hint:'Tallest = pick biggest piece from each category.',questions:['Can you find ALL heights?','How do you know you haven\'t missed any?']},
{id:'guessTheHouses',icon:'🏡🏁',title:'Guess the Garage Rule',age:'5-7',desc:'Ask questions to discover the secret rule!',aim:'Develop logical questioning',instructions:['Adult picks a secret rule (e.g. "red cars").','Show car cards one at a time: "Does this fit your rule?"','YES = into the Box. NO = outside.','Figure out the rule in as few cards as possible!'],illustration:'🏎️ → "Yes" 🔴 / "No" 🟡 → figure out the rule!',hint:'Pick cards that differ in only ONE property.',questions:['Least cards needed?','What types of questions help most?']},
{id:'totality',icon:'🎯🏁',title:'Totality for Two',age:'5-11',desc:'Slide a counter to hit the target total!',aim:'Practise addition and strategic thinking',instructions:['Slide a counter along connected numbers on NRICH Totality board.','Choose a target (e.g. 20). Add as you go.','Reach the target EXACTLY = WIN!'],illustration:'web of numbers → slide → add → 🎯 target!',hint:'Work backwards from target.',questions:['Can you find a winning strategy?','What if you change the target?']},
{id:'wallpaper',icon:'🖼️🏁',title:'Race Wallpaper',age:'5-7',desc:'Order wallpaper pieces from smallest to largest area!',aim:'Compare and estimate area',instructions:['Print NRICH "Wallpaper" pieces.','Arrange in order: smallest to largest.','How are you comparing them?'],illustration:'🖼️ tiny → 🖼️ small → 🖼️ medium → 🖼️ large',hint:'Try overlapping pieces or counting pattern repeats.',questions:['How did you order them?','Were any tricky? Why?']},
{id:'nim7',icon:'🔢🏆',title:'Nim-7',age:'5-14',desc:'Take 1 or 2 counters – grab the last one to WIN!',aim:'Develop logical and strategic thinking',instructions:['Place 7 counters. Take turns: take 1 OR 2.','Take the LAST counter = WIN!','Swap who goes first each game.','Can you find the winning strategy?'],illustration:'●●●●●●● → take 1 or 2 → WIN!',hint:'Work backwards: if 3 left on YOUR turn, can you always win?',questions:['Does it matter who goes first?','What with different starting numbers?']},
{id:'breakItUp',icon:'🧱🏁',title:'Break It Up!',age:'5-11',desc:'How many ways to break 7 cubes into 2 pieces?',aim:'Explore patterns and systematic working',instructions:['Get 7 interlocking cubes.','Break the stick into exactly 2 pieces.','Count all the ways!','Try with 8 cubes, then 6. What pattern?'],illustration:'■■■■■■■ → ■|■■■■■■ etc.',hint:'Each "break point" gives a different way.',questions:['What do you notice vs the number of cubes?','How many ways with 20 cubes?']},
{id:'enCounters',icon:'⭕🏁',title:'En-Counters for Two',age:'5-7',desc:'Recreate a secret counter pattern from descriptions!',aim:'Use language of colour, position and order',instructions:['Adult arranges counters and describes them aloud.','You copy from the description!','Ask questions if you need to.','Compare – are they the same? Then swap!'],illustration:'Adult: "One red counter. One gold below it." → copy!',hint:'Ask about colour, position, and distance.',questions:['Which questions helped most?','What language makes descriptions clearest?']},
{id:'paperPatchwork',icon:'📄🏁',title:'Paper Patchwork',age:'5-7',desc:'Fold paper and make patchwork patterns!',aim:'Explore shapes through folding',instructions:['Fold an A4 sheet in half along the special crease.','What shape do you get?','Make the same shape in A4, A5, A6 in two colours.','Arrange them to make a patchwork!'],illustration:'A4 folded → new shape → patchwork!',hint:'Fold carefully – precision matters.',questions:['What shape when you fold?','Can each patchwork be a different design?']},
{id:'eightnessOfEight',icon:'🔴🏁',title:'Eightness of Eight',age:'5-7',desc:'8 counters rearranged – it\'s still 8!',aim:'Understand that a number stays the same however arranged',instructions:['Watch the NRICH video (link below).','8 counters rearrange – still 8!','Describe what stays the same; what changes.','Show the "twelve-ness of twelve" your own way!'],illustration:'●●●●●●●● → arrange differently → still 8!',hint:'The NUMBER doesn\'t change – only the arrangement does.',questions:['What is always the same?','Make a video showing "twelve-ness of twelve"!']},
{id:'ladybirdBox',icon:'🐞🏆',title:'Ladybird Puzzle',age:'5-11',desc:'6 ladybirds – every row and column must have exactly 2!',aim:'Work systematically',instructions:['Draw a 3×3 grid.','Place 6 ladybirds so EVERY row has exactly 2 AND every column has exactly 2.','How many solutions can you find?'],illustration:'🐞 _ 🐞\n_ 🐞 🐞\n🐞 🐞 _ ← does this work?',hint:'There are 3 ways to place 2 in the first row. Try each!',questions:['How many different solutions?','How do you know you\'ve found them all?']},
{id:'niceOrNasty',icon:'😈🏁',title:'Nice or Nasty',age:'5-11',desc:'Roll dice and place digits – be nice OR nasty!',aim:'Develop place value strategically',instructions:['Draw 4 boxes: _ _ _ _ (thousands, hundreds, tens, ones).','Roll a 0–9 dice – place the digit before rolling again.','After 4 rolls each, highest total wins!','Nasty version: place in YOUR opponent\'s boxes!'],illustration:'Roll 7 → place as: 7_ _ or _7_ or _ _7?',hint:'Save big digits for hundreds/thousands!',questions:['Best place for a 9? A 1?','Can you find a strategy that always wins?']},
{id:'factorsMultiples',icon:'🔢🏁',title:'Factors & Multiples Game',age:'7-11',desc:'Chain factors and multiples – block your opponent!',aim:'Explore factors, multiples and divisibility',instructions:['Numbers 1–100 in a grid.','Circle any even number first.','Next: circle a factor OR multiple of the previous number.','Can\'t go = LOSE!'],illustration:'Circle 6 → can circle 2, 3, 12, 18, 24…',hint:'Avoid leaving your opponent lots of options.',questions:['Which numbers give most options?','Can you find a winning strategy?']},
{id:'trainTactics',icon:'🚂🏆',title:'Train Tactics for Two',age:'5-11',desc:'Move trains along a number line – reach your target!',aim:'Practise number bonds along a number line',instructions:['Number line 0–20. Two trains start at 0.','Move EITHER train forward 1, 2 or 3 spaces.','Can\'t land on the other train.','Land EXACTLY on 20 = WIN!'],illustration:'Train A at 7, Train B at 12 → move by 2\nGoal: land on 20 🏁',hint:'Think which moves leave opponent weak. Work back from 20!',questions:['Better to go first or second?','What positions are winning?']},
{id:'dottySix',icon:'🎲🏁',title:'Dotty Six for Two',age:'5-7',desc:'Roll dice and fill a grid – get a line of 6 dots!',aim:'Practise addition and strategic thinking',instructions:['Two 3×3 grids – one each.','Roll two dice. Put that many dots in ONE square.','First to get a row, column or diagonal totalling 6 = WIN!'],illustration:'Roll 2+4=6 → put 6 in one square → win?',hint:'Each row/column must total exactly 6.',questions:['Better to go for one line or block opponent?','What rolls are most useful?']},
{id:'diceyOperations',icon:'🎰🏆',title:'Dicey Operations',age:'7-11',desc:'Use dice digits to make calculations – closest wins!',aim:'Practise addition/subtraction with strategy',instructions:['Draw: _ _ _ + _ _ _ (or minus).','Roll 6 times. ALL players write that digit in one blank.','After 6 rolls, calculate. Closest to TARGET wins!'],illustration:'Target: 1000\nRoll 6,3,8,1,4,2 → arrange as 638+412=1050?',hint:'Big digits go in hundreds/thousands!',questions:['Which roll is hardest to place?','Can you find a strategy to get close?']},
{id:'fourGo',icon:'4️⃣🏁',title:'Four Go for Two',age:'7-11',desc:'Multiply to claim squares – four in a row wins!',aim:'Develop multiplication and strategic thinking',instructions:['6×6 grid with products. Factors 1–6 at the bottom.','Choose TWO factors and multiply.','Claim that product square.','Four in a row = WIN!'],illustration:'3 × 4 = 12 → claim 12\n6 × 6 = 36 → claim 36',hint:'Which products appear most? Some can be made multiple ways!',questions:['Which products appear most? Why?','Can you block opponent and build your own row?']},
{id:'firstConnectThree',icon:'🔗🏁',title:'First Connect Three',age:'7-11',desc:'Plot coordinates – get three in a row!',aim:'Practise coordinates and multiplication',instructions:['Grid with x and y axes 0–5.','Roll two dice to get x and y coordinates.','Plot and claim that point.','First to THREE in a row wins!'],illustration:'Roll 3, then 4 → plot (3,4) ✓\nThree in a row → WIN!',hint:'Build in TWO directions at once!',questions:['Which coordinates are hardest to get?','Can you spot when opponent is about to win?']},
{id:'whatShape',icon:'🔷🏁',title:'What Shape?',age:'5-11',desc:'Ask yes/no questions to identify a secret shape!',aim:'Develop knowledge of shape properties',instructions:['One player secretly picks a 2D shape.','Ask YES/NO questions about its properties.','"Does it have 4 sides?", "Are all sides equal?"','Guess the shape in as FEW questions as possible!'],illustration:'🔷 secret shape\n"More than 4 sides?" → Yes\n→ Could be hexagon!',hint:'Start broad (number of sides) then narrow down.',questions:['Minimum questions needed?','Can you always find it in 3?']},
{id:'guessDominoes',icon:'🁣🏁',title:'Guess the Domino',age:'5-7',desc:'Ask questions to find the hidden domino!',aim:'Explore number properties and reasoning',instructions:['One player picks a domino and hides it.','Ask YES/NO questions: "Is one side 6?", "Do both add to more than 8?"','Guess the domino in as few questions as possible!'],illustration:'Hidden: [3|5]\n"Total > 7?" → Yes\n"Any side = 6?" → No → 3+5?',hint:'Ask about the total first, then narrow down each side.',questions:['Best first question?','Can you always guess in 4?']},
{id:'spirallingDecimals',icon:'🌀🏁',title:'Spiralling Decimals',age:'9-14',desc:'Place decimal numbers on a number line!',aim:'Develop decimal place value understanding',instructions:['Roll a dice 3 times for 3 digits (e.g. 3, 7, 1).','Each player arranges as a decimal: 0.371, 0.713…','Place on the number line.','Closest to the TARGET wins!'],illustration:'Digits: 2,8,5\n0.285, 0.528, 0.852…\nTarget: 0.5 → which is closest?',hint:'Think about tenths, hundredths, thousandths.',questions:['How do you decide?','Which digit matters most?']},
{id:'gotIt',icon:'🎯🏁',title:'Got It for Two',age:'5-14',desc:'Add numbers to reach the target – Got It!',aim:'Strategic addition and number reasoning',instructions:['Choose a target (e.g. 23) and range (1–4).','Take turns adding a number from the range.','First to reach target EXACTLY = "Got It!"','Find the winning strategy!'],illustration:'Target: 23, Range: 1-4\nTotal 18 → add 1? or 4?',hint:'Work backwards from target.',questions:['Does it matter who goes first?','What if you change the target or range?']},
{id:'boardBlockChallenge',icon:'🔺🏁',title:'Board Block Challenge',age:'7-11',desc:'Fit triangles AND quadrilaterals on a pegboard!',aim:'Explore properties of shapes',instructions:['Take turns: stretch a band around 3 or 4 pegs (triangle or quadrilateral).','No overlapping bands.','Can\'t make any shape = LOSE!'],illustration:'⬡ board: △ band or ▱ band',hint:'Quadrilaterals use more space – block opponent!',questions:['Which shapes appear most? Why?','Triangles or quadrilaterals better?']},
{id:'makingSticks',icon:'📏🏁',title:'Making Sticks',age:'5-7',desc:'Can 3 sticks make a triangle?',aim:'Explore the triangle inequality',instructions:['Cut straws into lengths 1–10 cm.','Choose ANY 3 sticks and try to make a triangle.','Record YES or NO.','Find the RULE!'],illustration:'3+4+5 → YES ✅\n1+2+3 → NO ❌',hint:'Two shorter sides must ADD to MORE than the longest!',questions:['Can you always make a triangle with 3 equal sticks?','What about two equal and one different?']},
{id:'doughnutPercents',icon:'🍩🏁',title:'Pit Stop Percents',age:'9-14',desc:'Work out what percentage each section covers!',aim:'Understand percentages as parts of a whole',instructions:['Draw a circle (the pit-stop wheel!).','Divide into sections for fuel, tires, repairs, checks.','Label each as a fraction, then convert to %.','Check: all percentages add to 100%!'],illustration:'🍩 Half fuel (50%) + Quarter tires (25%) + Quarter checks (25%) = 100% ✓',hint:'Fraction → % : divide top by bottom, × 100.',questions:['If fuel covers 3/8, what % is that?','Can you make a wheel where each section = 10%?']},
{id:'lessMore',icon:'⚖️🏁',title:'Less or More',age:'5-7',desc:'Find numbers that make the inequality true!',aim:'Understand < > = symbols',instructions:['Write an inequality like ___ < 50 or ___ > 30.','Fill in the blank with a number that makes it TRUE.','Find as many numbers as you can!'],illustration:'___ < 8 → 7 ✓ 0 ✓ -1 ✓\n20 < ___ < 25 → 21, 22, 23, 24 ✓',hint:'Think about the number line.',questions:['Are there infinitely many that make ___ < 8 true?','What if you can only use 1–100?']},
{id:'play37',icon:'3️⃣7️⃣🏆',title:'Play 37',age:'7-11',desc:'Add 1–5 to reach 37 – can\'t repeat your opponent\'s last number!',aim:'Develop strategic addition and reasoning',instructions:['Add any number 1–5 to a running total (starts at 0).','BUT: can\'t use the same number your opponent just used.','First to reach EXACTLY 37 = WIN!'],illustration:'Total: 0\nP1 adds 4 → 4\nP2 can\'t add 4! Adds 3 → 7\n...reach 37 exactly!',hint:'Work backwards from 37. Find winning positions!',questions:['Does first move matter?','What\'s the pattern of winning positions?']}
];
