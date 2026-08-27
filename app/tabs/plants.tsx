import { StyleSheet, Text, View, ScrollView, FlatList } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import IconButton from '@/components/IconButton';
import SearchBar from '@/components/SearchBar';
import BasicButton from '@/components/BasicButton';
import PlantCard from '@/components/PlantCard';
import { getPlants, Plant } from '@/utils/plantStorage';

const FILTER_OPTIONS = [
  { label: 'All', icon: 'grid' as const },
  { label: 'Herb', icon: 'leaf' as const },
  { label: 'Flower', icon: 'flower' as const },
  { label: 'Fruit', icon: 'nutrition' as const },
];

export default function PlantsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [plants, setPlants] = useState<Plant[]>([]);

  // Reload plants every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      getPlants().then(setPlants);
    }, [])
  );

  const filteredPlants = plants.filter((plant) => {
    const matchesSearch = plant.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === 'All' || plant.types.includes(selectedFilter);
    return matchesSearch && matchesFilter;
  });

  const handleAddPlant = () => {
    router.push('/add-plant');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Plants</Text>
        <IconButton
          icon="add"
          onPress={handleAddPlant}
          size={28}
          color={Colors.navGreen}
        />
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTER_OPTIONS.map((filter) => (
            <BasicButton
              key={filter.label}
              label={filter.label}
              icon={filter.icon}
              isSelected={selectedFilter === filter.label}
              onPress={() => setSelectedFilter(filter.label)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Plants grid */}
      {filteredPlants.length === 0 ? (
        <View style={styles.content}>
          <Text style={styles.emptyText}>No plants found</Text>
          <Text style={styles.emptySubtext}>
            Tap "Add Plants" to add your first plant
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlants}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) => (
            <PlantCard
              imageUri={item.imageUri}
              name={item.name}
              location={item.location}
              types={item.types}
            />
          )}
        />
      )}
    </View>
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
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 26,
    color: Colors.navGreen,
    fontFamily: Fonts.title,
  },

  filtersWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },

  filtersContainer: {
    flexGrow: 0,
    height: 38,
  },

  filtersContent: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.navGreen,
    fontFamily: Fonts.body,
  },

  emptySubtext: {
    fontSize: 12,
    color: Colors.navGreen,
    marginTop: 4,
    fontFamily: Fonts.body,
  },

  gridContent: {
    padding: 16,
    gap: 12,
  },

  row: {
    gap: 12,
  },
});