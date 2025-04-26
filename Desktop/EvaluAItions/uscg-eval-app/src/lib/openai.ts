import OpenAI from 'openai';

// Initialize the OpenAI client
// In production, the API key should be stored in environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateBulletParams {
  achievement: string;
  competency: string;
  rankCategory?: string;
  rank?: string;
}

export async function generateBullet({ 
  achievement, 
  competency, 
  rankCategory = 'Officer', 
  rank = 'O3' 
}: GenerateBulletParams): Promise<string> {
  try {
    // Get the competency description
    const competencyDescription = getCompetencyDescription(competency, rankCategory);
    
    // Create the prompt for the OpenAI API based on rank category
    let prompt = '';
    
    if (rankCategory === 'Officer') {
      prompt = `
You are a USCG Officer Evaluation Report writing assistant. Your task is to generate a performance bullet for a ${getRankTitle(rank)} based on the following achievement:

Achievement: "${achievement}"

Generate a bullet that aligns with the "${competency}" competency for an Officer Evaluation Report (OER).
The bullet should:
- Begin with an action verb
- Highlight measurable impact
- Be concise and specific
- Follow USCG writing standards for officer evaluations
- Be limited to one sentence if possible
- Be appropriate for the rank of ${getRankTitle(rank)}

Competency description: ${competencyDescription}

Return only the bullet text without any additional explanation or formatting.
`;
    } else {
      prompt = `
You are a USCG Enlisted Evaluation Report writing assistant. Your task is to generate a performance bullet for a ${getRankTitle(rank)} based on the following achievement:

Achievement: "${achievement}"

Generate a bullet that aligns with the "${competency}" competency for an Enlisted Evaluation Report.
The bullet should:
- Begin with an action verb
- Highlight measurable impact
- Be concise and specific
- Follow USCG writing standards for enlisted evaluations
- Be limited to one sentence if possible
- Be appropriate for the rank of ${getRankTitle(rank)}
- Reflect the level of responsibility expected at the ${rank} level

Competency description: ${competencyDescription}

Return only the bullet text without any additional explanation or formatting.
`;
    }

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", // Using GPT-4 Turbo (4.1-nano)
      messages: [
        { 
          role: "system", 
          content: `You are a specialized USCG evaluation writing assistant that creates concise, impactful performance bullets for ${rankCategory === 'Officer' ? 'officers' : 'enlisted personnel'}.` 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    // Extract and return the generated bullet
    return response.choices[0].message.content?.trim() || "Failed to generate bullet";
  } catch (error) {
    console.error('Error generating bullet with OpenAI:', error);
    throw new Error('Failed to generate bullet');
  }
}

// Helper function to get rank titles
function getRankTitle(rank: string): string {
  const rankTitles: Record<string, string> = {
    // Officer ranks
    'O1': 'Ensign (ENS)',
    'O2': 'Lieutenant Junior Grade (LTJG)',
    'O3': 'Lieutenant (LT)',
    'O4': 'Lieutenant Commander (LCDR)',
    'O5': 'Commander (CDR)',
    'O6': 'Captain (CAPT)',
    'W2': 'Chief Warrant Officer (CWO2)',
    'W3': 'Chief Warrant Officer (CWO3)',
    'W4': 'Chief Warrant Officer (CWO4)',
    // Enlisted ranks
    'E4': 'Petty Officer Third Class (PO3)',
    'E5': 'Petty Officer Second Class (PO2)',
    'E6': 'Petty Officer First Class (PO1)',
    'E7': 'Chief Petty Officer (CPO)',
    'E8': 'Senior Chief Petty Officer (SCPO)',
  };

  return rankTitles[rank] || rank;
}

// Helper function to get competency descriptions based on rank category
function getCompetencyDescription(competency: string, rankCategory: string): string {
  // Officer competency descriptions
  const officerCompetencyDescriptions: Record<string, string> = {
    'Planning & Preparedness': 'Ability to anticipate, determine goals, identify relevant information, set priorities and deadlines, and create a shared vision of the unit\'s and Coast Guard\'s future.',
    'Using Resources': 'Ability to manage time, materials, information, money, and people (i.e. all CG components as well as external publics).',
    'Results/Effectiveness': 'Quality, quantity, timeliness and impact of work.',
    'Adaptability': 'Ability to modify work methods and priorities in response to new information, changing conditions, political realities, or unexpected obstacles.',
    'Professional Competence': 'Ability to acquire, apply, and share technical and administrative knowledge and skills associated with description of duties (includes operational aspects such as marine safety, seamanship, airmanship, SAR, etc., as appropriate).',
    'Speaking and Listening': 'Ability to speak effectively and listen to understand.',
    'Writing': 'Ability to express facts and ideas clearly and convincingly.',
    'Looking Out For Others': 'Ability to consider and respond to others personal needs, capabilities, and achievements; support for and application of work-life concepts and skills.',
    'Developing Others': 'Ability to use mentoring, counseling, and training to provide opportunities for others\' professional development.',
    'Directing Others': 'Ability to influence or direct others in accomplishing tasks or missions.',
    'Teamwork': 'Ability to manage, lead, and participate in teams, encourage cooperation, and develop esprit de corps.',
    'Workplace Climate': 'Ability to create and maintain a positive environment where differences of all personnel are included, valued, and respected in alignment with Civil Rights and Human Resource policies. Capacity to optimize diverse perspectives to improve team contributions to mission performance.',
    'Evaluations': 'The extent to which an officer, as Reported-on Officer and rater, conducted or required others to conduct accurate, timely evaluations for enlisted, civilian and officer personnel.',
    'Initiative': 'Ability to originate and act on new ideas, pursue opportunities to learn and develop, and seek responsibility without guidance and supervision.',
    'Judgment': 'Ability to make sound decisions and provide valid recommendations by using facts, experience, political acumen, common sense, risk assessment, and analytical thought.',
    'Responsibility': 'Ability to act ethically, courageously, and dependably and inspire the same in others; accountability for own and subordinates\' actions.',
    'Professional Presence': 'Ability to bring credit to the Coast Guard through one\'s actions, competence, demeanor, and appearance. Extent to which an officer displayed the Coast Guard\'s core values of honor, respect, and devotion to duty.',
    'Health and Well Being': 'Ability to invest in the Coast Guard\'s future by caring for the physical health, safety, and emotional well-being of self and others.'
  };

  // Enlisted competency descriptions
  const enlistedCompetencyDescriptions: Record<string, string> = {
    'Military Bearing': 'The degree to which the member adhered to uniform and grooming standards, and projected a professional image that brought credit to the Coast Guard.',
    'Customs, Courtesies, and Traditions': 'The extent to which the member conformed to military customs, courtesies, traditions, and protocols.',
    'Quality of Work': 'The degree to which the member utilized knowledge, skills, and expertise to effectively organize and prioritize tasks. Completed quality work and met customer needs.',
    'Technical Proficiency': 'The degree to which the member demonstrated technical competency and proficiency for rating or current assignment.',
    'Initiative': 'The degree to which the member was a self-starter and completed meaningful accomplishments.',
    'Strategic Thinking': 'The degree to which the member led or influenced the development and implementation of unit or organizational objectives.',
    'Decision Making and Problem Solving': 'The degree to which the member made sound decisions and provided valid recommendations by using facts, experience, risk assessment, and analytical thought.',
    'Military Readiness': 'The degree to which the member effectively identified and managed stress, and engaged in activities that promoted physical fitness and emotional well-being.',
    'Self-Awareness and Learning': 'The degree to which the member continued to assess self, develop professionally, improve current skills and knowledge, and acquire new skills.',
    'Team Building': 'The degree to which the member promoted teamwork, cooperation, and collaboration among peers, subordinates, and superiors.',
    'Partnering': 'The degree to which the member collaborated across organizational boundaries with stakeholders to enhance and execute assigned duties and tasks.',
    'Respect for Others': 'The degree to which the member fostered an environment that supported diversity, fairness, dignity, compassion, and creativity.',
    'Accountability and Responsibility': 'The degree to which the member took responsibility of assigned duties and work area. Held self and others accountable to Coast Guard standards.',
    'Influencing Others': 'The degree to which the member effectively persuaded and motivated others to achieve goals.',
    'Workforce Management': 'The degree to which the member effectively managed, mentored, and directed assigned personnel in accordance with Coast Guard policy.',
    'Effective Communication': 'The degree to which the member effectively utilized all forms of communication in formal and informal settings.',
    'Chiefs Mess Leadership and Participation': 'The degree to which this CPO/SCPO supported the Chiefs Mess and the MCPOCG\'s Mission, Vision, Guiding Principles, and Standing Orders.'
  };

  if (rankCategory === 'Officer') {
    return officerCompetencyDescriptions[competency] || 
      'Ability to perform duties effectively and demonstrate competence in this area.';
  } else {
    return enlistedCompetencyDescriptions[competency] || 
      'Ability to perform duties effectively and demonstrate competence in this area.';
  }
}
