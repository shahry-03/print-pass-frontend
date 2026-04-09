import { create } from 'zustand';

interface Job {
  id: string;
  fileName: string;
  fileUrl: string;
  jobStatus: string;
  secretKey: string;
  shopId: string;
  createdAt: string;
  expiresAt: string;
}

interface JobState {
  jobs: Job[];
  currentJob: Job | null;
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  setCurrentJob: (job: Job | null) => void;
  clearJobs: () => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  currentJob: null,

  setJobs: (jobs) => set({ jobs }),

  addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),

  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, ...updates } : job
      ),
      currentJob: state.currentJob?.id === id ? { ...state.currentJob, ...updates } : state.currentJob,
    })),

  setCurrentJob: (job) => set({ currentJob: job }),

  clearJobs: () => set({ jobs: [], currentJob: null }),
}));
