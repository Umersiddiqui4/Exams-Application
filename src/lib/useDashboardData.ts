import { useEffect, useState } from 'react';
import { listApplications } from './applicationsApi';
import { listExamOccurrences } from './examOccurrencesApi';

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
        const examOccurrences: any = await listExamOccurrences("createdAt", "desc");

        // Get the most recent exam occurrence
        const currentExamOccurrence = examOccurrences?.data?.[0];
        if (currentExamOccurrence) {
          // Fetch all applications
          const allAppsResponse = await listApplications();
          const allApplications = allAppsResponse.data;

          // Fetch applications for current exam
          const currentExamAppsResponse = await listApplications(currentExamOccurrence.id);
          const currentExamApplications = currentExamAppsResponse.data;
          

          // Helper function to count applications by status
          const countApplications = (applications: any[]): DashboardStats => {
            return applications.reduce((acc: DashboardStats, app: any) => {
              acc.total++;
              const status = app.status?.toLowerCase();

              switch (status) {
                case 'pending':
                case 'waiting':
                  acc.pending++;
                  break;
                case 'approved':
                  acc.approved++;
                  break;
                case 'rejected':
                  acc.rejected++;
                  break;
                case 'submitted':
                  acc.submitted++;
                  break;
                case 'under_review':
                case 'under review':
                  acc.underReview++;
                  break;
              }

              return acc;
            }, {
              total: 0,
              pending: 0,
              approved: 0,
              rejected: 0,
              submitted: 0,
              underReview: 0,
            });
          };

          const allAppsStats = countApplications(allApplications);
          const currentExamStats: CurrentExamStats = {
            ...countApplications(currentExamApplications),
            examTitle: currentExamOccurrence.title,
            examId: currentExamOccurrence.id,
          };

          setData({
            allApplications: allAppsStats,
            currentExam: currentExamStats,
          });
        } else {
          // If no exam occurrences, just fetch all applications
          const response = await listApplications();
          const applications = response.data;
          const counts = countApplications(applications);

          setData({
            allApplications: counts,
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

// Helper function to count applications by status
function countApplications(applications: any[]): DashboardStats {
  return applications.reduce((acc: DashboardStats, app: any) => {
    acc.total++;
    const status = app.status?.toLowerCase();

    switch (status) {
      case 'pending':
      case 'waiting':
        acc.pending++;
        break;
      case 'approved':
        acc.approved++;
        break;
      case 'rejected':
        acc.rejected++;
        break;
      case 'submitted':
        acc.submitted++;
        break;
      case 'under_review':
      case 'under review':
        acc.underReview++;
        break;
    }

    return acc;
  }, {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    submitted: 0,
    underReview: 0,
  });
}