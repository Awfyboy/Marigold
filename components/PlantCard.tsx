import { StyleSheet, View, Text, Image, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Herb: 'leaf',
  Flower: 'flower',
  Fruit: 'nutrition',
};

type Props = {
  imageUri: string;
  name: string;
  location: string;
  types: string[];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function PlantCard({ imageUri, name, location, types, onPress, style }: Props) {
  return (
    <Pressable style={[styles.card, style]} onPress={onPress}>
      {/* Header image */}
      <Image source={{ uri: imageUri }} style={styles.image} />

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location" size={14} color={Colors.navGreen} />
          <Text style={styles.metaText} numberOfLines={1}>
            {location}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons
            name={(types.length > 0 && TYPE_ICONS[types[0]]) || 'leaf'}
            size={14}
            color={Colors.navGreen}
          />
          <Text style={styles.metaText} numberOfLines={1}>
            {types.join(', ')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.navGreen,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 110,
    backgroundColor: Colors.bgYellow,
  },
  details: {
    padding: 10,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.title,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#000',
    flexShrink: 1,
    fontFamily: Fonts.body,
  },
});