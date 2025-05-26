import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, map, switchMap } from 'rxjs';
import * as Leaflet from 'leaflet';
import { Router } from '@angular/router'; 
import "leaflet-control-geocoder";
//import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import {FileService} from "../file.service"
import { MapPointService } from '../services/map-point.service';
import { IMapPoint, IRoutes, Marker, ICoord, alertInput, IPhoto } from '../model/map-point.interface';
import { nanoid } from 'nanoid';
import { AlertController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { AlertInput } from '@ionic/core';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenu,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { IonAlert, IonInput } from '@ionic/angular';
import { IRoute } from 'express';
import { here } from 'leaflet-control-geocoder/dist/geocoders';



Leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png'
});

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  //imports: [IonButtons, IonContent, IonHeader, IonMenu, IonMenuButton, IonTitle, IonToolbar],

})

export class Tab2Page implements OnInit, OnDestroy {
  mapPoints : IMapPoint[] = [];
  routes : IRoutes[] = [];
  markers: Marker[] = [];
  markers_for_route : Marker[]= [];
  public alertInputs : AlertInput[]  = [];
  UserName = "";
  public constructor(
    private ngZone: NgZone,
    private router: Router, 
    private route: ActivatedRoute, 
    private fileService: FileService,
    private mapPointService: MapPointService,
    private alertController: AlertController,
  ) {}
  
  

  subs: Subscription[] = [];
  id = 1;
  userId = 'id-1';
  lat = 55.88395406280399;
  lng = 37.54366391491999;
  count = 0;
  map!: Leaflet.Map;
  private longPressTimer: any;
  geoMarker! : Leaflet.CircleMarker; 
  index = 0;
  flag : boolean = false;
  isSelectingMarkers: boolean = false;
  showRoute : boolean = false;
  route_name : string = "";
  add_photo_flag : boolean = false;
  
  options = {
    layers: [
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })
    ],
    zoom: 8,
    center: { lat: this.lat, lng: this.lng }
  }

  


  ngOnInit() {
    this.route.queryParamMap
    .pipe(
      map(params => {
        
        return params;
      }),
    )
    .subscribe(params => {
      console.log('fileServiceId', this.fileService.userId);
      this.userId = params.get('param') ?? 'xxx';
      this.fileService.userId = params.get('param') ?? 'xxx';
      this.UserName = params.get('name') ?? 'xxx';
      console.log('userId', this.userId);
      this.mapPointService.gets$(this.userId)
      .subscribe({
        next: res => {
          console.log('mapPointService.gets', res);
          this.mapPoints = res;

          this.initMarkers0();

        }
      });

      this.mapPointService.getRoutes$(this.userId)
      .subscribe({
        next: res => {
          console.log('mapPointService.getRoutes', res);
          this.routes = res;
          for (var i = 0; i < this.routes.length; i++) {
            var tmp : AlertInput = {
              label : this.routes[i].nameRoute,
              type : 'radio',
              value: this.routes[i].nameRoute,
            };
      
            this.alertInputs.push(tmp);
            console.log('alertInputs', tmp);
          }
          console.log('alertInput', this.alertInputs);
        }
      });
    })
    
    
    
  }


  ngOnDestroy(): void {}

  initMarkers0() {
    
    let tm = 500;
    const arr: any[] = [];
      
    setTimeout(() => {
      for (var i = 0; i < this.mapPoints.length; i++) {
        var data = this.mapPoints[i];
        var LatLng = new Leaflet.LatLng(data.lat, data.lng);
        const initialMarkers = 
          {
            position: { lat: data.lat, lng: data.lng },
            draggable: false,
            name: data.name
          }
        ;
        var circle = this.generateMarker(initialMarkers, i, data.name);
        console.log(i);
        circle.addTo(this.map);
        arr.push(circle);
        console.log('placeId ',data);
        this.markers.push({ id: i, leafletMarker: circle, placeId: data.placeId, name : data.name });
        this.index++;
      }
      
      this.map.invalidateSize(); 


      var group = Leaflet.featureGroup(arr);
      this.map.fitBounds(group.getBounds());

      
    }, tm);
  }

  initGeoMarker() {
    this.geoMarker = Leaflet.circleMarker([this.lat, this.lng], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 5
    }).addTo(this.map);
  }
  
  
  initMarker() {
    
    const initialMarkers = 
      {
        position: { lat: this.lat, lng: this.lng },
        draggable: true

      }
    ;
    console.log('mark', this.lat, this.lng);
    const data = initialMarkers;
    var latlng = new Leaflet.LatLng(this.lat, this.lng);
    var marker = new Leaflet.Marker(latlng, {draggable: true} )
    .on('dragend', (event) => this.markerDragEnd(event, this.index));
    marker.addTo(this.map);
    this.map.panTo(data.position);
    
  
  }

  success(pos: any) {
    console.log('success', pos.coords.latitude);
    this.lat = pos.coords.latitude;
    this.lng = pos.coords.longitude;
    //const accuracy = pos.coords.accuracy; // Accuracy in metres
    var newLatLng = new Leaflet.LatLng(this.lat, this.lng);
    
    this.count++;
    if (this.count > 1) {
      this.map.setView(newLatLng);
      this.geoMarker.setLatLng(newLatLng);
    } else if (this.count == 1){
      this.initGeoMarker();
      this.map.setView(newLatLng);
      
    }
    
    

  }

  error(err: any) {
  
      if (err.code === 1) {
          alert("Please allow geolocation access");
          // Runs if user refuses access
      } else {
          alert("Cannot get current location");
          // Runs if there was a technical problem.
      }
  
  }

  findLocation() {
    
    var newLatLng = new Leaflet.LatLng(this.lat, this.lng);
    this.map.panTo(newLatLng);
    console.log('findLocation', newLatLng);
    
  }
    
    

  generateMarker(data: any, index: number, name: string) {
    
   
    return Leaflet.marker(data.position, { draggable: data.draggable, icon: new Leaflet.Icon({iconSize: [30, 30], iconUrl : 'assets/leaf-green.png'}) })
      .on('click', (event) => this.markerClicked(event, index))
      .on('dragend', (event) => this.markerDragEnd(event, index))
      //.on('popupopen', (event) => this.popUp(event, index))
      //.bindPopup(popupContent);
        
      ;
  }

  onMapReady($event: Leaflet.Map) {
    const options2 = {
      enableHighAccuracy: true, 
      // Get high accuracy reading, if available (default false)
      timeout: 1000000, 
      // Time to return a position successfully before error (default infinity)
      maximumAge: 10000000, 
      // Milliseconds for which it is acceptable to use cached position (default 0)
    };
    this.map = $event;
    this.map.attributionControl.setPrefix('');
    this.map.on('mousedown', this.onMouseDown.bind(this));
    this.map.on('mouseup', this.onMouseUp.bind(this));
    this.map.on('mouseleave', this.onMouseLeave.bind(this));
    
    navigator.geolocation.watchPosition(pos => this.success(pos), err => this.error(err), options2);
   
    
    
  }

  onMouseDown(event: any) {
    this.longPressTimer = setTimeout(() => {
      this.handleLongPress(event);
    }, 50);
  }

  onMouseUp() {
    clearTimeout(this.longPressTimer);
  }

  onMouseLeave() {
    clearTimeout(this.longPressTimer);
  }

  handleLongPress($event: any, ) {
    console.log('Долгое нажатие!', event);

  }

  
  
  
  mapClicked($event: any) {
    if (this.flag == false) {
      console.log('mapClicked', $event.latlng.lat, $event.latlng.lng);
      var ask = window.confirm("Создать новый маркер?");
      if (ask) {
        this.initMarker();
      }
    }
    
  }

  markerClicked($event: any, index: number) {
    if (index != -1) {
      if (this.flag == false && this.add_photo_flag == true) {
        console.log('markerClickedflagadd');
        
        if (index == this.markerAddPhoto.id) {
          this.markerAddPhoto.leafletMarker.setIcon(new Leaflet.Icon({iconSize: [30, 30], iconUrl: 'assets/leaf-green.png' }));
          this.markerAddPhoto = null;
        } else {
          this.markerAddPhoto.leafletMarker.setIcon(new Leaflet.Icon({iconSize: [30, 30], iconUrl: 'assets/leaf-green.png' }));
          if (this.markers.find(x => x.id == index)) {
            this.markerAddPhoto =  this.markers.find(x => x.id == index);
          }
          this.markerAddPhoto.leafletMarker.setIcon(new Leaflet.Icon({iconSize: [30, 30], iconUrl: 'assets/leaf-red.png' }));
        }
      }
      
      if (this.flag == false) {
       var M = this.markers.find(x => x.id == index);
       var name = "";
       if (M) {
        name = M.name;
       }
       const popupContent = `
          <div class='popup-content'>
            <h3>${name}</h3>
            <ion-button class="popup-button" id="renameButton">Переименовать</ion-button>
            <ion-button class="popup-button" id="addDescriptionButton">Описание</ion-button>
            <ion-button class="popup-button" id="removeButton">Удалить</ion-button>
            <ion-button class="popup-button" id="addPhoto">Добавить фото</ion-button>
            <ion-button class="popup-button" id="showPhoto">Просмотр фото</ion-button>
            
          </div>
        `;
    
        const popup = new Leaflet.Popup()
          .setLatLng($event.target.getLatLng())
          .setContent(popupContent)
          .openOn(this.map);
        this.addPopupEventListeners($event, index, popup);
      } else if (this.flag == true) {
        console.log('markerClickedflag1');
        const markerIndex = this.markers_for_route.findIndex(marker => marker.id === index);
        const selectedMarker = this.markers.find(marker => marker.id === index);
        if (markerIndex === -1) {
          // Добавление в список
          if (selectedMarker) {
            this.markers_for_route.push(selectedMarker);
            console.log('Маркер добавлен:', selectedMarker);
            selectedMarker.leafletMarker.setIcon(new Leaflet.Icon({ iconSize: [30, 30], iconUrl: 'assets/leaf-red.png' }));
    
          }
        } else {
          //Удаление из списка при повторном нажатии
          if (selectedMarker) {
            console.log('Маркер удален:', this.markers_for_route[markerIndex]);
            this.markers_for_route.splice(markerIndex, 1);
            selectedMarker.leafletMarker.setIcon(new Leaflet.Icon({iconSize: [30, 30], iconUrl: 'assets/leaf-green.png' }));
      
          }
        }
      }
    }
    
  }

  addPopupEventListeners($event: any, index: number , popup : any) {
    setTimeout(() => {
      const renameButton = document.getElementById('renameButton');
      const addDescriptionButton = document.getElementById('addDescriptionButton');
      const removeButton = document.getElementById('removeButton');
      const addPhoto = document.getElementById('addPhoto');
      const showPhoto = document.getElementById('showPhoto');
      const filesInp = document.getElementById('files_input');
      if (renameButton) {
        renameButton.addEventListener('click', () => {
          this.renameMarker($event, index, popup);
          popup.remove();
        });
      }

      if (addDescriptionButton) {
        addDescriptionButton.addEventListener('click', () => {
          this.addDescriptionToMarker($event, index, popup);
          popup.remove();
        });
      }

      if (addPhoto) {
        addPhoto.addEventListener('click', () => {
          this.pickImages($event, index, popup);
          popup.remove();
        });
      }

      if (showPhoto) {
        showPhoto.addEventListener('click', () => this.ngZone.run(() => {
          const marker = this.markers.find(x => x.id == index);
          if (marker) {
            const param2 = marker.placeId;
            const param1 = this.userId;
            
            popup.remove();

            this.router.navigate(['picture'], {queryParams : {param1:param1, param2:param2}});
              
          }
        
        }));
      }

      if (removeButton) {
        removeButton.addEventListener('click', () => {
          this.removeButton($event, index);
          popup.remove();
        });
      }
      

    }, 0);
  }


  
  async pickImages($event: any, index: number, popup: any) {
    
      const result = await FilePicker.checkPermissions();
      console.log('pickFiles permission', result);
    
      
      const selectedFiles = await FilePicker.pickFiles();
      console.log('pickImages: selectedFiles', selectedFiles);
      const filesToSend: IPhoto[] = [];
      
      for (let i = 0; i < selectedFiles.files.length; i++) {
        var place = this.markers.find(x => x.id == index);
        if (place) {
          const photo: IPhoto = {
            userId : this.userId,
            placeId: place?.placeId,
            filename: selectedFiles.files[i].name,
            ext: selectedFiles.files[i].mimeType,
            image: Capacitor.convertFileSrc(selectedFiles.files[i].path!),
          };  
          console.log('pickImages: photo', photo);
          filesToSend.push(photo);
          
          // Читаем содержимое файла
          const response = await fetch(photo.image!);
          const blb : Blob = await response.blob();
          console.log('pickImages: blob.size', blb.size);
          
          this.mapPointService.upload$(this.userId, photo.placeId, blb, photo.filename, photo.ext)
          .subscribe({
            next: res => {
              console.log('sss');
            }
          });
        } 
      }
      console.log('pickImages: finished');
      
  };

  async filesSelected(event: any) {
    console.log('filesSelected', event.target.files);
    
    const selectedFiles = event.target.files; 
    for (let i = 0; i < event.target.files.length; i++) {
      

      const response = await fetch(URL.createObjectURL(selectedFiles[i])!);
      const blb = await response.blob();
      console.log(blb)
      const id = this.markers.find(x => x.id == 1);
      if (!id) continue;
      this.mapPointService.upload$(this.userId, id.placeId, blb, selectedFiles[i].name, selectedFiles[i].type)
      .subscribe({
        next: res => {
          console.log('sss');
        }
      });
    }
    
   
  }
  

  /*showPhotos ($event: any, index: number, popup: any) {
    const marker = this.markers.find(x => x.id == index);
    if (marker) 
    this.mapPointService.download$(this.userId, marker?.placeId)
    .subscribe({
      next: res => {
        console.log(res);
        const Content = `
          <ion-img alt="Изображение недоступно" [src]="'data:image/png;base64,' + res.thumbnailBytes"></ion-img>
        `;
        const popup = new Leaflet.Popup()
          .setLatLng($event.target.getLatLng())
          .setContent(Content)
          .openOn(this.map);

        
      }
    })
    
    

  }*/

  renameMarker($event: any, index: number, popup: any) {
    console.log('Добавить name к маркеру');
    const place: Marker | undefined = this.markers.find(x => x.id == index);
    
    
    if (place) {
      this.mapPointService.getPlaceInfo$(this.userId, place.placeId)
      .subscribe({
        next: res => {
          console.log(res, res.name);
          var text = res.name;
          if (text == null) {
            text = "";
          }
          this.renameAlert(text, index, place.placeId);
          //var new_desc = window.prompt("Добавьте имя", text);
          
          
        }
      })
    }
  }

  async renameAlert(text: any, index:any, placeId: any) {
    var alertButton1 = [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Ок',
        handler: (data: string) => {
          if (data) {
            var mar = this.markers.find(x => x.id == index);
            if (mar) {
              mar.name = data[0];
              
            }
            
            this.mapPointService.addName$(this.userId, placeId, data[0])
            .subscribe({
              next: res => {
                console.log("addedDesc");
              }
            })
          }
        }
      }
    ];

    const alert = await this.alertController.create({
      inputs: [{
        type: 'textarea', 
        value: text,
      }],
      header: 'Введите название места',
      buttons: alertButton1,
    });

    await alert.present();
    
  }

  removeButton($event: any, index: number) {
    console.log('Удалить маркер');
    var ask = window.confirm("Удалить этот маркер?");
    if (ask) {
      this.mapPointService.delete$(this.userId, $event.latlng.lat, $event.latlng.lng)
      .subscribe({
        next: res => {
          console.log('mapPointService.delete', res);
          
        }
      })

      var markerIndex = this.markers.findIndex(marker => marker.id === index);
      this.map.removeLayer(this.markers[markerIndex].leafletMarker);
      this.markers.splice(markerIndex, 1);
    }
  }


  curPlaceId = '';
  
  
  async addDescriptionToMarker($event : any, index: number, popup : any) {
    console.log('Добавить описание к маркеру');
    const place: Marker | undefined = this.markers.find(x => x.id == index);
    this.curPlaceId = '';
    
    if (place) {
      this.mapPointService.getPlaceInfo$(this.userId, place.placeId)
      .subscribe({
        next: res => {
          console.log(res, res.description);
          var text = res.description;
          if (text == null) {
            text = "";
          }
          
          this.showAlert(text);
          
          this.curPlaceId = place.placeId;
        }
      })
    }
  }

  async showAlert(text:any) {
    var AlertInput = [
      {value:text,
      }
    ];

    var alertButtonDesc = [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Ок',
        handler: (data: string) => { 
          this.realAddDescription(data[0]);
        }
      }
    ];

    const alert = await this.alertController.create({
      inputs: AlertInput,
      header: 'Добавьте описание',
      buttons: alertButtonDesc,
    });

    await alert.present();
  }

  realAddDescription(data:any) {
    var new_desc = data;
    console.log(data);
    if (new_desc) {
      this.mapPointService.addDescription$(this.userId, this.curPlaceId, data)
      .subscribe({
        next: res => {
          console.log("addedDesc");
          
        }
      })
    }
  }
  

  popUp($event: any, index: number) {
    var markerIndex = this.markers.findIndex(marker => marker.id === index);
    console.log('popUp');
    //this.addPopupEventListeners($event, index);
    return this.markers[markerIndex].leafletMarker
  }

  async markerDragEnd($event: any, index: number) {
    var ask = window.confirm("Добавить сюда?");
    console.log('dragend', $event.target._latlng.lat);
    if (ask) {

      //var name = window.prompt("Введите название", "");
      var alertButton1 = [
        {
          text: 'Отмена',
          role: 'cancel'
        },
        {
          text: 'Ок',
          handler: (data: string) => {
            var name = data[0];
            if (!name) name = "";
      
            var circle = this.generateMarker(
              {
                position: { lat: $event.target._latlng.lat, lng: $event.target._latlng.lng },
                draggable: false
        
              }, this.index, name
            )
            
            circle.addTo(this.map);
            this.map.removeLayer($event.target);
            const placeId = nanoid();
            this.markers.push({leafletMarker : circle, id : this.index, placeId: placeId, name : name});
            this.index++;
            
            console.log(this.userId, placeId, $event.target._latlng.lat, $event.target._latlng.lng, name)
            this.mapPointService.post$(this.userId, placeId, $event.target._latlng.lat, $event.target._latlng.lng, name)
            .subscribe({
              next: res => {
                console.log('mapPointService.post', res);
                
              }
            });
            window.alert("Точка успешно добавлена");
          
          }
        }
      ];
  
      const alert = await this.alertController.create({
        inputs: [{
          type: 'textarea', 
        }],
        header: 'Введите название места',
        buttons: alertButton1,
      });
  
      await alert.present();
      var LatLng = new Leaflet.LatLng($event.target._latlng.lat, $event.target._latlng.lng);
    } else {
      this.map.removeLayer($event.target);
    }
  } 

  confirmSelection() {
    var arr = [];
    if (this.markers_for_route.length > 0) {
      this.mapPointService.add_route$(this.userId, this.route_name, this.markers_for_route)
      .subscribe({
        next: res => {
          console.log('mapPointService.add_route', res);
          
        }
      })
      
      console.log('confirmSelection');
      for (var i = 0; i < this.markers_for_route.length; i++) {
        this.markers_for_route[i].leafletMarker.setIcon(new Leaflet.Icon({iconSize: [30, 30], iconUrl: 'assets/leaf-green.png' }));
        arr.push(this.markers_for_route[i].placeId);
      }
    }
    var tmp : AlertInput = {
      label : this.route_name,
      type : 'radio',
      value: this.route_name,
    };
    var r : IRoutes = {
      nameRoute : this.route_name,
      placeIds : arr
    }
    this.routes.push(r)
    this.alertInputs.push(tmp);

    this.flag = false;
    this.markers_for_route = []
  }

  async createRoute($event: any) {
    var ask = window.confirm("Вы хотите создать новый маршрут?");
    if (ask) {
      this.markers_for_route = [];
      //var name = window.prompt("Введите название маршрута", "");
      var alertButton1 = [
        {
          text: 'Отмена',
          role: 'cancel'
        },
        {
          text: 'Ок',
          handler: (data: string) => {
            if (data) {
              this.route_name = data[0];
              var con = window.confirm("Выберите места для создания маршрута");
              if (con) {
                
                this.flag = true;
                
              }
            }
          }
        }
      ];
  
      const alert = await this.alertController.create({
        inputs: [{
          type: 'textarea', 
        }],
        header: 'Введите название маршрута',
        buttons: alertButton1,
      });
  
      await alert.present();
      
    
    }
  }

  async chooseM() {
    var alertButton1 = [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Ок',
        handler: (data: string) => {
          this.showRoutes(data);
        }
      }
    ];

    const alert = await this.alertController.create({
      inputs: this.alertInputs,
      header: 'Выберите маршрут',
      buttons: alertButton1,
    });

    await alert.present();
  }

  async chooseShare() {
    var alertButton1 = [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Ок',
        handler: (data: string) => {
          this.share(data);
        }
      }
    ];

    const alert = await this.alertController.create({
      inputs: this.alertInputs,
      header: 'Выберите маршрут',
      buttons: alertButton1,
    });

    await alert.present();
  }

  async chooseCode() {
    var alertButton1 = [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Ок',
        handler: (data: string) => {
          this.getCode(data);
        }
      }
    ];

    const alert = await this.alertController.create({
      inputs: this.alertInputs,
      header: 'Выберите маршрут',
      buttons: alertButton1,
    });

    await alert.present();
  }



  

  
  
  markers_to_return : Marker[] = [];
  showRoutes(name: any) {
    
    console.log(name);
    var marker_to_show : Marker[] = [];
    var R = this.routes.find(x => x.nameRoute == name)?.placeIds;
    R?.forEach(placeId => {
      var tmp = this.markers.find(x => x.placeId == placeId);
      if (tmp) {
        marker_to_show.push(tmp);
      }
    });
    this.markers_to_return = [];
    for (var i = 0; i < this.markers.length; i++) {
      var ind = marker_to_show.findIndex(x => x.id == this.markers[i].id)
      if (ind == -1) {

        this.markers_to_return.push(this.markers[i]);
        this.map.removeLayer(this.markers[i].leafletMarker);
        console.log('remove', this.markers[i].leafletMarker)
      }
    }
    this.showRoute = true;
    
    
  }

  backFromRoute() {
    for (var i = 0; i < this.markers_to_return.length; i++) {
      this.markers_to_return[i].leafletMarker.addTo(this.map);
    }
    this.showRoute = false;
  }
  
  async share(name: any) {
    console.log('share', name);
    var login = '';
    //var login = window.prompt("Введите email пользователя", "");
    var alertButton1 = [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Ок',
        handler: (data: string) => {
          login = data;
          console.log('handler', login[0]);
          if (login) {
            this.mapPointService.shareRoute$(this.userId, name, login[0])
            .subscribe({
              next: res => {
                console.log('mapPointService.share', res);
                
              }
            })
          }
        }
      }
    ];

    const alert = await this.alertController.create({
      inputs: [{
        type: 'textarea', 
        placeholder: 'example@gmail.com'
      }],
      header: 'Введите email пользователя',
      buttons: alertButton1,
    });

    await alert.present();
    
    
  }

  async enterCode() {
    console.log('enterCode');
    
    var alertButton1 = [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Ок',
        handler: (data: string) => {
          if (data) {
            this.mapPointService.enterCode$(this.userId, data[0])
            .subscribe({
              next: res => {
                console.log('mapPointService.enterCode', res);
                window.alert("Маршрут добавлен. Перегрузите страницу.")

              }
            })
          }
        }
      }
    ];

    const alert = await this.alertController.create({
      inputs: [{
        type: 'textarea', 
      }],
      header: 'Введите код доступа',
      buttons: alertButton1,
    });

    await alert.present();
    
  }
  

  async presentAlert(message: string) {
    console.log(message);
    const alert = await this.alertController.create({
      header: 'Код маршрута',
      message: message,
      buttons: ['OK'],
      cssClass: 'alert',
      
    });
  
    await alert.present();
  }

  getCode(name : string) {
    this.mapPointService.getCode$(this.userId, name)
      .subscribe({
        next: res => {
          console.log('mapPointService.getCode', res);

          this.presentAlert(res.id); 

        }
      })
  }
  markerAddPhoto!: any;

  async confirmSelectionMarker() {
    if (this.markerAddPhoto == null) {
      //window.alert("Вы не выбрали место");
      const alert = await this.alertController.create({
        header: 'Вы не выбрали место',
        buttons: ['OK']
      });
    
      await alert.present();
    } else {
      //upload
      console.log(this.markerAddPhoto);

    }
    this.add_photo_flag = false;
  }

  exit() {
    this.router.navigate(['login']);
    this.markers = [];
    this.mapPoints = [];
    this.routes = [];
    this.alertInputs = [];
    this.UserName = "";
    this.fileService.userId = '';
  }

  

  

}
