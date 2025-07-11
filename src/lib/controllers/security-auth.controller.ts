import { Controller, Param, Get, Post, Body, ValidationPipe } from "@nestjs/common";
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CleanObjectIdPipe, EProvider, ValidateEmptyObjectPipe } from "@ploutos/common";
import { AuthService } from "../services/auth.service";
import { LoginDto } from "../dto/login.dto";

@ApiTags('Authentication')
@Controller('security')
export class SecurityAuthController {
    constructor(private authService: AuthService) {}

    @Get('auth/:provider')
    @ApiOperation({ summary: 'Request authentication payload by provider' })
    async loginProvider(@Param('provider') provider: EProvider) {
        return this.authService.initiateLogin(provider);
    }

    @Post('auth/local/check/:token')
    @ApiOperation({ summary: 'The callback endpoint for Local authentication' })
    async loginToken(
        @Body(
            new ValidationPipe({
                skipMissingProperties: true,
                whitelist: true,
            }),
            ValidateEmptyObjectPipe,
            CleanObjectIdPipe,
        )
        body: LoginDto,
        @Param('token') token: string,
    ) {
        return await this.authService.login(body, token);
    }

    @Post('auth/token/:token')
    @ApiOperation({ summary: 'Get the authentication token after validation' })
    async loginApi(@Param('token') token: string) {
        return this.authService.api(token);
    }
}
