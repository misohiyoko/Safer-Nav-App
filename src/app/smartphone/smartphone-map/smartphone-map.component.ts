import {Component, ElementRef, OnInit, ViewChild, AfterViewChecked} from '@angular/core';
import {viewClassName} from "@angular/compiler";
import {NavigatorService} from "../../navigator.service";
import {interval, Observable, of, take} from 'rxjs';
import { delay } from 'rxjs/operators';
import {taggedTemplate} from "@angular/compiler/src/output/output_ast";
import {GoogleMap, MapMarker} from "@angular/google-maps";
import {MatSpinner} from "@angular/material/progress-spinner";
import {Overlay} from "@angular/cdk/overlay";
import {ComponentPortal} from "@angular/cdk/portal";
import {AddressComponent, Result} from "../../geocoding-response-interface";
import {MatSnackBar} from '@angular/material/snack-bar';
@Component({
  selector: 'app-smartphone-map',
  templateUrl: './smartphone-map.component.html',
  styleUrls: ['./smartphone-map.component.scss']
})
export class SmartphoneMapComponent implements OnInit {

  @ViewChild(GoogleMap, {static: false}) public map? : GoogleMap;

  destinations :Result[];

  value : string = "";

  zoom = 16
  center : google.maps.LatLngLiteral   = {
    lat: 35.697695,
    lng: 139.707354
  }
  options: google.maps.MapOptions = {
    disableDefaultUI: true
  };
  currentPositionMarkerOption: google.maps.MarkerOptions = {
    icon: {
      path : google.maps.SymbolPath.CIRCLE,
      fillColor: primaryColor,
      fillOpacity: 0.8,
      scale: 8,
      strokeColor : primaryColor,
      strokeWeight: 0.4

    }
  };
  destinationPositionMarkerOption:google.maps.MarkerOptions = {
    icon:{
      path : google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      fillColor: accentColor,
      fillOpacity: 0.8,
      scale: 8,
      strokeColor : accentColor,
      strokeWeight: 0.4
    }
  }
  setDestinationPositionMarkerOption:google.maps.MarkerOptions = {
    icon:{
      path : google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      fillColor: warningColor,
      fillOpacity: 0.8,
      scale: 8,
      strokeColor : warningColor,
      strokeWeight: 0.4
    }
  }

  mapHeight :number = 0;
  mapWidth : number = 0;
  constructor(public navigatorService : NavigatorService,private overlay:Overlay,private snackBar: MatSnackBar) {
    this.destinations = [];
  }
  overlayRef = this.overlay.create({
    hasBackdrop:true,
    positionStrategy : this.overlay.position().global().centerHorizontally()
  })
  hasCurrentPosition() : boolean{
   return  (this.navigatorService.positionBuffer.length > 0)
  }

  initMap(): void{


  }

  isDestination(position:google.maps.LatLngLiteral) {
    if (this.navigatorService.destination) {
      return position.lat == this.navigatorService.destination.lat && position.lng == this.navigatorService.destination.lng
    }
    return false
  }
  onClickInput(): void{
    this.overlayRef.attach(new ComponentPortal(MatSpinner))
    this.navigatorService.getGeocoding(this.value).subscribe(data => {
      ///console.log(data)
      ///console.log(data.length)
      if(data.length >0){
        this.destinations = data;

        if(this.map){
          let panLatLng:google.maps.LatLngLiteral[] = this.destinations.map(x=>x.geometry.location).slice()
          panLatLng.push(this.navigatorService.getLastLatAndLong())

          let bounds = new google.maps.LatLngBounds()
          panLatLng.map(m=>bounds.extend(m))
          this.map.fitBounds(bounds)
          this.map.zoom = this.map.zoom -0.5
          ///this.setZoom( this.getFarLatLngZoomLevel(panLatLng))

          //this.map.panTo(this.getAverageLatLng(panLatLng))

      }}
      this.overlayRef.detach()
    })

  }
  setZoom(e:any):void{
    //console.log(typeof e)
    //console.log(this)
    ///this.zoom = e

  }

  onClickMarker(event:google.maps.MapMouseEvent,name:AddressComponent[]|undefined){
    ///console.log(event.latLng?.lat())
    ///console.log(event.latLng?.lng())
    let lat = event.latLng?.lat()
    let lng = event.latLng?.lng()
    if(lat&&lng){
      if(this.navigatorService.isNavigating){
        this.snackBar.open("ナビゲーション中です", "閉じる",{duration : 2000})
        return
      }

      this.navigatorService.destination = {
        lat:lat,
        lng:lng
      }


      if(name){
        let nameString = ""
        name.map(a=>nameString += a.long_name)
        this.navigatorService.destinationName = nameString

      }
    }
  }

  ngOnInit(): void {

    const delay_test = interval(3000).pipe(take(10));
    ///delay_test.subscribe(s => {console.log(this.navigatorService.getLastLatAndLong()),console.log(this.navigatorService.positionBuffer.length), console.log(s)})
  }


}

const primaryColor = "#673ab7"
const accentColor = "#ffd740"
const warningColor ="#f44336"
