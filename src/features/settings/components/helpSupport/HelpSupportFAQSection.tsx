import {Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

import type {HelpSupportScreenModel} from '../../hooks/useHelpSupportScreen';
import {HelpSupportSectionTitle} from './HelpSupportShared';

interface HelpSupportFAQSectionProps {
  screen: HelpSupportScreenModel;
}

interface FAQItemProps {
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function FAQItem({question, answer, isExpanded, onToggle}: FAQItemProps) {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <VStack
      onPress={onToggle}
      pressStyle={{opacity: 0.7}}
      accessibilityRole="button"
      accessibilityLabel={question}
      accessibilityState={{expanded: isExpanded}}>
      <GlassSurface padding="$4" style={{marginBottom: 8}}>
        <XStack
          alignItems="center"
          justifyContent="space-between"
          minHeight={24}
          marginBottom={isExpanded ? '$3' : 0}>
          <Text
            variant="body1"
            color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
            weight="semibold"
            flex={1}
            marginRight="$2">
            {question}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}
          />
        </XStack>

        {isExpanded ? (
          <Text
            variant="body2"
            color={isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}
            lineHeight={20}>
            {answer}
          </Text>
        ) : null}
      </GlassSurface>
    </VStack>
  );
}

export function HelpSupportFAQSection({screen}: HelpSupportFAQSectionProps) {
  return (
    <VStack gap="$3">
      <HelpSupportSectionTitle>Frequently Asked Questions</HelpSupportSectionTitle>
      <VStack gap="$2">
        {screen.faqData.map((faq, index) => (
          <FAQItem
            key={faq.question}
            question={faq.question}
            answer={faq.answer}
            isExpanded={screen.expandedFAQ === index}
            onToggle={() => screen.toggleFAQ(index)}
          />
        ))}
      </VStack>
    </VStack>
  );
}
