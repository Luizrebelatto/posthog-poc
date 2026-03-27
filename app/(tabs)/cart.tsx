import { usePostHog } from 'posthog-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
};

const MOCK_CART: CartItem[] = [
  { productId: '1', name: 'Wireless Headphones', price: 99.99, category: 'electronics', quantity: 1 },
  { productId: '4', name: 'Smart Watch', price: 249.99, category: 'electronics', quantity: 1 },
  { productId: '6', name: 'Yoga Mat', price: 39.99, category: 'sports', quantity: 2 },
];

export default function CartScreen() {
  const posthog = usePostHog();
  const [cartItems, setCartItems] = useState<CartItem[]>(MOCK_CART);
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  useEffect(() => {
    posthog.capture('cart_viewed', {
      cart_size: cartItems.length,
      cart_total: subtotal,
      product_ids: cartItems.map((item) => item.productId),
    });
  }, []);

  const handleRemoveItem = (productId: string) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;

    posthog.capture('cart_item_removed', {
      product_id: item.productId,
      product_name: item.name,
      product_price: item.price,
      product_category: item.category,
      quantity: item.quantity,
    });

    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const newQty = Math.max(1, item.quantity + delta);
        posthog.capture('cart_quantity_updated', {
          product_id: item.productId,
          product_name: item.name,
          previous_quantity: item.quantity,
          new_quantity: newQty,
          action: delta > 0 ? 'increase' : 'decrease',
        });
        return { ...item, quantity: newQty };
      })
    );
  };

  const handleApplyCoupon = () => {
    const newState = !couponApplied;
    setCouponApplied(newState);
    posthog.capture('coupon_applied', {
      coupon_code: 'SAVE10',
      discount_percent: 10,
      cart_total_before: subtotal,
      applied: newState,
    });
  };

  const handleCheckout = () => {
    posthog.capture('checkout_started', {
      cart_size: cartItems.length,
      cart_total: total,
      coupon_applied: couponApplied,
      product_ids: cartItems.map((item) => item.productId),
      items: cartItems.map((item) => ({
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    Alert.alert('Checkout', 'Processing your order...', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          posthog.capture('checkout_cancelled', {
            cart_total: total,
            step: 'confirmation',
          });
        },
      },
      {
        text: 'Confirm Purchase',
        onPress: () => {
          posthog.capture('purchase_completed', {
            order_total: total,
            subtotal,
            discount,
            coupon_applied: couponApplied,
            items_count: cartItems.length,
            total_quantity: cartItems.reduce((sum, i) => sum + i.quantity, 0),
            product_ids: cartItems.map((i) => i.productId),
            items: cartItems.map((item) => ({
              product_id: item.productId,
              product_name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            $set: { total_purchases: 1 },
          });

          setCartItems([]);
          setCouponApplied(false);
          Alert.alert('Success', 'Your order has been placed!');
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Your cart is empty</ThemedText>
          </ThemedView>
        }
        ListFooterComponent={
          cartItems.length > 0 ? (
            <ThemedView style={styles.footer}>
              <TouchableOpacity
                testID="btn-coupon"
                style={[styles.couponButton, couponApplied && styles.couponButtonActive]}
                onPress={handleApplyCoupon}
              >
                <ThemedText style={[styles.couponText, couponApplied && styles.couponTextActive]}>
                  {couponApplied ? 'SAVE10 Applied (-10%)' : 'Apply Coupon: SAVE10'}
                </ThemedText>
              </TouchableOpacity>

              <ThemedView style={styles.summaryRow}>
                <ThemedText>Subtotal</ThemedText>
                <ThemedText>${subtotal.toFixed(2)}</ThemedText>
              </ThemedView>

              {couponApplied && (
                <ThemedView style={styles.summaryRow}>
                  <ThemedText style={styles.discountText}>Discount</ThemedText>
                  <ThemedText style={styles.discountText}>-${discount.toFixed(2)}</ThemedText>
                </ThemedView>
              )}

              <ThemedView style={[styles.summaryRow, styles.totalRow]}>
                <ThemedText type="subtitle">Total</ThemedText>
                <ThemedText style={styles.totalPrice}>${total.toFixed(2)}</ThemedText>
              </ThemedView>

              <TouchableOpacity
                testID="btn-checkout"
                ph-label="checkout"
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <ThemedText style={styles.checkoutButtonText}>Checkout</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : null
        }
        renderItem={({ item }) => (
          <ThemedView style={styles.cartItem}>
            <ThemedView style={styles.itemInfo}>
              <ThemedText type="subtitle">{item.name}</ThemedText>
              <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
              <ThemedText style={styles.itemPrice}>
                ${item.price.toFixed(2)} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.itemActions}>
              <ThemedView style={styles.quantityControls}>
                <TouchableOpacity
                  testID={`btn-qty-minus-${item.productId}`}
                  style={styles.qtyButton}
                  onPress={() => handleUpdateQuantity(item.productId, -1)}
                >
                  <ThemedText style={styles.qtyButtonText}>-</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.qtyValue}>{item.quantity}</ThemedText>
                <TouchableOpacity
                  testID={`btn-qty-plus-${item.productId}`}
                  style={styles.qtyButton}
                  onPress={() => handleUpdateQuantity(item.productId, 1)}
                >
                  <ThemedText style={styles.qtyButtonText}>+</ThemedText>
                </TouchableOpacity>
              </ThemedView>

              <TouchableOpacity
                testID={`btn-remove-${item.productId}`}
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item.productId)}
              >
                <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    opacity: 0.5,
  },
  cartItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 12,
  },
  itemInfo: {
    gap: 4,
  },
  itemCategory: {
    fontSize: 14,
    opacity: 0.6,
    textTransform: 'capitalize',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFE5E5',
  },
  removeButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    marginTop: 12,
    gap: 12,
  },
  couponButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5856D6',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  couponButtonActive: {
    backgroundColor: '#5856D6',
    borderStyle: 'solid',
  },
  couponText: {
    color: '#5856D6',
    fontWeight: '600',
  },
  couponTextActive: {
    color: '#fff',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountText: {
    color: '#34C759',
    fontWeight: '500',
  },
  totalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
