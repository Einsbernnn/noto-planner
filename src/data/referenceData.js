export const HOSTING_OPTIONS = [
  {
    name: "Railway", type: "Backend", freeTier: "$5 credit/mo", coldStart: "~5\u201310s",
    sleepPolicy: "Sleeps after inactivity",
    myTake: "Best DX for Spring Boot. Credits run out fast on busy apps.",
    pros: ["Best Spring Boot support", "Managed PostgreSQL add-on", "Easy Docker deploy", "Good logs UI"],
    cons: ["$5/mo credit limit \u2014 can run out", "Sleeps on free tier", "No persistent disk on free"],
    verdict: "good", mitigation: "UptimeRobot ping every 5min keeps it awake. Monitor credit usage.", recommended: false,
  },
  {
    name: "Render", type: "Backend", freeTier: "Free (750hr/mo)", coldStart: "~30\u201360s",
    sleepPolicy: "Sleeps after 15min inactivity",
    myTake: "Free but brutal cold starts. Not great UX without mitigation.",
    pros: ["Truly free (no credit limit)", "Easy Docker/JAR deploy", "Free PostgreSQL (90 days)"],
    cons: ["30\u201360s cold start on free tier", "PostgreSQL free only 90 days", "Slow builds"],
    verdict: "caution", mitigation: "UptimeRobot ping is mandatory. Show a 'Waking up server...' splash screen. Budget for Render Starter ($7/mo) after 90 days DB expires.", recommended: false,
  },
  {
    name: "Fly.io", type: "Backend", freeTier: "Free (3 shared VMs)", coldStart: "~2\u20133s",
    sleepPolicy: "Can stay always-on with free allowance",
    myTake: "Best free option for Spring Boot. Fast cold starts, stays alive.",
    pros: ["Fastest cold starts of all free tiers", "3 shared VMs free \u2014 can stay always-on", "Good CLI tooling", "Supports Dockerfile"],
    cons: ["Requires credit card to verify", "CLI-heavy (less GUI than Railway)", "Learning curve vs Railway"],
    verdict: "best", mitigation: "Deploy with 1 shared-cpu-1x, 256MB RAM. Spring Boot native image or GraalVM reduces memory. No UptimeRobot needed if always-on.", recommended: true,
  },
  {
    name: "Koyeb", type: "Backend", freeTier: "Free (1 nano instance)", coldStart: "~3\u20135s",
    sleepPolicy: "Sleeps after inactivity",
    myTake: "Underrated free option. Good EU/US edge deployment.",
    pros: ["Free tier with no credit card required", "Global edge deployment", "Supports Docker + GitHub integration"],
    cons: ["1 nano instance only on free", "Sleeps after inactivity", "Less community resources"],
    verdict: "good", mitigation: "UptimeRobot ping. Good backup option if Fly.io credit card requirement is a blocker.", recommended: false,
  },
  {
    name: "Neon.tech", type: "Database", freeTier: "Free (0.5GB, 1 project)", coldStart: "~1s (serverless wake)",
    sleepPolicy: "DB branches sleep, auto-wake on query",
    myTake: "Best free PostgreSQL. Serverless \u2014 wakes fast on first query.",
    pros: ["0.5GB storage free (plenty for MVP)", "Serverless \u2014 no manual management", "Branching for dev/prod", "Direct PostgreSQL connection"],
    cons: ["Serverless cold wake adds ~1s on first query", "0.5GB limit (generous for MVP)", "Not ideal for long-running connections"],
    verdict: "best", mitigation: "Use connection pooling (PgBouncer built-in on Neon). Spring Boot uses pooled connections \u2014 cold wake is one-time per pool lifecycle.", recommended: true,
  },
  {
    name: "Supabase", type: "Database", freeTier: "Free (500MB, pauses after 1 week inactivity)", coldStart: "~5s (on project wake)",
    sleepPolicy: "Entire project pauses after 1 week inactivity",
    myTake: "Great feature set but pausing is a real problem for MVP.",
    pros: ["500MB free", "Built-in auth (can skip Spring Security later)", "Realtime features for post-MVP"],
    cons: ["Project pauses after 1 week inactivity \u2014 bad UX", "Full project cold start ~5s", "Overkill for pure PostgreSQL needs"],
    verdict: "caution", mitigation: "Add weekly cron job to ping Supabase and prevent pause. Or upgrade to Pro ($25/mo) to disable pausing.", recommended: false,
  },
];

export const RESOLVED_RISKS = [
  {
    risk: "Offline Sync Conflicts",
    was: "Silent last-write-wins \u2014 one device's changes overwrite another's with no warning.",
    resolution: "Explicit conflict detection via client_updated_at comparison in sync endpoint. Server returns 409 with both versions. User sees a side-by-side diff toast and chooses 'Keep Mine' or 'Use Server' per conflicted note.",
    tasks: ["W2-2", "W5-1", "W6-1"], status: "Resolved",
  },
  {
    risk: "JWT Token Security",
    was: "Access token in localStorage/Pinia exposed to XSS. Refresh token theft allows permanent account takeover.",
    resolution: "Access token in Pinia memory only (cleared on tab close). Refresh token in httpOnly, Secure, SameSite=Strict cookie \u2014 unreachable by JS. Token rotation: each refresh invalidates the old token. Logout clears cookie server-side.",
    tasks: ["W1-3", "W3-1"], status: "Resolved",
  },
  {
    risk: "z-index Drift",
    was: "Repeatedly clicking notes inflates z-index toward infinity. No cap enforcement. State drifts between client and server.",
    resolution: "Server owns renormalization. Client triggers POST /api/notes/renormalize-zindex when local max >= 900. Server reassigns dense ranks (1\u2026N) and returns authoritative values. Client updates Pinia from response only.",
    tasks: ["W2-3", "W4-4"], status: "Resolved",
  },
  {
    risk: "Free-Tier Cold Starts",
    was: "Railway/Render spin down after inactivity. 10\u201360s first-request delay kills UX.",
    resolution: "Two-layer mitigation: (1) UptimeRobot free tier pings /actuator/health every 5min to prevent sleep. (2) Frontend shows animated loading skeleton on first board fetch \u2014 masks any residual latency. Fly.io recommended as it can stay always-on within free allowance.",
    tasks: ["W6-2"], status: "Resolved",
  },
];

export const ADRS = [
  { id: "ADR-001", title: "Quasar Framework", status: "Accepted", context: "Need a Vue 3 UI framework with PWA support and desktop-quality components.", decision: "Quasar provides built-in PWA mode, QMenu for right-click context, QTooltip, and future Electron option for native desktop wrapper.", consequences: "Slightly larger bundle. Mitigated by tree-shaking unused Quasar components in quasar.config.js." },
  { id: "ADR-002", title: "Spring Boot Backend", status: "Accepted", context: "Need robust backend with JWT auth, JPA, and free-tier hosting compatibility.", decision: "Spring Boot + Spring Security for JWT. JPA/Hibernate reduces boilerplate. Works with Docker on Fly.io/Railway/Render.", consequences: "JVM memory pressure on 256MB free instances. Mitigated by Spring Boot native image (GraalVM) compilation option in post-MVP." },
  { id: "ADR-003", title: "REST API over GraphQL", status: "Accepted", context: "MVP has simple CRUD. No nested queries needed.", decision: "REST maps cleanly to offline sync queue (HTTP verbs). Easier to test with MockMvc. GraphQL revisited for real-time collaboration in Phase 4.", consequences: "Over-fetching on GET /api/notes. Acceptable at MVP scale (<500 notes per user)." },
  { id: "ADR-004", title: "Neon.tech for PostgreSQL", status: "Accepted", context: "Need free PostgreSQL that doesn't pause or expire.", decision: "Neon.tech: 0.5GB free, no pause policy, serverless wake ~1s, built-in PgBouncer pooling. Supabase pauses after 1 week inactivity \u2014 unacceptable for MVP.", consequences: "Serverless wake adds ~1s on pool cold start. Spring Boot connection pool (HikariCP) amortizes this \u2014 only first connection pays the cost." },
  { id: "ADR-005", title: "httpOnly Cookie for Refresh Token", status: "Accepted", context: "Refresh token in localStorage/Pinia is vulnerable to XSS theft.", decision: "Refresh token stored in httpOnly, Secure, SameSite=Strict cookie. Access token in Pinia memory only. Silent refresh on page load restores session. Logout clears cookie server-side.", consequences: "SameSite=Strict breaks OAuth flows if added later. Use SameSite=Lax for OAuth compatibility in post-MVP. Requires CORS credentials: true on Axios + allowCredentials on Spring CORS config." },
  { id: "ADR-006", title: "Conflict Detection over Silent LWW", status: "Accepted", context: "Last-write-wins silently discards offline edits when two versions diverge.", decision: "Sync endpoint compares client_updated_at vs server updated_at. Returns 409 with both versions for user resolution. Accepted notes use LWW. Only true conflicts surface to user.", consequences: "Adds UI complexity (ConflictResolutionToast). Acceptable \u2014 better than silent data loss. Post-MVP: Yjs CRDTs eliminate conflicts entirely." },
  { id: "ADR-007", title: "Mouse Events over Pointer Events API", status: "Accepted", context: "Desktop-first MVP. No mobile support needed in MVP.", decision: "mousedown/mousemove/mouseup for drag and resize. Simpler code, no touch conflict handling. Touch support deferred to Phase 2 (Pointer Events migration).", consequences: "Not draggable on mobile/tablet. Acceptable for desktop-first MVP." },
  { id: "ADR-008", title: "Dexie.js for IndexedDB", status: "Accepted", context: "PWA needs offline support. Raw IndexedDB API is verbose.", decision: "Dexie.js: clean Promise API, 22KB gzipped, table schemas, no CouchDB lock-in vs PouchDB.", consequences: "LWW conflict resolution sufficient for single-user. Post-MVP: Yjs CRDTs for multi-user." },
];
