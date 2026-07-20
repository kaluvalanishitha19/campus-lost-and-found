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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submitError = '';

    this.itemsService.reportItem(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
        this.form.reset({ kind: 'found' });
        setTimeout(() => this.router.navigate(['/']), 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.error || 'Something went wrong. Please try again.';
      },
    });
  }
}
