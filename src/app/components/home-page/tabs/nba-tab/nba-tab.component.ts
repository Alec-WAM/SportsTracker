import { Component, OnInit, ViewEncapsulation, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TabMenuModule } from 'primeng/tabmenu';
import { ButtonModule } from 'primeng/button';
import { NBATeam, TEAMS } from '../../../../interfaces/nba-team';
import { MenuItem } from 'primeng/api';
import { NbaTabScheduleComponent } from './team-info/schedule/nba-tab-schedule/nba-tab-schedule.component';
import { NBAService } from '../../../../services/nba.service';
import { ESPN_NBA_Stats } from '../../../../interfaces/nba/espn-nba';
import { NbaBoxscoreComponent } from './nba-boxscore/nba-boxscore/nba-boxscore.component';
import { EMPTY_NBA_GAME, NBAGame } from '../../../../interfaces/nba/league-schedule';
import { toObservable } from '@angular/core/rxjs-interop';
import moment from 'moment';


@Component({
  selector: 'app-nba-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    ButtonModule,
    DropdownModule,
    TabMenuModule,

    NbaTabScheduleComponent,
    NbaBoxscoreComponent
  ],
  templateUrl: './nba-tab.component.html',
  styleUrl: './nba-tab.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class NbaTabComponent implements OnInit {
  TEAMS = TEAMS;
  selectedTeam: NBATeam | undefined;
  espnStats: ESPN_NBA_Stats | undefined;
  winLossStr: string | undefined;
  standingStr: string | undefined;  

  notifications: boolean = false;

  tabs: MenuItem[] = [
    { id: 'schedule', label: 'Schedule', icon: 'pi pi-fw pi-calendar' }
  ];
  activeTab: MenuItem | undefined

  nextGame = signal<NBAGame>(EMPTY_NBA_GAME);
  nextGame$ = toObservable(this.nextGame);

  constructor(public nbaService: NBAService) {
    this.nbaService.standings_loaded.subscribe((value) => {
      this.loadStats(this.selectedTeam);
      this.loadNextGame(this.selectedTeam);
    });
  }

  ngOnInit(): void {
    this.activeTab = this.tabs[0];
    if(this.nbaService.settingsService.settings?.favoriteTeam?.nbaTeamId){
      this.selectedTeam = this.nbaService.getTeam(this.nbaService.settingsService.settings?.favoriteTeam?.nbaTeamId);
    }
  }

  changeTeam(event: any): void {
    const team = event.value;
    this.loadStats(team);
    this.loadNextGame(team);
  }

  loadStats(team: NBATeam|undefined): void {
    this.winLossStr = "";
    this.standingStr = "";
    this.espnStats = undefined;
    if(team){
      this.espnStats = this.nbaService.getStats(team);
      this.winLossStr = `W/L: ${this.espnStats?.wins ?? '?'}-${this.espnStats?.losses ?? '?'} (${this.espnStats?.winpercent ?? '?'})`;
      this.standingStr = `Standings: ${this.espnStats?.playoffseed} ${team.conference === "East" ? "Eastern" : "Western"} Conference`
    }
  }

  //TODO Check this every day if the tab is still open
  loadNextGame(team: NBATeam|undefined): void {
    console.log("Loading next game")
    if(!team){
      this.nextGame.set(EMPTY_NBA_GAME);
      return;
    }
    const allGames = this.nbaService.getTeamGames(team);
    if(allGames.length <= 0){
      this.nextGame.set(EMPTY_NBA_GAME);
      return;
    }
    const now = moment();
    console.log(now.hour())
    //TODO Figure out how to still show games that are going on that are going past midnight
    const futureGames = allGames.filter((game) => this.filterGame(game, now))
    if(futureGames.length <= 0){
      this.nextGame.set(EMPTY_NBA_GAME);
      return;
    }
    const games = futureGames.sort((a, b) => {
      const dateA = moment(a.gameDateTimeUTC, moment.ISO_8601);
      const dateB = moment(b.gameDateTimeUTC, moment.ISO_8601);
      return dateA.diff(dateB);
    });
    // console.log(games);
    console.log(games[0])
    this.nextGame.set(games[0]);
  }

  filterGame(game: NBAGame, now: moment.Moment): boolean {
    let valid = false;
    const gameMoment = moment(game.gameDateTimeUTC, moment.ISO_8601);
    //Check for games that will cross over days
    if(gameMoment.hour() >= 22 && now.hour() < 3){
      const yesterday = now.clone().subtract(1, 'days');
      if(yesterday.isSame(gameMoment, "D")){
        valid = true;
      }
    }
    if(gameMoment.isSameOrAfter(now, 'D')){
      valid = true;
    }

    return valid;
  }

  toggleFavoriteTeam(): void {
    if(this.selectedTeam){
      if(this.nbaService.settingsService.settings){
        const currentFavorite = this.nbaService.settingsService.settings?.favoriteTeam?.nbaTeamId;
        console.log(currentFavorite)
        if(currentFavorite && currentFavorite !== this.selectedTeam.nba_id){
          this.nbaService.settingsService.settings.favoriteTeam.nbaTeamId = this.selectedTeam.nba_id;
        }
        else if(currentFavorite){
          this.nbaService.settingsService.settings.favoriteTeam.nbaTeamId = undefined;
        }
        else {
          this.nbaService.settingsService.settings.favoriteTeam.nbaTeamId = this.selectedTeam.nba_id;
        }
        console.log(this.nbaService.settingsService.settings.favoriteTeam.nbaTeamId)
        this.nbaService.settingsService.saveSettings();
      }
    }
  }

  toggleNotifications(): void {
    this.notifications = !this.notifications;
  }

  onActiveTabChange(event: MenuItem) {
    this.activeTab = event;
  }

  downloadSchedule(): void {
    this.nbaService.downloadLeagueSchedule();
  }
}
