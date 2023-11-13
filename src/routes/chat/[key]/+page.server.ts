import type { User } from '$lib/store.js';
import { io } from 'socket.io-client';

type fetchResponse = {
  success: boolean,
  message: string,
  statusCode: number,
  icon: string,
  users: {[key: string]: User},
  maxUsers: number,
  key: string,
}

const server = import.meta.env.VITE_SOCKET_SERVER_URL;

export async function load({ params }) {

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

    socket.connect();

    socket.on('connect_error', (err) => {
      console.log('%cConnection error - Dynamic route', 'color: red');
      resolve({
        success: false,
        message: 'Could not connect to server',
        statusCode: 500,
        icon: 'error',
        users: {},
        maxUsers: 0,
        key: '',
      });
      socket.disconnect();
    });
    
    socket.emit('fetchKeyData', key, (res: fetchResponse) => {
      console.log('Key data fetched');
      resolve({...res, key});
    });
  });
  
  console.log(`Searching for key ${key}`);
  // Wait for the fetchDataPromise to resolve
  const res = await fetchDataPromise;

  console.log(res);
  // Disconnect from the authSocket
  socket.disconnect();

  return {
    props: {
      res,
    },
  }
}
