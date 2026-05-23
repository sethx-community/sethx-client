import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { CountryAccessService } from '../../../services/shared/compliance/country-access.service';
import { TranslationPipe } from '../../../services/shared/i18n/t.pipe';

@Component({
  selector: 'app-country-block',
  standalone: true,
  imports: [CommonModule, TranslationPipe],
  templateUrl: './country-block.component.html',
})
export class CountryBlockComponent {
  readonly access = inject(CountryAccessService);
}
