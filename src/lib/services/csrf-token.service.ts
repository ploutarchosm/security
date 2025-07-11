import * as crypto from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { SecurityConfigDto } from "../dto/security-config.dto";

@Injectable()
export class CsrfTokenService {
    constructor(
        @Inject('SECURITY_CONFIG') private readonly securityConfig: SecurityConfigDto,
    ) {}

    generateToken(userId: string): string {
        const timestamp = Date.now();
        const data = `${userId}-${timestamp}`;
        const hash = crypto
            .createHmac('sha256', this.securityConfig.csrfSecret)
            .update(data)
            .digest('hex');

        return `${hash}.${timestamp}`;
    }

    validateToken(token: string, userId: string): boolean {
        try {
            const [hash, timestamp] = token.split('.');
            const timestampNum = parseInt(timestamp, 10);

            // Check if token has expired
            if (Date.now() - timestampNum > this.securityConfig.csrfTokenExpiration) {
                return false;
            }

            // Regenerate hash for comparison
            const data = `${userId}-${timestamp}`;
            const expectedHash = crypto
                .createHmac('sha256', this.securityConfig.csrfSecret)
                .update(data)
                .digest('hex');

            return crypto.timingSafeEqual(
                Buffer.from(hash),
                Buffer.from(expectedHash),
            );
        } catch (error: unknown) {
            return false;
        }
    }
}
