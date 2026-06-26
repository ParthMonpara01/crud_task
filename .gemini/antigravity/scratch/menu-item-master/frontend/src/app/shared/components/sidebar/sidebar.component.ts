import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isMenuOpen = true;

  constructor(private toastService: ToastService) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  addNewMaster() {
    this.toastService.show('Future Master configuration editor will be implemented here!', 'warning');
  }
}
