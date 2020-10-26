import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NB_AUTH_TOKEN_INTERCEPTOR_FILTER, NbAuthJWTInterceptor, NbAuthModule, NbOAuth2ResponseType } from '@nebular/auth';
import { NbSecurityModule, NbRoleProvider } from '@nebular/security';
import { of as observableOf } from 'rxjs';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { AnalyticsService, DrawService, MailService } from './utils';
import { MockDataModule } from './mock/mock-data.module';
import { OKTA_CONFIG, OktaAuthModule } from '@okta/okta-angular';
import { OktaAuthStrategy, OktaToken } from './auth/okta-auth-strategy';
import { AuthWindowService } from './auth/auth-window.service';
import { NonDisruptiveAuthService } from './auth/non-disruptive-auth.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RECAPTCHA_SETTINGS, RecaptchaModule, RecaptchaSettings } from 'ng-recaptcha';

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

export const NB_CORE_PROVIDERS = [
  ...MockDataModule.forRoot().providers,
  ...DATA_SERVICES,

  OktaAuthModule,
  {
    provide: OKTA_CONFIG, useValue: config,
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
    ],
    forms: {
      login: {
        strategy: 'okta',
      },
      logout: {
        strategy: 'okta',
      },
    },
  }).providers,
  OktaAuthStrategy,
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
    OktaAuthModule,
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

  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: CoreModule,
      providers: [
        ...NB_CORE_PROVIDERS,
      ],
    };
  }
}
