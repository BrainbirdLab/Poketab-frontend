import { error, type NumericRange } from '@sveltejs/kit';
import { io } from 'socket.io-client';
import type { socketResponse } from "$lib/connection/socketResponseType";
import { PUBLIC_API_SERVER_URL } from "$env/static/public"
import { DEFAULT_THEME, themes } from "$lib/themesTypes";

type fetchResponse = socketResponse & {
  key: string,
  themename: string,
}

const server = PUBLIC_API_SERVER_URL;

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

    let themename: string = cookies.get('theme') || DEFAULT_THEME;
    if (themename in themes){
        cookies.set('theme', themename, {path: '/'});
    } else {
        cookies.set('theme', DEFAULT_THEME, {path: '/'});
        themename = DEFAULT_THEME;
    }

    socket.connect();

    socket.on('connect_error', (err) => {
      console.log('%cConnection error - Dynamic route', 'color: red');
      socket.disconnect();
      resolve({
        success: false,
        message: 'Connection could not be established',
        statusCode: 500,
        icon: '❌',
        users: {},
        maxUsers: 0,
        key: '',
        themename: '',
      });
    });
    
    socket.emit('fetchKeyData', key, true, (res: socketResponse) => {
      resolve({...res, key, themename});
    });
  });

  // Wait for the fetchDataPromise to resolve
  const res = await fetchDataPromise;

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
