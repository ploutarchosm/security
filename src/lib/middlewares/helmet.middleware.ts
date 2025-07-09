import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';
import * as helmet from 'helmet';

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        helmet.referrerPolicy({
            policy: 'no-referrer',
        })(req, res, next);
    }
}
