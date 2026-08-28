import { StyleSheet, View, Text, Image, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { Plant, formatDueDate } from '@/utils/plantStorage';

type Props = {
  plant: Plant;
  action: 'Water' | 'Fertilize';
  dueDate: Date;
  overdueDays?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function PlantListCard({
  plant,
  action,
  dueDate,
  overdueDays = 0,
  onPress,
  style,
}: Props) {
  const isWater = action === 'Water';
  const actionIcon = isWater ? 'water' : 'leaf';

  return (
    <Pressable style={[styles.card, style]} onPress={onPress}>
      {/* Left: image */}
      <Image source={{ uri: plant.imageUri }} style={styles.image} />

      {/* Center: name */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {plant.name}
        </Text>
      </View>

      {/* Right: task + due date */}
      <View style={styles.task}>
        <View style={styles.actionRow}>
          <Ionicons name={actionIcon} size={13} color={Colors.navGreen} />
          <Text style={styles.actionText} numberOfLines={1}>
            {action}
          </Text>
        </View>
        <Text style={[styles.dueText, overdueDays > 0 && styles.dueOverdue]} numberOfLines={1}>
          {formatDueDate(dueDate)}
        </Text>
        {overdueDays > 0 && (
          <View style={styles.overdueBadge}>
            <Ionicons name="warning" size={10} color="#ffffff" />
            <Text style={styles.overdueBadgeText}>{overdueDays}d overdue</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgYellow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.navGreen,
    overflow: 'hidden',
  },
  image: {
    width: 56,
    height: 56,
    backgroundColor: Colors.bgYellow,
  },
  info: {
    flex: 1,
    paddingHorizontal: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.title,
  },
  task: {
    alignItems: 'flex-end',
    paddingVertical: 8,
    paddingRight: 10,
    paddingLeft: 6,
    gap: 3,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.navGreen,
    fontFamily: Fonts.body,
  },
  dueText: {
    fontSize: 12,
    color: Colors.navGreen,
    fontFamily: Fonts.body,
  },
  dueOverdue: {
    color: Colors.errorRed,
    fontWeight: '700',
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
});