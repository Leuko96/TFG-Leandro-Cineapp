import { TestBed } from '@angular/core/testing';

import { LoadMoviesService } from './load-movies.service';

describe('LoadMoviesService', () => {
  let service: LoadMoviesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadMoviesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
