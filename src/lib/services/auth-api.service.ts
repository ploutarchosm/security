import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthApi } from "../schema/auth-api.schema";
import { CreateAuthApi } from "../dto/auth-api.dto";

@Injectable()
export class AuthApiService {
    constructor(
        @InjectModel(AuthApi.name) private authApiModel: Model<AuthApi>,
    ) {}

    async create(authApi: CreateAuthApi) {
        return new this.authApiModel(authApi).save();
    }

    async delete(token: string) {
        return await this.authApiModel.deleteOne({ value: token }).exec();
    }

    async getByValue(value: string) {
        return this.authApiModel.findOne({ value: value });
    }
}
