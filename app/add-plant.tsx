import { StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import IconButton from '@/components/IconButton';


export default function AddPlantScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Back button */}
        <View style={styles.header}>
          <IconButton 
            icon="arrow-back" 
            onPress={() => router.back()}
            size={28}
            color={Colors.navGreen}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text>Add Plant Screen</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgYellow,
    paddingTop: 48,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
