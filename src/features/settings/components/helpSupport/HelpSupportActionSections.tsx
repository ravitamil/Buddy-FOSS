import {VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {YStack} from 'tamagui';
import {router} from 'expo-router';

import type {HelpSupportScreenModel} from '../../hooks/useHelpSupportScreen';
import {HelpSupportOption, HelpSupportSectionTitle} from './HelpSupportShared';

interface HelpSupportSectionProps {
  screen: HelpSupportScreenModel;
}

export function HelpSupportQuickActionsSection({screen}: HelpSupportSectionProps) {
  return (
    <VStack gap="$3" marginTop="$6">
      <HelpSupportSectionTitle>Quick Actions</HelpSupportSectionTitle>
      <GlassSurface>
        <YStack gap="$4">
          <HelpSupportOption
            icon="mail"
            title="Email Support"
            description="Get personalized help from our support team"
            onPress={() => void screen.handleEmailSupport()}
            iconColor="#3B82F6"
          />
          <HelpSupportOption
            icon="chatbubbles"
            title="Live Chat"
            description="Chat with our support team in real-time"
            onPress={screen.handleLiveChat}
            iconColor="#10B981"
            badge="Soon"
          />
          <HelpSupportOption
            icon="bug"
            title="Report a Bug"
            description="Let us know about any issues you've encountered"
            onPress={screen.handleReportBug}
            iconColor="#EF4444"
          />
          <HelpSupportOption
            icon="bulb"
            title="Feature Request"
            description="Suggest new features or improvements"
            onPress={screen.handleFeatureRequest}
            iconColor="#F59E0B"
          />
          <HelpSupportOption
            icon="construct"
            title="System & Error Screens"
            description="Preview maintenance, upgrade, offline & crash screens"
            onPress={() => router.push('/system-screens-gallery')}
            iconColor="#6366F1"
            badge="Preview"
          />
        </YStack>
      </GlassSurface>
    </VStack>
  );
}

export function HelpSupportLearningResourcesSection({screen}: HelpSupportSectionProps) {
  return (
    <VStack gap="$3">
      <HelpSupportSectionTitle>Learning Resources</HelpSupportSectionTitle>
      <GlassSurface>
        <YStack gap="$4">
          <HelpSupportOption
            icon="play-circle"
            title="Video Tutorials"
            description="Watch step-by-step guides on YouTube"
            onPress={() => void screen.handleVideoTutorials()}
            iconColor="#EF4444"
          />
          <HelpSupportOption
            icon="book"
            title="User Guide"
            description="Complete documentation and how-to guides"
            onPress={() => void screen.handleUserGuide()}
            iconColor="#8B5CF6"
          />
          <HelpSupportOption
            icon="people"
            title="Community Forum"
            description="Connect with other users and share tips"
            onPress={() => void screen.handleCommunityForum()}
            iconColor="#06B6D4"
          />
        </YStack>
      </GlassSurface>
    </VStack>
  );
}
