import { View, Text, TextInput, Button } from "react-native";

export default function LoginScreen() {
  return (
    <View>
      <Text>Login</Text>
      <TextInput placeholder="Email" />
      <TextInput placeholder="Password" secureTextEntry />
      <Button title="Ingresar" />
    </View>
  );
}