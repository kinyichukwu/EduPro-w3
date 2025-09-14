SEQUENCE 1

### Executive overview
- RAG is wired end-to-end but document processing is not completed: `processDocument` in `backend/internal/handlers/rag.go` fetches a signed URL but does not extract, chunk, embed, or store chunks.
- Frontend already has a solid RAG chat UX (`/dashboard/chats`) with upload and ask flows, but lacks citations rendering and document management UI.
- Quiz/flashcards are mostly UI with mocks; no backend-driven reward issuance or wallet linkage exists.
- No wallet or Solana integration on either side yet; no token mint/staking logic; no marketplace for paid courses.

## Phase 0 — Prerequisites & setup
- **Environment/secrets**:
  - Backend: add `SOLANA_RPC_URL`, `EDUPRO_MINT_ADDRESS`, `EDUPRO_MINT_AUTHORITY_SECRET_BASE58`, `EDUPRO_PLATFORM_FEE_BPS`, `EDUPRO_JUPITER_API_BASE`, `EDUPRO_STAKING_PROGRAM_ID` (later), `EDUPRO_STAKING_TREASURY`.
  - Frontend: add `VITE_SOLANA_RPC_URL`, `VITE_EDUTOKEN_MINT`, `VITE_JUPITER_SCRIPT_URL`, `VITE_STAKING_PROGRAM_ID`.
- **Libraries**:
  - Backend (Go):
    - Solana: `github.com/gagliardetto/solana-go` (on-chain verification, transfers, token ops)
    - Optional staking indexing helpers if needed
    - DOCX extraction: `github.com/nguyenthenguyen/docx` or `baliance.com/gooxml` (choose one)
  - Frontend (TS/React):
    - Wallet: `@solana/wallet-adapter-react`, `@solana/wallet-adapter-wallets`, `@solana/wallet-adapter-react-ui`
    - Payments: `@solana/pay` (or custom transfer via wallet adapter)
    - Jupiter Swap: widget or `@jup-ag/wallet-adapter` integration
- **Database migration tooling**: add a migrations directory and versioned SQL migrations for new tables (rewards, wallets, courses, purchases, staking if off-chain mirrored).
- **Access control**: extend CORS to support wallet adapter & solana pay redirect/schemes where needed.

## Phase 1 — Complete RAG implementation (backend and frontend)
- **Backend RAG processing**
  - In `backend/internal/handlers/rag.go`:
    - Complete `processDocument`:
      - Download file via signed URL (HTTP GET) into a reader.
      - Call `h.extractor.ExtractText(reader, filename)`.
      - Call `h.chunker.ChunkText(extraction.Text, metadata)` returning chunks with metadata.
      - Generate embeddings in batch (`embeddings.GenerateEmbeddings`) for chunk contents.
      - Insert chunks via `h.pgx.InsertChunks(ctx, []ChunkInsert{...})`.
      - Update new `documents.processing_status` and `documents.error` columns (add in schema) to track progress.
    - Add endpoints:
      - `DELETE /api/documents/:id` → delete document, cascade deletes chunks, delete file from storage using `storage.DeleteFile`.
      - `POST /api/documents/:id/reprocess` → re-run `processDocument`.
      - Optional: `GET /api/documents/:id/chunks?page=...` for debugging and UI.
      - Optional: `POST /api/ask` enhancement: accept `document_ids?: string[]` to filter retrieval.
  - **Database changes** (`schema.sql`):
    - Alter `documents`:
      - `processing_status TEXT CHECK (processing_status IN ('queued','processing','completed','failed')) DEFAULT 'queued'`
      - `error TEXT`
      - `size BIGINT`, `checksum TEXT` (optional)
    - Indexes on `documents.created_at` and `chunks.created_at`.
  - **AI prompt grounding**:
    - Move prompt building for RAG to an isolated helper and template in `ai/prompts.go` (RAG-specific, enforce strict style and refusal when insufficient context).
  - **Health/observability**:
    - Add structured logs around each processing step, and record processing duration.
    - Optional: an `/api/rag/health` aggregator that checks embedding availability, vector index presence, and storage health.

- **Frontend RAG UX**
  - In `frontend/src/dashboard/general-chats/index.tsx` and `ChatWindow.tsx`:
    - Add citation rendering under assistant messages: render a collapsible list of `AskResponse.citations` with `document_title`, `ordinal`, `snippet`, and link to `source_url`.
    - Show per-message "sources" badge if citations exist.
  - Document management page:
    - New page `Dashboard > Library > My Documents` (can reuse existing `library/uploads.tsx` route) enhanced with:
      - Pagination with file name, status (queued/processing/completed/failed), created time.
      - Actions: delete, reprocess.
      - Optional: document details modal with chunk count and sample snippets.
  - File upload UX:
    - In `FileUpload.tsx`: validate extension matrix with backend-supported formats (`.pdf`, `.txt`, `.docx` only when implemented). Sync size limits (backend is 10MB, UI shows 50MB; align both, suggest 20MB).
  - Chat improvements:
    - Add "rename chat" and "delete chat" (requires backend endpoints; see below).
    - Add agent selector (reserved for Phase 5 agents) to the chat header; initially no gating.

- **Backend chat management enhancements**
  - Endpoints to add:
    - `DELETE /api/chats/:id` → deletes chat and messages (owned by user).
    - `PUT /api/chats/:id` → `{ title?: string }` store `title` column in `chats` (add `title TEXT` in schema).
  - Update `GetChats` to return `title`.

## Phase 2 — Wallet linkage, identity and balances
- **Database**
  - Table `user_wallets`:
    - `id UUID PK`
    - `user_id UUID REFERENCES users(id)`
    - `address TEXT UNIQUE NOT NULL`
    - `network TEXT CHECK (network IN ('solana')) DEFAULT 'solana'`
    - `created_at TIMESTAMPTZ DEFAULT NOW()`
  - Table `reward_events`:
    - `id UUID PK`
    - `user_id UUID`
    - `event_type TEXT` (e.g., `quiz_completed`, `flashcard_streak`, `rag_usage`)
    - `event_payload JSONB`
    - `points INT` (pre-tokenization) and `tokens DECIMAL(20,9)` (awarded tokens)
    - `status TEXT CHECK (status IN ('pending','awaiting_wallet','issued','failed'))`
    - `tx_signature TEXT` (nullable)
    - `created_at`, `updated_at`
- **Backend endpoints**
  - `POST /api/wallets/link/request` → returns a random nonce associated to user (store in DB).
  - `POST /api/wallets/link/verify` → `{ address, signature }` verify signed nonce, upsert `user_wallets`.
  - `GET /api/wallets` → list linked wallets.
  - `DELETE /api/wallets/:address` → unlink.
  - `GET /api/rewards/summary` → returns pending/issued totals and last N events for dashboard.
- **Frontend**
  - Global Wallet Provider:
    - Add wallet adapter provider at app root (`layout.tsx` or `main.tsx`) with Phantom, Solflare default.
  - Profile → Wallet section:
    - Connect Wallet button; if connected, show address, balance of SOL and EduToken.
    - Link flow: request nonce, sign message, verify with backend, then persist address.
  - Rewards dashboard page:
    - New route `Dashboard > Rewards`: show EduToken balance, recent events, claim pending tokens (Phase 4), and quick link to staking.

## Phase 3 — EduToken (SPL) mint and balance plumbing
- **Token minting**
  - Decide to deploy once manually (outside app) and set `EDUPRO_MINT_ADDRESS`. Keep mint authority in a secure secret for backend distribution service (transfer from treasury).
  - Document decimals (e.g., 9) and display formatting.
- **Backend token service**
  - Add a `services/solana` package:
    - RPC client with retries.
    - Functions:
      - `GetTokenBalance(address, mint)` → lamports for the mint ATAs.
      - `EnsureATA(address, mint)` → create ATA ix if missing (via backend signer).
      - `TransferTokens(fromSigner, toAddress, mint, amount)` → mints/transfers from treasury.
      - `VerifyTx(sig)` → confirm finalized, parse logs/errors.
  - Add `GET /api/rewards/balance` → returns on-chain token balance for user’s linked wallet (if any).
- **Frontend**
  - Rewards page queries on-chain balance via backend proxy or directly via RPC (choose one; backend proxy keeps RPC endpoints private/rate-limited).
  - Global quick balance in header after wallet connect (nice to have).

## Phase 4 — Rewards engine: Earn-as-you-learn
- **Rules definition**
  - Map events to token amounts:
    - **Quiz completion**:
      - Base reward per quiz + bonus by score thresholds (e.g., 60/80/90).
    - **Flashcard streak**:
      - 3-day, 7-day, 14-day streak multipliers.
    - **RAG usage**:
      - First successful Q&A with citations: small reward.
      - Upload+processing: small reward.
  - Anti-abuse:
    - Rate limit event creation per user per day and require unique content where applicable.
    - Idempotency keys per event (e.g., quiz session id).
- **Backend**
  - Hook points:
    - On quiz completion, call `CreateRewardEvent(user_id, event_type, payload, tokens)`.
    - On flashcard streak continuation, likewise.
    - On RAG `Ask` success (with non-empty `citations`), log micro-reward (cap daily).
  - Issuance worker:
    - Periodic job (goroutine ticker) scanning `reward_events WHERE status IN ('pending','awaiting_wallet')`:
      - If user has wallet → mint/transfer, set `status='issued'`, store `tx_signature`.
      - If not → `status='awaiting_wallet'` (shows as claimable after wallet link).
  - Endpoints:
    - `POST /api/rewards/claim` → if user later links wallet, issue accumulated tokens in batch.
    - `GET /api/rewards/events?page=...` → paginated history.
- **Frontend**
  - Surfaces:
    - Toasts after a learning action: “+X EDU rewarded! View in Rewards.”
    - Rewards page: pending/claimed totals, claim button if needed.
    - Gamified progress bar for next milestone.

## Phase 5 — Staking mechanics and gated AI agents
- **Gated agents**
  - Agents to ship:
    - **Math Genius** (advanced reasoning, step-by-step derivations).
    - **Exam Prep** (syllabus mapping, past-questions focus, timing/study plan).
  - Backend:
    - Extend `POST /api/ask` to accept `agent?: 'math_genius'|'exam_prep'`, route prompts via agent-specific templates in `ai/prompts.go`.
    - Middleware `RequireStake(minTokens)`:
      - Check chain for user’s staked balance or consult backend cache/index.
      - If not staked, return 402-like error with gating metadata.
- **Staking implementation (on-chain recommended)**
  - Build a minimal Anchor program (separate repo) that:
    - Allows users to stake EduToken into a PDA escrow for a lock period.
    - Tracks staked amount and unlock timestamp.
  - Deployment:
    - Set `EDUPRO_STAKING_PROGRAM_ID`, `EDUPRO_STAKING_TREASURY`.
  - Backend helper:
    - Endpoint `GET /api/staking/position` → read user’s PDA and return staked amount/lock.
    - Optional webhook-like poller caching user positions in DB for faster checks.
- **Frontend**
  - Staking page:
    - Forms to Stake/Unstake, shows lock timer, and “Unlocks agents: Math Genius, Exam Prep”.
  - Agent selection UI:
    - If gated, show “Stake EDU to unlock” CTA; deep link to Staking page.

## Phase 6 — Course creation, marketplace, and Solana payments
- **Data model**
  - Tables:
    - `courses`:
      - `id UUID PK`, `creator_user_id`, `title`, `description`, `cover_image`, `price_lamports BIGINT`, `currency TEXT CHECK (currency IN ('SOL','EDU')) DEFAULT 'SOL'`, `is_published BOOL`, `created_at`, `updated_at`
    - `course_sections` (or `chapters`):
      - `id`, `course_id`, `title`, `position`
    - `course_lessons`:
      - `id`, `section_id`, `title`, `content_rich TEXT`, `position`, `is_locked BOOL`
    - `purchases`:
      - `id`, `course_id`, `buyer_user_id`, `tx_signature`, `paid_amount_lamports`, `currency`, `created_at`
    - Optionally `creator_profiles` with `payout_address`.
- **Backend endpoints**
  - Creator:
    - `POST /api/courses` (auth): create draft course.
    - `PUT /api/courses/:id` (auth): update metadata and content.
    - `PUT /api/courses/:id/publish` (auth): publish/unpublish.
    - CRUD for sections and lessons.
  - Public:
    - `GET /api/courses` (filter by subject/creator).
    - `GET /api/courses/:id`
  - Purchase:
    - `POST /api/courses/:id/purchase/init` → returns payment intent:
      - recipient (creator wallet), amount, reference, label, memo (include platform fee route if used).
    - `POST /api/courses/:id/purchase/verify` → accepts tx signature (or searches by reference with Solana Pay pattern), verifies transfer on-chain (amount, recipient, reference/memo), records `purchases`, grants access.
  - Access guard:
    - `GET /api/courses/:id/content` → checks ownership; returns sections/lessons.
  - Platform fee:
    - Add a BPS fee with a split to platform treasury; instruct buyer to send two transfers (creator + fee), or use a CPI router if using an escrow program (advanced).
- **Frontend pages**
  - Marketplace:
    - `Dashboard > Marketplace` (new): list published courses with filters.
  - Course detail:
    - Course info, sample lessons preview, “Buy with SOL/EDU” button.
    - Solana Pay flow or wallet adapter modal to approve transfer(s).
  - Creator Dashboard:
    - `Dashboard > Creator`:
      - Course Builder: metadata, sections/lessons editor (rich text or Markdown), pricing, publish toggle.
      - Sales analytics: list of purchases and revenue.
  - Course learner view:
    - `Dashboard > My Courses > CourseView`:
      - List sections/lessons; lock indicator for unpaid content; unlock after purchase.

## Phase 7 — Swap integration (Jupiter) and EDU utility
- **Jupiter swap widget**
  - Add a simple “Swap to EDU” on Rewards page, configured with `VITE_EDUTOKEN_MINT`.
  - Or deep link to Jupiter web with prefilled `input=SOL`, `output=EDU`.
- **Backend proxy (optional)**
  - If needed, add a light proxy endpoint for rate-limiting/observability when fetching quotes (optional).

## Phase 8 — Upgrade quizzes/flashcards to be backend-driven and reward-aware
- **Backend**
  - The existing `/api/query` supports quiz and explanation tasks via Gemini; extend to:
    - Accept quiz options (difficulty, num_questions) in request (extend `models.QueryRequest` and validators).
  - Add `/api/quiz/attempts`:
    - `POST` to record attempt with `{quiz_id (or topic hash), answers, score}` and create corresponding reward event.
- **Frontend**
  - Replace mocks in:
    - `frontend/src/dashboard/quizzes/index.tsx` and `frontend/src/dashboard/quizzes/Quiz.tsx` to fetch generated quizzes from `/api/query` with `TaskQuiz` and report attempts to `/api/quiz/attempts`.
  - Flashcards:
    - Record sessions/streaks into backend and award tokens accordingly.

## Phase 9 — Cleanups, UX polish, and consistency
- **Pages to remove or consolidate**
  - Routes under `dashboard/chat/` (`Tutor.tsx`, `Topics.tsx`, etc.) appear legacy and overlapping with RAG `GeneralChats`. Plan:
    - Deprecate `Dashboard > AI Tutor` routes if not used; unify everything under `/dashboard/chats`.
    - Update `router.tsx` to remove dead paths or redirect to `chats`.
- **Consistency**
  - Align file size/type validation between frontend and backend (`storage.go` vs `FileUpload.tsx`).
  - Chat titles: add `title` column on chats and display in `ChatList.tsx`.
  - Error surfaces: show `processing_status='failed'` with retry CTA and error details in documents UI.
  - Add streaming responses (optional) via SSE for `Ask` with token counting if feasible.

## Phase 10 — Security, reliability, and DevOps
- **Key management**
  - Move mint authority private key to a secure store (KMS/Cloud secret manager). Never commit.
- **Rate limiting**
  - Add IP/user-based rate limiting to upload and ask endpoints to reduce abuse.
- **Testing**
  - Unit tests for:
    - Chunker and extractor with sample files.
    - Embedding/service stubs.
    - Rewards issuance state machine.
    - Purchase verification against mock RPC.
  - E2E smoke: upload → RAG ask → citation → reward.
- **Logging/metrics**
  - Add request IDs in logs (already partially there).
  - Track reward issuance and on-chain tx status.
- **Migrations & deployment**
  - Versioned SQL migrations for new tables/columns.
  - Update `render.yaml` (backend) and `.env` templates.
  - Vercel/Netlify configuration for frontend env vars.

## Detailed file-by-file implementation map

### Backend (Go)
- `internal/handlers/rag.go`
  - Complete `processDocument` with extract → chunk → embed → insert.
  - Add new handlers: delete document, reprocess, chunks listing, chat delete/rename, ask with `document_ids`, ask with `agent`.
- `internal/services/extract/extract.go`
  - Implement DOCX extraction (choose library), or explicitly disable DOCX in both UI and backend until added.
- `internal/services/embeddings/gemini.go`
  - Keep batching via `GenerateEmbeddings`, add guards for empty outputs.
- `internal/services/database/pgx_client.go`
  - Add helper to upsert processing status and to count chunks per doc (optional).
- `internal/services/storage/storage.go`
  - Add `DownloadFile(path string) (io.ReadCloser, error)` or reuse signed URL + http client inside handler.
- `internal/services/ai/prompts.go`
  - Add RAG prompt template and agent-specific prompts: `MathGeniusPrompt`, `ExamPrepPrompt`.
- `internal/services/solana` (new)
  - RPC client; token ops; ATA helpers; tx verification; purchase verification helpers.
- `internal/handlers/rewards.go` (new)
  - Wallet link endpoints, rewards summary, claim, events listing, balance.
- `internal/handlers/staking.go` (new)
  - Staking position read endpoints; gating middleware helpers.
- `internal/handlers/courses.go` (new)
  - CRUD for courses/sections/lessons; publish toggle; listing/detail; purchase init/verify; content access.
- `internal/models/*.go`
  - Add request/response models for the above.
- `internal/services/database/schema.sql`
  - Apply new columns and tables (user_wallets, reward_events, courses*, purchases).
- `cmd/api/main.go`
  - Wire new routes; ensure JWT middleware on protected routes; CORS updates.

### Frontend (React/TS)
- Core providers:
  - `src/main.tsx` or `src/layout.tsx`: Wallet Adapter Provider with Phantom/Solflare; theme consistent with UI.
- Services:
  - `src/services/api.ts`
    - Add endpoints for wallets, rewards, staking, courses, purchases.
  - `src/services/rag.ts`
    - Extend `ask(query, chatId, agent?, documentIds?)`.
- RAG UI:
  - `src/dashboard/general-chats/*`
    - Add citations rendering.
    - Add chat rename/delete UI (call new endpoints).
- Document UI:
  - Enhance `src/dashboard/library/uploads.tsx` or add `src/dashboard/library/documents.tsx` with processing status, delete, reprocess.
- Rewards:
  - New `src/dashboard/rewards/index.tsx` (balance, events, claim).
  - Jupiter swap embed on this page.
- Staking:
  - New `src/dashboard/staking/index.tsx` (stake/unstake with wallet adapter).
  - Surface gated badge on agents.
- Agents:
  - Agent selector dropdown in `ChatWindow` header; gating message if locked.
- Courses:
  - Marketplace: `src/dashboard/marketplace/index.tsx`
  - Course detail: `src/dashboard/marketplace/course/[id].tsx`
  - Creator dashboard: `src/dashboard/creator/index.tsx` with Course Builder (sections/lessons forms).
  - My Courses: `src/dashboard/my-courses/index.tsx` and course view page.
  - Payment flow:
    - Use Solana Pay deep link or wallet adapter transfer; call backend `purchase/init` to get reference and amounts, then `purchase/verify`.

## Milestones & acceptance criteria

- Milestone A (RAG complete)
  - Upload → processing_status transitions to completed.
  - Ask returns meaningful answers with citations derived from ingested chunks.
  - Frontend displays citations; documents list supports delete/reprocess.
- Milestone B (Wallet + Rewards)
  - User links wallet; Rewards page shows balance and events.
  - Completing a quiz triggers a reward event; if wallet linked, tokens are transferred; if not, pending claim works after linking.
- Milestone C (Staking + Agents)
  - Staking page works on devnet; staked position recognized by backend.
  - Agent selection gated by min staked amount; unlocked agents usable in chat.
- Milestone D (Courses + Payments)
  - Creator can publish a course with sections/lessons.
  - Buyer can pay in SOL (and optionally EDU); backend verifies tx and grants access.
  - My Courses page shows purchased content unlocked.
- Milestone E (Swap + Polish)
  - Jupiter swap allows users to acquire EDU.
  - Legacy chat routes cleaned up; consistent validations; logging and simple tests in place.

## Risks and mitigations
- On-chain key management: use devnet for hackathon; isolate and restrict mint authority usage; rotate keys post-event.
- Rate limits/costs (Gemini embeddings): batch and cache embeddings; cap chunk count per doc.
- DOCX parsing complexity: if time-constrained, disable DOCX in UI and backend for MVP; ship PDF/TXT first.
- Payment verification edge cases: use Solana Pay reference pattern or require client to POST signature explicitly; handle finalization waits and timeouts gracefully.

## What to build first
1. RAG `processDocument` end-to-end + document status UI.
2. Wallet linking + rewards event model + basic issuance from treasury (devnet).
3. Agent gating plumbing (without staking), then add staking read-only and UI; on-chain staking last if time permits.
4. Course CRUD + purchase verify for SOL; content gating.
5. Swap integration and UX polish.

- - -

- Implemented no code yet; this is your complete blueprint tied to your codebase (files and routes named explicitly). If you want, I can start with Phase 1 RAG completion and wire the new endpoints and schema changes.