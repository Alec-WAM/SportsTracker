import { Routes } from '@angular/router';
import { NBATeamPageComponent } from './components/pages/nba-pages/nba-team-page/nba-team-page.component';
import { SettingsPageComponent } from './components/pages/settings-page/settings-page.component';
import { HomeTabComponent } from './components/pages/home-page/home-tab.component';
import { NbaPlayoffsPageComponent } from './components/pages/nba-pages/nba-playoffs-page/nba-playoffs-page.component';

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
        component: NBATeamPageComponent
    },
    {
        path: 'nba/team', 
        title: "NBA",
        component: NBATeamPageComponent
    },
    {
        path: 'nba/playoffs', 
        title: "NBA Playoffs",
        component: NbaPlayoffsPageComponent
    },
    {
        path: 'settings', 
        pathMatch: 'full',
        title: "Settings",
        component: SettingsPageComponent
    }
];
