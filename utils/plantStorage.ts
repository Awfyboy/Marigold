import AsyncStorage from '@react-native-async-storage/async-storage';

export type Plant = {
  id: string;
  imageUri: string;
  name: string;
  types: string[];
  location: string;
  wateringFrequency: string;
  sunlight: string;
  notes: string;
  createdAt: string;
};

const PLANTS_KEY = 'plants';

export async function getPlants(): Promise<Plant[]> {
  try {
    const json = await AsyncStorage.getItem(PLANTS_KEY);
    return json ? (JSON.parse(json) as Plant[]) : [];
  } catch (error) {
    console.error('Failed to load plants:', error);
    return [];
  }
}

export async function savePlant(
  plant: Omit<Plant, 'id' | 'createdAt'>
): Promise<Plant> {
  const newPlant: Plant = {
    ...plant,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  const plants = await getPlants();
  plants.push(newPlant);
  await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(plants));

  return newPlant;
}