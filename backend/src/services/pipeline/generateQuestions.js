// backend/src/services/pipeline/generatequestions.js

const { generateText } = require("../llm/client");
const { parseJson } = require("../llm/parseResponse");
const { buildQuestionsPrompt } = require("../llm/prompts");
const { questionSchema } = require("../../schemas/kit.schema");

function categoriesForRequirement(requirement) {
  const kind = String(requirement?.kind || "").toLowerCase();
  const text = String(requirement?.text || "").toLowerCase();

  if (kind === "behavioural") {
    return ["behavioural"];
  }

  if (kind === "domain") {
    return ["company-fit"];
  }

  if (kind === "technical") {
    const categories = ["technical"];

    const systemDesignKeywords = [
      "architecture",
      "api",
      "database",
      "sql",
      "nosql",
      "cloud",
      "aws",
      "azure",
      "gcp",
      "scalability",
      "distributed",
      "microservice",
      "backend",
      "system design",
    ];

    const shouldGenerateSystemDesign =
      systemDesignKeywords.some((keyword) => text.includes(keyword));

    if (shouldGenerateSystemDesign) {
      categories.push("system-design");
    }

    return categories;
  }

  return ["technical"];
}

function normalizeQuestion(question, requirement, category) {
  if (!question || typeof question !== "object") {
    return null;
  }

  const prompt = String(
    question.prompt ??
      question.question ??
      question.text ??
      ""
  ).trim();

  const answerOutline = String(
    question.answer_outline ??
      question.answerOutline ??
      question.answer ??
      ""
  ).trim();

  if (!prompt || !answerOutline) {
    return null;
  }

  const requirementId = String(requirement.id);

  let requirementIds = [];

  if (Array.isArray(question.requirement_ids)) {
    requirementIds = question.requirement_ids.map(String);
  } else if (question.requirement_ids != null) {
    requirementIds = [String(question.requirement_ids)];
  }

  if (!requirementIds.includes(requirementId)) {
    requirementIds.push(requirementId);
  }

  let difficulty = Number(question.difficulty);

  if (!Number.isInteger(difficulty)) {
    difficulty = 1;
  }

  difficulty = Math.min(3, Math.max(1, difficulty));

  return {
    id: "tmp",
    requirement_ids: requirementIds,
    category,
    prompt,
    answer_outline: answerOutline,
    difficulty,
  };
}

function normalizeGeneratedQuestions(data, requirement, category) {
  if (!data || typeof data !== "object") {
    return [];
  }

  if (!Array.isArray(data.questions)) {
    return [];
  }

  const normalized = [];

  for (const question of data.questions) {
    const normalizedQuestion = normalizeQuestion(
      question,
      requirement,
      category
    );

    if (!normalizedQuestion) {
      continue;
    }

    const result = questionSchema.safeParse(normalizedQuestion);

    if (result.success) {
      normalized.push(result.data);
    }
  }

  return normalized;
}

async function generateQuestionsForRequirement({
  requirement,
  role,
  companyBrief,
  companyResearch,
}) {
  const output = [];

  const categories = categoriesForRequirement(requirement);

  for (const category of categories) {
    const prompt = buildQuestionsPrompt({
      requirement,
      role,
      companyBrief,
      companyResearch,
      category,
    });

    let response;

    try {
      response = await generateText({
        systemInstruction:
          "You generate concise interview questions as strict JSON. " +
          "Follow the requested schema exactly.",
        prompt,
        temperature: 0.1,
        maxTokens: 500,
      });
    } catch (error) {
      error.code = error.code || "QUESTION_GENERATION_FAILED";
      throw error;
    }

    let parsed;

    try {
      parsed = parseJson(response);
    } catch (error) {
      const wrapped = new Error(
        `Invalid JSON generated for ${requirement.id}.`
      );

      wrapped.code = "INVALID_QUESTION_JSON";

      wrapped.details = {
        requirementId: requirement.id,
        category,
        responsePreview: String(response || "").slice(0, 500),
        originalError: error.message,
      };

      throw wrapped;
    }

    const questions = normalizeGeneratedQuestions(
      parsed,
      requirement,
      category
    );

    if (questions.length === 0) {
      const error = new Error(
        `No valid questions generated for ${requirement.id}.`
      );

      error.code = "INVALID_QUESTION_JSON";

      error.details = {
        requirementId: requirement.id,
        category,
      };

      throw error;
    }

    // Keep generation deliberately small.
    output.push(questions[0]);
  }

  return output;
}

async function generateQuestions({
  requirements = [],
  role,
  companyBrief,
  companyResearch = [],
}) {
  const output = [];

  for (const requirement of requirements) {
    if (!requirement || !requirement.id || !requirement.text) {
      continue;
    }

    const questions = await generateQuestionsForRequirement({
      requirement,
      role,
      companyBrief,
      companyResearch,
    });

    output.push(...questions);
  }

  return output.map((question, index) => ({
    ...question,
    id: `q${index + 1}`,
  }));
}

module.exports = {
  generateQuestions,
  generateQuestionsForRequirement,
  categoriesForRequirement,
  normalizeGeneratedQuestions,
};