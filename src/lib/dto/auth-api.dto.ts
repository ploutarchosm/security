import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsDefined, IsMongoId, IsString } from 'class-validator';

export class CreateAuthApi {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    userId: string;

    @ApiProperty()
    @IsDefined()
    @IsString()
    value: string;

    @ApiProperty()
    @IsDefined()
    @IsDate()
    expired_at: string;
}
