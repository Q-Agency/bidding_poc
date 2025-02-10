'use client';

import React, { useState, useEffect, Fragment, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRfpStore } from '@/store/rfp';
import type { RFPFormData, RFP } from '@/types/rfp';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const rfpSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  company: z.object({
    id: z.string(),
    name: z.string(),
    logo: z.string().optional(),
  }),
  budget: z.string().min(1, 'Budget is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  category: z.string().min(1, 'Category is required'),
  requirements: z.array(z.string()),
  certifications: z.array(z.string()),
  compliance: z.array(z.string()),
  industryStandards: z.array(z.string()),
  teamRequirements: z.object({
    roles: z.array(z.string()),
    experience: z.string(),
    size: z.string()
  }),
  status: z.enum(['draft', 'published', 'closed']),
});

export default function RfpDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { rfps, updateRfp } = useRfpStore();
  const [isEditing, setIsEditing] = useState(false);
  const [currentRfp, setCurrentRfp] = useState<RFP | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [sortField, setSortField] = useState<'companyName' | 'proposedBudget' | 'proposedTimeline' | 'status' | 'fit' | 'submittedAt'>('fit');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RFPFormData>({
    resolver: zodResolver(rfpSchema),
  });

  useEffect(() => {
    const rfp = rfps.find(r => r.id === params.id);
    if (rfp) {
      setCurrentRfp(rfp);
      reset({
        title: rfp.title,
        description: rfp.description,
        company: rfp.company,
        budget: rfp.budget,
        deadline: rfp.deadline,
        category: rfp.category,
        requirements: rfp.requirements,
        certifications: rfp.certifications,
        compliance: rfp.compliance,
        industryStandards: rfp.industryStandards,
        teamRequirements: rfp.teamRequirements,
        status: rfp.status,
      });
    } else {
      router.push('/rfp/manage');
    }
  }, [params.id, rfps, reset, router]);

  const requirements = watch('requirements');
  const certifications = watch('certifications');
  const compliance = watch('compliance');
  const industryStandards = watch('industryStandards');
  const teamRoles = watch('teamRequirements.roles');

  const addArrayItem = (field: 'requirements' | 'certifications' | 'compliance' | 'industryStandards' | 'teamRequirements.roles') => {
    const currentValue = field === 'teamRequirements.roles' 
      ? teamRoles 
      : field === 'requirements'
      ? requirements
      : field === 'certifications'
      ? certifications
      : field === 'compliance'
      ? compliance
      : industryStandards;
    
    setValue(field, [...(currentValue || []), '']);
  };

  const removeArrayItem = (
    field: 'requirements' | 'certifications' | 'compliance' | 'industryStandards' | 'teamRequirements.roles',
    index: number
  ) => {
    const currentValue = field === 'teamRequirements.roles' 
      ? teamRoles 
      : field === 'requirements'
      ? requirements
      : field === 'certifications'
      ? certifications
      : field === 'compliance'
      ? compliance
      : industryStandards;
    
    setValue(
      field,
      (currentValue || []).filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: RFPFormData) => {
    if (!currentRfp) return;

    const updatedRfp = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    updateRfp(currentRfp.id, updatedRfp);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: 'draft' | 'published' | 'closed') => {
    if (!currentRfp) return;

    if (newStatus === 'published') {
      setShowPublishModal(true);
      return;
    }

    const updatedRfp = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    updateRfp(currentRfp.id, updatedRfp);
    setCurrentRfp({
      ...currentRfp,
      ...updatedRfp
    });
    setValue('status', newStatus);
  };

  const handlePublishConfirm = () => {
    if (!currentRfp) return;

    const updatedRfp = {
      status: 'published' as const,
      updatedAt: new Date().toISOString(),
    };

    updateRfp(currentRfp.id, updatedRfp);
    setCurrentRfp({
      ...currentRfp,
      ...updatedRfp
    });
    setValue('status', 'published');
    setShowPublishModal(false);
    toast.success('RFP has been published successfully', {
      position: 'top-center',
      duration: 3000,
    });
  };

  const handleBidAction = (bidId: string, action: 'accept' | 'reject') => {
    if (!currentRfp) return;

    const updatedBids = currentRfp.bids.map(bid => {
      if (bid.id === bidId) {
        return {
          ...bid,
          status: action === 'accept' ? 'accepted' as const : 'rejected' as const
        };
      }
      // If we're accepting a bid, reject all others
      if (action === 'accept' && bid.status === 'pending') {
        return { ...bid, status: 'rejected' as const };
      }
      return bid;
    });

    const updatedRfp = {
      ...currentRfp,
      bids: updatedBids,
      status: action === 'accept' ? 'closed' as const : currentRfp.status,
      updatedAt: new Date().toISOString(),
    };

    updateRfp(currentRfp.id, updatedRfp);
    setCurrentRfp(updatedRfp);
  };

  const sortedAndFilteredBids = useMemo(() => {
    if (!currentRfp?.bids) return [];
    
    let filteredBids = currentRfp.bids;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredBids = filteredBids.filter(bid => bid.status === statusFilter);
    }
    
    // Sort bids
    return [...filteredBids].sort((a, b) => {
      const getFitScore = (bid: typeof a) => Math.floor(parseInt(bid.id.replace(/\D/g, '')) % 11);
      
      if (sortField === 'fit') {
        const scoreA = getFitScore(a);
        const scoreB = getFitScore(b);
        return sortDirection === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      }
      
      if (sortField === 'proposedBudget') {
        const budgetA = parseInt(a.proposedBudget.replace(/\D/g, ''));
        const budgetB = parseInt(b.proposedBudget.replace(/\D/g, ''));
        return sortDirection === 'desc' ? budgetB - budgetA : budgetA - budgetB;
      }
      
      if (sortField === 'submittedAt') {
        const dateA = new Date(a.submittedAt).getTime();
        const dateB = new Date(b.submittedAt).getTime();
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
      }
      
      if (sortField === 'proposedTimeline') {
        const timelineA = parseFloat(a.proposedTimeline.replace(/[^0-9.]/g, ''));
        const timelineB = parseFloat(b.proposedTimeline.replace(/[^0-9.]/g, ''));
        return sortDirection === 'desc' ? timelineB - timelineA : timelineA - timelineB;
      }
      
      const valueA = a[sortField];
      const valueB = b[sortField];
      return sortDirection === 'desc' 
        ? valueB.localeCompare(valueA)
        : valueA.localeCompare(valueB);
    });
  }, [currentRfp?.bids, sortField, sortDirection, statusFilter]);

  const renderBidsSection = () => {
    if (!currentRfp?.bids || currentRfp.bids.length === 0) return null;

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
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Submitted Bids</h4>
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('companyName')}
                >
                  Company
                  <SortIcon field="companyName" />
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('proposedBudget')}
                >
                  Proposed Budget
                  <SortIcon field="proposedBudget" />
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('proposedTimeline')}
                >
                  Timeline
                  <SortIcon field="proposedTimeline" />
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
                  onClick={() => handleSort('fit')}
                >
                  Fit Score
                  <SortIcon field="fit" />
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
                  onClick={() => router.push(`/rfp/${currentRfp.id}/bid/${bid.id}`)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {bid.companyName}
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
                    {(() => {
                      const mockScore = Math.floor(parseInt(bid.id.replace(/\D/g, '')) % 11);
                      const getScoreColor = (score: number) => {
                        if (score >= 8) return 'bg-green-100 text-green-800';
                        if (score >= 6) return 'bg-lime-100 text-lime-800';
                        if (score >= 4) return 'bg-yellow-100 text-yellow-800';
                        if (score >= 2) return 'bg-orange-100 text-orange-800';
                        return 'bg-red-100 text-red-800';
                      };
                      return (
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getScoreColor(mockScore)}`}>
                          {mockScore}/10
                        </span>
                      );
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(bid.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
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
    );
  };

  if (!currentRfp) {
    return <div>Loading...</div>;
  }

  const isEditable = currentRfp.status === 'draft' || currentRfp.status === 'published';

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="border-b border-gray-200 pb-5">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold leading-6 text-gray-900">
              RFP Details
            </h3>
            <div className="flex gap-4">
              {currentRfp.status === 'draft' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('published')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Publish RFP
                </button>
              )}
              {isEditable && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit RFP
                </button>
              )}
              {currentRfp.status === 'published' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('closed')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Close RFP
                </button>
              )}
              {currentRfp.status === 'closed' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('published')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Reopen RFP
                </button>
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${currentRfp.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                currentRfp.status === 'published' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'}`}
            >
              {currentRfp.status.charAt(0).toUpperCase() + currentRfp.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  {...register('title')}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Budget
                </label>
                <input
                  type="text"
                  {...register('budget')}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <input
                  type="date"
                  {...register('deadline')}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  {...register('category')}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select a category</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Cloud Services">Cloud Services</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="IT Infrastructure">IT Infrastructure</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Requirements Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Requirements</h3>
              <div className="space-y-4">
                {/* Technical Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Technical Requirements
                  </label>
                  <div className="mt-2 space-y-2">
                    {requirements?.map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          {...register(`requirements.${index}`)}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('requirements', index)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => addArrayItem('requirements')}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add Requirement
                      </button>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Required Certifications
                  </label>
                  <div className="mt-2 space-y-2">
                    {certifications?.map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          {...register(`certifications.${index}`)}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('certifications', index)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => addArrayItem('certifications')}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add Certification
                      </button>
                    )}
                  </div>
                </div>

                {/* Compliance Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Compliance Requirements
                  </label>
                  <div className="mt-2 space-y-2">
                    {compliance?.map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          {...register(`compliance.${index}`)}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('compliance', index)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => addArrayItem('compliance')}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add Compliance Requirement
                      </button>
                    )}
                  </div>
                </div>

                {/* Industry Standards */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Industry Standards
                  </label>
                  <div className="mt-2 space-y-2">
                    {industryStandards?.map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          {...register(`industryStandards.${index}`)}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('industryStandards', index)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => addArrayItem('industryStandards')}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add Industry Standard
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Team Requirements */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Team Requirements</h3>
              <div className="space-y-4">
                {/* Team Roles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Required Team Roles
                  </label>
                  <div className="mt-2 space-y-2">
                    {teamRoles?.map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          {...register(`teamRequirements.roles.${index}`)}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('teamRequirements.roles', index)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => addArrayItem('teamRequirements.roles')}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add Team Role
                      </button>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Required Experience
                  </label>
                  <input
                    {...register('teamRequirements.experience')}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., 5+ years in enterprise solutions"
                  />
                </div>

                {/* Team Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Team Size
                  </label>
                  <input
                    {...register('teamRequirements.size')}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., 8-12 team members"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>

          {renderBidsSection()}
        </div>
      </div>

      {/* Publish RFP Confirmation Modal */}
      <Transition.Root show={showPublishModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowPublishModal}>
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

          <div className="fixed inset-0 z-10 overflow-y-auto">
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Publish RFP
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to publish this RFP? Once published, companies will be able to view and submit bids for this RFP.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                      onClick={handlePublishConfirm}
                    >
                      Publish
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setShowPublishModal(false)}
                    >
                      Cancel
                    </button>
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