import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from "@angular/material/icon";

import { AppComponent } from './app.component';
import { SmartphoneComponent } from './smartphone/smartphone.component';
import { ComputerComponent } from './computer/computer.component';
import { SmartphoneUnderbarComponent } from './smartphone/smartphone-underbar/smartphone-underbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SmartphoneHomeComponent, EndNavigationDialog } from './smartphone/smartphone-home/smartphone-home.component';
import { SmartphoneMapComponent } from './smartphone/smartphone-map/smartphone-map.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {GoogleMapsModule} from "@angular/google-maps";
import {MatDialogModule} from "@angular/material/dialog";
import { HttpClientModule } from '@angular/common/http';
import {OverlayModule} from "@angular/cdk/overlay";
import {MatCardModule} from "@angular/material/card";
import {MatSnackBarModule} from "@angular/material/snack-bar";

@NgModule({
  declarations: [
    AppComponent,
    SmartphoneComponent,
    ComputerComponent,
    SmartphoneUnderbarComponent,
    SmartphoneHomeComponent,
    SmartphoneMapComponent,
    EndNavigationDialog


  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatTabsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        GoogleMapsModule,
        HttpClientModule,
        OverlayModule,
        MatCardModule,
        MatDialogModule,
        MatSnackBarModule


    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
