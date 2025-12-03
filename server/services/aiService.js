const axios = require('axios');

class AIService {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        console.log('AIService initialized with OpenRouter');
        console.log('API Key present:', !!this.apiKey);
        if (this.apiKey) {
            console.log('API Key length:', this.apiKey.length);
            console.log('API Key prefix:', this.apiKey.substring(0, 12) + '...');
        } else {
            console.error('CRITICAL: OPENROUTER_API_KEY is missing in process.env');
        }
        this.baseURL = 'https://openrouter.ai/api/v1';
        this.model = 'openai/gpt-3.5-turbo';
    }

    async _makeRequest(messages) {
        if (!this.apiKey) {
            throw new Error('OpenRouter API not initialized. Please check OPENROUTER_API_KEY.');
        }

        try {
            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: this.model,
                    messages: messages
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'http://localhost:5001',
                        'X-Title': 'SkillBridge'
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('OpenRouter API Error:', error.response?.data || error.message);
            throw new Error(`OpenRouter API request failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    async parseCV(cvText) {
        try {
            const prompt = `
You are an expert CV/Resume parser. Your task is to extract ALL information from the CV text below.

CRITICAL INSTRUCTIONS:
1. Extract EVERY piece of information present in the CV - do not skip any sections
2. Look carefully for: personal info, education, work experience, projects, skills, certifications, languages, awards, volunteer work, publications
3. For dates, preserve the original format from the CV
4. For descriptions, include ALL bullet points and details
5. If a field is not present, use null or empty array - but look twice before deciding it's missing
6. Extract contact information from headers, footers, or anywhere in the document

Return ONLY a valid JSON object with this EXACT structure (no markdown, no code blocks, just JSON):

{
    "personalInfo": {
        "firstName": "string or null",
        "lastName": "string or null",
        "email": "string or null",
        "phone": "string or null",
        "location": "string or null",
        "linkedin": "string or null",
        "github": "string or null",
        "website": "string or null"
    },
    "summary": "professional summary/objective if present, otherwise null",
    "education": {
        "university": "string or null",
        "degree": "string or null (e.g., Bachelor of Science, Master of Arts)",
        "major": "string or null (field of study)",
        "graduationYear": "string or null (year only, e.g., 2024)",
        "gpa": "number or null (convert to 4.0 scale if possible)",
        "minor": "string or null",
        "honors": "string or null (Dean's List, Cum Laude, etc.)",
        "relevantCoursework": ["array of courses or empty array"]
    },
    "skills": ["extract ALL skills mentioned - technical, soft skills, tools, languages, frameworks - as individual items"],
    "experience": [
        {
            "company": "string",
            "position": "string (job title/role)",
            "location": "string or null",
            "startDate": "string (keep original format)",
            "endDate": "string (keep original format, use 'Present' if current)",
            "description": "string (include ALL bullet points, separated by newlines)"
        }
    ],
    "projects": [
        {
            "name": "string",
            "description": "string (detailed description)",
            "technologies": ["array of technologies/tools used"],
            "url": "string or null (github, demo link)",
            "startDate": "string or null",
            "endDate": "string or null"
        }
    ],
    "certifications": [
        {
            "name": "string (certification name)",
            "issuer": "string or null (issuing organization)",
            "dateObtained": "string or null",
            "expiryDate": "string or null",
            "credentialId": "string or null"
        }
    ],
    "languages": ["array of language names (extract proficiency separately if mentioned)"],
    "awards": ["array of awards/honors or empty array"],
    "volunteer": [
        {
            "organization": "string",
            "role": "string",
            "startDate": "string or null",
            "endDate": "string or null",
            "description": "string or null"
        }
    ],
    "publications": ["array of publications or empty array"],
    "interests": ["array of interests/hobbies or empty array"]
}

IMPORTANT: 
- Be thorough - extract EVERYTHING you see
- Preserve formatting and details
- Don't summarize - include full descriptions
- If you see it in the CV, extract it

CV TEXT TO PARSE:
${cvText}
`;

            const text = await this._makeRequest([
                { role: 'user', content: prompt }
            ]);

            const parsedData = this._extractJSON(text);

            // Validate and clean the parsed data
            const validatedData = this._validateParsedCV(parsedData);

            console.log('CV parsing completed. Fields found:', Object.keys(validatedData).filter(k => {
                const val = validatedData[k];
                return val && (typeof val !== 'object' || Object.keys(val).length > 0 || (Array.isArray(val) && val.length > 0));
            }));

            return validatedData;
        } catch (error) {
            console.error('AIService.parseCV Error:', error);
            throw new Error(`Failed to parse CV: ${error.message}`);
        }
    }

    _validateParsedCV(data) {
        // Ensure all expected fields exist with proper defaults
        const validated = {
            personalInfo: data.personalInfo || {},
            summary: data.summary || null,
            education: data.education || {},
            skills: Array.isArray(data.skills) ? data.skills.filter(s => s && s.trim()) : [],
            experience: Array.isArray(data.experience) ? data.experience : [],
            projects: Array.isArray(data.projects) ? data.projects : [],
            certifications: Array.isArray(data.certifications) ? data.certifications : [],
            languages: Array.isArray(data.languages) ? data.languages : [],
            awards: Array.isArray(data.awards) ? data.awards : [],
            volunteer: Array.isArray(data.volunteer) ? data.volunteer : [],
            publications: Array.isArray(data.publications) ? data.publications : [],
            interests: Array.isArray(data.interests) ? data.interests : []
        };

        // Clean up empty arrays and null values for cleaner data
        Object.keys(validated).forEach(key => {
            if (Array.isArray(validated[key]) && validated[key].length === 0) {
                // Keep empty arrays, they're valid
            } else if (validated[key] === null || validated[key] === undefined) {
                // Keep null/undefined, indicates field wasn't found
            }
        });

        return validated;
    }

    async chat(message, cvData, history = []) {
        try {
            const cvSummary = `
Current CV Data:
- Name: ${cvData.firstName} ${cvData.lastName}
- Education: ${cvData.university || 'Not specified'} - ${cvData.major || 'Not specified'}
- Skills: ${cvData.skills?.join(', ') || 'None'}
- Experience: ${cvData.experience?.length || 0} entries
- Projects: ${cvData.projects?.length || 0} entries
- Summary: ${cvData.summary ? 'Present' : 'Not set'}
`;

            // Enhanced edit detection
            const editKeywords = ['add', 'change', 'update', 'remove', 'delete', 'set', 'modify', 'edit', 'include', 'create', 'write', 'insert', 'put'];
            const lowerMessage = message.toLowerCase();
            const isEditRequest = editKeywords.some(keyword => lowerMessage.includes(keyword));

            let systemPrompt = '';

            if (isEditRequest) {
                // Use structured output for edit requests
                systemPrompt = `You are a CV editing assistant. The user wants to make changes to their CV.

${cvSummary}

IMPORTANT: When the user requests CV edits, you MUST respond with a JSON object in this EXACT format:
{
  "reply": "Your conversational response confirming the change",
  "cvUpdates": {
    // Include ONLY the fields that need to be updated
    // For arrays (skills, experience, projects), provide the COMPLETE updated array
    // For simple fields (summary, university, etc.), provide the new value
  },
  "hasUpdates": true
}

Examples:

1. Adding a professional summary:
User: "Add a professional summary"
Response:
{
  "reply": "I've added a professional summary to your CV!",
  "cvUpdates": {
    "summary": "Motivated [${cvData.major || 'professional'}] with strong skills in ${(cvData.skills || []).slice(0, 3).join(', ')}. Demonstrated experience in ${(cvData.experience || []).map(e => e.company).slice(0, 2).join(' and ')}."
  },
  "hasUpdates": true
}

2. Adding to existing skills:
User: "Add Python to my skills"
Response:
{
  "reply": "I've added Python to your skills list!",
  "cvUpdates": {
    "skills": ${JSON.stringify([...(cvData.skills || []), 'Python'])}
  },
  "hasUpdates": true
}

3. Updating simple fields:
User: "Change my university to MIT"
Response:
{
  "reply": "Updated your university to MIT!",
  "cvUpdates": {
    "university": "MIT"
  },
  "hasUpdates": true
}

4. Adding experience:
User: "Add my internship at Google as Software Engineer from June 2023 to August 2023"
Response:
{
  "reply": "I've added your Google internship to your experience!",
  "cvUpdates": {
    "experience": [
      ...existing experience array...,
      {
        "company": "Google",
        "position": "Software Engineer Intern",
        "startDate": "June 2023",
        "endDate": "August 2023",
        "description": "",
        "location": ""
      }
    ]
  },
  "hasUpdates": true
}

5. Adding custom sections:
User: "Add a Hobbies section with Photography and Hiking"
Response:
{
  "reply": "I've added a Hobbies section to your CV!",
  "cvUpdates": {
    "customSections": [
      ${cvData.customSections ? '...existing custom sections...,' : ''}
      {
        "title": "Hobbies",
        "type": "list",
        "items": ["Photography", "Hiking"],
        "order": ${(cvData.customSections?.length || 0) + 10}
      }
    ]
  },
  "hasUpdates": true
}

Current CV Data (use this to make updates):
${JSON.stringify(cvData, null, 2)}

CRITICAL RULES:
1. When updating arrays, include ALL existing items PLUS the new ones
2. Don't remove existing data unless explicitly asked
3. Preserve the exact structure of nested objects
4. For summary, create a professional 2-3 sentence summary based on their background
5. Return ONLY valid JSON, no markdown code blocks, no additional text

Respond ONLY with the JSON object, no additional text.`;
            } else {
                // Regular conversational response
                systemPrompt = `You are a friendly AI CV editor. Help the user improve their CV.

${cvSummary}

Respond helpfully and conversationally. If the user wants to make a specific edit, provide the exact text. Keep responses concise (2-3 sentences) unless detailed feedback is requested.`;
            }

            const messages = [
                {
                    role: 'system',
                    content: systemPrompt
                }
            ];

            // Add conversation history
            history.slice(-6).forEach(msg => {
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            });

            // Add current message
            messages.push({
                role: 'user',
                content: message
            });

            const response = await this._makeRequest(messages);

            // If it's an edit request, try to parse JSON response
            if (isEditRequest) {
                try {
                    const parsed = this._extractJSON(response);
                    if (parsed.hasUpdates && parsed.cvUpdates) {
                        // Validate the updates structure
                        console.log('Parsed CV updates:', JSON.stringify(parsed.cvUpdates, null, 2));
                        return parsed;
                    }
                } catch (error) {
                    console.log('Failed to parse as JSON, returning as text:', error.message);
                    // Fall back to text response
                }
            }

            // Return as regular text response
            return { reply: response, hasUpdates: false };
        } catch (error) {
            console.error('AIService.chat Error:', error);
            throw new Error(`Chat failed: ${error.message}`);
        }
    }

    async enhanceSection(section, content) {
        try {
            let prompt = '';

            switch (section) {
                case 'experience':
                    prompt = `Enhance this work experience description to be more impactful, action-oriented, and achievement-focused. Use strong verbs and quantify results:\n\n${content}\n\nReturn ONLY the enhanced text.`;
                    break;
                case 'projects':
                    prompt = `Enhance this project description to highlight technical skills and impact:\n\n${content}\n\nReturn ONLY the enhanced text.`;
                    break;
                case 'skills':
                    prompt = `Review and enhance this skills list. Remove duplicates and organize better:\n\n${content}\n\nReturn ONLY the enhanced list.`;
                    break;
                default:
                    prompt = `Enhance this CV section to be more professional:\n\n${content}\n\nReturn ONLY the enhanced text.`;
            }

            return await this._makeRequest([
                { role: 'user', content: prompt }
            ]);
        } catch (error) {
            console.error('AIService.enhanceSection Error:', error);
            throw new Error(`Enhancement failed: ${error.message}`);
        }
    }

    async analyzeCV(cvData) {
        try {
            const cvSummary = `
Name: ${cvData.firstName} ${cvData.lastName}
Education: ${cvData.university || 'Not specified'}
Skills: ${cvData.skills?.join(', ') || 'None'}
Experience: ${cvData.experience?.map(e => `${e.position} at ${e.company}`).join('; ') || 'None'}
Projects: ${cvData.projects?.map(p => p.name).join('; ') || 'None'}
`;

            const prompt = `Analyze this CV and provide a comprehensive review including:
1. Overall impression
2. Strengths
3. Areas for improvement
4. Specific actionable suggestions

CV Data:
${cvSummary}

Format as a conversational response.`;

            return await this._makeRequest([
                { role: 'user', content: prompt }
            ]);
        } catch (error) {
            console.error('AIService.analyzeCV Error:', error);
            throw new Error(`Analysis failed: ${error.message}`);
        }
    }

    async findOpportunities(userProfile, criteria) {
        try {
            const {
                location,
                radius,
                jobTypes,
                userPrompt,
                industries,
                rolePosition = '',
                companySizeRange = '51-100',
                country = ''
            } = criteria;

            const prompt = `
You are an expert career advisor specializing in COLD EMAIL OUTREACH for students seeking internships and part-time opportunities. Your task is to identify small companies that are perfect targets for cold emails.

CRITICAL FOCUS: Find companies with 50-100 employees (or in the range: ${companySizeRange}). Smaller companies have:
- More accessible decision makers
- Higher response rates to cold emails
- More flexibility in creating opportunities
- Less bureaucratic hiring processes

STUDENT PROFILE:
- Name: ${userProfile.name}
- Email: ${userProfile.email}
- University: ${userProfile.university}
- Major: ${userProfile.major}
- Year: ${userProfile.year}
- Skills: ${userProfile.skills.join(', ')}
- GPA: ${userProfile.gpa}
- Work Experience: ${userProfile.workExperience.map(exp => `${exp.position} at ${exp.company}`).join(', ') || 'Entry-level, seeking first opportunity'}
- Projects: ${userProfile.projects.map(proj => proj.name).join(', ') || 'None specified'}

SEARCH CRITERIA:
- What Student is Looking For: ${userPrompt || 'Opportunities matching profile and skills'}
- Specific Role/Position: ${rolePosition || 'Flexible roles matching major and skills'}
- Location/Country: ${country || location || 'Not specified'}
- ${radius ? `Search Radius: ${radius} miles` : ''}
- Preferred Job Types: ${jobTypes.length > 0 ? jobTypes.join(', ') : 'Part-time, Internship, or flexible arrangements'}
- Target Industries: ${industries.length > 0 ? industries.join(', ') : 'Any industry open to student talent'}
- **COMPANY SIZE REQUIREMENT: ${companySizeRange} employees** (STRICT - only include companies in this range)

PURPOSE: Find companies suitable for COLD EMAIL OUTREACH (not job board applications)

REQUIREMENTS FOR EACH COMPANY:
1. **Company Size**: Must be in the ${companySizeRange} employee range (verify this is realistic)
2. **Cold Email Friendly**: Companies should be:
   - Small enough that emails reach decision makers
   - Growing or actively hiring in the past
   - In industries that accept cold outreach
   - Have identifiable decision makers (CEO, Operations Director, Hiring Manager)
3. **Relevant to Student**: Match student's major, skills, or career interests
4. **Contact Information**: Provide realistic company website and estimated decision maker details

Return a JSON object with this EXACT structure:
{
  "businesses": [
    {
      "company": "ABC Manufacturing Ltd",
      "industry": "Manufacturing",
      "employeeCount": "75",
      "companySizeCategory": "51-100 employees",
      "location": "${country || location}",
      "website": "https://company.com",
      "linkedIn": "https://linkedin.com/company/abc-manufacturing",
      "description": "Brief description of what the company does",
      "coldEmailScore": "High",
      "decisionMaker": {
        "title": "Operations Director",
        "suggestedName": "Likely senior role title (don't invent specific names unless publicly available)",
        "estimatedEmail": "Format: firstname.lastname@company.com or info@company.com",
        "howToFind": "Check LinkedIn company page, company website team section, or call reception"
      },
      "whySuitableForColdEmail": "Specific reasons this company is perfect for cold outreach (size, growth, accessibility, industry fit)",
      "potentialRoles": ["${rolePosition || 'Specific role 1'}", "Related role 2", "Related role 3"],
      "pitch": "Personalized one-sentence pitch for why student should reach out to this company based on their CV",
      "bestTimeToContact": "Early morning or early afternoon on Tuesday-Thursday",
      "contactSuggestion": "Specific strategy for reaching out (email CEO directly, find operations manager on LinkedIn, etc.)",
      "followUpStrategy": "Follow up after 3-5 days with additional value proposition or different angle",
      "likelihood": "High"
    }
  ]
}

IMPORTANT RULES:
1. **ONLY include companies with ${companySizeRange} employees** - this is critical for cold email success
2. Provide 10-15 realistic companies (real or realistic-sounding companies in the specified location/industry)
3. Each company must have HIGH potential for cold email response (small, accessible, relevant)
4. Decision maker information should be realistic and helpful for finding contacts
5. Focus on companies where student could genuinely add value
6. coldEmailScore should be "High" for most results (since we're filtering for optimal targets)
7. Make the "pitch" specific to both the company and the student's background

Return ONLY the JSON object, no additional text.
`;

            const text = await this._makeRequest([
                { role: 'user', content: prompt }
            ]);

            const parsed = this._extractJSON(text);
            return parsed.businesses || [];
        } catch (error) {
            console.error('AIService.findOpportunities Error:', error);
            throw new Error(`Failed to find opportunities: ${error.message}`);
        }
    }

    async generateColdEmail(userProfile, businessDetails) {
        try {
            const { businessName, businessDescription, potentialRoles, contactSuggestion, contactEmail, phone, industry, employeeCount, decisionMaker } = businessDetails;

            const prompt = `
You are an expert at writing COLD OUTREACH emails that get responses. This is NOT a response to a job posting - this is an unsolicited email to a small company where no opportunity has been advertised.

CONTEXT: This is a COLD EMAIL to a small company (${employeeCount || '50-100'} employees). The student is proactively reaching out to create their own opportunity.

STUDENT PROFILE:
- Name: ${userProfile.name}
- Email: ${userProfile.email}
- University: ${userProfile.university}
- Major: ${userProfile.major}
- Year: ${userProfile.year}
- Skills: ${userProfile.skills.join(', ')}
- Work Experience: ${userProfile.workExperience.map(exp => `${exp.position} at ${exp.company} (${exp.duration || 'recent'})`).join('; ') || 'Entry-level, eager to learn'}
- Projects: ${userProfile.projects.map(proj => `${proj.name}: ${proj.description || ''}`).join('; ') || 'Academic projects and coursework'}

TARGET COMPANY:
- Company Name: ${businessName}
- Industry: ${industry}
- Company Size: ${employeeCount || '50-100'} employees (small company = more accessible)
- Description: ${businessDescription}
- Potential Roles: ${potentialRoles.join(', ')}
${decisionMaker ? `- Decision Maker: ${decisionMaker.title || 'Hiring Manager'}` : ''}

COLD EMAIL REQUIREMENTS:

1. **Subject Line** (Critical - determines if email is opened):
   - Personal and specific to the company
   - Creates curiosity or shows immediate value
   - NOT generic like "Internship Inquiry"
   - Examples: "${userProfile.major} Student - [Specific Value] for ${businessName}", "Quick Question About ${industry} at ${businessName}"
   
2. **Opening Line**:
   - Show you've researched the company (mention something specific)
   - Explain WHY you're reaching out to THEM specifically
   - Make them curious to keep reading
   
3. **Value Proposition** (Lead with what you offer):
   - Don't start with what you want
   - Highlight 2-3 specific skills/experiences that match their industry
   - Connect your background to their potential needs
   - Be confident but humble
   
4. **The Ask** (Make it easy to say yes):
   - Don't ask for a job directly
   - Ask for a brief 15-minute call/coffee chat
   - Offer flexibility with their schedule
   - Make it low-pressure
   
5. **Closing**:
   - Professional but warm
   - Include ALL contact information
   - One-line PS can increase response rate (optional)
   
6. **Tone**:
   - Professional but conversational
   - Confident but not entitled
   - Genuine enthusiasm for the company/industry
   - Keep it under 200 words (cold emails should be brief)

7. **Follow-Up Strategy** (include at end):
   - Suggest when to follow up (3-5 business days)
   - Different angle for follow-up
   - Alternative contact methods (LinkedIn, phone)

FORMAT YOUR RESPONSE AS:

--- SUBJECT LINE ---
[Your compelling subject line]

--- EMAIL BODY ---
[Your email content]

--- FOLLOW-UP STRATEGY ---
[How and when to follow up if no response]

--- TIPS ---
[2-3 specific tips for this particular outreach]

Create a complete, ready-to-send cold email that feels personal, professional, and gets responses.
`;

            return await this._makeRequest([
                { role: 'user', content: prompt }
            ]);
        } catch (error) {
            console.error('AIService.generateColdEmail Error:', error);
            throw new Error(`Failed to generate email: ${error.message}`);
        }
    }

    _extractJSON(text) {
        try {
            // Strategy 1: Try to find JSON in code blocks
            let jsonStr = text;

            const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1];
            }

            // Strategy 2: Find first { and last }
            const start = jsonStr.indexOf('{');
            const end = jsonStr.lastIndexOf('}');

            if (start !== -1 && end !== -1 && end > start) {
                jsonStr = jsonStr.substring(start, end + 1);

                // Strategy 3: Try parsing directly
                try {
                    return JSON.parse(jsonStr);
                } catch (parseError) {
                    // Strategy 4: Try to repair common JSON issues
                    const repairedJson = this._repairJSON(jsonStr);
                    try {
                        return JSON.parse(repairedJson);
                    } catch (repairError) {
                        console.error('JSON repair failed:', repairError.message);
                        throw new Error('Could not parse or repair JSON response');
                    }
                }
            }

            throw new Error('No valid JSON structure found in response');
        } catch (error) {
            console.error('JSON Extraction Error:', error.message);
            console.error('Raw Text (first 500 chars):', text.substring(0, 500));
            throw new Error(`Failed to extract JSON from AI response: ${error.message}`);
        }
    }

    _repairJSON(jsonStr) {
        // Remove common issues that break JSON parsing
        let repaired = jsonStr;

        // Remove trailing commas before closing braces/brackets
        repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

        // Fix unescaped quotes in strings (basic attempt)
        // This is tricky and may not catch all cases

        // Remove any leading/trailing whitespace
        repaired = repaired.trim();

        // Try to fix common property name issues (unquoted keys)
        // This is a simplified approach and may not work for all cases

        return repaired;
    }
}

module.exports = new AIService();
