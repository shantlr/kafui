import { config } from '../config';
import { KakfkaManager } from '../lib';

export const kafka = new KakfkaManager({
  clientId: config.get('kafka.clientId'),
  brokers: config.get('kafka.brokers'),

  idleFetchTopicInterval: config.get('idle.fetch.topic.interval'),
});
