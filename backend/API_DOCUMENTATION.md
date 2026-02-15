# EduPro API Documentation

## Base URL

```
http://localhost:8080
```

## Authentication

All protected endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

Tokens are valid for 24 hours.

---

## Public Endpoints

### Health & Info

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check |
| GET | `/version` | API version info |
| GET | `/` | Root endpoint |

### AI Query

#### POST `/api/query`

Process AI query (quiz generation or explanations).

**Request Body:**
```json
{
  "task": "quiz|explain",
  "query": "string (required, 3-1000 chars)",
  "subject": "string (optional)",
  "level": "string (optional)",
  "language": "en|yo|ig|ha (optional)"
}
```

---

## Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/me` | Yes | Get current user profile |
| POST | `/api/auth/refresh` | Yes | Refresh token |

---

## User Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/onboarding` | Get onboarding data |
| PUT | `/api/user/onboarding` | Update onboarding data |
| PUT | `/api/user/profile` | Update user profile |

---

## Course Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses/browse` | Browse published courses |
| GET | `/api/courses/browse/:id` | Get published course details |
| GET | `/api/courses/:id/details` | Get course details |
| GET | `/api/courses/public-with-purchase-info` | Courses with purchase info |

### Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/courses` | Create course |
| GET | `/api/courses` | Get user's courses |
| GET | `/api/courses/:id` | Get specific course |
| GET | `/api/courses/:id/content` | Get course content |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |
| PATCH | `/api/courses/:id/status` | Update course status |
| GET | `/api/courses/:id/learn` | Get learning content |
| GET | `/api/courses/:id/progress` | Get course progress |
| PATCH | `/api/courses/:id/progress` | Update course progress |
| POST | `/api/courses/:id/enroll` | Enroll in course |
| GET | `/api/courses/enrolled` | Get enrolled courses |
| POST | `/api/courses/:id/purchase` | Purchase course (NFT) |
| GET | `/api/courses/my-purchases` | Get purchased courses |
| GET | `/api/courses/stats` | Get course statistics |

---

## Module Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/courses/:id/modules` | Create module |
| GET | `/api/courses/:id/modules` | Get course modules |
| GET | `/api/courses/:id/modules/:moduleId` | Get specific module |
| PUT | `/api/courses/:id/modules/:moduleId` | Update module |
| DELETE | `/api/courses/:id/modules/:moduleId` | Delete module |
| POST | `/api/courses/:id/modules/generate-title` | AI generate title |
| POST | `/api/courses/:id/modules/generate-content` | AI generate content |
| POST | `/api/courses/:id/modules/:moduleId/links` | Add module link |
| DELETE | `/api/courses/:id/modules/:moduleId/links/:linkId` | Delete module link |

---

## Flashcard Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/flashcards/decks` | Create deck |
| GET | `/api/flashcards/decks` | Get all decks |
| GET | `/api/flashcards/decks/:id` | Get specific deck |
| PUT | `/api/flashcards/decks/:id` | Update deck |
| DELETE | `/api/flashcards/decks/:id` | Delete deck |
| POST | `/api/flashcards/decks/:id/cards` | Create flashcard |
| POST | `/api/flashcards/decks/:id/cards/bulk` | Bulk create cards |
| GET | `/api/flashcards/decks/:id/cards` | Get cards in deck |
| GET | `/api/flashcards/decks/:id/cards/study` | Get study cards |
| PUT | `/api/flashcards/decks/:id/cards/:flashcard_id/rate` | Rate card |
| POST | `/api/flashcards/decks/:id/generate` | AI generate cards |
| POST | `/api/flashcards/study/sessions` | Start study session |
| PUT | `/api/flashcards/study/sessions/:sessionId` | End study session |
| GET | `/api/flashcards/stats` | Get flashcard stats |

---

## RAG / Document Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload document (multipart) |
| GET | `/api/documents` | Get user's documents |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/documents/:id/reprocess` | Reprocess document |
| GET | `/api/documents/:id/chunks` | Get document chunks |
| GET | `/api/chats` | Get user's chats |
| POST | `/api/chats` | Create chat |
| GET | `/api/chats/:id` | Get chat messages |
| DELETE | `/api/chats/:id` | Delete chat |
| PUT | `/api/chats/:id` | Update chat |
| POST | `/api/ask` | Ask RAG question |
| GET | `/api/rag/health` | RAG system health |

---

## Wallet Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/wallet/generate` | Generate Solana wallet |
| POST | `/api/wallet/connect` | Connect existing wallet |
| POST | `/api/wallet/verify` | Verify wallet signature |
| GET | `/api/wallet/list` | List user wallets |
| DELETE | `/api/wallet/:id` | Disconnect wallet |
| POST | `/api/wallet/fund` | Fund wallet (testnet) |

---

## Payment Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/generate` | Generate payment tx |
| POST | `/api/payment/submit` | Submit signed tx |
| GET | `/api/payment/tokens` | Get supported tokens |
| GET | `/api/payment/status/:txId` | Get payment status |
| POST | `/api/payment/deduct` | Deduct tokens |
| POST | `/api/payment/send-tokens` | Send EduPro tokens |

---

## Solana Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/solana/wallet/:address/balance` | Get SOL balance |
| GET | `/api/solana/wallet/:address/token-balance` | Get token balance |
| GET | `/api/solana/wallet/:address/edutoken-balance` | Get EduToken balance |
| GET | `/api/solana/transaction/:signature` | Verify transaction |
| POST | `/api/solana/transaction/wait/:signature` | Wait for confirmation |
| POST | `/api/solana/payment/create-url` | Create Solana Pay URL |
| POST | `/api/solana/payment/process-course` | Process course payment |
| POST | `/api/solana/swap/quote` | Get swap quote |
| POST | `/api/solana/swap/execute` | Execute swap |
| POST | `/api/solana/swap/sign` | Sign swap tx |
| POST | `/api/solana/swap/submit` | Submit swap |
| GET | `/api/solana/swap/status/:swapId` | Get swap status |
| POST | `/api/solana/reward/distribute` | Distribute rewards |
| GET | `/api/solana/reward/calculate` | Calculate rewards |
| GET | `/api/solana/stats` | Blockchain stats |

---

## NFT Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/nft/membership` | Create membership NFT |
| POST | `/api/nft/course-collection` | Create course NFT collection |
| GET | `/api/nft/course-collection/:id` | Get collection by ID |
| POST | `/api/nft/course-collection/details` | Get collection details |
| POST | `/api/nft/course/purchase` | Purchase course NFT |
| GET | `/api/nft/user/:email` | Get user NFTs |
| POST | `/api/nft/user` | Get user NFTs (POST) |
| POST | `/api/nft/transfer` | Transfer NFT |

---

## EduPo Token Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/edupo-tokens/info` | No | Token info |
| POST | `/api/edupo-tokens/buy` | Yes | Buy tokens |

---

## Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details",
  "code": 400
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Server Error |
| 503 | Service Unavailable |
