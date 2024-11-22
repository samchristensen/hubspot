import axios from 'axios';
import { Dataset, DatasetSchema, UpdatedAssociations } from './schemas.js';

export const USER_KEY = 'b1bb985e60a5fbf38e1f16a39146';

export const BASE_URL = 'https://candidate.hubteam.com/candidateTest/v3/problem';

export const EXISTING_CONTACTS_URL = `${BASE_URL}/dataset?userKey=${USER_KEY}`;

export const CONTACTS_RESULTS_URL = `${BASE_URL}/result?userKey=${USER_KEY}`;

export const TEST_EXISTING_CONTACTS_URL = `${BASE_URL}/test-dataset?userKey=${USER_KEY}`;

export const TEST_CONTACTS_RESULTS_URL = `${BASE_URL}/test-result?userKey=${USER_KEY}`;

export const TEST_CONTACTS_RESULTS_ANSWER_URL = `${BASE_URL}/test-dataset-answer?userKey=${USER_KEY}`;

export async function getExistingContacts(test: boolean = false): Promise<Dataset> {
  const url = test ? TEST_EXISTING_CONTACTS_URL : EXISTING_CONTACTS_URL;
  console.log(`Fetching dataset from ${url}`);

  const response = await axios.get(url);
  if (response.status !== 200) {
    console.error(`Failed to fetch existing contacts: ${response.statusText}`);
    throw new Error(`Failed to fetch existing contacts: ${response.statusText}`);
  }

  const dataset = DatasetSchema.safeParse(response.data);
  if (!dataset.success) {
    console.error(`Failed to parse existing contacts: ${dataset.error.message}`);
    throw new Error(`Failed to parse existing contacts: ${dataset.error.message}`);
  }

  console.log(`Successfully fetched dataset from ${url}`);
  return dataset.data;
}

export async function postContactValidationResults(
  results: UpdatedAssociations,
  test: boolean = false,
) {
  const url = test ? TEST_CONTACTS_RESULTS_URL : CONTACTS_RESULTS_URL;

  console.log(`Posting contact validation results to ${url}`);

  const response = await axios.post(url, results);
  if (response.status !== 200) {
    console.error(`Failed to post contact validation results: ${response.statusText}`);
    throw new Error(`Failed to post contact validation results: ${response.statusText}`);
  } else {
    console.log(`Successfully posted contact validation results to ${url}`);
  }
}
