import React from 'react';

export function TopBar({ title, stars=0, actions }) {
  return (
    <div style={{
      display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',
      background:'var(--surface-1)',border:'2px solid var(--border-strong)',borderRadius:'var(--radius-xl)',
      padding:'14px 20px',boxShadow:'0 6px 0 var(--shadow-neutral)'
    }}>
      <div style={{fontFamily:'var(--font-display)',fontSize:'var(--text-lg)',color:'var(--cyan-300)'}}>{title}</div>
      <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
        {actions}
        <div style={{
          fontFamily:'var(--font-body)',fontWeight:'var(--weight-black)',
          background:'var(--surface-2)',color:'var(--amber-400)',
          border:'2px solid var(--amber-500)',borderRadius:'var(--radius-pill)',
          padding:'8px 16px',fontSize:'var(--text-sm)'
        }}>★ {stars}</div>
      </div>
    </div>
  );
}
