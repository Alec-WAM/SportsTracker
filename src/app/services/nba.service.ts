import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BROADCASTERS, BROADCASTER_NBA_LEAGUE_PASS_ID, EMPTY_NBA_GAME, LeagueSchedule, NBABroudcaster, NBAGame, NBAGameDate } from '../interfaces/nba/league-schedule';
import local_schedule from '../../../2023-24_schedule.json';
import { Subject, catchError, from, switchMap } from 'rxjs';
import { NBATeam, TEAMS } from '../interfaces/nba-team';
import { ESPN_NBA_Stats } from '../interfaces/nba/espn-nba';
import { SettingsService } from './settings.service';
import { NotificationService } from './notification.service';
import moment, { Moment } from "moment";
import { deepCopy } from '../utils/util-functions';
import { DBService, DB_JSON_KEY_NBA_SCHEDULE } from './db.service';

export const DB_OBJECT_NBA_SCHEDULE = 'nba-schedule';


@Injectable({
  providedIn: 'root'
})
export class NBAService {
  readonly NBA_SCHEDULE: string = "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json";
  readonly DEV_NBA_SCHEDULE: string = "http://localhost:4200/static/json/staticData/scheduleLeagueV2.json";
  readonly ESPN_STANDINGS: string = "https://site.web.api.espn.com/apis/v2/sports/basketball/nba/standings?season=2024"

  dbService = inject(DBService);

  schedule: LeagueSchedule | undefined;
  schedule_loaded: Subject<void> = new Subject();
  all_games: NBAGame[] | undefined;

  team_games: Map<string, string[]> | undefined;
  espn_stats_east: Map<string, ESPN_NBA_Stats> | undefined;
  espn_stats_west: Map<string, ESPN_NBA_Stats> | undefined;
  standings_loaded: Subject<void> = new Subject();

  constructor(public http: HttpClient, public settingsService: SettingsService, public notificationService: NotificationService) { }

  downloadLeagueSchedule(): void {
    // "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json"
    // this.http.get("../../../2023-24_schedule.json").subscribe({
    //   next: (value: any) => {
    //     console.log(value);
    //   }
    // })

    //https://cdn.nba.com/static/json/liveData/boxscore/boxscore_0022300844.json
    // this.http.get("http://localhost:4200/static/json/liveData/boxscore/boxscore_0022300844.json").subscribe({
    //     next: (value: any) => {
    //       console.log(value);
    //     }
    //   })
    // this.http.get("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams").subscribe({
    //   next: (value: any) => {
    //     console.log(value)
    //     const json = value;
    //     const teams = json['sports'][0]['leagues'][0]['teams'].map((t: any) => t.team)
    //     console.log(teams)
    //     this.fixList(teams);
    //   }
    // });

    // this.dbService.getByKey(DB_OBJECT_NBA_SCHEDULE, 1).pipe(
    //   catchError((error: any) => {
    //     console.warn("Unabled to find " + DB_OBJECT_NBA_SCHEDULE + " creating new ObjectStore")
    //     const storeSchema: ObjectStoreMeta = {
    //       store: DB_OBJECT_NBA_SCHEDULE,
    //       storeConfig: { keyPath: 'id', autoIncrement: true },
    //       storeSchema: []
    //     };
        
    //     this.dbService.createObjectStore(storeSchema);
  
    //     this.dbService.add(DB_OBJECT_NBA_SCHEDULE, local_schedule);
    //     return of(local_schedule);
    //   })
    // ).subscribe((schedule) => {
    //   console.log(schedule);
    //   this.convertSchedule(schedule);
    // });

    this.dbService.getJSONData(DB_JSON_KEY_NBA_SCHEDULE).then((value) => {
      if(!value){
        console.warn("NBA Schedule was not found... Downloading now");
        from(fetch('http://localhost:4200/static/json/staticData/scheduleLeagueV2.json')).pipe(
          switchMap(response => response.json()),
          catchError((err, caught) => {
            console.error(err);
            return "error";
          })
        )
        .subscribe((response) => {
          if(response === "error"){
            console.error("Unable to load NBA Schedule")
            return;
          }

          console.log(response)
          this.dbService.saveJSONData(DB_JSON_KEY_NBA_SCHEDULE, response).then(() => {
            this.convertSchedule(response);
          })
        });
      }
      else {
        this.convertSchedule(value);
      }
    })    
  }

  convertSchedule(json: any): void {
    console.debug("Loading NBA Schedule...");
    this.all_games = [];
    this.schedule = undefined;
    this.team_games = new Map<string, string[]>();

    this.schedule = json as LeagueSchedule;
    console.log(this.schedule);    

    if(this.schedule?.leagueSchedule?.gameDates){
      const gameDates: NBAGameDate[] = this.schedule?.leagueSchedule?.gameDates;
      const gamesArray: NBAGame[][] = gameDates.map((value) => {
        return value.games
      });
      this.all_games = ([] as NBAGame[]).concat(...gamesArray);
      this.all_games = this.all_games.map((game) => this.attachBroadcasters(game));
      console.log(this.all_games)

      for(const game of this.all_games){
        const awayTeam = String(game.awayTeam.teamId);
        const homeTeam = String(game.homeTeam.teamId);

        const awayTeamGames = this.team_games.get(awayTeam) ?? [];
        const homeTeamGames = this.team_games.get(homeTeam) ?? [];

        awayTeamGames.push(game.gameId);
        homeTeamGames.push(game.gameId);

        this.team_games.set(awayTeam, awayTeamGames);
        this.team_games.set(homeTeam, homeTeamGames);
      }

      console.log(this.team_games)
    }

    this.schedule_loaded.next();

    this.http.get(this.ESPN_STANDINGS).subscribe({
      next: (value: any) => {
        const json = value;
        const entries = json['children']
        this.loadESPNStats(entries)
      }
    });
  }

  attachBroadcasters(game: NBAGame): NBAGame {
    const anyCopy = game as any;
    const broadcasters: any = anyCopy['broadcasters'];
    const natBroadcasters: any[] = broadcasters['nationalBroadcasters']

    const tvBroadcasters: NBABroudcaster[] = game.tvBroadcasters ?? [];
    for(const brd of natBroadcasters){
      const id = String(brd['broadcasterId'])
      const broadcaster = this.getBroadcaster(id);
      if(broadcaster){
        tvBroadcasters.push(broadcaster);
      }
      else {
        console.log("can't find broudcaster " + id)
      }
    }

    if(natBroadcasters.length <= 0){
      //NBA League Pass
      const broadcaster = this.getBroadcaster(BROADCASTER_NBA_LEAGUE_PASS_ID);
      if(broadcaster){
        tvBroadcasters.push(broadcaster);
      }
    }

    if(tvBroadcasters.length > 0){
      anyCopy.tvBroadcasters = tvBroadcasters;
    }
    return anyCopy as NBAGame;
  }

  loadESPNStats(entries: any): void {
    const east = entries[0]
    const east_standings = east['standings']['entries']
    this.espn_stats_east = new Map<string, ESPN_NBA_Stats>();
    for(const standing of east_standings) {
      const team = standing['team']['id']
      const stats = standing['stats']
      const espn_stat = {
        wins: this.findStat('wins', stats),
        losses: this.findStat('losses', stats),
        winpercent: this.findStat('winpercent', stats),
        playoffseed: this.findStat('playoffseed', stats)
      } as ESPN_NBA_Stats;
      this.espn_stats_east.set(team, espn_stat);
    }

    const west = entries[1]
    const west_standings = west['standings']['entries']
    this.espn_stats_west = new Map<string, ESPN_NBA_Stats>();
    for(const standing of west_standings) {
      const team = standing['team']['id']
      const stats = standing['stats']
      const espn_stat = {
        wins: this.findStat('wins', stats),
        losses: this.findStat('losses', stats),
        winpercent: this.findStat('winpercent', stats),
        playoffseed: this.findStat('playoffseed', stats)
      } as ESPN_NBA_Stats;
      this.espn_stats_west.set(team, espn_stat);
    }
    this.standings_loaded.next();
  }

  findStat(field: string, stats: any[]): number|undefined {
    const value = stats.find((stat: any) => stat['type'] === field)?.value;
    return value ? Number(value) : undefined;
  }

  fixList(teams: any): void {
    let fixedList: any = [];

    TEAMS.forEach((old_team) => {
      let name = old_team.full_name;
      if(name === 'Los Angeles Clippers'){
        name = "LA Clippers"
      }
      console.log(name)
      const copy: any = Object.assign({}, old_team)
      const team = teams.find((t: any) => t['displayName'] === name);
      console.log(team)
      copy['espn_id'] = team['id'];
      copy['primary_color'] = team['color'];
      copy['secondary_color'] = team['alternateColor'];
      fixedList.push(copy)
    })
    console.log(fixedList)
  }


  sendTestNotification(team: NBATeam|undefined): void {
    let icon = "";
    if(team){
      icon = `/assets/images/logos/${team.image}.svg`;
    }
    const actions: NotificationAction[] = [];
    actions.push({
      action: 'game',
      title: 'View Game'
    })
    const data = {
      "onActionClick": {
        "default": {"operation": "openWindow"},
        "game": {"operation": "navigateLastFocusedOrOpen", "url": "https://google.com/"},
      }
    }
    this.notificationService.showNotification("Test Notification", {
      body: "Game Starting",
      icon: icon,
      actions: actions,
      data: data
    })
  }


  getTeam(teamId: number|string|undefined): NBATeam|undefined {
    if(!teamId){
      return undefined;
    }
    const strTeam = String(teamId);
    return TEAMS.find((team) => team.nba_id === strTeam);
  }

  getGame(gameId: string): NBAGame|undefined {
    return this.all_games?.find((game) => game.gameId === gameId);
  }

  getTeamGames(team: NBATeam): NBAGame[] {
    const game_ids = this.team_games?.get(team.nba_id);
    return game_ids ? game_ids.map((id) => {
      return this.getGame(id) as NBAGame;
    }) : []
  }

  getNextGame(date: Moment, team: NBATeam): NBAGame {
    const allGames = this.getTeamGames(team);
    const futureGames = allGames.filter((game) => this.filterNextGame(date, game))
    if(futureGames.length <= 0){
      return deepCopy(EMPTY_NBA_GAME);
    }
    const games = futureGames.sort((a, b) => {
      const dateA = moment(a.gameDateTimeUTC, moment.ISO_8601);
      const dateB = moment(b.gameDateTimeUTC, moment.ISO_8601);
      return dateA.diff(dateB);
    });
    return games[0];
  }  

  filterNextGame(date: moment.Moment, game: NBAGame, ): boolean {
    let valid = false;
    const gameMoment = moment(game.gameDateTimeUTC, moment.ISO_8601);
    //Check for games that will cross over days
    if(gameMoment.hour() >= 22 && date.hour() < 3){
      const yesterday = date.clone().subtract(1, 'days');
      if(yesterday.isSame(gameMoment, "D")){
        valid = true;
      }
    }
    if(gameMoment.isSameOrAfter(date, 'D')){
      valid = true;
    }
    return valid;
  }

  getBroadcaster(broadcasterId: string): NBABroudcaster|undefined {
    return BROADCASTERS.find((broadcaster) => broadcaster.id === broadcasterId);
  }

  openBroadcaster(broadcaster: NBABroudcaster, nbaLink: string|undefined): void {
    console.log("Opening " + broadcaster.name);
    const broadcasterURL = this.settingsService.getNBABroadcasterURL(broadcaster.id);
    if(broadcasterURL?.url){
      window.open(broadcasterURL.url, "_blank");
    }
    else if(nbaLink) {
      window.open(nbaLink, "_blank");
    }
  }

  getStats(team: NBATeam|undefined): ESPN_NBA_Stats|undefined {
    if(!team){
      return undefined;
    }
    const conference = team.conference;
    if(conference === "East"){
      return this.espn_stats_east?.get(team.espn_id);
    }
    return this.espn_stats_west?.get(team.espn_id);
  }
}
