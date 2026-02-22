import { View, Text, Pressable, StyleSheet, ScrollView, Platform, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/query-client';
import Animated, { FadeInDown } from 'react-native-reanimated';

type SubmitType = 'organisation' | 'business' | 'artist';

const TABS: { key: SubmitType; label: string; icon: string }[] = [
  { key: 'organisation', label: 'Organisation', icon: 'people' },
  { key: 'business', label: 'Business', icon: 'business' },
  { key: 'artist', label: 'Artist', icon: 'color-palette' },
];

const ORG_CATEGORIES = ['Cultural', 'Religious', 'Community', 'Youth', 'Professional'];
const BIZ_CATEGORIES = ['Restaurant', 'Retail', 'Services', 'Beauty', 'Tech'];
const ARTIST_GENRES = ['Music', 'Dance', 'Visual Arts', 'Theatre', 'Film'];

export default function SubmitScreen() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;
  const [activeTab, setActiveTab] = useState<SubmitType>('organisation');
  const [form, setForm] = useState({
    name: '',
    description: '',
    city: '',
    country: '',
    contactEmail: '',
    phone: '',
    website: '',
    category: '',
    abn: '',
    socialMedia: '',
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/profiles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Submitted', 'Your listing has been submitted for review. We will notify you once it is approved.');
      setForm({ name: '', description: '', city: '', country: '', contactEmail: '', phone: '', website: '', category: '', abn: '', socialMedia: '' });
    },
    onError: (err: Error) => {
      Alert.alert('Error', err.message);
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter a name.');
      return;
    }
    if (!form.contactEmail.trim()) {
      Alert.alert('Required', 'Please enter a contact email.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    submitMutation.mutate({
      type: activeTab,
      name: form.name.trim(),
      description: form.description.trim() || null,
      city: form.city.trim() || null,
      country: form.country.trim() || null,
      contactEmail: form.contactEmail.trim(),
      phone: form.phone.trim() || null,
      website: form.website.trim() || null,
      category: form.category || null,
      abn: activeTab === 'business' ? (form.abn.trim() || null) : null,
      socialMedia: activeTab === 'artist' ? (form.socialMedia.trim() || null) : null,
    });
  };

  const getCategoryOptions = () => {
    if (activeTab === 'organisation') return ORG_CATEGORIES;
    if (activeTab === 'business') return BIZ_CATEGORIES;
    return ARTIST_GENRES;
  };

  const getCategoryLabel = () => {
    if (activeTab === 'artist') return 'Genre / Category';
    return 'Category';
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Submit Listing</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 + insets.bottom + webBottom }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.tabContainer}>
            {TABS.map((tab) => (
              <Pressable
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.key);
                  setForm(prev => ({ ...prev, category: '', abn: '', socialMedia: '' }));
                }}
              >
                <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.key ? '#FFF' : Colors.textSecondary} />
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
              </Pressable>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.formSection}>
            <Text style={styles.sectionLabel}>Basic Information</Text>

            <Text style={styles.fieldLabel}>Name *</Text>
            <TextInput style={styles.input} value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))}
              placeholder={`${activeTab === 'artist' ? 'Artist / Stage' : activeTab === 'business' ? 'Business' : 'Organisation'} name`}
              placeholderTextColor={Colors.textTertiary} />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))}
              placeholder="Tell us about your listing..." placeholderTextColor={Colors.textTertiary} multiline numberOfLines={4} textAlignVertical="top" maxLength={500} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.formSection}>
            <Text style={styles.sectionLabel}>Location</Text>

            <Text style={styles.fieldLabel}>City</Text>
            <TextInput style={styles.input} value={form.city} onChangeText={v => setForm(p => ({ ...p, city: v }))}
              placeholder="Sydney" placeholderTextColor={Colors.textTertiary} />

            <Text style={styles.fieldLabel}>Country</Text>
            <TextInput style={styles.input} value={form.country} onChangeText={v => setForm(p => ({ ...p, country: v }))}
              placeholder="Australia" placeholderTextColor={Colors.textTertiary} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.formSection}>
            <Text style={styles.sectionLabel}>Contact Details</Text>

            <Text style={styles.fieldLabel}>Contact Email *</Text>
            <TextInput style={styles.input} value={form.contactEmail} onChangeText={v => setForm(p => ({ ...p, contactEmail: v }))}
              placeholder="contact@example.com" placeholderTextColor={Colors.textTertiary} keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput style={styles.input} value={form.phone} onChangeText={v => setForm(p => ({ ...p, phone: v }))}
              placeholder="+61 400 000 000" placeholderTextColor={Colors.textTertiary} keyboardType="phone-pad" />

            <Text style={styles.fieldLabel}>Website</Text>
            <TextInput style={styles.input} value={form.website} onChangeText={v => setForm(p => ({ ...p, website: v }))}
              placeholder="https://example.com" placeholderTextColor={Colors.textTertiary} autoCapitalize="none" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.formSection}>
            <Text style={styles.sectionLabel}>{getCategoryLabel()}</Text>
            <View style={styles.categoryGrid}>
              {getCategoryOptions().map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.categoryChip, form.category === cat && styles.categoryChipActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setForm(p => ({ ...p, category: p.category === cat ? '' : cat }));
                  }}
                >
                  <Text style={[styles.categoryText, form.category === cat && styles.categoryTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {activeTab === 'business' && (
            <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.formSection}>
              <Text style={styles.sectionLabel}>Business Details</Text>
              <Text style={styles.fieldLabel}>ABN (Australian Business Number)</Text>
              <TextInput style={styles.input} value={form.abn} onChangeText={v => setForm(p => ({ ...p, abn: v }))}
                placeholder="XX XXX XXX XXX" placeholderTextColor={Colors.textTertiary} keyboardType="number-pad" />
            </Animated.View>
          )}

          {activeTab === 'artist' && (
            <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.formSection}>
              <Text style={styles.sectionLabel}>Social Media</Text>
              <Text style={styles.fieldLabel}>Social Media Links</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.socialMedia} onChangeText={v => setForm(p => ({ ...p, socialMedia: v }))}
                placeholder="Instagram, Facebook, YouTube, etc. (one per line)" placeholderTextColor={Colors.textTertiary} multiline numberOfLines={3} textAlignVertical="top" />
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(700).duration(400)} style={styles.submitSection}>
            <Pressable style={[styles.submitBtn, submitMutation.isPending && { opacity: 0.7 }]} onPress={handleSubmit} disabled={submitMutation.isPending}>
              <Ionicons name="checkmark-circle" size={22} color="#FFF" />
              <Text style={styles.submitBtnText}>{submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}</Text>
            </Pressable>
            <Text style={styles.submitNote}>
              All submissions are reviewed by our team within 2-3 business days. You will receive an email notification once your listing is approved.
            </Text>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 24, backgroundColor: Colors.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: Colors.cardBorder },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary },
  tabTextActive: { color: '#FFF' },
  formSection: { paddingHorizontal: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.text, borderWidth: 1, borderColor: Colors.cardBorder },
  textArea: { minHeight: 100, paddingTop: 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  categoryTextActive: { color: '#FFF' },
  submitSection: { paddingHorizontal: 20, marginTop: 8, marginBottom: 24 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, padding: 16 },
  submitBtnText: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  submitNote: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary, marginTop: 12, textAlign: 'center', lineHeight: 18 },
});
