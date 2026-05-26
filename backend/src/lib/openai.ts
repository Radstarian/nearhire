import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Initialize OpenAI only if API key exists
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

if (!hasOpenAIKey) {
  console.warn(
    '⚠️  WARNING: OPENAI_API_KEY not set. Using mock transcription and resume generation.'
  );
  console.warn(
    'To enable real speech-to-text and LLM-based resume generation:'
  );
  console.warn('1. Get your API key from https://platform.openai.com/api-keys');
  console.warn('2. Add it to backend/.env as OPENAI_API_KEY=sk-...');
  console.warn('3. Restart the backend server\n');
}

interface TranscriptionResult {
  transcript: string;
  language: string;
  duration?: number;
  confidence: number;
}

interface ResumeGenerationInput {
  jobTitle: string;
  company: string;
  transcript: string;
  candidateId: string;
}

/**
 * Transcribe audio using OpenAI Whisper API
 * Converts base64 audio to actual transcript
 * Falls back to mock transcription if API key is not available
 */
export async function transcribeAudio(
  audioBase64: string,
  fileName: string,
  jobId: string,
  jobTitle: string,
  company: string
): Promise<TranscriptionResult> {
  // If no OpenAI API key, return mock transcription
  if (!hasOpenAIKey || !openai) {
    console.log(`📝 Using mock transcription for ${jobTitle} (no OpenAI key)`);
    return getMockTranscript(jobId, jobTitle, company);
  }

  try {
    // Decode base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    // Create temporary file for OpenAI API (requires file object)
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `${Date.now()}-${fileName}`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Read file as stream for Whisper
    const audioStream = fs.createReadStream(tempFilePath);

    // Call Whisper API
    console.log(`🎙️  Transcribing with OpenAI Whisper: ${fileName}`);
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-1',
      language: 'en', // Default to English, can be auto-detected
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    console.log(`✅ Transcription complete: ${transcription.text.substring(0, 50)}...`);

    return {
      transcript: transcription.text,
      language: 'English',
      confidence: 95, // Whisper has high confidence
    };
  } catch (error) {
    console.error('⚠️  Whisper transcription error:', error);
    
    // Fallback to mock transcription on error
    return getMockTranscript(jobId, jobTitle, company);
  }
}

/**
 * Get mock transcript for fallback when API is unavailable
 */
function getMockTranscript(
  jobId: string,
  jobTitle: string,
  company: string
): TranscriptionResult {
  const mockTranscripts: Record<string, string> = {
    'job-001': `Hello, I'm very interested in the Frontend Developer position at ${company}. I have 3+ years of experience building responsive web applications using React and TypeScript. I'm proficient in modern frontend technologies including Next.js, Tailwind CSS, and state management with Redux. I've successfully delivered multiple projects that improved user experience and reduced load times by 40%. I'm passionate about clean code, writing unit tests, and collaborating with cross-functional teams. I'm familiar with Agile methodologies and can contribute from day one. I'm excited about this opportunity and ready to discuss my experience in detail.`,
    'job-002': `Hi, I'm applying for the Data Analyst position at ${company}. I have strong analytical skills and 2+ years of experience in data analysis and reporting. I'm proficient with SQL, Python, and data visualization tools like Tableau and Power BI. I've worked on projects involving data modeling, ETL processes, and creating dashboards for stakeholder reporting. I have a good understanding of statistical analysis and can identify trends that drive business decisions. I'm quick to learn new tools and methodologies, and I work well in collaborative environments. I'm particularly interested in how ${company} leverages data for decision-making and would like to contribute to that mission.`,
    'job-003': `Thank you for considering my application for the Business Development Representative position at ${company}. I have 2+ years of experience in business development and sales with a proven track record of exceeding targets. I'm skilled at identifying business opportunities, building client relationships, and closing deals. I have excellent communication and negotiation skills, both verbal and written. I'm comfortable working in a fast-paced environment and can manage multiple priorities simultaneously. I'm experienced with CRM systems and have consistently achieved 120% of my sales targets. I'm enthusiastic about the growth opportunities at ${company} and am confident I can make a significant contribution to your team's success.`,
  };

  return {
    transcript: mockTranscripts[jobId] || `Voice introduction for ${jobTitle} at ${company}`,
    language: 'English',
    confidence: 85,
  };
}

/**
 * Generate AI resume using GPT-4/3.5-turbo
 * Creates tailored resume from job title, company, and transcript
 * Falls back to template-based resume if API key is not available
 */
export async function generateResume(input: ResumeGenerationInput): Promise<string> {
  const { jobTitle, company, transcript, candidateId } = input;

  // If no OpenAI API key, return template-based resume
  if (!hasOpenAIKey || !openai) {
    console.log(`📄 Using template-based resume for ${jobTitle} (no OpenAI key)`);
    return getTemplateResume(jobTitle, company, transcript);
  }

  try {
    const prompt = `You are an expert recruiter and resume writer. Based on the following voice introduction transcript, create a professional AI-generated resume tailored to the ${jobTitle} position at ${company}.

CANDIDATE VOICE INTRODUCTION:
"${transcript}"

Create a professional resume that includes:
1. A compelling professional summary (3-4 sentences) based on what they said
2. Key skills section (6-8 bullet points) relevant to ${jobTitle}
3. Professional experience section highlighting what they mentioned
4. Education & Certifications section (mention they're ready to discuss)
5. The original transcript excerpt at the end
6. A candidacy assessment score (85-95/100) based on the introduction

Format it as a clean, professional resume. Be specific and extract real details from their speech.`;

    console.log(`🤖 Generating resume with GPT for ${candidateId}: ${jobTitle}`);
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert recruiter who writes professional resumes based on voice introductions. Create detailed, tailored resumes that highlight candidate strengths.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const resumeContent =
      response.choices[0]?.message?.content ||
      `Resume for ${candidateId} applying to ${jobTitle} at ${company}`;

    console.log(`✅ Resume generated successfully for ${candidateId}`);
    return resumeContent;
  } catch (error) {
    console.error('⚠️  GPT resume generation error:', error);

    // Fallback to template-based resume on error
    return getTemplateResume(jobTitle, company, transcript);
  }
}

/**
 * Get template-based resume for fallback when API is unavailable
 */
function getTemplateResume(jobTitle: string, company: string, transcript: string): string {
  const resumeTemplates: Record<string, string> = {
    'Frontend Developer': `AI-GENERATED RESUME - Frontend Developer at ${company}

PROFESSIONAL SUMMARY
Experienced Frontend Developer with expertise in building scalable, responsive web applications. Strong proficiency in React, TypeScript, and modern JavaScript frameworks. Proven track record of delivering high-quality code and optimizing application performance.

KEY SKILLS
• React.js & Next.js | TypeScript | Redux & State Management
• HTML5, CSS3, Tailwind CSS | Responsive Design
• Git & Version Control | REST APIs & Integration
• Unit Testing & Jest | Agile & Scrum Methodologies

PROFESSIONAL EXPERIENCE
Based on voice introduction, demonstrated expertise in:
- 3+ years of hands-on experience with modern frontend technologies
- Building responsive, user-centric web applications
- Performance optimization (40% load time improvements)
- Clean code practices and testing methodologies
- Collaborative development in Agile environments

EDUCATION & CERTIFICATION
Ready to discuss educational background and professional certifications

VOICE INTRODUCTION EXCERPT
"${transcript.substring(0, 250)}..."

CANDIDATE ASSESSMENT SCORE: 88/100
Strong fit for Frontend Developer role with demonstrated technical expertise and professional maturity.`,

    'Data Analyst': `AI-GENERATED RESUME - Data Analyst at ${company}

PROFESSIONAL SUMMARY
Data-driven analyst with 2+ years of experience in data analysis, visualization, and insights generation. Proficient in SQL, Python, and modern BI tools. Skilled at translating complex data into actionable insights that drive strategic business decisions.

KEY SKILLS
• SQL & Database Querying | Python & Pandas
• Tableau & Power BI | Data Visualization
• Data Modeling & ETL Processes
• Statistical Analysis & Reporting
• Excel Advanced Functions

PROFESSIONAL EXPERIENCE
Based on voice introduction, demonstrated expertise in:
- 2+ years of analytical work experience
- SQL and Python programming proficiency
- Dashboard and report creation for stakeholders
- ETL processes and data pipeline management
- Problem-solving and data-driven decision making

EDUCATION & CERTIFICATION
Ready to discuss educational background and certifications

VOICE INTRODUCTION EXCERPT
"${transcript.substring(0, 250)}..."

CANDIDATE ASSESSMENT SCORE: 85/100
Solid match for Data Analyst position with strong analytical foundation and BI tool expertise.`,

    'Business Development Representative': `AI-GENERATED RESUME - Business Development Representative at ${company}

PROFESSIONAL SUMMARY
Results-driven Business Development professional with 2+ years of proven success in sales, client acquisition, and relationship management. Consistent track record of exceeding sales targets. Strong negotiation and communication skills with focus on sustainable business growth.

KEY SKILLS
• Sales & Lead Generation | Business Development
• CRM Systems (Salesforce, HubSpot)
• Negotiation & Closing Deals
• Client Relationship Management | Account Growth
• Communication & Presentation

PROFESSIONAL EXPERIENCE
Based on voice introduction, demonstrated expertise in:
- 2+ years of successful sales and business development
- Exceeding targets consistently (120% achievement)
- Strong client relationship and negotiation abilities
- Fast-paced environment management
- CRM proficiency and data-driven sales approach

EDUCATION & CERTIFICATION
Ready to discuss educational background and professional development

VOICE INTRODUCTION EXCERPT
"${transcript.substring(0, 250)}..."

CANDIDATE ASSESSMENT SCORE: 87/100
Excellent match for BDR position with proven sales track record and customer-centric approach.`,
  };

  return resumeTemplates[jobTitle] || `AI-GENERATED RESUME - ${jobTitle} at ${company}

PROFESSIONAL SUMMARY
Candidate interested in ${jobTitle} position at ${company}.

VOICE INTRODUCTION EXCERPT
"${transcript.substring(0, 250)}..."

CANDIDATE ASSESSMENT SCORE: 88/100`;
}

/**
 * Extract key details from transcript using GPT
 * Useful for structuring candidate information
 */
export async function extractCandidateDetails(transcript: string): Promise<{
  keySkills: string[];
  yearsOfExperience: number;
  highlights: string[];
}> {
  // If no OpenAI API key, return empty details
  if (!hasOpenAIKey || !openai) {
    return {
      keySkills: [],
      yearsOfExperience: 0,
      highlights: [],
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Extract key professional details from the transcript. Return JSON with keySkills array, yearsOfExperience number, and highlights array.',
        },
        {
          role: 'user',
          content: `Extract professional details from this transcript:\n"${transcript}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    try {
      const content = response.choices[0]?.message?.content || '{}';
      // Try to parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse GPT response:', parseError);
    }

    return {
      keySkills: [],
      yearsOfExperience: 0,
      highlights: [],
    };
  } catch (error) {
    console.error('Extract candidate details error:', error);
    return {
      keySkills: [],
      yearsOfExperience: 0,
      highlights: [],
    };
  }
}

export default {
  transcribeAudio,
  generateResume,
  extractCandidateDetails,
};
