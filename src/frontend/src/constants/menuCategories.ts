// Shared menu categories for consistent category management across the app
export const MENU_CATEGORIES = ['All', 'Starters', 'Curry', 'Roti', 'Biryani', 'Momos', 'Raita', 'Soup', 'Beverages'] as const;

// Categories for admin panel (excludes 'All' since it's a filter, not a real category)
export const ADMIN_MENU_CATEGORIES = ['Starters', 'Curry', 'Roti', 'Biryani', 'Momos', 'Raita', 'Soup', 'Beverages'] as const;

export type MenuCategory = typeof ADMIN_MENU_CATEGORIES[number];
