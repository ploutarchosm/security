import { ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsNumber, IsString, validateSync } from "class-validator";
import { plainToClass } from "class-transformer";

export class SecurityConfigDto {
    @IsNotEmpty({ message: 'SECURITY_FORBIDDEN_REPOSITORY_IDS is required for SecurityConfigModule' })
    @IsArray()
    @ArrayMinSize(1)
    @IsMongoId({ each: true })
    forbiddenRepositoryIds: string[];

    @IsNotEmpty({ message: 'SECURITY_CSRF_SECRET is required for SecurityConfigModule'})
    @IsString()
    csrfSecret: string;

    @IsNotEmpty({ message: 'SECURITY_CSRF_TOKEN_EXPIRATION is required for SecurityConfigModule'})
    @IsNumber()
    csrfTokenExpiration: number;

    @IsNotEmpty({ message: 'SECURITY_CSRF_EXEMPT_PATHS is required for SecurityConfigModule'})
    @IsArray()
    @ArrayMinSize(1)
    csrfExemptPaths: string[];

    @IsNotEmpty({ message: 'SECURITY_CORS_ORIGINS is required for SecurityConfigModule'})
    @IsArray()
    @ArrayMinSize(1)
    corsOrigins: string[];
}

export function validateSecurityConfig(config: Record<string, any>): SecurityConfigDto {
    const validatedConfig = plainToClass(SecurityConfigDto, config, {
        enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        const errorMessages = errors
            .map(error => Object.values(error.constraints || {}).join(', '))
            .join('; ');
        throw new Error(`Security configuration validation failed: ${errorMessages}`);
    }

    return validatedConfig;
}
