import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NBATeamScheduleComponent } from './nba-team-schedule.component';

describe('NbaTabScheduleComponent', () => {
  let component: NBATeamScheduleComponent;
  let fixture: ComponentFixture<NBATeamScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NBATeamScheduleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NBATeamScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
