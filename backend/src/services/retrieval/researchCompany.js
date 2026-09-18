const {
  crawlSite,
} = require("./crawlSite");

const {
  searchInterviewInfo,
} = require("./searchInterviewInfo");

function deriveCompanyName(
  companyUrl
) {
  try {
    return new URL(companyUrl)
      .hostname
      .replace(/^www\./, "")
      .split(".")[0];
  } catch {
    return "";
  }
}

async function researchCompany(
  companyUrl,
  {
    companyName = "",
    allowLocalhost = false,
    maxPages = 6,
  } = {}
) {
  const company =
    companyName?.trim() ||
    deriveCompanyName(companyUrl);

  let crawl;

  try {
    crawl = await crawlSite(
      companyUrl,
      {
        allowLocalhost,
        maxPages,
      }
    );
  } catch (error) {
    return {
      company,
      company_url: companyUrl,
      pages: [],
      skippedPages: [
        {
          url: companyUrl,
          reason:
            error.code ||
            "COMPANY_RESEARCH_FAILED",
          message:
            error.message ||
            "Company site could not be researched.",
        },
      ],
      robots: {
        checked: false,
      },
      interviewResearch: {
        available: false,
        reason:
          "COMPANY_SITE_UNAVAILABLE",
        results: [],
      },
    };
  }

  let interviewResearch;

  try {
    interviewResearch =
      await searchInterviewInfo(
        company
      );
  } catch (error) {
    interviewResearch = {
      available: false,
      reason:
        error.code ||
        "PUBLIC_SEARCH_FAILED",
      results: [],
    };
  }

  return {
    company,
    company_url: companyUrl,
    pages: crawl.pages,
    skippedPages: crawl.skipped,
    robots: {
      checked: true,
      robotsChecked:
        crawl.robots_checked,
    },
    interviewResearch,
  };
}

module.exports = {
  researchCompany,
};