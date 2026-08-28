import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import {
  getPlants,
  markWatered,
  markFertilized,
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

// Strip the time component so tasks group by calendar day
function dayKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime().toString();
}

// Group header label: 'Tomorrow' for the next day, otherwise the exact date
// (year only shown when it differs from the current year)
function groupLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diffDays === 1) return 'Tomorrow';
  const showYear = d.getFullYear() !== today.getFullYear();
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    ...(showYear ? { year: 'numeric' } : {}),
  });
}

export default function ScheduleScreen() {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);

  useFocusEffect(
    useCallback(() => {
      getPlants().then(setPlants);
    }, [])
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = today.getTime() + 86400000 - 1;

  const allTasks: Task[] = plants.flatMap((plant) => [
    { plant, action: 'Water' as TaskAction, dueDate: getNextWateringDate(plant) },
    { plant, action: 'Fertilize' as TaskAction, dueDate: getNextFertilizingDate(plant) },
  ]);

  // Today: due today or overdue (watering + fertilizing)
  const todayTasks = allTasks
    .filter((task) => task.dueDate.getTime() <= endOfToday)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  // Upcoming: due after today, grouped by exact due date
  const upcomingGroups = Array.from(
    allTasks
      .filter((task) => task.dueDate.getTime() > endOfToday)
      .reduce((groups, task) => {
        const key = dayKey(task.dueDate);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(task);
        return groups;
      }, new Map<string, Task[]>())
  )
    .map(([key, tasks]) => ({ key, label: groupLabel(tasks[0].dueDate), tasks }))
    .sort((a, b) => Number(a.key) - Number(b.key));

  const handleDone = async (task: Task) => {
    if (task.action === 'Water') {
      await markWatered(task.plant.id);
    } else {
      await markFertilized(task.plant.id);
    }
    setPlants(await getPlants());
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.title}>Schedule</Text>

        {todayTasks.length > 0 && (
          <View style={styles.todaySection}>
            <Text style={[styles.sectionTitle, styles.panelTitle]}>Today</Text>
            <View style={styles.taskList}>
              {todayTasks.map((task) => {
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
                    onPress={() => router.push(`/view-plant?id=${task.plant.id}`)}
                    onDone={() => handleDone(task)}
                  />
                );
              })}
            </View>
          </View>
        )}

        {upcomingGroups.length > 0 && (
          <View style={[styles.upcomingSection, todayTasks.length > 0 && styles.sectionSpaced]}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {upcomingGroups.map((group) => (
              <View key={group.key} style={styles.upcomingGroup}>
                <Text style={styles.groupLabel}>{group.label}</Text>
                <View style={styles.taskList}>
                  {group.tasks.map((task) => (
                    <PlantListCard
                      key={`${task.plant.id}-${task.action}`}
                      plant={task.plant}
                      action={task.action}
                      dueDate={task.dueDate}
                      onPress={() => router.push(`/view-plant?id=${task.plant.id}`)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {todayTasks.length === 0 && upcomingGroups.length === 0 && (
          <Text style={styles.emptyText}>No scheduled tasks yet.</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.title,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.body,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.navGreen,
    fontFamily: Fonts.body,
    textAlign: 'center',
    marginTop: 32,
  },
  todaySection: {
    backgroundColor: Colors.paleGreenYellow,
    paddingVertical: 16,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  panelTitle: {
    marginTop: 0,
  },
  taskList: {
    gap: 12,
    paddingHorizontal: 16,
  },
  upcomingSection: {
    paddingVertical: 16,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  sectionSpaced: {
    marginTop: 20,
  },
  upcomingGroup: {
    marginBottom: 20,
  },
});