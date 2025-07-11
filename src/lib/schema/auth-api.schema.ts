import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({
    collection: 'auth_apis',
    timestamps: true,
    versionKey: false,
})
export class AuthApi extends Document {
    @Prop({
        type: SchemaTypes.ObjectId,
        ref: 'users',
        required: true,
    })
    userId: string;

    @Prop({
        type: String,
        required: true,
    })
    value: string;

    @Prop({
        type: Date,
    })
    expired_at: string;
}

export const AuthApiSchema = SchemaFactory.createForClass(AuthApi);
