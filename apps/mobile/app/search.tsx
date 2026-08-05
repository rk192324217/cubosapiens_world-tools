import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'
import { theme } from '../constants/theme'
import ToolCard from '../components/ToolCard'
import GameCard from '../components/GameCard'
import { fetchTools, fetchGames, Tool, Game } from '../lib/api'

const FILTERS = [
  { key: "all",   label: "All"   },
  { key: "tools", label: "Tools" },
  { key: "games", label: "Games" },
]

export default function SearchScreen()
{
  const router              = useRouter()
  const { q }               = useLocalSearchParams<{ q?: string }>()
  const [query,   setQuery] = useState(q || "")
  const [filter,  setFilter]= useState("all")
  const [tools,   setTools] = useState<Tool[]>([])
  const [games,   setGames] = useState<Game[]>([])
  const [loading, setLoading]= useState(true)

  useEffect(() => {
    Promise.all([fetchTools(), fetchGames()]).then(([t, g]) => {
      setTools(t)
      setGames(g)
      setLoading(false)
    })
  }, [])

  const q_ = query.toLowerCase()

  const filteredTools = (filter === "all" || filter === "tools")
    ? tools.filter(t =>
        t.name.toLowerCase().includes(q_) ||
        t.description.toLowerCase().includes(q_) ||
        t.category.toLowerCase().includes(q_)
      )
    : []

  const filteredGames = (filter === "all" || filter === "games")
    ? games.filter(g =>
        g.name.toLowerCase().includes(q_) ||
        g.description.toLowerCase().includes(q_)
      )
    : []

  const total = filteredTools.length + filteredGames.length

  return (
    <SafeAreaView style={s.container} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <FontAwesome5 name="arrow-left" size={16} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>Search</Text>
      </View>

      {/* Search input */}
      <View style={s.searchWrap}>
        <FontAwesome5 name="search" size={13} color={theme.colors.textMuted} style={s.searchIcon} />
        <TextInput
          style={s.search}
          placeholder="Search tools and games..."
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <FontAwesome5 name="times" size={13} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View style={s.tabs}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.tab, filter === f.key && s.tabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[s.tabText, filter === f.key && s.tabTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.content}>

          {query.length > 0 && (
            <Text style={s.resultCount}>{total} result{total !== 1 ? "s" : ""} for "{query}"</Text>
          )}

          {/* Tools results */}
          {filteredTools.length > 0 && (
            <>
              <Text style={s.sectionLabel}>Tools</Text>
              <View style={s.grid}>
                {filteredTools.map(t => (
                  <View key={t.id} style={s.gridItem}>
                    <ToolCard tool={t} />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Games results */}
          {filteredGames.length > 0 && (
            <>
              <Text style={s.sectionLabel}>Games</Text>
              <View style={s.grid}>
                {filteredGames.map(g => (
                  <View key={g.id} style={s.gridItem}>
                    <GameCard game={g} />
                  </View>
                ))}
              </View>
            </>
          )}

          {query.length > 0 && total === 0 && !loading && (
            <View style={s.empty}>
              <Text style={s.emptyText}>No results found</Text>
              <Text style={s.emptySub}>Try different keywords</Text>
            </View>
          )}

          {query.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptySub}>Type something to search tools and games</Text>
            </View>
          )}

        </ScrollView>
      )}

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: theme.colors.bg },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  back:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  title:         { fontFamily: theme.fonts.heading, fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary },
  searchWrap:    { marginHorizontal: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14 },
  searchIcon:    { marginRight: 8 },
  search:        { flex: 1, paddingVertical: 12, fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textPrimary },
  tabs:          { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  tab:           { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  tabActive:     { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
  tabText:       { fontFamily: theme.fonts.heading, fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  tabTextActive: { color: theme.colors.bg },
  content:       { paddingHorizontal: 20, paddingBottom: 40 },
  resultCount:   { fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginBottom: 16 },
  sectionLabel:  { fontFamily: theme.fonts.heading, fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 24 },
  gridItem:      { width: '48%' },
  empty:         { alignItems: 'center', paddingTop: 60 },
  emptyText:     { fontFamily: theme.fonts.heading, fontSize: 16, color: theme.colors.textPrimary, marginBottom: 6 },
  emptySub:      { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMuted },
})