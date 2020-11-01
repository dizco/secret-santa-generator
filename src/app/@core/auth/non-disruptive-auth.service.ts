import { Inject, Injectable, OnDestroy } from '@angular/core';
import { NB_WINDOW } from '@nebular/theme';
import { OAuth2WindowOpener } from './oauth2-window';
import { NbAuthResult } from '@nebular/auth';
import { Observable, Subject } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

/**
 * Handles complete authentication flow via a separate window.
 * This allows just-in-time authentication without disrupting the main UI flow
 */
@Injectable()
export class NonDisruptiveAuthService implements OnDestroy {
  private alive = true;

  constructor(@Inject(NB_WINDOW) private window: OAuth2WindowOpener) {}

  ngOnDestroy(): void {
    this.alive = false;
  }

  authenticate(url = '/auth'): Observable<NbAuthResult> {
    delete this.window.oauth2;
    const subject = new Subject<NbAuthResult>();

    this.window.oauth2 = {
      callback: (authResult: NbAuthResult) => {
        subject.next(authResult); // Send auth result to the caller, who requested authentication
        subject.complete();
      },
    };
    window.open(url);

    // TODO: Better error handling, what happens if someone times out, or if someone closes the page?
    return subject.pipe(
      takeWhile(() => this.alive),
      // TODO: Could we do the change detection here? Maybe with ApplicationRef or something...
    );
  }
}
