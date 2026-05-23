import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LanguageService } from '../../../services/shared/i18n/language.service';
import { PUBLIC_CONTENT } from '../../../services/shared/i18n/public-content';

@Component({
  selector: 'app-governance-info',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './governance-info.component.html',
})
export class GovernanceInfoComponent {
  private readonly language = inject(LanguageService);
  readonly content = computed(() => PUBLIC_CONTENT[this.language.language()].governance);
}
