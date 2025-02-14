'use client';

import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Mock data for charts
  const winRateData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Win Rate',
        data: [45, 52, 49, 60, 55, 65],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryData = {
    labels: ['Tech', 'Healthcare', 'Finance', 'Education', 'Manufacturing'],
    datasets: [
      {
        label: 'RFPs by Category',
        data: [12, 8, 6, 5, 4],
        backgroundColor: [
          'rgba(14, 165, 233, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(244, 63, 94, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(234, 179, 8, 0.7)',
        ],
        borderRadius: 8,
      },
    ],
  };

  const aiInsights = [
    {
      title: "Win Rate Improvement",
      description: "Your win rate has increased by 15% in the last month",
      icon: (
        <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: "Competitive Edge",
      description: "Your technical proposals outperform 80% of competitors",
      icon: (
        <svg className="h-6 w-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      title: "Opportunity Alert",
      description: "3 new RFPs match your success criteria",
      icon: (
        <svg className="h-6 w-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative">
      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12 backdrop-blur-sm bg-white/30 rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Welcome back, {user?.name}
              </h1>
              <p className="mt-2 text-gray-600">
                Here's what's happening with your RFPs today
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/rfp/create" className="btn-primary">
                Create New RFP
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {[
            {
              title: "Active RFPs",
              value: "12",
              change: "+2",
              icon: (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              ),
            },
            {
              title: "Win Rate",
              value: "65%",
              change: "+5%",
              icon: (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              ),
            },
            {
              title: "Pending Bids",
              value: "8",
              change: "-1",
              icon: (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ),
            },
            {
              title: "Total Value",
              value: "$2.4M",
              change: "+$300K",
              icon: (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ),
            },
          ].map((stat, index) => (
            <div key={index} className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center">
                {stat.icon}
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`ml-2 text-sm font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-accent-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts and Insights */}
          <div className="lg:col-span-2 space-y-8">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-soft hover:shadow-glow transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Win Rate Trend</h3>
                <Line
                  data={winRateData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: (value) => `${value}%`,
                        },
                      },
                    },
                  }}
                />
              </div>

              <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-soft hover:shadow-glow transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">RFPs by Category</h3>
                <Bar
                  data={categoryData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* AI Insights */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">AI-Powered Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-soft hover:shadow-glow transition-all duration-300">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">{insight.icon}</div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-soft hover:shadow-glow transition-all duration-300 sticky top-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {[
                    {
                      title: "New RFP Created",
                      description: "Enterprise Data Analytics Platform",
                      timestamp: "2 hours ago",
                      type: "rfp_created",
                      icon: (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white">
                          <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      ),
                    },
                    {
                      title: "Bid Submitted",
                      description: "Cloud Infrastructure Migration",
                      timestamp: "4 hours ago",
                      type: "bid_submitted",
                      icon: (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 ring-8 ring-white">
                          <svg className="h-5 w-5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      ),
                    },
                    {
                      title: "Bid Accepted",
                      description: "Mobile App Development",
                      timestamp: "1 day ago",
                      type: "bid_accepted",
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
      </div>
    </div>
  );
} 