import React, {forwardRef, useCallback, useMemo, useRef, type ComponentProps} from 'react';
import {Input as TamaguiInput, XStack, styled, useTheme} from 'tamagui';
import {Ionicons} from './icons/AppIcon';
import {mobileControlSizes} from './theme/foundations';
import {resolveThemeColor} from './utils/themeColor';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type InputVariant = 'default' | 'filled' | 'outline';
type InputSize = 'small' | 'medium' | 'large';
type InputElement = React.ElementRef<typeof TamaguiInput>;

const InputFrame = styled(TamaguiInput, {
  name: 'BuddyInput',
  borderWidth: 1,
  borderRadius: '$3',
  color: '$color',
  fontFamily: '$body',
  fontWeight: '400',
  placeholderTextColor: '$inputPlaceholder',
  focusStyle: {
    borderColor: '$inputFocusBorder',
    shadowColor: '$inputFocusShadow',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },

  variants: {
    inputVariant: {
      default: {
        backgroundColor: '$inputBackground',
        borderColor: '$inputBorder',
        shadowColor: '$shadowColor',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      },
      filled: {
        backgroundColor: '$surface',
        borderColor: 'transparent',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '$inputBorder',
        borderWidth: 1.5,
      },
    },
    inputSize: {
      small: {
        minHeight: mobileControlSizes.regular,
        paddingHorizontal: '$2',
        paddingVertical: '$2',
        fontSize: '$4',
      },
      medium: {
        minHeight: mobileControlSizes.regular,
        paddingHorizontal: '$3',
        paddingVertical: '$3',
        fontSize: '$5',
      },
      large: {
        minHeight: mobileControlSizes.large,
        paddingHorizontal: '$4',
        paddingVertical: '$4',
        fontSize: '$6',
      },
    },
    invalid: {
      true: {
        borderColor: '$error',
        backgroundColor: '$background',
      },
      false: {},
    },
    chrome: {
      true: {},
      false: {
        borderWidth: 0,
        borderRadius: '$0',
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
        paddingHorizontal: '$0',
        paddingVertical: '$0',
        minHeight: 'auto',
        focusStyle: {
          borderColor: 'transparent',
          shadowOpacity: 0,
          elevation: 0,
        },
      },
    },
  } as const,

  defaultVariants: {
    inputVariant: 'default',
    inputSize: 'medium',
    invalid: false,
    chrome: true,
  },
});

export interface InputProps extends Omit<
  React.ComponentProps<typeof InputFrame>,
  'inputVariant' | 'inputSize' | 'invalid' | 'size'
> {
  /** Removes Input-owned borders and focus shadows when its parent owns the visual container. */
  chrome?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: InputVariant;
  size?: InputSize;
  /** React Native-compatible editing control retained by Buddy UI. */
  editable?: boolean;
}

const InputShell = styled(XStack, {
  name: 'BuddyInputShell',
  alignItems: 'center',
  borderWidth: 1,
  borderRadius: '$3',
  gap: '$2',
  focusWithinStyle: {
    borderColor: '$inputFocusBorder',
    shadowColor: '$inputFocusShadow',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },

  variants: {
    inputVariant: {
      default: {
        backgroundColor: '$inputBackground',
        borderColor: '$inputBorder',
        shadowColor: '$shadowColor',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      },
      filled: {
        backgroundColor: '$surface',
        borderColor: 'transparent',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '$inputBorder',
        borderWidth: 1.5,
      },
    },
    inputSize: {
      small: {
        minHeight: mobileControlSizes.regular,
        paddingHorizontal: '$2',
      },
      medium: {
        minHeight: mobileControlSizes.regular,
        paddingHorizontal: '$3',
      },
      large: {
        minHeight: mobileControlSizes.large,
        paddingHorizontal: '$4',
      },
    },
    invalid: {
      true: {
        borderColor: '$error',
        backgroundColor: '$background',
      },
      false: {},
    },
  } as const,

  defaultVariants: {
    inputVariant: 'default',
    inputSize: 'medium',
    invalid: false,
  },
});

const isIoniconName = (value: string): value is IoniconName =>
  Object.prototype.hasOwnProperty.call(Ionicons.glyphMap, value);

export const Input = forwardRef<InputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      size = 'medium',
      chrome = true,
      editable = true,
      onPress,
      ...props
    },
    ref,
  ) => {
    // Retained for source compatibility; FormField owns rendered label/help copy.
    void label;
    void helperText;

    const theme = useTheme();
    const internalRef = useRef<InputElement | null>(null);
    const iconColor = useMemo(() => resolveThemeColor(theme, 'colorSecondary', '#6b7280'), [theme]);

    const setInputRef = useCallback(
      (node: InputElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
          return;
        }
        if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const renderIcon = (icon: React.ReactNode) => {
      if (!icon) return null;
      if (typeof icon === 'string') {
        if (!isIoniconName(icon)) return null;
        return <Ionicons name={icon} size={20} color={iconColor} />;
      }
      return <>{icon}</>;
    };

    const hasIcons = Boolean(leftIcon || rightIcon);
    const invalid = Boolean(error);

    if (hasIcons) {
      return (
        <InputShell
          inputVariant={variant}
          inputSize={size}
          invalid={invalid}
          opacity={props.opacity !== undefined ? props.opacity : editable ? 1 : 0.6}
          onPress={(event) => {
            internalRef.current?.focus();
            onPress?.(event);
          }}>
          {renderIcon(leftIcon)}
          <InputFrame
            ref={setInputRef}
            chrome={false}
            inputVariant={variant}
            inputSize={size}
            invalid={invalid}
            flex={1}
            disabled={!editable}
            {...props}
          />
          {renderIcon(rightIcon)}
        </InputShell>
      );
    }

    return (
      <InputFrame
        ref={setInputRef}
        chrome={chrome}
        inputVariant={variant}
        inputSize={size}
        invalid={invalid}
        disabled={!editable}
        opacity={props.opacity !== undefined ? props.opacity : editable ? 1 : 0.6}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
