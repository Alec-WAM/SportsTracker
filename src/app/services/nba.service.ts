import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BROADCASTERS, BROADCASTER_NBA_LEAGUE_PASS_ID, EMPTY_NBA_GAME, LeagueSchedule, NBABroudcaster, NBAGame, NBAGameDate } from '../interfaces/nba/league-schedule';
import local_schedule from '../../../2023-24_schedule.json';
import local_playoff_bracket from '../../../2023-24_PlayoffBracket.json';
import { Subject, from, switchMap } from 'rxjs';
import { NBATeam, TEAMS } from '../interfaces/nba-team';
import { ESPN_NBA_Stats } from '../interfaces/nba/espn-nba';
import { SettingsService } from './settings.service';
import moment, { Moment } from "moment";
import { deepCopy } from '../utils/util-functions';
import { DBService, DB_JSON_KEY_NBA_SCHEDULE } from './db.service';
import { NBA_NotificationSettings } from '../interfaces/notification';
import { MessageService } from 'primeng/api';
import { TAG_GENERAL_MESSAGE } from './toast.service';
import { EMPTY_PLAYOFF_ROUND, EMPTY_PLAYOFF_SERIES, NBA_Playoff_Round, NBA_Playoff_Series } from '../interfaces/nba/nba-playoff';

export const DB_OBJECT_NBA_SCHEDULE = 'nba-schedule';

export const NBA_API_ENDPOINT: string = "https://worker-sports-app-nba-api.alecwam.workers.dev"
export const NBA_JSON_ENDPOINT: string = `${NBA_API_ENDPOINT}/static/json`

@Injectable({
  providedIn: 'root'
})
export class NBAService {
  readonly NBA_SCHEDULE: string = `${NBA_JSON_ENDPOINT}/staticData/scheduleLeagueV2.json`;
  readonly DEV_NBA_SCHEDULE: string = "http://localhost:4200/static/json/staticData/scheduleLeagueV2.json";
  readonly ESPN_STANDINGS: string = "https://site.web.api.espn.com/apis/v2/sports/basketball/nba/standings?season=2024"

  readonly NBA_PLAYOFFS_DEBUG = false;
  readonly NBA_PLAYOFF_BRACKET = `${NBA_JSON_ENDPOINT}/staticData/brackets/{0}/PlayoffBracket.json`;
  readonly NBA_PLAYOFF_PLAYIN = `${NBA_JSON_ENDPOINT}/staticData/brackets/{0}/PlayInBracket.json`;
  readonly NBA_PLAYOFF_PICTURE = `${NBA_JSON_ENDPOINT}/staticData/brackets/{0}/PlayoffPicture.json`;

  dbService = inject(DBService);
  messageService = inject(MessageService);

  //TODO Change this to a setting
  nbaSeason: string|undefined;
  nbaPlayoffs: number|undefined;
  nbaPlayoffsLoaded: boolean = false;
  
  schedule_data_changed: Subject<void> = new Subject();
  schedule_download_error: boolean = false;

  schedule: LeagueSchedule | undefined;
  schedule_loaded: Subject<void> = new Subject();
  all_games: NBAGame[] | undefined;

  team_games: Map<string, string[]> | undefined;
  espn_stats_east: Map<string, ESPN_NBA_Stats> | undefined;
  espn_stats_west: Map<string, ESPN_NBA_Stats> | undefined;
  standings_loaded: Subject<void> = new Subject();

  //Playoffs
  playoff_playin_east: NBA_Playoff_Series[] = [];
  playoff_playin_west: NBA_Playoff_Series[] = [];
  playoff_east_rounds: NBA_Playoff_Round[] = [];
  playoff_west_rounds: NBA_Playoff_Round[] = [];
  playoff_finals: NBA_Playoff_Series = deepCopy(EMPTY_PLAYOFF_SERIES);
  playoffs_loaded: Subject<void> = new Subject();

  constructor(public http: HttpClient, public settingsService: SettingsService) { }

  loadLeagueSchedule(): void {
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
        this.downloadNBAJSONSchedule();
      }
      else {
        this.convertSchedule(value);
      }
    })    
  }

  downloadNBAJSONSchedule(): void {
    from(fetch(`${NBA_JSON_ENDPOINT}/staticData/scheduleLeagueV2.json`)).pipe(
      switchMap(response => response.json())
    )
    .subscribe({
      next: (response) => {
        console.info("Downloaded NBA Schedule");
        this.dbService.saveJSONData(DB_JSON_KEY_NBA_SCHEDULE, response).then(() => {
          this.convertSchedule(response);
          this.schedule_download_error = false;
          this.schedule_data_changed.next();
          
          this.messageService.add({ 
            key: TAG_GENERAL_MESSAGE, 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Downloaded the NBA Schedule' 
          });
        })
      },
      error: (error) => {
        console.error("Unable to load NBA Schedule")
        console.error(error);
        this.messageService.add({ 
          key: TAG_GENERAL_MESSAGE, 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Unable to download NBA Schedule' 
        });
        this.schedule_download_error = true;
        this.schedule_data_changed.next();
      }
    });
  }

  convertSchedule(json: any): void {
    this.all_games = [];
    this.schedule = undefined;
    this.team_games = new Map<string, string[]>();

    if(!json){
      this.clearSchedule();
      return;
    }
    console.debug("Loading NBA Schedule from JSON...");
    this.schedule = json as LeagueSchedule;
    this.nbaSeason = this.schedule.leagueSchedule.seasonYear;
    this.nbaPlayoffs = this.NBA_PLAYOFFS_DEBUG ? 2022 : Number(this.nbaSeason.split('-')[0]);
    
    if(this.schedule?.leagueSchedule?.gameDates){
      const gameDates: NBAGameDate[] = this.schedule?.leagueSchedule?.gameDates;
      const gamesArray: NBAGame[][] = gameDates.map((value) => {
        return value.games
      });
      this.all_games = ([] as NBAGame[]).concat(...gamesArray);
      this.all_games = this.all_games.map((game) => this.attachBroadcasters(game));
      // console.log(this.all_games)

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

      // console.log(this.team_games)
      console.debug("Loaded Team Games");
    }

    this.schedule_loaded.next();

    this.http.get(this.ESPN_STANDINGS).subscribe({
      next: (value: any) => {
        const json = value;
        const entries = json['children']
        this.loadESPNStats(entries);
      }
    });
  }

  deleteNBASchedule(): void {
    this.dbService.deleteJSONData(DB_JSON_KEY_NBA_SCHEDULE).then(() => {
      this.clearSchedule();
      this.schedule_data_changed.next();
      this.messageService.add({ 
        key: TAG_GENERAL_MESSAGE, 
        severity: 'error', 
        summary: 'Deleted', 
        detail: 'Deleted the NBA Schedule' 
      });
    })
    .catch((error) => {
      console.error(error);
    })
  }

  clearSchedule(): void {
    this.all_games = [];
    this.schedule = undefined;
    this.team_games = new Map<string, string[]>();
    this.espn_stats_east = new Map<string, ESPN_NBA_Stats>();
    this.espn_stats_west = new Map<string, ESPN_NBA_Stats>();
    this.schedule_loaded.next();
    this.standings_loaded.next();
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
        console.error("Can't find broudcaster " + id)
        console.error(game);
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
    console.debug("Loaded Team Stats");
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


  // sendTestNotification(team: NBATeam|undefined): void {
  //   let icon = "";
  //   if(team){
  //     icon = `/assets/images/logos/${team.image}.svg`;
  //   }
  //   const actions: NotificationAction[] = [];
  //   actions.push({
  //     action: 'game',
  //     title: 'View Game'
  //   })
  //   const data = {
  //     "onActionClick": {
  //       "default": {"operation": "openWindow"},
  //       "game": {"operation": "navigateLastFocusedOrOpen", "url": "https://google.com/"},
  //     }
  //   }
  //   this.notificationService.showNotification("Test Notification", {
  //     body: "Game Starting",
  //     icon: icon,
  //     actions: actions,
  //     data: data
  //   })
  // }


  getTeam(teamId: number|string|undefined): NBATeam|undefined {
    if(!teamId){
      return undefined;
    }
    const strTeam = String(teamId);
    return TEAMS.find((team) => team.nba_id === strTeam);
  }
  
  getTeamFromSlug(slug: string|undefined): NBATeam|undefined {
    if(!slug){
      return undefined;
    }
    return TEAMS.find((team) => team.url_slug === slug);
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

  getTodayGame(date: moment.Moment, team: NBATeam): NBAGame|undefined {
    const allGames = this.getTeamGames(team);
    return allGames.find((game) => {
      const gameMoment = moment(game.gameDateTimeUTC, moment.ISO_8601);      
      return gameMoment.isSame(date, 'D');
    })
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

  createDefaultNotificationSettings(nbaTeam: NBATeam): NBA_NotificationSettings | undefined {
    if(nbaTeam.nba_id){
      return {
        team_id: nbaTeam.nba_id,
        gameReminder: true,
        gameStart: true,
        finalScore: false
      } as NBA_NotificationSettings;
    }
    return undefined;
  }


  //Playoffs
  // playoffYear: string = `${this.nbaSeason}-${this.nbaSeason+1}`; 
  loadPlayoffs(): void {
    //Load PlayoffBracket
    if(!this.nbaPlayoffs)return;
    const url = this.NBA_PLAYOFFS_DEBUG ? `assets/${this.nbaPlayoffs}_PlayoffBracket.json` : this.NBA_PLAYOFF_BRACKET.replace('{0}', ''+this.nbaPlayoffs);
    this.http.get(url).subscribe((value) => {
      this.loadPlayoffBracket(value);
    })
  }

  loadPlayoffBracket(json: any): void {
    const playoffBracketSeries = json['bracket']['playoffBracketSeries'];

    this.playoff_west_rounds = [];
    this.playoff_east_rounds = [];

    const temp_east_rounds: Map<number, NBA_Playoff_Round> = new Map<number, NBA_Playoff_Round>();
    const temp_west_rounds: Map<number, NBA_Playoff_Round> = new Map<number, NBA_Playoff_Round>();

    for(let round = 1; round < 4; round++){
      const eastRound: NBA_Playoff_Round = deepCopy(EMPTY_PLAYOFF_ROUND);
      eastRound.roundNumber = round;
      eastRound.conference = 'East';
      const westRound: NBA_Playoff_Round = deepCopy(EMPTY_PLAYOFF_ROUND);
      westRound.roundNumber = round;
      westRound.conference = 'West';
      temp_east_rounds.set(round, eastRound);
      temp_west_rounds.set(round, westRound);
    }
    this.playoff_finals = deepCopy(EMPTY_PLAYOFF_SERIES);

    let loadPlayoffPicture = true;

    for(const series of playoffBracketSeries){
      const roundNumber = series['roundNumber'];
      const conference: string = series['seriesConference'];
      const seriesNumber: number = series['seriesNumber'];
      const highSeedTeamId: number = series['highSeedId'];
      const lowSeedTeamId: number = series['lowSeedId'];
      const seriesWinnerId: number = series['seriesWinner'];

      const higherSeedTeam = this.getTeam(highSeedTeamId);
      const highTeamRank = series['highSeedRank'];
      const highTeamWins = series['highSeedSeriesWins'] ?? 0;

      const lowerSeedTeam = this.getTeam(lowSeedTeamId);
      const lowTeamRank = series['lowSeedRank'];
      const lowTeamWins = series['lowSeedSeriesWins'] ?? 0;

      const seriesWinner = this.getTeam(seriesWinnerId);

      if(higherSeedTeam || lowerSeedTeam){
        loadPlayoffPicture = false;
      }

      const nba_series: NBA_Playoff_Series = {
        seriesNumber: seriesNumber,
        higherSeedTeam: higherSeedTeam,
        higherSeedRank: highTeamRank,
        higherSeedSeriesWins: highTeamWins,
        lowerSeedTeam: lowerSeedTeam,
        lowerSeedRank: lowTeamRank,
        lowerSeedSeriesWins: lowTeamWins,
        nextGame: undefined,
        seriesWinner: seriesWinner
      }

      if(!higherSeedTeam){
        nba_series.altTextHigh = "Winner of Previous Round"
      }
      if(!lowerSeedTeam){
        nba_series.altTextLow = "Winner of Previous Round"
      }

      if(roundNumber === 4){
        this.playoff_finals = nba_series;
      }
      else {
        if(conference.toLowerCase() === "west"){
          const nba_round = temp_west_rounds.get(roundNumber);
          nba_round?.series.push(nba_series);
        }
        else {
          const nba_round = temp_east_rounds.get(roundNumber);
          nba_round?.series.push(nba_series);
        }
      }
    }

    // console.log(temp_east_rounds);
    // console.log(temp_west_rounds);

    this.playoff_west_rounds = Array.from(temp_west_rounds.values());
    this.playoff_east_rounds = Array.from(temp_east_rounds.values());

    // console.log(this.playoff_east_rounds)

    if(loadPlayoffPicture){
      console.log("Loading Playoff Picture...")
      this.loadPlayoffPicture();
    }
    else {
      this.loadPlayoffPlayIn();
    }
  }

  loadPlayoffPlayIn(): void {
    const url = this.NBA_PLAYOFFS_DEBUG ? `assets/${this.nbaPlayoffs}_PlayInBracket.json` : this.NBA_PLAYOFF_PLAYIN.replace('{0}', ''+this.nbaPlayoffs);
    this.http.get(url).subscribe((value) => {
      this.fillPlayIn(value);
    });
  }

  fillPlayIn(json: any): void {
    const playInBracketSeries = json['bracket']['playInBracketSeries'] as any[];
    this.playoff_playin_west = [];
    this.playoff_playin_east = [];

    const temp_east_series: Map<number, NBA_Playoff_Series> = new Map<number, NBA_Playoff_Series>();
    const temp_west_series: Map<number, NBA_Playoff_Series> = new Map<number, NBA_Playoff_Series>();
    let wvlIndex = 0;
    for(const series of playInBracketSeries){
      if(series['matchupType'] === "First Round")continue;
      let conference = series['conference'];
      const highSeedTeam = this.getTeam(series['highSeedId']);
      const highSeedRank = series['highSeedRank'];
      const lowSeedTeam = this.getTeam(series['lowSeedId']);
      const lowSeedRank = series['lowSeedRank'];
      const seriesWinnerId: number = series['seriesWinner'];
      const seriesWinner = this.getTeam(seriesWinnerId);

      let seriesIndex = 0;
      if(series['matchupType'] === "Play-In 9v10"){
        seriesIndex = 1;
      }
      if(series['matchupType'] === "Play-In WvL"){
        seriesIndex = 2;
        if(conference === ""){
          conference = wvlIndex === 0 ? "East" : "West";
        }
        wvlIndex++;
      }

      if(conference.toLowerCase() === "west"){
        const west_series: NBA_Playoff_Series = deepCopy(EMPTY_PLAYOFF_SERIES);
        west_series.higherSeedTeam = highSeedTeam;
        west_series.higherSeedRank = highSeedRank;
        west_series.lowerSeedTeam = lowSeedTeam;
        west_series.lowerSeedRank = lowSeedRank;
        west_series.seriesWinner = seriesWinner;
        west_series.playIn = true;

        if(series['matchupType'] === "Play-In WvL"){
          if(!highSeedTeam){
            west_series.altTextHigh = "Winner of 9v10";
          }
          if(!lowSeedTeam){
            west_series.altTextLow = "Loser of 7v8";
          }
        }
        temp_west_series.set(seriesIndex, west_series);
      }
      else {
        const east_series: NBA_Playoff_Series = deepCopy(EMPTY_PLAYOFF_SERIES);
        east_series.higherSeedTeam = highSeedTeam;
        east_series.higherSeedRank = highSeedRank;
        east_series.lowerSeedTeam = lowSeedTeam;
        east_series.lowerSeedRank = lowSeedRank;
        east_series.seriesWinner = seriesWinner;
        east_series.playIn = true;

        if(series['matchupType'] === "Play-In WvL"){
          if(!highSeedTeam){
            east_series.altTextHigh = "Winner of 9v10";
          }
          if(!lowSeedTeam){
            east_series.altTextLow = "Loser of 7v8";
          }
        }
        temp_east_series.set(seriesIndex, east_series);
      }
    }    

    //Update Winners of PlayIn because it does not send the game winner
    const westRound1 = this.playoff_west_rounds[0];
    const westWvLSeries = westRound1.series[0];
    const eastRound1 = this.playoff_east_rounds[0];
    const eastWvLSeries = eastRound1.series[0];
    this.updatePlayinWinners(westWvLSeries, temp_west_series);
    this.updatePlayinWinners(eastWvLSeries, temp_east_series);

    //Convert map to correctly ordered array
    let valuesEast: NBA_Playoff_Series[] = [];
    let valuesWest: NBA_Playoff_Series[] = [];
    for(let i = 0; i < 3; i++){
      valuesEast.push(temp_east_series.get(i) ?? deepCopy(EMPTY_PLAYOFF_SERIES));
      valuesWest.push(temp_west_series.get(i) ?? deepCopy(EMPTY_PLAYOFF_SERIES));
    }
    this.playoff_playin_east = valuesEast;
    this.playoff_playin_west = valuesWest;

    this.nbaPlayoffsLoaded = true;
    this.playoffs_loaded.next();
  }

  updatePlayinWinners(wvlSeries: NBA_Playoff_Series, series: Map<number, NBA_Playoff_Series>): void {
    const WvL = series.get(2);
    //Update WvL winner
    if(WvL && wvlSeries){
      // Find whoever is in the Round 1 Seed 1 game and set them to the winner of the WvL
      let winningTeam: NBATeam | undefined = undefined;
      if(wvlSeries.lowerSeedTeam === WvL?.higherSeedTeam){
        winningTeam = wvlSeries.higherSeedTeam;
      }
      if(wvlSeries.lowerSeedTeam === WvL?.higherSeedTeam){
        winningTeam = wvlSeries.lowerSeedTeam;
      }
      WvL.seriesWinner = winningTeam;
    }
    
    const higherSeedRound = series.get(0);
    const lowerSeedRound = series.get(1);
    // 9v10
    if(lowerSeedRound && WvL?.lowerSeedTeam){
      lowerSeedRound.seriesWinner = WvL?.lowerSeedTeam;
    }
    // 7v8
    if(higherSeedRound){
      // Find whoever is in the WvL game and set the opposite team to the winner of 7v8
      let winningTeam: NBATeam | undefined = undefined;
      if(higherSeedRound.lowerSeedTeam === WvL?.higherSeedTeam){
        winningTeam = higherSeedRound.higherSeedTeam;
      }
      if(higherSeedRound.higherSeedTeam === WvL?.higherSeedTeam){
        winningTeam = higherSeedRound.lowerSeedTeam;
      }
      higherSeedRound.seriesWinner = winningTeam;
    }
  }

  loadPlayoffPicture(): void {
    const url = this.NBA_PLAYOFFS_DEBUG ? `assets/${this.nbaPlayoffs}_PlayoffPicture.json` : this.NBA_PLAYOFF_PICTURE.replace('{0}', ''+this.nbaPlayoffs);
    this.http.get(url).subscribe((value) => {
      this.fillRoundsWithPlayoffPicture(value);
    });
  }

  fillRoundsWithPlayoffPicture(json: any): void {
    const playoffPictureSeries = json['bracket']['playoffPictureSeries'] as any[];
    let east_index = 0;
    let west_index = 0;
    for(const series of playoffPictureSeries){
      if(series['matchupType'] !== "First Round")continue;
      const conference = series['conference'];
      const highSeedTeam = this.getTeam(series['highSeedId']);
      const highSeedRank = series['highSeedRank'];
      const lowSeedTeam = this.getTeam(series['lowSeedId']);
      const lowSeedRank = series['lowSeedRank'];

      if(conference.toLowerCase() === "west"){
        const nba_round = this.playoff_west_rounds[0];
        const west_series: NBA_Playoff_Series = nba_round.series[west_index];
        west_series.higherSeedTeam = highSeedTeam;
        west_series.higherSeedRank = highSeedRank;
        west_series.lowerSeedTeam = lowSeedTeam;
        west_series.lowerSeedRank = lowSeedRank;

        if(!lowSeedTeam && highSeedRank === 1){
          west_series.lowerSeedRank = 8;
          west_series.altTextLow = "Winner of Play-In WvL"
        }
        if(!lowSeedTeam && highSeedRank === 2){
          west_series.lowerSeedRank = 7;
          west_series.altTextLow = "Winner of Play-In 7v8"
        }
        west_index++;
      }
      else {
        const nba_round = this.playoff_east_rounds[0];
        const east_series: NBA_Playoff_Series = nba_round.series[east_index];
        east_series.higherSeedTeam = highSeedTeam;
        east_series.higherSeedRank = highSeedRank;
        east_series.lowerSeedTeam = lowSeedTeam;
        east_series.lowerSeedRank = lowSeedRank;

        if(!lowSeedTeam && highSeedRank === 1){
          east_series.lowerSeedRank = 8;
          east_series.altTextLow = "Winner of Play-In WvL"
        }
        if(!lowSeedTeam && highSeedRank === 2){
          east_series.lowerSeedRank = 7;
          east_series.altTextLow = "Winner of Play-In 7v8"
        }

        east_index++;
      }
    }
 
    this.loadPlayoffPlayIn();
  }
}
