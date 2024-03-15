import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaUpcomingGamesComponent } from './nba-upcoming-games.component';

describe('NbaUpcomingGamesComponent', () => {
  let component: NbaUpcomingGamesComponent;
  let fixture: ComponentFixture<NbaUpcomingGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NbaUpcomingGamesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NbaUpcomingGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
