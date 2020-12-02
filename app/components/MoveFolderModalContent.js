import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';

import { SearchBar, FolderRowItem, ModalButton } from '@components';
import Colors from '../constants/colors';
import {
  FOLDER_OTHER_TYPE,
  FOLDER_INBOX_TYPE,
  FOLDER_DELETED_TYPE,
  FOLDER_SENT_TYPE,
} from '../constants/constants';
import images from '@assets/images';
import { userStore } from '../stores';

let { width, height } = Dimensions.get('window');

class MoveFolderModalContent extends Component {
  state = {
    searchText: '',
    selected: null,
  };

  changeSearchBarText(searchText) {
    this.setState({ searchText });
  }

  clearSearchBarText() {
    this.setState({ searchText: '' });
  }

  onFolderPress(folderId) {
    this.setState({ selected: folderId });
  }

  onSubmit() {
    this.props.onSubmit(this.state.selected);
  }

  render() {
    const { data } = this.props;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.innerContainer}>
          <Text style={{ marginBottom: 8 }}>Select folder to move:</Text>
          <SearchBar
            onChangeText={text => this.changeSearchBarText(text)}
            onClear={() => this.clearSearchBarText()}
            placeholder="Folders search"
            value={this.state.searchText}
            style={{ marginVertical: 8 }}
          />
          <FlatList
            renderItem={({ item }) => (
              <FolderRowItem
                onPress={() => this.onFolderPress(item.id)}
                icon={
                  item.type == FOLDER_INBOX_TYPE
                    ? images.icon_inbox
                    : item.type == FOLDER_SENT_TYPE
                      ? 'send'
                      : item.type == FOLDER_DELETED_TYPE
                        ? 'delete'
                        : images.icon_label
                }
                isImage={
                  item.type == FOLDER_INBOX_TYPE ||
                  item.type == FOLDER_OTHER_TYPE
                }
                title={item.name}
                selected={this.state.selected == item.id}
              />
            )}
            data={
              !!this.state.searchText
                ? data.filter(item =>
                    item.name
                      .toLowerCase()
                      .includes(this.state.searchText.toLowerCase()),
                  )
                : data
            }
            extraData={this.state.selected}
          />
          <ModalButton
            onPress={() => this.onSubmit()}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 4,
    padding: 8,
    height: height / 2,
    width: width / 1.4,
  },
  items: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 0.5,
    borderColor: Colors.greyBorderColor,
  },
});

export default MoveFolderModalContent;
