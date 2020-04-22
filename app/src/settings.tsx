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
  View,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {TextInput} from 'react-native-paper';

interface Props {
  server: string;
  changeServer: typeof changeServer;
}

const SettingsComponent = (props: Props) => {
  const {server, changeServer} = props;
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <View style={{height: 50}}>
        <TextInput
          label="Adresse du Serveur"
          value={server}
          onChangeText={text => changeServer(text)}
          mode="outlined"
          // style={{
          //   borderColor: 'gray',
          //   borderWidth: 1,
          //   padding: 20,
          //   borderRadius: 5,
          // }}
        />
      </View>
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
