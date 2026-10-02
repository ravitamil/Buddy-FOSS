import fs from 'node:fs';
import path from 'node:path';

const readProjectFile = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('onboarding visual contract', () => {
  it('uses one shared modern chrome across every onboarding step', () => {
    const chrome = readProjectFile('src/features/onboarding/components/OnboardingStepChrome.tsx');
    const profile = readProjectFile(
      'src/features/onboarding/components/CombinedPersonalInfoStep.tsx',
    );
    const birthday = readProjectFile(
      'src/features/onboarding/components/ModernDateOfBirthStep.tsx',
    );
    const currency = readProjectFile(
      'src/features/onboarding/components/CurrencyPreferenceStep.tsx',
    );

    expect(chrome).toContain('OnboardingStepHeader');
    expect(chrome).toContain('OnboardingActionBar');
    expect(chrome).toContain('GlassSurface');
    expect(profile).toContain('<OnboardingStepHeader');
    expect(profile).toContain('<OnboardingActionBar');
    expect(birthday).toContain('<OnboardingStepHeader');
    expect(birthday).toContain('<OnboardingActionBar');
    expect(currency).toContain('<OnboardingStepHeader');
    expect(currency).toContain('<OnboardingActionBar');
  });

  it('composes theme-aware Buddy UI controls instead of legacy ad-hoc chrome', () => {
    const profile = readProjectFile(
      'src/features/onboarding/components/CombinedPersonalInfoStep.tsx',
    );
    const birthday = readProjectFile(
      'src/features/onboarding/components/ModernDateOfBirthStep.tsx',
    );
    const currency = readProjectFile(
      'src/features/onboarding/components/CurrencyPreferenceStep.tsx',
    );

    expect(profile).toContain('FormField');
    expect(profile).toContain('GlassSurface');
    expect(birthday).toContain('SelectField');
    expect(birthday).toContain('BottomSheet');
    expect(currency).toContain('SearchField');
    expect(currency).toContain('accessibilityRole="radio"');
    expect(`${profile}${birthday}${currency}`).not.toMatch(/#[0-9a-f]{3,8}/i);
    expect(`${profile}${birthday}${currency}`).not.toContain('rgba(');
  });

  it('keeps progress compact, semantic, and accessible', () => {
    const progress = readProjectFile(
      'src/features/onboarding/components/OnboardingProgressIndicator.tsx',
    );

    expect(progress).toContain('Badge');
    expect(progress).toContain('accessibilityRole="progressbar"');
    expect(progress).toContain(
      "backgroundColor={step <= currentStep ? '$primary' : '$borderColor'}",
    );
    expect(progress).not.toContain('width={40}');
  });
});
