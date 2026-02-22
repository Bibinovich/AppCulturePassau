import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { User, Membership } from '@shared/schema';
import Animated, { FadeInDown } from 'react-native-reanimated';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TIER_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  free: { bg: Colors.textTertiary + '15', text: Colors.textSecondary, icon: 'shield-outline' },
  plus: { bg: '#3498DB15', text: '#3498DB', icon: 'star' },
  premium: { bg: '#F39C1215', text: '#F39C12', icon: 'diamond' },
};

function QRGrid({ cpid }: { cpid: string }) {
  const rows = [];
  for (let r = 0; r < 8; r++) {
    const cells = [];
    for (let c = 0; c < 8; c++) {
      const idx = (r * 8 + c) % cpid.length;
      const charCode = cpid.charCodeAt(idx);
      const filled = (charCode + r * c + r + c) % 3 !== 0;
      cells.push(
        <View
          key={`${r}-${c}`}
          style={[
            styles.gridCell,
            { backgroundColor: filled ? Colors.primary : Colors.primary + '12' },
          ]}
        />
      );
    }
    rows.push(
      <View key={r} style={styles.gridRow}>
        {cells}
      </View>
    );
  }
  return <View style={styles.gridContainer}>{rows}</View>;
}

export default function QRScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const { data: usersData } = useQuery<User[]>({ queryKey: ['/api/users'] });
  const user = usersData?.[0];
  const userId = user?.id;

  const { data: membership } = useQuery<Membership>({
    queryKey: [`/api/membership/${userId}`],
    enabled: !!userId,
  });

  const tier = membership?.tier ?? 'free';
  const tierStyle = TIER_COLORS[tier] ?? TIER_COLORS.free;
  const cpid = user?.culturePassId ?? 'CP-000000';
  const displayName = user?.displayName ?? 'CulturePass User';
  const username = user?.username ?? 'user';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My CulturePass ID: ${cpid}\n${displayName} (@${username})\n\nVerify me on CulturePass!`,
      });
    } catch {}
  };

  const handleCopy = () => {
    Alert.alert('Copied!', `CulturePass ID ${cpid} copied to clipboard.`);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>My CulturePass ID</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 24 }]}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.card}>
          <View style={styles.cardAccent} />

          <View style={styles.brandRow}>
            <Ionicons name="globe-outline" size={20} color={Colors.primary} />
            <Text style={styles.brandText}>CulturePass</Text>
          </View>

          <View style={styles.fingerprintContainer}>
            <View style={styles.fingerprintGlow} />
            <Ionicons name="finger-print" size={64} color={Colors.primary} />
          </View>

          <Text style={styles.cpidLabel}>CulturePass ID</Text>
          <Text style={styles.cpidValue}>{cpid}</Text>

          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.usernameText}>@{username}</Text>

          <QRGrid cpid={cpid} />

          <View style={[styles.tierBadge, { backgroundColor: tierStyle.bg }]}>
            <Ionicons name={tierStyle.icon as any} size={14} color={tierStyle.text} />
            <Text style={[styles.tierText, { color: tierStyle.text }]}>
              {capitalize(tier)} Member
            </Text>
          </View>

          <View style={styles.validRow}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
            <Text style={styles.validText}>Valid CulturePass Digital ID</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.buttonsRow}>
          <Pressable style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={Colors.textInverse} />
            <Text style={styles.shareBtnText}>Share ID</Text>
          </Pressable>
          <Pressable style={styles.copyBtn} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={20} color={Colors.primary} />
            <Text style={styles.copyBtnText}>Copy ID</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadow.small,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    ...Colors.shadow.large,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.primary,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  brandText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: Colors.primary,
  },
  fingerprintContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  fingerprintGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primarySoft,
  },
  cpidLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  cpidValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: Colors.text,
    letterSpacing: 3,
    marginBottom: 12,
  },
  displayName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 2,
  },
  usernameText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  gridContainer: {
    gap: 3,
    marginBottom: 20,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 3,
  },
  gridCell: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  tierText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  validRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: Colors.success,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    ...Colors.shadow.medium,
  },
  shareBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: Colors.textInverse,
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
    ...Colors.shadow.small,
  },
  copyBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: Colors.primary,
  },
});
