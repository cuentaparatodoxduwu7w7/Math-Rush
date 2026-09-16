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
  const [equippedItems, setEquippedItems] = useState<Record<string, string>>({
    skin: 's1',
    pet: '',
    background: '',
    effect: ''
  });

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

  function handleEquip(item: typeof MOCK_SHOP_ITEMS[0]) {
    setEquippedItems({ ...equippedItems, [item.category]: item.id });
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
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 rounded-3xl overflow-hidden card-elevated"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rush-orange/30 via-rush-purple/20 to-rush-blue/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-rush-yellow/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -40, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Characters */}
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative"
                >
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-rush-orange to-rush-yellow flex items-center justify-center shadow-2xl glow-orange">
                    <img 
                      src="https://image.qwenlm.ai/generated-images/88ab4c3a-01d1-41c4-b17e-2e84faabf6ed/_result.png"
                      alt="Cuy Gamer"
                      className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-4xl md:text-5xl">🐹</span>';
                      }}
                    />
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                  className="relative hidden md:block"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rush-purple to-rush-blue flex items-center justify-center shadow-xl glow-purple">
                    <img 
                      src="https://image.qwenlm.ai/generated-images/a10a7b6c-a6e8-4a96-99a6-ed451da3f033/_result.png"
                      alt="Cuy Dorado"
                      className="w-12 h-12 object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl">👑</span>';
                      }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Title */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-rush-orange via-rush-yellow to-rush-orange bg-clip-text text-transparent">
                  TIENDA
                </h1>
                <p className="text-gray-300 text-base md:text-lg">
                  Personaliza tu experiencia con skins, mascotas y efectos únicos
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Currency Display */}
        <div className="flex items-center gap-4 mb-8">
          <div className="card-elevated rounded-xl px-5 py-3 flex items-center gap-3 flex-1 max-w-xs">
            <div className="w-10 h-10 bg-gradient-to-br from-rush-yellow to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl">🪙</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Monedas Rush</p>
              <p className="font-bold text-rush-yellow text-lg">{user.coins.toLocaleString()}</p>
            </div>
          </div>
          <div className="card-elevated rounded-xl px-5 py-3 flex items-center gap-3 flex-1 max-w-xs">
            <div className="w-10 h-10 bg-gradient-to-br from-rush-purple to-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl">💎</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Gemas</p>
              <p className="font-bold text-rush-purple-light text-lg">{user.gems}</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl whitespace-nowrap text-sm font-bold transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-gradient-to-r from-rush-orange to-rush-orange-dark text-white shadow-lg shadow-rush-orange/40 border-2 border-rush-orange' 
                  : 'card-glass text-gray-400 hover:text-white hover:border-rush-purple/50 border-2 border-transparent'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span>{cat.label}</span>
              {selectedCategory === cat.id && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-gradient-to-r from-rush-orange to-rush-orange-dark rounded-xl -z-10"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const owned = inventory.includes(item.id);
              const equipped = equippedItems[item.category] === item.id;
              const rarityBadge = getRarityBadge(item.rarity);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedItem(item)}
                  className={`cursor-pointer group relative rounded-2xl overflow-hidden bg-gradient-to-br ${getRarityColor(item.rarity)} border-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-rush-orange/20`}
                  style={{
                    boxShadow: equipped ? '0 0 30px rgba(34, 197, 94, 0.4)' : undefined,
                  }}
                >
                  {/* Image Container - 45% of card */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-rush-darker to-rush-card">
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
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Rarity Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge color={rarityBadge.color}>{rarityBadge.label}</Badge>
                    </div>

                    {/* Premium Badge */}
                    {item.is_premium && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-gradient-to-r from-rush-purple to-rush-purple-dark text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                          <span>⭐</span>
                          <span>PREMIUM</span>
                        </div>
                      </div>
                    )}

                    {/* Status Overlay */}
                    {owned && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-4">
                        {equipped ? (
                          <div className="bg-gradient-to-r from-rush-green to-green-600 text-white font-bold px-5 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <span>✓</span>
                            <span>EQUIPADO</span>
                          </div>
                        ) : (
                          <div className="bg-rush-green/90 backdrop-blur-sm text-white font-bold px-5 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <span>✓</span>
                            <span>ADQUIRIDO</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-t from-rush-orange/20 via-transparent to-transparent" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 bg-gradient-to-b from-rush-card/95 to-rush-darker/95">
                    <h3 className="font-bold text-lg mb-2 text-white">{item.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
                    
                    {!owned && (
                      <div className="flex items-center justify-between pt-3 border-t border-rush-purple/20">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-rush-yellow/20 rounded-full flex items-center justify-center">
                            <span className="text-lg">🪙</span>
                          </div>
                          <span className="font-bold text-rush-yellow text-lg">{item.price_coins.toLocaleString()}</span>
                        </div>
                        {item.price_gems && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-rush-purple/20 rounded-full flex items-center justify-center">
                              <span className="text-lg">💎</span>
                            </div>
                            <span className="font-bold text-rush-purple-light text-lg">{item.price_gems}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {owned && !equipped && (
                      <div className="pt-3 border-t border-rush-purple/20">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquip(item);
                          }}
                          className="w-full bg-gradient-to-r from-rush-green to-green-600 text-white font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-rush-green/30 transition-all"
                        >
                          EQUIPAR
                        </button>
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
          {selectedItem && (() => {
            const owned = inventory.includes(selectedItem.id);
            const equipped = equippedItems[selectedItem.category] === selectedItem.id;
            const rarityBadge = getRarityBadge(selectedItem.rarity);
            
            return (
              <div>
                {/* Large Image */}
                <div className="relative w-full h-80 mb-5 rounded-2xl overflow-hidden bg-gradient-to-br from-rush-darker to-rush-card">
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
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge color={rarityBadge.color}>{rarityBadge.label}</Badge>
                    {selectedItem.is_premium && (
                      <div className="bg-gradient-to-r from-rush-purple to-rush-purple-dark text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <span>⭐</span>
                        <span>PREMIUM</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  {owned && (
                    <div className="absolute bottom-4 left-4 right-4">
                      {equipped ? (
                        <div className="bg-gradient-to-r from-rush-green to-green-600 text-white font-bold px-5 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg">
                          <span>✓</span>
                          <span>EQUIPADO</span>
                        </div>
                      ) : (
                        <div className="bg-rush-green/90 backdrop-blur-sm text-white font-bold px-5 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg">
                          <span>✓</span>
                          <span>ADQUIRIDO</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="mb-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-3xl font-bold">{selectedItem.name}</h3>
                    <span className="text-3xl">{selectedItem.icon}</span>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">{selectedItem.description}</p>
                </div>

                {/* Requirements */}
                {!owned && (
                  <div className="card-glass rounded-xl p-5 mb-5">
                    <h4 className="font-bold text-sm mb-3 text-gray-400">REQUISITOS</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Monedas Rush:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-rush-yellow/20 rounded-full flex items-center justify-center">
                            <span>🪙</span>
                          </div>
                          <span className="font-bold text-rush-yellow text-lg">{selectedItem.price_coins.toLocaleString()}</span>
                        </div>
                      </div>
                      {selectedItem.price_gems && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Gemas:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-rush-purple/20 rounded-full flex items-center justify-center">
                              <span>💎</span>
                            </div>
                            <span className="font-bold text-rush-purple-light text-lg">{selectedItem.price_gems}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-rush-purple/20">
                        <span className="text-sm text-gray-400">Tu saldo:</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-rush-yellow">🪙 {user.coins.toLocaleString()}</span>
                          <span className="font-bold text-rush-purple-light">💎 {user.gems}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!owned ? (
                  user.coins >= selectedItem.price_coins ? (
                    <Button variant="primary" className="w-full" size="lg" onClick={() => handleBuy(selectedItem)}>
                      <span className="flex items-center justify-center gap-2">
                        <span>COMPRAR</span>
                        <span>🪙</span>
                        <span>{selectedItem.price_coins.toLocaleString()}</span>
                      </span>
                    </Button>
                  ) : (
                    <div>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-3">
                        <p className="text-red-400 text-sm text-center">
                          No tienes suficientes monedas. Te faltan {(selectedItem.price_coins - user.coins).toLocaleString()} 🪙
                        </p>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => setSelectedItem(null)}>
                        Obtener más monedas
                      </Button>
                    </div>
                  )
                ) : equipped ? (
                  <Button variant="ghost" className="w-full" size="lg" disabled>
                    ✓ YA EQUIPADO
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      handleEquip(selectedItem);
                      setSelectedItem(null);
                    }}
                  >
                    EQUIPAR
                  </Button>
                )}
              </div>
            );
          })()}
        </Modal>

        {/* Inventory Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-3xl font-bold">🎒 Mi Inventario</h2>
            <Badge color="green">{inventory.length} items</Badge>
          </div>
          
          {inventory.length === 0 ? (
            <div className="card-glass rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="font-bold text-xl mb-2">Tu inventario está vacío</h3>
              <p className="text-gray-400">¡Compra tu primer item para comenzar a personalizar tu experiencia!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {MOCK_SHOP_ITEMS.filter(item => inventory.includes(item.id)).map(item => {
                const equipped = equippedItems[item.category] === item.id;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedItem(item)}
                    className={`cursor-pointer relative rounded-xl overflow-hidden border-2 transition-all ${
                      equipped 
                        ? 'border-rush-green bg-rush-green/10 shadow-lg shadow-rush-green/30' 
                        : 'border-rush-purple/30 bg-rush-card hover:border-rush-purple/60'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative w-full h-24 overflow-hidden bg-rush-darker">
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
                      
                      {/* Equipped indicator */}
                      {equipped && (
                        <div className="absolute top-1 right-1 bg-rush-green text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                          ✓
                        </div>
                      )}

                      {/* Premium indicator */}
                      {item.is_premium && (
                        <div className="absolute top-1 left-1 bg-rush-purple text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          ⭐
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <p className="text-xs font-bold truncate">{item.name}</p>
                      {equipped && (
                        <p className="text-[10px] text-rush-green font-semibold">EQUIPADO</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
