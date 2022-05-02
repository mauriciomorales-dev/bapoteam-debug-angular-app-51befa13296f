import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpParameterCodec } from '@angular/common/http';
import { Observable } from 'rxjs';
declare var window: any;
declare var $: any;

@Injectable()
export class ConnectionService {
    headers: any = false;
    trid: any = -1;
    constructor(
        private client: HttpClient,
    ) { 
        this.headers = new HttpHeaders()
            .set('Content-Type', 'application/json');

        const ua = window.navigator.userAgent;
        const msie = ua.indexOf("MSIE ");
        this.trid = ua.indexOf('Trident/');

    }


    get(url): Observable<any> {
    	if (this.trid > 0) {
    		return new Observable(observer => {
                this.IEFallback(url, {}, 'GET', false).then(data => {
                    observer.next(data);
                    observer.complete();
                }, error => {
                	Observable.throw(error);
                })
            });
    	} else {
        	return this.client.get(url);
        }
    }

    post(url, query, file?): Observable<any> {
    	console.log('start post', url, query);
        if (this.trid > 0) {
        	return new Observable(observer => {
                this.IEFallback(url, query, 'POST', false).then(data => {
                	console.log('post response', data);
                    observer.next(data);
                    observer.complete();
                }, error => {
                	console.log('error post', url, query, error);
                	Observable.throw(error);
                })
            });
        } else {
            let params = new HttpParams({ encoder: new WebHttpUrlEncodingCodec() });

	        params = this.parseParams(params, query, []);

	        return this.client.post(url, params, this.headers);
	    }
    }

    delete(url):Observable<any> {
    	if (this.trid > 0) {
    		return new Observable(observer => {
                this.IEFallback(url, {}, 'DELETE', false).then(data => {
                    observer.next(data);
                    observer.complete();
                }, error => {
                	Observable.throw(error);
                })
            });
    	} else {
        	return this.client.delete(url, this.headers);
        }
    }

    getPayload(url, query): Observable<any> {
    	if (this.trid > 0) {
    		return new Observable(observer => {
                this.IEFallback(url, query, 'GET', true).then(data => {
                    observer.next(data);
                    observer.complete();
                }, error => {
                	Observable.throw(error);
                })
            });
    	} else {
        	return this.client.get(url, this.headers);
        }
    }

    postPayload(url, query): Observable<any> {
    	console.log('start post', url, query);
    	if (this.trid > 0) {
    		return new Observable(observer => {
                this.IEFallback(url, query, 'POST', true).then(data => {
                	console.log('post response', data);
                    observer.next(data);
                    observer.complete();
                }, error => {
                	console.log('error post', url, query, error);
                	Observable.throw(error);
                })
            });
    	} else {
        	return this.client.post(url, query, this.headers);
        }
    }

    putPayload(url, query): Observable<any> {
    	if (this.trid > 0) {
    		return new Observable(observer => {
                this.IEFallback(url, query, 'PUT', true).then(data => {
                    observer.next(data);
                    observer.complete();
                }, error => {
                	Observable.throw(error);
                })
            });
    	} else {
        	return this.client.put(url, query, this.headers);
        }
    }

    public serialize(query: any, prefix: any): any {
        let str = [];
        for(let p in query) {
            if (query.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = query[p];
                str.push((v !== null && typeof v === "object") ?
                    this.serialize(v, k) :
                    k + "=" + encodeURIComponent(v));
            }
        }

        return str.join("&");
    }

    private parseParams(params, query, depth) {
        for(let q in query) {
            if (typeof query[q] === 'object') {
                let newDepth = [];
                for(let d = 0; d < depth.length; d++) {
                    newDepth.push(depth[d]);
                }
                newDepth.push(q);
                params = this.parseParams(params, query[q], newDepth);
            } else {
                let s = q;
                for(let d = 0; d < depth.length; d++) {
                    if (d > 0) {
                        s += '['+depth[d]+']';
                    } else {
                        s = depth[d];
                    }

                    if (d === depth.length - 1) {
                        s += '['+q+']';
                    }
                }

                params = params.append(s, query[q]);
            }
        }

        return params;
    }

    private parseQuery(formData: any, query: any, depth: any) {
        for(let q in query) {
            if (typeof query[q] === 'object') {
                depth.push(q);
                formData = this.parseQuery(formData, query[q], depth);
            } else {
                let s = q;
                for(let d = 0; d < depth.length; d++) {
                    if (d > 0) {
                        s += '['+depth[d]+']';
                    } else {
                        s = depth[d];
                    }

                    if (d === depth.length - 1) {
                        s += '['+q+']';
                    }
                }

                formData.append(s, query[q]);
            }
        }

        return formData;
    }

    private IEFallback(url, data, method, payload) {
        if (!data)
            data = {};

        if (!method)
            method = 'POST';

        if (url.indexOf('minibc') > -1) {
            data.storeID = window.storeID;
            data.token = window.token;
        } else if(url.indexOf('data.ribon.ca') > -1) {
            data.token = window.data_token;
        } else if(url.indexOf('mailer.ribon.ca') > -1) {
            data.token = window.mailer_token;
        }

        let object:any = {
            method: method,
            url: url,
            // async: false,
            data: data
        }
        
        if (payload) {
            object.dataType = 'json';
            object.contentType = "application/json";
            object.data = JSON.stringify(object.data);
        }

        let formData = new FormData();
        formData = this.parseQuery(formData, data, []);

        return $.ajax(object);
    }
}


/*
* WebHttpUrlEncodingCodec
* Fix for parameters not being correctly encoded
* See: https://github.com/angular/angular/issues/11058
*/
class WebHttpUrlEncodingCodec implements HttpParameterCodec {
 	encodeKey(k: string): string { return encodeURIComponent(k); }
 	encodeValue(v: string): string { return encodeURIComponent(v); }
 	decodeKey(k: string): string { return decodeURIComponent(k); }
 	decodeValue(v: string) { return decodeURIComponent(v); }
 }