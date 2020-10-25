import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { getDeepFromObject, NB_AUTH_OPTIONS, NbAuthResult, NbAuthService } from '@nebular/auth';
import { Subject } from 'rxjs';
import { catchError, filter, map, takeUntil } from 'rxjs/operators';

@Component({
  template: `
    <div class="text-center">
      <nb-alert status="danger" *ngIf="error">Oops, something unexpected happened. {{ error }}</nb-alert>
      <ng-container *ngIf="!error">Authenticating...</ng-container>
    </div>
  `,
})
export class CallbackComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private strategy: string = '';

  error: string = '';

  constructor(private authService: NbAuthService, @Inject(NB_AUTH_OPTIONS) protected options = {}) {
    this.strategy = this.getConfigValue('forms.login.strategy');
  }

  ngOnInit(): void {
    this.authService.authenticate(this.strategy)
      .pipe(
        takeUntil(this.destroy$),
        filter((authResult: NbAuthResult) => authResult.isSuccess()),
        map((authResult: NbAuthResult) => {
          return window.opener.oauth2Callback.callback(authResult);
        }),
        catchError((e) => this.error = e),
      )
      .subscribe(() => {
        window.close();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getConfigValue(key: string): any {
    return getDeepFromObject(this.options, key, null);
  };
}
