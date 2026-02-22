import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { sampleEvents, type EventData } from '@/data/mockData';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getEventAccentColor(event: EventData): string {
  // Map event categories to accent colors
  const categoryColorMap: Record<string, string> = {
    Festivals: Colors.primary,
    'Food & Cooking': Colors.accent,
    Arts: Colors.secondary,
    Music: Colors.primaryLight,
    Sports: Colors.secondary,
    Education: Colors.primary,
    Community: Colors.secondary,
  };
  return categoryColorMap[event.category] || Colors.primary;
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    sampleEvents.forEach(e => dates.add(e.date));
    return dates;
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedEvents = selectedDate ? sampleEvents.filter(e => e.date === selectedDate) : [];

  function prevMonth() {
    Haptics.selectionAsync();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    Haptics.selectionAsync();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.headerTitle}>Calendar</Text>

        <View style={styles.calendarCard}>
          <View style={styles.monthNav}>
            <Pressable onPress={prevMonth} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.monthText}>{MONTHS[currentMonth]} {currentYear}</Text>
            <Pressable onPress={nextMonth} hitSlop={12}>
              <Ionicons name="chevron-forward" size={24} color={Colors.text} />
            </Pressable>
          </View>

          <View style={styles.dayHeaders}>
            {DAYS.map(d => (
              <Text key={d} style={styles.dayHeaderText}>{d}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((day, idx) => {
              if (day === null) return <View key={`empty-${idx}`} style={styles.dayCell} />;
              const dateKey = formatDateKey(currentYear, currentMonth, day);
              const hasEvent = eventDates.has(dateKey);
              const isSelected = selectedDate === dateKey;
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

              return (
                <Pressable
                  key={dateKey}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedDate(isSelected ? null : dateKey);
                  }}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.dayTextSelected,
                    isToday && !isSelected && styles.dayTextToday,
                  ]}>
                    {day}
                  </Text>
                  {hasEvent && (
                    <View style={[
                      styles.eventDot,
                      isSelected && styles.eventDotSelected,
                    ]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {selectedDate && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsSectionTitle}>
              Events on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })}
            </Text>
            {selectedEvents.length === 0 ? (
              <View style={styles.noEvents}>
                <Ionicons name="calendar-outline" size={48} color={Colors.primary} />
                <Text style={styles.noEventsText}>No events on this day</Text>
              </View>
            ) : (
              selectedEvents.map(event => (
                <Pressable
                  key={event.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/event/[id]', params: { id: event.id } });
                  }}
                  style={styles.eventRow}
                >
                  <View style={[styles.eventRowAccentBar, { backgroundColor: getEventAccentColor(event) }]} />
                  <View style={styles.eventRowContent}>
                    <Image source={{ uri: event.imageUrl }} style={styles.eventRowImage} contentFit="cover" />
                    <View style={styles.eventRowInfo}>
                      <Text style={styles.eventRowTitle} numberOfLines={1}>{event.title}</Text>
                      <Text style={styles.eventRowTime}>{event.time}</Text>
                      <Text style={styles.eventRowVenue} numberOfLines={1}>{event.venue}</Text>
                    </View>
                    <View style={styles.eventRowPrice}>
                      <Text style={styles.eventRowPriceText}>
                        {event.price === 0 ? 'Free' : `$${event.price}`}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        {!selectedDate && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsSectionTitle}>Upcoming Events</Text>
            {sampleEvents.slice(0, 4).map(event => (
              <Pressable
                key={event.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/event/[id]', params: { id: event.id } });
                }}
                style={styles.eventRow}
              >
                <View style={[styles.eventRowAccentBar, { backgroundColor: getEventAccentColor(event) }]} />
                <View style={styles.eventRowContent}>
                  <Image source={{ uri: event.imageUrl }} style={styles.eventRowImage} contentFit="cover" />
                  <View style={styles.eventRowInfo}>
                    <Text style={styles.eventRowTitle} numberOfLines={1}>{event.title}</Text>
                    <Text style={styles.eventRowTime}>
                      {new Date(event.date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} {event.time}
                    </Text>
                    <Text style={styles.eventRowVenue} numberOfLines={1}>{event.venue}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  calendarCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    ...Colors.shadow.medium,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
    ...Colors.shadow.medium,
    transform: [{ scale: 1.15 }],
  },
  dayCellToday: {
    backgroundColor: Colors.primaryGlow,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  dayTextSelected: {
    color: Colors.surface,
    fontWeight: '700',
  },
  dayTextToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 3,
  },
  eventDotSelected: {
    backgroundColor: Colors.surface,
  },
  eventsSection: {
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  eventsSectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 18,
  },
  noEvents: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  noEventsText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    ...Colors.shadow.small,
  },
  eventRowAccentBar: {
    width: 3,
    height: '100%',
  },
  eventRowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  eventRowImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  eventRowInfo: {
    flex: 1,
  },
  eventRowTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  eventRowTime: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
    marginTop: 3,
  },
  eventRowVenue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  eventRowPrice: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
  },
  eventRowPriceText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
