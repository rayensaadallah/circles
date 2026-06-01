// cercles-screens.jsx — Screen components for Cercles, theme-aware.
// Each screen takes a `t` (theme) prop and returns a 100%-fill JSX subtree
// that's meant to be slotted inside an iOS or Android device frame's content
// area. Screens deliberately avoid fixed pixel sizes so they look right in
// either bezel.

const { useState, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────
// Tiny shared bits
// ─────────────────────────────────────────────────────────────

// A square placeholder block — used wherever a real photo/avatar/illustration
// would go. Striped + monospaced caption per the house style.
function CCPlaceholder({ label = 'photo', t, w = '100%', h = 120, radius, tone = 'paper' }) {
  const bg = tone === 'paper' ? t.paper : t.bgAlt;
  return (
    <div style={{
      width: w, height: h,
      borderRadius: radius ?? t.radiusSm,
      background: `repeating-linear-gradient(45deg, ${bg} 0 8px, ${t.bgAlt} 8px 16px)`,
      border: `1px dashed ${t.inkSoft}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: t.fontMono, fontSize: 10, color: t.inkSoft, letterSpacing: 0.5,
      textTransform: 'uppercase',
    }}>{label}</div>
  );
}

// Filled circular avatar dot — solid color, optional initial
function CCAvatar({ color, initial, size = 36, t, ring = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: t.primaryFg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: t.fontDisplay, fontWeight: 700, fontSize: size * 0.42,
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 3px ${t.bg}, 0 0 0 5px ${color}` : 'none',
    }}>{initial}</div>
  );
}

// Header row used inside many screens. Title left, action right.
function CCHeader({ title, action, t, large = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 20px 14px',
    }}>
      <div style={{
        fontFamily: t.fontDisplay, fontWeight: t.displayWeight,
        fontSize: large ? 32 : 24, color: t.ink,
        letterSpacing: t.letterSpacing,
      }}>{title}</div>
      {action}
    </div>
  );
}

function CCButton({ children, t, variant = 'primary', full = false, size = 'md', style = {} }) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isOutline = variant === 'outline';
  const h = size === 'lg' ? 56 : size === 'sm' ? 36 : 48;
  const fs = size === 'lg' ? 18 : size === 'sm' ? 14 : 16;
  return (
    <button style={{
      height: h, padding: `0 ${size === 'sm' ? 14 : 22}px`,
      borderRadius: 999,
      width: full ? '100%' : 'auto',
      fontFamily: t.fontDisplay, fontWeight: 600, fontSize: fs,
      letterSpacing: t.letterSpacing,
      border: isPrimary ? (t.cardBorder !== 'none' ? t.cardBorder : 'none') : isOutline ? `1.5px solid ${t.ink}` : 'none',
      background: isPrimary ? t.primary : isGhost ? 'transparent' : 'transparent',
      color: isPrimary ? t.primaryFg : t.ink,
      boxShadow: isPrimary && t.cardShadow.includes('#1a1410') ? '3px 3px 0 ' + t.ink : 'none',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...style,
    }}>{children}</button>
  );
}

// Card wrapper that adapts to theme — Block Party gets hard shadow + border,
// Soft Circle gets soft shadow, Arena gets glassy border.
function CCCard({ children, t, padding = 18, style = {}, color, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: color || t.paper,
      borderRadius: t.radius,
      border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
      boxShadow: t.cardShadow,
      padding,
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// 0. Brandmark — circle of dots with one filled
// ─────────────────────────────────────────────────────────────
function CCMark({ t, size = 56, accent }) {
  const c = accent || t.primary;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
  const dots = 8;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: dots }).map((_, i) => {
        const a = (i / dots) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        const filled = i === 0;
        return (
          <circle key={i} cx={x} cy={y} r={filled ? 5 : 3}
            fill={filled ? c : t.ink} opacity={filled ? 1 : 0.7} />
        );
      })}
    </svg>
  );
}

// Wordmark with mark
function CCLogo({ t, size = 32, accent, mono = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CCMark t={t} size={size} accent={accent} />
      <div style={{
        fontFamily: t.fontDisplay, fontWeight: t.displayWeight,
        fontSize: size * 0.62, color: t.ink, letterSpacing: '-0.04em',
      }}>cercles</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 1 — SPLASH / WELCOME
// ─────────────────────────────────────────────────────────────
function ScreenSplash({ t, onNav = () => {} }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: t.bg,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      paddingTop: 80, paddingBottom: 40,
    }}>
      {/* concentric rings backdrop */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 393 852" preserveAspectRatio="xMidYMid slice">
        {[60, 120, 180, 240, 300, 360].map((r, i) => (
          <circle key={i} cx="196" cy="280" r={r}
            fill="none"
            stroke={Object.values(t.accents)[i % 5]}
            strokeWidth={i === 0 ? 2.5 : 1.5}
            strokeDasharray={i % 2 ? '4 6' : 'none'}
            opacity={0.85 - i * 0.1}
          />
        ))}
        {/* dots around outermost ring */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x = 196 + Math.cos(a) * 360;
          const y = 280 + Math.sin(a) * 360;
          return <circle key={'d'+i} cx={x} cy={y} r="6" fill={Object.values(t.accents)[i % 5]} />;
        })}
      </svg>

      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 32px' }}>
        <CCMark t={t} size={88} />
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: t.displayWeight,
          fontSize: 64, lineHeight: 0.95, color: t.ink,
          letterSpacing: '-0.04em', marginTop: 24, textAlign: 'center',
        }}>cercles</div>
        <div style={{
          fontFamily: t.fontBody, fontSize: 16, color: t.inkSoft,
          marginTop: 14, textAlign: 'center', maxWidth: 280, lineHeight: 1.4,
        }}>The debate game for friends who actually talk to each other.</div>
      </div>

      <div style={{ position: 'relative', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div onClick={() => onNav('home')}><CCButton t={t} full size="lg">Start a cercle</CCButton></div>
        <div onClick={() => onNav('join')}><CCButton t={t} variant="outline" full size="lg">Join with code</CCButton></div>
        <div style={{
          textAlign: 'center', fontFamily: t.fontBody, fontSize: 13,
          color: t.inkSoft, marginTop: 6,
        }}>Already playing? <span style={{ color: t.ink, fontWeight: 600 }}>Sign in</span></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 2 — ONBOARDING (3-step "how to play")
// ─────────────────────────────────────────────────────────────
function ScreenOnboarding({ t, onNav = () => {} }) {
  const accentList = Object.values(t.accents);
  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg,
      display: 'flex', flexDirection: 'column', padding: '80px 24px 28px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (

            <div key={i} style={{
              width: i === 1 ? 24 : 8, height: 8, borderRadius: 4,
              background: i === 1 ? t.ink : t.inkSoft, opacity: i === 1 ? 1 : 0.3,
            }} />
          ))}
        </div>
        <div onClick={() => onNav('home')} style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft, cursor: 'pointer' }}>Skip</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 32 }}>
        {/* Visual: people forming a circle */}
        <div style={{ position: 'relative', width: 240, height: 240 }}>
          <svg viewBox="0 0 240 240" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="120" cy="120" r="92" fill="none" stroke={t.ink} strokeWidth="1.5" strokeDasharray="3 6" opacity="0.4" />
          </svg>
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const x = 120 + Math.cos(a) * 92 - 24;
            const y = 120 + Math.sin(a) * 92 - 24;
            return (
              <div key={i} style={{ position: 'absolute', left: x, top: y }}>
                <CCAvatar color={accentList[i % 5]} initial={'ABCDEF'[i]} size={48} t={t} />
              </div>
            );
          })}
          {/* center prompt */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: t.primary, color: t.primaryFg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 36,
              border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
              boxShadow: t.cardShadow.includes('#1a1410') ? '3px 3px 0 ' + t.ink : 'none',
            }}>?</div>
          </div>
        </div>

        <div>
          <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 32, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1.05 }}>
            Sit in a circle.<br />Phones at the ready.
          </div>
          <div style={{ fontFamily: t.fontBody, fontSize: 15, color: t.inkSoft, marginTop: 12, lineHeight: 1.45, maxWidth: 300 }}>
            One host creates a room. Everyone else joins with a 4-letter code. The app picks a topic and runs the rules.
          </div>
        </div>
      </div>

      <div onClick={() => onNav('home')}><CCButton t={t} full size="lg">Continue</CCButton></div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 3 — HOME (My cercles, recent rounds, big CTA)
// ─────────────────────────────────────────────────────────────
function ScreenHome({ t, onNav = () => {} }) {
  const accentList = Object.values(t.accents);
  const cercles = [
    { name: 'Roommates', members: 4, color: accentList[0], last: 'Tue · Pineapple pizza' },
    { name: 'Soccer crew', members: 7, color: accentList[2], last: 'Sat · Tipping culture' },
    { name: 'Sunday dinner', members: 5, color: accentList[3], last: 'Sun · Open relationships' },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg,
      display: 'flex', flexDirection: 'column', overflow: 'auto', paddingBottom: 80,
    }}>
      <div style={{ padding: '64px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CCLogo t={t} size={28} />
        <div style={{ display: 'flex', gap: 10 }}>
          <div onClick={() => onNav('notifs')} style={{ cursor: 'pointer' }}><CCAvatar color={t.ink} initial="🔔" size={36} t={t} /></div>
          <div onClick={() => onNav('profile')} style={{ cursor: 'pointer' }}><CCAvatar color={accentList[1]} initial="K" size={36} t={t} /></div>
        </div>
      </div>

      {/* Hero CTA */}
      <div style={{ padding: '20px' }} onClick={() => onNav('create')}>
        <CCCard t={t} padding={0} color={t.primary} style={{ overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
          <div style={{ padding: 20, color: t.primaryFg, position: 'relative', zIndex: 1 }}>
            <div style={{
              fontFamily: t.fontMono, fontSize: 11, letterSpacing: 1.5,
              textTransform: 'uppercase', opacity: 0.8,
            }}>Tonight</div>
            <div style={{
              fontFamily: t.fontDisplay, fontWeight: t.displayWeight,
              fontSize: 36, lineHeight: 1, marginTop: 8, letterSpacing: t.letterSpacing,
            }}>Start a new<br />cercle →</div>
            <div style={{
              fontFamily: t.fontBody, fontSize: 14, marginTop: 14, opacity: 0.85, maxWidth: 220,
            }}>Pick a deck, invite the room, debate it out.</div>
          </div>
          {/* decorative rings */}
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', right: -60, top: -40, opacity: 0.25 }}>
            {[40, 60, 80, 100].map((r, i) => (
              <circle key={i} cx="90" cy="90" r={r} fill="none" stroke={t.primaryFg} strokeWidth="1.5" />
            ))}
          </svg>
        </CCCard>
      </div>

      {/* My cercles */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 18, color: t.ink, letterSpacing: t.letterSpacing }}>Your cercles</div>
          <div style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft }}>See all</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cercles.map((c, i) => (
            <CCCard key={i} t={t} padding={14} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: c.color, color: t.primaryFg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 22,
                position: 'relative', flexShrink: 0,
              }}>
                {c.name[0]}
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 22, height: 22, borderRadius: '50%',
                  background: t.bg, color: t.ink,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: t.fontMono, fontSize: 11, fontWeight: 700,
                  border: `1.5px solid ${t.ink}`,
                }}>{c.members}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 17, color: t.ink, letterSpacing: t.letterSpacing }}>{c.name}</div>
                <div style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft, marginTop: 2 }}>{c.last}</div>
              </div>
              <div style={{ fontSize: 22, color: t.inkSoft }}>›</div>
            </CCCard>
          ))}
        </div>
      </div>

      {/* Quick action */}
      <div style={{ padding: '20px' }} onClick={() => onNav('join')}>
        <CCCard t={t} padding={16} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: t.accents.lime,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 22, color: t.ink,
          }}>#</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 16, color: t.ink, letterSpacing: t.letterSpacing }}>Join with code</div>
            <div style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft }}>4 letters from your host</div>
          </div>
          <div style={{ fontSize: 22, color: t.inkSoft }}>›</div>
        </CCCard>
      </div>

      {/* tab bar */}
      <CCTabBar t={t} active="home" onNav={onNav} />
    </div>
  );
}

function CCTabBar({ t, active = 'home', onNav = () => {} }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: '◉' },
    { id: 'discover', label: 'Decks', icon: '⌗' },
    { id: 'play', label: 'Play', icon: '▶', primary: true },
    { id: 'history', label: 'History', icon: '≡' },
    { id: 'profile', label: 'You', icon: '◐' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 34, left: 16, right: 16,
      height: 64,
      background: t.paper,
      borderRadius: 999,
      border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
      boxShadow: t.cardShadow,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 8px',
    }}>
      {tabs.map(tab => {
        const r = { home: 'home', discover: 'discover', play: 'create', history: 'profile', profile: 'profile' }[tab.id];
        return (
        <div key={tab.id} onClick={() => onNav(r)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          color: tab.id === active ? t.ink : t.inkSoft, padding: '6px 8px',
          position: 'relative', cursor: 'pointer',
        }}>
          {tab.primary ? (
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: t.primary, color: t.primaryFg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, marginTop: -16,
              border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
              boxShadow: t.cardShadow.includes('#1a1410') ? '2px 2px 0 ' + t.ink : 'none',
            }}>{tab.icon}</div>
          ) : (
            <div style={{ fontSize: 18 }}>{tab.icon}</div>
          )}
          <div style={{ fontFamily: t.fontBody, fontSize: 10, fontWeight: 600 }}>{tab.label}</div>
        </div>
      );})}
    </div>
  );
}

window.CC = window.CC || {};
Object.assign(window.CC, {
  CCPlaceholder, CCAvatar, CCHeader, CCButton, CCCard, CCMark, CCLogo, CCTabBar,
  ScreenSplash, ScreenOnboarding, ScreenHome,
});
