import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsChatComponent } from './friends-chat.component';

describe('FriendsChatComponent', () => {
  let component: FriendsChatComponent;
  let fixture: ComponentFixture<FriendsChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FriendsChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
