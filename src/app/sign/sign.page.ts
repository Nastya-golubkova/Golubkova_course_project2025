import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { filter, Subscription, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoadingController, Platform } from '@ionic/angular';
import { MapPointService } from '../services/map-point.service';


@Component({
  selector: 'app-sign',
  templateUrl: './sign.page.html',
  styleUrls: ['./sign.page.scss'],
})
export class SignPage implements OnInit {
  ltError = '';
  ltPhError = '';
  ltEmError = '';
  tokenEmail = '';
  version = '';
  step = 1;
  resendSec = 0;
  resendTimer: any;
  fakeSmsCode = '';
  environment = environment;
  
  form = new FormGroup({
    //'email': new FormControl('', [Validators.required, Validators.email, Validators.maxLength(200)]),
    'email': new FormControl('', [Validators.required, Validators.maxLength(128)]),
    'password': new FormControl('', [Validators.required]),
    'name': new FormControl('', [Validators.required]),
  });
  private subscriptions: Subscription[] = [];
  private bbSub: Subscription|undefined;

  constructor(
    private platform: Platform,
    private router: Router,
    private loadingController: LoadingController,    
    private mapPoint: MapPointService,
  ) {
  }


  ngOnInit() {
  }

  add() {
    console.log('email', this.form.get('email')?.value);
    console.log('pass', this.form.get('password')?.value);
    this.mapPoint.sign$(this.form.get('name')?.value, this.form.get('email')?.value, this.form.get('password')?.value)
    .subscribe({
      next: res => {
        window.alert("Вы зарегистрированы");
        this.router.navigate(['login']);
        
      }
    })

    
  }

  back() {
    this.router.navigate(['login']);
  }

}
