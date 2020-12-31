import { NgModule } from '@angular/core';
import { ThemeModule } from '../@theme/theme.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { NbAuthModule } from '@nebular/auth';
import { LoginCallbackComponent } from './login/login-callback.component';
import { NbAlertModule, NbLayoutModule } from '@nebular/theme';
import { LogoutCallbackComponent } from './logout/logout-callback.component';

@NgModule({
  imports: [
    AuthRoutingModule,
    NbAuthModule,
    ThemeModule,
    NbLayoutModule,
    NbAlertModule,
  ],
  declarations: [
    LoginComponent,
    LoginCallbackComponent,
    LogoutCallbackComponent,
  ],
})
export class AuthModule {
}
