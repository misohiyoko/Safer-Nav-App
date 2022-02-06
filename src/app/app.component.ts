import { Component } from '@angular/core';
import {environment} from "../environments/environment";
import {NavigatorService} from "./navigator.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'untitled';
  ua = navigator.userAgent
  mobileRegex = new RegExp('Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS')
  public isMobile : boolean = this.mobileRegex.test(this.ua)
  constructor() {
  }
  static isNaviError = false
  public isNavi():boolean{
    if(navigator.geolocation && !AppComponent.isNaviError){
      return true
    }else {
      return false
    }

  }
}
