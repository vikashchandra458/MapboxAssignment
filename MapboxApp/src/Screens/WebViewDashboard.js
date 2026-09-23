import React, { useState } from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import WebView from "react-native-webview";

export default function WebViewDashboard({ navigation, route }) {
  let initialUrl = route?.params?.url || 'www.google.com'
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState(initialUrl);
  // let default_district = "Vikarabad"
  // let default_mondal = "Doulatabad"

  const handleWebViewMessage = event => {
    const message = event.nativeEvent.data;
    console.log('Message from WebView:', message);
  };
  const handleWebViewError = () => {
    const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    ToastAndroid.show('URL not valid, redirecting to Google Search...', ToastAndroid.LONG);
    setUrl(fallbackUrl);
  };

  return (
    <WebView
      source={{
        uri: url,
      }}
      style={styles.webview}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      allowsInlineMediaPlayback={true}
      startInLoadingState={true}
      scalesPageToFit={true}
      allowFileAccess={true}
      mediaPlaybackRequiresUserAction={false}
      cacheEnabled={true}
      incognito={false}
      sharedCookiesEnabled={true}
      onError={handleWebViewError}
      onHttpError={handleWebViewError}
      onMessage={handleWebViewMessage}

    // injectedJavaScript={`
    //   const checkAndSelectDistrict = setInterval(() => {
    //     let districtOptions = document.querySelectorAll('#district option');
    //     districtOptions.forEach(option => {
    //       if (option.textContent.trim() === "${default_district}") {
    //         option.selected = true;
    //         document.querySelector('#district').dispatchEvent(new Event('change'));
    //         clearInterval(checkAndSelectDistrict); // Stop checking once selected

    //         // After district selection, check and select mandal
    //         const checkAndSelectMandal = setInterval(() => {
    //           let mandalOptions = document.querySelectorAll('#mandal option');
    //           mandalOptions.forEach(option => {
    //             if (option.textContent.trim() === "${default_mondal}") {
    //               option.selected = true;
    //               document.querySelector('#mandal').dispatchEvent(new Event('change'));
    //               clearInterval(checkAndSelectMandal); // Stop checking once selected
    //             }
    //           });
    //         }, 1000); // Check mandal every 1 second
    //       }
    //     });
    //   }, 1000); // Check district every 1 second
    // `}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    // marginTop: 25
  },
});
