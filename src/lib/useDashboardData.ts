import { useEffect, useState } from 'react';
import { listExamOccurrences } from './examOccurrencesApi';
import { apiRequest } from './apiClient';

interface StatisticsResponse {
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  submittedApplications: number;
  inReviewApplications: number;
  waitingApplications: number;
}

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  submitted: number;
  underReview: number;
}

export interface CurrentExamStats extends DashboardStats {
  examTitle?: string;
  examId?: string;
}

export interface DashboardData {
  allApplications: DashboardStats;
  currentExam: CurrentExamStats;
}

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    allApplications: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      submitted: 0,
      underReview: 0,
    },
    currentExam: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      submitted: 0,
      underReview: 0,
    },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch exam occurrences sorted by createdAt (most recent first)
        const examOccurrences = await listExamOccurrences("createdAt", "desc") as unknown as { data: Array<{ id: string; title: string }> };

        // Get the most recent exam occurrence
        const currentExamOccurrence = examOccurrences?.data?.[0];

        // Fetch statistics for all applications
        const allStatsResponse = await apiRequest<StatisticsResponse>('/api/v1/applications/statistics', 'GET', undefined, { baseUrl: import.meta.env.VITE_API_BASE_URL });
        const allStats = allStatsResponse as StatisticsResponse;

        const allAppsStats: DashboardStats = {
          total: allStats.approvedApplications + allStats.rejectedApplications + allStats.submittedApplications + allStats.inReviewApplications,
          approved: allStats.approvedApplications,
          rejected: allStats.rejectedApplications,
          submitted: allStats.submittedApplications,
          underReview: allStats.inReviewApplications,
          pending: allStats.waitingApplications,
        };

        if (currentExamOccurrence) {
          // Fetch statistics for current exam
          const statsResponse = await apiRequest<StatisticsResponse>(`/api/v1/applications/statistics?examOccurrenceId=${currentExamOccurrence.id}`, 'GET', undefined, { baseUrl: import.meta.env.VITE_API_BASE_URL });
          const stats = statsResponse as StatisticsResponse;

          const currentExamStats: CurrentExamStats = {
            total: stats.approvedApplications + stats.rejectedApplications + stats.submittedApplications + stats.inReviewApplications,
            approved: stats.approvedApplications,
            rejected: stats.rejectedApplications,
            submitted: stats.submittedApplications,
            underReview: stats.inReviewApplications,
            pending: stats.waitingApplications,
            examTitle: currentExamOccurrence.title,
            examId: currentExamOccurrence.id,
          };

          setData({
            allApplications: allAppsStats,
            currentExam: currentExamStats,
          });
        } else {
          setData({
            allApplications: allAppsStats,
            currentExam: {
              total: 0,
              pending: 0,
              approved: 0,
              rejected: 0,
              submitted: 0,
              underReview: 0,
            },
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return data;
}
