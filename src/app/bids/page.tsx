'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

// Mock bids data
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
    deadline: '2024-06-30'
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
    deadline: '2024-08-15'
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
    deadline: '2024-07-30'
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
    deadline: '2024-09-15'
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
    deadline: '2024-05-30'
  }
];

// Helper function for date formatting
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function MyBidsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [sortField, setSortField] = useState<'rfp' | 'company' | 'budget' | 'timeline' | 'status' | 'submittedAt'>('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sortedAndFilteredBids = useMemo(() => {
    let filteredBids = mockBids;
    
    if (statusFilter !== 'all') {
      filteredBids = filteredBids.filter(bid => bid.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredBids = filteredBids.filter(bid => 
        bid.rfpTitle.toLowerCase().includes(query) ||
        bid.rfpCompany.name.toLowerCase().includes(query)
      );
    }

    return [...filteredBids].sort((a, b) => {
      if (sortField === 'submittedAt') {
        const dateA = new Date(a.submittedAt).getTime();
        const dateB = new Date(b.submittedAt).getTime();
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
      }

      if (sortField === 'rfp') {
        return sortDirection === 'desc'
          ? b.rfpTitle.localeCompare(a.rfpTitle)
          : a.rfpTitle.localeCompare(b.rfpTitle);
      }

      if (sortField === 'company') {
        return sortDirection === 'desc'
          ? b.rfpCompany.name.localeCompare(a.rfpCompany.name)
          : a.rfpCompany.name.localeCompare(b.rfpCompany.name);
      }

      if (sortField === 'budget') {
        const budgetA = parseInt(a.proposedBudget.replace(/[^0-9]/g, ''));
        const budgetB = parseInt(b.proposedBudget.replace(/[^0-9]/g, ''));
        return sortDirection === 'desc' ? budgetB - budgetA : budgetA - budgetB;
      }

      if (sortField === 'timeline') {
        return sortDirection === 'desc'
          ? b.proposedTimeline.localeCompare(a.proposedTimeline)
          : a.proposedTimeline.localeCompare(b.proposedTimeline);
      }

      if (sortField === 'status') {
        return sortDirection === 'desc'
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      }

      return 0;
    });
  }, [sortField, sortDirection, statusFilter, searchQuery]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-2 inline-block">
        {sortDirection === 'desc' ? '↓' : '↑'}
      </span>
    );
  };

  const handleRowClick = (rfpId: string, bidId: string) => {
    router.push(`/bids/${bidId}`);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-gray-900">
          My Bids
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Track and manage all your submitted bids
        </p>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-64">
          <label htmlFor="search" className="sr-only">Search bids</label>
          <input
            type="search"
            name="search"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search bids..."
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                      onClick={() => handleSort('rfp')}
                    >
                      RFP Title
                      <SortIcon field="rfp" />
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('company')}
                    >
                      Company
                      <SortIcon field="company" />
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('budget')}
                    >
                      Proposed Budget
                      <SortIcon field="budget" />
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('timeline')}
                    >
                      Timeline
                      <SortIcon field="timeline" />
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      <SortIcon field="status" />
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('submittedAt')}
                    >
                      Submitted
                      <SortIcon field="submittedAt" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedAndFilteredBids.map((bid) => (
                    <tr 
                      key={bid.id}
                      onClick={() => handleRowClick(bid.rfpId, bid.id)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {bid.rfpTitle}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          {bid.rfpCompany.logo && (
                            <img
                              src={bid.rfpCompany.logo}
                              alt={bid.rfpCompany.name}
                              className="h-6 w-6 rounded-full"
                            />
                          )}
                          <span>{bid.rfpCompany.name}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {bid.proposedBudget}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {bid.proposedTimeline}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDate(bid.submittedAt)}
                      </td>
                    </tr>
                  ))}
                  {sortedAndFilteredBids.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-sm text-gray-500 text-center">
                        No bids found matching the selected filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 