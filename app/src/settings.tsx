import React from 'react';
import {NavigationParams} from 'react-navigation';
import {connect} from 'react-redux';
import {RootState} from './store';
import {changeServer} from './store/server/actions';
import {
  Button,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Switch,
} from 'react-native';

interface Props {
  server: string;
  changeServer: typeof changeServer;
}

const SettingsComponent = (props: Props) => {
  const {server, changeServer} = props;
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Adresse du serveur</Text>
      <TextInput
        value={server}
        onChangeText={text => changeServer(text)}
        style={{
          borderColor: 'gray',
          borderWidth: 1,
          padding: 20,
          borderRadius: 5,
        }}
      />
    </View>
  );
};

export const Settings = connect(
  (state: RootState) => {
    return state.server;
  },
  {changeServer},
)(SettingsComponent);

SettingsComponent.navigationOptions = ({navigation}: NavigationParams) => {
  return {
    headerTitle: `Settings`,
  };
};
