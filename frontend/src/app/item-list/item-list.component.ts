import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, catchError, of } from 'rxjs';
import { ItemsService } from '../services/items.service';
import { Item, ItemFilters, CATEGORIES, ItemCategory, ItemKind, ItemStatus } from '../models/item.model';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css',
})
export class ItemListComponent implements OnInit, OnDestroy {
  items: Item[] = [];
  total = 0;
  loading = false;
  error = '';

  searchTerm = '';
  kind: ItemKind | '' = '';
  category: ItemCategory | '' = '';
  status: ItemStatus | '' = '';
  sort: 'newest' | 'oldest' = 'newest';

  readonly categories = CATEGORIES;

  private searchInput$ = new Subject<string>();

  constructor(private itemsService: ItemsService) {}

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.fetchItems());

    this.fetchItems();
  }

  ngOnDestroy(): void {
    this.searchInput$.complete();
  }

  onSearchChange(): void {
    this.searchInput$.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.fetchItems();
  }

  fetchItems(): void {
    this.loading = true;
    this.error = '';

    const filters: ItemFilters = {
      search: this.searchTerm || undefined,
      kind: (this.kind || undefined) as ItemKind | undefined,
      category: (this.category || undefined) as ItemCategory | undefined,
      status: (this.status || undefined) as ItemStatus | undefined,
      sort: this.sort,
    };

    this.itemsService
      .getItems(filters)
      .pipe(
        catchError(() => {
          this.error = 'Could not load items. Check that the API server is running.';
          return of({ items: [], total: 0, page: 1, pageSize: 24 });
        })
      )
      .subscribe((response) => {
        this.items = response.items;
        this.total = response.total;
        this.loading = false;
      });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.kind = '';
    this.category = '';
    this.status = '';
    this.sort = 'newest';
    this.fetchItems();
  }

  statusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
