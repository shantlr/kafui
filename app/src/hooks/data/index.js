import { useEffect } from 'react';

import { useCache } from 'lib/cache/react';
import { useSocket } from 'lib/socket';

export const useTopics = () => {
  const socket = useSocket();
  const cache = useCache();

  useEffect(() => {
    return socket.utils.cleanups(
      socket.emitOnConnect('subscribe-topics'),
      socket.subscribe(
        'topics',
        (topics) => {
          console.log('SUB LISTENER ', topics);
          topics.forEach((topic) => {});
        },
        {
          listenerKey: 'sub-topics',
        }
      )
    );
  }, [socket]);
};
