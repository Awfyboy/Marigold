import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { getPlants, deleteAllPlants } from '@/utils/plantStorage';

const MARIGOLD_ICON = require('@/assets/marigold-icon.png');

export default function SettingsScreen() {
  const [plantCount, setPlantCount] = useState(0);
  const [isAboutVisible, setIsAboutVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getPlants().then((plants) => setPlantCount(plants.length));
    }, [])
  );

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Plants?',
      `This will permanently remove all ${plantCount} plant${
        plantCount === 1 ? '' : 's'
      } and their information. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllPlants();
              setPlantCount(0);
            } catch (error) {
              console.error('Failed to delete all data:', error);
              Alert.alert('Error', 'Something went wrong while deleting. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* DATA section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATA</Text>
        <View style={styles.divider} />

        <Pressable
          style={styles.settingsRow}
          onPress={handleDeleteAllData}
          disabled={plantCount === 0}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="trash"
              size={18}
              color={plantCount === 0 ? '#999999' : Colors.errorRed}
            />
            <Text
              style={[
                styles.rowLabel,
                plantCount === 0 && styles.rowLabelDisabled,
              ]}
            >
              Delete All Plants
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={plantCount === 0 ? '#bbbbbb' : Colors.navGreen}
          />
        </Pressable>
      </View>

      {/* ABOUT section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.divider} />

        <Pressable style={styles.settingsRow} onPress={() => setIsAboutVisible(true)}>
          <View style={styles.rowLeft}>
            <Ionicons name="information-circle" size={18} color={Colors.navGreen} />
            <Text style={styles.rowLabel}>About</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.navGreen} />
        </Pressable>
      </View>

      {/* About modal */}
      <Modal visible={isAboutVisible} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setIsAboutVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Image source={MARIGOLD_ICON} style={styles.aboutIcon} resizeMode="contain" />
            <Text style={styles.aboutTitle}>About</Text>
            <Text style={styles.aboutDescription}>
              A simple app to help you keep track of your plants and their care
              schedules.
            </Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutAuthor}>Awf Ibrahim Mohamed (24047957)</Text>
            <Pressable style={styles.closeButton} onPress={() => setIsAboutVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgYellow,
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    color: Colors.navGreen,
    fontFamily: Fonts.title,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.body,
    letterSpacing: 1,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.navGreen,
    opacity: 0.3,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    fontSize: 16,
    color: Colors.navGreen,
    fontFamily: Fonts.body,
  },
  rowLabelDisabled: {
    color: '#999999',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.bgYellow,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  aboutIcon: {
    width: 128,
    height: 128,
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.title,
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#000',
    fontFamily: Fonts.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  aboutVersion: {
    fontSize: 13,
    color: Colors.navGreen,
    fontFamily: Fonts.body,
    marginTop: 16,
  },
  aboutAuthor: {
    fontSize: 13,
    color: Colors.navGreen,
    fontFamily: Fonts.body,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: Colors.navGreen,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  closeButtonText: {
    color: Colors.navYellow,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Fonts.body,
  },
});
