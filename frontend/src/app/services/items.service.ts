import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemFilters, ItemsResponse, NewItem } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private readonly baseUrl = 'http://localhost:4000/api/items';

  constructor(private http: HttpClient) {}

  getItems(filters: ItemFilters): Observable<ItemsResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<ItemsResponse>(this.baseUrl, { params });
  }

  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/${id}`);
  }

  reportItem(item: NewItem): Observable<Item> {
    // A photo means the request body must be multipart/form-data, not JSON —
    // FormData handles that encoding; the browser sets the right
    // Content-Type header (including the multipart boundary) automatically.
    const formData = new FormData();
    Object.entries(item).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string | Blob);
      }
    });
    return this.http.post<Item>(this.baseUrl, formData);
  }

  updateStatus(id: number, status: Item['status']): Observable<Item> {
    return this.http.patch<Item>(`${this.baseUrl}/${id}/status`, { status });
  }
}
