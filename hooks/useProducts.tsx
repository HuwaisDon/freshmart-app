// Powered by OnSpace.AI
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/constants/mockData';
import { getProducts, getOfferProducts, searchProducts } from '@/services/productService';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [all, off] = await Promise.all([getProducts(), getOfferProducts()]);
    setProducts(all);
    setOffers(off);
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return products;
    return searchProducts(query);
  }, [products]);

  return { products, offers, isLoading, reload: load, search };
}
    