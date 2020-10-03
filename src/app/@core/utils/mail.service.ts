import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  body: string;
}

export interface MailResponse {
  success: true;
  sentAt: string;
}

interface Mail {
  sentAt: string;
}

@Injectable()
export class MailService {
  constructor(private http: HttpClient) {}

  send(options: MailOptions): Observable<MailResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      }),
    };

    return this.http.post<Mail>('https://mailserver.kiosoft.ca/send', MailService.buildMailRequestBody(options), httpOptions)
      .pipe(
        retry(1),
        catchError(MailService.handleError),
        map(mail => {
          return {
            success: true,
            sentAt: mail.sentAt,
          } as MailResponse;
        }),
      );
  }

  private static buildMailRequestBody(options: MailOptions): any {
    return {
      to: options.to,
      from: options.from,
      subject: options.subject,
      body: options.body,
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
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }
}
