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
  const [analysisStep, setAnalysisStep] = useState<'upload' | 'extracting' | 'analyzing' | 'complete'>('upload');
  const [processingText, setProcessingText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFilesRef = useRef<HTMLInputElement>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uncoveredRequirements, setUncoveredRequirements] = useState<string[]>([]);
  const [requirementsCoverage, setRequirementsCoverage] = useState<{[key: string]: boolean}>({});

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

    const coverage: {[key: string]: boolean} = {};
    const uncovered: string[] = [];

    // Check technical requirements coverage
    currentRfp.requirements.forEach(req => {
      const isCovered = 
        formData.technicalProposal?.toLowerCase().includes(req.toLowerCase()) ||
        formData.technicalApproach?.toLowerCase().includes(req.toLowerCase()) ||
        formData.methodology?.toLowerCase().includes(req.toLowerCase());
      
      coverage[req] = isCovered;
      if (!isCovered) {
        uncovered.push(req);
      }
    });

    // Check certification requirements coverage
    currentRfp.certifications.forEach(cert => {
      const isCovered = formData.teamComposition?.some((member: any) => 
        member.certifications?.some((c: string) => c.toLowerCase() === cert.toLowerCase())
      );
      coverage[cert] = isCovered;
      if (!isCovered) {
        uncovered.push(cert);
      }
    });

    // Check compliance requirements coverage
    currentRfp.compliance.forEach(comp => {
      const isCovered = 
        formData.qualityAssurance?.toLowerCase().includes(comp.toLowerCase()) ||
        formData.riskMitigation?.toLowerCase().includes(comp.toLowerCase());
      coverage[comp] = isCovered;
      if (!isCovered) {
        uncovered.push(comp);
      }
    });

    setRequirementsCoverage(coverage);
    setUncoveredRequirements(uncovered);
  };

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
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="border-b border-gray-200 pb-5">
          <h3 className="text-2xl font-semibold leading-6 text-gray-900">
            Submit Bid
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            for {currentRfp.title}
          </p>
        </div>

        <div className="mt-6">
          {/* AI Analysis Flow */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700">
              Upload Proposal Document
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {!isAnalyzing ? (
                  uploadedFile ? (
                    <div className="max-w-md mx-auto bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center justify-center mb-4">
                        <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-green-800 mb-2">
                        Document Analysis Complete
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-green-700">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-green-600">
                            Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="border-t border-green-200 pt-3">
                          <h5 className="text-sm font-medium text-green-800 mb-2">Analysis Results:</h5>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li className="flex items-center">
                              <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Technical requirements extracted
                            </li>
                            <li className="flex items-center">
                              <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Team composition identified
                            </li>
                            <li className="flex items-center">
                              <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Budget and timeline estimated
                            </li>
                          </ul>
                        </div>
                        <div className="border-t border-green-200 pt-3">
                          <p className="text-sm text-green-700">
                            Please review the extracted information below and make any necessary adjustments before submitting your bid.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Upload Different File
                      </button>
                    </div>
                  ) : (
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
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
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
                  )
                ) : (
                  <div className="max-w-md mx-auto">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      AI Analysis in Progress
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6">
                          <svg className="h-6 w-6 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-indigo-800">{processingText}</p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 text-center">
                      Please wait while our AI analyzes your document...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Requirements Coverage Information */}
          {uncoveredRequirements.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Critical Requirements to Address
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p className="mb-2">Please ensure your bid addresses the following key requirements:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {uncoveredRequirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Budget and Timeline */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Proposed Budget
                </label>
                <input
                  type="text"
                  {...register('proposedBudget')}
                  placeholder="e.g. $100,000"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.proposedBudget && (
                  <p className="mt-1 text-sm text-red-600">{errors.proposedBudget.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Proposed Timeline
                </label>
                <input
                  type="text"
                  {...register('proposedTimeline')}
                  placeholder="e.g. 6 months"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.proposedTimeline && (
                  <p className="mt-1 text-sm text-red-600">{errors.proposedTimeline.message}</p>
                )}
              </div>
            </div>

            {/* Technical Proposal */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Technical Proposal Overview
              </label>
              <textarea
                {...register('technicalProposal')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Provide an overview of your technical proposal..."
              />
              {errors.technicalProposal && (
                <p className="mt-1 text-sm text-red-600">{errors.technicalProposal.message}</p>
              )}
            </div>

            {/* Technical Approach */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Technical Approach
              </label>
              <textarea
                {...register('technicalApproach')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Describe your technical approach..."
              />
              {errors.technicalApproach && (
                <p className="mt-1 text-sm text-red-600">{errors.technicalApproach.message}</p>
              )}
            </div>

            {/* Methodology */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Methodology
              </label>
              <textarea
                {...register('methodology')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Describe your project methodology..."
              />
              {errors.methodology && (
                <p className="mt-1 text-sm text-red-600">{errors.methodology.message}</p>
              )}
            </div>

            {/* Deliverables */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Deliverables</h3>
                <button
                  type="button"
                  onClick={addDeliverable}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Deliverable
                </button>
              </div>
              <div className="space-y-4">
                {watch('deliverables').map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <input
                      type="text"
                      {...register(`deliverables.${index}`)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter deliverable"
                    />
                    {watch('deliverables').length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Project Milestones */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Project Milestones</h3>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Milestone
                </button>
              </div>
              <div className="space-y-4">
                {watch('projectMilestones').map((_, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Title
                        </label>
                        <input
                          type="text"
                          {...register(`projectMilestones.${index}.title`)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Duration
                        </label>
                        <input
                          type="text"
                          {...register(`projectMilestones.${index}.duration`)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          {...register(`projectMilestones.${index}.description`)}
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    {watch('projectMilestones').length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Team Composition */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Team Composition</h3>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Team Member
                </button>
              </div>
              <div className="space-y-4">
                {watch('teamComposition').map((_, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <input
                          type="text"
                          {...register(`teamComposition.${index}.role`)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Experience
                        </label>
                        <input
                          type="text"
                          {...register(`teamComposition.${index}.experience`)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    {watch('teamComposition').length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Assurance */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quality Assurance Plan
              </label>
              <textarea
                {...register('qualityAssurance')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Describe your quality assurance approach..."
              />
              {errors.qualityAssurance && (
                <p className="mt-1 text-sm text-red-600">{errors.qualityAssurance.message}</p>
              )}
            </div>

            {/* Risk Mitigation */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Risk Mitigation Strategy
              </label>
              <textarea
                {...register('riskMitigation')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Describe your risk mitigation strategy..."
              />
              {errors.riskMitigation && (
                <p className="mt-1 text-sm text-red-600">{errors.riskMitigation.message}</p>
              )}
            </div>

            {/* Requirements Coverage Indicators */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Requirements Coverage</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(requirementsCoverage).map(([requirement, isCovered]) => (
                  <div
                    key={requirement}
                    className={`flex items-center p-3 rounded-md ${
                      isCovered ? 'bg-green-50' : 'bg-yellow-50'
                    }`}
                  >
                    {isCovered ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    )}
                    <span className={`text-sm ${isCovered ? 'text-green-700' : 'text-yellow-700'}`}>
                      {requirement}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Supporting Documents */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Additional Supporting Documents</h3>
                <button
                  type="button"
                  onClick={() => additionalFilesRef.current?.click()}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                <ul className="mt-4 divide-y divide-gray-200">
                  {additionalFiles.map((file, index) => (
                    <li key={index} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAdditionalFile(index)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              
              {additionalFiles.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Upload additional supporting documents</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX up to 10MB each</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formIsSubmitting}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {formIsSubmitting ? 'Submitting...' : 'Submit Bid'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Confirm Bid Submission
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to submit this bid? Once submitted, it cannot be modified.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={() => handleConfirmSubmit(getValues())}
                  disabled={formIsSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {formIsSubmitting ? 'Submitting...' : 'Confirm Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={formIsSubmitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 