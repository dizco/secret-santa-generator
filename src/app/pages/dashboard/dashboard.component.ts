import { Component, OnInit } from '@angular/core';

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

  selections = [];

  ngOnInit(): void {
    this.participants.forEach((participant) => {
      const availableParticipants = this.participants.filter((p) => !p.picked && p !== participant);
      const randomAvailableParticipant = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
      randomAvailableParticipant.picked = participant.name;
    });
  }
}
