import React, { useState } from 'react';
import { AppLayout } from '../components/layout';
import { Card, Badge, Button, Modal } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_SHOP_ITEMS } from '../lib/mockData';

export default function ShopPage() {
  const { user, updateProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<typeof MOCK_SHOP_ITEMS[0] | null>(null);
  const [inventory, setInventory] = useState<string[]>(['s1']); // Own Cuy Gamer

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

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">🛒 Tienda</h1>
          <div className="flex items-center gap-3">
            <Badge color="yellow">🪙 {user.coins.toLocaleString()}</Badge>
            <Badge color="purple">💎 {user.gems}</Badge>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === cat.id ? 'bg-rush-orange text-white' : 'bg-rush-card text-gray-400 hover:text-white'}`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const owned = inventory.includes(item.id);
            return (
              <div key={item.id} onClick={() => setSelectedItem(item)} className="cursor-pointer">
                <Card className="p-4 text-center hover:border-rush-orange/50 transition-all">
                  {item.image_url ? (
                    <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-rush-darker">
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <span className="hidden text-4xl absolute inset-0 flex items-center justify-center">{item.icon}</span>
                    </div>
                  ) : (
                    <span className="text-4xl mb-3 block">{item.icon}</span>
                  )}
                  <h3 className="font-bold text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">{item.description}</p>
                  {owned ? (
                    <Badge color="green">✓ Adquirido</Badge>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm font-bold text-rush-yellow">🪙 {item.price_coins}</span>
                      {item.is_premium && <Badge color="purple">PREMIUM</Badge>}
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>

        {/* Item Detail Modal */}
        <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem?.name}>
          {selectedItem && (
            <div className="text-center">
              {selectedItem.image_url ? (
                <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-rush-darker">
                  <img 
                    src={selectedItem.image_url} 
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="hidden text-6xl absolute inset-0 flex items-center justify-center">{selectedItem.icon}</span>
                </div>
              ) : (
                <span className="text-6xl mb-4 block">{selectedItem.icon}</span>
              )}
              <p className="text-gray-400 mb-4">{selectedItem.description}</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-lg font-bold text-rush-yellow">🪙 {selectedItem.price_coins}</span>
                {selectedItem.price_gems && (
                  <span className="text-lg font-bold text-rush-purple">💎 {selectedItem.price_gems}</span>
                )}
              </div>
              {inventory.includes(selectedItem.id) ? (
                <Button variant="ghost" className="w-full" disabled>✓ Ya lo tienes</Button>
              ) : user.coins >= selectedItem.price_coins ? (
                <Button variant="primary" className="w-full" onClick={() => handleBuy(selectedItem)}>
                  COMPRAR 🪙 {selectedItem.price_coins}
                </Button>
              ) : (
                <div>
                  <p className="text-red-400 text-sm mb-3">No tienes suficientes monedas</p>
                  <Button variant="outline" className="w-full">Obtener más monedas</Button>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Inventory Section */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold mb-4">🎒 Mi Inventario</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {MOCK_SHOP_ITEMS.filter(item => inventory.includes(item.id)).map(item => (
              <Card key={item.id} className="p-3 text-center border-rush-green/30">
                {item.image_url ? (
                  <div className="relative w-full h-20 mb-1 rounded-lg overflow-hidden bg-rush-darker">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <span className="hidden text-2xl absolute inset-0 flex items-center justify-center">{item.icon}</span>
                  </div>
                ) : (
                  <span className="text-3xl">{item.icon}</span>
                )}
                <p className="text-xs font-medium mt-1">{item.name}</p>
              </Card>
            ))}
            {inventory.length === 0 && (
              <p className="text-gray-500 text-sm col-span-full text-center py-4">Tu inventario está vacío.</p>
            )}
          </div>
        </div>

        <div className="mt-6 card-glass rounded-xl p-4">
          <p className="text-xs text-gray-500">
            <span className="text-rush-orange font-bold">MOCK ONLY:</span> Las compras se validan en backend. El saldo no puede ser modificado desde el frontend.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
