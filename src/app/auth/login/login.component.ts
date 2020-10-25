import { Component, OnInit } from '@angular/core';
import { NbLoginComponent } from '@nebular/auth';

@Component({
  template: '',
})
export class LoginComponent extends NbLoginComponent implements OnInit {
  ngOnInit(): void {
    this.login();
  }
}
