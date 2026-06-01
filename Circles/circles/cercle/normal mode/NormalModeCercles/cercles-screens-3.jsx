// cercles-screens-3.jsx — peripheral screens (results / profile / discover / notifications / settings)

const { CCPlaceholder, CCAvatar, CCHeader, CCButton, CCCard, CCMark, CCLogo, CCTabBar } = window.CC;

// ─────────────────────────────────────────────────────────────
// SCREEN — RESULTS (end of game)
// ─────────────────────────────────────────────────────────────
function ScreenResults({ t }) {
  const accentList = Object.values(t.accents);
  const winner = { name: 'Kenza', color: accentList[0], score: 24, badge: 'Most convincing' };
  const stats = [
    { label: 'Best take', value: '"Pineapple is structural"' },
    { label: 'Hot streak', value: 'Adam · 3 wins' },
    { label: 'Spiciest topic', value: 'Tipping' },
    { label: 'Closest vote', value: '3-2 · R4' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* hero */}
      <div style={{
        padding: '24px 20px 32px', position: 'relative', overflow: 'hidden',
        background: winner.color,
      }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 393 360" preserveAspectRatio="xMidYMid slice">
          {[80, 140, 200, 260].map((r, i) => (
            <circle key={i} cx="196" cy="200" r={r} fill="none" stroke={t.primaryFg} strokeWidth="1.5" opacity={0.18 - i * 0.03} />
          ))}
        </svg>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: t.primaryFg, opacity: 0.8 }}>Tonight's champion</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: 14 }}>
            <CCAvatar color={t.ink} initial={winner.name[0]} size={88} t={t} />
            <div>
              <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 48, lineHeight: 0.95, color: t.primaryFg, letterSpacing: '-0.03em' }}>{winner.name}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 13, color: t.primaryFg, marginTop: 6, opacity: 0.85 }}>{winner.score} pts · {winner.badge}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {stats.map((s, i) => (
          <CCCard key={i} t={t} padding={14}>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: t.inkSoft }}>{s.label}</div>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 16, color: t.ink, marginTop: 8, letterSpacing: t.letterSpacing, lineHeight: 1.15 }}>{s.value}</div>
          </CCCard>
        ))}
      </div>

      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft, marginBottom: 8 }}>RECAP</div>
        <CCCard t={t} padding={0}>
          {[
            ['R1', 'Pineapple pizza', 'FOR'],
            ['R2', 'Tipping should die', 'AGAINST'],
            ['R3', 'Long distance', 'FOR'],
            ['R4', 'Open relationships', 'AGAINST'],
            ['R5', 'Pets in restaurants', 'FOR'],
          ].map(([r, topic, won], i, arr) => (
            <div key={i} style={{
              padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < arr.length - 1 ? `1px solid ${t.bgAlt}` : 'none',
            }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.inkSoft, width: 22 }}>{r}</div>
              <div style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14, color: t.ink }}>{topic}</div>
              <div style={{
                fontFamily: t.fontMono, fontSize: 10, fontWeight: 700, letterSpacing: 1,
                padding: '4px 8px', borderRadius: 6,
                background: won === 'FOR' ? t.accents.lime : t.accents.cobalt,
                color: t.ink,
              }}>{won}</div>
            </div>
          ))}
        </CCCard>
      </div>

      <div style={{ padding: '12px 20px 28px', display: 'flex', gap: 10 }}>
        <CCButton t={t} variant="outline" style={{ flex: 1 }}>Share recap</CCButton>
        <CCButton t={t} style={{ flex: 1 }}>Run it back</CCButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — PROFILE
// ─────────────────────────────────────────────────────────────
function ScreenProfile({ t }) {
  const accentList = Object.values(t.accents);
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'auto', paddingBottom: 80 }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing }}>You</div>
        <div style={{ fontSize: 22, color: t.ink }}>⚙</div>
      </div>

      {/* identity */}
      <div style={{ padding: '0 20px' }}>
        <CCCard t={t} padding={20} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CCAvatar color={accentList[1]} initial="K" size={72} t={t} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 26, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1 }}>Kenza</div>
            <div style={{ fontFamily: t.fontMono, fontSize: 12, color: t.inkSoft, marginTop: 4 }}>@kenza · joined Apr</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[t.accents.coral, t.accents.lime, t.accents.cobalt, t.accents.yellow, t.accents.plum].map((c, i) => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: t.cardBorder !== 'none' ? `1px solid ${t.ink}` : 'none' }} />
              ))}
            </div>
          </div>
        </CCCard>
      </div>

      {/* stat row */}
      <div style={{ padding: '12px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[['Games', '37'], ['Wins', '14'], ['Win rate', '38%']].map(([l, v], i) => (
          <CCCard key={i} t={t} padding={14} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 26, color: t.ink, letterSpacing: t.letterSpacing }}>{v}</div>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.inkSoft, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
          </CCCard>
        ))}
      </div>

      {/* badges */}
      <div style={{ padding: '12px 20px 8px' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft, marginBottom: 10 }}>BADGES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { n: 'Hot Take', c: t.accents.coral, i: '🔥' },
            { n: 'Closer', c: t.accents.lime, i: '⌗' },
            { n: 'Devil', c: t.accents.plum, i: '◈' },
            { n: 'Vote', c: t.accents.cobalt, i: '◉' },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: t.radiusSm,
                background: b.c, color: t.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 22,
                border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
                boxShadow: t.cardShadow.includes('#1a1410') ? '2px 2px 0 ' + t.ink : t.cardShadow,
              }}>{b.i}</div>
              <div style={{ fontFamily: t.fontBody, fontSize: 11, fontWeight: 600, color: t.ink }}>{b.n}</div>
            </div>
          ))}
        </div>
      </div>

      {/* recent games */}
      <div style={{ padding: '12px 20px 8px' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft, marginBottom: 10 }}>HISTORY</div>
        <CCCard t={t} padding={0}>
          {[
            ['Tue', 'Roommates', '2nd · 11pts'],
            ['Sat', 'Soccer crew', '1st · 24pts'],
            ['Sun', 'Sunday dinner', '3rd · 8pts'],
          ].map(([d, c, s], i, arr) => (
            <div key={i} style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < arr.length - 1 ? `1px solid ${t.bgAlt}` : 'none',
            }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.inkSoft, width: 28 }}>{d}</div>
              <div style={{ flex: 1, fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 15, color: t.ink, letterSpacing: t.letterSpacing }}>{c}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 12, color: t.inkSoft }}>{s}</div>
            </div>
          ))}
        </CCCard>
      </div>

      <CCTabBar t={t} active="profile" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — DISCOVER (decks browse)
// ─────────────────────────────────────────────────────────────
function ScreenDiscover({ t }) {
  const accentList = Object.values(t.accents);
  const featured = { name: 'Hot Takes 2026', topics: 120, color: accentList[0], desc: 'The original. Wedding etiquette to AI.' };
  const decks = [
    { name: 'Couples', topics: 60, color: accentList[3] },
    { name: 'Workplace', topics: 80, color: accentList[2] },
    { name: 'Family', topics: 45, color: accentList[1] },
    { name: 'Travel', topics: 38, color: accentList[4] },
    { name: 'Money', topics: 52, color: accentList[0] },
    { name: 'Movies', topics: 64, color: accentList[2] },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'auto', paddingBottom: 80 }}>
      <CCHeader title="Decks" t={t} large action={<div style={{ fontSize: 20, color: t.ink }}>⌕</div>} />

      {/* category chips */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {['All', 'Spicy', 'Mild', 'New', 'Pro', 'Couples'].map((c, i) => (
          <div key={c} style={{
            padding: '8px 14px', borderRadius: 999,
            background: i === 0 ? t.ink : t.paper,
            color: i === 0 ? t.bg : t.ink,
            border: t.cardBorder !== 'none' && i !== 0 ? t.cardBorder : 'none',
            fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 13, letterSpacing: t.letterSpacing,
            whiteSpace: 'nowrap',
          }}>{c}</div>
        ))}
      </div>

      {/* featured */}
      <div style={{ padding: '0 20px 14px' }}>
        <CCCard t={t} padding={0} color={featured.color} style={{ overflow: 'hidden', position: 'relative' }}>
          <div style={{ padding: 20, color: t.ink, position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.7 }}>Featured</div>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 32, lineHeight: 1, marginTop: 8, letterSpacing: t.letterSpacing }}>{featured.name}</div>
            <div style={{ fontFamily: t.fontBody, fontSize: 14, marginTop: 12, opacity: 0.85, maxWidth: 240 }}>{featured.desc}</div>
            <div style={{ marginTop: 18, padding: '10px 16px', borderRadius: 999, background: t.ink, color: t.bg, fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 14, display: 'inline-block', letterSpacing: t.letterSpacing }}>Open · {featured.topics} topics</div>
          </div>
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ position: 'absolute', right: -30, top: -30, opacity: 0.35 }}>
            {[30, 50, 70].map((r, i) => (
              <circle key={i} cx="80" cy="80" r={r} fill="none" stroke={t.ink} strokeWidth="2" />
            ))}
          </svg>
        </CCCard>
      </div>

      <div style={{ padding: '0 20px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {decks.map((d, i) => (
          <CCCard key={i} t={t} padding={14} onClick={() => onNav('create')} style={{ cursor: 'pointer' }}>
            <div style={{
              width: '100%', aspectRatio: '1.5', borderRadius: t.radiusSm,
              background: d.color, marginBottom: 10, position: 'relative', overflow: 'hidden',
            }}>
              <svg viewBox="0 0 100 67" style={{ position: 'absolute', inset: 0 }}>
                {[16, 24, 32].map((r, j) => (
                  <circle key={j} cx={70} cy={20} r={r} fill="none" stroke={t.ink} strokeWidth="0.8" opacity="0.4" />
                ))}
              </svg>
            </div>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 16, color: t.ink, letterSpacing: t.letterSpacing }}>{d.name}</div>
            <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.inkSoft, marginTop: 2 }}>{d.topics} topics</div>
          </CCCard>
        ))}
      </div>
      <CCTabBar t={t} active="discover" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
function ScreenNotifications({ t }) {
  const accentList = Object.values(t.accents);
  const notifs = [
    { who: 'Adam', what: 'started a cercle in Roommates', when: '2m', color: accentList[2], live: true },
    { who: 'Yas', what: 'voted in your debate', when: '14m', color: accentList[3] },
    { who: 'Imane', what: 'sent you the "Spicy Family" deck', when: '1h', color: accentList[1] },
    { who: 'Reda', what: 'wants to rematch', when: '3h', color: accentList[4] },
    { who: 'cercles', what: 'New deck: Travel · 38 topics', when: '1d', color: t.ink },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <CCHeader title="Activity" t={t} large action={<div style={{ fontFamily: t.fontMono, fontSize: 12, color: t.inkSoft }}>Mark read</div>} />

      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8 }}>
        {['All', 'Mentions', 'Invites'].map((c, i) => (
          <div key={c} style={{
            padding: '6px 12px', borderRadius: 999,
            background: i === 0 ? t.ink : 'transparent',
            color: i === 0 ? t.bg : t.ink,
            border: i === 0 ? 'none' : `1.5px solid ${t.inkSoft}`,
            fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 13,
          }}>{c}</div>
        ))}
      </div>

      <div style={{ padding: '0 20px', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifs.map((n, i) => (
          <CCCard key={i} t={t} padding={14} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CCAvatar color={n.color} initial={n.who[0].toUpperCase()} size={40} t={t} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.fontBody, fontSize: 14, color: t.ink, lineHeight: 1.35 }}>
                <span style={{ fontWeight: 700 }}>{n.who}</span> {n.what}
              </div>
              <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.inkSoft, marginTop: 4 }}>{n.when}</div>
            </div>
            {n.live ? (
              <div style={{
                padding: '6px 10px', borderRadius: 999,
                background: t.primary, color: t.primaryFg,
                fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 11, letterSpacing: 1,
                border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
              }}>JOIN →</div>
            ) : (
              <div style={{ width: 8, height: 8, borderRadius: 4, background: t.primary }} />
            )}
          </CCCard>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — SETTINGS
// ─────────────────────────────────────────────────────────────
function ScreenSettings({ t }) {
  const groups = [
    { title: 'Account', items: [
      ['Display name', 'Kenza'],
      ['Username', '@kenza'],
      ['Avatar color', '◉'],
    ]},
    { title: 'Game', items: [
      ['Default speaking time', '60s'],
      ['Vibration on timer', 'On'],
      ['Spicy topics', 'Allowed'],
    ]},
    { title: 'Privacy', items: [
      ['Anonymous voting', 'Always'],
      ['Recap sharing', 'Friends only'],
      ['Block list', '0 people'],
    ]},
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'auto', paddingBottom: 28 }}>
      <div style={{ padding: '20px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 22, color: t.ink }}>←</div>
        <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing }}>Settings</div>
      </div>

      {groups.map((g, gi) => (
        <div key={gi} style={{ padding: '16px 20px 0' }}>
          <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: t.inkSoft, marginBottom: 10 }}>{g.title}</div>
          <CCCard t={t} padding={0}>
            {g.items.map(([k, v], i, arr) => (
              <div key={i} style={{
                padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: i < arr.length - 1 ? `1px solid ${t.bgAlt}` : 'none',
              }}>
                <div style={{ fontFamily: t.fontBody, fontSize: 15, color: t.ink }}>{k}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 13, color: t.inkSoft }}>{v} ›</div>
              </div>
            ))}
          </CCCard>
        </div>
      ))}

      <div style={{ padding: '24px 20px 0' }}>
        <CCButton t={t} variant="outline" full>Sign out</CCButton>
      </div>
    </div>
  );
}

window.CC = window.CC || {};
Object.assign(window.CC, {
  ScreenResults, ScreenProfile, ScreenDiscover, ScreenNotifications, ScreenSettings,
});
