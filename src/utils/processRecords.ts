import { S3EventRecord } from 'aws-lambda';

import Logger from '@logger';
import { ENDPOINT, LEASE_OFFERS } from '@constants';
import { CsvItemType, LeaseOffersDataType, PaylinkDataType, TimelineDataType } from '@types';
import { parseCSVData, generateBatches, generateBatchedPromises, makePostRequest } from '@helpers';

/**
 * Prepare specific data structure to create new rows in 'paylink' table
 *
 * @param {CsvItemType[]} arrayFromCsv
 * @returns {PaylinkDataType[]}
 */
const generatePaylinkData = (arrayFromCsv: CsvItemType[]): PaylinkDataType[] => {
  return arrayFromCsv.map((item) => {
    const { application_id, lease_id, campaign_name } = item;
    return {
      applicationId: application_id,
      leaseId: lease_id,
      utmCampaign: campaign_name,
    };
  });
};

/**
 * Prepare specific data structure to create new rows in 'lease_offers' table
 *
 * @param {CsvItemType[]} arrayFromCsv
 * @returns {LeaseOffersDataType[]}
 */
const generateLeaseOffersData = (arrayFromCsv: CsvItemType[]): LeaseOffersDataType[] => {
  return arrayFromCsv.map((item) => {
    const { application_id, lease_id, offer_id } = item;
    return {
      applicationId: application_id,
      leaseId: lease_id,
      offerId: offer_id,
      isActive: true,
    };
  });
};

/**
 * Prepare specific data structure to create new rows in 'appliction_timeline' table
 *
 * @param {CsvItemType[]} arrayFromCsv
 * @returns {TimelineDataType[]}
 */
const generateTimelineData = (arrayFromCsv: CsvItemType[]): TimelineDataType[] => {
  return arrayFromCsv.map((item) => {
    const { application_id, lease_id, offer_id, campaign_name, max_collectible_amount } = item;
    return {
      offerId: offer_id,
      campaignName: campaign_name,
      applicationId: application_id,
      leaseId: lease_id,
      maxCollectibleAmount: max_collectible_amount,
    };
  });
};

/**
 * Process AWS S3 record: parse CSV file and send requests to API
 *
 * @param {S3EventRecord} record - AWS S3 record
 * @returns {Promise<void>} A promise that resolves to void
 * @throws {Error} Throw an error if an error occurs during the operation
 */
export const processRecords = async (record: S3EventRecord): Promise<void> => {
  try {
    const arrayFromCsv = await parseCSVData(record);

    if (!arrayFromCsv.length) throw new Error('There is no data in the S3 .csv file');

    const leaseOffersData = generateLeaseOffersData(arrayFromCsv);
    const leaseOffersBatchedData = generateBatches(leaseOffersData);
    const paylinkData = generatePaylinkData(arrayFromCsv);
    const paylinkBatchedData = generateBatches(paylinkData);
    const timelineData = generateTimelineData(arrayFromCsv);
    const timelineBatchedData = generateBatches(timelineData);

    console.log('leaseOffersBatchedData', leaseOffersBatchedData);
    console.log('paylinkBatchedData', paylinkBatchedData);
    console.log('timelineBatchedData', timelineBatchedData);


    // await Promise.all([
    //   // makePostRequest(LEASE_OFFERS.DEACTIVATE, ENDPOINT.DEACTIVATE_LEASE_OFFER),
    //   generateBatchedPromises(leaseOffersBatchedData, ENDPOINT.LEASE_OFFERS),
    //   generateBatchedPromises(paylinkBatchedData, ENDPOINT.PAYLINK),
    //   generateBatchedPromises(timelineBatchedData, ENDPOINT.APP_TIMELINE),
    // ]);
  } catch (error) {
    Logger.error(error);
    throw new Error(`ProcessRecords: ${(error as Error)?.message}`);
  }
};
