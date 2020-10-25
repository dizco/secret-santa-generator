import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { NbAuthResult } from '@nebular/auth';
import { Observable } from 'rxjs';

export interface ConfirmPromptResult {
  recaptchaResult: string;
  authResult?: NbAuthResult;
}

interface ConfirmPromptDialogRef extends NbDialogRef<ConfirmPromptComponent> {
  readonly onClose: Observable<ConfirmPromptResult>; // Provide type hinting for onClose return value
  close(res?: ConfirmPromptResult): void;
}

@Component({
  selector: 'ngx-confirm-prompt',
  template: `
    <nb-card>
      <nb-card-body>
        <p>Sending your results means that we must send emails to {{ drawParticipantsCount }} people.
          Since we don't like spam, we ask that you please login before we will send your draw results.
          This provides us the ability to identify misuse of the system.
          We recommend using one of your social accounts, since that will avoid you having to create yet another password.
          We will only receive minimal information like your email and your name.</p>
        <button nbButton status="success" size="small" (click)="login()" class="mr-3">Login</button>
        <button nbButton status="danger" size="small" (click)="cancel()">Cancel</button>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    nb-card {
      max-width: 500px;
    }
  `],
})
export class ConfirmPromptComponent {
  protected dialogRef: ConfirmPromptDialogRef;
  drawParticipantsCount: number;
  requireLogin: boolean; // Context is injected dynamically by the NbDialogService

  constructor(dialogRef: NbDialogRef<ConfirmPromptComponent>) {
    this.dialogRef = dialogRef;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  login(): void {
    this.dialogRef.close({
      recaptchaResult: 'I am not a robot',
    });
  }
}
