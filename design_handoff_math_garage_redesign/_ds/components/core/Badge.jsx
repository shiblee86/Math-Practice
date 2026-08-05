import React from 'react';

const VARIANTS = {
  neutral:{bg:'var(--surface-2)',color:'var(--text-primary)',border:'var(--border-strong)'},
  primary:{bg:'rgba(23,199,199,0.16)',color:'var(--cyan-300)',border:'var(--cyan-500)'},
  accent:{bg:'rgba(255,92,61,0.16)',color:'var(--coral-300)',border:'var(--coral-500)'},
  reward:{bg:'rgba(255,176,32,0.18)',color:'var(--amber-400)',border:'var(--amber-500)'},
  success:{bg:'rgba(47,230,167,0.16)',color:'var(--mint-400)',border:'var(--mint-500)'}
};

export function Badge({ children, variant='neutral', icon }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  return (
    <span style={{
      display:'inline-flex',alignItems:'center',gap:'6px',
      fontFamily:'var(--font-body)',fontWeight:'var(--weight-bold)',fontSize:'var(--text-xs)',
      color:v.color,background:v.bg,border:`2px solid ${v.border}`,
      borderRadius:'var(--radius-pill)',padding:'5px 14px'
    }}>
      {icon}{children}
    </span>
  );
}
