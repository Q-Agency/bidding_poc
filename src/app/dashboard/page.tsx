'use client';

import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Welcome, {user?.name}
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your RFPs and track your bidding progress
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {/* My RFPs Card */}
          <Link href="/rfp/create" className="block group">
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      My RFPs
                    </dt>
                    <dd className="mt-2">
                      <div className="text-3xl font-bold text-gray-900">3</div>
                      <div className="mt-2 text-sm font-medium text-primary-600 group-hover:text-primary-700 transition-colors duration-200">
                        Create New RFP →
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>

          {/* My Bids Card */}
          <Link href="/bids" className="block group">
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Active Bids
                    </dt>
                    <dd className="mt-2">
                      <div className="text-3xl font-bold text-gray-900">5</div>
                      <div className="mt-2 text-sm font-medium text-secondary-600 group-hover:text-secondary-700 transition-colors duration-200">
                        View My Bids →
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>

          {/* Available RFPs Card */}
          <Link href="/rfp/browse" className="block group">
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Available RFPs
                    </dt>
                    <dd className="mt-2">
                      <div className="text-3xl font-bold text-gray-900">12</div>
                      <div className="mt-2 text-sm font-medium text-accent-600 group-hover:text-accent-700 transition-colors duration-200">
                        Browse RFPs →
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {[
                {
                  title: 'New RFP Created',
                  description: 'Enterprise Data Analytics Platform',
                  timestamp: '2 hours ago',
                  type: 'rfp_created',
                  icon: (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white">
                      <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  ),
                },
                {
                  title: 'Bid Submitted',
                  description: 'Cloud Infrastructure Migration',
                  timestamp: '4 hours ago',
                  type: 'bid_submitted',
                  icon: (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 ring-8 ring-white">
                      <svg className="h-5 w-5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  ),
                },
                {
                  title: 'Bid Accepted',
                  description: 'Mobile App Development',
                  timestamp: '1 day ago',
                  type: 'bid_accepted',
                  icon: (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 ring-8 ring-white">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  ),
                },
              ].map((activity, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index !== 2 && (
                      <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    )}
                    <div className="relative flex space-x-3">
                      {activity.icon}
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          <time dateTime={activity.timestamp}>{activity.timestamp}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 