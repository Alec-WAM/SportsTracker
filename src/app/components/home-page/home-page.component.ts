import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { TabMenuModule } from 'primeng/tabmenu';
import { HomeTabComponent } from './tabs/home-tab/home-tab.component';
import { NbaTabComponent } from './tabs/nba-tab/nba-tab.component';
import { SettingsTabComponent } from './tabs/settings-tab/settings-tab/settings-tab.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    TabMenuModule,
    TabViewModule,
    CommonModule,

    HomeTabComponent,
    NbaTabComponent,
    SettingsTabComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  tabs: MenuItem[] = [
    { id: 'home', label: 'Home', icon: 'pi pi-fw pi-home' },
    { id: 'nba', label: 'NBA', icon: 'pi pi-fw pi-calendar' },
    { id: 'settings', label: 'Settings', icon: 'pi pi-fw pi-cog' }
  ];
  activeTab: MenuItem | undefined;

  ngOnInit(): void {
    this.activeTab = this.tabs[0];
  }  

  onActiveTabChange(event: MenuItem) {
    this.activeTab = event;
  }
}
