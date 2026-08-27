import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';


export default function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Schedule</Text>
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
  text: {
    fontFamily: Fonts.body,
  },
});