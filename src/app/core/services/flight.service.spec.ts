import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FlightService } from './flight.service';
import { FlightInfoPayload, FlightSubmissionResponse } from '../models/flight-info.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('FlightService', () => {
  let service: FlightService;
  let httpMock: HttpTestingController;

  const samplePayload: FlightInfoPayload = {
    airline: 'Delta',
    arrivalDate: '2026-10-01',
    arrivalTime: '14:30',
    flightNumber: 'DL123',
    numOfGuests: 2,
    comments: 'VIP arrival',
  };

  const expectedToken =
    'WW91IG11c3QgYmUgdGhlIGN1cmlvdXMgdHlwZS4gIEJyaW5nIHRoaXMgdXAgYXQgdGhlIGludGVydmlldyBmb3IgYm9udXMgcG9pbnRzICEh';
  const expectedCandidate = 'Albert Artemov-Eustace';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlightService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FlightService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('Test 1: should issue an HTTP POST to the exact endpoint', () => {
    service.submitFlightInfo(samplePayload).subscribe();

    const req = httpMock.expectOne(service.apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(true);
  });

  it('Test 2: should include the required token, candidate, and Content-Type headers', () => {
    service.submitFlightInfo(samplePayload).subscribe();

    const req = httpMock.expectOne(service.apiUrl);
    expect(req.request.headers.get('token')).toBe(expectedToken);
    expect(req.request.headers.get('candidate')).toBe(expectedCandidate);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush(true);
  });

  it('Test 3: should transmit a request body that matches the FlightInfoPayload structure', () => {
    service.submitFlightInfo(samplePayload).subscribe();

    const req = httpMock.expectOne(service.apiUrl);
    expect(req.request.body).toEqual(samplePayload);
    expect(req.request.body.airline).toBe('Delta');
    expect(req.request.body.flightNumber).toBe('DL123');
    expect(req.request.body.numOfGuests).toBe(2);
    req.flush(true);
  });

  it('Test 4: should catch network errors and emit an error response cleanly', () => {
    let emission: FlightSubmissionResponse | undefined;

    service.submitFlightInfo(samplePayload).subscribe({
      next: (response) => {
        emission = response;
      },
    });

    const req = httpMock.expectOne(service.apiUrl);
    req.flush('Bad Request', {
      status: 400,
      statusText: 'Bad Request',
    });

    expect(emission).toBeDefined();
    expect(emission?.success).toBe(false);
    expect(emission?.message).toContain('Bad Request');
  });

  it('should map boolean true response to a successful FlightSubmissionResponse', () => {
    let emission: FlightSubmissionResponse | undefined;

    service.submitFlightInfo(samplePayload).subscribe({
      next: (response) => {
        emission = response;
      },
    });

    const req = httpMock.expectOne(service.apiUrl);
    req.flush(true);

    expect(emission).toEqual({
      success: true,
      message: 'Flight info submitted successfully.',
    });
  });
});
