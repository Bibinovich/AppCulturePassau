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
import { sampleEvents } from '@/data/mockData';

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

function getEventsByDate(dateKey: string) {
  return sampleEvents.filter(e => e.date === dateKey);
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

  const selectedEvents = selectedDate ? getEventsByDate(selectedDate) : [];

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

  const eventsThisMonth = useMemo(() => {
    return sampleEvents.filter(e => {
      const [y, m] = e.date.split('-').map(Number);
      return y === currentYear && m === currentMonth + 1;
    });
  }, [currentMonth, currentYear]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSub}>Find events by date</Text>

        <View style={styles.calendarCard}>
          <View style={styles.monthNav}>
            <Pressable onPress={prevMonth} hitSlop={12} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.text} />
            </Pressable>
            <Text style={styles.monthText}>{MONTHS[currentMonth]} {currentYear}</Text>
            <Pressable onPress={nextMonth} hitSlop={12} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={22} color={Colors.text} />
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
                  ]}>{day}</Text>
                  {hasEvent && (
                    <View style={[styles.eventDot, isSelected && styles.eventDotSelected]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {selectedDate && selectedEvents.length > 0 && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsSectionTitle}>
              {selectedEvents.length} event{selectedEvents.length > 1 ? 's' : ''} on this day
            </Text>
            {selectedEvents.map(event => (
              <Pressable
                key={event.id}
                style={styles.eventRow}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <Image
                  source={{ uri: event.imageUrl }}
                  style={styles.eventRowImage}
                  contentFit="cover"
                />
                <View style={styles.eventRowInfo}>
                  <Text style={styles.eventRowTitle} numberOfLines={1}>{event.title}</Text>
                  <Text style={styles.eventRowTime}>{event.time}</Text>
                  <Text style={styles.eventRowVenue} numberOfLines={1}>{event.venue}</Text>
                </View>
                <View style={styles.eventRowPrice}>
                  <Text style={styles.eventRowPriceText}>{event.priceLabel}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {selectedDate && selectedEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No events on this date</Text>
            <Text style={styles.emptySubtext}>Try selecting another day with a dot</Text>
          </View>
        )}

        {!selectedDate && eventsThisMonth.length > 0 && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsSectionTitle}>
              {eventsThisMonth.length} event{eventsThisMonth.length > 1 ? 's' : ''} this month
            </Text>
            {eventsThisMonth.map(event => (
              <Pressable
                key={event.id}
                style={styles.eventRow}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <Image
                  source={{ uri: event.imageUrl }}
                  style={styles.eventRowImage}
                  contentFit="cover"
                />
                <View style={styles.eventRowInfo}>
                  <Text style={styles.eventRowTitle} numberOfLines={1}>{event.title}</Text>
                  <Text style={styles.eventRowTime}>{event.date} · {event.time}</Text>
                  <Text style={styles.eventRowVenue} numberOfLines={1}>{event.venue}</Text>
                </View>
                <View style={styles.eventRowPrice}>
                  <Text style={styles.eventRowPriceText}>{event.priceLabel}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {!selectedDate && eventsThisMonth.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No events this month</Text>
            <Text style={styles.emptySubtext}>Use the arrows to browse other months</Text>
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
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: Colors.text,
    marginTop: 12,
  },
  headerSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: Colors.textTertiary,
    marginBottom: 16,
  },
  calendarCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    ...Colors.shadow.medium,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: Colors.text,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: Colors.textTertiary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%' as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  dayCellToday: {
    backgroundColor: Colors.primaryGlow,
    borderRadius: 20,
  },
  dayText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: Colors.text,
  },
  dayTextSelected: {
    color: '#FFF',
    fontFamily: 'Poppins_700Bold',
  },
  dayTextToday: {
    color: Colors.primary,
    fontFamily: 'Poppins_700Bold',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
  eventDotSelected: {
    backgroundColor: '#FFF',
  },
  eventsSection: {
    marginTop: 20,
  },
  eventsSectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    ...Colors.shadow.small,
    gap: 12,
  },
  eventRowImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  eventRowInfo: {
    flex: 1,
  },
  eventRowTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: Colors.text,
  },
  eventRowTime: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  eventRowVenue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  eventRowPrice: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  eventRowPriceText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: Colors.text,
  },
  emptySubtext: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textTertiary,
  },
});
