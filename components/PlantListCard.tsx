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
  showDueDate?: boolean;
  onPress?: () => void;
  onDone?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function PlantListCard({
  plant,
  action,
  dueDate,
  overdueDays = 0,
  showDueDate = true,
  onPress,
  onDone,
  style,
}: Props) {
  const isWater = action === 'Water';
  const actionIcon = isWater ? 'water' : 'leaf';

  return (
    <Pressable style={[styles.card, style]} onPress={onPress}>
      {/* Left: image */}
      <Image source={{ uri: plant.imageUri }} style={styles.image} />

      {/* Center: name + (optional) due date / overdue badge */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {plant.name}
        </Text>
        {showDueDate && (
          <View style={styles.metaRow}>
            {overdueDays > 0 ? (
              <View style={styles.overdueBadge}>
                <Ionicons name="warning" size={10} color="#ffffff" />
                <Text style={styles.overdueBadgeText}>{overdueDays}d overdue</Text>
              </View>
            ) : (
              <Text style={styles.dueText} numberOfLines={1}>
                {formatDueDate(dueDate)}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Right: task tag pill + optional done button, on one row */}
      <View style={styles.right}>
        <View style={[styles.actionPill, { backgroundColor: isWater ? Colors.waterBlue : Colors.fertileGreen }]}>
          <Ionicons name={actionIcon} size={12} color="#ffffff" />
          <Text style={styles.actionPillText}>{action}</Text>
        </View>
        {onDone && (
          <Pressable style={styles.doneButton} onPress={onDone}>
            <Ionicons name="checkmark" size={14} color={Colors.navYellow} />
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
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
    gap: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navGreen,
    fontFamily: Fonts.title,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 10,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: Fonts.body,
  },
  dueText: {
    fontSize: 12,
    color: Colors.navGreen,
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
    gap: 3,
    backgroundColor: Colors.navGreen,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  doneButtonText: {
    color: Colors.navYellow,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Fonts.body,
  },
});