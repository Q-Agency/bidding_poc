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
    <div className="bg-white shadow rounded-lg p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">My RFPs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your Request for Proposals and review submitted bids
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => router.push('/rfp/create')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create New RFP
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-64">
          <label htmlFor="search" className="sr-only">Search RFPs</label>
          <input
            type="search"
            name="search"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search RFPs..."
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
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
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {rfp.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          rfp.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          rfp.status === 'published' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rfp.status.charAt(0).toUpperCase() + rfp.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(rfp.deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
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
                                    bid.status === 'rejected' ? 'bg-red-400' :
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
                      <td colSpan={4} className="px-3 py-4 text-sm text-gray-500 text-center">
                        No RFPs found matching the selected filters
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