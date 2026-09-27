export interface FlightInfoPayload {
  airline: string;
  arrivalDate: string;
  arrivalTime: string;
  flightNumber: string;
  numOfGuests: number;
  comments?: string;
}

export type SubmissionStatus = 'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR';

export interface FlightSubmissionResponse {
  success: boolean;
  message?: string;
  statusCode?: number;
}
