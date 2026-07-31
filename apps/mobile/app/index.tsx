import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import Header from '../components/Header';
import ToolGrid from '../components/ToolGrid';
import { fetchTools, fetchGames, Tool, Game } from '../lib/api'; 

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ tools: Tool[], games: Game[], aiTools: Tool[] }>({ 
    tools: [], 
    games: [], 
    aiTools: [] 
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch all three in parallel — exactly like your Next.js app
        const [alltools, gamesData, ai] = await Promise.all([
          fetchTools(),
          fetchGames(),
          fetchTools({ category: "ai" }),
        ]);

        setData({ 
          tools: alltools.filter(t => t.category !== "ai"), 
          games: gamesData, 
          aiTools: ai 
        });
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const aiHasLive = data.aiTools.some(t => t.isLive);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── HERO SECTION ── */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Everything you need.{'\n'}
            <Text style={styles.heroTitleAccent}>All in One place.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Free tools, games and AI - built for everyone.{'\n'}No accounts. No cost. Just open and use.
          </Text>

          <View style={styles.heroPills}>
            <TouchableOpacity style={styles.pill}>
              <FontAwesome5 name="tools" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.pillText}>Tools</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.pill}>
              <FontAwesome5 name="gamepad" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.pillText}>Games</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.pill, styles.pillLive]}>
              <FontAwesome5 name="robot" size={12} color={theme.colors.brand} />
              <Text style={styles.pillTextLive}>AI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── CONTENT SECTIONS ── */}
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.brand} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* TOOLS GRID */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tools</Text>
            </View>
            <ToolGrid 
              tools={data.tools} 
              seeMoreHref="/tools" 
              seeMoreLabel="All Tools" 
              maxItems={11} 
            />

            {/* GAMES GRID */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Games</Text>
            </View>
            {/* Note: Reusing ToolGrid temporarily. We will replace this with GameGrid! */}
            <ToolGrid 
              tools={data.games} 
              seeMoreHref="/games" 
              seeMoreLabel="All Games" 
              maxItems={11} 
            />

            {/* AI TOOLS GRID */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTag}>Powered by AI</Text>
              <Text style={styles.sectionTitle}>AI Tools</Text>
            </View>
            <ToolGrid 
              tools={data.aiTools} 
              seeMoreHref="/ai" 
              seeMoreLabel="All AI Tools" 
              maxItems={4} 
              faded={data.aiTools.length > 0 && data.aiTools.every(t => !t.isLive)}
            />
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  heroTitle: {
    fontFamily: theme.fonts.display,
    fontSize: 32,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  heroTitleAccent: {
    color: theme.colors.brand,
  },
  heroSubtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: theme.colors.border,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  pillLive: {
    backgroundColor: 'rgba(0, 255, 38, 0.05)',
    borderColor: 'rgba(0, 255, 38, 0.25)',
  },
  pillText: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  pillTextLive: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.brand,
  },
  sectionHeader: {
    marginBottom: 20,
    marginTop: 30,
  },
  sectionTag: {
    fontFamily: theme.fonts.heading,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  }
});