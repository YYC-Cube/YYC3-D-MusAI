import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

// Auth Screens
import LoginScreen from '@/screens/auth/LoginScreen'
import RegisterScreen from '@/screens/auth/RegisterScreen'
import BiometricSetupScreen from '@/screens/auth/BiometricSetupScreen'

// Main Tab Screens
import HomeScreen from '@/screens/home/HomeScreen'
import DiscoverScreen from '@/screens/discover/DiscoverScreen'
import LibraryScreen from '@/screens/library/LibraryScreen'
import PlayerScreen from '@/screens/player/PlayerScreen'
import SettingsScreen from '@/screens/settings/SettingsScreen'

// Modal/Detail Screens
import SongDetailScreen from '@/screens/home/SongDetailScreen'
import ChatRoomScreen from '@/screens/chat/ChatRoomScreen'
import ProfileEditScreen from '@/screens/settings/ProfileEditScreen'

// New Screens - Discover
import SearchResultsScreen from '@/screens/discover/SearchResultsScreen'
import ArtistDetailScreen from '@/screens/discover/ArtistDetailScreen'
import AlbumDetailScreen from '@/screens/discover/AlbumDetailScreen'

// New Screens - Library
import PlaylistDetailScreen from '@/screens/library/PlaylistDetailScreen'
import DownloadsScreen from '@/screens/library/DownloadsScreen'

// New Screens - Settings
import NotificationsScreen from '@/screens/settings/NotificationsScreen'
import AccountSecurityScreen from '@/screens/settings/AccountSecurityScreen'
import PlaybackSettingsScreen from '@/screens/settings/PlaybackSettingsScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline'

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Discover') {
            iconName = focused ? 'search' : 'search-outline'
          } else if (route.name === 'Library') {
            iconName = focused ? 'library' : 'library-outline'
          } else if (route.name === 'Player') {
            iconName = focused ? 'musical-notes' : 'musical-notes-outline'
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTextColor: '#71717a',
        tabBarStyle: {
          backgroundColor: '#18181b',
          borderTopColor: '#27272a',
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen 
        name="Player" 
        component={PlayerScreen}
        options={{
          tabBarLabel: 'Now Playing',
        }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          {/* Auth Stack */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen 
            name="BiometricSetup" 
            component={BiometricSetupScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      ) : (
        <>
          {/* Main App */}
          <Stack.Screen name="MainApp" component={MainTabNavigator} />

          {/* Home Stack Screens */}
          <Stack.Screen
            name="SongDetail"
            component={SongDetailScreen}
            options={{ presentation: 'card' }}
          />

          {/* Discover Stack Screens */}
          <Stack.Screen
            name="SearchResults"
            component={SearchResultsScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="ArtistDetail"
            component={ArtistDetailScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="AlbumDetail"
            component={AlbumDetailScreen}
            options={{ presentation: 'card' }}
          />

          {/* Library Stack Screens */}
          <Stack.Screen
            name="PlaylistDetail"
            component={PlaylistDetailScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="Downloads"
            component={DownloadsScreen}
            options={{ presentation: 'modal' }}
          />

          {/* Player & Social Stack Screens */}
          <Stack.Screen
            name="ChatRoom"
            component={ChatRoomScreen}
            options={{ presentation: 'fullScreenModal' }}
          />

          {/* Settings Stack Screens */}
          <Stack.Screen
            name="ProfileEdit"
            component={ProfileEditScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="AccountSecurity"
            component={AccountSecurityScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="PlaybackSettings"
            component={PlaybackSettingsScreen}
            options={{ presentation: 'card' }}
          />
        </>
      )}
    </Stack.Navigator>
  )
}

// Import stores at bottom to avoid circular dependencies
import { useAuthStore } from '@/stores/authStore'