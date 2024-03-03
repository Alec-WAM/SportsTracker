import { Component, Input } from '@angular/core';
import { NBAService } from '../../../../../services/nba.service';
import { NBABroudcaster, NBAGame } from '../../../../../interfaces/nba/league-schedule';
import { CommonModule } from '@angular/common';
import { NBATeam } from '../../../../../interfaces/nba-team';
import moment from "moment";
import { ESPN_NBA_Stats } from '../../../../../interfaces/nba/espn-nba';

@Component({
  selector: 'app-nba-game-card',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './nba-game-card.component.html',
  styleUrl: './nba-game-card.component.scss'
})
export class NbaGameCardComponent {

  @Input() set game(game: NBAGame|undefined) {
    this._game = game;
    this.setGame(game);
  }

  _game: NBAGame|undefined;
  awayTeam: NBATeam|undefined;
  homeTeam: NBATeam|undefined;
  awayStats: ESPN_NBA_Stats|undefined;
  homeStats: ESPN_NBA_Stats|undefined;
  link: string|undefined;

  seriesText: string|undefined;
  dateStr: string|undefined;
  timeStr: string|undefined;
  

  constructor(public nbaService: NBAService){}

  openLink(): void {
    if(this.link){
      window.open(this.link);
    }
  }

  openBroadcaster(broadcaster: NBABroudcaster, index: number): void {
    if(broadcaster.parent_ids){
      const realId = broadcaster.parent_ids[index];
      const realBroadcaster = this.nbaService.getBroadcaster(realId);
      if(realBroadcaster){
        this.nbaService.openBroadcaster(realBroadcaster, this.link);
      }
    }
    else {
      this.nbaService.openBroadcaster(broadcaster, this.link);
    }
  }

  setGame(game: NBAGame|undefined): void {
    if(!game){
      this.awayTeam = undefined;
      this.homeTeam = undefined;
      this.awayStats = undefined;
      this.homeStats = undefined;
      this.dateStr = undefined;
      this.timeStr = undefined;
      this.seriesText = undefined;
      this.link = undefined;
      return;
    }
    console.log(this._game);
    this.awayTeam = this.nbaService.getTeam(this._game?.awayTeam?.teamId);
    this.homeTeam = this.nbaService.getTeam(this._game?.homeTeam?.teamId);
    this.awayStats = this.nbaService.getStats(this.awayTeam);
    this.homeStats = this.nbaService.getStats(this.homeTeam);
    this.link = this._game?.branchLink;

    this.seriesText = this._game?.seriesText;

    const date = moment(this._game?.gameDateTimeUTC, moment.ISO_8601)
    const now = moment.now();

    if(!date.isSame(now, 'W') || date.isBefore(now, 'D')){
      this.dateStr = date.format("dddd, MMMM Do");
    }
    else if(!date.isSame(now, 'D')){
      this.dateStr = date.format("dddd");
    }
    else {
      this.dateStr = "Today";
    }
    this.timeStr = date.format("h:mm a");
  }

}
