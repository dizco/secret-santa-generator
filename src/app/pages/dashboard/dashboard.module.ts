import { NgModule } from '@angular/core';
import {
  NbAlertModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbListModule,
  NbTooltipModule,
  NbUserModule
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { DashboardComponent } from './dashboard.component';
import { FormsModule } from '@angular/forms';

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
  ],
  declarations: [
    DashboardComponent,
  ],
})
export class DashboardModule { }
