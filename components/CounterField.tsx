import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

type Props = {
  label?: string;
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
};

export default function CounterField({
  label = 'Days',
  value,
  onChangeValue,
  min = 1,
  max = 365,
  unit = 'days',
}: Props) {
  const handleDecrement = () => {
    if (value > min) {
      onChangeValue(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChangeValue(value + 1);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.counterContainer}>
        <Pressable
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={handleDecrement}
          disabled={value <= min}
        >
          <Ionicons
            name="remove"
            size={24}
            color={value <= min ? '#ccc' : Colors.navGreen}
          />
        </Pressable>

        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>

        <Pressable
          style={[styles.button, value >= max && styles.buttonDisabled]}
          onPress={handleIncrement}
          disabled={value >= max}
        >
          <Ionicons
            name="add"
            size={24}
            color={value >= max ? '#ccc' : Colors.navGreen}
          />
        </Pressable>
      </View>
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
    marginBottom: 12,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.navGreen,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.bgYellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  valueContainer: {
    alignItems: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.navGreen,
  },
  unit: {
    fontSize: 12,
    color: Colors.navGreen,
    marginTop: 4,
  },
});
