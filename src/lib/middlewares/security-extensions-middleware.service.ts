import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { assign } from 'lodash';
import { hasPermission } from "@ploutos/common";

@Injectable()
export class SecurityExtensionsMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const security = {
            hasPermissions: (permissions: string[]) =>
                hasPermission(req, permissions),
            isLoggedIn: () => req.user && req.user.id,
            isActiveUser: () => req.user && req.user.id && req.user.active,
        };
        assign(req, {
            security: security,
        });
        next();
    }
}
