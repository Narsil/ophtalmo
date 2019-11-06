import React from 'react';
import {Patient, loadPatient} from './patient';
import {AppLoading} from 'expo';
import * as FileSystem from 'expo-file-system';
import {useNavigation, useNavigationParam} from 'react-navigation-hooks';
import {Button, Text, FlatList, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {ListItem} from './listitem';
import {Container} from 'native-base';
import {
  store,
  addPatient,
  setReady,
  FullState,
  State,
  navigatePatient,
} from './state';
import {Thumbnail} from './thumbnail';
import {connect} from 'react-redux';

// export function Patients(
//   ready: boolean,
//   patients: Patient[],
//   setReady: (patients: Patient[]) => void,
// ) {
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
  const renderItem = ({item}: {item : Patient}) => {
    const patient= item;
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
  return (
    <Container>
      <FlatList<Patient>
        data={Array.from(patients.values())
          .filter(patient => patient.hasConsent())
          .sort((a, b) => b.id - a.id)}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id.toString()}
      />
    </Container>
  );
}
Patients.navigationOptions = () => {
  return {
    headerTitle: 'Patients',
    headerRight: () => <CAddPatientButton />,
  };
};

export default connect(
  (state: FullState) => {
    return {patients: state.state.patients, ready: state.state.ready};
  },
  {setReady, navigatePatient},
)(Patients);

interface AddPatientButtonProps {
    newPatientId : number
    addPatient: typeof addPatient
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
  (state: FullState) => {
    const patientIds = Array.from(state.state.patients.keys());
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
