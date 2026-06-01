// cercles-prototype.jsx — clickable prototype with real button-driven navigation.

const { useState: cpUseState, useEffect: cpUseEffect } = React;

function CerclesPrototype() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "blockParty",
    "dark": false,
    "primary": "#ff5a3c",
    "density": "cozy"
  }/*EDITMODE-END*/;

  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  const baseTheme = window.CERCLES_THEMES[tweaks.theme] || window.CERCLES_THEMES.blockParty;
  const theme = React.useMemo(() => ({
    ...baseTheme, primary: tweaks.primary || baseTheme.primary,
  }), [baseTheme, tweaks.primary]);

  const [route, setRoute] = cpUseState('splash');
  const [device, setDevice] = cpUseState('ios');
  const onNav = setRoute;

  const screenMap = {
    splash:    t => <window.CC.ScreenSplash t={t} onNav={onNav} />,
    onboarding:t => <window.CC.ScreenOnboarding t={t} onNav={onNav} />,
    home:      t => <window.CC.ScreenHome t={t} onNav={onNav} />,
    create:    t => <window.CC.ScreenCreate t={t} onNav={onNav} />,
    join:      t => <window.CC.ScreenJoin t={t} onNav={onNav} />,
    lobby:     t => <window.CC.ScreenLobby t={t} onNav={onNav} />,
    topic:     t => <window.CC.ScreenTopicReveal t={t} onNav={onNav} />,
    debate:    t => <window.CC.ScreenDebate t={t} onNav={onNav} />,
    vote:      t => <window.CC.ScreenVote t={t} onNav={onNav} />,
    tally:           t => <window.CC.ScreenTally t={t} onNav={onNav} />,
    hotseat:         t => <window.CC.ScreenHotSeat t={t} onNav={onNav} />,
    'hotseat-verdict': t => <window.CC.ScreenHotSeatVerdict t={t} onNav={onNav} />,
    roundrobin:      t => <window.CC.ScreenRoundRobin t={t} onNav={onNav} />,
    revote:          t => <window.CC.ScreenRevote t={t} onNav={onNav} />,
    attribution:     t => <window.CC.ScreenAttribution t={t} onNav={onNav} />,
    score:     t => <window.CC.ScreenScore t={t} onNav={onNav} />,
    results:   t => <window.CC.ScreenResults t={t} onNav={onNav} />,
    profile:   t => <window.CC.ScreenProfile t={t} onNav={onNav} />,
    discover:  t => <window.CC.ScreenDiscover t={t} onNav={onNav} />,
    notifs:    t => <window.CC.ScreenNotifications t={t} onNav={onNav} />,
    settings:  t => <window.CC.ScreenSettings t={t} onNav={onNav} />,
  };

  const flow = ['splash','onboarding','home','create','lobby','topic','debate','vote','tally','hotseat','hotseat-verdict','roundrobin','revote','attribution','score','results'];
  const flowIdx = flow.indexOf(route);

  cpUseEffect(() => {
    const s = document.createElement('style');
    s.textContent = '.cp-screen button, .cp-screen [role="button"], .cp-screen [data-nav] { cursor: pointer; }';
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const Frame = device === 'ios' ? window.IOSDevice : window.AndroidDevice;
  const fw = device === 'ios' ? 393 : 412;
  const fh = device === 'ios' ? 852 : 892;

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: tweaks.dark ? '#0b0a14' : '#f0eee9',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 20px 80px', boxSizing: 'border-box',
      transition: 'background 0.25s',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{
          fontFamily: theme.fontDisplay, fontWeight: 700, fontSize: 14,
          color: tweaks.dark ? '#f4f0ff' : '#1a1410', letterSpacing: '0.1em',
          textTransform: 'uppercase', display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <window.CC.CCMark t={theme} size={22} />
          Cercles · Tap real buttons to navigate
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 720 }}>
          {Object.keys(screenMap).map(r => (
            <button key={r} onClick={() => setRoute(r)} style={{
              padding: '6px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: r === route ? (tweaks.dark ? '#f4f0ff' : '#1a1410') : 'transparent',
              color: r === route ? (tweaks.dark ? '#0b0a14' : '#f4ecd8') : (tweaks.dark ? '#f4f0ff' : '#1a1410'),
              fontFamily: theme.fontDisplay, fontWeight: 600, fontSize: 12,
              outline: r !== route ? `1px solid ${tweaks.dark ? 'rgba(244,240,255,0.2)' : 'rgba(26,20,16,0.2)'}` : 'none',
            }}>{r}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {['ios', 'android'].map(d => (
            <button key={d} onClick={() => setDevice(d)} style={{
              padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: device === d ? theme.primary : 'transparent',
              color: device === d ? theme.primaryFg : (tweaks.dark ? '#f4f0ff' : '#1a1410'),
              outline: device !== d ? `1px solid ${tweaks.dark ? 'rgba(244,240,255,0.2)' : 'rgba(26,20,16,0.2)'}` : 'none',
              fontFamily: theme.fontDisplay, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1,
            }}>{d}</button>
          ))}
        </div>

        <div className="cp-screen">
          <Frame width={fw} height={fh} dark={false}>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              {screenMap[route](theme)}
            </div>
          </Frame>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => flowIdx > 0 && setRoute(flow[flowIdx - 1])} style={{
            padding: '10px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'transparent', color: tweaks.dark ? '#f4f0ff' : '#1a1410',
            outline: `1px solid ${tweaks.dark ? 'rgba(244,240,255,0.2)' : 'rgba(26,20,16,0.2)'}`,
            fontFamily: theme.fontDisplay, fontWeight: 600, fontSize: 13,
            opacity: flowIdx > 0 ? 1 : 0.3,
          }}>← Prev</button>
          <div style={{
            fontFamily: theme.fontMono, fontSize: 12,
            color: tweaks.dark ? 'rgba(244,240,255,0.6)' : 'rgba(26,20,16,0.6)',
          }}>{flowIdx >= 0 ? `${flowIdx + 1}/${flow.length} · ${flow[flowIdx]}` : route}</div>
          <button onClick={() => flowIdx < flow.length - 1 && setRoute(flow[flowIdx + 1])} style={{
            padding: '10px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: theme.primary, color: theme.primaryFg,
            fontFamily: theme.fontDisplay, fontWeight: 600, fontSize: 13,
          }}>Next →</button>
        </div>
      </div>

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection label="Theme">
            <window.TweakRadio label="Direction" value={tweaks.theme}
              onChange={v => setTweak({ theme: v, primary: window.CERCLES_THEMES[v].primary })}
              options={[
                { value: 'blockParty', label: 'Block Party' },
                { value: 'arena', label: 'Arena' },
                { value: 'softCircle', label: 'Soft' },
              ]} />
            <window.TweakColor label="Primary" value={tweaks.primary} onChange={v => setTweak({ primary: v })} />
          </window.TweakSection>
          <window.TweakSection label="Layout">
            <window.TweakToggle label="Dark surround" value={tweaks.dark} onChange={v => setTweak({ dark: v })} />
          </window.TweakSection>
          <window.TweakSection label="Jump to">
            {Object.keys(screenMap).map(r => (
              <window.TweakButton key={r} label={r} onClick={() => setRoute(r)} />
            ))}
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

window.CerclesPrototype = CerclesPrototype;
