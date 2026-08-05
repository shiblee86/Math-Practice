import React from 'react';

export function LevelTile({ icon, label, stars=0, locked=false, variant='primary', onClick }) {
  const bg = locked ? 'var(--surface-2)' : variant==='accent' ? 'var(--color-accent)' : 'var(--color-primary)';
  const color = locked ? 'var(--text-muted)' : variant==='accent' ? 'var(--text-on-accent)' : 'var(--text-on-primary)';
  const shadow = locked ? 'var(--shadow-neutral)' : variant==='accent' ? 'var(--shadow-accent)' : 'var(--shadow-primary)';
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={locked?undefined:onClick}
      onMouseDown={()=>!locked&&setPressed(true)} onMouseUp={()=>setPressed(false)} onMouseLeave={()=>setPressed(false)}
      disabled={locked}
      style={{
        display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',
        width:'104px',minHeight:'104px',border:'none',borderRadius:'var(--radius-lg)',
        background:bg,color,cursor:locked?'default':'pointer',padding:'12px 6px',
        boxShadow:`0 ${pressed?'2px':'5px'} 0 ${shadow}`,
        transform:pressed?'translateY(5px)':'translateY(0)',
        transition:'transform .1s var(--ease-out)',
        fontFamily:'var(--font-body)'
      }}
    >
      <span style={{fontSize:'28px',lineHeight:1,opacity:locked?0.5:1}}>{locked?'🔒':icon}</span>
      <span style={{fontWeight:'var(--weight-black)',fontSize:'var(--text-sm)'}}>{label}</span>
      {!locked && stars>0 && <span style={{fontSize:'var(--text-xs)',background:'rgba(0,0,0,0.2)',borderRadius:'var(--radius-pill)',padding:'1px 8px'}}>{'★'.repeat(stars)}</span>}
    </button>
  );
}
