import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import {
  getPlants,
  getNextWateringDate,
  getNextFertilizingDate,
  getDaysOverdue,
  getFertilizingDaysOverdue,
  Plant,
} from '@/utils/plantStorage';
import PlantListCard from '@/components/PlantListCard';

type TaskAction = 'Water' | 'Fertilize';

type Task = {
  plant: Plant;
  action: TaskAction;
  dueDate: Date;
};

export default function ScheduleScreen() {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);

  useFocusEffect(
    useCallback(() => {
      getPlants().then(setPlants);
    }, [])
  );

  // All pending actions (watering + fertilizing, including overdue), sorted by due date
  const tasks: Task[] = plants
    .flatMap((plant) => {
      const tasks: Task[] = [
        { plant, action: 'Water', dueDate: getNextWateringDate(plant) },
        { plant, action: 'Fertilize', dueDate: getNextFertilizingDate(plant) },
      ];
      return tasks;
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.title}>Schedule</Text>

        {tasks.length === 0 ? (
          <Text style={styles.emptyText}>No scheduled tasks yet.</Text>
        ) : (
          <View style={styles.taskList}>
            {tasks.map((task) => {
              const overdueDays =
                task.action === 'Water'
                  ? getDaysOverdue(task.plant)
                  : getFertilizingDaysOverdue(task.plant);
              return (
                <PlantListCard
                  key={`${task.plant.id}-${task.action}`}
                  plant={task.plant}
                  action={task.action}
                  dueDate={task.dueDate}
                  overdueDays={overdueDays}
                  onPress={() => router.push(`/edit-plant?id=${task.plant.id}`)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgYellow,
  },
  listContent: {
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    color: Colors.navGreen,
    fontFamily: Fonts.title,
    paddingHorizontal: 16,
    paddingTop: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.navGreen,
    fontFamily: Fonts.body,
    textAlign: 'center',
    marginTop: 32,
  },
  taskList: {
    gap: 12,
    paddingHorizontal: 16,
  },
});