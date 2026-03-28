import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load env from .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) env[key.trim()] = rest.join("=").trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// ─── SEED DATA ───────────────────────────────────────────

let _tn = 0;
const tn = () => String(++_tn).padStart(3, "0");

const SPRINTS_DATA = [
  { sort_order: 1, label: "Sprint 1", theme: "Foundation & Setup", color: "#E8F5E9", accent: "#2E7D32", tasks: [
    { legacy_id: "W1-1", ticketNo: tn(), title: "Project Scaffolding", hours: 4, deps: [], tag: "DevOps", description: "Bootstrap the monorepo with Quasar + Vue 3 (TypeScript) frontend and Spring Boot backend. Configure linting, formatting, and Git workflow.", artifact: "Mono-repo structure, README", subtasks: [
      ["Init Quasar + Vue 3 project with TypeScript", "Run `npm init quasar` and select Vue 3 + TypeScript + Vite. Choose Pinia for state management and Vue Router during scaffold."],
      ["Init Spring Boot project (Spring Initializr)", "Generate at start.spring.io with Spring Web, Spring Security, Spring Data JPA, PostgreSQL Driver, and Flyway Migration dependencies."],
      ["Configure ESLint, Prettier, Husky pre-commit hooks", "Add ESLint with Vue plugin, Prettier for formatting, and Husky + lint-staged for pre-commit linting. Ensures consistent code style."],
      ["Set up GitHub repo + branch strategy (main / dev / feature/*)", "Create GitHub repo with branch protection on main. Use main for production, dev for integration, and feature/* branches for tasks."],
    ]},
    { legacy_id: "W1-2", ticketNo: tn(), title: "Database Schema & Migrations", hours: 4, deps: ["W1-1"], tag: "Backend", description: "Design and implement the PostgreSQL schema with Flyway migrations. Include z_index column and performance indexes for the notes table.", artifact: "PostgreSQL schema + Flyway migrations with z-index support", resolved: "z-index Drift — z_index column + batch renorm query designed from day 1", subtasks: [
      ["notes table: id, user_id, content, pos_x, pos_y, width, height, color, z_index (INT DEFAULT 0), deleted_at, created_at, updated_at", "Core table storing all note data. UUID for id, INT for positions/dimensions, VARCHAR for color hex. deleted_at enables soft delete pattern."],
      ["Add partial index: CREATE INDEX idx_notes_active ON notes(user_id, updated_at) WHERE deleted_at IS NULL", "Partial index excludes soft-deleted rows, reducing index size and improving query performance for active notes listing."],
      ["Add index on z_index for batch renormalization queries", "Supports the renormalization endpoint which ORDER BY z_index across all user notes. Without this index, renorm requires a full table scan."],
      ["Configure Flyway migration scripts (V1__init.sql)", "Flyway runs versioned SQL on startup. V1__init.sql creates tables. Future migrations (V2, V3...) alter schema without data loss."],
      ["Set up local PostgreSQL via Docker Compose", "docker-compose.yml with postgres:16-alpine. Maps port 5432, sets POSTGRES_DB/USER/PASSWORD. Run `docker compose up -d` to start."],
    ]},
    { legacy_id: "W1-3", ticketNo: tn(), title: "Auth Infrastructure (httpOnly Cookie Strategy)", hours: 6, deps: ["W1-1"], tag: "Backend", description: "Implement JWT authentication using httpOnly cookie strategy for refresh tokens. Access tokens stored in memory only to prevent XSS theft.", artifact: "JWT auth with httpOnly refresh cookie + in-memory access token", resolved: "JWT Token Security — httpOnly cookie eliminates XSS token theft. Rotation invalidates stolen refresh tokens.", subtasks: [
      ["Configure Spring Security filter chain", "Define SecurityFilterChain bean with stateless session management. Permit /auth/** endpoints, require auth for /api/**. Add JWT filter before UsernamePasswordAuthenticationFilter."],
      ["JWT utility: generate short-lived access token (15min) + refresh token (7 days)", "Use jjwt library. Access token has userId + roles, expires 15min. Refresh token is opaque, stored hashed server-side with 7-day expiry."],
      ["POST /auth/login → return access token in JSON body + refresh token in httpOnly, Secure, SameSite=Strict cookie", "Validates credentials against BCrypt hash. Returns access token in JSON body. Sets refresh token as httpOnly, Secure, SameSite=Strict cookie with 7-day maxAge."],
      ["POST /auth/refresh → validate refresh token cookie → issue new access token (token rotation)", "Reads refresh token from httpOnly cookie, validates hash against DB. Issues new access + rotates refresh token (old invalidated). Prevents reuse attacks."],
      ["POST /auth/logout → clear httpOnly cookie server-side", "Deletes refresh token hash from DB. Sets cookie maxAge=0 to clear from browser. Access token remains valid until expiry (15min max window)."],
      ["JwtAuthenticationFilter reads Bearer token from Authorization header only", "Custom OncePerRequestFilter extracts JWT from 'Authorization: Bearer <token>' header only. Never reads from cookies or query params to prevent CSRF."],
      ["Refresh token stored hashed in DB (not plaintext) — invalidate on use", "SHA-256 hash stored in refresh_tokens table with user_id and expires_at. On each refresh, old hash deleted and new inserted. Stolen tokens are single-use."],
    ]},
    { legacy_id: "W1-4", ticketNo: tn(), title: "CI/CD Pipeline", hours: 3, deps: ["W1-1"], tag: "DevOps", description: "Configure CI/CD pipelines with GitHub Actions for automated frontend deployment to Vercel and backend build/test with Maven.", artifact: "GitHub Actions workflows", subtasks: [
      ["Frontend deploy pipeline to Vercel (push to main)", "Vercel auto-deploys on push to main via GitHub integration. No custom Action needed — Vercel handles build and CDN distribution."],
      ["Backend build & test pipeline (Maven + JUnit)", "GitHub Actions workflow: checkout → setup Java 17 → mvn verify. Runs on push to main and PRs. Fails PR check if any test fails."],
      ["Environment variables management (.env.example)", "Create .env.example with all required vars (DB_URL, JWT_SECRET, etc.) without real values. Add .env to .gitignore. Document in README."],
      ["Preview deploy on PR via Vercel preview URLs", "Vercel creates unique preview URLs for each PR. Team tests frontend changes before merging. Comments preview URL on the PR automatically."],
    ]},
  ]},
  { sort_order: 2, label: "Sprint 2", theme: "Core Backend API", color: "#E3F2FD", accent: "#1565C0", tasks: [
    { legacy_id: "W2-1", ticketNo: tn(), title: "Notes CRUD API", hours: 6, deps: ["W1-2", "W1-3"], tag: "Backend", description: "Build the complete Notes CRUD REST API with ownership checks, soft delete support, and server-authoritative timestamps.", artifact: "REST API: /api/notes (GET, POST, PUT, DELETE)", subtasks: [
      ["NoteController: GET /api/notes, POST /api/notes", "GET returns all active notes for authenticated user (WHERE deleted_at IS NULL). POST creates new note with server-generated id, timestamps, and default position."],
      ["NoteController: PUT /api/notes/{id}, DELETE /api/notes/{id}", "PUT updates note fields (content, position, color, z_index). DELETE sets deleted_at timestamp (soft delete). Both verify ownership via userId from JWT."],
      ["NoteService with business logic + ownership checks", "Service layer validates authenticated user owns the note before mutation. Throws 403 Forbidden if userId doesn't match note.userId."],
      ["NoteRepository (JPA / Hibernate)", "Spring Data JPA interface extending JpaRepository<Note, UUID>. Custom query methods: findByUserIdAndDeletedAtIsNull, findByIdAndUserId."],
      ["Soft delete via deleted_at timestamp field", "Instead of DELETE FROM notes, set deleted_at = NOW(). All queries filter WHERE deleted_at IS NULL. Enables undo and audit trail."],
      ["All responses include server-authoritative updated_at timestamp", "Every response includes server's updated_at value. Client sends this back on next PATCH for conflict detection. Server is single source of truth."],
    ]},
    { legacy_id: "W2-2", ticketNo: tn(), title: "Conflict-Aware Sync Endpoint", hours: 5, deps: ["W2-1"], tag: "Backend", description: "Implement the conflict-aware sync endpoint that detects client/server version divergence and returns 409 with both versions for user resolution.", artifact: "POST /api/notes/sync — conflict detection + 409 response", resolved: "Offline Sync Conflicts — explicit 409 conflict detection replaces silent LWW. User decides per conflict.", subtasks: [
      ["Accept array of note patches: { id, content, pos_x, pos_y, width, height, color, z_index, client_updated_at }", "Single POST endpoint accepts batch of offline changes. Each patch includes client's last-known updated_at so server can detect if another device modified the note."],
      ["For each patch: compare client_updated_at vs DB updated_at", "Server loads current note from DB and compares timestamps. Core conflict detection — if timestamps diverge, someone else modified the note."],
      ["If client_updated_at >= DB updated_at → accept patch (LWW, client wins)", "Client has latest version or newer — safe to apply. Uses last-write-wins only when no actual conflict. Updates DB and returns accepted status."],
      ["If client_updated_at < DB updated_at → reject with 409 + return server version", "Another device modified this note while client was offline. Returns HTTP 409 with both client's and server's version for user resolution."],
      ["Response: { accepted: [...], conflicts: [{ clientNote, serverNote }] }", "Batch response groups: accepted notes (applied) and conflicts (need user decision). Client processes each group differently."],
      ["Frontend shows conflict toast: 'Keep yours / Use server version' per note", "Per-conflict resolution UI. User sees side-by-side diff and explicitly chooses which version to keep. No silent data loss."],
    ]},
    { legacy_id: "W2-3", ticketNo: tn(), title: "z-index Renormalization Endpoint", hours: 3, deps: ["W2-1"], tag: "Backend", description: "Create the z-index renormalization endpoint that reassigns dense ranks when client detects max z_index approaching the cap.", artifact: "POST /api/notes/renormalize-zindex", resolved: "z-index Drift — server owns renormalization, client just triggers it. No drift possible.", subtasks: [
      ["Triggered when client detects max z_index >= 900", "Client monitors highest z_index in store. At 900, calls this endpoint proactively — well before integer overflow becomes a risk."],
      ["Server queries all active notes for user ordered by z_index ASC", "SELECT * FROM notes WHERE user_id = ? AND deleted_at IS NULL ORDER BY z_index ASC. Gets all notes in current stacking order."],
      ["Reassigns z_index as 1, 2, 3 ... N (dense rank)", "Iterates sorted notes and assigns consecutive integers starting at 1. Preserves relative ordering while eliminating gaps."],
      ["Returns updated note list with new z_index values", "Response includes every note with its new z_index. Client replaces entire z_index state from response — no local computation needed."],
      ["Client updates Pinia store from response — no local guessing", "Client overwrites all local z_index values with server response. Ensures client and server are perfectly in sync after renormalization."],
    ]},
    { legacy_id: "W2-4", ticketNo: tn(), title: "Backend Unit Tests", hours: 4, deps: ["W2-1", "W2-2"], tag: "QA", description: "Write comprehensive JUnit 5 test suite covering services, conflict detection, z-index renormalization, and auth filter edge cases.", artifact: "JUnit 5 test suite ≥80% coverage", subtasks: [
      ["NoteService unit tests (Mockito mocks)", "Mock NoteRepository with Mockito. Test CRUD logic, ownership validation (403 for wrong user), soft delete behavior, and timestamp handling."],
      ["Sync endpoint conflict detection tests (client ahead / client behind / equal)", "Three scenarios: client_updated_at > server (accept), < server (409 conflict), == server (accept). Verify correct response for each case."],
      ["z-index renormalization correctness tests", "Test with gaps (1, 5, 100 → 1, 2, 3), duplicates (1, 1, 2 → 1, 2, 3), and single note edge case. Verify dense rank preserves order."],
      ["Auth filter tests (valid / invalid / expired / missing refresh cookie)", "Test JWT validation: valid token passes, tampered returns 401, expired returns 401, missing cookie on refresh returns 401."],
      ["Controller integration tests (MockMvc)", "Full request/response testing with MockMvc. Verify HTTP status codes, JSON structure, and content-type headers for all endpoints."],
    ]},
  ]},
  { sort_order: 3, label: "Sprint 3", theme: "Frontend Core", color: "#FFF3E0", accent: "#E65100", tasks: [
    { legacy_id: "W3-1", ticketNo: tn(), title: "Frontend Architecture & Auth Store", hours: 5, deps: ["W1-1"], tag: "Frontend", description: "Set up frontend architecture with Vue Router, Pinia stores, and silent token refresh flow using httpOnly cookie on page load.", artifact: "Folder structure, Vue Router, Pinia stores with silent refresh", resolved: "JWT Token Security — access token never touches localStorage/sessionStorage. Silent refresh restores session from httpOnly cookie on reload.", subtasks: [
      ["Folder layout: /pages, /components, /stores, /composables, /services, /types", "Standard Vue 3 structure. Pages are route-level views, composables are reusable logic hooks, services handle API calls, types define TypeScript interfaces."],
      ["Configure Vue Router: / (board), /login, /register", "Three routes with lazy-loaded components. Board route requires auth (guarded), login/register are public."],
      ["useAuthStore: access token stored in memory (Pinia ref only — NOT localStorage)", "Access token lives only as Pinia ref. Cleared on tab close. Never written to localStorage or sessionStorage to prevent XSS theft."],
      ["Axios instance: attach access token from Pinia to Authorization header", "Create axios instance with request interceptor that reads token from useAuthStore and sets Authorization: Bearer header on every API call."],
      ["Axios response interceptor: on 401 → call POST /auth/refresh → retry original request", "When any API call returns 401, interceptor tries to refresh token. If refresh succeeds, replays original failed request transparently."],
      ["On page refresh: auto-call /auth/refresh on app mount to restore session from httpOnly cookie", "App.vue onMounted calls /auth/refresh. httpOnly cookie sent automatically by browser. If valid, new access token stored in Pinia — user stays logged in."],
      ["Route guards: redirect unauthenticated to /login", "Vue Router beforeEach guard checks useAuthStore.isAuthenticated. If false and route requires auth, redirect to /login with redirect query param."],
    ]},
    { legacy_id: "W3-2", ticketNo: tn(), title: "Auth UI (Login / Register)", hours: 3, deps: ["W3-1"], tag: "Frontend", description: "Build login and registration pages with Quasar form validation. Implement memory-only token storage and auto-login on register.", artifact: "LoginPage.vue, RegisterPage.vue", subtasks: [
      ["Quasar QForm with validation rules", "Use QInput with rules prop for client-side validation. Email format, password min 8 chars, required fields. QForm handles validation on submit."],
      ["Login stores access token in Pinia memory only", "On successful login, extract access token from JSON body and store in useAuthStore. Refresh token automatically stored by browser as httpOnly cookie."],
      ["Register → auto-login on success", "Registration endpoint returns same response as login (access token + refresh cookie). User immediately logged in without separate login step."],
      ["Logout → call POST /auth/logout (clears httpOnly cookie) + clear Pinia store", "Two-step logout: API call clears server-side refresh token and cookie, then Pinia store is reset. Router navigates to /login."],
    ]},
    { legacy_id: "W3-3", ticketNo: tn(), title: "Note Board Canvas", hours: 6, deps: ["W3-1"], tag: "Frontend", description: "Create the note board canvas with absolutely positioned NoteCard components. Implement add, delete, and z-index ordering from store.", artifact: "BoardPage.vue, NoteCard.vue", subtasks: [
      ["Full-viewport canvas with position: relative overflow container", "Main board div fills viewport (100vw x 100vh minus header). position: relative is positioning context for absolutely-positioned notes. overflow: hidden clips edges."],
      ["NoteCard absolutely positioned by pos_x / pos_y from store", "Each NoteCard uses position: absolute with left: pos_x, top: pos_y from Pinia store. Moving a note updates these values."],
      ["Render notes ordered by z_index ascending (CSS z-index from store)", "v-for iterates notes applying style.zIndex from store. Higher z_index renders on top. Clicking bumps z_index to bring to front."],
      ["Add Note button → POST to API → spawn at center + random offset", "FAB calls POST /api/notes with center viewport coords plus random ±50px offset. Prevents new notes stacking exactly on top of each other."],
      ["Delete note button → soft delete via API → remove from store", "Delete calls DELETE /api/notes/{id}. On 200, remove from Pinia. Optimistic UI: remove immediately, rollback on error."],
      ["Track local maxZ in useNotesStore for instant UI response before server confirms", "Store maintains local maxZ counter. On note click, z_index = maxZ + 1 applied instantly. Backend PATCH happens asynchronously."],
    ]},
    { legacy_id: "W3-4", ticketNo: tn(), title: "Note Content Editing & Auto-Save", hours: 3, deps: ["W3-3"], tag: "Frontend", description: "Implement auto-save composable with 500ms debounce, conflict-aware PATCH requests, and unsaved change indicators.", artifact: "useAutoSave composable with conflict-aware PATCH", subtasks: [
      ["Textarea for note body", "QInput type='textarea' inside NoteCard. Autofocus on create. Resizes with card. Click to edit, blur or Escape to exit editing mode."],
      ["useAutoSave: debounced 500ms PATCH on content change", "Composable watches note content ref. On change, resets 500ms debounce timer. When timer fires, PATCH /api/notes/{id}. Prevents excessive API calls."],
      ["Include updated_at in every PATCH so server can detect conflicts", "Every PATCH body includes client's last-known updated_at. Server compares against its timestamp. If they diverge, another device edited the note."],
      ["On 409 response: show conflict resolution toast", "If PATCH returns 409, auto-save pauses and shows toast with both versions. User picks 'Keep Mine' or 'Use Server'. Resolution triggers new PATCH."],
      ["Unsaved indicator dot during debounce window", "Small colored dot on note header while changes pending (debounce timer running). Disappears after successful PATCH. Visual save-in-progress feedback."],
    ]},
  ]},
  { sort_order: 4, label: "Sprint 4", theme: "Desktop Interactions", color: "#F3E5F5", accent: "#6A1B9A", tasks: [
    { legacy_id: "W4-1", ticketNo: tn(), title: "Drag & Drop (Mouse Events)", hours: 5, deps: ["W3-3"], tag: "Frontend", description: "Build the drag composable using mouse events. Implement boundary clamping, cursor states, and debounced position sync to backend.", artifact: "useDraggable composable (mouse-only)", subtasks: [
      ["useDraggable with mousedown / mousemove / mouseup on document", "Composable attaches mousedown to drag handle, then mousemove/mouseup to document (not element). Document-level listeners ensure drag continues if cursor leaves note."],
      ["Drag handle = note header bar (avoids textarea conflict)", "Only the colored header bar initiates drag. Clicking textarea body enters edit mode instead. Clear separation of interaction modes."],
      ["Cursor: grab on header hover, grabbing while dragging", "CSS cursor changes provide drag affordance. cursor: grab on header mouseenter, cursor: grabbing on mousedown. Reset on mouseup."],
      ["Boundary clamp: keep note within visible viewport", "During drag, clamp pos_x to [0, viewportWidth - noteWidth] and pos_y to [0, viewportHeight - noteHeight]. Prevents dragging off-screen."],
      ["Debounced PATCH pos_x / pos_y to backend 800ms after mouseup", "On mouseup, start 800ms debounce. If user drags again within 800ms, timer resets. Final position sent as single PATCH, not per-pixel."],
      ["Include updated_at in position PATCH for conflict detection", "Position changes use same conflict-aware PATCH pipeline. If another device moved same note, user gets conflict toast for position change."],
    ]},
    { legacy_id: "W4-2", ticketNo: tn(), title: "Resize Handle (SE Corner)", hours: 4, deps: ["W3-3"], tag: "Frontend", description: "Create the SE corner resize handle with min/max constraints. Debounced dimension sync with conflict-aware PATCH on mouseup.", artifact: "useResizable composable", subtasks: [
      ["12x12px SE corner grip inside NoteCard", "Small resize handle at bottom-right corner of each note. Visible on hover. Uses diagonal lines icon or cursor indicator for affordance."],
      ["Cursor: nwse-resize on grip hover", "Standard resize cursor (diagonal double arrow) on hover. Provides clear visual signal that this area is resizable."],
      ["useResizable: mousedown → track delta → update dimensions", "On grip mousedown, capture initial mouse pos and note dimensions. On mousemove, calculate delta and update width/height. On mouseup, finalize."],
      ["Min: 160x120px, Max: 600x600px constraints", "Clamp during resize. Minimum prevents notes too small to read. Maximum prevents single note dominating the canvas."],
      ["Debounced PATCH width / height with updated_at on mouseup", "Same debounce pattern as drag. Final dimensions sent as single PATCH after resize finishes. Includes updated_at for conflict detection."],
    ]},
    { legacy_id: "W4-3", ticketNo: tn(), title: "Keyboard Shortcuts & Context Menu", hours: 5, deps: ["W3-3"], tag: "Frontend", description: "Implement keyboard shortcuts (Ctrl+N, Delete, Escape) and right-click context menu with color picker, duplicate, and delete options.", artifact: "useKeyboardShortcuts composable + QMenu context menu", subtasks: [
      ["Ctrl+N → create note at canvas center", "Global keydown listener. Ctrl+N (Cmd+N on Mac) creates note at viewport center. preventDefault stops browser's 'new window' shortcut."],
      ["Delete / Backspace (focused note, not editing) → soft delete", "When note is selected but not in text edit mode, Delete/Backspace triggers soft delete. Does not fire when typing in textarea."],
      ["Escape → blur / deselect active note", "Escape exits any active state: closes text editing, deselects focused note, closes context menu. Returns to neutral board state."],
      ["Right-click → Quasar QMenu context menu", "Intercept contextmenu event on NoteCard. Show QMenu with note-specific actions at cursor. Prevent default browser context menu."],
      ["Context: Change Color → inline swatch picker", "QMenu item expands to show 6 color swatches inline. Clicking a swatch immediately updates color in store and sends PATCH."],
      ["Context: Duplicate Note → clone content + offset +20px", "Creates new note with identical content, color, and dimensions. Position offset +20px right/down to show it's a copy."],
      ["Context: Delete Note → soft delete + 3s undo toast (cancel before sync)", "Soft deletes and shows 3-second undo toast. If user clicks undo before timer, delete cancelled (restored from local state before sync)."],
    ]},
    { legacy_id: "W4-4", ticketNo: tn(), title: "z-index Layering + Drift Prevention", hours: 4, deps: ["W3-3"], tag: "Frontend", description: "Build the z-index layering composable with optimistic updates and automatic server renormalization trigger at the 900 cap.", artifact: "useZIndex composable with auto-renormalization", resolved: "z-index Drift — auto-triggered renormalization at 900 cap. Server owns final values.", subtasks: [
      ["useZIndex: click note → optimistically set z = localMaxZ + 1 in Pinia", "On note click/focus, immediately set z_index to max + 1 in Pinia. UI updates instantly. Backend PATCH follows asynchronously."],
      ["PATCH z_index to backend (include updated_at)", "After optimistic update, PATCH with new z_index and updated_at. On 409 conflict, server's z_index takes precedence — visual order usually correct."],
      ["After each z update: check if localMaxZ >= 900", "Every time localMaxZ incremented, check if approaching renormalization threshold. 900 gives buffer before values get unwieldy."],
      ["If cap approaching: call POST /api/notes/renormalize-zindex", "Automatically triggers server-side renormalization. No user interaction needed. Happens transparently in background."],
      ["On renorm response: update all note z_index values in Pinia from server response", "Server returns all notes with consecutive z_index (1, 2, 3...). Client replaces entire z_index state. localMaxZ resets to N."],
      ["6 color swatches: yellow, pink, blue, green, white, lavender", "Predefined palette matching classic sticky note colors. Stored as hex values. Applied to note background. Default is yellow (#FFF9C4)."],
    ]},
  ]},
  { sort_order: 5, label: "Sprint 5", theme: "Offline & PWA", color: "#E0F7FA", accent: "#00695C", tasks: [
    { legacy_id: "W5-1", ticketNo: tn(), title: "IndexedDB Offline Layer (Conflict-Aware)", hours: 7, deps: ["W3-1"], tag: "Frontend", description: "Implement IndexedDB offline layer with Dexie.js. Build pending sync queue and conflict resolution UI with side-by-side diff toast.", artifact: "indexedDbService.ts + conflict resolution UI", resolved: "Offline Sync Conflicts — user sees a diff and explicitly resolves each conflict. No silent data loss.", subtasks: [
      ["Dexie.js setup — notes table with all fields including updated_at", "Initialize Dexie database with notes table schema matching backend. Primary key on id, indexes on user_id and updated_at for efficient queries."],
      ["Write-through: every mutation writes to IndexedDB with local timestamp", "Every create/update/delete writes to IndexedDB first, then syncs to server. If offline, data persists locally. Timestamp enables conflict detection."],
      ["pendingSync queue: { noteId, operation, payload, client_updated_at }", "Separate IndexedDB table tracking unsynced operations. Each entry records what changed, when, and full payload to replay."],
      ["window online event → flush queue via POST /api/notes/sync", "Listen for browser online event. When connectivity returns, batch all pending operations via sync endpoint. Process response for conflicts."],
      ["Handle sync response: accepted notes → update IndexedDB", "For accepted notes, update IndexedDB with server's authoritative timestamps. Ensures local data matches server state exactly."],
      ["Handle conflicts array → show ConflictResolutionToast per conflicted note", "For each conflict, show toast with both versions. Queue multiple conflicts — resolve one at a time to avoid overwhelming user."],
      ["ConflictResolutionToast: show diff (your version vs server) + Keep Mine / Use Server buttons", "Side-by-side comparison showing what changed. Highlight differences in content, position, or color. Two clear action buttons."],
      ["On 'Keep Mine': force PATCH with client version", "Send another PATCH with client's version and force flag. Server accepts client version and updates timestamp. IndexedDB stays as-is."],
      ["On 'Use Server': update Pinia + IndexedDB with server version", "Overwrite local state with server's version. Update both Pinia store and IndexedDB. UI reflects server data immediately."],
    ]},
    { legacy_id: "W5-2", ticketNo: tn(), title: "PWA Configuration (Desktop Install)", hours: 4, deps: ["W5-1"], tag: "PWA", description: "Configure PWA mode with web app manifest, Workbox service worker, and desktop install prompt for Chrome/Edge.", artifact: "manifest.json, Workbox service worker", subtasks: [
      ["Configure Quasar PWA mode in quasar.config.js", "Set pwa mode in quasar.config.js. Enables service worker generation, manifest linking, and Workbox integration. Dev mode uses generateInDevMode."],
      ["Web App Manifest: name, 512px icon, theme_color, display: standalone", "manifest.json: app name, icons at 192px and 512px, theme color, standalone display mode (no browser chrome). Required for install prompt."],
      ["Workbox: cache-first for static assets, network-first for /api/*", "Static assets (JS, CSS, images) from cache for instant load. API calls try network first, fall back to cache. Balances freshness with offline."],
      ["Offline fallback page (cached app shell)", "If user navigates while fully offline and no cached response exists, show cached fallback page with app shell and 'offline' indicator."],
      ["Desktop install prompt (beforeinstallprompt — Chrome/Edge)", "Capture beforeinstallprompt event, show custom 'Install App' button. On click, trigger native install dialog. Store choice to avoid repeat prompts."],
    ]},
    { legacy_id: "W5-3", ticketNo: tn(), title: "Security Hardening", hours: 4, deps: ["W2-1"], tag: "Backend", description: "Harden security with CORS whitelisting, rate limiting on auth and sync endpoints, XSS sanitization, and HTTPS enforcement.", artifact: "Security audit checklist complete", subtasks: [
      ["CORS: whitelist Vercel production domain only", "Spring CORS config with explicit allowedOrigins for production Vercel URL only. Blocks unauthorized origins. credentials: true for cookies."],
      ["Rate limiting on /auth/* — Bucket4j (10 req/min per IP)", "Token bucket: 10 tokens/min per IP. Prevents brute-force login. Returns 429 Too Many Requests when exhausted."],
      ["Rate limiting on /api/notes/sync — prevent abuse (30 req/min per user)", "Per-user rate limit on sync. 30 req/min is generous for normal use but prevents runaway clients from hammering the server."],
      ["XSS: sanitize note content server-side (jsoup strip-tags)", "Use jsoup to strip all HTML tags from note content on save. Prevents stored XSS. Defense in depth alongside Vue's template escaping."],
      ["SameSite=Strict on refresh cookie prevents CSRF", "SameSite=Strict means cookie never sent on cross-site requests. Combined with httpOnly, refresh token protected against XSS and CSRF."],
      ["HTTPS enforced on chosen free-tier host", "All hosting options provide free SSL. Redirect HTTP to HTTPS. Secure cookie attribute requires HTTPS — won't be sent over plain HTTP."],
    ]},
    { legacy_id: "W5-4", ticketNo: tn(), title: "End-to-End Integration Tests", hours: 4, deps: ["W4-1", "W4-2", "W4-3", "W5-1"], tag: "QA", description: "Write Cypress E2E test suite covering note creation, drag persistence, offline sync, conflict resolution, and z-index renormalization.", artifact: "Cypress E2E suite (1280x800 desktop viewport)", subtasks: [
      ["Ctrl+N → assert note appears on canvas", "Trigger Ctrl+N keyboard event, assert new NoteCard element appears in DOM with default position near canvas center."],
      ["Drag note → reload → assert position persisted", "Simulate mousedown/mousemove/mouseup on note header. Reload page. Assert position matches drag destination coordinates."],
      ["Simulate offline → edit note → go online → assert sync + no conflict (fresh note)", "Use cy.intercept to block API calls (simulate offline). Edit content. Re-enable network. Assert sync called and note updated without conflict."],
      ["Simulate offline → edit note on 'server' directly → go online → assert conflict toast appears", "While offline, edit locally AND modify server DB directly. Go online. Assert ConflictResolutionToast appears with both versions."],
      ["Conflict: 'Keep Mine' → assert client version saved", "Click 'Keep Mine' on conflict toast. Assert local version is now authoritative. Verify PATCH sent with force flag."],
      ["Conflict: 'Use Server' → assert server version shown", "Click 'Use Server'. Assert UI shows server content. Verify IndexedDB and Pinia store match server state."],
      ["z-index: click notes repeatedly → trigger renorm at 900 → assert values reset", "Create notes, click repeatedly to inflate z_index. Assert renormalization called at 900. Assert z values reset to consecutive integers."],
    ]},
  ]},
  { sort_order: 6, label: "Sprint 6", theme: "Polish & Launch", color: "#FFF8E1", accent: "#F57F17", tasks: [
    { legacy_id: "W6-1", ticketNo: tn(), title: "Desktop UI Polish", hours: 5, deps: ["W5-2"], tag: "Frontend", description: "Polish desktop UI with create/delete animations, hover-only toolbar, conflict resolution toast component, and empty board state.", artifact: "Polished desktop UI with animations + conflict toast", subtasks: [
      ["Note appear animation: scale 0.8→1 + fade in on create", "CSS transition on mount: scale(0.8) to scale(1) with opacity 0 to 1 over 200ms. Uses Vue Transition component for enter/leave animations."],
      ["Note delete animation: scale + fade out before DOM removal", "On delete, leave animation: scale(1) to scale(0.9) with opacity fade. Wait for animation (200ms) before removing from DOM via Pinia store."],
      ["Note toolbar (color, duplicate, delete) visible on hover only", "Toolbar with action icons appears on mouseenter, fades on mouseleave. CSS opacity transition. Prevents clutter when not interacting."],
      ["ConflictResolutionToast component: side-by-side diff, two action buttons", "Fixed-position toast at bottom-right. Shows old vs new with highlighted diffs. 'Keep Mine' and 'Use Server' buttons. Auto-dismiss after resolution."],
      ["Empty board state: illustration + 'Press Ctrl+N to add a note' hint", "When no notes exist, centered illustration with text hint. Guides new users. Disappears as soon as first note is created."],
      ["Loading skeletons while fetching notes on initial board load", "On first render, pulsing skeleton rectangles at random positions. Replace with real notes when API responds. Masks network latency."],
    ]},
    { legacy_id: "W6-2", ticketNo: tn(), title: "Free-Tier Hosting Setup & Cold Start Mitigation", hours: 5, deps: ["W5-3"], tag: "DevOps", description: "Deploy to free-tier hosting with keep-alive configuration. Set up UptimeRobot monitoring and cold start mitigation with loading skeletons.", artifact: "Production deployed on chosen free host + keep-alive configured", resolved: "Railway Cold Starts — keep-alive ping + skeleton UI eliminates perceived latency. Free alternatives available.", subtasks: [
      ["Deploy Spring Boot to chosen free host (see Hosting tab for comparison)", "Multi-stage Dockerfile: Maven build then JRE runtime image. Push to container registry. Deploy via platform CLI or GitHub integration."],
      ["Configure managed PostgreSQL (Neon.tech free tier recommended)", "Create Neon.tech project, get connection string. Configure Spring datasource URL/user/password via env vars. Enable connection pooling."],
      ["Set up UptimeRobot free tier: ping /actuator/health every 5min (prevents spin-down)", "HTTP(s) monitor at /actuator/health with 5-min interval. Keeps free-tier instance from spinning down. Free plan covers this."],
      ["Frontend: show animated loading skeleton on first API call (masks cold start)", "Detect first API call after page load. Show skeleton UI while waiting. If response takes over 2s (cold start), show 'Waking up server...' message."],
      ["Add /actuator/health endpoint with DB connectivity check", "Actuator health endpoint with DB health indicator. Returns 200 if healthy, 503 if DB unreachable. Used by UptimeRobot monitoring."],
      ["Configure HTTPS + CORS for production domain", "Enable HTTPS via platform's free SSL. Update Spring CORS allowedOrigins to prod URL. Set Secure on cookies. Redirect HTTP to HTTPS."],
    ]},
    { legacy_id: "W6-3", ticketNo: tn(), title: "Performance Optimization", hours: 3, deps: ["W5-2"], tag: "Frontend", description: "Optimize performance with lazy-loaded components, debounced network calls, bundle analysis, and Quasar tree-shaking.", artifact: "Lighthouse PWA score ≥90", subtasks: [
      ["Lazy-load NoteCard with defineAsyncComponent", "Wrap NoteCard import with defineAsyncComponent to code-split from main bundle. Cards load on demand when board renders. Reduces initial size."],
      ["Debounce all network calls (no duplicate in-flight PATCH requests)", "Track in-flight requests per note ID. If new PATCH triggered while one pending, cancel previous or queue. Prevents race conditions."],
      ["Bundle analysis with rollup-plugin-visualizer", "Add visualizer plugin to vite.config.js. Build generates treemap HTML showing bundle composition. Identify largest deps for optimization."],
      ["Tree-shake unused Quasar components", "Configure quasar.config.js to import only used components. Reduces bundle by excluding QTable, QCalendar, etc."],
    ]},
    { legacy_id: "W6-4", ticketNo: tn(), title: "Monitoring & Documentation", hours: 3, deps: ["W6-2"], tag: "DevOps", description: "Set up Sentry error tracking for frontend and backend. Generate Swagger API docs and finalize README and ADR documentation.", artifact: "Sentry, Swagger docs, README", subtasks: [
      ["Sentry SDK in Vue frontend (error + performance tracing)", "Install @sentry/vue, initialize in main.ts with DSN. Captures unhandled errors, failed API calls, performance traces. Free tier: 5K events/mo."],
      ["Sentry in Spring Boot backend (exception tracking)", "Install sentry-spring-boot-starter. Auto-captures exceptions, slow transactions, HTTP 5xx. Same Sentry project for full-stack tracing."],
      ["springdoc-openapi → Swagger UI at /swagger-ui.html", "Add springdoc-openapi-starter-webmvc-ui dependency. Auto-generates OpenAPI spec from annotations. Interactive Swagger UI for testing."],
      ["README: local setup, env vars, deployment guide", "Document: prerequisites (Java 17, Node 18, Docker), local dev setup, all env vars with descriptions, and deployment guide."],
      ["ADR document finalized in /docs/adr/", "Compile all 8 ADRs into markdown in /docs/adr/. Each follows standard template: Context, Decision, Consequences, Status."],
    ]},
  ]},
];

// ─── SEED LOGIC ──────────────────────────────────────────

async function seed() {
  console.log("Checking if NOTO Project board already exists...");
  const { data: existing } = await supabase.from("boards").select("id").eq("name", "NOTO Project").single();
  if (existing) {
    console.log("Board already exists — skipping seed. Delete the board to re-seed.");
    return;
  }

  console.log("Creating board...");
  const { data: board, error: boardErr } = await supabase.from("boards").insert({ name: "NOTO Project", description: "Sticky Notes PWA — Desktop-First MVP" }).select().single();
  if (boardErr) throw boardErr;
  console.log(`  Board: ${board.id}`);

  const legacyToUuid = {};

  for (const sprintData of SPRINTS_DATA) {
    console.log(`Creating ${sprintData.label}...`);
    const { data: sprint, error: sprintErr } = await supabase.from("sprints").insert({
      board_id: board.id, sort_order: sprintData.sort_order, label: sprintData.label,
      theme: sprintData.theme, color: sprintData.color, accent: sprintData.accent,
    }).select().single();
    if (sprintErr) throw sprintErr;

    for (let ti = 0; ti < sprintData.tasks.length; ti++) {
      const t = sprintData.tasks[ti];
      const { data: ticket, error: ticketErr } = await supabase.from("tickets").insert({
        sprint_id: sprint.id, board_id: board.id, legacy_id: t.legacy_id,
        ticket_no: t.ticketNo, title: t.title, description: t.description,
        artifact: t.artifact, hours: t.hours, tag: t.tag, status: "backlog",
        resolved: t.resolved || null, sort_order: ti,
      }).select().single();
      if (ticketErr) throw ticketErr;
      legacyToUuid[t.legacy_id] = ticket.id;
      console.log(`  #${t.ticketNo} ${t.title} → ${ticket.id}`);

      // Subtasks
      const subtaskRows = t.subtasks.map(([title, detail], si) => ({
        ticket_id: ticket.id, sort_order: si, title, detail,
      }));
      const { error: subErr } = await supabase.from("subtasks").insert(subtaskRows);
      if (subErr) throw subErr;
    }
  }

  // Insert dependencies
  console.log("Creating dependencies...");
  for (const sprintData of SPRINTS_DATA) {
    for (const t of sprintData.tasks) {
      for (const dep of t.deps) {
        const ticketId = legacyToUuid[t.legacy_id];
        const depId = legacyToUuid[dep] || null;
        const { error: depErr } = await supabase.from("ticket_deps").insert({
          ticket_id: ticketId, depends_on_id: depId, depends_on_legacy: dep,
        });
        if (depErr) console.warn(`  Dep ${t.legacy_id} → ${dep}: ${depErr.message}`);
      }
    }
  }

  console.log("Seed complete!");
}

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });
