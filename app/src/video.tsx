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
import {RootState, store} from './store';
import {Media, Patient} from './store/patients/types';
import {addMedia} from './store/patients/actions';
import {getPatient} from './store/patients/reducers';
import {ListItem} from './listitem';
import {Path, Svg, Defs, Rect, Mask, Circle, G} from 'react-native-svg';

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
  const info = await FileSystem.getInfoAsync(uri);
  const size = info.size !== undefined ? info.size : 0;

  const media: Media = {
    filename: filename,
    uri: uri,
    timestamp: new Date(),
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
  const w = width + 1;
  const h = height;
  const path = `M 0 0 L 0 ${h} L ${w} ${h} L ${w} 0Z`;
  // console.log(w, h);

  return (
    <Svg height="100%" width="100%" viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <Mask id="mask">
          <Path d={path} fill="#fff" />
          <Circle r={`${w / 2}`} cx={`${w / 2}`} cy={`${w / 2}`} />
        </Mask>
      </Defs>
      <Path d={path} fill="black" mask="url(#mask)" />
      <Path
        d={`M 0 ${w} L ${w} ${w} L ${w} ${h + 200} L 0 ${h + 200}Z`}
        fill="black"
      />
    </Svg>
  );
};

const CircleMask = () => {
  const [w, setW] = useState<null | number>(null);
  const [h, setH] = useState<null | number>(null);
  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={event => {
        const {height, width} = event.nativeEvent.layout;
        setW(width);
        setH(height);
      }}>
      {h && w && <SvgMask height={h} width={w} />}
    </View>
  );
};

interface AddVideoProps {
  patient: Patient;
  addMedia: (patient: Patient, media: Media) => void;
}
function AddVideoComponent(props: AddVideoProps) {
  const {patient, addMedia} = props;
  const [hasCameraPermission, setCameraPermission] = useState<boolean | null>(
    null,
  );
  const [hasVideoPermission, setVideoPermission] = useState<boolean | null>(
    null,
  );
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
        <Camera
          style={{flex: 1}}
          type={type}
          ref={camera}
          flashMode={flash}
          autoFocus={Camera.Constants.AutoFocus.on}
        />
        <CircleMask />
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
              camera
                .current!.recordAsync({
                  maxDuration: 30,
                  quality: '720p',
                  // mute: true,
                })
                .then(video => {
                  setStatus('SAVING');
                  const timestamp = new Date();
                  const filename = `${timestamp
                    .toISOString()
                    .replace(/:/g, '')
                    .replace(/\./g, '-')}.${extension}`;
                  const directory = `${FileSystem.documentDirectory}${patient.id}/media/`;
                  const uri = `${directory}${filename}`;
                  const copy = () => {
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
                  };

                  FileSystem.getInfoAsync(directory).then(info => {
                    if (info.exists) {
                      copy();
                    } else {
                      FileSystem.makeDirectoryAsync(directory, {
                        intermediates: true,
                      }).then(copy);
                    }
                  });
                });
            } else {
              camera.current!.stopRecording();
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
    );
  }
}
export const AddVideo = connect(
  (state: RootState) => {
    return {
      patient: getPatient(state.patients),
    };
  },
  {addMedia},
)(AddVideoComponent);

AddVideoComponent.navigationOptions = () => {
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
