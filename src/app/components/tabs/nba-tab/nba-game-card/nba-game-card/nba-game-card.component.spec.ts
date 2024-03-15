import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaGameCardComponent } from './nba-game-card.component';

describe('NbaGameCardComponent', () => {
  let component: NbaGameCardComponent;
  let fixture: ComponentFixture<NbaGameCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NbaGameCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NbaGameCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
