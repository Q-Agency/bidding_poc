import { create } from 'zustand';
import React from 'react';

interface AnalyticsMetric {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
}

interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string | string[];
  tension?: number;
  fill?: boolean;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface AIInsight {
  title: string;
  description: string;
  category: 'performance' | 'trends' | 'recommendations';
  iconType: 'trend-up' | 'chart-bar' | 'light-bulb' | 'clock' | 'scale';
  action?: string;
}

interface Prediction {
  title: string;
  description: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

interface AnalyticsState {
  metrics: AnalyticsMetric[];
  bidSuccessData: ChartData;
  rfpVolumeData: ChartData;
  categoryDistributionData: ChartData;
  competitiveAnalysisData: ChartData;
  successFactorsData: ChartData;
  aiInsights: AIInsight[];
  predictions: Prediction[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  selectedTimeRange: 'week' | 'month' | 'quarter' | 'year';
  
  // Actions
  setSelectedTimeRange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
  fetchAnalytics: () => Promise<void>;
}

// Chart color constants
const CHART_COLORS = {
  primary: {
    base: 'rgb(14, 165, 233)', // primary-500
    light: 'rgba(14, 165, 233, 0.2)',
    gradient: {
      start: 'rgba(14, 165, 233, 0.8)',
      end: 'rgba(14, 165, 233, 0.1)',
    },
  },
  secondary: {
    base: 'rgb(139, 92, 246)', // secondary-500
    light: 'rgba(139, 92, 246, 0.2)',
    gradient: {
      start: 'rgba(139, 92, 246, 0.8)',
      end: 'rgba(139, 92, 246, 0.1)',
    },
  },
  categories: [
    'rgba(14, 165, 233, 0.8)',  // primary-500
    'rgba(139, 92, 246, 0.8)',  // secondary-500
    'rgba(244, 63, 94, 0.8)',   // accent-500
    'rgba(34, 197, 94, 0.8)',   // green-500
    'rgba(234, 179, 8, 0.8)',   // yellow-500
  ],
};

// Generate mock AI insights
const generateMockInsights = (): AIInsight[] => [
  {
    title: 'Win Rate Improvement',
    description: 'Your win rate has increased by 15% this month. Key factors include faster response times and better proposal quality.',
    category: 'performance',
    iconType: 'trend-up',
    action: 'View detailed analysis',
  },
  {
    title: 'Emerging Category',
    description: 'Healthcare technology RFPs have increased by 30% in your region. Consider expanding your expertise in this area.',
    category: 'trends',
    iconType: 'chart-bar',
    action: 'Explore opportunities',
  },
  {
    title: 'Proposal Optimization',
    description: 'Adding more detailed technical specifications could improve your win rate by up to 25%.',
    category: 'recommendations',
    iconType: 'light-bulb',
    action: 'View recommendations',
  },
  {
    title: 'Response Time Alert',
    description: 'Your average response time has increased to 3.5 days. Consider streamlining your review process.',
    category: 'performance',
    iconType: 'clock',
    action: 'View bottlenecks',
  },
  {
    title: 'Competitive Intelligence',
    description: 'Your pricing is 15% higher than market average in the software development category.',
    category: 'trends',
    iconType: 'scale',
    action: 'View pricing analysis',
  },
];

// Generate mock predictions
const generateMockPredictions = (): Prediction[] => [
  {
    title: 'Expected Win Rate',
    description: 'Based on current trends and improvements',
    value: '75%',
    change: '8%',
    trend: 'up',
  },
  {
    title: 'Projected RFP Volume',
    description: 'Forecast for next quarter',
    value: '45',
    change: '12',
    trend: 'up',
  },
  {
    title: 'Average Bid Value',
    description: 'Predicted change in average bid amount',
    value: '$125K',
    change: '5%',
    trend: 'down',
  },
];

// Simulate API call with random data generation
const generateRandomData = (timeRange: string) => {
  const getLabels = () => {
    switch (timeRange) {
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case 'quarter':
        return ['Month 1', 'Month 2', 'Month 3'];
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    }
  };

  const labels = getLabels();
  const dataPoints = labels.length;

  // Generate random metrics with realistic variations
  const baseMetrics = {
    totalRfps: Math.floor(Math.random() * 50) + 100,
    winRate: Math.floor(Math.random() * 20) + 65,
    responseTime: (Math.random() * 2 + 2).toFixed(1),
    activeBids: Math.floor(Math.random() * 15) + 20,
  };

  // Generate random success rate data with realistic trend
  const successRateData = Array(dataPoints).fill(0).map((_, i) => {
    const trend = (i / dataPoints) * 10; // Slight upward trend
    return Math.min(95, Math.max(60, 70 + trend + (Math.random() * 10 - 5)));
  });

  // Generate random RFP volume data
  const rfpsSubmitted = Array(dataPoints).fill(0).map(() => Math.floor(Math.random() * 20) + 10);
  const rfpsWon = rfpsSubmitted.map(submitted => Math.floor(submitted * (Math.random() * 0.3 + 0.5))); // 50-80% win rate

  // Generate success factors data
  const successFactors = {
    labels: ['Technical Expertise', 'Price Competitiveness', 'Response Time', 'Innovation', 'Past Performance', 'Team Composition'],
    datasets: [{
      label: 'Your Performance',
      data: Array(6).fill(0).map(() => Math.floor(Math.random() * 40) + 60),
      borderColor: CHART_COLORS.primary.base,
      backgroundColor: CHART_COLORS.primary.light,
    }],
  };

  // Generate competitive analysis data
  const competitors = ['Your Company', 'Competitor A', 'Competitor B', 'Competitor C'];
  const competitiveAnalysis = {
    labels: competitors,
    datasets: [{
      label: 'Win Rate',
      data: competitors.map(() => Math.floor(Math.random() * 30) + 50),
      backgroundColor: CHART_COLORS.categories,
    }],
  };

  return {
    metrics: [
      {
        name: 'Total RFPs',
        value: baseMetrics.totalRfps.toString(),
        change: `+${Math.floor(Math.random() * 15)}%`,
        changeType: 'increase' as const,
      },
      {
        name: 'Win Rate',
        value: `${baseMetrics.winRate}%`,
        change: `+${Math.floor(Math.random() * 8)}%`,
        changeType: 'increase' as const,
      },
      {
        name: 'Average Response Time',
        value: `${baseMetrics.responseTime} days`,
        change: `-${Math.floor(Math.random() * 20)}%`,
        changeType: 'decrease' as const,
      },
      {
        name: 'Active Bids',
        value: baseMetrics.activeBids.toString(),
        change: `+${Math.floor(Math.random() * 5)}`,
        changeType: 'increase' as const,
      },
    ],
    bidSuccessData: {
      labels,
      datasets: [
        {
          label: 'Success Rate',
          data: successRateData,
          borderColor: CHART_COLORS.primary.base,
          backgroundColor: CHART_COLORS.primary.light,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    rfpVolumeData: {
      labels,
      datasets: [
        {
          label: 'RFPs Submitted',
          data: rfpsSubmitted,
          backgroundColor: CHART_COLORS.primary.base,
        },
        {
          label: 'RFPs Won',
          data: rfpsWon,
          backgroundColor: CHART_COLORS.secondary.base,
        },
      ],
    },
    categoryDistributionData: {
      labels: ['Technology', 'Construction', 'Healthcare', 'Education', 'Government'],
      datasets: [
        {
          label: 'Category Distribution',
          data: [
            Math.floor(Math.random() * 20) + 20,
            Math.floor(Math.random() * 15) + 15,
            Math.floor(Math.random() * 15) + 15,
            Math.floor(Math.random() * 10) + 10,
            Math.floor(Math.random() * 10) + 5,
          ],
          backgroundColor: CHART_COLORS.categories,
        },
      ],
    },
    successFactorsData: successFactors,
    competitiveAnalysisData: competitiveAnalysis,
    aiInsights: generateMockInsights(),
    predictions: generateMockPredictions(),
  };
};

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  metrics: [],
  bidSuccessData: { labels: [], datasets: [] },
  rfpVolumeData: { labels: [], datasets: [] },
  categoryDistributionData: { labels: [], datasets: [] },
  competitiveAnalysisData: { labels: [], datasets: [] },
  successFactorsData: { labels: [], datasets: [] },
  aiInsights: [],
  predictions: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  selectedTimeRange: 'month',

  setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would be an API call
      const data = generateRandomData(useAnalyticsStore.getState().selectedTimeRange);
      
      set({
        ...data,
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      set({
        isLoading: false,
        error: 'Failed to fetch analytics data',
      });
    }
  },
})); 