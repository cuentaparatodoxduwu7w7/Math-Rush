import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface CurrencyBalances {
  coins: number;
  gems: number;
  tokens: number;
}

export interface Transaction {
  id: string;
  currency_type: 'coins' | 'gems' | 'tokens';
  transaction_type: string;
  amount: number;
  balance_after: number;
  reason: string;
  created_at: string;
  metadata?: any;
}

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  category: 'skin' | 'pet' | 'background' | 'effect' | 'currency';
  price_coins: number;
  price_gems: number;
  price_tokens: number;
  content: any;
  is_premium: boolean;
}

export function useEconomy() {
  const [balances, setBalances] = useState<CurrencyBalances>({
    coins: 0,
    gems: 0,
    tokens: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch balances
  const fetchBalances = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-balances`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch balances');

      const data = await response.json();
      setBalances(data.balances);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction history
  const fetchTransactions = async (currencyType?: 'coins' | 'gems' | 'tokens', limit = 50) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const params = new URLSearchParams({ limit: limit.toString() });
      if (currencyType) params.append('currency_type', currencyType);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-transaction-history?${params}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch shop products
  const fetchProducts = async (category?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-shop-products?${params}`
      );

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Purchase product
  const purchaseProduct = async (productId: string, currency: 'coins' | 'gems' | 'tokens') => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const idempotencyKey = uuidv4();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/purchase-product`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            product_id: productId,
            currency,
            idempotency_key: idempotencyKey,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Purchase failed');
      }

      const data = await response.json();
      
      // Update local balance
      setBalances(prev => ({
        ...prev,
        [currency]: data.new_balance,
      }));

      return { success: true, product: data.product };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Purchase failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    fetchBalances();
    fetchProducts();
  }, []);

  return {
    balances,
    transactions,
    products,
    loading,
    error,
    fetchBalances,
    fetchTransactions,
    fetchProducts,
    purchaseProduct,
    clearError: () => setError(null),
  };
}
