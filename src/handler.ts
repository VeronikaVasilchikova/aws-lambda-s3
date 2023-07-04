import { S3Event, S3Handler } from 'aws-lambda';

import Logger from '@logger';
import { processRecords } from '@utils/processRecords';

/**
 * AWS Lambda function handler that is called each time
 * when a new object (a .csv file) is saved to the AWS S3 bucket
 *
 * @param {S3Event} _event - An AWS S3 event 's3:ObjectCreated:*'
 * @returns {Promise<void>} A promise that resolves to void
 * @throws {Error} Throw an error if an error occurs during the operation
 */
export const main: S3Handler = async (event: S3Event): Promise<void> => {
  const { Records } = event;

  try {
    const recordPromises = Records.map(async (record) => {
      await processRecords(record);
    });

    await Promise.all(recordPromises);
  } catch (error) {
    Logger.error(error);
  }
};
