import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiSelector } from './ai-selector';

describe('AiSelector', () => {
  let component: AiSelector;
  let fixture: ComponentFixture<AiSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
