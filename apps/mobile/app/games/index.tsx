import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'
import { theme } from '../../constants/theme'
import Header from '../../components/Header'
import GameGrid from '../../components/GameGrid'
import { fetchGames, Game } from '../../lib/api'

const GENRES = [
  { key: "all",      label: "All"      },
  { key: "arcade",   label: "Arcade"   },
  { key: "puzzle",   label: "Puzzle"   },
  { key: "strategy", label: "Strategy" },
  { key: "action",   label: "Action"   },
  { key: "word",     label: "Word"     },
]

export default function GamesScreen()
{
  const router               = useRouter()
  const [games,   setGames]  = useState<Game[]>([])
  const [genre,   setGenre]  = useState("all")
  const [loading, setLoading]= useState(true)

  useEffect(() => {
    fetchGames().then(g => { setGames(g); setLoading(false) })
  }, [])

  const filtered = games.filter(g =>
    genre === "all" || g.genre?.toLowerCase() === genre
  )

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Header />

      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <FontAwesome5 name="arrow-left" size={16} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.tag}>Play in browser</Text>
          <Text style={s.title}>Games</Text>
        </View>
        <Text style={s.count}>{filtered.length} games</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabs}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {GENRES.map(g => (
          <TouchableOpacity
            key={g.key}
            style={[s.tab, genre === g.key && s.tabActive]}
            onPress={() => setGenre(g.key)}
          >
            <Text style={[s.tabText, genre === g.key && s.tabTextActive]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          <GameGrid
            games={filtered}
            seeMoreHref="/games"
            seeMoreLabel="More"
            maxItems={filtered.length}
          />
          {filtered.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptyText}>No games in this genre yet</Text>
              <Text style={s.emptySub}>More coming soon</Text>
            </View>
          )}
        </ScrollView>
      )}

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: theme.colors.bg },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  back:        { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  tag:         { fontFamily: theme.fonts.heading, fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: theme.colors.textMuted },
  title:       { fontFamily: theme.fonts.heading, fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary },
  count:       { fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.brand },
  tabs:        { marginBottom: 16, flexGrow: 0 },
  tab:         { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  tabActive:   { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
  tabText:     { fontFamily: theme.fonts.heading, fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  tabTextActive: { color: theme.colors.bg },
  content:     { paddingHorizontal: 20, paddingBottom: 40 },
  empty:       { alignItems: 'center', paddingTop: 60 },
  emptyText:   { fontFamily: theme.fonts.heading, fontSize: 16, color: theme.colors.textPrimary, marginBottom: 6 },
  emptySub:    { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMuted },
})