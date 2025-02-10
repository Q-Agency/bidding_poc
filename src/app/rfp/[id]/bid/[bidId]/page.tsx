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
  
  // Find the RFP and bid
  const rfp = rfps.find(r => r.id === params.id);
  const bid = rfp?.bids.find(b => b.id === params.bidId);

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
    <>
      <div className="bg-white shadow rounded-lg p-6">
        {/* Notification Toast */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Transition
            show={!!notification}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-[-100%] opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => {
              // Only clear the notification after the transition is complete
              if (!pendingAction) {
                setNotification(null);
              }
            }}
          >
            <div className={`rounded-lg shadow-2xl p-4 min-w-[400px] max-w-lg backdrop-blur-sm ${
              notification?.type === 'success' 
                ? 'bg-green-50 border border-green-200 shadow-green-100/50' 
                : 'bg-red-50 border border-red-200 shadow-red-100/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  notification?.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {notification?.type === 'success' ? (
                    <CheckCircleIcon className="h-8 w-8 text-green-600" aria-hidden="true" />
                  ) : (
                    <XCircleIcon className="h-8 w-8 text-red-600" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 ml-1">
                  <p className={`text-base font-semibold ${
                    notification?.type === 'success' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {notification?.type === 'success' ? 'Success!' : 'Notice'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    notification?.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {notification?.message}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setNotification(null)}
                    className={`rounded-full p-1.5 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification?.type === 'success' 
                        ? 'hover:bg-green-100 focus:ring-green-600'
                        : 'hover:bg-red-100 focus:ring-red-600'
                    }`}
                  >
                    <span className="sr-only">Dismiss</span>
                    <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div className="border-b border-gray-200 pb-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-semibold leading-6 text-gray-900">
                Bid Details
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Submitted by {bid.companyName} for {rfp.title}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${
                bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
              </span>
              {bid.status === 'pending' && rfp.status === 'published' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBidAction('accept')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Accept Bid
                  </button>
                  <button
                    onClick={() => handleBidAction('reject')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reject Bid
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8">
          {/* Basic Bid Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Bid Overview</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Proposed Budget</dt>
                <dd className="mt-1 text-sm text-gray-900">{bid.proposedBudget}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">RFP Budget Range</dt>
                <dd className="mt-1 text-sm text-gray-900">{rfp.budget}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Proposed Timeline</dt>
                <dd className="mt-1 text-sm text-gray-900">{bid.proposedTimeline}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Submitted On</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(bid.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Fit Score</dt>
                <dd className="mt-1">
                  {(() => {
                    // Generate a mock score based on the bid ID
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
            </dl>
          </div>

          {/* Requirements Mapping */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Technical Requirements</h4>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      RFP Requirement
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Bid Response
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {rfp.requirements.map((req, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {req}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {/* In a real application, this would map to actual bid responses */}
                        <span className="text-green-600">✓</span> Supported
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Requirements Mapping */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Team Composition</h4>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Required Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Proposed Team Member
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Experience
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Certifications
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {rfp.teamRequirements.roles.map((role, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {role}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {/* Mock data - in real app would come from bid details */}
                        John Doe
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        8 years
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {rfp.certifications[index] || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance & Standards */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Compliance & Standards</h4>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Required Certifications</h5>
                <ul className="space-y-2">
                  {rfp.certifications.map((cert, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <span className="text-green-600 mr-2">✓</span>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Compliance Requirements</h5>
                <ul className="space-y-2">
                  {rfp.compliance.map((comp, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <span className="text-green-600 mr-2">✓</span>
                      {comp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Additional Documents */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Supporting Documents</h4>
            <ul className="divide-y divide-gray-200">
              {/* Mock documents - in real app would come from bid details */}
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

      {/* Rejection Modal */}
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
    </>
  );
} 