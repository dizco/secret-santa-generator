import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { RippleService } from '../../../@core/utils/ripple.service';
import { LayoutService } from '../../../@core/utils';
import { NbAuthService } from '@nebular/auth';
import { PreferredTokenPayloadType } from '../../../@core/core.module';

class UserData {
}

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  public readonly materialTheme$: Observable<boolean>;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
    {
      value: 'material-light',
      name: 'Material Light',
    },
    {
      value: 'material-dark',
      name: 'Material Dark',
    },
  ];

  currentTheme = 'default';

  userMenu = [ { title: 'Log out', link: '/auth/logout' } ]; // TODO: logout needs to happen on non-disruptive window

  public constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private rippleService: RippleService,
    private authService: NbAuthService,
  ) {
    this.materialTheme$ = this.themeService.onThemeChange()
      .pipe(map(theme => {
        const themeName: string = theme?.name || '';
        return themeName.startsWith('material');
      }));
  }

  ngOnInit() {
    this.authService.getToken().pipe(
      take(1),
      filter((token) => token.isValid()),
    ).subscribe(token => {
      this.user = (token.getPayload() as PreferredTokenPayloadType).user;
    });

    this.authService.onTokenChange().pipe(
      takeUntil(this.destroy$),
    ).subscribe(token => {
      if (token.isValid()) {
        this.user = (token.getPayload() as PreferredTokenPayloadType).user;
      } else {
        this.user = undefined;
      }
    });

    this.currentTheme = this.themeService.currentTheme;

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => {
        this.currentTheme = themeName;
        this.rippleService.toggle(themeName?.startsWith('material'));
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  isAuthenticated(): boolean {
    return !!this.user;
  }
}
