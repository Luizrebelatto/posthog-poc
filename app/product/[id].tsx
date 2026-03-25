import { usePostHog } from 'posthog-react-native';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const PRODUCTS: Record<string, { name: string; price: number; category: string; description: string }> = {
  '1': { name: 'Wireless Headphones', price: 99.99, category: 'electronics', description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.' },
  '2': { name: 'Running Shoes', price: 129.99, category: 'sports', description: 'Lightweight running shoes with responsive cushioning for long-distance runs.' },
  '3': { name: 'Backpack', price: 59.99, category: 'accessories', description: 'Durable backpack with laptop compartment and water-resistant fabric.' },
  '4': { name: 'Smart Watch', price: 249.99, category: 'electronics', description: 'Feature-packed smartwatch with health monitoring and GPS tracking.' },
  '5': { name: 'Water Bottle', price: 24.99, category: 'accessories', description: 'Insulated stainless steel bottle that keeps drinks cold for 24 hours.' },
  '6': { name: 'Yoga Mat', price: 39.99, category: 'sports', description: 'Extra-thick non-slip yoga mat for comfortable practice.' },
  '7': { name: 'Sunglasses', price: 79.99, category: 'accessories', description: 'Polarized sunglasses with UV400 protection and lightweight frame.' },
  '8': { name: 'Bluetooth Speaker', price: 149.99, category: 'electronics', description: 'Portable Bluetooth speaker with 360-degree sound and waterproof design.' },
  '9': { name: 'Laptop Stand', price: 44.99, category: 'electronics', description: 'Adjustable aluminum laptop stand for ergonomic positioning.' },
  '10': { name: 'Travel Mug', price: 19.99, category: 'accessories', description: 'Leak-proof travel mug with double-wall insulation.' },
};

export default function ProductDetailScreen() {
  const posthog = usePostHog();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = PRODUCTS[id];

  if (!product) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Product not found</ThemedText>
      </ThemedView>
    );
  }

  const handleAddToCart = () => {
    posthog.capture('product_added_to_cart', {
      product_id: id,
      product_name: product.name,
      product_price: product.price,
      product_category: product.category,
    });
    Alert.alert('Added to cart', `${product.name} has been added to your cart.`);
  };

  const handleBuyNow = () => {
    posthog.capture('product_buy_now', {
      product_id: id,
      product_name: product.name,
      product_price: product.price,
      product_category: product.category,
    });
    Alert.alert('Purchase', `Purchasing ${product.name} for $${product.price.toFixed(2)}`);
  };

  return (
    <>
      <Stack.Screen options={{ title: product.name }} />
      <ThemedView style={styles.container}>
        <ThemedView style={styles.imagePlaceholder}>
          <ThemedText style={styles.placeholderText}>{product.category.toUpperCase()}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.details}>
          <ThemedText type="title">{product.name}</ThemedText>
          <ThemedText style={styles.price}>${product.price.toFixed(2)}</ThemedText>
          <ThemedText style={styles.description}>{product.description}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.actions}>
          <TouchableOpacity
            testID="btn-add-to-cart"
            ph-label="add-to-cart"
            style={styles.cartButton}
            onPress={handleAddToCart}
          >
            <ThemedText style={styles.cartButtonText}>Add to Cart</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-buy-now"
            ph-label="buy-now"
            style={styles.buyButton}
            onPress={handleBuyNow}
          >
            <ThemedText style={styles.buyButtonText}>Buy Now</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  imagePlaceholder: {
    height: 200,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    opacity: 0.3,
  },
  details: {
    gap: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
  },
  actions: {
    gap: 12,
    marginTop: 'auto',
  },
  cartButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  buyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
