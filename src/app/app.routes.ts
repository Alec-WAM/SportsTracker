import { Routes } from '@angular/router';
import { NbaTabComponent } from './components/tabs/nba-tab/nba-tab.component';
import { SettingsTabComponent } from './components/tabs/settings-tab/settings-tab/settings-tab.component';
import { HomeTabComponent } from './components/tabs/home-tab/home-tab.component';

export const routes: Routes = [
    {
        path: '', 
        redirectTo: 'home', 
        pathMatch: 'full' 
    },
    {
        path: 'home',
        pathMatch: 'full',
        component: HomeTabComponent
    },
    {
        path: 'nba/:team', 
        component: NbaTabComponent
    },
    {
        path: 'nba', 
        component: NbaTabComponent
    },
    {
        path: 'settings', 
        pathMatch: 'full',
        component: SettingsTabComponent
    }
];
