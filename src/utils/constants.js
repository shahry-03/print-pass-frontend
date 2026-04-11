export const ROLES = {
  ADMIN: 'ADMIN',
  PRINT_SHOP: 'PRINT_SHOP',
};

export const JOB_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const JOB_STATUS_LABELS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  READY: 'Ready for Pickup',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const JOB_STATUS_COLORS = {
  PENDING: 'warning',
  PROCESSING: 'info',
  READY: 'success',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
  PHONE: /^\+?[0-9]{10,15}$/,
  PIN: /^[0-9]{6}$/,
};
