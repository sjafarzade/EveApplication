import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Colors from '../constants/colors';
import generalStyles from '../constants/styles';
import { userStore } from '../stores';
import Modal from 'react-native-modal';

import { SearchBar, FooterLoading } from '@components';
import { PAGE_SIZE } from '../constants/constants';

let { width, height } = Dimensions.get('window');

const LookUpModalItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.items} onPress={() => onPress(item)}>
    <Text>{item.username}</Text>
  </TouchableOpacity>
);

class LookUpModal extends Component {
  state = {
    searchText: '',
  };

  changeSearchBarText(searchText) {
    this.setState({ searchText });
  }

  clearSearchBarText() {
    this.setState({ searchText: '' });
  }

  render() {
    const {
      data,
      onPress,
      type,
      visible,
      toggleModal,
      loadingMore,
      onLoadMore,
    } = this.props;
    return (
      <Modal
        isVisible={visible}
        onBackButtonPress={toggleModal}
        onBackdropPress={toggleModal}
      >
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          pointerEvents="box-none"
        >
          <View style={styles.innerContainer}>
            <Text>Select one to send:</Text>
            <SearchBar
              onChangeText={text => this.changeSearchBarText(text)}
              onClear={() => this.clearSearchBarText()}
              placeholder="Persons search"
              value={this.state.searchText}
              style={{ marginVertical: 8 }}
            />
            <FlatList
              renderItem={({ item }) => (
                <LookUpModalItem
                  item={item}
                  onPress={item => onPress(item, type)}
                />
              )}
              data={
                !!this.state.searchText
                  ? data.filter(item =>
                      item.username
                        .toLowerCase()
                        .includes(this.state.searchText.toLowerCase()),
                    )
                  : data
              }
              ListFooterComponent={() => (
                <FooterLoading loading={loadingMore} />
              )}
              onEndReached={() => onLoadMore()}
              disableVirtualization={true}
            />
          </View>
        </View>
      </Modal>
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

export default LookUpModal;
