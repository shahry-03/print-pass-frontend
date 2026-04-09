import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, MapPin, Save, Edit } from 'lucide-react';
import { authService } from '../services';
import { useAuthStore, useNotificationStore } from '../store';
import {
  Button,
  Card,
  FormField,
  Input,
  LoadingSpinner,
  PageHeader,
  Textarea,
} from '../components/ui';

const ProfilePage = () => {
  const { token, email, role } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(token!),
    enabled: !!token,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof formData) => authService.updateProfile(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.',
      });
      setIsEditing(false);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Profile"
          subtitle="View and update your account details"
          icon={<User className="w-8 h-8 text-primary-500 shrink-0" aria-hidden />}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Account</h2>
          {!isEditing && (
            <Button
              onClick={handleEdit}
              variant="primary"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              <Edit className="w-4 h-4" aria-hidden />
              Edit profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField id="profile-name" label="Name">
              <Input
                id="profile-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 text-sm"
                required
              />
            </FormField>
            <FormField id="profile-phone" label="Phone">
              <Input
                id="profile-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="px-4 py-3 text-sm"
              />
            </FormField>
            <FormField id="profile-address" label="Address">
              <Textarea
                id="profile-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="px-4 py-3 text-sm"
              />
            </FormField>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="ghost"
                className="sm:flex-1 rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 text-sm font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                variant="primary"
                className="sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-60"
              >
                <Save className="w-4 h-4" aria-hidden />
                {updateProfileMutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        ) : (
          <dl className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 rounded-lg bg-primary-100 dark:bg-primary-900/30 p-2 text-primary-600 dark:text-primary-400">
                <Mail className="w-5 h-5" aria-hidden />
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</dt>
                <dd className="mt-1 text-slate-900 dark:text-white font-medium">{email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-0.5 rounded-lg bg-primary-100 dark:bg-primary-900/30 p-2 text-primary-600 dark:text-primary-400">
                <User className="w-5 h-5" aria-hidden />
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</dt>
                <dd className="mt-1 text-slate-900 dark:text-white font-medium">{role}</dd>
              </div>
            </div>
            {profile?.name && (
              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 p-2 text-slate-600 dark:text-slate-400">
                  <User className="w-5 h-5" aria-hidden />
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</dt>
                  <dd className="mt-1 text-slate-900 dark:text-white font-medium">{profile.name}</dd>
                </div>
              </div>
            )}
            {profile?.phone && (
              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 p-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-5 h-5" aria-hidden />
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Phone</dt>
                  <dd className="mt-1 text-slate-900 dark:text-white font-medium">{profile.phone}</dd>
                </div>
              </div>
            )}
            {profile?.address && (
              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 p-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-5 h-5" aria-hidden />
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Address</dt>
                  <dd className="mt-1 text-slate-900 dark:text-white font-medium whitespace-pre-wrap">{profile.address}</dd>
                </div>
              </div>
            )}
          </dl>
        )}
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
