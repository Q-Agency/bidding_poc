'use client';

import { useRfpStore } from '@/store/rfp';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TeamMember {
  name: string;
  role: string;
  experience: string;
  avatar?: string;
}

interface BidDocument {
  name: string;
  url: string;
}

interface BidApproach {
  methodology: string;
  timeline: string;
  deliverables: string[];
}

interface BidTeam {
  members: TeamMember[];
}

interface BidCompany {
  name: string;
  logo?: string;
  location: string;
  experience: string;
  projectCount: number;
  contact: string;
}

interface DetailedBid {
  id: string;
  companyId: string;
  companyName: string;
  proposedBudget: string;
  proposedTimeline: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
  proposal: string;
  approach: BidApproach;
  team: BidTeam;
  company: BidCompany;
  documents: BidDocument[];
}

interface RFPStore {
  rfps: Array<{
    id: string;
    title: string;
    budget: string;
    bids: DetailedBid[];
  }>;
  updateBidStatus: (rfpId: string, bidId: string, status: 'accepted' | 'rejected') => Promise<void>;
}

function formatCurrency(amount: string) {
  const value = parseInt(amount.replace(/[^0-9]/g, ''));
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BidDetailsPage({ params }: { params: { id: string; bidId: string } }) {
  const router = useRouter();
  const store = useRfpStore() as unknown as RFPStore;
  const { rfps, updateBidStatus } = store;
  const [isUpdating, setIsUpdating] = useState(false);

  const rfp = rfps.find(r => r.id === params.id);
  const bid = rfp?.bids.find(b => b.id === params.bidId) as DetailedBid | undefined;

  const handleStatusChange = async (newStatus: 'accepted' | 'rejected') => {
    if (!bid) return;
    setIsUpdating(true);
    try {
      await updateBidStatus(params.id, params.bidId, newStatus);
    } catch (error) {
      console.error('Failed to update bid status:', error);
    }
    setIsUpdating(false);
  };

  if (!rfp || !bid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Bid not found</h2>
          <p className="mt-2 text-gray-600">The bid you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 btn-primary"
          >
            Go Back
          </button>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Bid Details
              </h1>
              <p className="mt-2 text-gray-600">
                For RFP: {rfp.title}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {bid.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange('accepted')}
                    disabled={isUpdating}
                    className="btn-primary"
                  >
                    {isUpdating ? 'Updating...' : 'Accept Bid'}
                  </button>
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    disabled={isUpdating}
                    className="btn-accent"
                  >
                    {isUpdating ? 'Updating...' : 'Reject Bid'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Bid Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Proposal Card */}
            <div className="card-gradient">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Proposal</h2>
              <div className="prose prose-sm max-w-none text-gray-600">
                {bid.proposal}
              </div>
            </div>

            {/* Approach Card */}
            <div className="card-gradient">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Approach</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Methodology</h3>
                  <p className="mt-2 text-gray-600">{bid.approach.methodology}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Timeline</h3>
                  <p className="mt-2 text-gray-600">{bid.approach.timeline}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Deliverables</h3>
                  <ul className="mt-2 space-y-2">
                    {bid.approach.deliverables.map((deliverable: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 text-primary-500 mr-2">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-gray-600">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Team Composition Card */}
            <div className="card-gradient">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Composition</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {bid.team.members.map((member: TeamMember, index: number) => (
                  <div key={index} className="flex items-start space-x-4">
                    {member.avatar && (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-12 w-12 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                      <p className="mt-1 text-xs text-gray-500">{member.experience}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-8">
            {/* Bid Status Card */}
            <div className="card-gradient">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bid Status</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-accent-100 text-accent-800'
                    }`}>
                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-secondary-50 px-3 py-1 text-sm font-medium text-secondary-700">
                      {new Date(bid.submittedAt).toLocaleDateString()}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Proposed Budget</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {formatCurrency(bid.proposedBudget)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">RFP Budget</dt>
                  <dd className="mt-1 text-sm text-gray-600">
                    {formatCurrency(rfp.budget)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Company Info Card */}
            <div className="card-gradient">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
              <div className="flex items-center space-x-4 mb-4">
                {bid.company.logo && (
                  <img
                    src={bid.company.logo}
                    alt={bid.company.name}
                    className="h-12 w-12 rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{bid.company.name}</h3>
                  <p className="text-sm text-gray-500">{bid.company.location}</p>
                </div>
              </div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Industry Experience</dt>
                  <dd className="mt-1 text-sm text-gray-600">{bid.company.experience}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Previous Projects</dt>
                  <dd className="mt-1 text-sm text-gray-600">{bid.company.projectCount} completed</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contact</dt>
                  <dd className="mt-1 text-sm text-gray-600">{bid.company.contact}</dd>
                </div>
              </dl>
            </div>

            {/* Documents Card */}
            <div className="card-gradient">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Supporting Documents</h2>
              <ul className="space-y-3">
                {bid.documents.map((doc, index) => (
                  <li key={index}>
                    <button
                      onClick={() => window.open(doc.url, '_blank')}
                      className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-600">{doc.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 