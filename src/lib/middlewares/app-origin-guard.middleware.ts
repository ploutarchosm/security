import {
    HttpException,
    HttpStatus, Inject,
    Injectable,
    NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { AppConfigDto } from "@ploutos/application";
import { SecurityConfigDto } from "../dto/security-config.dto";
import { CsrfTokenService } from "../services/csrf-token.service";

@Injectable()
export class AppOriginGuardMiddleware implements NestMiddleware {
    constructor(
        private readonly csrfTokenService: CsrfTokenService,
        @Inject('APP_CONFIG') private readonly appConfig: AppConfigDto,
        @Inject('SECURITY_CONFIG') private readonly securityConfig: SecurityConfigDto,
    ) {}

    private isSwaggerRequest(req: Request): boolean {
        return req.path.startsWith(this.appConfig.swaggerPath);
    }

    private isValidOrigin(origin: string): boolean {
        return this.securityConfig.corsOrigins.includes(origin);
    }

    private isValidUserAgent(userAgent: string): boolean {
        const blockedClients = [
            'postman',
            'insomnia',
            'curl',
            'wget',
            'python-requests',
            'apache-httpclient',
        ];

        return !blockedClients.some(client =>
            userAgent.toLowerCase().includes(client.toLowerCase()),
        );
    }

    private isCsrfExemptPath(path: string): boolean {
        return this.securityConfig.csrfExemptPaths.some(exemptPath => path.startsWith(exemptPath));
    }

    private validateCsrfToken(req: Request): boolean {
        const csrfToken = req.headers['x-csrf-token'] as string;
        const userId = req.user.id; // Assuming you have user data from JWT authentication

        if (!csrfToken || !userId) {
            return false;
        }

        return this.csrfTokenService.validateToken(csrfToken, userId);
    }

    async use(req: Request, res: Response, next: NextFunction) {
        // Allow Swagger requests to pass through
        if (this.isSwaggerRequest(req)) {
            return next();
        }

        // Allow API requests to /api/v1 path
        if (req.path.startsWith('/api/v1')) {
            const origin = req.headers.origin;
            const userAgent = req.headers['user-agent'] || '';

            // In development, some headers might be missing or different,
            // Especially when testing with tools or in a local environment

            // Check if the origin exists and is valid
            if (origin && !this.isValidOrigin(origin)) {
                throw new HttpException(
                    'Invalid origin: ' + origin,
                    HttpStatus.FORBIDDEN,
                );
            }

            // For local development, we can relax the XMLHttpRequest requirement
            // Many development tools and tests may not set this header
            const xRequestedWith = req.headers['x-requested-with'];
            if (
                this.appConfig.environment === 'PRO' &&
                (!xRequestedWith || xRequestedWith !== 'XMLHttpRequest')
            ) {
                throw new HttpException(
                    'Invalid request type - missing or invalid X-Requested-With header',
                    HttpStatus.FORBIDDEN,
                );
            }

            // Validate user agent
            if (!this.isValidUserAgent(userAgent)) {
                throw new HttpException('Invalid client', HttpStatus.FORBIDDEN);
            }

            // Validate CSRF token for non-exempt paths
            // Only enforces in production; for development, make it optional
            if (
                this.appConfig.environment === 'PRO' &&
                !this.isCsrfExemptPath(req.path) &&
                !this.validateCsrfToken(req)
            ) {
                throw new HttpException(
                    'Invalid or missing CSRF token',
                    HttpStatus.FORBIDDEN,
                );
            }

            // Request passed all checks
            next();
        }
    }
}
