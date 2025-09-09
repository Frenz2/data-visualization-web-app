import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartButton } from './start-button';

describe('StartButton', () => {
  let component: StartButton;
  let fixture: ComponentFixture<StartButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
