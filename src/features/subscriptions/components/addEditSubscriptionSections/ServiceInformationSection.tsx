import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {LinearGradient} from 'expo-linear-gradient';

import {FormField} from '@ravitamil/buddy-ui/FormField';

import {BILLING_CYCLES} from '../../types';
import {AddEditSubscriptionCard} from '../AddEditSubscriptionCard';
import {SelectField} from './AddEditSubscriptionControls';
import type {
  AddEditSubscriptionSectionsProps,
  IoniconName,
} from './addEditSubscriptionSectionsTypes';

export function ServiceInformationSection({screen, isDarkMode}: AddEditSubscriptionSectionsProps) {
  const selectedBillingCycle =
    BILLING_CYCLES.find((cycle) => cycle.value === screen.formData.billingCycle)?.label ||
    'Monthly';

  return (
    <AddEditSubscriptionCard
      title="Service Information"
      subtitle="Choose your subscription service"
      isDarkMode={isDarkMode}
      accentColor={screen.formData.color}
      icon="information-circle">
      <VStack gap="$4">
        <HStack gap="$4" alignItems="center">
          <LinearGradient
            colors={[screen.formData.color, `${screen.formData.color}CC`]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={{
              width: 76,
              height: 76,
              borderRadius: 22,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: screen.formData.color,
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 10,
            }}>
            <Ionicons name={screen.formData.icon as IoniconName} size={40} color="#FFFFFF" />
          </LinearGradient>

          <VStack flex={1} gap="$2">
            <FormField
              label="Service Name *"
              placeholder="e.g., Netflix Premium"
              value={screen.formData.name}
              onChangeText={(name) => screen.updateForm({name})}
              testID="subscription-name"
            />
          </VStack>
        </HStack>

        <FormField
          label="Amount *"
          placeholder="0.00"
          value={screen.formData.amount}
          onChangeText={(amount) => screen.updateForm({amount})}
          keyboardType="numeric"
          testID="subscription-amount"
          leftIcon={
            <Text
              color={screen.formData.amount ? screen.formData.color : '$textSecondary'}
              weight="bold"
              fontSize="$5"
              paddingRight="$2">
              {screen.currency}
            </Text>
          }
        />

        <HStack gap="$3">
          <VStack flex={1} gap="$2">
            <Text variant="caption" color="$textSecondary" weight="medium">
              Billing Cycle
            </Text>
            <SelectField
              isDarkMode={isDarkMode}
              onPress={() => screen.setShowBillingCycleDropdown(true)}
              label={selectedBillingCycle}
            />
          </VStack>

          <VStack flex={1} gap="$2">
            <Text variant="caption" color="$textSecondary" weight="medium">
              Next Billing
            </Text>
            <SelectField
              isDarkMode={isDarkMode}
              onPress={() => screen.setShowDatePicker(true)}
              label={screen.formData.nextBilling.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
              leadingIcon="calendar"
            />
          </VStack>
        </HStack>

        {screen.showDatePicker && (
          <DateTimePicker
            value={screen.formData.nextBilling}
            mode="date"
            display="default"
            onChange={screen.handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </VStack>
    </AddEditSubscriptionCard>
  );
}
