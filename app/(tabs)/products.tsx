import { usePostHog } from 'posthog-react-native';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export const PRODUCTS = [
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

const CATEGORIES = ['all', 'electronics', 'sports', 'accessories'] as const;

export default function ProductsScreen() {
  const posthog = usePostHog();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      if (query.trim().length > 0) {
        posthog.capture('product_searched', {
          search_query: query.trim(),
          results_count: PRODUCTS.filter((p) =>
            p.name.toLowerCase().includes(query.toLowerCase())
          ).length,
        });
      }
    }, 500);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    posthog.capture('category_filtered', {
      category,
      previous_category: selectedCategory,
      results_count: PRODUCTS.filter(
        (p) => category === 'all' || p.category === category
      ).length,
    });
  };

  const handleProductPress = (product: (typeof PRODUCTS)[number]) => {
    posthog.capture('product_clicked', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_category: product.category,
      search_query: searchQuery || null,
      active_filter: selectedCategory,
    });
    router.push({ pathname: '/product/[id]', params: { id: product.id } });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.searchContainer}>
        <TextInput
          testID="search-input"
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
      </ThemedView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            testID={`filter-${category}`}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => handleCategoryFilter(category)}
          >
            <ThemedText
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No products found</ThemedText>
          </ThemedView>
        }
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
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
