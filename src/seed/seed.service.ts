import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';



@Injectable()
export class SeedService {
  
  constructor (
    private readonly productsService: ProductsService,

    @InjectRepository( User )
    private readonly userRepository: Repository<User>
  ){}

  async seed() {

    await this.deleteTables();

    const adminUser = await this.insertNewUsers();

    await this.insertNewProducts(adminUser);

    return `seed executed`;
  }

  private async insertNewProducts (user: User) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    let insertPromises = [];
  
    products.forEach(product => {      
      insertPromises.push(this.productsService.create( product, user ));
    })

    const results = await Promise.all(insertPromises);

    return results;
  }

  private async insertNewUsers () {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach( user => {
      users.push(this.userRepository.create({ 
        ...user, 
        password: bcrypt.hashSync(user.password, 10) 
      }));
    });

    await this.userRepository.save( users );

    return users[0];

  }

  private async deleteTables () {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()
  }

}
