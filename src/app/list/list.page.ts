import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MapPointService } from '../services/map-point.service';
import { Subscription, map } from 'rxjs';
import { Router } from '@angular/router'; 
import { FileService } from '../file.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  userId : string = '';
  placeId : string = '';
  mapPoint! : MapPointService;
  thumbnail : string[] = [];
  constructor(private route: ActivatedRoute, 
    private mapPointService: MapPointService,
    private router: Router,
    public fileService: FileService,
  ) { }

  ngOnInit() {

    this.route.queryParamMap
    .pipe(
      map(params => {
        
        return params;
      }),
    )
    
    .subscribe(params => {
      this.userId = this.fileService.userId;
      this.placeId = params.get('param2') ?? '';
      console.log('userId', this.userId);
      console.log('placeId', this.placeId);
      
      

      this.mapPointService.download$(this.userId, this.placeId)
      .subscribe({
        next: res => {
          console.log('download', res);
          this.thumbnail = [];
          for (var i = 0; i < res.length; i++) {
            this.thumbnail.push(res[i].thumbnailBytes);
          }
          console.log(this.thumbnail);
        }
      })
        
      
    });
  }

  goBack() {
    const param2 = this.placeId;
    const param1 = this.userId;
            
            
    this.router.navigate(['picture'], {queryParams : {param1:param1, param2:param2}});
  }

}
