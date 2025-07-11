import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EProvider, IAuthTokenAction, IAuthTokenState } from '@ploutos/common';
import { Document, SchemaTypes } from 'mongoose';

@Schema({
    collection: 'auth_tokens',
    timestamps: true,
    versionKey: false,
})
export class AuthToken extends Document {
    @Prop({
        type: String,
        required: true,
        enum: IAuthTokenAction,
    })
    action: IAuthTokenAction;

    @Prop({
        type: String,
        required: true,
        enum: EProvider,
    })
    provider: EProvider;

    @Prop({
        type: String,
        required: true,
        enum: IAuthTokenState,
        default: IAuthTokenState.Pending,
    })
    status: IAuthTokenState;

    @Prop({
        type: SchemaTypes.ObjectId,
        ref: 'users',
        required: false,
    })
    userId?: string;

    @Prop({
        type: String,
    })
    description: string;

    @Prop({
        type: Date,
    })
    expired_at: string;

    @Prop({
        type: Boolean,
    })
    is2faEnabled: boolean;

    @Prop({ type: Date })
    created_at: Date;

    @Prop({ type: Date })
    updated_at: Date;
}

export const AuthTokenSchema = SchemaFactory.createForClass(AuthToken);
