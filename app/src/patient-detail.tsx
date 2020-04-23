import React from 'react';
import {useState, useEffect} from 'react';
import {useNavigation, useNavigationParam} from 'react-navigation-hooks';
import {
  Button,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {NavigationParams} from 'react-navigation';
import {Video} from 'expo-av';
import * as FileSystem from 'expo-file-system';
import {Icon} from 'react-native-elements';
import {connect} from 'react-redux';

import {Thumbnail} from './thumbnail';
import {RootState} from './store';
import {getPatient} from './store/patients/reducers';
import {Media, Pathology, Patient} from './store/patients/types';

interface PatientDetailProps {
  patient: Patient;
}

const pathologyString = (pathology: Pathology) => {
  const keyword = pathology.hasUlcer ? ' avec ulcère' : '';
  return `${pathology.pathology}${keyword}`;
};
export function PatientDetailComponent(props: PatientDetailProps) {
  const {patient} = props;
  const {navigate} = useNavigation();

  const pathology = !patient.pathology
    ? 'Proposer une pathologie'
    : pathologyString(patient.pathology);
  const emptyMedia: Media = {
    uri: '+',
    filename: '',
    timestamp: new Date(),
    size: 0,
  };
  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1}}>
        <FlatList
          data={patient.media.concat([emptyMedia])}
          numColumns={2}
          renderItem={({item}) => {
            if (item.uri == '+') {
              // Last item to add + button
              return (
                <TouchableOpacity
                  style={{
                    flex: 0.5,
                  }}
                  onPress={() => {
                    navigate('AddVideo');
                  }}>
                  <View
                    style={{
                      height: 140,
                      flex: 1,
                      margin: 10,
                      justifyContent: 'center',
                      alignContent: 'center',
                      borderWidth: 1,
                    }}>
                    <Icon size={36} color="#000" name="plus" type="antdesign" />
                  </View>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                style={{flex: 0.5}}
                onPress={() => {
                  navigate('PlayVideo', {uri: item.uri});
                }}>
                <View style={{flex: 1, position: 'relative'}}>
                  <ActivityIndicator
                    style={{
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      position: 'absolute',
                    }}
                  />
                  <Thumbnail
                    style={{flex: 1, height: 140, margin: 10}}
                    source={item}
                  />
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item, index) => item.filename}
        />
        <TouchableOpacity
          style={{
            height: 100,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#517fa4',
          }}
          onPress={() => navigate('PathologyDetail')}>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 24,
              color: '#fff',
            }}>
            {pathology}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

PatientDetailComponent.navigationOptions = ({navigation}: NavigationParams) => {
  return {
    headerTitle: `Patient`,
    headerRight: () => {
      return (
        <>
          <ConsentButton />
          <TouchableOpacity
            style={{justifyContent: 'center', margin: 10}}
            onPress={() => {
              navigation.goBack();
            }}>
            <Text
              style={{
                fontSize: 24,
              }}>
              Ok
            </Text>
          </TouchableOpacity>
        </>
      );
    },
  };
};

const ConsentButton = () => {
  const {navigate} = useNavigation();
  return (
    <Icon
      iconStyle={{margin: 10}}
      name="file-document-outline"
      type="material-community"
      onPress={() => navigate('Consent')}
    />
  );
};
export const PatientDetail = connect((state: RootState) => {
  const patient = getPatient(state.patients);
  return {patient};
})(PatientDetailComponent);
