'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  companyName: z.string().min(1, 'Company name is required'),
  phone: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      companyName: user?.companyName || '',
      phone: '',
      position: '',
      bio: '',
      location: '',
      website: '',
      linkedin: '',
      twitter: '',
    }
  });

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real application, you would upload the file to your storage service here
      toast.success('Profile image updated successfully');
    } catch (error) {
      toast.error('Failed to update profile image');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-300">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-8">
                <div className="relative">
                  <img
                    src={user?.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt={user?.name}
                    className="h-32 w-32 rounded-full object-cover ring-4 ring-white shadow-soft"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    disabled={!isEditing || isUploading}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600">{user?.companyName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  isEditing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      {...register('name')}
                      disabled={!isEditing}
                      className="w-full rounded-lg border-gray-300 bg-white/50 shadow-soft focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100/50"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      {...register('email')}
                      disabled={!isEditing}
                      className="w-full rounded-lg border-gray-300 bg-white/50 shadow-soft focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100/50"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      {...register('companyName')}
                      disabled={!isEditing}
                      className="w-full rounded-lg border-gray-300 bg-white/50 shadow-soft focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100/50"
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      {...register('phone')}
                      disabled={!isEditing}
                      className="w-full rounded-lg border-gray-300 bg-white/50 shadow-soft focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100/50"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      {...register('position')}
                      disabled={!isEditing}
                      className="w-full rounded-lg border-gray-300 bg-white/50 shadow-soft focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100/50"
                    />
                    {errors.position && (
                      <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      {...register('location')}
                      disabled={!isEditing}
                      className="w-full rounded-lg border-gray-300 bg-white/50 shadow-soft focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100/50"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                  About
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    disabled={!isEditing}
                    className="w-full rounded-lg border-gray-300 bg-white/50 shadow-soft focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100/50"
                    placeholder={isEditing ? "Write a brief description about yourself or your company..." : ""}
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
                  Social Links
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      {...register('website')}
                      disabled={!isEditing}
                      className="w-full rounded-lg border-gray-300 bg-white/50 shadow-soft focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100/50"
                      placeholder={isEditing ? "https://example.com" : ""}
                    />
                    {errors.website && (
                      <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      {...register('linkedin')}
                      disabled={!isEditing}
                      className="w-full rounded-lg border-gray-300 bg-white/50 shadow-soft focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100/50"
                      placeholder={isEditing ? "https://linkedin.com/in/username" : ""}
                    />
                    {errors.linkedin && (
                      <p className="mt-1 text-sm text-red-600">{errors.linkedin.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                    <input
                      type="url"
                      {...register('twitter')}
                      disabled={!isEditing}
                      className="w-full rounded-lg border-gray-300 bg-white/50 shadow-soft focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100/50"
                      placeholder={isEditing ? "https://twitter.com/username" : ""}
                    />
                    {errors.twitter && (
                      <p className="mt-1 text-sm text-red-600">{errors.twitter.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-3 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 