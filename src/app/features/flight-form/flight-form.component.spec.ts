import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { FlightFormComponent } from './flight-form.component';
import { FlightService } from '../../core/services/flight.service';
import { FirebaseAuthService } from '../../core/firebase/firebase-auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';

describe('FlightFormComponent', () => {
  let component: FlightFormComponent;
  let fixture: ComponentFixture<FlightFormComponent>;
  let mockFlightService: { submitFlightInfo: ReturnType<typeof vi.fn> };
  let mockAuthService: {
    logout: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof signal>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockFlightService = {
      submitFlightInfo: vi.fn(),
    };
    mockAuthService = {
      logout: vi.fn().mockResolvedValue(undefined),
      currentUser: signal({ email: 'reviewer@challenge.com' } as any),
    };
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [FlightFormComponent],
      providers: [
        { provide: FlightService, useValue: mockFlightService },
        { provide: FirebaseAuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Test 1: should be invalid when required fields are empty', () => {
    component.flightForm.patchValue({
      airline: '',
      arrivalDate: '',
      arrivalTime: '',
      flightNumber: '',
      numOfGuests: '',
    });

    expect(component.flightForm.valid).toBe(false);
    expect(component.flightForm.get('airline')?.hasError('required')).toBe(true);
    expect(component.flightForm.get('arrivalDate')?.hasError('required')).toBe(true);
    expect(component.flightForm.get('arrivalTime')?.hasError('required')).toBe(true);
    expect(component.flightForm.get('flightNumber')?.hasError('required')).toBe(true);
    expect(component.flightForm.get('numOfGuests')?.hasError('required')).toBe(true);
  });

  it('Test 2: should reject 0 or negative numbers in numOfGuests validator', () => {
    const guestsCtrl = component.flightForm.get('numOfGuests');

    guestsCtrl?.setValue(0);
    expect(guestsCtrl?.valid).toBe(false);
    expect(guestsCtrl?.hasError('min')).toBe(true);

    guestsCtrl?.setValue(-3);
    expect(guestsCtrl?.valid).toBe(false);
    expect(guestsCtrl?.hasError('min')).toBe(true);

    guestsCtrl?.setValue(1);
    expect(guestsCtrl?.valid).toBe(true);

    guestsCtrl?.setValue(5);
    expect(guestsCtrl?.valid).toBe(true);
  });

  it('Test 3: should disable submit button when form is invalid or when status is SUBMITTING', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const submitBtn = compiled.querySelector<HTMLButtonElement>('[data-testid="submit-btn"]');
    expect(submitBtn?.disabled).toBe(true);

    component.flightForm.setValue({
      airline: 'United',
      arrivalDate: '2026-10-02',
      arrivalTime: '10:00',
      flightNumber: 'UA456',
      numOfGuests: 2,
      comments: '',
    });
    fixture.detectChanges();
    expect(submitBtn?.disabled).toBe(false);

    component.status.set('SUBMITTING');
    fixture.detectChanges();
    expect(submitBtn?.disabled).toBe(true);
  });

  it('Test 4: should cast numOfGuests to a number and pass exact FlightInfoPayload contract to FlightService', () => {
    mockFlightService.submitFlightInfo.mockReturnValue(
      of({ success: true, message: 'Success' })
    );

    component.flightForm.setValue({
      airline: '  Delta Airlines  ',
      arrivalDate: '2026-10-05',
      arrivalTime: '15:45',
      flightNumber: 'dl789  ',
      numOfGuests: '3' as any,
      comments: '  Traveling with violin  ',
    });

    component.onSubmit();

    expect(mockFlightService.submitFlightInfo).toHaveBeenCalledWith({
      airline: 'Delta Airlines',
      arrivalDate: '2026-10-05',
      arrivalTime: '15:45',
      flightNumber: 'DL789',
      numOfGuests: 3,
      comments: 'Traveling with violin',
    });
    expect(typeof mockFlightService.submitFlightInfo.mock.calls[0][0].numOfGuests).toBe('number');
  });

  it('Test 5: should switch view to success screen with "You\'re all done" messaging upon successful submission', () => {
    mockFlightService.submitFlightInfo.mockReturnValue(
      of({ success: true, message: 'Flight info accepted.' })
    );

    component.flightForm.setValue({
      airline: 'British Airways',
      arrivalDate: '2026-11-01',
      arrivalTime: '08:30',
      flightNumber: 'BA112',
      numOfGuests: 1,
      comments: '',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.status()).toBe('SUCCESS');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.intake-form')).toBeNull();
    const successCard = compiled.querySelector('[data-testid="success-card"]');
    expect(successCard).not.toBeNull();
    expect(successCard?.textContent).toContain("You're all done.");
    expect(successCard?.textContent).toContain('Flight Details Received!');
  });

  it('Test 6: should switch status to ERROR and display error alert without clearing form inputs upon submission failure', () => {
    mockFlightService.submitFlightInfo.mockReturnValue(
      of({ success: false, message: 'Cloud function timeout error.' })
    );

    component.flightForm.setValue({
      airline: 'Air France',
      arrivalDate: '2026-10-20',
      arrivalTime: '18:00',
      flightNumber: 'AF007',
      numOfGuests: 4,
      comments: 'Special meal requested',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.status()).toBe('ERROR');
    const compiled = fixture.nativeElement as HTMLElement;
    const errorAlert = compiled.querySelector('[data-testid="error-alert"]');
    expect(errorAlert).not.toBeNull();
    expect(errorAlert?.textContent).toContain('Cloud function timeout error.');

    expect(component.flightForm.get('airline')?.value).toBe('Air France');
    expect(component.flightForm.get('flightNumber')?.value).toBe('AF007');
    expect(component.flightForm.get('numOfGuests')?.value).toBe(4);
    expect(component.flightForm.get('comments')?.value).toBe('Special meal requested');
  });

  it('should reset form and return to IDLE when "Submit Another Flight" is triggered', () => {
    component.status.set('SUCCESS');
    fixture.detectChanges();

    component.resetForm();
    fixture.detectChanges();

    expect(component.status()).toBe('IDLE');
    expect(component.flightForm.get('airline')?.value).toBe('');
    expect(component.flightForm.get('numOfGuests')?.value).toBe(1);
    expect(component.flightForm.enabled).toBe(true);
  });

  it('should verify valid date selection creates a valid Date-convertible payload string', () => {
    mockFlightService.submitFlightInfo.mockReturnValue(of({ success: true }));

    component.flightForm.setValue({
      airline: 'Lufthansa',
      arrivalDate: '2026-12-25',
      arrivalTime: '14:20',
      flightNumber: 'LH400',
      numOfGuests: 2,
      comments: 'Holiday flight',
    });

    component.onSubmit();

    expect(mockFlightService.submitFlightInfo).toHaveBeenCalled();
    const payload = mockFlightService.submitFlightInfo.mock.calls[0][0];
    expect(payload.arrivalDate).toBe('2026-12-25');
    const parsedDate = new Date(payload.arrivalDate);
    expect(isNaN(parsedDate.getTime())).toBe(false);
    expect(parsedDate.getFullYear()).toBe(2026);
  });

  it('should reject malformed arrivalDate in boundary vault and set ERROR status', () => {
    component.flightForm.setValue({
      airline: 'Delta',
      arrivalDate: 'not-a-valid-date',
      arrivalTime: '12:00',
      flightNumber: 'DL101',
      numOfGuests: 1,
      comments: '',
    });

    component.onSubmit();

    expect(component.status()).toBe('ERROR');
    expect(component.errorMessage()).toContain('Invalid arrival date');
    expect(mockFlightService.submitFlightInfo).not.toHaveBeenCalled();
  });

  it('should reject malformed arrivalTime in boundary vault and set ERROR status', () => {
    component.flightForm.setValue({
      airline: 'Delta',
      arrivalDate: '2026-10-10',
      arrivalTime: '25:99',
      flightNumber: 'DL101',
      numOfGuests: 1,
      comments: '',
    });

    component.onSubmit();

    expect(component.status()).toBe('ERROR');
    expect(component.errorMessage()).toContain('Invalid arrival time');
    expect(mockFlightService.submitFlightInfo).not.toHaveBeenCalled();
  });

  it('should invoke showPicker when supported and gracefully fallback when unsupported', () => {
    const mockInput = document.createElement('input');
    const showPickerSpy = vi.fn();
    (mockInput as any).showPicker = showPickerSpy;

    component.triggerPicker(mockInput);
    expect(showPickerSpy).toHaveBeenCalled();

    // Verify graceful fallback when showPicker throws
    showPickerSpy.mockImplementation(() => {
      throw new Error('NotAllowedError');
    });
    expect(() => component.triggerPicker(mockInput)).not.toThrow();

    // Verify graceful fallback when input lacks showPicker
    const fallbackInput = document.createElement('input');
    expect(() => component.triggerPicker(fallbackInput)).not.toThrow();
  });

  it('should invoke authService.logout() and navigate to /login when onSignOut() is called', async () => {
    await component.onSignOut();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  describe('Number of Guests Input Protections', () => {
    it('should prevent default when invalid keys (e, E, +, -, .) are pressed in numOfGuests', () => {
      const invalidKeys = ['e', 'E', '+', '-', '.'];

      invalidKeys.forEach((key) => {
        const event = new KeyboardEvent('keydown', { key, cancelable: true });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        component.blockInvalidNumberKeys(event);
        expect(preventDefaultSpy).toHaveBeenCalled();
      });
    });

    it('should allow valid digit and control keys in numOfGuests', () => {
      const validKeys = ['0', '1', '5', '9', 'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];

      validKeys.forEach((key) => {
        const event = new KeyboardEvent('keydown', { key, cancelable: true });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        component.blockInvalidNumberKeys(event);
        expect(preventDefaultSpy).not.toHaveBeenCalled();
      });
    });

    it('should block non-digit clipboard pastes in numOfGuests', () => {
      const invalidPastes = ['1e3', '3.14', '-2', 'abc', '2+2'];

      invalidPastes.forEach((text) => {
        const clipboardData = {
          getData: vi.fn().mockReturnValue(text),
        } as unknown as DataTransfer;
        const pasteEvent = new Event('paste', { cancelable: true }) as ClipboardEvent;
        Object.defineProperty(pasteEvent, 'clipboardData', { value: clipboardData });
        const preventDefaultSpy = vi.spyOn(pasteEvent, 'preventDefault');

        component.onGuestsPaste(pasteEvent);
        expect(preventDefaultSpy).toHaveBeenCalled();
      });
    });

    it('should permit valid integer clipboard pastes in numOfGuests', () => {
      const validPastes = ['1', '12', ' 5 '];

      validPastes.forEach((text) => {
        const clipboardData = {
          getData: vi.fn().mockReturnValue(text),
        } as unknown as DataTransfer;
        const pasteEvent = new Event('paste', { cancelable: true }) as ClipboardEvent;
        Object.defineProperty(pasteEvent, 'clipboardData', { value: clipboardData });
        const preventDefaultSpy = vi.spyOn(pasteEvent, 'preventDefault');

        component.onGuestsPaste(pasteEvent);
        expect(preventDefaultSpy).not.toHaveBeenCalled();
      });
    });

    it('should flag decimal guest values as invalid via step validator', () => {
      const guestsCtrl = component.flightForm.get('numOfGuests');
      guestsCtrl?.setValue(2.5);
      expect(guestsCtrl?.valid).toBe(false);
      expect(guestsCtrl?.errors).toBeTruthy();
    });

    it('should reject non-integer guest values in the boundary vault if presentation validation is bypassed', () => {
      component.flightForm.setValue({
        airline: 'Delta',
        arrivalDate: '2026-10-10',
        arrivalTime: '14:30',
        flightNumber: 'DL101',
        numOfGuests: 2.5 as any,
        comments: '',
      });
      // Clear errors on the control to simulate bypassing presentation step validation
      component.flightForm.get('numOfGuests')?.setErrors(null);

      component.onSubmit();

      expect(component.status()).toBe('ERROR');
      expect(component.errorMessage()).toContain('whole number of at least 1');
      expect(mockFlightService.submitFlightInfo).not.toHaveBeenCalled();
    });
  });
});


