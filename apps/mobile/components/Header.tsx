import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useRouter } from 'expo-router';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearchOpen(false);
      setSearch('');
    }
  };

  const handleNav = (route: string) => {
    setMenuOpen(false);
    router.push(route as any);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        {/* LOGO */}
        <TouchableOpacity style={styles.logoContainer} onPress={() => handleNav('/')}>
          {/* Defaulting to a network image since local assets aren't migrated yet */}
          <Image 
            source={{ uri: 'https://cubosapiens.world/logo.png' }} 
            style={styles.logoIcon} 
          />
          <Text style={styles.logoText}>CUBOSAPIENS</Text>
        </TouchableOpacity>

        {/* ICONS */}
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setSearchOpen(!searchOpen)}>
            <FontAwesome5 name="search" size={16} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuOpen(!menuOpen)}>
            <FontAwesome5 name={menuOpen ? "times" : "bars"} size={16} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* MOBILE SEARCH BAR */}
      {searchOpen && (
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" size={14} color="rgba(255,255,255,0.3)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search tools & games..."
            placeholderTextColor="rgba(255, 255, 255, 0.25)"
            onSubmitEditing={handleSearch}
            autoFocus
          />
        </View>
      )}

      {/* MOBILE MENU */}
      {menuOpen && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownLabel}>NAVIGATE</Text>
          
          <TouchableOpacity style={styles.dropdownLink} onPress={() => handleNav('/')}>
            <FontAwesome5 name="home" size={16} color="rgba(255,255,255,0.6)" style={styles.dropdownIcon} />
            <Text style={styles.dropdownLinkText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dropdownLink} onPress={() => handleNav('/tools')}>
            <FontAwesome5 name="tools" size={16} color="rgba(255,255,255,0.6)" style={styles.dropdownIcon} />
            <Text style={styles.dropdownLinkText}>Tools</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dropdownLink} onPress={() => handleNav('/games')}>
            <FontAwesome5 name="gamepad" size={16} color="rgba(255,255,255,0.6)" style={styles.dropdownIcon} />
            <Text style={styles.dropdownLinkText}>Games</Text>
            <View style={styles.badgeLive}><Text style={styles.badgeLiveText}>LIVE</Text></View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dropdownLink} onPress={() => handleNav('/ai')}>
            <FontAwesome5 name="robot" size={16} color="rgba(255,255,255,0.6)" style={styles.dropdownIcon} />
            <Text style={styles.dropdownLinkText}>AI</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.13)',
    borderWidth: 1,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  logoText: {
    fontFamily: theme.fonts.display,
    fontSize: 14,
    color: theme.colors.brand,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1,
    borderRadius: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: {
    position: 'absolute',
    left: 30,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingLeft: 36,
    paddingRight: 14,
    color: '#fff',
    fontFamily: theme.fonts.body,
  },
  dropdown: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderColor: 'rgba(88, 233, 21, 0.43)',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
  },
  dropdownLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  dropdownLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dropdownIcon: {
    width: 28,
    textAlign: 'center',
    marginRight: 10,
  },
  dropdownLinkText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  badgeLive: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(0, 255, 38, 0.12)',
    borderColor: 'rgba(0, 255, 38, 0.25)',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  badgeLiveText: {
    color: '#84ff00',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  }
});