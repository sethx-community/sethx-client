import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { LanguageService } from '../../../services/shared/i18n/language.service';
import { PUBLIC_CONTENT } from '../../../services/shared/i18n/public-content';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy.component.html',
})
export class PrivacyComponent {
  private readonly language = inject(LanguageService);
  readonly content = computed(() => PUBLIC_CONTENT[this.language.language()].privacy);
}
