import React from 'react';

import {Dialog, type DialogActionTone} from './Dialog';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: DialogActionTone;
  cancelTone?: DialogActionTone;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmTone = 'destructive',
  cancelTone = 'outline',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      actions={[
        {label: cancelLabel, onPress: onCancel ?? (() => undefined), tone: cancelTone},
        {label: confirmLabel, onPress: onConfirm, tone: confirmTone},
      ]}
    />
  );
}
