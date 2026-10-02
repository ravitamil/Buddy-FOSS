import React, {createContext, useCallback, useContext, useMemo, useState, ReactNode} from 'react';
import {Dialog, type DialogAction} from '@ravitamil/buddy-ui/overlays';

export interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  variant?: 'default' | 'destructive' | 'success';
}

export interface AlertConfig {
  title: string;
  message: string;
  actions?: AlertAction[];
  onDismiss?: () => void;
  dismissible?: boolean;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({children}) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    const currentConfig = alertConfig;
    setIsVisible(false);
    setAlertConfig(null);
    if (currentConfig?.onDismiss) {
      currentConfig.onDismiss();
    } else if (currentConfig?.actions?.length === 1 && currentConfig.actions[0]?.onPress) {
      currentConfig.actions[0].onPress();
    }
  }, [alertConfig]);

  const handleActionPress = useCallback((action: AlertAction) => {
    setIsVisible(false);
    setAlertConfig(null);
    if (action.onPress) {
      action.onPress();
    }
  }, []);

  const contextValue = useMemo(() => ({showAlert, hideAlert}), [showAlert, hideAlert]);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {alertConfig && (
        <Dialog
          open={isVisible}
          onOpenChange={(open) => {
            if (!open) hideAlert();
          }}
          title={alertConfig.title}
          description={alertConfig.message}
          dismissible={alertConfig.dismissible ?? true}
          actions={alertConfig.actions?.map((action) => ({
            label: action.text,
            tone: (action.variant === 'destructive' || action.style === 'destructive'
              ? 'destructive'
              : action.variant === 'success'
                ? 'success'
                : action.style === 'cancel' || action.text.toLowerCase() === 'cancel'
                  ? 'outline'
                  : 'primary') satisfies DialogAction['tone'],
            onPress: () => handleActionPress(action),
          }))}
        />
      )}
    </AlertContext.Provider>
  );
};

// Utility function to replace Alert.alert
export const showCustomAlert = (
  _title: string,
  _message?: string,
  _buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>,
) => {
  void _title;
  void _message;
  void _buttons;
  // This is a standalone function that can be used without context
  // It will be replaced by the context-based approach in components
  appLogger.warn(
    'showCustomAlert called without AlertProvider context. Use useAlert hook instead.',
  );
};
