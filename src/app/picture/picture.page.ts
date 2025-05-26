import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MapPointService } from '../services/map-point.service';
import { Subscription, map } from 'rxjs';
import { Router } from '@angular/router';
import { FileService } from '../file.service';

@Component({
  selector: 'app-picture',
  templateUrl: './picture.page.html',
  styleUrls: ['./picture.page.scss'],
})
export class PicturePage implements OnInit {

  userId! : string;
  placeId! : string;
  mapPoint! : MapPointService;
  thumbnail : string = '';
  name = "-";
  desc = "nothing";
  constructor(private route: ActivatedRoute, 
    private mapPointService: MapPointService,
    private router: Router,
    public fileService: FileService,
  ) { }

  ngOnInit() {
    this.route.queryParamMap
    /*
    .pipe(
      map(params => {
        
        return params;
      }),
    )
    */
    .subscribe(params => {
      this.userId = this.fileService.userId;
      this.placeId = params.get('param2') ?? '';
      console.log('Picture.userId', this.userId);
      console.log('Picture.placeId', this.placeId);
      
      

      this.mapPointService.getPlaceInfo$(this.userId, this.placeId)
      .subscribe({
        next: res => {
          this.name = res.name;
          this.desc = res.description;
          console.log('desc', this.desc)
          //this.userId = 'ArSKqFfjuBap6Ohq9Jo1U';



          this.mapPointService.download$(this.userId, this.placeId)
          .subscribe({
            next: res => {
              console.log('download', res);
              console.log('userId 2', this.userId);
              if (res?.length > 0) {
                this.thumbnail = 'data:image/jpg;base64,' + res[0].thumbnailBytes;
                //console.log('thumbnail', this.thumbnail); 
              } else {
                console.log('res[] null or empty')
              }
              
            }
          })
        }
      })

      
    });


  }

  goBack() {
    
    this.router.navigate(['tab2']);
  }

  goForward() {
    const param2 = this.placeId;
    const param1 = this.userId;
            
            
    this.router.navigate(['list'], {queryParams : {param1:param1, param2:param2}});
  }
 
}
