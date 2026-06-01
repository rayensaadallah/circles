// cercles-normal-mode.jsx — Normal Mode game flow screens
// Flow: NormalTopicReveal → NormalTally → NormalRound (FOR speakers → AGAINST speakers) → NormalMindChange
//
// Scenario: 2 FOR, 3 AGAINST

const {
  CCPlaceholder: CNPlaceholder, CCAvatar: CNAvatar, CCHeader: CNHeader,
  CCButton: CNButton, CCCard: CNCard, CCMark: CNMark, CCLogo: CNLogo
} = window.CC;

const { useState: cnUseState, useEffect: cnUseEffect, useRef: cnUseRef } = React;

// ─────────────────────────────────────────────────────────────
// Cast for normal mode — 2 FOR, 3 AGAINST
// ─────────────────────────────────────────────────────────────
function nmCast(t) {
  const a = Object.values(t.accents);
  return [
    { id: 'kenza', name: 'Kenza', color: a[0], side: 'FOR' },
    { id: 'adam',  name: 'Adam',  color: a[2], side: 'FOR' },
    { id: 'yas',   name: 'Yas',   color: a[3], side: 'AGAINST' },
    { id: 'imane', name: 'Imane', color: a[1], side: 'AGAINST' },
    { id: 'reda',  name: 'Reda',  color: a[4], side: 'AGAINST' },
  ];
}

// ─────────────────────────────────────────────────────────────
// SCREEN 1 — NORMAL TOPIC REVEAL
// Shows the topic/question. User picks FOR or AGAINST privately.
// Does NOT show what others voted.
// ─────────────────────────────────────────────────────────────
function ScreenNormalTopicReveal({ t, onNav = () => {} }) {
  const [picked, cnPickSet] = cnUseState(null); // null | 'FOR' | 'AGAINST'
  const [confirmed, cnConfirmSet] = cnUseState(false);

  const handleConfirm = () => {
    if (!picked) return;
    cnConfirmSet(true);
    setTimeout(() => onNav('normaltally'), 800);
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: t.bg,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Concentric rings backdrop */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 393 852" preserveAspectRatio="xMidYMid slice">
        {[60, 120, 190, 270, 360].map((r, i) => (
          <circle key={i} cx="196" cy="320"
            r={r} fill="none"
            stroke={t.ink}
            strokeWidth="1"
            opacity={0.045 - i * 0.006}
          />
        ))}
      </svg>

      {/* Top status */}
      <div style={{
        padding: '20px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative',
      }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: t.inkSoft }}>Round 1 of 5</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>HOT TAKES</div>
      </div>

      {/* Question */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 28px',
        position: 'relative',
      }}>
        <div style={{
          fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2.5,
          textTransform: 'uppercase', color: t.inkSoft, marginBottom: 18,
        }}>The question</div>
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: t.displayWeight,
          fontSize: 40, lineHeight: 1.0, color: t.ink,
          letterSpacing: '-0.03em', textWrap: 'pretty',
        }}>
          Long-distance relationships never work.
        </div>
        <div style={{
          marginTop: 22, fontFamily: t.fontBody, fontSize: 14,
          color: t.inkSoft, lineHeight: 1.5, maxWidth: 300,
        }}>
          Vote privately. No one sees your answer until everyone has chosen.
        </div>
      </div>

      {/* FOR / AGAINST vote — personal, private */}
      <div style={{ padding: '0 20px 24px', position: 'relative' }}>

        {/* Prompt */}
        <div style={{
          fontFamily: t.fontMono, fontSize: 10, letterSpacing: 2,
          textTransform: 'uppercase', color: t.inkSoft,
          marginBottom: 12, textAlign: 'center',
        }}>Your position</div>

        <div style={{ display: 'flex', gap: 10 }}>

          {/* FOR */}
          <div
            onClick={() => !confirmed && cnPickSet('FOR')}
            style={{
              flex: 1, height: 80, borderRadius: t.radius,
              background: picked === 'FOR' ? t.accents.lime : t.paper,
              border: picked === 'FOR'
                ? (t.cardBorder !== 'none' ? t.cardBorder : `2px solid ${t.ink}`)
                : (t.cardBorder !== 'none' ? t.cardBorder : `1.5px solid ${t.bgAlt}`),
              boxShadow: picked === 'FOR' && t.cardShadow.includes('#1a1410') ? '3px 3px 0 ' + t.ink : 'none',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              cursor: confirmed ? 'default' : 'pointer',
              transition: 'background 0.15s, box-shadow 0.15s',
            }}
          >
            <div style={{
              fontFamily: t.fontDisplay, fontWeight: 700,
              fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing,
            }}>FOR</div>
            <div style={{
              fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5,
              color: t.inkSoft, textTransform: 'uppercase',
            }}>I agree</div>
          </div>

          {/* AGAINST */}
          <div
            onClick={() => !confirmed && cnPickSet('AGAINST')}
            style={{
              flex: 1, height: 80, borderRadius: t.radius,
              background: picked === 'AGAINST' ? t.accents.cobalt : t.paper,
              border: picked === 'AGAINST'
                ? (t.cardBorder !== 'none' ? t.cardBorder : `2px solid ${t.ink}`)
                : (t.cardBorder !== 'none' ? t.cardBorder : `1.5px solid ${t.bgAlt}`),
              boxShadow: picked === 'AGAINST' && t.cardShadow.includes('#1a1410') ? '3px 3px 0 ' + t.ink : 'none',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              cursor: confirmed ? 'default' : 'pointer',
              transition: 'background 0.15s, box-shadow 0.15s',
            }}
          >
            <div style={{
              fontFamily: t.fontDisplay, fontWeight: 700,
              fontSize: 22, color: picked === 'AGAINST' ? t.primaryFg : t.ink,
              letterSpacing: t.letterSpacing,
            }}>AGAINST</div>
            <div style={{
              fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5,
              color: picked === 'AGAINST' ? t.primaryFg : t.inkSoft,
              opacity: 0.85, textTransform: 'uppercase',
            }}>I disagree</div>
          </div>
        </div>

        {/* Confirm */}
        <div style={{ marginTop: 12 }} onClick={handleConfirm}>
          <button style={{
            width: '100%', height: 56, borderRadius: 999,
            background: picked ? t.ink : t.bgAlt,
            color: picked ? t.bg : t.inkSoft,
            fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 17,
            letterSpacing: t.letterSpacing,
            border: 'none', cursor: picked ? 'pointer' : 'default',
            transition: 'background 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {confirmed
              ? <>Locked in ✓</>
              : picked
                ? <>Lock in · {picked} →</>
                : <>Choose your side</>
            }
          </button>
        </div>

        {/* Privacy note */}
        {picked && !confirmed && (
          <div style={{
            marginTop: 10, textAlign: 'center',
            fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft, lineHeight: 1.4,
          }}>
            Your vote is hidden until everyone has answered.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 2 — NORMAL TALLY
// All votes are in. Reveals the split: 2 FOR, 3 AGAINST.
// Host taps "Start Round" to begin.
// ─────────────────────────────────────────────────────────────
function ScreenNormalTally({ t, onNav = () => {} }) {
  const players = nmCast(t);
  const fors  = players.filter(p => p.side === 'FOR');
  const ags   = players.filter(p => p.side === 'AGAINST');

  // Staggered reveal — show bar first, then names
  const [revealed, cnRevealSet] = cnUseState(false);
  cnUseEffect(() => { const id = setTimeout(() => cnRevealSet(true), 320); return () => clearTimeout(id); }, []);

  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* Status */}
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>R1 · TALLY</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>MANG</div>
      </div>

      {/* Topic chip */}
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{
          padding: '10px 14px', borderRadius: t.radius, background: t.paper,
          border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
          fontFamily: t.fontDisplay, fontWeight: 500, fontSize: 14, color: t.ink,
          letterSpacing: t.letterSpacing, textAlign: 'center', lineHeight: 1.25,
        }}>"Long-distance relationships never work."</div>
      </div>

      {/* Headline */}
      <div style={{ padding: '18px 24px 0' }}>
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 32,
          color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1.0,
        }}>The room<br />has voted.</div>
        <div style={{
          fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft, marginTop: 8,
        }}>Here's how the group split.</div>
      </div>

      {/* Split bar */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          display: 'flex', height: 68, borderRadius: t.radius, overflow: 'hidden',
          border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
          boxShadow: t.cardShadow.includes('#1a1410') ? '3px 3px 0 ' + t.ink : t.cardShadow,
        }}>
          <div style={{
            flex: fors.length, background: t.accents.lime, color: t.ink,
            display: 'flex', alignItems: 'center', paddingLeft: 16, gap: 8,
            transition: 'flex 0.6s cubic-bezier(.4,0,.2,1)',
          }}>
            <div>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5, opacity: 0.7 }}>FOR</div>
              <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 32, lineHeight: 1, letterSpacing: t.letterSpacing }}>{fors.length}</div>
            </div>
          </div>
          <div style={{
            flex: ags.length, background: t.accents.cobalt, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16,
            transition: 'flex 0.6s cubic-bezier(.4,0,.2,1)',
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5, opacity: 0.8 }}>AGAINST</div>
              <div style={{ fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 32, lineHeight: 1, letterSpacing: t.letterSpacing }}>{ags.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div style={{
        padding: '12px 20px 0', display: 'flex', gap: 10,
        opacity: revealed ? 1 : 0, transition: 'opacity 0.5s ease',
      }}>
        {[
          { label: 'FOR', list: fors, accent: t.accents.lime },
          { label: 'AGAINST', list: ags, accent: t.accents.cobalt },
        ].map((col, ci) => (
          <CNCard key={ci} t={t} padding={12} style={{ flex: 1 }}>
            <div style={{
              fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5,
              color: t.inkSoft, marginBottom: 10, textTransform: 'uppercase',
            }}>{col.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.list.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CNAvatar color={p.color} initial={p.name[0]} size={28} t={t} />
                  <div style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 600, color: t.ink }}>{p.name}</div>
                </div>
              ))}
            </div>
          </CNCard>
        ))}
      </div>

      {/* Round info */}
      <div style={{ flex: 1, padding: '12px 20px 0', display: 'flex', alignItems: 'flex-end' }}>
        <CNCard t={t} padding={14} style={{ width: '100%', background: t.paper }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* mini circle icon */}
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke={t.ink} strokeWidth="1.2" strokeDasharray="3 4" opacity="0.3" />
              {/* FOR dots */}
              {[0, 1].map(i => {
                const a = (i / 2) * Math.PI * 2 - Math.PI / 2;
                return <circle key={'f'+i} cx={22 + Math.cos(a) * 12} cy={22 + Math.sin(a) * 12} r="4" fill={t.accents.lime} />;
              })}
              {/* AGAINST dots */}
              {[0, 1, 2].map(i => {
                const a = ((i / 3) * Math.PI * 2 - Math.PI / 2) + Math.PI;
                return <circle key={'a'+i} cx={22 + Math.cos(a) * 12} cy={22 + Math.sin(a) * 12} r="4" fill={t.accents.cobalt} opacity="0.45" />;
              })}
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 16, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1 }}>
                FOR speaks first
              </div>
              <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft, marginTop: 3, lineHeight: 1.4 }}>
                Each person gets 60s. AGAINST listens first, then responds.
              </div>
            </div>
          </div>
        </CNCard>
      </div>

      {/* CTA */}
      <div style={{ padding: '12px 20px 24px' }}>
        <div onClick={() => onNav('normalround')}>
          <CNButton t={t} full size="lg">Start Round →</CNButton>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 3 — NORMAL ROUND
// The speaking circle. FOR speaks first, then AGAINST.
// • People who haven't spoken yet on the current side are faded.
// • The active speaker's bubble is visually distinct (large ring, pulsing).
// • Opposite side are faded/ghosted since they're not speaking.
// • Timer bar at bottom for current speaker.
// ─────────────────────────────────────────────────────────────
function ScreenNormalRound({ t, onNav = () => {} }) {
  const players = nmCast(t);
  const fors  = players.filter(p => p.side === 'FOR');
  const ags   = players.filter(p => p.side === 'AGAINST');

  // speakerQueue: all FOR first, then all AGAINST
  const speakerQueue = [...fors, ...ags];
  const [speakerIdx, cnSpeakerSet] = cnUseState(0);
  const [timeLeft, cnTimeSet] = cnUseState(60);
  const [running, cnRunSet] = cnUseState(true);

  const speaker = speakerQueue[speakerIdx];
  const phase = speakerIdx < fors.length ? 'FOR' : 'AGAINST';
  const totalTime = 60;

  // countdown timer
  cnUseEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) { cnRunSet(false); return; }
    const id = setInterval(() => cnTimeSet(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [running, timeLeft]);

  const handleNext = () => {
    if (speakerIdx < speakerQueue.length - 1) {
      cnSpeakerSet(speakerIdx + 1);
      cnTimeSet(60);
      cnRunSet(true);
    } else {
      onNav('normalmindchange');
    }
  };

  const isLastSpeaker = speakerIdx === speakerQueue.length - 1;
  const phaseSwitching = speakerIdx === fors.length; // just entered AGAINST phase

  // Circle geometry
  const size = 270;
  const cx = size / 2;
  const cy = size / 2;
  const ringR = size / 2 - 38;

  // All 5 players arranged in a circle
  const allPlayers = [...fors, ...ags];

  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* Status */}
      <div style={{ padding: '18px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>
          R1 · {phase} SPEAKS
        </div>
        <div style={{
          padding: '3px 10px', borderRadius: 999,
          background: phase === 'FOR' ? t.accents.lime : t.accents.cobalt,
          fontFamily: t.fontMono, fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
          color: t.ink,
        }}>
          {speakerIdx + 1}/{speakerQueue.length}
        </div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.inkSoft }}>MANG</div>
      </div>

      {/* Topic */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{
          padding: '8px 12px', borderRadius: t.radius, background: t.paper,
          border: t.cardBorder !== 'none' ? t.cardBorder : 'none',
          fontFamily: t.fontDisplay, fontWeight: 500, fontSize: 13, color: t.ink,
          letterSpacing: t.letterSpacing, textAlign: 'center', lineHeight: 1.25,
        }}>"Long-distance relationships never work."</div>
      </div>

      {/* Circle */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4px 0',
      }}>
        <div style={{ position: 'relative', width: size, height: size }}>

          {/* Dashed ring */}
          <svg viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, width: size, height: size }}>
            <circle cx={cx} cy={cy} r={ringR}
              fill="none" stroke={t.ink} strokeWidth="1" strokeDasharray="3 6" opacity="0.2" />

            {/* Connector lines from each player to center — dim for inactive, bright for speaker */}
            {allPlayers.map((p, i) => {
              const a = (i / allPlayers.length) * Math.PI * 2 - Math.PI / 2;
              const x2 = cx + Math.cos(a) * ringR;
              const y2 = cy + Math.sin(a) * ringR;
              const isSpeaking = p.id === speaker.id;
              return (
                <line key={p.id}
                  x1={cx} y1={cy} x2={x2} y2={y2}
                  stroke={isSpeaking ? t.primary : t.inkSoft}
                  strokeWidth={isSpeaking ? 2 : 0.8}
                  opacity={isSpeaking ? 0.9 : 0.15}
                  strokeDasharray={isSpeaking ? 'none' : '2 5'}
                />
              );
            })}
          </svg>

          {/* Player avatars */}
          {allPlayers.map((p, i) => {
            const a = (i / allPlayers.length) * Math.PI * 2 - Math.PI / 2;
            const ax = cx + Math.cos(a) * ringR;
            const ay = cy + Math.sin(a) * ringR;

            const isSpeaking = p.id === speaker.id;
            const hasSpokeAlready = speakerQueue.slice(0, speakerIdx).some(s => s.id === p.id);
            const isWaitingThisPhase = p.side === phase && !isSpeaking && !hasSpokeAlready;
            // AGAINST people are faded when FOR is speaking (and vice versa, they wait)
            const isOppositePhase = p.side !== phase;

            // Opacity logic:
            // - speaking: 1.0, full ring
            // - same phase, not yet spoken: 0.55, slightly dim
            // - already spoke: 0.35, clearly done
            // - opposite phase: 0.2, ghosted
            let opacity = 1;
            if (isSpeaking) opacity = 1;
            else if (isOppositePhase) opacity = 0.2;
            else if (hasSpokeAlready) opacity = 0.35;
            else if (isWaitingThisPhase) opacity = 0.6;

            const avatarSize = isSpeaking ? 62 : 46;

            return (
              <div key={p.id} style={{
                position: 'absolute',
                left: ax - avatarSize / 2,
                top: ay - avatarSize / 2,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                opacity,
                transition: 'opacity 0.4s ease',
                zIndex: isSpeaking ? 2 : 1,
              }}>
                {/* Speaking indicator ring */}
                {isSpeaking && (
                  <div style={{
                    position: 'absolute',
                    width: avatarSize + 14,
                    height: avatarSize + 14,
                    borderRadius: '50%',
                    border: `2.5px solid ${phase === 'FOR' ? t.accents.lime : t.accents.cobalt}`,
                    top: -(7), left: -(7),
                    animation: 'nm-ring-pulse 1.6s ease-in-out infinite',
                    zIndex: 0,
                  }} />
                )}

                <div style={{
                  width: avatarSize, height: avatarSize, borderRadius: '50%',
                  background: p.color,
                  color: t.primaryFg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: t.fontDisplay, fontWeight: 700,
                  fontSize: isSpeaking ? 26 : 18,
                  boxShadow: isSpeaking
                    ? `0 0 0 3px ${t.bg}, 0 0 0 5px ${phase === 'FOR' ? t.accents.lime : t.accents.cobalt}`
                    : 'none',
                  position: 'relative', zIndex: 1,
                  transition: 'width 0.3s ease, height 0.3s ease, font-size 0.3s ease',
                }}>{p.name[0]}</div>

                <div style={{
                  marginTop: 5,
                  fontFamily: t.fontMono, fontSize: 9, fontWeight: 700,
                  letterSpacing: 1, textTransform: 'uppercase',
                  color: isSpeaking ? t.ink : t.inkSoft,
                  whiteSpace: 'nowrap',
                }}>{isSpeaking ? p.name : p.name[0]}</div>

                {/* Checkmark for done */}
                {hasSpokeAlready && (
                  <div style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 16, height: 16, borderRadius: '50%',
                    background: t.accents.lime, border: `1.5px solid ${t.bg}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 900, color: t.ink,
                    zIndex: 3,
                  }}>✓</div>
                )}
              </div>
            );
          })}

          {/* Center — phase label */}
          <div style={{
            position: 'absolute',
            inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: t.fontMono, fontSize: 9, letterSpacing: 2,
                textTransform: 'uppercase', color: t.inkSoft, marginBottom: 2,
              }}>phase</div>
              <div style={{
                fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 15,
                color: t.ink, letterSpacing: t.letterSpacing,
              }}>{phase}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Now speaking card */}
      <div style={{ padding: '0 20px 8px' }}>
        <CNCard t={t} padding={0} style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: `1px solid ${t.bgAlt}`,
          }}>
            <CNAvatar color={speaker.color} initial={speaker.name[0]} size={40} t={t} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5, color: t.inkSoft, textTransform: 'uppercase' }}>Now speaking</div>
              <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 18, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1, marginTop: 1 }}>{speaker.name}</div>
            </div>
            <div style={{
              padding: '4px 10px', borderRadius: 999,
              background: phase === 'FOR' ? t.accents.lime : t.accents.cobalt,
              fontFamily: t.fontMono, fontSize: 10, fontWeight: 700, letterSpacing: 1,
              color: t.ink,
            }}>{phase}</div>
            {/* Live timer number */}
            <div style={{
              fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 26,
              color: timeLeft <= 10 ? t.accents.coral : t.ink,
              letterSpacing: '-0.03em', minWidth: 44, textAlign: 'right',
              transition: 'color 0.3s',
            }}>{timeLeft}s</div>
          </div>
          {/* Timer bar */}
          <div style={{ height: 5, background: t.bgAlt }}>
            <div style={{
              height: '100%',
              width: `${(timeLeft / totalTime) * 100}%`,
              background: timeLeft <= 10
                ? t.accents.coral
                : phase === 'FOR' ? t.accents.lime : t.accents.cobalt,
              transition: 'width 1s linear, background 0.3s',
              borderRadius: '0 0 0 0',
            }} />
          </div>
        </CNCard>
      </div>

      {/* Controls */}
      <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }} onClick={() => cnRunSet(r => !r)}>
          <CNButton t={t} variant="outline" full>{running ? 'Pause' : 'Resume'}</CNButton>
        </div>
        <div style={{ flex: 2 }} onClick={handleNext}>
          <CNButton t={t} full>{isLastSpeaker ? 'All done →' : 'Next speaker →'}</CNButton>
        </div>
      </div>

      <style>{`
        @keyframes nm-ring-pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 4 — NORMAL MIND CHANGE
// After all speakers are done: did you change your mind?
// If yes → pick who convinced you.
// ─────────────────────────────────────────────────────────────
function ScreenNormalMindChange({ t, onNav = () => {} }) {
  const players = nmCast(t);
  const [step, cnStepSet] = cnUseState('vote'); // 'vote' | 'attribution'
  const [changed, cnChangedSet] = cnUseState(null); // null | true | false
  const [attributed, cnAttributeSet] = cnUseState(null);

  // Simulated: user was AGAINST, so we show FOR speakers as potential convincers
  const myOriginalSide = 'AGAINST';
  const opposingSpeakers = players.filter(p => p.side === 'FOR');

  const handleVote = (didChange) => {
    cnChangedSet(didChange);
    if (didChange) {
      setTimeout(() => cnStepSet('attribution'), 400);
    }
  };

  const handleDone = () => onNav('score');

  if (step === 'attribution') {
    return (
      <div style={{
        width: '100%', height: '100%', background: t.bg,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => cnStepSet('vote')} style={{ fontSize: 22, color: t.ink, cursor: 'pointer' }}>←</div>
          <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>R1 · ATTRIBUTION</div>
        </div>

        <div style={{ padding: '20px 24px 8px' }}>
          <div style={{
            fontFamily: t.fontDisplay, fontWeight: t.displayWeight, fontSize: 30,
            color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1.0,
          }}>Who<br />convinced you?</div>
          <div style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft, marginTop: 8, lineHeight: 1.4 }}>
            You were <span style={{ color: t.ink, fontWeight: 700 }}>AGAINST</span>. Who from the FOR side got to you?
          </div>
        </div>

        {/* Speaker cards */}
        <div style={{ flex: 1, padding: '12px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {opposingSpeakers.map(p => (
            <CNCard key={p.id} t={t} padding={0}
              onClick={() => cnAttributeSet(p.id)}
              style={{
                cursor: 'pointer', overflow: 'hidden',
                background: attributed === p.id ? p.color : t.paper,
                outline: attributed === p.id ? `3px solid ${t.ink}` : 'none',
                flex: 1,
              }}>
              <div style={{ padding: 18, height: '100%', display: 'flex', alignItems: 'center', gap: 16 }}>
                <CNAvatar color={attributed === p.id ? t.ink : p.color} initial={p.name[0]} size={56} t={t} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 24, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 1 }}>{p.name}</div>
                  <div style={{
                    marginTop: 6, display: 'inline-block',
                    padding: '3px 8px', borderRadius: 999,
                    background: t.accents.lime, color: t.ink,
                    fontFamily: t.fontMono, fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                  }}>FOR</div>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: attributed === p.id ? t.ink : 'transparent',
                  border: attributed === p.id ? 'none' : `1.5px solid ${t.inkSoft}`,
                  color: attributed === p.id ? t.bg : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700,
                }}>✓</div>
              </div>
            </CNCard>
          ))}

          {/* "Both equally" option */}
          <CNCard t={t} padding={14}
            onClick={() => cnAttributeSet('both')}
            style={{
              cursor: 'pointer',
              background: attributed === 'both' ? t.accents.yellow : t.paper,
              outline: attributed === 'both' ? `3px solid ${t.ink}` : 'none',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: attributed === 'both' ? t.ink : t.bgAlt,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 18,
                color: attributed === 'both' ? t.bg : t.inkSoft,
              }}>=</div>
              <div style={{ fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 17, color: t.ink, letterSpacing: t.letterSpacing }}>Both equally</div>
            </div>
          </CNCard>
        </div>

        <div style={{ padding: '12px 20px 24px' }}>
          <div onClick={attributed ? handleDone : undefined}>
            <button style={{
              width: '100%', height: 56, borderRadius: 999,
              background: attributed ? t.ink : t.bgAlt,
              color: attributed ? t.bg : t.inkSoft,
              fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 17,
              letterSpacing: t.letterSpacing,
              border: 'none', cursor: attributed ? 'pointer' : 'default',
            }}>Lock in →</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: vote (did you change your mind?) ──
  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* BG rings */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 393 852" preserveAspectRatio="xMidYMid slice">
        {[60, 130, 210, 300].map((r, i) => (
          <circle key={i} cx="196" cy="420" r={r} fill="none" stroke={t.ink} strokeWidth="1" opacity={0.04 - i * 0.005} />
        ))}
      </svg>

      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>R1 · END</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>MANG</div>
      </div>

      {/* All 5 avatars in a row — done speaking */}
      <div style={{ padding: '16px 20px 0', position: 'relative' }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: t.inkSoft, marginBottom: 12 }}>Round complete</div>
        <div style={{ display: 'flex', gap: -6, justifyContent: 'center' }}>
          {players.map((p, i) => (
            <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: players.length - i }}>
              <CNAvatar color={p.color} initial={p.name[0]} size={44} t={t} ring={false} />
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontFamily: t.fontMono, fontSize: 10, color: t.inkSoft, letterSpacing: 1,
        }}>
          <span style={{ color: t.accents.lime, fontWeight: 700 }}>●</span> 2 FOR &nbsp;
          <span style={{ color: t.accents.cobalt, fontWeight: 700 }}>●</span> 3 AGAINST
        </div>
      </div>

      {/* Big question */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px', position: 'relative' }}>
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: t.displayWeight,
          fontSize: 38, color: t.ink, letterSpacing: '-0.03em', lineHeight: 1.0,
          textWrap: 'pretty',
        }}>Did you change your mind?</div>
        <div style={{
          fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft,
          marginTop: 12, lineHeight: 1.5,
        }}>
          You voted <span style={{ fontWeight: 700, color: t.ink }}>AGAINST</span> at the start. Still feel the same?
        </div>
      </div>

      {/* YES / NO */}
      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
        {/* YES */}
        <div onClick={() => handleVote(true)}>
          <button style={{
            width: '100%', height: 80, borderRadius: t.radius,
            background: changed === true ? t.accents.lime : t.paper,
            color: t.ink,
            border: changed === true
              ? (t.cardBorder !== 'none' ? t.cardBorder : `2px solid ${t.ink}`)
              : (t.cardBorder !== 'none' ? t.cardBorder : 'none'),
            boxShadow: changed === true && t.cardShadow.includes('#1a1410') ? '3px 3px 0 ' + t.ink : (t.cardShadow.includes('#1a1410') ? 'none' : t.cardShadow),
            fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 22,
            letterSpacing: t.letterSpacing,
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            transition: 'background 0.15s',
          }}>
            <div>Yes, I changed my mind</div>
            <div style={{ fontFamily: t.fontBody, fontWeight: 500, fontSize: 12, opacity: 0.7 }}>Tell us who convinced you →</div>
          </button>
        </div>

        {/* NO */}
        <div onClick={() => { cnChangedSet(false); setTimeout(() => onNav('score'), 400); }}>
          <button style={{
            width: '100%', height: 60, borderRadius: 999,
            background: changed === false ? t.ink : 'transparent',
            color: changed === false ? t.bg : t.ink,
            border: `1.5px solid ${changed === false ? t.ink : t.inkSoft}`,
            fontFamily: t.fontDisplay, fontWeight: 600, fontSize: 17,
            letterSpacing: t.letterSpacing,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}>
            No, I'm still AGAINST
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────
window.CC = window.CC || {};
Object.assign(window.CC, {
  ScreenNormalTopicReveal,
  ScreenNormalTally,
  ScreenNormalRound,
  ScreenNormalMindChange,
});
