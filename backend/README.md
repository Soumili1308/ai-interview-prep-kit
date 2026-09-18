# 2. BACKEND → `backend/README.md`

**Purpose:** Only explain **how the backend works**.

Copy this:

```markdown
# Backend

Backend API for the AI Interview Prep Kit.

## Tech Stack

- Node.js
- Express
- JavaScript
- MongoDB
- Mongoose
- JWT
- Groq API
- Zod
- Jest

## Responsibilities

The backend handles:

- Authentication
- User authorization
- Interview kit CRUD
- Job description processing
- Company research
- Interview research
- LLM integration
- Question generation
- Requirement coverage
- Flashcards
- Schedule generation
- Kit validation
- Evaluation

## Structure

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   │   ├── llm/
│   │   ├── pipeline/
│   │   └── research/
│   └── utils/
├── tests/
├── .env.example
└── package.json
Environment Variables
PORT=5000
MONGODB_URI=
JWT_SECRET=
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-20b
Run
npm install
npm run dev

Server:

http://localhost:5000
AI Pipeline
JD
 ↓
Requirements
 ↓
Company Research
 ↓
Interview Research
 ↓
Questions
 ↓
Coverage Check
 ↓
Second Pass
 ↓
Flashcards
 ↓
Schedule
 ↓
Final Kit
LLM Handling

The backend uses Groq for structured JSON generation.

LLM responses are parsed and validated before being accepted.

Retrieved web content is treated as untrusted data.

LLM requests are rate-limited to reduce API rate-limit errors.

Validation

The final kit is validated using the project schema.

Coverage is calculated using requirement IDs rather than relying on the LLM's claim that requirements are covered.

Testing
npm test
Evaluation
npm run evaluate -- --input cases.json --output kits.json
Security
JWT authentication
Protected API routes
User ownership checks
Environment variables for secrets
External URL validation
Untrusted research content handling