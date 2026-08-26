import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';


export default function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <Text>Schedule</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
