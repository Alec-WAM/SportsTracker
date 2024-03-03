import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BROADCASTERS, BROADCASTER_NBA_LEAGUE_PASS_ID, NBABroudcaster } from '../../../../interfaces/nba/league-schedule';
import { SettingsService } from '../../../../services/settings.service';
import { FormsModule } from '@angular/forms';
import { BroadcasterURLSetting } from '../../../../interfaces/settings';
import { toObservable } from '@angular/core/rxjs-interop';
import { DBService, DB_JSON_KEY_NBA_SCHEDULE, DB_STORE_JSON } from '../../../../services/db.service';
import moment from 'moment';

@Component({
  selector: 'app-settings-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    AccordionModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './settings-tab.component.html',
  styleUrl: './settings-tab.component.scss'
})
export class SettingsTabComponent implements OnInit {
  NBA_LEAGUE_PASS_ID = BROADCASTER_NBA_LEAGUE_PASS_ID;
  
  nbaScheduleDate = signal<string>("");
  nbaScheduleDate$ = toObservable(this.nbaScheduleDate)

  nbaBroadcasters: NBABroudcaster[]|undefined;
  test: string|undefined;

  nbaBroadcasterURLs: any;

  constructor(public settingsService: SettingsService, public dbService: DBService){}

  ngOnInit(): void {

    this.dbService.getJSONData(DB_JSON_KEY_NBA_SCHEDULE).then((value) => {
      if(!value){
        this.nbaScheduleDate.set("Schedule is not downloaded");
      }
      else {
        const date = (value['meta'] ? value['meta']['time']  : "") ?? "";

        if(date){
          const momentDate = moment.utc(date, moment.ISO_8601);
          const formattedDate = momentDate.format("MM/DD/YYYY h:mm a")
          this.nbaScheduleDate.set("Downloaded " + formattedDate);
        }
        else {          
          this.nbaScheduleDate.set("Schedule is missing download date");
        }
      }
    })
    .catch((error) => {
      this.nbaScheduleDate.set("Error loading Schedule");
    });

    this.nbaBroadcasters = BROADCASTERS.filter((broadcaster) => !broadcaster.parent_ids);
    this.nbaBroadcasterURLs = {};
    for(const broadcaster of this.nbaBroadcasters){
      this.nbaBroadcasterURLs[broadcaster.id] = this.settingsService.getNBABroadcasterURL(broadcaster.id)?.url;
    }
  }

  updateNBAURL(broadcasterId: string, value: any): void {
    console.log("New Value:" + value)
    const setting = this.settingsService.getNBABroadcasterURL(broadcasterId);
    console.log(setting)
    if(setting){
      setting.url = value;
      console.log(setting)
      this.settingsService.saveSettings();
    }
    else {
      const newURL: BroadcasterURLSetting = {
        broadcasterId: broadcasterId,
        url: value
      }
      this.settingsService.settings?.broadcasterURLs.nbaURLs.push(newURL);
      this.settingsService.saveSettings();
    }
  }

  resetNBADefault(broadcasterId: string): void {
    const setting = this.settingsService.getNBABroadcasterURL(broadcasterId);
    const broadcaster: NBABroudcaster|undefined = BROADCASTERS.find((broadcaster) => broadcaster.id === broadcasterId);
    if(setting && broadcaster){
      this.nbaBroadcasterURLs[broadcaster.id] = broadcaster.default_url;
      setting.url = broadcaster.default_url;
      this.settingsService.saveSettings();
    }
  }
  
}
