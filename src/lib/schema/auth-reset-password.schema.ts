import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({
    collection: 'auth_reset_password',
    timestamps: true,
    versionKey: false,
})
export class AuthResetPassword extends Document {
    @Prop({
        type: SchemaTypes.ObjectId,
        ref: 'users',
        required: true,
    })
    userId: string;

    @Prop({
        type: SchemaTypes.ObjectId,
        ref: 'auth_tokens',
        required: true,
    })
    authTokenId: string;

    @Prop({
        type: String,
        required: true,
    })
    token: string;

    @Prop({
        type: Date,
    })
    expired_at: string;
}

export const AuthResetPasswordSchema =
    SchemaFactory.createForClass(AuthResetPassword);
