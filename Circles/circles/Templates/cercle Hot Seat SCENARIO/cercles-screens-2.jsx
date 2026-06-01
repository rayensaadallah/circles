// cercles-screens-2.jsx — game flow screens (create / join / lobby / topic / debate / vote / scoring)

const { CCPlaceholder, CCAvatar, CCHeader, CCButton, CCCard, CCMark, CCLogo, CCTabBar } = window.CC;

// ─────────────────────────────────────────────────────────────
// SCREEN — CREATE CERCLE
// ─────────────────────────────────────────────────────────────
function ScreenCreate({ t }) {
  const accentList = Object.values(t.accents);
  const decks = [
    { name: 'Hot Takes', topics: 120, color: accentList[0], desc: 'Dating, money, taste.' },
    { name: 'Couples', topics: 60, color: accentList[3], desc: 'For 2-on-2 nights.' },
    { name: 'Workplace', topics: 80, color: accentList[2], desc: 'Spicy office debates.' },
    { name: 'Family', topics: 45, color: accentList[1], desc: 'Thanksgiving energy.' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'auto', paddingBottom: 24 }}>
      <div style={{ padding: '20px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 22, color: t.ink }}>←</div>
        <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing }}>New cercle</div>
      </div>

      {/* Cercle name */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: t.inkSoft, marginBottom: 10 }}>Name</div>
        <CCCard t={t} padding={16}>
          <div style={{ fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing }}>
            Tuesday Pub Night<span style={{ color: t.primary, animation: 'cc-blink 1s infinite' }}>|</span>
          </div>
        </CCCard>
      </div>

      {/* Mode */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: t.inkSoft, marginBottom: 10 }}>Mode</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Free-for-all', 'Teams', '1v1'].map((m, i) => (
            <CCCard key={i} t={t} padding={12} style={{
              flex: 1, textAlign: 'center',
              background: i === 0 ? t.ink : t.paper,
              color: i === 0 ? t.bg : t.ink,
            }}>
              <div style={{ fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 14, color: i === 0 ? t.bg : t.ink }}>{m}</div>
            </CCCard>
          ))}
        </div>
      </div>

      {/* Deck picker */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: t.inkSoft, marginBottom: 10 }}>Topic deck</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {decks.map((d, i) => (
            <CCCard key={i} t={t} padding={14} style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{
                width: 40, height: 40, borderRadius: t.radiusSm, background: d.color,
                marginBottom: 12,
                border: i === 0 ? `2px solid ${t.ink}` : 'none',
              }} />
              <div style={{ fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 16, color: t.ink, letterSpacing: t.letterSpacing }}>{d.name}</div>
              <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft, marginTop: 2 }}>{d.desc}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.inkSoft, marginTop: 8 }}>{d.topics} topics</div>
              {i === 0 && (
                <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: t.primary, color: t.primaryFg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>✓</div>
              )}
            </CCCard>
          ))}
        </div>
      </div>

      {/* Round settings */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: t.inkSoft, marginBottom: 10 }}>Round</div>
        <CCCard t={t} padding={0}>
          {[
            ['Speaking time', '60s'],
            ['Rounds', '5'],
            ['Voting', 'Anonymous'],
          ].map(([k, v], i, arr) => (
            <div key={k} style={{
              padding: '14px 16px', display: 'flex', justifyContent: 'space-between',
              borderBottom: i < arr.length - 1 ? `1px solid ${t.bgAlt}` : 'none',
            }}>
              <div style={{ fontFamily: t.fontBody, fontSize: 15, color: t.ink }}>{k}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 14, color: t.inkSoft, fontWeight: 600 }}>{v} ›</div>
            </div>
          ))}
        </CCCard>
      </div>

      <div style={{ padding: '20px' }}>
        <CCButton t={t} full size="lg">Create & open lobby</CCButton>
      </div>
      <style>{`@keyframes cc-blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — JOIN WITH CODE
// ─────────────────────────────────────────────────────────────
function ScreenJoin({ t }) {
  const code = ['M', 'A', 'N', 'G'];
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column', padding: '60px 24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 22, color: t.ink }}>←</div>
        <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing }}>Join cercle</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 28 }}>
        <div style={{
          fontFamily: t.fontMono, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
          color: t.inkSoft,
        }}>Enter the 4-letter code</div>

        <div style={{ display: 'flex', gap: 12 }}>
          {code.map((c, i) => (
            <div key={i} style={{
              width: 60, height: 76, borderRadius: t.radiusSm,
              background: c ? t.primary : t.paper,
              color: c ? t.primaryFg : t.ink,
              border: t.cardBorder !== 'none' ? t.cardBorder : `2px solid ${t.bgAlt}`,
              boxShadow: c && t.cardShadow.includes('#1a1410') ? '3px 3px 0 ' + t.ink : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: t.fontDisplay, fontWeight: t.displayWeight,
              fontSize: 44, letterSpacing: t.letterSpacing,
            }}>{c}</div>
          ))}
        </div>

        <div style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft, maxWidth: 280, lineHeight: 1.4 }}>
          The host can find this code on their lobby screen. It changes every game.
        </div>
      </div>

      {/* numpad-ish */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 16 }}>
        {'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').slice(0, 21).map(l => (
          <div key={l} style={{
            height: 44, borderRadius: 10, background: t.paper,
            border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 16, color: t.ink,
          }}>{l}</div>
        ))}
      </div>
      <CCButton t={t} full size="lg">Join cercle</CCButton>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — LOBBY (waiting for players)
// ─────────────────────────────────────────────────────────────
function ScreenLobby({ t, frame = 'host' }) {
  const accentList = Object.values(t.accents);
  const players = [
    { name: 'Kenza', color: accentList[0], host: true },
    { name: 'Adam', color: accentList[2] },
    { name: 'Yas', color: accentList[3] },
    { name: 'Imane', color: accentList[1] },
    { name: 'Reda', color: accentList[4] },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '20px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 22, color: t.ink }}>×</div>
        <CCLogo t={t} size={22} />
        <div style={{ fontSize: 22, color: t.ink }}>⋯</div>
      </div>

      {/* Code card */}
      <div style={{ padding: '12px 20px' }}>
        <CCCard t={t} padding={20} color={t.ink} style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: t.bg, opacity: 0.6 }}>Room code</div>
          <div style={{
            fontFamily: t.fontDisplay, fontWeight: t.displayWeight,
            fontSize: 76, lineHeight: 1, marginTop: 6, color: t.bg, letterSpacing: '0.06em',
          }}>MANG</div>
          <div style={{ fontFamily: t.fontBody, fontSize: 13, color: t.bg, opacity: 0.55, marginTop: 8 }}>
            cercles.app/MANG
          </div>
        </CCCard>
      </div>

      {/* Players */}
      <div style={{ padding: '12px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 18, color: t.ink, letterSpacing: t.letterSpacing }}>
          Players <span style={{ color: t.inkSoft, fontWeight: 500 }}>· {players.length}/8</span>
        </div>
        <div style={{ fontFamily: t.fontMono, fontSize: 12, color: t.inkSoft }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: 4,
            background: t.accents.lime, marginRight: 6,
          }} />Live
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflow: 'auto' }}>
        {players.map((p, i) => (
          <CCCard key={i} t={t} padding={12} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CCAvatar color={p.color} initial={p.name[0]} size={40} t={t} />
            <div style={{ flex: 1, fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 16, color: t.ink, letterSpacing: t.letterSpacing }}>{p.name}</div>
            {p.host && (
              <div style={{
                fontFamily: t.fontMono, fontSize: 10, fontWeight: 700, letterSpacing: 1,
                padding: '4px 8px', borderRadius: 6, background: t.accents.yellow, color: t.ink,
              }}>HOST</div>
            )}
            <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.accents.lime === t.primary ? t.inkSoft : t.inkSoft }}>ready</div>
          </CCCard>
        ))}
        {/* slot placeholder */}
        <div style={{
          padding: 14, borderRadius: t.radius, border: `1.5px dashed ${t.inkSoft}`,
          display: 'flex', alignItems: 'center', gap: 12, opacity: 0.7,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px dashed ${t.inkSoft}` }} />
          <div style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft }}>Waiting for player…</div>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <CCButton t={t} full size="lg">Start game</CCButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — TOPIC REVEAL (the moment a topic drops)
// ─────────────────────────────────────────────────────────────
function ScreenTopicReveal({ t }) {
  return (
    <div style={{ width: '100%', height: '100%', background: t.primary, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* big concentric rings emanating */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 393 852" preserveAspectRatio="xMidYMid slice">
        {[80, 160, 240, 320, 400, 480].map((r, i) => (
          <circle key={i} cx="196" cy="426" r={r} fill="none" stroke={t.primaryFg} strokeWidth="1.5" opacity={0.18 - i * 0.02} />
        ))}
      </svg>

      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: t.primaryFg, opacity: 0.85 }}>Round 3 of 5</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.primaryFg, opacity: 0.85 }}>HOT TAKES</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 32px', position: 'relative' }}>
        <div style={{
          fontFamily: t.fontMono, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
          color: t.primaryFg, opacity: 0.85, marginBottom: 18,
        }}>Topic</div>
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: t.displayWeight,
          fontSize: 48, lineHeight: 1, color: t.primaryFg, letterSpacing: '-0.03em',
        }}>
          Long-distance<br />relationships<br />never work.
        </div>
        <div style={{
          fontFamily: t.fontBody, fontSize: 15, color: t.primaryFg, opacity: 0.8,
          marginTop: 18, lineHeight: 1.45,
        }}>
          Two of you are arguing FOR. Two AGAINST. The rest vote.
        </div>
      </div>

      {/* sides */}
      <div style={{ padding: '0 24px 20px', position: 'relative' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, padding: 14, borderRadius: t.radius, background: t.primaryFg, color: t.ink }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: t.inkSoft }}>FOR</div>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 18, marginTop: 4, letterSpacing: t.letterSpacing }}>Kenza · Adam</div>
          </div>
          <div style={{ flex: 1, padding: 14, borderRadius: t.radius, background: 'transparent', color: t.primaryFg, border: `1.5px solid ${t.primaryFg}` }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.75 }}>AGAINST</div>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 18, marginTop: 4, letterSpacing: t.letterSpacing }}>Yas · Reda</div>
          </div>
        </div>
        <div style={{
          marginTop: 14, padding: 18, borderRadius: 999, background: t.ink, color: t.bg,
          fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 18, textAlign: 'center', letterSpacing: t.letterSpacing,
        }}>I'm ready · tap when everyone is</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — LIVE DEBATE (the dial timer)
// ─────────────────────────────────────────────────────────────
function ScreenDebate({ t, time = 38, total = 60, side = 'FOR' }) {
  const accentList = Object.values(t.accents);
  const pct = time / total;
  const radius = 110;
  const circ = 2 * Math.PI * radius;
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>R3 · LIVE</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} style={{
              width: 8, height: 8, borderRadius: 4,
              background: n <= 3 ? t.ink : 'transparent',
              border: `1.5px solid ${t.ink}`,
            }} />
          ))}
        </div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>MANG</div>
      </div>

      {/* topic chip */}
      <div style={{ padding: '4px 24px 0' }}>
        <div style={{
          padding: '10px 14px', borderRadius: t.radius,
          background: t.paper, border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
          fontFamily: t.fontDisplay, fontWeight: 500, fontSize: 17, color: t.ink, letterSpacing: t.letterSpacing,
          textAlign: 'center', lineHeight: 1.25,
        }}>"Long-distance relationships never work."</div>
      </div>

      {/* big dial */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg width="260" height="260" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r={radius} fill="none" stroke={t.bgAlt} strokeWidth="14" />
          <circle cx="130" cy="130" r={radius} fill="none" stroke={t.primary} strokeWidth="14" strokeLinecap="round"
            strokeDasharray={`${pct * circ} ${circ}`}
            transform="rotate(-90 130 130)" />
          {/* tick marks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const x1 = 130 + Math.cos(a) * (radius - 18);
            const y1 = 130 + Math.sin(a) * (radius - 18);
            const x2 = 130 + Math.cos(a) * (radius - 24);
            const y2 = 130 + Math.sin(a) * (radius - 24);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={t.inkSoft} strokeWidth="1.5" opacity="0.5" />;
          })}
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: t.inkSoft }}>Speaking</div>
          <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 80, lineHeight: 1, color: t.ink, letterSpacing: '-0.04em', marginTop: 4 }}>{time}s</div>
          <div style={{ marginTop: 8, padding: '6px 14px', borderRadius: 999, background: t.ink, color: t.bg, fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 14, display: 'inline-block', letterSpacing: t.letterSpacing }}>
            Adam · {side}
          </div>
        </div>
      </div>

      {/* speaking queue */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: t.inkSoft, marginBottom: 8 }}>Up next</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { n: 'Kenza', s: 'FOR', c: accentList[0] },
            { n: 'Yas', s: 'AGAINST', c: accentList[3] },
            { n: 'Reda', s: 'AGAINST', c: accentList[4] },
          ].map((p, i) => (
            <div key={i} style={{
              flex: 1, padding: 10, borderRadius: t.radius, background: t.paper,
              border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              <CCAvatar color={p.c} initial={p.n[0]} size={32} t={t} />
              <div style={{ fontFamily: t.fontBody, fontSize: 12, fontWeight: 600, color: t.ink }}>{p.n}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.inkSoft }}>{p.s}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px 24px', display: 'flex', gap: 10 }}>
        <CCButton t={t} variant="outline" style={{ flex: 1 }}>Pause</CCButton>
        <CCButton t={t} style={{ flex: 2 }}>Skip turn →</CCButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — VOTE (after debate ends, audience votes a side)
// ─────────────────────────────────────────────────────────────
function ScreenVote({ t, onNav = () => {} }) {
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>VOTE · ANONYMOUS</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 13, color: t.ink, fontWeight: 700 }}>0:08</div>
      </div>

      <div style={{ padding: '12px 24px 20px' }}>
        <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 28, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1.05 }}>
          Who made the better case?
        </div>
        <div style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft, marginTop: 8 }}>
          You can't vote for your own side.
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { side: 'FOR', team: 'Kenza · Adam', color: t.accents.coral, picked: true },
          { side: 'AGAINST', team: 'Yas · Reda', color: t.accents.cobalt, picked: false },
        ].map((s, i) => (
          <CCCard key={i} t={t} padding={0} style={{
            flex: 1, position: 'relative', overflow: 'hidden',
            background: s.picked ? s.color : t.paper,
            outline: s.picked ? `3px solid ${t.ink}` : 'none',
            cursor: 'pointer',
          }} onClick={() => onNav('tally')}>
            <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: s.picked ? t.primaryFg : t.ink }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, opacity: 0.7 }}>{s.side}</div>
              <div>
                <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 40, lineHeight: 1, letterSpacing: t.letterSpacing }}>{s.team}</div>
                <div style={{ fontFamily: t.fontBody, fontSize: 13, marginTop: 8, opacity: 0.8 }}>
                  {s.picked ? 'Tap again to confirm →' : 'Tap to vote'}
                </div>
              </div>
            </div>
            {/* corner mark */}
            <div style={{
              position: 'absolute', top: 14, right: 14,
              width: 28, height: 28, borderRadius: '50%',
              background: s.picked ? t.ink : 'transparent',
              border: s.picked ? 'none' : `1.5px solid ${t.inkSoft}`,
              color: s.picked ? t.bg : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700,
            }}>✓</div>
          </CCCard>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — SCOREBOARD (mid-game)
// ─────────────────────────────────────────────────────────────
function ScreenScore({ t }) {
  const accentList = Object.values(t.accents);
  const players = [
    { name: 'Kenza', color: accentList[0], score: 14, change: '+5' },
    { name: 'Adam', color: accentList[2], score: 11, change: '+3' },
    { name: 'Yas', color: accentList[3], score: 9, change: '+1' },
    { name: 'Imane', color: accentList[1], score: 7, change: '0' },
    { name: 'Reda', color: accentList[4], score: 4, change: '+1' },
  ];
  const max = players[0].score;
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 22, color: t.ink }}>×</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>SCOREBOARD</div>
        <div style={{ width: 22 }} />
      </div>

      <div style={{ padding: '12px 24px 20px' }}>
        <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 36, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1 }}>
          After round 3
        </div>
        <div style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft, marginTop: 6 }}>2 rounds to go.</div>
      </div>

      {/* podium */}
      <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
        {[1, 0, 2].map((idx, i) => {
          const p = players[idx];
          const heights = [120, 160, 90];
          const places = ['2', '1', '3'];
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <CCAvatar color={p.color} initial={p.name[0]} size={i === 1 ? 56 : 44} t={t} />
              <div style={{ fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 14, color: t.ink, letterSpacing: t.letterSpacing }}>{p.name}</div>
              <div style={{
                width: '100%', height: heights[i], borderRadius: `${t.radiusSm}px ${t.radiusSm}px 0 0`,
                background: i === 1 ? t.primary : t.paper,
                color: i === 1 ? t.primaryFg : t.ink,
                border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
                borderBottom: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: i === 1 ? 44 : 32, lineHeight: 1 }}>{places[i]}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 11, marginTop: 4, opacity: 0.8 }}>{p.score} pts</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, padding: '0 20px 20px', overflow: 'auto' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft, marginBottom: 8 }}>ALL PLAYERS</div>
        {players.map((p, i) => (
          <div key={i} style={{
            padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: `1px solid ${t.bgAlt}`,
          }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 13, color: t.inkSoft, width: 24 }}>{i + 1}</div>
            <CCAvatar color={p.color} initial={p.name[0]} size={32} t={t} />
            <div style={{ flex: 1, fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 15, color: t.ink, letterSpacing: t.letterSpacing }}>{p.name}</div>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: t.bgAlt, overflow: 'hidden' }}>
              <div style={{ width: `${(p.score / max) * 100}%`, height: '100%', background: p.color, borderRadius: 4 }} />
            </div>
            <div style={{ fontFamily: t.fontMono, fontSize: 13, fontWeight: 700, color: t.ink, width: 30, textAlign: 'right' }}>{p.score}</div>
            <div style={{
              fontFamily: t.fontMono, fontSize: 11, fontWeight: 700,
              color: p.change.startsWith('+') ? t.accents.lime : t.inkSoft, width: 30,
            }}>{p.change}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <CCButton t={t} full size="lg">Next round →</CCButton>
      </div>
    </div>
  );
}

window.CC = window.CC || {};
Object.assign(window.CC, {
  ScreenCreate, ScreenJoin, ScreenLobby, ScreenTopicReveal, ScreenDebate, ScreenVote, ScreenScore,
});
