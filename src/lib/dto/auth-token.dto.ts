import { ApiProperty } from '@nestjs/swagger';
import { EProvider, IAuthTokenAction, IAuthTokenState } from '@ploutos/common';
import { IsDefined, IsEnum, IsMongoId, IsOptional } from 'class-validator';

export class CreateAuthToken {
    @ApiProperty()
    @IsDefined()
    @IsEnum(IAuthTokenAction)
    action: IAuthTokenAction;

    @ApiProperty()
    @IsDefined()
    @IsEnum(EProvider)
    provider: EProvider;

    @ApiProperty()
    @IsDefined()
    @IsEnum(IAuthTokenState)
    status: IAuthTokenState;

    @ApiProperty()
    @IsOptional()
    @IsMongoId()
    userId?: string;

    @ApiProperty()
    @IsOptional()
    description?: string;
}
