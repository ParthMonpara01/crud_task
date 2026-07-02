import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  showSuccess(message: string) {
    alert(message); // Replace later with your custom popup
  }

  showError(message: string) {
    alert(message); // Replace later with your custom popup
  }

}