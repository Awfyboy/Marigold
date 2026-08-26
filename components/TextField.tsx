import { StyleSheet, TextInput, View } from 'react-native';
import Colors from '@/constants/colors';

type Props = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
};

export default function TextField({
  placeholder = 'Enter text...',
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
}: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        placeholderTextColor={Colors.navGreen}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.navGreen,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
