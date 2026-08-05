import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { WebView } from 'react-native-webview'
import { FontAwesome5 } from '@expo/vector-icons'
import { theme } from '../../constants/theme'
import { fetchGames, Game } from '../../lib/api'

export default function GameScreen()
{
  const { slug }              = useLocalSearchParams<{ slug: string }>()
  const router                = useRouter()
  const [game,    setGame]    = useState<Game | null>(null)
  const [recs,    setRecs]    = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [fullscreen, setFS]   = useState(false)

  useEffect(() => {
    fetchGames().then(all => {
      const found = all.find(g => g.slug === slug) || null
      setGame(found)
      setRecs(all.filter(g => g.slug !== slug).slice(0, 5))
      setLoading(false)
    })
  }, [slug])

  if(loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={theme.colors.brand} />
    </View>
  )

  if(!game) return (
    <View style={s.center}>
      <Text style={s.errorText}>Game not found</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={s.errorLink}>← Go back</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={s.container} edges={['top']}>

      {!fullscreen && (
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <FontAwesome5 name="arrow-left" size={15} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.gameName} numberOfLines={1}>{game.name}</Text>
            <Text style={s.gameGenre}>{game.genre}</Text>
          </View>
          {game.isLive && (
            <TouchableOpacity style={s.fsBtn} onPress={() => setFS(true)}>
              <FontAwesome5 name="expand" size={13} color={theme.colors.brand} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {fullscreen && (
        <TouchableOpacity style={s.fsBar} onPress={() => setFS(false)}>
          <FontAwesome5 name="compress" size={13} color={theme.colors.brand} />
          <Text style={s.fsBarText}>Exit Fullscreen</Text>
        </TouchableOpacity>
      )}

      {game.isLive && game.url ? (
        <WebView
          source={{ uri: game.url }}
          style={s.webview}
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
        />
      ) : (
        <View style={s.soon}>
          <Text style={s.soonEmoji}>{game.icon}</Text>
          <Text style={s.soonTitle}>Coming Soon</Text>
          <Text style={s.soonDesc}>{game.description}</Text>
        </View>
      )}

      {!fullscreen && recs.length > 0 && (
        <View style={s.recsWrap}>
          <Text style={s.recsTitle}>More Games</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recs.map(rec => (
              <TouchableOpacity
                key={rec.id}
                style={s.recCard}
                onPress={() => router.push(`/games/${rec.slug}` as any)}
              >
                <Text style={s.recIcon}>{rec.icon}</Text>
                <Text style={s.recName} numberOfLines={1}>{rec.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: theme.colors.bg },
  center:      { flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'center', alignItems: 'center' },
  errorText:   { fontFamily: theme.fonts.heading, fontSize: 18, color: theme.colors.textPrimary, marginBottom: 12 },
  errorLink:   { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.brand },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 12 },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  gameName:    { fontFamily: theme.fonts.heading, fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },
  gameGenre:   { fontFamily: theme.fonts.body, fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  fsBtn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  fsBar:       { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  fsBarText:   { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.brand },
  webview:     { flex: 1 },
  soon:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  soonEmoji:   { fontSize: 52 },
  soonTitle:   { fontFamily: theme.fonts.heading, fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary },
  soonDesc:    { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  recsWrap:    { backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border, padding: 14 },
  recsTitle:   { fontFamily: theme.fonts.heading, fontSize: 11, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  recCard:     { backgroundColor: theme.colors.surface2, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 10, marginRight: 10, alignItems: 'center', width: 72 },
  recIcon:     { fontSize: 22, marginBottom: 4 },
  recName:     { fontFamily: theme.fonts.body, fontSize: 10, color: theme.colors.textSecondary, textAlign: 'center' },
})