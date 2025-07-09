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

@Module({})
export class SecurityModule implements NestModule, OnModuleInit, OnApplicationShutdown, OnApplicationBootstrap {
    private readonly logger = new Logger(SecurityModule.name);

    constructor(
        @Inject('APP_CONFIG') private readonly appConfig: AppConfigDto) {
    }
    static forRoot(): DynamicModule {
        return {
            module: SecurityModule
        };
    }

    onApplicationShutdown() {
        if (clsHooked.getNamespace(this.appConfig.namespace)) {

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
                // AppOriginGuardMiddleware (implement later)
            )
            .exclude(this.appConfig.swaggerPath)
            .forRoutes({
                path: '*path',
                method: RequestMethod.ALL,
            });
    }
}
