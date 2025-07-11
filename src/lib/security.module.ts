import {
    DynamicModule,
    Inject,
    Logger,
    MiddlewareConsumer,
    Module,
    NestModule,
    OnApplicationBootstrap,
    OnApplicationShutdown,
    OnModuleInit,
    RequestMethod
} from '@nestjs/common';
import * as clsHooked from 'cls-hooked';
import { AppConfigDto } from "@ploutos/application";
import { RequestContextMiddleware } from "./middlewares/request-context.middleware";
import { CompressionMiddleware } from "./middlewares/compression.middleware";
import { HelmetMiddleware } from "./middlewares/helmet.middleware";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthApi, AuthApiSchema } from "./schema/auth-api.schema";
import { AuthToken, AuthTokenSchema } from "./schema/auth-token.schema";
import { AuthResetPassword, AuthResetPasswordSchema } from './schema/auth-reset-password.schema';
import { SecurityConfigModule } from "./security-config.module";
import { AppOriginGuardMiddleware } from './middlewares/app-origin-guard.middleware';
import { AuthApiService } from "./services/auth-api.service";
import { CsrfTokenService } from "./services/csrf-token.service";
import { AuthTokenService } from "./services/auth-token.service";
import { SecurityCsrfController } from "./controllers/security-csrf.controller";
import { SecurityAuthController } from "./controllers/security-auth.controller";
import dayjs from 'dayjs';

@Module({})
export class SecurityModule implements NestModule, OnModuleInit, OnApplicationShutdown, OnApplicationBootstrap {
    private readonly logger = new Logger(SecurityModule.name);

    constructor(
        @Inject('APP_CONFIG') private readonly appConfig: AppConfigDto) {
    }
    static forRoot(): DynamicModule {
        return {
            module: SecurityModule,
            imports: [
                SecurityConfigModule.forRoot(),
                MongooseModule.forFeatureAsync([
                    {
                        name: AuthApi.name,
                        useFactory: () => {
                            const schema = AuthApiSchema;
                            schema.pre('save', function () {
                                const now = dayjs();
                                this.expired_at = now.add(1, 'd').format(); // expires 1 day
                            });
                            return schema;
                        },
                    },
                    {
                        name: AuthToken.name,
                        useFactory: () => {
                            const schema = AuthTokenSchema;
                            schema.pre('save', function () {
                                const now = dayjs();
                                this.expired_at = now.add(5, 'm').format(); // expires 5 min
                            });
                            return schema;
                        },
                    },
                    {
                        name: AuthResetPassword.name,
                        useFactory: () => {
                            const schema = AuthResetPasswordSchema;
                            schema.pre('save', function () {
                                const now = dayjs();
                                this.expired_at = now.add(3, 'm').format(); // expires 3 min
                            });
                            return schema;
                        },
                    },
                ]),
            ],
            controllers: [
                SecurityCsrfController,
                SecurityAuthController
            ],
            providers: [
                AuthApiService,
                AuthTokenService,
                CsrfTokenService
            ]
        };
    }

    onApplicationShutdown() {
        if (clsHooked.getNamespace(this.appConfig.namespace)) {
            clsHooked.destroyNamespace(this.appConfig.namespace)
        }
    }

    onApplicationBootstrap() {
        clsHooked.createNamespace(this.appConfig.namespace)
    }

    onModuleInit() {
        this.logger.log('Security module initialized successfully');
    }

    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply(
                RequestContextMiddleware,
                CompressionMiddleware,
                HelmetMiddleware,
                AppOriginGuardMiddleware
            )
            .exclude(this.appConfig.swaggerPath)
            .forRoutes({
                path: '*path',
                method: RequestMethod.ALL,
            });
    }
}
