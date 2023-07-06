import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3EventRecord } from 'aws-lambda';
import { Readable } from 'stream';
import csv from 'csv-parser';
import axios from 'axios';
import chunk from 'lodash/chunk';

import config from '@config/config';
import { AXIOS_REQUEST_HEADERS, BATCH_SIZE } from '@constants';
import Logger from '@logger';
import { BatchType, CsvItemType, PostRequestBody } from '@types';

/**
 * Generates batches of data based on a given array of records.
 * If the number of records is less than the batch size, the data is returned as a single batch.
 * Otherwise, the data is divided into multiple batches with each batch containing up to the batch size.
 *
 * @param {BatchType} data - An array of records to be divided into batches.
 * @returns {BatchType[]} An array of batches, where each batch is an array of records.
 */
export const generateBatches = (data: BatchType): BatchType[] => {
  let batches = [];

  if (data.length < BATCH_SIZE) {
    batches.push(data);
  } else {
    batches = chunk(data, BATCH_SIZE);
  }

  return batches;
};

/**
 * Make POST request using 'axios'
 *
 * @param {PostRequestBody} body
 * @param {string} url
 * @returns {Promise<void>} A promise that resolves to void
 */
export const makePostRequest = async (body: PostRequestBody, url: string): Promise<void> => {
  await axios.post(`${config.baseUrl}/${url}`, body, {
    headers: AXIOS_REQUEST_HEADERS,
  });
};

/**
 * Generates an array of promises by making batched POST requests to the specified URL.
 *
 * @param {BatchType[]} batches - An array of batches, where each batch is an array of records to be included in a POST request.
 * @param {string} url - The URL to which the POST requests will be made.
 * @returns An array of promises representing the batched POST requests.
 */
export const generateBatchedPromises = (batches: BatchType[], url: string): Promise<void>[] => {
  return batches.map(async (batch: BatchType) => await makePostRequest(batch, url));
};

/**
 * Read .csv file and convert its data to array
 *
 * @param {S3EventRecord} record - AWS S3 record
 * @returns {Promise<CsvItemType[]>} A promise that resolves to array of CsvItemType
 * @throws {Error} Throw an error if an error occurs during the operation
 */
export const parseCSVData = async (record: S3EventRecord): Promise<CsvItemType[]> => {
  const { bucket, object } = record.s3;
  const params = {
    Bucket: bucket.name,
    Key: object.key,
  };
  const s3 = new S3Client({});
  const command = new GetObjectCommand(params);
  const response = await s3.send(command);
  const bodyStream = response.Body as Readable;
  const results = [];

  try {
    for await (const row of bodyStream.pipe(csv())) {
      results.push(row as CsvItemType);
    }
    return results as CsvItemType[];
  } catch (error) {
    Logger.error(error);
    throw new Error(`Error parsing CSV: ${(error as Error)?.message}`);
  }
};
