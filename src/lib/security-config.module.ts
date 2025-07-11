import {
    DynamicModule,
    Global,
    Logger,
    Module,
    OnModuleInit,
} from "@nestjs/common";
import { SecurityConfigDto, validateSecurityConfig } from "./dto/security-config.dto";
import { ConfigService } from '@nestjs/config';

@Global()
@Module({})
export class SecurityConfigModule implements OnModuleInit {
    private readonly logger = new Logger(SecurityConfigModule.name);
    private static config: SecurityConfigDto;

    static forRoot(): DynamicModule {
        return {
            module: SecurityConfigModule,
            providers: [
                {
                    provide: 'SECURITY_CONFIG',
                    useFactory: (configService: ConfigService) => {
                        // Validate configuration at module initialization
                        this.config = validateSecurityConfig({
                            forbiddenRepositoryIds: configService.get<string[]>('SECURITY_FORBIDDEN_REPOSITORY_IDS'),
                            csrfSecret: configService.get<string>('SECURITY_CSRF_SECRET'),
                            csrfTokenExpiration: configService.get<number>('SECURITY_CSRF_TOKEN_EXPIRATION'),
                            csrfExemptPaths: configService.get<string[]>('SECURITY_CSRF_EXEMPT_PATHS'),
                            corsOrigins: configService.get<string[]>('SECURITY_CORS_ORIGINS'),
                        });
                        return this.config;
                    },
                    inject: [ConfigService],
                },
            ],
            exports: ['SECURITY_CONFIG'],
            global: true,
        }
    }

    onModuleInit() {
        this.logger.log('Security config module initialized successfully');
    }
}
