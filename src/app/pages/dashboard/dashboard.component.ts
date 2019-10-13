import { Component, OnDestroy, OnInit } from '@angular/core';
import { ArrayHelper } from '../../@core/helpers/array-helper';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, takeWhile, tap } from 'rxjs/operators';
import { AnalyticsService } from '../../@core/utils';
import { AnalyticsCategories } from '../../@core/utils/analytics.service';

interface Participant {
  name: string;
  picked: string;
}

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private alive = true;

  private isEditingSubject = new BehaviorSubject<boolean>(true);

  isEditing: Observable<boolean> = this.isEditingSubject.pipe(
    takeWhile(() => this.alive),
    map(v => v),
  );

  participants: Participant[] = [
    {
      name: 'Nick',
      picked: '',
    },
    {
      name: 'Eva',
      picked: '',
    },
    {
      name: 'Jack',
      picked: '',
    },
    {
      name: 'Lee',
      picked: '',
    },
    {
      name: 'Alan',
      picked: '',
    },
    {
      name: 'Kate',
      picked: '',
    },
  ];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.isEditing.pipe(
      takeWhile(() => this.alive),
      filter((value) => !value), // Only when isEditing becomes false
    ).subscribe(() => {
      this.generate();
    })
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  enterEditMode(): void {
    this.clearPicks();
    this.isEditingSubject.next(true);

    this.analyticsService.trackEvent('enterEditMode', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });
  }

  save(): void {
    this.isEditingSubject.next(false);

    this.analyticsService.trackEvent('saveParticipants', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });
  }

  generate(): void {
    this.analyticsService.trackEvent('generateDraw', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });

    this.clearPicks();

    this.filterInvalidParticipants();

    if (!this.hasEnoughParticipantsForDraw()) {
      this.analyticsService.trackEvent('invalidDraw', {
        event_category: AnalyticsCategories.SecretSantaGenerator,
        event_label: 'Not enough participants',
      });

      return;
    }

    const shuffled = ArrayHelper.completeShuffle(this.participants);
    for (let i = 0; i < this.participants.length; i++) {
      this.participants[i].picked = shuffled[i].name;
    }
  }

  removeParticipant(participant: Participant): void {
    this.participants = this.participants.filter((p) => p !== participant);

    this.analyticsService.trackEvent('removeParticipant', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });
  }

  addParticipant(): void {
    this.participants.push(DashboardComponent.buildEmptyParticipant());

    this.analyticsService.trackEvent('addParticipant', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });
  }

  hasEnoughParticipantsForDraw(): boolean {
    return this.participants.length > 1;
  }

  private clearPicks(): void {
    this.participants.forEach((participant) => {
      participant.picked = '';
    });
  }

  private filterInvalidParticipants(): void {
    this.participants = this.participants.filter((participant) => {
      return participant.name !== '';
    });
  }

  private static buildEmptyParticipant(): Participant {
    return {
      name: '',
      picked: '',
    };
  }
}
