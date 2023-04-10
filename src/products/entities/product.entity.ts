import { User } from "src/auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './product-image.entity';
import { ApiProperty } from "@nestjs/swagger";

@Entity({
    name: 'products'
})
export class Product {

    @ApiProperty({
        type: 'string',
        example: '63033dce-cc1b-4f1a-b7b0-df5592e5bbf4',
        description: 'Id of product',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        type: 'string',
        example: 'Remera tesloshop',
        description: 'Title of product',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty({
        type: 'number',
        example: 120.20,
        description: 'Price of product',
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        type: 'string',
        example: 'Remera tesloshop con detalles',
        description: 'Description of product',
        default: null,
        nullable: true
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        type: 'string',
        example: 'men_3d_small_wordmark_tee',
        description: 'slug of product',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        type: 'number',
        example: 140,
        description: 'stock of product',
    })
    @Column({
        type: 'int',
        default: 0
    })
    stock: number;

    @ApiProperty({
        type: [String],
        example: ['S', 'M', 'XXL', 'L'],
        description: 'Sizes of product',
        uniqueItems: true
    })
    @Column({
        type: 'text',
        array: true
    })
    sizes: string[];

    @ApiProperty({
        type: 'string',
        example: 'men',
        description: 'gender of product',
    })
    @Column({
        type: 'text'
    })
    gender: string;

    @ApiProperty({
        type: [String],
        example: ['men', 't-shirt', 'astetic'],
        description: 'tags of product'
    })
    @Column({
        type: 'text',
        array: true,
        default: []
    })
    tags: string[];

    /* Relaciones */
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true}
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User

    /* Validadores y transformadores */
    @BeforeInsert()
    checkSlugInsert () {
        
        if (!this.slug) {
            this.slug = this.title;
        }
        
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlugUpdate () {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }
}
