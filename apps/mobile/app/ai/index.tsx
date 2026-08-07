import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'
import { theme } from '../../constants/theme'
import Header from '../../components/Header'
import ToolGrid from '../../components/ToolGrid'
import { fetchTools, Tool } from '../../lib/api'

export default function AIScreen()
{
  const router               = useRouter()
  const [tools,   setTools]  = useState<Tool[]>([])
  const [search,  setSearch] = useState("")
  const [loading, setLoading]= useState(true)

  useEffect(() => {
    fetchTools({ category: 'ai' }).then(t => { setTools(t); setLoading(false) })
  }, [])

  const filtered = tools.filter(t => {
    const matchQ = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    return matchQ
  })

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Header />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <FontAwesome5 name="arrow-left" size={16} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>AI Tools</Text>
        <Text style={s.count}>{filtered.length}</Text>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <FontAwesome5 name="search" size={13} color={theme.colors.textMuted} style={s.searchIcon} />
        <TextInput
          style={s.search}
          placeholder="Search AI tools..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          <ToolGrid
            tools={filtered}
            seeMoreHref="/ai"
            seeMoreLabel="More"
            maxItems={filtered.length}
          />
          {filtered.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptyText}>No AI tools found</Text>
              <Text style={s.emptySub}>Try a different search</Text>
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
  title:       { flex: 1, fontFamily: theme.fonts.heading, fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary },
  count:       { fontFamily: theme.fonts.heading, fontSize: 13, fontWeight: '700', color: theme.colors.brand },
  searchWrap:  { marginHorizontal: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14 },
  searchIcon:  { marginRight: 8 },
  search:      { flex: 1, paddingVertical: 12, fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textPrimary },
  content:     { paddingHorizontal: 20, paddingBottom: 40 },
  empty:       { alignItems: 'center', paddingTop: 60 },
  emptyText:   { fontFamily: theme.fonts.heading, fontSize: 18, color: theme.colors.textPrimary, marginBottom: 8 },
  emptySub:    { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMuted },
})
