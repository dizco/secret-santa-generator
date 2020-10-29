import { NgModule } from '@angular/core';
import { ThemeModule } from '../@theme/theme.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { NbAuthModule } from '@nebular/auth';
import { CallbackComponent } from './callback/callback.component';
import { NbAlertModule, NbLayoutModule } from '@nebular/theme';
import { AuthModule as OidcAuthModule } from 'angular-auth-oidc-client';

@NgModule({
  imports: [
    AuthRoutingModule,
    NbAuthModule,
    ThemeModule,
    NbLayoutModule,
    NbAlertModule,
    // OktaAuthModule,
    // Auth0Module,
    // Auth0Module,
    // OidcAuthModule,
  ],
  declarations: [
    LoginComponent,
    CallbackComponent,
  ],
})
export class AuthModule {
}
