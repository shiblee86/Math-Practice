import React from 'react';

export function Modal({ open, icon, title, subtitle, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(4,10,10,0.75)',display:'flex',
      alignItems:'center',justifyContent:'center',zIndex:500
    }}>
      <div style={{
        background:'linear-gradient(160deg,var(--surface-2),var(--surface-1))',
        border:'4px solid var(--amber-500)',borderRadius:'var(--radius-xl)',
        padding:'40px 48px',textAlign:'center',maxWidth:'90vw',
        boxShadow:'0 0 40px rgba(255,176,32,0.35)'
      }}>
        {icon && <div style={{fontSize:'64px',marginBottom:'12px'}}>{icon}</div>}
        {title && <div style={{fontFamily:'var(--font-display)',fontSize:'var(--text-2xl)',color:'var(--amber-400)'}}>{title}</div>}
        {subtitle && <div style={{fontFamily:'var(--font-body)',fontSize:'var(--text-base)',color:'var(--text-primary)',marginTop:'6px'}}>{subtitle}</div>}
        {children}
        {onClose && (
          <button onClick={onClose} style={{
            marginTop:'20px',fontFamily:'var(--font-body)',fontWeight:'var(--weight-black)',
            background:'var(--color-reward)',color:'var(--text-on-accent)',border:'none',
            borderRadius:'var(--radius-pill)',padding:'12px 28px',fontSize:'var(--text-base)',
            cursor:'pointer',boxShadow:'0 5px 0 var(--shadow-reward)'
          }}>Nice!</button>
        )}
      </div>
    </div>
  );
}
