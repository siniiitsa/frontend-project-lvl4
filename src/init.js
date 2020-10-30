// @ts-check

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './components/App';
import UserContext from './contexts/UserContext';
import buildStore from './store';
import { addMessage, initMessages } from './store/messages';
import { initChannels, addChannel } from './store/channels';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

import '../assets/application.scss';

import faker from 'faker';
import cookies from 'js-cookie';
import io from 'socket.io-client';

export default ({ messages, channels, currentChannelId }) => {
  if (process.env.NODE_ENV !== 'production') {
    localStorage.debug = 'chat:*';
  }

  let userName = cookies.get('userName');
  if (!userName) {
    userName = faker.name.findName();
    cookies.set('userName', userName);
  }

  const user = { name: userName };
  const store = buildStore();
  const { dispatch } = store;

  dispatch(initMessages({ messages }));
  dispatch(initChannels({ currentChannelId, channels }));

  const socket = io();

  socket
    .on('newMessage', (socketMsg) => {
      const message = socketMsg.data.attributes;
      dispatch(addMessage({ message }));
    })
    .on('newChannel', (socketMsg) => {
      const channel = socketMsg.data.attributes;
      dispatch(addChannel({ channel }));
    });

  ReactDOM.render(
    <UserContext.Provider value={user}>
      <Provider store={store}>
        <App />
      </Provider>
    </UserContext.Provider>,
    document.getElementById('chat')
  );
};