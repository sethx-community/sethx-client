import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { CookieConsentService } from '../../../services/shared/compliance/cookie-consent.service';
import { TranslationPipe } from '../../../services/shared/i18n/t.pipe';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, TranslationPipe],
  templateUrl: './cookie-consent.component.html',
})
export class CookieConsentComponent {
  readonly consent = inject(CookieConsentService);
}
