import React from 'react';
import {
  Button as TamaguiButton,
  type ButtonProps as TamaguiButtonProps,
  Spinner,
  XStack,
  styled,
} from 'tamagui';
import {Text} from './Text';
import {mobileControlSizes, mobileMotion} from './theme/foundations';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<TamaguiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const ButtonFrame = styled(TamaguiButton, {
  name: 'BuddyButton',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 0,
  borderRadius: '$4',
  transition: 'quick',
  animateOnly: ['transform', 'opacity'],
  pressStyle: {
    scale: mobileMotion.pressScale,
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        color: '$buttonPrimaryText',
        hoverStyle: {backgroundColor: '$primaryHover'},
        pressStyle: {backgroundColor: '$primaryPress', scale: 0.98},
      },
      secondary: {
        backgroundColor: '$secondary',
        color: '$buttonSecondaryText',
        hoverStyle: {backgroundColor: '$secondaryHover'},
        pressStyle: {backgroundColor: '$secondaryPress', scale: 0.98},
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$borderColor',
        color: '$color',
        hoverStyle: {backgroundColor: '$backgroundHover'},
        pressStyle: {backgroundColor: '$backgroundPress', scale: 0.98},
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$color',
        hoverStyle: {backgroundColor: '$backgroundHover'},
        pressStyle: {backgroundColor: '$backgroundPress', scale: 0.98},
      },
      success: {
        backgroundColor: '$success',
        color: '$semanticOnColor',
        pressStyle: {scale: 0.98, opacity: 0.84},
      },
      warning: {
        backgroundColor: '$warning',
        color: '$semanticOnColor',
        pressStyle: {scale: 0.98, opacity: 0.84},
      },
      danger: {
        backgroundColor: '$error',
        color: '$semanticOnColor',
        pressStyle: {scale: 0.98, opacity: 0.84},
      },
      info: {
        backgroundColor: '$info',
        color: '$semanticOnColor',
        pressStyle: {scale: 0.98, opacity: 0.84},
      },
    },
    buttonSize: {
      small: {
        minHeight: mobileControlSizes.regular,
        paddingHorizontal: '$3',
        paddingVertical: '$1.5',
      },
      medium: {
        minHeight: mobileControlSizes.regular,
        paddingHorizontal: '$4',
        paddingVertical: '$2',
      },
      large: {
        minHeight: mobileControlSizes.large,
        paddingHorizontal: '$5',
        paddingVertical: '$2.5',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    buttonSize: 'medium',
  },
});

const ButtonContent = styled(XStack, {
  name: 'BuddyButtonContent',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
});

const textVariantByButtonSize: Record<ButtonSize, React.ComponentProps<typeof Text>['variant']> = {
  small: 'body2',
  medium: 'body1',
  large: 'body1',
};

const textColorByButtonVariant: Record<ButtonVariant, string> = {
  primary: '$buttonPrimaryText',
  secondary: '$buttonSecondaryText',
  outline: '$color',
  ghost: '$color',
  success: '$semanticOnColor',
  warning: '$semanticOnColor',
  danger: '$semanticOnColor',
  info: '$semanticOnColor',
};

const normalizeChildren = (
  node: React.ReactNode,
  textVariant: React.ComponentProps<typeof Text>['variant'],
  textColor: string,
): React.ReactNode => {
  if (node === null || node === undefined || typeof node === 'boolean') return null;
  if (typeof node === 'string' || typeof node === 'number') {
    return (
      <Text variant={textVariant} weight="semibold" color={textColor}>
        {node}
      </Text>
    );
  }
  if (Array.isArray(node)) {
    return React.Children.toArray(node).map((child, index) => (
      <React.Fragment key={index}>
        {normalizeChildren(child, textVariant, textColor)}
      </React.Fragment>
    ));
  }
  if (React.isValidElement<{children?: React.ReactNode}>(node) && node.type === React.Fragment) {
    return <>{normalizeChildren(node.props.children, textVariant, textColor)}</>;
  }
  return node;
};

export const Button = ButtonFrame.styleable<ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      loading = false,
      loadingLabel = 'Loading...',
      leftIcon,
      rightIcon,
      children,
      disabled,
      accessibilityLabel,
      ...props
    },
    ref,
  ) => {
    const textVariant = textVariantByButtonSize[size];
    const textColor = textColorByButtonVariant[variant];

    return (
      <ButtonFrame
        ref={ref}
        variant={variant}
        buttonSize={size}
        disabled={disabled || loading}
        accessible
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel ??
          (loading
            ? loadingLabel
            : typeof children === 'string' || typeof children === 'number'
              ? String(children)
              : undefined)
        }
        {...props}>
        <ButtonContent>
          {loading ? <Spinner size="small" color={textColor} /> : leftIcon}
          {loading ? (
            <Text variant={textVariant} weight="semibold" color={textColor}>
              {loadingLabel}
            </Text>
          ) : (
            normalizeChildren(children, textVariant, textColor)
          )}
          {!loading && rightIcon}
        </ButtonContent>
      </ButtonFrame>
    );
  },
);

Button.displayName = 'Button';
