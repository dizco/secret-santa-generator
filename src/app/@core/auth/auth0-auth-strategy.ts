import { Inject, Injectable } from '@angular/core';
import { Observable, of, of as observableOf, throwError } from 'rxjs';
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
import { HttpClient, HttpParams } from '@angular/common/http';
import { NB_WINDOW } from '@nebular/theme';
import { ActivatedRoute } from '@angular/router';
import { OidcSecurityService, PublicConfiguration } from 'angular-auth-oidc-client';

export interface Auth0Claims {
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  locale: string;
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
          tap((r) => console.log('In strategy, received authorize callback', r)),
          switchMap((isAuthenticated) => {
            if (isAuthenticated) {
              return this.oidcService.userData$;
            }
            return throwError('Authentication error');
          }),
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
            this.oidcService.authorize({
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
      switchMap((isRedirect) => {
        console.log('is redirect', isRedirect);
        if (!isRedirect) {
          this.performLogout();
        }
        return of(new NbAuthResult(true));
      }),
    );
  }

  private isLogoutRedirect(): Observable<boolean> {
    return of(this.window.location.href === this.oidcService.configuration.configuration.postLogoutRedirectUri);
  }

  private performLogout(): void {
    // Auth0 does not expose end_session_endpoint in the discovery document (sadly they're not spec compliant), so we must do it manually.
    // First we will logoff locally, then we will navigate to auth0 to finish the logout

    this.oidcService.logoff();

    // Leave this check for future proofing if every auth0 exposes end_session
    if (!this.oidcService.configuration.wellknown.endSessionEndpoint) {
      // No end session was set, craft our own logout url
      this.window.location.href = Auth0AuthStrategy.buildLogoutUrl(this.oidcService.configuration);
    }
  }

  /**
   * @see https://auth0.com/docs/api/authentication#logout
   */
  private static buildLogoutUrl(config: PublicConfiguration): string {
    let logoutUrl = Auth0AuthStrategy.ensureTrailingSlash(config.configuration.stsServer) + 'v2/logout';

    let params = new HttpParams();
    params = params.set('client_id', config.configuration.clientId);

    if (config.configuration.postLogoutRedirectUri) {
      params = params.append('returnTo', config.configuration.postLogoutRedirectUri);
    }

    logoutUrl += `?${params}`;

    return logoutUrl;
  }

  private static ensureTrailingSlash(str: string): string {
    return str.endsWith('/') ? str : str + '/';
  }
}
