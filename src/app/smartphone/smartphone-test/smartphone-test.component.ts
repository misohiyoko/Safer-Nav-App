import { Component, OnInit } from '@angular/core';
import {NavigatorService} from "../../navigator.service";
import {interval} from "rxjs";

@Component({
  selector: 'app-smartphone-test',
  templateUrl: './smartphone-test.component.html',
  styleUrls: ['./smartphone-test.component.css']
})
export class SmartphoneTestComponent implements OnInit {

  constructor(public navigatorService : NavigatorService) {
    let a = interval(100).subscribe(x => {
      let pos = this.navigatorService.getLastPos()
      if(pos){
        this.lat = pos.latitude
        this.lng = pos.longtitude

        this.headLong = pos.heading ?? -1
        this.speed = pos.speed ?? -1
        let destinationHeading = this.getDestinationHeading();
        if(pos.heading){
          let heading = pos.heading / 180 * Math.PI
          let currentDestHeading:number = heading
          let headingDiff = destinationHeading - currentDestHeading
          this.destHeadLong = headingDiff
        }


      }


    })
  }
  lat:number = -1
  lng:number = -1
  head:number = -1
  headLong:number = -1
  speed:number = -1
  destHead:number = -1
  destHeadLong:number = -1
  ngOnInit(): void {
  }
  private getDestinationHeading() :number{
    let currentLatitude = this.navigatorService.getLastLatAndLong().lat
    let currentLongitude = this.navigatorService.getLastLatAndLong().lng
    let deltaLng = (this.navigatorService.destination?.lng ?? 0 )- currentLongitude

    let destinationHeading = Math.PI / 2 - Math.atan2((Math.cos(currentLatitude * Math.PI / 180) * Math.tan((this.navigatorService.destination?.lat ?? 0) * Math.PI / 180) - Math.sin(currentLatitude * Math.PI / 180) * Math.cos(deltaLng * Math.PI / 180))/**Math.PI/180*/, Math.sin(deltaLng * Math.PI / 180)/**Math.PI/180*/)
    return destinationHeading;
  }
}
