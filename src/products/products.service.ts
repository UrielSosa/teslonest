import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID} from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');
  
  constructor (
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){}

  async create(createProductDto: CreateProductDto) {
    
    if( createProductDto.tags ) {
      createProductDto.tags.forEach((tag, i) => {
        createProductDto.tags[i] = tag.toLowerCase()
      });
    }

    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save( product );
      return product;

    } catch (e){
      this.handleDBExceptios(e);
    }

  }

  async findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0 } = paginationDto;

    return await this.productRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(term: string) {
    let product: Product;

    if ( isUUID(term) ) {
      product = await this.productRepository.findOneBy({id: term});
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        }).getOne();
    }
    
    if( !product ) throw new BadRequestException(`Product with id ${term} Not Found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto
    });

    if( !product ) throw new NotFoundException(`Product with id ${id} Not Found`);

    try {
      await this.productRepository.save( product );
      return product;
    } catch (e) {
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

  /* 
    @Example(array to lowercase)
    .toArrayLowerCase()
    this.element.map(e => e.toLowerCase())
  */
}