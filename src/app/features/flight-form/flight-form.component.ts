import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { FirebaseAuthService } from '../../core/firebase/firebase-auth.service';
import { FlightInfoPayload, SubmissionStatus } from '../../core/models/flight-info.model';

@Component({
  selector: 'app-flight-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flight-form.component.html',
  styleUrl: './flight-form.component.scss',
})
export class FlightFormComponent {
  private readonly fb = inject(FormBuilder);
  readonly flightService = inject(FlightService);
  readonly authService = inject(FirebaseAuthService);
  readonly router = inject(Router);

  readonly status = signal<SubmissionStatus>('IDLE');
  readonly errorMessage = signal<string | null>(null);

  readonly flightForm: FormGroup = this.fb.group({
    airline: ['', [Validators.required]],
    arrivalDate: ['', [Validators.required]],
    arrivalTime: ['', [Validators.required]],
    flightNumber: ['', [Validators.required]],
    numOfGuests: [1, [Validators.required, Validators.min(1)]],
    comments: [''],
  });

  onFlightNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      input.value = input.value.toUpperCase();
      this.flightForm.get('flightNumber')?.setValue(input.value, { emitEvent: false });
    }
  }

  /**
   * Progressive enhancement helper to invoke native picker when supported.
   * Gracefully degrades to native input typing and focus behavior.
   */
  openPicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.triggerPicker(input);
  }

  triggerPicker(input: HTMLInputElement | null): void {
    if (input && typeof (input as any).showPicker === 'function') {
      try {
        (input as any).showPicker();
      } catch {
        // Fallback gracefully without throwing
      }
    }
  }

  onSubmit(): void {
    if (this.flightForm.invalid || this.status() === 'SUBMITTING') {
      this.flightForm.markAllAsTouched();
      return;
    }

    const raw = this.flightForm.getRawValue();

    // The "Data Boundary Vault" Validation & Sanitization:
    // 1. Verify arrivalDate is convertible via new Date(...)
    const rawDateStr = String(raw.arrivalDate || '').trim();
    const dateParsed = new Date(rawDateStr);
    if (!rawDateStr || isNaN(dateParsed.getTime())) {
      this.status.set('ERROR');
      this.errorMessage.set('Invalid arrival date format. Please select a valid date.');
      return;
    }

    // 2. Verify arrivalTime is non-empty and formatted as HH:mm
    const rawTimeStr = String(raw.arrivalTime || '').trim();
    if (!rawTimeStr || !/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(rawTimeStr)) {
      this.status.set('ERROR');
      this.errorMessage.set('Invalid arrival time format. Please provide a valid time (HH:mm).');
      return;
    }

    this.status.set('SUBMITTING');
    this.errorMessage.set(null);
    this.flightForm.disable();

    const trimmedComments = raw.comments ? String(raw.comments).trim() : '';

    // Strictly sanitize and type-cast boundary data into the immutable FlightInfoPayload contract
    const payload: FlightInfoPayload = {
      airline: String(raw.airline || '').trim(),
      arrivalDate: rawDateStr,
      arrivalTime: rawTimeStr,
      flightNumber: String(raw.flightNumber || '').trim().toUpperCase(),
      numOfGuests: Number(raw.numOfGuests),
      ...(trimmedComments ? { comments: trimmedComments } : {}),
    };

    this.flightService.submitFlightInfo(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.status.set('SUCCESS');
        } else {
          this.status.set('ERROR');
          this.errorMessage.set(
            response.message || 'Unable to submit flight details. Please verify your connection or try again.'
          );
          this.flightForm.enable();
        }
      },
      error: (err) => {
        this.status.set('ERROR');
        this.errorMessage.set(
          err?.message || 'Unable to submit flight details. Please verify your connection or try again.'
        );
        this.flightForm.enable();
      },
    });
  }

  resetForm(): void {
    this.flightForm.reset({
      airline: '',
      arrivalDate: '',
      arrivalTime: '',
      flightNumber: '',
      numOfGuests: 1,
      comments: '',
    });
    this.flightForm.enable();
    this.status.set('IDLE');
    this.errorMessage.set(null);
  }

  async onSignOut(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
