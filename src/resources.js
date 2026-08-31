/* MERIDIAN · resources
   Every item here is a real, published source, linked with credit and
   never copied. Video ids were verified against search results before
   being written down — none are invented. */
(function(M){
'use strict';

M.VIDEOS = [
  { id:'Rx_RzRcgvlk', city:'london',
    title:'IFRS 9 ECL model — a walkthrough with numbers',
    who:'YouTube', why:'The clearest short run through 12-month versus lifetime ECL with real figures.' },
  { id:'x0OsNn-qm6c', city:'london',
    title:'IFRS 9 impairment and the expected credit loss model',
    who:'YouTube · ACCA-focused', why:'Covers the three stages and what triggers a move between them.' },
  { id:'-lcs5eZ4s30', city:'thimphu', short:true,
    title:'The five Cs of creditworthiness, in one minute',
    who:'YouTube (Short)', why:'A fast refresher. Note it lists the five — our whole point is the order.' },
  { id:'Yi3C9qnwppg', city:'zurich',
    title:'Working capital masterclass — MPBF and the Tandon Committee',
    who:'YouTube', why:'Method I and Method II worked end to end. Aimed at JAIIB/CAIIB candidates.' },
  { id:'-mWUUYEBOzw', city:'zurich',
    title:'MPBF Method II explained for credit managers',
    who:'YouTube', why:'The tighter of the two methods, which forces real promoter contribution.' },
  { id:'2XBxzG1iH2I', city:'mumbai',
    title:'Maximum permissible bank finance — MPBF (Hindi)',
    who:'YouTube', why:'Same material in Hindi, if that reads faster for you.' }
];

M.READING = [
  { t:'Credit risk model validation — PSI, KS and Gini explained', s:'Think360',
    u:'https://think360.ai/in/blogs/credit-risk-model-validation-metrics/', city:'singapore',
    why:'The four validation tests with usable thresholds.' },
  { t:'Credit scorecards: model validation', s:'YOU CANalytics',
    u:'https://ucanalytics.com/blogs/credit-scorecards-model-validation-part-6/', city:'singapore',
    why:'Longer form, worked examples.' },
  { t:'IFRS 9 ECL model — three stages, SICR and thresholds', s:'Quintedge',
    u:'https://quintedge.com/blog/ifrs-9-ecl-model-guide', city:'london',
    why:'The best written summary of what actually triggers Stage 2.' },
  { t:'Point-in-time versus through-the-cycle ratings', s:'Z-Risk Engine',
    u:'https://www.z-riskengine.com/media/ylrpyd2z/point-in-time-versus-through-the-cycle-ratings.pdf', city:'singapore',
    why:'The rating-philosophy question most institutions never answer explicitly.' },
  { t:'Probability of default — the pluses and minuses of transition matrices', s:'GARP',
    u:'https://www.garp.org/risk-intelligence/credit/probability-of-default-the-pluses-and-minuses-of-transition-matrices', city:'saopaulo',
    why:'No good video exists for this. This is the written substitute.' },
  { t:'Credit risk: vintage analysis', s:'ListenData',
    u:'https://www.listendata.com/2019/09/credit-risk-vintage-analysis.html', city:'saopaulo',
    why:'How to build the cohort table from three fields.' },
  { t:'MPBF — formula, methods and working capital guide', s:'DirectCredit',
    u:'https://directcredit.in/blog/understanding-maximum-permissible-bank-finance-mpbf-for-businesses/', city:'zurich',
    why:'All four sizing methods side by side.' },
  { t:'The future of early warning systems in banking', s:'EY',
    u:'https://www.ey.com/en_us/insights/banking-capital-markets/the-future-of-early-warning-systems-in-banking', city:'mumbai',
    why:'Where the three-to-five-month lead time comes from.' },
  { t:'Incorporating physical climate risks into banks’ credit risk models', s:'BIS Working Paper 1274',
    u:'https://www.bis.org/publ/work1274.pdf', city:'punakha',
    why:'The machinery behind the Punakha reveal, properly.' },
  { t:'Impact of climate risk on banks and ECL', s:'EY',
    u:'https://www.ey.com/en_gl/insights/ifrs/impact-of-climate-risk-on-banks-and-ecl', city:'punakha',
    why:'Where physical risk meets the provision.' },
  { t:'Bhutan financial sector stability review, May 2026', s:'IMF',
    u:'https://www.imf.org/-/media/files/publications/tar/2026/english/tarea2026039.pdf', city:'punakha',
    why:'The local context, from the fund’s own review.' },
  { t:'Annual supervision report 2023', s:'Royal Monetary Authority of Bhutan',
    u:'https://www.rma.org.bt/media/Publication/Financial%20Sector%20Performance%20Review/Annual%20Supervision%20Report%202023.pdf', city:'thimphu',
    why:'Your own regulator on concentration and asset quality.' },
  { t:'Agentic AI in lending, 2026', s:'Pennant',
    u:'https://www.pennanttech.com/blog/ai-in-lending-2026-transforming-loan-origination-systems-loan-management-debt-collections/', city:'singapore',
    why:'Where the adoption numbers in the programme came from.' },
  { t:'Tail risk for banks from generative AI', s:'Federal Reserve Bank of Chicago',
    u:'https://www.chicagofed.org/publications/chicago-fed-insights/2026/ai-tail-risk-for-banks', city:'singapore',
    why:'The sober counterweight to the adoption numbers.' }
];

/* Things they can take away. The workbook and the docs already exist —
   the trainer pastes their own share links into `u` once. */
M.DOWNLOADS = [
  { t:'Solo Workbook — haircuts, LGD, the four numbers, self-scoring',
    k:'Google Sheet', u:'https://docs.google.com/spreadsheets/d/1AoocObH7X_2ZOvOkGYn4aMwZ3eBC9K76VXhJYRF-oiE/edit',
    why:'Make a copy. Type only in the cells marked YOUR INPUT.' },
  { t:'Complete curriculum record and knowledge check',
    k:'Google Doc', u:'https://docs.google.com/document/d/1Pohl-ez5NoY9oWqfPVKlXuJ3ZOt24qSttGLbl1xuRuc/edit',
    why:'Everything taught, the coverage audit, and a 37-mark paper with an answer key.' },
  { t:'Advanced reference and twelve-tool spreadsheet pack',
    k:'Google Doc', u:'https://docs.google.com/document/d/1Pz13YvEAeFFupCBBOVG8yqFDOJ_nrrHvpkDvomyvZmk/edit',
    why:'Formulas for every tool, ready to paste into Sheets.' },
  { t:'Solo edition — every activity, one person, no facilitator',
    k:'Google Doc', u:'https://docs.google.com/document/d/1Zd6YRmG5CC63bk-WfAU1VkBrrbZn1QtuSKXBfoBUyik/edit',
    why:'The ten activities with sealed answer keys.' },
  { t:'Online-only, free-only activity pack',
    k:'Google Doc', u:'https://docs.google.com/document/d/1JahY4u_rvyUFe_TPldOA-OlS5THOe2rly0T9gZib8WY/edit',
    why:'If you run this remotely, this is the version that works.' }
];

/* The guide. He appears in the content the way SkyPath's cast does —
   one voice, keyed to a city, saying the thing a person would say. */
M.GUIDE = {
  name:'Mr. Meridian',
  role:'Your guide',
  lines:{
    thimphu:'Everyone lists the five Cs. Almost nobody ranks them. The ranking is the whole argument — put collateral first and you will lend against land to a business that cannot pay.',
    mumbai:'I have never once been shown a credit file that was empty. I have been shown many that were full and still told me nothing. Grade what is in it before you weigh it.',
    singapore:'If nobody has ever overridden your scorecard, nobody believes it. They are managing the inputs instead, and that never shows up in a report.',
    zurich:'Take the valuation. Now ask how long enforcement takes. Discount it. The number you are left with is the one you should have priced against.',
    london:'Stage 2 is not about a missed payment. It is about the day you know more than you did when you lent — and that day usually arrives quietly.',
    saopaulo:'A portfolio number tells you that you are bleeding. A vintage curve tells you which decision cut you, and it has a date on it.',
    punakha:'You asked every question except one. You never asked where it was.'
  }
};

/* Real words from real participants only. Fabricating a testimonial —
   even a plausible one — would be inventing evidence about people who
   can be identified. Add them here once you have them, with permission:
     { t:'…what they said…', by:'Name', role:'Credit officer, RICB' }   */
M.TESTIMONIALS = [];

/* ── Case studies ──────────────────────────────────────────────────────
   Eight public failures, each chosen because it is the lesson of one stop
   happening to real money. They are here to be argued with in a room, not
   read quietly.

   Each names its PRIMARY SOURCE — the inquiry, the regulator's own
   post-mortem, the filing — by title and publisher rather than by a deep
   URL. Inquiry sites reorganise and a rotted link in a teaching pack is
   worse than no link, and a named document survives the reorganisation.
   Use the Perplexity prompt on the Resources page to pull the current
   locations in one go.

   `q` is the question to put to the room. It is deliberately not
   answerable from the summary — that is the point of the exercise. */
M.CASES = [
  { id:'ilfs', n:'IL&FS', where:'India', yr:'2018', city:'singapore',
    what:'An infrastructure financier rated AAA defaulted within weeks of that rating. Ratings had been assigned largely on the assumption of shareholder support from state-linked institutions rather than on the group’s own cash generation, and the group had roughly 350 subsidiaries whose consolidated leverage was not visible from the parent’s accounts.',
    lesson:'A rating is a claim about a future cash flow, not a licence to stop asking. When the rating rests on somebody stepping in, the exposure is to that somebody — and nobody had underwritten them.',
    q:'Find one exposure on your book where the comfort actually comes from a parent, a government or a group. Has anyone assessed that supporter’s capacity, or only their name?',
    src:'Grant Thornton forensic audit of IL&FS Financial Services; Serious Fraud Investigation Office filings; SEBI adjudication orders against the rating agencies (2019–2021).' },

  { id:'carillion', n:'Carillion', where:'United Kingdom', yr:'2018', city:'saopaulo',
    what:'A construction and outsourcing group collapsed with about £29m in cash against roughly £1.3bn of debt. Reported profit had held up while cash conversion deteriorated for years, helped by aggressive recognition on long-term contracts and by reverse factoring that sat in trade payables rather than in borrowings.',
    lesson:'The film, not the photograph. Every single year looked survivable; the trend across years did not. Read the direction of cash, not the level of profit.',
    q:'Take a borrower you renewed this year. Plot operating cash flow against reported profit for four years. Do the two lines move together — and if not, what is the explanation on file?',
    src:'“Carillion”, Joint report of the Business, Energy and Industrial Strategy and Work and Pensions Committees, House of Commons, HC 769, May 2018.' },

  { id:'wirecard', n:'Wirecard', where:'Germany', yr:'2020', city:'mumbai',
    what:'€1.9bn of reported cash held in Asian escrow accounts was found not to exist. Confirmations had been sought from a third-party trustee rather than directly from the banks, and journalists had published detailed allegations for years before the collapse.',
    lesson:'Grading evidence, not collecting it. A file thick with documents is not a file with evidence in it. Who produced this confirmation, and what would it have cost them to produce a false one?',
    q:'Pick a file. Sort every piece of evidence in it by who created it — the borrower, a related party, or an independent third party. How much of the decision rests on the first pile?',
    src:'Final report of the 3rd Committee of Inquiry of the 19th German Bundestag (Wirecard), June 2021; Financial Times “House of Wirecard” investigations, 2015–2020.' },

  { id:'svb', n:'Silicon Valley Bank', where:'United States', yr:'2023', city:'london',
    what:'A bank failed in about 48 hours. The credit book was not the problem: unrealised losses on long-dated securities met a deposit base concentrated in one industry that talked to itself. Supervisors had raised the issues; nothing forced a change in classification.',
    lesson:'The other expected loss. Risk had increased significantly long before anything missed a payment. Staging on arrears alone means moving on the day it is already too late.',
    q:'Name an exposure where you now know something you did not know at origination — and which is still sitting in Stage 1. What specifically is stopping it from moving?',
    src:'“Review of the Federal Reserve’s Supervision and Regulation of Silicon Valley Bank”, Board of Governors of the Federal Reserve System, April 2023; FDIC failed bank information for SVB.' },

  { id:'abraaj', n:'Abraaj Group', where:'United Arab Emirates', yr:'2018', city:'singapore',
    what:'A private equity manager commingled fund money with its own and used it to cover shortfalls. The governance existed on paper; the founder’s standing meant exceptions were granted routinely and recorded as ordinary decisions.',
    lesson:'Judgement, not favour. An override is not wrong in itself — an override that never gets written down as an override is. If nobody can count them, nobody is governing them.',
    q:'How many overrides did your committee grant last quarter? If you cannot answer from a system rather than from memory, that is the finding.',
    src:'US SEC v. Arif Naqvi and Abraaj Investment Management (SDNY, 2019); Dubai Financial Services Authority enforcement notices, 2019–2021.' },

  { id:'evergrande', n:'China Evergrande', where:'China', yr:'2021', city:'zurich',
    what:'A property developer with more than US$300bn of liabilities defaulted. Security was overwhelmingly land and part-built residential stock, in the one market condition — a nationwide property freeze — where none of it could be sold at anything near appraised value.',
    lesson:'The price, and the third the calendar takes. Collateral is only worth what it fetches, on the day you need it, in the market you will actually be selling into. That is usually the worst possible day.',
    q:'Take your largest secured exposure. If you had to realise the security in a market where every comparable lender is selling the same asset class at once, what is the recovery — and how long does it take?',
    src:'China Evergrande Group filings and trading halt announcements, Hong Kong Stock Exchange, 2021–2023; Hong Kong Court of First Instance winding-up order, January 2024.' },

  { id:'yesbank', n:'Yes Bank', where:'India', yr:'2020', city:'london',
    what:'The regulator placed the bank under moratorium. Repeated divergences had been found between the bank’s own reported bad loans and the supervisor’s assessment, and stressed borrowers had been refinanced in ways that kept accounts standard rather than recognising the deterioration.',
    lesson:'Refinancing a borrower who cannot pay does not remove the loss. It moves the date, and it removes the arrears signal you were relying on to see it.',
    q:'Which of last year’s renewals were extended to a borrower whose position was worse than at origination? What changed in the classification when you renewed?',
    src:'Reserve Bank of India, Yes Bank Ltd. (Moratorium) Order and Reconstruction Scheme, March 2020; RBI risk assessment divergence disclosures, 2016–2019.' },

  { id:'greensill', n:'Greensill Capital', where:'United Kingdom / Australia', yr:'2021', city:'thimphu',
    what:'A supply chain finance business collapsed. A large share of the exposure was to a single client group, some receivables financed were prospective rather than actual, and the book relied on trade credit insurance that was withdrawn.',
    lesson:'The five Cs, in order. Capacity and character were the whole story; the structure was elegant and the collateral was insurance that could be cancelled. Rank them wrongly and the structure is what you are left holding.',
    q:'Rank your five largest exposures by concentration to a single ultimate counterparty group. Does that ranking match how the committee talks about them?',
    src:'“Lessons from Greensill Capital”, House of Commons Treasury Committee, HC 151, July 2021; Boardman review of Supply Chain Finance in Government, July 2021.' }
];

})(window.M = window.M || {});
