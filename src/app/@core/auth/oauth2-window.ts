import { NbAuthResult } from '@nebular/auth';

export interface OAuth2Callback {
  callback(authResult: NbAuthResult): void;
}

export interface OAuth2WindowOpener extends Window {
  oauth2: OAuth2Callback;
}

export interface OAuth2Window extends Window {
  opener: OAuth2WindowOpener;
}
