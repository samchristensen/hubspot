import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  address: z.object({
    street: z.string(),
    suite: z.string(),
    city: z.string(),
    zipcode: z.string(),
  }),
  phone: z.string(),
  website: z.string(),
  company: z.object({
    name: z.string(),
    catchPhrase: z.string(),
    bs: z.string(),
  }),
});

export type User = z.infer<typeof UserSchema>;

export const AssociationsSchema = z.object({
  companyId: z.number(),
  contactId: z.number(),
  role: z.string(),
});

export type Association = z.infer<typeof AssociationsSchema>;

export const InvalidAssociationsSchema = AssociationsSchema.extend({
  failureReason: z.enum([`ALREADY_EXISTS`, `WOULD_EXCEED_LIMIT`]),
});

export type InvalidAssociation = z.infer<typeof InvalidAssociationsSchema>;

export const DatasetSchema = z.object({
  existingAssociations: z.array(AssociationsSchema),
  newAssociations: z.array(AssociationsSchema),
});

export type Dataset = z.infer<typeof DatasetSchema>;

export const UpdatedAssociationsSchema = z.object({
  validAssociations: z.array(AssociationsSchema),
  invalidAssociations: z.array(InvalidAssociationsSchema),
});

export type UpdatedAssociations = z.infer<typeof UpdatedAssociationsSchema>;
