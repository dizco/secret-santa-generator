import { Inject, Injectable } from '@angular/core';
import { forkJoin, from, Observable, of, of as observableOf, throwError } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
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
import { OidcSecurityService } from 'angular-auth-oidc-client';

export interface Auth0Token2Model {
  user: any;
  idToken: any;
  accessToken: string;
}

export class Auth0Token2 extends NbAuthOAuth2JWTToken {
  // let's rename it to exclude name clashes
  static NAME = 'nb:auth:auth02:token';

  protected readonly token: Auth0Token2Model;

  getValue(): string {
    return this.token.accessToken;
  }
}

@Injectable()
export class Auth0AuthStrategy2 extends NbOAuth2AuthStrategy {
  static setup(options: NbOAuth2AuthStrategyOptions): [NbAuthStrategyClass, NbOAuth2AuthStrategyOptions] {
    return [Auth0AuthStrategy2, options];
  }

  protected redirectResultHandlers: { [key: string]: Function } = {
    [NbOAuth2ResponseType.CODE]: () => {
      return this.oidcService.authorizedCallbackWithCode$(this.window.location.toString())
        .pipe(
          tap(() => console.log('In strategy, received authorize callback')),
          switchMap(() => this.oidcService.getUserData()),
          tap((r) => console.log('forkjoin', r)),
          map((user) => ({
            user,
            idToken: this.oidcService.getIdToken(),
            accessToken: this.oidcService.getToken(),
          } as Auth0Token2Model)),
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
