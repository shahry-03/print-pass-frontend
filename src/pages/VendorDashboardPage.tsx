import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Search,
  Printer,
  FileText,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Hash,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/httpError';
import { jobService, shopService } from '../services';
import type { PrintResponse } from '../types';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconField,
  Input,
  LoadingSkeleton,
  PageHeader,
} from '../components/ui';

const VendorDashboardPage = () => {
  const [pin, setPin] = useState('');
  const [fetchedFile, setFetchedFile] = useState<PrintResponse | null>(null);
  const [fetchingFile, setFetchingFile] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [currentPin, setCurrentPin] = useState('');

  const { data: shops, isLoading: loadingShops, refetch: refetchShops } = useQuery({
    queryKey: ['shops', 'my'],
    queryFn: () => shopService.getMyShops(),
  });

  const handleFetchFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setFetchingFile(true);
    setFetchedFile(null);
    try {
      const res = await jobService.getFileByPin(pin.trim());
      setFetchedFile(res);
      setCurrentPin(pin.trim());
      toast.success('File found!');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Invalid PIN or file expired'));
    } finally {
      setFetchingFile(false);
    }
  };

  const handlePrint = async () => {
    if (!currentPin) return;
    setPrinting(true);
    try {
      const res = await jobService.printJob(currentPin);
      setFetchedFile(res);
      toast.success(res.message || 'Print job completed!');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Print failed'));
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Shop Dashboard"
          subtitle="Manage print jobs and enter customer PINs"
          icon={<Store size={28} className="text-primary-500" />}
        />
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* ── Left: PIN Entry ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* PIN Entry Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 sm:p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <Hash size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Enter Customer PIN</h2>
                <p className="text-xs text-slate-400">Type the 6-digit PIN shared by the customer</p>
              </div>
            </div>

            <form onSubmit={handleFetchFile} className="flex flex-col sm:flex-row gap-3">
              <IconField icon={<Search size={18} />} className="flex-1">
                <Input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit PIN"
                  maxLength={6}
                  className="pl-11 pr-4 py-3.5 text-lg font-mono font-bold tracking-widest placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-sm"
                  aria-label="Enter 6-digit customer PIN"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </IconField>
              <Button
                type="submit"
                disabled={pin.length < 6 || fetchingFile}
                variant="primary"
                className="px-6 py-3.5 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
              >
                {fetchingFile ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search size={18} />
                    Fetch
                  </>
                )}
              </Button>
            </form>
            </Card>
          </motion.div>

          {/* File Result */}
          <AnimatePresence>
            {fetchedFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="p-6 sm:p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <FileText size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">File Retrieved</h3>
                    <p className="text-xs text-slate-400">PIN: <span className="font-mono font-bold">{currentPin}</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-primary-500" />
                      <span className="font-semibold text-slate-900 dark:text-white">{fetchedFile.fileName}</span>
                    </div>
                    {fetchedFile.fileUrl && (
                      <a
                        href={fetchedFile.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        <ExternalLink size={14} />
                        Download
                      </a>
                    )}
                  </div>

                  {fetchedFile.message && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm">
                      <CheckCircle2 size={16} />
                      {fetchedFile.message}
                    </div>
                  )}

                  <Button
                    onClick={handlePrint}
                    disabled={printing}
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {printing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Printer size={18} />
                        Mark as Printed
                      </>
                    )}
                  </Button>
                </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: My Shops ── */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store size={20} className="text-primary-500" />
                My Shops
              </h2>
              <Button
                onClick={() => refetchShops()}
                variant="ghost"
                className="p-2 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                aria-label="Refresh shops"
              >
                <RefreshCw size={16} />
              </Button>
            </div>

            {loadingShops ? (
              <LoadingSkeleton lines={4} />
            ) : !shops || shops.length === 0 ? (
              <EmptyState
                icon={<Store />}
                title="No shop profile yet"
                description="Complete registration or contact support if your shop should already be listed. You can still fetch customer PINs from the left panel."
              >
                <Link
                  to="/shop-settings"
                  className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Open shop settings
                </Link>
              </EmptyState>
            ) : (
              <div className="space-y-3">
                {shops.map((shop) => (
                  <Card
                    key={shop.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{shop.shopName}</h3>
                      <div className="flex gap-1.5">
                        {shop.isVerified ? (
                          <Badge variant="success" className="px-2 py-0.5">Verified</Badge>
                        ) : (
                          <Badge variant="warning" className="px-2 py-0.5">Pending</Badge>
                        )}
                        {shop.isActive ? (
                          <Badge variant="info" className="px-2 py-0.5">Active</Badge>
                        ) : (
                          <Badge variant="neutral" className="px-2 py-0.5">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{shop.address}, {shop.city}</p>
                    <p className="text-xs text-slate-400 mt-1">{shop.ownerName} · {shop.phone}</p>
                  </Card>
                ))}
              </div>
            )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
