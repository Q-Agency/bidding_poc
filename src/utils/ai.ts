import { AIAnalysisResult } from '@/types/rfp';

// Mock RFP samples to simulate different types of projects
const mockRfpSamples = [
  {
    title: 'Enterprise Data Analytics Platform Development',
    description: `Seeking proposals for the development of a comprehensive data analytics platform that will serve as the organization's central hub for business intelligence and data-driven decision making. The platform should integrate with existing data sources, provide real-time analytics capabilities, and offer intuitive visualization tools for non-technical users. Key focus areas include data warehouse integration, ETL processes, and machine learning capabilities for predictive analytics.`,
    company: {
      id: 'company_1',
      name: 'DataTech Solutions Inc.',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=DTS'
    },
    estimatedBudget: '$250,000 - $400,000',
    keyRequirements: [
      'Cloud-native architecture using AWS or Azure',
      'Real-time data processing capabilities',
      'Integration with existing SQL and NoSQL databases',
      'Interactive dashboards and customizable reporting',
      'Machine learning model deployment infrastructure',
      'Role-based access control (RBAC)',
      'Data encryption at rest and in transit',
      'Automated ETL pipeline development',
      'Support for minimum 10,000 concurrent users',
      'High availability with 99.9% uptime SLA'
    ],
    certifications: [
      'AWS Certified Solutions Architect',
      'Azure Data Engineer Associate',
      'Certified Information Systems Security Professional (CISSP)',
      'Certified Data Management Professional (CDMP)'
    ],
    compliance: [
      'SOC 2 Type II',
      'ISO 27001',
      'GDPR',
      'CCPA'
    ],
    industryStandards: [
      'DAMA-DMBOK Framework',
      'NIST Cybersecurity Framework',
      'The Open Group Architecture Framework (TOGAF)',
      'Data Management Capability Assessment Model (DCAM)'
    ],
    teamRequirements: {
      roles: [
        'Lead Data Architect',
        'Senior Data Engineers',
        'ML/AI Specialists',
        'Data Security Expert',
        'ETL Developers'
      ],
      experience: '5+ years in enterprise data solutions',
      size: '8-12 team members'
    },
    suggestedDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    suggestedCategory: 'Data Analytics',
  },
  {
    title: 'Mobile Banking Application Modernization',
    description: `Project to modernize our existing mobile banking application with enhanced security features, improved user experience, and additional functionality. The solution should maintain compliance with financial regulations while introducing modern technologies and architectural patterns. Focus on creating a scalable, secure, and user-friendly mobile banking experience that supports both retail and business banking customers.`,
    company: {
      id: 'company_2',
      name: 'SecureBank Financial Group',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=SFG'
    },
    estimatedBudget: '$300,000 - $500,000',
    keyRequirements: [
      'Biometric authentication integration',
      'Real-time transaction processing',
      'PCI DSS and GDPR compliance',
      'Integration with existing core banking systems',
      'Push notification system for alerts',
      'Offline transaction capabilities',
      'Multi-factor authentication',
      'Cross-platform support (iOS and Android)',
      'Automated CI/CD pipeline',
      'Performance optimization for low-bandwidth conditions'
    ],
    certifications: [
      'Payment Card Industry Professional (PCIP)',
      'Certified Information Systems Auditor (CISA)',
      'AWS Financial Services Competency',
      'Certified Information Systems Security Professional (CISSP)'
    ],
    compliance: [
      'PCI DSS',
      'SOX',
      'GDPR',
      'Basel III',
      'FFIEC Guidelines'
    ],
    industryStandards: [
      'ISO 20022 Financial Messaging',
      'OpenAPI Specification',
      'OAuth 2.0 and OpenID Connect',
      'NIST Cybersecurity Framework'
    ],
    teamRequirements: {
      roles: [
        'Mobile Security Architect',
        'iOS/Android Developers',
        'Backend Engineers',
        'Financial Systems Integration Specialist',
        'UX/UI Designer'
      ],
      experience: '7+ years in financial software development',
      size: '10-15 team members'
    },
    suggestedDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    suggestedCategory: 'Mobile Development',
  },
  {
    title: 'Cloud Infrastructure Migration',
    description: `Comprehensive cloud migration project to transition our on-premises infrastructure to a cloud-native environment. The project includes assessment of current infrastructure, planning and execution of migration, and optimization of cloud resources. Emphasis on maintaining business continuity, optimizing costs, and implementing modern DevOps practices.`,
    company: {
      id: 'company_3',
      name: 'CloudFirst Enterprises',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CFE'
    },
    estimatedBudget: '$150,000 - $300,000',
    keyRequirements: [
      'Infrastructure as Code (IaC) implementation',
      'Zero-downtime migration strategy',
      'Multi-region disaster recovery setup',
      'Cost optimization and monitoring',
      'Security compliance and governance',
      'Automated backup and recovery systems',
      'Performance monitoring and alerting',
      'Container orchestration setup',
      'Network security and VPN configuration',
      'Documentation and knowledge transfer'
    ],
    certifications: [
      'AWS Certified Solutions Architect Professional',
      'Google Cloud Professional Architect',
      'Azure Solutions Architect Expert',
      'Certified Kubernetes Administrator (CKA)'
    ],
    compliance: [
      'ISO 27017 (Cloud Security)',
      'SOC 2 Type II',
      'HIPAA',
      'FedRAMP'
    ],
    industryStandards: [
      'Cloud Security Alliance (CSA) Framework',
      'IT Infrastructure Library (ITIL)',
      'DevOps Institute Framework',
      'Cloud Native Computing Foundation Standards'
    ],
    teamRequirements: {
      roles: [
        'Cloud Architecture Lead',
        'DevOps Engineers',
        'Security Specialist',
        'Network Engineers',
        'Migration Specialists'
      ],
      experience: '6+ years in cloud infrastructure',
      size: '6-8 team members'
    },
    suggestedDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    suggestedCategory: 'Cloud Services',
  },
  {
    title: 'AI-Powered Customer Service Platform',
    description: `Development of an intelligent customer service platform that leverages artificial intelligence to enhance customer support operations. The system should include chatbot capabilities, sentiment analysis, automated ticket routing, and integration with existing CRM systems. Focus on scalability, accuracy of AI models, and seamless human agent handoff.`,
    company: {
      id: 'company_4',
      name: 'InnovateAI Solutions',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=IAS'
    },
    estimatedBudget: '$200,000 - $350,000',
    keyRequirements: [
      'Natural Language Processing capabilities',
      'Multi-language support',
      'Integration with popular CRM platforms',
      'Real-time sentiment analysis',
      'Automated ticket classification and routing',
      'Customizable chatbot workflows',
      'Analytics and reporting dashboard',
      'API-first architecture',
      'Learning and improvement mechanisms',
      'GDPR and CCPA compliance'
    ],
    certifications: [
      'AWS Machine Learning Specialty',
      'Google Cloud Professional Data Engineer',
      'Microsoft Azure AI Engineer',
      'TensorFlow Developer Certificate'
    ],
    compliance: [
      'GDPR',
      'CCPA',
      'ISO 27001',
      'SOC 2 Type II',
      'HIPAA (for healthcare implementations)'
    ],
    industryStandards: [
      'IEEE Standards for AI Ethics',
      'ISO/IEC JTC 1/SC 42 (Artificial Intelligence)',
      'MLOps Standards',
      'Open Neural Network Exchange (ONNX)'
    ],
    teamRequirements: {
      roles: [
        'AI/ML Lead Engineer',
        'NLP Specialists',
        'Full-stack Developers',
        'Data Scientists',
        'UX Researchers'
      ],
      experience: '4+ years in AI/ML development',
      size: '7-10 team members'
    },
    suggestedDeadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    suggestedCategory: 'Artificial Intelligence',
  }
];

export async function analyzeDocument(file: File): Promise<AIAnalysisResult> {
  // This is a mock implementation. In a real application, you would:
  // 1. Upload the file to your server
  // 2. Extract text from the document (using a library like pdf.js for PDFs)
  // 3. Send the text to OpenAI's API for analysis
  // 4. Process the response and return the structured data

  // Simulating API delay with random duration between 1.5 and 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1500));

  // Randomly select one of the mock samples
  const mockResponse = mockRfpSamples[Math.floor(Math.random() * mockRfpSamples.length)];

  // Add some randomization to the budget and deadline to make it more realistic
  const budgetVariation = 0.1; // 10% variation
  const [min, max] = mockResponse.estimatedBudget
    .replace(/[^0-9,-]/g, '')
    .split('-')
    .map(n => parseInt(n.replace(/,/g, '')));
  
  const adjustedMin = Math.round(min * (1 + (Math.random() * 2 - 1) * budgetVariation));
  const adjustedMax = Math.round(max * (1 + (Math.random() * 2 - 1) * budgetVariation));
  
  const daysVariation = Math.floor(Math.random() * 14) - 7; // +/- 7 days
  const adjustedDeadline = new Date(new Date(mockResponse.suggestedDeadline).getTime() + daysVariation * 24 * 60 * 60 * 1000);

  return {
    ...mockResponse,
    estimatedBudget: `$${adjustedMin.toLocaleString()} - $${adjustedMax.toLocaleString()}`,
    suggestedDeadline: adjustedDeadline.toISOString().split('T')[0],
    company: {
      id: mockResponse.company.id,
      name: mockResponse.company.name,
      logo: mockResponse.company.logo
    }
  };
}

// In a real implementation, you would have something like this:
/*
async function analyzeWithOpenAI(text: string): Promise<AIAnalysisResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant specialized in analyzing RFP (Request for Proposal) documents.
            Your task is to extract and structure key information from RFP documents.
            Focus on identifying:
            - The main project title and scope
            - A comprehensive project description
            - Budget expectations and constraints
            - Key technical and business requirements
            - Timeline and deadline considerations
            - The most appropriate category for the project
            
            Provide detailed, professional analysis while maintaining accuracy and relevance.`,
        },
        {
          role: 'user',
          content: `Please analyze this RFP document and extract the following information in JSON format:
            - title (clear, concise project title)
            - description (detailed summary of the project scope and objectives)
            - estimated budget range (realistic market-based estimate)
            - key requirements (comprehensive list of technical and business requirements)
            - suggested deadline (based on project complexity and requirements)
            - suggested category (matching the project's primary focus)
            
            Document text:
            ${text}`,
        },
      ],
      temperature: 0.3, // Lower temperature for more focused, consistent outputs
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
*/ 