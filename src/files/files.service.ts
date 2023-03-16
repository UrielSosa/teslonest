import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';
import { resolve } from 'path';

@Injectable()
export class FilesService {
 
  getStaticImage (image: string) {
    
    const path = resolve(__dirname, '../../static/products', image);

    if ( !existsSync( path ) ) new BadRequestException (`No product found with image ${image}`);
  
    return path;
  }

}
