# MASTER PRODUCT CONTEXT

## Purpose of This Document

This document is the canonical product-context source for the project.

It exists so that future AI coding agents, product-planning sessions, UX sessions, and development sessions can understand the complete product vision without relying on previous chat history.

Treat this document as the persistent memory of the product concept and the decisions already made by the product owner.

Do not silently replace, simplify, or reinterpret important product decisions contained here.

When a future decision conflicts with this document, identify the conflict and ask for clarification rather than silently changing the product direction.

This is a living product document. It should evolve as the product evolves, but changes should preserve the history and rationale of important decisions where practical.

---

# 1. PRODUCT IDENTITY

## Working description

The product is a personal adaptive execution-support system designed to reduce the distance between:

> knowing what I should do

and

> actually doing it.

It is intentionally different from a conventional task manager, calendar, habit tracker, or simple gamified productivity application.

The central problem is not lack of awareness.

The user often already knows what they should be doing.

The central difficulty is:

- starting
- continuing
- resisting distraction
- maintaining consistency
- returning after setbacks
- choosing what matters when everything feels important
- converting intentions into physical action

The product therefore sits between:

> intention → decision → activation → action → momentum → completion → recovery

It should act like an adaptive external structure for executive-function difficulties without claiming to diagnose, cure, or medically treat any condition.

---

# 2. PRODUCT PRINCIPLE

The single most important product principle is:

> REDUCE THE DISTANCE BETWEEN KNOWING WHAT I SHOULD DO AND ACTUALLY DOING IT.

Every major feature should be evaluated against this principle.

A feature is valuable when it helps the user:
- start sooner
- make fewer decisions
- overcome avoidance
- reduce overwhelm
- maintain momentum
- recover more easily
- understand what to do next
- spend less time managing the productivity system itself

A feature should be questioned if it risks becoming:
- another source of procrastination
- another complicated dashboard
- another administrative burden
- another notification system that can simply be ignored
- another collection of meaningless points and statistics

---

# 3. ORIGIN OF THE PRODUCT

The product was conceived from long-term personal struggles involving:

- procrastination
- executive-function difficulties
- difficulty beginning tasks
- inconsistency
- forgetting routines
- losing momentum
- overwhelm
- staying in bed for long periods
- excessive consumption of high-stimulation digital content
- difficulty maintaining motivation
- difficulty making boring tasks feel actionable
- repeatedly getting started and then falling off
- trying to improve too many areas of life simultaneously

The creator has experimented with multiple productivity and habit systems, including products such as:

- Habitica
- TickTick
- Super Productivity
- other habit/task tracking apps

Those systems can provide organization, but they do not fully address the deeper problem:

> the user can know exactly what they should do and still fail to initiate the behavior.

The product therefore should not merely become “a better TickTick.”

---

# 4. IMPORTANT PERSONAL DESIGN INSIGHT

A major discovery during product exploration was:

> Standard productivity advice often assumes that knowing what to do is enough.

For this product, that assumption is invalid.

When the user is severely stuck, the experience can resemble:
- paralysis
- freeze
- avoidance
- automatic distraction
- escape into high-stimulation activities
- inability to initiate even simple actions

Therefore the app needs a special **Activation / Rescue Mode** rather than relying solely on ordinary reminders, lists, or streaks.

---

# 5. CORE BEHAVIORAL MODEL

The fundamental adaptive loop is:

```text
Observe state
    ↓
Understand context
    ↓
Determine likely intention / task
    ↓
Choose next appropriate action
    ↓
Detect whether the user starts
    ↓
If stuck:
    activate Rescue/Activation Mode
    ↓
Break action into tiny steps
    ↓
Observe response
    ↓
If momentum increases:
    gradually reduce assistance
    ↓
If flow begins:
    stay mostly out of the way
    ↓
If drift begins:
    intervene again
    ↓
Task/habit progress
    ↓
Reward meaningful progress
    ↓
Learn from behavior
    ↓
Adapt future interventions
```

The system should be dynamic rather than static.

---

# 6. ADAPTIVE INTERVENTION ENGINE

The Adaptive Decision / Intervention Engine is a core cross-cutting concept.

It is the mechanism that connects:

- Now
- Activation/Rescue
- Focus
- AI planning
- tasks
- habits
- context
- behavioral history

Conceptually:

```text
                USER STATE
                    │
        ┌───────────┼───────────┐
        │           │           │
      Context     Behavior    History
        │           │           │
        └───────────┼───────────┘
                    ↓
         ADAPTIVE DECISION ENGINE
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
   Next Action    Rescue       Focus
       │            │            │
       └────────────┼────────────┘
                    ↓
             User Response
                    ↓
             Learn + Adapt
```

The engine should determine not only:

> What should the user do?

but also:

> How much help should the user receive right now?

---

# 7. ADAPTIVE DIFFICULTY MODEL

The app should adapt to the user's momentum.

Example:

### Severe freeze

> Put your feet on the floor.

### Beginning movement

> Stand up.

### Moving

> Walk to the bathroom.

### Some momentum

> Brush your teeth.

### Strong momentum

> Continue your morning routine.

The system should not force every user through a fixed chain.

The number of steps and difficulty should depend on observed behavior.

---

# 8. WHEN THE USER IS STRUGGLING

When the system detects difficulty:

- make the next action smaller
- reduce choices
- simplify instructions
- increase support
- shorten focus sessions
- increase activation assistance
- reduce cognitive load
- change intervention strategy
- potentially introduce novelty/pattern interruption
- use accountability when enabled
- use urgency when appropriate

---

# 9. WHEN THE USER IS IN FLOW

When the user is clearly making progress:

- reduce unnecessary prompts
- reduce coaching verbosity
- avoid interruptions
- allow the user to continue
- potentially extend the session
- avoid turning success into another survey

The system should know when to stop helping.

---

# 10. WHEN THE USER STARTS DRIFTING

If the user was productive and then begins to drift:

- detect the change
- avoid assuming failure immediately
- provide the smallest useful intervention
- restore focus
- escalate only if the problem persists

---

# 11. V1 CORE SYSTEMS

V1 has exactly five major core systems.

## V1 SYSTEM 1
# NOW → NEXT TINY ACTION

The primary question the application must always be capable of answering is:

> WHAT SHOULD I DO RIGHT NOW?

The Now screen should normally focus on exactly one actionable step.

The user should not need to decide between dozens of options.

The system should decide based on relevant context.

The next step should be physically/actionably concrete whenever possible.

Bad:

> Work on career.

Better:

> Open the job application document.

Better:

> Open your resume file.

Even smaller when stuck:

> Put your hand on the mouse.

The goal is to reduce activation energy.

---

# 12. NOW SCREEN DESIGN PHILOSOPHY

Now/Home is the default screen.

It should be adaptive.

## Action state

The screen should be extremely focused.

Show primarily:
- current action
- essential context
- start control
- useful timer if needed
- minimal progress/momentum information
- companion/avatar when useful

Avoid overwhelming dashboards.

## Overview state

The user should be able to deliberately expand the screen to see:
- today's progress
- upcoming work
- Life Map information
- momentum
- world status
- relevant statistics
- recommendations

The application should never force the overview on the user when action is required.

Core principle:

> The app should reduce cognitive load, not become another distraction.

---

# 13. NORMAL TASK START

Under normal conditions:

> ONE TAP → START

The app should not add unnecessary rituals.

---

# 14. V1 SYSTEM 2
# ACTIVATION / RESCUE MODE

Wake-up assistance belongs inside Activation / Rescue Mode.

It is not a separate V1 system.

Rescue Mode exists for:
- being stuck in bed
- freezing
- avoiding a task
- repeatedly postponing
- losing focus
- getting trapped in distraction
- failing to initiate

Conceptual sequence:

```text
Detect stuck state
↓
Pattern interrupt
↓
Microscopic physical/action step
↓
Immediate feedback
↓
Next tiny step
↓
Momentum
↓
Increase challenge gradually
```

Example:

```text
Get out of bed
↓
Put feet on floor
↓
Stand
↓
Walk to bathroom
↓
Turn on light
↓
Begin first morning action
```

---

# 15. PATTERN INTERRUPT

The product may use safe forms of pattern interruption such as:

- novelty
- visual changes
- sound where appropriate
- physical prompts
- environmental prompts
- movement prompts
- task reframing
- immediate micro-challenges
- changing the interaction modality

The purpose is to break automatic avoidance and create a transition into action.

Do not use harmful or dangerous “shock” mechanisms literally.

---

# 16. RESCUE ESCALATION

If the user ignores the first intervention:

Possible sequence:

1. small reminder
2. smaller action
3. adaptive question
4. new intervention strategy
5. distraction interruption
6. accountability mechanism
7. stronger but safe urgency
8. recovery/replanning if the task is genuinely inappropriate

The system should distinguish:

> “I am refusing”

from

> “I genuinely cannot initiate right now.”

Do not assume resistance is always laziness.

---

# 17. STUCK-STATE DETECTION

Potential signals include a combination of:

- repeated postponements
- long inactivity
- lack of interaction
- repeated task abandonment
- opening distracting applications
- explicit “I’m stuck”
- physical inactivity when available
- repeated failed starts
- historical avoidance patterns

The system should not rely on a single threshold.

Example:

```text
Repeated postponement
+
no meaningful progress
+
distracting-app activity
+
long inactivity
=
possible stuck state
```

Detection should remain probabilistic rather than pretending to know the user's mind.

---

# 18. V1 SYSTEM 3
# ADAPTIVE FOCUS MODE

Focus Mode should:
- start with very low friction
- show the current task
- provide an optional timer
- stay with the user
- minimize distraction
- potentially restrict distracting applications where technically possible and explicitly enabled
- adapt session length
- adapt intervention intensity
- shorten sessions if the user struggles
- simplify sessions if needed
- remain quiet when the user is in flow
- intervene again when drift occurs

---

# 19. FOCUS SESSION ADAPTATION

Example:

User struggles:

> 5-minute session

User maintains momentum:

> 10-minute session

User enters flow:

> stop interrupting and let them continue

The system should not rigidly force:
- Pomodoro
- 25-minute sessions
- fixed timers
- fixed break intervals

unless those methods are actually useful for the individual.

---

# 20. DIGITAL DISTRACTION MANAGEMENT

The product may eventually be able to:
- detect distracting application use
- identify recurring distraction patterns
- temporarily block or restrict distracting applications/sites
- interrupt high-risk distraction moments
- make returning to the current task easier

However:

- blocking should be user-controlled
- restrictions should be transparent
- avoid irreversible lockouts
- avoid creating dangerous situations
- technical capabilities depend on Android APIs and permissions

Distraction blocking is a requirement/decision that needs technical feasibility analysis.

---

# 21. V1 SYSTEM 4
# AI PLANNING LAYER

AI should be a natural-language control interface for the entire system.

The user should be able to communicate naturally.

Example:

> “I need to get my life together. I want to build muscle, fix my sleep, learn programming, study math, clean my room, find a job, and stop wasting so much time online.”

The AI should transform this into structured planning information.

Potential objects:
- life areas
- goals
- projects
- skills
- milestones
- tasks
- habits
- routines
- learning plans
- priorities
- next actions

The user should not be forced to manually classify everything.

---

# 22. LARGE MESSY INPUT

The user may paste an enormous list such as 300–400 things they want to accomplish.

The AI should:
- parse it
- identify duplicates
- identify related goals
- group related ideas
- distinguish goals from actions
- identify habits
- identify projects
- identify deadlines
- estimate relative importance/urgency
- identify conflicts
- detect overload
- turn it into a manageable structure

Execution view:

```text
RIGHT NOW
TODAY
THIS WEEK
LATER
OPTIONAL / DREAMS
```

The user should see the small actionable slice rather than the entire list.

---

# 23. HYBRID LIFE MAP

The preferred long-term model is:

```text
                         LIFE
                           │
           ┌───────────────┼───────────────┐
           ↓               ↓               ↓
       Life Areas        Skills          Themes
           │
     Goals / Projects
           │
    Milestones / Plans
           │
    Tasks / Habits / Routines
           │
      EXECUTION LAYER
           │
     ┌─────┼────────┐
     ↓     ↓        ↓
  Now    Today   This Week
```

The Life Map stores long-term direction.

The execution layer handles immediate action.

---

# 24. LIFE MAP DOMAINS

Initial life domains:

1. Health
2. Work / Career
3. Learning
4. Personal Growth
5. Digital Behavior
6. Creative Work
7. Life Maintenance
8. Relationships

These should remain flexible.

The system should not force every real-world goal into one rigid category.

---

# 25. V1 SYSTEM 5
# SMART TASKS & HABITS

The task/habit system should manage:

- tasks
- recurring habits
- deadlines
- priorities
- progress
- unfinished work
- routines
- relevant dependencies

The user should perform minimal administrative work.

The system should handle planning overhead wherever safely possible.

---

# 26. TASK VS HABIT

The AI should infer whether something is better represented as:

### Task

A finite action or outcome.

Examples:
- submit application
- clean bedroom
- finish assignment

### Habit

A repeated behavior.

Examples:
- brush teeth
- exercise
- sleep routine

### Goal

A desired long-term outcome.

Examples:
- become physically stronger
- learn programming

### Project

A collection of related actions with an outcome.

Examples:
- build portfolio
- build an application

### Routine

A sequence of recurring behaviors.

Examples:
- morning routine
- shutdown routine

### Learning plan

A structured educational progression.

---

# 27. PRIORITIZATION MODEL

The system should combine:

- urgency
- importance
- consequences
- long-term goals
- current state
- available time
- deadlines
- previous behavior
- unfinished items
- recent momentum
- variety/randomized variety

Randomized variety is intentional.

When several actions are similarly valid, the system may introduce variety to avoid boredom and monotony.

However:

> randomness must never override safety, critical deadlines, or genuinely important priorities.

---

# 28. CURRENT-STATE AWARENESS

The system should eventually consider:

- time of day
- current activity
- available time
- physical state where available
- sleep/wake data
- screen/app activity
- physical movement/activity
- calendar
- deadlines
- location when explicitly permitted
- self-reported mood/energy
- historical performance

These are context signals, not requirements that everything must be available in V1.

---

# 29. ADAPTIVE AUTONOMY

The user explicitly wants multiple autonomy modes.

## MANUAL

AI suggests.

User approves.

## GUIDED

AI handles ordinary organization.

Important changes require user involvement.

## AUTOPILOT

AI can maintain and adapt the user's plan automatically.

## RESCUE

AI becomes more active and directive when the user is stuck.

The product may eventually dynamically recommend an autonomy level based on the user's state.

---

# 30. ACCOUNTABILITY

Accountability should be layered and optional.

Potential levels:

### AI Accountability

The application's own coach/agent monitors progress and follows up.

### Trusted Person

A friend/family member can receive selected information.

### Optional Community/Anonymous Accountability

The user can voluntarily participate in anonymous or pseudonymous accountability systems.

Privacy must be explicit.

The user should control:
- whether it is enabled
- who receives information
- what is shared
- when it escalates
- how it stops

Accountability is contextual rather than necessarily a major navigation tab.

---

# 31. COACH PERSONALITIES

The product may support multiple interaction styles.

Examples:

### Supportive Companion
Warm, encouraging, nonjudgmental.

### Tough Coach
Energetic, demanding, action-oriented.

### Strategist
Analytical, concise, explains why something matters.

### Playful Game Character
Expressive, humorous, animated, reward-oriented.

These are interaction styles, not medical or psychological authorities.

The user may eventually select preferred styles or let the system adapt them.

---

# 32. MOTIVATION AND REWARD PHILOSOPHY

The user wants the app to be visually stimulating and rewarding.

Potential mechanics include:
- XP
- levels
- streaks
- momentum
- coins
- collectibles
- animated rewards
- companion reactions
- sound effects
- music
- progress bars
- unlocks
- visual celebrations
- surprises
- achievements
- world development

However, the system should reward meaningful behavior rather than arbitrary checkbox completion.

Especially important:

> Starting despite resistance is itself a meaningful achievement.

The product should be able to reward:
- starting
- returning
- maintaining momentum
- overcoming distraction
- completing meaningful work
- recovering after setbacks

not merely perfect streaks.

---

# 33. URGENCY

The app should be capable of creating useful urgency.

Potential mechanisms:
- countdowns
- deadlines
- expiring missions
- temporary opportunities
- streak/momentum risk
- limited rewards
- contextual reminders
- accountability escalation
- visible consequences inside the game system

However:

The system should not use:
- humiliation
- abusive threats
- physical punishment
- dangerous self-denial
- severe irreversible loss
- intentionally harmful psychological pressure

Urgency should motivate action while remaining safe and reversible.

---

# 34. BREAKING A STREAK

The user may experience strong discouragement after breaking a streak.

Therefore the product should not make a broken streak equivalent to:

> everything is ruined.

Instead:
- preserve historical progress
- show recovery
- emphasize momentum
- provide comeback opportunities
- use meaningful streak alternatives where useful
- avoid all-or-nothing framing

A streak can be useful but must not become the entire motivational model.

---

# 35. “NOT NOW, NOT NEVER”

Goals that conflict with current priorities should enter a resting state.

Example:

> Programming — Resting  
> Progress: 42%  
> Reason: current priorities are sleep stabilization + exercise  
> Resume condition: review next week

The goal:
- remains visible
- retains progress
- is intentionally paused
- should not create constant guilt
- can be reactivated

---

# 36. FAILURE AND RECOVERY

The product should treat failure as information.

When the user fails repeatedly:

Do not simply report:

> “You failed.”

Instead investigate:

- Was the task too large?
- Was it badly timed?
- Was the environment distracting?
- Was the task unclear?
- Was the user fatigued?
- Was there too much competing demand?
- Was the goal unrealistic?
- Did the intervention fail?

Then adapt.

---

# 37. COMEBACK EXPERIENCE

When returning after a bad period:

```text
Warm welcome
↓
Tiny action
↓
Visible comeback animation/event
↓
Adaptive recovery plan
↓
Normal operation
```

No backlog avalanche.

No:

> “You missed 147 things. Here they all are.”

Instead:

> “You are returning, not starting from zero.”

---

# 38. GAME WORLD VISION

The full game world is a future layer, not a core V1 implementation.

The long-term vision includes:

- personal base/world
- separate life regions
- character/avatar
- pets/companions
- equipment
- unlockable abilities
- collectibles
- trophies
- achievements
- visual life tree
- skill graph
- evolving environment

The world should visually represent meaningful real-life progress.

Example:

```text
Exercise consistency
→ Health region grows

Programming progress
→ Career/Skill region expands

Studying
→ Knowledge region develops

Relationship maintenance
→ Social area develops
```

---

# 39. WORLD BEHAVIOR DURING ABSENCE

If the user stops using the application:

Nothing important should be permanently destroyed.

The world may:
- become quieter
- become less vibrant
- slow its activity
- show signs of dormancy

But when the user returns:

- it responds positively
- recovery begins
- progress remains
- the user receives a satisfying comeback experience

---

# 40. ORIGINALITY REQUIREMENT

The product should not simply copy:

- Habitica
- TickTick
- Todoist
- Super Productivity
- generic Pomodoro apps
- generic AI planner apps

Those products can inspire individual ideas, but this application should have its own identity.

Potentially original future concepts should be actively considered when they strengthen the product's central principle.

Any new idea should be evaluated against:

> Does this meaningfully reduce the distance between intention and action?

---

# 41. LEARNING SYSTEM VISION

Learning is a future expansion area.

Possible future capabilities:
- notes
- study materials
- AI summarization
- flashcards
- quizzes
- spaced repetition
- mnemonic systems
- study plans
- progress tracking
- knowledge graphs
- skill progression
- learning analytics

The larger ambition is to help users:
- learn
- remember
- practice
- implement
- build skills

However, this should not explode V1 scope.

---

# 42. INSIGHTS / ANALYTICS VISION

The user likes detailed data and visual analytics.

Future insights may include:
- consistency
- behavior patterns
- procrastination patterns
- task completion
- focus performance
- momentum
- time allocation
- life-domain progress
- habit patterns
- charts
- bar graphs
- line graphs
- pie charts
- timelines
- correlations
- AI-generated recommendations

The user wants to be able to understand themselves analytically.

However:

Advanced analytics are NOT required for V1.

---

# 43. MAIN NAVIGATION

Preferred navigation:

1. Now / Home
2. Life Map
3. Tasks & Habits
4. Learn
5. Game World
6. Insights
7. AI Coach

Settings remain separate.

Social/accountability is contextual.

Now/Home is the default.

---

# 44. NOW SCREEN PRIORITY

The Now screen is the most important screen.

Default behavior:

> action-first

Possible expanded behavior:

> overview/dashboard

The user should not need to navigate through multiple pages to discover the next action.

---

# 45. AI COACH

AI Coach is not merely a chatbot.

It is the natural-language interface to the rest of the system.

The user should be able to ask:

- “What should I do now?”
- “I have no energy.”
- “I keep avoiding this.”
- “I have 200 things I want to accomplish.”
- “Plan my week.”
- “I want to learn Python.”
- “I fell off for two weeks.”
- “Why do I keep avoiding this?”
- “Reorganize my priorities.”
- “Make this project smaller.”
- “Turn this into habits.”
- “Create a recovery plan.”

The AI should be able to convert natural language into structured system changes where the selected autonomy mode permits it.

---

# 46. AI SHOULD MINIMIZE ADMINISTRATION

A critical requirement:

> The user should not have to become the manager of their own productivity-management software.

The system should automate:
- categorization
- prioritization
- task decomposition
- reminders
- routine maintenance
- adaptation
- backlog organization
- recovery planning
- context-sensitive recommendations

while preserving user control.

---

# 47. VISUAL DESIGN DIRECTION

Desired style is a combination of:

### Cute & Game-Like
- colorful
- friendly
- animated
- characters
- collectibles
- playful world

### Futuristic / High Stimulation
- glowing UI
- HUD elements
- satisfying progress animations
- missions
- energy
- futuristic status visualization

### Beautiful / Calm
- polished
- premium
- visually rich
- clean
- organized
- comfortable

### Dark / Powerful
- dramatic modes
- mission/control-center aesthetics
- urgency states
- strong contrast
- “mission” atmosphere

The overall product should blend these instead of choosing only one.

---

# 48. VISUAL STIMULATION VS COGNITIVE LOAD

Important UX rule:

> The application can be visually exciting without being cognitively noisy.

When the user needs to act:

> reduce visual complexity.

When exploring:
- Game World
- Life Map
- Insights

the interface may become richer.

The visual design must always serve the behavioral goal.

---

# 49. ANDROID-FIRST STRATEGY

First platform:

> Android.

Reason:

Some of the most valuable concepts depend on mobile-specific capabilities:
- persistent notifications
- alarms/reminders
- background behavior
- physical activity signals
- app usage
- screen time
- distraction restrictions
- phone-as-context

Architecture should be designed so Web/PWA and Windows can be supported later.

Do not introduce cross-platform complexity prematurely.

---

# 50. PRIVACY PRINCIPLES

Potentially sensitive data includes:
- behavior
- screen/app usage
- physical activity
- location
- mood/energy
- routines
- productivity history
- potentially health-related information

Therefore:
- collect only what is necessary
- make sensitive features opt-in
- explain what data is used
- allow individual permissions to be disabled
- avoid unnecessary cloud storage
- protect secrets
- do not share data without explicit control
- do not make privacy secondary to gamification

---

# 51. V1 SCOPE

V1 is successful if the following five systems genuinely work:

1. Now → Next Tiny Action
2. Activation / Rescue Mode
3. Adaptive Focus Mode
4. AI Planning Layer
5. Smart Tasks & Habits

These are the core product.

---

# 52. V1 PLACEHOLDER SECTIONS

For V1:

### Game World
Navigation exists.

Only placeholder/lightweight motivational representation is needed.

### Learn
Navigation exists.

Do not build the full learning platform.

### Insights
Navigation exists.

Do not build the complete analytics platform.

These placeholder areas exist so that:
- navigation is future-ready
- the product vision is visible
- later development does not require redesigning the entire shell

But V1 implementation effort must remain focused on the five core systems.

---

# 53. NON-V1 FEATURES

The following should not become major V1 projects:

- full RPG/world simulation
- extensive multiplayer/social systems
- community platform
- complete learning platform
- advanced flashcard engine
- advanced analytics
- complex skill graphs
- elaborate collectible systems
- large-scale achievements
- sophisticated AI psychology engine beyond what is necessary for the core behavior loop

They remain future development opportunities.

---

# 54. PRODUCT SUCCESS

The product should be considered successful when it measurably improves:

- starting behavior
- returning after avoidance
- consistency
- focus
- ability to choose what to do
- reduction in overwhelming planning
- reduction in administrative effort

The main outcome is behavioral execution.

Not:
- number of tasks created
- number of dashboards
- number of features
- amount of XP

---

# 55. PRODUCT FAILURE CONDITIONS

Potential warning signs include:
- user spends more time planning than acting
- user constantly customizes the app instead of using it
- huge dashboards increase overwhelm
- notification spam causes users to ignore notifications
- AI produces elaborate but unrealistic plans
- game mechanics reward meaningless activity
- user becomes dependent on arbitrary streaks
- task administration becomes exhausting
- too many choices are presented
- the app punishes failure so strongly that returning becomes harder
- the AI confidently invents assumptions
- the system treats every problem as a productivity failure
- the system attempts to act like a medical professional

---

# 56. PRODUCT DECISION PHILOSOPHY

Prefer:

- simple over sophisticated
- adaptive over rigid
- action over administration
- small steps over large instructions
- meaningful progress over arbitrary points
- recoverability over punishment
- transparency over hidden behavior
- user control over irreversible automation
- practical reliability over novelty

---

# 57. TECHNICAL DIRECTION CONSTRAINTS

The eventual project should be built around:

- $0 cost as the default
- genuinely free software/services where possible
- free tiers clearly distinguished from unlimited/free software
- no hidden billing
- no automatic charges
- no unnecessary paid APIs
- simple architecture
- Android-first
- future compatibility with Web/PWA and Windows where practical

Do not lock technology yet in this product document.

Technology selection belongs in the later technical-planning stage.

---

# 58. AI DEVELOPMENT STRATEGY

AI coding agents should be used heavily during development.

Expected AI responsibilities:
- inspect repository
- plan small tasks
- implement
- test
- debug
- document
- maintain project memory
- perform repetitive work

Human/product-owner responsibilities:
- product direction
- approval of important decisions
- evaluating UX
- understanding major changes
- reviewing visual designs
- deciding priorities

Avoid using AI conversation history as the project's long-term memory.

The repository must contain the project memory.

---

# 59. PERSISTENT PROJECT MEMORY

The project should maintain persistent documentation such as:

```text
AGENTS.md

README.md

docs/
    product.md
    requirements.md
    architecture.md
    decisions.md
    status.md
    testing.md

.agent/
    current-task.md
    session-handoff.md
```

Use the simplest effective structure.

Do not create excessive documentation merely for appearance.

---

# 60. AGENTS.MD

`AGENTS.md` should eventually contain:
- coding rules
- repository conventions
- testing requirements
- safety rules
- documentation rules
- “inspect before editing”
- “make the smallest reasonable change”
- “do not modify unrelated files”
- “test before claiming completion”
- “do not expose secrets”
- “ask before destructive operations”

---

# 61. SESSION HANDOFF

Every coding session should end with a persistent handoff containing:

- what changed
- current state
- files changed
- tests run
- what works
- what does not work
- decisions made
- known problems
- exact next step

A new AI session should be able to inspect the repository and continue without a long explanation from the human.

---

# 62. DEVELOPMENT METHODOLOGY

The project must use:

```text
Plan
↓
Small task
↓
Inspect
↓
Implement
↓
Test
↓
Verify
↓
Document
↓
Commit
↓
Next task
```

Do not build the entire application in one giant prompt.

Break work into small tasks that can be reliably completed within model/context limitations.

---

# 63. UX-FIRST DEVELOPMENT

Before real application implementation:

1. establish requirements
2. establish user flows
3. define screens
4. create rough wireframes
5. create visual/UI concept
6. review with the product owner
7. iterate
8. only then finalize technical architecture
9. then begin implementation

The initial visual design is not automatically final.

The product owner must be able to request changes before significant implementation effort is invested.

---

# 64. CURRENT PRODUCT DISCOVERY DECISIONS

The following decisions have already been made.

### Target
Personal use first.

### Long-term audience
Others with similar difficulties, plus students/lifelong learners.

### Product type
Adaptive execution-support system.

### Core principle
Reduce distance between intention and action.

### Primary experience
Now → Next Tiny Action.

### Rescue
Adaptive Activation/Rescue Mode.

### Focus
Adaptive Focus Mode.

### Planning
AI-powered natural-language planning.

### Organization
Hybrid Life Map + execution layer.

### Execution structure
Right Now → Today → This Week → Later → Optional/Dreams.

### Priority
Combination of urgency, importance, consequences, long-term goals, current state, behavior, deadlines, and variety.

### Autonomy
Manual / Guided / Autopilot / Rescue.

### Failure behavior
Recovery, not shame.

### Goal parking
“Not now, not never.”

### Gamification
Meaningful real-world progression.

### Visual style
Cute + futuristic + premium + dark/powerful.

### Now screen
Adaptive, defaulting to highly focused.

### Task start
One tap normally; automatic activation sequence when stuck.

### Focus
Adaptive and minimal.

### Self-report
Very little.

### Context
Eventually broad, permission-controlled context awareness.

### Accountability
AI + optional trusted person + optional community.

### Platform
Android first.

### Future platforms
Web/PWA and Windows.

### V1
Exactly five core systems.

### Game World / Learn / Insights
Placeholder/lightweight in V1.

---

# 65. CURRENTLY UNRESOLVED DECISIONS

These should not be silently finalized.

Examples:
- final product name
- local-first vs cloud-first architecture
- exact Android distraction-blocking capabilities
- exact notification/reminder implementation
- specific AI model/provider strategy inside the app
- exact data-sync model
- eventual account system
- exact backend requirements
- specific game mechanics
- final visual design

When any of these become necessary, present a small number of practical options and explain the trade-offs briefly.

Do not ask multiple questions at once.

---

# 66. PRODUCT NAME

There is currently no final product name.

Use a neutral working title until the product owner chooses a name.

Do not invent a permanent brand identity without approval.

---

# 67. LOCAL-FIRST / CLOUD PRINCIPLE

This decision is not finalized.

However, the product should strongly consider:
- minimizing sensitive cloud data
- keeping functionality local where practical
- using cloud AI only where beneficial
- preserving user ownership of data
- avoiding unnecessary infrastructure costs

The final architecture decision must balance:
- privacy
- cost
- reliability
- AI capability
- synchronization
- Android functionality
- future multi-device support

---

# 68. FREE-COST PRODUCT CONSTRAINT

The overall project is being designed around a $0 development/operation goal.

Any service recommendation must clearly distinguish:
- completely free
- free with limits
- free requiring an account
- local-only/free software
- temporary/trial access
- paid

Do not describe limited free tiers as unlimited.

Paid services should not be assumed.

Potential paid services must be explicitly marked and justified before consideration.

---

# 69. AI MODEL / DEVELOPMENT TOOL CONSTRAINT

The developer has access to:
- Codex
- OpenCode
- Cursor
- Claude
- ChatGPT desktop app
- Ollama
- Git Bash

Existing local models:
- qwen3.5:4b
- qwen3.5:9b

The developer's hardware is not comfortable for primary local-Qwen development.

Therefore:
- do not assume Ollama is the primary development solution
- use it as a local fallback/emergency/testing option
- prioritize reliable free cloud coding agents/models where available
- avoid unnecessary paid usage

OpenCode is intended to be the primary repository-operating coding agent unless later evidence shows a better free alternative.

---

# 70. AI CODING AGENT EXPECTATIONS

The coding agent should be able to:
- inspect repository
- create/read/edit/delete appropriate files
- create directories
- run commands
- install dependencies when approved
- run tests
- debug problems
- maintain documentation
- maintain project memory
- iterate on implementations

The agent should inspect existing repository state before changing anything.

---

# 71. PROMPT / CONTEXT ENGINEERING PRINCIPLE

Prefer:

> small task prompts + persistent project memory

over giant repeated prompts.

Stable product information belongs in project documentation.

Temporary task instructions belong in the current prompt.

A new AI session should reconstruct the project primarily by inspecting:
- AGENTS.md
- product documentation
- status
- handoff
- Git history
- relevant source files

---

# 72. TASK PROMPT PHILOSOPHY

Future implementation prompts should generally ask the coding agent to:

1. inspect relevant files
2. understand existing behavior
3. make the smallest reasonable change
4. avoid unrelated modifications
5. write/update tests
6. run tests
7. verify results
8. update relevant documentation
9. report what changed
10. report any remaining issue

---

# 73. SAFETY / REVERSIBILITY

Warn before:
- deleting work
- overwriting important files
- destructive Git operations
- exposing secrets
- changing important system settings
- creating charges
- destroying data
- irreversible changes

Avoid:
- `git reset --hard`
- destructive cleanup
- unnecessary mass deletion
- silently changing environment configuration

The coding agent should request confirmation where appropriate.

---

# 74. THE PRODUCT SHOULD NOT BECOME THE PROBLEM

This is a central constraint.

The application itself could become a high-stimulation distraction.

Therefore the product must maintain two distinct modes:

## Exploration / Motivation

Can be:
- colorful
- animated
- game-like
- rich
- rewarding

## Action / Execution

Should be:
- simple
- focused
- quiet
- low-friction
- cognitively light

The interface must know the difference.

---

# 75. THE BIG PICTURE

The long-term conceptual architecture is:

```text
                         USER
                           │
                           ▼
                    AI COACH / INPUT
                           │
                           ▼
                     LIFE MAP
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
      GOALS             PROJECTS            SKILLS
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                  TASKS / HABITS / ROUTINES
                           │
                           ▼
                   PRIORITIZATION ENGINE
                           │
                           ▼
                 ADAPTIVE DECISION ENGINE
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
           NOW          RESCUE          FOCUS
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                      USER ACTION
                           │
                           ▼
                       OBSERVATION
                           │
                           ▼
                    ADAPT / LEARN
                           │
                           ▼
                   PROGRESS / REWARD
                           │
                           ▼
                  LIFE MAP / GAME WORLD
```

This is the conceptual model.

Do not treat this as a final technical architecture until technical planning is completed.

---

# 76. PRODUCT NORTH STAR

The product should ultimately feel like:

> A personal adaptive command center that helps me turn intentions into physical actions.

Not:

> another todo app.

Not:

> another habit tracker.

Not:

> another chatbot.

Not:

> another game with productivity points.

It is the combination of:

- adaptive task execution
- activation support
- focus support
- AI planning
- behavior-aware prioritization
- recovery
- meaningful gamification
- personalized context
- minimal administration

---

# 77. END STATE OF THE PRODUCT VISION

A mature version of this application could eventually:

- understand the user's long-term life goals
- understand current priorities
- ingest messy thoughts and lists
- transform them into structured plans
- decide what matters now
- detect whether the user is stuck
- activate the user
- dynamically reduce task difficulty
- support focus
- detect distraction
- remember behavioral patterns
- improve interventions over time
- maintain tasks and habits automatically
- manage competing goals
- preserve deferred goals
- provide accountability
- help with learning
- visualize progress
- turn meaningful real-world progress into game-world development
- help the user recover after setbacks
- continue supporting the user across Android and eventually other platforms

The ultimate goal is not to make the user spend more time inside the app.

The ultimate goal is to make the user **spend more time successfully living the life they want outside the app.**

---

# 78. FINAL V1 BOUNDARY

Before implementation, keep repeating this boundary:

## V1 MUST EXCEL AT:

1. WHAT SHOULD I DO NOW?
2. HELP ME START.
3. HELP ME FOCUS.
4. HELP ME PLAN.
5. HELP ME MAINTAIN THE PLAN.

Everything else is secondary.

---

# 79. INSTRUCTION TO FUTURE AI AGENTS

When working on this project:

- read this document before making major product decisions
- inspect the repository before editing
- do not assume missing details
- do not invent requirements
- distinguish V1 from future vision
- preserve the adaptive nature of the product
- preserve the “reduce distance between intention and action” principle
- prefer small, testable changes
- minimize unnecessary complexity
- do not silently expand scope
- do not silently replace product decisions
- ask one important question at a time when user clarification is truly necessary
- maintain persistent project documentation
- preserve reversibility
- optimize for a beginner product owner
- keep the project realistically buildable
- prioritize reliability over impressive complexity

The product owner should be able to understand what is happening even without technical knowledge.

---

# 80. CURRENT PHASE

Current phase:

> V1 IMPLEMENTATION - CORE SYSTEMS COMPLETE

## Implemented Features
- Room Database with 7 entities and DAOs
- Repository layer (Task, Habit, HabitLog, UserState)
- Hilt Dependency Injection
- Navigation with bottom nav
- Now Screen (System 1: Next Tiny Action) - Complete
- Tasks Screen (System 5: Smart Tasks & Habits) - Complete with CRUD
- Habits Screen (System 5: Smart Tasks & Habits) - Complete with CRUD
- Focus Mode Screen (System 3) - Complete with timer, app block, DND
- AI Coach Screen (System 4) - Complete with chat interface
- Rescue Mode Screen (System 2) - Complete with action suggestions

## Next Steps
1. Implement Settings Screen
2. Implement More Screen (Activity Feed)
3. Add Supabase sync
4. Integrate Gemini API
5. Test and verify all screens

Next intended phases:

```text
Product Vision
    ↓
Requirements
    ↓
User Flows
    ↓
Screen List
    ↓
Wireframes
    ↓
Visual/UI Concept
    ↓
UX Refinement
    ↓
Technical Plan
    ↓
Architecture
    ↓
Repository Setup
    ↓
Implementation
    ↓
Testing
    ↓
Debugging
    ↓
Documentation
    ↓
Deployment
```

The product owner must review the interface and major UX direction before substantial application implementation begins.

