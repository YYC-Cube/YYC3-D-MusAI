declare module 'react-native-vector-icons/Ionicons' {
  import { Component } from 'react'
  import { ViewStyle, TextStyle, ImageSourcePropType } from 'react-native'

  interface IconProps {
    name: string
    size?: number
    color?: string | string[]
    style?: ViewStyle | TextStyle
  }

  export default class Icon extends Component<IconProps> {}

  export const glyphMap: Record<string, number>
}

declare module '@react-navigation/stack' {
  import { StackNavigationOptions } from '@react-navigation/native'

  export type RouteProp<
    ParamList extends { [key: string]: object | undefined },
    RouteName extends keyof ParamList
  > = {
    key: string
    name: RouteName
    params: ParamList[RouteName]
  }

  export type NavigationProp<
    ParamList extends { [key: string]: object | undefined },
    RouteName extends keyof ParamList = keyof ParamList
  > = {
    navigate<RouteName extends keyof ParamList>(
      ...args: undefined extends ParamList[RouteName]
        ? [RouteName] | [RouteName, ParamList[RouteName]]
        : [RouteName, ParamList[RouteName]]
    ): void
    goBack(): void
  }

  export type StackNavigationProp<
    ParamList extends { [key: string]: object | undefined },
    RouteName extends keyof ParamList = keyof ParamList
  > = NavigationProp<ParamList, RouteName>
}

declare module 'socket.io-client' {
  import { EventEmitter } from 'events'

  export interface SocketOptions {
    transports?: string[]
    timeout?: number
    [key: string]: unknown
  }

  export interface Socket extends EventEmitter {
    id: string
    connected: boolean
    connect(): void
    disconnect(): void
    emit(event: string, ...args: unknown[]): void
    on(event: string, callback: (...args: unknown[]) => void): void
    off(event: string, callback?: (...args: unknown[]) => void): void
  }

  export function io(url: string, options?: SocketOptions): Socket
  export default io
}

declare module 'expo-image-picker' {
  export interface ImagePickerResult {
    canceled: boolean
    assets?: Array<{
      uri: string
      width: number
      height: number
      type?: string
    }>
  }

  export interface ImagePickerOptions {
    mediaTypes?: string
    allowsEditing?: boolean
    aspect?: [number, number]
    quality?: number
  }

  export function requestMediaLibraryPermissionsAsync(): Promise<{ granted: boolean }>
  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>
  export function requestCameraPermissionsAsync(): Promise<{ granted: boolean }>
  export function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>

  export const MediaTypeOptions: {
    Images: string
    Videos: string
    All: string
  }
}
