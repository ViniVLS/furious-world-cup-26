import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { VERSION } from './environments/version';

console.log(`%c Furious World Cup 26 - ${VERSION} `, 'background: #ff2d20; color: white; font-weight: bold; padding: 4px; border-radius: 4px;');

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
