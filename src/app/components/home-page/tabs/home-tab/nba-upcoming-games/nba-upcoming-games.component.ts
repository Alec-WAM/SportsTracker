import { Component, OnInit, inject, signal } from '@angular/core';
import { NBAService } from '../../../../../services/nba.service';
import { NBA_Boxscore } from '../../../../../interfaces/nba/nba-boxscore';
import { toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { EMPTY_NBA_GAME, NBAGame } from '../../../../../interfaces/nba/league-schedule';
import moment, { Moment } from "moment";
import { deepCopy } from '../../../../../utils/util-functions';
import { NbaBoxscoreComponent } from '../../nba-tab/nba-boxscore/nba-boxscore/nba-boxscore.component';

@Component({
  selector: 'app-nba-upcoming-games',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,

    NbaBoxscoreComponent
  ],
  templateUrl: './nba-upcoming-games.component.html',
  styleUrl: './nba-upcoming-games.component.scss'
})
export class NbaUpcomingGamesComponent implements OnInit {
  nbaService = inject(NBAService)

  upcomingGames = signal<NBAGame[]>([])
  upcomingGames$ = toObservable(this.upcomingGames);
  followingCount: any[]|undefined;

  constructor(){
    this.nbaService.standings_loaded.subscribe((value) => {
      this.loadGames();
    });

    this.nbaService.settingsService.followedNBATeams$.subscribe((value) => {
      this.loadGames();
    })
  }
  
  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    const followingTeams = this.nbaService.settingsService.settings?.followingTeams?.nbaTeams ?? [];
    if(followingTeams.length > 0){
      this.followingCount = Array.from(Array(followingTeams.length).keys());
      const now = moment();
      const nextGames: NBAGame[] = followingTeams.map((teamId) => {
        const team = this.nbaService.getTeam(teamId);
        if(!team){
          return deepCopy(EMPTY_NBA_GAME);
        }
        return this.nbaService.getNextGame(now, team);
      })
      .filter((game) => game?.gameId)
      .sort((a, b) => {
        const dateA = moment(a.gameDateTimeUTC, moment.ISO_8601);
        const dateB = moment(b.gameDateTimeUTC, moment.ISO_8601);
        return dateA.diff(dateB);
      });
      this.upcomingGames.set(nextGames);
    }
    else {      
      console.log("Empty Upcoming")
      this.followingCount = [];
      this.upcomingGames.set([]);
    }
  }
  
}
