import { StyleSheet, TouchableOpacity } from 'react-native';
import { usePostHog } from 'posthog-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const posthog = usePostHog();

  const handlePress = () => {
    posthog.capture('button_pressed');
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <ThemedText style={styles.buttonText}>Clique aqui</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
