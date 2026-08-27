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
  getNextWateringDate,
  getWateringIntervalDays,
  updatePlant,
  Plant,
} from '@/utils/plantStorage';

const PREVIEW_COUNT = 3;

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Herb: 'leaf',
  Flower: 'flower',
  Fruit: 'nutrition',
};

function getPlantTypeIcon(plant: Plant): keyof typeof Ionicons.glyphMap {
  return (plant.types.length > 0 && TYPE_ICONS[plant.types[0]]) || 'leaf';
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Whole days between the due date and today (positive = overdue)
function getDaysOverdue(plant: Plant): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = getNextWateringDate(plant);
  due.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - due.getTime()) / 86400000);
}

function formatDueDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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

  // Plants due today or overdue
  const dueToday = plants
    .filter((plant) => getNextWateringDate(plant).getTime() <= today.getTime() + 86400000 - 1)
    .sort(
      (a, b) => getNextWateringDate(a).getTime() - getNextWateringDate(b).getTime()
    );

  // Overdue = due date already passed
  const overdueCount = plants.filter((plant) => getDaysOverdue(plant) > 0).length;
  const dueTodayCount = dueToday.length - overdueCount;

  // Upcoming: next 5 due after today
  const upcoming = plants
    .filter((plant) => getNextWateringDate(plant).getTime() > today.getTime() + 86400000 - 1)
    .sort(
      (a, b) => getNextWateringDate(a).getTime() - getNextWateringDate(b).getTime()
    )
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
          {overdueCount > 0 && (
            <Text style={styles.greetingHighlight}>
              {overdueCount} plant{overdueCount > 1 ? 's are' : ' is'} overdue!
              {dueTodayCount > 0 ? '\n' : ''}
            </Text>
          )}
          {dueTodayCount > 0
            ? `You have ${dueTodayCount} plant${dueTodayCount > 1 ? 's' : ''} due today.`
            : overdueCount === 0
              ? 'All your plants are happy today!'
              : ''}
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
                {dueToday.length > 0
                  ? `${dueToday.length} plant${dueToday.length > 1 ? 's' : ''} need${dueToday.length > 1 ? '' : 's'} watering`
                  : 'Nothing to water right now'}
              </Text>
            </View>
          </View>
        </View>

        {/* Today's Tasks */}
        {dueToday.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <View style={styles.taskList}>
              {dueToday.map((plant) => (
                <View key={plant.id} style={styles.taskCard}>
                  <Image source={{ uri: plant.imageUri }} style={styles.taskImage} />
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskName} numberOfLines={1}>
                      {plant.name}
                    </Text>
                    <View style={styles.taskMetaRow}>
                      <Text style={styles.taskAction}>Water</Text>
                      {getDaysOverdue(plant) > 0 && (
                        <View style={styles.overdueBadge}>
                          <Ionicons name="warning" size={11} color="#ffffff" />
                          <Text style={styles.overdueBadgeText}>
                            {getDaysOverdue(plant)}d overdue
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Pressable
                    style={styles.doneButton}
                    onPress={() => handleMarkWatered(plant)}
                  >
                    <Ionicons name="checkmark" size={16} color={Colors.navYellow} />
                    <Text style={styles.doneButtonText}>Done</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <View style={styles.upcomingCard}>
              {upcoming.map((plant, index) => {
                const dueDate = getNextWateringDate(plant);
                const showDateHeader =
                  index === 0 ||
                  formatDueDate(getNextWateringDate(upcoming[index - 1])) !==
                    formatDueDate(dueDate);

                return (
                  <View key={plant.id}>
                    {showDateHeader && (
                      <Text style={styles.upcomingDate}>{formatDueDate(dueDate)}</Text>
                    )}
                    <View style={styles.upcomingRow}>
                      <Ionicons
                        name={getPlantTypeIcon(plant)}
                        size={16}
                        color={Colors.navGreen}
                      />
                      <Text style={styles.upcomingPlantName} numberOfLines={1}>
                        {plant.name}
                      </Text>
                      <Text style={styles.upcomingAction}>Water</Text>
                    </View>
                  </View>
                );
              })}
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

        {/* TEMPORARY dev helpers for testing "Water today". Remove before release. */}
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
  greetingHighlight: {
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
  upcomingCard: {
    backgroundColor: Colors.bgYellow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.navGreen,
    padding: 16,
    marginHorizontal: 16,
  },
  upcomingDate: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.body,
    marginTop: 8,
    marginBottom: 4,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  upcomingPlantName: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontFamily: Fonts.body,
  },
  upcomingAction: {
    fontSize: 13,
    color: Colors.navGreen,
    fontWeight: '600',
    fontFamily: Fonts.body,
  },
  seeScheduleLink: {
    fontSize: 13,
    color: Colors.navGreen,
    fontWeight: '600',
    fontFamily: Fonts.body,
    marginTop: 12,
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
