export interface RFP {
  id: string;
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  budget: string;
  deadline: string;
  category: string;
  requirements: string[];
  certifications: string[];
  compliance: string[];
  industryStandards: string[];
  teamRequirements: {
    roles: string[];
    experience: string;
    size: string;
  };
  status: 'draft' | 'published' | 'closed';
  documents: {
    name: string;
    url: string;
  }[];
  bids: {
    id: string;
    companyId: string;
    companyName: string;
    proposedBudget: string;
    proposedTimeline: string;
    status: 'pending' | 'accepted' | 'rejected';
    submittedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface RFPFormData {
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  budget: string;
  deadline: string;
  category: string;
  requirements: string[];
  certifications: string[];
  compliance: string[];
  industryStandards: string[];
  teamRequirements: {
    roles: string[];
    experience: string;
    size: string;
  };
  status: 'draft' | 'published' | 'closed';
}

export interface AIAnalysisResult {
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  estimatedBudget: string;
  keyRequirements: string[];
  suggestedDeadline: string;
  suggestedCategory: string;
  certifications: string[];
  compliance: string[];
  industryStandards: string[];
  teamRequirements: {
    roles: string[];
    experience: string;
    size: string;
  };
}

export interface BidFormData {
  rfpId: string;
  proposedBudget: string;
  proposedTimeline: string;
  technicalProposal: string;
  teamComposition: {
    role: string;
    experience: string;
    certifications: string[];
  }[];
  documents: {
    name: string;
    url: string;
  }[];
} 