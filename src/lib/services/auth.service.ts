import { BasedAuthService } from "./based-auth.service";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { AuthTokenService } from "./auth-token.service";
import { AuthApiService } from "./auth-api.service";
import {
    EProvider,
    IAuthTokenAction,
    IAuthTokenState,
    INJECTION_TOKENS,
    NUserLocalClaim,
    PasswordService,
    uuidV4
} from "@ploutos/common";
import { ProviderService, UserService } from "@ploutos/admin";
import { isEmpty } from "lodash";
import { AuthToken } from "../schema/auth-token.schema";
import { LoginDto } from "../dto/login.dto";
import dayjs from "dayjs";

@Injectable()
export class AuthService extends BasedAuthService {
    constructor(
        private readonly authTokenService: AuthTokenService,
        private readonly apiTokenService: AuthApiService,
        private readonly passwordService: PasswordService,
        @Inject(INJECTION_TOKENS.PROVIDER_SERVICE)
        private readonly providerService: ProviderService,
        @Inject(INJECTION_TOKENS.USER_SERVICE)
        private readonly userService: UserService,
    ) {
        super();
    }

    /**
     * Initial login with local provider
     * @param provider
     */
    async initiateLogin(provider: EProvider) {
        const getProvider = await this.providerService.find(provider);

        // check if the provider is also enabled.

        if (isEmpty(getProvider) || !getProvider.isActive) {
            throw new BadRequestException(
                `Provider ${provider} not found or is not active.`,
            );
        }

        const getToken = await this.authTokenService.create({
            status: IAuthTokenState.Pending,
            action: IAuthTokenAction.Login,
            userId: null,
            provider: provider,
            description: null,
        });

        return this.iniProvider(getProvider, getToken, IAuthTokenAction.Auth);
    }

    async login(data: LoginDto, authTokenId: string) {
        // secure here with something before authToken
        const authToken = await this.securityCheckForToken(authTokenId);

        // check if the token is expired
        if (!authToken || dayjs().isAfter(authToken.expired_at)) {
            return await this.failWith(
                authToken,
                'Authentication token expired or dose not exist.',
            );
        }

        const user = await this.userService.getUserByEmail(data.email);

        if (!user) {
            return await this.failWith(
                authToken,
                `User with email address ${data.email} not found.`,
            );
        }

        if (!user.active) {
            return await this.failWith(
                authToken,
                `User with email address ${data.email} is not active.`,
            );
        }

        if (!user.hasPassword) {
            await this.authTokenService.failWith(
                authToken,
                `User with email address ${data.email} does not have password.`,
            );
        }

        if (!(await this.passwordService.compare(data.password, user.password))) {
            const attemptsCount = await this.incrementLoginAttempts(user.id);
            if (attemptsCount >= 5) {
                await this.userService.deactivate(user.id);
                await this.failWith(
                    authToken,
                    `User with email address ${data.email} has locked. Please contact administrator.`,
                );
            }
            return await this.failWith(
                authToken,
                `User with email address ${data.email}  wrong password.`,
            );
        }

        await this.resetLoginAttempts(user._id as string);
        authToken.is2faEnabled = user.isTwoFactorEnable;
        authToken.userId = user._id as string;
        authToken.status = user.isTwoFactorEnable
            ? IAuthTokenState.Pending
            : IAuthTokenState.Success;
        authToken.description = null;
        await this.authTokenService.update(authToken);
        return authToken;
    }

    /**
     * Exchange a success token id with api token
     * @param tokenId
     */
    async api(tokenId: string) {
        const authToken = await this.securityCheckForToken(tokenId);

        if (!dayjs().isBefore(authToken.expired_at)) {
            throw new BadRequestException('Authentication token expired.');
        }

        authToken.status = IAuthTokenState.Success;
        await this.authTokenService.update(authToken);

        return this.apiTokenService.create({
            userId: authToken.userId,
            value:
                `${uuidV4()}${uuidV4()}${uuidV4()}${uuidV4()}`.replace(
                    new RegExp('-', 'g'),
                    '',
                ),
            expired_at: dayjs().add(1, 'd').format(),
        });
    }


    /**
     * Check token if is correct and it's not exchange.
     * @param tokenId
     */
    async securityCheckForToken(tokenId: string) {
        const authToken = await this.authTokenService.get(tokenId);

        if (!authToken || authToken.status === IAuthTokenState.Failed) {
            await this.failWith(
                authToken,
                'Authentication token is wrong or if already exchange as Failed.',
            );
        }

        return authToken;
    }

    /**
     * Fail a login token message and status
     * @param authToken
     * @param errorMessage
     */
    async failWith(authToken: AuthToken, errorMessage: string) {
        authToken.status = IAuthTokenState.Failed;
        authToken.description = errorMessage;
        await this.authTokenService.update(authToken);
        throw new BadRequestException(errorMessage);
    }

    /**
     * Increase user login attempts
     * @param userId
     */
    async incrementLoginAttempts(userId: string) {
        const loginAttempts = await this.userService.getClaim(
            userId,
            NUserLocalClaim.LoginAttemptsCount,
        );
        const loginAttemptsNew =
            loginAttempts[NUserLocalClaim.LoginAttemptsCount] + 1;

        await this.userService.setClaim(
            userId,
            NUserLocalClaim.LoginAttemptsCount,
            loginAttemptsNew.toString(),
        );

        return loginAttemptsNew;
    }

    /**
     * Reset user login attempts
     * @param userId
     */
    async resetLoginAttempts(userId: string) {
        await this.userService.setClaim(
            userId,
            NUserLocalClaim.LoginAttemptsCount,
            '0',
        );
        await this.userService.activate(userId);
    }
}
