import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/colors';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress: () => void;
  size?: number;
  color?: string;
  square?: boolean;
};

export default function IconButton({ icon, label, onPress, size = 24, color = '#7FD856', square = false }: Props) {
  return (
    <Pressable style={[styles.iconButton, square && { ...styles.square, borderColor: color }]} onPress={onPress}>
      
      <Ionicons name={icon} size={size} color={color} />
      {label && <Text style={styles.iconButtonText}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  square: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#ffffff00',
    borderWidth: 2,
  },
  iconButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.navGreen,
    fontWeight: '500',
  },
});