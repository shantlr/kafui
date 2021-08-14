import { Kafka } from 'kafkajs';
import { keyBy, map, uniq } from 'lodash';

import { logger } from '../../config';
import { Interval } from '../interval';
import { diffArray } from '../utils/diff';
import { parseMemberAssignmentBuffer } from './utils';

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
       * @type {{
       *  brokers: { nodeId: number, host: string, port: number, isController: boolean }[]
       *  controller: number,
       *  clusterId: string
       * }}
       */
      cluster: null,
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
       * @type {Record<string, {
       *  groupId: string,
       *  protocolType: 'consumer'
       *  protocol: 'RoundRobinAssigner'
       *  state: 'Stable'
       *  topics: string[]
       *  members: {
       *    id: string
       *    clientId: string
       *    clientHost: string
       *    topics: string[]
       *  }[]
       * }>}
       */
      consumerGroups: {},
      /**
       * @type {Record<string, Record<string, { partition: number, offset: string }[]>>}
       */
      consumerGroupsOffsets: {},
      /**
       * @type {Record<string, Set<string>>}
       */
      topicConsumerGroups: {},
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
        handler: async ({ count }) => {
          const { groups } = await this.admin.listGroups();

          const desc = await this.admin
            .describeGroups(groups.map((g) => g.groupId))
            .then((r) => keyBy(r.groups, 'groupId'));

          const topics = [];
          groups.forEach((g) => {
            const d = desc[g.groupId];
            if (!d) {
              return;
            }

            g.protocol = d.protocol;
            g.state = d.state;
            g.members = d.members.map((member) => {
              const m = {
                id: member.memberId,
                clientId: member.clientId,
                clientHost: member.clientHost,
                topics: parseMemberAssignmentBuffer(member.memberAssignment),
              };
              topics.push(...m.topics);

              return m;
            });
            g.topics = uniq(topics);
          });

          this.reduceState('consumerGroups', groups);

          if (!count) {
            this.intervals.fetchGroupOffsets.flush();
          }
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
      fetchCluster: new Interval({
        name: 'fetch-config',
        handler: async () => {
          const r = await this.admin.describeCluster();
          r.brokers.forEach((broker) => {
            broker.isController = broker.nodeId === r.controller;
          });
          this.reduceState('cluster', r);
        },
        delay: this.configs.idleFetchTopicInterval,
      }),
      fetchGroupOffsets: new Interval({
        name: 'fetch-group-offsets',
        handler: async () => {
          await Promise.all(
            map(this.consumerGroups, async (group) => {
              await Promise.all(
                group.topics.map(async (topic) => {
                  try {
                    const offsets = await this.admin.fetchOffsets({
                      groupId: group.groupId,
                      topic,
                    });
                    this.reduceState('group-topic-offsets', {
                      groupId: group.groupId,
                      topic,
                      offsets,
                    });
                  } catch (err) {
                    console.log(group.groupId, topic, err.message);
                    if (
                      err.message ===
                      'The consumer group must have no running instances, current state: Stable'
                    ) {
                      //
                    } else {
                      throw err;
                    }
                    //
                  }
                })
              );
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
  get cluster() {
    return this.cacheState.cluster;
  }
  get consumerGroups() {
    return this.cacheState.consumerGroups;
  }
  topicConsumerGroup(topicName) {
    const groups = this.cacheState.topicConsumerGroups[topicName];
    if (!groups) {
      return [];
    }
    return [...groups];
  }
  partitionOffset(topicName, partitionId) {
    const offset = this.cacheState.topicOffsets[topicName];
    if (!offset) {
      return null;
    }
    return offset.offsets[partitionId];
  }
  consumerGroupOffsets(groupId, topicName) {
    if (!this.cacheState.consumerGroupsOffsets[groupId]) {
      return null;
    }
    return this.cacheState.consumerGroupsOffsets[groupId][topicName];
  }

  /**
   *
   * @param {'cluster'|'topics'|'consumerGroups'|'topic-offsets'|'group-topic-offsets'} type
   * @param {*} value
   */
  reduceState(type, value) {
    if (type === 'group-topic-offsets') {
      const { groupId, topic, offsets } = value;
      if (!this.cacheState.consumerGroupsOffsets[groupId]) {
        this.cacheState.consumerGroupsOffsets[groupId] = {};
      }
      this.cacheState.consumerGroupsOffsets[groupId][topic] = offsets;
    }
    if (type === 'cluster') {
      this.cacheState.cluster = value;
    }
    if (type === 'consumerGroups') {
      const record = keyBy(value, 'groupId');
      value.forEach((group) => {
        const prev = this.cacheState.consumerGroups[group.groupId];
        const topicDiff = diffArray(prev ? prev.topics : [], group.topics);
        topicDiff.added.forEach((topic) => {
          if (!this.cacheState.topicConsumerGroups[topic]) {
            this.cacheState.topicConsumerGroups[topic] = new Set();
          }
          this.cacheState.topicConsumerGroups[topic].add(group.groupId);
        });
        topicDiff.deleted.forEach((topic) => {
          if (this.cacheState.topicConsumerGroups[topic]) {
            this.cacheState.topicConsumerGroups[topic].delete(group.groupId);
          }
        });
      });
      this.cacheState.consumerGroups = record;
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
    this.intervals.fetchCluster.start();
    this.intervals.fetchGroupOffsets.start();
  }
}
