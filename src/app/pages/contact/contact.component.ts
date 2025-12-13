import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  template: `
    <div class="contact-container">
      <div class="container">
        <h1>Contact Us</h1>
        <p>Get in touch with our delivery team</p>
        
        <div class="contact-info">
          <div class="contact-method">
            <h3>📞 Phone</h3>
            <p>+216 123 456 789</p>
          </div>
          
          <div class="contact-method">
            <h3>📧 Email</h3>
            <p>contact@deliveryexpress.tn</p>
          </div>
          
          <div class="contact-method">
            <h3>📍 Address</h3>
            <p>123 Avenue Habib Bourguiba, Tunis</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-container {
      min-height: 80vh;
      padding: 4rem 0;
      background: linear-gradient(135deg, #F0EBE3 0%, #E8DDD4 50%, #E0D5C7 100%);
    }
    
    h1 {
      text-align: center;
      color: #8B7355;
      margin-bottom: 1rem;
      font-family: Georgia, serif;
      font-style: italic;
    }
    
    p {
      text-align: center;
      color: #A68B5B;
      margin-bottom: 3rem;
      font-family: Georgia, serif;
    }
    
    .contact-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .contact-method {
      background: rgba(255, 255, 255, 0.9);
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(139, 115, 85, 0.1);
      text-align: center;
      border: 1px solid #E8DDD4;
    }
    
    .contact-method h3 {
      color: #8B7355;
      margin-bottom: 1rem;
      font-family: Georgia, serif;
    }
    
    .contact-method p {
      color: #6B5B47;
      margin: 0;
      font-weight: 500;
    }
  `]
})
export class ContactComponent {}