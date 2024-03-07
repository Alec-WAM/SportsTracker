import { Component, OnInit, ViewEncapsulation, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TabMenuModule } from 'primeng/tabmenu';
import { ButtonModule } from 'primeng/button';
import { EMPTY_NBA_TEAM, NBATeam, TEAMS } from '../../../interfaces/nba-team';
import { MenuItem } from 'primeng/api';
import { NbaTabScheduleComponent } from './team-info/schedule/nba-tab-schedule/nba-tab-schedule.component';
import { NBAService } from '../../../services/nba.service';
import { ESPN_NBA_Stats } from '../../../interfaces/nba/espn-nba';
import { NbaBoxscoreComponent } from './nba-boxscore/nba-boxscore/nba-boxscore.component';
import { EMPTY_NBA_GAME, NBAGame } from '../../../interfaces/nba/league-schedule';
import { toObservable } from '@angular/core/rxjs-interop';
import moment from 'moment';
import { TooltipModule } from 'primeng/tooltip';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { TAG_GENERAL_MESSAGE, ToastService } from '../../../services/toast.service';
import { NBA_Notification } from '../../../interfaces/notification';


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
  
  selectedTeam = signal<NBATeam>(EMPTY_NBA_TEAM);
  selectedTeam$ = toObservable(this.selectedTeam);
  dropDownValue: NBATeam | undefined;

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
  nextGameRefreshSubscription: Subscription|undefined;

  nbaService = inject(NBAService);
  notificationService = inject(NotificationService);
  toastService = inject(ToastService);

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.paramMap.subscribe((value: ParamMap) => {
      this.loadFromParamMap(value);
    })
    this.nbaService.standings_loaded.subscribe((value) => {
      this.updateTeamInfo(this.selectedTeam(), false);
    });
    this.selectedTeam$.subscribe((value) => {
      // console.log("Selected Team changed")
      // console.log(value)
      this.dropDownValue = value;
      this.updateTeamInfo(value);
    });
  }

  loadFromParamMap(paramMap: ParamMap): NBATeam|undefined {
    if(paramMap.has("team")){
      const slug = paramMap.get("team");
      const team = this.nbaService.getTeamFromSlug(slug ?? "");
      if(team && team.nba_id){
        // console.log("Found team from slug " + slug)
        // console.log(team)
        this.selectedTeam.set(team);
        return team;
      }
      else {
        console.error("Can't find team from slug " + slug);
        this.toastService.showInfoToast({ 
          key: TAG_GENERAL_MESSAGE, 
          severity: 'error', 
          summary: 'Error', 
          detail: `Invalid Team URL (${slug})` 
        });
        this.router.navigate(["/nba/"]);
      }
    }
    else {
      // console.log("No team in url");
      if(this.nbaService.settingsService.settings?.favoriteTeams?.nbaTeamId){
        // console.log("Loading Favorite")
        const team = this.nbaService.getTeam(this.nbaService.settingsService.settings?.favoriteTeams?.nbaTeamId);
        if(team){
          this.selectedTeam.set(team);
          return team;
        }
      }
    }
    return undefined;
  }

  ngOnInit(): void {
    this.activeTab = this.tabs[0];
  }

  changeTeamDropdown(event: any): void {
    const team: NBATeam = event.value;
    // console.log("New Team: " + team.url_slug)
    this.router.navigate(["/nba/" + team.url_slug]);
  }

  updateTeamInfo(team: NBATeam, teamSwitch: boolean = true){
    // console.log("Updating Team Info: " + team.short_name)    
    if(teamSwitch && this.nextGameRefreshSubscription){
      this.nextGameRefreshSubscription.unsubscribe();
      this.nextGameRefreshSubscription = undefined;
    }
    this.notifications = this.nbaService.settingsService.getNBATeamNotificationSettings(team) != null;
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
    if(this.nextGameRefreshSubscription){
      this.nextGameRefreshSubscription.unsubscribe();
    }
    if(nextGame.gameId){
      const startMoment = moment(nextGame.gameDateTimeUTC, moment.ISO_8601);
      const refreshDate = startMoment.clone();
      refreshDate.add('1', 'days');
      refreshDate.set('hour', 2);
      refreshDate.set('minute', 0);
      refreshDate.set('second', 0);

      this.nextGameRefreshSubscription = timer(refreshDate.toDate()).subscribe((value) => {
        console.debug("Auto Loading Next Game")
        this.loadNextGame(this.selectedTeam());
      })
    }
  }

  toggleFavoriteTeam(): void {
    if(this.selectedTeam){
      if(this.nbaService.settingsService.settings){
        const currentFavorite = this.nbaService.settingsService.settings?.favoriteTeams?.nbaTeamId;
        console.log(currentFavorite)
        if(currentFavorite && currentFavorite !== this.selectedTeam().nba_id){
          this.nbaService.settingsService.settings.favoriteTeams.nbaTeamId = this.selectedTeam().nba_id;
        }
        else if(currentFavorite){
          this.nbaService.settingsService.settings.favoriteTeams.nbaTeamId = undefined;
        }
        else {
          this.nbaService.settingsService.settings.favoriteTeams.nbaTeamId = this.selectedTeam().nba_id;
        }
        console.log(this.nbaService.settingsService.settings.favoriteTeams.nbaTeamId)
        this.nbaService.settingsService.saveSettings();
      }
    }
  }

  toggleFollowTeam(): void {
    if(this.selectedTeam()){
      if(this.nbaService.settingsService.settings){
        let followList = this.nbaService.settingsService.settings.followingTeams?.nbaTeams ?? [];

        if(followList.includes(this.selectedTeam().nba_id)){
          followList = followList.filter((team) => team !== this.selectedTeam().nba_id);
        }
        else {
          followList.push(this.selectedTeam().nba_id);
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

  //TODO Add Notification Dialog (Start Game, End Game)
  toggleNotifications(): void {
    this.notifications = !this.notifications;
    if(this.notifications){
      const defaultNotificationSettings = this.nbaService.createDefaultNotificationSettings(this.selectedTeam());
      if(defaultNotificationSettings){
        this.nbaService.settingsService.setNBATeamNotificationSettings(this.selectedTeam(), defaultNotificationSettings);
      }
      else {
        console.error("Unabled to create notifications");
        this.toastService.showInfoToast({ 
          key: TAG_GENERAL_MESSAGE, 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Unabled to create notifications' 
        });
      }
    }
    else {
      if(this.nextGameRefreshSubscription){
        this.nextGameRefreshSubscription.unsubscribe();
      }
      this.nbaService.settingsService.setNBATeamNotificationSettings(this.selectedTeam(), undefined);
    }
    this.notificationService.buildNotifications();
  }

  onActiveTabChange(event: MenuItem) {
    this.activeTab = event;
  }

  downloadSchedule(): void {
    this.nbaService.loadLeagueSchedule();
  }

  sendNotification(): void {
    if(this.selectedTeam()){
      if(this.nextGame()){
        const notification: NBA_Notification = {
          team: this.selectedTeam(),
          title: '',
          description: 'Game in Progress',
          nbaGame: this.nextGame()
        };
        this.notificationService.sendNotification(notification)
      }
    }
  }
}
