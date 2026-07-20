import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemsService } from '../services/items.service';
import { CATEGORIES } from '../models/item.model';

@Component({
  selector: 'app-report-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './report-item.component.html',
  styleUrl: './report-item.component.css',
})
export class ReportItemComponent {
  readonly categories = CATEGORIES;
  submitting = false;
  submitError = '';
  submitted = false;
  form: FormGroup;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  photoError = '';

  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB, matches backend limit
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    private fb: FormBuilder,
    private itemsService: ItemsService,
    private router: Router
  ) {
    this.form = this.fb.group({
      kind: ['found', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      location: ['', Validators.required],
      occurred_on: ['', Validators.required],
      contact_name: ['', Validators.required],
      contact_email: ['', [Validators.required, Validators.email]],
    });
  }

  field(name: string) {
    return this.form.get(name)!;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.photoError = '';

    if (!file) {
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }

    if (!this.allowedTypes.includes(file.type)) {
      this.photoError = 'Please choose a JPEG, PNG, or WebP image.';
      input.value = '';
      return;
    }
    if (file.size > this.maxFileSize) {
      this.photoError = 'Image must be under 5MB.';
      input.value = '';
      return;
    }

    this.selectedFile = file;

    // FileReader turns the file into a data URL so it can be previewed
    // immediately, entirely client-side — nothing is uploaded yet.
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearPhoto(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.photoError = '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submitError = '';

    const payload = {
      ...this.form.getRawValue(),
      ...(this.selectedFile ? { photo: this.selectedFile } : {}),
    };

    this.itemsService.reportItem(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
        this.form.reset({ kind: 'found' });
        this.clearPhoto();
        setTimeout(() => this.router.navigate(['/']), 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.error || 'Something went wrong. Please try again.';
      },
    });
  }
}
