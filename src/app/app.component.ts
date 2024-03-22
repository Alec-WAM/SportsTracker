import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { NBAService } from './services/nba.service';
import { NotificationService } from './services/notification.service';
import { ToastService } from './services/toast.service';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { HeaderComponent, Pages } from './components/header/header.component';
import { NBA_Notification_Type } from './interfaces/notification';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { NbaGameCardComponent } from './components/pages/nba-pages/nba-game-card/nba-game-card/nba-game-card.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,    
    RouterOutlet,
    SidebarModule,
    TabMenuModule,
    ToastModule,
    ButtonModule,
    DialogModule,

    HeaderComponent,
    NbaGameCardComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {  
  Pages = Pages;
  NBA_Notification_Type = NBA_Notification_Type;

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
  notificationService = inject(NotificationService);
  toastService = inject(ToastService);

  ngOnInit(): void {
    this.nbaService.loadLeagueSchedule();
  }
  
}
