import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Results } from './pages/results/results';

export const routes: Routes = [
    { path: '', component: Home },  // Home come root
    { path: 'results', component: Results }
];
