import React, {useId} from 'react';
import {XStack, YStack, type YStackProps} from 'tamagui';

import {Input, type InputProps} from './Input';
import {Label, type LabelProps} from './Label';
import {Text, type TextProps} from './Text';

export interface FormFieldProps extends Omit<InputProps, 'error' | 'helperText' | 'id' | 'label'> {
  id?: string;
  label?: React.ReactNode;
  required?: boolean;
  error?: string;
  warning?: string;
  helpText?: string;
  showCharacterCount?: boolean;
  containerStyle?: YStackProps['style'];
  labelProps?: Omit<LabelProps, 'children' | 'htmlFor' | 'textProps'>;
  labelTextProps?: TextProps;
  messageTextProps?: TextProps;
}

export function FormField({
  id,
  label,
  required = false,
  error,
  warning,
  helpText,
  showCharacterCount = false,
  containerStyle,
  labelProps,
  labelTextProps,
  messageTextProps,
  value,
  maxLength,
  accessibilityHint,
  multiline,
  ...inputProps
}: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? `mobile-field-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const supportingMessage = error ?? warning ?? helpText;
  const supportingTone = error ? '$error' : warning ? '$warning' : '$textSecondary';
  const characterCount = typeof value === 'string' ? value.length : 0;
  const showSupportingRow = Boolean(supportingMessage || (showCharacterCount && maxLength));

  return (
    <YStack gap="$2" style={containerStyle}>
      {label ? (
        <Label htmlFor={inputId} textProps={labelTextProps} {...labelProps}>
          {label}
          {required ? ' *' : ''}
        </Label>
      ) : null}

      <Input
        {...inputProps}
        id={inputId}
        value={value}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : inputProps.textAlignVertical}
        error={error}
        accessibilityHint={error ?? warning ?? helpText ?? accessibilityHint}
      />

      {showSupportingRow ? (
        <XStack alignItems="flex-start" justifyContent="space-between" gap="$2">
          {supportingMessage ? (
            <Text
              variant="caption"
              color={supportingTone}
              flex={1}
              accessibilityLiveRegion={error ? 'polite' : 'none'}
              {...messageTextProps}>
              {supportingMessage}
            </Text>
          ) : (
            <YStack flex={1} />
          )}

          {showCharacterCount && maxLength ? (
            <Text
              variant="caption"
              color={characterCount >= maxLength ? '$warning' : '$textSecondary'}>
              {characterCount}/{maxLength}
            </Text>
          ) : null}
        </XStack>
      ) : null}
    </YStack>
  );
}

FormField.displayName = 'FormField';
