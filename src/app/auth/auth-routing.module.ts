import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { NbAuthComponent, NbLogoutComponent } from '@nebular/auth';
import { LoginComponent } from './login/login.component';
import { CallbackComponent } from './callback/callback.component';

const routes: Routes = [
  {
    path: '',
    component: NbAuthComponent,
    children: [
      {
        path: '',
        component: LoginComponent,
        pathMatch: 'full',
      },
      {
        path: 'callback',
        component: CallbackComponent,
      },
      {
        path: 'logout',
        component: NbLogoutComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {
}