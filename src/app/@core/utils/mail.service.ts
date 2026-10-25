import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SecretSantaResultParameters {
  pickedName: string;
  pickedEmail: string;
  creatorName: string;
  creatorEmail: string;
}

// Server-owned templates and the parameters each one declares
export interface MailTemplates {
  'secret-santa-result': SecretSantaResultParameters;
}

export type MailTemplate = keyof MailTemplates;

export interface MailOptions<T extends MailTemplate> {
  to: string;
  parameters: MailTemplates[T];
}

export interface MailResponse {
  success: boolean;
  message?: string;
}

@Injectable()
export class MailService {
  constructor(private http: HttpClient) {}

  send<T extends MailTemplate>(template: T, options: MailOptions<T>[], captchaResponse: string): Observable<MailResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/vnd.kiosoft.emailsV2+json',
        'Accept': 'application/vnd.kiosoft.emailsV2+json',
      }),
    };

    const mailServerUrl = environment.mailServerUrl;
    return this.http.post<void>(`${mailServerUrl}/api/emails`, MailService.buildMailRequestBody(template, options, captchaResponse), httpOptions)
      .pipe(
        retry(1),
        catchError(MailService.handleError),
        map(() => {
          return {
            success: true,
          } as MailResponse;
        }),
      );
  }

  private static buildMailRequestBody<T extends MailTemplate>(template: T, options: MailOptions<T>[], captchaResponse: string): any {
    return {
      template,
      emails: options.map(o => ({
        to: o.to,
        parameters: o.parameters,
      })),
      'g-recaptcha-response': captchaResponse,
    };
  }

  private static handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Status code: ${error.status}, ` +
        `details: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something unexpected happened; please try again later.');
  }
}
