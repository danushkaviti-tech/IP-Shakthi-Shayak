export type QuestionClassification = {
  jurisdiction: string;
  ipType: string;
  productType: string;
  purpose: string;
  language: string;
};

export function classifyQuestion(
  question: string
): QuestionClassification {
  const q = (question || "").toLowerCase().trim();

  let jurisdiction = "India";
  if (q.includes("uspto") || q.includes("united states") || q.includes("usa") || q.includes("america")) {
    jurisdiction = "USA";
  } else if (q.includes("epo") || q.includes("europe") || q.includes("european")) {
    jurisdiction = "EU";
  } else if (q.includes("wipo") || q.includes("pct") || q.includes("international")) {
    jurisdiction = "International";
  }

  let ipType = "Patent";
  if (q.includes("trademark") || q.includes("brand") || q.includes("logo") || q.includes("mark")) {
    ipType = "Trademark";
  } else if (
    q.includes("geographical indication") ||
    q.includes("gi tag") ||
    q.includes("gi registration") ||
    q.includes("geographical")
  ) {
    ipType = "GI";
  } else if (q.includes("copyright") || q.includes("literary") || q.includes("software code")) {
    ipType = "Copyright";
  } else if (
    q.includes("trade secret") ||
    q.includes("confidential") ||
    q.includes("nda") ||
    q.includes("non-disclosure")
  ) {
    ipType = "Trade Secret";
  } else if (
    q.includes("tkdl") ||
    q.includes("traditional knowledge") ||
    q.includes("ayurved") ||
    q.includes("charaka") ||
    q.includes("sushruta")
  ) {
    ipType = "Traditional Knowledge";
  } else if (q.includes("design") || q.includes("industrial design")) {
    ipType = "Design";
  } else if (q.includes("plant") || q.includes("variety") || q.includes("crop")) {
    ipType = "Plant Variety";
  }

  let productType = "General / Document Content";
  if (q.includes("ayurved") || q.includes("charaka") || q.includes("sushruta") || q.includes("herbal") || q.includes("triphala") || q.includes("ashwagandha")) {
    productType = "Ayurvedic Formulation";
  } else if (q.includes("medicine") || q.includes("drug") || q.includes("pharma") || q.includes("tablet") || q.includes("syrup")) {
    productType = "Pharmaceutical & Medicine";
  } else if (q.includes("food") || q.includes("diet") || q.includes("nutraceutical") || q.includes("tea")) {
    productType = "Food & Nutraceutical";
  } else if (q.includes("cosmetic") || q.includes("cream") || q.includes("oil") || q.includes("hair") || q.includes("skin")) {
    productType = "Cosmetic";
  } else if (q.includes("plant") || q.includes("herb") || q.includes("extract")) {
    productType = "Plant & Biological";
  } else if (q.includes("software") || q.includes("code") || q.includes("app") || q.includes("tech") || q.includes("ai")) {
    productType = "Software / Technology";
  }

  let purpose = "Document & IP Analysis";
  if (q.includes("prior art") || q.includes("novelty") || q.includes("anticipation") || q.includes("search")) {
    purpose = "Prior Art Search";
  } else if (q.includes("licens") || q.includes("ayush") || q.includes("compliance") || q.includes("regulatory") || q.includes("gmp")) {
    purpose = "Regulatory Compliance";
  } else if (q.includes("abs") || q.includes("biodiversity") || q.includes("nba")) {
    purpose = "ABS Compliance";
  } else if (q.includes("infring") || q.includes("litigat") || q.includes("lawsuit") || q.includes("court")) {
    purpose = "Infringement & Litigation";
  } else if (q.includes("filing") || q.includes("register") || q.includes("apply") || q.includes("application")) {
    purpose = "Registration & Filing";
  }

  return {
    jurisdiction,
    ipType,
    productType,
    purpose,
    language: "English",
  };
}