# CERCLES
### In-Person Social Debate Game — Complete Project Brief

---

## WHAT IS THIS APP?

Cercles is a mobile app that turns friend gatherings into structured, fun debates. Friends physically sit together, each on their own phone, join the same room using a code, and debate controversial topics out loud. The app is the moderator — it manages topics, timing, scoring, and game mechanics.

**Core idea:** The conversation happens in real life. The phone handles the rules, the score, and the structure.

---

## TECH STACK

| Layer | Choice |
|---|---|
| Mobile framework | React Native |
| Language | TypeScript |
| Backend & Auth | Supabase |
| Authentication | Email + password |
| Language | English only |

---

## DESIGN SYSTEM

**Visual direction:** Dark and sleek. Game-lobby feel. Neon accents on deep backgrounds. Feels competitive, modern, and alive.

**Colors:**
```
Background:       #0F0F1E
Surface:          #14142A
Border:           #1E1E3A
Primary accent:   #FF6B35  (orange)
Secondary accent: #22D3EE  (cyan)
Gold:             #F59E0B
Success:          #34D399
Danger:           #F43F5E
Text primary:     #FFFFFF
Text secondary:   #C8C8E0
Text muted:       #666688
```

**Typography:**
- Headings / labels / buttons: **Syne** (weight 700, 800) — import from Google Fonts
- Body / inputs / descriptions: **DM Sans** (weight 400, 500, 600) — import from Google Fonts

**Component rules:**
- Cards: borderRadius 16–20px, background #14142A, border 1px solid #1E1E3A
- Buttons (primary): full width, gradient left-to-right #FF6B35 → #F59E0B, borderRadius 16px, Syne 700, white text, letter spacing 1–2px
- Buttons (secondary/outlined): full width, background transparent, border 1.5px solid #FF6B35, same radius and font, text #FF6B35
- Inputs: background #14142A, border 1px solid #1E1E3A, borderRadius 12px, text #FFFFFF, placeholder #666688
- Glow effects: box-shadow using the element's accent color at ~33% opacity (e.g. `#FF6B3555`)
- All screen transitions: fade or slide animation
- Breathing dot animation for any live/waiting status

---

## AVATAR SYSTEM

Users pick from a set of **pre-made illustrated avatars** during onboarding. Each avatar:
- Has a unique illustrated character (animal or abstract figure style)
- Is displayed inside a colored circle ring (color chosen by user from a preset palette)
- Has an emoji fallback for loading states

**Preset avatar options (16 total):**
🦊 Fox · 🐺 Wolf · 🦁 Lion · 🐻 Bear · 🦅 Eagle · 🐉 Dragon · 🦋 Butterfly · 🐬 Dolphin · 🦊 · 🐯 Tiger · 🦄 Unicorn · 🐙 Octopus · 🦎 Lizard · 🐦 Phoenix · 🐺 · 🦝 Raccoon

**Ring color options (8 total):**
#FF6B35 · #22D3EE · #A855F7 · #34D399 · #F59E0B · #F43F5E · #3B82F6 · #EC4899

Avatar is selected once during onboarding and can be changed in Profile settings.

---

## AUTHENTICATION FLOW

1. App opens → check if user is logged in via Supabase session
2. If not logged in → show Onboarding / Sign In screen
3. Sign up: email + password + username + pick avatar + pick ring color
4. Sign in: email + password
5. On success → go to Home Screen

---

## HOW THE GAME WORKS

1. One person creates a room and shares the room code
2. Others join using that code (must be physically present)
3. A topic appears on everyone's screen
4. Each player picks their position: **Agree or Disagree** (no undecided — everyone must vote)
5. The app checks the vote split → determines which mode to run
6. After the debate round → **revote** (Agree or Disagree again)
7. Players who changed their opinion must tag who convinced them
8. Scores update → next topic
9. Repeat until all topics are done
10. Final scores shown at the end

---

## DEBATE MODES

### MODE 1 — HOT SEAT (1 person is alone on their side)

Triggered when exactly **1 player** is on one side (e.g. 1 Agree vs 5 Disagree).

- Screen shows a **circle with the lone player in the center**
- All other players see a **tap button** on their phone
- **First to tap** gets to debate the center person 1v1 out loud (tries to convince them)
- The rest of the room can **vote out** the current debater if his argument is weak
- If voted out → button race opens again → next person to tap goes in
- Repeats until the center person changes their mind, or everyone has had a turn

### MODE 2 — STRUCTURED DEBATE (2+ players on each side)

Triggered when both sides have at least 2 players.

- Players who said **Agree** each speak one by one out loud
- Then players who said **Disagree** each speak one by one out loud
- After everyone has spoken → **revote** (Agree or Disagree)
- Players who changed their vote must tag **who convinced them** (used for scoring)

---

## SCORING

| Action | Points |
|---|---|
| Convince someone to change their mind | +10 pts |
| Change your own mind | +10 "Open Minded" pts |
| Audience rates your argument: good | +1 to +5 pts |
| Get flagged out of a debate | -2 pts |

---

## SCREENS & CONTENT

### SCREEN 1 — HOME

**Purpose:** Entry point. User sees their identity, accesses core actions, and discovers trending topics.

**Layout top to bottom:**
- App name "CERCLES" top left (Syne 800)
- Top right: small notification bell icon
- User avatar (medium size, colored ring, emoji inside) — tapping it navigates to Profile
- Speech bubble next to avatar: *"Welcome to Cercles 👋"*
- Username and level badge below avatar (e.g. "Lv. 4 Debater")
- Button: **CREATE A ROOM** (primary gradient)
- Button: **JOIN A ROOM** (outlined)
- Section title: "TRENDING TOPICS 🔥"
- Horizontal scrollable row of topic cards, each showing:
  - Topic text (bold, short)
  - Debate count (e.g. "1.2k debates")
  - Category tag (e.g. "Politics", "Lifestyle")
- Trending data: **hardcoded mock for now, real Supabase data later**

**Mock trending topics:**
```
"Obesity is a choice" — 2.4k debates — Politics
"Social media is toxic" — 1.8k debates — Lifestyle
"Pineapple on pizza is fine" — 3.1k debates — Fun
"AI will replace us" — 1.1k debates — Philosophy
"Democracy is broken" — 980 debates — Politics
```

**Navigation:**
- Tap avatar → Profile Screen
- Tap "Create a Room" → Create Room Screen
- Tap "Join a Room" → Join Room Screen

---

### SCREEN 2 — PROFILE

**Purpose:** User's debate identity, belief patterns, history, and settings.

**Layout:**
- Back arrow top left
- Avatar (large), name, level badge
- Stats row (3 cards): Total Debates / People Convinced / Times Changed Mind
- **My Beliefs** section: auto-generated belief tags based on past debate positions
  - Examples: "🟡 Moderate on economics", "🔵 Progressive on social issues", "🔴 Conservative on religion"
- **History** section: list of past sessions
  - Each row: topic name · date · result (Won / Lost / Draw) · points earned
- **Settings** section: toggle rows
  - Notifications (on/off)
  - Public Profile (on/off)
  - Show Belief Tags (on/off)

---

### SCREEN 3 — CREATE ROOM

**Purpose:** Host configures the debate session.

**Layout:**
- Back arrow, title "CREATE ROOM"
- Input: Room Name (placeholder: "e.g. Friday Night Debates")
- Time per topic: pill selector — **2 min / 3 min / 5 min / 10 min** (one active at a time, active = orange fill)
- Topics section:
  - Button: "Browse & Select Topics →" → opens Topics Browser
  - Preview of selected topic pills shown below button
- Toggle: Hot Seat on/off
- Button: **CREATE ROOM →** → navigates to Waiting Room

---

### SCREEN 4 — TOPICS BROWSER

**Purpose:** Select which topics will be debated.

**Layout:**
- Back arrow, title "SELECT TOPICS"
- Search bar
- Category filter tabs (horizontal scroll): All / Fun / Lifestyle / Politics / Philosophy / Spicy
- Scrollable list of topic cards:
  - Topic text
  - Category tag
  - Checkmark on right (selected = orange filled circle)
- Bottom sticky bar: "{n} selected — CONFIRM"

**Default topics:**
```
FUN
- Pineapple on pizza is acceptable
- Cats are better than dogs
- Summer is better than winter

LIFESTYLE
- Social media does more harm than good
- Remote work is better than office
- Money can buy happiness
- Success is mostly luck

POLITICS
- Democracy is overrated
- Immigration is good for the economy
- Cancel culture is toxic

PHILOSOPHY
- AI is dangerous
- Free will does not exist
- Raising children is more fulfilling than a career

SPICY
- Obesity is a choice
- Feminism has gone too far
- Religion does more harm than good
- Gender is a social construct
- Climate change is exaggerated
```

---

### SCREEN 5 — JOIN ROOM

**Purpose:** Players join an existing room using a code.

**Layout:**
- Back arrow, title "JOIN ROOM"
- Label: "Enter Room Code"
- Large centered input, big font, letter-spaced (for codes like "PX-7742")
- Button: **JOIN ROOM** (primary gradient)
- Section: "Recent Rooms"
  - List of past rooms: room name · host name · date · player count · "Rejoin" button

---

### SCREEN 6 — WAITING ROOM

**Purpose:** Lobby where all players wait before the debate starts.

**Layout:**
- App name top left, "Waiting..." badge top right (breathing orange dot)
- Room code card: label "ROOM CODE", large bold code, Copy button, hint "Share this with your friends"
- Players section:
  - Title "Players" + "{n}/{total} joined"
  - 3×2 avatar grid — joined players: colored ring + glow. Not joined: greyed out
  - When a player joins: avatar animates from grey to active with a pulse glow
- Topics list: numbered 01, 02... list of selected topics
- Settings row (3 small cards): Time per topic · Hot Seat on/off · Flag limit %
- Button: **START DEBATE →** (primary gradient, host only)
- Hint below button: "Only the host can start"

---

## NAVIGATION MAP

```
Auth Screen (if not logged in)
  └── sign up / sign in → Home

Home
  ├── tap avatar ──────────────────────► Profile
  ├── tap "Create a Room" ─────────────► Create Room
  │     ├── tap "Browse Topics" ───────► Topics Browser ──► back to Create Room
  │     └── tap "Create Room" ─────────► Waiting Room
  └── tap "Join a Room" ───────────────► Join Room
        └── tap "Join" ──────────────────► Waiting Room
```

No bottom navigation bar. All navigation flows from the home screen.

---

## TOPIC CATEGORIES

| Category | Tone | % of default topics |
|---|---|---|
| Fun | Light, silly, no wrong answer | 30% |
| Lifestyle | Personal habits, work, money | 25% |
| Politics | Society, government, rights | 20% |
| Philosophy | Big ideas, meaning, ethics | 15% |
| Spicy | Sensitive, controversial | 10% |

---

## ACHIEVEMENTS

| Badge | Condition |
|---|---|
| Open Mind | Changed mind 10+ times |
| Persuader | Convinced 20+ people |
| Devil's Advocate | Argued against your usual beliefs |
| Fact Checker | Brought evidence to debates |
| Hot Seat Survivor | Won 5 Hot Seat debates |

---

## MOCK USER DATA

```
Current user:
  name: "Alex"
  avatar: Fox 🦊
  ring color: #FF6B35
  level: 4
  stats: { debates: 48, convinced: 23, mindChanged: 7 }

Players in Waiting Room:
  { name: "Alex",   emoji: "🦊", color: "#FF6B35", joined: true  }
  { name: "Sam",    emoji: "🐺", color: "#A855F7", joined: true  }
  { name: "Jordan", emoji: "🦁", color: "#22D3EE", joined: true  }
  { name: "Riley",  emoji: "🐻", color: "#34D399", joined: false }
  { name: "Casey",  emoji: "🦅", color: "#F59E0B", joined: false }
  { name: "Morgan", emoji: "🐉", color: "#F43F5E", joined: false }
```

After 2.5 seconds in Waiting Room → Riley joins automatically (to demo live join animation).

---

## TASK LIST (BUILD ORDER)

Each task is self-contained. Always reference this file before starting a task.

| # | Task |
|---|---|
| 1 | Project setup — React Native + Supabase + navigation |
| 2 | Auth screen — sign up and sign in with email + password |
| 3 | Onboarding — username + avatar picker + ring color |
| 4 | Home screen |
| 5 | Profile screen |
| 6 | Create Room screen |
| 7 | Topics Browser screen |
| 8 | Join Room screen |
| 9 | Waiting Room screen |
| 10 | Debate screen (topic display, timer, agree/disagree/undecided) |
| 11 | Hot Seat mechanic (button race, flagging) |
| 12 | Scoring system |
| 13 | End of game / results screen |
| 14 | Supabase integration (rooms, users, scores, real-time) |
| 15 | Trending topics — connect to real Supabase data |
