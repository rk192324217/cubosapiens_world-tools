import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useRouter } from 'expo-router';

export default function ToolCard({ tool }: { tool: any }) {
  const router = useRouter();

  const handlePress = () => {
    if (tool.isLive) {
      router.push(`/tools/${tool.slug}` as any);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, !tool.isLive && styles.cardSoon]}
      onPress={handlePress}
      activeOpacity={tool.isLive ? 0.7 : 1}
    >
      {/* ── BADGE ── */}
      <View style={styles.badgeRow}>
        {tool.isLive ? (
          <View style={styles.badgeLive}>
            <Text style={styles.badgeLiveText}>LIVE</Text>
          </View>
        ) : (
          <View style={styles.badgeSoon}>
            <Text style={styles.badgeSoonText}>SOON</Text>
          </View>
        )}
      </View>

      {/* ── ICON ── */}
      <View style={styles.iconContainer}>
        <FontAwesome5 
          name={tool.icon?.replace('fa-', '') || 'tools'} 
          size={36} 
          color={theme.colors.textPrimary} 
        />
      </View>

      {/* ── INFO ── */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{tool.name}</Text>
        <Text style={styles.desc} numberOfLines={2}>{tool.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    aspectRatio: 3 / 4,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardSoon: {
    opacity: 0.42,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  badgeLive: {
    backgroundColor: 'rgba(140, 227, 73, 0.20)',
    borderColor: 'rgba(125, 255, 4, 0.6)',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 20,
  },
  badgeLiveText: {
    color: '#84ff00',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  badgeSoon: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 20,
  },
  badgeSoonText: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.fonts.heading,
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 3,
    textAlign: 'center',
  },
  desc: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
    lineHeight: 14,
  }
});