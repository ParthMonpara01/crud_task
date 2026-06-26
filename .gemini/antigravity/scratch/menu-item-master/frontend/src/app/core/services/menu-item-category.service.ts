import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItemCategory } from '../../models/category.model';
import { ApiCOnstans } from '../../constants/apiConstants';

@Injectable({
  providedIn: 'root'
})
export class MenuItemCategoryService {
  // Configurable base URL for API endpoint
  private apiUrl = ApiCOnstans.CATEGORY_API_URL;

  constructor(private http: HttpClient) {}

  getCategories(page: number, size: number, sort: string, search: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  getActiveCategories(): Observable<MenuItemCategory[]> {
    return this.http.get<MenuItemCategory[]>(`${this.apiUrl}/active`);
  }

  getCategoryById(id: number): Observable<MenuItemCategory> {
    return this.http.get<MenuItemCategory>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: MenuItemCategory): Observable<MenuItemCategory> {
    return this.http.post<MenuItemCategory>(this.apiUrl, category);
  }

  updateCategory(id: number, category: MenuItemCategory): Observable<MenuItemCategory> {
    return this.http.put<MenuItemCategory>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<MenuItemCategory> {
    return this.http.patch<MenuItemCategory>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  checkCategoryName(name: string): Observable<boolean> {
  return this.http.get<boolean>(
    `${this.apiUrl}/check-name`,
    {
      params: { name }
    }
  );

  
}
getAllCategories(): Observable<MenuItemCategory[]> {
  return this.http.get<MenuItemCategory[]>(this.apiUrl);
}
}
