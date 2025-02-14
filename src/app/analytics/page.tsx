'use client';

import { useEffect, useRef, useState } from 'react';
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
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useAnalyticsStore } from '@/store/analytics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const getInsightIcon = (iconType: string) => {
  switch (iconType) {
    case 'trend-up':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case 'chart-bar':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'light-bulb':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'clock':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'scale':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      );
    default:
      return null;
  }
};

export default function AnalyticsPage() {
  const {
    metrics,
    bidSuccessData,
    rfpVolumeData,
    categoryDistributionData,
    competitiveAnalysisData,
    successFactorsData,
    aiInsights,
    predictions,
    isLoading,
    error,
    lastUpdated,
    selectedTimeRange,
    setSelectedTimeRange,
    fetchAnalytics,
  } = useAnalyticsStore();

  const [selectedInsightCategory, setSelectedInsightCategory] = useState('all');
  const [showAllInsights, setShowAllInsights] = useState(false);

  // Reference for the interval
  const intervalRef = useRef<NodeJS.Timeout>();

  // Initial fetch and setup interval
  useEffect(() => {
    fetchAnalytics();
    intervalRef.current = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAnalytics]);

  // Fetch new data when time range changes
  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange, fetchAnalytics]);

  const filteredInsights = aiInsights.filter(
    insight => selectedInsightCategory === 'all' || insight.category === selectedInsightCategory
  );

  const displayedInsights = showAllInsights ? filteredInsights : filteredInsights.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              AI-powered insights and performance analytics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="rounded-lg border-gray-200 bg-white px-4 py-2 shadow-soft focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            {lastUpdated && (
              <p className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-soft">
                Updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="mt-4 text-gray-600">Loading analytics...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-accent-50 border-l-4 border-accent-500 text-accent-700 p-4 rounded-lg shadow-soft mb-8">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-accent-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* AI Insights Section */}
          <div className="mb-12">
            <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="h-6 w-6 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI-Powered Insights
                </h2>
                <div className="mt-4 md:mt-0">
                  <select
                    value={selectedInsightCategory}
                    onChange={(e) => setSelectedInsightCategory(e.target.value)}
                    className="rounded-lg border-gray-200 bg-white px-4 py-2 shadow-soft focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                  >
                    <option value="all">All Insights</option>
                    <option value="performance">Performance</option>
                    <option value="trends">Trends</option>
                    <option value="recommendations">Recommendations</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayedInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start">
                      <div className={`rounded-full p-2 mr-4 ${
                        insight.category === 'performance' ? 'bg-green-100 text-green-600' :
                        insight.category === 'trends' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {getInsightIcon(insight.iconType)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                        {insight.action && (
                          <button className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200">
                            {insight.action} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredInsights.length > 3 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllInsights(!showAllInsights)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
                  >
                    {showAllInsights ? 'Show Less' : 'Show More'} →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.name}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <dt className="truncate text-sm font-medium text-gray-600">
                  {metric.name}
                </dt>
                <dd className="mt-3">
                  <div className="text-3xl font-bold text-gray-900">
                    {metric.value}
                  </div>
                  <div
                    className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      metric.changeType === 'increase'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-accent-100 text-accent-800'
                    }`}
                  >
                    {metric.changeType === 'increase' ? '↑' : '↓'} {metric.change}
                  </div>
                </dd>
              </div>
            ))}
          </div>

          {/* Predictions Section */}
          <div className="mb-12">
            <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="h-6 w-6 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Performance Predictions
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {predictions.map((prediction, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 p-4"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{prediction.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{prediction.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">{prediction.value}</span>
                      <span className={`text-sm font-medium ${
                        prediction.trend === 'up' ? 'text-green-600' : 'text-accent-600'
                      }`}>
                        {prediction.trend === 'up' ? '↑' : '↓'} {prediction.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Bid Success Rate */}
            <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Bid Success Rate
              </h2>
              <Line
                data={bidSuccessData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      titleColor: '#1f2937',
                      bodyColor: '#4b5563',
                      borderColor: '#e5e7eb',
                      borderWidth: 1,
                      padding: 12,
                      boxPadding: 6,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: '#f3f4f6',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>

            {/* RFP Volume */}
            <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                RFP Volume
              </h2>
              <Bar
                data={rfpVolumeData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      titleColor: '#1f2937',
                      bodyColor: '#4b5563',
                      borderColor: '#e5e7eb',
                      borderWidth: 1,
                      padding: 12,
                      boxPadding: 6,
                    },
                  },
                  scales: {
                    y: {
                      grid: {
                        color: '#f3f4f6',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>

            {/* Success Factors Analysis */}
            <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Success Factors Analysis
              </h2>
              <Radar
                data={successFactorsData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      titleColor: '#1f2937',
                      bodyColor: '#4b5563',
                      borderColor: '#e5e7eb',
                      borderWidth: 1,
                      padding: 12,
                      boxPadding: 6,
                    },
                  },
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        stepSize: 20,
                      },
                    },
                  },
                }}
              />
            </div>

            {/* Competitive Analysis */}
            <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Competitive Analysis
              </h2>
              <Bar
                data={competitiveAnalysisData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      titleColor: '#1f2937',
                      bodyColor: '#4b5563',
                      borderColor: '#e5e7eb',
                      borderWidth: 1,
                      padding: 12,
                      boxPadding: 6,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: '#f3f4f6',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>

            {/* Category Distribution */}
            <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-glow transition-all duration-300 lg:col-span-2">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                RFP Category Distribution
              </h2>
              <div className="mx-auto max-w-2xl">
                <Doughnut
                  data={categoryDistributionData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right' as const,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#1f2937',
                        bodyColor: '#4b5563',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 