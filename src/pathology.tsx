import React from 'react';
import {ListItem} from './listitem';
import {Icon} from 'react-native-elements';
import {Pathology, Patient, pathologyUri} from './patient';
import * as FileSystem from 'expo-file-system';
import {
  Button,
  Text,
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {connect} from 'react-redux';
import {useNavigationParam} from 'react-navigation-hooks';
import {useState, useEffect} from 'react';
import {store, addPathology} from './state';

async function writePathology(pathology: Pathology, filename: string) {
  FileSystem.writeAsStringAsync(filename, JSON.stringify(pathology));
}

interface PathologyProps {
  patient: Patient;
  addPathology: (patient: Patient, pathology: Pathology) => void;
}
function PathologyComponent(props: PathologyProps) {
  const {addPathology, patient} = props;
  const pathology: string = patient.pathology && patient.pathology.pathology;
  const hasUlcer: boolean = patient.pathology && patient.pathology.hasUlcer;
  const filename = pathologyUri(patient);

  const data = [
    'Chalazion',
    'Blepharite',
    'Allergie',
    'Uvéite',
    'Conjonctivite allergique',
    'conjonctivite infectieuse',
    'Conjonctivite indéterminée',
    'Episclerite/sclérite',
    'Pingueculite',
    'Pterygion',
    'Hémorragie sous conjonctivale',
    'Abcès',
    'Endophtalmie',
    'Herpès/zona épithélia',
    'Uniquement ulcère',
    'Autre',
  ];
  return (
    <View style={{flex: 1}}>
      <FlatList
        data={data}
        renderItem={({item}) => (
          <ListItem
            title={item}
            renderIcon={() =>
              item === pathology ? (
                <Icon name="radio-button-checked" type="material" />
              ) : (
                <Icon name="radio-button-unchecked" type="material" />
              )
            }
            onPress={() => {
              const path = {pathology: item, hasUlcer: hasUlcer};
              writePathology(path, filename).then(() => {
                addPathology(patient, path);
              });
              // setUlcer(value);
            }}
          />
        )}
        keyExtractor={(item, index) => item.toString()}
      />
      <View
        style={{
          height: 70,
          padding: 5,
          justifyContent: 'center',
          backgroundColor: '#fff',
          borderTopColor: '#ccc',
          borderTopWidth: 2,
        }}>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignContent: 'center',
          }}
          onPress={() => {
            const value = !hasUlcer;
            const path = {pathology: pathology || '', hasUlcer: value};
            writePathology(path, filename).then(() => {
              addPathology(patient, path);
            });
          }}>
          <Text
            style={{
              flex: 1,
              fontWeight: 'bold',
              fontSize: 24,
              alignSelf: 'center',
            }}>
            Avec ulcère
          </Text>
          <Switch
            style={{
              alignSelf: 'center',
            }}
            value={hasUlcer}
            onValueChange={value => {
              const path = {pathology: pathology || '', hasUlcer: value};
              writePathology(path, filename).then(() => {
                addPathology(patient, path);
              });
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
PathologyComponent.navigationOptions = ({navigation}) => {
  return {
    headerTitle: 'Pathologie',
    headerRight: () => {
      return (
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
      );
    },
  };
};

export const PathologyDetail = connect(
  state => {
    return {
      patient: state.state.patients.get(state.state.patientId),
    };
  },
  {addPathology},
)(PathologyComponent);
