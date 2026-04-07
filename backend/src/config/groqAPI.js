const Groq = require('groq-sdk');

// Initialize Groq client
let groqClient = null;

const initializeGroq = () => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }

    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    console.log('Groq API initialized successfully');
    return groqClient;
  } catch (error) {
    console.error('Failed to initialize Groq API:', error.message);
    return null;
  }
};

/**
 * Generate content using Groq API
 * @param {string} prompt - The prompt to send to Groq
 * @param {object} options - Additional options
 * @returns {Promise<string>} - Generated content
 */
const generateContent = async (prompt, options = {}) => {
  try {
    if (!groqClient) {
      throw new Error('Groq client not initialized');
    }

    const response = await groqClient.chat.completions.create({
      model: options.model || 'mixtral-8x7b-32768',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1024,
      top_p: options.topP || 0.9
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw new Error(`Groq API error: ${error.message}`);
  }
};

/**
 * Generate quiz questions using AI
 * @param {string} topic - The topic for quiz questions
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array>} - Generated quiz questions
 */
const generateQuizQuestions = async (topic, count = 5) => {
  const prompt = `
Generate ${count} multiple-choice quiz questions about "${topic}".
Format the response as a JSON array with this structure:
[
  {
    "questionText": "Question text here?",
    "type": "multiple-choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Explanation for the correct answer"
  }
]

Only return the JSON array, no other text.
  `;

  const content = await generateContent(prompt, {
    temperature: 0.7,
    maxTokens: 2048
  });

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing generated questions:', error);
    return [];
  }
};

/**
 * Generate personalized learning recommendation
 * @param {object} userProgress - User's learning progress
 * @returns {Promise<string>} - Recommendation text
 */
const generateLearningRecommendation = async (userProgress) => {
  const prompt = `
Based on this user's learning progress:
- Completed Courses: ${userProgress.completedCourses?.join(', ') || 'None'}
- Current Courses: ${userProgress.currentCourses?.join(', ') || 'None'}
- Strengths: ${userProgress.strengths?.join(', ') || 'Unknown'}
- Areas to Improve: ${userProgress.improvements?.join(', ') || 'Unknown'}

Provide a personalized learning recommendation (2-3 sentences) to help this student improve their learning journey.
  `;

  return await generateContent(prompt, {
    temperature: 0.8,
    maxTokens: 512
  });
};

/**
 * Generate content summary
 * @param {string} contentText - The content to summarize
 * @returns {Promise<string>} - Summary text
 */
const generateContentSummary = async (contentText) => {
  const prompt = `
Summarize the following educational content in 2-3 key points:

${contentText}

Provide a concise summary that captures the main concepts.
  `;

  return await generateContent(prompt, {
    temperature: 0.5,
    maxTokens: 512
  });
};

module.exports = {
  initializeGroq,
  groqClient: () => groqClient,
  generateContent,
  generateQuizQuestions,
  generateLearningRecommendation,
  generateContentSummary
};
