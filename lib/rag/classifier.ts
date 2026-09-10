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
  } else if (q.includes("wipo") || q.includes("pct") || q.includes("madrid") || q.includes("international")) {
    jurisdiction = "International";
  }

  let ipType = "General IP / Legal Guidance";
  if (q.includes("patent") || q.includes("invent") || q.includes("3(d)") || q.includes("3d") || q.includes("3(k)") || q.includes("3(p)") || q.includes("prior art") || q.includes("claim") || q.includes("specification")) {
    ipType = "Patent Law";
  } else if (q.includes("trademark") || q.includes("brand") || q.includes("logo") || q.includes("section 9") || q.includes("section 11") || q.includes("passing off") || q.includes("trade mark")) {
    ipType = "Trademark Law";
  } else if (q.includes("copyright") || q.includes("literary") || q.includes("fair dealing") || q.includes("section 52") || q.includes("moral rights") || q.includes("music") || q.includes("source code")) {
    ipType = "Copyright Law";
  } else if (q.includes("geographical indication") || q.includes("gi tag") || q.includes("gi registration") || q.includes("geographical")) {
    ipType = "Geographical Indications";
  } else if (q.includes("design") || q.includes("industrial design") || q.includes("locarno")) {
    ipType = "Industrial Designs";
  } else if (q.includes("trade secret") || q.includes("confidential") || q.includes("nda") || q.includes("non-disclosure") || q.includes("know-how")) {
    ipType = "Trade Secrets";
  } else if (q.includes("plant") || q.includes("variety") || q.includes("crop") || q.includes("ppvfr") || q.includes("dus")) {
    ipType = "Plant Variety Protection";
  } else if (q.includes("biodiversity") || q.includes("nba") || q.includes("biological resource") || q.includes("abs")) {
    ipType = "Biodiversity & Benefit Sharing";
  } else if (q.includes("tkdl") || q.includes("traditional knowledge") || q.includes("ayurved") || q.includes("charaka") || q.includes("sushruta")) {
    ipType = "Traditional Knowledge";
  }

  let productType = "General / Document Content";
  if (q.includes("ayurved") || q.includes("charaka") || q.includes("sushruta") || q.includes("herbal") || q.includes("triphala") || q.includes("ashwagandha")) {
    productType = "Ayurvedic Formulation";
  } else if (q.includes("medicine") || q.includes("drug") || q.includes("pharma") || q.includes("tablet") || q.includes("syrup") || q.includes("molecule") || q.includes("novartis")) {
    productType = "Pharmaceutical & Medicine";
  } else if (q.includes("food") || q.includes("diet") || q.includes("nutraceutical") || q.includes("tea")) {
    productType = "Food & Nutraceutical";
  } else if (q.includes("cosmetic") || q.includes("cream") || q.includes("oil") || q.includes("hair") || q.includes("skin")) {
    productType = "Cosmetic";
  } else if (q.includes("plant") || q.includes("herb") || q.includes("extract") || q.includes("seed")) {
    productType = "Plant & Biological";
  } else if (q.includes("software") || q.includes("code") || q.includes("app") || q.includes("tech") || q.includes("ai") || q.includes("algorithm")) {
    productType = "Software / AI & Technology";
  }

  let purpose = "Document & IP Analysis";
  if (q.includes("prior art") || q.includes("novelty") || q.includes("anticipation") || q.includes("search")) {
    purpose = "Prior Art Search";
  } else if (q.includes("licens") || q.includes("ayush") || q.includes("compliance") || q.includes("regulatory") || q.includes("gmp")) {
    purpose = "Regulatory Compliance";
  } else if (q.includes("abs") || q.includes("biodiversity") || q.includes("nba")) {
    purpose = "ABS Compliance";
  } else if (q.includes("infring") || q.includes("litigat") || q.includes("lawsuit") || q.includes("court") || q.includes("passing off")) {
    purpose = "Infringement & Litigation";
  } else if (q.includes("filing") || q.includes("register") || q.includes("apply") || q.includes("application") || q.includes("form")) {
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