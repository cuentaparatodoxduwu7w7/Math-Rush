import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout';
import { Card, Badge, Button, Modal } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_SHOP_ITEMS } from '../lib/mockData';

export default function ShopPage() {
  const { user, updateProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<typeof MOCK_SHOP_ITEMS[0] | null>(null);
  const [inventory, setInventory] = useState<string[]>(['s1']);

  if (!user) return null;

  const categories = [
    { id: 'all', label: 'Todo', icon: '🏪' },
    { id: 'skin', label: 'Skins', icon: '🐹' },
    { id: 'pet', label: 'Mascotas', icon: '🦙' },
    { id: 'background', label: 'Fondos', icon: '🌌' },
    { id: 'effect', label: 'Efectos', icon: '✨' },
  ];

  const filteredItems = selectedCategory === 'all'
    ? MOCK_SHOP_ITEMS
    : MOCK_SHOP_ITEMS.filter(item => item.category === selectedCategory);

  function handleBuy(item: typeof MOCK_SHOP_ITEMS[0]) {
    if (user && user.coins >= item.price_coins) {
      updateProfile({ coins: user.coins - item.price_coins });
      setInventory([...inventory, item.id]);
      setSelectedItem(null);
    }
  }

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40';
      case 'epic': return 'from-purple-500/20 to-pink-500/20 border-purple-500/40';
      case 'rare': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/40';
      default: return 'from-gray-500/10 to-gray-600/10 border-gray-500/30';
    }
  };

  const getRarityBadge = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return { color: 'yellow', label: 'LEGENDARIO' };
      case 'epic': return { color: 'purple', label: 'ÉPICO' };
      case 'rare': return { color: 'blue', label: 'RARO' };
      default: return { color: 'green', label: 'COMÚN' };
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">🛒 Tienda</h1>
            <p className="text-gray-400 text-sm">Personaliza tu experiencia Math Rush</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="card-glass rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-lg">🪙</span>
              <span className="font-bold text-rush-yellow">{user.coins.toLocaleString()}</span>
            </div>
            <div className="card-glass rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-lg">💎</span>
              <span className="font-bold text-rush-purple-light">{user.gems}</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-semibold transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-gradient-to-r from-rush-orange to-rush-orange-dark text-white shadow-lg shadow-rush-orange/30' 
                  : 'card-glass text-gray-400 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const owned = inventory.includes(item.id);
              const rarityBadge = getRarityBadge(item.rarity);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedItem(item)}
                  className={`cursor-pointer group relative rounded-2xl overflow-hidden bg-gradient-to-br ${getRarityColor(item.rarity)} border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-rush-darker to-rush-card">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="hidden w-full h-full items-center justify-center text-6xl bg-gradient-to-br from-rush-darker to-rush-card">
                      {item.icon}
                    </div>
                    
                    {/* Rarity Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge color={rarityBadge.color}>{rarityBadge.label}</Badge>
                    </div>

                    {/* Premium Badge */}
                    {item.is_premium && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-gradient-to-r from-rush-purple to-rush-purple-dark text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                          PREMIUM
                        </div>
                      </div>
                    )}

                    {/* Owned Overlay */}
                    {owned && (
                      <div className="absolute inset-0 bg-rush-green/20 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-rush-green text-white font-bold px-4 py-2 rounded-full shadow-lg">
                          ✓ ADQUIRIDO
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 bg-gradient-to-b from-rush-card/95 to-rush-darker/95">
                    <h3 className="font-bold text-base mb-1 text-white">{item.name}</h3>
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2 min-h-[2rem]">{item.description}</p>
                    
                    {!owned && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">🪙</span>
                          <span className="font-bold text-rush-yellow">{item.price_coins}</span>
                        </div>
                        {item.price_gems && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm">💎</span>
                            <span className="font-bold text-rush-purple-light">{item.price_gems}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Item Detail Modal */}
        <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="">
          {selectedItem && (
            <div>
              {/* Large Image */}
              <div className="relative w-full h-64 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-rush-darker to-rush-card">
                {selectedItem.image_url ? (
                  <img 
                    src={selectedItem.image_url} 
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="hidden w-full h-full items-center justify-center text-8xl bg-gradient-to-br from-rush-darker to-rush-card">
                  {selectedItem.icon}
                </div>
              </div>

              {/* Details */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display text-2xl font-bold">{selectedItem.name}</h3>
                  <Badge color={getRarityBadge(selectedItem.rarity).color}>
                    {getRarityBadge(selectedItem.rarity).label}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm">{selectedItem.description}</p>
              </div>

              {/* Price */}
              {!inventory.includes(selectedItem.id) && (
                <div className="card-glass rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Precio:</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">🪙</span>
                        <span className="font-bold text-rush-yellow text-lg">{selectedItem.price_coins}</span>
                      </div>
                      {selectedItem.price_gems && (
                        <div className="flex items-center gap-1">
                          <span className="text-lg">💎</span>
                          <span className="font-bold text-rush-purple-light text-lg">{selectedItem.price_gems}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {inventory.includes(selectedItem.id) ? (
                <Button variant="ghost" className="w-full" disabled>✓ Ya lo tienes</Button>
              ) : user.coins >= selectedItem.price_coins ? (
                <Button variant="primary" className="w-full" onClick={() => handleBuy(selectedItem)}>
                  COMPRAR 🪙 {selectedItem.price_coins}
                </Button>
              ) : (
                <div>
                  <p className="text-red-400 text-sm mb-3 text-center">No tienes suficientes monedas</p>
                  <Button variant="outline" className="w-full">Obtener más monedas</Button>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Inventory Section */}
        <div className="mt-10">
          <h2 className="font-display text-2xl font-bold mb-4">🎒 Mi Inventario</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {MOCK_SHOP_ITEMS.filter(item => inventory.includes(item.id)).map(item => (
              <div key={item.id} className="card-glass rounded-xl p-3 text-center hover:border-rush-green/50 transition-all">
                <div className="relative w-full h-20 mb-2 rounded-lg overflow-hidden bg-rush-darker">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="hidden w-full h-full items-center justify-center text-3xl bg-rush-darker">
                    {item.icon}
                  </div>
                </div>
                <p className="text-xs font-medium truncate">{item.name}</p>
              </div>
            ))}
            {inventory.length === 0 && (
              <p className="text-gray-500 text-sm col-span-full text-center py-8">Tu inventario está vacío. ¡Compra tu primer item!</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
