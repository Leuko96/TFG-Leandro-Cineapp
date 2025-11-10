import { TestBed } from '@angular/core/testing';

import { SentimentAnalysisServiceService } from './sentiment-analysis-service.service';

describe('SentimentAnalysisServiceService', () => {
  let service: SentimentAnalysisServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SentimentAnalysisServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
