'use client';

import { useRfpStore } from '@/store/rfp';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useMemo, useState } from 'react';

export default function ManageRfpsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { rfps } = useRfpStore();
  const [sortField, setSortField] = useState<'title' | 'status' | 'deadline' | 'bids'>('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRowClick = (rfpId: string) => {
    router.push(`/rfp/${rfpId}`);
  };

  const sortedAndFilteredRfps = useMemo(() => {
    // Show all RFPs regardless of company
    let filteredRfps = rfps;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredRfps = filteredRfps.filter(rfp => rfp.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredRfps = filteredRfps.filter(rfp => 
        rfp.title.toLowerCase().includes(query)
      );
    }
    
    // Sort RFPs
    return [...filteredRfps].sort((a, b) => {
      if (sortField === 'bids') {
        const countA = a.bids?.length || 0;
        const countB = b.bids?.length || 0;
        return sortDirection === 'desc' ? countB - countA : countA - countB;
      }
      
      if (sortField === 'deadline') {
        const dateA = new Date(a.deadline).getTime();
        const dateB = new Date(b.deadline).getTime();
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
      }
      
      const valueA = a[sortField];
      const valueB = b[sortField];
      return sortDirection === 'desc' 
        ? valueB.localeCompare(valueA)
        : valueA.localeCompare(valueB);
    });
  }, [rfps, sortField, sortDirection, statusFilter, searchQuery]);

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              My RFPs
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your Request for Proposals and review submitted bids
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => router.push('/rfp/create')}
              className="btn-primary"
            >
              Create New RFP
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="search"
              name="search"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              placeholder="Search RFPs..."
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* RFP List */}
      <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 rounded-t-xl">
              <tr>
                <th 
                  scope="col" 
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  Title
                  <SortIcon field="title" />
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
                  onClick={() => handleSort('deadline')}
                >
                  Deadline
                  <SortIcon field="deadline" />
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('bids')}
                >
                  Bids
                  <SortIcon field="bids" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedAndFilteredRfps.map((rfp) => (
                <tr 
                  key={rfp.id}
                  onClick={() => handleRowClick(rfp.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {rfp.title}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      rfp.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      rfp.status === 'published' ? 'bg-primary-50 text-primary-700' :
                      'bg-accent-50 text-accent-700'
                    }`}>
                      {rfp.status.charAt(0).toUpperCase() + rfp.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className="inline-flex items-center rounded-full bg-secondary-50 px-2 py-1 text-xs font-medium text-secondary-700">
                      {new Date(rfp.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{rfp.bids?.length || 0} bids</span>
                      {rfp.bids && rfp.bids.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {rfp.bids.map(bid => (
                            <div key={bid.id} className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${
                                bid.status === 'accepted' ? 'bg-green-400' :
                                bid.status === 'rejected' ? 'bg-accent-400' :
                                'bg-yellow-400'
                              }`} />
                              {bid.companyName}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sortedAndFilteredRfps.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-gray-900 font-medium">No RFPs found</p>
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