import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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
        enum: AuthTokenAction,
    })
    action: AuthTokenAction;

    @Prop({
        type: String,
        required: true,
        enum: ProviderType,
    })
    provider: ProviderType;

    @Prop({
        type: String,
        required: true,
        enum: AuthTokenState,
        default: AuthTokenState.Pending,
    })
    status: AuthTokenState;

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
