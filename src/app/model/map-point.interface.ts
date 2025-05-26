
import * as Leaflet from 'leaflet'; 

export interface IMapPoint extends ICoord {
    name: string;
    placeId: string;
}

export interface IRoutes {
    
    nameRoute: string;
    placeIds: string[];
}

export interface ICoord {
  lat: number;
  lng: number;
}

export interface IApiPhoto {
  fileName: string;
  extension : string;
  thumbnailBytes : string;
}

export interface IPhoto {
  userId: string,
  placeId : string,
  image : any,
  filename : any,
  ext : any,
}

export interface Marker {
  id: number;
  leafletMarker: Leaflet.Marker;
  placeId: string;
  name : string;
}

export interface alertInput {
  label : string,
  type : string,
  value: string,
};

export interface IPlace {
  id: string,
  name : string,
  lat : number,
  lon : number,
  description : string,
  photos : any,
};