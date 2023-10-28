import { Inject, Injectable } from '@angular/core';
import { Observable, of as observableOf, throwError } from 'rxjs';
import { map, switchMap, catchError, filter, tap } from 'rxjs/operators';
import {
  NbOAuth2AuthStrategy,
  NbOAuth2ResponseType,
  NbAuthOAuth2JWTToken,
  NbOAuth2AuthStrategyOptions,
  NbAuthStrategyClass,
  NbAuthResult,
  auth2StrategyOptions,
} from '@nebular/auth';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NB_WINDOW } from '@nebular/theme';
import { ActivatedRoute } from '@angular/router';
import { OidcSecurityService, OpenIdConfiguration, UserDataResult } from 'angular-auth-oidc-client';

export interface Auth0Claims {
  email: string;
  email_verified: boolean;
  family_name?: string;
  given_name?: string;
  locale?: string;
  name: string;
  nickname: string;
  picture: string;
  sub: string;
  updated_at: string;
}

export interface Auth0Token {
  user: Auth0Claims;
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
          switchMap((response) => {
            if (response.isAuthenticated) {
              return this.oidcService.userData$
                .pipe(
                  map((user: UserDataResult) => ({
                    user: user.userData,
                    idToken: response.idToken,
                    accessToken: response.accessToken,
                  } as Auth0Token)),
                );
            }
            return throwError('Authentication error');
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
              protected oidcService: OidcSecurityService,
              @Inject(NB_WINDOW) protected window: any) {
    super(http, route, window);
  }

  authenticate(data?: any): Observable<NbAuthResult> {
    return this.isRedirectResult()
      .pipe(
        switchMap((result: boolean) => {
          if (!result) {
            this.oidcService.authorize(null, {
              customParams: {
                // Audience is required if we want to receive JWT tokens.
                // If not sent, we receive opaque access tokens.
                // See https://auth0.com/docs/api/authentication#authorization-code-flow-with-pkce
                audience: 'kiosoft.mailserver',
                // prompt: 'login',
              },
            });
            return observableOf(new NbAuthResult(true));
          }
          return this.getAuthorizationResult();
        }),
      );
  }

  logout(): Observable<NbAuthResult> {
    // 1st logout from OidcSecurityService level
    // 2nd logout from Auth0
    // 3rd, on callback, logout from NbAuthService

    return this.isLogoutRedirect().pipe(
      switchMap((isRedirect) => this.performLogout()),
      map(() => new NbAuthResult(true)),
    );
  }

  private isLogoutRedirect(): Observable<boolean> {
    return this.oidcService.getConfiguration()
      .pipe(
        map((configuration => this.window.location.href === configuration.postLogoutRedirectUri)),
      );
  }

  private performLogout(): Observable<void> {
    // Auth0 does not expose end_session_endpoint in the discovery document (sadly they're not spec compliant), so we must do it manually.
    // First we will logout locally, then we will navigate to auth0 to finish the logout

    return this.oidcService.logoff()
      .pipe(
        switchMap(() => this.oidcService.getConfiguration()),

        // Leave this check for future proofing if every auth0 exposes end_session
        filter(configuration => !configuration.authWellknownEndpoints.endSessionEndpoint),
        // No end session was set, craft our own logout url
        tap((configuration: OpenIdConfiguration) => this.window.location.href = Auth0AuthStrategy.buildLogoutUrl(configuration)),
        map(() => undefined),
      );
  }

  /**
   * @see https://auth0.com/docs/api/authentication#logout
   */
  private static buildLogoutUrl(config: OpenIdConfiguration): string {
    let logoutUrl = Auth0AuthStrategy.ensureTrailingSlash(config.authority) + 'v2/logout';

    let params = new HttpParams();
    params = params.set('client_id', config.clientId);

    if (config.postLogoutRedirectUri) {
      params = params.append('returnTo', config.postLogoutRedirectUri);
    }

    logoutUrl += `?${params}`;

    return logoutUrl;
  }

  private static ensureTrailingSlash(str: string): string {
    return str.endsWith('/') ? str : str + '/';
  }
}
