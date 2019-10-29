import React from 'react';
import {Platform, Image} from 'react-native';
import {Video} from 'expo-av';

export const Thumbnail = props => {
  if (Platform.OS === 'ios') {
    return <Video {...props} resizeMode="cover" />;
  } else {
    return <Image {...props} />;
  }
};
