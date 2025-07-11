import { ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsNumber, IsString, validateSync } from "class-validator";
import { plainToClass, Transform } from "class-transformer";

export class SecurityConfigDto {
    @IsNotEmpty({ message: 'SECURITY_FORBIDDEN_REPOSITORY_IDS is required for SecurityConfigModule' })
    @IsArray()
    @ArrayMinSize(1)
    @IsMongoId({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
        }
        return value;
    })
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
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
        }
        return value;
    })
    csrfExemptPaths: string[];

    @IsNotEmpty({ message: 'SECURITY_CORS_ORIGINS is required for SecurityConfigModule'})
    @IsArray()
    @ArrayMinSize(1)
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
        }
        return value;
    })
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
