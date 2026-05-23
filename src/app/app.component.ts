import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OrderHostComponent } from './core/overlay/order-flow-host.component';
import { ThemeService } from './services/shared/theme/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OrderHostComponent],
  template: `<router-outlet /><app-order-host />`,
})
export class AppComponent {
  title = 'sethx-client';
  private readonly theme = inject(ThemeService);
}
