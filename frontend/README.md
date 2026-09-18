# 3. FRONTEND → `frontend/README.md`

**Purpose:** Only explain **the UI/frontend**.

Copy this:

```markdown
# Frontend

Frontend application for the AI Interview Prep Kit.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Responsibilities

The frontend provides:

- Registration
- Login
- Dashboard
- Kit creation
- Generation status
- Company brief
- Requirements
- Interview questions
- Flashcards
- Preparation schedule
- Coverage results
- Practice mode
- Logout

## Structure

```text
frontend/
├── app/
├── components/
├── lib/
├── public/
├── package.json
└── tsconfig.json
Environment Variable
NEXT_PUBLIC_API_URL=http://localhost:5000

The frontend does not contain the Groq API key.

Run
npm install
npm run dev

Frontend:

http://localhost:3000
User Flow
Login
 ↓
Dashboard
 ↓
Create Kit
 ↓
Enter Job Details
 ↓
Generate
 ↓
View Interview Kit
 ↓
Practice
Main UI Sections
Dashboard

Displays the user's interview kits.

Create Kit

Collects company, role, job description and preparation information.

Interview Kit

Displays:

Company brief
Requirements
Questions
Answer outlines
Flashcards
Schedule
Coverage
Practice Mode

Allows users to practice generated interview questions and review answer outlines.

API Communication

The frontend communicates with the backend API for:

Authentication
Kit creation
Kit generation
Kit retrieval
Kit updates
Kit deletion

AI requests are handled by the backend.

Build
npm run build
Production
npm start
Security

Private API credentials are kept on the backend.