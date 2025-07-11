import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthorizedGuard, SECURITY_API_TOKEN_HEADER_KEY } from "@ploutos/common";
import { CsrfTokenService } from "../services/csrf-token.service";

@ApiTags('Error Logs')
@ApiSecurity(SECURITY_API_TOKEN_HEADER_KEY)
@UseGuards(AuthorizedGuard)
@Controller('security/csrf')
export class SecurityCsrfController {
    constructor(private csrfTokenService: CsrfTokenService) {}
    @Get('token')
    generateToken(@Req() req: Request) {
        const userId = req.user.id;
        const token = this.csrfTokenService.generateToken(userId);
        return { token };
    }
}
