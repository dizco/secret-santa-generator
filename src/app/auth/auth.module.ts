import { NgModule } from '@angular/core';
import { ThemeModule } from '../@theme/theme.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { NbAuthModule } from '@nebular/auth';
import { CallbackComponent } from './callback/callback.component';
import { NbLayoutModule } from '@nebular/theme';

@NgModule({
  imports: [
    AuthRoutingModule,
    NbAuthModule,
    ThemeModule,
    NbLayoutModule,
  ],
  declarations: [
    LoginComponent,
    CallbackComponent,
  ],
})
export class AuthModule {
}
