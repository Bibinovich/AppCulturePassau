import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/query-client';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Perk {
  id: string;
  title: string;
  description: string | null;
  perkType: string;
  discountPercent: number | null;
  discountFixedCents: number | null;
  providerType: string | null;
  providerId: string | null;
  providerName: string | null;
  category: string | null;
  isMembershipRequired: boolean | null;
  requiredMembershipTier: string | null;
  usageLimit: number | null;
  usedCount: number | null;
  perUserLimit: number | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
}

function useDemoUserId() {
  const { data } = useQuery<{ id: string }[]>({ queryKey: ['/api/users'] });
  return data?.[0]?.id;
}

const PERK_TYPE_INFO: Record<string, { icon: string; color: string; label: string }> = {
  discount_percent: { icon: 'pricetag', color: '#E85D3A', label: '% Off' },
  discount_fixed: { icon: 'cash', color: '#1A7A6D', label: '$ Off' },
  free_ticket: { icon: 'ticket', color: '#9B59B6', label: 'Free' },
  early_access: { icon: 'time', color: '#3498DB', label: 'Early' },
  vip_upgrade: { icon: 'star', color: '#F2A93B', label: 'VIP' },
  cashback: { icon: 'wallet', color: '#34C759', label: 'Cash' },
};

const CATEGORIES = ['All', 'tickets', 'events', 'dining', 'shopping', 'wallet'];

export default function PerksScreen() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;
  const userId = useDemoUserId();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: perks = [], isLoading } = useQuery<Perk[]>({ queryKey: ['/api/perks'] });
  const { data: membership } = useQuery<{ tier: string }>({
    queryKey: ['/api/membership', userId],
    enabled: !!userId,
  });

  const redeemMutation = useMutation({
    mutationFn: async (perkId: string) => {
      const res = await apiRequest('POST', `/api/perks/${perkId}/redeem`, { userId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/perks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/redemptions'] });
      Alert.alert('Redeemed!', 'Perk has been added to your account.');
    },
    onError: (err: Error) => {
      Alert.alert('Cannot Redeem', err.message);
    },
  });

  const filteredPerks = selectedCategory === 'All'
    ? perks
    : perks.filter(p => p.category === selectedCategory);

  const formatValue = (perk: Perk) => {
    if (perk.perkType === 'discount_percent') return `${perk.discountPercent}% Off`;
    if (perk.perkType === 'discount_fixed') return `$${(perk.discountFixedCents || 0) / 100} Off`;
    if (perk.perkType === 'free_ticket') return 'Free';
    if (perk.perkType === 'early_access') return '48h Early';
    if (perk.perkType === 'vip_upgrade') return 'VIP';
    if (perk.perkType === 'cashback') return `$${(perk.discountFixedCents || 0) / 100}`;
    return '';
  };

  const canRedeem = (perk: Perk) => {
    if (perk.isMembershipRequired && membership?.tier === 'free') return false;
    if (perk.usageLimit && (perk.usedCount || 0) >= perk.usageLimit) return false;
    return true;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Perks & Benefits</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
        {CATEGORIES.map(cat => (
          <Pressable key={cat} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedCategory(cat); }}
            style={[styles.catPill, selectedCategory === cat && styles.catPillActive]}>
            <Text style={[styles.catPillText, selectedCategory === cat && styles.catPillTextActive]}>
              {cat === 'All' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 + (Platform.OS === 'web' ? 34 : insets.bottom) }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>Loading perks...</Text>
          </View>
        ) : filteredPerks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="gift-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No perks available in this category</Text>
          </View>
        ) : (
          filteredPerks.map((perk, i) => {
            const typeInfo = PERK_TYPE_INFO[perk.perkType] || PERK_TYPE_INFO.discount_percent;
            const redeemable = canRedeem(perk);
            return (
              <Animated.View key={perk.id} entering={FadeInDown.delay(i * 80).duration(400)}>
                <View style={styles.perkCard}>
                  <View style={styles.perkTop}>
                    <View style={[styles.perkBadge, { backgroundColor: typeInfo.color + '15' }]}>
                      <Ionicons name={typeInfo.icon as any} size={22} color={typeInfo.color} />
                    </View>
                    <View style={styles.perkInfo}>
                      <Text style={styles.perkTitle} numberOfLines={2}>{perk.title}</Text>
                      <Text style={styles.perkProvider}>{perk.providerName || 'CulturePass'}</Text>
                    </View>
                    <View style={[styles.perkValue, { backgroundColor: typeInfo.color + '15' }]}>
                      <Text style={[styles.perkValueText, { color: typeInfo.color }]}>{formatValue(perk)}</Text>
                    </View>
                  </View>

                  {perk.description && <Text style={styles.perkDesc} numberOfLines={2}>{perk.description}</Text>}

                  <View style={styles.perkMeta}>
                    {perk.isMembershipRequired && (
                      <View style={styles.metaTag}>
                        <Ionicons name="diamond" size={12} color="#9B59B6" />
                        <Text style={styles.metaTagText}>{perk.requiredMembershipTier || 'Premium'} Only</Text>
                      </View>
                    )}
                    {perk.usageLimit && (
                      <View style={styles.metaTag}>
                        <Ionicons name="people" size={12} color={Colors.textSecondary} />
                        <Text style={styles.metaTagText}>{(perk.usageLimit - (perk.usedCount || 0))} left</Text>
                      </View>
                    )}
                    {perk.endDate && (
                      <View style={styles.metaTag}>
                        <Ionicons name="calendar" size={12} color={Colors.textSecondary} />
                        <Text style={styles.metaTagText}>Ends {new Date(perk.endDate).toLocaleDateString()}</Text>
                      </View>
                    )}
                  </View>

                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); redeemMutation.mutate(perk.id); }}
                    disabled={!redeemable || redeemMutation.isPending}
                    style={[styles.redeemBtn, !redeemable && styles.redeemBtnDisabled]}>
                    <Ionicons name={redeemable ? 'gift' : 'lock-closed'} size={16} color={redeemable ? '#FFF' : Colors.textTertiary} />
                    <Text style={[styles.redeemBtnText, !redeemable && styles.redeemBtnTextDisabled]}>
                      {!redeemable ? (perk.isMembershipRequired ? 'Upgrade to Unlock' : 'Fully Redeemed') : 'Redeem Now'}
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  catRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 16 },
  catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  catPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catPillText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary },
  catPillTextActive: { color: '#FFF' },
  list: { flex: 1, paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  perkCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 12 },
  perkTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  perkBadge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  perkInfo: { flex: 1 },
  perkTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  perkProvider: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  perkValue: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  perkValueText: { fontSize: 13, fontFamily: 'Poppins_700Bold' },
  perkDesc: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  perkMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  metaTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.backgroundSecondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaTagText: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  redeemBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12 },
  redeemBtnDisabled: { backgroundColor: Colors.backgroundSecondary },
  redeemBtnText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  redeemBtnTextDisabled: { color: Colors.textTertiary },
});
