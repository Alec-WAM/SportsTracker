import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaTabComponent } from './nba-tab.component';

describe('NbaTabComponent', () => {
  let component: NbaTabComponent;
  let fixture: ComponentFixture<NbaTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NbaTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NbaTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
