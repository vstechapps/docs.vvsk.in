import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './components/header/header';
import { Home } from './components/home/home';
import { Viewer } from './components/viewer/viewer';

@NgModule({
  declarations: [
    App,
    Header,
    Home,
    Viewer
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    PdfViewerModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
