const {
  extractRequirements,
} = require("./extractRequirements");
const {
  researchCompany,
} = require("../retrieval/researchCompany");
const {
  generateCompanyBrief,
} = require("./generateCompanyBrief");
const {
  generateQuestions,
} = require("./generateQuestions");
const {
  normalizeQuestions,
} = require("./normalizeQuestions");
const {
  finalizeKit,
} = require("./finalizeKit");

async function buildInitialKit({
  jd,
  companyUrl,
  days,
  companyName = "",
  location = "",
  allowLocalhost = false,
}) {
  const extracted =
    await extractRequirements(jd);

  const companyResearch =
    await researchCompany(
      companyUrl,
      {
        companyName,
        allowLocalhost,
        maxPages: 6,
      }
    );

  const companyBrief =
    await generateCompanyBrief({
      companyName:
        companyResearch.company,
      companyUrl,
      pages:
        companyResearch.pages,
      interviewResearch:
        companyResearch.interviewResearch,
    });

  const rawQuestions =
    await generateQuestions({
      requirements:
        extracted.requirements,
      role: {
        title:
          extracted.title,
        seniority:
          extracted.seniority,
      },
      companyBrief,
      companyResearch,
    });

  const questions =
    normalizeQuestions(
      rawQuestions
    );

  const initialKit = {
    source: {
      company:
        companyResearch.company,
      company_url:
        companyUrl,
      role:
        extracted.title,
      location,
      jd_chars:
        String(jd).length,
      researched_at:
        new Date().toISOString(),
      pages_used:
        companyResearch.pages.map(
          (page) => page.url
        ),
    },

    company_brief:
      companyBrief,

    role: {
      title:
        extracted.title,
      seniority:
        extracted.seniority,
      responsibilities:
        extracted.responsibilities,
      requirements:
        extracted.requirements,
    },

    questions,

    flashcards: [],

    schedule: {
      days_available: days,
      days: [],
    },

    coverage: {
      uncovered_requirement_ids:
        extracted.requirements.map(
          (requirement) =>
            requirement.id
        ),
      passes: 0,
    },

    research_context: {
      pages:
        companyResearch.pages,
      interviewResearch:
        companyResearch.interviewResearch,
      skippedPages:
        companyResearch.skippedPages,
      robots:
        companyResearch.robots,
      thin_jd:
        extracted.thin_jd,
    },
  };

  return finalizeKit({
    kit: initialKit,
    daysAvailable: days,
  });
}

module.exports = {
  buildInitialKit,
};