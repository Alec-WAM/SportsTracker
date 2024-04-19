import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NBATeamPageComponent } from './nba-team-page.component';

describe('NbaTabComponent', () => {
  let component: NBATeamPageComponent;
  let fixture: ComponentFixture<NBATeamPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NBATeamPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NBATeamPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
