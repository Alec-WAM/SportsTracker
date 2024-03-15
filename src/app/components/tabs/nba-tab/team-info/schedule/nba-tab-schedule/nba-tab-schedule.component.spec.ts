import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaTabScheduleComponent } from './nba-tab-schedule.component';

describe('NbaTabScheduleComponent', () => {
  let component: NbaTabScheduleComponent;
  let fixture: ComponentFixture<NbaTabScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NbaTabScheduleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NbaTabScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
