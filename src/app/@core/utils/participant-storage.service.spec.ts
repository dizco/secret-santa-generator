import { ParticipantStorageService } from './participant-storage.service';
import { Participant } from './draw.service';

describe('ParticipantStorageService', () => {
  let service: ParticipantStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = new ParticipantStorageService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return null when nothing was saved', () => {
    expect(service.load()).toBeNull();
  });

  it('should restore names, emails and restrictions', () => {
    // Arrange
    const nick: Participant = { name: 'Nick', email: 'nick@example.com' };
    const eva: Participant = { name: 'Eva', email: 'eva@example.com' };
    const jack: Participant = { name: 'Jack', email: 'jack@example.com', restrictions: [nick, eva] };
    nick.picked = eva;

    // Act
    service.save([nick, eva, jack]);
    const loaded = service.load();

    // Assert
    expect(loaded.map((p) => p.name)).toEqual(['Nick', 'Eva', 'Jack']);
    expect(loaded.map((p) => p.email)).toEqual(['nick@example.com', 'eva@example.com', 'jack@example.com']);
    expect(loaded[2].restrictions[0]).toBe(loaded[0]);
    expect(loaded[2].restrictions[1]).toBe(loaded[1]);
    expect(loaded[0].restrictions).toBeUndefined();
    expect(loaded[0].picked).toBeUndefined();
  });

  it('should return null when the stored data is corrupted', () => {
    localStorage.setItem('secret-santa-generator.participants', '{not json');
    expect(service.load()).toBeNull();
  });
});
