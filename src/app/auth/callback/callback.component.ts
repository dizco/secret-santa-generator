import { Component, OnDestroy } from '@angular/core';
import { NbAuthResult, NbAuthService } from '@nebular/auth';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { OktaAuthService, OktaCallbackComponent } from '@okta/okta-angular';

@Component({
  template: `
    <div class="text-center">
      Authenticating...
    </div>
  `,
})
export class CallbackComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private authService: NbAuthService, private router: Router) {
    this.authService.authenticate('okta')
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
        console.log('authResult', authResult, authResult.isSuccess());
        if (authResult.isSuccess() && authResult.getRedirect()) {
          console.log('navigating', authResult.getRedirect());
          this.router.navigateByUrl(authResult.getRedirect());
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/*export class CallbackComponent extends OktaCallbackComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private oktaAuth: OktaAuthService, private authService: NbAuthService, private router: Router) {
    super(oktaAuth);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
*/
