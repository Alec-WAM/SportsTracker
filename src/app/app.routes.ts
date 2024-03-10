import { Routes } from '@angular/router';
import { NbaTabComponent } from './components/tabs/nba-tab/nba-tab.component';
import { SettingsTabComponent } from './components/tabs/settings-tab/settings-tab/settings-tab.component';
import { HomeTabComponent } from './components/tabs/home-tab/home-tab.component';

export const routes: Routes = [
    {
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
    },
    {
        path: 'dashboard',
        pathMatch: 'full',
        title: "Dashboard",
        component: HomeTabComponent
    },
    {
        path: 'nba/team/:team', 
        title: "NBA",
        component: NbaTabComponent
    },
    {
        path: 'nba/team', 
        title: "NBA",
        component: NbaTabComponent
    },
    {
        path: 'settings', 
        pathMatch: 'full',
        title: "Settings",
        component: SettingsTabComponent
    }
];
