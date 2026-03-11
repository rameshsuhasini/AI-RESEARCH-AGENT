import { TestBed } from '@angular/core/testing';

import { ResearchAgent } from './research-agent';

describe('ResearchAgent', () => {
  let service: ResearchAgent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResearchAgent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
