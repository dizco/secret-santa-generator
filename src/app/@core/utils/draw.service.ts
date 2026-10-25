import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MailResponse, MailService } from './mail.service';
import { catchError } from 'rxjs/operators';

export interface Participant {
  name: string;
  email: string;
  picked?: Participant;
  restrictions?: Participant[];
}

@Injectable()
export class DrawService {
  constructor(private mailService: MailService) {}

  sendResults(participants: Participant[], creator: Participant, captchaResponse: string): Observable<MailResponse> {
    const emails = participants.map(participant => ({
      to: participant.email,
      parameters: {
        pickedName: participant.picked.name,
        pickedEmail: participant.picked.email,
        creatorName: creator.name,
        creatorEmail: creator.email,
      },
    }));
    return this.mailService.send('secret-santa-result', emails, captchaResponse).pipe(
      catchError((error) => {
        return of({
          success: false,
          message: error,
        } as MailResponse);
      }),
    );
  }
}
