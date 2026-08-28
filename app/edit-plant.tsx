import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import IconButton from '@/components/IconButton';
import PhotoField from '@/components/PhotoField';
import TextField from '@/components/TextField';
import BasicButton from '@/components/BasicButton';
import Dropdown from '@/components/Dropdown';
import {
  getPlantById,
  updatePlant,
  deletePlant,
  Plant,
} from '@/utils/plantStorage';

const PLANT_TYPES = [
  { label: 'Herb', icon: 'leaf' as const },
  { label: 'Flower', icon: 'flower' as const },
  { label: 'Fruit', icon: 'nutrition' as const },
];

const LOCATION_OPTIONS = ['Indoors', 'Outdoors'];

const WATERING_OPTIONS = [
  'Daily',
  'Every 2 days',
  'Every 3 days',
  'Every week',
  'Every 2 weeks',
  'Once a month',
];

const SUNLIGHT_OPTIONS = [
  'Any sun',
  'Full sun',
  'Low light',
  'Medium light',
  'Bright indirect',
  'Full shade',
];

export default function EditPlantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Original plant loaded from storage
  const [plant, setPlant] = useState<Plant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Category 1
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  // Category 2
  const [name, setName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Category 3
  const [location, setLocation] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState('');
  const [fertilizingFrequency, setFertilizingFrequency] = useState('');
  const [sunlight, setSunlight] = useState('');

  // Category 4
  const [notes, setNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{
    photo?: string;
    name?: string;
    types?: string;
    location?: string;
    wateringFrequency?: string;
    fertilizingFrequency?: string;
    sunlight?: string;
  }>({});

  const [isSaving, setIsSaving] = useState(false);

  // Load the plant once when the screen opens
  if (isLoading && id) {
    setIsLoading(false);
    getPlantById(id).then((found) => {
      if (found) {
        setPlant(found);
        setImageUri(found.imageUri);
        setName(found.name);
        setSelectedTypes(found.types);
        setLocation(found.location);
        setWateringFrequency(found.wateringFrequency);
        setFertilizingFrequency(found.fertilizingFrequency);
        setSunlight(found.sunlight);
        setNotes(found.notes);
      } else {
        Alert.alert('Not found', 'This plant no longer exists.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    });
  }

  // Track whether the user changed anything compared to the loaded plant
  const isDirty =
    plant !== null &&
    (imageUri !== plant.imageUri ||
      name !== plant.name ||
      JSON.stringify(selectedTypes) !== JSON.stringify(plant.types) ||
      location !== plant.location ||
      wateringFrequency !== plant.wateringFrequency ||
      fertilizingFrequency !== plant.fertilizingFrequency ||
      sunlight !== plant.sunlight ||
      notes !== plant.notes);

  const saveDisabled = !isDirty || isSaving || isLoading;

  const handleSelectImage = (uri: string) => {
    setImageUri(uri);
    setErrors((prev) => ({ ...prev, photo: undefined }));
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    if (!selectedTypes.includes(type)) {
      setErrors((prev) => ({ ...prev, types: undefined }));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!imageUri) newErrors.photo = 'Required';
    if (!name.trim()) newErrors.name = 'Required';
    if (selectedTypes.length === 0) newErrors.types = 'Required';
    if (!location) newErrors.location = 'Required';
    if (!wateringFrequency) newErrors.wateringFrequency = 'Required';
    if (!fertilizingFrequency) newErrors.fertilizingFrequency = 'Required';
    if (!sunlight) newErrors.sunlight = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoBack = () => {
    if (isDirty) {
      Alert.alert('Discard changes?', 'You have unsaved changes.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const handleSaveChanges = async () => {
    if (!plant || !validate() || !imageUri) return;

    setIsSaving(true);
    try {
      await updatePlant({
        ...plant,
        imageUri,
        name: name.trim(),
        types: selectedTypes,
        location,
        wateringFrequency,
        fertilizingFrequency,
        sunlight,
        notes,
      });

      router.back();
    } catch (error) {
      console.error('Failed to update plant:', error);
      Alert.alert('Error', 'Something went wrong while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlant = () => {
    if (!plant) return;

    Alert.alert(
      `Delete ${plant.name}?`,
      'This will permanently remove this plant and its watering information.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlant(plant.id);
              router.replace('/tabs/plants');
            } catch (error) {
              console.error('Failed to delete plant:', error);
              Alert.alert('Error', 'Something went wrong while deleting. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Edge-to-edge disables Android's adjustResize, so padding is needed on both platforms */}
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {/* Header: back, title, save */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-back"
            onPress={handleGoBack}
            size={28}
            color={Colors.navGreen}
          />
          <Text style={styles.headerTitle}>Edit Plant</Text>
          <IconButton
            icon="save"
            label="Save"
            onPress={() => {
              if (saveDisabled) return;
              handleSaveChanges();
            }}
            size={24}
            color={saveDisabled ? Colors.disabled : Colors.navGreen}
          />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category 1: Photo */}
          <Text style={styles.sectionTitle}>
            Photo<Text style={styles.required}> *</Text>
          </Text>
          <PhotoField
            imageUri={imageUri}
            onSelectImage={handleSelectImage}
            required
            error={errors.photo}
          />

          {/* Category 2: Name & Type */}
          <Text style={styles.sectionTitle}>Plant Details</Text>
          <TextField
            label="Plant Name"
            required
            error={errors.name}
            placeholder="Enter plant name..."
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name && text.trim()) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
          />

          <Text style={styles.fieldLabel}>
            Plant Type<Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.typesRow}>
            {PLANT_TYPES.map((type) => (
              <View key={type.label} style={styles.typeButton}>
                <BasicButton
                  label={type.label}
                  icon={type.icon}
                  isSelected={selectedTypes.includes(type.label)}
                  onPress={() => toggleType(type.label)}
                />
              </View>
            ))}
          </View>
          {errors.types && <Text style={styles.errorText}>{errors.types}</Text>}

          {/* Category 3: Care */}
          <Text style={styles.sectionTitle}>Care</Text>
          <Dropdown
            label="Location"
            required
            error={errors.location}
            options={LOCATION_OPTIONS}
            selectedValue={location}
            onSelect={(value) => {
              setLocation(value);
              setErrors((prev) => ({ ...prev, location: undefined }));
            }}
            placeholder="Select location..."
          />
          <Dropdown
            label="Watering Frequency"
            required
            error={errors.wateringFrequency}
            options={WATERING_OPTIONS}
            selectedValue={wateringFrequency}
            onSelect={(value) => {
              setWateringFrequency(value);
              setErrors((prev) => ({ ...prev, wateringFrequency: undefined }));
            }}
            placeholder="Select watering frequency..."
          />
          <Dropdown
            label="Fertilizing Frequency"
            required
            error={errors.fertilizingFrequency}
            options={WATERING_OPTIONS}
            selectedValue={fertilizingFrequency}
            onSelect={(value) => {
              setFertilizingFrequency(value);
              setErrors((prev) => ({ ...prev, fertilizingFrequency: undefined }));
            }}
            placeholder="Select fertilizing frequency..."
          />
          <Dropdown
            label="Sunlight"
            required
            error={errors.sunlight}
            options={SUNLIGHT_OPTIONS}
            selectedValue={sunlight}
            onSelect={(value) => {
              setSunlight(value);
              setErrors((prev) => ({ ...prev, sunlight: undefined }));
            }}
            placeholder="Select sunlight needs..."
          />

          {/* Category 4: Notes */}
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextField
            placeholder="Add any notes (optional)..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />

          {/* Delete Plant — separate destructive action at the bottom */}
          <View style={styles.deleteDivider} />
          <Pressable style={styles.deleteButton} onPress={handleDeletePlant}>
            <Text style={styles.deleteButtonText}>Delete Plant</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgYellow,
    paddingTop: 48,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    color: Colors.navGreen,
    fontFamily: Fonts.body,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.navGreen,
    marginTop: 16,
    marginBottom: 4,
    marginHorizontal: 16,
    fontFamily: Fonts.title,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navGreen,
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: 16,
    fontFamily: Fonts.body,
  },
  required: {
    color: Colors.errorRed,
  },
  errorText: {
    color: Colors.errorRed,
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 16,
    fontFamily: Fonts.body,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  typeButton: {
    height: 38,
    justifyContent: 'center',
  },
  deleteDivider: {
    height: 1,
    backgroundColor: Colors.errorRed,
    opacity: 0.3,
    marginHorizontal: 16,
    marginTop: 12,
  },
  deleteButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.errorRed,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: Colors.errorRed,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.body,
  },
});