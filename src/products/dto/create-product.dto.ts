import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @ApiProperty({
        type: 'string',
        description: 'Product title',
        nullable: false,
        minLength: 2,
        uniqueItems: true
    })
    @MinLength(2)
    title: string;

    @ApiProperty({
        type: 'number',
        description: 'Product price',
        nullable: true,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty({
        type: 'string',
        description: 'Product description',
        nullable: true,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        type: 'string',
        description: 'Product slug',
        nullable: true,
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({
        type: 'number',
        description: 'Product stock',
        nullable: true,
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({
        type: [String],
        description: 'Product sizes',
        nullable: true,
    })
    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @ApiProperty({
        type: [String],
        description: 'Product gender',
        nullable: false,
    })
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @ApiProperty({
        type: 'array',
        description: 'Product tag',
        nullable: true,
    })
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiProperty({
        type: 'array',
        description: 'Product images',
        nullable: true,
    })
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images?: string[];
}
