import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessSelector } from './process-selector';

describe('ProcessSelector', () => {
  let component: ProcessSelector;
  let fixture: ComponentFixture<ProcessSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
