'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRfpStore } from '@/store/rfp';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { analyzeDocument } from '@/utils/ai';
import { DocumentTextIcon, ArrowPathIcon, CheckCircleIcon, CloudArrowUpIcon, BeakerIcon, CommandLineIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const bidSchema = z.object({
  proposedBudget: z.string().min(1, 'Proposed budget is required'),
  proposedTimeline: z.string().min(1, 'Proposed timeline is required'),
  technicalProposal: z.string().min(1, 'Technical proposal is required'),
  technicalApproach: z.string().min(1, 'Technical approach is required'),
  methodology: z.string().min(1, 'Methodology is required'),
  deliverables: z.array(z.string()).min(1, 'At least one deliverable is required'),
  projectMilestones: z.array(z.object({
    title: z.string(),
    duration: z.string(),
    description: z.string()
  })).min(1, 'At least one milestone is required'),
  teamComposition: z.array(z.object({
    role: z.string().min(1, 'Role is required'),
    experience: z.string().min(1, 'Experience is required'),
    certifications: z.array(z.string())
  })).min(1, 'At least one team member is required'),
  qualityAssurance: z.string().min(1, 'Quality assurance plan is required'),
  riskMitigation: z.string().min(1, 'Risk mitigation strategy is required'),
  additionalFiles: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string()
  })).optional()
});

type BidFormData = z.infer<typeof bidSchema>;

export default function CreateBidPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const { rfps, createBid, updateBid, submitBid } = useRfpStore();
  const [currentRfp, setCurrentRfp] = useState(rfps.find(r => r.id === params.id));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<'extracting' | 'analyzing' | 'complete'>('extracting');
  const [processingText, setProcessingText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFilesRef = useRef<HTMLInputElement>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uncoveredRequirements, setUncoveredRequirements] = useState<string[]>([]);
  const [requirementsCoverage, setRequirementsCoverage] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
    setValue,
    watch,
    getValues,
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      teamComposition: [{ role: '', experience: '', certifications: [] }],
      deliverables: [''],
      projectMilestones: [{ title: '', duration: '', description: '' }]
    }
  });

  useEffect(() => {
    if (!currentRfp) {
      router.push('/rfp/browse');
      return;
    }

    if (currentRfp.status !== 'published') {
      router.push(`/rfp/${currentRfp.id}`);
      return;
    }

    // Check if user already has a bid
    const existingBid = currentRfp.bids.find(b => b.companyId === user?.id);
    if (existingBid) {
      router.push(`/rfp/${currentRfp.id}/bid/${existingBid.id}`);
      return;
    }
  }, [currentRfp, router, user?.id]);

  const teamComposition = watch('teamComposition');

  // Function to check requirements coverage
  const checkRequirementsCoverage = (formData: any) => {
    if (!currentRfp) return;

    const coveredReqs: Record<string, boolean> = {};
    const uncovered: string[] = [];

    currentRfp.requirements.forEach(req => {
      const isAddressed = 
        (formData.technicalProposal?.toLowerCase() || '').includes(req.toLowerCase()) ||
        (formData.technicalApproach?.toLowerCase() || '').includes(req.toLowerCase()) ||
        (formData.methodology?.toLowerCase() || '').includes(req.toLowerCase()) ||
        (formData.deliverables || []).some((d: string) => (d || '').toLowerCase().includes(req.toLowerCase())) ||
        (formData.projectMilestones || []).some((m: any) => 
          ((m?.title || '').toLowerCase().includes(req.toLowerCase()) ||
          (m?.description || '').toLowerCase().includes(req.toLowerCase()))
        );

      coveredReqs[req] = isAddressed;
      if (!isAddressed) {
        uncovered.push(req);
      }
    });

    setRequirementsCoverage(coveredReqs);
    setUncoveredRequirements(uncovered);
  };

  // Update requirements coverage whenever form values change
  useEffect(() => {
    const subscription = watch((value) => {
      checkRequirementsCoverage(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, currentRfp]);

  // Watch specific form fields instead of all values
  const technicalProposal = watch('technicalProposal');
  const technicalApproach = watch('technicalApproach');
  const methodology = watch('methodology');
  const watchedTeamComposition = watch('teamComposition');
  const qualityAssurance = watch('qualityAssurance');
  const riskMitigation = watch('riskMitigation');

  // Update form watch to check requirements coverage with specific dependencies
  useEffect(() => {
    const formData = {
      technicalProposal,
      technicalApproach,
      methodology,
      teamComposition: watchedTeamComposition,
      qualityAssurance,
      riskMitigation
    };
    checkRequirementsCoverage(formData);
  }, [
    currentRfp,
    technicalProposal,
    technicalApproach,
    methodology,
    watchedTeamComposition,
    qualityAssurance,
    riskMitigation
  ]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentRfp) return;

    // Clear all form data and states
    setUploadedFile(null);
    setAnalysisStep('extracting');
    setProcessingText('');
    setRequirementsCoverage({});
    setUncoveredRequirements([]);
    
    // Reset all form fields
    setValue('proposedBudget', '');
    setValue('proposedTimeline', '');
    setValue('technicalProposal', '');
    setValue('technicalApproach', '');
    setValue('methodology', '');
    setValue('deliverables', ['']);
    setValue('projectMilestones', [{ title: '', duration: '', description: '' }]);
    setValue('teamComposition', [{ role: '', experience: '', certifications: [] }]);
    setValue('qualityAssurance', '');
    setValue('riskMitigation', '');

    setUploadedFile(file);
    setAnalysisStep('extracting');

    try {
      setIsAnalyzing(true);
      
      // Simulate extraction phase with detailed status updates
      setProcessingText('Initializing AI analysis...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingText('Extracting document content...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingText('Processing technical requirements...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalysisStep('analyzing');
      setProcessingText('Analyzing project scope...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingText('Evaluating technical specifications...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingText('Generating proposal structure...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const analysis = await analyzeDocument(file);

      // Simulate partial coverage of requirements
      const partialTechnicalProposal = currentRfp.requirements
        .filter((_, index) => Math.random() > 0.3) // Randomly exclude some requirements
        .join('\n');

      // Simulate missing certifications
      const partialCertifications = currentRfp.certifications
        .filter((_, index) => Math.random() > 0.4) // Randomly exclude some certifications
        .slice(0, Math.max(1, Math.floor(currentRfp.certifications.length * 0.6))); // Keep at most 60% of certifications

      // Simulate partial compliance coverage
      const partialCompliance = currentRfp.compliance
        .filter((_, index) => Math.random() > 0.2) // Randomly exclude some compliance requirements
        .join('\n');

      // Map the analysis results to the form fields with partial coverage
      setValue('proposedBudget', currentRfp.budget.split(' - ')[0]);
      setValue('proposedTimeline', currentRfp.teamRequirements.experience);
      setValue('technicalProposal', partialTechnicalProposal);
      setValue('technicalApproach', analysis.description);
      setValue('methodology', 'Agile methodology with bi-weekly sprints');
      setValue('deliverables', currentRfp.requirements.slice(0, Math.floor(currentRfp.requirements.length * 0.7))); // Only 70% of deliverables
      setValue('projectMilestones', [
        { title: 'Project Initiation', duration: '2 weeks', description: 'Setup and planning phase' },
        { title: 'Development Phase', duration: '3 months', description: 'Core development work' },
        { title: 'Testing & QA', duration: '1 month', description: 'Quality assurance and testing' }
      ]);
      setValue('teamComposition', currentRfp.teamRequirements.roles.map(role => ({
        role,
        experience: currentRfp.teamRequirements.experience,
        certifications: partialCertifications // Use partial certifications
      })));
      setValue('qualityAssurance', partialCompliance);
      setValue('riskMitigation', `Risk mitigation strategy aligned with:\n${currentRfp.industryStandards.slice(0, -1).join('\n')}`); // Exclude last industry standard

      setAnalysisStep('complete');
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast.error('Failed to analyze document. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setProcessingText('');
    }
  };

  const addDeliverable = () => {
    const currentDeliverables = watch('deliverables');
    setValue('deliverables', [...currentDeliverables, '']);
  };

  const removeDeliverable = (index: number) => {
    const currentDeliverables = watch('deliverables');
    setValue('deliverables', currentDeliverables.filter((_, i) => i !== index));
  };

  const addMilestone = () => {
    const currentMilestones = watch('projectMilestones');
    setValue('projectMilestones', [...currentMilestones, { title: '', duration: '', description: '' }]);
  };

  const removeMilestone = (index: number) => {
    const currentMilestones = watch('projectMilestones');
    setValue('projectMilestones', currentMilestones.filter((_, i) => i !== index));
  };

  const addTeamMember = () => {
    setValue('teamComposition', [
      ...teamComposition,
      { role: '', experience: '', certifications: [] }
    ]);
  };

  const removeTeamMember = (index: number) => {
    setValue(
      'teamComposition',
      teamComposition.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: BidFormData) => {
    // Add additional files to the form data
    const formData = {
      ...data,
      additionalFiles: additionalFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async (data: BidFormData) => {
    try {
      setIsSubmitting(true);
      // Create form data with additional files
      const formData = {
        ...data,
        additionalFiles: additionalFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      };
      await submitBid(params.id as string);
      toast.success('Bid submitted successfully!');
      router.push('/bids');
    } catch (error) {
      toast.error('Failed to submit bid. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const handleAdditionalFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setAdditionalFiles(prev => [...prev, ...newFiles]);
  };

  const removeAdditionalFile = (index: number) => {
    setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!currentRfp) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Submit Bid
              </h1>
              <p className="mt-2 text-gray-600">
                for {currentRfp.title}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="bidForm"
                disabled={formIsSubmitting}
                className="btn-primary"
              >
                {formIsSubmitting ? 'Submitting...' : 'Submit Bid'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* AI Analysis Card */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
              Document Analysis
            </h2>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary-400 transition-colors duration-200">
              <div className="space-y-1 text-center">
                {!isAnalyzing && !uploadedFile && (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload a file</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          disabled={isAnalyzing}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                  </>
                )}
                {isAnalyzing && (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      {/* Large centered animation container */}
                      <div className="relative w-32 h-32 mb-8">
                        {/* Simple background circle with subtle gradient */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 animate-pulse"></div>
                        
                        {/* Processing icon with minimal animation */}
                        {analysisStep === 'extracting' && (
                          <div className="absolute inset-0 flex items-center justify-center animate-float">
                            <DocumentTextIcon className="h-20 w-20 text-primary-600" />
                          </div>
                        )}
                        {analysisStep === 'analyzing' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BeakerIcon className="h-20 w-20 text-secondary-600 animate-bounce" />
                          </div>
                        )}
                        {analysisStep === 'complete' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircleIcon className="h-20 w-20 text-green-500 animate-scale" />
                          </div>
                        )}
                      </div>
                      
                      {/* Large status text */}
                      <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-300% animate-gradient bg-clip-text text-transparent">
                        {processingText}
                      </h3>
                      
                      {/* Simplified progress bar */}
                      <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-700 ease-in-out"
                          style={{ 
                            width: analysisStep === 'extracting' ? '33%' : 
                                   analysisStep === 'analyzing' ? '66%' : 
                                   analysisStep === 'complete' ? '100%' : '0%' 
                          }}
                        />
                      </div>
                      
                      {/* Minimal stage indicators */}
                      <div className="mt-4 flex justify-between w-64 text-sm">
                        <span className={analysisStep === 'extracting' ? 'text-primary-600 font-medium' : 'text-gray-400'}>
                          Extracting
                        </span>
                        <span className={analysisStep === 'analyzing' ? 'text-secondary-600 font-medium' : 'text-gray-400'}>
                          Analyzing
                        </span>
                        <span className={analysisStep === 'complete' ? 'text-green-600 font-medium' : 'text-gray-400'}>
                          Complete
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {!isAnalyzing && uploadedFile && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <div className="flex items-center justify-between w-full max-w-sm p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="h-8 w-8 text-primary-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{uploadedFile.name}</span>
                            <span className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFile(null);
                            setAnalysisStep('extracting');
                            setProcessingText('');
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="text-accent-600 hover:text-accent-700 transition-colors duration-200"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={isAnalyzing}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                      className="btn-secondary text-sm"
                    >
                      Replace File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RFP Requirements Card */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                RFP Requirements
              </h2>
            </div>
            <div className="space-y-6">
              <div className="bg-primary-50 rounded-xl p-6">
                <h3 className="text-lg font-medium text-primary-800 mb-4">
                  Requirements to Address
                </h3>
                <div className="space-y-4">
                  {currentRfp.requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {uploadedFile ? (
                        <div className="flex-shrink-0 mt-1">
                          {requirementsCoverage[req] ? (
                            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                        </div>
                      ) : (
                        <div className="flex-shrink-0 mt-1">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className={`${uploadedFile ? (requirementsCoverage[req] ? 'text-green-700' : 'text-primary-700') : 'text-gray-700'}`}>
                          {req}
                        </p>
                        {uploadedFile && (
                          <p className={`mt-1 text-sm ${requirementsCoverage[req] ? 'text-green-600' : 'text-primary-600'}`}>
                            {requirementsCoverage[req] ? 'This requirement is addressed in your proposal.' : 'Please ensure your bid addresses this requirement.'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bid Form */}
          <form id="bidForm" onSubmit={handleSubmit(onSubmit)} className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300 space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Bid Details
              </h2>
            </div>

            {/* Budget and Timeline Section */}
            <div className="bg-primary-50/50 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-medium text-primary-800 flex items-center gap-2">
                <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Financial & Timeline
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="form-label">Proposed Budget</label>
                  <input
                    type="text"
                    {...register('proposedBudget')}
                    placeholder="e.g. $100,000"
                    className="form-input bg-white"
                  />
                  {errors.proposedBudget && (
                    <p className="mt-1 text-sm text-accent-600">{errors.proposedBudget.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Proposed Timeline</label>
                  <input
                    type="text"
                    {...register('proposedTimeline')}
                    placeholder="e.g. 6 months"
                    className="form-input bg-white"
                  />
                  {errors.proposedTimeline && (
                    <p className="mt-1 text-sm text-accent-600">{errors.proposedTimeline.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Technical Details Section */}
            <div className="bg-secondary-50/50 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-medium text-secondary-800 flex items-center gap-2">
                <svg className="h-5 w-5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Technical Approach
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="form-label">Technical Proposal Overview</label>
                  <textarea
                    {...register('technicalProposal')}
                    rows={4}
                    className="form-input bg-white"
                    placeholder="Provide an overview of your technical proposal..."
                  />
                  {errors.technicalProposal && (
                    <p className="mt-1 text-sm text-accent-600">{errors.technicalProposal.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Technical Approach</label>
                  <textarea
                    {...register('technicalApproach')}
                    rows={4}
                    className="form-input bg-white"
                    placeholder="Describe your technical approach..."
                  />
                  {errors.technicalApproach && (
                    <p className="mt-1 text-sm text-accent-600">{errors.technicalApproach.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Methodology</label>
                  <textarea
                    {...register('methodology')}
                    rows={4}
                    className="form-input bg-white"
                    placeholder="Describe your project methodology..."
                  />
                  {errors.methodology && (
                    <p className="mt-1 text-sm text-accent-600">{errors.methodology.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Deliverables Section */}
            <div className="bg-green-50/50 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-green-800 flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Deliverables
                </h3>
                <button
                  type="button"
                  onClick={addDeliverable}
                  className="btn-secondary text-sm"
                >
                  Add Deliverable
                </button>
              </div>
              <div className="space-y-4">
                {watch('deliverables').map((_, index) => (
                  <div key={index} className="flex gap-4">
                    <input
                      {...register(`deliverables.${index}`)}
                      className="form-input bg-white"
                      placeholder="Enter deliverable..."
                    />
                    <button
                      type="button"
                      onClick={() => removeDeliverable(index)}
                      className="btn-accent text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Milestones Section */}
            <div className="bg-blue-50/50 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-blue-800 flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Project Milestones
                </h3>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="btn-secondary text-sm"
                >
                  Add Milestone
                </button>
              </div>
              <div className="space-y-6">
                {watch('projectMilestones').map((_, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                    <input
                      {...register(`projectMilestones.${index}.title`)}
                      className="form-input"
                      placeholder="Milestone title..."
                    />
                    <input
                      {...register(`projectMilestones.${index}.duration`)}
                      className="form-input"
                      placeholder="Duration (e.g., 2 weeks)..."
                    />
                    <textarea
                      {...register(`projectMilestones.${index}.description`)}
                      className="form-input"
                      placeholder="Milestone description..."
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="btn-accent text-sm"
                      >
                        Remove Milestone
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Composition Section */}
            <div className="bg-purple-50/50 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-purple-800 flex items-center gap-2">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Team Composition
                </h3>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="btn-secondary text-sm"
                >
                  Add Team Member
                </button>
              </div>
              <div className="space-y-6">
                {watch('teamComposition').map((_, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                    <input
                      {...register(`teamComposition.${index}.role`)}
                      className="form-input"
                      placeholder="Role (e.g., Project Manager)..."
                    />
                    <input
                      {...register(`teamComposition.${index}.experience`)}
                      className="form-input"
                      placeholder="Experience (e.g., 5+ years)..."
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="btn-accent text-sm"
                      >
                        Remove Member
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality & Risk Section */}
            <div className="bg-yellow-50/50 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-medium text-yellow-800 flex items-center gap-2">
                <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Quality & Risk Management
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="form-label">Quality Assurance Plan</label>
                  <textarea
                    {...register('qualityAssurance')}
                    rows={4}
                    className="form-input bg-white"
                    placeholder="Describe your quality assurance approach..."
                  />
                  {errors.qualityAssurance && (
                    <p className="mt-1 text-sm text-accent-600">{errors.qualityAssurance.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Risk Mitigation Strategy</label>
                  <textarea
                    {...register('riskMitigation')}
                    rows={4}
                    className="form-input bg-white"
                    placeholder="Describe your risk mitigation strategy..."
                  />
                  {errors.riskMitigation && (
                    <p className="mt-1 text-sm text-accent-600">{errors.riskMitigation.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Files Section */}
            <div className="bg-gray-50/50 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Supporting Documents
                </h3>
                <button
                  type="button"
                  onClick={() => additionalFilesRef.current?.click()}
                  className="btn-secondary text-sm"
                >
                  Add Files
                </button>
                <input
                  ref={additionalFilesRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleAdditionalFiles}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                />
              </div>
              {additionalFiles.length > 0 && (
                <ul className="divide-y divide-gray-200 bg-white rounded-lg overflow-hidden">
                  {additionalFiles.map((file, index) => (
                    <li key={index} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAdditionalFile(index)}
                        className="text-accent-600 hover:text-accent-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-50">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Ready to Submit Your Bid
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please review your bid details carefully. Once submitted, you won't be able to make changes.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={() => handleConfirmSubmit(getValues())}
                  disabled={formIsSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm transition-colors duration-200"
                >
                  {formIsSubmitting ? 'Submitting...' : 'Submit Bid'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={formIsSubmitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 