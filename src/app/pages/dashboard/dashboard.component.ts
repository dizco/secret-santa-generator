import { Component, OnDestroy, OnInit } from '@angular/core';
import { ArrayHelper } from '../../@core/helpers/array-helper';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, takeWhile } from 'rxjs/operators';

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

  ngOnInit(): void {
    this.isEditing.pipe(
      takeWhile(() => this.alive),
      filter((value) => !value), // Only when isEditing becomes false
    ).subscribe({
      next: (_) => this.generate(),
    });
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  enterEditMode(): void {
    this.clearPicks();
    this.isEditingSubject.next(true);
  }

  save(): void {
    this.isEditingSubject.next(false);
  }

  generate(): void {
    this.clearPicks();

    this.filterInvalidParticipants();

    const shuffled = ArrayHelper.completeShuffle(this.participants);
    for (let i = 0; i < this.participants.length; i++) {
      this.participants[i].picked = shuffled[i].name;
    }
  }

  removeParticipant(participant: Participant): void {
    this.participants = this.participants.filter((p) => p !== participant);
  }

  addParticipant(): void {
    this.participants.push(DashboardComponent.buildEmptyParticipant());
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
