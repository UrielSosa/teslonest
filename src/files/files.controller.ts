import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('product/:image')
  findImage (
    @Res() res: Response,
    @Param('image') image: string
  ) {
    const path =  this.filesService.getStaticImage(image);

    console.log(path);
    
    res.sendFile(path);
  }



  @Post('product')
  @UseInterceptors( FileInterceptor('file', { 
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }) )
  uploadProduct ( 
    @UploadedFile('file') file: Express.Multer.File
  ) {

    if(!file) {
      throw new BadRequestException ('Make sure that the file is an image');
    }

    const secureImage = file.originalname


    return {file: secureImage};
  }
}
