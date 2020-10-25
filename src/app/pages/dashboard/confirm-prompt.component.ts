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
  templateUrl: 'confirm-prompt.component.html',
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
