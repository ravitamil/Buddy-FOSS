import fs from 'node:fs';
import path from 'node:path';

const readProjectFile = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

const listFiles = (relativeDirectory: string): string[] => {
  const directory = path.join(process.cwd(), relativeDirectory);
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    return entry.isDirectory() ? listFiles(relativePath) : [relativePath];
  });
};

describe('BuddyIO Fluid Surface design system', () => {
  it('documents the canonical visual language and ownership rules', () => {
    const designSystem = readProjectFile('docs/fluid-surface-design-system.md');

    expect(designSystem).toContain('semi-translucent Fluid Surface');
    expect(designSystem).toContain('GlassSurface');
    expect(designSystem).toContain('ScreenContainer');
    expect(designSystem).toContain('Do not recreate');
    expect(designSystem).toContain('Adopted card direction');
    expect(designSystem).toContain('Colour wash is opt-in');
    expect(designSystem).toContain('Gradual migration policy');
    expect(designSystem).toContain('Package migration and Android compile proof complete');
  });

  it('keeps blur, tint, edge, and depth in the canonical surface', () => {
    const glassSurfaceSurface = readProjectFile('packages/buddy-ui/src/GlassSurface.tsx');

    expect(glassSurfaceSurface).toContain("import {GlassBackdrop} from './mobile/GlassBackdrop';");
    expect(glassSurfaceSurface).toContain("import {LinearGradient} from 'expo-linear-gradient';");
    expect(glassSurfaceSurface).toMatch(
      /resolveThemeColor\(\s*theme,\s*['"]glassSurfaceBorder['"]/,
    );
    expect(glassSurfaceSurface).toContain('washColor');
    expect(glassSurfaceSurface).toContain('blurReductionFactor={2}');
    expect(glassSurfaceSurface).toContain('intensity={dark ? 24 : 32}');
    expect(glassSurfaceSurface).toContain(
      "blurMethod={Platform.OS === 'android' ? 'none' : undefined}",
    );
    expect(glassSurfaceSurface).toContain('style={absoluteLayerStyle}');
    expect(glassSurfaceSurface).not.toContain("from 'expo-blur'");
  });

  it('exposes only generic layout capabilities on the app surface', () => {
    const glassSurfaceSurface = readProjectFile('packages/buddy-ui/src/GlassSurface.tsx');

    expect(glassSurfaceSurface).toContain('fill?: boolean');
    expect(glassSurfaceSurface).toContain("contentStyle?: YStackProps['style'];");
    expect(glassSurfaceSurface).not.toContain('gradientColors?:');
    expect(glassSurfaceSurface).not.toContain('withShadow?:');
    expect(glassSurfaceSurface).not.toContain('tone?:');
  });

  it('uses the screen shell as the blur source for descendant fluid surfaces', () => {
    const screenContainer = readProjectFile('src/components/ui/ScreenContainer.tsx');

    expect(screenContainer).toContain('BlurTargetView');
    expect(screenContainer).toContain('BlurTargetProvider');
  });

  it('centralizes specialized overlay blur in the shared glass backdrop', () => {
    const glassBackdrop = readProjectFile('packages/buddy-ui/src/mobile/GlassBackdrop.tsx');

    expect(glassBackdrop).toContain('useBlurTarget');
    expect(glassBackdrop).toContain('dimezisBlurViewSdk31Plus');
    expect(glassBackdrop).toContain("inferIsDarkMode(theme) ? 'dark' : 'light'");
  });

  it('keeps feature and screen modules free of direct expo-blur ownership', () => {
    const featureFiles = [...listFiles('src/features'), ...listFiles('src/screens')];
    const directBlurOwners = featureFiles.filter(
      (file) => file.endsWith('.tsx') && readProjectFile(file).includes("from 'expo-blur'"),
    );

    expect(directBlurOwners).toEqual([]);
  });

  it('uses app glass for main Settings cards with a profile-only wash', () => {
    const mainSections = readProjectFile(
      'src/features/settings/components/SettingsMainSections.tsx',
    );
    const quickCard = readProjectFile('src/features/settings/components/SettingsQuickCard.tsx');
    const settingsItem = readProjectFile('src/components/ui/SettingsItem.tsx');

    expect(mainSections).toContain('GlassSurface');
    expect(quickCard).toContain('GlassSurface');
    expect(settingsItem).toContain("surface?: 'entry' | 'overview';");
    expect(settingsItem).toContain("surface === 'overview'");
    expect(mainSections).toContain('surface="overview"');
    expect(mainSections).toContain(
      'washColor={screen.isPro ? settingsAccentColors.warning : settingsAccentColors.primary}',
    );
    expect(quickCard).not.toContain('washColor=');
    expect(mainSections).toContain('showStarBadge={screen.isPro}');
    expect(mainSections).toContain("const label = isPro ? 'PRO' : isAnonymous ? 'GUEST' : 'FREE';");
    expect(mainSections).toContain('testID="settings-profile-name"');
    expect(mainSections).toContain('numberOfLines={2}');
  });

  it('removes the Home-specific target-surface API after promoting it app-wide', () => {
    const sourceFiles = listFiles('src').filter(
      (file) =>
        (file.endsWith('.ts') || file.endsWith('.tsx')) &&
        !file.endsWith('.test.ts') &&
        !file.endsWith('.test.tsx'),
    );
    const oldSurfaceConsumers = sourceFiles.filter((file) =>
      readProjectFile(file).includes('HomeOverviewGlassSurface'),
    );
    const designSystem = readProjectFile('docs/fluid-surface-design-system.md');

    expect(oldSurfaceConsumers).toEqual([]);
    expect(designSystem).toContain('GlassSurface');
    expect(designSystem).not.toContain('HomeOverviewGlassSurface');
  });

  it('retires legacy ordinary-surface implementations after their final consumer moves', () => {
    const sourceFiles = listFiles('src').filter(
      (file) =>
        (file.endsWith('.ts') || file.endsWith('.tsx')) &&
        !file.endsWith('.test.ts') &&
        !file.endsWith('.test.tsx'),
    );
    const legacySurfaceConsumers = sourceFiles.filter((file) => {
      const source = readProjectFile(file);
      return /\bAppGlassSurface\b|\bGlassmorphismContainer\b/.test(source);
    });

    expect(fs.existsSync(path.join(process.cwd(), 'src/components/ui/AppGlassSurface.tsx'))).toBe(
      false,
    );
    expect(
      fs.existsSync(path.join(process.cwd(), 'src/components/ui/GlassmorphismContainer.tsx')),
    ).toBe(false);
    expect(legacySurfaceConsumers).toEqual([]);
  });

  it('keeps ordinary feature empty and notification cards on the canonical surface', () => {
    const ordinaryCardFiles = [
      'src/features/home/components/HomeEmptyStateCard.tsx',
      'src/features/settings/components/ActiveNotificationsSections.tsx',
      'src/features/savings/components/savingsPortfolio/SavingsPortfolioEmptyState.tsx',
    ];

    for (const file of ordinaryCardFiles) {
      const source = readProjectFile(file);

      expect(source).toContain('GlassSurface');
      expect(source).not.toMatch(/<Card(?:\s|>)/);
    }
  });

  it('keeps semantic wash and interactive accessibility independent from the visual chrome', () => {
    const glassSurfaceSurface = readProjectFile('packages/buddy-ui/src/GlassSurface.tsx');
    const notificationRows = readProjectFile(
      'src/features/settings/components/NotificationSettingsRows.tsx',
    );
    const faqSection = readProjectFile(
      'src/features/settings/components/helpSupport/HelpSupportFAQSection.tsx',
    );

    expect(glassSurfaceSurface).toContain('createAlphaColor(resolvedWashColor, 0.14)');
    expect(glassSurfaceSurface).toContain('pointerEvents="none"');
    expect(notificationRows).toContain('accessibilityRole="button"');
    expect(notificationRows).toContain('accessibilityLabel={title}');
    expect(faqSection).toContain('accessibilityState={{expanded: isExpanded}}');
  });

  it('centralizes decorative settings icon tiles without taking ownership of row interactions', () => {
    const iconTile = readProjectFile('packages/buddy-ui/src/IconTile.tsx');
    const notificationRows = readProjectFile(
      'src/features/settings/components/NotificationSettingsRows.tsx',
    );
    const privacyCards = readProjectFile(
      'src/features/settings/components/PrivacySecurityCards.tsx',
    );
    const helpSupport = readProjectFile(
      'src/features/settings/components/helpSupport/HelpSupportShared.tsx',
    );

    expect(iconTile).toContain('accessible={false}');
    expect(iconTile).toContain('pointerEvents="none"');
    expect(iconTile).toContain('badge?: string');
    expect(iconTile).toContain("export type IconTileTone = 'solid' | 'soft';");
    expect(iconTile).toContain('createAlphaColor(color, 0.16)');
    expect(notificationRows).toContain('IconTile');
    expect(privacyCards).toContain('IconTile');
    expect(helpSupport).toContain('IconTile');
    expect(notificationRows).toContain('accessibilityRole="button"');
    expect(helpSupport).toContain('accessibilityRole="button"');
    expect(readProjectFile('src/components/ui/SettingsItem.tsx')).toContain('IconTile');
    expect(
      readProjectFile(
        'src/features/settings/components/profileSettings/ProfileSecuritySections.tsx',
      ),
    ).toContain('IconTile');
    expect(
      readProjectFile('src/features/settings/components/profileSettings/ProfileSettingsShared.tsx'),
    ).toContain('IconTile');
  });

  it('shares simple empty-state anatomy while features retain their surfaces and callbacks', () => {
    const emptyStateContent = readProjectFile('packages/buddy-ui/src/EmptyState.tsx');
    const loansEmptyState = readProjectFile(
      'src/features/loans/components/LoansScreenEmptyState.tsx',
    );
    const subscriptionsEmptyState = readProjectFile(
      'src/features/subscriptions/components/SubscriptionsScreenStates.tsx',
    );
    const groupsEmptyState = readProjectFile('src/features/groups/components/GroupsScreenList.tsx');
    const savingsEmptyState = readProjectFile(
      'src/features/savings/components/savingsPortfolio/SavingsPortfolioEmptyState.tsx',
    );

    expect(emptyStateContent).toContain('iconAccessibilityLabel?: string');
    expect(emptyStateContent).toContain("accessibilityRole={onIconPress ? 'button' : undefined}");
    expect(emptyStateContent).toContain('IconTile');
    expect(loansEmptyState).toContain('EmptyState');
    expect(subscriptionsEmptyState).toContain('EmptyState');
    expect(groupsEmptyState).toContain('EmptyState');
    expect(savingsEmptyState).toContain('EmptyState');
    expect(savingsEmptyState).toContain('GlassSurface');
  });

  it('shares the detail action-grid layout while features retain their action state', () => {
    const actionGrid = readProjectFile('packages/buddy-ui/src/ActionGrid.tsx');
    const savingsActions = readProjectFile(
      'src/features/savings/components/savingsGoalDetail/SavingsGoalQuickActionsCard.tsx',
    );
    const subscriptionActions = readProjectFile(
      'src/features/subscriptions/components/subscriptionDetailSections/SubscriptionQuickActionsSection.tsx',
    );
    const loanActions = readProjectFile(
      'src/features/loans/components/loanDetail/LoanDetailOverviewSections.tsx',
    );

    expect(actionGrid).toContain('primaryActions: readonly [ActionGridItem, ActionGridItem]');
    expect(actionGrid).toContain('secondaryAction: ActionGridItem');
    expect(actionGrid).toContain('<Button');
    expect(savingsActions).toContain('ActionGrid');
    expect(subscriptionActions).toContain('ActionGrid');
    expect(loanActions).toContain('ActionGrid');
    expect(subscriptionActions).toContain("disabled: subscription.status !== 'active'");
    expect(loanActions).toContain("label: loan.autoPayEnabled ? 'Auto-Tracked' : buttonText");
  });
});
