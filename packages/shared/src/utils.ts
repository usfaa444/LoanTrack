// Currency formatting utility
export const formatCurrency = (amount: number, currency: string = 'XOF'): string => {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${amount.toFixed(2)} ${currency}`;
  }
};

// Phone validation and normalization
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Basic validation for international format
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

export const normalizePhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters except leading +
  return phoneNumber.replace(/[^+\d]/g, '');
};

// Date helpers
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const daysUntil = (date: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isOverdue = (dueDate: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dueDate);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate < today;
};