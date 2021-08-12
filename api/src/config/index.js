import dotenv from 'dotenv';
import convict from 'convict';
import debug from 'debug';

dotenv.config();

export const config = convict({
  server: {
    port: {
      env: 'SERVER_PORT',
      default: 3001,
    },
    cors: {
      origin: {
        env: 'SERVER_CORS_ORIGIN',
        default: 'http://localhost:3000',
      },
    },
  },
  kafka: {
    brokers: {
      env: 'KAFKA_BROKERS',
      doc: 'kafka brokers separted by comma',
      coerce: (str) => {
        if (typeof str === 'string') {
          return str.split(',');
        }
        return str;
      },
      default: ['localhost:9092'],
    },
    clientId: {
      env: 'KAFKA_CLIENT_ID',
      default: 'kafui',
    },
    consumers: {
      groupId: {
        prefix: {
          env: 'CONSUMERS_GROUP_ID_PREFIX',
          default: 'kafui-',
        },
      },
    },
  },

  idle: {
    fetch: {
      topic: {
        interval: {
          env: 'IDLE_FETCH_TOPIC_INTERVAL',
          default: 20 * 60 * 1000,
        },
      },
    },
  },
});

export const logger = {
  debug: debug('kafui:debug'),
  info: debug('kafui:info'),
  error: debug('kafui:error'),
};
