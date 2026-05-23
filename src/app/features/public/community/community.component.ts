import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';

import { LanguageService } from '../../../services/shared/i18n/language.service';
import { PUBLIC_CONTENT } from '../../../services/shared/i18n/public-content';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community.component.html',
})
export class CommunityComponent implements OnInit, OnDestroy {
  private readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);

  readonly content = computed(() => PUBLIC_CONTENT[this.language.language()].community);

  ngOnInit(): void {
    this.document.documentElement.classList.add('home-scroll-snap');
    this.document.body.classList.add('home-scroll-snap');
  }

  ngOnDestroy(): void {
    this.document.documentElement.classList.remove('home-scroll-snap');
    this.document.body.classList.remove('home-scroll-snap');
  }
}
