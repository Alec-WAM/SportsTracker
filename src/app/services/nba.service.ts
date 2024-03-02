import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BROADCASTERS, BROADCASTER_NBA_LEAGUE_PASS_ID, LeagueSchedule, NBABroudcaster, NBAGame, NBAGameDate } from '../interfaces/nba/league-schedule';
import local_schedule from '../../../2023-24_schedule.json';
import { Subject } from 'rxjs';
import { NBATeam, TEAMS } from '../interfaces/nba-team';
import { ESPN_NBA_Stats } from '../interfaces/nba/espn-nba';
import { SettingsService } from './settings.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class NBAService {
  readonly NBA_SCHEDULE: string = "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json";
  readonly ESPN_STANDINGS: string = "https://site.web.api.espn.com/apis/v2/sports/basketball/nba/standings?season=2024"

  schedule: LeagueSchedule | undefined;
  schedule_loaded: Subject<void> = new Subject();
  all_games: NBAGame[] | undefined;

  team_games: Map<string, string[]> | undefined;
  espn_stats_east: Map<string, ESPN_NBA_Stats> | undefined;
  espn_stats_west: Map<string, ESPN_NBA_Stats> | undefined;
  standings_loaded: Subject<void> = new Subject();

  constructor(public http: HttpClient, public settingsService: SettingsService, public notificationService: NotificationService) { }

  downloadLeagueSchedule(): void {
    this.all_games = [];
    this.schedule = undefined;
    this.team_games = new Map<string, string[]>();
    // "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json"
    // this.http.get("../../../2023-24_schedule.json").subscribe({
    //   next: (value: any) => {
    //     console.log(value);
    //   }
    // })

    //https://cdn.nba.com/static/json/liveData/boxscore/boxscore_0022300844.json
    this.http.get("http://localhost:4200/static/json/liveData/boxscore/boxscore_0022300844.json").subscribe({
        next: (value: any) => {
          console.log(value);
        }
      })
    // this.http.get("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams").subscribe({
    //   next: (value: any) => {
    //     console.log(value)
    //     const json = value;
    //     const teams = json['sports'][0]['leagues'][0]['teams'].map((t: any) => t.team)
    //     console.log(teams)
    //     this.fixList(teams);
    //   }
    // });

    this.schedule = local_schedule as LeagueSchedule;
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
