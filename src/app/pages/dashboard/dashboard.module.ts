import { NgModule } from '@angular/core';
import {
  NbAlertModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbListModule,
  NbTooltipModule,
  NbUserModule,
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { DashboardComponent } from './dashboard.component';
import { FormsModule } from '@angular/forms';
import { OktaAuthModule } from '@okta/okta-angular';

@NgModule({
  imports: [
    NbCardModule,
    NbIconModule,
    NbListModule,
    NbUserModule,
    NbButtonModule,
    NbTooltipModule,
    NbInputModule,
    NbAlertModule,
    FormsModule,
    ThemeModule,
    OktaAuthModule,
  ],
  declarations: [
    DashboardComponent,
  ],
})
export class DashboardModule { }
