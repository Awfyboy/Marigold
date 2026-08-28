import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import {
  getPlants,
  markWatered,
  markFertilized,
  getNextWateringDate,
  getNextFertilizingDate,
  getWateringIntervalDays,
  getFertilizingIntervalDays,
  getDaysOverdue,
  getFertilizingDaysOverdue,
  updatePlant,
  Plant,
} from '@/utils/plantStorage';
import PlantListCard from '@/components/PlantListCard';

type TaskAction = 'Water' | 'Fertilize';

type Task = {
  plant: Plant;
  action: TaskAction;
  dueDate: Date;
};

const PREVIEW_COUNT = 3;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Index() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [plants, setPlants] = useState<Plant[]>([]);

  useFocusEffect(
    useCallback(() => {
      getPlants().then(setPlants);
    }, [])
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Plants due today or overdue (watering)
  const dueToday = plants
    .filter((plant) => getNextWateringDate(plant).getTime() <= today.getTime() + 86400000 - 1)
    .sort(
      (a, b) => getNextWateringDate(a).getTime() - getNextWateringDate(b).getTime()
    );

  // Plants due today or overdue (fertilizing)
  const dueTodayFertilizing = plants
    .filter((plant) => getNextFertilizingDate(plant).getTime() <= today.getTime() + 86400000 - 1)
    .sort(
      (a, b) => getNextFertilizingDate(a).getTime() - getNextFertilizingDate(b).getTime()
    );

  // Watering card counts: overdue vs strictly due today
  const waterOverdueCount = plants.filter((plant) => getDaysOverdue(plant) > 0).length;
  const waterDueTodayCount = dueToday.filter((plant) => getDaysOverdue(plant) <= 0).length;

  // Fertilizing card counts: overdue vs strictly due today
  const fertOverdueCount = plants.filter((plant) => getFertilizingDaysOverdue(plant) > 0).length;
  const fertDueTodayCount = dueTodayFertilizing.filter(
    (plant) => getFertilizingDaysOverdue(plant) <= 0
  ).length;

  // Combined today's tasks (watering and/or fertilizing due today or overdue)
  const todayTasks: Task[] = plants
    .flatMap((plant) => {
      const waterDue = getNextWateringDate(plant);
      const fertDue = getNextFertilizingDate(plant);
      const cutoff = today.getTime() + 86400000 - 1;
      const tasks: Task[] = [];
      if (waterDue.getTime() <= cutoff) {
        tasks.push({ plant, action: 'Water', dueDate: waterDue });
      }
      if (fertDue.getTime() <= cutoff) {
        tasks.push({ plant, action: 'Fertilize', dueDate: fertDue });
      }
      return tasks;
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  // Upcoming: next 5 due actions after today (watering or fertilizing)
  const upcoming: Task[] = plants
    .flatMap((plant) => {
      const waterDue = getNextWateringDate(plant);
      const fertDue = getNextFertilizingDate(plant);
      const cutoff = today.getTime() + 86400000 - 1;
      const actions: Task[] = [];
      if (waterDue.getTime() > cutoff) {
        actions.push({ plant, action: 'Water', dueDate: waterDue });
      }
      if (fertDue.getTime() > cutoff) {
        actions.push({ plant, action: 'Fertilize', dueDate: fertDue });
      }
      return actions;
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  // Most recently added plants for the preview
  const recentPlants = [...plants]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, PREVIEW_COUNT);

  const previewCardWidth = (windowWidth - 16 * 2 - 12 * (PREVIEW_COUNT - 1)) / PREVIEW_COUNT;

  const handleMarkWatered = async (plant: Plant) => {
    await markWatered(plant.id);
    setPlants(await getPlants());
  };

  const handleMarkFertilized = async (plant: Plant) => {
    await markFertilized(plant.id);
    setPlants(await getPlants());
  };

  // TEMPORARY dev helpers: backdate a plant's lastWatered to test due/overdue states.
  const simulateDue = async (extraDaysOverdue: number) => {
    if (plants.length === 0) return;
    const plant = plants[plants.length - 1];
    const interval = getWateringIntervalDays(plant.wateringFrequency);
    const backdated = new Date();
    backdated.setDate(backdated.getDate() - interval - extraDaysOverdue);
    await updatePlant({ ...plant, lastWatered: backdated.toISOString() });
    setPlants(await getPlants());
  };

  // TEMPORARY dev helper: makes a plant that is NOT already due become due today.
  const simulateAnotherDue = async () => {
    const notDue = plants.find((plant) => getDaysOverdue(plant) <= 0);
    if (!notDue) return;
    const interval = getWateringIntervalDays(notDue.wateringFrequency);
    const backdated = new Date();
    backdated.setDate(backdated.getDate() - interval);
    await updatePlant({ ...notDue, lastWatered: backdated.toISOString() });
    setPlants(await getPlants());
  };

  // TEMPORARY dev helpers: backdate a plant's lastFertilized to test fertilizing due/overdue states.
  const simulateFertilizeDue = async (extraDaysOverdue: number) => {
    if (plants.length === 0) return;
    const plant = plants[plants.length - 1];
    const interval = getFertilizingIntervalDays(plant.fertilizingFrequency);
    const backdated = new Date();
    backdated.setDate(backdated.getDate() - interval - extraDaysOverdue);
    await updatePlant({ ...plant, lastFertilized: backdated.toISOString() });
    setPlants(await getPlants());
  };

  // TEMPORARY dev helper: makes a plant that is NOT already fertilizing-due become due today.
  const simulateAnotherFertilizeDue = async () => {
    const notDue = plants.find((plant) => getFertilizingDaysOverdue(plant) <= 0);
    if (!notDue) return;
    const interval = getFertilizingIntervalDays(notDue.fertilizingFrequency);
    const backdated = new Date();
    backdated.setDate(backdated.getDate() - interval);
    await updatePlant({ ...notDue, lastFertilized: backdated.toISOString() });
    setPlants(await getPlants());
  };

  const handleAddPlant = () => {
    router.push('/add-plant');
  };

  // Empty state
  if (plants.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyTitle}>No plants yet</Text>
          <Text style={styles.emptySubtitle}>
            Start building your garden by adding your first plant.
          </Text>
          <Pressable style={styles.emptyAddButton} onPress={handleAddPlant}>
            <Ionicons name="add" size={20} color={Colors.navYellow} />
            <Text style={styles.emptyAddButtonText}>Add Plant</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Text style={styles.greeting}>
          {getGreeting()} <Text style={styles.greetingEmoji}>🌱</Text>
        </Text>
        <Text style={styles.greetingSubtitle}>
          You have {plants.length} plant{plants.length > 1 ? 's' : ''} in your garden.
        </Text>

        {/* Water today card */}
        <View style={styles.waterCard}>
          <View style={styles.waterCardLeft}>
            <Ionicons name="water" size={24} color={Colors.navGreen} />
            <View style={styles.waterCardText}>
              <Text style={styles.waterCardTitle}>
                Water today{dueToday.length > 0 ? ` — ${dueToday.length}` : ''}
              </Text>
              <Text style={styles.waterCardSubtitle}>
                {waterOverdueCount > 0 && (
                  <Text style={styles.overdueCountText}>
                    {waterOverdueCount} plant{waterOverdueCount > 1 ? 's are' : ' is'} overdue!
                    {'\n'}
                  </Text>
                )}
                {waterDueTodayCount > 0
                  ? `${waterDueTodayCount} plant${waterDueTodayCount > 1 ? 's' : ''} due today.`
                  : waterOverdueCount === 0
                    ? 'Nothing to water right now'
                    : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Fertilize today card */}
        <View style={styles.waterCard}>
          <View style={styles.waterCardLeft}>
            <Ionicons name="leaf" size={24} color={Colors.navGreen} />
            <View style={styles.waterCardText}>
              <Text style={styles.waterCardTitle}>
                Fertilize today{dueTodayFertilizing.length > 0 ? ` — ${dueTodayFertilizing.length}` : ''}
              </Text>
              <Text style={styles.waterCardSubtitle}>
                {fertOverdueCount > 0 && (
                  <Text style={styles.overdueCountText}>
                    {fertOverdueCount} plant{fertOverdueCount > 1 ? 's are' : ' is'} overdue!
                    {'\n'}
                  </Text>
                )}
                {fertDueTodayCount > 0
                  ? `${fertDueTodayCount} plant${fertDueTodayCount > 1 ? 's' : ''} due today.`
                  : fertOverdueCount === 0
                    ? 'Nothing to fertilize right now'
                    : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Today's Tasks (watering + fertilizing combined) */}
        {todayTasks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <View style={styles.taskList}>
              {todayTasks.map((task) => {
                const overdueDays =
                  task.action === 'Water'
                    ? getDaysOverdue(task.plant)
                    : getFertilizingDaysOverdue(task.plant);
                return (
                  <View key={`${task.plant.id}-${task.action}`} style={styles.taskCard}>
                    <Image source={{ uri: task.plant.imageUri }} style={styles.taskImage} />
                    <View style={styles.taskInfo}>
                      <Text style={styles.taskName} numberOfLines={1}>
                        {task.plant.name}
                      </Text>
                      <View style={styles.taskMetaRow}>
                        <Text style={styles.taskAction}>{task.action}</Text>
                        {overdueDays > 0 && (
                          <View style={styles.overdueBadge}>
                            <Ionicons name="warning" size={11} color="#ffffff" />
                            <Text style={styles.overdueBadgeText}>{overdueDays}d overdue</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Pressable
                      style={styles.doneButton}
                      onPress={() =>
                        task.action === 'Water'
                          ? handleMarkWatered(task.plant)
                          : handleMarkFertilized(task.plant)
                      }
                    >
                      <Ionicons name="checkmark" size={16} color={Colors.navYellow} />
                      <Text style={styles.doneButtonText}>Done</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <View style={styles.upcomingList}>
              {upcoming.map((task) => (
                <PlantListCard
                  key={`${task.plant.id}-${task.action}`}
                  plant={task.plant}
                  action={task.action}
                  dueDate={task.dueDate}
                  overdueDays={0}
                  onPress={() => router.push(`/edit-plant?id=${task.plant.id}`)}
                />
              ))}
              <Pressable onPress={() => router.push('/tabs/schedule')}>
                <Text style={styles.seeScheduleLink}>See schedule →</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Your Plants preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Plants</Text>
          <Pressable onPress={() => router.push('/tabs/plants')}>
            <Text style={styles.seeAllLink}>See all →</Text>
          </Pressable>
        </View>
        <View style={styles.previewRow}>
          {recentPlants.map((plant) => (
            <Pressable
              key={plant.id}
              style={[styles.previewCard, { width: previewCardWidth }]}
              onPress={() => router.push(`/edit-plant?id=${plant.id}`)}
            >
              <Image source={{ uri: plant.imageUri }} style={styles.previewImage} />
              <Text style={styles.previewName} numberOfLines={1}>
                {plant.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* TEMPORARY dev helpers. */}
        <View style={styles.debugRow}>
          <Pressable style={styles.debugButton} onPress={() => simulateDue(0)}>
            <Text style={styles.debugButtonText}>
              DEV: Make "{plants[plants.length - 1]?.name}" due today
            </Text>
          </Pressable>
          <Pressable style={styles.debugButton} onPress={() => simulateDue(3)}>
            <Text style={styles.debugButtonText}>
              DEV: Make "{plants[plants.length - 1]?.name}" 3 days overdue
            </Text>
          </Pressable>
          <Pressable style={styles.debugButton} onPress={simulateAnotherDue}>
            <Text style={styles.debugButtonText}>DEV: Make another plant due today</Text>
          </Pressable>
          <Pressable style={styles.debugButton} onPress={() => simulateFertilizeDue(0)}>
            <Text style={styles.debugButtonText}>
              DEV: Make "{plants[plants.length - 1]?.name}" need fertilizing today
            </Text>
          </Pressable>
          <Pressable style={styles.debugButton} onPress={() => simulateFertilizeDue(3)}>
            <Text style={styles.debugButtonText}>
              DEV: Make "{plants[plants.length - 1]?.name}" 3 days fertilizing-overdue
            </Text>
          </Pressable>
          <Pressable style={styles.debugButton} onPress={simulateAnotherFertilizeDue}>
            <Text style={styles.debugButtonText}>DEV: Make another plant need fertilizing today</Text>
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
  scrollContent: {
    paddingBottom: 32,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navGreen,
    marginTop: 16,
    fontFamily: Fonts.title,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.navGreen,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: Fonts.body,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.navGreen,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 24,
  },
  emptyAddButtonText: {
    color: Colors.navYellow,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.body,
  },

  // Greeting
  greeting: {
    fontSize: 26,
    color: Colors.navGreen,
    fontFamily: Fonts.title,
    paddingHorizontal: 16,
  },
  greetingEmoji: {
    fontSize: 22,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: Colors.navGreen,
    fontFamily: Fonts.body,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  overdueCountText: {
    color: Colors.errorRed,
    fontWeight: '700',
  },

  // Water today card
  waterCard: {
    backgroundColor: Colors.bgYellow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.navGreen,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
  },
  waterCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waterCardText: {
    flex: 1,
  },
  waterCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.title,
  },
  waterCardSubtitle: {
    fontSize: 13,
    color: Colors.navGreen,
    fontFamily: Fonts.body,
    marginTop: 2,
  },

  // Sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.title,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },

  // Today's tasks
  taskList: {
    gap: 8,
    paddingHorizontal: 16,
  },
  taskCard: {
    backgroundColor: Colors.bgYellow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.navGreen,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: Colors.bgYellow,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.title,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  taskAction: {
    fontSize: 12,
    color: '#000',
    fontFamily: Fonts.body,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.errorRed,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  overdueBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Fonts.body,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.navGreen,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  doneButtonText: {
    color: Colors.navYellow,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Fonts.body,
  },

  // Upcoming
  upcomingList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  seeScheduleLink: {
    fontSize: 13,
    color: Colors.navGreen,
    fontWeight: '600',
    fontFamily: Fonts.body,
    marginTop: 4,
  },
  
  // Your Plants preview
  seeAllLink: {
    fontSize: 13,
    color: Colors.navGreen,
    fontWeight: '600',
    fontFamily: Fonts.body,
    paddingHorizontal: 16,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  previewCard: {
    backgroundColor: Colors.bgYellow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.navGreen,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 80,
    backgroundColor: Colors.bgYellow,
  },
  previewName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.title,
    padding: 8,
  },

  // TEMPORARY dev helper styles. Remove before release.
  debugRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  debugButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999999',
  },
  debugButtonText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: Fonts.body,
  },
});
