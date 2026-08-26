import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useState } from 'react';

import Colors from '@/constants/colors';
import IconButton from '@/components/IconButton';
import SearchBar from '@/components/SearchBar';
import FilterButton from '@/components/FilterButton';

const FILTER_OPTIONS = [
  { label: 'All', icon: 'grid' as const },
  { label: 'Herb', icon: 'leaf' as const },
  { label: 'Flower', icon: 'flower' as const },
  { label: 'Fruit', icon: 'nutrition' as const },
];

export default function PlantsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const handleAddPlant = () => {
    console.log('Add new plant');
  };

  return (
    <View style={styles.container}>
      {/* Add button */}
      <View style={styles.header}>
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
            <FilterButton
              key={filter.label}
              label={filter.label}
              icon={filter.icon}
              isSelected={selectedFilter === filter.label}
              onPress={() => setSelectedFilter(filter.label)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Content area */}
      <View style={styles.content}>
        <Text>Plants list will go here</Text>
      </View>
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
    alignItems: 'flex-end',
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
});
