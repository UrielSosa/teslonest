import { extname } from "path";
import {v4 as uuid } from 'uuid';

export const fileNamer = (req: Express.Request, file:Express.Multer.File, call: Function) => {

    if ( !file ) return call(new Error ('File is empty'), false);

    const fileExt = extname(file.originalname);
    const validExtensions = ['.jpg', '.png', '.gif', '.jpeg']

    if ( !validExtensions.includes( fileExt ) ) return call(new Error ('File extension is not available'), false)
    
    const fileName = `${uuid()}${fileExt}`;


    call(null, fileName);
}