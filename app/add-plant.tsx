import { StyleSheet, Text, View, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import IconButton from '@/components/IconButton';
import PhotoField from '@/components/PhotoField';
import TextField from '@/components/TextField';
import BasicButton from '@/components/BasicButton';
import Dropdown from '@/components/Dropdown';
import { savePlant } from '@/utils/plantStorage';

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

export default function AddPlantScreen() {
  const router = useRouter();

  // Category 1
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  // Category 2
  const [name, setName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Category 3
  const [location, setLocation] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState('');
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
    sunlight?: string;
  }>({});

  const handleSelectImage = (uri: string) => {
    setImageUri(uri);
    setErrors((prev) => ({ ...prev, photo: undefined }));
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    // Clear error as soon as at least one type is selected
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
    if (!sunlight) newErrors.sunlight = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSavePlant = async () => {
    if (!validate() || !imageUri) return;

    setIsSaving(true);
    try {
      await savePlant({
        imageUri,
        name: name.trim(),
        types: selectedTypes,
        location,
        wateringFrequency,
        sunlight,
        notes,
      });

      Alert.alert('Success', `${name.trim()} has been saved!`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to save plant:', error);
      Alert.alert('Error', 'Something went wrong while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Back button */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-back"
            onPress={() => router.back()}
            size={28}
            color={Colors.navGreen}
          />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
          {errors.types && (
            <Text style={styles.errorText}>{errors.types}</Text>
          )}

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

          {/* Save Plant button */}
          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSavePlant}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Plant'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
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
    alignItems: 'flex-start',
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
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navGreen,
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: 16,
  },
  required: {
    color: Colors.errorRed,
  },
  errorText: {
    color: Colors.errorRed,
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 16,
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
  saveButton: {
    backgroundColor: Colors.navGreen,
    borderRadius: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.navYellow,
    fontSize: 16,
    fontWeight: '700',
  },
});
