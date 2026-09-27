import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FlightInfoPayload, FlightSubmissionResponse } from '../models/flight-info.model';

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  private readonly http = inject(HttpClient);

  readonly apiUrl = 'https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge';

  /**
   * Submits flight details to the CRM SDK challenge endpoint.
   *
   * Headers note:
   * - Decoded Base64 content of the `token` header:
   *   "You must be the curious type.  Bring this up at the interview for bonus points !!"
   *
   * @param payload Flight information payload
   * @returns Observable emitting a sanitized, typed FlightSubmissionResponse
   */
  submitFlightInfo(payload: FlightInfoPayload): Observable<FlightSubmissionResponse> {
    const headers = new HttpHeaders({
      // Base64 Decoded Token: "You must be the curious type.  Bring this up at the interview for bonus points !!"
      token: 'WW91IG11c3QgYmUgdGhlIGN1cmlvdXMgdHlwZS4gIEJyaW5nIHRoaXMgdXAgYXQgdGhlIGludGVydmlldyBmb3IgYm9udXMgcG9pbnRzICEh',
      candidate: 'Albert Artemov-Eustace',
      'Content-Type': 'application/json',
    });

    return this.http.post<unknown>(this.apiUrl, payload, { headers }).pipe(
      map((response) => {
        if (typeof response === 'boolean') {
          return {
            success: response,
            message: response ? 'Flight info submitted successfully.' : 'Submission was not accepted.',
          };
        }

        if (response && typeof response === 'object') {
          const respObj = response as Partial<FlightSubmissionResponse>;
          return {
            success: respObj.success ?? true,
            message: respObj.message ?? 'Flight info submitted successfully.',
          };
        }

        return {
          success: true,
          message: 'Flight info submitted successfully.',
        };
      }),
      // Defensive error handling: intercept 4xx/5xx network failures and return a sanitized, typed error response
      catchError((error: HttpErrorResponse): Observable<FlightSubmissionResponse> => {
        const errorMessage =
          (typeof error.error === 'string' && error.error) ||
          error.error?.message ||
          error.message ||
          `Submission failed due to a network error (${error.status || 'unknown'}).`;

        return of({
          success: false,
          message: errorMessage,
        });
      })
    );
  }
}
