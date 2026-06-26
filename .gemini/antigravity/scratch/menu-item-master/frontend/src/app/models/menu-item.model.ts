export interface MenuItem {
  id?: number;
  name: string;
  slogan?: string;
  description?: string;
  price: number;
  menuItemCategoryId: number;
  menuItemCategoryName?: string;
  active: boolean;
}
