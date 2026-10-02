import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {FormField} from '@ravitamil/buddy-ui/FormField';

import {AddEditSubscriptionCard} from '../AddEditSubscriptionCard';
import type {AddEditSubscriptionSectionsProps} from './addEditSubscriptionSectionsTypes';

export function AdditionalDetailsSection({screen, isDarkMode}: AddEditSubscriptionSectionsProps) {
  return (
    <AddEditSubscriptionCard
      title="Additional Details"
      subtitle="Optional subscription information"
      isDarkMode={isDarkMode}
      accentColor="#22c55e"
      icon="document-text">
      <VStack gap="$4">
        <FormField
          label="Description"
          placeholder="Brief description of this subscription..."
          value={screen.formData.description}
          onChangeText={(description) => screen.updateForm({description})}
          multiline
          numberOfLines={3}
          testID="subscription-description"
        />

        <FormField
          label="Website"
          placeholder="https://..."
          value={screen.formData.website}
          onChangeText={(website) => screen.updateForm({website: website.replace(/\s/g, '')})}
          onBlur={screen.normalizeWebsite}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          testID="subscription-website"
          leftIcon="link"
        />
      </VStack>
    </AddEditSubscriptionCard>
  );
}
