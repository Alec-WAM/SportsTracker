import { Component, effect, input } from '@angular/core';
import { Pages } from '../../../../header/header.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NBA_Playoff_Series } from '../../../../../interfaces/nba/nba-playoff';

// TODO Add badge to show that game is happening
@Component({
  selector: 'app-nba-playoffs-matchup',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './nba-playoffs-matchup.component.html',
  styleUrl: './nba-playoffs-matchup.component.scss'
})
export class NbaPlayoffsMatchupComponent {
  Pages = Pages;

  series = input.required<NBA_Playoff_Series>();

  constructor(){}

}
