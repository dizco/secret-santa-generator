import { APP_INITIALIZER, ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NB_AUTH_TOKEN_INTERCEPTOR_FILTER, NbAuthJWTInterceptor, NbAuthModule, NbOAuth2ResponseType, NbTokenService } from '@nebular/auth';
import { NbSecurityModule, NbRoleProvider } from '@nebular/security';
import { of as observableOf } from 'rxjs';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { AnalyticsService, DrawService, LayoutService, MailService } from './utils';
import { MockDataModule } from './mock/mock-data.module';
import { OKTA_CONFIG, OktaAuthModule } from '@okta/okta-angular';
import { OktaAuthStrategy, OktaToken } from './auth/okta-auth-strategy';
import { AuthWindowService } from './auth/auth-window.service';
import { NonDisruptiveAuthService } from './auth/non-disruptive-auth.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { Auth0AuthStrategy, Auth0JWTToken, Auth0Token } from './auth/auth0-auth-strategy';
import { LogLevel, OidcConfigService } from 'angular-auth-oidc-client';
import { AuthModule as OidcAuthModule } from 'angular-auth-oidc-client';
import { TokenService } from './auth/token.service';

const DATA_SERVICES = [
];

export class NbSimpleRoleProvider extends NbRoleProvider {
  getRole() {
    // here you could provide any role based on any auth flow
    return observableOf('guest');
  }
}

const config = {
  clientId: '0oaf2qfvypHy6GuvL5d5',
  issuer: 'https://dev-8656877.okta.com/oauth2/default',
  redirectUri: 'http://localhost:4200/auth/callback',
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
};

export function configureAuth(oidcConfigService: OidcConfigService) {
  return () =>
    oidcConfigService.withConfig({
      stsServer: 'https://kiosoft.us.auth0.com',
      redirectUrl: 'http://localhost:4200/auth/callback',
      postLogoutRedirectUri: 'http://localhost:4200/auth/logout/callback',
      clientId: 'HKTkPebbbQs9maBWyFTkPyq3AT8Ki0JM',
      scope: 'openid profile email',
      responseType: 'code',
      // silentRenew: true,
      // silentRenewUrl: `${window.location.origin}/silent-renew.html`,
      logLevel: LogLevel.Debug,
    });
}

export type PreferredTokenPayloadType = Auth0Token;

export const NB_CORE_PROVIDERS = [
  ...MockDataModule.forRoot().providers,
  ...DATA_SERVICES,

  OktaAuthModule,
  {
    provide: OKTA_CONFIG, useValue: config,
  },
  OidcConfigService,
  {
    provide: APP_INITIALIZER,
    useFactory: configureAuth,
    deps: [OidcConfigService],
    multi: true,
  },
  ...NbAuthModule.forRoot({
    strategies: [
      OktaAuthStrategy.setup({ // Uses Okta's Auth service under the hood
        name: 'okta',
        clientId: '',
        authorize: {
          responseType: NbOAuth2ResponseType.CODE,
        },
        token: {
          class: OktaToken,
        },
      }),
      Auth0AuthStrategy.setup({ // Uses Okta's Auth service under the hood
        name: 'auth0',
        clientId: '',
        authorize: {
          responseType: NbOAuth2ResponseType.CODE,
        },
        token: {
          class: Auth0JWTToken,
        },
      }),
    ],
    forms: {
      login: {
        strategy: 'auth0',
      },
      logout: {
        strategy: 'auth0',
      },
    },
  }).providers,
  TokenService,
  { provide: NbTokenService, useExisting: TokenService }, // override
  OktaAuthStrategy,
  Auth0AuthStrategy,
  AuthWindowService,
  NonDisruptiveAuthService,
  { provide: HTTP_INTERCEPTORS, useClass: NbAuthJWTInterceptor, multi: true },
  { provide: NB_AUTH_TOKEN_INTERCEPTOR_FILTER, useValue: (req) => false }, // Let everything through

  NbSecurityModule.forRoot({
    accessControl: {
      guest: {
        view: '*',
      },
      user: {
        parent: 'guest',
        create: '*',
        edit: '*',
        remove: '*',
      },
    },
  }).providers,
  {
    provide: NbRoleProvider, useClass: NbSimpleRoleProvider,
  },
  { provide: RECAPTCHA_SETTINGS, useValue: { siteKey: '6LcTbdsZAAAAAC6Xw6cK9KJCTsPo9lCS2N__U9t_' } as RecaptchaSettings },
  AnalyticsService,
  LayoutService,
  MailService,
  DrawService,
];

@NgModule({
  imports: [
    CommonModule,
    OktaAuthModule,
    OidcAuthModule.forRoot(),
  ],
  exports: [
    NbAuthModule,
  ],
  declarations: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }

  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        ...NB_CORE_PROVIDERS,
      ],
    };
  }
}
