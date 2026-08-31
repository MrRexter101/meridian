/* MERIDIAN · content · seven cities */
(function(M){
'use strict';
/* ───────── 3. CONTENT — seven cities ───────── */
M.CITIES = [
{
 id:'thimphu', city:'Thimphu', country:'Bhutan', mins:9,
 title:'The two questions, and the order of the five',
 blurb:'Every credit decision reduces to two questions. The five Cs answer them — but only in the right order.',
 hook:'Rank the five Cs wrongly and you will approve a loan that a good business cannot repay, secured on land you cannot sell.',
 body:[
  {h:'Everything reduces to two questions', p:['A lender asks two things and nothing else. <strong>Will they repay?</strong> And <strong>what happens if they do not?</strong>','Every ratio, every covenant, every valuation report exists to answer one or the other. If an analysis does not, it is decoration.']},
  {h:'The five Cs, ranked', p:['Most training lists them. The advanced move is to <strong>rank</strong> them — because the ranking is the argument.'],
   table:{head:['#','C','The question','Why it sits there'],rows:[
    ['1','Capacity','Can the business generate the cash to repay?','Always first. Nothing else matters if the money is not there.'],
    ['2','Character','Will they repay when it becomes inconvenient?','Behaviour and track record. Never impression.'],
    ['3','Capital','How much of their own money is at risk?','Whether they fight for the business or walk away.'],
    ['4','Conditions','What is happening in their sector?','Outside their control and yours — so it belongs in a limit.'],
    ['5','Collateral','What do we recover when all of the above fails?','Last.']]}},
  {h:'The inversion', quote:'Collateral is the parachute. It is not the aeroplane.',
   p:['A market that requires collateral in roughly nine cases out of ten, and accepts only fixed assets, has put the fifth C first.','That inversion is not a detail of local practice. <strong>It is precisely the gap the neobanks attacked</strong> — Fi, Jupiter, Revolut — by pricing behaviour instead of land.']}
 ],
 worked:{h:'Where the case begins', p:'Tashi Valley Resorts Pvt. Ltd. — a 24-room riverside resort, incorporated 2017, trading since 2019. Sonam Tashi holds 60% with nine years in tour operations; Pema Tashi holds 40% as capital only, and has given no guarantee. They want Nu 25m term plus a Nu 5m overdraft for twelve rooms and a spa. There is already a Nu 18m term loan from 2021, <strong>restructured twice</strong>. Security is land and buildings at Nu 62m — valued by the promoter&rsquo;s own valuer.'},
 check:{q:'Which of these are evidence of <strong>Capacity</strong> — the first C — rather than of another C?',
  opts:[
   {t:'The three-year trend in debt service cover', ok:true, why:'Capacity is cash available against cash owed.'},
   {t:'The Nu 62m land and buildings valuation', ok:false, why:'That is Collateral — the fifth C, and the last one.'},
   {t:'Seasonal occupancy and when the cash actually arrives', ok:true, why:'Capacity is about timing as much as amount.'},
   {t:'Sonam&rsquo;s nine years in tour operations', ok:false, why:'That is Character — relevant, but second.'},
   {t:'Operating cash flow against the new repayment schedule', ok:true, why:'The core Capacity test.'}]}
},
{
 id:'mumbai', city:'Mumbai', country:'India', mins:11,
 title:'Grading evidence, not collecting it',
 blurb:'A credit file is not a pile of documents. It is a set of claims of wildly different weight — and one of those piles is your actual risk.',
 hook:'Your file is full. That is not the same as your file being true.',
 body:[
  {h:'Four kinds of thing in every file', p:['Analysts are trained to gather evidence. The advanced skill is to <strong>grade</strong> it.'],
   table:{head:['Colour','Type','What it is','Weight'],rows:[
    ['Yellow','TOLD','The borrower asserted it','Zero until corroborated. A claim, not a fact.'],
    ['Green','VERIFIED','Confirmed by an independent source','Full weight. This is what a credit file is made of.'],
    ['Orange','OBSERVED','Behaviour you can see in your own records','High — and it moves earliest.'],
    ['Pink','ASSUMED','Nobody said it, nobody checked','This is your actual risk.']]}},
  {h:'Why the pink pile is the dangerous one', quote:'Your pink pile is your credit risk.',
   p:['Told, verified and observed are all <em>written down</em>. Somebody can challenge them.','An assumption was never written down, so <strong>nobody can challenge it — including you.</strong> It sits in the file behaving exactly like a fact.']},
  {h:'Profit is an opinion. Cash is a fact.', p:['Profit is recorded when a sale is <strong>made</strong>. Cash arrives when it is <strong>collected</strong>. The gap between those two moments is where businesses die.'],
   table:{head:['#','Number','Formula','What it reveals'],rows:[
    ['1','Cover ratio','Operating profit ÷ (interest + principal)','Below 1.25 is tight; below 1.0 they are paying you from elsewhere'],
    ['2','Receivable days','(Receivables ÷ Revenue) × 365','Rising = sales booked but not banked'],
    ['3','Payable days','(Payables ÷ Revenue) × 365','Rising = suppliers are funding the business'],
    ['4','Profit vs cash','Profit against the change in cash balance','Profit up, cash down is the most reliable early warning there is']]}},
  {h:'A number, and a trend', quote:'A number tells you where they are. A trend tells you where they are going. Only one of those is useful to a lender.'}
 ],
 worked:{h:'Tashi Valley, three years', p:'Revenue 26.0 → 32.0 → 38.0, up 46%. Cover ratio 1.81 → 1.67 → <strong>1.41</strong>. Receivable days 29 → 41 → <strong>65</strong>. Payable days 27 → 32 → 47. Cash at bank 2.2 → 1.4 → <strong>0.6</strong> — while profitable throughout. <strong>Every level passes policy. Every trend fails.</strong>'},
 check:{q:'Six things in this file are <strong>ASSUMED</strong> — nobody stated them and nobody checked. Which of these are among them?',
  opts:[
   {t:'That the related-party construction contract is arm&rsquo;s-length', ok:true, why:'Never stated, never tested. Pure assumption.'},
   {t:'That the 40% shareholding is genuinely Pema&rsquo;s own capital', ok:true, why:'Assumed. And it decides whether Capital is real.'},
   {t:'That revenue was Nu 38m in FY2025', ok:false, why:'That is TOLD — it is in the accounts the borrower supplied.'},
   {t:'That the extension will generate revenue', ok:true, why:'The entire basis of the request, and nobody has tested it.'},
   {t:'That the facility was restructured twice', ok:false, why:'That is OBSERVED — it is in your own records.'}]}
},
{
 id:'singapore', city:'Singapore', country:'Singapore', mins:12,
 title:'What a rating is, and what hangs off it',
 blurb:'A grade is not an opinion about a borrower. It is the input to four separate decisions that break together.',
 hook:'An override with no written reason is not a judgement. It is a favour.',
 body:[
  {h:'One question, four consequences', p:['A rating answers exactly one question: <strong>how likely is this borrower to stop paying?</strong>','Four things then hang off it — <strong>the price, the provision, the limit and the authority</strong>. Get the grade wrong and all four are wrong in the same direction, at the same time.']},
  {h:'Three ways to build one', p:['<strong>Judgemental</strong> — fast, inconsistent, unauditable. <strong>Statistical</strong> — consistent, but it needs years of clean default data most institutions do not have. <strong>Hybrid</strong> — a structured scorecard with a logged human override.','At RICB&rsquo;s size the hybrid is the honest answer, and the override log is what makes it honest.']},
  {h:'The override rate is the diagnostic',
   table:{head:['Rate','What it actually means'],rows:[
    ['0%','Nobody believes it. They are gaming the inputs instead, and the grade is fiction.'],
    ['5–15%, documented','A scorecard that is alive. Each override improves the next version.'],
    ['30% or more','Not a system. Decoration with a spreadsheet attached.']]},
   p:['The dangerous case is not the override. It is the <strong>override disguised as an input</strong> — re-entering turnover using the projection instead of the actuals. That never appears in an override rate, because it was never recorded as one.']},
  {h:'Choose what the grade means', p:['<strong>Point-in-time</strong> grades answer "how likely is default in the next twelve months, given today". They move a lot, and they downgrade an entire book at once in a downturn.','<strong>Through-the-cycle</strong> grades average across a cycle. They are stable — and they will be the last to tell you a borrower is deteriorating.','Every real model sits somewhere between. What matters is that you <strong>chose</strong>, and can say which.']},
  {h:'And how you know it works', p:['Four tests, all of which run in a spreadsheet: <strong>discrimination</strong> (Gini, workable above ~0.40), <strong>separation</strong> (KS, strong above ~40), <strong>calibration</strong> (does grade B default at the rate grade B claims?), and <strong>stability</strong> (PSI — below 0.10 stable, above 0.25 rebuild).'],
   quote:'Rank ordering is the only test you cannot argue with. If grade C defaults less than grade B, nothing else you measure matters.'}
 ],
 worked:{h:'Grading Tashi Valley', p:'Capacity is falling but positive. Character shows two restructurings. Capital is 40% of unverified origin. Conditions are seasonal and policy-exposed. Collateral is large and independently unverified. <strong>A defensible grade is C — and the interesting question is what an officer would have to write down to move it to A.</strong>'},
 check:{q:'Which of these statements about a credit rating system are <strong>true</strong>?',
  opts:[
   {t:'A 5–15% override rate with written reasons is a sign of health', ok:true, why:'It means people use it and argue with it.'},
   {t:'Zero overrides means the scorecard is trusted', ok:false, why:'It almost always means the inputs are being managed instead.'},
   {t:'Grade C must default more often than grade B, always', ok:true, why:'Rank ordering. Its failure is unarguable.'},
   {t:'The rating philosophy — point-in-time or through-the-cycle — is a deliberate choice', ok:true, why:'And most institutions never make it explicitly.'},
   {t:'A very high diagonal on a transition matrix proves borrowers are stable', ok:false, why:'It usually proves nobody is re-grading them.'}]}
},
{
 id:'zurich', city:'Zurich', country:'Switzerland', mins:12,
 title:'The price, and the third the calendar takes',
 blurb:'Expected loss is three letters and one multiplication. The reason it is hard is that one of the three is a lie you told yourself about collateral.',
 hook:'If your price does not cover expected loss, you are not taking risk. You are donating — and you will not find out for three years.',
 body:[
  {h:'Expected Loss = PD × LGD × EAD',
   table:{head:['Term','Meaning','Where it comes from'],rows:[
    ['PD','Probability of default','Your grade'],
    ['LGD','Loss given default','Your security'],
    ['EAD','Exposure at default','The facility']]},
   p:['The multiplication is trivial. <strong>LGD is where the work is</strong>, because it is the only one that depends on a number somebody else was paid to produce.']},
  {h:'A valuation is not protection', p:['Take an assessed value. Apply a <strong>haircut</strong>. Apply a <strong>realisation probability</strong>. Subtract <strong>enforcement cost</strong>. Then discount for <strong>time</strong>.'],
   table:{head:['Security','Indicative haircut','Why'],rows:[
    ['Cash under lien','0%','Immediate'],
    ['Listed securities','20–30%','The price moves against you exactly when you need to sell'],
    ['Urban commercial property','25–40%','A market exists, but forced sale discounts'],
    ['Rural, single-use property','50–70%','Who else wants a 24-room resort in one particular valley?'],
    ['Plant and machinery','60–80%','The second-hand market is thin to nonexistent'],
    ['Unsupported personal guarantee','90–100%','Comfort, not security']]}},
  {h:'And then the calendar', quote:'Nu 30m recovered in four years at 10% is worth Nu 20.5m today. The delay took a third, and no valuation report mentions it.'},
  {h:'The five-component price', p:['Cost of funds (~5.7%) + expected loss + operating cost (~1.0%) + capital charge (~1.5%) + margin (~1.5%).','<strong>Only the margin is genuinely negotiable.</strong> When a relationship manager negotiates the price, they are negotiating the last component and pretending it is the first.']}
 ],
 worked:{h:'Two runs on the same file', p:'<strong>Run A — take the promoter&rsquo;s Nu 62m at face value.</strong> You expect to recover more, so LGD falls to about 30% and the price comes out near <span class="num">11.80%</span>.<br><br><strong>Run B — commission an independent valuation and apply a rural haircut.</strong> LGD rises to about 45% and the price is <span class="num">12.85%</span>.<br><br>The difference is <span class="num">105 basis points</span> and it is not a pricing decision. <strong>It is a decision about whose number you believed.</strong>'},
 check:{q:'A facility has PD 4%, LGD 40%, EAD Nu 20m. Cost of funds 5.7%, operating cost 1.0%, capital charge 1.5%, margin 1.5%. Which of these are <strong>correct</strong>?',
  opts:[
   {t:'Expected loss is Nu 320,000', ok:true, why:'4% × 40% × Nu 20m.'},
   {t:'Expected loss is 1.60% of exposure', ok:true, why:'320,000 ÷ 20m.'},
   {t:'The price should be 11.30%', ok:true, why:'5.7 + 1.6 + 1.0 + 1.5 + 1.5.'},
   {t:'Expected loss is Nu 800,000', ok:false, why:'That is PD × EAD — LGD was dropped.'},
   {t:'The cost of funds is the negotiable component', ok:false, why:'The margin is. Cost of funds is given to you.'}]}
},
{
 id:'london', city:'London', country:'United Kingdom', mins:13,
 title:'The other expected loss',
 blurb:'You already know PD × LGD × EAD for pricing. Accounting uses the same three letters for provisioning, and it is not the same calculation.',
 hook:'Stage 2 is not a payment problem. It is a knowledge problem — the day you know more than you did when you lent.',
 body:[
  {h:'Three stages',
   table:{head:['Stage','Trigger','Provision','Interest on'],rows:[
    ['Stage 1','Credit risk has not increased significantly since origination','12-month ECL','Gross carrying amount'],
    ['Stage 2','A significant increase in credit risk — SICR','<strong>Lifetime ECL</strong>','Gross carrying amount'],
    ['Stage 3','Credit-impaired — default has occurred','Lifetime ECL','<strong>Net</strong> carrying amount']]}},
  {h:'The cliff', p:['Moving from Stage 1 to Stage 2 replaces a twelve-month loss with a <strong>lifetime</strong> loss. On a seven-year facility that can multiply the provision several times over <strong>in a single quarter, with no payment missed.</strong>','Stage 2 is where the P&amp;L pain lives, and it is triggered by judgement rather than by an event.']},
  {h:'SICR has no threshold, deliberately', p:['IFRS 9 does not define one. Practice combines three things:'],
   list:['<strong>A relative PD test</strong> — PD now against PD at origination, often around a 2× multiple, with a material absolute increase','<strong>The 30-days-past-due backstop</strong> — a rebuttable presumption, and the one everybody actually relies on','<strong>Qualitative triggers</strong> — watchlist, forbearance, restructuring, covenant breach']},
  {h:'Why this matters more than it sounds', p:['You were taught expected loss for <strong>pricing</strong>. This is expected loss for <strong>provisioning</strong>. Conflating them does not produce a rounding error — it produces a misstated provision.']}
 ],
 worked:{h:'Tashi Valley is Stage 2 today', p:'Days past due: <strong>zero</strong>. Every instalment has been paid. And the facility has been <strong>restructured twice</strong>, with cover falling 1.81 → 1.41.<br><br>Forbearance is a qualitative SICR trigger on its own. This exposure moves to lifetime ECL while the credit file still reads <em>performing</em>. <strong>Nothing about the borrower changed on the day that happened. Only what you knew changed.</strong>'},
 check:{q:'Which of these would move an exposure to <strong>Stage 2</strong>?',
  opts:[
   {t:'Restructured twice, never missed a payment', ok:true, why:'Forbearance is a qualitative trigger on its own.'},
   {t:'Auditor resigned, accounts nine months late, payments current', ok:true, why:'You have lost the ability to assess. Lost information is increased risk.'},
   {t:'PD has roughly doubled since origination', ok:true, why:'The relative PD test.'},
   {t:'Default has already occurred', ok:false, why:'That is Stage 3, not Stage 2.'},
   {t:'The sector is in recession; this borrower is so far unaffected', ok:false, why:'Stage 1 with a watchlist entry. Sector stress alone is not borrower-specific SICR.'}]}
},
{
 id:'saopaulo', city:'São Paulo', country:'Brazil', mins:11,
 title:'The film, not the photograph',
 blurb:'A default rate tells you that you are bleeding. Two other views tell you which decision cut you, and when.',
 hook:'You do not lose money when a good borrower defaults. You lose it when a good borrower slowly becomes a bad one and nobody re-graded them.',
 body:[
  {h:'Migration', p:['A grade is a photograph. A <strong>transition matrix</strong> is the film — the historical probability that a borrower graded A this year is graded A, B, C, D or default next year.'],
   list:['<strong>The diagonal is stability.</strong> Above about 95%, it usually means grades are not being refreshed rather than that borrowers are steady.','<strong>Everything below the diagonal is your downgrade rate.</strong> Sum it, and watch it quarter on quarter — it turns months before your default rate does.','<strong>Multi-year risk comes from multiplying it.</strong> Two-year transition is the matrix times itself. That is the honest answer to why a longer loan costs more.']},
  {h:'Vintage', p:['Group every loan by the quarter it was <strong>originated</strong>, track each cohort by months-on-book, then read <em>down</em> a column.'],
   table:{head:['Originated','MOB 6','MOB 12','MOB 18','MOB 24'],rows:[
    ['2023 Q1','0.4%','1.1%','1.8%','2.2%'],
    ['2023 Q3','0.5%','1.3%','2.0%','2.5%'],
    ['2024 Q1','0.9%','<strong>2.4%</strong>','3.6%','—'],
    ['2024 Q3','<strong>1.4%</strong>','<strong>3.1%</strong>','—','—']]},
   p:['The MOB 12 column runs 1.1 → 1.3 → 2.4 → 3.1. At the <strong>same age of loan</strong>, newer cohorts perform worse. Because the comparison holds age constant, it has already removed the economy from the picture.']},
  {h:'Which means the cause is internal', quote:'The economy is the excuse. The vintage curve is the evidence.',
   p:['Go and find what changed in 2024 Q1 — an annual target, a delegated-authority increase, a new product, a departed credit officer, a competitor you loosened to match.','<strong>Three fields build this: origination date, arrears status, balance.</strong> No model, no statistician, no default history.']}
 ],
 worked:{h:'What it would show on this file', p:'Tashi Valley was originated in 2021 and restructured twice. In a vintage view, restructured facilities are the cohort that stops showing arrears — because restructuring resets the clock. <strong>A portfolio that restructures freely will show a beautiful vintage curve and a deteriorating book at the same time.</strong>'},
 check:{q:'Which of these readings are <strong>sound</strong>?',
  opts:[
   {t:'Compare the same months-on-book column down the cohorts', ok:true, why:'Holding age constant is the whole method.'},
   {t:'A rising MOB-12 column across newer cohorts points at underwriting, not the economy', ok:true, why:'Age is held constant, so the cycle is already out.'},
   {t:'Everything below the diagonal of a transition matrix is your downgrade rate', ok:true, why:'And it turns before the default rate does.'},
   {t:'A vintage curve mainly measures the economic cycle', ok:false, why:'It is constructed specifically to remove it.'},
   {t:'A 96% diagonal means the portfolio is stable', ok:false, why:'It usually means nobody has re-graded anyone.'}]}
},
{
 id:'punakha', city:'Punakha', country:'Bhutan', mins:10, final:true,
 title:'Nobody asked where it was',
 blurb:'Six cities of analysis, and one question was never asked on any of them.',
 hook:'Diversification is a claim about correlation. If you have never measured the correlation, you do not have diversification — you have a hope.',
 body:[
  {h:'The question nobody asked', p:['Across every calculation on this file — the five Cs, the evidence grade, the rating, the price, the provision, the portfolio view — <strong>nobody asked where the resort was.</strong>','Tashi Valley Resorts is in the Punakha valley, on the river.']},
  {h:'What that means here', p:['Bhutan&rsquo;s glaciers retreat roughly 30–60 metres per decade. Modelling of Thorthomi lake suggests a breach could discharge above 16,000 m³ per second within four hours.'],
   table:{head:['Leg','What happens in that hour'],rows:[
    ['Claims','Every policy in the flood path triggers at the same moment'],
    ['Credit','Every borrower downstream stops paying — all of them, the same day'],
    ['Collateral','The security is under water, and so is every comparable valuation you would recover against']]},
   quote:'One event. Three balance-sheet hits. They do not offset each other — they make each other worse.'},
  {h:'Why an insurer-lender has it worse than a bank', p:['A bank has one leg exposed. <strong>You have two, and they fire from the same event.</strong> Reinsurance protects the claims leg. Nothing protects the credit leg, and the collateral you were relying on is a fourth casualty rather than a mitigant.','Four loans in four different sectors in one valley are <strong>one exposure, not four</strong>. Geography does not diversify.']},
  {h:'The control costs nothing', p:['Capture a geographic tag on every exposure. Not an address — a <strong>valley, river basin or dzongkhag code</strong>.','Without it the concentration cannot be measured at all. That is not the same as it being small.'],
   quote:'Every tool you built is blind in the same direction — which by your own rule is a −2.'}
 ],
 worked:{h:'The number to take back', p:'For one river basin, add the credit exposure and the sum insured on the same assets. Express it as a percentage of capital.<br><br><strong>Nobody at RICB has seen that number, because nobody has ever added the two books together.</strong> It is a <code>SUMIF</code> and an afternoon.'},
 check:{q:'Which of these are <strong>true</strong> of correlated exposure?',
  opts:[
   {t:'Four loans in one valley are one exposure, not four', ok:true, why:'Geography does not diversify.'},
   {t:'In a basin-wide event the collateral is a fourth casualty, not a mitigant', ok:true, why:'Comparable valuations collapse alongside the asset.'},
   {t:'The claims leg and the credit leg fire from the same event and do not offset', ok:true, why:'They compound. That is the insurer-lender problem.'},
   {t:'Reinsurance protects both the claims leg and the credit leg', ok:false, why:'It protects one. Nothing protects the other.'},
   {t:'Lending across four different sectors in one valley is diversification', ok:false, why:'Sector diversification does not survive a geographic event.'}]}
}
];

M.AWARDS = [
 {id:'a1', n:'Parachute, Not Aeroplane', d:'Ranked the five Cs and put collateral last.', city:'thimphu'},
 {id:'a2', n:'Your Pink Pile',           d:'Separated what you were told from what you assumed.', city:'mumbai'},
 {id:'a3', n:'Judgement, Not Favour',    d:'Learned to spot an override hidden as an input.', city:'singapore'},
 {id:'a4', n:'The Calendar Took a Third',d:'Priced a facility on recovery, not on a valuation.', city:'zurich'},
 {id:'a5', n:'Stage 2, No Missed Payment',d:'Staged an exposure on knowledge rather than on arrears.', city:'london'},
 {id:'a6', n:'Which Quarter Cut You',    d:'Read a vintage curve and found the decision, not the cycle.', city:'saopaulo'},
 {id:'a7', n:'Nobody Asked Where It Was',d:'Finished the tour. Closed the loop on the valley.', city:'punakha'},
 {id:'a8', n:'Seven Days at the Desk',   d:'A seven-day check-in streak.', streak:7},
 {id:'a9', n:'The Monday Question',      d:'Named a real unverified assumption on a real file.', note:true}
];
})(window.M = window.M || {});
