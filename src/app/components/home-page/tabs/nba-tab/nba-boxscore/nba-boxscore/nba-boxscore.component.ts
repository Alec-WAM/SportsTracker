import { CommonModule } from '@angular/common';
import { Component,  OnInit, inject, input, signal} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { NBABroudcaster, NBAGame } from '../../../../../../interfaces/nba/league-schedule';
import { EMPTY_NBA_TEAM, NBATeam } from '../../../../../../interfaces/nba-team';
import { NBAService } from '../../../../../../services/nba.service';
import moment, { Moment } from "moment";
import { EMPTY_NBA_BOXSCORE, NBA_Boxscore, NBA_GAME_STATUS_FINISHED, NBA_GAME_STATUS_LATER, NBA_GAME_STATUS_LIVE } from '../../../../../../interfaces/nba/nba-boxscore';
import { Subscription, catchError, from, interval, of, switchMap, timer } from 'rxjs';
import { EMPTY_NBA_STATS } from '../../../../../../interfaces/nba/espn-nba';
import { ProgressCircleComponent } from '../../../../../misc/progress-circle/progress-circle.component';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-nba-boxscore',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule,

    ProgressCircleComponent
  ],
  templateUrl: './nba-boxscore.component.html',
  styleUrl: './nba-boxscore.component.scss'
})
export class NbaBoxscoreComponent implements OnInit {
  readonly TIMEOUTS_ARRAY = Array.from(Array(7).keys());
  readonly LIVE_UPDATE_INTERVAL = 60;

  STATUS_LATER = NBA_GAME_STATUS_LATER;
  STATUS_IN_PROGRESS = NBA_GAME_STATUS_LIVE;
  STATUS_FINAL = NBA_GAME_STATUS_FINISHED;

  game = input.required<NBAGame>();
  game$ = toObservable(this.game);

  invalidGame: boolean = false;
  boxscore = signal<NBA_Boxscore>(EMPTY_NBA_BOXSCORE);
  boxscore$ = toObservable(this.boxscore);

  time_til_start: string | undefined;
  countdownSubscription: Subscription|undefined;
  gameStartTime: Moment | undefined;
  
  liveGameUpdateSubscription: Subscription|undefined;
  liveGameUpdateDelayProgress: number = 1.0;
  liveGameUpdateDelay: number = 0;
  updateToolip: string|undefined;
  liveGameLastUpdate: string|undefined;

  // _game: NBAGame|undefined;
  // awayTeam: NBATeam|undefined;
  // homeTeam: NBATeam|undefined;
  // link: string|undefined;

  // seriesText: string|undefined;
  // dateStr: string|undefined;
  // timeStr: string|undefined;

  nbaService = inject(NBAService);
  constructor(){
    this.game$.subscribe((value) => {
      this.updateBoxscoreSignal();
    });
  }

  ngOnInit(): void {
    // if(this.game()){
    //   this.updateBoxscoreSignal();
    // }
  }

  buildFutureBoxscore(nbaGame: NBAGame, gameTime: Moment): NBA_Boxscore {
    const copyBoxScore: NBA_Boxscore = JSON.parse(JSON.stringify(EMPTY_NBA_BOXSCORE));
    const awayTeam: NBATeam = this.nbaService.getTeam(nbaGame.awayTeam.teamId) ?? EMPTY_NBA_TEAM;
    const homeTeam: NBATeam = this.nbaService.getTeam(nbaGame.homeTeam.teamId) ?? EMPTY_NBA_TEAM;
    const awayTeamStandings = this.nbaService.getStats(awayTeam) ?? EMPTY_NBA_STATS;
    const homeTeamStandings = this.nbaService.getStats(homeTeam) ?? EMPTY_NBA_STATS;
    
    copyBoxScore.awayTeam = awayTeam;
    copyBoxScore.awayTeamStandings = awayTeamStandings;
    copyBoxScore.homeTeam = homeTeam;
    copyBoxScore.homeTeamStandings = homeTeamStandings;

    copyBoxScore.gameStatus = this.STATUS_LATER;
    copyBoxScore.gameStatusText = gameTime.format("h:mm a")
    copyBoxScore.nbaLink = nbaGame.branchLink;
    copyBoxScore.tvBroadcasters = nbaGame.tvBroadcasters;
    
    return copyBoxScore;
  }

  updateBoxscoreSignal(): void {
    console.log("Updating Boxscore Signal")
    const nbaGame = this.game();

    if(!nbaGame){
      this.invalidGame = true;
      return;
    }
    this.invalidGame = false;

    const now = moment();
    const gameTime = moment(nbaGame.gameDateTimeUTC, moment.ISO_8601)

    this.liveGameLastUpdate = `Last Updated: ${now.format("h:mm a")}`;

    if(now.isBefore(gameTime)){
      const futureBoxscore: NBA_Boxscore = this.buildFutureBoxscore(nbaGame, gameTime);
      this.boxscore.set(futureBoxscore);
      this.startCountdown();
      return;
    }

    const nbaLink = nbaGame?.branchLink ?? "";
    const tvBroadcasters = nbaGame?.tvBroadcasters;
    from(fetch(`http://localhost:4200/static/json/liveData/boxscore/boxscore_${nbaGame.gameId}.json`)).pipe(
      switchMap(response => response.json()),
      catchError((err, caught) => {
        this.invalidGame = true;
        this.boxscore.set(EMPTY_NBA_BOXSCORE);
        console.error(err);
        return "error";
      })
    )
    .subscribe((response) => {
      if(response === "error"){       
        this.invalidGame = true;
        this.boxscore.set(EMPTY_NBA_BOXSCORE);
        return;
      }
      const game: any = response['game'];

      const awayTeamData = game['awayTeam'];
      const awayTeamId: number = awayTeamData['teamId'];
      const awayTeam = this.nbaService.getTeam(awayTeamId);
      const awayTeamStandings = this.nbaService.getStats(awayTeam);

      const homeTeamData = game['homeTeam'];
      const homeTeamId: number = homeTeamData['teamId'];
      const homeTeam = this.nbaService.getTeam(homeTeamId);
      const homeTeamStandings = this.nbaService.getStats(homeTeam);

      if(homeTeam && awayTeam){
        const boxscore: NBA_Boxscore = {
          awayTeam: awayTeam,
          awayTeamScore: {
            inBonus: awayTeamData['inBonus'] === '1',
            score: awayTeamData['score'],
            timeoutsRemaining: awayTeamData['timeoutsRemaining']
          },
          awayTeamStandings: awayTeamStandings,
          gameStatusText: game['gameStatusText'],
          gameStatus: game['gameStatus'],
          homeTeam: homeTeam,
          homeTeamScore: {
            inBonus: homeTeamData['inBonus'] === '1',
            score: homeTeamData['score'],
            timeoutsRemaining: homeTeamData['timeoutsRemaining']
          },
          homeTeamStandings: homeTeamStandings,
          nbaLink: nbaLink,
          tvBroadcasters: tvBroadcasters
        }
        this.boxscore.set(boxscore);
        if(this.boxscore().gameStatus === this.STATUS_IN_PROGRESS){
          this.startLiveGameUpdate();
        }
      }
    });
  }

  startCountdown(): void {
    this.gameStartTime = moment(this.game().gameDateTimeUTC, moment.ISO_8601);
    this.updateCountdown();
    console.log("Starting Countdown");
    this.countdownSubscription = interval(60 * 1000).subscribe((value) => {
      this.updateCountdown();
    })
  }

  updateCountdown(): void {
    if(!this.gameStartTime){
      this.time_til_start = undefined;
      this.countdownSubscription?.unsubscribe();
      return;
    }
    console.log("Updating Countdown");
    const now = moment();
    const duration = moment.duration(this.gameStartTime.diff(now));
    
    const hours = duration.hours();
    const mins = duration.minutes();
    this.time_til_start =  (hours > 0 ? `${hours} hr${hours > 1 ? 's': ''} and ` : "") + `${mins} min${mins > 1 ? 's': ''}`

    if(now.isAfter(this.gameStartTime)){
      this.updateBoxscoreSignal();
      this.gameStartTime = undefined;
      this.time_til_start = undefined;
      this.countdownSubscription?.unsubscribe();
    }
  }

  startLiveGameUpdate(): void {
    this.liveGameUpdateDelay = this.LIVE_UPDATE_INTERVAL;
    this.liveGameUpdateDelayProgress = 1.0;
    this.liveGameUpdateSubscription = timer(0, 1000).subscribe(value => {
      this.liveGameUpdateDelay--;
      this.liveGameUpdateDelayProgress = (this.liveGameUpdateDelay / this.LIVE_UPDATE_INTERVAL)
      this.updateToolip = `Updating game in ${this.liveGameUpdateDelay}s`;
      if (this.liveGameUpdateDelay <= 0) {
        this.updateGame();
        this.liveGameUpdateSubscription?.unsubscribe();
      }
    });
  }
  
  updateGame(): void {
    this.updateBoxscoreSignal();
  }

  openBroadcaster(broadcaster: NBABroudcaster, index: number): void {
    if(broadcaster.parent_ids){
      const realId = broadcaster.parent_ids[index];
      const realBroadcaster = this.nbaService.getBroadcaster(realId);
      if(realBroadcaster){
        this.nbaService.openBroadcaster(realBroadcaster, this.boxscore()?.nbaLink);
      }
    }
    else {
      this.nbaService.openBroadcaster(broadcaster, this.boxscore()?.nbaLink);
    }
  }

}
