import {BottomSheet} from '@ravitamil/buddy-ui/overlays';
import {Button, HStack, Input, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {TextArea} from 'tamagui';

import type {HelpSupportScreenModel} from '../hooks/useHelpSupportScreen';

interface HelpSupportContactSheetProps {
  screen: HelpSupportScreenModel;
}

export function HelpSupportContactSheet({screen}: HelpSupportContactSheetProps) {
  return (
    <BottomSheet
      open={screen.showContactForm}
      onOpenChange={screen.setShowContactForm}
      snapPoints={[85]}
      scrollable
      moveOnKeyboardChange
      title="Contact Support"
      description="We'll get back to you as soon as possible"
      footer={<ContactSheetActions screen={screen} />}>
      <ContactFormFields screen={screen} />
    </BottomSheet>
  );
}

function ContactFormFields({screen}: HelpSupportContactSheetProps) {
  return (
    <VStack gap="$3">
      <ContactInput
        label="Email"
        value={screen.contactEmail}
        onChangeText={screen.setContactEmail}
        placeholder="your.email@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <ContactInput
        label="Subject"
        value={screen.contactSubject}
        onChangeText={screen.setContactSubject}
        placeholder="Brief description of your issue"
      />
      <MessageInput screen={screen} />
    </VStack>
  );
}

function ContactInput({
  label,
  ...inputProps
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none';
}) {
  return (
    <VStack gap="$2">
      <FieldLabel label={label} />
      <Input {...inputProps} />
    </VStack>
  );
}

function MessageInput({screen}: HelpSupportContactSheetProps) {
  return (
    <VStack gap="$2">
      <FieldLabel label="Message" />
      <TextArea
        value={screen.contactMessage}
        onChangeText={screen.setContactMessage}
        placeholder="Please provide as much detail as possible..."
        numberOfLines={6}
        backgroundColor="$surface"
        borderColor="$borderColor"
        color="$text"
        placeholderTextColor="$placeholderColor"
      />
    </VStack>
  );
}

function FieldLabel({label}: {label: string}) {
  return (
    <Text variant="body2" color="$textSecondary" weight="semibold">
      {label}
    </Text>
  );
}

function ContactSheetActions({screen}: HelpSupportContactSheetProps) {
  return (
    <HStack gap="$3" marginTop="$4">
      <Button flex={1} variant="outline" onPress={() => screen.setShowContactForm(false)}>
        Cancel
      </Button>

      <Button flex={1} onPress={() => void screen.handleSendEmail()}>
        Send Email
      </Button>
    </HStack>
  );
}
