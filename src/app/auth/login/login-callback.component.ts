import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { getDeepFromObject, NB_AUTH_OPTIONS, NbAuthResult, NbAuthService } from '@nebular/auth';
import { Subject } from 'rxjs';
import { catchError, filter, map, takeUntil } from 'rxjs/operators';
import { AuthWindowService } from '../../@core/auth/auth-window.service';

@Component({
  template: `
    <div class="text-center">
      <nb-alert status="danger" *ngIf="error">Oops, something unexpected happened. {{ error }}</nb-alert>
      <ng-container *ngIf="!error">Authenticating...</ng-container>
    </div>
  `,
})
// Note: This class assumes that it is running in a separate window than the main window
// Responsibility of creating the window is set on the component who triggers the login flow
export class LoginCallbackComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private strategy: string = '';

  error: string = '';

  constructor(private authService: NbAuthService,
              private authWindowService: AuthWindowService,
              @Inject(NB_AUTH_OPTIONS) protected options = {}) {
    this.strategy = this.getConfigValue('forms.login.strategy');
  }

  ngOnInit(): void {
    this.authService.authenticate(this.strategy)
      .pipe(
        filter((authResult: NbAuthResult) => authResult.isSuccess()),
        map((authResult: NbAuthResult) => {
          return this.authWindowService.sendResult(authResult);
        }),
        catchError((e) => this.error = e),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.authWindowService.finalize();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getConfigValue(key: string): any {
    return getDeepFromObject(this.options, key, null);
  }
}
