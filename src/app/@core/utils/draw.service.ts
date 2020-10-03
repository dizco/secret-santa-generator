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
    // TODO: Generate email body

    const tasks: Observable<MailResponse>[] = [];
    participants.forEach(participant => {
      tasks.push(this.mailService.send({
        to: participant.email,
        from: 'Secret Santa Generator',
        subject: 'Your draw pick',
        body: `You have selected: ${participant.picked.name} (${participant.picked.email}).`,
      }));
    });

    return forkJoin(tasks);
  }
}
