import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

type Props = {
  placeholder?: string;
  onChangeText: (text: string) => void;
  value: string;
};

export default function SearchBar({ placeholder = 'Search plants...', onChangeText, value }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={Colors.navGreen} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.navGreen}
        onChangeText={onChangeText}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgYellow,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.navGreen,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#000',
    fontFamily: Fonts.body,
  },
});
