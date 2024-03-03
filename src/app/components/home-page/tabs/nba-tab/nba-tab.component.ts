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
import { TooltipModule } from 'primeng/tooltip';


@Component({
  selector: 'app-nba-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TooltipModule,

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
    if(this.nbaService.settingsService.settings?.favoriteTeams?.nbaTeamId){
      this.selectedTeam = this.nbaService.getTeam(this.nbaService.settingsService.settings?.favoriteTeams?.nbaTeamId);
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
    if(!team){
      this.nextGame.set(EMPTY_NBA_GAME);
      return;
    }
    const date = moment();
    const nextGame = this.nbaService.getNextGame(date, team);
    this.nextGame.set(nextGame);
  }

  toggleFavoriteTeam(): void {
    if(this.selectedTeam){
      if(this.nbaService.settingsService.settings){
        const currentFavorite = this.nbaService.settingsService.settings?.favoriteTeams?.nbaTeamId;
        console.log(currentFavorite)
        if(currentFavorite && currentFavorite !== this.selectedTeam.nba_id){
          this.nbaService.settingsService.settings.favoriteTeams.nbaTeamId = this.selectedTeam.nba_id;
        }
        else if(currentFavorite){
          this.nbaService.settingsService.settings.favoriteTeams.nbaTeamId = undefined;
        }
        else {
          this.nbaService.settingsService.settings.favoriteTeams.nbaTeamId = this.selectedTeam.nba_id;
        }
        console.log(this.nbaService.settingsService.settings.favoriteTeams.nbaTeamId)
        this.nbaService.settingsService.saveSettings();
      }
    }
  }

  toggleFollowTeam(): void {
    if(this.selectedTeam){
      if(this.nbaService.settingsService.settings){
        let followList = this.nbaService.settingsService.settings.followingTeams?.nbaTeams ?? [];

        if(followList.includes(this.selectedTeam.nba_id)){
          followList = followList.filter((team) => team !== this.selectedTeam?.nba_id);
        }
        else {
          followList.push(this.selectedTeam.nba_id);
        }
        if(!this.nbaService.settingsService.settings.followingTeams){
          this.nbaService.settingsService.settings.followingTeams = {
            nbaTeams: followList
          }
        }
        else {
          this.nbaService.settingsService.settings.followingTeams.nbaTeams = followList;
        }
        this.nbaService.settingsService.notifyNBAFavoritesChange();
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
