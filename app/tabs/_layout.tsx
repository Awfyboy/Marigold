import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    [Fonts.title]: require('../../assets/fonts/alegreya.bold.ttf'),
    [Fonts.body]: require('../../assets/fonts/Lato-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.navYellow,
          tabBarInactiveTintColor: Colors.navDarkYellow,
          tabBarLabelStyle: {
            fontFamily: Fonts.body,
          },
          tabBarStyle: {
            backgroundColor: Colors.navGreen,
            borderTopColor: Colors.navGreen,
            borderTopWidth: 1,
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={focused ? size: size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="plants"
        options={{
          title: 'My Plants',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'leaf' : 'leaf-outline'}
              size={focused ? size: size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={focused ? size: size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={focused ? size: size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}