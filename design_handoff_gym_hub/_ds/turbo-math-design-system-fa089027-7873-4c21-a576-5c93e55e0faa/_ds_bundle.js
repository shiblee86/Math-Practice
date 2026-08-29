/* @ds-bundle: {"format":4,"namespace":"TurboMathDesignSystem_fa0890","components":[{"name":"LevelTile","sourcePath":"components/cards/LevelTile.jsx"},{"name":"MenuCard","sourcePath":"components/cards/MenuCard.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"ProgressBar","sourcePath":"components/core/ProgressBar.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"AnswerTile","sourcePath":"components/game/AnswerTile.jsx"},{"name":"QuizStatRow","sourcePath":"components/game/QuizStatRow.jsx"},{"name":"QuickNav","sourcePath":"components/navigation/QuickNav.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"}],"sourceHashes":{"components/cards/LevelTile.jsx":"52e0027a8843","components/cards/MenuCard.jsx":"012caf3fdeff","components/core/Badge.jsx":"82e9bb52976e","components/core/Button.jsx":"9612110c6db0","components/core/IconButton.jsx":"95892f9e4e89","components/core/ProgressBar.jsx":"6e02275d5b8e","components/feedback/Modal.jsx":"3ca23175d7c9","components/game/AnswerTile.jsx":"014abd35c194","components/game/QuizStatRow.jsx":"49f8f30bc9c8","components/navigation/QuickNav.jsx":"ff02800c58c7","components/navigation/TopBar.jsx":"30e360326234","ui_kits/turbo-math-app/HomeScreen.jsx":"77948664c5e9","ui_kits/turbo-math-app/LevelsScreen.jsx":"3df3bad3611f","ui_kits/turbo-math-app/QuizScreen.jsx":"975789cb8643","ui_kits/turbo-math-app/ResultScreen.jsx":"a54a06a2bd1d","ui_kits/turbo-math-app/SoarActivityScreen.jsx":"cd0c9753e469","ui_kits/turbo-math-app/SoarMenuScreen.jsx":"c64b2db92820"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TurboMathDesignSystem_fa0890 = window.TurboMathDesignSystem_fa0890 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/cards/LevelTile.jsx
try { (() => {
function LevelTile({
  icon,
  label,
  stars = 0,
  locked = false,
  variant = 'primary',
  onClick
}) {
  const bg = locked ? 'var(--surface-2)' : variant === 'accent' ? 'var(--color-accent)' : 'var(--color-primary)';
  const color = locked ? 'var(--text-muted)' : variant === 'accent' ? 'var(--text-on-accent)' : 'var(--text-on-primary)';
  const shadow = locked ? 'var(--shadow-neutral)' : variant === 'accent' ? 'var(--shadow-accent)' : 'var(--shadow-primary)';
  const [pressed, setPressed] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: locked ? undefined : onClick,
    onMouseDown: () => !locked && setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    disabled: locked,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      width: '104px',
      minHeight: '104px',
      border: 'none',
      borderRadius: 'var(--radius-lg)',
      background: bg,
      color,
      cursor: locked ? 'default' : 'pointer',
      padding: '12px 6px',
      boxShadow: `0 ${pressed ? '2px' : '5px'} 0 ${shadow}`,
      transform: pressed ? 'translateY(5px)' : 'translateY(0)',
      transition: 'transform .1s var(--ease-out)',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '28px',
      lineHeight: 1,
      opacity: locked ? 0.5 : 1
    }
  }, locked ? '🔒' : icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--weight-black)',
      fontSize: 'var(--text-sm)'
    }
  }, label), !locked && stars > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: 'var(--radius-pill)',
      padding: '1px 8px'
    }
  }, '★'.repeat(stars)));
}
Object.assign(__ds_scope, { LevelTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/LevelTile.jsx", error: String((e && e.message) || e) }); }

// components/cards/MenuCard.jsx
try { (() => {
const VARIANTS = {
  default: {
    bg: 'var(--surface-1)',
    border: 'var(--cyan-500)',
    shadow: 'var(--shadow-primary)'
  },
  accent: {
    bg: 'var(--surface-1)',
    border: 'var(--coral-500)',
    shadow: 'var(--shadow-accent)'
  },
  reward: {
    bg: 'var(--surface-1)',
    border: 'var(--amber-500)',
    shadow: 'var(--shadow-reward)'
  }
};
function MenuCard({
  icon,
  title,
  description,
  badge,
  variant = 'default',
  onClick
}) {
  const v = VARIANTS[variant] || VARIANTS.default;
  const [pressed, setPressed] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    style: {
      background: v.bg,
      border: `3px solid ${v.border}`,
      borderRadius: 'var(--radius-lg)',
      padding: '22px 18px',
      cursor: 'pointer',
      textAlign: 'center',
      boxShadow: `0 ${pressed ? '2px' : '8px'} 0 ${v.shadow}`,
      transform: pressed ? 'translateY(8px)' : 'translateY(0)',
      transition: 'transform .1s var(--ease-out), box-shadow .1s var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '40px',
      lineHeight: 1,
      marginBottom: '8px'
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      color: 'var(--text-primary)'
    }
  }, title), description && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      marginTop: '4px'
    }
  }, description), badge && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '10px'
    }
  }, badge));
}
Object.assign(__ds_scope, { MenuCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/MenuCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
const VARIANTS = {
  neutral: {
    bg: 'var(--surface-2)',
    color: 'var(--text-primary)',
    border: 'var(--border-strong)'
  },
  primary: {
    bg: 'rgba(23,199,199,0.16)',
    color: 'var(--cyan-300)',
    border: 'var(--cyan-500)'
  },
  accent: {
    bg: 'rgba(255,92,61,0.16)',
    color: 'var(--coral-300)',
    border: 'var(--coral-500)'
  },
  reward: {
    bg: 'rgba(255,176,32,0.18)',
    color: 'var(--amber-400)',
    border: 'var(--amber-500)'
  },
  success: {
    bg: 'rgba(47,230,167,0.16)',
    color: 'var(--mint-400)',
    border: 'var(--mint-500)'
  }
};
function Badge({
  children,
  variant = 'neutral',
  icon
}) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 'var(--text-xs)',
      color: v.color,
      background: v.bg,
      border: `2px solid ${v.border}`,
      borderRadius: 'var(--radius-pill)',
      padding: '5px 14px'
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const VARIANTS = {
  primary: {
    bg: 'var(--color-primary)',
    color: 'var(--text-on-primary)',
    shadow: 'var(--shadow-primary)'
  },
  accent: {
    bg: 'var(--color-accent)',
    color: 'var(--text-on-accent)',
    shadow: 'var(--shadow-accent)'
  },
  ghost: {
    bg: 'var(--surface-2)',
    color: 'var(--text-primary)',
    shadow: 'var(--shadow-neutral)'
  },
  reward: {
    bg: 'var(--color-reward)',
    color: 'var(--text-on-accent)',
    shadow: 'var(--shadow-reward)'
  }
};
const SIZES = {
  sm: {
    pad: '8px 16px',
    font: 'var(--text-sm)',
    shadowY: '3px'
  },
  md: {
    pad: '12px 22px',
    font: 'var(--text-base)',
    shadowY: '5px'
  },
  lg: {
    pad: '16px 32px',
    font: 'var(--text-md)',
    shadowY: '7px'
  }
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  onClick,
  style
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const [pressed, setPressed] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: disabled ? undefined : onClick,
    onMouseDown: () => !disabled && setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    disabled: disabled,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-black)',
      fontSize: s.font,
      color: v.color,
      background: v.bg,
      border: 'none',
      borderRadius: 'var(--radius-md)',
      padding: s.pad,
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      boxShadow: `0 ${pressed ? '2px' : s.shadowY} 0 ${v.shadow}`,
      transform: pressed ? `translateY(${s.shadowY})` : 'translateY(0)',
      transition: 'transform .08s var(--ease-out), box-shadow .08s var(--ease-out)',
      ...style
    }
  }, icon, /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
const VARIANTS = {
  primary: {
    bg: 'var(--color-primary)',
    color: 'var(--text-on-primary)',
    shadow: 'var(--shadow-primary)'
  },
  accent: {
    bg: 'var(--color-accent)',
    color: 'var(--text-on-accent)',
    shadow: 'var(--shadow-accent)'
  },
  neutral: {
    bg: 'var(--surface-2)',
    color: 'var(--text-primary)',
    shadow: 'var(--shadow-neutral)'
  },
  success: {
    bg: 'var(--color-success)',
    color: 'var(--text-on-accent)',
    shadow: 'var(--shadow-neutral)'
  }
};
function IconButton({
  icon,
  label,
  variant = 'neutral',
  disabled = false,
  onClick
}) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  const [pressed, setPressed] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: disabled ? undefined : onClick,
    onMouseDown: () => !disabled && setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    disabled: disabled,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      width: '76px',
      height: '76px',
      border: 'none',
      borderRadius: 'var(--radius-lg)',
      background: v.bg,
      color: v.color,
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      boxShadow: `0 ${pressed ? '2px' : '5px'} 0 ${v.shadow}`,
      transform: pressed ? 'translateY(5px)' : 'translateY(0)',
      transition: 'transform .08s var(--ease-out), box-shadow .08s var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '22px',
      lineHeight: 1
    }
  }, icon), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-bold)',
      fontSize: '11px'
    }
  }, label));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/ProgressBar.jsx
try { (() => {
function ProgressBar({
  value = 0,
  max = 100,
  variant = 'primary',
  height = 18
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const fill = variant === 'reward' ? 'linear-gradient(90deg,var(--amber-500),var(--coral-500))' : variant === 'success' ? 'var(--color-success)' : 'linear-gradient(90deg,var(--cyan-500),var(--color-primary-hover))';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: `${height}px`,
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-pill)',
      border: '2px solid var(--border-strong)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${pct}%`,
      background: fill,
      borderRadius: 'inherit',
      transition: 'width .6s var(--ease-snap)'
    }
  }));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
function Modal({
  open,
  icon,
  title,
  subtitle,
  children,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(4,10,10,0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 500
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(160deg,var(--surface-2),var(--surface-1))',
      border: '4px solid var(--amber-500)',
      borderRadius: 'var(--radius-xl)',
      padding: '40px 48px',
      textAlign: 'center',
      maxWidth: '90vw',
      boxShadow: '0 0 40px rgba(255,176,32,0.35)'
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '64px',
      marginBottom: '12px'
    }
  }, icon), title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-2xl)',
      color: 'var(--amber-400)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-base)',
      color: 'var(--text-primary)',
      marginTop: '6px'
    }
  }, subtitle), children, onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      marginTop: '20px',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-black)',
      background: 'var(--color-reward)',
      color: 'var(--text-on-accent)',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      padding: '12px 28px',
      fontSize: 'var(--text-base)',
      cursor: 'pointer',
      boxShadow: '0 5px 0 var(--shadow-reward)'
    }
  }, "Nice!")));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/game/AnswerTile.jsx
try { (() => {
function AnswerTile({
  children,
  state = 'default',
  shape = 'circle',
  onClick,
  disabled = false
}) {
  const bg = state === 'correct' ? 'var(--color-success)' : state === 'wrong' ? 'var(--color-error)' : 'var(--color-primary)';
  const [pressed, setPressed] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: disabled ? undefined : onClick,
    onMouseDown: () => !disabled && setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    disabled: disabled,
    style: {
      width: shape === 'circle' ? '92px' : 'auto',
      minWidth: shape === 'circle' ? '92px' : '120px',
      height: '92px',
      borderRadius: shape === 'circle' ? '50%' : 'var(--radius-lg)',
      border: '4px solid var(--surface-1)',
      background: bg,
      color: 'var(--text-on-primary)',
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-2xl)',
      cursor: disabled ? 'default' : 'pointer',
      boxShadow: `0 ${pressed ? '2px' : '6px'} 0 var(--shadow-neutral)`,
      transform: pressed ? 'translateY(6px)' : 'translateY(0)',
      transition: 'transform .1s var(--ease-out)'
    }
  }, children);
}
Object.assign(__ds_scope, { AnswerTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/AnswerTile.jsx", error: String((e && e.message) || e) }); }

// components/game/QuizStatRow.jsx
try { (() => {
function QuizStatRow({
  correct = 0,
  wrong = 0,
  accuracy = 0
}) {
  const Stat = ({
    label,
    value,
    color
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      color
    }
  }, value));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-pill)',
      padding: '10px 20px',
      border: '2px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "CORRECT",
    value: correct,
    color: "var(--color-success)"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "OOPS",
    value: wrong,
    color: "var(--coral-400)"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "ACCURACY",
    value: `${accuracy}%`,
    color: "var(--cyan-300)"
  }));
}
Object.assign(__ds_scope, { QuizStatRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/QuizStatRow.jsx", error: String((e && e.message) || e) }); }

// components/navigation/QuickNav.jsx
try { (() => {
function QuickNav({
  items,
  active,
  onSelect
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      background: 'var(--bg-app-deep)',
      borderRadius: 'var(--radius-lg)',
      padding: '8px',
      border: '2px solid var(--border-subtle)'
    }
  }, items.map(it => {
    const isActive = it.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => onSelect && onSelect(it.id),
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        padding: '10px 6px',
        cursor: 'pointer',
        background: isActive ? 'var(--color-primary)' : 'transparent',
        color: isActive ? 'var(--text-on-primary)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--weight-black)',
        fontSize: 'var(--text-xs)',
        transition: 'background .15s var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '20px'
      }
    }, it.icon), it.label);
  }));
}
Object.assign(__ds_scope, { QuickNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/QuickNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function TopBar({
  title,
  stars = 0,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      background: 'var(--surface-1)',
      border: '2px solid var(--border-strong)',
      borderRadius: 'var(--radius-xl)',
      padding: '14px 20px',
      boxShadow: '0 6px 0 var(--shadow-neutral)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      color: 'var(--cyan-300)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }
  }, actions, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-black)',
      background: 'var(--surface-2)',
      color: 'var(--amber-400)',
      border: '2px solid var(--amber-500)',
      borderRadius: 'var(--radius-pill)',
      padding: '8px 16px',
      fontSize: 'var(--text-sm)'
    }
  }, "\u2605 ", stars)));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/turbo-math-app/HomeScreen.jsx
try { (() => {
const {
  MenuCard,
  Badge,
  TopBar
} = window.TurboMathDesignSystem_fa0890;
const CATS = [{
  icon: '🏎️',
  title: 'Practice',
  desc: 'Counting, shapes & more',
  badge: 'PLAY',
  variant: 'default',
  screen: 'levels'
}, {
  icon: '🚀',
  title: 'SOAR Missions',
  desc: 'Hands-on car & food-truck activities',
  badge: 'EXPLORE',
  variant: 'accent',
  screen: 'soarMenu'
}, {
  icon: '🏁',
  title: 'Challenge',
  desc: 'Timed sprints, harder levels',
  badge: 'HARD',
  variant: 'reward',
  screen: null
}];
function HomeScreen({
  stars,
  trophies,
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "\uD83C\uDFCE\uFE0F Turbo Math",
    stars: stars
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      margin: '28px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-2xl)',
      color: 'var(--text-primary)'
    }
  }, "Race Through Counting, Shapes & More"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      color: 'var(--cyan-300)',
      marginTop: 6
    }
  }, "Pick a track and start your engines!")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 16,
      marginBottom: 28
    }
  }, CATS.map(c => /*#__PURE__*/React.createElement(MenuCard, {
    key: c.title,
    icon: c.icon,
    title: c.title,
    description: c.desc,
    variant: c.variant,
    badge: /*#__PURE__*/React.createElement(Badge, {
      variant: c.variant === 'default' ? 'primary' : c.variant
    }, c.badge),
    onClick: () => c.screen && onNavigate(c.screen)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-1)',
      border: '2px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--amber-400)',
      fontSize: 'var(--text-md)',
      marginBottom: 12
    }
  }, "\uD83C\uDFC6 Trophy Shelf"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, trophies.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.name,
    style: {
      textAlign: 'center',
      padding: '10px 14px',
      borderRadius: 'var(--radius-md)',
      background: t.earned ? 'rgba(255,176,32,0.14)' : 'var(--surface-2)',
      border: t.earned ? '2px solid var(--amber-500)' : '2px solid var(--border-subtle)',
      opacity: t.earned ? 1 : 0.45,
      minWidth: 84
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24
    }
  }, t.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 800,
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, t.name))))));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/turbo-math-app/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/turbo-math-app/LevelsScreen.jsx
try { (() => {
const {
  LevelTile,
  Button
} = window.TurboMathDesignSystem_fa0890;
const LEVELS = [{
  id: 1,
  icon: '🔧',
  stars: 3
}, {
  id: 2,
  icon: '⚙️',
  stars: 2
}, {
  id: 3,
  icon: '🏁',
  stars: 1
}, {
  id: 4,
  icon: '⚡',
  stars: 0,
  locked: false
}, {
  id: 5,
  icon: '🚀',
  locked: true
}, {
  id: 6,
  icon: '🛠️',
  locked: true
}];
function LevelsScreen({
  onNavigate,
  onPickLevel
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => onNavigate('home')
  }, "\uD83C\uDFE0 Home")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      color: 'var(--cyan-300)',
      marginBottom: 18
    }
  }, "Pick a Level \u2014 Counting"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(104px,1fr))',
      gap: 14
    }
  }, LEVELS.map(l => /*#__PURE__*/React.createElement(LevelTile, {
    key: l.id,
    icon: l.icon,
    label: `Level ${l.id}`,
    stars: l.stars,
    locked: l.locked,
    onClick: () => onPickLevel(l.id)
  }))));
}
window.LevelsScreen = LevelsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/turbo-math-app/LevelsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/turbo-math-app/QuizScreen.jsx
try { (() => {
const {
  IconButton,
  AnswerTile,
  QuizStatRow
} = window.TurboMathDesignSystem_fa0890;
const OBJECTS = ['🏎️', '🏎️', '🏎️', '🏎️'];
function QuizScreen({
  onNavigate,
  onFinish
}) {
  const [picked, setPicked] = React.useState(null);
  const [stats, setStats] = React.useState({
    correct: 0,
    wrong: 0
  });
  function pick(n) {
    if (picked !== null) return;
    setPicked(n);
    const isRight = n === OBJECTS.length;
    setStats(s => ({
      correct: s.correct + (isRight ? 1 : 0),
      wrong: s.wrong + (isRight ? 0 : 1)
    }));
    setTimeout(() => {
      isRight ? onFinish() : setPicked(null);
    }, 700);
  }
  const acc = stats.correct + stats.wrong === 0 ? 0 : Math.round(100 * stats.correct / (stats.correct + stats.wrong));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      flexWrap: 'wrap',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--cyan-300)',
      fontSize: 'var(--text-lg)'
    }
  }, "Counting \xB7 Lv 1 \u2014 1/5"), /*#__PURE__*/React.createElement(QuizStatRow, {
    correct: stats.correct,
    wrong: stats.wrong,
    accuracy: acc
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-1)',
      border: '3px solid var(--border-strong)',
      borderRadius: 'var(--radius-lg)',
      padding: 28,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      color: 'var(--text-primary)',
      marginBottom: 20
    }
  }, "How many race cars do you see?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 16,
      fontSize: 44,
      marginBottom: 24
    }
  }, OBJECTS.map((o, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, o))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 16
    }
  }, [3, 4, 5].map(n => /*#__PURE__*/React.createElement(AnswerTile, {
    key: n,
    onClick: () => pick(n),
    disabled: picked !== null,
    state: picked === n ? n === OBJECTS.length ? 'correct' : 'wrong' : 'default'
  }, n))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      width: 90
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "\uD83C\uDFE0",
    label: "Home",
    onClick: () => onNavigate('home')
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "\uD83D\uDCA1",
    label: "Hint",
    variant: "reward"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "\uD83D\uDD0A",
    label: "Read it",
    variant: "primary"
  })));
}
window.QuizScreen = QuizScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/turbo-math-app/QuizScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/turbo-math-app/ResultScreen.jsx
try { (() => {
const {
  Button,
  Modal
} = window.TurboMathDesignSystem_fa0890;
function ResultScreen({
  onNavigate
}) {
  const [showMilestone, setShowMilestone] = React.useState(true);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => onNavigate('home')
  }, "\uD83C\uDFE0 Home"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => onNavigate('levels')
  }, "\u2190 Levels")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-1)',
      border: '3px solid var(--amber-500)',
      borderRadius: 'var(--radius-xl)',
      padding: '40px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 72
    }
  }, "\uD83C\uDFC6"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-2xl)',
      color: 'var(--amber-400)',
      marginTop: 8
    }
  }, "Superstar Driver!"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 44,
      margin: '14px 0'
    }
  }, "\u2B50\u2B50\u2B50"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 14,
      marginTop: 20,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, "\uD83D\uDD01 Again"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => onNavigate('levels')
  }, "\uD83C\uDFAE Levels"))), /*#__PURE__*/React.createElement(Modal, {
    open: showMilestone,
    icon: "\uD83D\uDE80",
    title: "New Trophy!",
    subtitle: "You unlocked 'Number Wizard'",
    onClose: () => setShowMilestone(false)
  }));
}
window.ResultScreen = ResultScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/turbo-math-app/ResultScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/turbo-math-app/SoarActivityScreen.jsx
try { (() => {
const {
  Button,
  Badge
} = window.TurboMathDesignSystem_fa0890;
function SoarActivityScreen({
  activity,
  onNavigate,
  onDone
}) {
  const [done, setDone] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => onNavigate('home')
  }, "\uD83C\uDFE0 Home"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => onNavigate('soarMenu')
  }, "\u2190 Missions")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-1)',
      border: '3px solid var(--coral-500)',
      borderRadius: 'var(--radius-lg)',
      padding: 28,
      boxShadow: '0 8px 0 var(--shadow-accent)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 44
    }
  }, activity.icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      color: 'var(--text-primary)'
    }
  }, activity.title), /*#__PURE__*/React.createElement(Badge, {
    variant: "accent"
  }, activity.aim))), /*#__PURE__*/React.createElement("ol", {
    style: {
      fontFamily: 'var(--font-body)',
      color: 'var(--text-secondary)',
      lineHeight: 1.8,
      paddingLeft: 20
    }
  }, /*#__PURE__*/React.createElement("li", null, "Grab a few toy cars or trucks and find a clear spot on the floor."), /*#__PURE__*/React.createElement("li", null, "Set up the activity together \u2014 talk through what you're doing as you go."), /*#__PURE__*/React.createElement("li", null, "Ask: \"What do you notice? Can you do it a different way?\"")), /*#__PURE__*/React.createElement(Button, {
    variant: done ? 'ghost' : 'primary',
    onClick: () => {
      setDone(true);
      onDone && onDone();
    },
    disabled: done
  }, done ? '✓ Marked Done' : 'Mark Done')));
}
window.SoarActivityScreen = SoarActivityScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/turbo-math-app/SoarActivityScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/turbo-math-app/SoarMenuScreen.jsx
try { (() => {
const {
  Button
} = window.TurboMathDesignSystem_fa0890;
const SOAR_ACTIVITIES = [{
  id: 'beatClock',
  icon: '⏰',
  title: 'Beat the Clock',
  aim: 'Compare quantities and talk about time'
}, {
  id: 'dice',
  icon: '🎲',
  title: 'Dice Adventure',
  aim: 'Match numerals to amounts'
}, {
  id: 'patternMaking',
  icon: '🏁',
  title: 'Pattern Making',
  aim: 'Recognise and extend patterns'
}, {
  id: 'smallWorld',
  icon: '🏎️',
  title: 'Small World Play',
  aim: 'Use language of position and size'
}, {
  id: 'howLong',
  icon: '📏',
  title: 'How Long Are You?',
  aim: 'Compare length using everyday things'
}, {
  id: 'packing',
  icon: '📦',
  title: 'Packing',
  aim: 'Sort and classify objects'
}];
function SoarMenuScreen({
  onNavigate,
  onPickActivity
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => onNavigate('home')
  }, "\uD83C\uDFE0 Home")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      color: 'var(--coral-400)',
      marginBottom: 6
    }
  }, "\uD83D\uDE80 SOAR Missions"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      color: 'var(--text-secondary)',
      marginBottom: 20
    }
  }, "Hands-on car & food-truck activities to do together, away from the screen."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
      gap: 14
    }
  }, SOAR_ACTIVITIES.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    onClick: () => onPickActivity(a),
    style: {
      background: 'var(--surface-1)',
      border: '2px solid var(--border-strong)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px',
      cursor: 'pointer',
      boxShadow: '0 6px 0 var(--shadow-neutral)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 32,
      marginBottom: 8
    }
  }, a.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-base)',
      color: 'var(--text-primary)'
    }
  }, a.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, a.aim)))));
}
window.SoarMenuScreen = SoarMenuScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/turbo-math-app/SoarMenuScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.LevelTile = __ds_scope.LevelTile;

__ds_ns.MenuCard = __ds_scope.MenuCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.AnswerTile = __ds_scope.AnswerTile;

__ds_ns.QuizStatRow = __ds_scope.QuizStatRow;

__ds_ns.QuickNav = __ds_scope.QuickNav;

__ds_ns.TopBar = __ds_scope.TopBar;

})();
