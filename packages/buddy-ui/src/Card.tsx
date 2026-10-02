import type React from 'react';
import {
  Card as TamaguiCard,
  type CardProps as TamaguiCardProps,
  XStack,
  YStack,
  styled,
} from 'tamagui';
import {Text} from './Text';

export type CardTone = 'default' | 'surface' | 'transparent';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';
export type CardElevation = 0 | 1 | 2 | 3;

export interface CardProps extends Omit<TamaguiCardProps, 'elevation'> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  tone?: CardTone;
  padding?: TamaguiCardProps['padding'];
  paddingSize?: CardPadding;
  elevation?: CardElevation;
}

const CardFrame = styled(TamaguiCard, {
  name: 'BuddyCard',
  borderWidth: 1,
  borderRadius: '$4',
  overflow: 'hidden',

  variants: {
    tone: {
      default: {
        backgroundColor: '$background',
        borderColor: '$borderColor',
      },
      surface: {
        backgroundColor: '$surface',
        borderColor: '$borderColor',
      },
      transparent: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    },
    paddingSize: {
      none: {padding: '$0'},
      small: {padding: '$3'},
      medium: {padding: '$4'},
      large: {padding: '$5'},
    },
    elevationLevel: {
      0: {
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      1: {
        shadowColor: '$shadowColor',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
      },
      2: {
        shadowColor: '$shadowColor',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
      },
      3: {
        shadowColor: '$shadowColor',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 6,
      },
    },
  } as const,

  defaultVariants: {
    tone: 'default',
    paddingSize: 'medium',
    elevationLevel: 1,
  },
});

const CardHeader = styled(TamaguiCard.Header, {
  name: 'BuddyCardHeader',
  borderColor: '$borderColor',
  variants: {
    separated: {
      true: {
        borderBottomWidth: 1,
        paddingBottom: '$3',
      },
      false: {
        borderBottomWidth: 0,
        paddingBottom: '$0',
      },
    },
  } as const,
  defaultVariants: {
    separated: false,
  },
});

const CardBody = styled(YStack, {
  name: 'BuddyCardBody',
  variants: {
    offset: {
      true: {paddingTop: '$3'},
      false: {paddingTop: '$0'},
    },
  } as const,
  defaultVariants: {
    offset: false,
  },
});

const CardFooter = styled(TamaguiCard.Footer, {
  name: 'BuddyCardFooter',
  borderColor: '$borderColor',
  borderTopWidth: 1,
  paddingTop: '$3',
});

export const Card = CardFrame.styleable<CardProps>(
  (
    {
      title,
      subtitle,
      action,
      header,
      footer,
      children,
      tone = 'default',
      paddingSize = 'medium',
      elevation = 1,
      padding,
      ...props
    },
    ref,
  ) => {
    const hasHeader = Boolean(title || subtitle || action || header);
    const resolvedPaddingSize = padding === undefined ? paddingSize : undefined;

    return (
      <CardFrame
        ref={ref}
        tone={tone}
        paddingSize={resolvedPaddingSize}
        elevationLevel={elevation}
        padding={padding}
        {...props}>
        {hasHeader && (
          <CardHeader separated={Boolean(children)}>
            {header || (
              <XStack justifyContent="space-between" alignItems="center" gap="$3">
                <YStack flex={1}>
                  {title && (
                    <Text variant="h4" color="$color" weight="semibold">
                      {title}
                    </Text>
                  )}
                  {subtitle && (
                    <Text variant="body1" color="$textSecondary" marginTop="$1">
                      {subtitle}
                    </Text>
                  )}
                </YStack>
                {action}
              </XStack>
            )}
          </CardHeader>
        )}

        {children && <CardBody offset={hasHeader}>{children}</CardBody>}

        {footer && <CardFooter>{footer}</CardFooter>}
      </CardFrame>
    );
  },
);

Card.displayName = 'Card';
