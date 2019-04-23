import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateChannelsComponent } from './private-channels.component';

describe('PrivateChannelsComponent', () => {
  let component: PrivateChannelsComponent;
  let fixture: ComponentFixture<PrivateChannelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivateChannelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateChannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
