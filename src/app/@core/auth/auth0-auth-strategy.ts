import { Inject, Injectable } from '@angular/core';
import { forkJoin, from, Observable, of, of as observableOf } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import {
  NbOAuth2AuthStrategy,
  NbOAuth2ResponseType,
  NbAuthOAuth2JWTToken,
  NbOAuth2AuthStrategyOptions,
  NbAuthStrategyClass,
  NbAuthResult,
  auth2StrategyOptions,
} from '@nebular/auth';
import { HttpClient } from '@angular/common/http';
import { NB_WINDOW } from '@nebular/theme';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

export interface Auth0Token {
  user: any;
  idToken: any;
  accessToken: string;
}

export class Auth0Token extends NbAuthOAuth2JWTToken {
  // let's rename it to exclude name clashes
  static NAME = 'nb:auth:auth0:token';

  protected readonly token: Auth0Token;

  getValue(): string {
    return this.token.accessToken;
  }
}

@Injectable()
export class Auth0AuthStrategy extends NbOAuth2AuthStrategy {
  static setup(options: NbOAuth2AuthStrategyOptions): [NbAuthStrategyClass, NbOAuth2AuthStrategyOptions] {
    return [Auth0AuthStrategy, options];
  }

  protected redirectResultHandlers: { [key: string]: Function } = {
    [NbOAuth2ResponseType.CODE]: () => {
      return of() // Instanciation of the Auth0 auth service resolves the callback parameters automatically
        .pipe(
          switchMap(() => {
            return forkJoin({
              user: this.auth0Auth.user$,
              idToken: this.auth0Auth.idTokenClaims$,
              accessToken: this.auth0Auth.getAccessTokenSilently(),
            }) as Observable<Auth0Token>;
          }),
          map((res) => {
            return new NbAuthResult(
              true,
              {},
              this.getOption('redirect.success'),
              [],
              this.getOption('defaultMessages'),
              this.createToken(res, this.getOption(`${module}.requireValidToken`)));
          }),
          catchError((e) => {
            console.error('Caught authentication error', e);
            return observableOf(
              new NbAuthResult(
                false,
                this.route.snapshot.queryParams,
                this.getOption('redirect.failure'),
                this.getOption('defaultErrors'),
                [],
              ));
          }),

        );
    },
  };

  protected defaultOptions: NbOAuth2AuthStrategyOptions = auth2StrategyOptions;

  constructor(protected http: HttpClient,
              protected route: ActivatedRoute,
              protected auth0Auth: AuthService,
              @Inject(NB_WINDOW) protected window: any) {
    super(http, route, window);
  }

  authenticate(data?: any): Observable<NbAuthResult> {
    return this.isRedirectResult()
      .pipe(
        switchMap((result: boolean) => {
          if (!result) {
            this.auth0Auth.loginWithRedirect();
            return observableOf(new NbAuthResult(true));
          }
          return this.getAuthorizationResult();
        }),
      );
  }

  logout(): Observable<NbAuthResult> {
    this.auth0Auth.logout({ returnTo: document.location.origin });
    return of(new NbAuthResult(true));
  }
}
