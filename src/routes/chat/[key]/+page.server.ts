import { io } from 'socket.io-client';

type RES = {
  success: boolean, 
  message: string, 
  statusCode: number, 
  icon: string, 
  usernames: string[], 
  avatars: string[],
  key?: string,
};

export async function load({ params }) {

  const { key } = params;

  console.log(`Searching for key ${key}`);

  const authSocket = io('http://localhost:7777/auth');

  authSocket.on('connect', () => {
    console.log('%cConnected to auth server for SSR', 'color: blue');
  });

  authSocket.on('disconnect', () => {
    console.log('%cDisconnected from auth server', 'color: red');
  });

  // Create a Promise to wait for the authSocket.emit callback
  const fetchDataPromise = new Promise<RES>((resolve) => {

    console.log('Connecting to server...');

    authSocket.connect();

    authSocket.on('connect_error', (err) => {
      console.log('%cConnection error - Dynamic rout', 'color: red');
      resolve({
        success: false,
        key: '',
        message: 'Server error',
        statusCode: 500,
        icon: 'error',
        usernames: [],
        avatars: [],
      });
    });

    authSocket.emit('fetchKeyData', key, (res: RES) => {
      console.log('Key data fetched');
      resolve({...res, key});
    });
  });

  // Wait for the fetchDataPromise to resolve
  const res = await fetchDataPromise;

  // Disconnect from the authSocket
  authSocket.disconnect();

  return {
    props: {
      res,
    },
  }
}
