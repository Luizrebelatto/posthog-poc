import { usePostHog } from 'posthog-react-native';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfileScreen() {
  const posthog = usePostHog();
  const [darkMode, setDarkMode] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [name, setName] = useState('');

  const handleIdentify = () => {
    if (!name.trim()) return;
    posthog.identify(name.trim(), { display_name: name.trim() });
    Alert.alert('Identified', `You are now identified as "${name.trim()}"`);
  };

  const handleLogout = () => {
    posthog.capture('user_logged_out');
    posthog.reset();
    setName('');
    Alert.alert('Logged out', 'Session has been reset.');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.card} testID="identify-card" ph-label="identify-card">
          <ThemedText type="subtitle">Identify</ThemedText>
          <ThemedText style={styles.hint}>
            Set your identity to link events to your profile.
          </ThemedText>
          <TextInput
            testID="name-input"
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity
            testID="btn-identify"
            style={styles.primaryButton}
            onPress={handleIdentify}
          >
            <ThemedText style={styles.primaryButtonText}>Identify</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.card} testID="settings-card" ph-label="settings-card">
          <ThemedText type="subtitle">Settings</ThemedText>

          <ThemedView style={styles.settingRow}>
            <ThemedText>Dark Mode</ThemedText>
            <Switch
              testID="dark-mode-switch"
              value={darkMode}
              onValueChange={(val) => {
                setDarkMode(val);
                posthog.capture('setting_changed', { setting: 'dark_mode', value: val });
              }}
            />
          </ThemedView>

          <ThemedView style={styles.settingRow}>
            <ThemedText>Analytics</ThemedText>
            <Switch
              testID="analytics-switch"
              value={analytics}
              onValueChange={(val) => {
                setAnalytics(val);
                posthog.capture('setting_changed', { setting: 'analytics', value: val });
                if (!val) {
                  posthog.optOut();
                } else {
                  posthog.optIn();
                }
              }}
            />
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.card} testID="feedback-card" ph-label="feedback-card">
          <ThemedText type="subtitle">Rate this app</ThemedText>
          <ThemedView style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                testID={`btn-star-${star}`}
                style={styles.starButton}
                onPress={() => {
                  posthog.capture('app_rated', { rating: star });
                  Alert.alert('Thanks!', `You rated us ${star} star${star > 1 ? 's' : ''}.`);
                }}
              >
                <ThemedText style={styles.starText}>{'★'}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        <TouchableOpacity
          testID="btn-logout"
          style={styles.dangerButton}
          ph-label="logout-button"
          onPress={handleLogout}
        >
          <ThemedText style={styles.dangerButtonText}>Logout & Reset</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  hint: {
    fontSize: 14,
    opacity: 0.6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  starButton: {
    padding: 8,
  },
  starText: {
    fontSize: 32,
    color: '#FFD700',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
