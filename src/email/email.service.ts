import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EmailAddress,
  EmailId,
  IAddEmail,
  IEmail,
} from 'src/email/email.interfaces';
import { Equal, FindOptionsWhere, Repository } from 'typeorm';
import { EmailEntity } from './email.entity';
import { UserEntity } from '../user/user.entity';
import { IUser, UserId } from '../user/user.interfaces';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,
  ) {}

  async add(email: IAddEmail, userId: UserId) {
    const userExists = await this.userRepository.exist({
      where: {
        id: Equal(userId),
      },
    });
    if (!userExists) {
      throw new NotFoundException(`L'utilisateur n'a pas été trouvé`);
    }

    const addedEmail = await this.emailRepository.insert(email);
    const emailId = addedEmail.identifiers[0].id;

    return emailId;
  }

  async deactivate(address: EmailAddress) {
    const emailExists = await this.emailRepository.exist({
      where: { address: Equal(address) },
    });
    if (!emailExists) {
      throw new NotFoundException(`L'email n'a pas été trouvé`);
    }

    await this.emailRepository.delete({ address: Equal(address) });

    return address;
  }

  get(id: EmailId): Promise<IEmail> {
    return this.emailRepository.findOneBy({ id: Equal(id) });
  }

  find(where: FindOptionsWhere<EmailEntity>[]) {
    return this.emailRepository.find({
      where,
      order: { address: 'asc' },
    });
  }

  getEmailUser(address: EmailAddress): Promise<IUser> {
    return this.userRepository.findOneBy({
      emails: {
        address: Equal(address),
      },
    });
  }
}
