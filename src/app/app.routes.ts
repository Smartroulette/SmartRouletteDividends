import {Routes} from '@angular/router';
import {Dividend} from './Dividend/dividend';

export const rootRouterConfig: Routes = [
  { path: '', component: Dividend },
  { path: '**', redirectTo: '/' }
];
