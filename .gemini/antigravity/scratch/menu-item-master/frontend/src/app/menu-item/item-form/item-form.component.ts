import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { MenuItemService } from "../../core/services/menu-item.service";
import { MenuItemCategoryService } from "../../core/services/menu-item-category.service";
import { ToastService } from "../../core/services/toast.service";
import { MenuItemCategory } from "../../models/category.model";
import { AppConstants } from "../../constants/constants";
import { MessageConstants } from "../../constants/messageConstants";
import { RouteConstants } from "../../constants/routConstants";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-item-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: "./item-form.component.html",
  styleUrls: ["./item-form.component.css"],
})
export class ItemFormComponent implements OnInit {
  itemForm!: FormGroup;
  isEditMode: boolean = false;
  itemId?: number;
  submitting: boolean = false;
  categories: MenuItemCategory[] = [];
  duplicateNameError: string = "";
  originalMenuItemName: string = "";
  draftCount = 0;
  draftForm = FormGroup;
  isFormOpen = false;

  inputData: String = "";
  SaveDataInTs: String = "";
  isDataSaved: boolean = true;

  constructor(
    private fb: FormBuilder,
    private menuItemService: MenuItemService,
    private categoryService: MenuItemCategoryService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
  // 1. ALWAYS initialize your form controls first so they exist in memory
  this.initForm();

  // 2. Read the route parameter to determine if we are in Edit Mode
  const idParam = this.route.snapshot.paramMap.get("id");
  if (idParam) {
    this.isEditMode = true;
    this.itemId = parseInt(idParam, 10);
  }

  // 3. Execute load logic based on the correct mode
  if (this.isEditMode && this.itemId !== undefined) {
    this.loadCategoriesForEdit(this.itemId);
    this.loadMenuItem();
  } else {
    this.loadActiveCategories();
    
    // REMOVED: this.handleDraftAction() 
    // We leave this blank so the form fields remain empty when creating a new item.
    
    // Optional: Synchronize your draft count variable from localStorage on load
    const savedCount = localStorage.getItem('menuDraftCount');
    this.draftCount = savedCount ? parseInt(savedCount, 10) : 0;
  }

  // 4. Set up your value changes subscription now that the form is safely initialized
  this.itemForm.get("name")?.valueChanges.subscribe((name) => {
    this.duplicateNameError = "";

    if (!name || !name.trim()) {
      return;
    }

    if (
      this.isEditMode &&
      this.originalMenuItemName && 
      name.trim().toLowerCase() === this.originalMenuItemName.trim().toLowerCase()
    ) {
      return;
    }

    this.menuItemService.checkMenuItemName(name.trim()).subscribe({
      next: (exists) => {
        if (exists) {
          this.duplicateNameError = MessageConstants.MENU_ITEM_EXISTS;
        }
      },
      error: (err) => console.error(err),
    });
  });
}


// 1. Call this when clicking "Create Menu Item" to clear the form
  createMenuItem(): void {
    this.isFormOpen = true;
    this.itemForm.reset(); 
  }

  // 2. The main handler you will bind to your HTML Draft button
  onDraftButtonClick(): void {
    if (this.draftCount === 1) {
      const savedData = localStorage.getItem('savedMenuDraft');
      if (savedData) {
        this.itemForm.patchValue(JSON.parse(savedData)); 
      }
      this.draftCount = 0; 
      localStorage.setItem('menuDraftCount', '0');
    } else {
      this.saveDraft();
    }
  }

  // 3. Helper method that actually saves the data to the browser storage
  saveDraft(): void {
    const formData = this.itemForm.value;
    localStorage.setItem('savedMenuDraft', JSON.stringify(formData));
    
    this.draftCount = 1;
    localStorage.setItem('menuDraftCount', '1');
  }

  // 4. Call this when clicking "Cancel"
  cancel(): void {
    this.isFormOpen = false;
    this.itemForm.reset(); 
  }

  handleDraftAction(): void {
  // 1. Check if the form is currently empty/pristine
  const isFormBlank = !this.itemForm.get('name')?.value && 
                      !this.itemForm.get('price')?.value &&
                      !this.itemForm.get('description')?.value;

  const savedDraftString = localStorage.getItem('savedFormData');

  // 2. ACTION A: If form is blank AND a draft exists -> RESTORE IT
  if (isFormBlank && savedDraftString) {
    try {
      const draftData = JSON.parse(savedDraftString);
      this.itemForm.patchValue(draftData);
      console.log("Draft loaded into inputs!");
      return; // Stop execution here
    } catch (error) {
      console.error("Error parsing draft", error);
    }
  }

  // 3. ACTION B: If form has data -> SAVE IT AS A DRAFT
  const formData = this.itemForm.value;
  localStorage.setItem('savedFormData', JSON.stringify(formData));
  console.log("Draft successfully saved!", formData);

  // Increment your draft counter
  this.draftCount++;
  localStorage.setItem('draftCount', this.draftCount.toString());

  // Optional: close form after saving
  this.closeForm();
}

  openForm() {
    this.isFormOpen = true;
    // Check if there is saved draft data to fill back into the fields
    const savedDraft = localStorage.getItem("savedFormData");
    if (savedDraft) {
    }
  }

  closeForm() {
    this.isFormOpen = false;
  }
  saveAsDraft() {
    const formData = this.itemForm.value;
    // 1. Save form data in the browser so we can reload it later
    localStorage.setItem("savedFormData", JSON.stringify(formData));

    console.log(formData);
    // 2. Increment and save the draft count
    this.draftCount++;
    localStorage.setItem("draftCount", this.draftCount.toString());

    // 3. Optional: Provide a success message or automatically close
    this.closeForm();
  }

  printfunction() {
    console.log("Draft Function Called..!!");
  }

  loadCategoriesForEdit(id: number): void {
    this.categoryService.getCategoriesForEdit(id).subscribe({
      next: (categories) => {
        this.categories = categories;
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  initForm(): void {
    console.log;
    this.itemForm = this.fb.group({
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(AppConstants.NAME_MIN_LENGTH),
          Validators.maxLength(AppConstants.NAME_MAX_LENGTH),
          Validators.pattern(AppConstants.ITEM_FORM_NAME_PATTERN),
        ],
      ],
      slogan: ["", [Validators.maxLength(AppConstants.SLOGAN_MAX_LENGTH)]],
      description: [
        "",
        [Validators.maxLength(AppConstants.DESCRIPTION_MAX_LENGTH)],
      ],
      price: [
        "",
        [
          Validators.required,
          Validators.min(AppConstants.MIN_PRICE),
          Validators.max(AppConstants.MAX_PRICE),
          Validators.pattern(AppConstants.PRICE_PATTERN),
        ],
      ],
      menuItemCategoryId: ["", [Validators.required]],
      active: [true],
    });
  }

  loadActiveCategories(): void {
    this.categoryService.getActiveCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError(MessageConstants.ERROR_LOADING_CATEGORY);
      },
    });
  }

  loadAllCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.content; // <-- Extract the array
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError(MessageConstants.ERROR_LOADING_CATEGORY);
      },
    });
  }

  loadMenuItem(): void {
    this.menuItemService.getMenuItemById(Number(this.itemId)).subscribe({
      next: (item) => {
        this.originalMenuItemName = item.name;

        this.itemForm.patchValue({
          name: item.name,
          slogan: item.slogan,
          price: Number(item.price).toFixed(2),
          description: item.description,
          menuItemCategoryId: item.menuItemCategoryId,
        });
      },
    });
  }

  blockInvalidKeys(event: KeyboardEvent): void {
    const invalidKeys = ["e", "E", "+", "-"];

    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
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
      slogan: this.itemForm.value.slogan
        ? this.itemForm.value.slogan.trim()
        : "",
      description: this.itemForm.value.description
        ? this.itemForm.value.description.trim()
        : "",
    };

    if (this.isEditMode && this.itemId) {
      this.menuItemService.updateMenuItem(this.itemId, itemData).subscribe({
        next: () => {
          this.toastService.showSuccess(
            `Menu item '${itemData.name}' ${MessageConstants.MENU_ITEM_UPDATED}`,
          );
          this.router.navigate([RouteConstants.MENU_ITEMS]);
        },
        error: (err) => {
          this.submitting = false;
          console.error(err);
          this.toastService.showError(
            err.error?.message || MessageConstants.ERROR_UPDATE_MENU_ITEM,
          );
        },
      });
    } else {
      this.menuItemService.createMenuItem(itemData).subscribe({
        next: () => {
          console.log("OnSubmit Method Data : " + JSON.stringify(itemData));
          this.toastService.showSuccess(
            `Menu item '${itemData.name}' ${MessageConstants.MENU_ITEM_CREATED}`,
          );
          this.router.navigate([RouteConstants.MENU_ITEMS]);
        },
        error: (err) => {
          this.submitting = false;
          console.error(err);
          this.toastService.showError(
            err.error?.message || MessageConstants.ERROR_CREATE_MENU_ITEM,
          );
        },
      });
    }
  }

  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    const value = input.value;

    const regex = AppConstants.PRICE_PATTERN;

    if (!regex.test(value)) {
      input.value = value.slice(0, -1);

      this.itemForm.get("price")?.setValue(input.value, {
        emitEvent: false,
      });
    }
  }

  get name() {
    return this.itemForm.get("name");
  }
  get slogan() {
    return this.itemForm.get("slogan");
  }
  get description() {
    return this.itemForm.get("description");
  }
  get price() {
    return this.itemForm.get("price");
  }
  get menuItemCategoryId() {
    return this.itemForm.get("menuItemCategoryId");
  }
}
