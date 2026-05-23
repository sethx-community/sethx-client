import { Injectable, computed, inject } from '@angular/core';

import { LanguageService } from './language.service';
import { TRANSLATIONS, TranslationKey } from './translations';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly language = inject(LanguageService);
  readonly currentDictionary = computed(() => TRANSLATIONS[this.language.language()]);

  t(key: TranslationKey): string {
    return this.currentDictionary()[key] ?? TRANSLATIONS.en[key] ?? key;
  }
}
