import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';

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
export class AppComponent {
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
}
