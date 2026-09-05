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
      id: 'interview-common',
      trigger: 'What questions should I expect?',
      preview: 'Generate likely interview questions based on your resume.',
      detail: `Based on your resume, here are the types of questions you should prepare for:

• Behavioral: "Tell me about a time you led a project" — they'll want specifics with measurable outcomes.
• Technical deep-dive: Expect to walk through your strongest project, explaining trade-offs and decisions.
• Gap probes: If there's a career shift or gap, have a concise, confident explanation ready.

I can generate a full list tailored to each bullet point on your resume. Just ask.`,
      relatedIds: ['interview-dos-donts', 'interview-star']
    },
    {
      id: 'interview-dos-donts',
      trigger: 'Give me do\'s and don\'ts',
      preview: 'Key things to emphasize and avoid in your interview.',
      detail: `Based on your resume background:

DO:
• Lead with your strongest, most relevant experience — put it front and center.
• Use the STAR method (Situation, Task, Action, Result) for every behavioral answer.
• Quantify everything you can — team size, budget, performance improvements, deadlines met.

DON'T:
• Don't badmouth past employers or colleagues — frame challenges positively.
• Don't give one-line answers — interviewers want depth, but keep each story under 2 minutes.
• Don't memorize scripts — it sounds robotic. Know your bullet points, speak naturally.`,
      relatedIds: ['interview-common', 'interview-star']
    },
    {
      id: 'interview-star',
      trigger: 'Help me structure a STAR story',
      preview: 'Build a STAR-format answer from your experience.',
      detail: `STAR is the gold standard for behavioral questions:

Situation — Set the scene. What was the context? (1-2 sentences)
Task — What was your specific responsibility? What was at stake?
Action — What did YOU do? This is the longest part. Focus on your decisions.
Result — What was the outcome? Always quantify if possible (time saved, revenue, accuracy).

Pick a project or experience from your resume, and I'll help you shape it into a tight 90-second STAR story.`,
      relatedIds: ['interview-common', 'interview-dos-donts']
    },
    {
      id: 'interview-weakness',
      trigger: 'How should I handle "weakness" questions?',
      preview: 'Turn a weakness into a self-awareness strength.',
      detail: `The "what's your biggest weakness" question is about self-awareness, not confession.

Strategy:
• Pick a real but non-fatal weakness — something true but not core to the role.
• Always pair it with what you're doing to improve.
• Example: "I used to over-commit to perfecting details. I've started using time-boxing and shipping iteratively — it's improved my delivery speed by about 30%."

Avoid: "I'm a perfectionist" (cliche), "I don't have any weaknesses" (red flag), or anything that's actually a core requirement of the job.`,
      relatedIds: ['interview-common', 'interview-salary']
    },
    {
      id: 'interview-salary',
      trigger: 'How do I negotiate salary?',
      preview: 'Know your worth and frame the conversation.',
      detail: `Salary negotiation tips for your position:

1. Delay the number as long as possible — let them go first if you can.
2. When you give a range, anchor high. Your floor should be the number you'd accept.
3. Always justify with market data and your specific value (experience, certifications, impact).
4. Remember: base salary isn't everything. Consider equity, benefits, PTO, growth potential.
5. Practice the conversation out loud — it reduces anxiety and helps you stay calm.

If you share the role and your experience level, I can help you build a specific negotiation script.`,
      relatedIds: ['interview-dos-donts', 'interview-weakness']
    },
    {
      id: 'interview-research',
      trigger: 'How do I research the company?',
      preview: 'Stand out by knowing what matters to them.',
      detail: `To research effectively before your interview:

• Read their recent press releases and blog posts — what are they excited about now?
• Check their careers page — what values do they emphasize?
• Look at their competitors and know how they differentiate.
• Find your interviewers on LinkedIn — shared connections or backgrounds are great warm opens.
• Prepare 2-3 thoughtful questions that show you've done homework (not things Google could answer).

Want me to help you prepare company-specific talking points?`,
      relatedIds: ['interview-common', 'interview-dos-donts']
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
      id: 'resume-engine',
      name: 'Resume Engine',
      description: 'Parses and extracts resume content',
      healthUrl: 'https://myjobbuddyengine.onrender.com/health'
    },
    {
      id: 'ai-coach',
      name: 'AI Coach',
      description: 'Generates interview prep responses',
      healthUrl: 'https://llmping.onrender.com/health'
    }
  ]
};
