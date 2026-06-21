import { TestBed } from '@angular/core/testing';

import { NewsPanelService } from './news-panel.service';

describe('NewsPanelService', () => {
  let service: NewsPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewsPanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
