import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { theme } from '../constants/theme'
import { Game } from '../lib/api'

export default function GameCard({ game }: { game: Game })
{
  const router = useRouter()

  const handlePress = () => {
    if(game.isLive) router.push(`/games/${game.slug}` as any)
  }

  const isImage = game.icon?.endsWith(".png") || game.icon?.endsWith(".svg")

  return (
    <TouchableOpacity
      style={[s.card, !game.isLive && s.cardSoon]}
      onPress={handlePress}
      activeOpacity={game.isLive ? 0.7 : 1}
    >
      <View style={s.badgeRow}>
        <View style={game.isLive ? s.badgeLive : s.badgeSoon}>
          <Text style={game.isLive ? s.badgeLiveText : s.badgeSoonText}>
            {game.isLive ? "LIVE" : "SOON"}
          </Text>
        </View>
      </View>

      <View style={s.iconWrap}>
        {isImage ? (
          <Image
            source={{ uri: `https://cubosapiens.world/icons/${game.icon}` }}
            style={s.iconImg}
            resizeMode="contain"
          />
        ) : (
          <Text style={s.iconEmoji}>{game.icon}</Text>
        )}
      </View>

      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{game.name}</Text>
        <Text style={s.desc} numberOfLines={2}>{game.description}</Text>
        <View style={s.genreWrap}>
          <Text style={s.genre}>{game.genre}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(8,14,26,0.95)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    aspectRatio: 3/4,
    justifyContent: 'space-between',
  },
  cardSoon: { opacity: 0.42 },
  badgeRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  badgeLive: {
    backgroundColor: 'rgba(140,227,73,0.20)',
    borderColor: 'rgba(125,255,4,0.6)',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 20,
  },
  badgeSoon: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 20,
  },
  badgeLiveText: { color: '#84ff00', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  badgeSoonText: { color: 'rgba(255,255,255,0.25)', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  iconWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconImg: { width: 52, height: 52, borderRadius: 10 },
  iconEmoji: { fontSize: 36 },
  info: { alignItems: 'center' },
  name: {
    fontFamily: theme.fonts.heading,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 3,
  },
  desc: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 6,
  },
  genreWrap: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  genre: {
    fontFamily: theme.fonts.heading,
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
})