import {VStack} from '@ravitamil/buddy-ui';
import {AdditionalDetailsSection} from './addEditSubscriptionSections/AdditionalDetailsSection';
import {CategoryIconSection} from './addEditSubscriptionSections/CategoryIconSection';
import {ServiceInformationSection} from './addEditSubscriptionSections/ServiceInformationSection';
import {SmartSettingsSection} from './addEditSubscriptionSections/SmartSettingsSection';
import type {AddEditSubscriptionSectionsProps} from './addEditSubscriptionSections/addEditSubscriptionSectionsTypes';

export function AddEditSubscriptionSections({
  screen,
  isDarkMode,
}: AddEditSubscriptionSectionsProps) {
  return (
    <VStack padding="$4" gap="$5">
      <ServiceInformationSection screen={screen} isDarkMode={isDarkMode} />
      <CategoryIconSection screen={screen} isDarkMode={isDarkMode} />
      <AdditionalDetailsSection screen={screen} isDarkMode={isDarkMode} />
      <SmartSettingsSection screen={screen} isDarkMode={isDarkMode} />
    </VStack>
  );
}
