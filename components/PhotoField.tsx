import { StyleSheet, Pressable, View, Image, Text } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import ChoiceModal from '@/components/ChoiceModal';

type Props = {
  imageUri?: string;
  onSelectImage: (uri: string) => void;
  required?: boolean;
  error?: string;
};

export default function PhotoField({ imageUri, onSelectImage, required = false, error }: Props) {
  const [chooserVisible, setChooserVisible] = useState(false);

  const openPicker = async (source: 'camera' | 'album') => {
    const permissions =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissions.granted) {
      alert(
        source === 'camera'
          ? 'Please allow camera access to take a photo.'
          : 'Please allow photo library access to select a photo.'
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });

    if (!result.canceled && result.assets.length > 0) {
      onSelectImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={[styles.imageContainer, error && styles.imageContainerError]}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Pressable style={styles.changeButton} onPress={() => setChooserVisible(true)}>
            <Ionicons name="camera" size={20} color="#ffffff" />
            <Text style={styles.changeText}>Change Photo</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Pressable
            style={[styles.placeholder, error && styles.placeholderError]}
            onPress={() => setChooserVisible(true)}
          >
            <Ionicons name="camera" size={48} color={error ? Colors.errorRed : Colors.navGreen} />
            <Text style={[styles.placeholderText, error && styles.placeholderTextError]}>
              Select a Photo
            </Text>
            <Text style={styles.placeholderSubtext}>Take a photo with your camera or choose one from your album</Text>
          </Pressable>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </>
      )}

      {/* Camera / Album chooser */}
      <ChoiceModal
        visible={chooserVisible}
        title="Select a Photo"
        onClose={() => setChooserVisible(false)}
        options={[
          { label: 'Take Photo', icon: 'camera', onPress: () => openPicker('camera') },
          { label: 'Choose from Album', icon: 'images', onPress: () => openPicker('album') },
          { label: 'Cancel', icon: 'close', isCancel: true, onPress: () => {} },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  placeholder: {
    backgroundColor: Colors.bgYellow,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.navGreen,
    borderStyle: 'dashed',
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.navGreen,
    marginTop: 12,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: Colors.navGreen,
    marginTop: 8,
    marginLeft: 28,
    marginRight: 28,
    textAlign: 'center',
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 350,
  },
  changeButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.navGreen,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  placeholderError: {
    borderColor: Colors.errorRed,
  },
  placeholderTextError: {
    color: Colors.errorRed,
  },
  imageContainerError: {
    borderWidth: 2,
    borderColor: Colors.errorRed,
  },
  errorText: {
    color: Colors.errorRed,
    fontSize: 12,
    marginTop: 4,
  },
});