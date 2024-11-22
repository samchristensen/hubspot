import type { Dataset, UpdatedAssociations, Association, InvalidAssociation } from './schemas.js';

/**
 * Validates duplicate contacts in the dataset.
 *
 * @param dataset - The dataset schema that contains the existing and new associations.
 * @returns The updated associations describing the valid and invalid associations.
 */
export function validateDuplicateContacts(dataset: Dataset): UpdatedAssociations {
  // inner function helps keep relevant code reusable but also encapsulated
  function getAssociationKey(association: Association): string {
    return `${association.companyId}-${association.contactId}-${association.role}`;
  }

  const invalidAssociations: InvalidAssociation[] = [];
  const requestedNewAssociations = new Map<string, Association[]>();
  const validAssociations: Association[] = [];

  const existingAssociations = new Set<string>(dataset.existingAssociations.map(getAssociationKey));

  // for each new association check if it already exists in the existing associations
  // if it does, add it to the invalid associations
  // if it doesn't, add it to the new associations
  for (const association of dataset.newAssociations) {
    if (existingAssociations.has(getAssociationKey(association))) {
      invalidAssociations.push({ ...association, failureReason: `ALREADY_EXISTS` });
    } else {
      const currentAssociations =
        requestedNewAssociations.get(getAssociationKey(association)) || [];
      requestedNewAssociations.set(getAssociationKey(association), [
        ...currentAssociations,
        association,
      ]);
    }
  }

  // for each new association check if there are any duplicates
  // if there are duplicates, add all of them to the invalid associations
  // if there are no duplicates, add all of them to the valid associations
  //
  // NOTE: the prompt does say this is not required, but adding it here feels like a good way to
  // ensure that the code is more robust and not prone to propogating issues that may come up in other systems.
  // Erring on the side of caution feels like a good idea here.
  for (const [, newAssociations] of requestedNewAssociations.entries()) {
    if (newAssociations.length > 1) {
      for (const association of newAssociations) {
        invalidAssociations.push({ ...association, failureReason: `ALREADY_EXISTS` });
      }
    } else {
      for (const association of newAssociations) {
        validAssociations.push(association);
      }
    }
  }

  return {
    validAssociations,
    invalidAssociations,
  };
}

/**
 * Validates the company role limits in the dataset.
 *
 * @param dataset - The dataset schema that contains the existing and new associations.
 * @param maxRolePerCompany - The maximum number of roles per company, defaults to 5.
 * @returns The updated associations describing the valid and invalid associations.
 */
export function validateCompanyRoleLimites(
  dataset: Dataset,
  maxRolePerCompany: number = 5,
): UpdatedAssociations {
  // inner function helps keep relevant code reusable but also encapsulated
  function getCompanyRoleKey(association: Association): string {
    return `${association.companyId}-${association.role}`;
  }

  const existingCompanyRoles = new Map<string, number>();
  const newCompanyAssociations = new Map<string, Association[]>();

  const invalidAssociations: InvalidAssociation[] = [];
  const validAssociations: Association[] = [];

  for (const association of dataset.existingAssociations) {
    const currentRoleCount = existingCompanyRoles.get(getCompanyRoleKey(association)) || 0;
    existingCompanyRoles.set(getCompanyRoleKey(association), currentRoleCount + 1);
  }

  for (const association of dataset.newAssociations) {
    const currentAssociations = newCompanyAssociations.get(getCompanyRoleKey(association)) || [];
    newCompanyAssociations.set(getCompanyRoleKey(association), [
      ...currentAssociations,
      association,
    ]);
  }

  for (const [companyRoleKey, roleCount] of newCompanyAssociations.entries()) {
    const existingRoleCount = existingCompanyRoles.get(companyRoleKey) || 0;

    // if the new role count plus the existing role count is greater than the max role per company
    // or if the new role count is greater than or equal to the max role per company then we mark
    // all of the associations as invalid
    if (
      roleCount.length + existingRoleCount > maxRolePerCompany ||
      roleCount.length > maxRolePerCompany
    ) {
      for (const association of roleCount) {
        invalidAssociations.push({ ...association, failureReason: `WOULD_EXCEED_LIMIT` });
      }
    } else {
      for (const association of roleCount) {
        validAssociations.push(association);
      }
    }
  }

  return {
    validAssociations,
    invalidAssociations,
  };
}

/**
 * Validates the contact role limits in the dataset.
 *
 * @param dataset - The dataset schema that contains the existing and new associations.
 * @param maxRolePerContact - The maximum number of roles per contact, defaults to 2.
 * @returns The updated associations describing the valid and invalid associations.
 */
export function validateContactRoleLimits(
  dataset: Dataset,
  maxRolePerContact: number = 2,
): UpdatedAssociations {
  // inner function helps keep relevant code reusable but also encapsulated
  function getContactCompanyIdKey(association: Association): string {
    return `${association.contactId}-${association.companyId}`;
  }

  const currentContactCompanyRoles = new Map<string, number>();
  const newContactCompanyAssociations = new Map<string, Association[]>();

  const invalidAssociations: InvalidAssociation[] = [];
  const validAssociations: Association[] = [];

  for (const association of dataset.existingAssociations) {
    const currentRoleCount =
      currentContactCompanyRoles.get(getContactCompanyIdKey(association)) || 0;
    currentContactCompanyRoles.set(getContactCompanyIdKey(association), currentRoleCount + 1);
  }

  for (const association of dataset.newAssociations) {
    const currentAssociations =
      newContactCompanyAssociations.get(getContactCompanyIdKey(association)) || [];
    newContactCompanyAssociations.set(getContactCompanyIdKey(association), [
      ...currentAssociations,
      association,
    ]);
  }

  for (const [contactCompanyIdKey, roleCount] of newContactCompanyAssociations.entries()) {
    const existingRoleCount = currentContactCompanyRoles.get(contactCompanyIdKey) || 0;

    // if the new role count plus the existing role count is greater than the max role per contact
    // or if the new role count is greater than or equal to the max role per contact then we mark
    // all of the associations as invalid
    if (
      roleCount.length + existingRoleCount > maxRolePerContact ||
      roleCount.length > maxRolePerContact
    ) {
      for (const association of roleCount) {
        invalidAssociations.push({ ...association, failureReason: `WOULD_EXCEED_LIMIT` });
      }
    } else {
      for (const association of roleCount) {
        validAssociations.push(association);
      }
    }
  }

  return {
    validAssociations,
    invalidAssociations,
  };
}

/**
 * Validates the dataset against all of the different rules and limits that must be followed.
 *
 * @param datasetSchema - The dataset schema that contains the existing and new associations.
 * @returns The updated associations describing the valid and invalid associations.
 */
export function validateDataset(datasetSchema: Dataset): UpdatedAssociations {
  const duplicateContactValidation = validateDuplicateContacts(datasetSchema);

  const companyRoleLimitValidation = validateCompanyRoleLimites({
    existingAssociations: datasetSchema.existingAssociations,
    newAssociations: duplicateContactValidation.validAssociations,
  });

  const contactRoleLimitValidation = validateContactRoleLimits({
    existingAssociations: datasetSchema.existingAssociations,
    newAssociations: companyRoleLimitValidation.validAssociations,
  });

  return {
    validAssociations: contactRoleLimitValidation.validAssociations,
    invalidAssociations: [
      ...duplicateContactValidation.invalidAssociations,
      ...companyRoleLimitValidation.invalidAssociations,
      ...contactRoleLimitValidation.invalidAssociations,
    ],
  };
}
