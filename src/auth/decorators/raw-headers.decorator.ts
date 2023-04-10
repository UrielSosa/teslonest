import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const RawHeaders = createParamDecorator(( data: string[], ctx: ExecutionContext ) => {

    const headers = ctx.switchToHttp().getRequest().rawHeaders;

    return headers;
})