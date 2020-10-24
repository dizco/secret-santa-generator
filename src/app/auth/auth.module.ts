import { NgModule } from '@angular/core';
import { ThemeModule } from '../@theme/theme.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { NbAuthModule } from '@nebular/auth';
import { CallbackComponent } from './callback/callback.component';
import { NbLayoutModule } from '@nebular/theme';
import { OktaAuthModule } from '@okta/okta-angular';

@NgModule({
  imports: [
    AuthRoutingModule,
    NbAuthModule,
    ThemeModule,
    NbLayoutModule,
    OktaAuthModule,
  ],
  declarations: [
    LoginComponent,
    CallbackComponent,
  ],
})
export class AuthModule {
}
