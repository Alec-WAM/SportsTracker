import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BROADCASTERS, BROADCASTER_NBA_LEAGUE_PASS_ID, NBABroudcaster } from '../../../interfaces/nba/league-schedule';
import { SettingsService } from '../../../services/settings.service';
import { FormsModule } from '@angular/forms';
import { BroadcasterURLSetting } from '../../../interfaces/settings';
import { toObservable } from '@angular/core/rxjs-interop';
import { DBService, DB_JSON_KEY_NBA_SCHEDULE } from '../../../services/db.service';
import moment from 'moment';
import { NBAService } from '../../../services/nba.service';
import { version } from '../../../../../package.json';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    AccordionModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss'
})
export class SettingsPageComponent implements OnInit {
  NBA_LEAGUE_PASS_ID = BROADCASTER_NBA_LEAGUE_PASS_ID;
  APP_VERSION:string = version;
  
  nbaScheduleDate = signal<string>("");
  nbaScheduleDate$ = toObservable(this.nbaScheduleDate)
  nbaScheduleCanDelete: boolean = false;

  nbaBroadcasters: NBABroudcaster[]|undefined;

  nbaBroadcasterURLs: any;

  constructor(public settingsService: SettingsService, public dbService: DBService, public nbaService: NBAService){
    this.nbaService.schedule_data_changed.subscribe(() => {
      this.updateNBAScheduleMessage();
    })
  }

  ngOnInit(): void {
    this.updateNBAScheduleMessage();

    this.nbaBroadcasters = BROADCASTERS.filter((broadcaster) => !broadcaster.parent_ids);
    this.nbaBroadcasterURLs = {};
    for(const broadcaster of this.nbaBroadcasters){
      this.nbaBroadcasterURLs[broadcaster.id] = this.settingsService.getNBABroadcasterURL(broadcaster.id)?.url;
    }
  }

  updateNBAScheduleMessage(): void {
    if(this.nbaService.schedule_download_error){
      this.nbaScheduleDate.set("Error Downloading Schedule (see logs)");
      return;
    }
    this.dbService.getJSONData(DB_JSON_KEY_NBA_SCHEDULE).then((value) => {
      if(!value){
        this.nbaScheduleDate.set("Schedule is not downloaded");
        this.nbaScheduleCanDelete = false;
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
        this.nbaScheduleCanDelete = true;
      }
    })
    .catch((error) => {
      this.nbaScheduleDate.set("Error Loading Schedule");
      console.error(error);
    });
  }

  //NBA Settings
  downloadNBASchedule(): void {
    this.nbaService.downloadNBAJSONSchedule();
  } 

  deleteNBASchedule(): void {
    this.nbaService.deleteNBASchedule();
  } 

  // TV Broadcasters
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
