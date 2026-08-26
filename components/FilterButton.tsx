import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSelected?: boolean;
  onPress: () => void;
};

export default function FilterButton({ label, icon, isSelected, onPress }: Props) {
  return (
    <Pressable style={[styles.button, isSelected && styles.selectedButton]} onPress={onPress}>
      <View style={styles.content}>
        <Ionicons name={icon} size={18} color={isSelected ? Colors.navYellow : Colors.navGreen} />
        <Text style={[styles.label, isSelected && styles.selectedLabel]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.bgYellow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.navGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: Colors.navGreen,
    borderColor: Colors.navGreen,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: Colors.navGreen,
    fontWeight: '500',
  },
  selectedLabel: {
    color: Colors.navYellow,
  },
});
