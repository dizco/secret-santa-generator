import { Component, OnInit } from '@angular/core';
import { ArrayHelper } from '../../@core/helpers/array-helper';

interface Participant {
  name: string;
  picked: string;
}

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  editable = false;

  participants: Participant[] = [
    {
      name: 'Gabriel',
      picked: '',
    },
    {
      name: 'Myriam',
      picked: '',
    },
    {
      name: 'Élodie',
      picked: '',
    },
    {
      name: 'Antoine',
      picked: '',
    },
    {
      name: 'Jérémie',
      picked: '',
    },
    {
      name: 'Rosalie',
      picked: '',
    },
    {
      name: 'Camille',
      picked: '',
    },
    {
      name: 'Maxime',
      picked: '',
    },
  ];

  ngOnInit(): void {
    this.generate();
  }

  enterEditMode(): void {
    this.clearPicks();
    this.editable = true;
  }

  save(): void {
    this.editable = false;
    this.generate();
  }

  generate(): void {
    this.clearPicks();

    this.filterInvalidParticipants();

    const shuffled = ArrayHelper.completeShuffle(this.participants);
    for (let i = 0; i < this.participants.length; i++) {
      this.participants[i].picked = shuffled[i].name;
    }
  }

  addParticipant(): void {
    this.participants.push(this.buildEmptyParticipant());
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

  private buildEmptyParticipant(): Participant {
    return {
      name: '',
      picked: '',
    };
  }
}
