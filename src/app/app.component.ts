import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { NBAService } from './services/nba.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    TabMenuModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'sports-app';
  
  tabs: MenuItem[] = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: 'pi pi-fw pi-home',
      routerLink: 'home'
    },
    { 
      id: 'nba', 
      label: 'NBA', 
      icon: 'pi pi-fw pi-calendar',
      routerLink: 'nba'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: 'pi pi-fw pi-cog',
      routerLink: 'settings' 
    }
  ];

  nbaService = inject(NBAService);

  ngOnInit(): void {
    this.nbaService.downloadLeagueSchedule();
  }
  
}
