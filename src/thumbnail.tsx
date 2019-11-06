import React from 'react';
import {ImageProps, Platform, Image } from 'react-native';
import {Video } from 'expo-av';

interface Source {
    uri : string
}


type ThumbnailProps = ImageProps;

export const Thumbnail = (props: any) => {
  if (Platform.OS === 'ios') {
    return <Video {...props} resizeMode="cover" />;
  } else {
    return <Image {...props} />;
  }
};
