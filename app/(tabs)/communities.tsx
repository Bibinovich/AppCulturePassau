import { View, Text, Pressable, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaved } from '@/contexts/SavedContext';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import type { Profile } from '@shared/schema';

const TYPE_COLORS: Record<string, string> = {
  community: '#E85D3A',
  organisation: '#1A7A6D',
  venue: '#9B59B6',
  council: '#3498DB',
  government: '#2C3E50',
};

const TYPE_ICONS: Record<string, string> = {
  community: 'people',
  organisation: 'business',
  venue: 'location',
  council: 'shield-checkmark',
  government: 'flag',
};

function CommunityCard({ profile }: { profile: Profile }) {
  const { isCommunityJoined, toggleJoinCommunity } = useSaved();
  const joined = isCommunityJoined(profile.id);
  const color = TYPE_COLORS[profile.entityType] || Colors.primary;
  const icon = TYPE_ICONS[profile.entityType] || 'people';

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/profile/[id]', params: { id: profile.id } })}
    >
      <View style={styles.cardTop}>
        <View style={[styles.communityIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>{profile.name}</Text>
            {profile.isVerified && <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />}
          </View>
          <Text style={styles.cardCategory}>{profile.category || profile.entityType}</Text>
        </View>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{profile.description}</Text>
      <View style={styles.cardStats}>
        <View style={styles.stat}>
          <Ionicons name="people" size={14} color={Colors.textSecondary} />
          <Text style={styles.statText}>{formatNumber(profile.membersCount || 0)} members</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="heart" size={14} color={Colors.textSecondary} />
          <Text style={styles.statText}>{formatNumber(profile.followersCount || 0)} followers</Text>
        </View>
        {profile.rating ? (
          <View style={styles.stat}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.statText}>{profile.rating.toFixed(1)}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.locationTagRow}>
        {profile.city && (
          <View style={styles.locationPill}>
            <Ionicons name="location" size={12} color={Colors.textSecondary} />
            <Text style={styles.locationPillText}>{profile.city}, {profile.country}</Text>
          </View>
        )}
        {(profile.tags as string[] || []).slice(0, 2).map(tag => (
          <View key={tag} style={[styles.tagPill, { backgroundColor: color + '10' }]}>
            <Text style={[styles.tagPillText, { color }]}>{tag}</Text>
          </View>
        ))}
      </View>
      <Pressable
        style={[styles.joinButton, joined && styles.joinedButton]}
        onPress={(e) => {
          e.stopPropagation?.();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          toggleJoinCommunity(profile.id);
        }}
      >
        <Ionicons name={joined ? "checkmark" : "add"} size={18} color={joined ? Colors.secondary : '#FFF'} />
        <Text style={[styles.joinText, joined && styles.joinedText]}>{joined ? 'Joined' : 'Join'}</Text>
      </Pressable>
    </Pressable>
  );
}

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

export default function CommunitiesScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const { data: profiles, isLoading } = useQuery<Profile[]>({
    queryKey: ['/api/profiles?type=community'],
  });

  const { data: orgs } = useQuery<Profile[]>({
    queryKey: ['/api/profiles?type=organisation'],
  });

  const allProfiles = [...(profiles || []), ...(orgs || [])];

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Communities</Text>
        <Text style={styles.subtitle}>Connect with cultural communities & organisations</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
          {allProfiles.map(profile => (
            <CommunityCard key={profile.id} profile={profile} />
          ))}
          {allProfiles.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={52} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No communities yet</Text>
              <Text style={styles.emptySubtext}>Communities will appear here as they are added</Text>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: Colors.text },
  subtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 2 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid: { paddingHorizontal: 20, gap: 12 },
  card: { backgroundColor: Colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  communityIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardName: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text, flexShrink: 1 },
  cardCategory: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  cardDesc: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 20 },
  cardStats: { flexDirection: 'row', gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  locationTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.backgroundSecondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  locationPillText: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  tagPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagPillText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold' },
  joinButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 10 },
  joinedButton: { backgroundColor: Colors.secondary + '12', borderWidth: 1, borderColor: Colors.secondary + '30' },
  joinText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  joinedText: { color: Colors.secondary },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  emptySubtext: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
});
