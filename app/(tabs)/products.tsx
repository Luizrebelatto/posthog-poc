import { usePostHog } from 'posthog-react-native';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const PRODUCTS = [
  { id: '1', name: 'Wireless Headphones', price: 99.99, category: 'electronics' },
  { id: '2', name: 'Running Shoes', price: 129.99, category: 'sports' },
  { id: '3', name: 'Backpack', price: 59.99, category: 'accessories' },
  { id: '4', name: 'Smart Watch', price: 249.99, category: 'electronics' },
  { id: '5', name: 'Water Bottle', price: 24.99, category: 'accessories' },
  { id: '6', name: 'Yoga Mat', price: 39.99, category: 'sports' },
  { id: '7', name: 'Sunglasses', price: 79.99, category: 'accessories' },
  { id: '8', name: 'Bluetooth Speaker', price: 149.99, category: 'electronics' },
  { id: '9', name: 'Laptop Stand', price: 44.99, category: 'electronics' },
  { id: '10', name: 'Travel Mug', price: 19.99, category: 'accessories' },
];

export default function ProductsScreen() {
  const posthog = usePostHog();
  const router = useRouter();

  const handleProductPress = (product: (typeof PRODUCTS)[number]) => {
    posthog.capture('product_clicked', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_category: product.category,
    });
    router.push({ pathname: '/product/[id]', params: { id: product.id } });
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            testID={`product-${item.id}`}
            ph-label={`product-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            style={styles.productCard}
            onPress={() => handleProductPress(item)}
          >
            <ThemedView style={styles.productInfo}>
              <ThemedText type="subtitle">{item.name}</ThemedText>
              <ThemedText style={styles.category}>{item.category}</ThemedText>
            </ThemedView>
            <ThemedText style={styles.price}>${item.price.toFixed(2)}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  category: {
    fontSize: 14,
    opacity: 0.6,
    textTransform: 'capitalize',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
});
