import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'
import { theme } from '../../constants/theme'
import ToolGrid from '../../components/ToolGrid'
import { fetchTools, Tool } from '../../lib/api'

const CATS = [
  { key: "all",       label: "All"       },
  { key: "image",     label: "Image"     },
  { key: "pdf",       label: "PDF"       },
  { key: "generator", label: "Generator" },
  { key: "text",      label: "Text"      },
  { key: "converter", label: "Converter" },
]

export default function ToolsScreen()
{
  const router               = useRouter()
  const [tools,   setTools]  = useState<Tool[]>([])
  const [cat,     setCat]    = useState("all")
  const [search,  setSearch] = useState("")
  const [loading, setLoading]= useState(true)

  useEffect(() => {
    fetchTools().then(t => { setTools(t); setLoading(false) })
  }, [])

  const filtered = tools.filter(t => {
    const matchCat = cat === "all" || t.category === cat
    const matchQ   = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchQ
  })

  return (
    <SafeAreaView style={s.container} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <FontAwesome5 name="arrow-left" size={16} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>All Tools</Text>
        <Text style={s.count}>{filtered.length}</Text>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <FontAwesome5 name="search" size={13} color={theme.colors.textMuted} style={s.searchIcon} />
        <TextInput
          style={s.search}
          placeholder="Search tools..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabs}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {CATS.map(c => (
          <TouchableOpacity
            key={c.key}
            style={[s.tab, cat === c.key && s.tabActive]}
            onPress={() => setCat(c.key)}
          >
            <Text style={[s.tabText, cat === c.key && s.tabTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          <ToolGrid
            tools={filtered}
            seeMoreHref="/tools"
            seeMoreLabel="More"
            maxItems={filtered.length}
          />
          {filtered.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptyText}>No tools found</Text>
              <Text style={s.emptySub}>Try a different search or category</Text>
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
  tabs:        { marginBottom: 16, flexGrow: 0 },
  tab:         { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  tabActive:   { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
  tabText:     { fontFamily: theme.fonts.heading, fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  tabTextActive: { color: theme.colors.bg },
  content:     { paddingHorizontal: 20, paddingBottom: 40 },
  empty:       { alignItems: 'center', paddingTop: 60 },
  emptyText:   { fontFamily: theme.fonts.heading, fontSize: 18, color: theme.colors.textPrimary, marginBottom: 8 },
  emptySub:    { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMuted },
})