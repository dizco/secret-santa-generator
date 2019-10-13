import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
      Created with ♥ by <b><a href="https://www.kiosoft.ca" target="_blank">Kiosoft</a></b>
      (<b><a href="https://github.com/dizco" target="_blank">Gabriel Bourgault</a></b>) 2019
    </span>
    <div class="socials">
      <a href="https://github.com/dizco/secret-santa-generator" target="_blank" class="ion ion-social-github"></a>
    </div>
  `,
})
export class FooterComponent {
}
