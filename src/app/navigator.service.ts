import {Injectable, ViewChild} from '@angular/core';
import {from, interval, Observable, Subject, throwError} from "rxjs";
import { HttpClient } from '@angular/common/http'
import { catchError, retry } from 'rxjs/operators';
import keys from '../keys.json'
import {GeocodingResponseInterface, Result} from "./geocoding-response-interface";
import {GoogleMap} from "@angular/google-maps";
import {placesResponse, PlacesResult} from "./places-response-interface";
import {AppComponent} from "./app.component";

let Key  = keys.googlemapAPIKet
@Injectable({
  providedIn: 'root'
})
export class NavigatorService {
  public isNavigating = false;
  public isLoading = true;
  public destination:google.maps.LatLngLiteral|null
  public destinationName:string
  private date : Date = new Date()
  public talkedDirectionNum:number = 0
  public get positionBuffer() : position[] {
    return positionBuffer
  }

  constructor(private http:HttpClient) {
    this.destination=null
    this.destinationName=""
    this.announcedTime = this.date.getTime()
    this.announcedTimeSecond = this.date.getTime()

      navigator.geolocation.getCurrentPosition(this.success.bind(this), this.error)
    let geoInterval = interval(1000).subscribe(x => navigator.geolocation.getCurrentPosition(this.success.bind(this), this.error))


  }

  geocodeData: Subject<Result[]> = new Subject<Result[]>();

  getGeocoding(data:string):Subject<Result[]>{
    let url = 'https://maps.googleapis.com/maps/api/geocode/json?'
    let searchQuery = new URLSearchParams();

    searchQuery.append('address', data)
    searchQuery.append('key', Key)
    ///console.log(searchQuery.toString())
    url = url + searchQuery.toString()
    ///console.log(url)
    let request = this.http.get<GeocodingResponseInterface>(url)
    this.geocodeData = new Subject<Result[]>()

    let dataObserver = {
      next: (data:GeocodingResponseInterface) => {
        this.geocodeData.next(data.results.map(x =>  x))

      },
      error: (err:Error) =>(err: Error) => console.error('Observer got an error: ' + err),
      complete : () => {
        this.isLoading = false
        ///console.log(this.geocodeData)

      }
    }
    this.isLoading = true
    request.subscribe(dataObserver)
    return this.geocodeData;
  }
  placesData = new Subject<string>();
  getPlaces(point:google.maps.LatLngLiteral):Subject<string>{

    let requestBody = JSON.stringify({
      "lat":point.lat.toString(),
      "lng":point.lng.toString()
    })
    const requestOptions : object = {
      headers:{
        "content-type":"application/json"
      },
    }
    this.placesData = new Subject<string>()
    let request = this.http.post<placesResponse>("https://us-central1-aimaigeolocationproject.cloudfunctions.net/placesAPIMedium",requestBody,requestOptions)
    request.subscribe(value => {
      let bestValue = value.results.filter(value1 => value1.name).filter(value=>this.containType(value) > 1).sort((a,b)=>{
        let pointA = this.containType(a)
        let pointB = this.containType(b)
        if(pointA > pointB){
          return -1
        }else if(pointA < pointB){
          return 1
        }else {

          if( Math.abs(this.getHeading(a.geometry.location)-this.getHeading(this.destination ?? {lat:0,lng:0})) > Math.abs(this.getHeading(b.geometry.location)-this.getHeading(this.destination ?? {lat:0,lng:0}))){
            return 1
          }else {
            return -1
          }
        }

        return 0
      })
      let nameStrings:string = ""
      bestValue.slice(0,5).forEach(value=>nameStrings = nameStrings + "、"+ value.name)
      this.placesData.next(nameStrings)
    })
    return this.placesData
  }
  private containType(value:PlacesResult):number{

    let types = value.types
    let dest = this.destination
    if(!dest){return 0}
    let result:number = 0

      if(types.includes("locality")||types.includes("sublocality")){
        result = 0
      }
      else if(Math.abs(this.getHeading(value.geometry.location)-this.getHeading(dest)) < Math.PI/12){
        result = 12
      }
      else if(Math.abs(this.getHeading(value.geometry.location)-this.getHeading(dest)) > Math.PI/6){
        result = 0
      }
      else if(types.includes("school")||types.includes("park")||types.includes("hospital")||types.includes("stadium")||types.includes("train_station")){
        result = 10
      }
      else if(types.includes("store")||types.includes("gas_station")){
        result = 9
      }else {
        result = 5
      }
    console.log((this.getHeading(value.geometry.location)-this.getHeading(dest)).toString()+value.name)
    console.log(result)
      return result
  }
  private getHeading(data:google.maps.LatLngLiteral) :number{
    let currentLatitude = data.lat
    let currentLongitude = data.lng
    let deltaLng = (this.destination?.lng ?? 0 )- currentLongitude

    let destinationHeading = Math.PI / 2 - Math.atan2((Math.cos(currentLatitude * Math.PI / 180) * Math.tan((this.destination?.lat ?? 0) * Math.PI / 180) - Math.sin(currentLatitude * Math.PI / 180) * Math.cos(deltaLng * Math.PI / 180))/**Math.PI/180*/, Math.sin(deltaLng * Math.PI / 180)/**Math.PI/180*/)
    return destinationHeading;
  }

  public announcedTime:number;
  public announcedTimeSecond : number;
  private sensorHeadingBuffer:number[] = []
  success(pos : GeolocationPosition) {
    AppComponent.isNaviError = false
    let crd = pos.coords;
    this.date = new Date()


    //console.log({latitude : crd.latitude, longtitude : crd.longitude,heading : crd.heading, timeStamp : pos.timestamp, accuracy : crd.accuracy, speed : crd.speed})
//Hedingは本来crd.headingTestように0
    ///let headingNumber: number|null = null
    let instantHeadingNumber: number|null = null
    if(crd.speed && crd.speed > 0.25 ){
      ///headingNumber = this.headingCalc(crd.latitude,crd.longitude)
      if(crd.heading){
        this.sensorHeadingBuffer.push(crd.heading)
        if(this.sensorHeadingBuffer.length > 5){
          let buf = this.sensorHeadingBuffer.slice(-5)
          this.sensorHeadingBuffer.shift()
          if((Math.max(...buf) - Math.min(...buf)) < 30){
            instantHeadingNumber = crd.heading
            instantHeadingNumber = instantHeadingNumber % 360
            if(instantHeadingNumber < 0){
              instantHeadingNumber += 360
            }
          }
        }
      }


    }
    /*if(Math.abs((headingNumber ?? 0) -( instantHeadingNumber ?? 0)) > 120){
      headingNumber = null

    }*/
    positionBuffer.push({latitude : crd.latitude, longtitude : crd.longitude,heading :instantHeadingNumber, timeStamp : pos.timestamp, accuracy : crd.accuracy, speed : crd.speed})
    if(positionBuffer.length > 10000){
      positionBuffer.shift()
    }
    let heading = this.getLastPos()?.heading
    if(this.destination && heading && this.isNavigating){
      heading = heading  * Math.PI /180
      let currentLatitude = this.getLastLatAndLong().lat
      let currentLongitude = this.getLastLatAndLong().lng
      let deltaLng = (this.destination?.lng ?? 0 )- currentLongitude
      let destinationHeading = Math.PI / 2 - Math.atan2((Math.cos(currentLatitude * Math.PI / 180) * Math.tan((this.destination?.lat ?? 0) * Math.PI / 180) - Math.sin(currentLatitude * Math.PI / 180) * Math.cos(deltaLng * Math.PI / 180))/**Math.PI/180*/, Math.sin(deltaLng * Math.PI / 180)/**Math.PI/180*/)
      destinationHeading = destinationHeading - heading

      ///console.log(destinationHeading.toString()+"destinationheading")
      ///console.log(preDestinationHeading.toString()+"predestinationheading")
      console.log(this.talkedDirectionNum)
      let announceCooldown = 3.0e4
      let additionCooldown = 1.0e4
      if((Math.abs(Math.sin(destinationHeading)) > 0.90)){
        if(((this.date.getTime() - this.announcedTime) >announceCooldown + this.talkedDirectionNum)){
          this.announcedTime = this.date.getTime()
          interestDirection = positionBuffer[positionBuffer.length -1]
          if(this.talkedDirectionNum < additionCooldown*3){
            this.talkedDirectionNum += additionCooldown
          }
        }

      }else if((destinationHeading>2.87979 && destinationHeading<3.05433)){
        if( ((this.date.getTime() - this.announcedTimeSecond) >announceCooldown + this.talkedDirectionNum)){
          this.announcedTimeSecond = this.date.getTime()
          interestDirection = positionBuffer[positionBuffer.length -1]
          if(this.talkedDirectionNum < additionCooldown*3){
            this.talkedDirectionNum += additionCooldown
          }
        }

      }else if(Math.cos(destinationHeading) < -0.5){
        if( ((this.date.getTime() - this.announcedTimeSecond) >announceCooldown + this.talkedDirectionNum)){
          this.announcedTimeSecond = this.date.getTime()
          interestDirection = positionBuffer[positionBuffer.length -1]
          if(this.talkedDirectionNum < additionCooldown*3){
            this.talkedDirectionNum += additionCooldown
          }
      }
      else {
        this.talkedDirectionNum = 0
        interestDirection = null
      }
    }

  }}
  /*
  headingCalc(lat:number,lng:number){
    let firstLatSum:number = 0
    let firstLngSum:number = 0

    let firstCrdsNum:number = 0

    let rangeSum:number = 0
    const range = 10
    const skipRange = 10
    let copiedPosArray = positionBuffer.concat()
    let prePos = {latitude:lat,longtitude:lng}
    /*while(rangeSum < skipRange){
      let pos = copiedPosArray.pop()
      if(pos){
        rangeSum += this.rangeCalc({lat:pos.latitude,lng:pos.longtitude},{lat:prePos.latitude,lng:prePos.longtitude})
      }else {
        return null
      }
      prePos = pos
    }
    if(this.rangeCalc({lat:prePos.latitude,lng:prePos.longtitude},{lat:lat,lng:lng}) < skipRange / 3){
      return null
    }*/
    //prePos = {latitude:lat,longtitude:lng}*/
    /*
    rangeSum = 0
    while(this.rangeCalc({lat:prePos.latitude,lng:prePos.longtitude},{lat:lat,lng:lng}) < range){

      let pos = copiedPosArray.pop()
      if(pos){
        firstCrdsNum++;
        firstLatSum += pos.latitude * this.rangeCalc({lat:pos.latitude,lng:pos.longtitude},{lat:prePos.latitude,lng:prePos.longtitude})
        firstLngSum += pos.longtitude * this.rangeCalc({lat:pos.latitude,lng:pos.longtitude},{lat:prePos.latitude,lng:prePos.longtitude})
        rangeSum += this.rangeCalc({lat:pos.latitude,lng:pos.longtitude},{lat:prePos.latitude,lng:prePos.longtitude})
      }else {
        return null
      }
      prePos = pos
    }
    if(this.rangeCalc({lat:prePos.latitude,lng:prePos.longtitude},{lat:lat,lng:lng}) < range / 4){
      return null
    }
    /*let y1 = (firstLatSum/rangeSum) * Math.PI /180;
    let x1 = (firstLngSum/rangeSum) * Math.PI /180;*/
    ///ここをたんにnm先のノードのみを参照するようにする
  /*
    let y1 = prePos.latitude
    let x1 = prePos.longtitude
    if(this.rangeCalc({lat:y1 * 180 / Math.PI,lng:x1 * 180 / Math.PI},{lat:lat,lng:lng}) < range / 6){
      return null
    }
    let y2 = lat * Math.PI /180;
    let x2 = lng * Math.PI /180;
    let deltax = x2 - x1;

    let heading = Math.PI/2 - Math.atan2(Math.cos(y1) * Math.tan(y2) - Math.sin(y1) * Math.cos(deltax) ,Math.sin(deltax))
    heading = heading % Math.PI * 2
    if(heading < 0){
      heading += Math.PI * 2
    }
    if(Number.isNaN(heading * 180 / Math.PI)){
      return  null
    }
    return  heading * 180 / Math.PI


  }
  */
  rangeCalc(v1:google.maps.LatLngLiteral,v2:google.maps.LatLngLiteral){
    let r = 6378.137*1000
    let x1 = v1.lng * Math.PI / 180
    let y1 = v1.lat * Math.PI / 180
    let x2 = v2.lng * Math.PI / 180
    let y2 = v2.lat * Math.PI / 180
    return r*Math.acos(Math.sin(y1)*Math.sin(y2)+Math.cos(y1)*Math.cos(y2)*Math.cos(x2-x1))
  }

  error(error : GeolocationPositionError){
    if(error.code == GeolocationPositionError.PERMISSION_DENIED || error.code == GeolocationPositionError.POSITION_UNAVAILABLE){
      AppComponent.isNaviError = true
    }
  }
  getLastLatAndLong() : google.maps.LatLngLiteral{

    if( positionBuffer && positionBuffer.length > 0){
      var LL : google.maps.LatLngLiteral = {
        lat : positionBuffer[positionBuffer.length -1].latitude,
        lng : positionBuffer[positionBuffer.length -1].longtitude
      };
      return LL;


    }else {
      return {
        lat:35.697695,
        lng:139.707354
      }
    }


  }
  getPreLastLatAndLong(): google.maps.LatLngLiteral{
    if( positionBuffer && positionBuffer.length > 1){
      var LL : google.maps.LatLngLiteral = {
        lat : positionBuffer[positionBuffer.length -2].latitude,
        lng : positionBuffer[positionBuffer.length -2].longtitude
      };
      return LL;


    }else {
      return {
        lat:0,
        lng:0
      }
    }
  }
  getLastPos():position|null{
    if(positionBuffer && positionBuffer.length > 0){
      return positionBuffer[positionBuffer.length -1]
    }
    return null
  }
  popInterestDirection(){
    let dir = interestDirection
    interestDirection = null
    return dir
  }
}
type position = {latitude : number, longtitude : number,heading : number|null, timeStamp : number, accuracy: number, speed : number | null}

var positionBuffer : position[] = [];
var interestDirection : position|null=null;


