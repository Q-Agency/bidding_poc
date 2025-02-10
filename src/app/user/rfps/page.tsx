'use client';

import { useState } from 'react';

const mockRfps = [
  {
    id: '1',
    title: 'Enterprise Software Development',
    company: 'Tech Corp',
    deadline: '2024-04-15',
    status: 'Open',
    category: 'Software Development',
    budget: '$100,000 - $150,000',
  },
  {
    id: '2',
    title: 'Cloud Infrastructure Migration',
    company: 'Cloud Solutions Inc',
    deadline: '2024-04-20',
    status: 'Open',
    category: 'Cloud Services',
    budget: '$200,000 - $300,000',
  },
  {
    id: '3',
    title: 'Mobile App Development',
    company: 'StartUp Co',
    deadline: '2024-04-25',
    status: 'Open',
    category: 'Mobile Development',
    budget: '$50,000 - $75,000',
  },
];

export default function RfpBrowserPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredRfps = mockRfps.filter((rfp) => {
    const matchesSearch = rfp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || rfp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-gray-900">
          Browse RFPs
        </h3>
      </div>

      <div className="mt-6 space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search RFPs..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Software Development">Software Development</option>
              <option value="Cloud Services">Cloud Services</option>
              <option value="Mobile Development">Mobile Development</option>
            </select>
          </div>
        </div>

        {/* RFP List */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Company</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Budget</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Deadline</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRfps.map((rfp) => (
                <tr key={rfp.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{rfp.title}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{rfp.company}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{rfp.category}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{rfp.budget}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{rfp.deadline}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                      {rfp.status}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 