import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { FocusTrapModule } from 'primeng/focustrap';
import { Theme, ThemeService } from '../../services/theme.service';


export enum Pages {
  DASHBOARD = '/dashboard',
  NBA_TEAMS = '/nba/team',
  SETTINGS = '/settings'
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FocusTrapModule,

    SidebarModule,
    ButtonModule,
    AccordionModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  Pages = Pages;
  Theme = Theme;
  
  sidebarVisible: boolean = false;

  pageTitle = signal<any>("Page Title");
  pageTitle$ = toObservable(this.pageTitle);

  themeService = inject(ThemeService);

  constructor(private router: Router){
    this.router.events.subscribe((event) => {
      if(event instanceof NavigationEnd){
        this.updateHeader(event.url)
      }
    })
  }

  updateHeader(url: string): void {
    let newHeader = "";
    if(url.includes(Pages.DASHBOARD)){
      newHeader = "Dashboard";
    }
    else if(url.includes(Pages.NBA_TEAMS)){
      newHeader = "NBA";
    }
    else if(url.includes(Pages.SETTINGS)){
      newHeader = "Settings";
    }
    this.pageTitle.set(newHeader);
  }

  navigateToPage(page: string): void {
    this.router.navigate([page]);
    this.sidebarVisible = false;
  }
}
