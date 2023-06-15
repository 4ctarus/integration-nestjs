import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { Equal, FindOptionsWhere, In, Repository } from 'typeorm';
import { User } from '../user/user.types';
import { EmailEntity } from './email.entity';
import { EmailFiltersArgs, UserEmail } from './email.types';

@Resolver(() => UserEmail)
export class EmailResolver {
  constructor(
    private readonly _userService: UserService,
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,
  ) {}

  @Query(() => UserEmail, { name: 'email' })
  getEmail(@Args({ name: 'emailId', type: () => ID }) emailId: string) {
    return this.emailRepository.findOneBy({ id: Equal(emailId) });
  }

  @Query(() => [UserEmail], { name: 'emailsList' })
  async getEmails(@Args() filters: EmailFiltersArgs): Promise<UserEmail[]> {
    const where: FindOptionsWhere<EmailEntity>[] = [];

    if (filters.address) {
      if (filters.address.equal) {
        where.push({
          address: Equal(filters.address.equal),
        });
      }

      if (filters.address.in?.length > 0) {
        where.push({
          address: In(filters.address.in),
        });
      }
    }

    return this.emailRepository.find({
      where,
      order: { address: 'asc' },
    });
  }

  @ResolveField(() => User, { name: 'user' })
  async getUser(@Parent() parent: UserEmail): Promise<User> {
    return this._userService.getByEmailAddress(parent.address);
  }
}
