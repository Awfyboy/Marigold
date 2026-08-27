import { StyleSheet, Pressable, View, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

type Option = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  isCancel?: boolean;
};

type Props = {
  visible: boolean;
  title?: string;
  options: Option[];
  onClose: () => void;
};

export default function ChoiceModal({ visible, title, options, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          {title && <Text style={styles.title}>{title}</Text>}
          {options.map((option) => (
            <Pressable
              key={option.label}
              style={[styles.option, option.isCancel && styles.cancelOption]}
              onPress={() => {
                onClose();
                option.onPress();
              }}
            >
              <Ionicons
                name={option.icon}
                size={22}
                color={option.isCancel ? Colors.cancelRed : Colors.navGreen}
              />
              <Text style={[styles.optionText, option.isCancel && styles.cancelText]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '80%',
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navGreen,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: Fonts.title,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelOption: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    fontFamily: Fonts.body,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.cancelRed,
  },
});