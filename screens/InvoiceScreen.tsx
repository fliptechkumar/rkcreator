import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform, TouchableOpacity, Text, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Invoice'>;

export default function InvoiceScreen({ navigation, route }: Props) {
  const { html, url } = route.params || {};
  const [menuVisible, setMenuVisible] = useState(false);

  const onPrint = async () => {
    try {
      if (html) {
        await Print.printAsync({ html });
      } else if (url) {
        await Print.printAsync({ uri: url });
      } else {
        Alert.alert('Nothing to print');
      }
    } catch (e: any) {
      //console.error('Print error', e);
      Alert.alert('Print failed', e?.message || String(e));
    } finally {
      setMenuVisible(false);
    }
  };

  const onClose = () => {
    navigation.goBack();
  };

  const renderWebView = () => (
    <WebView
      originWhitelist={["*"]}
      source={ html ? { html } : { uri: url } }
      startInLoadingState
      renderLoading={() => (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2BC0AC" />
        </View>
      )}
      style={styles.webview}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.iconButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer} />

        <View>
             <TouchableOpacity style={styles.menuItem} onPress={onPrint}>
                <Ionicons name="print" size={22} color="#333" />
              </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.iconButton}>
            <Ionicons name="ellipsis-vertical" size={22} color="#333" />
          </TouchableOpacity> */}
          {/* {menuVisible && (
            <View style={styles.menu}>
              <TouchableOpacity style={styles.menuItem} onPress={onPrint}>
                <Text style={styles.menuText}>Print</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={onClose}>
                <Text style={styles.menuText}>Close</Text>
              </TouchableOpacity>
            </View>
          )} */}
        </View>
      </View>

      {renderWebView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff',marginTop:60 },
  webview: { flex: 1, marginTop: Platform.OS === 'ios' ? 0 : 0 },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    height: 56,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
    zIndex: 20,
  },
  iconButton: {
    padding: 8,
  },
  headerTitleContainer: { flex: 1 },
  menu: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
  },
});
