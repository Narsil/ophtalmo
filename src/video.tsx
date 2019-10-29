import {Media, Patient} from './patient';
import {Icon} from 'react-native-elements';
import React from 'react';
import {connect} from 'react-redux';
import {Video as ExpoVideo} from 'expo-av';
import {useState, useEffect} from 'react';
import * as FileSystem from 'expo-file-system';
import {
  Dimensions,
  Button,
  Text,
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {useNavigation, useNavigationParam} from 'react-navigation-hooks';
import {StackActions} from 'react-navigation';
import * as Permissions from 'expo-permissions';
import {Camera} from 'expo-camera';
import * as VideoThumbnails from 'expo-video-thumbnails';
import {store, addMedia} from './state';
import {ListItem} from './listitem';
import {Svg, Defs, Rect, Mask, Circle} from 'react-native-svg';

function fileSize(size: number): string {
  var i = -1;
  var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
  do {
    size = size / 1024;
    i++;
  } while (size > 1024);

  return Math.max(size, 0.1).toFixed(1) + byteUnits[i];
}

const storeVideo = async (uri: string, filename: string): Promise<Media> => {
  const {size} = await FileSystem.getInfoAsync(uri);

  const media: Media = {
    filename: filename,
    uri: uri,
    timestamp: new Date(),
    thumbnailUri: null,
    size,
  };
  return media;
};

interface SvgMaskProps {
  width: number;
  height: number;
}
const SvgMask = (props: SvgMaskProps) => {
  const {width, height} = props;

  return (
    <Svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <Mask id="mask" x="0" y="0" height="100%" width="100%">
          <Rect height="100%" width="100%" fill="#fff" />
          <Circle r={width / 2 - 5} cx={width / 2} cy={width / 2} />
        </Mask>
      </Defs>
      <Rect height="100%" width="100%" fill="#000" mask="url(#mask)" />
    </Svg>
  );
};

const CircleMask = () => {
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  return (
    <View
      onLayout={event => {
        const {width, height} = event.nativeEvent.layout;
        setWidth(width);
        setHeight(height);
      }}
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: 'transparent',
        },
      ]}>
      {width && height && <SvgMask width={width} height={height} />}
    </View>
  );
};

interface AddVideoProps {
  patient: Patient;
  addMedia: (patient: Patient, media: Media) => void;
}
function AddVideoComponent(props: AddVideoProps) {
  const {patient, addMedia} = props;
  const [hasCameraPermission, setCameraPermission] = useState(null);
  const [hasVideoPermission, setVideoPermission] = useState(null);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.torch);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [status, setStatus] = useState<'STILL' | 'RECORDING' | 'SAVING'>(
    'STILL',
  );
  const navigation = useNavigation();

  const extension = Platform.OS === 'ios' ? 'mov' : 'mp4';

  async function didMount() {
    const camPerm = await Permissions.askAsync(Permissions.CAMERA);
    setCameraPermission(camPerm.status === 'granted');
    const vidPerm = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    setVideoPermission(vidPerm.status === 'granted');
  }
  useEffect(() => {
    didMount();
  }, []);

  if (hasCameraPermission === null || hasVideoPermission === null) {
    return <View />;
  } else if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  } else if (hasVideoPermission === false) {
    return <Text>No access to video recording</Text>;
  } else {
    const camera = React.createRef<Camera>();
    return (
      <View style={{flex: 1}}>
        <CircleMask />
        <Camera
          style={{flex: 1}}
          type={type}
          ref={camera}
          flashMode={flash}
          autoFocus={Camera.Constants.AutoFocus.on}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 10,
                bottom: 50,
                alignItems: 'center',
              }}
              onPress={() => {
                setFlash(
                  flash == Camera.Constants.FlashMode.torch
                    ? Camera.Constants.FlashMode.off
                    : Camera.Constants.FlashMode.torch,
                );
              }}>
              <Icon
                reverse
                name={
                  flash == Camera.Constants.FlashMode.torch
                    ? 'flash-on'
                    : 'flash-off'
                }
                type="material"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                position: 'absolute',
                left: 10,
                bottom: 50,
                alignItems: 'center',
              }}
              onPress={() => {
                setType(
                  type == Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.FlashMode.back,
                );
              }}>
              <Icon reverse name="camera-switch" type="material-community" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 100,
                left: 100,
                bottom: 50,
                alignItems: 'center',
              }}
              onPress={() => {
                if (status !== 'RECORDING') {
                  setStatus('RECORDING');
                  // Fixing bug https://github.com/expo/expo/issues/6086
                  if (
                    Platform.OS === 'ios' &&
                    flash == Camera.Constants.FlashMode.torch
                  ) {
                    setTimeout(() => {
                      setFlash(Camera.Constants.FlashMode.off);
                      setFlash(Camera.Constants.FlashMode.torch);
                    }, 1000);
                  }
                  camera.current.recordAsync({maxDuration: 30}).then(video => {
                    setStatus('SAVING');
                    const timestamp = new Date();
                    const filename = `${timestamp
                      .toISOString()
                      .replace(/:/g, '')
                      .replace(/\./g, '-')}.${extension}`;
                    const directory = `${FileSystem.documentDirectory}${patient.id}/media/`;
                    const uri = `${directory}${filename}`;
                    FileSystem.makeDirectoryAsync(directory, {
                      intermediates: true,
                    }).then(() => {
                      FileSystem.copyAsync({from: video.uri, to: uri})
                        .then(() => {
                          storeVideo(uri, filename).then(media => {
                            setStatus('STILL');
                            addMedia(patient, media);
                            navigation.goBack();
                          });
                        })
                        .catch(err => {
                          console.error(`Error copying video. ${err}`);
                        });
                    });
                  });
                } else {
                  camera.current.stopRecording();
                }
              }}>
              {status === 'SAVING' ? (
                <Icon
                  size={40}
                  reverse
                  name="dots-three-horizontal"
                  type="entypo"
                />
              ) : status === 'RECORDING' ? (
                <Icon size={40} reverse name="stop" type="foundation" />
              ) : (
                <Icon
                  size={40}
                  reverse
                  name="record"
                  type="foundation"
                  color="#c00"
                />
              )}
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }
}
export const AddVideo = connect(
  state => {
    return {
      patient: state.state.patients.get(state.state.patientId),
    };
  },
  {addMedia},
)(AddVideoComponent);

AddVideo.navigationOptions = ({navigation}) => {
  return {title: "Vidéo de l'oeil"};
};

export const PlayVideo = () => {
  const uri = useNavigationParam('uri');
  return (
    <View style={{flex: 1}}>
      <ExpoVideo
        style={{flex: 1, backgroundColor: '#ccc'}}
        source={{uri: uri}}
        isMuted={true}
        volume={0}
        resizeMode="stretch"
        useNativeControls
      />
    </View>
  );
};
