import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';
import { assign } from 'lodash';
import { INJECTION_TOKENS, SECURITY_API_TOKEN_HEADER_KEY } from "@ploutos/common";
import * as clsHooked from 'cls-hooked';
import { AppConfigDto } from "@ploutos/application";
import { AuthApiService } from "../services/auth-api.service";
import { UserService } from "@ploutos/admin";
import * as dayjs from 'dayjs';

@Injectable()
export class ApiTokenMiddleware implements NestMiddleware {
    constructor(
        @Inject(INJECTION_TOKENS.USER_SERVICE)
        private readonly userService: UserService,
        private readonly authApiService: AuthApiService,
        @Inject('APP_CONFIG') private readonly appConfig: AppConfigDto,
    ) {}
    use(req: Request, res: Response, next: NextFunction) {
        const clsNamespace = clsHooked.getNamespace(this.appConfig.namespace);
        const apiToken: string = req.headers[
            SECURITY_API_TOKEN_HEADER_KEY
            ] as string;
        clsNamespace.run(async () => {
            if (apiToken) {
                const token = await this.authApiService.getByValue(apiToken);
                if (token && dayjs().isBefore(token.expired_at)) {
                    const user = await this.userService.getById(token.userId);
                    if (user) {
                        clsNamespace.set('apiToken', token);
                        assign(req, {
                            apiToken: token,
                            user: Object.assign(
                                Object.assign(
                                    {},
                                    {
                                        id: user._id,
                                        active: user.active,
                                        permissions: await this.userService.getUserPermissions(
                                            user._id as string,
                                        ),
                                    },
                                ),
                            ),
                        });
                    }
                }
            }
            next();
        });
    }
}
