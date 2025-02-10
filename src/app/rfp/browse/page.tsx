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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Browse RFPs
          </h1>
          <p className="mt-2 text-gray-600">
            Find and bid on available Request for Proposals
          </p>
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by title, company, or description..."
                className="form-input w-full rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:w-64">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                className="form-select w-full rounded-xl"
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
            <div className="sm:w-64">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <select
                id="budget"
                className="form-select w-full rounded-xl"
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
        </div>

        {/* RFP List */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
          <div className="overflow-hidden">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50/50 rounded-t-xl">
                <tr>
                  <th 
                    scope="col" 
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Title
                      <SortIcon field="title" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-32 cursor-pointer"
                    onClick={() => handleSort('company')}
                  >
                    <div className="flex items-center gap-2">
                      Company
                      <SortIcon field="company" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-32 cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-2">
                      Category
                      <SortIcon field="category" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-32 cursor-pointer"
                    onClick={() => handleSort('budget')}
                  >
                    <div className="flex items-center gap-2">
                      Budget
                      <SortIcon field="budget" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-32 cursor-pointer"
                    onClick={() => handleSort('deadline')}
                  >
                    <div className="flex items-center gap-2">
                      Deadline
                      <SortIcon field="deadline" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-20 cursor-pointer"
                    onClick={() => handleSort('bids')}
                  >
                    <div className="flex items-center gap-2">
                      Bids
                      <SortIcon field="bids" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white/50">
                {sortedAndFilteredRfps.map((rfp) => (
                  <tr 
                    key={rfp.id} 
                    onClick={() => handleRowClick(rfp.id)}
                    className="hover:bg-white/80 cursor-pointer transition-colors duration-200"
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
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                        {rfp.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-medium">{rfp.budget}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center rounded-full bg-secondary-50 px-2 py-1 text-xs font-medium text-secondary-700">
                        {formatDate(rfp.deadline)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center rounded-full bg-accent-50 px-2 py-1 text-xs font-medium text-accent-700">
                        {rfp.bids.length} bids
                      </span>
                    </td>
                  </tr>
                ))}
                {sortedAndFilteredRfps.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-500">
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
    </div>
  );
} 