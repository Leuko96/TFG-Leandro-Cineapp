import { TestBed } from '@angular/core/testing';

import { FriendsChatService } from './friends-chat.service';

describe('FriendsChatService', () => {
  let service: FriendsChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendsChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
