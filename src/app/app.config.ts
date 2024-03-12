import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import { MessageService } from 'primeng/api';

const dbConfig: DBConfig  = {
  name: 'SportsApp',
  version: 1,
  objectStoresMeta: []
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    }),
    importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig)),
    MessageService
  ]
};
