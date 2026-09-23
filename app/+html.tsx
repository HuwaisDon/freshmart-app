import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />

        <link rel="manifest" href="/manifest.json" />

        <meta name="theme-color" content="#2E7D32" />

        <link rel="icon" href="/assets/images/logo.png" />

        <ScrollViewStyleReset />
      </head>

      <body>{children}</body>
    </html>
  );
}