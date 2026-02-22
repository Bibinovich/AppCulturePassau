import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useSaved } from '@/contexts/SavedContext';
import { sampleEvents, sampleCommunities } from '@/data/mockData';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Wallet } from '@shared/schema';

function MenuItem({ icon, label, value, onPress, color, showDivider = true }: {
  icon: string; label: string; value?: string; onPress?: () => void; color?: string; showDivider?: boolean;
}) {
  return (
    <>
      <Pressable style={styles.menuItem} onPress={onPress}>
        <View style={[styles.menuIcon, { backgroundColor: (color || Colors.primary) + '12' }]}>
          <Ionicons name={icon as any} size={20} color={color || Colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </Pressable>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

function ToggleItem({ icon, label, value, onToggle, color, showDivider = true }: {
  icon: string; label: string; value: boolean; onToggle: (v: boolean) => void; color?: string; showDivider?: boolean;
}) {
  return (
    <>
      <View style={styles.menuItem}>
        <View style={[styles.menuIcon, { backgroundColor: (color || Colors.primary) + '12' }]}>
          <Ionicons name={icon as any} size={20} color={color || Colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        <Switch value={value} onValueChange={onToggle} trackColor={{ false: Colors.border, true: Colors.primary + '60' }} thumbColor={value ? Colors.primary : '#f4f3f4'} />
      </View>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { state, resetOnboarding } = useOnboarding();
  const { savedEvents, joinedCommunities } = useSaved();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);

  const { data: users } = useQuery<{id: string}[]>({ queryKey: ['/api/users'] });
  const userId = users?.[0]?.id;
  const { data: wallet } = useQuery<Wallet>({
    queryKey: ['/api/wallet', userId],
    enabled: !!userId,
  });

  const savedEventsList = sampleEvents.filter(e => savedEvents.includes(e.id));
  const joinedCommunitiesList = sampleCommunities.filter(c => joinedCommunities.includes(c.id));

  const handleReset = () => {
    Alert.alert('Reset App', 'This will clear all your data and return you to the onboarding screen.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: async () => { await resetOnboarding(); router.replace('/(onboarding)'); } }]);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}><Ionicons name="person" size={36} color={Colors.primary} /></View>
          <Text style={styles.name}>CulturePass User</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={Colors.primary} />
            <Text style={styles.location}>{state.city}, {state.country}</Text>
          </View>
          <Pressable style={styles.editProfileBtn} onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon!')}>
            <Ionicons name="create-outline" size={16} color={Colors.primary} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statNum}>{joinedCommunities.length}</Text><Text style={styles.statLabel}>Communities</Text></View>
          <View style={styles.statCard}><Text style={styles.statNum}>{savedEvents.length}</Text><Text style={styles.statLabel}>Saved</Text></View>
          <View style={styles.statCard}><Text style={styles.statNum}>0</Text><Text style={styles.statLabel}>Tickets</Text></View>
          <View style={styles.statCard}><Text style={styles.statNum}>0</Text><Text style={styles.statLabel}>Bookings</Text></View>
        </View>

        {joinedCommunitiesList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Communities</Text>
            {joinedCommunitiesList.map(c => (
              <Pressable key={c.id} style={styles.miniCard}
                onPress={() => router.push({ pathname: '/community/[id]', params: { id: c.id } })}>
                <View style={[styles.miniIcon, { backgroundColor: c.color + '15' }]}><Ionicons name={c.icon as any} size={20} color={c.color} /></View>
                <View style={{ flex: 1 }}><Text style={styles.miniTitle}>{c.name}</Text><Text style={styles.miniSub}>{c.members.toLocaleString()} members</Text></View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}

        {savedEventsList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Events</Text>
            {savedEventsList.map(e => (
              <Pressable key={e.id} style={styles.miniCard}
                onPress={() => router.push({ pathname: '/event/[id]', params: { id: e.id } })}>
                <View style={[styles.miniIcon, { backgroundColor: e.imageColor + '15' }]}><Ionicons name="calendar" size={20} color={e.imageColor} /></View>
                <View style={{ flex: 1 }}><Text style={styles.miniTitle} numberOfLines={1}>{e.title}</Text><Text style={styles.miniSub}>{formatDate(e.date)}</Text></View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Preferences</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="location-outline" label="Location" value={`${state.city}, ${state.country}`} color={Colors.primary}
              onPress={() => Alert.alert('Location', `Current: ${state.city}, ${state.country}\n\nYou can change this by resetting onboarding.`)} />
            <MenuItem icon="people-outline" label="My Communities" value={`${state.communities.length} selected`} color={Colors.secondary}
              onPress={() => Alert.alert('Communities', state.communities.join(', ') || 'None selected')} />
            <MenuItem icon="heart-outline" label="Interests" value={`${state.interests.length} selected`} color={Colors.accent}
              onPress={() => Alert.alert('Interests', state.interests.join(', ') || 'None selected')} showDivider={false} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment & Billing</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="card-outline" label="Payment Methods" color="#3498DB"
              onPress={() => router.push('/payment/methods')} />
            <MenuItem icon="receipt-outline" label="Transaction History" color="#9B59B6"
              onPress={() => router.push('/payment/transactions')} />
            <MenuItem icon="wallet-outline" label="CulturePass Wallet" value={`$${(wallet?.balance || 0).toFixed(2)}`} color="#2ECC71"
              onPress={() => router.push('/payment/wallet')} />
            <MenuItem icon="gift-outline" label="Perks & Benefits" color={Colors.accent}
              onPress={() => router.push('/perks')} />
            <MenuItem icon="notifications-outline" label="View Notifications" color="#FF9F0A"
              onPress={() => router.push('/notifications')} showDivider={false} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.menuCard}>
            <ToggleItem icon="notifications-outline" label="Push Notifications" value={pushNotifs} onToggle={setPushNotifs} color="#FF9F0A" />
            <ToggleItem icon="mail-outline" label="Email Updates" value={emailNotifs} onToggle={setEmailNotifs} color="#5856D6" />
            <MenuItem icon="megaphone-outline" label="Event Reminders" value="On" color="#FF2D55"
              onPress={() => Alert.alert('Event Reminders', 'Get reminders 24 hours and 1 hour before your booked events.')} showDivider={false} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="help-circle-outline" label="Help Centre" color="#34C759"
              onPress={() => Alert.alert('Help Centre', 'Browse FAQs, user guides, and troubleshooting tips.')} />
            <MenuItem icon="chatbubble-outline" label="Contact Support" color="#007AFF"
              onPress={() => Alert.alert('Contact Support', 'Email: support@culturepass.com\nPhone: 1800-CULTURE')} />
            <MenuItem icon="document-text-outline" label="Terms & Privacy" color="#8E8E93"
              onPress={() => Alert.alert('Legal', 'View our Terms of Service and Privacy Policy.')} />
            <MenuItem icon="information-circle-outline" label="About CulturePass" color={Colors.primary}
              onPress={() => Alert.alert('About', 'CulturePass v1.0.0\n\nYour one-stop lifestyle platform for cultural diaspora communities.\n\nAvailable in: Australia, New Zealand, UAE, UK, and Canada.')} showDivider={false} />
          </View>
        </View>

        <View style={styles.section}>
          <Pressable style={styles.logoutBtn}
            onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [{ text: 'Cancel' }, { text: 'Sign Out', style: 'destructive' }])}>
            <Ionicons name="log-out-outline" size={18} color={Colors.primary} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
          <Pressable style={styles.resetButton}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleReset(); }}>
            <Ionicons name="refresh-outline" size={18} color={Colors.error} />
            <Text style={styles.resetText}>Reset App Data</Text>
          </Pressable>
        </View>

        <Text style={styles.version}>CulturePass v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileHeader: { alignItems: 'center', paddingTop: 20, paddingBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.primary + '30', marginBottom: 12 },
  name: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  location: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: Colors.primary + '10', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  editProfileText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  statNum: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text },
  statLabel: { fontSize: 10, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 12 },
  miniCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.cardBorder, gap: 12 },
  miniIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  miniTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  miniSub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  menuCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Poppins_500Medium', color: Colors.text },
  menuValue: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginRight: 4 },
  divider: { height: 1, backgroundColor: Colors.divider, marginLeft: 62 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary + '10', borderRadius: 14, paddingVertical: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.primary + '20' },
  logoutText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.error + '10', borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: Colors.error + '20' },
  resetText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.error },
  version: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary, textAlign: 'center', marginBottom: 20 },
});
