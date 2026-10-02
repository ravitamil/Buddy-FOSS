/**
 * StandardKeyboardAvoidingView Storybook Stories
 * Internal adapter documentation for ScreenWrapper's keyboard avoiding path
 */

import type {Meta, StoryObj} from '@storybook/react';
import {StandardKeyboardAvoidingView} from './StandardKeyboardAvoidingView';
import {YStack, Text, Button} from 'tamagui';
import {FormField} from '@ravitamil/buddy-ui/FormField';
import {useState} from 'react';
import {currentPlatform, isIos} from '@tamagui/constants';

const meta: Meta<typeof StandardKeyboardAvoidingView> = {
  title: 'UI/Internal/StandardKeyboardAvoidingView',
  component: StandardKeyboardAvoidingView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
StandardKeyboardAvoidingView is the low-level keyboard avoiding adapter used by ScreenWrapper.
Application screens should use ScreenWrapper keyboardMode instead of importing this component.

## Features
- Platform-specific keyboard behavior (iOS: padding, Android: translate-with-padding)
- Consistent keyboard offset handling
- Automatic keyboard detection and adjustment

## Usage
Use ScreenWrapper keyboardMode="avoid" for fixed layouts, or keyboardMode="aware-scroll" for forms.
        `,
      },
    },
  },
  argTypes: {
    behavior: {
      description: 'Keyboard avoiding behavior',
      control: 'select',
      options: ['height', 'position', 'padding', 'translate-with-padding'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Simple form component
const SimpleForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <YStack gap="$4" padding="$4" justifyContent="flex-end" flex={1}>
      <YStack gap="$2">
        <Text fontSize="$6" fontWeight="bold">
          Sign In
        </Text>
        <Text fontSize="$4" color="$gray11">
          Enter your credentials to continue
        </Text>
      </YStack>

      <YStack gap="$4">
        <FormField
          label="Email"
          placeholder="user@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <FormField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </YStack>

      <Button>Sign In</Button>
    </YStack>
  );
};

// Long form component
const LongForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <YStack gap="$4" padding="$4" flex={1}>
      <YStack gap="$2">
        <Text fontSize="$6" fontWeight="bold">
          Registration Form
        </Text>
        <Text fontSize="$4" color="$gray11">
          Fill out all fields to create your account
        </Text>
      </YStack>

      <YStack gap="$4" flex={1}>
        <FormField
          label="First Name"
          placeholder="Enter first name"
          value={firstName}
          onChangeText={setFirstName}
          required
        />
        <FormField
          label="Last Name"
          placeholder="Enter last name"
          value={lastName}
          onChangeText={setLastName}
          required
        />
        <FormField
          label="Email"
          placeholder="user@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          required
        />
        <FormField
          label="Phone"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <FormField
          label="Address"
          placeholder="Enter your address"
          value={address}
          onChangeText={setAddress}
        />
        <FormField label="City" placeholder="Enter your city" value={city} onChangeText={setCity} />
        <FormField
          label="Notes"
          placeholder="Additional notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </YStack>

      <Button>Create Account</Button>
    </YStack>
  );
};

// Bottom form component
const BottomForm = () => {
  const [message, setMessage] = useState('');

  return (
    <YStack flex={1} justifyContent="space-between" padding="$4">
      <YStack gap="$4">
        <Text fontSize="$6" fontWeight="bold">
          Chat Interface
        </Text>
        <Text fontSize="$4" color="$gray11">
          This simulates a chat interface where the input should stay above the keyboard.
        </Text>

        {/* Spacer content */}
        <YStack gap="$2">
          {Array.from({length: 10}, (_, i) => (
            <Text key={i} fontSize="$3" color="$gray10">
              Message {i + 1}: This is a sample message in the chat.
            </Text>
          ))}
        </YStack>
      </YStack>

      <YStack gap="$2">
        <FormField
          label="Message"
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <Button>Send</Button>
      </YStack>
    </YStack>
  );
};

// Default story
export const Default: Story = {
  args: {
    children: <SimpleForm />,
  },
  parameters: {
    docs: {
      description: {
        story: `Default keyboard avoiding behavior. Uses platform-specific behavior: 
        - iOS: padding
        - Android: height`,
      },
    },
  },
};

// Explicit padding behavior
export const PaddingBehavior: Story = {
  args: {
    behavior: 'padding',
    children: <SimpleForm />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Explicit padding behavior for keyboard avoidance.',
      },
    },
  },
};

// Explicit height behavior
export const HeightBehavior: Story = {
  args: {
    behavior: 'height',
    children: <SimpleForm />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Explicit height behavior for keyboard avoidance.',
      },
    },
  },
};

// Position behavior
export const PositionBehavior: Story = {
  args: {
    behavior: 'position',
    children: <SimpleForm />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Position behavior for keyboard avoidance.',
      },
    },
  },
};

// Long form
export const LongFormDemo: Story = {
  args: {
    children: <LongForm />,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Long form with multiple fields demonstrating keyboard behavior with scrollable content.',
      },
    },
  },
};

// Bottom input
export const BottomInputDemo: Story = {
  args: {
    children: <BottomForm />,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Input positioned at bottom of screen (like chat interface) demonstrating keyboard avoidance.',
      },
    },
  },
};

// Platform comparison
export const PlatformComparison: Story = {
  render: () => (
    <YStack gap="$4" padding="$4" flex={1}>
      <YStack gap="$2">
        <Text fontSize="$6" fontWeight="bold">
          Platform Information
        </Text>
        <Text fontSize="$4" color="$gray11">
          Current platform: {currentPlatform}
        </Text>
        <Text fontSize="$4" color="$gray11">
          Default behavior: {isIos ? 'padding' : 'height'}
        </Text>
      </YStack>

      <SimpleForm />
    </YStack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows current platform and default keyboard behavior.',
      },
    },
  },
};

// Keyboard behavior comparison
export const BehaviorComparison: Story = {
  render: () => {
    const [selectedBehavior, setSelectedBehavior] = useState<'height' | 'position' | 'padding'>(
      'padding',
    );
    const [testInput, setTestInput] = useState('');

    return (
      <StandardKeyboardAvoidingView behavior={selectedBehavior}>
        <YStack gap="$4" padding="$4" flex={1}>
          <YStack gap="$2">
            <Text fontSize="$6" fontWeight="bold">
              Behavior Comparison
            </Text>
            <Text fontSize="$4" color="$gray11">
              Current behavior: {selectedBehavior}
            </Text>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$5" fontWeight="600">
              Select Behavior:
            </Text>
            <YStack gap="$2">
              <Button variant="outlined" onPress={() => setSelectedBehavior('padding')}>
                Padding
              </Button>
              <Button variant="outlined" onPress={() => setSelectedBehavior('height')}>
                Height
              </Button>
              <Button variant="outlined" onPress={() => setSelectedBehavior('position')}>
                Position
              </Button>
            </YStack>
          </YStack>

          <YStack gap="$4" flex={1} justifyContent="flex-end">
            <FormField
              label="Test Input"
              placeholder="Focus here to test keyboard behavior"
              value={testInput}
              onChangeText={setTestInput}
            />
          </YStack>
        </YStack>
      </StandardKeyboardAvoidingView>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive comparison of different keyboard avoiding behaviors.',
      },
    },
  },
};
