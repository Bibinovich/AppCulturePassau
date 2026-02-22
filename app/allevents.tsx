import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { EVENTS, CATEGORIES } from '@/lib/data';

export default function AllEventsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = selectedCategory === 'All'
    ? EVENTS
    : EVENTS.filter(e => e.category === selectedCategory);

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>All Events</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {['All', ...CATEGORIES].map(cat => (
          <Pressable
            key={cat}
            onPress={() => { Haptics.selectionAsync(); setSelectedCategory(cat); }}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60, gap: 14 }}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No events in this category</Text>
          </View>
        ) : (
          filtered.map(event => (
            <Pressable
              key={event.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: '/event/[id]', params: { id: event.id } });
              }}
              style={styles.card}
            >
              <Image source={{ uri: event.imageUrl }} style={styles.cardImage} contentFit="cover" />
              <View style={styles.cardInfo}>
                <View style={styles.catRow}>
                  <View style={[styles.catDot, { backgroundColor: getCatColor(event.category) }]} />
                  <Text style={styles.catLabel}>{event.category}</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
                <Text style={styles.cardDate}>
                  {new Date(event.date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} {event.time}
                </Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardCity}>{event.city}</Text>
                  <Text style={styles.cardPrice}>{event.price === 0 ? 'Free' : `$${event.price}`}</Text>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function getCatColor(cat: string): string {
  const map: Record<string, string> = {
    Music: '#6C5CE7', Dance: '#E84393', Food: '#E17055', Film: '#0984E3',
    Arts: '#00B894', Festival: '#FDCB6E', Theatre: '#A29BFE', Literature: '#55A3A4',
  };
  return map[cat] || Colors.primary;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: Colors.text },
  categoryList: { paddingHorizontal: 24, gap: 8, marginBottom: 16, height: 44 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.borderLight },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: Colors.textTertiary },
  card: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardImage: { width: 110, height: 120 },
  cardInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catLabel: { fontFamily: 'Poppins_500Medium', fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase' },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: Colors.text, marginBottom: 4 },
  cardDate: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: Colors.textTertiary, marginBottom: 6 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCity: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: Colors.secondary },
  cardPrice: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: Colors.primary },
});
