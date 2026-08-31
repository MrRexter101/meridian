/* MERIDIAN · the Bhutan file
   ────────────────────────────────────────────────────────────────────
   Everything specific to this room, lifted from the Day 1–3 facilitator
   packs. The seven cities teach the general skill; this teaches the
   market the skill is for, and it is the part nobody else's course has.

   Two editorial rules held throughout.

   Numbers carry their vintage. A ratio without a date is unusable in a
   meeting, and several of these are already ageing — the RICB balance
   sheet figures are from 2016 and are marked as such rather than quietly
   dropped, because "we do not have a current number for this" is itself
   a finding.

   The case reveals in the order the room met it. Profile first, then the
   assumptions, then the flags, then the flood. Handing over all four at
   once destroys the only thing that made it work: that they had read the
   file twice before anyone asked where the resort was. */
(function (M) {
'use strict';

M.BHUTAN = {
  market: [
    { v:'~3.1%',      k:'System-wide NPL ratio',        w:'Late 2025. The number the sector quotes about itself.' },
    { v:'>10%',       k:'Transport sector NPL',          w:'The worst-performing sector in the country — and RICB lends into it.' },
    { v:'~10.5%',     k:'Agriculture and livestock NPL', w:'Second worst.' },
    { v:'6.11% → 5.72%', k:'RMA Minimum Lending Rate',   w:'Reduced March 2025, following a cut in India’s policy rate.' },
    { v:'7% – 15%',   k:'Actual commercial lending rates', w:'The spread over the MLR is where the whole pricing argument lives.' },
    { v:'95% / 4% / 11%', k:'SMEs: businesses / GDP / jobs', w:'95% of registered businesses, ~4% of GDP, ~11% of employment.' },
    { v:'25% / 9%',   k:'Small / micro firms with bank finance', w:'Most of the market is invisible to a lender.' },
    { v:'~90%',       k:'Lending requiring collateral',  w:'And only fixed assets qualify.' }
  ],

  trap:
    'Because roughly 90% of lending requires collateral and only fixed assets ' +
    'qualify, a young business without land cannot borrow — however good it is. ' +
    'Two consequences follow, and the second one is the one people forget. ' +
    'Cash-flow lending barely exists in practice, so the muscle for it is ' +
    'under-practised: when collateral does the work, analytical rigour atrophies. ' +
    'And borrowers pushed out of the regulated market do not stop borrowing — they ' +
    'go to unregulated lenders, with forced asset sales and mortgage auctions ' +
    'following. This is not a failing of the people in the room. The market has ' +
    'not required the muscle. That is precisely why it is worth building.',

  reg: [
    { n:'Financial Services Act 2011 / RMA Act 2010', b:'RMA', w:'Licensing and supervision of financial service providers. The outer frame.' },
    { n:'Prudential Regulations 2024', b:'RMA', w:'In force 1 July 2024. Classification of risk exposures and provisioning, plus sectoral measures including housing. The regulatory floor beneath any risk appetite statement.' },
    { n:'Regulations on NPL Management 2025 (REG-001 v2.0)', b:'RMA', w:'NPL classification and resolution.' },
    { n:'Guideline on Risk-Based Solvency and Capital Requirements for Insurance and Reinsurance Companies 2025', b:'RMA', w:'Insurance, investment and operational risk capital; reinsurance counterparty factors.' },
    { n:'Macro Stress Testing Framework 2025', b:'RMA', w:'System-wide stress testing.' },
    { n:'CIB Rules & Regulations 2017', b:'RMA', w:'Credit information sharing.' }
  ],

  cib:
    'Bhutan has a functioning central credit registry, and it does something most ' +
    'registries do not: alongside credit history it captures <strong>collateral ' +
    'information</strong>. In a market where nine loans in ten are secured, that ' +
    'means you can see whether the same asset is already pledged somewhere else. ' +
    'CIB is a company registered under the Companies Act 2016 and is not itself a ' +
    'financial institution. It may release client information only to the RMA, to ' +
    'another agency under law or court order, or to a third party with the data ' +
    'subject’s <strong>written consent</strong> — which makes that consent a ' +
    'due-diligence step with a legal basis, not a formality.',

  ndi:
    'Bhutan NDI launched in 2023, built by Druk Holding and Investments on the W3C ' +
    'Verifiable Credentials model. Citizens hold credentials in a mobile wallet, ' +
    'cryptographically anchored, and can prove an attribute without revealing the ' +
    'underlying data — prove they are over eighteen without disclosing a birth date. ' +
    'The commercial consequence is worth saying in exactly these words: ' +
    '<strong>verification cost collapses, but verification is not assessment.</strong> ' +
    'Knowing with certainty who somebody is tells you nothing about whether their ' +
    'business generates cash. The rail removes a cost. It does not remove the judgement.'
};

/* ── The case ──────────────────────────────────────────────────────── */
M.TASHI = {
  name: 'Tashi Valley Resorts Pvt. Ltd.',
  where: 'Punakha valley, Bhutan',

  profile: [
    'A 24-room riverside resort in the Punakha valley. Incorporated 2017, operating since 2019.',
    'Shareholders: Sonam Tashi (60%), who ran a Thimphu tour operation for nine years; his sister Pema Tashi (40%), a practising doctor who put in start-up capital and takes no part in operations.',
    '34 permanent staff, rising to about 50 in peak season.'
  ],
  request: [
    'Nu 25 million term loan — twelve additional rooms and a spa.',
    'Nu 5 million overdraft — seasonal working capital.'
  ],
  known: [
    'FY2025 turnover Nu 38 million. Average occupancy 54%, concentrated in two peak windows (March–May, September–November).',
    'Existing RICB exposure: a Nu 18 million term loan drawn in 2021. It has been restructured <strong>twice</strong>, most recently in 2024.',
    'Collateral offered: the resort land and buildings, valued at Nu 62 million — by a valuer engaged by the promoter.',
    'The construction contract for the extension has gone to a company owned by Sonam Tashi’s brother.',
    'The annual accounts are prepared and audited by the same firm.',
    'The business cites tourism policy changes since 2022 as the reason for the earlier restructurings.',
    'Sonam Tashi has given a personal guarantee. Pema Tashi has not been asked for one.'
  ],

  /* The three years the room read twice before anybody noticed.

     Two tables, kept apart on purpose. `raw` is what the participants were
     handed — the numbers straight off the accounts, with nothing computed.
     `derived` is the answer key, and every line of it is arithmetic anyone
     could have done in the room. That gap is the whole exercise: the file
     did not hide any of this, it just never did the division. */
  fin: {
    cols: ['FY2023', 'FY2024', 'FY2025'],
    raw: [
      { k:'Revenue',           v:['26.0', '32.0', '38.0'] },
      { k:'Operating profit',  v:['7.8',  '8.0',  '7.6'] },
      { k:'Interest paid',     v:['1.9',  '2.2',  '2.6'] },
      { k:'Principal repaid',  v:['2.4',  '2.6',  '2.8'] },
      { k:'Net profit',        v:['3.5',  '3.2',  '2.1'] },
      { k:'Trade receivables', v:['2.1',  '3.6',  '6.8'] },
      { k:'Trade payables',    v:['1.9',  '2.8',  '4.9'] },
      { k:'Cash at bank',      v:['2.2',  '1.4',  '0.6'] },
      { k:'Total debt',        v:['18.0', '20.0', '23.0'] }
    ],
    unit: 'Nu millions',
    derived: [
      { k:'Cover ratio',     v:['1.81', '1.67', '1.41'],
        w:'Still above the 1.25 policy threshold in every year — so it passes the test every time it is tested. It has fallen every year. The level passes; the trend fails.' },
      { k:'Receivable days', v:['29', '41', '65'],
        w:'The loudest signal in the file. A resort should collect on departure. 65 days means selling to agents on credit and not chasing.' },
      { k:'Payable days',    v:['27', '32', '47'],
        w:'Suppliers are now funding the business.' },
      { k:'Cash vs profit',  v:['—', 'Profit 3.2, cash −0.8', 'Profit 2.1, cash −0.8'],
        w:'Profitable three years running while cash fell from 2.2 to 0.6.' }
    ],
    line: 'Revenue grew 46% over three years. Receivables grew 224%. They are selling more and collecting less, funding the gap from suppliers and from the cash balance — and now they want Nu 30 million to build more rooms. <strong>The extension is not the risk. The collection is.</strong>'
  },

  /* Day 2. Six things the file records as facts. */
  assumptions: [
    'That the Nu 62 million valuation is realistic.',
    'That occupancy is genuinely 54%.',
    'That tourism policy is the real reason for the two restructurings.',
    'That the construction contract is priced at arm’s length.',
    'That Pema Tashi’s 40% is genuinely her own capital.',
    'That the extension will actually generate additional revenue.'
  ],
  assumptionLine:
    'Six major assumptions. The file records none of them as assumptions. It records all six as facts.',

  /* Day 1. Nine planted problems; teams typically found four to six. */
  issues: [
    { n:'Related-party construction contract', w:'The brother’s company builds the extension. Independent quotations; verify pricing at arm’s length. This is where loan proceeds leak, and it is the single most important find.' },
    { n:'Promoter-engaged valuer', w:'The loan-to-value looks comfortable only because of that Nu 62m number. At Nu 62m, total exposure of Nu 48m is <strong>77% LTV</strong> — not comfortable at all once you question it.' },
    { n:'Two prior restructurings', w:'This is not a new borrower with a growth plan. It is a twice-restructured borrower asking to more than double its exposure.' },
    { n:'Auditor independence', w:'The same firm prepares and audits. Common in a small market — but it must be named, and the accounts treated accordingly.' },
    { n:'Key-person concentration', w:'Sonam holds all the operating knowledge. Pema holds 40% and no expertise. Note that RICB itself sells the relevant cover.' },
    { n:'Seasonality against structure', w:'Two peak windows, but the request is a standard term loan. The repayment schedule has to match the cash cycle.' },
    { n:'Demand risk outside the borrower’s control', w:'The stated cause of past distress is external and unresolved. What has actually changed?' },
    { n:'Guarantee asymmetry', w:'The 40% shareholder gives no guarantee. Either she is not a shareholder in substance, or the security is incomplete.' },
    { n:'Occupancy asserted, not evidenced', w:'54% is a management statement. Source it from the booking system.' }
  ],

  /* Day 2. Note the two negatives — the scoring punishes flagging noise. */
  flags: [
    { f:'Receivable days 29 → 41 → 65', c:'ESCALATE NOW', p:2 },
    { f:'Cash falling while profitable', c:'ESCALATE NOW', p:2 },
    { f:'Two prior restructurings', c:'ESCALATE NOW', p:2 },
    { f:'Payable days 27 → 47', c:'CONCERN', p:1 },
    { f:'Cover ratio falling 1.81 → 1.41', c:'CONCERN', p:1 },
    { f:'Net profit falling while revenue rises', c:'CONCERN', p:1 },
    { f:'Related-party construction contract', c:'CONCERN', p:1 },
    { f:'Promoter-engaged valuation', c:'CONCERN', p:1 },
    { f:'Occupancy asserted, not evidenced', c:'WATCH', p:1 },
    { f:'Auditor also prepares the accounts', c:'WATCH', p:1 },
    { f:'Rising interest cost', c:'NOT A FLAG — they borrowed more', p:-1 },
    { f:'Revenue growth of 19%', c:'NOT A FLAG', p:-1 }
  ],

  /* Day 3, 12:35. The reason any of this is remembered. */
  glof: {
    line: 'In three days, across every exercise, not one person asked where the resort is.',
    geo: 'Bhutan’s glaciers are retreating at roughly thirty to sixty metres a decade. The meltwater collects in glacial lakes held back by unstable moraine. Modelling of the Thorthomi lake suggests that if it breached it could discharge a peak flow above sixteen thousand cubic metres per second — within four hours.',
    legs: [
      { n:'Claims', w:'You insure property in that valley. Every policy in the flood path triggers at the same moment.' },
      { n:'Credit', w:'Every borrower downstream stops paying. Not one file — all of them, on the same day.' },
      { n:'Collateral', w:'The security is under water. And so is every comparable valuation you would rely on to recover against it.' }
    ],
    close: 'One event. Three balance-sheet hits. They do not offset each other — they arrive together and they make each other worse. That is correlation, and it is the one risk no single-borrower analysis can ever see, however good the analysis is.',
    admission: 'Every tool built that morning looked at one borrower alone. The scorecard had no factor for geography. The PD was the probability that this borrower fails on its own. Nobody suggested otherwise — including the person teaching it.'
  },

  rule: {
    n: 'The rule the room wrote',
    w: 'On Day 2 the room changed the scoring: a missed flag costs <strong>−2</strong> while a wrong flag costs <strong>−1</strong>. Failing to look is worse than looking and getting it wrong. It survived a stress test in both directions, and it is the scoring model of this whole app, unchanged.'
  }
};

/* The worked example, with the mistake left in on purpose. */
M.EL_EXAMPLE = {
  wrong: 'PD 7% × LGD 45% × EAD Nu 30m = Nu 9,450,000',
  right: 'Nu 945,000',
  w: 'Two percentages multiply to a fraction of a percent, not to a percentage. The decimal place is the whole lesson: an expected loss overstated by a factor of ten declines a facility that should have been written.'
};

})(window.M = window.M || {});
