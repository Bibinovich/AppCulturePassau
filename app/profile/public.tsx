import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Linking, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { User } from '@shared/schema';

const SOCIAL_ICONS: { key: string; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: 'instagram', icon: 'logo-instagram', label: 'Instagram' },
  { key: 'twitter', icon: 'logo-twitter', label: 'Twitter' },
  { key: 'linkedin', icon: 'logo-linkedin', label: 'LinkedIn' },
  { key: 'facebook', icon: 'logo-facebook', label: 'Facebook' },
];

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function formatMemberDate(dateStr: string | Date | null) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function PublicProfileScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const { data: usersData, isLoading } = useQuery<User[]>({ queryKey: ['/api/users'] });
  const user = usersData?.[0];

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Profile not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const socialLinks = (user.socialLinks || {}) as Record<string, string | undefined>;
  const activeSocials = SOCIAL_ICONS.filter(s => socialLinks[s.key]);
  const locationText = [user.city, user.country].filter(Boolean).join(', ');
  const displayName = user.displayName ?? 'CulturePass User';

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { backgroundColor: Colors.primary, paddingTop: topInset }]}>
        <View style={styles.heroOverlay}>
          <View style={styles.heroTopRow}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </Pressable>
            <Pressable
              style={styles.shareButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </Pressable>
          </View>
          <View style={styles.heroBottom}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="person" size={36} color="#FFF" />
            </View>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroTitle} numberOfLines={2}>{displayName}</Text>
              {user.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            {user.username && (
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>@{user.username}</Text>
              </View>
            )}
            {user.culturePassId && (
              <View style={styles.cpidBadge}>
                <Ionicons name="finger-print" size={13} color="rgba(255,255,255,0.9)" />
                <Text style={styles.cpidBadgeText}>{user.culturePassId}</Text>
              </View>
            )}
            {locationText ? (
              <View style={styles.heroMetaRow}>
                <View style={styles.heroPill}>
                  <Ionicons name="location" size={12} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.heroPillText}>{locationText}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset + 40 }}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{formatNumber(user.followersCount ?? 0)}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{formatNumber(user.followingCount ?? 0)}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{formatNumber(user.likesCount ?? 0)}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </Animated.View>

        {user.bio ? (
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{user.bio}</Text>
          </Animated.View>
        ) : null}

        {activeSocials.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Social</Text>
            <View style={styles.socialRow}>
              {activeSocials.map(s => (
                <Pressable
                  key={s.key}
                  style={[styles.socialIcon, { backgroundColor: Colors.primary + '15' }]}
                  onPress={() => {
                    const url = socialLinks[s.key];
                    if (url) Linking.openURL(url);
                  }}
                >
                  <Ionicons name={s.icon as any} size={22} color={Colors.primary} />
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {locationText ? (
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <View style={[styles.locationIconWrap, { backgroundColor: Colors.primary + '15' }]}>
                <Ionicons name="location" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationCity}>{user.city || ''}</Text>
                <Text style={styles.locationCountry}>{user.country || ''}</Text>
              </View>
            </View>
          </Animated.View>
        ) : null}

        {user.createdAt && (
          <Animated.View entering={FadeInDown.delay(350).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Member Since</Text>
            <View style={styles.memberCard}>
              <View style={[styles.memberIconWrap, { backgroundColor: Colors.secondary + '15' }]}>
                <Ionicons name="calendar" size={22} color={Colors.secondary} />
              </View>
              <Text style={styles.memberDate}>{formatMemberDate(user.createdAt)}</Text>
            </View>
          </Animated.View>
        )}

        {user.culturePassId && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
            <View style={styles.cpidCard}>
              <View style={styles.cpidCardHeader}>
                <View style={[styles.cpidCardIconWrap, { backgroundColor: Colors.primary + '15' }]}>
                  <Ionicons name="finger-print" size={28} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cpidCardLabel}>CulturePass ID</Text>
                  <Text style={styles.cpidCardValue}>{user.culturePassId}</Text>
                </View>
              </View>
              <View style={styles.cpidCardDivider} />
              <View style={styles.cpidCardFooter}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.secondary} />
                <Text style={styles.cpidCardFooterText}>Verified Digital Identity</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorText: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  backLink: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary, marginTop: 12 },
  hero: { height: 280 },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 16,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: { gap: 6 },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  cpidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  cpidBadgeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 1,
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  heroPillText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.9)',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 20,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statNum: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 23,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  locationIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCity: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  locationCountry: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  memberIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberDate: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  cpidCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Colors.shadow.medium,
  },
  cpidCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cpidCardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cpidCardLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  cpidCardValue: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  cpidCardDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 14,
  },
  cpidCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cpidCardFooterText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.secondary,
  },
});
