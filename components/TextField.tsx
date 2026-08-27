import { StyleSheet, Text, TextInput, View } from 'react-native';
import Colors from '@/constants/colors';

type Props = {
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
};

export default function TextField({
  label,
  required = false,
  error,
  placeholder = 'Enter text...',
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
}: Props) {
  
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors.navGreen}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navGreen,
    marginBottom: 6,
  },
  required: {
    color: Colors.errorRed,
  },
  inputError: {
    borderColor: Colors.errorRed,
  },
  errorText: {
    color: Colors.errorRed,
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.bgYellow,
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
