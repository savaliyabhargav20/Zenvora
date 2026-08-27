import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { Category, MenuItem } from '../types';

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: MenuItem) => void;
  defaultCategory?: Category;
}

export const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  defaultCategory = 'food',
}) => {
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [price, setPrice] = useState<string>('');
  const [icon, setIcon] = useState<string>('🍽️');
  const [description, setDescription] = useState<string>('');
  const [isVeg, setIsVeg] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (!name.trim() || isNaN(parsedPrice) || parsedPrice <= 0) return;

    const newItem: MenuItem = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      category,
      price: parsedPrice,
      icon: icon.trim() || '🍽️',
      description: description.trim() || 'Custom special menu item',
      isVeg,
    };

    onAddItem(newItem);
    setName('');
    setPrice('');
    setDescription('');
    onClose();
  };

  const quickIcons = ['🍲', '🥘', '🍕', '🍜', '☕', '🍹', '🍧', '🍰', '🎂', '🧁', '🍪', '🍨', '🥐', '🥗'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white border border-zinc-300 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-zinc-950 flex flex-col">
        {/* Header */}
        <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black text-white font-black shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-black text-base tracking-wide text-zinc-950 uppercase">
                Add New Menu Item
              </h3>
              <p className="text-xs text-zinc-500">Create a new item in Food, Drinks, or Cakes</p>
            </div>
          </div>
          <button
            id="btn-close-add-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wide mb-1">
              Item Name <span className="text-zinc-500">*</span>
            </label>
            <input
              id="input-new-item-name"
              type="text"
              required
              placeholder="e.g. Butter Naan, Cold Brew, Chocolate Lava"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-sm text-zinc-950 font-bold focus:outline-none focus:ring-1 focus:ring-black placeholder-zinc-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wide mb-1">
                Category
              </label>
              <select
                id="select-new-item-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-950 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="food">Food</option>
                <option value="drinks">Drinks</option>
                <option value="cakes">Cakes &amp; Desserts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wide mb-1">
                Price (₹) <span className="text-zinc-500">*</span>
              </label>
              <input
                id="input-new-item-price"
                type="number"
                step="1"
                min="1"
                required
                placeholder="150"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-zinc-950 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* Quick Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wide mb-1">
              Select Emoji Icon
            </label>
            <div className="flex flex-wrap gap-1.5 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
              {quickIcons.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-8 h-8 rounded-xl text-lg flex items-center justify-center transition border ${
                    icon === ic 
                      ? 'bg-black text-white border-black scale-105 shadow-xs' 
                      : 'bg-white border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wide mb-1">
              Description (Optional)
            </label>
            <input
              id="input-new-item-desc"
              type="text"
              placeholder="Short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black placeholder-zinc-400"
            />
          </div>

          {/* Veg Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="check-is-veg"
              type="checkbox"
              checked={isVeg}
              onChange={(e) => setIsVeg(e.target.checked)}
              className="w-4 h-4 rounded text-black bg-white border-zinc-400 focus:ring-0 accent-black"
            />
            <label htmlFor="check-is-veg" className="text-xs font-bold text-zinc-800 cursor-pointer">
              Vegetarian Item
            </label>
          </div>

          <button
            id="btn-confirm-add-item"
            type="submit"
            className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition transform active:scale-95 flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Item to Menu</span>
          </button>
        </form>
      </div>
    </div>
  );
};
