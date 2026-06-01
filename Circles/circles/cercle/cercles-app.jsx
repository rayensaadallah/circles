// cercles-app.jsx — main entry. Wires the design canvas (3 directions × full screen set on iOS+Android)
// + the interactive prototype tab into a single page.

const { useState: caUseState, useMemo: caUseMemo } = React;

// Wrap a screen in either an iOS or Android device frame. Returned at native
// device size; the design canvas's DCArtboard handles the framing/zoom.
function FramedScreen({ device, theme, screen, dark = false }) {
  const inner = (
    <div className="cc-screen" style={{ width: '100%', height: '100%' }}>
      {screen}
    </div>
  );
  if (device === 'ios') {
    return (
      <window.IOSDevice width={393} height={852} dark={dark}>{inner}</window.IOSDevice>
    );
  }
  return (
    <window.AndroidDevice width={412} height={892} dark={dark}>{inner}</window.AndroidDevice>
  );
}

const SCREEN_ORDER = [
  { id: 'splash', name: 'Splash', make: t => <window.CC.ScreenSplash t={t} /> },
  { id: 'onboarding', name: 'Onboarding', make: t => <window.CC.ScreenOnboarding t={t} /> },
  { id: 'home', name: 'Home', make: t => <window.CC.ScreenHome t={t} /> },
  { id: 'create', name: 'Create', make: t => <window.CC.ScreenCreate t={t} /> },
  { id: 'join', name: 'Join code', make: t => <window.CC.ScreenJoin t={t} /> },
  { id: 'lobby', name: 'Lobby', make: t => <window.CC.ScreenLobby t={t} /> },
  { id: 'topic', name: 'Topic reveal', make: t => <window.CC.ScreenTopicReveal t={t} /> },
  { id: 'debate', name: 'Live debate', make: t => <window.CC.ScreenDebate t={t} /> },
  { id: 'vote', name: 'Vote', make: t => <window.CC.ScreenVote t={t} /> },
  { id: 'score', name: 'Scoreboard', make: t => <window.CC.ScreenScore t={t} /> },
  { id: 'results', name: 'Results', make: t => <window.CC.ScreenResults t={t} /> },
  { id: 'profile', name: 'Profile', make: t => <window.CC.ScreenProfile t={t} /> },
  { id: 'discover', name: 'Discover', make: t => <window.CC.ScreenDiscover t={t} /> },
  { id: 'notifs', name: 'Notifications', make: t => <window.CC.ScreenNotifications t={t} /> },
  { id: 'settings', name: 'Settings', make: t => <window.CC.ScreenSettings t={t} /> },
];

const DIRECTIONS = ['blockParty', 'arena', 'softCircle'];

// A direction header card (one per direction section in the canvas)
function DirectionHeader({ themeKey, t }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16,
      padding: '32px 36px',
      background: t.bg, color: t.ink,
      border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
      borderRadius: 24, width: 720,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
        <window.CC.CCMark t={t} size={56} />
        <div>
          <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: t.inkSoft }}>Direction · {DIRECTIONS.indexOf(themeKey) + 1} of 3</div>
          <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 44, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1, marginTop: 4 }}>{t.name}</div>
          <div style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft, marginTop: 6 }}>{t.tagline}</div>
        </div>
      </div>
      {/* swatches */}
      <div style={{ display: 'flex', gap: 6, position: 'relative', zIndex: 1 }}>
        {Object.entries(t.accents).map(([k, c]) => (
          <div key={k} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 10px', borderRadius: 999,
            background: t.paper, border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
            fontFamily: t.fontMono, fontSize: 11, color: t.ink,
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            {k}
          </div>
        ))}
      </div>
      {/* concentric ring decoration */}
      <svg width="320" height="320" viewBox="0 0 320 320" style={{ position: 'absolute', right: -80, top: -60, opacity: 0.18 }}>
        {[60, 100, 140, 180].map((r, i) => (
          <circle key={i} cx="160" cy="160" r={r} fill="none" stroke={t.ink} strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  );
}

function CerclesApp() {
  const [tab, setTab] = caUseState('canvas'); // canvas | prototype

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(240,238,233,0.92)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <window.CC.CCMark t={window.CERCLES_THEMES.blockParty} size={28} />
          <div>
            <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 18, color: '#1a1410', letterSpacing: '-0.02em', lineHeight: 1 }}>cercles</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(26,20,16,0.6)', marginTop: 2, letterSpacing: 1, textTransform: 'uppercase' }}>Mobile design exploration</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, padding: 4, background: 'rgba(26,20,16,0.06)', borderRadius: 999 }}>
          {[['canvas', 'Design canvas'], ['prototype', 'Prototype']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: tab === id ? '#1a1410' : 'transparent',
              color: tab === id ? '#f4ecd8' : '#1a1410',
              fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: 13,
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'canvas' ? (
        <window.DesignCanvas>
          {/* For each direction, two sections — iOS row + Android row. */}
          {DIRECTIONS.flatMap(themeKey => {
            const t = window.CERCLES_THEMES[themeKey];
            return [
              <window.DCSection key={themeKey + '-header'} id={themeKey + '-header'} title={t.name} subtitle={t.tagline}>
                <window.DCArtboard id={themeKey + '-direction'} label="Direction" width={720} height={260}>
                  <DirectionHeader themeKey={themeKey} t={t} />
                </window.DCArtboard>
              </window.DCSection>,
              <window.DCSection key={themeKey + '-ios'} id={themeKey + '-ios'} title={t.name + ' · iOS'} subtitle="iPhone 15 · 393×852">
                {SCREEN_ORDER.map(s => (
                  <window.DCArtboard key={s.id} id={`${themeKey}-ios-${s.id}`} label={s.name} width={393} height={852}>
                    <FramedScreen device="ios" theme={t} screen={s.make(t)} dark={false} />
                  </window.DCArtboard>
                ))}
              </window.DCSection>,
              <window.DCSection key={themeKey + '-android'} id={themeKey + '-android'} title={t.name + ' · Android'} subtitle="Pixel · 412×892">
                {SCREEN_ORDER.map(s => (
                  <window.DCArtboard key={s.id} id={`${themeKey}-android-${s.id}`} label={s.name} width={412} height={892}>
                    <FramedScreen device="android" theme={t} screen={s.make(t)} dark={false} />
                  </window.DCArtboard>
                ))}
              </window.DCSection>,
            ];
          })}
        </window.DesignCanvas>
      ) : (
        <window.CerclesPrototype />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CerclesApp />);
