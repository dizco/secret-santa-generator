import { NgModule } from '@angular/core';
import {
  NbAlertModule,
  NbButtonModule,
  NbCardModule,
  NbDialogModule,
  NbIconModule,
  NbInputModule,
  NbListModule,
  NbTooltipModule,
  NbUserModule,
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { DashboardComponent } from './dashboard.component';
import { FormsModule } from '@angular/forms';
import { ConfirmPromptComponent } from './confirm-prompt.component';

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
    NbDialogModule.forChild(),
  ],
  entryComponents: [
    ConfirmPromptComponent,
  ],
  declarations: [
    DashboardComponent,
    ConfirmPromptComponent,
  ],
})
export class DashboardModule { }
