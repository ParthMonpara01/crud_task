import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { MenuItemCategoryService } from "../../core/services/menu-item-category.service";
import { ToastService } from "../../core/services/toast.service";
import { MenuItemCategory } from "../../models/category.model";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppConstants } from "../../constants/constants";
import { MessageConstants } from "../../constants/messageConstants";

@Component({
  selector: "app-category-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatTooltipModule],
  templateUrl: "./category-list.component.html",
  styleUrls: ["./category-list.component.css"],
})
export class CategoryListComponent implements OnInit {
  categories: MenuItemCategory[] = [];

  // Search
  searchTerm: string = "";

  // Pagination
  currentPage: number = AppConstants.CURRENT_PAGE;
  pageSize: number = AppConstants.DEFAULT_PAGE_SIZE;
  totalElements: number = AppConstants.TOTAL_ELEMENT;
  totalPages: number = AppConstants.TOTAL_PAGES;
  pageSizeOptions: number[] = AppConstants.PAGE_SIZE_OPTIONS;

  // Sorting
  sortColumn: string = "name";
  sortDirection: "asc" | "desc" = "asc";

  // Custom Delete Modal State
  showDeleteModal: boolean = false;
  categoryToDelete?: MenuItemCategory;

  constructor(
    private http:HttpClient,
    private categoryService: MenuItemCategoryService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const savedPageSize = localStorage.getItem("categoryPageSize");

    this.pageSize = savedPageSize ? Number(savedPageSize) : 10;

    this.loadCategories();
  }

  changePageSize(): void {
    this.currentPage = 0;

    localStorage.setItem("categoryPageSize", this.pageSize.toString());

    this.loadCategories();
  }

  loadCategories(): void {

  const sortParam = `${this.sortColumn},${this.sortDirection}`;

  this.categoryService
    .getCategories(
      this.currentPage,
      this.pageSize,
      sortParam,
      this.searchTerm
    )
    .subscribe({

      next:(res)=>{

        this.categories = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;

      },

      error:(err)=>{

        console.error(err);

        this.toastService.showError(
          err.error?.message || MessageConstants.ERROR_LOADING_CATEGORY
        );

      }

    });

}

  onSearch(): void {
    this.currentPage = 0;
    this.loadCategories();
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = column;
      this.sortDirection = "asc";
    }
    this.currentPage = 0;
    this.loadCategories();
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadCategories();
    }
  }

  onPageSizeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.pageSize = parseInt(selectElement.value, 10);
    localStorage.setItem("categoryPageSize", this.pageSize.toString());
    this.currentPage = 0;
    this.loadCategories();
  }

  toggleStatus(category: MenuItemCategory): void {
    if (!category.id) return;
    this.categoryService.toggleStatus(category.id).subscribe({
      next: (updated) => {
        category.active = updated.active;
        this.toastService.showSuccess(
          `Category '${category.name}' status updated to ${category.active ? "Active" : "Inactive"}.`,
        );
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError(
          err.error?.message || MessageConstants.ERROR_TOGGLING_STATUS,
        );
      },
    });
  }

  openDeleteModal(category: MenuItemCategory): void {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.categoryToDelete = undefined;
  }

  confirmDelete(): void {
    if (!this.categoryToDelete || !this.categoryToDelete.id) return;
    const category = this.categoryToDelete;
    this.closeDeleteModal();

    this.categoryService.deleteCategory(category.id!).subscribe({
      next: () => {
        this.toastService.showSuccess(`Category '${category.name}' ${MessageConstants.CATEGORY_DELETED}`,);
        if (this.categories.length === 1 && this.currentPage > 0) {
          this.currentPage--;
        }
        this.loadCategories();
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || MessageConstants.CATEGORY_CANNOT_DELETE;
        this.toastService.showError(errorMsg);
      },
    });
  }

  downloadReportPDF() {
    this.http.get('http://localhost:8080/api/menu-items/print', { responseType: 'blob' })
      .subscribe({
        next: (responseBlob: Blob) => {
          const printableUrl = URL.createObjectURL(responseBlob);
          window.open(printableUrl);
        },
        // 3. Type the 'err' explicitly as HttpErrorResponse
        error: (err: HttpErrorResponse) => { 
          console.error('Failed to export PDF:', err);
        }
      });
  }
  
}