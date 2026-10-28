# IELTS Academic Mock Test 10 Implementation Plan

Integrate authentic IELTS Academic Mock Test 10 based on the official test booklet and answer key, featuring authentic computer-delivered IELTS (CD-IELTS) visual styling, an interactive Australian Visa application process flow-chart with inline inputs and connected steps, authentic Dear Diary performance schedule and John & Amanda Houghton Bank Cheque, Department Profit Bar Chart, New Floor Plan diagram, and full automated scoring and review mode.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> All primary architectural and design choices were confirmed during Phase 1 clarification:
> - **Australian Visa Flow-Chart (Reading Q27-36)**: Confirmed as interactive step cards with connected directional arrows, right-hand "REMEMBER !" callout badges, and inline blank input fields matching the official test page.
> - **Listening Section 1 (Q1-10)**: Confirmed as authentic styled "Dear Diary" performance schedule card (Q1-8) and authentic "John and Amanda Houghton" Bank Cheque card (Q9-10) with inline inputs.
> - **Listening Audio Handling**: Standard audio player component with persistent timestamp tracking, reload resumption, and an accessible URL placeholder ready for the user's audio link.

- **Confirmed Decision 1**: Interactive flowchart cards with connected SVG/CSS arrows and responsive inline inputs for Q27-36.
- **Confirmed Decision 2**: Authentic diary and bank cheque visual cards with inline fill-ins for Q1-10.
- **Confirmed Decision 3**: Retain standard IELTS audio controls with resume-on-reload and time continuity.
- **Remaining Choice / Default**: Academic Test 10 will be registered as active and selectable alongside Tests 1–8 in the test switcher, test catalog, and admin views.

---

## 1. Overview & Core Concept

- **What It Does**: Provides test takers with a complete, authentic IELTS Academic practice test experience for Test 10 across all 4 modules (Listening, Reading, Writing, Speaking). The test replicates real Computer-Delivered IELTS (CD-IELTS) testing standards: split-screen passage reading, inline question completion, authentic graphical representations (flow charts, cheques, bar charts, floor plans), persistent session tracking, independent timer management, voluntary logout guardrails, and automated scoring with official answer keys.
- **Target Audience / Persona**: IELTS Academic candidates preparing for the computer-delivered test who require high-fidelity practice with authentic Cambridge-style exam layouts rather than plain text approximations.
- **Key Value**: Delivers professional, interactive exam diagrams (such as process flow-charts with inline typing and real bank cheque forms) where questions are embedded directly into the visual assets just like the real paper/computer exam, eliminating cognitive disconnect and formatting issues.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Test Selection & Module Launch**:
   - The user selects "Practice Test 10" from the test catalog.
   - The exam starts with the Listening module (or user selects Reading / Writing / Speaking).
   - Audio begins and continues smoothly; if the page is reloaded, audio playback and state resume from the exact previous timestamp.

2. **Listening Module (Sections 1–4)**:
   - **Section 1 (Q1–10)**:
     - **Q1–8**: Styled "Dear Diary" card (NOV 14) with venue, show name, seating rows, times, ticket prices, and cancellation terms with inline inputs `[1]` through `[8]`.
     - **Q9–10**: Authentic "John and Amanda Houghton" Bank Cheque #1001 with inline blanks for `PAY TO THE ORDER OF: [9]`, `£ 90.00 GBP`, and `MEMO Booking Ref: [10]`.
   - **Section 2 (Q11–20)**:
     - **Q11–13**: "New Profit by Department for y/e 31st December" Bar Chart with departments (Online Sales, Retail Sales, Design) matching bars A–E.
     - **Q14–20**: "New Floor Plan" diagram with rooms A–J for Customer Service, Human Resources, Legal, Manager, Finance, Marketing, and Research.
   - **Section 3 (Q21–30)**:
     - **Q21–26**: Matching Attitudes A–H to Kelheim research project team members.
     - **Q27–30**: Multiple-choice single-answer questions on mutant gene project research.
   - **Section 4 (Q31–40)**:
     - Note completion on "CONDUCTING AN ARCHAEOLOGICAL DIG" with authentic bulleted steps and inline blank inputs.

3. **Reading Module (Passages 1–3)**:
   - **Passage 1 (Q1–13)**: "The Eisriesenwelt Ice Caves" (Paragraphs A–G)
     - Q1–3: Short-answer questions (pure water, lifting, cave systems).
     - Q4–9: Paragraph information matching (A–G).
     - Q10–13: Diagram-based multiple-choice cave formation questions with high-contrast diagrams.
   - **Passage 2 (Q14–26)**: "What's the best smartphone on the market?" (HTC 4G, Nexus, iPhone, Motorola Atrix)
     - Q14–20: Phone matching (A–D).
     - Q21–23: Sentence ending matching (A–E).
     - Q24–26: YES / NO / NOT GIVEN questions.
   - **Passage 3 (Q27–40)**: "The Australian Visa Application Process Explained"
     - **Q27–36 Interactive Flow-Chart**: A vertically connected process map with 5 structured step containers, connecting directional arrows, inline completion inputs (Q27 to Q36), and right-side "REMEMBER !" callout badges.
     - **Q37–38**: Single-answer multiple-choice questions.
     - **Q39–40**: Multi-response questions (choose TWO letters from A–E).

4. **Writing & Speaking Modules**:
   - Writing Task 1: Academic line/process report prompt.
   - Writing Task 2: Discursive essay prompt.
   - Speaking: Parts 1, 2 (cue card with 1-minute prep timer), and 3 discussion topics.

5. **Voluntary Logout & Security Flow**:
   - A dedicated "Log Out" action in the exam header prompts students with a strict warning modal: *"Logging out during an active exam will permanently terminate your test attempt. You will not be able to resume from where you left off."*
   - Confirmed voluntary logout resets session access and marks the attempt as terminated.

---

### Visual Identity & Theme

- **Design Standard**: Authentic Cambridge / British Council Computer-Delivered IELTS (CD-IELTS) look and feel:
  - Header: `#e5e7eb` bar with clean timer countdown, module indicator, contrast toggle, and voluntary logout button.
  - Accent Color: IELTS Deep Blue (`#00529b`) for question numbers, active question tabs, and primary controls.
  - Backgrounds: `#ffffff` for question cards and passage containers with `#f8fafc` soft neutral workspace backing.
  - Flow-Chart Styling: Thick border card steps with clean `#0f172a` directional arrows, clear numbered input fields, and high-visibility circular black-and-white `REMEMBER !` badges.
  - Cheque Styling: Authentic bank draft styling with light parchment background, dotted payee baseline, security border frame, signature line, and GBP currency box.
  - Typography: Clean sans-serif (`Inter`, system-ui, or `Arial`) for maximum legibility matching official test software.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Component Flow-Chart vs. Static Image**:
  - *Chosen Approach*: Render the Australian Visa process flow-chart as an interactive structured HTML/SVG component hierarchy with native input fields placed directly inside the flow boxes, rather than showing a separate static picture above separate inputs.
  - *Why*: Eliminates scrolling disconnect; users read and answer directly within the diagram flow, fulfilling the user's explicit requirement ("chart step by step inside questions image with inside questions").
  - *Alternatives Considered*: A static screenshot with question numbers below it was rejected as it forces cumbersome vertical scanning and violates the authentic CD-IELTS design requirement.

- **Decision 2: Section 1 Cheque & Diary Custom Blocks**:
  - *Chosen Approach*: Create dedicated styled layouts for the NOV 14 Dear Diary and John & Amanda Houghton Bank Cheque #1001 with embedded inline text inputs (`renderInlineCompletion` or structured form grid).
  - *Why*: Provides high fidelity to the test paper and prevents misaligned question numbers.

- **Decision 3: Test 10 Registration in Global Test Suite**:
  - *Chosen Approach*: Define `mockTest10` as a complete, fully populated `IELTSTest` object and add it to `BASE_ACADEMIC_TESTS` in `src/data/mockTests.ts` and test selector lists.
  - *Why*: Allows seamless navigation between all available tests without breaking existing practice tests.

- **Decision 4: Official Answer Key & Review Mode Integration**:
  - *Chosen Approach*: Encode the exact answers from the user's uploaded answer key sheet (including alternatives like `online / over the internet`, `refuse/rubbish`, `(washing) detergents`) with comprehensive explanations so review mode accurately grades each student submission.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CD-IELTS UI Host                              │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │   Navigation & Header │  │ Controls: Zoom, Lightbox, Pinned Media │ │
│  │   Timer & Logout Modal│  │ Audio Player (Continuity & Reload)     │ │
│  └──────────┬────────────┘  └───────────────────┬────────────────────┘ │
│             │                                   │                      │
│  ┌──────────▼───────────────────────────────────▼────────────────────┐ │
│  │              Exam Workspace / Question Split Pane                 │ │
│  │  ┌─────────────────────────┐  ┌─────────────────────────────────┐ │ │
│  │  │ Reading Passage Pane    │  │ Question Pane / Custom Blocks   │ │ │
│  │  │ (Passages 1, 2, 3)      │  │ - FlowChartBlock (Q27-36)       │ │ │
│  │  │ Split Resizer & Pinning │  │ - ChequeBlock & Diary (Q1-10)   │ │ │
│  │  │ Multi-highlight system  │  │ - BarChart & FloorPlan (Q11-20) │ │ │
│  │  └─────────────────────────┘  │ - Table & MCQs (Q21-40)         │ │ │
│  │                               └─────────────────────────────────┘ │ │
│  └───────────────────────────────────┬───────────────────────────────┘ │
│                                      │                                 │
│  ┌───────────────────────────────────▼───────────────────────────────┐ │
│  │           State Store (User Answers, Flags, Audio Timestamp)      │ │
│  │      Local Persistence (Protected from Voluntary Logout)          │ │
│  └───────────────────────────────────┬───────────────────────────────┘ │
│                                      │                                 │
│  ┌───────────────────────────────────▼───────────────────────────────┐ │
│  │        Test 10 Data Bundle (`src/data/mockTest10/`)               │ │
│  │  - listeningData.ts (Sections 1-4, Questions 1-40, Transcripts)   │ │
│  │  - readingPassages.ts (Passages 1, 2, 3 text & paragraphs)        │ │
│  │  - readingQuestions.ts (Passages 1-3, Questions 1-40)            │ │
│  │  - writingSpeaking.ts (Tasks 1 & 2; Speaking Parts 1-3)           │ │
│  │  - index.ts (ACADEMIC_TEST_10 export & validation)                │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Question Group Mapping

- **Listening Section 1 (Q1–10)**:
  - `Q1–8`: `note-completion` / inline completion inside Dear Diary container.
  - `Q9–10`: `form-completion` / inline completion inside Bank Cheque card.
- **Listening Section 2 (Q11–20)**:
  - `Q11–13`: `diagram-labeling` matching departments to bar chart letters A–E.
  - `Q14–20`: `map-labeling` matching office spaces to floor plan letters A–J.
- **Listening Section 3 (Q21–30)**:
  - `Q21–26`: `matching` attitudes A–H to researchers.
  - `Q27–30`: `multiple-choice-single-answer` for project research questions.
- **Listening Section 4 (Q31–40)**:
  - `Q31–40`: `note-completion` on Archaeological Dig procedure.
- **Reading Passage 1 (Q1–13)**:
  - `Q1–3`: `short-answer` (limestone cave formation).
  - `Q4–9`: `paragraph-matching` (sections A–G).
  - `Q10–13`: `multiple-choice-single-answer` with diagram references.
- **Reading Passage 2 (Q14–26)**:
  - `Q14–20`: `matching-features` (phones A–D).
  - `Q21–23`: `matching-sentence-endings` (endings A–E).
  - `Q24–26`: `yes-no-not-given`.
- **Reading Passage 3 (Q27–40)**:
  - `Q27–36`: `flow-chart-completion` with 5 connected step boxes and inline blanks.
  - `Q37–38`: `multiple-choice-single-answer`.
  - `Q39–40`: `multiple-response` (choose TWO letters from A–E).

### State Transitions & Persistence

- **Audio Playback**: Maintained in `sessionStorage` / audio store with time syncing every second so that any browser refresh immediately restores the playback offset.
- **Logout Guard**: Clicking "Log Out" triggers a modal requiring explicit confirmation. If confirmed, the session storage attempt key is invalidated and the student is returned to the login view with no resume capability for that attempt.
- **Highlighting**: Context-isolated highlighting per passage and question ID ensures selecting words in one question does not bleed into other questions.
