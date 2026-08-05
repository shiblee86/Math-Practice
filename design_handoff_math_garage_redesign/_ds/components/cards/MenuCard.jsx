import React from 'react';

const VARIANTS = {
  default:{bg:'var(--surface-1)',border:'var(--cyan-500)',shadow:'var(--shadow-primary)'},
  accent:{bg:'var(--surface-1)',border:'var(--coral-500)',shadow:'var(--shadow-accent)'},
  reward:{bg:'var(--surface-1)',border:'var(--amber-500)',shadow:'var(--shadow-reward)'}
};

export function MenuCard({ icon, title, description, badge, variant='default', onClick }) {
  const v = VARIANTS[variant] || VARIANTS.default;
  const [pressed, setPressed] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseDown={()=>setPressed(true)} onMouseUp={()=>setPressed(false)} onMouseLeave={()=>setPressed(false)}
      style={{
        background:v.bg,border:`3px solid ${v.border}`,borderRadius:'var(--radius-lg)',
        padding:'22px 18px',cursor:'pointer',textAlign:'center',
        boxShadow:`0 ${pressed?'2px':'8px'} 0 ${v.shadow}`,
        transform:pressed?'translateY(8px)':'translateY(0)',
        transition:'transform .1s var(--ease-out), box-shadow .1s var(--ease-out)'
      }}
    >
      <div style={{fontSize:'40px',lineHeight:1,marginBottom:'8px'}}>{icon}</div>
      <div style={{fontFamily:'var(--font-display)',fontSize:'var(--text-lg)',color:'var(--text-primary)'}}>{title}</div>
      {description && <div style={{fontFamily:'var(--font-body)',fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginTop:'4px'}}>{description}</div>}
      {badge && <div style={{marginTop:'10px'}}>{badge}</div>}
    </div>
  );
}
