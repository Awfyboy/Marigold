import { StyleSheet, Pressable, View, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

type Props = {
  imageUri?: string;
  onSelectImage: (uri: string) => void;
};

export default function PhotoField({ imageUri, onSelectImage }: Props) {
  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Pressable style={styles.changeButton} onPress={() => {}}>
            <Ionicons name="camera" size={20} color="#ffffff" />
            <Text style={styles.changeText}>Change Photo</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.placeholder} onPress={() => {}}>
          <Ionicons name="camera" size={48} color={Colors.navGreen} />
          <Text style={styles.placeholderText}>Select a Photo</Text>
          <Text style={styles.placeholderSubtext}>Camera or Album</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  placeholder: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.navGreen,
    borderStyle: 'dashed',
    height: 200,
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
    marginTop: 4,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
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
});
