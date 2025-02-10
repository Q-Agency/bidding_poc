'use client';

import { useEffect, Fragment, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRfpStore } from '@/store/rfp';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

interface ExtendedBid {
  id: string;
  companyId: string;
  companyName: string;
  proposedBudget: string;
  proposedTimeline: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
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

export default function BidDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { rfps, updateRfp } = useRfpStore();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCloseRfpModal, setShowCloseRfpModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pendingAction, setPendingAction] = useState<'accept' | 'reject' | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Find the RFP and bid
  const rfp = rfps.find(r => r.id === params.id);
  const bid = rfp?.bids.find(b => b.id === params.bidId) as ExtendedBid;

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleBidAction = (action: 'accept' | 'reject') => {
    setPendingAction(action);
    if (action === 'accept') {
      setShowCloseRfpModal(true);
    } else {
      setShowRejectModal(true);
    }
  };

  const executeAction = (action: 'accept' | 'reject') => {
    if (!rfp || !bid) return;

    if (action === 'accept') {
      // Update all bids
      const updatedBids = rfp.bids.map(b => {
        if (b.id === bid.id) {
          return {
            ...b,
            status: 'accepted' as const
          };
        }
        // If we're accepting a bid, reject all others
        if (b.status === 'pending') {
          return { ...b, status: 'rejected' as const };
        }
        return b;
      });

      const updatedRfp = {
        ...rfp,
        bids: updatedBids,
        status: 'closed' as const,
        updatedAt: new Date().toISOString(),
      };

      // First update the RFP
      updateRfp(rfp.id, updatedRfp);
      
      // Then set the notification
      const message = 'Bid accepted successfully. The RFP has been closed.';

      // Clear any existing notification and set the new one
      setNotification(null);
      requestAnimationFrame(() => {
        setNotification({
          type: 'success',
          message
        });
      });
    } else {
      // Handle rejection
      const updatedBids = rfp.bids.map(b => {
        if (b.id === bid.id) {
          return {
            ...b,
            status: 'rejected' as const,
            rejectionReason
          };
        }
        return b;
      });

      const updatedRfp = {
        ...rfp,
        bids: updatedBids,
        updatedAt: new Date().toISOString(),
      };

      // First update the RFP
      updateRfp(rfp.id, updatedRfp);
      
      // Then set the notification
      const message = 'Bid rejected successfully.';

      // Clear any existing notification and set the new one
      setNotification(null);
      requestAnimationFrame(() => {
        setNotification({
          type: 'error',
          message
        });
      });
    }

    // Reset the pending action
    setPendingAction(null);
    setShowRejectModal(false);
    setShowCloseRfpModal(false);
  };

  const handleCloseRfp = () => {
    if (pendingAction === 'accept') {
      executeAction('accept');
    }
    setShowCloseRfpModal(false);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setShowRejectModal(false);
    executeAction('reject');
  };

  const handlePreviewDocument = (docName: string) => {
    setSelectedDocument(docName);
    setIsPreviewOpen(true);
  };

  if (!rfp || !bid) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">
          Bid not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <button
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Bid Details
              </h1>
              <p className="mt-2 text-gray-600">
                For RFP: {rfp.title}
              </p>
            </div>
            {bid.status === 'pending' && rfp.status === 'published' && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleBidAction('accept')}
                  className="btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Processing...' : 'Accept Bid'}
                </button>
                <button
                  onClick={() => handleBidAction('reject')}
                  className="btn-accent"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Processing...' : 'Reject Bid'}
                </button>
              </div>
            )}
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
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{bid.proposedBudget}</dd>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-4">
                  <dt className="text-sm font-medium text-gray-500">RFP Budget Range</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{rfp.budget}</dd>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-4">
                  <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{bid.proposedTimeline}</dd>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-4">
                  <dt className="text-sm font-medium text-gray-500">Submitted On</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {new Date(bid.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
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
          </div>

          {/* Right Column - Status and Documents */}
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
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                  </span>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-4">
                  <dt className="text-sm font-medium text-gray-500">Fit Score</dt>
                  <dd className="mt-2">
                    {(() => {
                      const mockScore = parseInt(bid.id.replace(/\D/g, '')) % 11;
                      const getScoreColor = (score: number) => {
                        if (score >= 8) return 'bg-green-100 text-green-800';
                        if (score >= 6) return 'bg-lime-100 text-lime-800';
                        if (score >= 4) return 'bg-yellow-100 text-yellow-800';
                        if (score >= 2) return 'bg-orange-100 text-orange-800';
                        return 'bg-red-100 text-red-800';
                      };
                      return (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${getScoreColor(mockScore)}`}>
                          {mockScore}/10
                        </span>
                      );
                    })()}
                  </dd>
                </div>
              </div>
            </div>

            {/* Supporting Documents Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <svg className="h-6 w-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Documents
                </h2>
              </div>
              <ul className="space-y-3">
                {['Technical Proposal.pdf', 'Team CVs.pdf', 'Compliance Certificates.pdf'].map((doc, index) => (
                  <li key={index} className="bg-gray-50/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-900">{doc}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreviewDocument(doc)}
                          className="btn-secondary text-sm"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Transition.Root show={showRejectModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowRejectModal}>
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

          <div className="fixed inset-0 z-10 overflow-y-auto">
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Reject Bid
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Please provide a reason for rejecting this bid from {bid?.companyName}. This will help the bidder understand why their proposal wasn't selected.
                        </p>
                        <div className="mt-4">
                          <textarea
                            rows={4}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:col-start-2"
                      onClick={handleReject}
                    >
                      Reject Bid
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                      onClick={() => {
                        setShowRejectModal(false);
                        setRejectionReason('');
                        setPendingAction(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Close RFP Confirmation Modal */}
      <Transition.Root show={showCloseRfpModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowCloseRfpModal}>
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

          <div className="fixed inset-0 z-10 overflow-y-auto">
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Accept Bid and Close RFP
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to accept this bid from {bid?.companyName}? This action will:
                        </p>
                        <ul className="mt-2 list-disc list-inside text-sm text-gray-500">
                          <li>Accept the selected bid</li>
                          <li>Reject all other pending bids</li>
                          <li>Close the RFP to new submissions</li>
                          <li>This action cannot be undone</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                      onClick={handleCloseRfp}
                    >
                      Accept and Close RFP
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => {
                        setShowCloseRfpModal(false);
                        setPendingAction(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

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
    </div>
  );
} 