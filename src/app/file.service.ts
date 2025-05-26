import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export interface ICoord {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor() {};
  userId : string = '';
  dict : ICoord[][]= [
    [],
    [],
    [],
    [],
  ]
  
  
  readSecretFile () {
    Filesystem.readdir({
      path: '',
      directory: Directory.Documents,
    })
    .then(cont => {
      console.log('readDir', cont.files);
      if ((0 != cont.files.length) && ('data.txt' == cont.files[0].name) ) {
        Filesystem.readFile({
          path: 'data.txt',
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        })
        .then(contents => {
          this.dict = this.StringToDict(contents.data.toString());
          console.log('Dict:', this.dict);
        })
        .catch(err => {
          console.warn('readFile err', err);
        });
        
      } else {
        console.log('first write');
      }
    })
  }
    

  DictToString (obj: ICoord[][]) {
    var str = '';
    for (var j= 0; j < 4; j++) { 
        
        for (var i = 0; i < obj[j].length; i++) {
          if (obj[j][i].lat != 0 && obj[j][i].lng != 0 && (!Number.isNaN(obj[j][i].lat)) && (!Number.isNaN(obj[j][i].lng))) {
            str += String(obj[j][i].lat);
            str += ',';
            str += String(obj[j][i].lng);
            str += '!';
          }
        }
        
        str += '\n';
    }
    console.log(str);
    return str;
}

StringToDict(str: string) {
  var res : ICoord[][] = [
    [],
    [],
    [],
    [],
  ];
  var arr = str.split('\n');
  for (var i = 0; i < 4; i++) {
    var arr1 = arr[i].split('!');
    for (var j = 0; j < arr1.length; j++) {

      var lat_and_lng = arr1[j].split(',');
      if (Number(lat_and_lng[0]) != 0 && Number(lat_and_lng[1]) != 0) {
        var latt = Number(lat_and_lng[0]);
        var lngg = Number(lat_and_lng[1]);
        if ((!Number.isNaN(latt)) && (!Number.isNaN(lngg))) {
          res[i].push({ lat: latt, lng: lngg });
        }
      }
    }
  }
  
  return res;
}

  
  writeSecretFile(dictionary : ICoord[][]) {
    var text = this.DictToString(dictionary);
    Filesystem.writeFile({
      path: 'data.txt',
      data: text,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    
    console.log('file saved')
  }

  writeSecretFileStr(str : string) {
    Filesystem.writeFile({
      path: 'data.txt',
      data: str,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    
    console.log('file created');
  }

  

}
