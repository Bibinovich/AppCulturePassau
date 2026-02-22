import { View, Text, Pressable, StyleSheet, ScrollView, Platform, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sampleBusinesses, businessCategories } from '@/data/mockData';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

function CategoryChip({ cat, isActive, onPress }: {
  cat: { label: string; icon: string; color: string };
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.categoryChip,
        isActive && { backgroundColor: cat.color, borderColor: cat.color, shadowColor: cat.color, shadowOpacity: 0.3 },
      ]}
      onPress={onPress}
    >
      <View style={[
        styles.categoryIconWrap,
        isActive
          ? { backgroundColor: 'rgba(255,255,255,0.25)' }
          : { backgroundColor: cat.color + '12' },
      ]}>
        <Ionicons
          name={cat.icon as any}
          size={18}
          color={isActive ? '#FFF' : cat.color}
        />
      </View>
      <Text style={[
        styles.categoryText,
        isActive && styles.categoryTextActive,
      ]}>{cat.label}</Text>
    </Pressable>
  );
}

function BusinessCard({ business, index }: { business: typeof sampleBusinesses[0]; index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: '/business/[id]', params: { id: business.id } })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.businessIcon, { backgroundColor: business.color + '15' }]}>
            <Ionicons name={business.icon as any} size={26} color={business.color} />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.cardName} numberOfLines={1}>{business.name}</Text>
              {business.isVerified && (
                <View style={styles.verifiedIcon}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
                </View>
              )}
            </View>
            <Text style={styles.cardCategory}>{business.category}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.ratingText}>{business.rating}</Text>
          </View>
        </View>

        <Text style={styles.cardDesc} numberOfLines={2}>{business.description}</Text>

        <View style={styles.serviceRow}>
          {business.services.slice(0, 3).map(service => (
            <View key={service} style={styles.servicePill}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
          {business.services.length > 3 && (
            <Text style={styles.moreServices}>+{business.services.length - 3}</Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.locationText}>{business.location}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceRange}>{business.priceRange}</Text>
            <Text style={styles.reviewCount}>{business.reviews} reviews</Text>
          </View>
        </View>

        <View style={styles.cardAction}>
          <Ionicons name="arrow-forward-circle" size={22} color={Colors.primary} />
          <Text style={styles.cardActionText}>View Details</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function DirectoryScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let results = sampleBusinesses;
    if (selectedCategory !== 'All') {
      results = results.filter(b => b.category === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );
    }
    return results;
  }, [selectedCategory, search]);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Business Directory</Text>
        <Text style={styles.subtitle}>Find trusted cultural businesses and services</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.categoryHeading}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {businessCategories.map(cat => (
            <CategoryChip
              key={cat.label}
              cat={cat}
              isActive={selectedCategory === cat.label}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory(cat.label);
              }}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        <Text style={styles.resultCount}>
          {filtered.length} {filtered.length === 1 ? 'business' : 'businesses'} found
        </Text>
        {filtered.map((business, index) => (
          <BusinessCard key={business.id} business={business} index={index} />
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={52} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No businesses found</Text>
            <Text style={styles.emptySubtext}>Try a different category or search term</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    padding: 0,
  },
  categorySection: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  categoryHeading: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  categoryRow: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 14,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  categoryTextActive: { color: '#FFF' },
  resultCount: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  businessIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  cardName: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    flexShrink: 1,
  },
  cardCategory: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: Colors.accent,
  },
  cardDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  serviceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  servicePill: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  serviceText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  moreServices: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceRange: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: Colors.secondary,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  cardActionText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
});
