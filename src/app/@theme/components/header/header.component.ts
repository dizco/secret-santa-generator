import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NbMenuItem, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { concatMap, filter, map, takeUntil } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { LayoutService } from '../../../@core/utils';
import { NbAuthService } from '@nebular/auth';
import { PreferredTokenPayloadType } from '../../../@core/core.module';
import { NonDisruptiveAuthService } from '../../../@core/auth/non-disruptive-auth.service';

export declare abstract class UserMenuItem extends NbMenuItem {
  id: string;
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

  userMenuTag = 'usermenu';
  userMenu: UserMenuItem[] = [{ id: 'logout', title: 'Log out' }];

  public constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private authService: NbAuthService,
    private nonDisruptiveAuthService: NonDisruptiveAuthService,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.materialTheme$ = this.themeService.onThemeChange()
      .pipe(map(theme => {
        const themeName: string = theme?.name || '';
        return themeName.startsWith('material');
      }));
  }

  ngOnInit() {
    this.authService.onTokenChange().pipe(
      takeUntil(this.destroy$),
    ).subscribe(token => {
      if (token.isValid()) {
        this.user = (token.getPayload() as PreferredTokenPayloadType).user;
      } else {
        this.user = undefined;
      }
    });

    this.menuService.onItemClick().pipe(
      filter((bag) => bag.tag === this.userMenuTag),
      map((bag) => bag.item as UserMenuItem),
      concatMap((item) => {
        if (item.id === 'logout') {
          return this.nonDisruptiveAuthService.authenticate('/auth/logout');
        }
        return of(); // Unhandled
      }),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      // Since we open a new tab, our app freezes and stops detecting changes until a click on the page happens
      // To bypass this UX problem, we force a manual change detection
      this.changeDetector.detectChanges();
    });

    this.currentTheme = this.themeService.currentTheme;

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
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
