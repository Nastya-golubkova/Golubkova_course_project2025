/*

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
//import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { LoadingController } from '@ionic/angular';
import { nanoid } from 'nanoid';
//import { NGXLogger } from 'ngx-logger';
import { catchError, of, Subscription, switchMap } from 'rxjs';
/*import { ClonePhotoBlobToPhoto, ClonePhotoToPhotoBlob, IApiPhoto, IApiPhotoWithBlob } from 'src/app/models/api-blob.model';
import { IOrderExt } from 'src/app/models/order-ext.model';
import { AuthService } from 'src/app/services/auth.service';
import { CameraService } from 'src/app/services/camera.service';
import { CashOrderService } from 'src/app/services/cash-order.service';
import { DsOrderService } from 'src/app/services/ds-order.service';
import { EngineerStatusService } from 'src/app/services/engineer-status.service';
import { MainMenuService } from 'src/app/services/main-menu.service';
import { MiscService } from 'src/app/services/misc.service';
import { NetworkService } from 'src/app/services/network.service';
import { OrderService } from 'src/app/services/order.service';
import { SyncService } from 'src/app/services/sync.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import write_blob from "capacitor-blob-writer";* /




@Component({
  selector: 'app-file',
  templateUrl: './file.page.html',
  styleUrls: ['./file.page.scss'],
})
export class OrderFilePage implements OnInit, OnDestroy {
	orderId = '';
  order: IOrderExt|undefined;
  // Файлы для отправки (из галереи)
  onPageBlobs: IApiPhoto[] = [];
  // Фото для отправки (с камеры)
  onPagePhotos: IApiPhoto[] = [];
  selectedFiles: File[] = [];  
	environment = environment;
  sending = false;

	private subs: Subscription[] = [];

  constructor(
    private router: Router,
		private activateRoute: ActivatedRoute,
    private loadingCtrl: LoadingController,
    ///private logger: NGXLogger,
    ) { }


    async loadPagePhotosAsync() {
    this.onPagePhotos = this.cameraService.photosForUpload.filter(x => x.orderId === this.orderId);
    console.warn('loadPagePhotosAsync onPagePhotos', this.onPagePhotos);
    for (let i = 0; i < this.onPagePhotos.length; i++) {
      try {
        const fileRes = await Filesystem.readFile({directory: Directory.Data, path: this.onPagePhotos[i].fileName});
        if (fileRes?.data) {
          this.onPagePhotos[i].objectUrl = `data:${this.onPagePhotos[i].extension};base64,${fileRes.data}`;
        }
      } catch (e) {
        console.warn('loadPagePhotosAsync EXC', e);
        this.logger.warn('filePage.loadPagePhotosAsync EXC', e);
      }
    };
  }

  onRemoveFile(blb: IApiPhoto) {
    const ind = this.onPageBlobs.findIndex(x => x.id === blb.id);
    if (ind >= 0) {
      this.onPageBlobs.splice(ind, 1);
    }
  }

  onImageClick(blb: IApiPhoto) {
    console.log('blb', blb);
    if (blb.fileName?.indexOf('jpg') > 0 || blb.fileName?.indexOf('jpeg') > 0 ||blb.fileName?.indexOf('png') > 0)
      this.router.navigate(['order-file-show', this.order?.id, blb.id]);
  }


  async filesSelected(event: any) {
    console.log('filesSelected', event.target.files);
    this.sending = false;
    this.selectedFiles = event.target.files; 
    const filesToSend: IApiPhoto[] = [];
    //const filesToSendWithBlob: IApiPhotoWithBlob[] = [];
    for (let i = 0; i < event.target.files.length; i++) {
      const photo: IApiPhoto = {
        id: nanoid(),
        orderId: this.orderId ?? '',
        fileName: this.selectedFiles[i].name,
        extension: this.selectedFiles[i].type,
        objectUrl: URL.createObjectURL(this.selectedFiles[i]),
      };
      filesToSend.push(photo);

      const response = await fetch(photo.objectUrl!);
      const blb = await response.blob();
      const fileToWrite = ClonePhotoToPhotoBlob(photo);
      fileToWrite.blob = blb;
      //filesToSendWithBlob.push(fileToWrite);
      this.cameraService.writeToFileAsync(fileToWrite);
    }
    
    filesToSend.forEach(el => {
       this.onPagePhotos.push(el);
       this.cameraService.photosForUpload.push(el);
    });
    await this.cameraService.writeStorageAsync();
    console.log('photosForUpload', this.cameraService.photosForUpload);
    
    // Загрузить сразу до 3 файлов, остальные подгрузит синхронизатор, если сеть доступна
    if (this.networkService.isNetworkAvailable$.value) {
      this.syncService.uploadPhoto$()
      .pipe(
        switchMap(res1 => {        
          if (res1) {       
            return this.syncService.uploadPhoto$()
            .pipe(
              switchMap(res2=>{
                if (res2) {
                  return this.syncService.uploadPhoto$();
                } else {
                  return of(false);
                }
              })
            )
          } else {
            return of(false);
          }
        }),
        catchError(e => {
          console.log('filesSelected upload ERR', e);
          this.logger.warn('filePage.filesSelected EXC', e);
          return of(false);
        })
      )
      .subscribe(res => {
        this.loadPagePhotosAsync();
      });
    }
  }



  async pickImages() {
    const selectedFiles = await FilePicker.pickImages();
    console.log('pickImages: selectedFiles', selectedFiles);
    this.sending = false;
    const filesToSend: IApiPhoto[] = [];
        
    for (let i = 0; i < selectedFiles.files.length; i++) {
      const photo: IApiPhoto = {
        id: nanoid(),
        orderId: this.orderId ?? '',
        fileName: selectedFiles.files[i].name,
        extension: selectedFiles.files[i].mimeType,
        objectUrl: Capacitor.convertFileSrc(selectedFiles.files[i].path!),
      };  
      console.log('pickImages: photo', photo);
      filesToSend.push(photo);

      // Читаем содержимое файла
      const response = await fetch(photo.objectUrl!);
      const blb = await response.blob();
      console.log('pickImages: blob.size', blb?.size);
      // Записываем файл в директорию приложения
      const writeRes = await write_blob({
        path: photo.fileName,
        directory: Directory.Data,
        blob: blb,
      });
      console.log('pickImages: write ok', writeRes);
      this.logger.debug('pickImages: write ok', writeRes);
    }
    console.log('pickImages: finished');
    // Показать выбранные файлы на странице и добавить к списку выгрузки
    filesToSend.forEach(el => {
       this.onPagePhotos.push(el);
       this.cameraService.photosForUpload.push(el);
    });
    await this.cameraService.writeStorageAsync();
    console.log('photosForUpload', this.cameraService.photosForUpload);

    // Загрузить сразу до 3 файлов, остальные подгрузит синхронизатор, если сеть доступна
    if (this.networkService.isNetworkAvailable$.value) {
      this.syncService.uploadPhoto$()
      .pipe(
        switchMap(res1 => {        
          if (res1) {       
            return this.syncService.uploadPhoto$()
            .pipe(
              switchMap(res2=>{
                if (res2) {
                  return this.syncService.uploadPhoto$();
                } else {
                  return of(false);
                }
              })
            )
          } else {
            return of(false);
          }
        }),
        catchError(e => {
          console.log('filesSelected upload ERR', e);
          this.logger.warn('filePage.filesSelected EXC', e);
          return of(false);
        })
      )
      .subscribe(res => {
        this.loadPagePhotosAsync();
      });
    }

  };



  onMakePhotoClick() {
    this.takePhoto();
  }

  async takePhoto() {
    let image: Photo;
    try {    
        image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        saveToGallery: true,
        source: CameraSource.Camera,
        resultType: CameraResultType.Uri,
        //resultType: CameraResultType.Base64,
        //resultType: CameraResultType.DataUrl,
      });
    } catch (e) {
      console.warn('Camera ERR', e);
      this.logger.warn('filePage.takePhoto: EXC', e);
      return;
    }
    if (!image.webPath) {
      console.warn('Camera ERR webPath is null');
      this.logger.warn('filePage.takePhoto: Camera ERR webPath is null');
    }

    let fName = (this.utilsService.dateToNet()).replace(/:/g, '-').replace(/T/g, ' ');
    const fNameInd = fName.lastIndexOf('.');
    if (fNameInd > 0) {
      fName = fName.substring(0, fNameInd) + '.' + image.format;
    }
    const photo: IApiPhoto = {
      id: nanoid(),
      orderId: this.order?.id ?? '',
      fileName: fName,
      extension: image.format,
      objectUrl: image.webPath ?? '',
    };
    console.log('Camera image', image);
    console.log('Camera photo', photo);
    this.logger.debug(`filePage.takePhoto: ok, image.fileName=${photo.fileName}, size=${image.base64String?.length}`);    

    const photoWithBlob: IApiPhotoWithBlob = await this.cameraService.SavePictureOnDiskAndSetBlobAsync(photo);
    if (photoWithBlob.err) {
      //this.miscService.showErrorAsync('Ошибка сохранения', 'Ошибка сохранения файла. Файл не сохранен. ' + photoWithBlob.err);
      this.miscService.showToastAsync(`Ошибка загрузки`, 'top', 'warning');
      this.logger.warn(`filePage.takePhoto: Ошибка загрузки.`);
      return;
    } 

    this.authService.loadingObj = await this.loadingCtrl.create({message: 'Отправляю...'});
    this.authService.loadingObj?.present();
    
    this.onPagePhotos.push(photo);
    this.syncService.updateUnsyncFlag();

    this.cameraService.photosForUpload.push(ClonePhotoBlobToPhoto(photo));
    await this.cameraService.writeStorageAsync();
    console.log(`upload to server ${photoWithBlob.fileName}...`);
    this.logger.debug(`filePage.takePhoto: upload to server...`);
    this.cameraService.uploadPhoto$(photoWithBlob)
    .subscribe({
      next: (res1) => {
        console.log('takePhoto upload res1', res1);
        const ind2 = this.onPagePhotos.findIndex(x => x.id===photo.id);
        if (ind2>=0) {
          const newPh = this.onPagePhotos.splice(ind2, 1);
          //newPh[0].blob = undefined;
          newPh[0].modified = res1?.modified;
          this.onPageBlobs.push(newPh[0]);
          this.order!.blobs.push(newPh[0]);
        }
        this.authService.loadingObj?.dismiss();
        this.syncService.updateUnsyncFlag();
      },
      error: (err) => {
        console.warn('takePhoto upload ERR', err);
        this.logger.warn('filePage.takePhoto upload EXC', err);
        this.authService.loadingObj?.dismiss();
        this.syncService.updateUnsyncFlag();
        //this.miscService.showErrorAsync(`Ошибка загрузки ${err.status}`, 'Файлы не загружены, повторите позже');
        this.miscService.showToastAsync(`Ошибка загрузки`, 'top', 'warning');
      }
    })
  };



}
*/