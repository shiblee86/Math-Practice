import React from 'react';

const VARIANTS = {
  primary:{bg:'var(--color-primary)',color:'var(--text-on-primary)',shadow:'var(--shadow-primary)'},
  accent:{bg:'var(--color-accent)',color:'var(--text-on-accent)',shadow:'var(--shadow-accent)'},
  ghost:{bg:'var(--surface-2)',color:'var(--text-primary)',shadow:'var(--shadow-neutral)'},
  reward:{bg:'var(--color-reward)',color:'var(--text-on-accent)',shadow:'var(--shadow-reward)'}
};
const SIZES = {
  sm:{pad:'8px 16px',font:'var(--text-sm)',shadowY:'3px'},
  md:{pad:'12px 22px',font:'var(--text-base)',shadowY:'5px'},
  lg:{pad:'16px 32px',font:'var(--text-md)',shadowY:'7px'}
};

export function Button({ children, variant='primary', size='md', icon, disabled=false, onClick, style }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      disabled={disabled}
      style={{
        display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'8px',
        fontFamily:'var(--font-body)',fontWeight:'var(--weight-black)',fontSize:s.font,
        color:v.color,background:v.bg,border:'none',borderRadius:'var(--radius-md)',
        padding:s.pad,cursor:disabled?'default':'pointer',
        opacity:disabled?0.4:1,
        boxShadow:`0 ${pressed?'2px':s.shadowY} 0 ${v.shadow}`,
        transform:pressed?`translateY(${s.shadowY})`:'translateY(0)',
        transition:'transform .08s var(--ease-out), box-shadow .08s var(--ease-out)',
        ...style
      }}
    >
      {icon}<span>{children}</span>
    </button>
  );
}
