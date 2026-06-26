import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MenuItemService } from '../../core/services/menu-item.service';
import { MenuItemCategoryService } from '../../core/services/menu-item-category.service';
import { ToastService } from '../../core/services/toast.service';
import { MenuItemCategory } from '../../models/category.model';
import { AppConstants } from '../../constants/constants';
import { MessageConstants } from '../../constants/messageConstants';
import { RouteConstants } from '../../constants/routConstants';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css']
})
export class ItemFormComponent implements OnInit {
  itemForm!: FormGroup;
  isEditMode: boolean = false;
  itemId?: number;
  submitting: boolean = false;
  categories: MenuItemCategory[] = [];
  duplicateNameError: string = '';
  originalMenuItemName: string = '';

  constructor(
    private fb: FormBuilder,
    private menuItemService: MenuItemService,
    private categoryService: MenuItemCategoryService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
  this.initForm();
    if (this.isEditMode) {
  this.loadAllCategories();
} else {
  this.loadActiveCategories();
}

  const idParam = this.route.snapshot.paramMap.get('id');
  if (idParam) {
    this.isEditMode = true;
    this.itemId = parseInt(idParam, 10);
    this.loadMenuItem();
  }

  this.itemForm.get('name')?.valueChanges.subscribe((name) => {

  this.duplicateNameError = '';

  if (!name || !name.trim()) {
    return;
  }

  // Edit mode + unchanged name
  if (
      this.isEditMode &&
      name.trim().toLowerCase() ===
      this.originalMenuItemName.trim().toLowerCase()
  ) {
      return;
  }

  this.menuItemService.checkMenuItemName(name.trim())
    .subscribe({

      next: (exists) => {

        if (exists) {

          this.duplicateNameError = MessageConstants.MENU_ITEM_EXISTS;

        }

      },

      error: (err) => {
        console.error(err);
      }

    });

});}

  initForm(): void {
    this.itemForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(AppConstants.NAME_MIN_LENGTH),
        Validators.maxLength(AppConstants.NAME_MAX_LENGTH),
        Validators.pattern(AppConstants.ITEM_FORM_NAME_PATTERN)
      ]],
      slogan: ['', [Validators.maxLength(AppConstants.SLOGAN_MAX_LENGTH)]],
      description: ['', [Validators.maxLength(AppConstants.DESCRIPTION_MAX_LENGTH)]],
      price: [
  '',
  [
    Validators.required,
    Validators.min(AppConstants.MIN_PRICE),
    Validators.max(AppConstants.MAX_PRICE),
    Validators.pattern(AppConstants.PRICE_PATTERN)
  ]
],
      menuItemCategoryId: ['', [Validators.required]],
      active: [true]
    });
  }

  loadActiveCategories(): void {
    console.log(this.categories);
    this.categoryService.getActiveCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError(MessageConstants.ERROR_LOADING_CATEGORY);
      }
    });
  }

  loadAllCategories(): void {
  this.categoryService.getAllCategories().subscribe({
    next: (data) => {
      this.categories = data;
    },
    error: (err) => {
      console.error(err);
      this.toastService.showError(MessageConstants.ERROR_LOADING_CATEGORY);
    }
  });
}

  loadMenuItem(): void {

  this.menuItemService.getMenuItemById(Number(this.itemId))
    .subscribe({

      next: (item) => {

        this.originalMenuItemName = item.name;

        this.itemForm.patchValue({
          name: item.name,
          slogan: item.slogan,
          price: item.price,
          description : item.description,
          menuItemCategoryId: item.menuItemCategoryId
        });

      }

    });

}

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const itemData = {
      ...this.itemForm.value,
      name: this.itemForm.value.name.trim(),
      slogan: this.itemForm.value.slogan ? this.itemForm.value.slogan.trim() : '',
      description: this.itemForm.value.description ? this.itemForm.value.description.trim() : ''
    };

    if (this.isEditMode && this.itemId) {
      this.menuItemService.updateMenuItem(this.itemId, itemData).subscribe({
        next: () => {
          this.toastService.showSuccess(`Menu item '${itemData.name}' ${MessageConstants.MENU_ITEM_UPDATED}`);
          this.router.navigate([RouteConstants.MENU_ITEMS]);
        },
        error: (err) => {
          this.submitting = false;
          console.error(err);
          this.toastService.showError(err.error?.message || MessageConstants.ERROR_UPDATE_MENU_ITEM);
        }
      });
    } else {
      this.menuItemService.createMenuItem(itemData).subscribe({
        next: () => {
          this.toastService.showSuccess(`Menu item '${itemData.name}' ${MessageConstants.MENU_ITEM_CREATED}`);
          this.router.navigate([RouteConstants.MENU_ITEMS]);
        },
        error: (err) => {
          this.submitting = false;
          console.error(err);
          this.toastService.showError(err.error?.message || MessageConstants.ERROR_CREATE_MENU_ITEM);
        }
      });
    }
  }

  get name() { return this.itemForm.get('name'); }
  get slogan() { return this.itemForm.get('slogan'); }
  get description() { return this.itemForm.get('description'); }
  get price() { return this.itemForm.get('price'); }
  get menuItemCategoryId() { return this.itemForm.get('menuItemCategoryId'); }
}