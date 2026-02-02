import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNzI18n, ko_KR } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import ko from '@angular/common/locales/ko';

import { routes } from './app.routes';

registerLocaleData(ko);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideNzI18n(ko_KR)
  ]
};
