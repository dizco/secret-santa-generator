import { Component, OnInit } from '@angular/core';
import { ArrayHelper } from '../../@core/helpers/array-helper';

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  participants = [
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

  generate(): void {
    this.participants.forEach((participant) => {
      participant.picked = '';
    });

    const shuffled = ArrayHelper.completeShuffle(this.participants);
    for (let i = 0; i < this.participants.length; i++) {
      this.participants[i].picked = shuffled[i].name;
    }
  }


}
