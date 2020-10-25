import { Inject, Injectable } from '@angular/core';
import { NB_WINDOW } from '@nebular/theme';
import { OAuth2Window } from './oauth2-window';
import { NbAuthResult } from '@nebular/auth';

@Injectable()
export class AuthWindowService {
  constructor(@Inject(NB_WINDOW) private window: OAuth2Window) {}

  sendResult(authResult: NbAuthResult): void {
    this.window.opener.oauth2.callback(authResult);
  }

  finalize(): void {
    this.window.close();
  }
}
