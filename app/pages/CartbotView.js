import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Keyboard,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NavigationActions, StackActions} from 'react-navigation';
import Modal from 'react-native-modal';
import Toast, {DURATION} from 'react-native-easy-toast';

import generalStyles from '../constants/styles';
import {
  returnBackfromApprove,
  confirmationAprrove,
  confirmationDeny,
  confirmationArchive,
  getConfirmationQuery,
  masterDetailesQuery,
} from '../network/queries';
import {CONFIRMATION_DEFAULT_FILTER} from '../constants/constants';
import {Header, ListLoading} from '@components';
import Colors from '../constants/colors';
import images from '@assets/images';
import {base64ToString} from '../utils';
import {DescriptionModal, ToastView} from '@components';
import {userStore} from '../stores';

const {width, height} = Dimensions.get('window');

const cartbotGridViewRowStyles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.disabledTextColor,
  },
  date: {
    color: Colors.textDarkColor,
    fontSize: 12,
  },
  card: {color: Colors.headerBackgroundColor, fontSize: 12, marginEnd: 20},
});

const CartbotGridButton = ({text, type, onPress, source}) => (
  <TouchableOpacity style={cartbotGridButtonStyles.container} onPress={onPress}>
    <Text style={[generalStyles.englishText, cartbotGridButtonStyles.text]}>
      {text}
    </Text>
    {type ? (
      <Icon name={type} style={cartbotGridButtonStyles.icon} />
    ) : (
      <Image
        source={source}
        style={{
          width: 15,
          height: 15,
          tintColor: Colors.headerBackgroundColor,
        }}
      />
    )}
  </TouchableOpacity>
);

const cartbotGridButtonStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  text: {
    color: Colors.headerBackgroundColor,
    fontWeight: 'bold',
    fontSize: 13,
    marginEnd: 8,
  },
  icon: {color: Colors.headerBackgroundColor, fontSize: 20},
});

// const MasterDataRow = ({ title, data }) => (
//   <View style={{ flexDirection: 'row' }}>
//     <cartbotBody>{title}</Text>
//     <Text>{data}</Text>
//   </View>
// );

const CartbotGridView = ({
  gridData,
  onPressAccept,
  onPressDeny,
  onPressArchive,
  onPressReturn,
  loading,
  data,
}) => (
  <View style={cartbotGridViewStyles.container}>
    <View style={cartbotGridViewStyles.header}>
      <Text style={[generalStyles.englishText, cartbotGridViewStyles.title]}>
        Master Data
      </Text>
    </View>
    <View style={{height: 1, backgroundColor: Colors.disabledTextColor}} />
    <View style={{flex: 1}}>
      <ScrollView>
        <View style={{flex: 1}}>
          <CartbotBodyRow title={'Title'} data={'Data'} />
          {Object.keys(data).map(item => (
            <CartbotBodyRow
              title={item}
              data={data[item]}
              style={{paddingVertical: 8}}
            />
          ))}
        </View>
      </ScrollView>
    </View>
    <View style={cartbotGridViewStyles.actionsContainer}>
      <CartbotGridButton type="check" text="Accept" onPress={onPressAccept} />
      <CartbotGridButton type="close" text="Deny" onPress={onPressDeny} />
      <CartbotGridButton
        source={images.icon_return}
        text="Return"
        onPress={onPressReturn}
      />
      <CartbotGridButton
        source={images.icon_archive}
        text="Archive"
        onPress={onPressArchive}
      />
    </View>
  </View>
);

const cartbotGridViewStyles = StyleSheet.create({
  container: {
    flex: 3,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 16,
    width: width / 1.1,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 8,
    paddingStart: 12,
  },
  title: {color: '#8091A1', fontSize: 13},
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: Colors.greyBorderColor,
    padding: 8,
    justifyContent: 'space-between',
  },
});

const CartbotBodyRow = ({title, data, style}) => (
  <View>
    <ScrollView
      contentContainerStyle={{flexGrow: 1}}
      horizontal={true}
      showsHorizontalScrollIndicator={false}>
      <View style={[cartbotBodyRowStyles.container, {style}]}>
        <Text
          style={[
            generalStyles.englishText,
            cartbotBodyRowStyles.title,
            {
              flex: 1,
              textAlign: 'left',
              marginStart: 16,
            },
          ]}
          numberOfLines={1}>
          {title}
        </Text>
        <Text
          style={[
            generalStyles.englishText,
            cartbotBodyStyles.data,
            {flex: 2, textAlign: 'left', marginStart: 16},
          ]}
          numberOfLines={1}>
          {data}
        </Text>
      </View>
    </ScrollView>
    <View
      style={{
        height: 1,
        backgroundColor: Colors.disabledTextColor,
      }}
    />
  </View>
);

const cartbotBodyRowStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 4,
    flexDirection: 'row',
  },
  title: {color: Colors.textDarkColor, fontSize: 14},
  data: {color: Colors.textLightColor, fontSize: 14},
});

const CartbotBodyDescription = ({title, data}) => (
  <View style={cartbotBodyDescriptionStyles.container}>
    <ScrollView>
      <Text
        style={[generalStyles.englishText, cartbotBodyDescriptionStyles.title]}>
        {title}:
      </Text>
      <Text
        style={[
          generalStyles.englishText,
          cartbotBodyDescriptionStyles.data,
          {
            color: !!data ? Colors.textLightColor : Colors.lightGreyColor,
          },
        ]}>
        {!!data ? data : '[not returned or denied]'}
      </Text>
    </ScrollView>
    <View
      style={{
        height: 1,
        backgroundColor: Colors.disabledTextColor,
      }}
    />
  </View>
);

const cartbotBodyDescriptionStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 4,
  },
  title: {color: Colors.textDarkColor, fontSize: 14, marginStart: 16},
  data: {fontSize: 14, marginStart: 16},
});

const CartbotBody = ({from, creator, title, description}) => (
  <View style={cartbotBodyStyles.container}>
    <CartbotBodyRow title="Title" data={title} />
    <CartbotBodyRow title="From" data={from} />
    <CartbotBodyRow title="Creator" data={creator} />
    <CartbotBodyDescription
      title="Return or Deny Description"
      data={description}
    />
  </View>
);

const cartbotBodyStyles = StyleSheet.create({
  container: {
    width: width / 1.1,
    flex: Platform.OS === 'ios' ? 3 : 2,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 16,
  },
});

export default class CartbotView extends Component {
  constructor(props) {
    super(props);
    const {confirmation} = this.props.navigation.state.params;
    this.confirmation = confirmation;
    this.state = {
      showModal: false,
      description: null,
      type: '',
      gridLoading: false,
      loadingConfirmButtons: false,
      loadingSubmitButton: false,
      masterData: {},
    };
  }

  async componentDidMount() {
    this.setState({gridLoading: true});
    const masterData = await masterDetailesQuery(
      this.confirmation.formId,
      this.confirmation.id,
    );
    this.setState({masterData, gridLoading: false});
  }

  onBackPress() {
    this.props.navigation.goBack();
  }
  onPressHistoryOfActions(confirmation) {
    this.props.navigation.navigate('HistoryOfActions', {
      confirmation,
    });
  }

  onPressModalButton() {
    if (this.state.type == 'Deny') {
      this.denyConfirmation();
    } else if (this.state.type == 'Return') {
      this.returnConfirmation();
    }
  }

  onChangeDescription(text) {
    this.setState({description: text});
  }

  showModal(type) {
    this.setState({
      showModal: true,
      type,
      description: '',
    });
  }

  dismissModal() {
    this.setState({
      showModal: false,
      type: '',
      description: '',
    });
  }

  async acceptConfirmation() {
    const {
      description,
      formId,
      formName,
      historyId,
      recordId,
      userId,
      id,
    } = this.confirmation;
    this.setState({loadingConfirmButtons: true});

    const approveRes = await confirmationAprrove(
      description,
      formId,
      formName,
      historyId,
      id,
      userId,
    );
    this.setState({loadingConfirmButtons: false});
    if (!approveRes) {
      this.refs.errorToast.show(
        <ToastView message="Error in Approving Confirmation" />,
        2000,
      );
      return;
    }
    userStore.removeConfirmationFromStore(id);
    this.props.navigation.pop();
  }

  async returnConfirmation() {
    Keyboard.dismiss();
    const {
      formId,
      formName,
      historyId,
      recordId,
      userId,
      id,
    } = this.confirmation;
    this.setState({loadingSubmitButton: true});
    const returnRes = await returnBackfromApprove(
      this.state.description,
      formId,
      formName,
      historyId,
      id,
      userId,
    );
    this.setState({loadingSubmitButton: false});
    if (!returnRes) {
      this.refs.errorToast.show(
        <ToastView message="Error in Denying Confirmation" />,
        2000,
      );
      return;
    }
    userStore.removeConfirmationFromStore(id);
    this.dismissModal();
    this.props.navigation.pop();
  }

  async denyConfirmation() {
    Keyboard.dismiss();
    const {
      formId,
      formName,
      historyId,
      recordId,
      userId,
      id,
    } = this.confirmation;
    this.setState({loadingSubmitButton: true});
    const denyRes = await confirmationDeny(
      this.state.description,
      formId,
      formName,
      historyId,
      id,
      userId,
    );
    this.setState({loadingSubmitButton: false});
    if (!denyRes) {
      this.refs.errorToast.show(
        <ToastView message="Error in Denying Confirmation" />,
        2000,
      );
      return;
    }
    userStore.removeConfirmationFromStore(id);
    this.dismissModal();
    this.props.navigation.pop();
  }

  async archiveConfirmation() {
    this.setState({loadingConfirmButtons: true});
    const ArchiveRes = await confirmationArchive(this.confirmation.historyId);
    this.setState({loadingConfirmButtons: false});
    if (!ArchiveRes) {
      this.refs.errorToast.show(
        <ToastView message="Error in Archiving Confirmation" />,
        2000,
      );
      return;
    }
    userStore.removeConfirmationFromStore(this.confirmation.id);
    this.props.navigation.pop();
  }

  render() {
    const {
      username,
      time_en,
      description,
      fromUsername,
      creator,
      attachments,
      procedureName,
      typeDescription,
    } = this.confirmation;

    return (
      <View style={{flex: 1}}>
        <DescriptionModal
          isVisible={this.state.showModal}
          onBackPress={() => {
            this.dismissModal();
          }}
          onBackdropPress={() => {
            this.dismissModal();
          }}
          onChangeDescription={text => this.onChangeDescription(text)}
          onSubmit={() => this.onPressModalButton()}
          loading={this.state.loadingSubmitButton}
        />

        <Modal isVisible={this.state.loadingConfirmButtons}>
          <ListLoading message="loading" />
        </Modal>

        <Header
          left={{
            icon: userStore.userPicture
              ? {uri: `data:image/png;base64,${userStore.userPicture}`}
              : images.icon_user,
          }}
          right={{
            icon: images.icon_report,
            onPress: () => this.onPressHistoryOfActions(this.confirmation),
          }}
        />
        <View style={[generalStyles.mailContainer, {alignItems: 'flex-start'}]}>
          <View
            style={{
              width: width,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingEnd: 20,
            }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => this.onBackPress()}>
              <Icon
                name="keyboard-arrow-left"
                style={{
                  fontSize: 15,
                  color: Colors.lightGreyColor,
                  marginTop: 2,
                }}
              />
              <Text style={[generalStyles.englishText, styles.text]}>
                {procedureName}
              </Text>
            </TouchableOpacity>
            <View style={{flexDirection: 'row', marginEnd: 8}}>
              <Text style={[generalStyles.englishText, styles.text]}>
                {time_en.substring(0, 10)}{' '}
              </Text>
              {!attachments && (
                <Image
                  style={{
                    width: width / 35,
                    height: height / 35,
                    resizeMode: 'contain',
                    marginEnd: 4,
                  }}
                  source={images.icon_attachment}
                />
              )}
            </View>
          </View>
          <CartbotBody
            from={fromUsername}
            creator={creator}
            title={typeDescription}
            description={description}
          />
          <CartbotGridView
            onPressArchive={() => {
              this.archiveConfirmation();
            }}
            onPressDeny={() => {
              this.showModal('Deny');
            }}
            onPressAccept={() => {
              this.acceptConfirmation();
            }}
            onPressReturn={() => {
              this.showModal('Return');
            }}
            loading={this.state.gridLoading}
            data={this.state.masterData}
          />
        </View>
        <Toast
          ref="errorToast"
          style={{backgroundColor: Colors.lightRed}}
          position="top"
          positionValue={32}
          textStyle={{color: Colors.white}}
        />
        <Toast
          ref="successToast"
          style={{
            backgroundColor: Colors.lightGreen,
            width: 200,
            alignItems: 'center',
          }}
          position="top"
          positionValue={32}
          textStyle={{color: Colors.white}}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    color: Colors.lightGreyColor,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
