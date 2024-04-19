import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaPlayoffsPageComponent } from './nba-playoffs-page.component';

describe('NbaPlayoffsPageComponent', () => {
  let component: NbaPlayoffsPageComponent;
  let fixture: ComponentFixture<NbaPlayoffsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NbaPlayoffsPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NbaPlayoffsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
