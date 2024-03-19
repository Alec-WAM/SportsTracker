import { CommonModule } from '@angular/common';
import { Component,  inject, input, signal} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { NBABroudcaster, NBAGame } from '../../../../../interfaces/nba/league-schedule';
import { EMPTY_NBA_TEAM, NBATeam } from '../../../../../interfaces/nba-team';
import { NBAService, NBA_JSON_ENDPOINT } from '../../../../../services/nba.service';
import moment, { Moment } from "moment";
import { EMPTY_NBA_BOXSCORE, NBA_Boxscore, NBA_GAME_STATUS_FINISHED, NBA_GAME_STATUS_LATER, NBA_GAME_STATUS_LIVE } from '../../../../../interfaces/nba/nba-boxscore';
import { Subscription, catchError, from, interval, switchMap, timer } from 'rxjs';
import { EMPTY_NBA_STATS } from '../../../../../interfaces/nba/espn-nba';
import { ProgressCircleComponent } from '../../../../misc/progress-circle/progress-circle.component';
import { TooltipModule } from 'primeng/tooltip';
import { TAG_GENERAL_MESSAGE, ToastService } from '../../../../../services/toast.service';
import { Pages } from '../../../../header/header.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nba-boxscore',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TooltipModule,

    ProgressCircleComponent
  ],
  templateUrl: './nba-boxscore.component.html',
  styleUrl: './nba-boxscore.component.scss'
})
export class NbaBoxscoreComponent {
  Pages = Pages;

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
  preGameSubscription: Subscription|undefined;
  gameStartTime: Moment | undefined;
  
  liveGameUpdateSubscription: Subscription|undefined;
  liveGameUpdateDelayProgress: number = 1.0;
  liveGameUpdateDelay: number = 0;
  updateToolip: string|undefined;
  liveGameLastUpdate: string|undefined;

  nbaService = inject(NBAService);
  toastService = inject(ToastService);
  constructor(){
    this.game$.subscribe((value) => {
      this.updateBoxscoreSignal();
    });
  }

  buildFutureBoxscore(nbaGame: NBAGame, now: Moment, gameTime: Moment): NBA_Boxscore {
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
    let timeText = "";
    if(!gameTime.isSame(now, 'W') || gameTime.isBefore(now, 'D')){
      timeText = gameTime.format("dddd, MMMM Do h:mm a");
    }
    else if(!gameTime.isSame(now, 'D')){
      if(gameTime.date() - now.date() === 1){
        timeText = "Tomorrow " + gameTime.format("h:mm a");
      }
      else {
        timeText = gameTime.format("dddd h:mm a");
      }
    }
    else {
      timeText = gameTime.format("h:mm a");
    }
    copyBoxScore.gameStatusText = timeText;
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
      const futureBoxscore: NBA_Boxscore = this.buildFutureBoxscore(nbaGame, now, gameTime);
      this.boxscore.set(futureBoxscore);      
      this.time_til_start = undefined;
      if(gameTime.isSame(now, 'D')){
        this.startCountdown();
      }
      return;
    }

    const nbaLink = nbaGame?.branchLink ?? "";
    const tvBroadcasters = nbaGame?.tvBroadcasters;
    from(fetch(`${NBA_JSON_ENDPOINT}/liveData/boxscore/boxscore_${nbaGame.gameId}.json`)).pipe(
      switchMap(response => response.json()),
      catchError((err, caught) => {
        this.invalidGame = true;
        this.boxscore.set(EMPTY_NBA_BOXSCORE);
        console.error(err);
        const gameCode = (nbaGame as any)['gameCode'] ?? "Unknown Game";
        this.toastService.showInfoToast({ 
          key: TAG_GENERAL_MESSAGE, 
          severity: 'error', 
          summary: 'Error', 
          detail: `Unable to load the boxscore for (${gameCode})` 
        });
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
    const now = moment();
    const duration = moment.duration(this.gameStartTime.diff(now));
    
    const hours = duration.hours();
    const mins = duration.minutes();
    this.time_til_start =  (hours > 0 ? `${hours} hr${hours > 1 ? 's': ''} and ` : "") + `${mins} min${mins > 1 ? 's': ''}`

    if(this.gameStartTime && now.isAfter(this.gameStartTime)){
      this.updateBoxscoreSignal();

      const preGameDone = this.gameStartTime.clone();
      preGameDone.add(20, 'minutes');

      this.preGameSubscription = timer(preGameDone.toDate()).subscribe(() => {
        this.updateBoxscoreSignal();
      });
      
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
      this.updateToolip = `Updating Boxscore in ${this.liveGameUpdateDelay}s`;
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
