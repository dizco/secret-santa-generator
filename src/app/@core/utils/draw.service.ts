import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { MailResponse, MailService } from './mail.service';

export interface Participant {
  name: string;
  email: string;
  picked?: Participant;
}

@Injectable()
export class DrawService {
  constructor(private mailService: MailService) {}

  sendResults(participants: Participant[]): Observable<MailResponse[]> {
    const tasks: Observable<MailResponse>[] = [];
    participants.forEach(participant => {
      tasks.push(this.mailService.send({
        to: participant.email,
        from: 'Secret Santa Generator',
        subject: 'Pige Noël Secte sur Neige 2020',
        message: {
          header: '<span style="color: #3d4852; font-size: 19px; font-weight: bold;">Secret Santa Generator</span>',
          // tslint:disable-next-line
          body: `Bonjour :) <br> Pour l'échange de Noël de la Secte sur Neige, tu as pigé: <b>${participant.picked.name} (${participant.picked.email})</b>. <br> Garde ce courriel précieusement... car il n'y a aucune façon de retrouver qui tu as pigé.`,
        },
      }));
    });

    return forkJoin(tasks);
  }
}
