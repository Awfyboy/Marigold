import { StyleSheet, Pressable, View, Text, Modal, FlatList } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

type Props = {
  label?: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
};

export default function Dropdown({
  label,
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select an option...',
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable style={styles.button} onPress={() => setIsOpen(!isOpen)}>
        <Text style={[styles.buttonText, !selectedValue && styles.placeholder]}>
          {selectedValue || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.navGreen}
        />
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.option,
                    selectedValue === item && styles.selectedOption,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setIsOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedValue === item && styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
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
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.navGreen,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  placeholder: {
    color: Colors.navGreen,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: '80%',
    maxHeight: 300,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: Colors.bgYellow,
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  selectedOptionText: {
    color: Colors.navGreen,
    fontWeight: '600',
  },
});
