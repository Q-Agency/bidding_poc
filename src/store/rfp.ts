import { create } from 'zustand';
import type { RFP, RFPFormData, BidFormData } from '@/types/rfp';

// Mock RFPs with bids
const mockRfps: RFP[] = [
  {
    id: 'rfp_1',
    title: 'AI-Powered Customer Service Platform',
    description: 'Development of an AI-driven customer service platform with natural language processing capabilities and automated ticket routing.',
    company: {
      id: 'company1@example.com',
      name: 'Tech Solutions Inc.',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TS'
    },
    budget: '$150,000 - $250,000',
    deadline: '2024-07-15',
    category: 'Artificial Intelligence',
    requirements: [
      'Natural Language Processing',
      'Machine Learning Models',
      'Real-time Analytics',
      'Multi-language Support'
    ],
    certifications: ['AWS Machine Learning Specialty', 'Google Cloud Professional Data Engineer'],
    compliance: ['SOC 2', 'GDPR', 'CCPA'],
    industryStandards: ['ISO 27001', 'ITIL v4'],
    teamRequirements: {
      roles: ['ML Engineer', 'NLP Specialist', 'Full Stack Developer'],
      experience: '4+ years',
      size: '5-7 team members'
    },
    status: 'published',
    documents: [
      {
        name: 'Technical Requirements.pdf',
        url: '/documents/tech_req.pdf'
      }
    ],
    bids: [
      {
        id: 'bid_1',
        companyId: 'comp_1',
        companyName: 'AI Solutions Pro',
        proposedBudget: '$180,000',
        proposedTimeline: '4 months',
        status: 'pending',
        submittedAt: '2024-03-01T10:00:00Z'
      },
      {
        id: 'bid_2',
        companyId: 'comp_2',
        companyName: 'DataMinds Inc',
        proposedBudget: '$220,000',
        proposedTimeline: '5 months',
        status: 'accepted',
        submittedAt: '2024-03-02T15:30:00Z'
      },
      {
        id: 'bid_3',
        companyId: 'comp_3',
        companyName: 'Neural Systems',
        proposedBudget: '$195,000',
        proposedTimeline: '6 months',
        status: 'rejected',
        submittedAt: '2024-03-03T09:15:00Z'
      }
    ],
    createdAt: '2024-02-28T00:00:00Z',
    updatedAt: '2024-03-05T00:00:00Z'
  },
  {
    id: 'rfp_2',
    title: 'Blockchain Supply Chain Tracking System',
    description: 'Implementation of a blockchain-based supply chain tracking system with real-time monitoring and smart contract integration.',
    company: {
      id: 'company2@example.com',
      name: 'LogisticsPro Corp',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=LP'
    },
    budget: '$200,000 - $350,000',
    deadline: '2024-08-30',
    category: 'Blockchain',
    requirements: [
      'Smart Contract Development',
      'Supply Chain Integration',
      'Real-time Tracking',
      'Mobile App Development'
    ],
    certifications: ['Certified Blockchain Professional', 'Ethereum Developer'],
    compliance: ['ISO 9001', 'GMP'],
    industryStandards: ['GS1', 'EDI'],
    teamRequirements: {
      roles: ['Blockchain Developer', 'Supply Chain Specialist', 'Smart Contract Engineer'],
      experience: '3+ years',
      size: '4-6 team members'
    },
    status: 'published',
    documents: [
      {
        name: 'System Architecture.pdf',
        url: '/documents/arch.pdf'
      }
    ],
    bids: [
      {
        id: 'bid_4',
        companyId: 'comp_4',
        companyName: 'BlockTech Solutions',
        proposedBudget: '$280,000',
        proposedTimeline: '6 months',
        status: 'pending',
        submittedAt: '2024-03-05T11:20:00Z'
      },
      {
        id: 'bid_5',
        companyId: 'comp_5',
        companyName: 'Chain Innovators',
        proposedBudget: '$320,000',
        proposedTimeline: '5 months',
        status: 'pending',
        submittedAt: '2024-03-06T14:45:00Z'
      }
    ],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-06T00:00:00Z'
  },
  {
    id: 'rfp_3',
    title: 'IoT Fleet Management Platform',
    description: 'Development of an IoT-based fleet management system with real-time tracking, predictive maintenance, and fuel optimization.',
    company: {
      id: 'company1@example.com',
      name: 'Tech Solutions Inc.',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TS'
    },
    budget: '$300,000 - $450,000',
    deadline: '2024-09-15',
    category: 'IoT Development',
    requirements: [
      'Real-time GPS Tracking',
      'Predictive Analytics',
      'Mobile App Development',
      'Sensor Integration'
    ],
    certifications: ['AWS IoT Specialty', 'Azure IoT Developer'],
    compliance: ['ISO 27001', 'GDPR'],
    industryStandards: ['MQTT', 'OPC UA'],
    teamRequirements: {
      roles: ['IoT Solutions Architect', 'Embedded Systems Engineer', 'Mobile Developer'],
      experience: '5+ years',
      size: '6-8 team members'
    },
    status: 'closed',
    documents: [
      {
        name: 'IoT Architecture.pdf',
        url: '/documents/iot_arch.pdf'
      }
    ],
    bids: [
      {
        id: 'bid_6',
        companyId: 'comp_6',
        companyName: 'Connected Systems Inc',
        proposedBudget: '$380,000',
        proposedTimeline: '7 months',
        status: 'accepted',
        submittedAt: '2024-03-02T10:30:00Z'
      },
      {
        id: 'bid_7',
        companyId: 'comp_7',
        companyName: 'IoT Experts LLC',
        proposedBudget: '$420,000',
        proposedTimeline: '6 months',
        status: 'rejected',
        submittedAt: '2024-03-03T15:45:00Z'
      },
      {
        id: 'bid_8',
        companyId: 'comp_8',
        companyName: 'Smart Fleet Solutions',
        proposedBudget: '$400,000',
        proposedTimeline: '8 months',
        status: 'rejected',
        submittedAt: '2024-03-04T09:20:00Z'
      }
    ],
    createdAt: '2024-02-25T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z'
  },
  {
    id: 'rfp_4',
    title: 'Cybersecurity Infrastructure Enhancement',
    description: 'Implementation of advanced cybersecurity measures including zero-trust architecture, enhanced threat detection, and automated incident response systems.',
    company: {
      id: 'company2@example.com',
      name: 'SecureNet Dynamics',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=SD'
    },
    budget: '$200,000 - $350,000',
    deadline: '2024-08-30',
    category: 'Cybersecurity',
    requirements: [
      'Zero-trust architecture implementation',
      'Advanced threat detection system',
      'Security information and event management (SIEM)',
      'Automated incident response',
      'Security awareness training platform'
    ],
    certifications: ['CISSP', 'CEH', 'CompTIA Security+'],
    compliance: ['ISO 27001', 'NIST CSF', 'SOC 2'],
    industryStandards: ['MITRE ATT&CK', 'CIS Controls'],
    teamRequirements: {
      roles: ['Security Architect', 'Security Engineers', 'Threat Analysts'],
      experience: '5+ years',
      size: '5-7 team members'
    },
    status: 'published',
    documents: [
      {
        name: 'Cybersecurity Enhancement Project RFP.pdf',
        url: '/mock-documents/rfp_4_full.pdf'
      },
      {
        name: 'Security Architecture Requirements.pdf',
        url: '/mock-documents/rfp_4_architecture.pdf'
      },
      {
        name: 'Compliance Framework.pdf',
        url: '/mock-documents/rfp_4_compliance.pdf'
      }
    ],
    bids: [
      {
        id: 'bid_15',
        companyId: 'comp_15',
        companyName: 'SecureDefend Solutions',
        proposedBudget: '$290,000',
        proposedTimeline: '5 months',
        status: 'pending',
        submittedAt: '2024-03-10T09:15:00Z'
      },
      {
        id: 'bid_16',
        companyId: 'comp_16',
        companyName: 'CyberGuard Pro',
        proposedBudget: '$320,000',
        proposedTimeline: '4 months',
        status: 'pending',
        submittedAt: '2024-03-11T14:30:00Z'
      },
      {
        id: 'bid_17',
        companyId: 'comp_17',
        companyName: 'NetSec Experts',
        proposedBudget: '$275,000',
        proposedTimeline: '6 months',
        status: 'pending',
        submittedAt: '2024-03-12T11:45:00Z'
      }
    ],
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z'
  },
  {
    id: 'rfp_5',
    title: 'IoT Fleet Management System',
    description: 'Development of a comprehensive IoT-based fleet management system for real-time vehicle tracking, maintenance prediction, and fuel efficiency optimization.',
    company: {
      id: 'company2@example.com',
      name: 'FleetTech Innovations',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=FI'
    },
    budget: '$300,000 - $450,000',
    deadline: '2024-09-15',
    category: 'IoT Development',
    requirements: [
      'Real-time GPS tracking',
      'Predictive maintenance algorithms',
      'Fuel efficiency optimization',
      'Driver behavior analysis',
      'Mobile app for fleet managers'
    ],
    certifications: ['AWS IoT Specialty', 'Azure IoT Developer'],
    compliance: ['GDPR', 'CCPA', 'ISO 27001'],
    industryStandards: ['MQTT', 'OPC UA', 'ISO 16844'],
    teamRequirements: {
      roles: ['IoT Solutions Architect', 'Embedded Systems Engineers', 'Mobile Developers'],
      experience: '4+ years',
      size: '6-8 team members'
    },
    status: 'published',
    documents: [
      {
        name: 'IoT Fleet Management System RFP.pdf',
        url: '/mock-documents/rfp_5_full.pdf'
      }
    ],
    bids: [
      {
        id: 'bid_18',
        companyId: 'comp_18',
        companyName: 'FleetConnect Systems',
        proposedBudget: '$380,000',
        proposedTimeline: '5 months',
        status: 'pending',
        submittedAt: '2024-03-08T10:15:00Z'
      },
      {
        id: 'bid_19',
        companyId: 'comp_19',
        companyName: 'AutoTech Solutions',
        proposedBudget: '$420,000',
        proposedTimeline: '4 months',
        status: 'accepted',
        submittedAt: '2024-03-09T15:30:00Z'
      },
      {
        id: 'bid_20',
        companyId: 'comp_20',
        companyName: 'Smart Fleet Analytics',
        proposedBudget: '$395,000',
        proposedTimeline: '6 months',
        status: 'rejected',
        submittedAt: '2024-03-10T12:45:00Z'
      }
    ],
    createdAt: '2024-02-21T00:00:00Z',
    updatedAt: '2024-02-21T00:00:00Z'
  },
  {
    id: 'rfp_6',
    title: 'Blockchain Supply Chain Platform',
    description: 'Creation of a blockchain-based supply chain management platform for end-to-end tracking, authenticity verification, and smart contract automation.',
    company: {
      id: 'company1@example.com',
      name: 'ChainLogix Solutions',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CS'
    },
    budget: '$400,000 - $600,000',
    deadline: '2024-10-01',
    category: 'Blockchain',
    requirements: [
      'Smart contract development',
      'Supply chain tracking system',
      'Product authenticity verification',
      'Integration with existing ERP systems',
      'Mobile app for stakeholders'
    ],
    certifications: ['Certified Blockchain Professional', 'Ethereum Developer'],
    compliance: ['GDPR', 'FDA CFR Part 11'],
    industryStandards: ['GS1', 'ISO 28000'],
    teamRequirements: {
      roles: ['Blockchain Architect', 'Smart Contract Developers', 'Full Stack Engineers'],
      experience: '3+ years',
      size: '7-10 team members'
    },
    status: 'published',
    documents: [
      {
        name: 'Blockchain Supply Chain Platform RFP.pdf',
        url: '/mock-documents/rfp_6_full.pdf'
      },
      {
        name: 'Smart Contract Specifications.pdf',
        url: '/mock-documents/rfp_6_contracts.pdf'
      }
    ],
    bids: [
      {
        id: 'bid_21',
        companyId: 'comp_21',
        companyName: 'ChainTech Innovations',
        proposedBudget: '$450,000',
        proposedTimeline: '7 months',
        status: 'pending',
        submittedAt: '2024-03-05T09:30:00Z'
      },
      {
        id: 'bid_22',
        companyId: 'comp_22',
        companyName: 'BlockMaster Solutions',
        proposedBudget: '$520,000',
        proposedTimeline: '5 months',
        status: 'accepted',
        submittedAt: '2024-03-06T14:15:00Z'
      },
      {
        id: 'bid_23',
        companyId: 'comp_23',
        companyName: 'SupplyChain Experts',
        proposedBudget: '$480,000',
        proposedTimeline: '6 months',
        status: 'rejected',
        submittedAt: '2024-03-07T11:45:00Z'
      }
    ],
    createdAt: '2024-02-22T00:00:00Z',
    updatedAt: '2024-02-22T00:00:00Z'
  },
  {
    id: 'rfp_7',
    title: 'AR Training Platform Development',
    description: 'Development of an augmented reality training platform for industrial maintenance and repair procedures, including 3D model integration and step-by-step guidance.',
    company: {
      id: 'company1@example.com',
      name: 'IndustrialXR Labs',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=IL'
    },
    budget: '$350,000 - $500,000',
    deadline: '2024-09-30',
    category: 'AR/VR Development',
    requirements: [
      '3D model visualization',
      'Step-by-step AR guidance',
      'Offline mode support',
      'Multi-platform compatibility',
      'Analytics dashboard'
    ],
    certifications: ['Unity Developer', 'ARCore/ARKit Developer'],
    compliance: ['OSHA Standards', 'ISO 9001'],
    industryStandards: ['WebXR', 'glTF', 'OpenXR'],
    teamRequirements: {
      roles: ['AR/VR Developer', '3D Artists', 'UX Specialists'],
      experience: '4+ years',
      size: '5-8 team members'
    },
    status: 'published',
    documents: [
      {
        name: 'AR Training Platform RFP.pdf',
        url: '/mock-documents/rfp_7_full.pdf'
      },
      {
        name: '3D Asset Requirements.pdf',
        url: '/mock-documents/rfp_7_3d_assets.pdf'
      },
      {
        name: 'Training Module Guidelines.pdf',
        url: '/mock-documents/rfp_7_training.pdf'
      }
    ],
    bids: [
      {
        id: 'bid_24',
        companyId: 'comp_24',
        companyName: 'XR Training Solutions',
        proposedBudget: '$420,000',
        proposedTimeline: '5 months',
        status: 'pending',
        submittedAt: '2024-03-08T10:30:00Z'
      },
      {
        id: 'bid_25',
        companyId: 'comp_25',
        companyName: 'Industrial AR Labs',
        proposedBudget: '$460,000',
        proposedTimeline: '4 months',
        status: 'pending',
        submittedAt: '2024-03-09T15:45:00Z'
      },
      {
        id: 'bid_26',
        companyId: 'comp_26',
        companyName: 'Reality Tech Pro',
        proposedBudget: '$440,000',
        proposedTimeline: '6 months',
        status: 'pending',
        submittedAt: '2024-03-10T12:15:00Z'
      }
    ],
    createdAt: '2024-02-23T00:00:00Z',
    updatedAt: '2024-02-23T00:00:00Z'
  },
  {
    id: 'rfp_8',
    title: 'Healthcare Data Analytics Platform',
    description: 'Development of a comprehensive healthcare data analytics platform for patient outcome prediction, resource optimization, and clinical decision support.',
    company: {
      id: 'company1@example.com',
      name: 'MedAnalytics Pro',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=MP'
    },
    budget: '$450,000 - $700,000',
    deadline: '2024-10-15',
    category: 'Healthcare IT',
    requirements: [
      'Patient outcome prediction',
      'Resource utilization analytics',
      'Clinical decision support',
      'EHR system integration',
      'HIPAA-compliant infrastructure'
    ],
    certifications: ['HIMSS Certification', 'HL7 Certification'],
    compliance: ['HIPAA', 'HITECH', 'FDA CFR Part 11'],
    industryStandards: ['HL7 FHIR', 'DICOM', 'IHE'],
    teamRequirements: {
      roles: ['Healthcare IT Architect', 'Clinical Data Scientists', 'Security Specialists'],
      experience: '6+ years',
      size: '8-12 team members'
    },
    status: 'published',
    documents: [
      {
        name: 'Healthcare Analytics Platform RFP.pdf',
        url: '/mock-documents/rfp_8_full.pdf'
      },
      {
        name: 'HIPAA Compliance Requirements.pdf',
        url: '/mock-documents/rfp_8_hipaa.pdf'
      }
    ],
    bids: [
      {
        id: 'bid_27',
        companyId: 'comp_27',
        companyName: 'HealthTech Analytics',
        proposedBudget: '$580,000',
        proposedTimeline: '8 months',
        status: 'pending',
        submittedAt: '2024-03-11T09:45:00Z'
      },
      {
        id: 'bid_28',
        companyId: 'comp_28',
        companyName: 'Clinical Data Systems',
        proposedBudget: '$650,000',
        proposedTimeline: '7 months',
        status: 'accepted',
        submittedAt: '2024-03-12T14:30:00Z'
      },
      {
        id: 'bid_29',
        companyId: 'comp_29',
        companyName: 'MedAI Solutions',
        proposedBudget: '$620,000',
        proposedTimeline: '9 months',
        status: 'rejected',
        submittedAt: '2024-03-13T11:15:00Z'
      },
      {
        id: 'bid_30',
        companyId: 'comp_30',
        companyName: 'Healthcare Analytics Pro',
        proposedBudget: '$600,000',
        proposedTimeline: '6 months',
        status: 'pending',
        submittedAt: '2024-03-14T10:00:00Z'
      }
    ],
    createdAt: '2024-02-24T00:00:00Z',
    updatedAt: '2024-02-24T00:00:00Z'
  }
];

interface RFPStore {
  // RFP Management
  rfps: RFP[];
  currentRfp: RFP | null;
  isAnalyzing: boolean;
  
  // Bidding
  myBids: {
    [rfpId: string]: {
      id: string;
      status: 'draft' | 'submitted';
      formData: BidFormData;
    };
  };
  currentBid: string | null;

  // Actions
  addRfp: (rfp: RFP) => void;
  updateRfp: (id: string, rfp: Partial<RFP>) => void;
  setCurrentRfp: (rfp: RFP | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  
  // Bid Actions
  createBid: (rfpId: string) => void;
  updateBid: (rfpId: string, formData: Partial<BidFormData>) => void;
  submitBid: (rfpId: string) => Promise<void>;
  setCurrentBid: (bidId: string | null) => void;
}

export const useRfpStore = create<RFPStore>((set, get) => ({
  // Initial State
  rfps: mockRfps, // Initialize with mock RFPs
  currentRfp: null,
  isAnalyzing: false,
  myBids: {},
  currentBid: null,

  // RFP Actions
  addRfp: (rfp) => set((state) => ({ 
    rfps: [...state.rfps, rfp] 
  })),

  updateRfp: (id, updatedRfp) => set((state) => ({
    rfps: state.rfps.map((rfp) => 
      rfp.id === id ? { ...rfp, ...updatedRfp } : rfp
    )
  })),

  setCurrentRfp: (rfp) => set({ currentRfp: rfp }),
  
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  // Bid Actions
  createBid: (rfpId) => {
    const bidId = `bid_${Date.now()}`;
    const initialBid = {
      id: bidId,
      status: 'draft' as const,
      formData: {
        rfpId,
        proposedBudget: '',
        proposedTimeline: '',
        technicalProposal: '',
        teamComposition: [],
        documents: []
      }
    };

    set((state) => ({
      myBids: {
        ...state.myBids,
        [rfpId]: initialBid
      },
      currentBid: bidId
    }));
  },

  updateBid: (rfpId, formData) => set((state) => ({
    myBids: {
      ...state.myBids,
      [rfpId]: {
        ...state.myBids[rfpId],
        formData: {
          ...state.myBids[rfpId].formData,
          ...formData
        }
      }
    }
  })),

  submitBid: async (rfpId) => {
    const state = get();
    const bid = state.myBids[rfpId];
    
    if (!bid) return;

    // Here you would normally send the bid to your backend
    console.log('Submitting bid:', bid);

    set((state) => ({
      myBids: {
        ...state.myBids,
        [rfpId]: {
          ...state.myBids[rfpId],
          status: 'submitted'
        }
      }
    }));
  },

  setCurrentBid: (bidId) => set({ currentBid: bidId })
})); 