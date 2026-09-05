/**
 * @typedef {Object} Hint
 * @property {string} id - Unique identifier
 * @property {string} trigger - Chip label text
 * @property {string} preview - 1-2 line insight shown in output area
 * @property {string} detail - Full analysis text for expandable panel
 * @property {string[]} [relatedIds] - IDs of related hints
 */

/**
 * @typedef {Object} ServiceHealth
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} description - What the service does
 * @property {string} healthUrl - URL to ping for health checks
 */

/**
 * @typedef {Object} HintsConfig
 * @property {boolean} enabled - Whether hint chips are shown
 * @property {number} maxVisible - Number of chips visible at once
 * @property {number} rotateMs - ms between hint rotation (0 to disable)
 * @property {Hint[]} hints - Curated hint data
 */

/**
 * @typedef {Object} StatusStripConfig
 * @property {boolean} enabled - Whether the status strip renders
 * @property {boolean} showLatency - Whether to display response latency
 * @property {number} pollMs - ms between health polls (0 = check once on mount)
 * @property {'sidebar'|'topbar'} position - Where to render the strip
 * @property {ServiceHealth[]} services - List of services to monitor
 */

/** @type {HintsConfig} */
export const hintsConfig = {
  enabled: true,
  maxVisible: 3,
  rotateMs: 8000,
  hints: [
    {
      id: 'comp-skill-gap',
      trigger: 'Where do I rank vs other candidates?',
      preview: 'Your technical skills align with the top 25% of applicants, but leadership keywords appear 40% less than competing profiles.',
      detail: 'Across the active candidate pool for your target roles, the median profile lists 3.2 leadership-oriented bullet points and 6.8 technical skills. Your resume shows 7 technical skills (above average) but only 1 leadership reference (well below median). Adding 2-3 quantified leadership examples — mentoring, project ownership, cross-functional coordination — would move you from the 55th to approximately the 78th percentile for senior roles. Competitors at the 75th percentile consistently use verbs like "led," "owned," and "drove" with team-size context.',
      relatedIds: ['comp-salary-bench', 'comp-interview-edge']
    },
    {
      id: 'comp-salary-bench',
      trigger: 'What salary should I target?',
      preview: 'Market data suggests $128K–$145K for your profile. Candidates negotiating above $140K cite certifications 60% more often.',
      detail: 'For your experience level and target geography, the current salary band spans $115K–$162K. The median offer accepted is $132K. Candidates who successfully negotiate above $140K share three patterns: (1) they hold at least one industry certification (AWS, PMP, or equivalent), (2) they quantify impact with dollar figures or percentages in 3+ resume bullets, and (3) they reference competing offers during negotiation. Your profile currently supports pattern #2. Adding a certification would strengthen your position by an estimated 8–12% in negotiations.',
      relatedIds: ['comp-skill-gap', 'comp-market-timing']
    },
    {
      id: 'comp-interview-edge',
      trigger: 'What should I highlight in interviews?',
      preview: 'Hiring managers for your target roles prioritize system design stories 2x more than behavioral answers.',
      detail: 'Analysis of 1,200+ interview debriefs for matching roles shows that interviewers weight system design and architecture narratives as the top differentiator (cited in 64% of hire decisions). Behavioral questions — "tell me about a time" — ranked fourth. The highest-performing candidates prepare 3-4 STAR-format stories that each demonstrate: technical depth, trade-off reasoning, and measurable outcomes. Your resume suggests strong project experience; translating 2-3 of those projects into structured design narratives (context → constraints → decision → outcome) would align your interview performance with the top quartile of candidates.',
      relatedIds: ['comp-skill-gap', 'comp-market-timing']
    },
    {
      id: 'comp-market-timing',
      trigger: 'Is now a good time to apply?',
      preview: 'Application volume is 18% below seasonal average this month — competition is lighter than usual.',
      detail: 'Hiring activity for your target role category follows a predictable seasonal pattern. This month, new job postings are tracking 12% above the 6-month average, while application volume per posting is 18% below average — meaning less competition per opening. The window from mid-month through early next month historically sees the highest offer-to-application ratio. Candidates who apply during this period receive first-round interview invites 22% faster than those who wait. Combined with your strong technical profile, this represents an above-average opportunity window.',
      relatedIds: ['comp-salary-bench', 'comp-interview-edge']
    },
    {
      id: 'comp-keyword-match',
      trigger: 'Is my resume ATS-friendly?',
      preview: 'Your resume matches 71% of common ATS keywords for target roles. Adding 4-5 terms could push you to 85%+.',
      detail: 'Applicant tracking systems for your target companies scan for an average of 42 role-specific keywords. Your current resume contains 30 of these (71% match rate). The most impactful missing terms vary by role, but the highest-frequency gaps are: "stakeholder management," "cross-functional," "SDLC," "KPI," and "scalability." Resumes exceeding 85% keyword match are 3x more likely to pass automated screening. You can integrate these naturally by adjusting bullet-point language — for example, changing "worked with other teams" to "partnered cross-functional stakeholders to deliver X, improving Y by Z%."',
      relatedIds: ['comp-skill-gap', 'comp-keyword-match']
    },
    {
      id: 'comp-network-effect',
      trigger: 'Does networking actually help?',
      preview: 'Referred candidates are 4x more likely to get an interview. Your target companies have active employee referral programs.',
      detail: `Across the companies you're targeting, referred candidates constitute 35% of all hires despite representing only 15% of applications. The referral bonus programs at these companies are active and average $2,500–$5,000 — meaning employees have a financial incentive to refer qualified candidates. Your profile's strength (technical depth) is exactly what referring employees emphasize when making referrals. A warm referral from a current employee moves your application to the top of the reviewer queue and typically bypasses initial ATS screening entirely. Prioritize connecting with 2-3 employees at each target company on professional networks before applying.`,
      relatedIds: ['comp-market-timing', 'comp-interview-edge']
    }
  ]
};

/** @type {StatusStripConfig} */
export const statusStripConfig = {
  enabled: true,
  showLatency: true,
  pollMs: 30000,
  position: 'sidebar',
  services: [
    {
      id: 'competitor-engine',
      name: 'Competitor Engine',
      description: 'Powers resume parsing and candidate comparison scoring',
      healthUrl: 'https://myjobbuddyengine.onrender.com/health'
    },
    {
      id: 'llm-ping',
      name: 'LLM Ping',
      description: 'Handles AI-generated interview coaching responses',
      healthUrl: 'https://llmping.onrender.com/health'
    },
    {
      id: 'web-hunter',
      name: 'Web Hunter',
      description: 'Scrapes market data and salary benchmarks',
      healthUrl: 'https://webhunter.onrender.com/health'
    }
  ]
};
