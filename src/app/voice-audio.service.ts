import { Injectable } from '@angular/core';
import {HttpClient, HttpParamsOptions} from '@angular/common/http';
import {Observable, Observer, throwError,timer} from 'rxjs';
import { catchError, retry, map , mergeMap} from 'rxjs/operators';
import {from} from "rxjs";
import hmacSHA256 from 'crypto-js/hmac-sha256'
import Base64 from 'crypto-js/enc-base64';
import Hex from 'crypto-js/enc-hex'
import {A} from "@angular/cdk/keycodes";



@Injectable({
  providedIn: 'root'
})
export class VoiceAudioService {

  constructor(private http: HttpClient) {

  }
  private audioCtx = new (window.AudioContext)();
  private audioGain = this.audioCtx.createGain();

  public gain:number = 1;
  private setAudioQueue(audio:AudioScheduledSourceNode){
    audio.onended = function () {
      let nextAudio = audioQueue.shift()
      if(nextAudio){
        isPlaying = true
        nextAudio.start()
      }else {
        isPlaying = false
      }
    }
    if(isPlaying){
      audioQueue.push(audio)
    }else {
      isPlaying = true
      audio.start()
    }
  }
  public speakInitial(){
    if(!isPlaying) {
      isPlaying = true
      let audio = new Audio("assets/startNavigation.wav")
      audio.play()
      timer(2000).subscribe(value => {
        let nextAudio = audioQueue.shift()
        if(nextAudio){
          isPlaying = true
          nextAudio.start()
        }else {
          isPlaying = false
        }
      })
    }
  }
  public speakDirection(direction:number){
    let audio: HTMLAudioElement
    if(!isPlaying){
      isPlaying = true
      switch (direction){
        case 0:
        case 12:
          audio = new Audio("assets/D12.wav")
          break
        default:

          audio = new Audio("assets/D" + direction.toString() + ".wav")
      }
      audio.play()
      timer(3000).subscribe(value => {
        let nextAudio = audioQueue.shift()
        if(nextAudio){
          isPlaying = true
          nextAudio.start()
        }else {
          isPlaying = false
        }
      })



    }
  }
  public speakText(text:string){
    let requestBody = JSON.stringify({
      "text": text
    })
    const requestOptions : object = {
      headers:{
        "content-type":"application/json"
      },
      responseType:"text"
    }
    let voiceRequest:Observable<string> = this.http.post<string>("https://us-central1-aimaigeolocationproject.cloudfunctions.net/coefontMedium",requestBody,requestOptions)

    const getOptions:object={
      responseType:'blob'
    }
    let audioArrayRequest = voiceRequest.pipe(
      mergeMap((value, index) => {
        return  this.http.get<Blob>(value,getOptions)
      }),
      mergeMap(value => {
        return from(value.arrayBuffer())
      }),
      mergeMap((value, index) => {
        return from(this.audioCtx.decodeAudioData(value))
      })
    )


    audioArrayRequest.subscribe(value => {

        let source = new AudioBufferSourceNode(this.audioCtx)
        source.buffer = value
        this.audioGain.gain.value = this.gain
        source.connect(this.audioGain).connect(this.audioCtx.destination)
        this.setAudioQueue(source)
    })

  }
}
let isPlaying:boolean = false

let audioQueue:AudioScheduledSourceNode[] = []
