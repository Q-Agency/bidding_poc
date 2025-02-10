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
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';

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
  files: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
  })),
});

export default function RfpDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { rfps, updateRfp } = useRfpStore();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [currentRfp, setCurrentRfp] = useState<RFP | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string } | null>(null);
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
        files: rfp.files,
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

    if (newStatus === 'closed') {
      setShowCloseModal(true);
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

  const handleCloseConfirm = () => {
    if (!currentRfp) return;

    const updatedRfp = {
      status: 'closed' as const,
      updatedAt: new Date().toISOString(),
    };

    updateRfp(currentRfp.id, updatedRfp);
    setCurrentRfp({
      ...currentRfp,
      ...updatedRfp
    });
    setValue('status', 'closed');
    setShowCloseModal(false);
    toast.success('RFP has been closed successfully', {
      position: 'top-center',
      duration: 3000,
    });
  };

  const handleReopenConfirm = () => {
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
    setShowReopenModal(false);
    toast.success('RFP has been reopened successfully', {
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

    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Submitted Bids</h4>
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-lg border-gray-300 shadow-soft focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="overflow-hidden shadow-soft ring-1 ring-black ring-opacity-5 rounded-xl">
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
                  className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
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

  const isEditable = currentRfp.company.id === user?.id && currentRfp?.status !== 'closed';

  interface SortIconProps {
    field: typeof sortField;
  }

  const SortIcon = ({ field }: SortIconProps) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-2 inline-block">
        {sortDirection === 'desc' ? '↓' : '↑'}
      </span>
    );
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handlePreviewFile = (file: { name: string; url: string }) => {
    setSelectedFile({
      name: file.name,
      url: '/RFPFileDemo.pdf'  // Always use the local demo file
    });
    setShowPreviewModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section with enhanced styling */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {currentRfp.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-soft">
                  {currentRfp.company.logo && (
                    <img
                      src={currentRfp.company.logo}
                      alt={currentRfp.company.name}
                      className="h-8 w-8 rounded-full ring-2 ring-white"
                    />
                  )}
                  <span className="text-gray-700 font-medium">{currentRfp.company.name}</span>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 shadow-soft">
                  {currentRfp.category}
                </span>
                <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium shadow-soft
                  ${currentRfp.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                    currentRfp.status === 'published' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'}`}
                >
                  {currentRfp.status.charAt(0).toUpperCase() + currentRfp.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="mt-6 sm:mt-0 flex flex-wrap gap-3">
              {currentRfp.status === 'draft' && (
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-soft hover:shadow-glow transition-all duration-300"
                >
                  Publish RFP
                </button>
              )}
              {isEditable && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 shadow-soft hover:shadow-glow transition-all duration-300"
                >
                  Edit RFP
                </button>
              )}
              {currentRfp.status === 'published' && (
                <button
                  onClick={() => handleStatusChange('closed')}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 shadow-soft hover:shadow-glow transition-all duration-300"
                >
                  Close RFP
                </button>
              )}
              {currentRfp.status === 'closed' && (
                <button
                  onClick={() => setShowReopenModal(true)}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-green-700 bg-green-50 hover:bg-green-100 shadow-soft hover:shadow-glow transition-all duration-300"
                >
                  Reopen RFP
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid with enhanced styling */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                Overview
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                {currentRfp.description}
              </div>
            </div>

            {/* Files Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                Supporting Documents
              </h2>
              {currentRfp.files && currentRfp.files.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {currentRfp.files.map((file, index) => (
                    <li key={index} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700">{file.name}</span>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handlePreviewFile(file)}
                          className="inline-flex items-center px-4 py-2 rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 shadow-soft hover:shadow-glow transition-all duration-300"
                        >
                          View
                        </button>
                        <a
                          href="/RFPFileDemo.pdf"
                          download={file.name}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center px-4 py-2 rounded-lg text-secondary-700 bg-secondary-50 hover:bg-secondary-100 shadow-soft hover:shadow-glow transition-all duration-300"
                        >
                          Download
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                  <p className="mt-1 text-sm text-gray-500">No supporting documents have been uploaded for this RFP.</p>
                </div>
              )}
            </div>

            {/* Requirements Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                Requirements
              </h2>
              <div className="space-y-8">
                {/* Technical Requirements */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Requirements</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentRfp.requirements.map((req, index) => (
                      <li key={index} className="flex items-start bg-white/50 rounded-xl p-4 shadow-sm">
                        <span className="flex-shrink-0 h-6 w-6 text-primary-500">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="ml-3 text-gray-600">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Certifications */}
                {currentRfp.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Required Certifications</h3>
                    <div className="flex flex-wrap gap-3">
                      {currentRfp.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-xl bg-secondary-50 px-4 py-2 text-sm font-medium text-secondary-700 shadow-sm"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compliance Requirements */}
                {currentRfp.compliance.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Requirements</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentRfp.compliance.map((comp, index) => (
                        <li key={index} className="flex items-start bg-white/50 rounded-xl p-4 shadow-sm">
                          <span className="flex-shrink-0 h-6 w-6 text-accent-500">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </span>
                          <span className="ml-3 text-gray-600">{comp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Team Requirements Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                Team Requirements
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Required Roles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentRfp.teamRequirements.roles.map((role, index) => (
                      <div
                        key={index}
                        className="flex items-center p-4 bg-white/50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <span className="flex-shrink-0 h-6 w-6 text-primary-500">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                        <span className="ml-3 text-gray-700 font-medium">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white/50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Experience Level</h3>
                    <p className="text-gray-600">{currentRfp.teamRequirements.experience}</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Team Size</h3>
                    <p className="text-gray-600">{currentRfp.teamRequirements.size}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bids Section */}
            {currentRfp.bids && currentRfp.bids.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Submitted Bids</h4>
                  <div className="flex items-center gap-4">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                      className="rounded-lg border-gray-300 shadow-soft focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-hidden shadow-soft ring-1 ring-black ring-opacity-5 rounded-xl">
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
                          className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
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
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Status Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300 sticky top-8">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                RFP Details
              </h2>
              <div className="space-y-6">
                <dl className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <dt className="text-sm font-medium text-gray-500">Budget</dt>
                    <dd className="text-xl font-semibold text-gray-900">{currentRfp.budget}</dd>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                    <dd className="text-xl font-semibold text-gray-900">
                      {new Date(currentRfp.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </dd>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-600">
                      {new Date(currentRfp.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-600">
                      {new Date(currentRfp.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Bids Summary Card */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                Bids Summary
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-white/50 rounded-xl p-4 shadow-sm">
                  <span className="text-gray-600">Total Bids</span>
                  <span className="text-2xl font-semibold text-gray-900">{currentRfp.bids.length}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-3">
                    {currentRfp.bids.map((bid) => (
                      <div
                        key={bid.id}
                        className="flex items-center justify-between p-4 bg-white/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            bid.status === 'accepted' ? 'bg-green-400' :
                            bid.status === 'rejected' ? 'bg-red-400' :
                            'bg-yellow-400'
                          }`} />
                          <span className="text-gray-900 font-medium">{bid.companyName}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{bid.proposedBudget}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
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

      {/* Close RFP Confirmation Modal */}
      <Transition.Root show={showCloseModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowCloseModal}>
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
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Close RFP
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to close this RFP? This action will:
                        </p>
                        <ul className="mt-2 list-disc list-inside text-sm text-gray-500">
                          <li>Stop accepting new bids</li>
                          <li>Mark the RFP as closed</li>
                          <li>This action cannot be undone</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                      onClick={handleCloseConfirm}
                    >
                      Close RFP
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setShowCloseModal(false)}
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

      {/* Reopen RFP Confirmation Modal */}
      <Transition.Root show={showReopenModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowReopenModal}>
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
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Reopen RFP
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to reopen this RFP? This action will:
                        </p>
                        <ul className="mt-2 list-disc list-inside text-sm text-gray-500">
                          <li>Allow new bids to be submitted</li>
                          <li>Mark the RFP as published</li>
                          <li>Make the RFP visible to all vendors</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                      onClick={handleReopenConfirm}
                    >
                      Reopen RFP
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setShowReopenModal(false)}
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

      {/* PDF Preview Modal */}
      <Transition.Root show={showPreviewModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setShowPreviewModal}>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:p-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        {selectedFile?.name}
                      </Dialog.Title>
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        onClick={() => setShowPreviewModal(false)}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="aspect-[16/9] w-full">
                      <iframe
                        src="/RFPFileDemo.pdf"
                        className="w-full h-full rounded-lg border-2 border-gray-200"
                        title={selectedFile?.name}
                      />
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 flex justify-end">
                    <a
                      href="/RFPFileDemo.pdf"
                      download={selectedFile?.name}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-soft hover:shadow-glow transition-all duration-300"
                    >
                      Download
                    </a>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
} 