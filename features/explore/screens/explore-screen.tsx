import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/shared/components/screen-shell';
import { AppTheme } from '@/shared/constants/app-theme';

const TOPICS = [
  { title: 'Technology', description: 'AI, startups, and the latest in tech.' },
  { title: 'Sports', description: 'Scores, highlights, and live discussions.' },
  { title: 'Music', description: 'New releases, artists, and playlists.' },
  { title: 'Travel', description: 'Destinations, tips, and travel stories.' },
];

export default function ExploreScreen() {
  return (
    <ScreenShell>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>
            Discover topics and people. Your feed will personalize from here.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending topics</Text>
          {TOPICS.map((topic) => (
            <View key={topic.title} style={styles.topicCard}>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicDescription}>{topic.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>
            Search, maps, and recommendations are coming next.
          </Text>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  header: {
    gap: 6,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: AppTheme.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: AppTheme.textMuted,
    lineHeight: 22,
  },
  section: {
    gap: 12,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
  },
  topicCard: {
    backgroundColor: AppTheme.surface,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: AppTheme.surfaceBorder,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.primary,
  },
  topicDescription: {
    fontSize: 14,
    color: AppTheme.textMuted,
    lineHeight: 20,
  },
  comingSoon: {
    backgroundColor: AppTheme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: AppTheme.surfaceBorder,
    zIndex: 1,
  },
  comingSoonText: {
    fontSize: 14,
    color: AppTheme.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
