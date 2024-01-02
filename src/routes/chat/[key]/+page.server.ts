import type { User } from '$lib/store';
import { themes } from '$lib/themes';
import { error, type NumericRange } from '@sveltejs/kit';
import { io } from 'socket.io-client';

type fetchResponse = {
  success: boolean,
  message: string,
  icon: string,
  statusCode: number,
  users: {[key: string]: User},
  maxUsers: number,
  key: string,
  themename: string,
}

const server = import.meta.env.VITE_SOCKET_SERVER_URL;

export async function load({ params, cookies }) {

  const { key } = params;

  const socket = io(server);

  socket.on('connect', () => {
    console.log('%cConnected to server for SSR', 'color: blue');
  });

  socket.on('disconnect', () => {
    console.log('%cDisconnected from server for SSR', 'color: red');
  });

  // Create a Promise to wait for the authSocket.emit callback
  const fetchDataPromise = new Promise<fetchResponse>((resolve) => {

    console.log('Connecting to server...');

    let themename: string = cookies.get('theme') || 'Ocean';
    if (themename in themes){
        cookies.set('theme', themename, {path: '/'});
    } else {
        cookies.set('theme', 'Ocean', {path: '/'});
        themename = 'Ocean';
    }

    socket.connect();

    socket.on('connect_error', (err) => {
      console.log('%cConnection error - Dynamic route', 'color: red');
      socket.disconnect();
      resolve({
        success: false,
        message: 'Server is down',
        statusCode: 500,
        icon: '❌',
        users: {},
        maxUsers: 0,
        key: '',
        themename: '',
      });
    });
    
    socket.emit('fetchKeyData', key, (res: fetchResponse) => {
      console.log('Key data fetched');
      resolve({...res, key, themename});
    });
  });

  
  console.log(`Searching for key ${key}`);
  // Wait for the fetchDataPromise to resolve
  const res = await fetchDataPromise;

  console.log(res.statusCode);

  // If the server is down, return an error
  if (res.statusCode === 500 || res.statusCode === 400) {
    return error(res.statusCode as NumericRange<400, 599>, { message: res.message });
  }

  // Disconnect from the authSocket
  socket.disconnect();

  return {
    ...res,
  };
}
