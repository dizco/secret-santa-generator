import { Component, OnDestroy, OnInit } from '@angular/core';
import { ArrayHelper } from '../../@core/helpers/array-helper';
import { BehaviorSubject, iif, Observable, of } from 'rxjs';
import { filter, map, mergeMap, switchMap, take, takeWhile, tap, toArray } from 'rxjs/operators';
import { AnalyticsService, DrawService, Participant } from '../../@core/utils';
import { AnalyticsCategories } from '../../@core/utils/analytics.service';
import { NbAuthService, NbAuthToken } from '@nebular/auth';
import { NbDialogService, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { ConfirmPromptComponent, ConfirmPromptResult } from './confirm-prompt.component';
import { NbDialogConfig } from '@nebular/theme/components/dialog/dialog-config';
import { Auth0Token } from '../../@core/auth/auth0-auth-strategy';

enum ResultsState {
  Hidden,
  Editing,
  Generated,
}

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private alive = true;
  private captchaResponse: string;

  private resultsViewEnabledSubject = new BehaviorSubject<boolean>(false);
  resultsViewEnabled: Observable<boolean> = this.resultsViewEnabledSubject.pipe(
    map(v => v),
    takeWhile(() => this.alive),
  );

  private isEditingSubject = new BehaviorSubject<boolean>(true);
  isEditing: Observable<boolean> = this.isEditingSubject.pipe(
    takeWhile(() => this.alive),
    map(v => v),
  );

  isSending: boolean = false;

  resultsState = ResultsState;

  participants: Participant[] = [
    {
      name: 'Nick',
      email: 'nick@example.com',
    },
    {
      name: 'Eva',
      email: 'eva@example.com',
    },
    {
      name: 'Jack',
      email: 'jack@example.com',
    },
    {
      name: 'Lee',
      email: 'lee@example.com',
    },
    {
      name: 'Alan',
      email: 'alan@example.com',
    },
    {
      name: 'Kate',
      email: 'kate@example.com',
    },
  ];

  constructor(private analyticsService: AnalyticsService, private drawService: DrawService,
              private dialogService: NbDialogService, private authService: NbAuthService,
              private toastrService: NbToastrService) {}

  async ngOnInit(): Promise<void> {
    this.isEditing.pipe(
      filter((value) => !value), // Only when isEditing becomes false
      takeWhile(() => this.alive),
    ).subscribe(() => {
      this.generate();
    });
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  enterEditMode(): void {
    this.clearPicks();
    this.isEditingSubject.next(true);

    this.analyticsService.trackEvent('enterEditMode', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });
  }

  save(): void {
    this.isEditingSubject.next(false);

    this.analyticsService.trackEvent('saveParticipants', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });
  }

  regenerate(): void {
    this.generate();

    this.analyticsService.trackEvent('regenerateDraw', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });
  }

  enableResultsView(): void {
    this.resultsViewEnabledSubject.next(true);
    this.analyticsService.trackEvent('enableResultsView', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });
  }

  disableResultsView(): void {
    this.resultsViewEnabledSubject.next(false);
    this.analyticsService.trackEvent('enableResultsView', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });
  }

  removeParticipant(participant: Participant): void {
    this.participants = this.participants.filter((p) => p !== participant);

    this.analyticsService.trackEvent('removeParticipant', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });
  }

  addParticipant(): void {
    this.participants.push(DashboardComponent.buildEmptyParticipant());

    this.analyticsService.trackEvent('addParticipant', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });
  }

  captchaResolved(captchaResponse: string): void {
    this.captchaResponse = captchaResponse;
  }

  sendResults(): void {
    this.analyticsService.trackEvent('sendResults', {
      event_category: AnalyticsCategories.SecretSantaGenerator,
    });

    this.authService.isAuthenticated().pipe(
      map((isAuthenticated) => {
        const config: Partial<NbDialogConfig<Partial<ConfirmPromptComponent> | string>> = {
          context: {
            drawParticipantsCount: this.participants.length,
            requireLogin: !isAuthenticated,
          },
        };
        return config;
      }),
      switchMap((config) => this.dialogService.open(ConfirmPromptComponent, config).onClose.pipe(
        map((result: ConfirmPromptResult) => result && result.confirmed),
      )),
      filter((proceed: boolean) => proceed),
      tap(() => this.isSending = true),
      switchMap(() => this.authService.getToken().pipe(
        map((token: NbAuthToken) => token.getPayload() as Auth0Token),
        map((token: Auth0Token) => ({ name: token.user.name, email: token.user.email } as Participant)),
      )),
      switchMap((creator: Participant) => this.drawService.sendResults(this.participants, creator, this.captchaResponse)),
      tap((response) => {
        const config: Partial<NbToastrConfig> = { duration: 15000 };
        if (response.success) {
          this.toastrService.success(`Messages successfully sent`, 'Success', config);
        } else {
          this.toastrService.danger(`Error sending messages: ${response.message}`, 'Error', config);
        }
      }),
      takeWhile(() => this.alive),
      toArray(),
      tap(() => this.isSending = false),
      tap(() => this.analyticsService.trackEvent('sentResults', {
        event_category: AnalyticsCategories.SecretSantaGenerator,
      })),
    ).subscribe();
  }

  hasEnoughParticipantsForDraw(): boolean {
    return this.participants.length > 1;
  }

  allParticipantsHaveAnEmail(): boolean {
    return this.participants.every((participant) => {
      return participant.email !== '';
    });
  }

  canEmailResults(): Observable<boolean> {
    if (this.isSending || !this.captchaResponse) {
      return of(false);
    }

    return this.isEditing.pipe(
      take(1),
      map((isEditing: boolean) => {
        return !isEditing
          && this.hasEnoughParticipantsForDraw()
          && this.allParticipantsHaveAnEmail();
      }),
    );
  }

  getResultsState(): Observable<ResultsState> {
    return this.resultsViewEnabled.pipe(
      mergeMap(enabled =>
        iif(() => enabled,
          this.isEditing.pipe(
            map(isEditing => isEditing ? ResultsState.Editing : ResultsState.Generated),
          ),
          of(ResultsState.Hidden),
        ),
      ),
    );
  }

  private generate(): void {
    this.clearPicks();

    this.filterInvalidParticipants();

    if (!this.hasEnoughParticipantsForDraw()) {
      this.analyticsService.trackEvent('invalidDraw', {
        event_category: AnalyticsCategories.SecretSantaGenerator,
        event_label: 'Not enough participants',
      });

      return;
    }

    const shuffled = ArrayHelper.completeShuffle(this.participants);
    for (let i = 0; i < this.participants.length; i++) {
      this.participants[i].picked = shuffled[i];
    }
  }

  private clearPicks(): void {
    this.participants.forEach((participant) => {
      participant.picked = null;
    });
  }

  private filterInvalidParticipants(): void {
    this.participants = this.participants.filter((participant) => {
      return participant.name !== '' || participant.email !== '';
    });
  }

  private static buildEmptyParticipant(): Participant {
    return {
      name: '',
      email: '',
    };
  }
}
