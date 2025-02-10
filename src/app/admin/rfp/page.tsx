'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRfpStore } from '@/store/rfp';
import { analyzeDocument } from '@/utils/ai';
import type { RFPFormData } from '@/types/rfp';

const rfpSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  company: z.string().min(1, 'Company is required'),
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

export default function RfpManagementPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<{ step: string; status: 'pending' | 'processing' | 'completed' }[]>([]);
  const { isAnalyzing, setIsAnalyzing } = useRfpStore();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RFPFormData>({
    resolver: zodResolver(rfpSchema),
    defaultValues: {
      status: 'draft',
      requirements: [],
      certifications: [],
      compliance: [],
      industryStandards: [],
      teamRequirements: {
        roles: [],
        experience: '',
        size: ''
      }
    },
  });

  const requirements = watch('requirements');
  const certifications = watch('certifications');
  const compliance = watch('compliance');
  const industryStandards = watch('industryStandards');
  const teamRoles = watch('teamRequirements.roles');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsAnalyzing(true);
    
    // Initialize analysis steps
    setAnalysisSteps([
      { step: 'Uploading document', status: 'pending' },
      { step: 'Extracting text content', status: 'pending' },
      { step: 'Analyzing document structure', status: 'pending' },
      { step: 'Identifying key requirements', status: 'pending' },
      { step: 'Estimating budget and timeline', status: 'pending' },
      { step: 'Generating final analysis', status: 'pending' },
    ]);

    try {
      // Simulate document upload
      setAnalysisSteps(steps => steps.map((step, i) => 
        i === 0 ? { ...step, status: 'processing' } : step
      ));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisSteps(steps => steps.map((step, i) => 
        i === 0 ? { ...step, status: 'completed' } : 
        i === 1 ? { ...step, status: 'processing' } : step
      ));

      // Simulate text extraction
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisSteps(steps => steps.map((step, i) => 
        i === 1 ? { ...step, status: 'completed' } : 
        i === 2 ? { ...step, status: 'processing' } : step
      ));

      // Simulate document structure analysis
      await new Promise(resolve => setTimeout(resolve, 1200));
      setAnalysisSteps(steps => steps.map((step, i) => 
        i === 2 ? { ...step, status: 'completed' } : 
        i === 3 ? { ...step, status: 'processing' } : step
      ));

      // Simulate requirements identification
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnalysisSteps(steps => steps.map((step, i) => 
        i === 3 ? { ...step, status: 'completed' } : 
        i === 4 ? { ...step, status: 'processing' } : step
      ));

      // Simulate budget and timeline estimation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisSteps(steps => steps.map((step, i) => 
        i === 4 ? { ...step, status: 'completed' } : 
        i === 5 ? { ...step, status: 'processing' } : step
      ));

      const analysis = await analyzeDocument(file);
      
      // Mark final step as completed
      setAnalysisSteps(steps => steps.map(step => ({ ...step, status: 'completed' })));

      // Populate form with AI analysis results
      setValue('title', analysis.title);
      setValue('description', analysis.description);
      setValue('company', analysis.company);
      setValue('budget', analysis.estimatedBudget);
      setValue('deadline', analysis.suggestedDeadline);
      setValue('category', analysis.suggestedCategory);
      setValue('requirements', analysis.keyRequirements);
      setValue('certifications', analysis.certifications);
      setValue('compliance', analysis.compliance);
      setValue('industryStandards', analysis.industryStandards);
      setValue('teamRequirements', analysis.teamRequirements);
    } catch (error) {
      console.error('Error analyzing document:', error);
      // Handle error appropriately
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setIsAnalyzing(false);
        setAnalysisSteps([]);
      }, 1000);
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
    // Here you would normally send the data to your backend
    console.log('Form submitted:', data);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-gray-900">
          Create New RFP
        </h3>
      </div>

      <div className="mt-6">
        {/* Document Upload Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700">
            Upload RFP Document
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {!isAnalyzing ? (
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
                        disabled={isUploading || isAnalyzing}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </>
              ) : (
                <div className="max-w-md mx-auto">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    AI Analysis in Progress
                  </h4>
                  <div className="space-y-4">
                    {analysisSteps.map((step, index) => (
                      <div key={index} className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6">
                          {step.status === 'completed' ? (
                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : step.status === 'processing' ? (
                            <svg className="h-6 w-6 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <div className="h-6 w-6 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm ${
                            step.status === 'completed' ? 'text-green-800' :
                            step.status === 'processing' ? 'text-indigo-800' :
                            'text-gray-500'
                          }`}>
                            {step.step}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    Please wait while our AI analyzes your document...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RFP Form */}
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company
              </label>
              <input
                type="text"
                {...register('company')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Budget
              </label>
              <input
                type="text"
                {...register('budget')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                {...register('status')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('requirements', index)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('requirements')}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Requirement
                  </button>
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
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('certifications', index)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('certifications')}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Certification
                  </button>
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
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('compliance', index)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('compliance')}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Compliance Requirement
                  </button>
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
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('industryStandards', index)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('industryStandards')}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Industry Standard
                  </button>
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
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('teamRequirements.roles', index)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('teamRequirements.roles')}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Team Role
                  </button>
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Required Experience
                </label>
                <input
                  {...register('teamRequirements.experience')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 8-12 team members"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save RFP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 