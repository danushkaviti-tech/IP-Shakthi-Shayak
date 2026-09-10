export interface LocalizedKnowledgeItem {
  document: string;
  source: string;
  section: string;
  page: string;
  jurisdiction: string;
  ipType: string;
  productType: string;
  content: string;
  highlight: string;
  keywords?: string[];
  sectionCode?: string;
}

export const STATUTORY_KNOWLEDGE_BY_LANGUAGE: Record<string, LocalizedKnowledgeItem[]> = {
  English: [
    {
      document: "The_Patents_Act_1970_Section_3d_Efficacy.txt",
      source: "The Patents Act, 1970 (Section 3(d))",
      section: "Section 3(d) • Therapeutic Efficacy Standard & Derivative Exclusions",
      page: "Patents Act • Section 3(d)",
      jurisdiction: "India",
      ipType: "Patent Law",
      productType: "Pharmaceuticals / Chemical Substances",
      sectionCode: "3d",
      content: "Section 3(d) of the Patents Act, 1970 explicitly prohibits patenting the mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance, or the mere discovery of any new property or new use of a known substance. Salts, esters, ethers, polymorphs, metabolites, pure forms, particle sizes, isomers, complexes, and combinations of known substances are considered the same substance unless they differ significantly in therapeutic efficacy. In Novartis AG v. Union of India (2013), the Supreme Court held that 'efficacy' strictly means demonstrated pharmacological 'therapeutic efficacy'—not merely enhanced thermodynamic stability, solubility, or bioavailability.",
      highlight: "Section 3(d) bars evergreening: derivatives, polymorphs, or salts of known pharmaceutical compounds must prove enhanced therapeutic efficacy (Novartis landmark standard).",
      keywords: ["3(d)", "3d", "section 3(d)", "section 3d", "efficacy", "therapeutic efficacy", "novartis", "evergreening", "polymorph", "salt", "known substance", "derivative", "glivec", "imatinib", "isomers", "bioavailability"],
    },
    {
      document: "The_Patents_Act_1970_Section_3k_Software_AI.txt",
      source: "The Patents Act, 1970 (Section 3(k) & CRI Guidelines)",
      section: "Section 3(k) • Computer-Related Inventions (CRIs), Software & AI",
      page: "Patents Act • Section 3(k)",
      jurisdiction: "India",
      ipType: "Patent Law",
      productType: "Software / AI & Computer Systems",
      sectionCode: "3k",
      content: "Section 3(k) of the Patents Act 1970 excludes 'mathematical methods, business methods, computer programmes per se, or algorithms' from patentability. However, under the IPO CRI Guidelines (2017) and landmark Delhi High Court judgments (Ferid Allani, OpenTV, Microsoft), computer-implemented inventions and Artificial Intelligence (AI) models ARE patentable if they produce a technical effect, solve a technical problem, or provide a technical contribution beyond a mere computer program per se. Patent claims must be anchored in hardware architecture, system processors, or measurable technical improvements.",
      highlight: "Computer programs and AI algorithms are patentable if they provide a technical contribution/effect and are claimed with hardware implementation under CRI guidelines.",
      keywords: ["3(k)", "3k", "section 3(k)", "section 3k", "software", "computer programme", "algorithm", "mathematical method", "business method", "cri", "ferid allani", "artificial intelligence", "ai", "machine learning", "technical effect", "technical contribution"],
    },
    {
      document: "The_Patents_Act_1970_Section_3_Complete_Exclusions.txt",
      source: "The Patents Act, 1970 (Section 3 Statutory Exclusions)",
      section: "Section 3(a)-(p) • Non-Patentable Subject Matter Overview",
      page: "Patents Act • Section 3 Overview",
      jurisdiction: "India",
      ipType: "Patent Law",
      productType: "Statutory Law / Exclusions",
      sectionCode: "3",
      content: "Section 3 of the Indian Patents Act 1970 defines statutory bars: 3(a) frivolous inventions contrary to natural laws; 3(b) inventions contrary to public order or morality; 3(c) scientific principles or discovery of living/non-living things in nature; 3(d) new forms without enhanced therapeutic efficacy; 3(e) mere admixture without synergistic effect; 3(f) mere arrangement of known devices; 3(h) methods of agriculture/horticulture; 3(i) methods of medicinal, surgical, curative, prophylactic, diagnostic, or therapeutic treatment; 3(j) plants and animals in whole/part other than microorganisms; 3(k) software per se and algorithms; 3(l) literary/artistic works; 3(m) mental acts/rules of game; 3(n) presentation of information; 3(o) IC layout topographies; 3(p) traditional knowledge.",
      highlight: "Section 3 defines all 16 non-patentable categories in India, including diagnostic/treatment methods (3(i)), synergistic requirements (3(e)), and software exclusions (3(k)).",
      keywords: ["section 3", "non-patentable", "patent exclusions", "3(a)", "3(b)", "3(c)", "3(e)", "3(f)", "3(h)", "3(i)", "3(j)", "3(l)", "3(m)", "3(n)", "3(o)", "synergy", "mere admixture", "medical treatment", "diagnostic method"],
    },
    {
      document: "The_Patents_Act_1970_Section_3p.txt",
      source: "The Patents Act, 1970 (Section 3(p) & TKDL)",
      section: "Section 3(p) • Traditional Knowledge & Polyherbal Formulations",
      page: "Patents Act • Section 3(p)",
      jurisdiction: "India",
      ipType: "Patent Law",
      productType: "Traditional Knowledge & Herbal Formulations",
      sectionCode: "3p",
      content: "Section 3(p) of the Patents Act, 1970 bars patenting of an invention which in effect is traditional knowledge or an aggregation/duplication of known properties of traditionally known components. For Ayurvedic polyherbal formulations, applicants must demonstrate non-obvious synergistic therapeutic efficacy (with comparative biological trial data) to satisfy Section 3(p) and Section 3(e). Under Biological Diversity Act 2002 Section 6, prior approval from the National Biodiversity Authority (NBA) is mandatory before patent grant.",
      highlight: "Ayurvedic and herbal formulations require experimental proof of synergism under Section 3(p) & 3(e) and mandatory prior approval from NBA.",
      keywords: ["3(p)", "3p", "section 3(p)", "section 3p", "traditional knowledge", "ayurveda", "polyherbal", "tkdl", "synergistic", "herbal formulation", "charaka", "ayush", "biopiracy"],
    },
    {
      document: "The_Patents_Act_1970_Section_2_Novelty_Inventive_Step.txt",
      source: "The Patents Act, 1970 (Section 2(1)(j) & Inventive Step)",
      section: "Section 2(1)(j) & 2(1)(ja) • Novelty, Inventive Step & Industrial Applicability",
      page: "Patents Act • Section 2",
      jurisdiction: "India",
      ipType: "Patent Law",
      productType: "Patentability Criteria",
      sectionCode: "2",
      content: "Under Section 2(1)(j), an invention must be a new product or process involving an inventive step and capable of industrial application. Novelty (Section 2(1)(l)) requires absolute global novelty without anticipation in any prior published document or public use. Inventive step (Section 2(1)(ja)) requires technical advance as compared to existing knowledge or economic significance that makes the invention non-obvious to a Person Skilled in the Art (PSITA) following the Biswanath Prasad Radhey Shyam (1979) and Roche v. Cipla 5-step test.",
      highlight: "Patentability requires absolute global novelty (Sec 2(1)(l)), inventive step non-obvious to PSITA (Sec 2(1)(ja)), and industrial applicability (Sec 2(1)(ac)).",
      keywords: ["novelty", "inventive step", "section 2(1)(j)", "section 2", "psita", "person skilled in the art", "non-obviousness", "prior art", "industrial applicability", "anticipation", "biswanath prasad"],
    },
    {
      document: "The_Patents_Act_1970_Filing_Procedures_Forms.txt",
      source: "The Patents Act, 1970 & Patent Rules, 2003 (Forms & Procedures)",
      section: "Patent Application Filing Procedures, Forms & Specification Drafting",
      page: "Patent Rules • Filing & Prosecution",
      jurisdiction: "India",
      ipType: "Patent Law",
      productType: "Patent Prosecution & Forms",
      content: "Standard Indian patent filing forms include: Form 1 (Application for grant), Form 2 (Provisional or Complete Specification with claims, description, drawings under Section 10; Complete specification must follow provisional within 12 months), Form 3 (Foreign filing statement & undertaking under Section 8), Form 5 (Declaration of Inventorship), Form 9 (Early publication), Form 18 (Request for Examination under Section 11B within 48/31 months), Form 18A (Expedited Examination for Startups, Women, Small Entities), Form 27 (Statement of Commercial Working under Section 146).",
      highlight: "Key patent forms: Form 1 (Application), Form 2 (Specification & Claims), Form 3 (Section 8 foreign filings), Form 18/18A (Examination), Form 27 (Working of Patents).",
      keywords: ["form 1", "form 2", "form 3", "form 5", "form 9", "form 18", "form 18a", "form 27", "specification", "claims drafting", "provisional specification", "complete specification", "section 8", "section 10", "examination request", "patent filing"],
    },
    {
      document: "The_Patents_Act_1970_Section_25_Oppositions.txt",
      source: "The Patents Act, 1970 (Section 25 Oppositions)",
      section: "Section 25(1) Pre-Grant & Section 25(2) Post-Grant Oppositions",
      page: "Patents Act • Section 25",
      jurisdiction: "India",
      ipType: "Patent Law",
      productType: "Patent Oppositions & Litigation",
      sectionCode: "25",
      content: "Section 25 provides dual opposition mechanisms in India: 1. Pre-Grant Opposition (Section 25(1)): Filed by 'any person' in writing after publication until patent grant on grounds of prior publication, prior public knowledge, obviousness, Section 3 exclusions, insufficiency, or Section 8 non-compliance. 2. Post-Grant Opposition (Section 25(2)): Filed ONLY by a 'person interested' within ONE YEAR from publication of patent grant via Form 7, reviewed by an independent Opposition Board.",
      highlight: "Pre-grant opposition can be filed by any person until grant; post-grant opposition must be filed by a person interested within 1 year of grant publication (Section 25).",
      keywords: ["opposition", "pre-grant opposition", "post-grant opposition", "section 25", "section 25(1)", "section 25(2)", "form 7", "person interested", "grounds of opposition", "opposition board", "revocation"],
    },
    {
      document: "The_Patents_Act_1970_Section_48_53_Rights_and_Term.txt",
      source: "The Patents Act, 1970 (Sections 48 & 53)",
      section: "Sections 48 & 53 • Exclusive Rights of Patentee & 20-Year Statutory Term",
      page: "Patents Act • Rights & Term",
      jurisdiction: "India",
      ipType: "Patent Law",
      productType: "Statutory Rights & Maintenance",
      sectionCode: "48",
      content: "Section 48 confers upon the patentee the exclusive right to prevent unauthorized third parties from making, using, offering for sale, selling, or importing the patented product or product obtained directly from a patented process. Section 53 provides that every patent has a term of TWENTY (20) YEARS from the date of filing (or PCT international filing date). Annual renewal fees must be paid from the 3rd year onwards. Safe harbors include Section 107A(a) (Bolar exemption for regulatory approvals) and Section 107A(b) (Parallel imports).",
      highlight: "Patentees enjoy exclusive rights to exclude others under Section 48 for a 20-year term from filing under Section 53, subject to annual maintenance renewal fees.",
      keywords: ["section 48", "section 53", "patent term", "20 years", "rights of patentee", "renewal fees", "patent maintenance", "bolar exemption", "section 107a", "parallel importation", "infringement rights"],
    },
    {
      document: "The_Patents_Act_1970_Section_84_Compulsory_Licensing.txt",
      source: "The Patents Act, 1970 (Section 84 Compulsory Licenses)",
      section: "Section 84 & 92 • Compulsory Licensing Grounds & Public Interest",
      page: "Patents Act • Compulsory Licenses",
      jurisdiction: "India",
      ipType: "Patent Law",
      productType: "Compulsory Licensing & Public Health",
      sectionCode: "84",
      content: "Under Section 84, any person interested can apply for a Compulsory License after 3 YEARS from patent grant on grounds: (a) reasonable public requirements not satisfied, (b) not available at reasonably affordable price, or (c) not worked in India. In Natco v. Bayer (2012) regarding cancer drug Nexavar, the Controller granted India's first compulsory license because Bayer charged ~Rs. 2.8 lakh/month for negligible volume, ordering 6% royalty. Section 92 allows government notification for compulsory licenses during national emergencies.",
      highlight: "Compulsory licensing under Section 84 is available 3 years post-grant for unmet public demand, excessive pricing, or non-working (Natco v. Bayer precedent).",
      keywords: ["compulsory license", "compulsory licensing", "section 84", "section 92", "natco", "bayer", "nexavar", "working of patent", "affordable price", "public interest", "royalty"],
    },
    {
      document: "Patent_Cooperation_Treaty_PCT_National_Phase.txt",
      source: "Patent Cooperation Treaty (PCT) & Indian Patent Rules (Chapter III)",
      section: "PCT International Phase & 31-Month Indian National Phase Entry",
      page: "PCT Guidelines • International & National Phase",
      jurisdiction: "International / India",
      ipType: "Patent Law",
      productType: "International Patent Filings",
      keywords: ["pct", "patent cooperation treaty", "national phase", "international filing", "31 months", "30 months", "wipo", "isr", "wo-isa", "receiving office", "priority date", "rule 20"],
      content: "The PCT system administered by WIPO provides a unified procedure for filing patent applications in over 155 countries. Timeline: Month 0 (Priority date) -> Month 12 (PCT filing deadline) -> Month 16 (International Search Report / ISR & Written Opinion) -> Month 18 (WIPO Publication) -> Month 31 (Indian National Phase Entry deadline under Rule 20 of Patent Rules). The 20-year term of an Indian patent resulting from PCT national phase is calculated from the International PCT Filing Date.",
      highlight: "Indian National Phase entry under PCT must be filed within 31 months from earliest priority date; 20-year patent term runs from international filing date.",
    },
    {
      document: "The_Trademarks_Act_1999_Section_9_Absolute_Grounds.txt",
      source: "The Trade Marks Act, 1999 (Section 9)",
      section: "Section 9 • Absolute Grounds for Refusal & Acquired Distinctiveness",
      page: "Trademarks Act • Section 9",
      jurisdiction: "India",
      ipType: "Trademark Law",
      productType: "Brands, Logos & Trade Dress",
      sectionCode: "9",
      content: "Section 9(1) of the Trade Marks Act 1999 establishes absolute grounds for refusal: 9(1)(a) marks devoid of distinctive character; 9(1)(b) descriptive marks designating kind, quality, quantity, intended purpose, values, or geographical origin; 9(1)(c) customary generic marks. Proviso to Section 9(1) allows registration if the mark has acquired distinctiveness (secondary meaning) through extensive commercial use. Section 9(2) prohibits deceptive marks, marks hurting religious sentiments, scandalous marks, and prohibited emblems.",
      highlight: "Section 9 bars non-distinctive, descriptive, or generic marks unless proven to have acquired distinctiveness (secondary meaning) through commercial use.",
      keywords: ["section 9", "trademark refusal", "absolute grounds", "distinctiveness", "acquired distinctiveness", "secondary meaning", "descriptive mark", "generic mark", "trade mark act 1999"],
    },
    {
      document: "The_Trademarks_Act_1999_Section_11_Relative_Grounds_Opposition.txt",
      source: "The Trade Marks Act, 1999 (Section 11, Section 21 & Renewal)",
      section: "Sections 11 & 21 • Relative Grounds, 4-Month Opposition & 10-Year Renewal",
      page: "Trademarks Act • Sections 11 & 21",
      jurisdiction: "India",
      ipType: "Trademark Law",
      productType: "Trademark Prosecution & Oppositions",
      sectionCode: "11",
      content: "Section 11 sets relative grounds for refusal: identical/similar marks for identical/similar goods creating likelihood of confusion, and well-known trademark protection (Section 11(2) & Rule 124). Following publication in the Trade Marks Journal, Section 21 provides a strict, non-extendable FOUR (4) MONTH window for any person to file a Notice of Opposition on Form TM-O. Under Section 25, registered trademarks are valid for 10 years and renewable indefinitely via Form TM-R.",
      highlight: "Section 11 refuses confusingly similar marks; Section 21 provides a strict 4-month opposition period on Form TM-O; trademarks renew every 10 years (Section 25).",
      keywords: ["section 11", "section 21", "section 25", "relative grounds", "trademark opposition", "notice of opposition", "tm-o", "tm-r", "trademark renewal", "10 years", "well-known trademark", "likelihood of confusion"],
    },
    {
      document: "The_Trademarks_Act_1999_Section_29_Infringement_Passing_Off.txt",
      source: "The Trade Marks Act, 1999 (Section 29 & Passing Off)",
      section: "Section 29 • Trademark Infringement & Common Law Passing Off",
      page: "Trademarks Act • Section 29",
      jurisdiction: "India",
      ipType: "Trademark Law",
      productType: "Enforcement & Litigation",
      sectionCode: "29",
      content: "Section 29 defines statutory trademark infringement: unauthorized commercial use of an identical or deceptively similar mark for registered goods/services causing public confusion, or dilution of well-known marks (Section 29(4)). In contrast, Passing Off (Section 27(2)) is a common law tort protecting unregistered goodwill based on the Classical Trinity test (Reckitt & Colman / Cadila Healthcare): 1. Plaintiff's goodwill/reputation, 2. Misrepresentation by defendant, 3. Likelihood of damage. Remedies include injunctions, damages, Anton Piller seizure orders (Section 135).",
      highlight: "Section 29 remedies statutory infringement of registered marks; Passing Off protects unregistered marks based on goodwill, misrepresentation, and damage.",
      keywords: ["section 29", "trademark infringement", "passing off", "deceptive similarity", "dilution", "cadila healthcare", "injunction", "damages", "anton piller", "goodwill", "misrepresentation"],
    },
    {
      document: "Madrid_Protocol_International_Trademark_Filing.txt",
      source: "Madrid Protocol & Trade Marks Act (Chapter IVA)",
      section: "Madrid Protocol • International Trademark Registration & 5-Year Dependency",
      page: "Madrid Protocol Guidelines",
      jurisdiction: "International / India",
      ipType: "Trademark Law",
      productType: "International Trademark System",
      keywords: ["madrid protocol", "international trademark", "form mm2", "wipo", "office of origin", "basic mark", "5-year dependency", "central attack", "subsequent designation"],
      content: "India acceded to the Madrid Protocol in 2013. Indian brand owners with an existing application or registration in India (the Basic Mark) can file an international trademark application on Form MM2 via the Indian Registry (Office of Origin) designating up to 130+ countries through WIPO. Crucially, under the 5-Year Dependency principle ('Central Attack'), the international registration depends on the basic Indian mark for 5 years; if the basic mark is cancelled within 5 years, the international registration lapses across designated countries.",
      highlight: "Madrid Protocol allows global trademark filing in 130+ countries via Form MM2 based on an Indian basic mark, subject to a 5-year dependency rule.",
    },
    {
      document: "The_Copyright_Act_1957_Section_52_Fair_Dealing.txt",
      source: "The Copyright Act, 1957 (Section 52)",
      section: "Section 52 • Fair Dealing & Statutory Exemptions from Infringement",
      page: "Copyright Act • Section 52",
      jurisdiction: "India",
      ipType: "Copyright Law",
      productType: "Creative Works & Software",
      sectionCode: "52",
      content: "Section 52 of the Copyright Act 1957 details permissible acts not constituting infringement: 1. Fair Dealing (Section 52(1)(a)) for private study/research, criticism/review, reporting current events. 2. Educational reproduction by teachers/pupils (Section 52(1)(i); Oxford University Press v. Rameshwari Photocopy Services coursepack exemption). 3. Software exceptions (Section 52(1)(aa)-(ad)): Making backup copies, reverse engineering for interoperability, observation and testing. 4. Judicial proceedings and accessible format conversions for persons with disabilities.",
      highlight: "Section 52 exempts fair dealing (research, criticism, review, news reporting), educational photocopying (Rameshwari Photocopy case), and software backup/interoperability.",
      keywords: ["section 52", "fair dealing", "fair use", "copyright exemptions", "rameshwari photocopy", "educational use", "criticism", "review", "backup copy", "reverse engineering", "interoperability", "copyright act 1957"],
    },
    {
      document: "The_Copyright_Act_1957_Rights_Ownership_Moral_Rights.txt",
      source: "The Copyright Act, 1957 (Sections 14, 17 & 57)",
      section: "Sections 14, 17 & 57 • Bundle of Rights, First Ownership & Moral Rights",
      page: "Copyright Act • Ownership & Moral Rights",
      jurisdiction: "India",
      ipType: "Copyright Law",
      productType: "Creative, Software & Artistic Works",
      sectionCode: "14",
      content: "Copyright protects original expression under Section 13 for the author's life plus 60 years. Section 14 grants exclusive economic rights (reproduction, public communication, translation, adaptation, software commercial rental). Section 17 dictates first ownership: the author is owner unless created under employment / contract of service (where employer owns copyright). Section 57 confers inalienable Moral Rights on the author (Paternity right of attribution & Integrity right against distortion/mutilation) which survive assignment (Amar Nath Sehgal v. Union of India).",
      highlight: "Protects original works for author's life + 60 years; employers own works made in employment (Sec 17); authors retain perpetual moral rights under Section 57.",
      keywords: ["section 14", "section 17", "section 57", "moral rights", "paternity right", "integrity right", "first owner", "work for hire", "contract of service", "amar nath sehgal", "author life plus 60 years"],
    },
    {
      document: "The_Designs_Act_2000_Registration_and_Piracy.txt",
      source: "The Designs Act, 2000",
      section: "Sections 4, 11 & 22 • Design Registration Criteria, Term & Piracy Remedies",
      page: "Designs Act • Registration & Piracy",
      jurisdiction: "India",
      ipType: "Industrial Design",
      productType: "Product Aesthetics & 3D Shapes",
      sectionCode: "designs",
      content: "The Designs Act 2000 protects non-functional aesthetic features of shape, configuration, pattern, or ornament applied to articles by industrial process (judged solely by the eye; Section 2(d)). Section 4 bars non-new, previously published, or non-distinguishable designs. India follows Locarno Classification (Classes 1-32). Section 11 provides a 10-year initial term extendable by 5 years (15 years total). Section 22 provides civil remedies for piracy of registered designs (injunctions and statutory damages up to Rs. 50,000 per violation).",
      highlight: "Protects novel ornamental shape/pattern for 10+5 years (15 years max) across Locarno Classes 1-32; Section 22 penalizes design piracy.",
      keywords: ["designs act 2000", "industrial design", "locarno classification", "section 4", "section 11", "section 22", "piracy of design", "aesthetic shape", "15 years", "form 3 design"],
    },
    {
      document: "Geographical_Indications_Herbal_Formulations_Manual.txt",
      source: "Geographical Indications of Goods Act, 1999",
      section: "Section 2(1)(e) & Section 9 • GI Registration & Authorized User Protection",
      page: "GI Act • Registration & Protection",
      jurisdiction: "India",
      ipType: "Geographical Indications",
      productType: "Agricultural, Natural & Handicraft Goods",
      sectionCode: "gi",
      content: "The GI Act 1999 protects goods originating in a specific territory where quality, reputation, or other characteristic is essentially attributable to geographic origin (e.g. Darjeeling Tea, Basmati Rice, Kancheepuram Silk). Registered by associations of producers. Under Section 17, individual producers register as Authorized Users. GI registration is valid for 10 years and renewable perpetually. GI rights are public community property and cannot be assigned, licensed, or mortgaged.",
      highlight: "Protects place-specific quality/reputation (e.g. Darjeeling tea) for 10-year renewable terms; non-transferable community rights for authorized users.",
      keywords: ["geographical indication", "gi tag", "gi act 1999", "authorized user", "darjeeling tea", "basmati", "place of origin", "community right", "section 2(1)(e)"],
    },
    {
      document: "Biological_Diversity_Act_2002_NBA_Clearance.txt",
      source: "Biological Diversity Act, 2002",
      section: "Section 6 • Mandatory Prior Approval from National Biodiversity Authority (NBA)",
      page: "Biodiversity Act • NBA Approval",
      jurisdiction: "India",
      ipType: "Biodiversity & Benefit Sharing",
      productType: "Biological Resources & Derivatives",
      sectionCode: "nba",
      content: "Under Section 6 of the Biological Diversity Act, 2002, any person applying for any intellectual property right in or outside India for an invention based on biological resources or associated traditional knowledge obtained from India MUST obtain prior approval from the National Biodiversity Authority (NBA; Form III) before grant of patent. Non-compliance renders patent applications liable to revocation under Section 25/64 and criminal penalties under Section 55.",
      highlight: "Mandatory requirement to obtain prior NBA approval (Form III) before grant of any patent based on Indian biological resources or traditional knowledge.",
      keywords: ["nba", "biological diversity act", "biodiversity", "biological resources", "section 6", "access and benefit sharing", "abs", "form iii", "national biodiversity authority"],
    },
    {
      document: "Protection_of_Plant_Varieties_and_Farmers_Rights_Act_2001.txt",
      source: "Protection of Plant Varieties & Farmers' Rights (PPV&FR) Act, 2001",
      section: "DUS Criteria, Farmers' Rights & Benefit Sharing",
      page: "PPV&FR Act • Plant Varieties",
      jurisdiction: "India",
      ipType: "Plant Variety Protection",
      productType: "Agricultural & Plant Varieties",
      sectionCode: "ppvfr",
      content: "The PPV&FR Act 2001 provides sui generis protection for new, extant, and farmers' plant varieties satisfying DUS criteria (Distinctness, Uniformity, Stability, Novelty). Section 39 guarantees Farmers' Rights: farmers can save, use, sow, re-sow, exchange, or sell farm produce including seeds of protected varieties (except branded packaged seeds). Section 26 enables benefit-sharing for tribal/farming communities via the National Gene Fund.",
      highlight: "Protects plant varieties meeting DUS criteria while safeguarding farmers' customary rights to save/exchange seeds under Section 39.",
      keywords: ["plant variety", "ppv&fr", "ppvfr", "dus criteria", "farmers rights", "seeds", "breeders rights", "national gene fund", "distinctness", "uniformity", "stability"],
    },
    {
      document: "Trade_Secrets_and_Confidential_Information_India.txt",
      source: "Trade Secrets & Confidentiality Law in India (Common Law & Contract Act)",
      section: "Common Law Breach of Confidence & Section 27 Indian Contract Act",
      page: "Trade Secrets • Protection & Remedies",
      jurisdiction: "India",
      ipType: "Trade Secrets",
      productType: "Proprietary Know-How & Algorithms",
      sectionCode: "tradesecret",
      content: "In India, trade secrets are protected under Common Law Breach of Confidence and Contract Law (NDAs). Post-employment non-compete clauses are void under Section 27 of the Indian Contract Act 1872 (Niranjan Golikari / Percept D'Mark). However, confidentiality and non-disclosure obligations regarding proprietary trade secrets, algorithms, and client data remain PERPETUALLY enforceable post-employment (John Richard Brady precedent). Remedies include permanent injunctions and Anton Piller search orders.",
      highlight: "Trade secrets are protected via NDAs and breach of confidence; confidentiality obligations remain perpetually enforceable even though non-competes are void under Section 27.",
      keywords: ["trade secret", "confidential information", "nda", "non-disclosure", "section 27", "breach of confidence", "proprietary know-how", "non-compete", "john richard brady"],
    },
  ],
};

// Mirror English entries to other languages with localized terminology
const OTHER_LANGUAGES = [
  "Telugu",
  "Hindi",
  "Tamil",
  "Kannada",
  "Sanskrit",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Malayalam",
  "Spanish",
  "French",
  "German",
];

// Initialize multi-lingual mapping from English master list
for (const lang of OTHER_LANGUAGES) {
  STATUTORY_KNOWLEDGE_BY_LANGUAGE[lang] = STATUTORY_KNOWLEDGE_BY_LANGUAGE.English.map((item) => ({
    ...item,
    jurisdiction: lang === "German" ? "Indien" : lang === "French" ? "Inde" : lang === "Spanish" ? "India" : item.jurisdiction,
  }));
}

/**
 * Intelligent, fine-grained statutory knowledge retrieval.
 * Uses exact section detection, entity matching, and weighted term relevance.
 */
export function getLocalizedStatutoryKnowledge(language = "English", query = ""): LocalizedKnowledgeItem[] {
  const list = STATUTORY_KNOWLEDGE_BY_LANGUAGE[language] || STATUTORY_KNOWLEDGE_BY_LANGUAGE["English"] || [];

  if (!query || !query.trim()) {
    return list;
  }

  const normalizedQuery = query.toLowerCase().replace(/[^\w\s\(\)\-\.]/g, " ");
  const queryTokens = normalizedQuery.split(/\s+/).filter((t) => t.length >= 2);

  // Stop words that should NOT trigger false positive matches
  const stopWords = new Set([
    "what", "is", "the", "are", "for", "and", "under", "in", "of", "to", "how", "can", "tell", "explain",
    "me", "about", "give", "detailed", "information", "with", "does", "any", "from", "act", "india", "law",
    "indian", "section", "please", "rules", "provise", "state", "which",
  ]);

  const scored = list.map((item) => {
    let score = 0;
    const lowerDoc = item.document.toLowerCase();
    const lowerSection = item.section.toLowerCase();
    const lowerContent = item.content.toLowerCase();
    const sectionCode = item.sectionCode;

    // 1. Precise Section Code Matching
    if (sectionCode) {
      if (sectionCode === "3d" && (normalizedQuery.includes("3(d)") || normalizedQuery.includes("3d") || normalizedQuery.includes("novartis") || normalizedQuery.includes("efficacy") || normalizedQuery.includes("evergreening"))) {
        score += 120;
      } else if (sectionCode === "3k" && (normalizedQuery.includes("3(k)") || normalizedQuery.includes("3k") || normalizedQuery.includes("software") || normalizedQuery.includes("algorithm") || normalizedQuery.includes("computer prog") || normalizedQuery.includes("cri"))) {
        score += 120;
      } else if (sectionCode === "3p" && (normalizedQuery.includes("3(p)") || normalizedQuery.includes("3p") || normalizedQuery.includes("traditional knowledge") || normalizedQuery.includes("ayurved") || normalizedQuery.includes("tkdl"))) {
        score += 120;
      } else if (sectionCode === "9" && (normalizedQuery.includes("section 9") || normalizedQuery.includes("absolute grounds") || normalizedQuery.includes("distinctiveness") || normalizedQuery.includes("descriptive mark"))) {
        score += 120;
      } else if (sectionCode === "11" && (normalizedQuery.includes("section 11") || normalizedQuery.includes("relative grounds") || normalizedQuery.includes("likelihood of confusion") || normalizedQuery.includes("section 21") || normalizedQuery.includes("tm-o") || normalizedQuery.includes("opposition"))) {
        score += 120;
      } else if (sectionCode === "29" && (normalizedQuery.includes("section 29") || normalizedQuery.includes("infringement") || normalizedQuery.includes("passing off") || normalizedQuery.includes("deceptive similarity"))) {
        score += 120;
      } else if (sectionCode === "52" && (normalizedQuery.includes("section 52") || normalizedQuery.includes("fair dealing") || normalizedQuery.includes("fair use") || normalizedQuery.includes("photocopy") || normalizedQuery.includes("educational"))) {
        score += 120;
      } else if (sectionCode === "14" && (normalizedQuery.includes("moral rights") || normalizedQuery.includes("section 57") || normalizedQuery.includes("section 14") || normalizedQuery.includes("section 17") || normalizedQuery.includes("work for hire") || normalizedQuery.includes("author life"))) {
        score += 120;
      } else if (sectionCode === "25" && (normalizedQuery.includes("pre-grant") || normalizedQuery.includes("post-grant") || normalizedQuery.includes("section 25") || normalizedQuery.includes("patent opposition"))) {
        score += 120;
      } else if (sectionCode === "48" && (normalizedQuery.includes("section 48") || normalizedQuery.includes("section 53") || normalizedQuery.includes("patent term") || normalizedQuery.includes("20 years") || normalizedQuery.includes("renewal fees"))) {
        score += 120;
      } else if (sectionCode === "84" && (normalizedQuery.includes("section 84") || normalizedQuery.includes("compulsory licen") || normalizedQuery.includes("natco") || normalizedQuery.includes("section 92"))) {
        score += 120;
      } else if (sectionCode === "nba" && (normalizedQuery.includes("nba") || normalizedQuery.includes("biodiversity") || normalizedQuery.includes("biological diversity") || normalizedQuery.includes("benefit sharing"))) {
        score += 120;
      } else if (sectionCode === "designs" && (normalizedQuery.includes("design") || normalizedQuery.includes("locarno") || normalizedQuery.includes("piracy of design"))) {
        score += 110;
      } else if (sectionCode === "gi" && (normalizedQuery.includes("gi tag") || normalizedQuery.includes("geographical indication") || normalizedQuery.includes("darjeeling"))) {
        score += 110;
      } else if (sectionCode === "ppvfr" && (normalizedQuery.includes("plant") || normalizedQuery.includes("ppvfr") || normalizedQuery.includes("dus") || normalizedQuery.includes("farmers right"))) {
        score += 110;
      } else if (sectionCode === "tradesecret" && (normalizedQuery.includes("trade secret") || normalizedQuery.includes("confidential") || normalizedQuery.includes("nda") || normalizedQuery.includes("non-disclosure"))) {
        score += 110;
      }
    }

    // 2. Exact keyword list matching
    if (item.keywords) {
      for (const kw of item.keywords) {
        const lowerKw = kw.toLowerCase();
        if (normalizedQuery.includes(lowerKw)) {
          score += 35;
        }
      }
    }

    // 3. Meaningful token matching
    for (const token of queryTokens) {
      if (stopWords.has(token)) continue;
      if (lowerDoc.includes(token)) score += 15;
      if (lowerSection.includes(token)) score += 12;
      if (lowerContent.includes(token)) score += 4;
    }

    // 4. Mismatch Penalty: If the user specifically asks for 3(d) or 3(k), penalize 3(p)
    if (sectionCode === "3p" && (normalizedQuery.includes("3(d)") || normalizedQuery.includes("3d") || normalizedQuery.includes("3(k)") || normalizedQuery.includes("3k") || normalizedQuery.includes("novartis") || normalizedQuery.includes("software"))) {
      score -= 80;
    }
    if (sectionCode === "3d" && (normalizedQuery.includes("3(p)") || normalizedQuery.includes("3p") || normalizedQuery.includes("traditional knowledge") || normalizedQuery.includes("ayurveda"))) {
      score -= 80;
    }

    return { item, score };
  });

  const matched = scored.filter((s) => s.score >= 30);
  matched.sort((a, b) => b.score - a.score);
  return matched.map((s) => s.item);
}

export function getAllLocalizedStatutoryDocs(): Record<string, LocalizedKnowledgeItem> {
  const map: Record<string, LocalizedKnowledgeItem> = {};
  for (const lang of Object.keys(STATUTORY_KNOWLEDGE_BY_LANGUAGE)) {
    for (const item of STATUTORY_KNOWLEDGE_BY_LANGUAGE[lang]) {
      map[item.document] = item;
      const base = item.document.replace(/\.[^/.]+$/, "");
      map[base] = item;
      map[item.source] = item;
      map[item.section] = item;
    }
  }
  return map;
}

export function findLocalizedStatutoryDoc(docName: string): LocalizedKnowledgeItem | undefined {
  if (!docName) return undefined;
  const map = getAllLocalizedStatutoryDocs();
  if (map[docName]) return map[docName];
  const decoded = decodeURIComponent(docName).trim();
  if (map[decoded]) return map[decoded];
  const base = decoded.replace(/\.[^/.]+$/, "");
  if (map[base]) return map[base];

  const lower = decoded.toLowerCase();
  for (const [key, value] of Object.entries(map)) {
    if (key.toLowerCase() === lower || key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
      return value;
    }
  }
  return undefined;
}
