import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, TouchableOpacity, TouchableOpacityProps, Text } from 'react-native';

type Props = {
  href: string;
  children: React.ReactNode;
  style?: any;
};

export function ExternalLink({ href, children, style }: Props) {
  // For native platforms, use TouchableOpacity
  if (Platform.OS !== 'web') {
    return (
      <TouchableOpacity
        onPress={async () => {
          await openBrowserAsync(href);
        }}
        style={style}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  // For web, use Link with target="_blank"
  return (
    <Link
      target="_blank"
      href={href as any}
      style={style}
    >
      {children}
    </Link>
  );
}
