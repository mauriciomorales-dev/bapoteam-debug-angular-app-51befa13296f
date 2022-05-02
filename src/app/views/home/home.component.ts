import { Component, OnInit } from '@angular/core';
import { ConnectionService } from '@service/connection.service';
import { DynamicFormService } from '@common/forms/dynamic-form.service';
import { MatSnackBar } from '@angular/material';
declare var window: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	form: any = false;
	inputs: any[] = [
		{ field: 'name', validator: Validators.required },
		{ field: 'email', validator: Validators.compose([Validators.required, Validators.pattern(/^\w+([\.\-\+]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)]) },
		{ field: 'message', validator: Validators.required },
	]
	constructor(
		private connection: ConnectionService,
		private df: DynamicFormService,
		private snack: MatSnackBar,
	) { }

	ngOnInit() {
		this.form = this.df.createForm(this.inputs, {});
	}

	async sendMessage() {
		try {
			if (this.form.status === 'INVALID') throw new Error('Invalid form');
			
			// you can assume that this sending function is correct as it uses an API call to one of our services
			let body = {
				dictionary: {
					name: this.form.value.name,
					message: this.form.value.message,
					email: this.form.value.email,
				},
				to: {
					"robin@beapartof.com": "Robin"
				},
				tags: {
					store: window.store,
					action: 'interview-message'
				},
				webhook: 'interview'

			}

			// also insert the testers email
			body.to[this.form.value.email] = this.form.value.name;
			
			// uncomment this line if you want to send the email
			// let response = await this.connection.postPayload(`${window.ribon_mailer}/api/v1/mailer`, body).toPromise();
			
			// reset the form
			this.form.reset();

			// show a success message
			this.snack.open(`You have successfully sent your message`, "", { duration: 4000, panelClass: 'success'})
		}

		catch(e) {
			this.snack.open(e.message ? e.message : 'Error sending a message', "", { duration: 4000, panelClass: 'error' });
		}
	}

}
