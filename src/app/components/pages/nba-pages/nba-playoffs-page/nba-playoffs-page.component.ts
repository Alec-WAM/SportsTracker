import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NbaPlayoffsMatchupComponent } from './nba-playoffs-matchup/nba-playoffs-matchup.component';
import { NBAService, NBA_API_ENDPOINT } from '../../../../services/nba.service';
import { EMPTY_PLAYOFF_SERIES, NBA_Playoff_Series } from '../../../../interfaces/nba/nba-playoff';
import { SliderModule } from 'primeng/slider';
import { toObservable } from '@angular/core/rxjs-interop';
import { deepCopy } from '../../../../utils/util-functions';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nba-playoffs-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SliderModule,

    NbaPlayoffsMatchupComponent
  ],
  templateUrl: './nba-playoffs-page.component.html',
  styleUrl: './nba-playoffs-page.component.scss'
})
export class NbaPlayoffsPageComponent implements OnInit {
  NBA_API_ENDPOINT = NBA_API_ENDPOINT;

  nbaService = inject(NBAService);

  playInEast = signal<NBA_Playoff_Series[]>([]);
  playInEast$ = toObservable(this.playInEast);
  eastRound1 = signal<NBA_Playoff_Series[]>([]);
  eastRound1$ = toObservable(this.eastRound1);
  eastRound2 = signal<NBA_Playoff_Series[]>([]);
  eastRound2$ = toObservable(this.eastRound2);
  eastRound3 = signal<NBA_Playoff_Series[]>([]);
  eastRound3$ = toObservable(this.eastRound3);

  playInWest = signal<NBA_Playoff_Series[]>([]);
  playInWest$ = toObservable(this.playInWest);
  westRound1 = signal<NBA_Playoff_Series[]>([]);
  westRound1$ = toObservable(this.westRound1);
  westRound2 = signal<NBA_Playoff_Series[]>([]);
  westRound2$ = toObservable(this.westRound2);
  westRound3 = signal<NBA_Playoff_Series[]>([]);
  westRound3$ = toObservable(this.westRound3);

  showPlayIn = signal<boolean>(false);
  showPlayIn$ = toObservable(this.showPlayIn);
  showRound1 = signal<boolean>(false);
  showRound1$ = toObservable(this.showRound1);
  showRound2 = signal<boolean>(false);
  showRound2$ = toObservable(this.showRound2);
  showRound3 = signal<boolean>(false);
  showRound3$ = toObservable(this.showRound3);

  finalsRound = signal<NBA_Playoff_Series>(deepCopy(EMPTY_PLAYOFF_SERIES));
  finalsRound$ = toObservable(this.finalsRound);
  showFinals = signal<boolean>(false);
  showFinals$ = toObservable(this.showFinals);
  finalsYear: number|undefined;

  roundCount = signal<number>(4);
  roundCount$ = toObservable(this.roundCount);

  constructor(){
    this.nbaService.schedule_loaded.subscribe(() => {
      console.log("Schedule Loaded")
      if(this.nbaService.nbaPlayoffs){
        this.finalsYear = this.nbaService.nbaPlayoffs + 1;
      }
      this.nbaService.loadPlayoffs();
    });
    this.nbaService.playoffs_loaded.subscribe(() => {
      if(this.nbaService.nbaPlayoffs){
        this.finalsYear = this.nbaService.nbaPlayoffs + 1;
        this.loadPlayoffs();
      }
    })
    this.roundCount$.subscribe((value) => {
      this.loadPlayoffs();
    })
  }

  ngOnInit(): void {
    if(!this.nbaService.nbaPlayoffsLoaded){      
      this.nbaService.loadPlayoffs();
      return;
    }
    if(this.nbaService.nbaPlayoffs){
      this.finalsYear = this.nbaService.nbaPlayoffs + 1;
      this.loadPlayoffs();
    }
  }

  loadPlayoffs(): void {
    this.playInWest.set(this.nbaService.playoff_playin_west);
    this.playInEast.set(this.nbaService.playoff_playin_east);

    let tempShowR1 = false;
    let tempShowR2 = false;
    let tempShowR3 = false;
    for(const round of this.nbaService.playoff_west_rounds){
      const roundNumber = round.roundNumber;
      if(roundNumber === 1){
        if(this.validateSeries(round.series)){
          tempShowR1 = true;
        }
        this.westRound1.set(round.series);
      }
      if(roundNumber === 2){
        if(this.validateSeries(round.series)){
          tempShowR2 = true;
        }
        this.westRound2.set(round.series);
      }
      if(roundNumber === 3){
        if(this.validateSeries(round.series)){
          tempShowR3 = true;
        }
        this.westRound3.set(round.series);
      }
    }

    for(const round of this.nbaService.playoff_east_rounds){
      const roundNumber = round.roundNumber;
      if(roundNumber === 1){
        if(this.validateSeries(round.series)){
          tempShowR1 = true;
        }
        this.eastRound1.set(round.series);
      }
      if(roundNumber === 2){
        if(this.validateSeries(round.series)){
          tempShowR2 = true;
        }
        this.eastRound2.set(round.series);
      }
      if(roundNumber === 3){
        if(this.validateSeries(round.series)){
          tempShowR3 = true;
        }
        this.eastRound3.set(round.series);
      }
    }

    this.showPlayIn.set(!tempShowR3);
    this.showRound1.set(tempShowR1 && this.roundCount() >= 1);
    this.showRound2.set(tempShowR2 && this.roundCount() >= 2);
    this.showRound3.set(tempShowR3 && this.roundCount() >= 3);

    this.finalsRound.set(this.nbaService.playoff_finals);
    this.showFinals.set(this.validateSeries([this.nbaService.playoff_finals]) && this.roundCount() >= 4);
  }

  validateSeries(series: NBA_Playoff_Series[]): boolean {
    return series.filter((series) => series.higherSeedTeam || series.lowerSeedTeam).length > 0;
  }
}
