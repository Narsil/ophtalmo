import React from 'react';
import {Icon} from 'react-native-elements';
import {Patient, consentUri} from './store/patients/types';
import {connect} from 'react-redux';
import * as FileSystem from 'expo-file-system';
import {
  Button,
  Text,
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import {StackActions} from 'react-navigation';
import {useNavigation, useNavigationParam} from 'react-navigation-hooks';
// @ts-ignore
import ExpoPixi from 'expo-pixi';
import {useState, useEffect} from 'react';
import {RootState} from './store';
import {addConsent} from './store/patients/actions';
import {getPatient} from './store/patients/reducers';

function save(canvas: any, uri: string) {
  const promise = new Promise<string>(function(resolve, reject) {
    canvas
      .takeSnapshotAsync({
        format: 'png',
        quality: 0.5,
        result: 'file',
      })
      .then((result: {uri: string}) => {
        FileSystem.copyAsync({from: result.uri, to: uri}).then(() => {
          resolve(uri);
        });
      });
  });
  return promise;
}

interface ConsentProps {
  addConsent: (patient: Patient, uri: string) => void;
  patient: Patient;
}
function ConsentComponent(props: ConsentProps) {
  const {patient, addConsent} = props;
  const uri = consentUri(patient);
  const navigation = useNavigation();
  const canvas = React.createRef<any>();
  if (patient.consentUri) {
    return (
      <View style={{flex: 1}}>
        <Image source={{uri: patient.consentUri}} style={{flex: 1}} />
      </View>
    );
  }
  return (
    <View style={{flex: 1}}>
      <ExpoPixi.Signature
        style={{flex: 1}}
        ref={canvas}
        strokeWidth={3} // thickness of the brush
        strokeAlpha={0.5} // opacity of the brush
      />
      <View
        style={{
          position: 'absolute',
          top: 200,
          width: 200,
          alignSelf: 'center',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderRadius: 20,
          padding: 20,
          borderStyle: 'dashed',
          borderColor: '#aaa',
        }}
        pointerEvents="none">
        <Text style={{color: '#aaa', fontSize: 24}}>Signer ici</Text>
      </View>
      <TouchableOpacity
        style={{position: 'absolute', top: 10, right: 10}}
        onPress={() => {
          canvas.current.clear();
        }}>
        <Icon name="close" type="anticon" />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 40,
          justifyContent: 'center',
          alignSelf: 'center',
        }}>
        <View>
          <Button
            title="Je consens"
            onPress={() => {
              save(canvas.current, uri).then(uri => {
                addConsent(patient, uri);
                navigation.dispatch(
                  StackActions.replace({routeName: 'PatientDetail'}),
                );
                if (!patient.hasMedia()) {
                  navigation.dispatch(
                    StackActions.push({routeName: 'AddVideo'}),
                  );
                }
              });
            }}
          />
        </View>
      </TouchableOpacity>
      <Text
        style={{
          borderWidth: 1,
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          margin: 40,
          padding: 10,
        }}>
        Je consens à ce que mes données soient utilisées pour aider à mon
        diagnostic.
      </Text>
    </View>
  );
}
export const Consent = connect(
  (state: RootState) => {
    const patient = getPatient(state.patients);
    return {patient};
  },
  {addConsent},
)(ConsentComponent);

ConsentComponent.navigationOptions = () => {
  return {
    title: `Consentement`,
  };
};
