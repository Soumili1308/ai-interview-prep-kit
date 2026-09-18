const {
  generateText,
} = require("../llm/client");
const {
  parseJson,
} = require("../llm/parseResponse");
const {
  buildFlashcardsPrompt,
} = require("../llm/prompts");
const {
  flashcardSchema,
} = require("../../schemas/kit.schema");

async function generateFlashcards({
  requirements,
  questions,
  companyBrief,
}) {
  const response =
    await generateText({
      systemInstruction:
        "Create concise interview flashcards from supplied data only. Never invent company facts.",
      prompt:
        buildFlashcardsPrompt({
          requirements,
          questions,
          companyBrief,
        }),
      temperature: 0.2,
    });

  const data = parseJson(response);

  if (
    !data ||
    !Array.isArray(data.flashcards)
  ) {
    const error = new Error(
      "LLM returned incomplete flashcards."
    );

    error.statusCode = 502;
    error.code =
      "INCOMPLETE_FLASHCARD_JSON";

    throw error;
  }

  const requirementIds = new Set(
    requirements.map(
      (requirement) => requirement.id
    )
  );

  const flashcards = [];

  for (
    let index = 0;
    index < data.flashcards.length;
    index += 1
  ) {
    const flashcard =
      data.flashcards[index];

    const ids =
      Array.isArray(
        flashcard.requirement_ids
      )
        ? flashcard.requirement_ids.filter(
            (id) =>
              requirementIds.has(id)
          )
        : [];

    const item = {
      id: `f${index + 1}`,
      front: String(
        flashcard.front || ""
      ).trim(),
      back: String(
        flashcard.back || ""
      ).trim(),
      requirement_ids: ids,
    };

    const validation =
      flashcardSchema.safeParse(item);

    if (!validation.success) {
      const error = new Error(
        "Invalid generated flashcard."
      );

      error.statusCode = 502;
      error.code =
        "INVALID_FLASHCARD_JSON";
      error.details =
        validation.error.issues;

      throw error;
    }

    flashcards.push(validation.data);
  }

  return flashcards;
}

module.exports = {
  generateFlashcards,
};