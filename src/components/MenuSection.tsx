import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Utensils, 
  Coffee, 
  Cake, 
  Sparkles, 
  Check, 
  Flame,
  Layers,
  X
} from 'lucide-react';
import { Category, MenuItem, OrderItem } from '../types';
import { sound } from '../utils/audio';

interface MenuSectionProps {
  menuItems: MenuItem[];
  quantities: Record<string, number>;
  onQuantityChange: (itemId: string, qty: number) => void;
  onOpenAddItem: (defaultCategory?: Category) => void;
  costOfFood: number;
  costOfDrinks: number;
  costOfCakes: number;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  menuItems,
  quantities,
  onQuantityChange,
  onOpenAddItem,
  costOfFood,
  costOfDrinks,
  costOfCakes,
}) => {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  const foodItems = useMemo(() => filteredItems.filter((i) => i.category === 'food'), [filteredItems]);
  const drinksItems = useMemo(() => filteredItems.filter((i) => i.category === 'drinks'), [filteredItems]);
  const cakesItems = useMemo(() => filteredItems.filter((i) => i.category === 'cakes' || i.category === 'custom'), [filteredItems]);

  const handleToggle = (itemId: string) => {
    const current = quantities[itemId] || 0;
    if (current > 0) {
      onQuantityChange(itemId, 0);
    } else {
      onQuantityChange(itemId, 1);
      sound.playAdd();
    }
  };

  const handleIncrement = (itemId: string, amount = 1) => {
    const current = quantities[itemId] || 0;
    onQuantityChange(itemId, current + amount);
    sound.playAdd();
  };

  const handleDecrement = (itemId: string) => {
    const current = quantities[itemId] || 0;
    if (current > 0) {
      onQuantityChange(itemId, current - 1);
      sound.playClick();
    }
  };

  const handleDirectInput = (itemId: string, value: string) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) {
      onQuantityChange(itemId, 0);
    } else {
      onQuantityChange(itemId, parsed);
    }
  };

  const renderCategoryColumn = (
    title: string,
    categoryKey: Category,
    items: MenuItem[],
    categoryTotal: number,
    icon: React.ReactNode,
    headerBg: string,
    accentColor: string
  ) => {
    return (
      <div className="w-full bg-zinc-900/85 backdrop-blur-md border border-zinc-800/90 rounded-2xl overflow-hidden shadow-xl flex flex-col">
        {/* Category Header */}
        <div className={`px-3.5 py-3 ${headerBg} border-b border-zinc-800/80 flex items-center justify-between text-zinc-100 shadow-inner`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-xl bg-zinc-950/60 border border-zinc-700/40 text-amber-400 shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-xs sm:text-sm tracking-wide flex items-center gap-1.5 text-zinc-100 truncate">
                <span className="truncate">{title}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-950/70 border border-zinc-700/50 text-amber-300 shrink-0">
                  {items.length}
                </span>
              </h3>
              <p className="text-[10px] text-zinc-400 font-medium truncate">
                Total: <span className="font-bold text-amber-300">₹{categoryTotal.toLocaleString('en-IN')}</span>
              </p>
            </div>
          </div>
          <button
            id={`btn-add-to-${categoryKey}`}
            onClick={() => onOpenAddItem(categoryKey)}
            title={`Add new item to ${title}`}
            className="p-1.5 rounded-xl bg-zinc-950/50 hover:bg-zinc-950 border border-zinc-700/40 text-zinc-300 hover:text-white transition shadow-xs shrink-0 ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item List */}
        <div className="p-2.5 space-y-2 flex-1 h-[520px] max-h-[calc(100vh-270px)] overflow-y-auto custom-scrollbar">
          {items.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No {title.toLowerCase()} items found
            </div>
          ) : (
            items.map((item) => {
              const qty = quantities[item.id] || 0;
              const isSelected = qty > 0;
              const itemTotal = qty * item.price;

              return (
                <div
                  key={item.id}
                  id={`item-card-${item.id}`}
                  className={`group relative rounded-xl border p-2 transition-all duration-150 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-zinc-950/50 hover:bg-zinc-800/60 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    {/* Checkbox + Title */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        id={`check-${item.id}`}
                        onClick={() => handleToggle(item.id)}
                        className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-zinc-950 font-black shadow-sm ring-1 ring-amber-300'
                            : 'border border-zinc-700 hover:border-amber-400 bg-zinc-900/90 text-transparent'
                        }`}
                        title={isSelected ? 'Deselect item' : 'Select item'}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div 
                        onClick={() => handleToggle(item.id)}
                        className="cursor-pointer flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-sm leading-none shrink-0">{item.icon || '🍽️'}</span>
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                            {item.name}
                          </span>
                          {item.isVeg && (
                            <span className="w-2.5 h-2.5 border border-emerald-500 rounded-xs flex items-center justify-center p-0.5 shrink-0" title="Vegetarian">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-semibold text-emerald-400 font-mono">
                            ₹{item.price}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/50 px-1 py-0.2 rounded border border-amber-800/50 font-mono">
                              = ₹{itemTotal}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper (compact) */}
                    <div className="flex items-center gap-0.5 bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 shrink-0 shadow-inner">
                      <button
                        id={`btn-dec-${item.id}`}
                        onClick={() => handleDecrement(item.id)}
                        disabled={qty <= 0}
                        className={`w-5 h-5 rounded flex items-center justify-center transition ${
                          qty > 0
                            ? 'bg-zinc-800 hover:bg-rose-900/80 text-zinc-200 hover:text-white'
                            : 'text-zinc-700 cursor-not-allowed'
                        }`}
                      >
                        <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
                      </button>

                      <input
                        id={`input-qty-${item.id}`}
                        type="number"
                        min="0"
                        max="999"
                        value={qty === 0 ? '0' : qty}
                        onChange={(e) => handleDirectInput(item.id, e.target.value)}
                        className={`w-7 text-center font-bold text-[11px] py-0.5 rounded bg-transparent focus:outline-none focus:bg-zinc-800 font-mono ${
                          qty > 0 ? 'text-amber-300 font-extrabold' : 'text-zinc-500'
                        }`}
                      />

                      <button
                        id={`btn-inc-${item.id}`}
                        onClick={() => handleIncrement(item.id, 1)}
                        className="w-5 h-5 rounded flex items-center justify-center bg-zinc-800 hover:bg-emerald-700 text-zinc-200 hover:text-white transition"
                      >
                        <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Category Tabs & Quick Search */}
      <div className="bg-zinc-900/85 backdrop-blur-md border border-zinc-800/90 p-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center flex-wrap gap-1.5">
          <button
            id="tab-all"
            onClick={() => { sound.playClick(); setActiveCategory('all'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-amber-400 text-zinc-950 shadow-md font-extrabold scale-102 shadow-amber-400/20'
                : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700/80 border border-zinc-700/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Items ({menuItems.length})</span>
          </button>

          <button
            id="tab-food"
            onClick={() => { sound.playClick(); setActiveCategory('food'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'food'
                ? 'bg-rose-600 text-white shadow-md font-extrabold scale-102 shadow-rose-600/20'
                : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700/80 border border-zinc-700/40'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Food</span>
            {costOfFood > 0 && (
              <span className="ml-1 text-[10px] bg-rose-950 px-1.5 py-0.5 rounded font-black text-rose-300 font-mono">
                ₹{costOfFood}
              </span>
            )}
          </button>

          <button
            id="tab-drinks"
            onClick={() => { sound.playClick(); setActiveCategory('drinks'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'drinks'
                ? 'bg-sky-600 text-white shadow-md font-extrabold scale-102 shadow-sky-600/20'
                : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700/80 border border-zinc-700/40'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Drinks</span>
            {costOfDrinks > 0 && (
              <span className="ml-1 text-[10px] bg-sky-950 px-1.5 py-0.5 rounded font-black text-sky-300 font-mono">
                ₹{costOfDrinks}
              </span>
            )}
          </button>

          <button
            id="tab-cakes"
            onClick={() => { sound.playClick(); setActiveCategory('cakes'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'cakes'
                ? 'bg-purple-600 text-white shadow-md font-extrabold scale-102 shadow-purple-600/20'
                : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700/80 border border-zinc-700/40'
            }`}
          >
            <Cake className="w-3.5 h-3.5" />
            <span>Cakes &amp; Desserts</span>
            {costOfCakes > 0 && (
              <span className="ml-1 text-[10px] bg-purple-950 px-1.5 py-0.5 rounded font-black text-purple-300 font-mono">
                ₹{costOfCakes}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            id="menu-search-input"
            type="text"
            placeholder="Search menu (Roti, Coffee, Oreo...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pl-9 pr-8 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3 Categories Bento Grid Layout (Food, Drinks, Cakes) - aligned in 1 line side-by-side */}
      <div className={`grid gap-3 ${
        activeCategory === 'all' 
          ? 'grid-cols-1 md:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {(activeCategory === 'all' || activeCategory === 'food') && (
          renderCategoryColumn(
            'Food Menu',
            'food',
            foodItems,
            costOfFood,
            <Utensils className="w-5 h-5" />,
            'bg-zinc-950/90',
            'rose'
          )
        )}

        {(activeCategory === 'all' || activeCategory === 'drinks') && (
          renderCategoryColumn(
            'Beverages & Drinks',
            'drinks',
            drinksItems,
            costOfDrinks,
            <Coffee className="w-5 h-5" />,
            'bg-zinc-950/90',
            'sky'
          )
        )}

        {(activeCategory === 'all' || activeCategory === 'cakes' || activeCategory === 'custom') && (
          renderCategoryColumn(
            'Cakes & Desserts',
            'cakes',
            cakesItems,
            costOfCakes,
            <Cake className="w-5 h-5" />,
            'bg-zinc-950/90',
            'purple'
          )
        )}
      </div>
    </div>
  );
};
