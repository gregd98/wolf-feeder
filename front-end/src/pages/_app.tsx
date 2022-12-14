import React, { FC } from 'react';
import { AppProps } from 'next/app';
import '../styles/globals.css';

const App: FC<AppProps> = ({ Component, pageProps }) => <Component {...pageProps} />;

export default App;
