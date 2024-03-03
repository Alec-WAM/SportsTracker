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
        component: HomeTabComponent
    },
    {
        path: 'nba', 
        component: NbaTabComponent
    },
    {
        path: 'settings', 
        component: SettingsTabComponent
    }
];
