import { Inject, Injectable } from '@angular/core';
import { forkJoin, from, Observable, of as observableOf } from 'rxjs';
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

export interface OktaToken {
  user: UserClaims;
  idToken: string;
  accessToken: string;
}

export class OktaToken extends NbAuthOAuth2JWTToken {
  // let's rename it to exclude name clashes
  static NAME = 'nb:auth:okta:token';

  protected readonly token: OktaToken;

  getValue(): string {
    return this.token.accessToken;
  }
}

@Injectable()
export class OktaAuthStrategy extends NbOAuth2AuthStrategy {
  static setup(options: NbOAuth2AuthStrategyOptions): [NbAuthStrategyClass, NbOAuth2AuthStrategyOptions] {
    return [OktaAuthStrategy, options];
  }

  protected redirectResultHandlers: { [key: string]: Function } = {
    [NbOAuth2ResponseType.CODE]: () => {
      return from(this.oktaAuth.handleAuthentication())
        .pipe(
          switchMap(() => {
            return forkJoin({
              user: this.oktaAuth.getUser(),
              idToken: this.oktaAuth.getIdToken(),
              accessToken: this.oktaAuth.getAccessToken(),
            }) as Observable<OktaToken>;
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
              protected oktaAuth: OktaAuthService,
              @Inject(NB_WINDOW) protected window: any) {
    super(http, route, window);
  }

  authenticate(data?: any): Observable<NbAuthResult> {
    return this.isRedirectResult()
      .pipe(
        switchMap((result: boolean) => {
          if (!result) {
            this.oktaAuth.login();
            return observableOf(new NbAuthResult(true));
          }
          return this.getAuthorizationResult();
        }),
      );
  }

  logout(): Observable<NbAuthResult> {
    return from(this.oktaAuth.logout()).pipe(
      mapTo(new NbAuthResult(true)),
    );
  }
}
