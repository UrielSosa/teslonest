import { extname } from "path";

export const fileFilter = (req: Express.Request, file:Express.Multer.File, call: Function) => {

    if ( !file ) return call(new Error ('File is empty'), false);

    const fileExt = extname(file.originalname);
    const validExtensions = ['.jpg', '.png', '.gif', '.jpeg']

    if ( !validExtensions.includes( fileExt ) ) return call(new Error ('File extension is not available'), false)
    


    call(null, true);
}