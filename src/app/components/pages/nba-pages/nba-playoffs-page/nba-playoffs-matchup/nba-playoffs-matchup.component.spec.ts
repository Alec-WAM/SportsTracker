import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaPlayoffsMatchupComponent } from './nba-playoffs-matchup.component';

describe('NbaPlayoffsMatchupComponent', () => {
  let component: NbaPlayoffsMatchupComponent;
  let fixture: ComponentFixture<NbaPlayoffsMatchupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NbaPlayoffsMatchupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NbaPlayoffsMatchupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
