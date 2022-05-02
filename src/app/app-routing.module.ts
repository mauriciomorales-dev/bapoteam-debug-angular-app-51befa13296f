import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/**
 * Put your componenets here that relate to your routes
 */
// eg
import { HomeComponent } from './views/home/home.component';


const routes: Routes = [
	// this is the main screen after the app has been installed
    { path: '', component: HomeComponent },

    // fallback to a specific route
    { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
