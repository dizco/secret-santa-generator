import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbAuthResult, NbAuthService, NbLoginComponent } from '@nebular/auth';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

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
    this.authService.authenticate('auth0')
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
