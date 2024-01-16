import {
  getIntroNameFromRecipient, getMailerRecipient,
  getNameFromRecipient, getOwnerNameFromAOParcel,
  isCompanyGivenAOParcel,
  isValidMailerGivenAOParcel,
} from '@/utils/mailer-utils';
import { mockAOParcel } from '@/__tests__/resources/mock-ao-parcels';
import { expect } from 'vitest';

describe('isValidMailerGivenAOParcel', () => {
  test('checks if mailer is valid when primary owner first name is missing in a person owner', () => {
    expect(isValidMailerGivenAOParcel({
      ...mockAOParcel,
      owner_group: 'Person',
      primary_owner_first_name: null,
    })).toBe(false);
  });

  test('checks if mailer is valid when primary owner last name is missing in a person owner', () => {
    expect(isValidMailerGivenAOParcel({
      ...mockAOParcel,
      owner_group: 'Person',
      primary_owner_last_name: null,
    })).toBe(false);
  });

  test('checks if mailer is valid when company as a primary owner does not have a company name', () => {
    expect(isValidMailerGivenAOParcel({
      ...mockAOParcel,
      owner_group: 'Company',
      company_name: null,
    })).toBe(false);
  });

  test('checks if mailer is valid when parcel does not have an owner group', () => {
    expect(isValidMailerGivenAOParcel({
      ...mockAOParcel,
      owner_group: null,
    })).toBe(false);
  });

  test('checks if mailer is valid when parcel has unknown owner group', () => {
    expect(isValidMailerGivenAOParcel({
      ...mockAOParcel,
      owner_group: 'ABCDEFG',
    })).toBe(false);
  });
});

describe('isCompanyGivenAOParcel', () => {
  test('checks if owner group of parcel is a company', () => {
    expect(isCompanyGivenAOParcel({
      ...mockAOParcel,
      owner_group: 'Company',
    })).toBe(true);
  });
});

describe('getMailerRecipient', () => {
  test('checks the recipient information for a person owner', () => {
    expect(getMailerRecipient({
      ...mockAOParcel,
      owner_group: 'Person',
      primary_owner_first_name: 'John',
      primary_owner_last_name: 'Doe',
    })).toEqual({
      type: 'person',
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  test('checks the recipient information for a company owner', () => {
    expect(getMailerRecipient({
      ...mockAOParcel,
      owner_group: 'Company',
      company_name: 'Parcel Company',
    })).toEqual({
      type: 'company',
      companyName: 'Parcel Company',
    });
  });

  test('checks the recipient information for an invalid owner', () => {
    expect(getMailerRecipient({
      ...mockAOParcel,
      owner_group: 'Person',
      primary_owner_first_name: null,
    })).toBe(null);
  });
});

describe('getNameFromRecipient', () => {
  test('checks if the recipient type is person and returns full name', () => {
    expect(getNameFromRecipient({
      type: 'person',
      firstName: 'John',
      lastName: 'Doe',
    })).toBe('John Doe');
  });

  test('checks if the recipient type is company and returns company name', () => {
    expect(getNameFromRecipient({
      type: 'company',
      companyName: 'Parcel Company',
    })).toBe('Parcel Company');
  });
});

describe('getIntroNameFromRecipient', () => {
  test('checks if the recipient type is person and returns first name as intro name', () => {
    expect(getIntroNameFromRecipient({
      type: 'person',
      firstName: 'John',
      lastName: 'Doe',
    })).toBe('John');
  });

  test('checks if the recipient type is company and returns company name as intro name', () => {
    expect(getIntroNameFromRecipient({
      type: 'company',
      companyName: 'Parcel Company',
    })).toBe('Parcel Company');
  });
});

describe('getOwnerNameFromAOParcel', () => {
  test('checks if the owner type is person and returns full name', () => {
    expect(getOwnerNameFromAOParcel({
      ...mockAOParcel,
      owner_group: 'Person',
      primary_owner_first_name: 'John',
      primary_owner_last_name: 'Doe',
    })).toBe('John Doe');
  });

  test('checks if the owner type is company and returns company name', () => {
    expect(getOwnerNameFromAOParcel({
      ...mockAOParcel,
      owner_group: 'Company',
      company_name: 'Parcel Company',
    })).toBe('Parcel Company');
  });

  test('checks if the owner is invalid and returns null', () => {
    expect(getOwnerNameFromAOParcel({
      ...mockAOParcel,
      owner_group: 'Person',
      primary_owner_first_name: 'John',
      primary_owner_last_name: null,
    })).toBe(null);
  });
});
