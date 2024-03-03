import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaBoxscoreComponent } from './nba-boxscore.component';

describe('NbaBoxscoreComponent', () => {
  let component: NbaBoxscoreComponent;
  let fixture: ComponentFixture<NbaBoxscoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NbaBoxscoreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NbaBoxscoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
