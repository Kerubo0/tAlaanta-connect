import OpenAI from 'openai';

// Initialize OpenAI client
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

let openai: OpenAI | null = null;

if (apiKey && apiKey !== 'your-openai-api-key-here') {
  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
  });
}

export interface JobMatchScore {
  score: number; // 0-100
  reasons: string[];
  skillsMatch: string[];
  skillsGap: string[];
  recommendation: string;
}

export interface ProposalSuggestion {
  improvedProposal: string;
  tips: string[];
  estimatedSuccessRate: number;
}

/**
 * AI-powered job matching
 * Analyzes freelancer profile against job requirements
 */
export async function matchJobToFreelancer(
  jobDescription: string,
  jobRequirements: string[],
  freelancerSkills: string[],
  freelancerBio: string,
  freelancerExperience: string
): Promise<JobMatchScore> {
  if (!openai) {
    // Fallback to simple matching if OpenAI not configured
    return simpleJobMatch(jobRequirements, freelancerSkills);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI job matching assistant for a Web3 freelance marketplace. 
          Analyze the job requirements against the freelancer's profile and provide a detailed match score.
          Return your response as valid JSON only, with no additional text.`
        },
        {
          role: 'user',
          content: `Job Description: ${jobDescription}
          
Required Skills: ${jobRequirements.join(', ')}

Freelancer Skills: ${freelancerSkills.join(', ')}
Freelancer Bio: ${freelancerBio}
Freelancer Experience: ${freelancerExperience}

Analyze this match and respond with JSON in this exact format:
{
  "score": <number 0-100>,
  "reasons": ["<reason1>", "<reason2>"],
  "skillsMatch": ["<matched skills>"],
  "skillsGap": ["<missing skills>"],
  "recommendation": "<one sentence recommendation>"
}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error('AI job matching error:', error);
    return simpleJobMatch(jobRequirements, freelancerSkills);
  }
}

/**
 * AI-powered proposal enhancement
 * Helps freelancers write better proposals
 */
export async function enhanceProposal(
  jobTitle: string,
  jobDescription: string,
  currentProposal: string,
  freelancerSkills: string[]
): Promise<ProposalSuggestion> {
  if (!openai) {
    return {
      improvedProposal: currentProposal,
      tips: ['Connect OpenAI API key to get AI-powered proposal suggestions'],
      estimatedSuccessRate: 50
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert proposal writer for freelancers on a Web3 marketplace.
          Help improve proposals to increase acceptance rates. Be professional, concise, and highlight relevant skills.
          Return your response as valid JSON only.`
        },
        {
          role: 'user',
          content: `Job: ${jobTitle}
Job Description: ${jobDescription}

Current Proposal:
${currentProposal}

Freelancer Skills: ${freelancerSkills.join(', ')}

Improve this proposal and respond with JSON in this exact format:
{
  "improvedProposal": "<improved version>",
  "tips": ["<tip1>", "<tip2>", "<tip3>"],
  "estimatedSuccessRate": <number 0-100>
}`
        }
      ],
      temperature: 0.8,
      max_tokens: 600
    });

    const content = response.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error('AI proposal enhancement error:', error);
    return {
      improvedProposal: currentProposal,
      tips: ['Be specific about your relevant experience', 'Include timeline and deliverables', 'Show enthusiasm for the project'],
      estimatedSuccessRate: 50
    };
  }
}

/**
 * AI Chatbot for platform support
 * Answers user questions about the platform
 */
export async function getChatbotResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  if (!openai) {
    return "I'm sorry, the AI assistant is currently not configured. Please set up your OpenAI API key to enable this feature.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant for TalentBridge, a decentralized Web3 freelance marketplace.

=== PLATFORM OVERVIEW ===
TalentBridge is a zero-fee Web3 freelance marketplace that connects clients and freelancers directly through blockchain technology.

=== KEY FEATURES ===
• Zero Platform Fees: 0% commission - freelancers keep 100% of earnings
• Smart Contract Escrow: Automated, trustless payment protection
• Milestone-Based Payments: Break projects into phases with partial releases
• On-Chain Reputation: Immutable reviews stored on blockchain
• Instant Crypto Payments: Get paid in ETH immediately upon approval
• MetaMask Integration: Easy wallet connection for Web3 authentication

=== TECHNICAL DETAILS ===
• Network: Ethereum Sepolia Testnet (for testing)
• Payment Token: ETH (Ethereum)
• Smart Contracts: Escrow and Reputation contracts
• Storage: IPFS for portfolios, Firebase for profiles
• Real-time: Chat messaging system

=== HOW IT WORKS ===

For Freelancers:
1. Connect MetaMask wallet
2. Create profile with skills and portfolio
3. Browse jobs with AI-powered matching
4. Submit proposals (use AI Proposal Assistant!)
5. Get hired and deliver work
6. Receive instant payment when milestones approved
7. Build on-chain reputation

For Clients:
1. Connect MetaMask wallet
2. Post a job with budget and requirements
3. Review proposals from freelancers
4. Choose a freelancer and create contract
5. Fund escrow with milestone amounts
6. Approve work and release payments
7. Leave on-chain reviews

=== ESCROW SYSTEM ===
• Client locks ETH in smart contract
• Funds held securely until work approved
• Milestone-based releases (e.g., 30% upfront, 70% on completion)
• Dispute resolution available if needed
• No middleman can access funds

=== AI FEATURES ===
1. AI Job Matching: See how well you match each job (0-100%)
2. AI Proposal Assistant: Get help writing winning proposals
3. Smart Chatbot: That's me! Ask anything 24/7

=== WALLET SETUP ===
To connect MetaMask:
1. Install MetaMask browser extension
2. Create wallet or import existing
3. Switch to Sepolia testnet
4. Get free test ETH from faucet
5. Click "Connect Wallet" on TalentBridge
6. Approve connection in MetaMask

=== COMMON QUESTIONS ===
Q: How do I get test ETH?
A: Use Sepolia faucet: https://sepoliafaucet.com

Q: Are there really no fees?
A: Zero platform fees! Only gas fees for blockchain transactions.

Q: How do disputes work?
A: Smart contracts have built-in dispute resolution - funds stay locked until resolved.

Q: Is my money safe?
A: Yes! Smart contracts are audited and funds locked until work approved.

Q: Can I use other tokens?
A: Currently only ETH, but multi-token support coming soon.

=== NAVIGATION ===
• Home: Landing page with platform info
• Find Work: Browse all available jobs
• Post Job: Create a new job listing
• Dashboard: View your contracts and earnings
• Messages: Chat with clients/freelancers
• Profile: Manage your skills and portfolio

Be friendly, concise, and helpful. Use emojis occasionally. Keep responses under 150 words unless explaining complex topics.`
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process that. Please try again.";
  } catch (error) {
    console.error('Chatbot error:', error);
    return "I'm experiencing technical difficulties. Please try again in a moment.";
  }
}

/**
 * Simple fallback job matching (no AI)
 */
function simpleJobMatch(
  requiredSkills: string[],
  freelancerSkills: string[]
): JobMatchScore {
  const matchedSkills = requiredSkills.filter(req =>
    freelancerSkills.some(skill => 
      skill.toLowerCase().includes(req.toLowerCase()) ||
      req.toLowerCase().includes(skill.toLowerCase())
    )
  );

  const skillsGap = requiredSkills.filter(req =>
    !matchedSkills.includes(req)
  );

  const score = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  return {
    score,
    reasons: [
      `Matched ${matchedSkills.length} out of ${requiredSkills.length} required skills`,
      score >= 70 ? 'Strong match' : score >= 40 ? 'Moderate match' : 'Weak match'
    ],
    skillsMatch: matchedSkills,
    skillsGap,
    recommendation: score >= 70
      ? 'Highly recommended - apply now!'
      : score >= 40
      ? 'Consider applying if you can learn missing skills quickly'
      : 'Consider building more relevant skills first'
  };
}

export { openai };
