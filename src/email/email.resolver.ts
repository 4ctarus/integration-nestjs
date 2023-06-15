import { NotFoundException } from '@nestjs/common';
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, FindOptionsWhere, In, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/user.types';
import { EmailEntity } from './email.entity';
import { EmailAddress, EmailId } from './email.interfaces';
import {
  AddEmail,
  EmailAddressArgs,
  EmailFiltersArgs,
  UserEmail,
} from './email.types';

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

  @Mutation(() => ID)
  async addEmail(@Args() email: AddEmail): Promise<EmailId> {
    const userExists = await this._userService.get(email.userId);
    if (!userExists) {
      throw new NotFoundException(`L'utilisateur n'a pas été trouvé`);
    }

    const addedEmail = await this.emailRepository.insert(email);
    const emailId = addedEmail.identifiers[0].id;

    return emailId;
  }

  @Mutation(() => ID)
  async deactivateUser(
    @Args() { address }: EmailAddressArgs,
  ): Promise<EmailAddress> {
    const emailExists = await this.emailRepository.exist({
      where: { address: Equal(address) },
    });
    if (!emailExists) {
      throw new NotFoundException(`L'email n'a pas été trouvé`);
    }

    await this.emailRepository.delete({ address: Equal(address) });

    return address;
  }

  @ResolveField(() => User, { name: 'user' })
  async getUser(@Parent() parent: UserEmail): Promise<User> {
    return this._userService.getByEmailAddress(parent.address);
  }
}
