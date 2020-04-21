import React from 'react';
import {connect} from 'react-redux';
import {RootState} from './store';
import {Status} from './store/server/types';
import {setServerStatus} from './store/server/actions';
import {View, Text} from 'react-native';
import {useEffect} from 'react';

type Action = typeof setServerStatus;
interface Props {
  status: Status;
  server: string;
  setServerStatus: Action;
}

const CHECK_PERIOD = 10 * 1000; // 10s

function checkServer(server: string, setServerStatus: Action) {
  fetch(server)
    .then(resp => {
      console.log('Response', resp);
      if (resp.status == 200) {
        setServerStatus(Status.Online);
      } else {
        setServerStatus(Status.Offline);
      }
    })
    .catch(err => {
      console.log('Error', err);
      setServerStatus(Status.Offline);
    });
}

export const UploaderComponent = (props: Props) => {
  const {status, server, setServerStatus} = props;

  useEffect(() => {
    if (status == Status.Loading) {
      checkServer(server, setServerStatus);
    } else {
      const interval = setInterval(() => {
        checkServer(server, setServerStatus);
      }, CHECK_PERIOD);
      return () => clearInterval(interval);
    }
  });

  if (status == Status.Offline || status == Status.Loading) {
    const color =
      status == Status.Offline ? 'rgb(253, 236, 234)' : 'rgb(255, 244, 229)';
    const text =
      status == Status.Offline
        ? 'Serveur indisponible'
        : 'Vérification du serveur';
    return (
      <View style={{height: 40, backgroundColor: color}}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>{text}</Text>
        </View>
      </View>
    );
  }
  return <></>;
};

export const Uploader = connect(
  (state: RootState) => {
    return {
      status: state.server.status,
      server: state.server.server,
    };
  },
  {setServerStatus},
)(UploaderComponent);
