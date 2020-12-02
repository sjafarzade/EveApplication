import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleSheet,
  WebView,
  Platform,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Switch} from 'react-native-switch';
import {PermissionsAndroid} from 'react-native';
import HTMLView from 'react-native-htmlview';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import RNFetchBlob from 'rn-fetch-blob';
import * as mime from 'react-native-mime-types';
import Toast, {DURATION} from 'react-native-easy-toast';

import generalStyles from '../constants/styles';

import {Header, ToastView} from '@components';
import Colors from '../constants/colors';
import images from '@assets/images';
import {
  downloadAttachmen,
  changeCorrespondenceSeenQuery,
  downloadAttachmentQuery,
  getUsernameQuery,
} from '../network/queries';
import {MAIL_CONTEXT} from '../constants/mockData';
import {
  priorityToText,
  extractContent,
  getAttachmentFileName,
  getAttachmentFileAddress,
  checkFileExists,
} from '../utils';
import {userStore} from '../stores';

let {width, height} = Dimensions.get('window');

const MailViewButton = ({title, icon, isImage, onPress}) => (
  <TouchableOpacity style={mailViewButtonStyles.container} onPress={onPress}>
    <Text style={[generalStyles.englishText, mailViewButtonStyles.text]}>
      {title}
    </Text>
    {isImage ? (
      <Image style={mailViewButtonStyles.image} source={icon} />
    ) : (
      <Icon name={icon} style={mailViewButtonStyles.icon} />
    )}
  </TouchableOpacity>
);

const mailViewButtonStyles = StyleSheet.create({
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
    fontSize: 14,
    marginEnd: 8,
  },
  image: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: Colors.headerBackgroundColor,
  },
  icon: {
    color: Colors.headerBackgroundColor,
    fontSize: 20,
  },
});

class AttachmentsItems extends Component {
  constructor() {
    super();
    this.downloadTask = null;
    this.state = {
      progress: 0,
      done: false,
      downloading: false,
    };
  }

  componentDidMount() {
    this.setFileExistanceInStorage();
  }

  async setFileExistanceInStorage() {
    const {correspondence, attachment} = this.props;
    const exist = await checkFileExists(attachment, correspondence);
    this.setState({done: exist});
  }

  setProgress(progress) {
    this.setState({progress});
  }

  setDownloadTask(task) {
    this.downloadTask = task;
  }

  onDownloadingStart() {
    const {
      correspondence,
      attachment,
      attachment: {id: attachmentId},
      onDownload,
    } = this.props;
    const fileName = getAttachmentFileName(attachment, correspondence);
    this.setState({downloading: true});
    this.props.onDownload(
      attachmentId,
      fileName,
      () => this.onDownloadingEnd(),
      () => this.onDownloadingCancel(false),
      progress => this.setProgress(progress),
      task => this.setDownloadTask(task),
    );
  }

  onDownloadingCancel(userInteraction = false) {
    if (userInteraction) {
      const self = this;
      const {correspondence, attachment} = this.props;
      const fileAddress = getAttachmentFileAddress(attachment, correspondence);
      if (!!this.downloadTask) {
        this.downloadTask.cancel(err => {
          if (!err) {
            setTimeout(async function() {
              self.setState({downloading: false, progress: 0, done: false});
              await RNFetchBlob.fs.unlink(fileAddress);
            }, 200);
          }
        });
      }
    } else {
      this.setState({downloading: false, progress: 0, done: false});
    }
  }

  onDownloadingEnd() {
    this.setState({done: true, downloading: false, progress: 100});
  }

  onOpenFile() {
    const {correspondence, attachment, showErrorToast} = this.props;
    const fileAddress = getAttachmentFileAddress(attachment, correspondence);
    const mimeType = mime.lookup(attachment.fileName);
    if (!mimeType) {
      showErrorToast('Please review this form on web application!');
      return;
    }
    if (Platform.OS === 'ios') {
      const address = fileAddress.replace('file://', '');
      RNFetchBlob.ios.openDocument(fileAddress.replace('file://', ''));
    } else {
      RNFetchBlob.android.actionViewIntent(fileAddress, mimeType);
    }
  }

  render() {
    const {correspondence, attachment, onDownload} = this.props;
    const {downloading, done, progress} = this.state;
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 8,
          marginVertical: 8,
          width: width / 2,
          borderRadius: 4,
          backgroundColor: '#EBEDEF',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            marginEnd: 8,
          }}>
          <Image
            style={{
              width: 16,
              height: 16,
              resizeMode: 'contain',
              marginEnd: 4,
            }}
            source={images.icon_attachment}
          />
          <Text
            style={[
              generalStyles.englishText,
              {fontSize: 12, color: Colors.textLightColor},
            ]}
            numberOfLines={1}>
            {attachment.fileName}
          </Text>
        </View>

        {this.state.downloading && (
          <AnimatedCircularProgress
            size={16}
            width={1.5}
            fill={progress}
            tintColor={Colors.loginBackgroundColor}
            onAnimationComplete={() => console.log('onAnimationComplete')}
            backgroundColor={Colors.lightGreyColor}
            rotation={0}
          />
        )}
        <TouchableOpacity
          style={{paddingHorizontal: 8, paddingVertical: 4}}
          onPress={() => {
            if (done) {
              this.onOpenFile();
            } else if (downloading) {
              this.onDownloadingCancel(true);
            } else {
              this.onDownloadingStart();
            }
          }}>
          <Icon
            name={done ? 'folder' : downloading ? 'cancel' : 'get-app'}
            style={{fontSize: 18, color: Colors.textLightColor}}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

class MailViewBody extends Component {
  async requestFilePermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {}
  }

  async onDownloadAttachment(
    attachmentId,
    fileName,
    onDownloadEnd,
    onDownloadCancel,
    setProgress,
    setTask,
  ) {
    await this.requestFilePermission();
    await downloadAttachmentQuery(
      attachmentId,
      fileName,
      onDownloadEnd,
      onDownloadCancel,
      setProgress,
      setTask,
    );
  }

  render() {
    const {
      content,
      correspondence,
      onReply,
      onReplyAll,
      onForward,
      showErrorToast,
    } = this.props;
    return (
      <View style={mailViewBodyStyles.container}>
        <ScrollView style={{flex: 1, paddingHorizontal: 15}}>
          <HTMLView value={content} />
          <View>
            <FlatList
              data={correspondence.attachments}
              renderItem={({item: attachment}) => (
                <AttachmentsItems
                  showErrorToast={message => showErrorToast(message)}
                  correspondence={correspondence}
                  attachment={attachment}
                  onDownload={(
                    attachmentId,
                    fileName,
                    onDownloadEnd,
                    onDownloadCancel,
                    setProgress,
                    setTask,
                  ) =>
                    this.onDownloadAttachment(
                      attachmentId,
                      fileName,
                      onDownloadEnd,
                      onDownloadCancel,
                      setProgress,
                      setTask,
                    )
                  }
                />
              )}
            />
          </View>
        </ScrollView>

        <View style={mailViewBodyStyles.buttonContainer}>
          <MailViewButton
            title="Reply"
            icon="replay"
            isImage={false}
            onPress={() => onReply()}
          />
          <MailViewButton
            title="Reply All"
            icon={images.icon_reply_all}
            isImage
            onPress={() => onReplyAll()}
          />
          <MailViewButton
            title="Forward"
            icon={images.icon_forward}
            isImage
            onPress={() => onForward()}
          />
        </View>
      </View>
    );
  }
}

const mailViewBodyStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 8,
    padding: 8,
  },
  textContainer: {
    flex: 4,
    marginLeft: 16,
    padding: 8,
  },
  mailText: {
    color: Colors.textLightColor,
    fontSize: 15,
    textAlign: 'left',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: Colors.greyBorderColor,
    padding: 8,
    justifyContent: 'space-between',
  },
});

const HeaderRow = ({title, data, withBorder, boldText}) => (
  <View
    style={[
      generalStyles.composeItemsStyle,
      withBorder ? headerRowStyles.withBorder : {},
    ]}>
    <Text style={[generalStyles.englishText, headerRowStyles.title]}>
      {title}:
    </Text>
    <Text
      style={[
        styles.englishText,
        headerRowStyles.text,
        boldText ? headerRowStyles.boldText : {},
      ]}
      numberOfLines={1}>
      {data}
    </Text>
  </View>
);

const headerRowStyles = StyleSheet.create({
  title: {
    color: Colors.textDarkColor,
    fontSize: 14,
    marginLeft: 16,
  },
  text: {
    color: Colors.textLightColor,
    fontSize: 14,
    marginHorizontal: 8,
    flex: 1,
  },
  withBorder: {
    borderRightWidth: 1,
    borderColor: Colors.greyBorderColor,
  },
  boldText: {fontWeight: 'bold'},
});

class MailViewHeader extends Component {
  render() {
    const {from, Ccs, refType, priority, to} = this.props;
    return (
      <View style={{flexDirection: 'row'}}>
        <View style={mailViewHeaderStyles.container}>
          <HeaderRow title="From" data={from} />
          <HeaderRow title="To" data={to} />

          {!!Ccs && <HeaderRow title="Ccs" data={Ccs} />}
          <View style={{flexDirection: 'row', flex: 1}}>
            <HeaderRow title="Reference Type" data={refType} withBorder />
            <HeaderRow title="Priority" data={priorityToText(priority)} />
          </View>
        </View>
      </View>
    );
  }
}

const mailViewHeaderStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 16,
    flex: 1,
    height: height / 5.6,
  },
});

export default class MailView extends Component {
  constructor(props) {
    super(props);
    const {correspondence} = this.props.navigation.state.params;
    this.correspondence = correspondence;
  }

  componentDidMount() {
    const {contentId, number} = this.correspondence;
    changeCorrespondenceSeenQuery(contentId, number);
    userStore.changeCorrespondenceSeenInStore(number);
  }

  onBackPress() {
    this.props.navigation.pop();
  }

  async onReply() {
    const {
      fromID,
      senderName,
      subject,
      receivers,
      toID,
      toName,
    } = this.correspondence;
    let mailSubject = '';
    let toList = [];
    if (subject.substring(0, 4) !== 'Re: ') {
      mailSubject = 'Re: ' + subject;
    }

    if (fromID == userStore.userInfo.userId) {
      toList = [{name: toName, id: toID}];
      if (!!receivers) {
        toList.push(
          ...receivers.split(',').map(item => {
            return {name: item};
          }),
        );
      }
    } else {
      toList = [{id: fromID, name: senderName}];
    }
    this.props.navigation.navigate('MailCompose', {
      toList,
      subject: mailSubject,
    });
  }

  onReplyAll() {
    const {
      toID,
      toName,
      fromID,
      senderName,
      subject,
      receivers,
      receiverCopy,
    } = this.correspondence;
    let toList = [];
    let ccList = [];
    let mailSubject = '';
    if (subject.substring(0, 4) !== 'Re: ') {
      mailSubject = 'Re: ' + subject;
    }
    toList = [{name: toName, id: toID}];
    if (!!receivers) {
      toList.push(
        ...receivers.split(',').map(item => {
          return {name: item};
        }),
      );
    }
    if (!!receiverCopy)
      ccList.push(
        ...receiverCopy.split(',').map(item => {
          return {name: item};
        }),
      );
    if (fromID !== userStore.userInfo.userId) {
      toList = toList.filter(item => item.name !== userStore.userInfo.username);
      ccList = ccList.filter(item => item.name !== userStore.userInfo.username);
      toList.unshift({id: fromID, name: senderName});
    }
    this.props.navigation.navigate('MailCompose', {
      toList,
      ccList,
      subject: mailSubject,
    });
  }

  onForward() {
    const {
      content,
      subject,
      letterNo,
      number,
      attachments,
    } = this.correspondence;
    let mailSubject = '';
    let mailContent = extractContent(content);
    if (subject.substring(0, 4) !== 'Fw: ') {
      mailSubject = 'Fw: ' + subject;
    }
    this.props.navigation.navigate('MailCompose', {
      content: mailContent,
      subject: mailSubject,
      attachments,
      letterNo,
      number,
    });
  }

  showErrorToast(message) {
    this.refs.errorToast.show(<ToastView message={message} />, 2000);
  }

  render() {
    const {
      subject,
      fromName,
      toName,
      subjectCatagory,
      enDate,
      receivers,
      receiverCopy,
      urgencyType,
      letterNo,
      secure,
      seen,
      attachments,
      content,
    } = this.correspondence;
    let toString = toName;
    if (!!receivers) {
      toString = toString + `,${receivers}`;
    }
    return (
      <View style={generalStyles.container}>
        <Header
          left={{
            icon: userStore.userPicture
              ? {uri: `data:image/png;base64,${userStore.userPicture}`}
              : images.icon_user,
          }}
        />
        <View style={[generalStyles.mailContainer]}>
          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
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
                <Text
                  style={[
                    generalStyles.englishText,
                    styles.text,
                    {textAlign: 'left'},
                  ]}>
                  {subject}
                </Text>
              </TouchableOpacity>

              {secure ? (
                <View style={styles.confidentialContainer}>
                  <Text style={styles.confidentialText}>Confidential</Text>
                  <Image
                    source={images.icon_archive}
                    style={styles.confidentialIcon}
                  />
                </View>
              ) : (
                <View />
              )}
            </View>
          </View>
          <MailViewHeader
            from={fromName}
            to={toString}
            Ccs={receiverCopy}
            refType={subjectCatagory}
            priority={urgencyType}
          />
          <View style={{flexDirection: 'row', flex: 1}}>
            <MailViewBody
              content={content}
              onReply={() => this.onReply()}
              correspondence={this.correspondence}
              onReplyAll={() => this.onReplyAll()}
              onForward={() => this.onForward()}
              showErrorToast={message => this.showErrorToast(message)}
            />
          </View>
        </View>
        <Toast
          ref="errorToast"
          style={{backgroundColor: Colors.lightRed}}
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
    fontSize: 14,
  },
  confidentialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidentialText: {
    color: Colors.darkYellowColor,
    fontWeight: 'bold',
    fontSize: 12,
    marginEnd: 8,
  },
  confidentialIcon: {
    tintColor: Colors.darkYellowColor,
    height: 24,
    width: 24,
    resizeMode: 'contain',
  },
});
