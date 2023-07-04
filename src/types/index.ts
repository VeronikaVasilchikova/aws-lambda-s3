export type CsvItemType = {
  as_of_date: string;
  lease_id: string;
  application_id: string;
  payment_days_past_due: number;
  tier_1_status: string;
  tier_2_status: string;
  tier_3_status: string;
  offer_id: number;
  max_collectible_amount: number;
  campaign_name: string;
};

type UnionType = string | number | boolean;

export type ArrayOfParametersType = UnionType[];

export type LogLevelType = 'debug' | 'info' | 'warn' | 'error';

export type PaylinkDataType = {
  applicationId: string;
  leaseId: string;
  utmCampaign: string;
};

export type LeaseOffersDataType = {
  applicationId: string;
  leaseId: string;
  offerId: number;
  isActive: boolean;
};

export type TimelineDataType = {
  offerId: number;
  campaignName: string;
  applicationId: string;
  leaseId: string;
  maxCollectibleAmount: number;
};

export type BatchType = Record<string, unknown>[];

export type PostRequestBody = Record<string, unknown> | Record<string, unknown>[];
