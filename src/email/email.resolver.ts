import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Equal, FindOptionsWhere, In } from 'typeorm';
import { User } from '../user/user.types';
import { EmailEntity } from './email.entity';
import { EmailAddress, EmailId } from './email.interfaces';
import { EmailService } from './email.service';
import {
  AddEmail,
  EmailAddressArgs,
  EmailFiltersArgs,
  UserEmail,
} from './email.types';

@Resolver(() => UserEmail)
export class EmailResolver {
  constructor(private readonly _service: EmailService) {}

  @Query(() => UserEmail, { name: 'email' })
  getEmail(@Args({ name: 'emailId', type: () => ID }) emailId: string) {
    return this._service.get(emailId);
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

    return this._service.find(where);
  }

  @Mutation(() => ID)
  async addEmail(@Args() email: AddEmail): Promise<EmailId> {
    return this._service.add(email, email.userId);
  }

  @Mutation(() => ID)
  async deactivateUser(
    @Args() { address }: EmailAddressArgs,
  ): Promise<EmailAddress> {
    return this._service.deactivate(address);
  }

  @ResolveField(() => User, { name: 'user' })
  async getUser(@Parent() parent: UserEmail): Promise<User> {
    return this._service.getEmailUser(parent.address);
  }
}
