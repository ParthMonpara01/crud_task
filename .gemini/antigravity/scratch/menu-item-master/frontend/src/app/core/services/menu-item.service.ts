import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem } from '../../models/menu-item.model';
import { ApiCOnstans } from '../../constants/apiConstants';

@Injectable({
  providedIn: 'root'
})
export class MenuItemService {
  // Configurable base URL for API endpoint
  private apiUrl = ApiCOnstans.MENU_ITEM_API;

  constructor(private http: HttpClient) {}

  getMenuItems(page: number, size: number, sort: string, search: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  getMenuItemById(id: number): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.apiUrl}/${id}`);
  }

  createMenuItem(item: MenuItem): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, item);
  }

  updateMenuItem(id: number, item: MenuItem): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, item);
  }

  deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  checkMenuItemName(name: string): Observable<boolean> {
  return this.http.get<boolean>(
    `${this.apiUrl}/check-name`,
    {
      params: { name }
    }
  );
}

}
