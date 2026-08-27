import { StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';


export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Marigold!</Text>
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