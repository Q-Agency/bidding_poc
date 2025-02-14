'use client';

import { useRfpStore } from '@/store/rfp';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useMemo, useState } from 'react';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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

interface Bid {
  id: string;
  rfpId: string;
  rfpTitle: string;
  company: {
    name: string;
    logo?: string;
  };
  budget: string;
  proposedBudget: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

export default function MyBidsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { rfps } = useRfpStore();
  const [sortField, setSortField] = useState<'rfpTitle' | 'company' | 'budget' | 'status' | 'submittedAt'>('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const myBids = useMemo(() => {
    const allBids: Bid[] = [];

    rfps.forEach(rfp => {
      rfp.bids.forEach(bid => {
        allBids.push({
          id: bid.id,
          rfpId: rfp.id,
          rfpTitle: rfp.title,
          company: rfp.company,
          budget: rfp.budget,
          proposedBudget: bid.proposedBudget,
          status: bid.status,
          submittedAt: bid.submittedAt,
        });
      });
    });

    return allBids;
  }, [rfps]);

  const sortedAndFilteredBids = useMemo(() => {
    let filtered = myBids;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bid => bid.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bid => 
        bid.rfpTitle.toLowerCase().includes(query) ||
        bid.company.name.toLowerCase().includes(query)
      );
    }

    // Sort bids
    return [...filtered].sort((a, b) => {
      if (sortField === 'submittedAt') {
        const dateA = new Date(a.submittedAt).getTime();
        const dateB = new Date(b.submittedAt).getTime();
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
      }

      if (sortField === 'company') {
        return sortDirection === 'desc'
          ? b.company.name.localeCompare(a.company.name)
          : a.company.name.localeCompare(b.company.name);
      }

      const valueA = a[sortField];
      const valueB = b[sortField];
      return sortDirection === 'desc'
        ? String(valueB).localeCompare(String(valueA))
        : String(valueA).localeCompare(String(valueB));
    });
  }, [myBids, sortField, sortDirection, statusFilter, searchQuery]);

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          My Bids
        </h1>
        <p className="mt-2 text-gray-600">
          Track and manage your submitted proposals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search bids..."
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bids List */}
      <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 rounded-t-xl">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                  onClick={() => handleSort('rfpTitle')}
                >
                  RFP Title
                  <SortIcon field="rfpTitle" />
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
                  Budget
                  <SortIcon field="budget" />
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
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-gray-900">{bid.rfpTitle}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      ID: {bid.rfpId}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      {bid.company.logo && (
                        <img
                          src={bid.company.logo}
                          alt={bid.company.name}
                          className="h-6 w-6 rounded-full flex-shrink-0"
                        />
                      )}
                      <span>{bid.company.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(bid.proposedBudget)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Budget: {formatCurrency(bid.budget)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      bid.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                      bid.status === 'accepted' ? 'bg-green-50 text-green-700' :
                      'bg-accent-50 text-accent-700'
                    }`}>
                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className="inline-flex items-center rounded-full bg-secondary-50 px-2 py-1 text-xs font-medium text-secondary-700">
                      {formatDate(bid.submittedAt)}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedAndFilteredBids.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-gray-900 font-medium">No bids found</p>
                      <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 