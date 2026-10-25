import { Inject, Injectable } from '@angular/core';
import { NB_WINDOW } from '@nebular/theme';
import { environment } from '../../../environments/environment';

export const enum AnalyticsCategories {
  Customization = 'customization',
  SecretSantaGenerator = 'secretsantagenerator',
}

export interface GtagEvent {
  event_category?: string;
  event_label?: string;
  value?: any;
  [key: string]: any;
}

export interface GtagPageview {
  page_title?: string;
  page_path?: string;
  page_location?: string;
  [key: string]: any;
}

@Injectable()
export class AnalyticsService {
  private readonly enabled: boolean = false;

  constructor(@Inject(NB_WINDOW) private window) {
    this.enabled = environment.analytics.enabled;

    // See https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out
    this.window[`ga-disable-${environment.analytics.trackingId}`] = !this.enabled;

    this.setAppName();
  }

  private setAppName(): void {
    this.gtag('config', environment.analytics.trackingId, {
      app_name: environment.appName,
    });
  }

  private isGoogleTagManagerAvailable(): boolean {
    return !!this.window.google_tag_manager;
  }

  // The gtag function is defined by the snippet in index.html
  private gtag(...args: any[]): void {
    try {
      this.window.gtag(...args);
    } catch (err) {
      console.error('Google Analytics error', err);
    }
  }

  trackPageView(params?: GtagPageview): void {
    if (this.enabled) {
      this.gtag('config', environment.analytics.trackingId, {
        page_path: this.window.location.pathname,
        page_title: 'Angular App',
        page_location: this.window.location.href,
        ...params,
      });
    }
  }

  trackEvent(name: string, params?: GtagEvent): void {
    if (this.enabled) {
      this.gtag('event', name, params ?? {});
    }
  }
}
