/// <reference path="../../typings/index.d.ts" />

import {NgModule} from '@angular/core'
import {RouterModule} from "@angular/router";
import {rootRouterConfig} from "./app.routes";
import {AppComponent} from "./app";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {HttpModule} from "@angular/http";
import {Dividend} from "./Dividend/dividend";
import {Web3} from "./services/Web3";

@NgModule({
  declarations: [AppComponent,Dividend],
  imports     : [BrowserModule, FormsModule, HttpModule, RouterModule.forRoot(rootRouterConfig)],
  bootstrap   : [AppComponent],
  providers: [Web3],
})
export class AppModule {

}
