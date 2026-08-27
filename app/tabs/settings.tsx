import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { getPlants, deleteAllPlants } from '@/utils/plantStorage';

export default function SettingsScreen() {
  const [plantCount, setPlantCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getPlants().then((plants) => setPlantCount(plants.length));
    }, [])
  );

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data?',
      `This will permanently remove all ${plantCount} plant${
        plantCount === 1 ? '' : 's'
      } and their watering information. This cannot be undone.`,
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <Text style={styles.plantCount}>
          {plantCount} plant{plantCount === 1 ? '' : 's'} saved
        </Text>

        <Pressable
          style={[styles.deleteButton, plantCount === 0 && styles.deleteButtonDisabled]}
          onPress={handleDeleteAllData}
          disabled={plantCount === 0}
        >
          <Ionicons
            name="trash"
            size={18}
            color={plantCount === 0 ? '#999999' : Colors.errorRed}
          />
          <Text
            style={[
              styles.deleteButtonText,
              plantCount === 0 && styles.deleteButtonTextDisabled,
            ]}
          >
            Delete All Data
          </Text>
        </Pressable>
      </View>
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.title,
    marginBottom: 8,
  },
  plantCount: {
    fontSize: 14,
    color: Colors.navGreen,
    fontFamily: Fonts.body,
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.errorRed,
    backgroundColor: Colors.bgYellow,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: Colors.errorRed,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.body,
  },
  deleteButtonTextDisabled: {
    color: '#999999',
  },
});
