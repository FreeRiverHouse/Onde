import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

// Colori Onde
const Colors = {
  coral: '#FF7F7F',
  ocean: '#1A365D',
  gold: '#F4D03F',
  oceanDark: '#0F1C2E',
  white: '#FFFFFF',
};

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.oceanDark },
          animation: 'slide_from_right',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.oceanDark,
  },
});
