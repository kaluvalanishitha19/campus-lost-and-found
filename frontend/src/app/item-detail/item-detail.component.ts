import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ItemsService } from '../services/items.service';
import { Item } from '../models/item.model';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.css',
})
export class ItemDetailComponent implements OnInit {
  item: Item | null = null;
  loading = true;
  error = '';
  updating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemsService: ItemsService
  ) {}

  ngOnInit(): void {
    // Route param is read once here rather than as a reactive paramMap
    // stream, since this page is only ever entered fresh (never navigated
    // between two different item ids without a full reload).
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error = 'Invalid item id.';
      this.loading = false;
      return;
    }

    this.itemsService.getItem(id).subscribe({
      next: (item) => {
        this.item = item;
        this.loading = false;
      },
      error: () => {
        this.error = 'Item not found.';
        this.loading = false;
      },
    });
  }

  markClaimed(): void {
    if (!this.item) return;
    this.updating = true;
    this.itemsService.updateStatus(this.item.id, 'claimed').subscribe({
      next: (updated) => {
        this.item = updated;
        this.updating = false;
      },
      error: () => {
        this.updating = false;
        this.error = 'Could not update status. Please try again.';
      },
    });
  }

  markReturned(): void {
    if (!this.item) return;
    this.updating = true;
    this.itemsService.updateStatus(this.item.id, 'returned').subscribe({
      next: (updated) => {
        this.item = updated;
        this.updating = false;
      },
      error: () => {
        this.updating = false;
        this.error = 'Could not update status. Please try again.';
      },
    });
  }
}
