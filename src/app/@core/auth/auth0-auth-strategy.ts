import { Inject, Injectable } from '@angular/core';
import { forkJoin, from, Observable, of, of as observableOf, throwError } from 'rxjs';
import { map, switchMap, catchError, mapTo, tap } from 'rxjs/operators';
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
import { OktaAuthService, UserClaims } from '@okta/okta-angular';
import { OidcSecurityService } from 'angular-auth-oidc-client';

export interface Auth0Token {
  user: UserClaims;
  idToken: string;
  accessToken: string;
}

export class Auth0JWTToken extends NbAuthOAuth2JWTToken {
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
      return this.oidcService.checkAuth()
        .pipe(
          tap((r) => console.log('In strategy, received authorize callback', r)),
          switchMap((isAuthenticated) => {
            if (isAuthenticated) {
              return of();
            }
            return throwError('Authentication error');
          }),
          switchMap(() => this.oidcService.userData$),
          tap((r) => console.log('forkjoin', r)),
          map((user) => ({
            user,
            idToken: this.oidcService.getIdToken(),
            accessToken: this.oidcService.getToken(),
          } as Auth0Token)),
          tap((r) => console.log('mapped', r)),
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
              protected oidcService: OidcSecurityService,
              @Inject(NB_WINDOW) protected window: any) {
    super(http, route, window);
  }

  authenticate(data?: any): Observable<NbAuthResult> {
    return this.isRedirectResult()
      .pipe(
        switchMap((result: boolean) => {
          if (!result) {
            this.oidcService.authorize();
            return observableOf(new NbAuthResult(true));
          }
          return this.getAuthorizationResult();
        }),
      );
  }

  logout(): Observable<NbAuthResult> {
    this.oidcService.logoff();
    return of(new NbAuthResult(true));
  }
}
