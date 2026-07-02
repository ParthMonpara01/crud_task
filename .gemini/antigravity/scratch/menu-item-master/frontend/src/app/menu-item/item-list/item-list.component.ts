import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenuItemService } from '../../core/services/menu-item.service';
import { ToastService } from '../../core/services/toast.service';
import { MenuItem } from '../../models/menu-item.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppConstants } from '../../constants/constants';
import { MessageConstants } from '../../constants/messageConstants';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,MatTooltipModule],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit {
  itemForm!: FormGroup;
  menuItems: MenuItem[] = [];
  
  // Search
  searchTerm: string = '';
  
  // Pagination
  currentPage: number = AppConstants.CURRENT_PAGE;
  pageSize: number = AppConstants.DEFAULT_PAGE_SIZE;
  totalElements: number = AppConstants.TOTAL_ELEMENT;
  totalPages: number = AppConstants.TOTAL_PAGES;
  pageSizeOptions = AppConstants.PAGE_SIZE_OPTIONS;
  // Sorting
  sortColumn: string = AppConstants.SORT_PAGE_COLUMN;
  sortDirection: 'asc' | 'desc' = 'asc';
  isFormOpen = false;
  

  // Custom Delete Modal State
  showDeleteModal: boolean = false;
  itemToDelete?: MenuItem;

  constructor(
    private menuItemService: MenuItemService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const savedPageSize = localStorage.getItem('menuItemPageSize');
    const setAscDesc = localStorage.getItem('menuItemAscDesc');
    const setDirection = localStorage.getItem('menuItemDirection')
    console.log(this.sortDirection)

  this.pageSize = savedPageSize
      ? Number(savedPageSize)
      : 10;
  this.sortColumn = setAscDesc
  ? String (setAscDesc)
  : this.sortColumn;

  this.sortDirection = setDirection
  ? String (setDirection) === 'asc' ? 'desc' : 'asc'
  :this.sortDirection;

  console.log("ngOnInit Sort Direction :- " + this.sortDirection)
  console.log(setAscDesc)
  this.loadMenuItems();
  }

  changePageSize(): void {
    console.log("ChangePageSize() Method Called....")

  this.currentPage = 0;

  localStorage.setItem(
    'menuItemPageSize',
    this.pageSize.toString()
  );
  this.loadMenuItems();
  }

  setAscDesc(): void{
    console.log("Calling setAscDesc() method")
    
    this.currentPage = 0;
    localStorage.setItem(
    'menuItemAscDesc',
    this.sortColumn.toString()
  );
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    console.log("Loading Menu Items After ASC DESC")
    const sortParam = `${this.sortColumn},${this.sortDirection}`;
    console.log("sort Params : " + sortParam)
    this.menuItemService.getMenuItems(this.currentPage, this.pageSize, sortParam, this.searchTerm).subscribe({
      next: (res) => {
        this.menuItems = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;
        console.log("Sort Param :" + sortParam)
        console.log("Loading MenuItems : " + this.menuItems)
        console.log("Loading total Elements : " +this.totalElements)
        console.log("Loading total Pages : " +this.totalPages)
      },
      error: (err) => {
        this.toastService.showError(err.error?.message || MessageConstants.ERROR_LOADING_ITEMS);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadMenuItems();
  }

  onSort(column: string): void {
    console.log("onSort Short Direction : " + this.sortDirection)
    console.log("Sorting Method Called...!!")

    this.currentPage = 0;
    localStorage.setItem(
      'menuItemAscDesc',
      this.sortColumn.toString()
    )

    localStorage.setItem(
      'menuItemDirection',
      this.sortDirection.toString()
    )
    console.log("Sorting Direction : " + this.sortDirection)
    console.log("Column Name : " + column)
    console.log("SortColumn..." + this.sortColumn)
    if (this.sortColumn === column) {
      console.log("Column Name is :- " + column)
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      console.log("SortDirection : " + this.sortDirection)
      
    } else {
      console.log("Else Part...!!")
      this.sortColumn = column;
      console.log("Sorting Column Name : " + this.sortColumn)
      this.sortDirection = 'asc';
      console.log("End of Else Part..!!!!")
    }
    this.currentPage = 0;
    this.loadMenuItems();
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadMenuItems();
    }
  }

  onPageSizeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.pageSize = parseInt(selectElement.value, 10);
    localStorage.setItem('menuItemPageSize', this.pageSize.toString());
    this.currentPage = 0;
    this.loadMenuItems();
  }

  openDeleteModal(item: MenuItem): void {
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.itemToDelete = undefined;
  }

  confirmDelete(): void {
    if (!this.itemToDelete || !this.itemToDelete.id) return;
    const item = this.itemToDelete;
    this.closeDeleteModal();
    
    this.menuItemService.deleteMenuItem(item.id!).subscribe({
      next: () => {
        this.toastService.showSuccess(`Menu item '${item.name}' ${MessageConstants.MENU_ITEM_DELETED}`);
        if (this.menuItems.length === 1 && this.currentPage > 0) {
          this.currentPage--;
        }
        this.loadMenuItems();
      },
      error: (err) => {
        this.toastService.showError(err.error?.message || MessageConstants.ERROR_DELETE_ITEM);
      }
    });
  }
  // 1. Call this when clicking "Create Menu Item" to clear the form
  createMenuItem(): void {
    this.isFormOpen = true;
    this.itemForm.reset(); 
  }

}