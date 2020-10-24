import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbAuthModule, NbDummyAuthStrategy, NbOAuth2AuthStrategy, NbOAuth2ResponseType } from '@nebular/auth';
import { NbSecurityModule, NbRoleProvider } from '@nebular/security';
import { of as observableOf } from 'rxjs';

import { throwIfAlreadyLoaded } from './module-import-guard';
import { AnalyticsService, DrawService, MailService } from './utils';
import { MockDataModule } from './mock/mock-data.module';
import { Auth0AuthStrategy, Auth0Token } from './auth/auth0-auth-strategy';
import { OKTA_CONFIG, OktaAuthModule } from '@okta/okta-angular';

const socialLinks = [
  {
    url: 'https://github.com/akveo/nebular',
    target: '_blank',
    icon: 'github',
  },
  {
    url: 'https://www.facebook.com/akveo/',
    target: '_blank',
    icon: 'facebook',
  },
  {
    url: 'https://twitter.com/akveo_inc',
    target: '_blank',
    icon: 'twitter',
  },
];

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
  ...NbAuthModule.forRoot({
    strategies: [
      Auth0AuthStrategy.setup({
        name: 'okta',
        baseEndpoint: 'https://dev-8656877.okta.com/oauth2/default/',
        clientId: '0oaf2qfvypHy6GuvL5d5',
        authorize: {
          responseType: NbOAuth2ResponseType.CODE,
          scope: 'openid profile email',
          redirectUri: 'http://localhost:4200/auth/callback',
        },
        token: {
          class: Auth0Token,
        },
      }),
    ],
    forms: {
      login: {
        socialLinks: socialLinks,
        redirectDelay: 0,
        strategy: 'okta',
      },
      register: {
        socialLinks: socialLinks,
      },
    },
  }).providers,
  Auth0AuthStrategy,
  OktaAuthModule,
  { provide: OKTA_CONFIG, useValue: config },

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
  AnalyticsService,
  MailService,
  DrawService,
];

@NgModule({
  imports: [
    CommonModule,
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
