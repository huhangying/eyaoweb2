import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayNoticeComponent } from './today-notice.component';

describe('TodayNoticeComponent', () => {
  let component: TodayNoticeComponent;
  let fixture: ComponentFixture<TodayNoticeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodayNoticeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodayNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
