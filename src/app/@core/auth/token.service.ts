import { Observable } from 'rxjs';
import { NbTokenService, NbTokenStorage, NbAuthToken } from '@nebular/auth';
import { Injectable } from '@angular/core';

@Injectable()
export class TokenService extends NbTokenService {
  constructor(tokenStorage: NbTokenStorage) {
    super(tokenStorage);
  }

  // Expose publicly
  publishStoredToken() {
    super.publishStoredToken();
  }
}
