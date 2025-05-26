import { Component, OnInit } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileService } from '../app/file.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private fileService: FileService,) {}

  

  ngOnInit(): void {
    console.log('AppComponent');
    this.fileService.readSecretFile();
    console.log('App2');
    

  }
}

