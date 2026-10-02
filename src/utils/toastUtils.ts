// Toast Utility Functions
// Use these functions to show toasts throughout the app

export interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// These functions should be used with the useToast hook
// Example usage:
// const { showToast } = useToast();
// showSuccessToast(showToast, { title: 'Success!', message: 'Card saved successfully' });

export const showSuccessToast = (showToast: (config: any) => void, options: ToastOptions) => {
  showToast({
    type: 'success',
    ...options,
  });
};

export const showErrorToast = (showToast: (config: any) => void, options: ToastOptions) => {
  showToast({
    type: 'error',
    ...options,
  });
};

export const showWarningToast = (showToast: (config: any) => void, options: ToastOptions) => {
  showToast({
    type: 'warning',
    ...options,
  });
};

export const showInfoToast = (showToast: (config: any) => void, options: ToastOptions) => {
  showToast({
    type: 'info',
    ...options,
  });
};

// Predefined common toasts
export const CommonToasts = {
  cardSaved: {
    title: 'Card Saved',
    message: 'Your credit card has been saved successfully',
    duration: 3000,
  },
  cardDeleted: {
    title: 'Card Deleted',
    message: 'Credit card has been removed from your wallet',
    duration: 3000,
  },
  cardCopied: {
    title: 'Copied!',
    message: 'Card details copied to clipboard',
    duration: 2000,
  },
  validationError: {
    title: 'Validation Error',
    message: 'Please check your input and try again',
    duration: 4000,
  },
  networkError: {
    title: 'Network Error',
    message: 'Please check your connection and try again',
    duration: 4000,
  },
  unexpectedError: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again',
    duration: 4000,
  },
};

// Clipboard utility with toast
export const copyToClipboardWithToast = async (
  text: string,
  showToast: (config: any) => void,
  options?: Partial<ToastOptions>,
) => {
  try {
    const Clipboard = await import('expo-clipboard');
    await Clipboard.setStringAsync(text);

    showSuccessToast(showToast, {
      title: options?.title || 'Copied!',
      message: options?.message || 'Content copied to clipboard',
      duration: options?.duration || 2000,
      ...options,
    });
  } catch (error) {
    showErrorToast(showToast, {
      title: 'Copy Failed',
      message: 'Unable to copy to clipboard',
      duration: 3000,
    });
  }
};
