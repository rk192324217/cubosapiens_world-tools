import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import GameCard from './GameCard'
import { theme } from '../constants/theme'
import { Game } from '../lib/api'

interface Props {
  games:        Game[]
  seeMoreHref:  string
  seeMoreLabel: string
  maxItems?:    number
  faded?:       boolean
}

export default function GameGrid({
  games,
  seeMoreHref,
  seeMoreLabel,
  maxItems = 11,
  faded    = false,
}: Props)
{
  const router  = useRouter()
  if(!games) return null
  const visible = games.slice(0, maxItems)

  return (
    <View style={[s.grid, faded && s.faded]}>
      {visible.map(game => (
        <View key={game.id} style={s.item}>
          <GameCard game={game} />
        </View>
      ))}
      <View style={s.item}>
        <TouchableOpacity
          style={s.seeMore}
          onPress={() => router.push(seeMoreHref as any)}
          activeOpacity={0.7}
        >
          <Text style={s.seeMoreArrow}>→</Text>
          <Text style={s.seeMoreLabel}>{seeMoreLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  grid:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  faded:       { opacity: 0.35 },
  item:        { width: '48%', marginBottom: 16 },
  seeMore: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 20,
    aspectRatio: 3/4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  seeMoreArrow: { fontSize: 22, color: 'rgba(255,255,255,0.6)' },
  seeMoreLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
})