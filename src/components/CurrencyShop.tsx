import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Badge } from '../components/ui';
import { useEconomy, ShopProduct } from '../hooks/useEconomy';
import { useAuth } from '../contexts/AuthContext';

type CurrencyTab = 'coins' | 'gems' | 'tokens';

export default function CurrencyShop() {
  const { user } = useAuth();
  const { 
    balances, 
    products, 
    loading, 
    error, 
    purchaseProduct, 
    fetchBalances,
    clearError 
  } = useEconomy();
  
  const [activeTab, setActiveTab] = useState<CurrencyTab>('coins');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<ShopProduct | null>(null);

  // Filter products by category
  const currencyProducts = products.filter(p => p.category === 'currency');
  
  // Get price for active tab
  const getPrice = (product: ShopProduct): number => {
    switch (activeTab) {
      case 'coins': return product.price_coins;
      case 'gems': return product.price_gems;
      case 'tokens': return product.price_tokens;
      default: return 0;
    }
  };

  // Get balance for active tab
  const getBalance = (): number => {
    return balances[activeTab];
  };

  // Get currency icon
  const getCurrencyIcon = (currency: CurrencyTab): string => {
    switch (currency) {
      case 'coins': return '🪙';
      case 'gems': return '💎';
      case 'tokens': return '🎟️';
      default: return '';
    }
  };

  // Get currency name
  const getCurrencyName = (currency: CurrencyTab): string => {
    switch (currency) {
      case 'coins': return 'Monedas';
      case 'gems': return 'Gemas';
      case 'tokens': return 'Tokens';
      default: return '';
    }
  };

  // Handle purchase
  const handlePurchase = async (product: ShopProduct) => {
    if (!user) return;
    
    const price = getPrice(product);
    const balance = getBalance();
    
    if (balance < price) {
      alert(`No tienes suficientes ${getCurrencyName(activeTab).toLowerCase()}`);
      return;
    }

    setPurchasing(product.id);
    
    try {
      const result = await purchaseProduct(product.id, activeTab);
      if (result.success) {
        setLastPurchase(product);
        setShowSuccess(true);
        await fetchBalances();
        
        setTimeout(() => {
          setShowSuccess(false);
          setLastPurchase(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Purchase failed:', err);
    } finally {
      setPurchasing(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-400">Debes iniciar sesión para acceder a la tienda</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-rush-orange to-rush-yellow bg-clip-text text-transparent">
          TIENDA DE MONEDAS
        </h1>
        <p className="text-gray-400">
          Gestiona tus monedas, gemas y tokens para desbloquear contenido exclusivo
        </p>
      </motion.div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(['coins', 'gems', 'tokens'] as CurrencyTab[]).map((currency) => (
          <motion.div
            key={currency}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab(currency)}
            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all ${
              activeTab === currency
                ? 'border-rush-orange bg-rush-orange/10'
                : 'border-rush-purple/30 bg-rush-card/50 hover:border-rush-purple/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{getCurrencyIcon(currency)}</div>
                <div>
                  <p className="text-sm text-gray-400">{getCurrencyName(currency)}</p>
                  <p className="text-2xl font-bold">
                    {balances[currency].toLocaleString()}
                  </p>
                </div>
              </div>
              {activeTab === currency && (
                <Badge color="orange">ACTIVO</Badge>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Success Message */}
      {showSuccess && lastPurchase && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-gradient-to-r from-rush-green/20 to-emerald-500/20 border-2 border-rush-green/50 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3">
            <div className="text-4xl">✅</div>
            <div>
              <p className="font-bold text-rush-green text-lg">¡Compra exitosa!</p>
              <p className="text-sm text-gray-300">
                Has comprado {lastPurchase.name}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <p className="font-bold text-red-400">Error</p>
                <p className="text-sm text-gray-300">{error}</p>
              </div>
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Products Grid */}
      <div>
        <h2 className="font-display text-2xl font-bold mb-4">
          {getCurrencyIcon(activeTab)} Paquetes de {getCurrencyName(activeTab)}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-rush-card/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : currencyProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">No hay productos disponibles en este momento</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currencyProducts.map((product, index) => {
              const price = getPrice(product);
              const balance = getBalance();
              const canAfford = balance >= price;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-6 h-full flex flex-col ${
                    product.is_premium ? 'border-rush-purple/50 bg-gradient-to-br from-rush-purple/10 to-rush-card/50' : ''
                  }`}>
                    {/* Product Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          {product.is_premium && (
                            <Badge color="purple">PREMIUM</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{product.description}</p>
                      </div>
                      <div className="text-4xl ml-4">
                        {getCurrencyIcon(activeTab)}
                      </div>
                    </div>

                    {/* Product Content */}
                    <div className="flex-1 mb-4">
                      {product.content && (
                        <div className="bg-rush-darker/50 rounded-xl p-4">
                          <div className="text-center">
                            <p className="text-3xl font-black text-rush-orange mb-1">
                              {product.content[activeTab]?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-gray-400">
                              {getCurrencyName(activeTab)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price and Purchase */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Precio:</span>
                        <span className="font-bold text-rush-yellow">
                          {getCurrencyIcon(activeTab)} {price.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Tu saldo:</span>
                        <span className={`font-bold ${canAfford ? 'text-rush-green' : 'text-red-400'}`}>
                          {getCurrencyIcon(activeTab)} {balance.toLocaleString()}
                        </span>
                      </div>

                      <Button
                        variant={canAfford ? 'primary' : 'outline'}
                        className="w-full"
                        onClick={() => handlePurchase(product)}
                        disabled={!canAfford || purchasing === product.id}
                      >
                        {purchasing === product.id ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin">⚙️</span>
                            Procesando...
                          </span>
                        ) : canAfford ? (
                          `Comprar ${getCurrencyName(activeTab)}`
                        ) : (
                          'Saldo insuficiente'
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-12 card-glass rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4">💡 Información importante</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-start gap-3">
            <span className="text-xl">🪙</span>
            <div>
              <p className="font-bold text-white mb-1">Monedas Rush</p>
              <p>Gánalas jugando, completando misiones y logros. Úsalas para comprar skins, mascotas, fondos y efectos.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">💎</span>
            <div>
              <p className="font-bold text-white mb-1">Gemas</p>
              <p>Moneda premium para items exclusivos y características especiales. Se obtienen mediante logros especiales o compras.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🎟️</span>
            <div>
              <p className="font-bold text-white mb-1">Tokens</p>
              <p>Úsalos para intentos extra de IA. 1 token = 1 intento para otras IAs, 3 tokens = 1 intento para el Diseñador de Mundo.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 bg-rush-orange/10 border border-rush-orange/30 rounded-xl p-4">
        <p className="text-xs text-rush-orange text-center">
          🔒 Todas las transacciones son procesadas de forma segura en el servidor. 
          El frontend nunca modifica directamente los balances.
        </p>
      </div>
    </div>
  );
}
