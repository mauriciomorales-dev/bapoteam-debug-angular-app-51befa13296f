import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
declare var window: any;

@Injectable()
export class InterceptorService implements HttpInterceptor {
    intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (window.ribon_data && window.ribon_data != "" && req.url.indexOf(window.ribon_data) > -1) {
            let headers = req.headers;
                headers = headers.set('token', window.data_token);

            const dupReq =req.clone({
                // headers: headers
                setParams: {
                    token: window.data_token
                }
            });

            // console.log('dupReq', dupReq);

            return next.handle(dupReq);
        } else if (window.ribon_mailer && window.ribon_mailer != "" && req.url.indexOf(window.ribon_mailer) > -1) {
        	let headers = req.headers;
        		headers = headers.set('Authorization', 'Bearer ' + window.mailer_token);

        		const dupReq = req.clone({
        			headers: headers
        		});

        		return next.handle(dupReq);
        } else {
            return next.handle(req);
        }
  }
}