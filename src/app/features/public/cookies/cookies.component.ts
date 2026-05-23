import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { CookieConsentService } from '../../../services/shared/compliance/cookie-consent.service';
import { LanguageService } from '../../../services/shared/i18n/language.service';
import { PUBLIC_CONTENT } from '../../../services/shared/i18n/public-content';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookies.component.html',
})
export class CookiesComponent {
  readonly consent = inject(CookieConsentService);
  private readonly language = inject(LanguageService);
  readonly content = computed(() => PUBLIC_CONTENT[this.language.language()].cookies);
}
