/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils';
import { NbLayoutDirectionService, NbSidebarService, NbThemeService } from '@nebular/theme';
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
              private directionService: NbLayoutDirectionService,
              private location: Location,
              private router: Router) {
  }

  ngOnInit(): void {
    this.trackPageViews();
    this.trackThemeChanges();
    this.trackDirectionToggles();
    this.trackSidebarToggles();
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  private trackPageViews(): void {
    this.router.events
      .pipe(
        takeWhile(() => this.alive),
        filter((event) => event instanceof NavigationEnd),
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
        takeWhile(() => this.alive),
        skip(1), // Skip initial theme setup
        map(({ name }) => name),
      )
      .subscribe(themeName => {
        this.analyticsService.trackEvent('changeTheme', {
          event_category: AnalyticsCategories.Customization,
          event_label: themeName,
        });
      });
  }

  private trackDirectionToggles(): void {
    this.directionService.onDirectionChange()
      .pipe(
        takeWhile(() => this.alive),
        skip(1), // Skip initial direction setup
      )
      .subscribe(direction => {
        this.analyticsService.trackEvent('directionToggle', {
          event_category: AnalyticsCategories.Customization,
          event_label: direction,
        });
      });
  }

  private trackSidebarToggles(): void {
    this.sidebarService.onToggle()
      .pipe(
        takeWhile(() => this.alive),
        map((value) => value.tag),
      )
      .subscribe(tag => {
        this.analyticsService.trackEvent('sidebarToggle', {
          event_category: AnalyticsCategories.Customization,
          event_label: tag,
        });
      });
  }
}
