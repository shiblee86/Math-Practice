import React from 'react';

const VARIANTS = {
  primary:{bg:'var(--color-primary)',color:'var(--text-on-primary)',shadow:'var(--shadow-primary)'},
  accent:{bg:'var(--color-accent)',color:'var(--text-on-accent)',shadow:'var(--shadow-accent)'},
  neutral:{bg:'var(--surface-2)',color:'var(--text-primary)',shadow:'var(--shadow-neutral)'},
  success:{bg:'var(--color-success)',color:'var(--text-on-accent)',shadow:'var(--shadow-neutral)'}
};

export function IconButton({ icon, label, variant='neutral', disabled=false, onClick }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      disabled={disabled}
      style={{
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px',
        width:'76px',height:'76px',border:'none',borderRadius:'var(--radius-lg)',
        background:v.bg,color:v.color,cursor:disabled?'default':'pointer',
        opacity:disabled?0.4:1,
        boxShadow:`0 ${pressed?'2px':'5px'} 0 ${v.shadow}`,
        transform:pressed?'translateY(5px)':'translateY(0)',
        transition:'transform .08s var(--ease-out), box-shadow .08s var(--ease-out)'
      }}
    >
      <span style={{fontSize:'22px',lineHeight:1}}>{icon}</span>
      {label && <span style={{fontFamily:'var(--font-body)',fontWeight:'var(--weight-bold)',fontSize:'11px'}}>{label}</span>}
    </button>
  );
}
