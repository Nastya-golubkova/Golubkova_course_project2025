import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { JwtInterceptor } from './services/jwt.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(withInterceptors(
      [JwtInterceptor]
    )),    
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
