import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isUUID} from 'uuid';
import { DataSource, Repository } from 'typeorm';

import { Product, ProductImage } from './entities';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');
  
  constructor (
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource

  ){}

  async create(createProductDto: CreateProductDto, user: User) {
    
    if( createProductDto.tags ) {
      createProductDto.tags.forEach((tag, i) => {
        createProductDto.tags[i] = tag.toLowerCase()
      });
    }

    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({url: image })),
        user
      });

      await this.productRepository.save( product );
      
      return { ...product, images };

    } catch (e){
      this.handleDBExceptios(e);
    }

  }

  async findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map(product => ({
      ...product, 
      images: product.images.map(img => img.url)
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if ( isUUID(term) ) {
      product = await this.productRepository.findOneBy({id: term});
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }
    
    if( !product ) throw new BadRequestException(`Product with id ${term} Not Found`);

    return product;
  }

  async findOnePlain ( term: string ) {
    const { images = [], ...rest } = await this.findOne( term );

    return {
      ...rest,
      images: images.map(img => img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if( !product ) throw new NotFoundException(`Product with id ${id} Not Found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if ( images ) {
        await queryRunner.manager.delete( ProductImage, {product: { id } });
      }

      product.images = images.map(img => this.productImageRepository.create({ url: img }));
      product.user = user;

      await queryRunner.manager.save( product );      
      // await this.productRepository.save( product );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain( id );
    } catch (e) {

      await queryRunner.rollbackTransaction()
      await queryRunner.release();

      this.handleDBExceptios(e);
    }

  }

  async remove(id: string) {
    const product = await this.findOne( id );

    await this.productRepository.remove( product );
  }

  private handleDBExceptios (e: any) {
    if (e.code == '23505') throw new BadRequestException(e.detail);
    
    this.logger.error(e);
    throw new InternalServerErrorException('Unexpected error, check server logs!');
  }
  
  async deleteAllProducts () {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute()
    } catch (e) {
      this.handleDBExceptios(e);
    }

  }

  /* 
    @Example(array to lowercase)
    .toArrayLowerCase()
    this.element.map(e => e.toLowerCase())
  */
}