import { Pipe, PipeTransform, inject } from '@angular/core';

import { TranslationService } from './translation.service';
import { TranslationKey } from './translations';

@Pipe({ name: 't', standalone: true, pure: false })
export class TranslationPipe implements PipeTransform {
  private readonly translations = inject(TranslationService);

  transform(key: TranslationKey): string {
    return this.translations.t(key);
  }
}
