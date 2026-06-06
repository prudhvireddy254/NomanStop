import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.orb1} pointerEvents="none" />
      <View style={styles.orb2} pointerEvents="none" />

      <View style={styles.card}>
        <Text style={styles.title}>Welcome to NomanStop</Text>
        <Text style={styles.subtitle}>Logged in as @{user?.username}</Text>
        <Text style={styles.bodyText}>
          Your onboarding is complete. Next, we can connect this feed to real content and follower data.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    zIndex: 0,
  },
  orb2: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    zIndex: 0,
  },
  card: {
    backgroundColor: '#161D30',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#232D45',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
    maxWidth: 400,
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700',
  },
  bodyText: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    shadowColor: '#EF4444',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
