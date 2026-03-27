import { Stack, useLocalSearchParams } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, TouchableOpacity } from 'react-native';

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
  const viewStartTime = useRef(Date.now());
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!product) return;

    viewStartTime.current = Date.now();
    posthog.capture('product_viewed', {
      product_id: id,
      product_name: product.name,
      product_price: product.price,
      product_category: product.category,
    });

    return () => {
      const durationSeconds = Math.round((Date.now() - viewStartTime.current) / 1000);
      posthog.capture('product_view_duration', {
        product_id: id,
        product_name: product.name,
        product_category: product.category,
        duration_seconds: durationSeconds,
      });
    };
  }, [id]);

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
      quantity,
      total_value: product.price * quantity,
    });
    Alert.alert('Added to cart', `${quantity}x ${product.name} added to your cart.`);
  };

  const handleBuyNow = () => {
    posthog.capture('product_buy_now', {
      product_id: id,
      product_name: product.name,
      product_price: product.price,
      product_category: product.category,
      quantity,
      total_value: product.price * quantity,
    });
    Alert.alert('Purchase', `Purchasing ${quantity}x ${product.name} for $${(product.price * quantity).toFixed(2)}`);
  };

  const handleShare = async () => {
    posthog.capture('product_shared', {
      product_id: id,
      product_name: product.name,
      product_category: product.category,
    });
    await Share.share({
      message: `Check out ${product.name} for $${product.price.toFixed(2)}!`,
    });
  };

  const handleFavorite = () => {
    const newState = !isFavorited;
    setIsFavorited(newState);
    posthog.capture(newState ? 'product_favorited' : 'product_unfavorited', {
      product_id: id,
      product_name: product.name,
      product_category: product.category,
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.imagePlaceholder}>
            <ThemedText style={styles.placeholderText}>{product.category.toUpperCase()}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.details}>
            <ThemedView style={styles.titleRow}>
              <ThemedText type="title" style={styles.titleText}>{product.name}</ThemedText>
              <ThemedView style={styles.iconActions}>
                <TouchableOpacity testID="btn-favorite" onPress={handleFavorite}>
                  <ThemedText style={styles.iconButton}>{isFavorited ? '❤️' : '🤍'}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity testID="btn-share" onPress={handleShare}>
                  <ThemedText style={styles.iconButton}>📤</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
            <ThemedText style={styles.price}>${product.price.toFixed(2)}</ThemedText>
            <ThemedText style={styles.description}>{product.description}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.quantityContainer}>
            <ThemedText type="subtitle">Quantity</ThemedText>
            <ThemedView style={styles.quantityControls}>
              <TouchableOpacity
                testID="btn-qty-minus"
                style={styles.quantityButton}
                onPress={() => {
                  if (quantity > 1) {
                    setQuantity(quantity - 1);
                    posthog.capture('product_quantity_changed', {
                      product_id: id,
                      quantity: quantity - 1,
                      action: 'decrease',
                    });
                  }
                }}
              >
                <ThemedText style={styles.quantityButtonText}>-</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.quantityValue}>{quantity}</ThemedText>
              <TouchableOpacity
                testID="btn-qty-plus"
                style={styles.quantityButton}
                onPress={() => {
                  setQuantity(quantity + 1);
                  posthog.capture('product_quantity_changed', {
                    product_id: id,
                    quantity: quantity + 1,
                    action: 'increase',
                  });
                }}
              >
                <ThemedText style={styles.quantityButtonText}>+</ThemedText>
              </TouchableOpacity>
            </ThemedView>
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
      </ScrollView>
    </>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleText: {
    flex: 1,
  },
  iconActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    fontSize: 24,
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
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
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
