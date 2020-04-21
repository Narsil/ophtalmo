import React from 'react';
import {Patient, loadPatient} from './store/patients/types';
import {AppLoading} from 'expo';
import * as FileSystem from 'expo-file-system';
import {useNavigation, useNavigationParam} from 'react-navigation-hooks';
import {Button, Text, FlatList, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {ListItem} from './listitem';
import {Container} from 'native-base';
import {RootState} from './store';
import {addPatient, setReady, navigatePatient} from './store/patients/actions';
import {Thumbnail} from './thumbnail';
import {connect} from 'react-redux';

interface PatientProps {
  patients: Map<number, Patient>;
  ready: boolean;
  setReady: (patients: Map<number, Patient>) => void;
  addPatient: any;
  navigatePatient: any;
}
export function Patients(props: PatientProps) {
  const {patients, ready, setReady, addPatient, navigatePatient} = props;
  if (!ready) {
    return (
      <AppLoading
        startAsync={() => {
          return FileSystem.readDirectoryAsync(
            FileSystem.documentDirectory!,
          ).then(patientIds => {
            Promise.all(patientIds.map(loadPatient)).then(patients => {
              setReady(
                new Map<number, Patient>(
                  patients.map(patient => [patient.id, patient]),
                ),
              );
            });
          });
        }}
        onFinish={() => {}}
        onError={console.warn}
      />
    );
  }

  const {navigate} = useNavigation();
  const renderItem = ({item}: {item: Patient}) => {
    const patient = item;
    return (
      <ListItem
        title={patient.toString()}
        // description={`Patient ${patient.id}`}
        renderButton={() => {
          return (
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <Icon
                iconStyle={{margin: 10}}
                name="edit"
                type="antdesign"
                color={patient.hasPathology() ? '#0c0' : '#c00'}
              />
            </View>
          );
        }}
        renderIcon={() => {
          if (patient.hasMedia()) {
            return (
              <View style={{flex: 1}}>
                <Thumbnail
                  style={{height: 60, width: 60, flex: 1, margin: 5}}
                  source={{uri: patient.media[0].uri}}
                />
              </View>
            );
          } else {
            return (
              <View
                style={{
                  height: 60,
                  width: 60,
                  flex: 1,
                  margin: 5,
                  alignContent: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="video-camera" type="font-awesome" color="#aaa" />
              </View>
            );
          }
        }}
        onPress={() => {
          navigatePatient(patient);
          navigate('PatientDetail');
        }}
      />
    );
  };
  const consentPatients = Array.from(patients.values())
    .filter(patient => patient.hasConsent())
    .sort((a, b) => b.id - a.id);

  return (
    <Container>
      <FlatList<Patient>
        data={consentPatients}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id.toString()}
      />
    </Container>
  );
}
Patients.navigationOptions = () => {
  return {
    headerTitle: 'Patients',
    headerRight: () => (
      <>
        <SettingsButton />
        <CAddPatientButton />
      </>
    ),
  };
};

const SettingsButton = () => {
  const {navigate} = useNavigation();
  return (
    <Icon
      iconStyle={{margin: 10}}
      name="setting"
      type="antdesign"
      onPress={() => {
        navigate('Settings');
      }}
    />
  );
};

export default connect(
  (state: RootState) => {
    return {patients: state.patients.patients, ready: state.patients.ready};
  },
  {setReady, navigatePatient},
)(Patients);

interface AddPatientButtonProps {
  newPatientId: number;
  addPatient: typeof addPatient;
}

const AddPatientButton = (props: AddPatientButtonProps) => {
  const {navigate} = useNavigation();
  const {addPatient} = props;
  return (
    <Icon
      iconStyle={{margin: 10}}
      name="plus"
      type="antdesign"
      onPress={() => {
        const newPatientKey = '' + props.newPatientId;
        const patient = new Patient(props.newPatientId);
        FileSystem.makeDirectoryAsync(
          FileSystem.documentDirectory + newPatientKey,
        ).then(() => {
          addPatient(patient);
          navigate('Consent');
        });
      }}
    />
  );
};
const CAddPatientButton = connect(
  (state: RootState) => {
    const patientIds = Array.from(state.patients.patients.keys());
    const newPatientId =
      patientIds.length > 0 ? Math.max(...patientIds) + 1 : 1;
    return {
      newPatientId,
    };
  },
  {addPatient},
)(AddPatientButton);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
