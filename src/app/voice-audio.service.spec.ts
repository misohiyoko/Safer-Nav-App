import { TestBed } from '@angular/core/testing';

import { VoiceAudioService } from './voice-audio.service';

describe('VoiceAudioService', () => {
  let service: VoiceAudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoiceAudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
