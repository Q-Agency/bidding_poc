'use client';

import { useState, useMemo } from 'react';
import { useRfpStore } from '@/store/rfp';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

// Add a helper function for date formatting
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function BrowseRfpsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { rfps } = useRfpStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState<'title' | 'company' | 'category' | 'budget' | 'deadline' | 'bids'>('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [budgetFilter, setBudgetFilter] = useState('all');

  const sortedAndFilteredRfps = useMemo(() => {
    // First apply all filters
    let filtered = rfps.filter((rfp) => {
      const matchesSearch = rfp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfp.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfp.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || rfp.category === selectedCategory;
      const isPublished = rfp.status === 'published';
      const isNotOwnRfp = rfp.company.id !== user?.id;
      
      // Add budget filtering
      let matchesBudget = true;
      if (budgetFilter !== 'all') {
        const budget = parseInt(rfp.budget.replace(/[^0-9]/g, ''));
        switch (budgetFilter) {
          case 'under100k':
            matchesBudget = budget < 100000;
            break;
          case '100k-250k':
            matchesBudget = budget >= 100000 && budget <= 250000;
            break;
          case '250k-500k':
            matchesBudget = budget >= 250000 && budget <= 500000;
            break;
          case 'over500k':
            matchesBudget = budget > 500000;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && isPublished && isNotOwnRfp && matchesBudget;
    });

    // Then sort the filtered results
    return [...filtered].sort((a, b) => {
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
  }, [rfps, sortField, sortDirection, searchTerm, selectedCategory, budgetFilter, user?.id]);

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

  const handleRowClick = (rfpId: string) => {
    router.push(`/rfp/browse/${rfpId}`);
  };

  const handlePlaceBid = (e: React.MouseEvent, rfpId: string) => {
    e.stopPropagation(); // Prevent row click when clicking the bid button
    router.push(`/rfp/${rfpId}/bid/create`);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-gray-900">
          Browse RFPs
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Find and bid on available Request for Proposals
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search RFPs..."
              className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Software Development">Software Development</option>
              <option value="Cloud Services">Cloud Services</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="IT Infrastructure">IT Infrastructure</option>
              <option value="Consulting">Consulting</option>
              <option value="Data Analytics">Data Analytics</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
            </select>
          </div>
          <div className="sm:w-48">
            <select
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
            >
              <option value="all">All Budgets</option>
              <option value="under100k">Under $100K</option>
              <option value="100k-250k">$100K - $250K</option>
              <option value="250k-500k">$250K - $500K</option>
              <option value="over500k">Over $500K</option>
            </select>
          </div>
        </div>

        {/* RFP List */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full table-fixed divide-y divide-gray-300">
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
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-32 cursor-pointer"
                  onClick={() => handleSort('company')}
                >
                  Company
                  <SortIcon field="company" />
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-32 cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  Category
                  <SortIcon field="category" />
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-32 cursor-pointer"
                  onClick={() => handleSort('budget')}
                >
                  Budget
                  <SortIcon field="budget" />
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-32 cursor-pointer"
                  onClick={() => handleSort('deadline')}
                >
                  Deadline
                  <SortIcon field="deadline" />
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-20 cursor-pointer"
                  onClick={() => handleSort('bids')}
                >
                  Bids
                  <SortIcon field="bids" />
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 w-32">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedAndFilteredRfps.map((rfp) => (
                <tr 
                  key={rfp.id} 
                  onClick={() => handleRowClick(rfp.id)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-4 pl-4 pr-3 text-sm sm:pl-6 min-w-0">
                    <div className="pr-6">
                      <div className="font-medium text-gray-900 truncate">{rfp.title}</div>
                      <div className="mt-1 text-gray-500 text-xs line-clamp-2">
                        {rfp.description}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      {rfp.company.logo && (
                        <img
                          src={rfp.company.logo}
                          alt={rfp.company.name}
                          className="h-6 w-6 rounded-full flex-shrink-0"
                        />
                      )}
                      <span className="truncate">{rfp.company.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">{rfp.category}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">{rfp.budget}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDate(rfp.deadline)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {rfp.bids.length} bids
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={(e) => handlePlaceBid(e, rfp.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 whitespace-nowrap"
                    >
                      Place Bid
                    </button>
                  </td>
                </tr>
              ))}
              {sortedAndFilteredRfps.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
                    No RFPs found matching your criteria
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