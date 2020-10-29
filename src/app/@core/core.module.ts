import { APP_INITIALIZER, ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NB_AUTH_TOKEN_INTERCEPTOR_FILTER, NbAuthJWTInterceptor, NbAuthModule, NbOAuth2ResponseType } from '@nebular/auth';
import { NbSecurityModule, NbRoleProvider } from '@nebular/security';
import { of, of as observableOf } from 'rxjs';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { AnalyticsService, DrawService, MailService } from './utils';
import { MockDataModule } from './mock/mock-data.module';
import { OKTA_CONFIG, OktaAuthModule } from '@okta/okta-angular';
import { OktaAuthStrategy, OktaToken } from './auth/okta-auth-strategy';
import { AuthWindowService } from './auth/auth-window.service';
import { NonDisruptiveAuthService } from './auth/non-disruptive-auth.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { Auth0AuthStrategy, Auth0Token } from './auth/auth0-auth-strategy';
import { AuthClientConfig, AuthModule } from '@auth0/auth0-angular';
import { AuthModule as Auth0Module } from '@auth0/auth0-angular/lib/auth.module';
import { AuthModule as OidcAuthModule, ConfigResult, OidcConfigService, OidcSecurityService, OpenIdConfiguration } from 'angular-auth-oidc-client';
import { Auth0AuthStrategy2, Auth0Token2 } from './auth/auth0-auth-strategy2';

const DATA_SERVICES = [
];

export class NbSimpleRoleProvider extends NbRoleProvider {
  getRole() {
    // here you could provide any role based on any auth flow
    return observableOf('guest');
  }
}

const oktaConfig = {
  clientId: '0oaf2qfvypHy6GuvL5d5',
  issuer: 'https://dev-8656877.okta.com/oauth2/default',
  // clientId: 'ep5L66yITa00GusNRe06xptZdz1y6fiz',
  // issuer: 'https://kiosoft.us.auth0.com',
  redirectUri: 'http://localhost:4200/auth/callback',
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
};

function auth0Factory(authClientConfig: AuthClientConfig): () => Promise<void> {
  return () => {
    authClientConfig.set({
      domain: 'kiosoft.us.auth0.com',
      clientId: 'ep5L66yITa00GusNRe06xptZdz1y6fiz',
    });
    console.log('Called Auth0 factory');
    console.log('Auth config:' + JSON.stringify(authClientConfig.get()));

    return of<void>().toPromise();
  };
}

export function configureAuth(oidcConfigService: OidcConfigService) {
  const oidcConfiguration = 'assets/auth.clientConfiguration.json';
  return () => oidcConfigService.load(oidcConfiguration);

  /*
  {
      stsServer: 'https://kiosoft.us.auth0.com',
      redirectUrl: 'http://localhost:4200/auth/callback',
      postLogoutRedirectUri: window.location.origin,
      clientId: 'ep5L66yITa00GusNRe06xptZdz1y6fiz',
      scope: 'openid profile email',
      responseType: 'code',
      // silentRenew: true,
      // silentRenewUrl: `${window.location.origin}/silent-renew.html`,
      logLevel: LogLevel.Debug,
  }
   */
}

export const NB_CORE_PROVIDERS = [
  ...MockDataModule.forRoot().providers,
  ...DATA_SERVICES,

  /*OktaAuthModule,
  {
    provide: OKTA_CONFIG, useValue: oktaConfig,
  },*/
  // AuthModule,
  /* ...AuthModule.forRoot({
    domain: 'kiosoft.us.auth0.com',
    clientId: 'ep5L66yITa00GusNRe06xptZdz1y6fiz',
  }).providers,*/
  // AuthModule,
  // AuthModule,
  // { provide: APP_INITIALIZER, useFactory: auth0Factory, deps: [AuthClientConfig], multi: true },

  OidcConfigService,
  { provide: APP_INITIALIZER, useFactory: configureAuth, deps: [OidcConfigService], multi: true },
  ...OidcAuthModule.forRoot().providers,

  ...NbAuthModule.forRoot({
    strategies: [
      /*OktaAuthStrategy.setup({ // Uses Okta's Auth service under the hood
        name: 'okta',
        clientId: '',
        authorize: {
          responseType: NbOAuth2ResponseType.CODE,
        },
        token: {
          class: OktaToken,
        },
      }),*/
      /*Auth0AuthStrategy.setup({ // Uses Auth0's Auth service under the hood
        name: 'auth0',
        clientId: '',
        authorize: {
          responseType: NbOAuth2ResponseType.CODE,
        },
        token: {
          class: Auth0Token,
        },
      }),*/
      Auth0AuthStrategy2.setup({ // Uses Auth0's Auth service under the hood
        name: 'auth02',
        clientId: '',
        authorize: {
          responseType: NbOAuth2ResponseType.CODE,
        },
        token: {
          class: Auth0Token2,
        },
      }),
      /*NbOAuth2AuthStrategy.setup({ // Uses Auth0's Auth service under the hood
        name: 'auth0',
        clientId: 'ep5L66yITa00GusNRe06xptZdz1y6fiz',
        authorize: {
          endpoint: 'https://kiosoft.us.auth0.com/authorize',
          responseType: NbOAuth2ResponseType.CODE,
          scope: 'openid profile email',
          redirectUri: 'http://localhost:4200/auth/callback',
        },
      }),*/
    ],
    forms: {
      login: {
        strategy: 'auth02',
      },
      logout: {
        strategy: 'auth02',
      },
    },
  }).providers,
  // OktaAuthStrategy,
  // Auth0AuthStrategy,
  Auth0AuthStrategy2,
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
  MailService,
  DrawService,
];

@NgModule({
  imports: [
    CommonModule,
    // OktaAuthModule,
    // AuthModule.forRoot(),
  ],
  exports: [
    NbAuthModule,
  ],
  declarations: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule,
              private oidcSecurityService: OidcSecurityService,
              private oidcConfigService: OidcConfigService) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');

    this.oidcConfigService.onConfigurationLoaded.subscribe((configResult: ConfigResult) => {

      // Use the configResult to set the configurations

      const config: OpenIdConfiguration = {
        stsServer: configResult.customConfig.stsServer,
        redirect_url: 'http://localhost:4200/auth/callback',
        client_id: 'ep5L66yITa00GusNRe06xptZdz1y6fiz',
        scope: 'openid profile email',
        response_type: 'code',
        // silent_renew: true,
        // silent_renew_url: 'https://localhost:4200/silent-renew.html',
        log_console_debug_active: true,
        disable_iat_offset_validation: true,
        trigger_authorization_result_event: true,
      };

      this.oidcSecurityService.setupModule(config, configResult.authWellknownEndpoints);
    });
  }

  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: CoreModule,
      providers: [
        ...NB_CORE_PROVIDERS,
      ],
    };
  }
}
