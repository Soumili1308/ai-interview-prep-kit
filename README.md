# AI Interview Prep Kit

AI-powered interview preparation platform that converts a Job Description and company information into a structured interview preparation kit.

## Features

- User registration and login
- Job description requirement extraction
- Company website research
- Public interview research
- AI-generated interview questions
- Technical, behavioural, system-design and company-fit questions
- Requirement coverage checking
- Flashcards
- Deterministic preparation schedule
- Practice mode
- User-specific interview kits

## Tech Stack

**Frontend:** Next.js, React, TypeScript, Tailwind CSS

**Backend:** Node.js, Express, JavaScript

**Database:** MongoDB

**AI:** Groq API, GPT-OSS

**Other:** JWT, REST APIs, web scraping/research, Zod, Jest

## Architecture

```text
User
 ↓
Next.js Frontend
 ↓
Express Backend
 ├── MongoDB
 ├── Groq API
 └── External Research Sources
Workflow
Job Description
      ↓
Requirement Extraction
      ↓
Company Research
      ↓
Interview Research
      ↓
Question Generation
      ↓
Coverage Check
      ↓
Second Pass if Required
      ↓
Flashcards + Schedule
      ↓
Final Interview Kit
Project Structure
ai-interview-prep-kit/
├── README.md
├── backend/
│   ├── README.md
│   └── src/
├── frontend/
│   ├── README.md
│   └── app/
└── evaluation/
    └── cases.json
Setup
1. Clone
git clone <repository-url>
cd ai-interview-prep-kit
2. Backend
cd backend
npm install
npm run dev

Backend:

http://localhost:5000
3. Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:3000
Environment Variables

Backend .env:

PORT=5000
MONGODB_URI=
JWT_SECRET=
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-20b

Frontend:

NEXT_PUBLIC_API_URL=http://localhost:5000

Do not commit .env files or API keys.

Interview Kit

The generated kit contains:

Company brief
Role requirements
Interview questions
Answer outlines
Flashcards
Preparation schedule
Requirement coverage
Requirement Coverage

Each question is linked to requirement IDs.

The system checks whether extracted requirements are covered by generated questions. Mandatory uncovered requirements trigger an additional generation pass.

Security
JWT-based authentication
Protected routes
User-specific kit access
Environment-based secrets
External URLs treated as untrusted input
Retrieved web content treated as data, not instructions
Testing
cd backend
npm test
Evaluation
npm run evaluate -- --input evaluation/cases.json --output evaluation/kits.json