import { Injectable, NestMiddleware } from '@nestjs/common';
import * as compression from 'compression';
import { Response, Request, NextFunction } from 'express';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        compression({
            threshold: '1b',
        })(req, res, next);
    }
}
