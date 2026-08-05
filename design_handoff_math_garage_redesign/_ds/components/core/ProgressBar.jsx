import React from 'react';

export function ProgressBar({ value=0, max=100, variant='primary', height=18 }) {
  const pct = Math.max(0, Math.min(100, (value/max)*100));
  const fill = variant==='reward' ? 'linear-gradient(90deg,var(--amber-500),var(--coral-500))'
    : variant==='success' ? 'var(--color-success)'
    : 'linear-gradient(90deg,var(--cyan-500),var(--color-primary-hover))';
  return (
    <div style={{
      height:`${height}px`,background:'var(--surface-2)',borderRadius:'var(--radius-pill)',
      border:'2px solid var(--border-strong)',overflow:'hidden'
    }}>
      <div style={{
        height:'100%',width:`${pct}%`,background:fill,borderRadius:'inherit',
        transition:'width .6s var(--ease-snap)'
      }}/>
    </div>
  );
}
