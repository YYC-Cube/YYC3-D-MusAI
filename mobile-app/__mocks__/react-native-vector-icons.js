import React from 'react';
import { Text } from 'react-native';

export default function MockIcon({ name, size, color, style }) {
  return <Text style={[{ fontSize: size, color }, style]}>{name}</Text>;
}
