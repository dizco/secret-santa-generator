import { Component, OnDestroy } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { NbAuthResult } from '@nebular/auth';
import { Observable } from 'rxjs';
import { NonDisruptiveAuthService } from '../../@core/auth/non-disruptive-auth.service';
import { takeWhile, tap } from 'rxjs/operators';

export interface ConfirmPromptResult {
  confirmed: boolean;
}

interface ConfirmPromptDialogRef extends NbDialogRef<ConfirmPromptComponent> {
  readonly onClose: Observable<ConfirmPromptResult>; // Provide type hinting for onClose return value
  close(res?: ConfirmPromptResult): void;
}

@Component({
  selector: 'ngx-confirm-prompt',
  template: `
    <nb-card>
      <nb-card-body [nbSpinner]="isAuthenticating" nbSpinnerStatus="primary" nbSpinnerMessage="Opening a new tab for authentication...">
        <nb-alert outline="warning" class="mt-3 flex-row" *ngFor="let error of errors">
          <nb-icon icon="alert-triangle" status="warning"></nb-icon> <span>{{ error }}</span>
        </nb-alert>
        <div class="row d-flex align-items-center" *ngIf="requireLogin">
          <div class="col-md-10">
            <p class="m-0">Sending your results means that we must send emails to {{ drawParticipantsCount }} people.
              Since we don't like spam, we ask that you please login before we will send your draw results.
              This provides us the ability to identify misuse of the system.</p>
            <p class="m-0">We recommend using one of your social accounts, since that will avoid you having to create yet another password.
              We will only receive minimal information like your email and your name.</p>
          </div>
          <div class="col-md-2">
            <button nbButton status="success" size="small" (click)="login()">Login</button>
          </div>
        </div>
        <p class="m-0" *ngIf="!requireLogin">You are authenticated <nb-icon icon="checkmark-outline" status="success"></nb-icon></p>
      </nb-card-body>
      <nb-card-footer>
        <p *ngIf="canSubmit()">You are about to send emails to {{ drawParticipantsCount }} participants, please confirm:</p>
        <button nbButton status="primary" size="small" [disabled]="!canSubmit()" (click)="sendResults()" nbTooltip="Send results by email" class="mr-3"><nb-icon icon="email-outline"></nb-icon> Send results</button>
        <button nbButton status="danger" size="small" (click)="cancel()"><nb-icon icon="close-outline"></nb-icon> Cancel</button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [`
    nb-card {
      max-width: 700px;
    }
  `],
})
export class ConfirmPromptComponent implements OnDestroy {
  private alive = true;
  protected dialogRef: ConfirmPromptDialogRef;
  isAuthenticating: boolean;
  errors: string[] = [];

  drawParticipantsCount: number;
  requireLogin: boolean; // Context is injected dynamically by the NbDialogService

  constructor(dialogRef: NbDialogRef<ConfirmPromptComponent>, private nonDisruptiveAuthService: NonDisruptiveAuthService) {
    this.dialogRef = dialogRef;
  }

  ngOnDestroy() {
    this.alive = false;
  }

  canSubmit(): boolean {
    return !this.requireLogin;
  }

  cancel(): void {
    this.dialogRef.close({
      confirmed: false,
    });
  }

  login(): void {
    this.isAuthenticating = true;
    this.nonDisruptiveAuthService.authenticate().pipe(
      takeWhile(() => this.alive),
      tap((authResult: NbAuthResult) => {
        if (authResult.isSuccess()) {
          this.requireLogin = false;
        } else {
          this.errors = authResult.getErrors();
        }
      }),
    ).subscribe(() => {
      this.isAuthenticating = false;
    });
  }

  sendResults(): void {
    this.dialogRef.close({
      confirmed: true,
    });
  }
}
