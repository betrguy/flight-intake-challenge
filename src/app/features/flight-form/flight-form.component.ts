import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { FirebaseAuthService } from '../../core/firebase/firebase-auth.service';
import { FlightInfoPayload, SubmissionStatus } from '../../core/models/flight-info.model';

/**
 * Custom validator ensuring selected arrival date is today or in the future
 * based on midnight local baseline.
 */
export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const val = String(control.value).trim();
    const parts = val.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const inputDate = new Date(year, month, day, 0, 0, 0, 0);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        if (inputDate.getTime() < today.getTime()) {
          return { pastDate: true };
        }
        return null;
      }
    }
    return null;
  };
}

/**
 * Cross-field validator ensuring that if arrivalDate is today,
 * arrivalTime has not already passed.
 */
export function futureDateTimeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const arrivalDateCtrl = control.get('arrivalDate');
    const arrivalTimeCtrl = control.get('arrivalTime');
    if (!arrivalDateCtrl?.value || !arrivalTimeCtrl?.value) {
      return null;
    }
    const dateVal = String(arrivalDateCtrl.value).trim();
    const timeVal = String(arrivalTimeCtrl.value).trim();

    const dateParts = dateVal.split('-');
    const timeParts = timeVal.split(':');
    if (dateParts.length === 3 && timeParts.length >= 2) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);

      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hours) && !isNaN(minutes)) {
        const inputDateTime = new Date(year, month, day, hours, minutes, 0, 0);
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const inputMidnight = new Date(year, month, day, 0, 0, 0, 0);

        if (inputMidnight.getTime() === todayMidnight.getTime()) {
          if (inputDateTime.getTime() < now.getTime()) {
            arrivalTimeCtrl.setErrors({ ...arrivalTimeCtrl.errors, pastTime: true });
            return { pastTime: true };
          } else if (arrivalTimeCtrl.hasError('pastTime')) {
            const { pastTime, ...remaining } = arrivalTimeCtrl.errors || {};
            arrivalTimeCtrl.setErrors(Object.keys(remaining).length ? remaining : null);
          }
        } else if (arrivalTimeCtrl.hasError('pastTime')) {
          const { pastTime, ...remaining } = arrivalTimeCtrl.errors || {};
          arrivalTimeCtrl.setErrors(Object.keys(remaining).length ? remaining : null);
        }
      }
    }
    return null;
  };
}

@Component({
  selector: 'app-flight-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flight-form.component.html',
  styleUrls: ['./flight-form.component.scss'],
})
export class FlightFormComponent {
  private readonly fb = inject(FormBuilder);
  readonly flightService = inject(FlightService);
  readonly authService = inject(FirebaseAuthService);
  readonly router = inject(Router);

  readonly status = signal<SubmissionStatus>('IDLE');
  readonly errorMessage = signal<string | null>(null);

  readonly todayDateString: string = this.getTodayDateString();

  readonly flightForm: FormGroup = this.fb.group(
    {
      airline: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      arrivalDate: ['', [Validators.required, futureDateValidator()]],
      arrivalTime: ['', [Validators.required]],
      flightNumber: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern(/^\s*[A-Za-z0-9]{2,3}\s?[0-9]{1,4}\s*$/),
        ],
      ],
      numOfGuests: [
        1,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(20),
          Validators.pattern(/^[0-9]+$/),
        ],
      ],
      comments: [''],
    },
    { validators: [futureDateTimeValidator()] }
  );

  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onAirlineBlur(): void {
    const ctrl = this.flightForm.get('airline');
    if (ctrl?.value) {
      ctrl.setValue(String(ctrl.value).trim());
    }
  }

  onFlightNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      input.value = input.value.toUpperCase();
      this.flightForm.get('flightNumber')?.setValue(input.value, { emitEvent: false });
    }
  }

  onFlightNumberBlur(): void {
    const ctrl = this.flightForm.get('flightNumber');
    if (ctrl?.value) {
      ctrl.setValue(String(ctrl.value).trim().toUpperCase());
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

  /**
   * Disallows exponential notation ('e', 'E'), sign symbols ('+', '-'),
   * and decimal points ('.') in the integer-only Number of Guests field.
   */
  blockInvalidNumberKeys(event: KeyboardEvent): void {
    if (['e', 'E', '+', '-', '.'].includes(event.key)) {
      event.preventDefault();
    }
  }

  /**
   * Sanitizes clipboard paste data to prevent non-digit strings, zeroes, or negatives.
   * Automatically normalizes leading zeroes and bounds the value to 1-20.
   */
  onGuestsPaste(event: ClipboardEvent): void {
    const pasteData = (event.clipboardData?.getData('text') || '').trim();
    const parsed = parseInt(pasteData, 10);
    if (!/^\d+$/.test(pasteData) || isNaN(parsed) || parsed <= 0) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    const normalized = Math.min(Math.max(parsed, 1), 20);
    this.flightForm.get('numOfGuests')?.setValue(normalized);
  }

  /**
   * Normalizes guest input values in real time to strip invalid symbols and strip leading zeros.
   */
  onGuestsInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    let val = input.value;
    val = val.replace(/[eE+\-.]/g, '');
    if (val) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) {
        const normalizedStr = String(parsed);
        if (input.value !== normalizedStr) {
          input.value = normalizedStr;
          this.flightForm.get('numOfGuests')?.setValue(parsed, { emitEvent: false });
        }
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
    // 1. Verify airline length
    const rawAirline = String(raw.airline || '').trim();
    if (rawAirline.length < 2 || rawAirline.length > 50) {
      this.status.set('ERROR');
      this.errorMessage.set('Airline name must be between 2 and 50 characters.');
      return;
    }

    // 2. Verify arrivalDate is convertible via new Date(...) and not in the past
    const rawDateStr = String(raw.arrivalDate || '').trim();
    const dateParsed = new Date(rawDateStr);
    if (!rawDateStr || isNaN(dateParsed.getTime())) {
      this.status.set('ERROR');
      this.errorMessage.set('Invalid arrival date format. Please select a valid date.');
      return;
    }
    const dateParts = rawDateStr.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const inputDate = new Date(year, month, day, 0, 0, 0, 0);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        if (inputDate.getTime() < today.getTime()) {
          this.status.set('ERROR');
          this.errorMessage.set('Arrival date cannot be in the past.');
          return;
        }
      }
    }

    // 3. Verify arrivalTime is non-empty and formatted as HH:mm
    const rawTimeStr = String(raw.arrivalTime || '').trim();
    if (!rawTimeStr || !/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(rawTimeStr)) {
      this.status.set('ERROR');
      this.errorMessage.set('Invalid arrival time format. Please provide a valid time (HH:mm).');
      return;
    }

    // Verify that if arrivalDate is today, arrivalTime has not already passed
    const timeParts = rawTimeStr.split(':');
    if (dateParts.length === 3 && timeParts.length >= 2) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hours) && !isNaN(minutes)) {
        const inputDateTime = new Date(year, month, day, hours, minutes, 0, 0);
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const inputMidnight = new Date(year, month, day, 0, 0, 0, 0);
        if (inputMidnight.getTime() === todayMidnight.getTime()) {
          if (inputDateTime.getTime() < now.getTime()) {
            this.status.set('ERROR');
            this.errorMessage.set("Arrival time cannot be in the past for today's flight.");
            return;
          }
        }
      }
    }

    // 4. Verify flightNumber matches standard airline flight format
    const rawFlightNum = String(raw.flightNumber || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{2,3}\s?[0-9]{1,4}$/.test(rawFlightNum) || rawFlightNum.length > 10) {
      this.status.set('ERROR');
      this.errorMessage.set('Please enter a valid flight number (e.g., DL1234 or AA 452).');
      return;
    }

    // 5. Verify numOfGuests is a valid positive integer between 1 and 20
    const rawGuests = Number(raw.numOfGuests);
    if (!Number.isInteger(rawGuests) || rawGuests < 1 || rawGuests > 20) {
      this.status.set('ERROR');
      this.errorMessage.set('Number of guests must be a whole number of at least 1 and at most 20.');
      return;
    }

    this.status.set('SUBMITTING');
    this.errorMessage.set(null);
    this.flightForm.disable();

    // Sanitize comments: trim whitespace and strip control characters
    const rawComments = raw.comments ? String(raw.comments) : '';
    const sanitizedComments = rawComments
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim();

    // Strictly sanitize and type-cast boundary data into the immutable FlightInfoPayload contract
    const payload: FlightInfoPayload = {
      airline: rawAirline,
      arrivalDate: rawDateStr,
      arrivalTime: rawTimeStr,
      flightNumber: rawFlightNum,
      numOfGuests: rawGuests,
      ...(sanitizedComments ? { comments: sanitizedComments } : {}),
    };

    this.flightService.submitFlightInfo(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.status.set('SUCCESS');
        } else {
          // If session expired or unauthorized (401/403)
          if (response.statusCode === 401 || response.statusCode === 403 || !this.authService.isAuthenticated()) {
            this.authService.logout().then(() => {
              this.router.navigate(['/login'], {
                queryParams: { sessionExpired: 'true' },
              });
            });
            return;
          }

          this.status.set('ERROR');
          this.errorMessage.set(
            response.message || 'Unable to submit flight details. Please verify your connection or try again.'
          );
          this.flightForm.enable();
        }
      },
      error: (err) => {
        if (err?.status === 401 || err?.status === 403 || !this.authService.isAuthenticated()) {
          this.authService.logout().then(() => {
            this.router.navigate(['/login'], {
              queryParams: { sessionExpired: 'true' },
            });
          });
          return;
        }

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
