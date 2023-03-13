import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';


@Injectable()
export class SeedService {
  
  constructor (
    private readonly productsService: ProductsService
  ){}

  async seed() {
    await this.insertNewProducts();

    return `seed executed`;
  }

  private async insertNewProducts () {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    let insertPromises = [];
  
    products.forEach(product => {      
      insertPromises.push(this.productsService.create(product));
    })

    const results = await Promise.all(insertPromises);

    return results;
  }

}
