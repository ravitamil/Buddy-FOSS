import React, {useCallback} from 'react';

import {Button, type ButtonVariant} from '../Button';

export type DialogActionTone =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'cancel'
  | 'success'
  | 'destructive';

export interface DialogAction {
  label: string;
  onPress: () => void;
  tone?: DialogActionTone;
  disabled?: boolean;
  closeOnPress?: boolean;
}

export function DialogActionButton({
  action,
  onOpenChange,
}: {
  action: DialogAction;
  onOpenChange: (open: boolean) => void;
}) {
  const handlePress = useCallback(() => {
    action.onPress();
    if (action.closeOnPress !== false) {
      onOpenChange(false);
    }
  }, [action, onOpenChange]);

  return (
    <Button
      flex={1}
      minWidth={100}
      variant={actionVariant[action.tone ?? 'default']}
      disabled={action.disabled}
      onPress={handlePress}>
      {action.label}
    </Button>
  );
}

export const actionVariant: Record<DialogActionTone, ButtonVariant> = {
  default: 'primary',
  primary: 'primary',
  secondary: 'secondary',
  outline: 'outline',
  cancel: 'outline',
  success: 'success',
  destructive: 'danger',
};
