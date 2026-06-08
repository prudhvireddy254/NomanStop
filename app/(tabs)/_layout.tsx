import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '@/features/auth/context/auth-context';
import { HapticTab } from '@/shared/components/haptic-tab';
import { IconSymbol } from '@/shared/components/icon-symbol';
import { AppTheme } from '@/shared/constants/app-theme';

export default function TabLayout() {
  const { user, onboardingComplete } = useAuth();

  if (!user) return <Redirect href="/auth" />;
  if (!onboardingComplete) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppTheme.primary,
        tabBarInactiveTintColor: AppTheme.tabInactive,
        tabBarStyle: {
          backgroundColor: AppTheme.tabBar,
          borderTopColor: AppTheme.tabBarBorder,
          borderTopWidth: 1,
        },
        sceneStyle: { backgroundColor: AppTheme.background },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
