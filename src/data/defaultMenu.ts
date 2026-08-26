import { MenuItem } from '../types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Food items from original app
  { id: 'food_roti', name: 'Roti', category: 'food', price: 10, icon: '🫓', description: 'Freshly baked whole wheat flatbread', isVeg: true },
  { id: 'food_daal', name: 'Daal', category: 'food', price: 60, icon: '🍲', description: 'Slow-cooked yellow lentils with aromatic spices', isVeg: true },
  { id: 'food_chole', name: 'Chole', category: 'food', price: 100, icon: '🥘', description: 'Spiced chickpea curry in rich tomato gravy', isVeg: true },
  { id: 'food_sabji', name: 'Sabji', category: 'food', price: 50, icon: '🥗', description: 'Seasonal mixed vegetable preparation', isVeg: true },
  { id: 'food_meggi', name: 'Meggi', category: 'food', price: 40, icon: '🍜', description: 'Classic spiced instant noodles with vegetables', isVeg: true },
  { id: 'food_chawal', name: 'Chawal', category: 'food', price: 30, icon: '🍚', description: 'Steamed basmati rice', isVeg: true },
  { id: 'food_mixveg', name: 'Mixveg', category: 'food', price: 120, icon: '🍲', description: 'Assorted garden vegetables in rich gravy', isVeg: true },
  { id: 'food_paneer', name: 'Paneer', category: 'food', price: 100, icon: '🧀', description: 'Cottage cheese cubes in spiced butter masala', isVeg: true },
  { id: 'food_pizza', name: 'Pizza', category: 'food', price: 120, icon: '🍕', description: 'Baked crust topped with cheese and veggies', isVeg: true },

  // Drinks from original app
  { id: 'drink_lassi', name: 'Lassi', category: 'drinks', price: 50, icon: '🥛', description: 'Traditional creamy sweet yogurt drink', isVeg: true },
  { id: 'drink_coffee', name: 'Coffee', category: 'drinks', price: 40, icon: '☕', description: 'Hot brewed filter coffee', isVeg: true },
  { id: 'drink_faluda', name: 'Faluda', category: 'drinks', price: 80, icon: '🍧', description: 'Rich rose syrup dessert beverage with noodles', isVeg: true },
  { id: 'drink_shikanji', name: 'Shikanji', category: 'drinks', price: 30, icon: '🍋', description: 'Refreshing spiced Indian lemonade', isVeg: true },
  { id: 'drink_jaljeera', name: 'Jaljeera', category: 'drinks', price: 40, icon: '🥤', description: 'Tangy cumin & mint digestive drink', isVeg: true },
  { id: 'drink_roohafza', name: 'Roohafza', category: 'drinks', price: 60, icon: '🍷', description: 'Sweet herbal cooling rose beverage', isVeg: true },
  { id: 'drink_masalatea', name: 'Masala Tea', category: 'drinks', price: 20, icon: '🫖', description: 'Authentic spiced chai with ginger and cardamom', isVeg: true },
  { id: 'drink_badammilk', name: 'Badam Milk', category: 'drinks', price: 50, icon: '🥛', description: 'Nutritious almond infused saffron milk', isVeg: true },
  { id: 'drink_coldrinks', name: 'Cold Drinks', category: 'drinks', price: 80, icon: '🥤', description: 'Chilled carbonated soft beverage', isVeg: true },

  // Cakes from original app
  { id: 'cake_oreo', name: 'Oreo Cake', category: 'cakes', price: 400, icon: '🎂', description: 'Decadent chocolate sponge with oreo crumbs', isVeg: true },
  { id: 'cake_apple', name: 'Apple Cake', category: 'cakes', price: 300, icon: '🥧', description: 'Cinnamon spiced fresh apple cake', isVeg: true },
  { id: 'cake_kitkat', name: 'Kitkat Cake', category: 'cakes', price: 500, icon: '🍫', description: 'Loaded chocolate wafer crunch cake', isVeg: true },
  { id: 'cake_vanilla', name: 'Vanilla Cake', category: 'cakes', price: 550, icon: '🍰', description: 'Classic Madagascar vanilla bean sponge', isVeg: true },
  { id: 'cake_banana', name: 'Banana Cake', category: 'cakes', price: 450, icon: '🍌', description: 'Moist caramelized banana loaf cake', isVeg: true },
  { id: 'cake_brownie', name: 'Brownie', category: 'cakes', price: 800, icon: '🥮', description: 'Dense fudge walnut chocolate brownie', isVeg: true },
  { id: 'cake_pineapple', name: 'Pineapple Cake', category: 'cakes', price: 620, icon: '🍍', description: 'Fresh tropical pineapple glaze pastry', isVeg: true },
  { id: 'cake_chocolate', name: 'Chocolate Cake', category: 'cakes', price: 700, icon: '🍫', description: 'Rich dark chocolate ganache supreme', isVeg: true },
  { id: 'cake_blackforest', name: 'Black Forest', category: 'cakes', price: 550, icon: '🍒', description: 'German cherry & chocolate layered cake', isVeg: true },
];
