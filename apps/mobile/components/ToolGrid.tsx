import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ToolCard from './ToolCard';
import { theme } from '../constants/theme';

export function SeeMoreCard({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  return (
    <TouchableOpacity 
      style={styles.seeMoreCard} 
      onPress={() => router.push(href as any)}
      activeOpacity={0.7}
    >
      <Text style={styles.seeMoreArrow}>→</Text>
      <Text style={styles.seeMoreLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ToolGrid({ tools, seeMoreHref, seeMoreLabel, maxItems = 11, faded = false }: any) {
  // Prevent crash if tools is undefined while loading
  if (!tools) return null;
  
  const visible = tools.slice(0, maxItems);
  
  return (
    <View style={[styles.grid, faded && styles.gridFaded]}>
      {visible.map((tool: any, i: number) => (
        <View key={tool.id} style={styles.gridItem}>
          <ToolCard tool={tool} />
        </View>
      ))}
      <View style={styles.gridItem}>
        <SeeMoreCard href={seeMoreHref} label={seeMoreLabel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridFaded: {
    opacity: 0.35,
  },
  gridItem: {
    width: '48%', // Creates the 2-column layout for mobile
    marginBottom: 16,
  },
  seeMoreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 20,
    aspectRatio: 3 / 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  seeMoreArrow: {
    fontSize: 22,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  seeMoreLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  }
});