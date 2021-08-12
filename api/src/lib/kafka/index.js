import { Kafka } from 'kafkajs';
import { keyBy, map, sortBy } from 'lodash';

import { logger } from '../../config';
import { Interval } from '../interval';

export class KakfkaManager {
  constructor({ clientId, brokers, idleFetchTopicInterval }) {
    this.kafka = new Kafka({
      clientId,
      brokers,
    });
    this.admin = this.kafka.admin();

    this.configs = {
      idleFetchTopicInterval,
    };

    this.cacheState = {
      /**
       * @type {Record<string, {
       *  name: string,
       *  partitions: {
       *    partitionId: number,
       *    leader: number,
       *    replicas: number[],
       *    isr: number[],
       *    offlineReplicas: number[]
       *  }[]
       * }>}
       */
      topics: {},

      /**
       * @type {Record<string, {
       *  name: string,
       *  offsets: Record<number, {
       *    partition: number,
       *    offset: string,
       *    high: string,
       *    low: string
       *  }>
       * }>}
       */
      topicOffsets: {},

      /**
       * @type {{ groupId: string, protocolType: 'consumer' }}
       */
      groups: [],
    };

    this.intervals = {
      fetchTopicList: new Interval({
        name: 'fetch-topic-list',
        handler: async ({ count }) => {
          const { topics } = await this.admin.fetchTopicMetadata();
          topics.forEach((topic) => {
            topic.partitions.sort((a, b) => a.partitionId - b.partitionId);
          });
          this.reduceState('topics', topics);

          if (!count) {
            // flush fetch topic infos on first iteration
            this.intervals.fetchTopicOffsets.flush();
          }
        },
        delay: this.configs.idleFetchTopicInterval,
      }),
      fetchConsumers: new Interval({
        name: 'fetch-consumers',
        handler: async () => {
          const res = await this.admin.listGroups();
          this.reduceState('groups', res.groups);
        },
        delay: this.configs.idleFetchTopicInterval,
      }),
      fetchTopicOffsets: new Interval({
        name: 'fetch-topics-offsets',
        handler: async () => {
          await Promise.all(
            map(this.topics, async (topic) => {
              const res = await this.admin.fetchTopicOffsets(topic.name);
              this.reduceState('topic-offsets', {
                name: topic.name,
                offsets: keyBy(res, 'partition'),
              });
            })
          );
        },
        delay: this.configs.idleFetchTopicInterval,
      }),
    };
  }

  get topics() {
    return this.cacheState.topics;
  }
  get groups() {
    return this.cacheState.groups;
  }

  partitionOffset(topicName, partitionId) {
    const offset = this.cacheState.topicOffsets[topicName];
    if (!offset) {
      return null;
    }
    return offset.offsets[partitionId];
  }

  /**
   *
   * @param {'topics'|'groups'|'topic-offsets'} type
   * @param {*} value
   */
  reduceState(type, value) {
    if (type === 'groups') {
      const record = keyBy(value, 'groupId');
      this.cacheState.groups = record;
    }
    if (type === 'topics') {
      const record = keyBy(value, 'name');
      // const res = diff(this.cacheState.topics, keyBy(value, 'name'));
      // console.log(res);
      this.cacheState.topics = record;
    }
    if (type === 'topic-offsets') {
      this.cacheState.topicOffsets[value.name] = value;
    }
  }

  async connect() {
    logger.debug('connecting to kafka...');
    await this.admin.connect();
    logger.debug('connected to kafka');
  }
  async disconnect() {
    logger.debug('disconnecting from kafka...');
    await this.admin.disconnect();
    logger.debug('disconnected from kafka');
  }

  createConsumer({ groupId }) {
    return this.kafka.consumer({
      groupId,
      allowAutoTopicCreation: false,
    });
  }

  startCacheUpdateInterval() {
    this.intervals.fetchTopicList.start();
    this.intervals.fetchConsumers.start();
    this.intervals.fetchTopicOffsets.start();
  }
}
