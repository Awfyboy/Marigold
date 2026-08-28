import AsyncStorage from '@react-native-async-storage/async-storage';

export type Plant = {
  id: string;
  imageUri: string;
  name: string;
  types: string[];
  location: string;
  wateringFrequency: string;
  fertilizingFrequency: string;
  sunlight: string;
  notes: string;
  createdAt: string;
  lastWatered?: string;
  lastFertilized?: string;
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

export async function deleteAllPlants(): Promise<void> {
  await AsyncStorage.removeItem(PLANTS_KEY);
}

export async function markWatered(id: string): Promise<void> {
  const plants = await getPlants();
  const index = plants.findIndex((plant) => plant.id === id);

  if (index !== -1) {
    plants[index] = { ...plants[index], lastWatered: new Date().toISOString() };
    await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
  }
}

export async function markFertilized(id: string): Promise<void> {
  const plants = await getPlants();
  const index = plants.findIndex((plant) => plant.id === id);

  if (index !== -1) {
    plants[index] = { ...plants[index], lastFertilized: new Date().toISOString() };
    await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
  }
}

const WATERING_INTERVALS: Record<string, number> = {
  Daily: 1,
  'Every 2 days': 2,
  'Every 3 days': 3,
  'Every week': 7,
  'Every 2 weeks': 14,
  'Once a month': 30,
};

const FERTILIZING_INTERVALS: Record<string, number> = {
  Daily: 1,
  'Every 2 days': 2,
  'Every 3 days': 3,
  'Every week': 7,
  'Every 2 weeks': 14,
  'Once a month': 30,
};

export function getWateringIntervalDays(frequency: string): number {
  return WATERING_INTERVALS[frequency] ?? 7;
}

export function getFertilizingIntervalDays(frequency: string): number {
  return FERTILIZING_INTERVALS[frequency] ?? 30;
}

// Next due date = last watered (or created) + interval
export function getNextWateringDate(plant: Plant): Date {
  const baseline = plant.lastWatered
    ? new Date(plant.lastWatered)
    : new Date(plant.createdAt);
  const next = new Date(baseline);
  next.setDate(next.getDate() + getWateringIntervalDays(plant.wateringFrequency));
  return next;
}

// Next due date = last fertilized (or created) + interval
export function getNextFertilizingDate(plant: Plant): Date {
  const baseline = plant.lastFertilized
    ? new Date(plant.lastFertilized)
    : new Date(plant.createdAt);
  const next = new Date(baseline);
  next.setDate(
    next.getDate() + getFertilizingIntervalDays(plant.fertilizingFrequency)
  );
  return next;
}

// Whole days between the watering due date and today (positive = overdue)
export function getDaysOverdue(plant: Plant): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = getNextWateringDate(plant);
  due.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - due.getTime()) / 86400000);
}

// Whole days between the fertilizing due date and today (positive = overdue)
export function getFertilizingDaysOverdue(plant: Plant): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = getNextFertilizingDate(plant);
  due.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - due.getTime()) / 86400000);
}

export function formatDueDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  const months = Math.floor(diffDays / 30);
  return `In ${months} month${months > 1 ? 's' : ''}`;
}
