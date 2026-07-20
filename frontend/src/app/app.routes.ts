import { Routes } from '@angular/router';
import { ItemListComponent } from './item-list/item-list.component';
import { ReportItemComponent } from './report-item/report-item.component';
import { ItemDetailComponent } from './item-detail/item-detail.component';

export const routes: Routes = [
  { path: '', component: ItemListComponent },
  { path: 'report', component: ReportItemComponent },
  { path: 'items/:id', component: ItemDetailComponent },
];
