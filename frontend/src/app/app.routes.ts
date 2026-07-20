import { Routes } from '@angular/router';
import { ItemListComponent } from './item-list/item-list.component';
import { ReportItemComponent } from './report-item/report-item.component';

export const routes: Routes = [
  { path: '', component: ItemListComponent },
  { path: 'report', component: ReportItemComponent },
];
