import React from 'react';

export function AnswerTile({ children, state='default', shape='circle', onClick, disabled=false }) {
  const bg = state==='correct' ? 'var(--color-success)' : state==='wrong' ? 'var(--color-error)' : 'var(--color-primary)';
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={disabled?undefined:onClick}
      onMouseDown={()=>!disabled&&setPressed(true)} onMouseUp={()=>setPressed(false)} onMouseLeave={()=>setPressed(false)}
      disabled={disabled}
      style={{
        width: shape==='circle' ? '92px' : 'auto',
        minWidth: shape==='circle' ? '92px' : '120px',
        height:'92px',borderRadius: shape==='circle' ? '50%' : 'var(--radius-lg)',
        border:'4px solid var(--surface-1)',background:bg,color:'var(--text-on-primary)',
        fontFamily:'var(--font-display)',fontSize:'var(--text-2xl)',cursor:disabled?'default':'pointer',
        boxShadow:`0 ${pressed?'2px':'6px'} 0 var(--shadow-neutral)`,
        transform:pressed?'translateY(6px)':'translateY(0)',
        transition:'transform .1s var(--ease-out)'
      }}
    >{children}</button>
  );
}
