import { usePostHog } from 'posthog-react-native';
import {
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const posthog = usePostHog();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Welcome</ThemedText>
        <ThemedText style={styles.subtitle}>
          Explore the app and interact with elements below.
        </ThemedText>

        <ThemedView style={styles.card} testID="signup-card" ph-label="signup-card">
          <ThemedText type="subtitle">Sign Up</ThemedText>
          <TextInput
            testID="email-input"
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            title="Sign Up"
            onPress={() => {
              posthog.capture('button_pressed', {
                button_name: 'signup',
                email_provided: email.length > 0,
              });
            }}
          />
        </ThemedView>

        <ThemedView style={styles.card} testID="notifications-card" ph-label="notifications-card">
          <ThemedText type="subtitle">Notifications</ThemedText>
          <ThemedView style={styles.row}>
            <ThemedText>Enable push notifications</ThemedText>
            <Switch
              testID="notifications-switch"
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                posthog.capture('notifications_toggled', { enabled: value });
              }}
            />
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.card} testID="actions-card" ph-label="actions-card">
          <ThemedText type="subtitle">Quick Actions</ThemedText>
          <ThemedView style={styles.buttonRow}>
            <TouchableOpacity
              testID="btn-share"
              style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
              onPress={() => posthog.capture('button_pressed', { button_name: 'share' })}
            >
              <ThemedText style={styles.actionButtonText}>Share</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              testID="btn-like"
              style={[styles.actionButton, { backgroundColor: '#FF2D55' }]}
              onPress={() => posthog.capture('button_pressed', { button_name: 'like' })}
            >
              <ThemedText style={styles.actionButtonText}>Like</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              testID="btn-save"
              style={[styles.actionButton, { backgroundColor: '#34C759' }]}
              onPress={() => posthog.capture('button_pressed', { button_name: 'save' })}
            >
              <ThemedText style={styles.actionButtonText}>Save</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity
          testID="btn-view-products"
          style={styles.ctaButton}
          ph-label="view-products-cta"
          onPress={() => router.push('/(tabs)/products')}
        >
          <ThemedText style={styles.ctaButtonText}>Browse Products</ThemedText>
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
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#5856D6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
