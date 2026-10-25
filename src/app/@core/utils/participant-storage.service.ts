import { Injectable } from '@angular/core';
import { Participant } from './draw.service';

interface StoredParticipant {
  name: string;
  email: string;
  /**
   * Indexes of the restricted participants in the stored list, since object references can't be serialized
   */
  restrictions: number[];
}

/**
 * Remembers the participants in the browser so they don't have to be re-entered on the next visit.
 * Picks are deliberately not stored, the draw stays secret.
 */
@Injectable()
export class ParticipantStorageService {
  private static readonly storageKey = 'secret-santa-generator.participants';

  load(): Participant[] | null {
    try {
      const raw = localStorage.getItem(ParticipantStorageService.storageKey);
      if (!raw) {
        return null;
      }

      const stored: StoredParticipant[] = JSON.parse(raw);
      if (!Array.isArray(stored)) {
        return null;
      }

      const participants: Participant[] = stored.map((p) => ({ name: p.name || '', email: p.email || '' }));
      stored.forEach((p, i) => {
        const restrictions = (p.restrictions || [])
          .filter((index) => index !== i && index >= 0 && index < participants.length)
          .map((index) => participants[index]);
        if (restrictions.length) {
          participants[i].restrictions = restrictions;
        }
      });
      return participants;
    } catch {
      // Storage unavailable (private mode, blocked site data) or corrupted, fall back to the defaults
      return null;
    }
  }

  save(participants: Participant[]): void {
    const stored: StoredParticipant[] = participants.map((p) => ({
      name: p.name,
      email: p.email,
      restrictions: (p.restrictions || []).map((r) => participants.indexOf(r)).filter((index) => index !== -1),
    }));

    try {
      localStorage.setItem(ParticipantStorageService.storageKey, JSON.stringify(stored));
    } catch {
      // Storage unavailable or full, the participants just won't be remembered
    }
  }
}
