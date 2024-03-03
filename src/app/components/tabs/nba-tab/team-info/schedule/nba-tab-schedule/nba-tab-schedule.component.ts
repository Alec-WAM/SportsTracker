import { Component, Input, OnInit } from '@angular/core';
import { NBATeam } from '../../../../../../interfaces/nba-team';
import { NBAService } from '../../../../../../services/nba.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbaGameCardComponent } from '../../../nba-game-card/nba-game-card/nba-game-card.component';
import { CheckboxModule } from 'primeng/checkbox';
import { NBAGame } from '../../../../../../interfaces/nba/league-schedule';
import moment from "moment";

@Component({
  selector: 'app-nba-tab-schedule',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    CheckboxModule,

    NbaGameCardComponent
  ],
  templateUrl: './nba-tab-schedule.component.html',
  styleUrl: './nba-tab-schedule.component.scss'
})
export class NbaTabScheduleComponent implements OnInit {
  @Input() set team(team: NBATeam|undefined) {
    this._team = team;
    this.loadGames(team);
  }

  _team: NBATeam|undefined;

  filterFuture: boolean = true;
  currentDate: number|undefined;

  games: NBAGame[] | undefined;

  constructor(public nbaService: NBAService){
    this.nbaService.standings_loaded.subscribe((value) => {
      console.log(this._team)
      this.loadGames(this._team);
    })
  }

  ngOnInit(): void {
    this.currentDate = moment.now();
    // const found = TEAMS.find((team) => {
    //   return team.id === "1610612738"
    // });
    // console.log(found)
    // this.team;
    // console.log(this.team)
    // this.loadGames()
  }

  changeFutureFilter(event: any): void {
    this.loadGames(this._team);
  }

  loadGames(team: NBATeam|undefined): void {
    if(!team){
      this.games = [];
      return;
    }

    this.games = this.nbaService.getTeamGames(team).filter((game) => this.filterGame(game));
    console.log(this.games)
  }

  filterGame(game: NBAGame): boolean {
    let valid = true;
    if(this.filterFuture){
      const date = moment(game.gameDateTimeUTC, moment.ISO_8601);
      if(!date.isSameOrAfter(this.currentDate, "D")){
        valid = false;
      } 
    }
    return valid;
  }
  
}
