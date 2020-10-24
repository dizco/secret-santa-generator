import { Component, OnInit } from '@angular/core';
import { NbLoginComponent } from '@nebular/auth';

@Component({
  template: '',
})
export class LoginComponent extends NbLoginComponent implements OnInit {
  ngOnInit(): void {
    console.log('Force trigger login');
    // this.login();
  }
}
