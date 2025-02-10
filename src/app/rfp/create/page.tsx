'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRfpStore } from '@/store/rfp';
import { analyzeDocument } from '@/utils/ai';
import type { RFPFormData } from '@/types/rfp';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { DocumentPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

export default function CreateRfpPage() {
  const router = useRouter();
  const { addRfp } = useRfpStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<RFPFormData | null>(null);
  const [uploadState, setUploadState] = useState<
    'idle' | 
    'uploading' | 
    'scanning' |
    'analyzing' | 
    'extracting' |
    'completed' | 
    'error'
  >('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<{
    stage: string;
    progress: number;
  }>({ stage: '', progress: 0 });
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    extractedFields: string[];
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RFPFormData>({
    resolver: zodResolver(rfpSchema),
    defaultValues: {
      requirements: [],
      certifications: [],
      compliance: [],
      industryStandards: [],
      teamRequirements: {
        roles: [],
        experience: '',
        size: ''
      },
      status: 'draft'
    }
  });

  const requirements = watch('requirements');
  const certifications = watch('certifications');
  const compliance = watch('compliance');
  const industryStandards = watch('industryStandards');
  const teamRoles = watch('teamRequirements.roles');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setUploadState('uploading');
    setUploadProgress(0);
    setCurrentStage({ stage: 'Uploading document', progress: 0 });
    setUploadedFile({
      name: file.name,
      size: formatFileSize(file.size),
      extractedFields: []
    });

    try {
      // Stage 1: Uploading
      await new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setCurrentStage(prev => ({ ...prev, progress }));
          if (progress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });

      // Stage 2: Scanning
      setUploadState('scanning');
      setCurrentStage({ stage: 'Scanning document for content', progress: 0 });
      await new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setCurrentStage(prev => ({ ...prev, progress }));
          if (progress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });

      // Stage 3: Analyzing
      setUploadState('analyzing');
      setCurrentStage({ stage: 'Analyzing content', progress: 0 });
      await new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 8;
          setCurrentStage(prev => ({ ...prev, progress }));
          if (progress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });

      // Stage 4: Extracting
      setUploadState('extracting');
      setCurrentStage({ stage: 'Extracting information', progress: 0 });
      setIsAnalyzing(true);

      // Start progress animation for extraction
      const extractionInterval = setInterval(() => {
        setCurrentStage(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 5, 90)
        }));
      }, 100);

      const result = await analyzeDocument(file);
      clearInterval(extractionInterval);
      
      // Set budget and deadline with reasonable values
      const today = new Date();
      const threeMonthsFromNow = new Date(today.setMonth(today.getMonth() + 3));
      setValue('budget', '$50,000 - $100,000');
      setValue('deadline', threeMonthsFromNow.toISOString().split('T')[0]);
      setValue('category', 'Software Development');
      
      // Update form with AI analysis results
      const extractedFields: Array<{ field: string; value: string }> = [];
      Object.entries(result).forEach(([key, value]) => {
        setValue(key as any, value);
        if (value) {
          extractedFields.push({
            field: key,
            value: typeof value === 'string' ? value : Array.isArray(value) ? `${value.length} items` : 'Updated'
          });
        }
      });
      
      // Add budget, deadline, and category to extracted fields
      extractedFields.push(
        { field: 'budget', value: '$50,000 - $100,000' },
        { field: 'deadline', value: threeMonthsFromNow.toLocaleDateString() },
        { field: 'category', value: 'Software Development' }
      );
      
      // Update uploaded file info with extracted fields
      setUploadedFile(prev => prev ? {
        ...prev,
        extractedFields: extractedFields.map(ef => ef.field)
      } : null);
      
      // Complete with 100% progress
      setCurrentStage({ stage: 'Completed', progress: 100 });
      setUploadState('completed');
      toast.success('Document analyzed successfully');
    } catch (error) {
      setUploadState('error');
      setCurrentStage({ stage: 'Error', progress: 0 });
      toast.error('Error analyzing document');
    } finally {
      setIsAnalyzing(false);
    }
  };

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
    setFormData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;
    
    const newRfp = {
      ...formData,
      id: `rfp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
      bids: [],
      status: 'draft' as const,
      company: {
        id: user?.email || `guest_${Date.now()}`,
        name: user?.companyName || 'My Company',
      }
    };

    addRfp(newRfp);
    toast.success('RFP draft has been created successfully');
    router.push('/rfp/manage');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Enter RFP title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Select a category</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Cloud Services">Cloud Services</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="IT Infrastructure">IT Infrastructure</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Blockchain">Blockchain</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="IoT Development">IoT Development</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Provide a detailed description of your project"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Budget Range
                </label>
                <input
                  type="text"
                  {...register('budget')}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="e.g., $50,000 - $100,000"
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
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Requirements</h3>
              <div className="space-y-3">
                {requirements.map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      {...register(`requirements.${index}`)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="Add a technical requirement"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('requirements', index)}
                      className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('requirements')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Add Requirement
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Required Certifications</h3>
              <div className="space-y-3">
                {certifications.map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      {...register(`certifications.${index}`)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="Add a required certification"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('certifications', index)}
                      className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('certifications')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Add Certification
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Team Requirements</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Required Roles</label>
                  <div className="mt-2 space-y-3">
                    {teamRoles.map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          {...register(`teamRequirements.roles.${index}`)}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="Add a required role"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('teamRequirements.roles', index)}
                          className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('teamRequirements.roles')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Add Role
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Experience Level
                    </label>
                    <input
                      {...register('teamRequirements.experience')}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="e.g., 5+ years in enterprise solutions"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Team Size
                    </label>
                    <input
                      {...register('teamRequirements.size')}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="e.g., 5-7 team members"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance & Standards</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Compliance Requirements</label>
                  <div className="mt-2 space-y-3">
                    {compliance.map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          {...register(`compliance.${index}`)}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="Add a compliance requirement"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('compliance', index)}
                          className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('compliance')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Add Compliance
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Industry Standards</label>
                  <div className="mt-2 space-y-3">
                    {industryStandards.map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          {...register(`industryStandards.${index}`)}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="Add an industry standard"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('industryStandards', index)}
                          className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('industryStandards')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Add Standard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50/30">
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                    <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Create RFP
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to create this RFP? You can edit it later from the RFP management page.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:col-start-2"
                    onClick={handleConfirm}
                  >
                    Create RFP
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-soft hover:shadow-glow transition-all duration-300">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Create New RFP
              </h1>
              <p className="mt-2 text-gray-600">
                Fill out the form below to create a new Request for Proposal. You can also upload a document to auto-fill the form.
              </p>
            </div>

            {/* Document Upload */}
            <div className="mb-8">
              <div className="max-w-xl">
                <label
                  htmlFor="file-upload"
                  className={`relative block w-full rounded-lg border-2 border-dashed p-6 text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer transition-all duration-300 ${
                    uploadState === 'error' 
                      ? 'border-red-300 hover:border-red-400' 
                      : uploadState === 'completed'
                      ? 'border-green-300 hover:border-green-400'
                      : 'border-gray-300 hover:border-primary-400'
                  }`}
                >
                  <DocumentPlusIcon className={`mx-auto h-12 w-12 transition-colors duration-300 ${
                    uploadState === 'error' 
                      ? 'text-red-400' 
                      : uploadState === 'completed'
                      ? 'text-green-400'
                      : uploadState === 'uploading' || uploadState === 'scanning' || uploadState === 'analyzing' || uploadState === 'extracting'
                      ? 'text-primary-400 animate-pulse'
                      : 'text-gray-400'
                  }`} />
                  
                  {uploadState === 'idle' && (
                    <>
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload a document to auto-fill
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PDF, DOC, or DOCX up to 10MB
                      </span>
                    </>
                  )}
                  
                  {(uploadState === 'uploading' || uploadState === 'scanning' || uploadState === 'analyzing' || uploadState === 'extracting') && (
                    <div className="mt-4">
                      <span className="block text-sm font-medium text-gray-900">
                        {currentStage.stage}...
                      </span>
                      <div className="mt-2">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500 transition-all duration-300"
                            style={{ width: `${currentStage.progress}%` }}
                          />
                        </div>
                        <span className="mt-2 block text-xs text-gray-500">
                          {currentStage.progress}%
                        </span>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        {uploadState === 'uploading' && 'Uploading your document...'}
                        {uploadState === 'scanning' && 'Scanning document for content...'}
                        {uploadState === 'analyzing' && 'Analyzing document structure...'}
                        {uploadState === 'extracting' && 'Extracting relevant information...'}
                      </div>
                    </div>
                  )}
                  
                  {uploadState === 'completed' && uploadedFile && (
                    <div className="mt-4 text-left">
                      <div className="flex items-center gap-2">
                        <DocumentPlusIcon className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-gray-900">{uploadedFile.name}</span>
                        <span className="text-sm text-gray-500">({uploadedFile.size})</span>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900">Extracted Information:</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {uploadedFile.extractedFields.map((field) => (
                            <span
                              key={field}
                              className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700"
                            >
                              {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Budget set to: $50,000 - $100,000</p>
                          <p>Deadline set to: {new Date(watch('deadline')).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 text-sm text-primary-600 hover:text-primary-500 font-medium"
                      >
                        Replace document
                      </button>
                    </div>
                  )}
                  
                  {uploadState === 'error' && (
                    <div className="mt-2">
                      <span className="block text-sm font-medium text-red-600">
                        Error analyzing document
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        Please try again
                      </span>
                    </div>
                  )}
                  
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                  />
                </label>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    onClick={() => setCurrentStep(step)}
                    className={`flex-1 text-center py-2 ${
                      currentStep === step
                        ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {step === 1 ? 'Basic Info' : step === 2 ? 'Requirements' : 'Team & Compliance'}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Previous
                  </button>
                )}
                <div className="flex-1" />
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create RFP'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 