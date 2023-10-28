import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  message: {
    header: string;
    body: string;
  };
}

export interface MailResponse {
  success: boolean;
  message?: string;
  mailTo: string;
}

interface Mail {
  to: string;
}

@Injectable()
export class MailService {
  constructor(private http: HttpClient) {}

  send(options: MailOptions, captchaResponse: string): Observable<MailResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/vnd.kiosoft.mailV1+json',
        'Accept': 'application/vnd.kiosoft.mailV1+json',
      }),
    };

    const mailServerUrl = environment.mailServerUrl;
    return this.http.post<Mail>(`${mailServerUrl}/api/mail`, MailService.buildMailRequestBody(options, captchaResponse), httpOptions)
      .pipe(
        retry(1),
        catchError(MailService.handleError),
        map(mail => {
          return {
            success: true,
            mailTo: mail.to,
          } as MailResponse;
        }),
      );
  }

  private static buildMailRequestBody(options: MailOptions, captchaResponse: string): any {
    return {
      to: options.to,
      from: {
        name: options.from,
      },
      subject: options.subject,
      message: {
        header: options.message.header,
        body: options.message.body,
      },
      captcha: captchaResponse,
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
