import fs from 'node:fs';
import path from 'node:path';

const readProjectFile = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('SDK 56 architecture contracts', () => {
  it('registers the authentication logo through a static Metro require', () => {
    const source = readProjectFile('src/features/auth/components/AuthenticationScreen.tsx');

    expect(source).toContain(
      "import coinsLogoSource from '../../../../assets/appLogo/coins-logo.png';",
    );
    expect(source).not.toContain('loadAsset');
    expect(source).not.toContain("require('../../../assets/appLogo/coins-logo.png')");
  });

  it('mounts the same user provider exported to application consumers', () => {
    const providersSource = readProjectFile('src/context/AppProviders.tsx');
    const contextIndexSource = readProjectFile('src/context/index.ts');

    expect(providersSource).toContain("import {UserProvider} from './UserContext';");
    expect(providersSource).toContain('[AuthProvider, UserProvider, SettingsProvider');
    expect(providersSource).not.toContain('UserQueryProvider');
    expect(contextIndexSource).toContain("export {UserProvider, useUser} from './UserContext';");
  });

  it('uses one authentication provider for every sign-in method', () => {
    const providersSource = readProjectFile('src/context/AppProviders.tsx');
    const googleAuthHookSource = readProjectFile('src/hooks/useGoogleAuth.ts');

    expect(providersSource).not.toContain('GoogleAuthProvider');
    expect(googleAuthHookSource).toContain("import {useAuth} from '../context/AuthContext';");
    expect(googleAuthHookSource).not.toContain('GoogleAuthContext');
  });

  it('embeds only the font weights used by Tamagui without runtime font gating', () => {
    const layoutSource = readProjectFile('app/_layout.tsx');
    const appConfigSource = readProjectFile('app.config.ts');

    expect(appConfigSource).toContain('SFPRODISPLAYREGULAR');
    expect(appConfigSource).toContain('SFPRODISPLAYMEDIUM');
    expect(appConfigSource).toContain('SFPRODISPLAYBOLD');
    expect(appConfigSource).not.toContain('ITALIC');
    expect(layoutSource).not.toContain('useFonts');
  });

  it('does not use the removed StyleSheet.absoluteFillObject API', () => {
    const offlineNoticeSource = readProjectFile('src/components/ui/OfflineNotice.tsx');
    const groupModalsSource = readProjectFile(
      'src/features/groups/components/GroupsScreenModals.tsx',
    );

    expect(offlineNoticeSource).not.toContain('StyleSheet.absoluteFillObject');
    expect(groupModalsSource).not.toContain('StyleSheet.absoluteFillObject');
  });
});
