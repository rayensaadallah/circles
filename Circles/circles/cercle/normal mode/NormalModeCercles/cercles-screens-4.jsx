// cercles-screens-4.jsx — post-vote game-flow screens
// Replaces the old #7-#10 idea with the real Cercles loop:
//   Vote split → Tally → branches into HotSeat (lopsided) or RoundRobin (balanced)
//                     → HotSeatVerdict / Revote → Attribution → Score
//
// All screens are theme-aware (`t` prop) and slot inside an iOS or Android
// frame. They reuse CC* primitives from cercles-screens.jsx.

const { CCPlaceholder: CC4Placeholder, CCAvatar: CC4Avatar, CCHeader: CC4Header,
        CCButton: CC4Button, CCCard: CC4Card, CCMark: CC4Mark, CCLogo: CC4Logo } = window.CC;

const { useState: s4UseState, useEffect: s4UseEffect, useRef: s4UseRef } = React;

// ─────────────────────────────────────────────────────────────
// Shared cast — used across all post-vote screens so names + colors stay
// consistent across the flow.
// ─────────────────────────────────────────────────────────────
function cast(t) {
  const a = Object.values(t.accents);
  return [
    { id: 'kenza', name: 'Kenza', color: a[0], side: 'FOR' },
    { id: 'adam',  name: 'Adam',  color: a[2], side: 'FOR' },
    { id: 'yas',   name: 'Yas',   color: a[3], side: 'AGAINST' },
    { id: 'imane', name: 'Imane', color: a[1], side: 'AGAINST' },
    { id: 'reda',  name: 'Reda',  color: a[4], side: 'AGAINST' },
  ];
}

// Tiny "FOR/AGAINST" pill
function SidePill({ t, side, filled = false }) {
  const isFor = side === 'FOR';
  const c = isFor ? t.accents.lime : t.accents.cobalt;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 9px', borderRadius: 999,
      background: filled ? c : 'transparent',
      border: filled ? 'none' : `1.5px solid ${c}`,
      color: filled ? t.ink : t.ink,
      fontFamily: t.fontMono, fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
    }}>{side}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — TALLY (right after Vote). Routes to HotSeat or RoundRobin.
// Big visual: split bar, FOR vs AGAINST. Mode badge.
// ─────────────────────────────────────────────────────────────
function ScreenTally({ t, onNav = () => {} }) {
  const players = cast(t);
  const fors = players.filter(p => p.side === 'FOR');
  const ags  = players.filter(p => p.side === 'AGAINST');
  const isHotSeat = fors.length === 1 || ags.length === 1;
  const lone = fors.length === 1 ? fors[0] : (ags.length === 1 ? ags[0] : null);

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      {/* status bar */}
      <div style={{ padding: '20px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>R3 · TALLY</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>MANG</div>
      </div>

      {/* topic chip */}
      <div style={{ padding: '8px 20px 4px' }}>
        <div style={{
          padding: '10px 14px', borderRadius: t.radius, background: t.paper,
          border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
          fontFamily: t.fontDisplay, fontWeight: 500, fontSize: 15, color: t.ink,
          letterSpacing: t.letterSpacing, textAlign: 'center',
        }}>"Long-distance relationships never work."</div>
      </div>

      {/* Headline */}
      <div style={{ padding: '14px 24px 6px' }}>
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 30,
          color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1.02,
        }}>The room has<br />spoken.</div>
        <div style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft, marginTop: 6 }}>
          Here's how everyone voted.
        </div>
      </div>

      {/* Split bar */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          display: 'flex', height: 64, borderRadius: t.radius, overflow: 'hidden',
          border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
          boxShadow: t.cardShadow.includes('#1a1410') ? '3px 3px 0 ' + t.ink : 'none',
        }}>
          <div style={{
            flex: fors.length, background: t.accents.lime, color: t.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 14,
          }}>
            <div>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, opacity: 0.75 }}>FOR</div>
              <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 28, lineHeight: 1, letterSpacing: t.letterSpacing }}>{fors.length}</div>
            </div>
          </div>
          <div style={{
            flex: ags.length, background: t.accents.cobalt, color: t.primaryFg,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 14,
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, opacity: 0.75 }}>AGAINST</div>
              <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 28, lineHeight: 1, letterSpacing: t.letterSpacing }}>{ags.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns of voters */}
      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 10 }}>
        {[
          { label: 'FOR', list: fors, c: t.accents.lime },
          { label: 'AGAINST', list: ags, c: t.accents.cobalt },
        ].map((col, ci) => (
          <CC4Card key={ci} t={t} padding={12} style={{ flex: 1 }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.inkSoft, marginBottom: 8 }}>{col.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.list.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CC4Avatar color={p.color} initial={p.name[0]} size={26} t={t} />
                  <div style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 600, color: t.ink }}>{p.name}</div>
                </div>
              ))}
            </div>
          </CC4Card>
        ))}
      </div>

      {/* Mode badge */}
      <div style={{ flex: 1, padding: '16px 20px 0', display: 'flex', alignItems: 'flex-end' }}>
        <CC4Card t={t} padding={16} color={isHotSeat ? t.primary : t.ink} style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* mode glyph */}
            {isHotSeat ? (
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke={t.primaryFg} strokeWidth="1.5" strokeDasharray="3 4" />
                <circle cx="28" cy="28" r="9" fill={t.primaryFg} />
              </svg>
            ) : (
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke={t.bg} strokeWidth="1.5" />
                {[0,1,2,3,4].map(i => {
                  const a = (i/5) * Math.PI*2 - Math.PI/2;
                  return <circle key={i} cx={28+Math.cos(a)*16} cy={28+Math.sin(a)*16} r="4" fill={t.bg} />;
                })}
              </svg>
            )}
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: t.fontMono, fontSize: 10, letterSpacing: 2,
                color: isHotSeat ? t.primaryFg : t.bg, opacity: 0.75,
              }}>MODE · {isHotSeat ? '1 vs MANY' : 'BALANCED'}</div>
              <div style={{
                fontFamily: t.fontDisplay, fontWeight: t.displayWeight,
                fontSize: 24, lineHeight: 1, marginTop: 4, letterSpacing: t.letterSpacing,
                color: isHotSeat ? t.primaryFg : t.bg,
              }}>{isHotSeat ? 'Hot Seat' : 'Round Robin'}</div>
              <div style={{
                fontFamily: t.fontBody, fontSize: 12, marginTop: 6,
                color: isHotSeat ? t.primaryFg : t.bg, opacity: 0.85, lineHeight: 1.35,
              }}>
                {isHotSeat
                  ? <>{lone?.name} sits in the center. Everyone else challenges them.</>
                  : <>FOR speaks first, then AGAINST. Then we revote.</>}
              </div>
            </div>
          </div>
        </CC4Card>
      </div>

      <div style={{ padding: '14px 20px 24px' }}>
        <div onClick={() => onNav(isHotSeat ? 'hotseat' : 'roundrobin')}>
          <CC4Button t={t} full size="lg">Start {isHotSeat ? 'Hot Seat' : 'Round Robin'} →</CC4Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — HOT SEAT
// Scenario: Yas is alone AGAINST. Kenza is convincing her.
// Same circle layout for everyone. The "now speaking" card sits at bottom and
// expands fullscreen when tapped/swiped up. Bottom panel changes per role:
//   • yas       — only "Kenza convinced me" + timer
//   • speaker   — kenza's POV: "Surrender" + "Yas is convinced" + countdown
//   • spectator — adam/imane/reda: live "now speaking" card + "Vote Kenza out"
//   • signup    — "Who wants to talk to Yas?" — yes/skip (shown at start or after vote-out)
// ─────────────────────────────────────────────────────────────
function ScreenHotSeat({ t, onNav = () => {} }) {
  const players = cast(t);
  const hotSeat = players.find(p => p.id === 'yas');
  const others = players.filter(p => p.id !== 'yas');
  const challenger = players.find(p => p.id === 'kenza');

  // role: which screen are we previewing? expanded: speaker card fullscreen?
  const [role, setRole] = s4UseState('spectator'); // spectator | yas | speaker | signup
  const [expanded, setExpanded] = s4UseState(false);

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* status bar */}
      <div style={{ padding: '20px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>R3 · HOT SEAT</div>
        <div style={{
          fontFamily: t.fontMono, fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
          padding: '3px 8px', borderRadius: 6, background: t.primary, color: t.primaryFg,
        }}>1 VS {others.length}</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.inkSoft }}>0:42</div>
      </div>

      {/* role preview toggle */}
      <div style={{ padding: '4px 16px 6px', display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          ['yas', 'Yas (hot seat)'],
          ['speaker', 'Kenza (speaker)'],
          ['spectator', 'Spectator'],
          ['signup', 'Signup'],
        ].map(([id, label]) => (
          <div key={id} onClick={() => { setRole(id); setExpanded(false); }} style={{
            padding: '4px 10px', borderRadius: 999,
            background: role === id ? t.ink : 'transparent',
            color: role === id ? t.bg : t.inkSoft,
            border: role === id ? 'none' : `1px solid ${t.inkSoft}`,
            fontFamily: t.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: 1, cursor: 'pointer',
          }}>{label}</div>
        ))}
      </div>

      {/* topic */}
      <div style={{ padding: '4px 20px 0', textAlign: 'center' }}>
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: 500, fontSize: 14, color: t.inkSoft,
          letterSpacing: t.letterSpacing,
        }}>"Long-distance relationships never work."</div>
      </div>

      {/* Circle visual */}
      <div style={{ flex: 1, padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
        <CircleDiagram
          t={t}
          hotSeat={hotSeat}
          others={others}
          challengerId={role === 'signup' ? null : challenger.id}
          highlightYou={role === 'yas' ? 'yas' : role === 'speaker' ? 'kenza' : null}
          size={290}
        />
      </div>

      {/* Bottom panel — role-specific */}
      <div style={{ padding: '8px 20px 20px' }}>
        {role === 'yas'       && <YasPanel       t={t} challenger={challenger} onNav={onNav} />}
        {role === 'speaker'   && <SpeakerPanel   t={t} hotSeat={hotSeat} onNav={onNav} />}
        {role === 'spectator' && (
          <SpeakerCard t={t} challenger={challenger} hotSeat={hotSeat}
            onExpand={() => setExpanded(true)} />
        )}
        {role === 'signup' && <SignupPanel t={t} hotSeat={hotSeat} onNav={onNav} />}
      </div>

      {/* Expanded speaker focus overlay (spectator) */}
      {expanded && role === 'spectator' && (
        <ExpandedSpeaker t={t} challenger={challenger} hotSeat={hotSeat}
          onClose={() => setExpanded(false)} onNav={onNav} />
      )}
    </div>
  );
}

// ─── Role panels ────────────────────────────────────────────

// YAS — minimal: timer + "Kenza convinced me"
function YasPanel({ t, challenger, onNav }) {
  return (
    <div>
      <CC4Card t={t} padding={16} style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.inkSoft }}>
          {challenger.name.toUpperCase()} IS SPEAKING
        </div>
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 56,
          color: t.ink, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 6,
        }}>0:42</div>
        <div style={{
          marginTop: 8, height: 6, borderRadius: 3, background: t.bgAlt, overflow: 'hidden',
        }}>
          <div style={{ width: '70%', height: '100%', background: t.primary }} />
        </div>
      </CC4Card>
      <div onClick={() => onNav('attribution')} style={{ marginTop: 10 }}>
        <button style={{
          width: '100%', height: 76, borderRadius: t.radius,
          background: t.accents.lime, color: t.ink,
          border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
          boxShadow: t.cardShadow.includes('#1a1410') ? '4px 4px 0 ' + t.ink : t.cardShadow,
          fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 22, letterSpacing: t.letterSpacing,
          cursor: 'pointer',
        }}>{challenger.name} convinced me ↻</button>
      </div>
    </div>
  );
}

// KENZA / SPEAKER — countdown + surrender / yas convinced me
function SpeakerPanel({ t, hotSeat, onNav }) {
  return (
    <div>
      <CC4Card t={t} padding={16} color={t.primary} style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.primaryFg, opacity: 0.85 }}>YOU HAVE THE FLOOR · TIME LEFT</div>
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 64,
          color: t.primaryFg, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 6,
        }}>0:42</div>
      </CC4Card>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <div style={{ flex: 1 }} onClick={() => onNav('hotseat-verdict')}>
          <CC4Button t={t} variant="outline" full>Surrender</CC4Button>
        </div>
        <div style={{ flex: 2 }} onClick={() => onNav('attribution')}>
          <CC4Button t={t} full>{hotSeat.name} is convinced ✓</CC4Button>
        </div>
      </div>
    </div>
  );
}

// SPECTATOR — "now speaking" card with vote-kenza-out button. Tap to expand.
function SpeakerCard({ t, challenger, hotSeat, onExpand }) {
  return (
    <div>
      <CC4Card t={t} padding={0} onClick={onExpand} style={{ cursor: 'pointer', overflow: 'hidden' }}>
        <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <CC4Avatar color={challenger.color} initial={challenger.name[0]} size={44} t={t} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.inkSoft }}>NOW SPEAKING</div>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 18, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1 }}>{challenger.name}</div>
            <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.inkSoft, marginTop: 3 }}>convincing {hotSeat.name}</div>
          </div>
          <div style={{
            padding: '6px 10px', borderRadius: 999, background: t.ink, color: t.bg,
            fontFamily: t.fontMono, fontWeight: 700, fontSize: 13, letterSpacing: 1,
          }}>0:42</div>
        </div>
        {/* swipe affordance */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 6 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: t.inkSoft, opacity: 0.4 }} />
        </div>
      </CC4Card>
      <button onClick={(e) => e.stopPropagation()} style={{
        width: '100%', marginTop: 10, height: 56, borderRadius: 999,
        background: t.accents.coral, color: t.ink,
        border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
        boxShadow: t.cardShadow.includes('#1a1410') ? '3px 3px 0 ' + t.ink : 'none',
        fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 16, letterSpacing: t.letterSpacing,
        cursor: 'pointer',
      }}>Vote {challenger.name} out ✕</button>
    </div>
  );
}

// EXPANDED — fullscreen take-over of the speaker card
function ExpandedSpeaker({ t, challenger, hotSeat, onClose, onNav }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 10,
      display: 'flex', flexDirection: 'column',
      animation: 'cc-slide-up 0.28s ease-out',
    }}>
      {/* drag handle */}
      <div onClick={onClose} style={{
        padding: '14px 0 10px', display: 'flex', justifyContent: 'center', cursor: 'pointer',
      }}>
        <div style={{ width: 48, height: 5, borderRadius: 3, background: t.inkSoft, opacity: 0.5 }} />
      </div>

      <div style={{ padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>NOW SPEAKING</div>
        <div onClick={onClose} style={{ fontSize: 22, color: t.ink, cursor: 'pointer' }}>×</div>
      </div>

      {/* Big speaker focus */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', position: 'relative' }}>
        {/* concentric rings */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 393 600" preserveAspectRatio="xMidYMid slice">
          {[100, 160, 220, 280, 340].map((r, i) => (
            <circle key={i} cx="196" cy="280" r={r} fill="none" stroke={challenger.color} strokeWidth="1.5" opacity={0.3 - i * 0.04} />
          ))}
        </svg>
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            width: 160, height: 160, borderRadius: '50%', background: challenger.color,
            color: t.primaryFg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 76,
            border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
            boxShadow: `0 0 0 4px ${t.bg}, 0 0 0 6px ${t.ink}`,
            margin: '0 auto',
          }}>{challenger.name[0]}</div>
          <div style={{
            fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 56,
            color: t.ink, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 20,
          }}>{challenger.name}</div>
          <div style={{
            fontFamily: t.fontBody, fontSize: 15, color: t.inkSoft, marginTop: 8,
          }}>convincing <span style={{ color: t.ink, fontWeight: 700 }}>{hotSeat.name}</span></div>
          <div style={{
            fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 80,
            color: t.ink, letterSpacing: '-0.04em', marginTop: 20, lineHeight: 1,
          }}>0:42</div>
          <div style={{
            marginTop: 10, width: 200, height: 8, borderRadius: 4, background: t.bgAlt, overflow: 'hidden', margin: '10px auto 0',
          }}>
            <div style={{ width: '70%', height: '100%', background: t.primary }} />
          </div>
        </div>
      </div>

      {/* big vote-out CTA */}
      <div style={{ padding: '0 20px 28px' }}>
        <button onClick={() => onNav('hotseat-verdict')} style={{
          width: '100%', height: 76, borderRadius: t.radius,
          background: t.accents.coral, color: t.ink,
          border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
          boxShadow: t.cardShadow.includes('#1a1410') ? '4px 4px 0 ' + t.ink : t.cardShadow,
          fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 22, letterSpacing: t.letterSpacing,
          cursor: 'pointer',
        }}>Vote {challenger.name} out ✕</button>
      </div>

      <style>{`@keyframes cc-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}

// SIGNUP — "Who wants to talk to Yas?" yes/skip
function SignupPanel({ t, hotSeat, onNav }) {
  return (
    <div>
      <div style={{
        textAlign: 'center', fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 22,
        color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1.1, marginBottom: 12,
      }}>Who wants to talk to {hotSeat.name}?</div>
      <button onClick={() => onNav('hotseat')} style={{
        width: '100%', height: 92, borderRadius: t.radius,
        background: t.primary, color: t.primaryFg,
        border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
        boxShadow: t.cardShadow.includes('#1a1410') ? '4px 4px 0 ' + t.ink : t.cardShadow,
        fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 26, letterSpacing: t.letterSpacing,
        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      }}>
        <div>YES, I'LL GO</div>
        <div style={{ fontFamily: t.fontBody, fontWeight: 500, fontSize: 12, opacity: 0.85 }}>
          First tap gets the floor
        </div>
      </button>
      <div style={{ marginTop: 8 }}>
        <CC4Button t={t} variant="ghost" full>Skip — let someone else</CC4Button>
      </div>
    </div>
  );
}

// The circle of avatars with hot seat in middle
function CircleDiagram({ t, hotSeat, others, challengerId, highlightYou = null, size = 300 }) {
  const r = size / 2 - 32;
  // ring around the "you" avatar — could be Yas (center) or Kenza (in ring)
  const youIsHotSeat = highlightYou === hotSeat.id;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* outer dashed ring */}
      <svg viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.ink} strokeWidth="1.2" strokeDasharray="3 5" opacity="0.35" />
        {/* connector lines from each other to center, brighten challenger */}
        {others.map((p, i) => {
          const a = (i / others.length) * Math.PI * 2 - Math.PI / 2;
          const x = size/2 + Math.cos(a) * r;
          const y = size/2 + Math.sin(a) * r;
          const isChal = p.id === challengerId;
          return (
            <line key={p.id}
              x1={size/2} y1={size/2} x2={x} y2={y}
              stroke={isChal ? t.primary : t.inkSoft}
              strokeWidth={isChal ? 2.5 : 1}
              opacity={isChal ? 1 : 0.2}
              strokeDasharray={isChal ? 'none' : '2 4'} />
          );
        })}
      </svg>

      {/* others around */}
      {others.map((p, i) => {
        const a = (i / others.length) * Math.PI * 2 - Math.PI / 2;
        const x = size/2 + Math.cos(a) * r - 26;
        const y = size/2 + Math.sin(a) * r - 26;
        const isChal = p.id === challengerId;
        const isYou = highlightYou === p.id;
        return (
          <div key={p.id} style={{ position: 'absolute', left: x, top: y, textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: p.color,
              color: t.primaryFg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 22,
              boxShadow: isChal ? `0 0 0 3px ${t.bg}, 0 0 0 6px ${t.primary}` : 'none',
              outline: isYou ? `2px dashed ${t.ink}` : 'none', outlineOffset: 4,
              transition: 'box-shadow 0.2s',
            }}>{p.name[0]}</div>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, color: isChal || isYou ? t.ink : t.inkSoft, marginTop: 4, fontWeight: isChal || isYou ? 700 : 500 }}>{isYou ? 'YOU' : p.name}</div>
          </div>
        );
      })}

      {/* hot seat — center */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', background: hotSeat.color,
            color: t.primaryFg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 38,
            border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
            boxShadow: `0 0 0 3px ${t.bg}, 0 0 0 5px ${t.ink}`,
            outline: youIsHotSeat ? `2px dashed ${t.ink}` : 'none', outlineOffset: 8,
            margin: '0 auto',
            position: 'relative',
          }}>
            {hotSeat.name[0]}
            {/* pulsing dot */}
            <div style={{
              position: 'absolute', top: -2, right: -2,
              width: 16, height: 16, borderRadius: '50%', background: t.primary,
              border: `2px solid ${t.bg}`, animation: 'cc-pulse 1.4s ease-in-out infinite',
            }} />
          </div>
          <div style={{
            fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 16, color: t.ink,
            marginTop: 6, letterSpacing: t.letterSpacing,
          }}>{youIsHotSeat ? 'YOU' : hotSeat.name}</div>
          <div style={{
            fontFamily: t.fontMono, fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
            color: t.ink, opacity: 0.6, marginTop: 2,
          }}>HOT SEAT · {hotSeat.side}</div>
        </div>
      </div>
      <style>{`@keyframes cc-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.4; } }`}</style>
    </div>
  );
}

// Old HostPanel/ChallengerPanel/WaitingPanel kept for backwards compat (not used).
function HostPanel({ t, hotSeat, challenger, onNav }) {
  return (
    <CC4Card t={t} padding={14}>
      <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.inkSoft }}>NOW SPEAKING</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <CC4Avatar color={challenger.color} initial={challenger.name[0]} size={36} t={t} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 16, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1 }}>{challenger.name}</div>
          <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft, marginTop: 2 }}>
            is trying to convince <span style={{ fontWeight: 700, color: t.ink }}>{hotSeat.name}</span>
          </div>
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: 999, background: t.ink, color: t.bg,
          fontFamily: t.fontMono, fontWeight: 700, fontSize: 13, letterSpacing: 1,
        }}>0:42</div>
      </div>
      <div onClick={() => onNav('hotseat-verdict')} style={{ marginTop: 12 }}>
        <CC4Button t={t} full>End round → vote</CC4Button>
      </div>
    </CC4Card>
  );
}

function ChallengerPanel({ t, hotSeat, challenger, onNav }) {
  return (
    <div>
      <CC4Card t={t} padding={16} color={t.primary} style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.primaryFg, opacity: 0.85 }}>YOU HAVE THE FLOOR</div>
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 26,
          color: t.primaryFg, letterSpacing: t.letterSpacing, marginTop: 6, lineHeight: 1,
        }}>Convince {hotSeat.name}.</div>
        <div style={{ fontFamily: t.fontBody, fontSize: 13, color: t.primaryFg, opacity: 0.85, marginTop: 8 }}>
          Speak now. The room votes when you finish.
        </div>
        {/* live timer */}
        <div style={{
          marginTop: 12, padding: '8px 0', borderTop: `1px solid ${t.primaryFg}40`,
          fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 36, color: t.primaryFg, letterSpacing: t.letterSpacing,
        }}>0:42</div>
      </CC4Card>
      <div onClick={() => onNav('hotseat-verdict')} style={{ marginTop: 10 }}>
        <CC4Button t={t} variant="outline" full>I'm done</CC4Button>
      </div>
    </div>
  );
}

function WaitingPanel({ t, hotSeat, setChallenger, setView, others }) {
  return (
    <div>
      <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.inkSoft, marginBottom: 8, textAlign: 'center' }}>
        WAITING — {hotSeat.name} is in the hot seat
      </div>
      {/* Big challenge button */}
      <button onClick={() => { setChallenger(others[1]); setView('challenger'); }} style={{
        width: '100%', height: 100, borderRadius: t.radius,
        background: t.primary, color: t.primaryFg,
        border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
        boxShadow: t.cardShadow.includes('#1a1410') ? '4px 4px 0 ' + t.ink : t.cardShadow,
        fontFamily: t.fontDisplay, fontWeight: t.displayWeight,
        fontSize: 28, letterSpacing: t.letterSpacing, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
      }}>
        <div>CHALLENGE</div>
        <div style={{ fontFamily: t.fontBody, fontWeight: 500, fontSize: 12, opacity: 0.85 }}>
          First tap gets the floor
        </div>
      </button>
      <div style={{
        marginTop: 10, padding: 12, borderRadius: t.radius, background: t.paper,
        border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
        fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft, textAlign: 'center', lineHeight: 1.4,
      }}>
        Tap to grab the mic. Listen to {hotSeat.name}'s answer, then make your case.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — HOT SEAT VERDICT
// After a challenger speaks: did the hot seat flip, or do we vote them out?
// ─────────────────────────────────────────────────────────────
function ScreenHotSeatVerdict({ t, onNav = () => {} }) {
  const players = cast(t);
  const hotSeat = players.find(p => p.id === 'yas');
  const challenger = players.find(p => p.id === 'kenza');
  // demo state — voting in progress, "vote out" leading
  const [pick, setPick] = s4UseState(null); // null | 'flipped' | 'voteout'

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>R3 · VERDICT</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.ink, fontWeight: 700 }}>0:08</div>
      </div>

      {/* duel header */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 14, borderRadius: t.radius, background: t.paper,
          border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
          boxShadow: t.cardShadow.includes('#1a1410') ? '3px 3px 0 ' + t.ink : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CC4Avatar color={challenger.color} initial={challenger.name[0]} size={42} t={t} />
            <div>
              <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 16, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1 }}>{challenger.name}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.inkSoft, marginTop: 3, letterSpacing: 1 }}>CHALLENGER</div>
            </div>
          </div>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 18, fontWeight: 700, color: t.inkSoft }}>vs</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: 'row-reverse' }}>
            <CC4Avatar color={hotSeat.color} initial={hotSeat.name[0]} size={42} t={t} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 16, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1 }}>{hotSeat.name}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.inkSoft, marginTop: 3, letterSpacing: 1 }}>HOT SEAT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Q */}
      <div style={{ padding: '20px 24px 8px' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>EVERYONE BUT {hotSeat.name.toUpperCase()} VOTES</div>
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 30,
          color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1.05, marginTop: 8,
        }}>Vote {challenger.name} Out ?</div>
      </div>

      {/* the two big choices */}
      <div style={{ flex: 1, padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          {
            id: 'flipped',
            label: "Yes, let's reassinge somone else ",
            sub: `${hotSeat.name} crosses the floor. Round ends, ${challenger.name} scores.`,
            color: t.accents.lime,
            icon: '↻',
          },
          {
            id: 'voteout',
            label: 'No — vote here/him out',
            sub: 'Next challenger steps up. Pressure stays on.',
            color: t.accents.coral,
            icon: '✕',
          },
        ].map(opt => (
          <CC4Card key={opt.id} t={t} padding={0} onClick={() => setPick(opt.id)} style={{
            flex: 1, cursor: 'pointer', overflow: 'hidden',
            background: pick === opt.id ? opt.color : t.paper,
            outline: pick === opt.id ? `3px solid ${t.ink}` : 'none',
          }}>
            <div style={{
              padding: 18, height: '100%',
              display: 'flex', alignItems: 'center', gap: 14,
              color: pick === opt.id ? t.ink : t.ink,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: pick === opt.id ? t.ink : opt.color,
                color: pick === opt.id ? t.bg : t.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 24, flexShrink: 0,
              }}>{opt.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1.05 }}>{opt.label}</div>
                <div style={{ fontFamily: t.fontBody, fontSize: 12, color: pick === opt.id ? t.ink : t.inkSoft, marginTop: 4, opacity: pick === opt.id ? 0.85 : 1, lineHeight: 1.35 }}>{opt.sub}</div>
              </div>
            </div>
          </CC4Card>
        ))}
      </div>

      {/* Live tally */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.inkSoft, marginBottom: 8 }}>LIVE — 3 OF 4 VOTED</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, height: 10, borderRadius: 5, background: t.bgAlt, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '33%', background: t.accents.lime }} />
            <div style={{ width: '67%', background: t.accents.coral }} />
          </div>
          <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.inkSoft, fontWeight: 600 }}>1·2</div>
        </div>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <div onClick={() => onNav(pick === 'flipped' ? 'attribution' : 'hotseat')}>
          <CC4Button t={t} full size="lg">{pick === 'flipped' ? 'Lock in — they flipped' : pick === 'voteout' ? 'ock in — vote out' : 'Lock my vote'}</CC4Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — ROUND ROBIN
// Balanced split. Show queue of speakers (FOR first, then AGAINST), spotlight current.
// ─────────────────────────────────────────────────────────────
function ScreenRoundRobin({ t, onNav = () => {} }) {
  const players = cast(t);
  const fors = players.filter(p => p.side === 'FOR');
  const ags  = players.filter(p => p.side === 'AGAINST');
  // Queue: all FOR first, then all AGAINST
  const queue = [...fors, ...ags];
  const [current, setCurrent] = s4UseState(1); // index into queue — 2nd person is up
  const speaker = queue[current];

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      {/* status bar */}
      <div style={{ padding: '20px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>R3 · ROUND ROBIN</div>
        <div style={{
          fontFamily: t.fontMono, fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
          padding: '3px 8px', borderRadius: 6, background: t.ink, color: t.bg,
        }}>{fors.length} VS {ags.length}</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.inkSoft }}>MANG</div>
      </div>

      {/* topic */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{
          padding: '10px 14px', borderRadius: t.radius, background: t.paper,
          border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
          fontFamily: t.fontDisplay, fontWeight: 500, fontSize: 14, color: t.ink,
          letterSpacing: t.letterSpacing, textAlign: 'center',
        }}>"Long-distance relationships never work."</div>
      </div>

      {/* Phase tabs */}
      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8 }}>
        {[
          { label: 'FOR speaks', n: fors.length, c: t.accents.lime, active: current < fors.length },
          { label: 'AGAINST speaks', n: ags.length, c: t.accents.cobalt, active: current >= fors.length },
        ].map((ph, i) => (
          <div key={i} style={{
            flex: 1, padding: 12, borderRadius: t.radius,
            background: ph.active ? ph.c : t.paper,
            border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
            color: t.ink,
          }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, opacity: 0.7 }}>PHASE {i + 1}</div>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 16, marginTop: 2, letterSpacing: t.letterSpacing }}>{ph.label}</div>
            <div style={{ fontFamily: t.fontMono, fontSize: 11, opacity: 0.7, marginTop: 2 }}>{ph.n} {ph.n === 1 ? 'speaker' : 'speakers'}</div>
          </div>
        ))}
      </div>

      {/* Spotlight current */}
      <div style={{ flex: 1, padding: '14px 20px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <CC4Card t={t} padding={0} color={speaker.color} style={{ overflow: 'hidden', position: 'relative' }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', right: -40, top: -30, opacity: 0.25 }}>
            {[40, 60, 80].map((r, i) => (
              <circle key={i} cx="90" cy="90" r={r} fill="none" stroke={t.ink} strokeWidth="2" />
            ))}
          </svg>
          <div style={{ padding: 18, position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.ink, opacity: 0.7 }}>NOW SPEAKING · {current + 1} OF {queue.length}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
              <CC4Avatar color={t.ink} initial={speaker.name[0]} size={56} t={t} />
              <div>
                <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 32, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1 }}>{speaker.name}</div>
                <div style={{ marginTop: 4 }}><SidePill t={t} side={speaker.side} filled /></div>
              </div>
            </div>
            {/* timer bar */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: t.fontMono, fontSize: 11, color: t.ink, opacity: 0.8 }}>
                <span>SPEAKING</span><span>0:38 / 1:00</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: `${t.ink}20`, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ width: '63%', height: '100%', background: t.ink, borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </CC4Card>
      </div>

      {/* Queue */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.inkSoft, marginBottom: 8 }}>QUEUE</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {queue.map((p, i) => {
            const state = i < current ? 'done' : i === current ? 'now' : 'next';
            return (
              <div key={p.id} style={{
                flex: 1,
                padding: 8, borderRadius: t.radiusSm,
                background: state === 'now' ? t.ink : t.paper,
                color: state === 'now' ? t.bg : t.ink,
                border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
                opacity: state === 'done' ? 0.4 : 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: p.color,
                  color: t.primaryFg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 11,
                  textDecoration: state === 'done' ? 'line-through' : 'none',
                }}>{p.name[0]}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 8, fontWeight: 700, letterSpacing: 0.5 }}>{p.side[0]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '14px 20px 24px', display: 'flex', gap: 8 }}>
        <CC4Button t={t} variant="outline" style={{ flex: 1 }} full>Skip</CC4Button>
        <div onClick={() => current < queue.length - 1 ? setCurrent(current + 1) : onNav('revote')} style={{ flex: 2 }}>
          <CC4Button t={t} full>{current < queue.length - 1 ? 'Next speaker →' : 'All done — revote →'}</CC4Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — REVOTE
// Same opinion, or did you change?
// ─────────────────────────────────────────────────────────────
function ScreenRevote({ t, onNav = () => {} }) {
  const [pick, setPick] = s4UseState(null);
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>R3 · REVOTE</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.ink, fontWeight: 700 }}>0:12</div>
      </div>

      <div style={{ padding: '14px 24px 6px' }}>
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 32,
          color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1.02,
        }}>Now that you've<br />heard them out…</div>
        <div style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft, marginTop: 8, lineHeight: 1.4 }}>
          Same opinion or did you cross the floor?
        </div>
      </div>

      {/* Your previous vote */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{
          padding: 12, borderRadius: t.radius,
          background: t.paper, border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: t.accents.cobalt,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.fontMono, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: t.ink,
          }}>×</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.inkSoft }}>YOUR FIRST VOTE</div>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 16, color: t.ink, letterSpacing: t.letterSpacing, marginTop: 2 }}>AGAINST</div>
          </div>
        </div>
      </div>

      {/* Two big choices */}
      <div style={{ flex: 1, padding: '14px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          {
            id: 'same',
            big: 'Same as before',
            sub: 'You stuck to your guns.',
            badge: 'AGAINST',
            color: t.accents.cobalt,
            icon: '=',
          },
          {
            id: 'changed',
            big: 'I changed my mind',
            sub: 'Tell us who flipped you.',
            badge: 'NOW FOR',
            color: t.accents.lime,
            icon: '↻',
          },
        ].map(opt => (
          <CC4Card key={opt.id} t={t} padding={0} onClick={() => setPick(opt.id)} style={{
            flex: 1, cursor: 'pointer', overflow: 'hidden', position: 'relative',
            background: pick === opt.id ? opt.color : t.paper,
            outline: pick === opt.id ? `3px solid ${t.ink}` : 'none',
          }}>
            <div style={{ padding: 18, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: pick === opt.id ? t.ink : opt.color,
                  color: pick === opt.id ? t.bg : t.ink,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 22,
                }}>{opt.icon}</div>
                <div style={{
                  fontFamily: t.fontMono, fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                  padding: '4px 8px', borderRadius: 999, background: t.ink, color: t.bg,
                }}>{opt.badge}</div>
              </div>
              <div>
                <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 26, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1.02 }}>{opt.big}</div>
                <div style={{ fontFamily: t.fontBody, fontSize: 13, color: pick === opt.id ? t.ink : t.inkSoft, opacity: pick === opt.id ? 0.85 : 1, marginTop: 6, lineHeight: 1.4 }}>{opt.sub}</div>
              </div>
            </div>
          </CC4Card>
        ))}
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <div onClick={() => onNav(pick === 'changed' ? 'attribution' : 'score')}>
          <CC4Button t={t} full size="lg">{pick === 'changed' ? 'Continue — pick who flipped you' : 'Lock in vote'}</CC4Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN — ATTRIBUTION (who changed your mind)
// Shown only when a player flipped. Avatar grid of opposing-side speakers.
// ─────────────────────────────────────────────────────────────
function ScreenAttribution({ t, onNav = () => {} }) {
  const players = cast(t);
  // The flipped player was AGAINST; they pick from FOR speakers (or "no one specifically").
  const fors = players.filter(p => p.side === 'FOR');
  const [pick, setPick] = s4UseState('kenza');

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 22, color: t.ink, cursor: 'pointer' }} onClick={() => onNav('revote')}>←</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>R3 · ATTRIBUTION</div>
        <div style={{ width: 22 }} />
      </div>

      <div style={{ padding: '14px 24px 4px' }}>
        <div style={{
          fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft,
        }}>YOU FLIPPED · AGAINST → FOR</div>
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 32,
          color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1.02, marginTop: 6,
        }}>Who changed<br />your mind?</div>
        <div style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft, marginTop: 8, lineHeight: 1.4 }}>
          The convincer scores points. Pick one speaker, or "the room as a whole."
        </div>
      </div>

      {/* Avatar grid */}
      <div style={{ flex: 1, padding: '18px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {fors.map(p => {
            const isPicked = pick === p.id;
            return (
              <CC4Card key={p.id} t={t} padding={0} onClick={() => setPick(p.id)} style={{
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                background: isPicked ? p.color : t.paper,
                outline: isPicked ? `3px solid ${t.ink}` : 'none',
              }}>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
                  <CC4Avatar color={isPicked ? t.ink : p.color} initial={p.name[0]} size={48} t={t} />
                  <div>
                    <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 18, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1 }}>{p.name}</div>
                    <div style={{ marginTop: 4 }}><SidePill t={t} side={p.side} filled={!isPicked} /></div>
                  </div>
                </div>
                {isPicked && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 26, height: 26, borderRadius: '50%', background: t.ink, color: t.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14,
                  }}>✓</div>
                )}
              </CC4Card>
            );
          })}
          {/* "No one specifically" tile */}
          <CC4Card t={t} padding={0} onClick={() => setPick('room')} style={{
            cursor: 'pointer', gridColumn: '1 / -1',
            background: pick === 'room' ? t.ink : t.paper,
            color: pick === 'room' ? t.bg : t.ink,
            outline: pick === 'room' ? `3px solid ${t.ink}` : 'none',
          }}>
            <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: pick === 'room' ? t.bg : t.bgAlt,
                color: pick === 'room' ? t.ink : t.inkSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 18,
              }}>◉</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 16, letterSpacing: t.letterSpacing, lineHeight: 1 }}>The room as a whole</div>
                <div style={{ fontFamily: t.fontBody, fontSize: 12, opacity: 0.75, marginTop: 3 }}>
                  Points split evenly across the FOR side.
                </div>
              </div>
            </div>
          </CC4Card>
        </div>
      </div>

      {/* Reason chip (optional) */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.inkSoft, marginBottom: 6 }}>WHAT DID IT? (OPTIONAL)</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Solid point', 'Personal story', 'Made me laugh', 'Killer one-liner', 'Calm logic'].map((r, i) => (
            <div key={r} style={{
              padding: '6px 10px', borderRadius: 999,
              background: i === 1 ? t.ink : 'transparent',
              color: i === 1 ? t.bg : t.ink,
              border: i === 1 ? 'none' : `1px solid ${t.inkSoft}`,
              fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 12,
            }}>{r}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 20px 24px' }}>
        <div onClick={() => onNav('score')}>
          <CC4Button t={t} full size="lg">Award the point →</CC4Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
window.CC = window.CC || {};
Object.assign(window.CC, {
  ScreenTally,
  ScreenHotSeat,
  ScreenHotSeatVerdict,
  ScreenRoundRobin,
  ScreenRevote,
  ScreenAttribution,
});
