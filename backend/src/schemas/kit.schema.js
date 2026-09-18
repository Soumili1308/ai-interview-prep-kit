const { z } = require("zod");

const requirementSchema =
  z.object({
    id: z.string().min(1),
    text: z.string().min(1),
    kind: z.enum([
      "technical",
      "behavioural",
      "domain",
    ]),
    priority: z.enum([
      "must",
      "nice",
    ]),
  });

const roleSchema =
  z.object({
    title: z.string(),
    seniority: z.string(),
    responsibilities:
      z.array(z.string()),
    requirements:
      z.array(requirementSchema),
  });

const sourceSchema =
  z.object({
    company: z.string(),
    company_url: z.string().url(),
    role: z.string(),
    location: z.string(),
    jd_chars:
      z.number().int().nonnegative(),
    researched_at: z.string(),
    pages_used:
      z.array(z.string().url()),
  });

const companyBriefSchema =
  z.object({
    summary: z.string(),
    what_they_do: z.string(),
    sources: z.array(
      z.string().url()
    ),
  });

const questionSchema =
  z.object({
    id: z.string().min(1),
    requirement_ids:
      z.array(z.string().min(1))
        .min(1),
    category: z.enum([
      "technical",
      "behavioural",
      "system-design",
      "company-fit",
    ]),
    prompt: z.string().min(1),
    answer_outline:
      z.string().min(1),
    difficulty:
      z.number().int().min(1).max(3),
  });

const flashcardSchema =
  z.object({
    id: z.string().min(1),
    front: z.string().min(1),
    back: z.string().min(1),
    requirement_ids:
      z.array(z.string().min(1))
        .min(1),
  });

const scheduleDaySchema =
  z.object({
    day: z.number().int().positive(),
    focus: z.string(),
    question_ids:
      z.array(z.string()),
    minutes:
      z.number().int().nonnegative(),
  });

const scheduleSchema =
  z.object({
    days_available:
      z.number().int().min(1).max(60),
    days: z.array(scheduleDaySchema),
  });

const coverageSchema =
  z.object({
    uncovered_requirement_ids:
      z.array(z.string()),
    passes:
      z.number().int().nonnegative(),
  });

const kitSchema =
  z.object({
    source: sourceSchema,
    company_brief:
      companyBriefSchema,
    role: roleSchema,
    questions:
      z.array(questionSchema),
    flashcards:
      z.array(flashcardSchema),
    schedule: scheduleSchema,
    coverage: coverageSchema,
  });

const extractRequirementsRequestSchema =
  z.object({
    body: z.object({
      jd: z.string()
        .trim()
        .min(1),
    }),
    params: z.object({}),
    query: z.object({}),
  });

const researchCompanyRequestSchema =
  z.object({
    companyUrl: z.string()
      .url()
      .max(2048),
    companyName: z.string()
      .trim()
      .min(1)
      .max(200)
      .optional(),
  });

const buildKitRequestSchema =
  z.object({
    jd: z.string()
      .trim()
      .min(1)
      .max(30000),
    companyUrl: z.string()
      .url()
      .max(2048),
    days: z.number()
      .int()
      .min(1)
      .max(60),
    companyName: z.string()
      .trim()
      .min(1)
      .max(200)
      .optional(),
    location: z.string()
      .trim()
      .max(200)
      .optional()
      .default(""),
  });

const updateQuestionSchema =
  z.object({
    prompt: z.string()
      .trim()
      .min(1),
    answer_outline:
      z.string()
        .trim()
        .min(1),
    difficulty:
      z.number().int().min(1).max(3),
    category: z.enum([
      "technical",
      "behavioural",
      "system-design",
      "company-fit",
    ]),
  });

const updateFlashcardSchema =
  z.object({
    front: z.string().trim().min(1),
    back: z.string().trim().min(1),
  });

const updateBriefSchema =
  z.object({
    summary: z.string().trim().min(1),
    what_they_do:
      z.string().trim().min(1),
    sources: z.array(z.string().url()),
  });

const reorderQuestionsSchema =
  z.object({
    question_ids:
      z.array(z.string().min(1))
        .min(0),
  });

const pinItemSchema =
  z.object({
    pinned: z.boolean(),
  });

module.exports = {
  requirementSchema,
  roleSchema,
  sourceSchema,
  companyBriefSchema,
  questionSchema,
  flashcardSchema,
  scheduleDaySchema,
  scheduleSchema,
  coverageSchema,
  kitSchema,
  extractRequirementsRequestSchema,
  researchCompanyRequestSchema,
  buildKitRequestSchema,
  updateQuestionSchema,
  updateFlashcardSchema,
  updateBriefSchema,
  reorderQuestionsSchema,
  pinItemSchema,
};