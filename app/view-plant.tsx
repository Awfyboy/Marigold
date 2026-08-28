import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import IconButton from '@/components/IconButton';
import {
  getPlantById,
  markWatered,
  markFertilized,
  getNextWateringDate,
  getNextFertilizingDate,
  formatFullDate,
  Plant,
} from '@/utils/plantStorage';

export default function ViewPlantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [plant, setPlant] = useState<Plant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reload the plant every time the screen comes into focus,
  // so care dates stay fresh after watering/fertilizing or editing
  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      getPlantById(id).then((found) => {
        if (found) {
          setPlant(found);
        } else {
          Alert.alert('Not found', 'This plant no longer exists.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }
        setIsLoading(false);
      });
    }, [id])
  );

  const handleWater = async () => {
    if (!plant) return;
    await markWatered(plant.id);
    setPlant((await getPlantById(plant.id)) ?? plant);
  };

  const handleFertilize = async () => {
    if (!plant) return;
    await markFertilized(plant.id);
    setPlant((await getPlantById(plant.id)) ?? plant);
  };

  if (isLoading || !plant) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Colors.navGreen} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-back"
          onPress={() => router.back()}
          size={24}
          color={Colors.navGreen}
        />
        <Pressable onPress={() => router.push(`/edit-plant?id=${plant.id}`)}>
          <Text style={styles.headerEdit}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Plant image */}
        <Image source={{ uri: plant.imageUri }} style={styles.image} />

        {/* Name + types */}
        <Text style={styles.name}>{plant.name}</Text>
        {plant.types.length > 0 && (
          <Text style={styles.subtitle}>{plant.types.join(', ')}</Text>
        )}

        {/* Info rows */}
        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Ionicons name="water" size={16} color={Colors.waterBlue} />
            <Text style={styles.infoLabelText}>Water</Text>
          </View>
          <Text style={styles.infoValue}>{plant.wateringFrequency}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Ionicons name="leaf" size={16} color={Colors.fertileGreen} />
            <Text style={styles.infoLabelText}>Fertilize</Text>
          </View>
          <Text style={styles.infoValue}>{plant.fertilizingFrequency}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Ionicons name="sunny" size={16} color={Colors.navGreen} />
            <Text style={styles.infoLabelText}>Light</Text>
          </View>
          <Text style={styles.infoValue}>{plant.sunlight}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Ionicons name="location" size={16} color={Colors.navGreen} />
            <Text style={styles.infoLabelText}>Location</Text>
          </View>
          <Text style={styles.infoValue}>{plant.location}</Text>
        </View>

        {/* Care section */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Care</Text>
        <View style={styles.careRow}>
          <Text style={styles.careLabel}>Last watered</Text>
          <Text style={styles.careValue}>
            {plant.lastWatered ? formatFullDate(plant.lastWatered) : '—'}
          </Text>
        </View>
        <View style={styles.careRow}>
          <Text style={styles.careLabel}>Next watering</Text>
          <Text style={styles.careValue}>{formatFullDate(getNextWateringDate(plant))}</Text>
        </View>
        <View style={styles.careRow}>
          <Text style={styles.careLabel}>Last fertilized</Text>
          <Text style={styles.careValue}>
            {plant.lastFertilized ? formatFullDate(plant.lastFertilized) : '—'}
          </Text>
        </View>
        <View style={styles.careRow}>
          <Text style={styles.careLabel}>Next fertilizing</Text>
          <Text style={styles.careValue}>{formatFullDate(getNextFertilizingDate(plant))}</Text>
        </View>

        {/* Notes section */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.notes}>{plant.notes.trim() ? plant.notes : 'No notes yet.'}</Text>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable style={[styles.actionButton, { backgroundColor: Colors.waterBlue }]} onPress={handleWater}>
            <Ionicons name="water" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Water</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, { backgroundColor: Colors.fertileGreen }]} onPress={handleFertilize}>
            <Ionicons name="leaf" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Fertilize</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgYellow,
    paddingTop: 48,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerEdit: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.body,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: Colors.navDarkYellow,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.title,
    marginTop: 16,
    marginHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.navGreen,
    fontFamily: Fonts.body,
    marginTop: 2,
    marginHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 14,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.navGreen,
    fontFamily: Fonts.body,
  },
  infoValue: {
    fontSize: 15,
    color: '#000',
    fontFamily: Fonts.body,
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.navGreen,
    opacity: 0.2,
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.title,
    marginTop: 12,
    marginBottom: 4,
    marginHorizontal: 16,
  },
  careRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  careLabel: {
    fontSize: 14,
    color: Colors.navGreen,
    fontFamily: Fonts.body,
  },
  careValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: Fonts.body,
  },
  notes: {
    fontSize: 14,
    color: '#000',
    fontFamily: Fonts.body,
    lineHeight: 20,
    marginHorizontal: 16,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.body,
  },
});
