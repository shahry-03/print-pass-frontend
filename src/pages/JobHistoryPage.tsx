import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Download,
  Clock,
  CheckCircle,
  XCircle,
  History,
  Upload,
  AlertCircle,
  Search,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../services';
import { useAuthStore } from '../store';
import SearchFilter from '../components/SearchFilter';
import { Badge, Button, Card, EmptyState, LoadingSkeleton, PageHeader } from '../components/ui';

const JobHistoryPage = () => {
  const { token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', 'history'],
    queryFn: () => jobService.getJobHistory(token!),
    enabled: !!token,
  });

  const filteredJobs = useMemo(() => {
    if (!jobs?.length) return [];
    let list = jobs;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((j) => j.fileName.toLowerCase().includes(q));
    }
    const status = activeFilters.status?.toLowerCase();
    if (status) {
      list = list.filter((j) => j.jobStatus.toLowerCase() === status);
    }
    return list;
  }, [jobs, searchQuery, activeFilters]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500 shrink-0" aria-hidden />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden />;
      default:
        return <Clock className="w-5 h-5 text-slate-400 shrink-0" aria-hidden />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8">
          <div className="h-9 w-48 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="mt-2 h-4 w-72 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
          <LoadingSkeleton lines={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 px-6 py-10 text-center"
          role="alert"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Couldn&apos;t load job history</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Check your connection and try again.
          </p>
          <Button
            onClick={() => refetch()}
            variant="primary"
            className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            Try again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Job History"
          subtitle="Track uploads and print status for your shop"
          icon={<History className="w-8 h-8 text-primary-500 shrink-0" aria-hidden />}
          actions={
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              {jobs?.length
                ? searchQuery.trim() || activeFilters.status
                  ? `${filteredJobs.length} of ${jobs.length} jobs`
                  : `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'}`
                : '0 jobs'}
            </p>
          }
        />
      </motion.div>

      {!jobs || jobs.length === 0 ? (
        <EmptyState
          icon={<History />}
          title="No jobs yet"
          description="When you or your customers upload files linked to your shop, they will appear here with status and expiry details."
        >
          <Link
            to="/upload"
            className="btn-press ui-btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity"
          >
            <Upload size={18} />
            Upload a file
          </Link>
        </EmptyState>
      ) : (
        <>
          <SearchFilter
            onSearch={setSearchQuery}
            onFilter={setActiveFilters}
            placeholder="Search by file name…"
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { value: 'completed', label: 'Completed' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'ready', label: 'Ready' },
                  { value: 'cancelled', label: 'Cancelled' },
                ],
              },
            ]}
          />

          {filteredJobs.length === 0 ? (
            <EmptyState
              icon={<Search />}
              title="No matching jobs"
              description="Try another file name or clear filters to see all jobs."
            />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                >
                  <Card className="rounded-2xl p-4 sm:p-6 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all">
                  <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="mt-0.5">{getStatusIcon(job.jobStatus)}</div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate text-base sm:text-lg">
                          {job.fileName}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Created {format(new Date(job.createdAt), 'PPP p')}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Expires {format(new Date(job.expiresAt), 'PPP p')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0 sm:pl-4">
                      <Badge className={`px-3 py-1 capitalize ${getStatusColor(job.jobStatus)}`}>
                        {job.jobStatus.toLowerCase()}
                      </Badge>
                      {job.jobStatus.toLowerCase() === 'completed' && job.fileUrl && (
                        <Button
                          onClick={() => window.open(job.fileUrl ?? undefined, '_blank')}
                          variant="soft"
                          className="p-2 sm:p-2.5 rounded-xl text-primary-600 dark:text-primary-400"
                          title="Download file"
                          aria-label={`Download ${job.fileName}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobHistoryPage;
