import React from 'react';
import {Adapt, Dialog as TamaguiDialog, VisuallyHidden, XStack, YStack, styled} from 'tamagui';

import {Button} from '../Button';
import {Text} from '../Text';
import {AdaptiveSheet} from './BottomSheet';
import {
  type DialogAction,
  DialogActionButton,
  type DialogActionTone,
  actionVariant,
} from './DialogAction';

export type {DialogAction, DialogActionTone};
export {DialogActionButton, actionVariant};

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actions?: readonly DialogAction[];
  children?: React.ReactNode;
  dismissible?: boolean;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  actions = [],
  children,
  dismissible = true,
}: DialogProps) {
  return (
    <TamaguiDialog modal open={open} onOpenChange={onOpenChange}>
      <TamaguiDialog.Portal>
        <TamaguiDialog.Overlay
          key="buddy-dialog-overlay"
          transition="quick"
          opacity={0.64}
          enterStyle={{opacity: 0}}
          exitStyle={{opacity: 0}}
        />
        <DialogContent
          key="buddy-dialog-content"
          onPointerDownOutside={dismissible ? undefined : preventDefault}
          onEscapeKeyDown={dismissible ? undefined : preventDefault}>
          <VisuallyHidden>
            <TamaguiDialog.Title>{title}</TamaguiDialog.Title>
            <TamaguiDialog.Description>{description}</TamaguiDialog.Description>
          </VisuallyHidden>
          <YStack gap="$4" width="100%">
            <YStack gap="$2">
              <Text variant="h4" color="$text" weight="bold" textAlign="center">
                {title}
              </Text>
              <Text variant="body1" color="$textSecondary" textAlign="center">
                {description}
              </Text>
            </YStack>
            {children}
            <XStack gap="$3" justifyContent="center" width="100%" flexWrap="wrap">
              {actions.length ? (
                actions.map((action, actionIndex) => (
                  <DialogActionButton
                    key={`dialog-action-${action.label || actionIndex}`}
                    action={action}
                    onOpenChange={onOpenChange}
                  />
                ))
              ) : (
                <Button flex={1} variant="primary" onPress={() => onOpenChange(false)}>
                  OK
                </Button>
              )}
            </XStack>
          </YStack>
        </DialogContent>
      </TamaguiDialog.Portal>
      <Adapt when={true} platform="touch">
        <AdaptiveSheet
          snapPoints={[36]}
          title={title}
          description={description}
          actions={actions}
          dialogChildren={children}
          onOpenChange={onOpenChange}>
          <Adapt.Contents />
        </AdaptiveSheet>
      </Adapt>
    </TamaguiDialog>
  );
}

const preventDefault = (event: {preventDefault: () => void}) => event.preventDefault();

const DialogContent = styled(TamaguiDialog.Content, {
  name: 'BuddyDialogContent',
  width: '100%',
  maxWidth: 420,
  padding: '$0',
  borderRadius: '$0',
  borderWidth: 0,
  backgroundColor: 'transparent',
  transition: 'quick',
  animateOnly: ['transform', 'opacity'],
  enterStyle: {y: -20, opacity: 0, scale: 0.9},
  exitStyle: {y: 10, opacity: 0, scale: 0.95},
});
