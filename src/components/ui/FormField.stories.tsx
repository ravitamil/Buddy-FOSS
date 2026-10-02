/**
 * FormField Storybook Stories
 * Interactive documentation for standardized form field component
 */

import type {Meta, StoryObj} from '@storybook/react';
import {FormField} from '@ravitamil/buddy-ui/FormField';
import {YStack} from 'tamagui';
import {useState} from 'react';

const meta: Meta<typeof FormField> = {
  title: 'UI/Forms/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
FormField provides a consistent form input component with proper keyboard handling and validation.

## Features
- Prevents keyboard dismissal issues
- Consistent styling with Tamagui design tokens
- Built-in validation and error display
- Proper controlled component patterns
- Accessibility support

## Usage
Use this component instead of TextInput for all form inputs to ensure consistency and proper behavior.
        `,
      },
    },
  },
  argTypes: {
    label: {
      description: 'Field label text',
      control: 'text',
    },
    placeholder: {
      description: 'Placeholder text',
      control: 'text',
    },
    error: {
      description: 'Error message to display',
      control: 'text',
    },
    required: {
      description: 'Whether the field is required',
      control: 'boolean',
    },
    secureTextEntry: {
      description: 'Whether to hide text (for passwords)',
      control: 'boolean',
    },
    keyboardType: {
      description: 'Keyboard type',
      control: 'select',
      options: ['default', 'email-address', 'numeric', 'phone-pad'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper component for stories
const InteractiveFormField = (args: any) => {
  const [value, setValue] = useState('');

  return (
    <YStack gap="$4" width={300}>
      <FormField {...args} value={value} onChangeText={setValue} />
    </YStack>
  );
};

// Default story
export const Default: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
  },
};

// With error state
export const WithError: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    error: 'Please enter a valid email address',
  },
  parameters: {
    docs: {
      description: {
        story: 'Form field displaying an error message.',
      },
    },
  },
};

// Required field
export const Required: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Required field with asterisk indicator.',
      },
    },
  },
};

// Password field
export const Password: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    secureTextEntry: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Secure text entry field for passwords.',
      },
    },
  },
};

// Email field
export const Email: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Email Address',
    placeholder: 'user@example.com',
    keyboardType: 'email-address',
  },
  parameters: {
    docs: {
      description: {
        story: 'Email input with appropriate keyboard type.',
      },
    },
  },
};

// Phone number field
export const PhoneNumber: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    keyboardType: 'phone-pad',
  },
  parameters: {
    docs: {
      description: {
        story: 'Phone number input with numeric keyboard.',
      },
    },
  },
};

// Numeric field
export const Numeric: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Amount',
    placeholder: '0.00',
    keyboardType: 'numeric',
  },
  parameters: {
    docs: {
      description: {
        story: 'Numeric input field for amounts or numbers.',
      },
    },
  },
};

// Multiple fields form
export const MultipleFields: Story = {
  render: () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    return (
      <YStack gap="$4" width={300}>
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
          error={email && !email.includes('@') ? 'Invalid email format' : undefined}
        />
        <FormField
          label="Phone"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </YStack>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple form fields demonstrating consistent behavior and keyboard handling.',
      },
    },
  },
};

// Keyboard behavior demo
export const KeyboardBehaviorDemo: Story = {
  render: () => {
    const [field1, setField1] = useState('');
    const [field2, setField2] = useState('');
    const [field3, setField3] = useState('');

    return (
      <YStack gap="$4" width={300}>
        <FormField
          label="Field 1"
          placeholder="Type here and move to next field"
          value={field1}
          onChangeText={setField1}
        />
        <FormField
          label="Field 2"
          placeholder="Keyboard should not dismiss"
          value={field2}
          onChangeText={setField2}
        />
        <FormField
          label="Field 3"
          placeholder="Consistent behavior across fields"
          value={field3}
          onChangeText={setField3}
        />
      </YStack>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates proper keyboard behavior:
- Keyboard stays visible when moving between fields
- No keyboard dismissal on text changes
- Consistent focus management
        `,
      },
    },
  },
};
