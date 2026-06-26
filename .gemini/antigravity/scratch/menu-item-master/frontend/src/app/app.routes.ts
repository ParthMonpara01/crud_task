import { Routes } from '@angular/router';
import { CategoryListComponent } from './menu-item-category/category-list/category-list.component';
import { CategoryFormComponent } from './menu-item-category/category-form/category-form.component';
import { ItemListComponent } from './menu-item/item-list/item-list.component';
import { ItemFormComponent } from './menu-item/item-form/item-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'menu-item-categories', pathMatch: 'full' },
  { path: 'menu-item-categories', component: CategoryListComponent },
  { path: 'menu-item-categories/new', component: CategoryFormComponent },
  { path: 'menu-item-categories/edit/:id', component: CategoryFormComponent },
  { path: 'menu-items', component: ItemListComponent },
  { path: 'menu-items/new', component: ItemFormComponent },
  { path: 'menu-items/edit/:id', component: ItemFormComponent },
  { path: '**', redirectTo: 'menu-item-categories' }
];
