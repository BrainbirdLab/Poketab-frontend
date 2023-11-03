console.log('Server side code');

import { usedUsernames, usedAvatars } from '$lib/store';
import {io} from 'socket.io-client';

const authSocket = io(':7777/auth');



export function load({ params }) {
  const { key } = params;

  console.log('Fetching key data');

  let success = false;

  

  authSocket.emit('fetchKeyData', key, (res: {success: boolean, message: string, usernames: string[], avatars: string[]}) => {

    success = res.success;

    if (!success){
        console.log('Key is invalid');
        return;
    }

    console.log('Key data fetched');

    usedUsernames.set(res.usernames);
    usedAvatars.set(res.avatars);

  });

  return {
    props: {
      chatData: {
        key: key,
        success: success,
        message: 'Could not fetch key data',
        code: 409,
      }
    },
  }
}