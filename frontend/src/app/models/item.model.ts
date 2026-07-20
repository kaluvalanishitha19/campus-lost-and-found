export type ItemKind = 'lost' | 'found';
export type ItemStatus = 'open' | 'claimed' | 'returned';
export type ItemCategory =
  | 'electronics' | 'keys' | 'bags' | 'clothing'
  | 'id-cards' | 'books' | 'jewellery' | 'other';

export interface Item {
  id: number;
  case_number: string;
  title: string;
  description: string;
  category: ItemCategory;
  kind: ItemKind;
  status: ItemStatus;
  location: string;
  occurred_on: string;
  contact_name: string;
  contact_email: string;
  photo_url: string | null;
  created_at: string;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ItemFilters {
  search?: string;
  kind?: ItemKind;
  category?: ItemCategory;
  status?: ItemStatus;
  sort?: 'newest' | 'oldest';
  page?: number;
}

export interface NewItem {
  title: string;
  description: string;
  category: ItemCategory;
  kind: ItemKind;
  location: string;
  occurred_on: string;
  contact_name: string;
  contact_email: string;
  photo?: File;
}

export const CATEGORIES: ItemCategory[] = [
  'electronics', 'keys', 'bags', 'clothing',
  'id-cards', 'books', 'jewellery', 'other',
];
