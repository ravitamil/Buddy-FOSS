import {Tabs} from 'expo-router';
import {CustomTabBar} from '../../src/components/ui/CustomTabBar';
import {AuthGuard} from '../../src/features/auth/components/AuthGuard';

export default function TabLayout() {
  const tabStabilityProps: any = {
    detachInactiveScreens: false,
  };

  return (
    <AuthGuard>
      <Tabs
        {...tabStabilityProps}
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          // Fabric safety: keep tab scenes stable instead of background remount churn
          freezeOnBlur: true,
          lazy: true,
          // Remove default tab bar to use our custom floating tab bar
          tabBarStyle: {display: 'none'},
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="trackers/index"
          options={{
            title: 'Trackers',
          }}
        />
        <Tabs.Screen
          name="groups/index"
          options={{
            title: 'Groups',
          }}
        />
        <Tabs.Screen
          name="settings/index"
          options={{
            title: 'Settings',
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
