import React from 'react';

export function QuizStatRow({ correct=0, wrong=0, accuracy=0 }) {
  const Stat = ({label, value, color}) => (
    <div style={{textAlign:'center',flex:1}}>
      <div style={{fontFamily:'var(--font-body)',fontWeight:'var(--weight-bold)',fontSize:'var(--text-xs)',color:'var(--text-secondary)'}}>{label}</div>
      <div style={{fontFamily:'var(--font-display)',fontSize:'var(--text-xl)',color}}>{value}</div>
    </div>
  );
  return (
    <div style={{display:'flex',gap:'8px',background:'var(--surface-1)',borderRadius:'var(--radius-pill)',padding:'10px 20px',border:'2px solid var(--border-subtle)'}}>
      <Stat label="CORRECT" value={correct} color="var(--color-success)" />
      <Stat label="OOPS" value={wrong} color="var(--coral-400)" />
      <Stat label="ACCURACY" value={`${accuracy}%`} color="var(--cyan-300)" />
    </div>
  );
}
