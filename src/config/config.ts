import 'dotenv/config';

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  END,
  DATADOG_HOST,
  DATADOG_API_KEY,
  DATADOG_SERVICE,
  BASE_URL,
} = process.env;

class Config {
  get dbHost(): string {
    return POSTGRES_HOST;
  }

  get dbPort(): number {
    return +POSTGRES_PORT;
  }

  get dbUser(): string {
    return POSTGRES_USER;
  }

  get dbPassword(): string {
    return POSTGRES_PASSWORD;
  }

  get dbName(): string {
    return POSTGRES_DB;
  }

  get env(): string {
    return END || 'dev';
  }

  get dataDogHost(): string {
    return DATADOG_HOST;
  }

  get dataDogApiKey(): string {
    return DATADOG_API_KEY;
  }

  get dataDogService(): string {
    return DATADOG_SERVICE;
  }

  get baseUrl(): string {
    return BASE_URL;
  }
}

export default new Config();
