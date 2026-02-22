import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export interface FilterItem {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  count?: number;
}

interface FilterChipProps {
  item: FilterItem;
  isActive: boolean;
  onPress: () => void;
  size?: 'small' | 'medium';
}

export function FilterChip({ item, isActive, onPress, size = 'medium' }: FilterChipProps) {
  const accentColor = item.color || Colors.primary;
  const isSmall = size === 'small';

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        isSmall && styles.chipSmall,
        isActive && { backgroundColor: accentColor, borderColor: accentColor },
        pressed && !isActive && styles.chipPressed,
        isActive && styles.chipActiveShadow,
      ]}
    >
      {item.icon ? (
        <View
          style={[
            styles.iconWrap,
            isSmall && styles.iconWrapSmall,
            isActive
              ? { backgroundColor: 'rgba(255,255,255,0.22)' }
              : { backgroundColor: accentColor + '12' },
          ]}
        >
          <Ionicons
            name={item.icon as any}
            size={isSmall ? 14 : 16}
            color={isActive ? '#FFF' : accentColor}
          />
        </View>
      ) : null}
      <Text
        style={[
          styles.label,
          isSmall && styles.labelSmall,
          isActive && styles.labelActive,
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      {item.count != null && item.count > 0 ? (
        <View
          style={[
            styles.badge,
            isActive && styles.badgeActive,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isActive && styles.badgeTextActive,
            ]}
          >
            {item.count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

interface FilterChipRowProps {
  items: FilterItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  size?: 'small' | 'medium';
}

export function FilterChipRow({ items, selectedId, onSelect, size = 'medium' }: FilterChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={{ flexGrow: 0 }}
    >
      {items.map(item => (
        <FilterChip
          key={item.id}
          item={item}
          isActive={selectedId === item.id}
          onPress={() => onSelect(item.id)}
          size={size}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  chipSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 5,
  },
  chipPressed: {
    backgroundColor: Colors.backgroundSecondary,
    transform: [{ scale: 0.97 }],
  },
  chipActiveShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSmall: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  labelSmall: {
    fontSize: 12,
  },
  labelActive: {
    color: '#FFF',
  },
  badge: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textSecondary,
  },
  badgeTextActive: {
    color: '#FFF',
  },
});
