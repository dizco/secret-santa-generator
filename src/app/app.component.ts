/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils';
import { NbSidebarService, NbThemeService } from '@nebular/theme';
import { filter, map, skip, takeWhile } from 'rxjs/operators';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { AnalyticsCategories } from './@core/utils/analytics.service';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit, OnDestroy {
  private alive = true;

  constructor(private analyticsService: AnalyticsService,
              private sidebarService: NbSidebarService,
              private themeService: NbThemeService,
              private location: Location,
              private router: Router) {
  }

  ngOnInit(): void {
    this.trackPageViews();
    this.trackThemeChanges();
    this.trackSidebarToggles();
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  private trackPageViews(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeWhile(() => this.alive),
      )
      .subscribe(() => {
        this.analyticsService.trackPageView({
          page_title: environment.appName,
          page_path: this.location.path(),
        });
      });
  }

  private trackThemeChanges(): void {
    this.themeService.onThemeChange()
      .pipe(
        skip(1), // Skip initial theme setup
        map(({ name }) => name),
        takeWhile(() => this.alive),
      )
      .subscribe(themeName => {
        this.analyticsService.trackEvent('changeTheme', {
          event_category: AnalyticsCategories.Customization,
          event_label: themeName,
        });
      });
  }

  private trackSidebarToggles(): void {
    this.sidebarService.onToggle()
      .pipe(
        map((value) => value.tag),
        takeWhile(() => this.alive),
      )
      .subscribe(tag => {
        this.analyticsService.trackEvent('sidebarToggle', {
          event_category: AnalyticsCategories.Customization,
          event_label: tag,
        });
      });
  }
}
