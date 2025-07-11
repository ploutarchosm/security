import { AuthToken } from "../schema/auth-token.schema";
import { BadRequestException } from "@nestjs/common";
import { EProvider, IAuthTokenAction } from "@ploutos/common";
import { Provider } from "@ploutos/admin";


export class BasedAuthService {
    async iniProvider(
        provider: Provider,
        token: AuthToken,
        action: IAuthTokenAction,
    ) {
        switch (provider.provider) {
            case EProvider.Local: {
                return {
                    id: token._id.toString(),
                    status: token.status,
                    next: {
                        method: 'POST',
                        path: `/security/${action}/local/check/${token._id.toString()}`,
                        params: ['email', 'password'],
                    },
                };
            }
            // case ProviderType.Google: {
            //     return this.authGoogleService.initiate(token);
            // }
            // case ProviderType.Github: {
            //     const url = await this.githubAuthService.generateAuthUrl(
            //         token._id.toString(),
            //     );
            //
            //     return {
            //         id: token._id.toString(),
            //         status: token.status,
            //         expiresOn: token.expired_at,
            //         next: {
            //             method: 'GET',
            //             path: url,
            //         },
            //     };
            // }
            // case ProviderType.Microsoft: {
            //     const url = await this.microsoftAuthService.generateAuthUrl(
            //         token._id.toString(),
            //     );
            //     return {
            //         id: token._id.toString(),
            //         status: token.status,
            //         expiresOn: token.expired_at,
            //         next: {
            //             method: 'GET',
            //             path: url,
            //         },
            //     };
            // }
            default: {
                throw new BadRequestException(
                    `Default, Provider ${provider} not found.`,
                );
            }
        }
    }
}
