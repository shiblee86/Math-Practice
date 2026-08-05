import React from 'react';

export function QuickNav({ items, active, onSelect }) {
  return (
    <div style={{display:'flex',gap:'8px',background:'var(--bg-app-deep)',borderRadius:'var(--radius-lg)',padding:'8px',border:'2px solid var(--border-subtle)'}}>
      {items.map(it => {
        const isActive = it.id===active;
        return (
          <button key={it.id} onClick={()=>onSelect&&onSelect(it.id)} style={{
            flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',
            border:'none',borderRadius:'var(--radius-md)',padding:'10px 6px',cursor:'pointer',
            background: isActive ? 'var(--color-primary)' : 'transparent',
            color: isActive ? 'var(--text-on-primary)' : 'var(--text-secondary)',
            fontFamily:'var(--font-body)',fontWeight:'var(--weight-black)',fontSize:'var(--text-xs)',
            transition:'background .15s var(--ease-out)'
          }}>
            <span style={{fontSize:'20px'}}>{it.icon}</span>{it.label}
          </button>
        );
      })}
    </div>
  );
}
