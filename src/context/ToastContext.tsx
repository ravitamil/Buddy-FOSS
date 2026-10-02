import React, {createContext, useContext, useState, useCallback, useMemo} from 'react';
import {YStack} from 'tamagui';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomToast from '../components/ui/CustomToast';

interface ToastConfig {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (config: Omit<ToastConfig, 'id'>) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({children}) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((config: Omit<ToastConfig, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastConfig = {
      ...config,
      id,
      duration: config.duration || 4000,
    };

    setToasts((prev) => {
      // Limit to 3 toasts at once, remove oldest if more
      const updatedToasts = [...prev, newToast];
      return updatedToasts.slice(-3);
    });
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue = useMemo(
    () => ({showToast, hideToast, hideAllToasts}),
    [showToast, hideToast, hideAllToasts],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        zIndex={9999}
        pointerEvents="box-none"
        paddingTop={insets.top + 16}
        paddingHorizontal="$4"
        gap="$2">
        {toasts.map((toast, index) => (
          <YStack key={toast.id} zIndex={9999 - index}>
            <CustomToast config={toast} onHide={hideToast} />
          </YStack>
        ))}
      </YStack>
    </ToastContext.Provider>
  );
};
