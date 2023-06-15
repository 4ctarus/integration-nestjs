import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Maybe } from 'graphql/jsutils/Maybe';
import { IAddEmail, IEmail, IEmailFilters } from './email.interfaces';

@ObjectType()
export class UserEmail implements IEmail {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  address: string;

  userId: string;
}

@InputType()
@ArgsType()
export class AddEmail implements IAddEmail {
  @IsNotEmpty({ message: `L'adresse email doit être définie` })
  @IsEmail(undefined, { message: `L'adresse email définie n'est pas conforme` })
  @Field(() => String)
  address: string;

  @IsUUID('all', {
    message: `L'identifiant de l'utilisateur doit être un UUID`,
  })
  @IsNotEmpty({ message: `L'identifiant de l'utilisateur doit être défini` })
  @Field(() => String)
  userId: string;
}

@ArgsType()
export class EmailAddressArgs {
  @IsNotEmpty({ message: `L'adresse email doit être définie` })
  @IsEmail(undefined, { message: `L'adresse email définie n'est pas conforme` })
  @Field(() => String)
  address: string;
}

@InputType()
export class StringFilters {
  @IsOptional()
  @Field(() => String, { nullable: true })
  equal: Maybe<string>;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  in: Maybe<string[]>;
}

@ArgsType()
export class EmailFiltersArgs implements IEmailFilters {
  @IsOptional()
  @Field(() => StringFilters, { nullable: true })
  address?: Maybe<StringFilters>;
}
