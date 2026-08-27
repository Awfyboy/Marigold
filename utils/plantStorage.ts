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

export async function getPlantById(id: string): Promise<Plant | undefined> {
  const plants = await getPlants();
  return plants.find((plant) => plant.id === id);
}

export async function updatePlant(updatedPlant: Plant): Promise<void> {
  const plants = await getPlants();
  const index = plants.findIndex((plant) => plant.id === updatedPlant.id);

  if (index !== -1) {
    plants[index] = updatedPlant;
    await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
  }
}

export async function deletePlant(id: string): Promise<void> {
  const plants = await getPlants();
  const filtered = plants.filter((plant) => plant.id !== id);
  await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(filtered));
}
