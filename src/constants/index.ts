export const BATCH_SIZE = 100;

export const LEASE_OFFERS = {
  DEACTIVATE: {
    columnToUpdate: 'is_active',
    newValue: false,
    condition: 'WHERE expired_at <= current_date',
  },
};

export const AXIOS_REQUEST_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export const ENDPOINT = {
  DEACTIVATE_LEASE_OFFER: 'lease-offers-deactivate',
  LEASE_OFFERS: 'lease-offers',
  PAYLINK: 'paylink',
  APP_TIMELINE: 'application-timeline',
};
