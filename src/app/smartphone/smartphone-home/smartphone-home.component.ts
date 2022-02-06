import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {NavigatorService} from "../../navigator.service";
import {coerceNumberProperty} from "@angular/cdk/coercion";
import {interval, Observable, Observer, of, Subject, take} from 'rxjs';
import { delay } from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {VoiceAudioService} from "../../voice-audio.service";
import {PlacesResult} from "../../places-response-interface";


@Component({
  selector: 'app-smartphone-home',
  templateUrl: './smartphone-home.component.html',
  styleUrls: ['./smartphone-home.component.scss']
})
export class SmartphoneHomeComponent implements OnInit,AfterViewInit {

  private canvasWidth:number = 0
  private canvasHeight:number= 0
  private canvasCircleRadius:number = 0
  private destinationWatcher : Observable<number>

  private date : Date = new Date()
  @ViewChild('homeCanvas', {static: true})public homeCanvas? : ElementRef<HTMLCanvasElement>;

  @ViewChild('homeContainer', {static: true})public homeContainer? : ElementRef<HTMLDivElement>;
  constructor(public navigatorService : NavigatorService, public dialog: MatDialog,private voiceAudioService:VoiceAudioService){
    const radarRefresh = interval(500).subscribe(this.intervalObserver)
    this.destinationWatcher = interval(1000)
    this.announcedTime = this.date.getTime()
  }
  public destinationName():string{
    return this.navigatorService.destinationName
  }
  public destinationRange():string{
    if(this.navigatorService.destination){
      let range = this.navigatorService.rangeCalc(this.navigatorService.destination,this.navigatorService.getLastLatAndLong())

      return String((Math.round(range)))+"  m"
    }
    return ""
  }
  ngOnInit(): void {

  }
  ngAfterViewInit() : void{

    if(this.homeCanvas && this.homeContainer){
      const context = this.homeCanvas.nativeElement.getContext("2d")!;
      const canvas = this.homeCanvas.nativeElement;
      const container = this.homeContainer.nativeElement;

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      this.canvasWidth = canvas.width
      this.canvasHeight = canvas.height
      context.beginPath()
      context.arc(canvas.width/2,canvas.height/2, canvas.width/3,0,2*Math.PI)
      this.canvasCircleRadius = canvas.width/3
      context.save()
      context.strokeStyle = "#8d8d8d";

      context.lineWidth = 10;
      context.stroke() ;

  }
  }
  displayDestination():void{
    let heading = this.navigatorService.getLastPos()?.heading
    if(this.homeCanvas && this.navigatorService.destination && this.navigatorService.getLastPos() && heading){
      heading = heading / 180 * Math.PI
      const context = this.homeCanvas.nativeElement.getContext("2d")!;
      ///let currentHeading = this.navigatorService.getLastPos()?.heading
      let destinationHeading = this.getDestinationHeading();


      let currentDestHeading:number = heading
      let headingDiff = destinationHeading - currentDestHeading
      let destX = this.canvasWidth/2+this.canvasCircleRadius * Math.sin(headingDiff)
      let destY = this.canvasHeight/2 - this.canvasCircleRadius * Math.cos(headingDiff)
      ///console.log(headingDiff*180/Math.PI)
      context.save()
      context.clearRect(0,0,this.canvasWidth,this.canvasHeight)
      context.beginPath()

      context.arc(this.canvasWidth/2,this.canvasHeight/2,this.canvasCircleRadius,0,2*Math.PI)
      context.strokeStyle = "#8d8d8d";
      context.lineWidth = 10;
      context.stroke() ;
      context.beginPath()
      context.translate(destX,destY)
      context.rotate(headingDiff)
      context.translate(0,+this.canvasWidth/12)
      context.moveTo(0, -this.canvasWidth/12)
      context.lineTo(+this.canvasWidth/16,+this.canvasWidth/12)
      context.lineTo(-this.canvasWidth/16,+this.canvasWidth/12)
      context.strokeStyle = primaryColor;
      context.fillStyle = primaryColor;
      context.lineWidth = 5
      context.fill()
      context.restore()
      return
    }

  }

  private getDestinationHeading() :number{
    let currentLatitude = this.navigatorService.getLastLatAndLong().lat
    let currentLongitude = this.navigatorService.getLastLatAndLong().lng
    let deltaLng = (this.navigatorService.destination?.lng ?? 0 )- currentLongitude

    let destinationHeading = Math.PI / 2 - Math.atan2((Math.cos(currentLatitude * Math.PI / 180) * Math.tan((this.navigatorService.destination?.lat ?? 0) * Math.PI / 180) - Math.sin(currentLatitude * Math.PI / 180) * Math.cos(deltaLng * Math.PI / 180))/**Math.PI/180*/, Math.sin(deltaLng * Math.PI / 180)/**Math.PI/180*/)
    return destinationHeading;
  }

  startNavigation():void{
    this.date = new Date()
    this.announcedTime = this.date.getTime()
    this.navigatorService.announcedTime = this.date.getTime()
    this.navigatorService.announcedTimeSecond = this.date.getTime()
    this.navigatorService.talkedDirectionNum = 0
    ///this.voiceAudioService.speakInitial()
    let speakString:string = ""

    this.navigatorService.getPlaces(this.navigatorService.getLastLatAndLong()).subscribe(value => {
      let text:string=""
      if(value){
        text = value
        this.voiceAudioService.speakText("目的地は"+text+"の方向です")
      }else if(this.navigatorService.destination) {
        this.navigatorService.getPlaces(this.navigatorService.destination).subscribe(value1 =>{
          text = value1
          if(!text){
            this.voiceAudioService.speakText("適切なランドマークがありませんでした")
          }else {
          this.voiceAudioService.speakText("目的地は"+text+"の方向です")
          }
        })

      }else {
        this.voiceAudioService.speakText("適切なランドマークがありませんでした")
      }

    })




    this.voiceAudioService.speakInitial()
    this.navigatorService.isNavigating = true

  }
  endNavigation():void{
    const dialogRef = this.dialog.open(EndNavigationDialog,{
      width:"80vw"

    })
    dialogRef.afterClosed().subscribe(result => {
      if(result === undefined){
        result = true
      }
      this.navigatorService.isNavigating = result

    })
  }
  error():void{

  }
  private announcedTime:number;
  private intervalObserver : Observer<number> = {

    next:(x => {
      this.date = new Date()
      this.displayDestination()


      ///console.log(this.date.getTime() - this.announcedTime)


      ///console.log((headingDiff)/Math.PI)
      if(this.navigatorService.isNavigating) {
        if ((this.date.getTime() - this.announcedTime) >1.8e5) {
          this.announcedTime = this.date.getTime()
          this.doAnnounce()
        }
        ///let targetDest = ((this.getDestinationHeading() - (this.navigatorService.getLastPos()?.heading ?? 0))*Math.PI/180)
        if (this.navigatorService.popInterestDirection()) {
          this.announcedTime = this.date.getTime()
          this.doAnnounce()
        }
      }
    }),
    error:(x=>{

    }),
    complete:(()=>{

    })

  }
  private doAnnounce() {

    let currentHeading = this.navigatorService.getLastPos()?.heading
    let destinationHeading = this.getDestinationHeading()
    if(currentHeading){
      currentHeading = currentHeading * Math.PI /180
      let headingDiff = destinationHeading - currentHeading
      headingDiff = headingDiff % Math.PI * 2
      if(headingDiff < 0){
        headingDiff += Math.PI * 2
      }
      this.voiceAudioService.speakText("目的地は"+ Math.round(headingDiff*180/Math.PI/30).toString() + "時の方向です")
    }
  }



}



@Component({
  selector: 'end-navigation-dialog',
  templateUrl: 'end-navigation-dialog.html'
})
export class EndNavigationDialog {
  constructor(public dialogRef: MatDialogRef<EndNavigationDialog>) {
  }
  onNoClick(){
    this.dialogRef.close(true)
  }
  onYesClick(){
    this.dialogRef.close(false)
  }
}
///const canvas = document.getElementById("canvas") as HTMLCanvasElement;
///const container = document.getElementById("container") as HTMLDivElement;
///const context = canvas.getContext("2d")!;
const primaryColor = "#673ab7"
const accentColor = "#ffd740"
const warningColor ="#f44336"
