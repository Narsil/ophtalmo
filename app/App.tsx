import React from 'react';
import {useState, useEffect} from 'react';
import {Provider as StoreProvider} from 'react-redux';
import {Button, Text, FlatList, StyleSheet, View} from 'react-native';
import {NavigationContext, createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {useNavigation, useNavigationParam} from 'react-navigation-hooks';
import {Container} from 'native-base';
import * as FileSystem from 'expo-file-system';
import {Provider as PaperProvider} from 'react-native-paper';

import {ListItem} from './src/listitem';
import {PlayVideo, AddVideo} from './src/video';
import {PathologyDetail} from './src/pathology';
import {Patients} from './src/patients';
import {Consent} from './src/consent';
import {store} from './src/store';
import {PatientDetail} from './src/patient-detail';
import {Settings} from './src/settings';

const MainNavigator = createStackNavigator(
  {
    Patients: {screen: Patients, navigationOptions: {headerTitle: 'Patients'}},
    PatientDetail: {screen: PatientDetail},
    Consent: {screen: Consent},
    AddVideo: {screen: AddVideo},
    PlayVideo: {screen: PlayVideo},
    Settings: {screen: Settings},
    PathologyDetail: {screen: PathologyDetail},
  },
  {initialRouteName: 'Patients'},
);

const AppNavigator = createAppContainer(MainNavigator);

const App = () => {
  return (
    <StoreProvider store={store}>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </StoreProvider>
  );
};
export default App;
