import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'
import { theme } from '../constants/theme'

const VALUES = [
  { icon: "shield-alt",  title: "Privacy First",  desc: "All processing in your browser. We never store your files." },
  { icon: "infinity",    title: "Always Free",     desc: "Core tools free forever. Sustained by non-intrusive ads." },
  { icon: "globe",       title: "Built for All",   desc: "Simple for anyone. Powerful for professionals." },
  { icon: "code-branch", title: "Open Source",     desc: "Fully open source on GitHub. Anyone can contribute." },
]

const SOCIALS = [
  { icon: "instagram", label: "Instagram", url: "https://www.instagram.com/cubosapiens/" },
  { icon: "youtube",   label: "YouTube",   url: "https://www.youtube.com/channel/UCsG60rRXZ302vmYDYg4j97g" },
  { icon: "linkedin",  label: "LinkedIn",  url: "https://www.linkedin.com/in/cubosapiens/" },
]

export default function AboutScreen()
{
  const router = useRouter()

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <FontAwesome5 name="arrow-left" size={16} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>About</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>Built by a student.{'\n'}Free for everyone.</Text>
          <Text style={s.heroSub}>
            CUBOSAPIENS started as a personal project to give everyone free browser tools in one place — no accounts, no cost, forever.
          </Text>
        </View>

        {/* Values */}
        <View style={s.valuesGrid}>
          {VALUES.map((v, i) => (
            <View key={i} style={s.valueCard}>
              <View style={s.valueIcon}>
                <FontAwesome5 name={v.icon} size={18} color={theme.colors.brand} />
              </View>
              <Text style={s.valueTitle}>{v.title}</Text>
              <Text style={s.valueDesc}>{v.desc}</Text>
            </View>
          ))}
        </View>

        {/* Story */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>The Problem We Solve</Text>
          <Text style={s.body}>
            Every day, millions of people open 6-8 different websites just to use basic tools. Each site has paywalls, signups, ads, and privacy risks. CUBOSAPIENS puts everything in one place — free, fast, and private.
          </Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Tech Stack</Text>
          <Text style={s.body}>
            Next.js 15 · TypeScript · Hono.js on Cloudflare Workers · PostgreSQL on Supabase · Prisma ORM · Cloudflare Pages · Turborepo monorepo · Expo React Native
          </Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Open Source</Text>
          <Text style={s.body}>
            CUBOSAPIENS is participating in GSSoC 2026. Contributors are building tools and games right now on GitHub.
          </Text>
        </View>

        {/* Socials */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Follow Us</Text>
          <View style={s.socials}>
            {SOCIALS.map(social => (
              <TouchableOpacity
                key={social.label}
                style={s.socialBtn}
                onPress={() => Linking.openURL(social.url)}
              >
                <FontAwesome5 name={social.icon} size={18} color={theme.colors.brand} />
                <Text style={s.socialLabel}>{social.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact */}
        <TouchableOpacity
          style={s.contactBtn}
          onPress={() => Linking.openURL("mailto:cubosapiens@gmail.com")}
        >
          <FontAwesome5 name="envelope" size={14} color={theme.colors.bg} />
          <Text style={s.contactBtnText}>Contact Us</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: theme.colors.bg },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  back:         { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  title:        { fontFamily: theme.fonts.heading, fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary },
  content:      { paddingHorizontal: 20, paddingBottom: 60 },
  hero:         { paddingVertical: 28, borderBottomWidth: 1, borderBottomColor: theme.colors.border, marginBottom: 24 },
  heroTitle:    { fontFamily: theme.fonts.display, fontSize: 28, color: theme.colors.textPrimary, lineHeight: 36, marginBottom: 12 },
  heroSub:      { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 },
  valuesGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  valueCard:    { width: '47%', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, padding: 16 },
  valueIcon:    { width: 40, height: 40, backgroundColor: 'rgba(0,255,38,0.08)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  valueTitle:   { fontFamily: theme.fonts.heading, fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  valueDesc:    { fontFamily: theme.fonts.body, fontSize: 11, color: theme.colors.textSecondary, lineHeight: 16 },
  section:      { marginBottom: 24 },
  sectionTitle: { fontFamily: theme.fonts.heading, fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 8 },
  body:         { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 },
  socials:      { flexDirection: 'row', gap: 12, marginTop: 8 },
  socialBtn:    { flex: 1, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 14, alignItems: 'center', gap: 6 },
  socialLabel:  { fontFamily: theme.fonts.body, fontSize: 11, color: theme.colors.textSecondary },
  contactBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.brand, borderRadius: 12, padding: 14, marginTop: 8 },
  contactBtnText: { fontFamily: theme.fonts.heading, fontSize: 14, fontWeight: '700', color: theme.colors.bg },
})