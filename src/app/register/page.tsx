'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      terms: false,
    },
  });

  const password = watch('password', '');
  const passwordStrength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const getPasswordStrengthPercentage = () => {
    const criteria = Object.values(passwordStrength);
    const metCriteria = criteria.filter(Boolean).length;
    return (metCriteria / criteria.length) * 100;
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      await login(data.email, data.password);
      // Set cookies for middleware
      document.cookie = `auth=true; path=/`;
      document.cookie = `role=company; path=/`;
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to create account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="card text-center">
          <div className="mb-10">
            <Link 
              href="/"
              className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-200"
            >
              BidFlow
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join BidFlow to streamline your RFP process
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="form-input"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-accent-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-accent-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="companyName" className="form-label">
                  Company Name
                </label>
                <input
                  {...register('companyName')}
                  id="companyName"
                  type="text"
                  className="form-input"
                  placeholder="Enter your company name"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-accent-600">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Create a strong password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-accent-600">{errors.password.message}</p>
                )}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            getPasswordStrengthPercentage() <= 25 ? 'bg-accent-500' :
                            getPasswordStrengthPercentage() <= 50 ? 'bg-yellow-500' :
                            getPasswordStrengthPercentage() <= 75 ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${getPasswordStrengthPercentage()}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {getPasswordStrengthPercentage() <= 25 ? 'Weak' :
                         getPasswordStrengthPercentage() <= 50 ? 'Fair' :
                         getPasswordStrengthPercentage() <= 75 ? 'Good' :
                         'Strong'}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}>
                        <span>{passwordStrength.length ? '✓' : '○'}</span>
                        <span>8+ characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span>{passwordStrength.uppercase ? '✓' : '○'}</span>
                        <span>Uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span>{passwordStrength.lowercase ? '✓' : '○'}</span>
                        <span>Lowercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.number ? 'text-green-600' : 'text-gray-500'}`}>
                        <span>{passwordStrength.number ? '✓' : '○'}</span>
                        <span>Number</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.special ? 'text-green-600' : 'text-gray-500'}`}>
                        <span>{passwordStrength.special ? '✓' : '○'}</span>
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-accent-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  {...register('terms')}
                  id="terms"
                  type="checkbox"
                  className="form-checkbox"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-500 transition-colors duration-200">
                    Terms and Conditions
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-accent-600">{errors.terms.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-accent-50 p-4 text-sm text-accent-600">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-accent-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account?</span>{' '}
              <Link 
                href="/login" 
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 