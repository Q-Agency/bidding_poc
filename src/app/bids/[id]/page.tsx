'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Reuse the mock bids data
const mockBids = [
  {
    id: 'bid_1',
    rfpId: 'rfp_1',
    rfpTitle: 'Enterprise Data Analytics Platform Development',
    rfpCompany: {
      id: '1',
      name: 'Tech Solutions Inc.',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TS'
    },
    proposedBudget: '$285,000',
    proposedTimeline: '5 months',
    status: 'pending',
    submittedAt: '2024-02-15T10:00:00Z',
    deadline: '2024-06-30',
    technicalProposal: 'Comprehensive data analytics platform leveraging cloud-native architecture and machine learning capabilities.',
    technicalApproach: 'We will implement a microservices-based architecture using AWS services, including RedShift for data warehousing and SageMaker for ML operations.',
    methodology: 'Agile development with 2-week sprints, regular stakeholder reviews, and continuous integration/deployment pipeline.',
    deliverables: [
      'Cloud-native data analytics platform',
      'Real-time data processing pipeline',
      'Interactive dashboards',
      'ML model deployment infrastructure',
      'Documentation and training materials'
    ],
    projectMilestones: [
      {
        title: 'Project Initiation',
        duration: '2 weeks',
        description: 'Requirements gathering and architecture design'
      },
      {
        title: 'Platform Development',
        duration: '3 months',
        description: 'Core platform development and integration'
      },
      {
        title: 'ML Integration',
        duration: '1 month',
        description: 'Implementation of machine learning capabilities'
      },
      {
        title: 'Testing & Deployment',
        duration: '1 month',
        description: 'System testing, user acceptance, and production deployment'
      }
    ],
    teamComposition: [
      {
        role: 'Lead Data Architect',
        experience: '8+ years',
        certifications: ['AWS Certified Solutions Architect', 'Google Cloud Professional Data Engineer']
      },
      {
        role: 'Senior Data Engineer',
        experience: '5+ years',
        certifications: ['AWS Certified Data Analytics']
      },
      {
        role: 'ML Engineer',
        experience: '4+ years',
        certifications: ['TensorFlow Developer Certificate']
      }
    ],
    qualityAssurance: 'Comprehensive testing strategy including unit tests, integration tests, and performance testing. Regular code reviews and automated CI/CD pipeline.',
    riskMitigation: 'Regular risk assessment meetings, detailed contingency plans, and continuous monitoring of system performance and security.'
  },
  {
    id: 'bid_2',
    rfpId: 'rfp_2',
    rfpTitle: 'Mobile Banking Application Modernization',
    rfpCompany: {
      id: '1',
      name: 'FinTech Corp',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=FC'
    },
    proposedBudget: '$420,000',
    proposedTimeline: '7 months',
    status: 'accepted',
    submittedAt: '2024-02-10T14:30:00Z',
    deadline: '2024-08-15',
    technicalProposal: 'Modern, secure mobile banking platform with enhanced user experience and advanced security features.',
    technicalApproach: 'React Native for cross-platform development, integrated with secure banking APIs and biometric authentication.',
    methodology: 'Scrum methodology with 3-week sprints, focusing on security and compliance at each stage.',
    deliverables: [
      'iOS and Android mobile applications',
      'Secure transaction processing system',
      'Biometric authentication integration',
      'Push notification system',
      'Admin dashboard and reporting tools'
    ],
    projectMilestones: [
      {
        title: 'Security Architecture',
        duration: '3 weeks',
        description: 'Design and implementation of security framework'
      },
      {
        title: 'Core Banking Features',
        duration: '4 months',
        description: 'Development of primary banking functionalities'
      },
      {
        title: 'Advanced Features',
        duration: '2 months',
        description: 'Implementation of advanced features and integrations'
      },
      {
        title: 'Security Audit & Launch',
        duration: '1 month',
        description: 'Security testing, compliance verification, and deployment'
      }
    ],
    teamComposition: [
      {
        role: 'Security Architect',
        experience: '10+ years',
        certifications: ['CISSP', 'CISM']
      },
      {
        role: 'Mobile Development Lead',
        experience: '7+ years',
        certifications: ['AWS Mobile Developer']
      },
      {
        role: 'Backend Engineer',
        experience: '6+ years',
        certifications: ['PCIP']
      }
    ],
    qualityAssurance: 'Rigorous security testing, penetration testing, and compliance verification. Regular security audits and vulnerability assessments.',
    riskMitigation: 'Comprehensive security monitoring, incident response plan, and regular security training for team members.'
  },
  {
    id: 'bid_3',
    rfpId: 'rfp_3',
    rfpTitle: 'Cloud Infrastructure Migration',
    rfpCompany: {
      id: '1',
      name: 'CloudTech Solutions',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CS'
    },
    proposedBudget: '$265,000',
    proposedTimeline: '4 months',
    status: 'rejected',
    submittedAt: '2024-02-05T09:15:00Z',
    deadline: '2024-07-30',
    technicalProposal: 'Seamless migration of on-premises infrastructure to cloud with zero downtime.',
    technicalApproach: 'Infrastructure as Code using Terraform, with AWS as the primary cloud provider.',
    methodology: 'Phased migration approach with continuous testing and validation.',
    deliverables: [
      'Cloud infrastructure setup',
      'Migration playbooks',
      'Monitoring and alerting system',
      'Disaster recovery plan',
      'Documentation and training'
    ],
    projectMilestones: [
      {
        title: 'Assessment & Planning',
        duration: '2 weeks',
        description: 'Infrastructure assessment and migration planning'
      },
      {
        title: 'Infrastructure Setup',
        duration: '1 month',
        description: 'Cloud infrastructure provisioning and configuration'
      },
      {
        title: 'Data Migration',
        duration: '1.5 months',
        description: 'Phased data migration and validation'
      },
      {
        title: 'Cutover & Optimization',
        duration: '1 month',
        description: 'Final cutover and performance optimization'
      }
    ],
    teamComposition: [
      {
        role: 'Cloud Architect',
        experience: '8+ years',
        certifications: ['AWS Solutions Architect Professional']
      },
      {
        role: 'DevOps Engineer',
        experience: '5+ years',
        certifications: ['Terraform Certified']
      },
      {
        role: 'Network Engineer',
        experience: '6+ years',
        certifications: ['CCNP']
      }
    ],
    qualityAssurance: 'Automated testing of infrastructure deployments, performance monitoring, and security compliance checks.',
    riskMitigation: 'Detailed rollback plans, redundant systems, and continuous monitoring during migration.'
  },
  {
    id: 'bid_4',
    rfpId: 'rfp_4',
    rfpTitle: 'AI-Powered Customer Service Platform',
    rfpCompany: {
      id: '1',
      name: 'AI Innovations Ltd',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=AI'
    },
    proposedBudget: '$310,000',
    proposedTimeline: '6 months',
    status: 'pending',
    submittedAt: '2024-02-18T11:45:00Z',
    deadline: '2024-09-15',
    technicalProposal: 'AI-driven customer service platform with natural language processing and automated response systems.',
    technicalApproach: 'Using GPT-4 API for natural language processing, integrated with custom ML models for specific use cases.',
    methodology: 'Iterative development with continuous model training and improvement.',
    deliverables: [
      'AI chatbot system',
      'Customer service dashboard',
      'Analytics and reporting platform',
      'Integration APIs',
      'Training dataset and documentation'
    ],
    projectMilestones: [
      {
        title: 'Initial Setup',
        duration: '1 month',
        description: 'Platform setup and initial model training'
      },
      {
        title: 'Core Features',
        duration: '3 months',
        description: 'Development of primary AI features'
      },
      {
        title: 'Integration',
        duration: '1 month',
        description: 'System integration and testing'
      },
      {
        title: 'Training & Launch',
        duration: '1 month',
        description: 'User training and system deployment'
      }
    ],
    teamComposition: [
      {
        role: 'AI/ML Lead',
        experience: '7+ years',
        certifications: ['Google ML Engineer']
      },
      {
        role: 'NLP Specialist',
        experience: '5+ years',
        certifications: ['OpenAI GPT Certification']
      },
      {
        role: 'Full Stack Developer',
        experience: '4+ years',
        certifications: ['AWS Developer Associate']
      }
    ],
    qualityAssurance: 'Continuous model evaluation, A/B testing, and user feedback integration.',
    riskMitigation: 'Fallback systems, content moderation, and regular model retraining.'
  },
  {
    id: 'bid_5',
    rfpId: 'rfp_5',
    rfpTitle: 'E-commerce Platform Upgrade',
    rfpCompany: {
      id: '1',
      name: 'Digital Retail Solutions',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=DR'
    },
    proposedBudget: '$175,000',
    proposedTimeline: '3 months',
    status: 'accepted',
    submittedAt: '2024-02-01T16:20:00Z',
    deadline: '2024-05-30',
    technicalProposal: 'Modern e-commerce platform with enhanced performance and user experience.',
    technicalApproach: 'Next.js for frontend, Node.js microservices backend, and MongoDB for data storage.',
    methodology: 'Agile development with weekly sprints and continuous deployment.',
    deliverables: [
      'Responsive web application',
      'Admin dashboard',
      'Payment gateway integration',
      'Inventory management system',
      'Analytics dashboard'
    ],
    projectMilestones: [
      {
        title: 'Design & Architecture',
        duration: '2 weeks',
        description: 'UI/UX design and technical architecture'
      },
      {
        title: 'Core Development',
        duration: '1.5 months',
        description: 'Primary features development'
      },
      {
        title: 'Integration',
        duration: '2 weeks',
        description: 'Third-party services integration'
      },
      {
        title: 'Testing & Launch',
        duration: '2 weeks',
        description: 'Quality assurance and deployment'
      }
    ],
    teamComposition: [
      {
        role: 'Technical Lead',
        experience: '6+ years',
        certifications: ['AWS Developer Professional']
      },
      {
        role: 'Frontend Developer',
        experience: '4+ years',
        certifications: ['Next.js Certification']
      },
      {
        role: 'Backend Developer',
        experience: '5+ years',
        certifications: ['Node.js Certification']
      }
    ],
    qualityAssurance: 'Automated testing suite, performance testing, and user acceptance testing.',
    riskMitigation: 'Regular backups, scalability planning, and performance monitoring.'
  }
];

// Mock PDF content for preview
const mockPdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog
   /Pages 2 0 R
>>
endobj

2 0 obj
<< /Type /Pages
   /Kids [3 0 R]
   /Count 1
>>
endobj

3 0 obj
<< /Type /Page
   /Parent 2 0 R
   /Resources << /Font << /F1 4 0 R >> >>
   /MediaBox [0 0 612 792]
   /Contents 5 0 R
>>
endobj

4 0 obj
<< /Type /Font
   /Subtype /Type1
   /BaseFont /Helvetica
>>
endobj

5 0 obj
<< /Length 68 >>
stream
BT
/F1 24 Tf
100 700 Td
(Sample Bid Document) Tj
/F1 12 Tf
100 650 Td
(This is a mock PDF file for demonstration purposes.) Tj
100 630 Td
(In a real application, this would be an actual PDF document.) Tj
100 610 Td
(The document would contain detailed bid information,) Tj
100 590 Td
(technical specifications, and other relevant details.) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000233 00000 n
0000000301 00000 n
trailer
<< /Size 6
   /Root 1 0 R
>>
startxref
420
%%EOF
`;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function BidDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const bid = mockBids.find(b => b.id === params.id);

  if (!bid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Bid not found</h3>
          <p className="mt-2 text-sm text-gray-500">The bid you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/bids')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to My Bids
          </button>
        </div>
      </div>
    );
  }

  const handlePreviewDocument = (docName: string) => {
    setSelectedDocument(docName);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/bids')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back to My Bids
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Bid Details</h2>
              </div>
              <div className="mt-1 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {bid.rfpCompany.logo && (
                    <img
                      src={bid.rfpCompany.logo}
                      alt={bid.rfpCompany.name}
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-500">{bid.rfpCompany.name}</span>
                </div>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">Submitted {formatDate(bid.submittedAt)}</span>
              </div>
            </div>
            <div className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
              bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8">
          {/* RFP Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">RFP Information</h3>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">RFP Title</dt>
                <dd className="mt-1 text-sm text-gray-900">{bid.rfpTitle}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(bid.deadline)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="mt-1 text-sm text-gray-900">{bid.rfpCompany.name}</dd>
              </div>
            </div>
          </div>

          {/* Bid Overview */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Bid Overview</h3>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Proposed Budget</dt>
                <dd className="mt-1 text-sm text-gray-900">{bid.proposedBudget}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Proposed Timeline</dt>
                <dd className="mt-1 text-sm text-gray-900">{bid.proposedTimeline}</dd>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Technical Details</h3>
            <div className="mt-4 space-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Technical Proposal</dt>
                <dd className="mt-1 text-sm text-gray-900">{bid.technicalProposal}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Technical Approach</dt>
                <dd className="mt-1 text-sm text-gray-900">{bid.technicalApproach}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Methodology</dt>
                <dd className="mt-1 text-sm text-gray-900">{bid.methodology}</dd>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Deliverables</h3>
            <ul className="mt-4 space-y-2">
              {bid.deliverables.map((deliverable, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-green-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="ml-3 text-sm text-gray-900">{deliverable}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Project Milestones */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Project Milestones</h3>
            <div className="mt-4 space-y-4">
              {bid.projectMilestones.map((milestone, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                      <p className="mt-1 text-sm text-gray-500">{milestone.description}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {milestone.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Composition */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Team Composition</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bid.teamComposition.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">{member.role}</h4>
                  <p className="mt-1 text-sm text-gray-500">Experience: {member.experience}</p>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500">Certifications:</p>
                    <ul className="mt-1 space-y-1">
                      {member.certifications.map((cert, certIndex) => (
                        <li key={certIndex} className="text-xs text-gray-900">{cert}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Assurance & Risk Mitigation */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Quality Assurance</h3>
              <p className="mt-4 text-sm text-gray-900">{bid.qualityAssurance}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Risk Mitigation</h3>
              <p className="mt-4 text-sm text-gray-900">{bid.riskMitigation}</p>
            </div>
          </div>

          {/* Supporting Documents */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Supporting Documents</h4>
            <ul className="divide-y divide-gray-200">
              {['Technical Proposal.pdf', 'Team CVs.pdf', 'Compliance Certificates.pdf'].map((doc, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-900">{doc}</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handlePreviewDocument(doc)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Preview
                    </button>
                    <a
                      href="#"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Download
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <Transition.Root show={isPreviewOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsPreviewOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:p-6">
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setIsPreviewOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        {selectedDocument}
                      </Dialog.Title>
                      <div className="mt-4">
                        {/* PDF Preview */}
                        <div className="bg-gray-100 rounded-lg p-4 h-[600px] overflow-y-auto font-mono text-sm">
                          <pre className="whitespace-pre-wrap">{mockPdfContent}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
} 