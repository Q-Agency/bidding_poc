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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {rfp.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-soft">
                  {rfp.company.logo && (
                    <img
                      src={rfp.company.logo}
                      alt={rfp.company.name}
                      className="h-8 w-8 rounded-full ring-2 ring-white"
                    />
                  )}
                  <span className="text-gray-700 font-medium">{rfp.company.name}</span>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 shadow-soft">
                  {rfp.category}
                </span>
              </div>
            </div>
            <div className="mt-6 sm:mt-0">
              <button
                onClick={handlePlaceBid}
                className="btn-primary"
              >
                Place Bid
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                Overview
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                {rfp.description}
              </div>
            </div>

            {/* Documents Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                Documents
              </h2>
              <div className="space-y-4">
                {/* Always show the documents section with mock files */}
                <ul className="divide-y divide-gray-200">
                  {[
                    {
                      name: 'Healthcare Analytics Platform RFP.pdf',
                      url: '/mock-documents/rfp_8_full.pdf'
                    },
                    {
                      name: 'HIPAA Compliance Requirements.pdf',
                      url: '/mock-documents/rfp_8_hipaa.pdf'
                    },
                    {
                      name: 'Data Security Guidelines.pdf',
                      url: '/mock-documents/rfp_8_security.pdf'
                    }
                  ].map((doc, index) => (
                    <li key={index} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700">{doc.name}</span>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handlePreviewDocument(doc)}
                          className="inline-flex items-center px-4 py-2 rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 shadow-soft hover:shadow-glow transition-all duration-300"
                        >
                          View
                        </button>
                        <a
                          href="/RFPFileDemo.pdf"
                          download={doc.name}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center px-4 py-2 rounded-lg text-secondary-700 bg-secondary-50 hover:bg-secondary-100 shadow-soft hover:shadow-glow transition-all duration-300"
                        >
                          Download
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Requirements Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                Requirements
              </h2>
              <ul className="space-y-4">
                {rfp.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 text-primary-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="ml-3 text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Team Requirements Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                Team Requirements
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Required Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {rfp.teamRequirements.roles.map((role, index) => (
                      <span key={index} className="inline-flex items-center rounded-full bg-secondary-50 px-3 py-1 text-sm font-medium text-secondary-700">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white/50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Experience Level</h3>
                    <p className="text-gray-600">{rfp.teamRequirements.experience}</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Team Size</h3>
                    <p className="text-gray-600">{rfp.teamRequirements.size}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certifications & Compliance Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                Certifications & Compliance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Required Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {rfp.certifications.map((cert, index) => (
                      <span key={index} className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Requirements</h3>
                  <div className="flex flex-wrap gap-2">
                    {rfp.compliance.map((comp, index) => (
                      <span key={index} className="inline-flex items-center rounded-full bg-accent-50 px-3 py-1 text-sm font-medium text-accent-700">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Key Details Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                Key Details
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                  <p className="mt-2 text-lg font-medium text-gray-900">{rfp.budget}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
                  <p className="mt-2 text-lg font-medium text-gray-900">
                    {new Date(rfp.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Current Bids</h3>
                  <p className="mt-2 text-lg font-medium text-gray-900">{rfp.bids.length} submissions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      onClick={() => setIsPreviewOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div>
                    <div className="mt-3 sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        {selectedDocument?.name}
                      </Dialog.Title>
                      <div className="mt-4 bg-gray-50 rounded-lg h-[600px] overflow-hidden">
                        <iframe
                          src="/RFPFileDemo.pdf"
                          className="w-full h-full"
                          title="PDF Preview"
                        />
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