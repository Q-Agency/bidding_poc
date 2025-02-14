'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, Fragment, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRfpStore } from '@/store/rfp';
import { RFP } from '@/types/rfp';
import Link from 'next/link';

interface StoreBid {
  id: string;
  companyId: string;
  companyName: string;
  proposedBudget: string;
  proposedTimeline: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

interface RFPBid extends StoreBid {
  id: string;
  companyId: string;
  companyName: string;
  proposedBudget: string;
  proposedTimeline: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

interface ExtendedBid extends RFPBid {
  rfpId: string;
  rfpTitle: string;
  rfpCompany: {
    id: string;
    name: string;
    logo?: string;
  };
  deadline: string;
  proposal?: string;
  technicalApproach?: string;
  methodology?: string;
  deliverables?: string[];
  projectMilestones?: Array<{
    title: string;
    duration: string;
    description: string;
  }>;
  teamComposition?: Array<{
    role: string;
    experience: string;
    certifications: string[];
  }>;
  qualityAssurance?: string;
  riskMitigation?: string;
  documents?: Array<{
    name: string;
    url: string;
  }>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatCurrency(amount: string) {
  const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericAmount);
}

// Mock PDF content for preview
const mockPdfContent = `This is a mock PDF content for demonstration purposes.
It would normally contain the actual content of the document being previewed.`;

export default function BidDetailsPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const { rfps } = useRfpStore();
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState('');

  const typedBid = useMemo(() => {
    let foundBid: ExtendedBid | null = null;
    
    // Search through all RFPs to find the matching bid
    for (const rfp of rfps) {
      const matchingBid = rfp.bids.find(b => b.id === params.id);
      if (matchingBid && rfp.company) {
        foundBid = {
          id: matchingBid.id,
          companyId: matchingBid.companyId,
          companyName: matchingBid.companyName,
          proposedBudget: matchingBid.proposedBudget,
          proposedTimeline: matchingBid.proposedTimeline,
          status: matchingBid.status as 'pending' | 'accepted' | 'rejected',
          submittedAt: matchingBid.submittedAt,
          rfpId: rfp.id,
          rfpTitle: rfp.title,
          rfpCompany: {
            id: rfp.company.id,
            name: rfp.company.name,
            logo: rfp.company.logo
          },
          deadline: rfp.deadline,
          proposal: matchingBid.proposal,
          technicalApproach: matchingBid.technicalApproach,
          methodology: matchingBid.methodology,
          deliverables: matchingBid.deliverables,
          projectMilestones: matchingBid.projectMilestones,
          teamComposition: matchingBid.teamComposition,
          qualityAssurance: matchingBid.qualityAssurance,
          riskMitigation: matchingBid.riskMitigation,
          documents: matchingBid.documents
        } satisfies ExtendedBid;
        break;
      }
    }
    return foundBid;
  }, [rfps, params.id]);

  const handlePreviewDocument = (docName: string) => {
    setSelectedDocument(docName);
    setShowDocumentModal(true);
  };

  if (!typedBid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Bid not found
            </h1>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Sorry, we couldn't find the bid you're looking for.
            </p>
            <div className="mt-10">
              <Link
                href="/bids"
                className="text-sm font-semibold leading-7 text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                <span aria-hidden="true">&larr;</span> Back to My Bids
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // At this point TypeScript knows typedBid is not null
  const bid: ExtendedBid = typedBid;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <button
              onClick={() => router.push('/bids')}
              className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to My Bids
            </button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Bid Details
            </h1>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                {bid.rfpCompany.logo && (
                  <img
                    src={bid.rfpCompany.logo}
                    alt={bid.rfpCompany.name}
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span className="text-gray-600">{bid.rfpCompany.name}</span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">Submitted {formatDate(bid.submittedAt)}</span>
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Bid Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Card */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Bid Overview
              </h2>
            </div>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="bg-gray-50/50 rounded-xl p-4">
                <dt className="text-sm font-medium text-gray-500">Proposed Budget</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(bid.proposedBudget)}</dd>
              </div>
              <div className="bg-gray-50/50 rounded-xl p-4">
                <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">{bid.proposedTimeline}</dd>
              </div>
              <div className="bg-gray-50/50 rounded-xl p-4">
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">{bid.companyName}</dd>
              </div>
              <div className="bg-gray-50/50 rounded-xl p-4">
                <dt className="text-sm font-medium text-gray-500">RFP Title</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">{bid.rfpTitle}</dd>
              </div>
            </dl>
          </div>

          {/* Technical Proposal */}
          {bid.proposal && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Technical Proposal
                </h2>
              </div>
              <div className="prose prose-primary max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{bid.proposal}</p>
              </div>
            </div>
          )}

          {/* Technical Approach */}
          {bid.technicalApproach && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Technical Approach
                </h2>
              </div>
              <div className="prose prose-primary max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{bid.technicalApproach}</p>
              </div>
            </div>
          )}

          {/* Methodology */}
          {bid.methodology && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Methodology
                </h2>
              </div>
              <div className="prose prose-primary max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{bid.methodology}</p>
              </div>
            </div>
          )}

          {/* Deliverables */}
          {bid.deliverables && bid.deliverables.length > 0 && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Deliverables
                </h2>
              </div>
              <ul className="space-y-4">
                {bid.deliverables.map((deliverable, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="h-6 w-6 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Project Milestones */}
          {bid.projectMilestones && bid.projectMilestones.length > 0 && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Project Milestones
                </h2>
              </div>
              <div className="space-y-6">
                {bid.projectMilestones.map((milestone, index) => (
                  <div key={index} className="bg-gray-50/50 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">{milestone.title}</h3>
                      <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-0.5 text-sm font-medium text-primary-800">
                        {milestone.duration}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{milestone.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Composition */}
          {bid.teamComposition && bid.teamComposition.length > 0 && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Team Composition
                </h2>
              </div>
              <div className="space-y-6">
                {bid.teamComposition.map((member, index) => (
                  <div key={index} className="bg-gray-50/50 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">{member.role}</h3>
                    </div>
                    <p className="mt-2 text-gray-700">{member.experience}</p>
                    {member.certifications && member.certifications.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-500">Certifications</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {member.certifications.map((cert, certIndex) => (
                            <span
                              key={certIndex}
                              className="inline-flex items-center rounded-full bg-secondary-100 px-3 py-0.5 text-sm font-medium text-secondary-800"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quality Assurance */}
          {bid.qualityAssurance && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Quality Assurance
                </h2>
              </div>
              <div className="prose prose-primary max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{bid.qualityAssurance}</p>
              </div>
            </div>
          )}

          {/* Risk Mitigation */}
          {bid.riskMitigation && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Risk Mitigation
                </h2>
              </div>
              <div className="prose prose-primary max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{bid.riskMitigation}</p>
              </div>
            </div>
          )}

          {/* Supporting Documents */}
          {bid.documents && bid.documents.length > 0 && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Supporting Documents
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {bid.documents.map((doc, index) => (
                  <button
                    key={index}
                    onClick={() => handlePreviewDocument(doc.name)}
                    className="flex items-center gap-3 bg-gray-50/50 rounded-xl p-4 hover:bg-gray-100/50 transition-colors"
                  >
                    <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{doc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Status */}
        <div className="space-y-8">
          {/* Status Card */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Bid Status
              </h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50/50 rounded-xl p-4">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                  </span>
                </dd>
              </div>
              <div className="bg-gray-50/50 rounded-xl p-4">
                <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                <dd className="mt-1 text-gray-900">{formatDate(bid.submittedAt)}</dd>
              </div>
              <div className="bg-gray-50/50 rounded-xl p-4">
                <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                <dd className="mt-1 text-gray-900">{bid.deadline ? formatDate(bid.deadline) : 'Not specified'}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <Transition.Root show={showDocumentModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setShowDocumentModal}>
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
                      onClick={() => setShowDocumentModal(false)}
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
    </div>
  );
} 