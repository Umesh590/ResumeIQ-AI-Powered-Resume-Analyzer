const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

// ================= GEMINI CONFIGURATION =================

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const GEMINI_MODEL = "gemini-3.5-flash-lite";

// ================= RETRY HELPER =================

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(request, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Gemini API attempt ${attempt}/${maxRetries}`);

      return await ai.models.generateContent(request);
    } catch (error) {
      const isTemporaryError = error.status === 503 || error.status === 429;

      if (!isTemporaryError || attempt === maxRetries) {
        throw error;
      }

      const delay = 2000 * Math.pow(2, attempt - 1);

      console.log(`Gemini unavailable. Retrying in ${delay / 1000} seconds...`);

      await wait(delay);
    }
  }
}

// ================= GEMINI INTERVIEW SCHEMA =================

const geminiInterviewSchema = z
  .object({
    title: z.string(),

    match_score: z.number().min(0).max(100),

    summary: z.string(),

    technical_questions: z.array(z.string()),
    technical_intentions: z.array(z.string()),
    technical_sample_answers: z.array(z.string()),

    behavioral_questions: z.array(z.string()),
    behavioral_intentions: z.array(z.string()),
    behavioral_sample_answers: z.array(z.string()),

    skill_gaps: z.array(z.string()),

    skill_gap_severities: z.array(z.enum(["low", "medium", "high"])),

    skill_gap_explanations: z.array(z.string()),

    preparation_plan: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    if (
      data.technical_questions.length !== data.technical_intentions.length ||
      data.technical_questions.length !== data.technical_sample_answers.length
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Technical question arrays must have matching lengths.",
      });
    }

    if (
      data.behavioral_questions.length !== data.behavioral_intentions.length ||
      data.behavioral_questions.length !== data.behavioral_sample_answers.length
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Behavioral question arrays must have matching lengths.",
      });
    }

    if (
      data.skill_gaps.length !== data.skill_gap_severities.length ||
      data.skill_gaps.length !== data.skill_gap_explanations.length
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Skill gap arrays must have matching lengths.",
      });
    }

    if (data.preparation_plan.length !== 7) {
      ctx.addIssue({
        code: "custom",
        message: "Preparation plan must contain exactly 7 days.",
      });
    }
  });

// ================= TRANSFORM GEMINI RESPONSE =================

function transformInterviewReport(report) {
  return {
    title: report.title,

    matchScore: report.match_score,

    technicalQuestions: report.technical_questions.map((question, index) => ({
      question,
      intention: report.technical_intentions[index],
      answer: report.technical_sample_answers[index],
    })),

    behavioralQuestions: report.behavioral_questions.map((question, index) => ({
      question,
      intention: report.behavioral_intentions[index],
      answer: report.behavioral_sample_answers[index],
    })),

    skillGaps: report.skill_gaps.map((skill, index) => ({
      skill,
      severity: report.skill_gap_severities[index],
    })),

    preparationPlan: report.preparation_plan.map((plan, index) => {
      const match = plan.match(/^Day\s+(\d+)\s*:\s*(.*)$/i);

      const day = match ? Number(match[1]) : index + 1;
      const focus = match ? match[2].trim() : plan;

      return {
        day,
        focus,
        tasks: [focus],
      };
    }),
  };
}

// ================= GENERATE INTERVIEW REPORT =================

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert technical interviewer and career advisor.


Analyze the candidate's resume against the job description.


CANDIDATE RESUME:
${resume}


CANDIDATE SELF DESCRIPTION:
${selfDescription}


JOB DESCRIPTION:
${jobDescription}


INSTRUCTIONS:


1. Generate a realistic match score between 0 and 100.
2. Generate 3 important technical interview questions.
3. Generate 2 important behavioral interview questions.
4. Provide an intention and sample answer for every question.
5. Identify relevant skill gaps.
6. Assign each skill gap a severity: low, medium, or high.
7. Provide an explanation for every skill gap.
8. Create a practical 7-day preparation plan.
9. Each preparation plan item must begin with Day 1:, Day 2:, etc.
10. The title must contain the actual job role from the job description.
11. Do not invent candidate experience, qualifications, projects, or skills.
12. Keep answers concise, clear and useful.
13. Return valid JSON only.


IMPORTANT:
Use these exact JSON field names:


{
  "title": "Job role",
  "match_score": 85,
  "summary": "Candidate analysis",
  "technical_questions": ["Question 1"],
  "technical_intentions": ["Intention 1"],
  "technical_sample_answers": ["Answer 1"],
  "behavioral_questions": ["Question 1"],
  "behavioral_intentions": ["Intention 1"],
  "behavioral_sample_answers": ["Answer 1"],
  "skill_gaps": ["Skill gap 1"],
  "skill_gap_severities": ["medium"],
  "skill_gap_explanations": ["Explanation 1"],
  "preparation_plan": [
    "Day 1: JavaScript fundamentals",
    "Day 2: React",
    "Day 3: Node.js",
    "Day 4: Express.js",
    "Day 5: MongoDB",
    "Day 6: APIs and authentication",
    "Day 7: Mock interview"
  ]
}


The technical question, intention and answer arrays must have equal lengths.
The behavioral question, intention and answer arrays must have equal lengths.
The skill gap, severity and explanation arrays must have equal lengths.
The preparation plan must contain exactly 7 items.
`;

  try {
    console.time("Gemini Interview API Time");

    const response = await generateWithRetry({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(geminiInterviewSchema),
        maxOutputTokens: 4096,
      },
    });

    console.timeEnd("Gemini Interview API Time");

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    console.log("Gemini Raw Response:", response.text);

    let parsedReport;

    try {
      parsedReport = JSON.parse(response.text);
    } catch (error) {
      console.error("JSON Parse Error:", error.message);
      throw new Error("Gemini returned invalid JSON.");
    }

    const validationResult = geminiInterviewSchema.safeParse(parsedReport);

    if (!validationResult.success) {
      console.error(
        "Gemini Validation Error:",
        validationResult.error.format(),
      );

      throw new Error("Gemini response does not match the required schema.");
    }

    const finalReport = transformInterviewReport(validationResult.data);

    console.log("Interview report transformed successfully.");

    return finalReport;
  } catch (error) {
    console.error("Gemini Interview Report Error:", error.message);

    throw error;
  }
}

// ================= RESUME PDF SCHEMA =================

const resumePdfSchema = z.object({
  html: z.string().min(1),
});

// ================= GENERATE PDF FROM HTML =================

async function generatePdfFromHtml(htmlContent) {
  let browser;

  try {
    browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: "load",
      timeout: 60000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    return pdfBuffer;
  } catch (error) {
    console.error("PDF Generation Error:", error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ================= GENERATE RESUME PDF =================

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `
You are an expert ATS resume writer, professional career consultant,
and technical recruiter.

YOUR PRIMARY OBJECTIVE:
Transform the candidate's existing resume into a stronger,
professional, ATS-friendly, job-specific resume.

IMPORTANT: This is a resume improvement task, NOT a resume
recreation task. Preserve the candidate's original information
before making any improvements.

CANDIDATE RESUME:
${resume}

CANDIDATE SELF DESCRIPTION:
${selfDescription}

TARGET JOB DESCRIPTION:
${jobDescription}


==================================================
STEP 1: ANALYZE THE JOB DESCRIPTION
==================================================

Identify:
- Target job title
- Required technical skills
- Preferred technical skills
- Tools and technologies
- Key responsibilities
- Important ATS keywords


==================================================
STEP 2: ANALYZE THE ORIGINAL RESUME
==================================================

Extract and understand ALL information, including:

- Candidate name and contact information
- Professional summary
- Every technical skill and technology
- Every employment and internship entry
- Company names, job titles, locations and employment dates
- All experience descriptions and responsibilities
- Every project name and project date
- Every project technology and description
- Education, institutions, graduation dates and CGPA
- School details, percentages and academic qualifications
- Certifications, achievements and extracurricular activities

Do not overlook information simply because it is not directly
related to the target job.


==================================================
STEP 3: STRICT INFORMATION PRESERVATION
==================================================

These rules have the highest priority.

1. Preserve every genuine and useful section from the original resume.

2. NEVER remove project dates, internship dates, employment dates,
   company names, job titles, locations, CGPA, percentages,
   certifications or achievements.

3. Preserve ALL original projects. You may change their order
   according to relevance, but do not delete a project simply
   because another project is more relevant.

4. Preserve ALL genuine technical skills. You may reorganize
   and prioritize them according to the target job description,
   but do not silently remove existing skills.

5. Preserve the candidate's original responsibilities,
   contributions and technical details.

6. Never replace specific original information with vague
   descriptions.

7. Do not remove a section just to make the resume shorter.

8. You may improve grammar, sentence structure, clarity,
   professional language and formatting without changing
   the original meaning.

9. If information is incomplete or unclear, preserve the
   available information rather than guessing.

10. Do not duplicate information unnecessarily.


==================================================
STEP 4: JOB-SPECIFIC RESUME IMPROVEMENT
==================================================

PROFESSIONAL SUMMARY:
- Write a new summary specifically for the target role.
- Highlight the candidate's most relevant genuine skills.
- Mention relevant experience and projects.
- Incorporate supported keywords from the job description.
- Avoid generic statements and unsupported claims.

TECHNICAL SKILLS:
- Organize skills into relevant categories.
- Prioritize skills required by the target job.
- Retain all genuine original skills.
- Never add a skill only because it appears in the job description.

EXPERIENCE:
- Improve existing bullet points using professional language.
- Highlight genuine technical responsibilities and contributions.
- Use strong action verbs where appropriate.
- Preserve company names, roles, locations and dates.
- Do not invent metrics or achievements.

PROJECTS:
- Preserve every original project.
- Preserve project names, dates and technology stacks.
- Reorder projects based on relevance to the target role.
- Improve descriptions to explain actual implementation,
  technical decisions and genuine features.
- Highlight relevant technologies naturally.
- Do not invent functionality or technical contributions.

EDUCATION:
- Preserve degree, institution, location, dates, CGPA,
  school details and percentages.

CERTIFICATIONS AND ACHIEVEMENTS:
- Preserve every original certification and achievement.
- Do not change certificate names or award details.


==================================================
STEP 5: ATS OPTIMIZATION
==================================================

- Naturally incorporate relevant job-description keywords.
- Use exact technology names where supported by the resume.
- Prefer standard section headings.
- Use clear, readable bullet points.
- Avoid keyword stuffing.
- Do not claim skills or experience the candidate does not have.
- Optimize for both ATS readability and human recruiters.


==================================================
STEP 6: FINAL VALIDATION BEFORE OUTPUT
==================================================

Before generating the HTML, internally verify:

- Is the candidate's contact information unchanged?
- Are all original projects present?
- Are all original project dates preserved?
- Are all employment and internship dates preserved?
- Are all original technical skills retained?
- Are education details, CGPA and percentages preserved?
- Are all certifications and achievements retained?
- Have descriptions been genuinely improved?
- Are job-specific keywords included only when supported?
- Have any unsupported claims or invented details been added?

If any useful original information is missing, restore it
before generating the final resume.


==================================================
STEP 7: HTML AND DESIGN REQUIREMENTS
==================================================

- Generate a complete professional resume in HTML.
- Use semantic HTML elements and inline CSS.
- Use standard headings:
  Professional Summary
  Technical Skills
  Experience
  Projects
  Education
  Certifications & Achievements
- Use a clean, single-column layout.
- Use readable fonts and consistent spacing.
- Avoid tables, icons, graphics and complex layouts.
- Make the resume suitable for ATS parsing and PDF printing.
- Use professional and consistent date formatting.
- Keep the design clean without unnecessarily reducing
  the original resume's useful content.
- Do not include explanations or analysis outside the resume.

OUTPUT REQUIREMENTS:
Return valid JSON containing exactly one field named "html".
The html field must contain the complete generated resume.
`;

  try {
    const response = await generateWithRetry({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(resumePdfSchema),
        maxOutputTokens: 4096,
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty resume response.");
    }

    console.log("Gemini Resume Raw Response:", response.text);

    const parsedResponse = JSON.parse(response.text);

    const validationResult = resumePdfSchema.safeParse(parsedResponse);

    if (!validationResult.success) {
      console.error(
        "Resume Validation Error:",
        validationResult.error.format(),
      );

      throw new Error(
        "Gemini resume response does not match the required schema.",
      );
    }

    return await generatePdfFromHtml(validationResult.data.html);
  } catch (error) {
    console.error("Gemini Resume PDF Error:", error.message);
    throw error;
  }
}

// ================= EXPORT FUNCTIONS =================

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};
