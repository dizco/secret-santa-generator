import { Inject, Injectable } from '@angular/core';
import { NB_WINDOW } from '@nebular/theme';
import { Gtag, GtagEvent, GtagPageview } from 'angular-gtag';
import { environment } from '../../../environments/environment';

export const enum AnalyticsCategories {
  Customization = 'customization',
  SecretSantaGenerator = 'secretsantagenerator',
}

// tslint:disable
declare var gtag: any;
declare var google_tag_manager: any;
// tslint:enable

@Injectable()
export class AnalyticsService {
  private readonly enabled: boolean = false;

  constructor(@Inject(NB_WINDOW) private window,
              private gtagService: Gtag) {
    this.enabled = environment.analytics.enabled;

    // See https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out
    this.window[`ga-disable-${environment.analytics.trackingId}`] = !this.enabled;

    this.setAppName();
  }

  private setAppName(): void {
    // TODO: Bug in angular-gtag library, can't use the config function because it completely overwrites the parameters... params={}
    /*this.gtagService.config({
      app_name: environment.appName,
    });*/

    this.window.gtag('config', environment.analytics.trackingId, {
      app_name: environment.appName,
    });
  }

  // tslint:disable-next-line
  private isGoogleTagManagerAvailable(): boolean {
    return !!this.window.google_tag_manager;
  }

  trackPageView(params?: GtagPageview): void {
    if (this.enabled) {
      this.gtagService.pageview(params);
    }
  }

  trackEvent(name: string, params?: GtagEvent): void {
    if (this.enabled) {
      this.gtagService.event(name, params);
    }
  }
}
