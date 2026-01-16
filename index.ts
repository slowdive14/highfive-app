import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// Fix for Web Scrolling: Ensure root elements have 100% height
if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
    html, body {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #FAFAFA; /* Matches Colors.ui.background */
    }
    #root {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
  `;
    document.head.appendChild(style);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
