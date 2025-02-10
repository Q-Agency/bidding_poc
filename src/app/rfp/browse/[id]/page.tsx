'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRfpStore } from '@/store/rfp';
import { useAuthStore } from '@/store/auth';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
(Sample RFP Document) Tj
/F1 12 Tf
100 650 Td
(This is a mock PDF file for demonstration purposes.) Tj
100 630 Td
(In a real application, this would be an actual PDF document.) Tj
100 610 Td
(The document would contain detailed RFP requirements,) Tj
100 590 Td
(specifications, and other relevant information.) Tj
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

export default function BrowseRfpDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { rfps } = useRfpStore();
  const rfp = rfps.find(r => r.id === params.id);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ name: string; url: string } | null>(null);

  useEffect(() => {
    if (!rfp) {
      router.push('/rfp/browse');
      return;
    }

    if (rfp.status !== 'published') {
      router.push('/rfp/browse');
      return;
    }

    if (rfp.company.id === user?.id) {
      router.push('/rfp/browse');
      return;
    }
  }, [rfp, router, user?.id]);

  const handlePlaceBid = () => {
    router.push(`/rfp/${rfp?.id}/bid/create`);
  };

  const handlePreviewDocument = (doc: { name: string; url: string }) => {
    setSelectedDocument(doc);
    setIsPreviewOpen(true);
  };

  if (!rfp) {
    return null;
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{rfp.title}</h2>
              <div className="mt-1 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {rfp.company.logo && (
                    <img
                      src={rfp.company.logo}
                      alt={rfp.company.name}
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-500">{rfp.company.name}</span>
                </div>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{rfp.category}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceBid}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Place Bid
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8">
          {/* Overview */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Overview</h3>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Budget</dt>
                <dd className="mt-1 text-sm text-gray-900">{rfp.budget}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(rfp.deadline).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Current Bids</dt>
                <dd className="mt-1 text-sm text-gray-900">{rfp.bids.length} submissions</dd>
              </div>
            </div>
          </div>

          {/* RFP Document */}
          {rfp.documents && rfp.documents.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">RFP Documents</h3>
              <div className="mt-4 space-y-3">
                {rfp.documents.map((doc, index) => (
                  <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                    <svg className="h-8 w-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.name}
                      </p>
                    </div>
                    <div className="ml-4 flex space-x-3">
                      <button
                        onClick={() => handlePreviewDocument(doc)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Preview
                      </button>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <div className="mt-4 prose prose-sm max-w-none text-gray-500">
              {rfp.description}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Requirements</h3>
            <ul className="mt-4 space-y-2">
              {rfp.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-green-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="ml-3 text-sm text-gray-500">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Team Requirements */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Team Requirements</h3>
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Required Roles</h4>
                <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {rfp.teamRequirements.roles.map((role, index) => (
                    <li key={index} className="text-sm text-gray-500">{role}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Experience Level</h4>
                <p className="mt-2 text-sm text-gray-500">{rfp.teamRequirements.experience}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Team Size</h4>
                <p className="mt-2 text-sm text-gray-500">{rfp.teamRequirements.size}</p>
              </div>
            </div>
          </div>

          {/* Certifications & Compliance */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Required Certifications</h3>
              <ul className="mt-4 space-y-2">
                {rfp.certifications.map((cert, index) => (
                  <li key={index} className="text-sm text-gray-500">{cert}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Compliance Requirements</h3>
              <ul className="mt-4 space-y-2">
                {rfp.compliance.map((comp, index) => (
                  <li key={index} className="text-sm text-gray-500">{comp}</li>
                ))}
              </ul>
            </div>
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
                        {selectedDocument?.name}
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