import { Component } from '@angular/core';
import { ConnectionService } from './services/connection.service';
import { ActivatedRoute } from '@angular/router';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
	valid: boolean = false;
	timer: number = 3600;
	constructor(
		private connection: ConnectionService,
		private ar: ActivatedRoute,
	) {
		this.checkPayload();
	}

	refreshTokens() {
		// let's get the correct tokens
		this.connection.get(`${window.ribon}/api/store/${window.store}/services/tokens`).subscribe(tokens => {
			let exp = 3600;
			let now = Math.round(new Date().getTime()/1000)
			for(let i = 0; i < tokens.length; i++) {
				let token = tokens[i];

				window['ribon_' + token.name] = token.url;
				window[token.name + '_token'] = token.token;

				let next = Math.round(new Date(token.expires).getTime()/1000);

				if ((next - now) < exp) {
					exp = next - now;
				}
			}

			setTimeout(() => {
				this.refreshTokens();
			}, exp * 1000);

			this.valid = true;
		});
	}

	checkPayload() {
		this.ar.queryParams.subscribe(params => {
			console.log('params', params);
			if (params.signed_payload) {
				// we have to decode this to get the store hash
				try {
					let split = params.signed_payload.split('.');
					let data = JSON.parse(atob(split[0]));
					console.log('data', data);
					window.store = data.store_hash;
					this.refreshTokens();
				}

				catch(e) {
					console.log('e',e);
					this.refreshTokens();
				}
			} else {
				if (window.ribon && window.store) {
					this.refreshTokens();
				} else {
					this.valid = true;
				}
			}
		});
	}
}
