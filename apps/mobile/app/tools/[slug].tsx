import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Dimensions, Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { WebView } from 'react-native-webview'
import { FontAwesome5 } from '@expo/vector-icons'
import { theme } from '../../constants/theme'
import { fetchTools, Tool } from '../../lib/api'

const API = "https://api.cubosapiens.world"

export default function ToolScreen()
{
  const { slug }              = useLocalSearchParams<{ slug: string }>()
  const router                = useRouter()
  const [tool,    setTool]    = useState<Tool | null>(null)
  const [recs,    setRecs]    = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    async function load()
    {
      const [allTools] = await Promise.all([fetchTools()])
      const found = allTools.find(t => t.slug === slug) || null
      setTool(found)
      setRecs(allTools.filter(t => t.slug !== slug).slice(0, 5))
      setLoading(false)
    }
    load()
  }, [slug])

  if(loading)
  {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={theme.colors.brand} />
      </View>
    )
  }

  if(!tool)
  {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>Tool not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.errorLink}>← Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>

      {/* Header bar */}
      {!fullscreen && (
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <FontAwesome5 name="arrow-left" size={15} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.toolName} numberOfLines={1}>{tool.name}</Text>
          {tool.isLive && (
            <TouchableOpacity style={s.fsBtn} onPress={() => setFullscreen(true)}>
              <FontAwesome5 name="expand" size={13} color={theme.colors.brand} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Fullscreen exit bar */}
      {fullscreen && (
        <TouchableOpacity style={s.fsBar} onPress={() => setFullscreen(false)}>
          <FontAwesome5 name="compress" size={13} color={theme.colors.brand} />
          <Text style={s.fsBarText}>Exit Fullscreen</Text>
        </TouchableOpacity>
      )}

      {/* Tool WebView or coming soon */}
      {tool.isLive && tool.url ? (
        <WebView
          source={{ uri: tool.url }}
          style={s.webview}
          allowsInlineMediaPlayback
          geolocationEnabled
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          mixedContentMode="always"
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
        />
      ) : (
        <View style={s.soon}>
          {tool.icon?.endsWith('.png') || tool.icon?.endsWith('.svg') ? (
            <Image source={{ uri: `https://cubosapiens.world/icons/${tool.icon}` }} style={s.soonImg} resizeMode="contain" />
          ) : (
            <Text style={s.soonEmoji}>{tool.icon}</Text>
          )}
          <Text style={s.soonTitle}>Coming Soon</Text>
          <Text style={s.soonDesc}>{tool.description}</Text>
        </View>
      )}

      {/* Recommended row — hidden in fullscreen */}
      {!fullscreen && recs.length > 0 && (
        <View style={s.recsWrap}>
          <Text style={s.recsTitle}>Recommended</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recs.map(rec => (
              <TouchableOpacity
                key={rec.id}
                style={s.recCard}
                onPress={() => router.push(`/tools/${rec.slug}` as any)}
              >
                {rec.icon?.endsWith('.png') || rec.icon?.endsWith('.svg') ? (
                  <Image source={{ uri: `https://cubosapiens.world/icons/${rec.icon}` }} style={s.recImg} resizeMode="contain" />
                ) : (
                  <Text style={s.recIcon}>{rec.icon}</Text>
                )}
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
  toolName:    { flex: 1, fontFamily: theme.fonts.heading, fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },
  fsBtn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  fsBar:       { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  fsBarText:   { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.brand },
  webview:     { flex: 1, backgroundColor: theme.colors.bg },
  soon:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  soonEmoji:   { fontSize: 52 },
  soonImg:     { width: 64, height: 64, borderRadius: 12 },
  soonTitle:   { fontFamily: theme.fonts.heading, fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary },
  soonDesc:    { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  recsWrap:    { backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border, padding: 14 },
  recsTitle:   { fontFamily: theme.fonts.heading, fontSize: 11, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  recCard:     { backgroundColor: theme.colors.surface2, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 12, marginRight: 12, alignItems: 'center', width: 100 },
  recIcon:     { fontSize: 28, marginBottom: 6 },
  recImg:      { width: 36, height: 36, borderRadius: 8, marginBottom: 6 },
  recName:     { fontFamily: theme.fonts.body, fontSize: 11, color: theme.colors.textSecondary, textAlign: 'center', width: '100%' },
})