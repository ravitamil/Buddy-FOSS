import {useCallback, useState} from 'react';
import {Platform} from 'react-native';
import {router} from 'expo-router';
import * as MailComposer from 'expo-mail-composer';
import * as WebBrowser from 'expo-web-browser';

import {useAuth, useUser} from '@/context';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';

export interface HelpSupportFAQ {
  question: string;
  answer: string;
}

export interface HelpSupportScreenModel {
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  isDarkMode: boolean;
  showContactForm: boolean;
  setShowContactForm: (show: boolean) => void;
  contactEmail: string;
  setContactEmail: (email: string) => void;
  contactSubject: string;
  setContactSubject: (subject: string) => void;
  contactMessage: string;
  setContactMessage: (message: string) => void;
  expandedFAQ: number | null;
  faqData: HelpSupportFAQ[];
  handleEmailSupport: () => Promise<void>;
  handleSendEmail: () => Promise<void>;
  handleLiveChat: () => void;
  handleVideoTutorials: () => Promise<void>;
  handleUserGuide: () => Promise<void>;
  handleReportBug: () => void;
  handleFeatureRequest: () => void;
  handleCommunityForum: () => Promise<void>;
  toggleFAQ: (index: number) => void;
  navigateBack: () => void;
}

const faqData: HelpSupportFAQ[] = [
  {
    question: 'How do I add a new transaction?',
    answer:
      "Tap the '+' button on the home screen, select 'Add Transaction', choose the type (income/expense), enter the amount, select a category, and add any notes. Your transaction will be saved automatically.",
  },
  {
    question: 'How can I set up a budget?',
    answer:
      "Go to the Budgets tab, tap 'Create Budget', choose a category, set your spending limit and time period. You'll receive notifications when you're close to your limit.",
  },
  {
    question: 'How do I backup my data?',
    answer:
      "Your data is automatically synced to the cloud when you're signed in. You can also manually export your data from Settings > Privacy & Security > Export Data.",
  },
  {
    question: 'Can I use the app offline?',
    answer:
      'Yes! The app works completely offline. Your data will sync automatically when you reconnect to the internet.',
  },
  {
    question: 'How do I change my currency?',
    answer:
      'Go to Settings > Currency and select your preferred currency. All existing transactions will be displayed in the new currency format.',
  },
  {
    question: 'How do I delete a transaction?',
    answer:
      'Find the transaction in your transaction list, swipe left on it, and tap the delete button. You can also tap on the transaction to edit it and then delete from the edit screen.',
  },
  {
    question: 'How do group expenses work?',
    answer:
      'Create or join a group, add shared expenses, and the app will automatically calculate who owes what. You can settle up directly through the app.',
  },
  {
    question: 'How do I enable notifications?',
    answer:
      'Go to Settings > Notifications to customize your notification preferences. You can set reminders for bills, budget alerts, and group expense notifications.',
  },
];

export function useHelpSupportScreen(): HelpSupportScreenModel {
  const {onScroll, headerProps} = useProgressiveBlurHeader();
  const {isDarkMode} = useTamaguiTheme();
  const {user} = useAuth();
  const {profile} = useUser();
  const {showAlert} = useAlert();

  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || profile?.emailAddress || '');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const handleEmailSupport = useCallback(async () => {
    const isAvailable = await MailComposer.isAvailableAsync();

    if (isAvailable) {
      setShowContactForm(true);
      return;
    }

    showAlert({
      title: 'Email Not Available',
      message: 'Please send your questions to support@buddyapp.com',
      actions: [
        {
          text: 'Copy Email',
          onPress: () => {
            showAlert({
              title: 'Email Copied',
              message: 'support@buddyapp.com has been copied to clipboard',
              actions: [{text: 'OK'}],
            });
          },
        },
        {text: 'OK'},
      ],
    });
  }, [showAlert]);

  const handleSendEmail = useCallback(async () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      showAlert({
        title: 'Missing Information',
        message: 'Please fill in both subject and message.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    try {
      const result = await MailComposer.composeAsync({
        recipients: ['support@buddyapp.com'],
        subject: `Buddy App Support: ${contactSubject}`,
        body: `${contactMessage}\n\n---\nUser: ${contactEmail}\nApp Version: 1.0.0\nPlatform: ${Platform.OS}`,
      });

      if (result.status === MailComposer.MailComposerStatus.SENT) {
        showAlert({
          title: 'Email Sent',
          message: "Thank you for contacting us! We'll get back to you soon.",
          actions: [{text: 'OK'}],
        });
        setShowContactForm(false);
        setContactSubject('');
        setContactMessage('');
      }
    } catch {
      showAlert({
        title: 'Error',
        message: 'Failed to send email. Please try again.',
        actions: [{text: 'OK'}],
      });
    }
  }, [contactEmail, contactMessage, contactSubject, showAlert]);

  const handleLiveChat = useCallback(() => {
    showAlert({
      title: 'Live Chat',
      message:
        'Live chat support is coming soon! For immediate assistance, please use email support.',
      actions: [{text: 'OK'}],
    });
  }, [showAlert]);

  const openSupportUrl = useCallback(
    async (url: string, errorMessage: string) => {
      try {
        await WebBrowser.openBrowserAsync(url);
      } catch {
        showAlert({
          title: 'Error',
          message: errorMessage,
          actions: [{text: 'OK'}],
        });
      }
    },
    [showAlert],
  );

  const handleVideoTutorials = useCallback(
    () =>
      openSupportUrl(
        'https://youtube.com/@buddyapp',
        'Unable to open video tutorials. Please try again later.',
      ),
    [openSupportUrl],
  );

  const handleUserGuide = useCallback(
    () =>
      openSupportUrl(
        'https://docs.buddyapp.com/user-guide',
        'Unable to open user guide. Please try again later.',
      ),
    [openSupportUrl],
  );

  const handleReportBug = useCallback(() => {
    setContactSubject('Bug Report');
    setContactMessage(
      'Please describe the bug you encountered:\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:\n\nAdditional information:',
    );
    setShowContactForm(true);
  }, []);

  const handleFeatureRequest = useCallback(() => {
    setContactSubject('Feature Request');
    setContactMessage(
      "Please describe the feature you'd like to see:\n\nWhy would this feature be useful:\n\nHow should it work:\n\nAdditional details:",
    );
    setShowContactForm(true);
  }, []);

  const handleCommunityForum = useCallback(
    () =>
      openSupportUrl(
        'https://community.buddyapp.com',
        'Unable to open community forum. Please try again later.',
      ),
    [openSupportUrl],
  );

  const toggleFAQ = useCallback((index: number) => {
    setExpandedFAQ((current) => (current === index ? null : index));
  }, []);

  return {
    headerProps,
    onScroll,
    isDarkMode,
    showContactForm,
    setShowContactForm,
    contactEmail,
    setContactEmail,
    contactSubject,
    setContactSubject,
    contactMessage,
    setContactMessage,
    expandedFAQ,
    faqData,
    handleEmailSupport,
    handleSendEmail,
    handleLiveChat,
    handleVideoTutorials,
    handleUserGuide,
    handleReportBug,
    handleFeatureRequest,
    handleCommunityForum,
    toggleFAQ,
    navigateBack: () => router.back(),
  };
}
