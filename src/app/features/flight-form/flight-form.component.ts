import { Component } from '@angular/core';

@Component({
  selector: 'app-flight-form',
  standalone: true,
  template: `
    <div class="flight-form-container">
      <h2>Flight Intake System</h2>
      <p>Flight Entry Form Placeholder (Protected Route)</p>
    </div>
  `,
  styles: [`
    .flight-form-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
  `],
})
export class FlightFormComponent {}
