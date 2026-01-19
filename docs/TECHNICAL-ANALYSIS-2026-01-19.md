# Technical Analysis - FreeRiverHouse Roadmap Items
# Date: 2026-01-19
# Author: Engineering Department Manager

---

## Executive Summary

This document provides a comprehensive technical analysis of all new roadmap items from `/CascadeProjects/ROADMAP.md`. For each item, I analyze:
- Technical requirements
- Files/modules to create or modify
- Recommended technology stack
- Complexity estimation
- Dependencies between projects
- Quick wins (immediate actions)

---

## Priority Matrix

| Item | Priority | Impact | Effort | Quick Win Available |
|------|----------|--------|--------|---------------------|
| VR IDE Gamified | P0 | HIGH | HIGH | Yes (prototype) |
| SwiftUI Claude Control | P0 | HIGH | MEDIUM | Yes (basic app) |
| Zero Approvals System | P0 | HIGH | MEDIUM | Yes (skills framework) |
| Free River Flow App | P1 | MEDIUM | HIGH | Yes (voice prototype) |
| Free River Studio | P1 | MEDIUM | HIGH | No |
| English Poetry Anthology | P1 | MEDIUM | LOW | Yes (immediate) |
| Hedra Video Integration | P2 | MEDIUM | LOW | Yes (workflow exists) |
| AI Beats Distribution | P2 | LOW | MEDIUM | Yes (DistroKid setup) |
| Architettura Easy | P3 | LOW | LOW | Yes (templates) |

---

## 1. VR IDE Gamified (P0 - HIGH PRIORITY)

### Vision
"Make sure to stay in the flow, and we'll do the rest" - A VR environment where development becomes a game. Backend runs on Mac, VR is the GUI.

### Technical Requirements

#### Architecture Overview
```
+------------------+      WebSocket/HTTP      +------------------+
|   Meta Quest 2   | <-------------------->  |   Mac Backend    |
|   (VR GUI)       |                         |   (Claude Code)  |
+------------------+                         +------------------+
       |                                            |
       v                                            v
  - Voice input                              - Claude API
  - 3D Office UI                             - Git operations
  - Avatar agents                            - File system
  - Task visualization                       - Project scanning
```

#### VR Component (Unity + Meta XR SDK)
Based on existing research in `/Onde/docs/freeriver-flow-quest2-research.md`:

**Engine Choice: Unity (Recommended)**
- Meta XR SDK native support
- Voice SDK with Wit.ai
- Lip-sync for agents (Oculus LipSync)
- Better VR ecosystem

**Alternative: WebXR**
- Lower barrier to entry
- Cross-platform (Quest, Vision Pro)
- No app store approval needed
- Uses existing web skills

**Key Components:**
1. **VR Office Environment** - Virtual rooms for each agent
2. **Voice Recognition** - Meta Voice SDK / Wit.ai
3. **3D Agent Avatars** - Ready Player Me (LOD Low) or custom
4. **Task Visualization** - 3D Kanban boards, progress bars
5. **Network Layer** - WebSocket to Mac backend

#### Mac Backend Component
```
MacBackend/
├── server/
│   ├── index.ts              # Express/Fastify server
│   ├── websocket.ts          # WebSocket handler
│   ├── routes/
│   │   ├── projects.ts       # Project management
│   │   ├── agents.ts         # Agent coordination
│   │   ├── tasks.ts          # Task CRUD
│   │   └── claude.ts         # Claude API proxy
│   └── services/
│       ├── ProjectScanner.ts # Scan local projects
│       ├── AgentManager.ts   # Multi-agent coordination
│       ├── ClaudeProxy.ts    # Claude Code integration
│       └── TaskScheduler.ts  # Pre-approvals, scheduling
├── package.json
└── tsconfig.json
```

### Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| VR Engine | Unity 2022.3 LTS | Best Meta Quest support |
| VR SDK | Meta XR All-in-One SDK | Voice + Lip-sync included |
| Voice | Meta Voice SDK (Wit.ai) | Low latency, multi-language |
| Avatar | Ready Player Me LOD Low | <20K triangles for Quest |
| Backend | Node.js + TypeScript | Match existing Onde stack |
| Realtime | WebSocket (ws) | Bidirectional communication |
| API | Express/Fastify | REST for non-realtime |
| Database | SQLite/LevelDB | Local state persistence |

### Files/Folders to Create

```
/CascadeProjects/FreeRiverFlow/
├── VRApp/                           # Unity project (exists partially)
│   ├── Assets/
│   │   ├── Scripts/
│   │   │   ├── Network/
│   │   │   │   ├── BackendConnection.cs
│   │   │   │   └── WebSocketClient.cs
│   │   │   ├── Agents/
│   │   │   │   ├── AgentController.cs
│   │   │   │   ├── LipSyncController.cs
│   │   │   │   └── VoiceInputHandler.cs
│   │   │   ├── UI/
│   │   │   │   ├── VRKanbanBoard.cs
│   │   │   │   ├── TaskCard.cs
│   │   │   │   └── OfficeNavigator.cs
│   │   │   └── Core/
│   │   │       ├── SessionManager.cs
│   │   │       └── PreApprovalSystem.cs
│   │   ├── Prefabs/
│   │   │   ├── AgentAvatars/
│   │   │   ├── OfficeRooms/
│   │   │   └── UIElements/
│   │   └── Scenes/
│   │       ├── MainOffice.unity
│   │       └── MeetingRoom.unity
│   └── Packages/
│       └── manifest.json           # Meta XR SDK, etc.
│
├── MacServer/                       # Node.js backend
│   ├── src/
│   │   ├── index.ts
│   │   ├── websocket.ts
│   │   ├── routes/
│   │   └── services/
│   ├── package.json
│   └── tsconfig.json
│
└── Docs/
    ├── ARCHITECTURE.md
    ├── VR-SETUP.md
    └── API-REFERENCE.md
```

### Complexity Estimation

| Component | Effort (Days) | Skills Required |
|-----------|---------------|-----------------|
| VR Environment Base | 5 | Unity, C# |
| Voice Integration | 3 | Meta SDK, Wit.ai |
| Avatar System | 4 | Unity, 3D |
| Backend Server | 3 | Node.js, TypeScript |
| WebSocket Integration | 2 | Both sides |
| Task Visualization | 4 | Unity UI |
| Pre-approval System | 3 | Full stack |
| Testing & Polish | 5 | QA |
| **Total** | **29 days** | |

### Dependencies
- Meta Developer account (already have)
- Wit.ai account (part of Meta)
- Unity 2022.3 LTS
- Quest 2 device
- Anthropic API key

### Quick Wins
1. **TODAY**: Create basic Node.js backend with WebSocket
2. **THIS WEEK**: Unity project with basic office scene
3. **THIS WEEK**: Voice input working (Wit.ai)
4. **NEXT WEEK**: First working prototype (voice -> Claude -> response)

### Integration Points
- Connects to existing `BusinessIsBusiness/MacServer/` patterns
- Reuses agent definitions from `/CascadeProjects/.claude/agents/`
- Can reuse `BiBDashboard` project scanner logic

---

## 2. SwiftUI Claude Control App (P0)

### Vision
iPhone/iPad/Watch app to control Claude remotely. Dashboard for workflows, "lavando piatti" mode (voice/haptic), code surfing with live-preview. Target: -50% approvals.

### Technical Requirements

#### Architecture
```
+----------------+     APNs      +----------------+
|   iOS App      | <-----------> |   Mac Server   |
|   (SwiftUI)    |               |   (Node.js)    |
+----------------+               +----------------+
       |                                |
       v                                v
  - Dashboard UI                  - Claude Code
  - Voice control                 - Project state
  - Haptic feedback               - Task queue
  - Apple Watch companion         - Notifications
```

#### Core Features

1. **Workflow Dashboard**
   - Real-time task status
   - Agent activity feed
   - Project health overview

2. **"Lavando Piatti" Mode**
   - Voice-first interface
   - Haptic confirmation
   - Audio summaries via TTS
   - Hands-free approval

3. **Code Surfing**
   - Live file preview
   - Diff viewer
   - Syntax highlighting
   - Pinch-to-zoom

4. **iOS Shortcuts Integration**
   - Siri commands
   - Widget support
   - Quick actions

### Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| UI | SwiftUI 6 | Native, declarative |
| State | SwiftData / Core Data | Local persistence |
| Network | URLSession + async/await | Native Swift |
| Realtime | WebSocket | Live updates |
| Voice | SFSpeechRecognizer | On-device STT |
| TTS | AVSpeechSynthesizer | On-device TTS |
| Push | APNs | Apple Push Notifications |
| Watch | WatchKit + SwiftUI | Companion app |

### Files/Folders to Create

```
/CascadeProjects/ClaudeControlApp/
├── ClaudeControl/                    # Main iOS app
│   ├── ClaudeControlApp.swift
│   ├── ContentView.swift
│   ├── Views/
│   │   ├── Dashboard/
│   │   │   ├── DashboardView.swift
│   │   │   ├── TaskCardView.swift
│   │   │   └── AgentStatusView.swift
│   │   ├── Approval/
│   │   │   ├── ApprovalListView.swift
│   │   │   ├── ApprovalDetailView.swift
│   │   │   └── VoiceApprovalView.swift
│   │   ├── CodeSurf/
│   │   │   ├── CodeBrowserView.swift
│   │   │   └── DiffView.swift
│   │   └── Settings/
│   │       └── SettingsView.swift
│   ├── Models/
│   │   ├── Task.swift
│   │   ├── Agent.swift
│   │   ├── Approval.swift
│   │   └── Project.swift
│   ├── Services/
│   │   ├── ClaudeService.swift
│   │   ├── WebSocketManager.swift
│   │   ├── VoiceInputService.swift
│   │   ├── NotificationService.swift
│   │   └── HapticService.swift
│   ├── Intents/                      # Shortcuts integration
│   │   └── ApproveTaskIntent.swift
│   └── Resources/
│       └── Assets.xcassets
│
├── ClaudeControlWatch/               # Watch companion
│   ├── ClaudeControlWatchApp.swift
│   ├── ContentView.swift
│   └── Views/
│       ├── ApprovalView.swift
│       └── StatusView.swift
│
└── MacEndpoint/                      # Mac server endpoint
    ├── src/
    │   ├── index.ts
    │   ├── routes/
    │   │   ├── status.ts
    │   │   ├── approvals.ts
    │   │   └── push.ts
    │   └── services/
    │       ├── APNsService.ts
    │       └── ClaudeStateManager.ts
    ├── package.json
    └── credentials/
        └── APNs.p8               # Apple Push cert
```

### Backend Integration

Need to expose endpoints from Mac for iOS to connect:

```typescript
// MacEndpoint/src/routes/status.ts
export const statusRoutes = {
  GET '/status': () => getCurrentClaudeStatus(),
  GET '/tasks': () => getPendingTasks(),
  GET '/approvals': () => getPendingApprovals(),
  POST '/approve/:id': (id) => approveTask(id),
  POST '/reject/:id': (id) => rejectTask(id),
  WS '/live': () => streamLiveUpdates()
}
```

### Claude API Integration in Swift

```swift
// Services/ClaudeService.swift
import Foundation

class ClaudeService {
    private let baseURL: URL
    private let apiKey: String

    func sendMessage(_ message: String) async throws -> String {
        var request = URLRequest(url: baseURL.appendingPathComponent("chat"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["message": message]
        request.httpBody = try JSONEncoder().encode(body)

        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(ClaudeResponse.self, from: data)
        return response.text
    }
}
```

### Complexity Estimation

| Component | Effort (Days) | Skills Required |
|-----------|---------------|-----------------|
| Basic Dashboard | 3 | SwiftUI |
| Task/Approval Views | 3 | SwiftUI |
| WebSocket Integration | 2 | Swift, Node.js |
| Voice Control | 2 | Speech Framework |
| Haptic System | 1 | Core Haptics |
| Watch App | 3 | WatchKit |
| APNs Setup | 2 | Apple Dev Console |
| Shortcuts Integration | 2 | Intents Framework |
| Mac Endpoint | 2 | Node.js |
| Testing | 3 | iOS, watchOS |
| **Total** | **23 days** | |

### Dependencies
- Apple Developer account (already have)
- Mac endpoint server
- APNs certificates
- Physical iPhone and Apple Watch

### Quick Wins
1. **TODAY**: Create Xcode project with basic SwiftUI structure
2. **TODAY**: Set up basic dashboard view with mock data
3. **THIS WEEK**: WebSocket connection to existing Mac server
4. **THIS WEEK**: Voice input working with SFSpeechRecognizer

### Integration Points
- Connects to existing Telegram bot approvals system
- Can reuse approval logic from `/automation/`
- Integrates with launchd scripts for Claude 24/7

---

## 3. Zero Approvals System (P0)

### Vision
Evolution from approval-based to audit post-action. AI auto-creates Skills from the app. Complement to SwiftUI Control App.

### Technical Requirements

#### Current State Analysis
Current approval flow:
```
Claude wants to do X
     |
     v
Request approval via Telegram
     |
     v
Human clicks Yes/No
     |
     v
Claude proceeds or stops
```

#### Target State (Zero Approvals)
```
Claude wants to do X
     |
     v
Check if action matches approved Skill
     |
     +---> YES: Execute immediately, log for audit
     |
     +---> NO: Create new Skill suggestion
           |
           v
      Batch review (daily/weekly)
```

### Skill Framework Design

```typescript
// packages/skills/types.ts
interface Skill {
  id: string;
  name: string;
  description: string;

  // Conditions for when skill applies
  triggers: {
    action_type: 'git_commit' | 'file_write' | 'api_call' | 'post' | ...;
    path_pattern?: RegExp;      // e.g., /tests\/.*\.ts$/
    project?: string;           // e.g., "Onde"
    agent?: string;             // e.g., "qa-test-engineer"
  }[];

  // What the skill is allowed to do
  permissions: {
    allow: string[];            // e.g., ["write_test_files"]
    deny: string[];             // e.g., ["delete_production"]
    require_audit: boolean;     // Log but don't block
  };

  // Auto-generated from patterns
  learned_from?: {
    approved_actions: string[];
    date_created: Date;
    confidence: number;
  };

  // Human oversight
  status: 'suggested' | 'active' | 'disabled';
  approved_by?: string;
  approved_at?: Date;
}
```

### Skill Auto-Generation

```typescript
// packages/skills/SkillLearner.ts
class SkillLearner {
  private approvalHistory: ApprovalRecord[];

  analyzePatterns(): SkillSuggestion[] {
    // Group approved actions by type
    const patterns = this.groupByActionType(this.approvalHistory);

    // Identify repeating patterns (>3 occurrences)
    const repeating = patterns.filter(p => p.count >= 3);

    // Generate skill suggestions
    return repeating.map(pattern => ({
      name: this.generateSkillName(pattern),
      triggers: this.extractTriggers(pattern),
      permissions: this.inferPermissions(pattern),
      confidence: pattern.count / this.approvalHistory.length
    }));
  }
}
```

### Audit System

```typescript
// packages/audit/AuditLogger.ts
interface AuditEntry {
  timestamp: Date;
  action: string;
  agent: string;
  skill_used: string;
  input: any;
  output: any;
  duration_ms: number;
  success: boolean;
  error?: string;
}

class AuditLogger {
  private entries: AuditEntry[] = [];

  log(entry: AuditEntry): void {
    this.entries.push(entry);
    this.persist(entry);

    // Notify if anomaly detected
    if (this.isAnomalous(entry)) {
      this.notifyOwner(entry);
    }
  }

  generateDailyReport(): AuditReport {
    // Summary of all actions taken
    // Grouped by agent, skill, project
    // Highlight any failures or anomalies
  }
}
```

### Files/Folders to Create

```
/CascadeProjects/Onde/packages/skills/
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── SkillRegistry.ts          # Manage active skills
│   ├── SkillLearner.ts           # Auto-generate from patterns
│   ├── SkillMatcher.ts           # Match action to skill
│   └── SkillEvaluator.ts         # Check permissions
├── skills/                        # Skill definitions
│   ├── git-operations.skill.json
│   ├── test-writing.skill.json
│   ├── documentation.skill.json
│   └── code-review.skill.json
└── package.json

/CascadeProjects/Onde/packages/audit/
├── src/
│   ├── index.ts
│   ├── AuditLogger.ts
│   ├── AuditReporter.ts
│   └── AnomalyDetector.ts
├── reports/                       # Generated reports
└── package.json

/CascadeProjects/automation/
├── skills/                        # NEW
│   ├── registry.json
│   └── learned/
└── audit/                         # NEW
    └── logs/
```

### Complexity Estimation

| Component | Effort (Days) | Skills Required |
|-----------|---------------|-----------------|
| Skill Types & Schema | 1 | TypeScript |
| Skill Registry | 2 | TypeScript |
| Skill Learner | 3 | Pattern analysis |
| Skill Matcher | 2 | TypeScript |
| Audit Logger | 2 | TypeScript |
| Audit Reporter | 2 | TypeScript |
| Daily Report Generation | 1 | Markdown/PDF |
| Integration with Claude | 3 | Claude hooks |
| Testing | 2 | Jest |
| **Total** | **18 days** | |

### Dependencies
- Existing approval system in `/automation/`
- Telegram bot for notifications
- Claude Code hooks

### Quick Wins
1. **TODAY**: Define Skill schema and create 5 basic skills
2. **TODAY**: Create audit logger with file persistence
3. **THIS WEEK**: Skill matcher that checks against registry
4. **THIS WEEK**: Integration hook with permission_request.py

---

## 4. Free River Flow App (P1)

### Vision
App that automates life and solves daily problems. Co-parenting, ADHD management, "builds tools on the fly".

### Technical Requirements

Based on existing research in:
- `/Onde/docs/free-river-flow-vision.md`
- `/Onde/docs/freeriver-flow-iphone-research.md`

#### Core Concept: AI-Powered Life Assistant

```
+------------------+     Voice      +------------------+
|   Mobile App     | ------------> |   Claude API     |
|   (Voice-first)  |               |   (via Backend)  |
+------------------+               +------------------+
       |                                  |
       v                                  v
  - Problem description            - Understand intent
  - Context gathering              - Generate solution
  - Tool execution                 - Create mini-app
```

#### "Builds Tools on the Fly"

When user describes a problem, the app:
1. Uses Claude to understand the need
2. Generates a simple solution (calculator, timer, checklist, etc.)
3. Renders it as a dynamic UI
4. Saves it for reuse

Example: "I need to track when I gave my kid medicine"
- Creates: Medicine tracker with timestamps
- Features: Last dose, next dose countdown, history

### Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| Framework | React Native + Expo | Cross-platform, fast dev |
| STT | whisper.rn | On-device, accurate |
| Audio | expo-audio-stream | 16kHz for Whisper |
| TTS | react-native-tts | Free, offline |
| Backend | Node.js + Claude API | Match Onde stack |
| Dynamic UI | react-native-paper | Material components |
| Storage | AsyncStorage / SQLite | Local persistence |

### Files/Folders to Create

```
/CascadeProjects/Onde/apps/freeriver-flow/   # Exists partially
├── src/
│   ├── App.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── VoiceAssistantScreen.tsx
│   │   ├── ToolLibraryScreen.tsx
│   │   └── ToolDetailScreen.tsx
│   ├── components/
│   │   ├── VoiceButton.tsx
│   │   ├── DynamicTool.tsx
│   │   └── ToolCard.tsx
│   ├── services/
│   │   ├── WhisperService.ts
│   │   ├── ClaudeService.ts
│   │   ├── TTSService.ts
│   │   └── ToolGenerator.ts
│   ├── hooks/
│   │   ├── useVoiceInput.ts
│   │   ├── useClaude.ts
│   │   └── useTTS.ts
│   └── tools/                    # Generated tool templates
│       ├── MedicineTracker.tsx
│       ├── CoParentSchedule.tsx
│       └── FocusTimer.tsx
├── app.json
└── package.json

/CascadeProjects/Onde/apps/freeriver-flow-backend/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── chat.ts
│   │   └── tools.ts
│   └── services/
│       ├── ClaudeProxy.ts
│       └── ToolPersistence.ts
└── package.json
```

### Complexity Estimation

| Component | Effort (Days) | Skills Required |
|-----------|---------------|-----------------|
| React Native setup | 1 | Expo, RN |
| Voice input (Whisper) | 3 | whisper.rn |
| Claude integration | 2 | API |
| TTS output | 1 | react-native-tts |
| Dynamic UI generator | 5 | RN, Claude |
| Tool library | 3 | RN |
| Co-parenting tools | 4 | Domain logic |
| ADHD tools | 3 | Domain logic |
| Backend | 2 | Node.js |
| Testing | 3 | Jest, E2E |
| **Total** | **27 days** | |

### Dependencies
- Anthropic API key
- Expo account (for EAS builds)

### Quick Wins
1. **TODAY**: Set up Expo project with basic voice UI
2. **THIS WEEK**: Voice input with whisper.rn prototype
3. **THIS WEEK**: Claude API integration for tool generation

---

## 5. Free River Studio (P1)

### Vision
Remote creation studio for VR and podcast. Collaboration tools, streaming/recording integration.

### Technical Requirements

This builds on top of VR IDE Gamified with additional:
- Podcast recording capabilities
- Remote collaboration (multiplayer VR)
- Streaming to external platforms

#### Components

1. **Podcast Studio (VR)**
   - Virtual recording booth
   - Multi-participant support
   - Audio recording to file
   - Live streaming capability

2. **Collaboration Layer**
   - Voice chat between participants
   - Shared workspace/whiteboard
   - Screen sharing from Mac

3. **Streaming Integration**
   - OBS/Streamlabs connection
   - YouTube/Twitch streaming
   - Recording export

### Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| VR | Unity + Meta XR SDK | Same as VR IDE |
| Multiplayer | Photon Unity Networking | Industry standard |
| Voice Chat | Vivox / Photon Voice | Low latency |
| Audio | Unity Audio | Recording |
| Streaming | Virtual Camera output | To OBS |

### Files/Folders to Create

```
/CascadeProjects/FreeRiverFlow/
├── VRApp/Assets/
│   ├── Scripts/
│   │   ├── Studio/
│   │   │   ├── PodcastBooth.cs
│   │   │   ├── AudioRecorder.cs
│   │   │   └── StreamingManager.cs
│   │   └── Multiplayer/
│   │       ├── PhotonManager.cs
│   │       ├── VoiceChatManager.cs
│   │       └── RoomManager.cs
│   └── Scenes/
│       └── PodcastStudio.unity
└── Docs/
    └── STUDIO-SETUP.md
```

### Complexity Estimation

| Component | Effort (Days) | Skills Required |
|-----------|---------------|-----------------|
| Podcast Booth Environment | 3 | Unity 3D |
| Audio Recording | 2 | Unity Audio |
| Photon Setup | 2 | Networking |
| Voice Chat | 3 | Photon Voice |
| Multiplayer Sync | 4 | Networking |
| Streaming Output | 2 | OBS integration |
| Testing | 3 | Multiplayer QA |
| **Total** | **19 days** | |

### Dependencies
- Photon account (free tier available)
- Requires VR IDE as foundation (P0)

### Quick Wins
- None immediate - depends on VR IDE completion

---

## 6. English Poetry Anthology (P1)

### Vision
Collection of 30-40 classic English poems for children. Authors: R.L. Stevenson, A.A. Milne, Christina Rossetti, Edward Lear, Lewis Carroll.

### Technical Requirements

This follows the existing book production workflow:
1. Research and curate poems (public domain)
2. Write brief intro for each author
3. Generate illustrations (after style defined)
4. Create ePub and PDF
5. Publish on KDP

### Workflow

```
1. Curate poems (Gianni Parola)
      |
      v
2. Write author intros
      |
      v
3. Generate illustrations (Pina Pennello + Grok)
      |
      v
4. Create ePub/PDF (existing scripts)
      |
      v
5. Review on Telegram
      |
      v
6. Publish KDP
```

### Files/Folders to Create

```
/CascadeProjects/Onde/books/english-poetry-anthology/
├── poems/
│   ├── stevenson/
│   │   ├── a-childs-garden.md
│   │   └── author-intro.md
│   ├── milne/
│   │   ├── now-we-are-six.md
│   │   └── author-intro.md
│   ├── rossetti/
│   │   ├── sing-song.md
│   │   └── author-intro.md
│   ├── lear/
│   │   ├── nonsense-poems.md
│   │   └── author-intro.md
│   └── carroll/
│       ├── jabberwocky.md
│       └── author-intro.md
├── images/                       # Generated illustrations
├── output/
│   ├── english-poetry-anthology.epub
│   └── english-poetry-anthology.pdf
└── metadata.json
```

### Complexity Estimation

| Component | Effort (Days) | Skills Required |
|-----------|---------------|-----------------|
| Research & Curation | 2 | Domain knowledge |
| Author Intros | 1 | Writing |
| Illustration Generation | 3 | Grok, Pina Pennello |
| ePub/PDF Creation | 1 | Existing scripts |
| Review & Polish | 1 | Editorial |
| KDP Upload | 0.5 | Existing workflow |
| **Total** | **8.5 days** | |

### Dependencies
- Style definition from Pina Pennello (BLOCKED until style approved)
- editore-capo agent

### Quick Wins
1. **TODAY**: Create folder structure
2. **TODAY**: Curate initial list of 30-40 poems
3. **TODAY**: Write author intros
4. **BLOCKED**: Wait for style approval, then generate illustrations

---

## 7. Hedra Video Integration (P2)

### Vision
Use Hedra for stunning video content. Application: muladhara video content, Operation Tsunami.

### Technical Requirements

Based on existing documentation in `/Onde/docs/hedra-guide.md`:

**Account Status:**
- Account: freeriverhouse@gmail.com
- Credits: 17805
- Plan: Basic Web Yearly ($144/year)

**Workflow:**
1. Generate audio (ElevenLabs)
2. Prepare image (Gianni Parola or character)
3. Upload to Hedra
4. Generate video (Character-3 model)
5. Download and post

### Automation Potential

```typescript
// packages/video-factory/HedraService.ts
import Hedra from 'hedra';

class HedraService {
  private client: Hedra;

  async generateVideo(params: {
    audioUrl: string;
    imageUrl: string;
    aspectRatio: '1:1' | '9:16' | '16:9';
  }): Promise<string> {
    const job = await this.client.characters.generate({
      audio_url: params.audioUrl,
      image_url: params.imageUrl,
      aspect_ratio: params.aspectRatio
    });

    // Poll for completion
    let status = await this.client.characters.getStatus(job.job_id);
    while (status.status !== 'completed') {
      await sleep(5000);
      status = await this.client.characters.getStatus(job.job_id);
    }

    return status.video_url;
  }
}
```

### Files/Folders to Create

```
/CascadeProjects/Onde/packages/video-factory/
├── src/
│   ├── index.ts
│   ├── HedraService.ts
│   ├── ElevenLabsService.ts
│   ├── VideoWorkflow.ts
│   └── StorageService.ts
└── package.json
```

### Complexity Estimation

| Component | Effort (Days) | Skills Required |
|-----------|---------------|-----------------|
| Hedra Service | 1 | TypeScript, API |
| ElevenLabs Integration | 1 | API |
| Workflow Automation | 2 | TypeScript |
| Storage (R2/S3) | 1 | Cloud |
| Testing | 1 | Jest |
| **Total** | **6 days** | |

### Quick Wins
1. **TODAY**: Test Hedra web interface with Gianni Parola
2. **TODAY**: Create workflow documentation
3. **THIS WEEK**: Script for batch video generation

---

## 8. AI Beats Distribution (P2)

### Vision
System to distribute AI-generated music beats. For @magmatic__ and musical projects.

### Technical Requirements

#### Distribution Platforms
- Spotify (via DistroKid/TuneCore)
- Apple Music (via DistroKid/TuneCore)
- YouTube Music
- SoundCloud
- Bandcamp

#### Workflow
```
1. Generate beat (Suno/Udio)
      |
      v
2. Master audio (LANDR or manual)
      |
      v
3. Create cover art (Grok)
      |
      v
4. Prepare metadata
      |
      v
5. Upload to distributor (DistroKid)
      |
      v
6. Track analytics
```

### Files/Folders to Create

```
/CascadeProjects/Onde/packages/music-distribution/
├── src/
│   ├── index.ts
│   ├── DistroKidService.ts       # Manual for now
│   ├── MetadataManager.ts
│   └── AnalyticsTracker.ts
├── templates/
│   └── release-checklist.md
└── package.json

/CascadeProjects/OndePRDB/clients/magmatic/music/
├── releases/
│   └── [release-name]/
│       ├── audio/
│       ├── cover/
│       └── metadata.json
└── analytics/
```

### Complexity Estimation

| Component | Effort (Days) | Skills Required |
|-----------|---------------|-----------------|
| Metadata Schema | 0.5 | TypeScript |
| Release Checklist | 0.5 | Documentation |
| DistroKid Setup | 1 | Account setup |
| Cover Art Generation | 1 | Grok workflow |
| Analytics Dashboard | 2 | Data viz |
| **Total** | **5 days** | |

### Quick Wins
1. **TODAY**: Create DistroKid account (if not exists)
2. **TODAY**: Create metadata template
3. **THIS WEEK**: First release workflow test

---

## 9. Architettura Easy (P3)

### Vision
Simplified architecture approach for all projects. Reduce complexity, increase development speed.

### Technical Requirements

#### Principles

1. **Single Responsibility** - Each component does one thing
2. **Convention over Configuration** - Standard folder structures
3. **No Over-Engineering** - Start simple, evolve as needed
4. **Documentation First** - README before code
5. **Reusable Templates** - Boilerplates for common patterns

#### Templates to Create

```
/CascadeProjects/templates/
├── react-native-app/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   └── hooks/
│   ├── app.json
│   ├── package.json
│   └── README.md
│
├── node-backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   ├── package.json
│   └── README.md
│
├── unity-quest-app/
│   ├── Assets/
│   │   ├── Scripts/
│   │   ├── Prefabs/
│   │   └── Scenes/
│   └── README.md
│
└── swiftui-app/
    ├── Views/
    ├── Models/
    ├── Services/
    └── README.md
```

### Documentation Standards

```markdown
# Project Name

## Overview
One paragraph describing what this does.

## Quick Start
```bash
npm install
npm start
```

## Architecture
Brief diagram or description.

## API Reference
If applicable.

## Development
How to contribute.
```

### Complexity Estimation

| Component | Effort (Days) | Skills Required |
|-----------|---------------|-----------------|
| RN Template | 1 | React Native |
| Node Backend Template | 1 | Node.js |
| Unity Template | 1 | Unity |
| SwiftUI Template | 1 | Swift |
| Documentation Guide | 0.5 | Markdown |
| **Total** | **4.5 days** | |

### Quick Wins
1. **TODAY**: Create templates folder
2. **TODAY**: Document existing patterns from Onde/apps
3. **THIS WEEK**: Extract RN template from existing apps

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
Focus: Infrastructure for all other projects

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Zero Approvals - Skill framework | Skill schema, 5 basic skills |
| 3-4 | SwiftUI Control - Basic app | Dashboard view, mock data |
| 5-6 | Mac Backend - Endpoints | API for iOS to connect |
| 7-8 | VR IDE - Unity project setup | Basic office scene |
| 9-10 | Integration testing | All parts communicate |

### Phase 2: Core Features (Week 3-4)
Focus: Make each project functional

| Day | Task | Deliverable |
|-----|------|-------------|
| 11-12 | SwiftUI - Voice control | Working voice approval |
| 13-14 | SwiftUI - Watch app | Basic watch companion |
| 15-16 | VR IDE - Voice input | Meta SDK working |
| 17-18 | VR IDE - Claude connection | Voice to Claude to response |
| 19-20 | Zero Approvals - Learning | Auto-generate skills from history |

### Phase 3: Polish & Content (Week 5-6)
Focus: Refinement and content creation

| Day | Task | Deliverable |
|-----|------|-------------|
| 21-22 | English Poetry - Curation | 40 poems selected |
| 23-24 | Hedra - Automation | Batch video script |
| 25-26 | AI Beats - First release | Test distribution |
| 27-28 | Architecture - Templates | 4 templates ready |
| 29-30 | Testing & documentation | All projects documented |

---

## Summary of Quick Wins (Can Start Today)

### Immediate Actions (No Dependencies)

1. **English Poetry Anthology**
   - Create folder structure
   - Curate 40 poems
   - Write author intros

2. **Zero Approvals System**
   - Define Skill TypeScript schema
   - Create 5 basic skill definitions
   - Set up audit logger

3. **SwiftUI Claude Control**
   - Create Xcode project
   - Basic dashboard view

4. **Hedra Video**
   - Test web interface
   - Document workflow

5. **AI Beats Distribution**
   - Create DistroKid account
   - Metadata template

6. **Architettura Easy**
   - Create templates folder
   - Extract patterns from existing code

### This Week Goals

- [ ] VR IDE: Basic Unity project with office scene
- [ ] SwiftUI: Dashboard showing live task status
- [ ] Skills: Working skill matcher
- [ ] Poetry: 40 poems curated with intros
- [ ] Hedra: First automated video generation

---

## Resource Requirements

### Accounts Needed
- [x] Apple Developer (have)
- [x] Meta Developer (have)
- [x] Anthropic API (have)
- [x] Hedra (have)
- [x] ElevenLabs (have)
- [ ] DistroKid (need to verify)
- [x] Wit.ai (part of Meta)
- [ ] Photon (need for multiplayer)

### Hardware
- [x] Mac (development)
- [x] Quest 2 (VR testing)
- [x] iPhone (iOS testing)
- [x] Apple Watch (Watch testing)

### Estimated Total Effort

| Project | Days | Priority |
|---------|------|----------|
| VR IDE Gamified | 29 | P0 |
| SwiftUI Claude Control | 23 | P0 |
| Zero Approvals System | 18 | P0 |
| Free River Flow App | 27 | P1 |
| Free River Studio | 19 | P1 |
| English Poetry Anthology | 8.5 | P1 |
| Hedra Video Integration | 6 | P2 |
| AI Beats Distribution | 5 | P2 |
| Architettura Easy | 4.5 | P3 |
| **Grand Total** | **140 days** | |

With parallel development and focus on P0 items:
- **P0 items**: ~70 days (can be parallelized to 35 days with 2 tracks)
- **P1 items**: ~54.5 days
- **P2-P3 items**: ~15.5 days

**Realistic Timeline**: 2-3 months for P0+P1, additional month for P2+P3.

---

*Document generated by Engineering Department Manager - 2026-01-19*
*Next review: Weekly during sprint planning*
