import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthToken } from "../schema/auth-token.schema";
import { AuthApi } from "../schema/auth-api.schema";
import { IAuthTokenState, MonitoringParams } from '@ploutos/common';
import { CreateAuthToken } from "../dto/auth-token.dto";

@Injectable()
export class AuthTokenService {
    constructor(
        @InjectModel(AuthToken.name) private authTokenModel: Model<AuthToken>,
        @InjectModel(AuthApi.name) private authApiModel: Model<AuthApi>,
    ) {}

    async list(skip: number, take: number, filters?: MonitoringParams) {
        const query: any = {};

        // Apply filters
        if (filters) {
            if (filters.action) {
                query.action = filters.action;
            }
            if (filters.provider) {
                query.provider = filters.provider;
            }
            if (filters.status) {
                query.status = filters.status;
            }
            if (filters.description) {
                query.description = { $regex: filters.description, $options: 'i' }; // Case-insensitive search
            }
        }

        const data = await this.authTokenModel
            .find(query)
            .skip(skip)
            .limit(take)
            .sort({ created_at: -1 })
            .exec();

        const count = await this.authTokenModel.countDocuments(query);

        return { data, count };
    }

    async create(authToken: CreateAuthToken) {
        return new this.authTokenModel(authToken).save();
    }

    async get(id: string) {
        return await this.authTokenModel.findById({ _id: id }).exec();
    }

    async updateStatus(id: string, status: IAuthTokenState) {
        return await this.authTokenModel
            .updateOne({ _id: id }, { status: status }, { upsert: false, new: true })
            .exec();
    }

    async updateUserId(id: string, userId: string) {
        return await this.authTokenModel
            .updateOne({ _id: id }, { userId: userId }, { upsert: false, new: true })
            .exec();
    }

    async deleteMany(ids: string[]) {
        try {
            // Convert string IDs to MongoDB ObjectIds
            const objectIds = ids.map(id => new Types.ObjectId(id));

            // Use deleteMany with $in operator to match any document
            // whose _id is in the provided array
            const result = await this.authTokenModel.deleteMany({
                _id: { $in: objectIds },
            });

            return {
                success: true,
                deletedCount: result.deletedCount,
                acknowledged: result.acknowledged,
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to delete documents: ${error.message}`);
            }
            // For unknown error types
            throw new Error('Failed to delete documents: Unknown error');
        }
    }

    async updateDescription(id: string, description: string) {
        return await this.authTokenModel
            .updateOne(
                { _id: id },
                { description: description },
                { upsert: false, new: true },
            )
            .exec();
    }

    async update(authToken: AuthToken) {
        return await this.authTokenModel
            .updateOne(
                { _id: authToken._id },
                {
                    status: authToken.status,
                    action: authToken.action,
                    userId: authToken.userId,
                    provider: authToken.provider,
                    description: authToken.description,
                },
                { upsert: true, new: true },
            )
            .exec();
    }

    async purge() {
        const tokenPurge = await this.authTokenModel.deleteMany({});
        const apiPurge = await this.authApiModel.deleteMany({});
        return {
            deletedCountToken: tokenPurge.deletedCount,
            deletedCountApi: apiPurge.deletedCount,
        };
    }

    async failWith(
        authToken: AuthToken,
        errorMessage: string,
        userEmail?: string,
    ) {
        authToken.status = IAuthTokenState.Failed;
        authToken.description = errorMessage;
        if (userEmail) {
            authToken.userId = userEmail;
        }
        await this.update(authToken);
        throw new BadRequestException(errorMessage);
    }

    async securityCheckForToken(tokenId: string) {
        const authToken = await this.get(tokenId);

        if (!authToken || authToken.status === IAuthTokenState.Failed) {
            await this.failWith(authToken, 'Security check for token failed.');
        }

        return authToken;
    }
}
