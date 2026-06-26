import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { MenuItemCategoryService } from "../../core/services/menu-item-category.service";
import { ToastService } from "../../core/services/toast.service";
import { AppConstants } from "../../constants/constants";
import { MessageConstants } from "../../constants/messageConstants";
import { RouteConstants } from "../../constants/routConstants";

@Component({
  selector: "app-category-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./category-form.component.html",
  styleUrls: ["./category-form.component.css"],
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isEditMode: boolean = false;
  categoryId?: number;
  submitting: boolean = false;
  duplicateNameError: string = "";
  nameExists = false;
  originalCategory: any= null;
  originalCategoryName: String = '';

  constructor(
    private fb: FormBuilder,
    private categoryService: MenuItemCategoryService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    
  ) {}

  ngOnInit(): void {
  this.initForm();

  const idParam = this.route.snapshot.paramMap.get("id");
  if (idParam) {
    this.isEditMode = true;
    this.categoryId = parseInt(idParam, 10);
    this.loadCategory();
  }

  this.categoryForm.get("name")?.valueChanges.subscribe((name) => {

  this.duplicateNameError = "";

  if (!name || !name.trim()) {
    return;
  }

  // Skip duplicate validation if editing and name is unchanged
  if (
    this.isEditMode &&
    name.trim().toLowerCase() ===
    this.originalCategoryName.trim().toLowerCase()
  ) {
    return;
  }

  this.categoryService.checkCategoryName(name.trim()).subscribe({

    next: (exists) => {

      if (exists) {
        this.duplicateNameError = MessageConstants.CATEGORY_NAME_EXISTS;
      }

    },

    error: (err) => {
      console.error(err);
    }

  });

});
}

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(AppConstants.NAME_MIN_LENGTH),
          Validators.maxLength(AppConstants.NAME_MAX_LENGTH),
          Validators.pattern(AppConstants.CATEGORY_NAME_PATTERN),
        ],
      ],
      description: ["", [Validators.maxLength(AppConstants.DESCRIPTION_MAX_LENGTH)]],
      active: [true],
    });
  }

  loadCategory(): void {

  if (!this.categoryId) return;

  this.categoryService.getCategoryById(this.categoryId).subscribe({

    next: (category) => {

      // Store original name for comparison
      this.originalCategoryName = category.name;

      this.categoryForm.patchValue({
        name: category.name,
        description: category.description,
        active: category.active
      });

    },

    error: (err) => {

      console.error(err);

      this.toastService.showError(
        MessageConstants.ERROR_LOADING_CATEGORY
      );

      this.router.navigate(["/menu-item-categories"]);

    }

  });

}

  hasChanges(): boolean {

  if (!this.originalCategory) {
    return false;
    }

    return JSON.stringify(this.originalCategory) !==
         JSON.stringify({
           name: this.categoryForm.get('name')?.value,
           description: this.categoryForm.get('description')?.value
         });

  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const categoryData = {
      ...this.categoryForm.value,
      name: this.categoryForm.value.name.trim(),
      description: this.categoryForm.value.description
        ? this.categoryForm.value.description.trim()
        : "",
    };

    if (this.isEditMode && this.categoryId) {
      this.categoryService
        .updateCategory(this.categoryId, categoryData)
        .subscribe({
          next: () => {
            this.toastService.showSuccess(
              `Category '${categoryData.name}' ${MessageConstants.CATEGORY_UPDATED}`,
            );
            this.router.navigate([RouteConstants.MENU_ITEM_CATEGORIES]);
          },
          error: (err) => {
            this.submitting = false;
            console.error(err);
            this.toastService.showError(
              err.error?.message || MessageConstants.ERROR_UPDATING_CATEGORY,
            );
          },
        });
    } else {
      this.categoryService.createCategory(categoryData).subscribe({
        next: () => {
          this.toastService.showSuccess(
            `Category '${categoryData.name}' ${MessageConstants.CATEGORY_CREATED}`,
          );
          this.router.navigate([RouteConstants.MENU_ITEM_CATEGORIES]);
        },
        error: (err) => {
          if (
            err.error?.message &&
            err.error.message.toLowerCase().includes("already")
          ) {
            this.duplicateNameError = MessageConstants.CATEGORY_NAME_EXISTS;

            return;
          }

          this.toastService.showError(
            err.error?.message || MessageConstants.ERROR_SAVING_CATEGORY,
          );
        },
      });
    }
  }

  get name() {
    return this.categoryForm.get("name");
  }
  get description() {
    return this.categoryForm.get("description");
  }


}