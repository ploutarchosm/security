import {Inject, Injectable, NestMiddleware} from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';
import * as uuid_1 from 'uuid';
import * as clsHooked from 'cls-hooked';
import { AppConfigDto } from "@ploutos/application";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {

    constructor(
        @Inject('APP_CONFIG') private readonly appConfig: AppConfigDto) {
    }

    use(req: Request, res: Response, next: NextFunction) {
        const session = clsHooked.getNamespace(this.appConfig.namespace);
        const traceID = uuid_1.v4();
        const requestUrl = `${req.protocol}://${req.headers.host}`;
        console.log(requestUrl);
        console.log(traceID);
        session.run(async () => {
            session.set('traceID', traceID);
            session.set('requestUrl', requestUrl);
            next();
        });
    }
}
