import { Component, inject } from '@angular/core';
import { NbaUpcomingGamesComponent } from './nba-upcoming-games/nba-upcoming-games.component';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { NBAService } from '../../../../services/nba.service';

@Component({
  selector: 'app-home-tab',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,

    NbaUpcomingGamesComponent
  ],
  templateUrl: './home-tab.component.html',
  styleUrl: './home-tab.component.scss'
})
export class HomeTabComponent {

  nbaService = inject(NBAService);

  constructor(){}

  downloadSchedule(): void {
    this.nbaService.downloadLeagueSchedule();
  }
}
