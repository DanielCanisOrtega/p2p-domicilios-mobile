import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';

interface AvatarProps {
  name?: string;
  size?: number;
  backgroundColor?: string;
}

export default function Avatar({ name, size = 48, backgroundColor = THEME.primary }: AvatarProps) {
  const getInitials = (text?: string) => {
    if (!text) return 'U';
    return text.charAt(0).toUpperCase();
  };

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      <Text style={[styles.text, { fontSize: size / 2.5 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
  },
});
