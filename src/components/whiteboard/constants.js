export const PRESET_COLORS = [
  '#ffffff', // Pure White
  '#1e293b', // Slate Charcoal
  '#6366f1', // Premium Indigo
  '#3b82f6', // Bright Sky Blue
  '#10b981', // Emerald Green
  '#eab308', // Lemon Yellow
  '#f97316', // Coral Orange
  '#f43f5e', // Rose Crimson
  '#a855f7', // Amethyst Purple
  '#06b6d4'  // Deep Teal
];

export const ANIMAL_NAMES = ['Fox', 'Owl', 'Koala', 'Panda', 'Dolphin', 'Tiger', 'Rabbit', 'Eagle', 'Cheetah', 'Falcon'];
export const ADJECTIVES = ['Creative', 'Smart', 'Curious', 'Active', 'Friendly', 'Joyful', 'Bright', 'Clever'];

export const generateRandomName = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
  return `${adj} ${animal}`;
};

export const AVATAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ef4444', '#14b8a6'];
