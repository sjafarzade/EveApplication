import React, { Component } from "react";
import {
  Text,
  View,
  ScrollView,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Picker,
  StyleSheet,
  FlatList,
  Platform,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { DotsLoader } from "react-native-indicator";
import splitEvery from "split-every";
import * as R from "ramda";
import Toast, { DURATION } from "react-native-easy-toast";
import { observer } from "mobx-react/native";

import { Switch } from "react-native-switch";
import { NavigationActions } from "react-navigation";

import generalStyles from "../constants/styles";
import { Header, LookUpModal, ToastView } from "@components";
import Colors from "../constants/colors";
import images from "@assets/images";
import {
  getPersonsLookupQuery,
  getPriorityLookupQuery,
  getReferenceTypeLookupQuery,
  postNewCorrespondence,
} from "../network/queries";
import { userStore } from "../stores";
import { PAGE_SIZE } from "../constants/constants";
import { createRandomId } from "../utils";
import WithKeyboardAvoiding from "../hoc/withKeyboardAvoiding";

let { width, height } = Dimensions.get("window");

const ReceiverRowItem = ({ item, onPress }) => (
  <View style={receiverRowItemStyles.container}>
    <Text style={receiverRowItemStyles.text} numberOfLines={1}>
      {item.name}
    </Text>
    <TouchableOpacity
      style={receiverRowItemStyles.button}
      onPress={() => onPress(item)}
    >
      <Image source={images.icon_cross} style={receiverRowItemStyles.image} />
    </TouchableOpacity>
  </View>
);

const receiverRowItemStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.lightGreyColor,
    padding: 4,
    paddingStart: 16,
    borderRadius: 32,
    marginVertical: 4,
    marginHorizontal: 4,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  text: {
    color: Colors.white,
    width: 60,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  image: {
    tintColor: Colors.white,
    height: 12,
    width: 12,
    resizeMode: "contain",
  },
});

const ReceiverRow = ({ title, onPress, icon, list = [], type, onDelete }) => {
  const rowList = splitEvery(2, list);
  return (
    <View style={[headerStyles.itemsStyle, { alignItems: "flex-start" }]}>
      <Text
        style={[
          generalStyles.englishText,
          headerStyles.text,
          { marginTop: 16 },
        ]}
      >
        {title}:
      </Text>
      <View style={{ marginStart: 8, marginTop: 8, flex: 1 }}>
        {rowList.map((rowListItem, index) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
            }}
            key={index}
          >
            {rowListItem.map((item) => (
              <ReceiverRowItem
                item={item}
                type={type}
                onPress={(item) => onDelete(item, type)}
              />
            ))}
          </View>
        ))}
      </View>
      {icon && <Icon name={icon} style={headerStyles.icon} onPress={onPress} />}
    </View>
  );
};

const ReceiverInput = ({ title, value, onChange }) => {
  return (
    <View style={[headerStyles.itemsStyle, { alignItems: "center" }]}>
      <Text style={[generalStyles.englishText, headerStyles.text]}>
        {title}:
      </Text>
      <TextInput
        style={[
          headerStyles.input,
          Platform.OS == "ios" && { paddingVertical: 16 },
        ]}
        placeholderTextColor={Colors.textLightColor}
        value={value}
        onChangeText={(text) => onChange(text)}
      />
    </View>
  );
};

const HeaderRowWithPicker = ({
  pickerList,
  selected,
  title,
  containerStyle = {},
  type,
  onChangeValue,
  selectedValue,
}) => (
  <View style={[headerStyles.container, containerStyle]}>
    <Text style={[generalStyles.englishText, headerStyles.text]}>{title}:</Text>
    <Picker
      style={[headerStyles.picker, Platform.os == "ios" && { height: 84 }]}
      itemStyle={{ height: 84 }}
      onValueChange={(itemValue, itemIndex) => onChangeValue(itemValue, type)}
      selectedValue={selectedValue}
    >
      {pickerList.map((item) => (
        <Picker.Item label={item.text} value={item.id} />
      ))}
    </Picker>
  </View>
);

const HeaderRowWithSwitch = ({ title, value, onChange }) => (
  <View style={headerStyles.container}>
    <Text
      style={[
        generalStyles.englishText,
        {
          marginEnd: 8,
        },
        headerStyles.text,
      ]}
    >
      {title}
    </Text>
    <Switch
      value={value}
      onValueChange={(value) => onChange(value)}
      innerCircleStyle={headerStyles.switch}
      disabled={false}
      circleBorderWidth={0}
      circleBorderActiveColor={Colors.switchActiveColor}
      changeValueImmediately={false}
      circleSize={20}
      backgroundActive={Colors.switchActiveColor}
    />
  </View>
);

const headerStyles = StyleSheet.create({
  itemsStyle: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.disabledTextColor,
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    color: Colors.textLightColor,
    fontSize: 14,
    marginStart: 16,
  },
  icon: {
    color: Colors.textDarkColor,
    fontWeight: "bold",
    fontSize: 18,
    padding: 16,
  },
  picker: {
    flex: 1,
    color: Colors.textDarkColor,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDarkColor,
    paddingHorizontal: 4,
  },
  switch: {
    width: 18,
    height: 18,
  },
});

const FormInput = ({ onChangeMessage, message, style }) => (
  <View style={formInputStyles.container}>
    <View style={formInputStyles.inputContainer}>
      <TextInput
        style={[
          generalStyles.englishText,
          formInputStyles.FormInput,
          formInputStyles.input,
          style,
        ]}
        underlineColorAndroid={"white"}
        multiline={true}
        textAlignVertical={"top"}
        value={message}
        onChangeText={(message) => onChangeMessage(message)}
        placeholder={"Enter your message..."}
        placeholderTextColor={Colors.lightGreyColor}
      />
    </View>
  </View>
);

const formInputStyles = StyleSheet.create({
  container: {
    flex: 7,
    marginEnd: 16,
    marginStart: 8,
  },
  inputContainer: { flexDirection: "row", flex: 1 },
  input: {
    flex: 1,
    borderColor: "white",
    padding: Platform.OS == "ios" ? 16 : 4,
  },
  composeInputTexts: {
    fontSize: 15,
    color: Colors.textDarkColor,
    flex: 1,
    height: 40,
  },
  FormInput: {
    fontSize: 15,
    color: Colors.textDarkColor,
    flex: 1,
  },
});

const Footer = ({
  onPressAttach,
  onPressSend,
  onPressCancel,
  loading,
  disabled,
  attachmentCount,
  disabledAttach,
}) => (
  <View style={{ flex: 2 }}>
    <View style={{ backgroundColor: Colors.greyBorderColor, height: 0.5 }} />
    <View style={footerStyles.footerContiner}>
      <TouchableOpacity
        style={{
          paddingVertical: 12,
          paddingHorizontal: 8,
        }}
        onPress={onPressCancel}
      >
        <Text
          style={[
            generalStyles.englishText,
            { fontSize: 14, color: Colors.textLightColor },
          ]}
        >
          CANCEL
        </Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      <View style={footerStyles.buttonContainer}>
        <TouchableOpacity
          onPress={() => onPressAttach()}
          disabled={disabledAttach}
        >
          <View style={footerStyles.attachIconContainer}>
            <Icon active name="attach-file" style={footerStyles.attachIcon} />
          </View>
          {attachmentCount > 0 && (
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                flex: 1,
              }}
            >
              <View style={footerStyles.counterContainer}>
                <Text style={footerStyles.counterText}>{attachmentCount}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[footerStyles.button, disabled && { opacity: 0.7 }]}
          onPress={onPressSend}
          disabled={disabled || loading}
        >
          {!loading ? (
            <Text style={[generalStyles.englishText, footerStyles.text]}>
              SEND
            </Text>
          ) : (
            <DotsLoader color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const footerStyles = StyleSheet.create({
  footerContiner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  counterContainer: {
    height: 20,
    width: 20,
    backgroundColor: "red",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: {
    color: Colors.white,
    fontSize: 12,
  },
  attachIconContainer: {
    borderWidth: 1.5,
    borderColor: Colors.greyBorderColor,
    padding: 8,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  attachIcon: {
    color: Colors.textLightColor,
    fontWeight: "bold",
    fontSize: 23,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 8,
    marginHorizontal: 8,
  },
  button: {
    width: width / 3.2,
    height: height / 15,
    backgroundColor: Colors.switchActiveColor,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
});

class Compose extends React.Component {
  constructor(props) {
    super(props);
    this.randomId = createRandomId();
    this.letterNo = R.pathOr(
      null,
      ["navigation", "state", "params", "letterNo"],
      this.props
    );
    this.number = R.pathOr(
      null,
      ["navigation", "state", "params", "number"],
      this.props
    );
    const toPassedList = R.pathOr(
      [],
      ["navigation", "state", "params", "toList"],
      this.props
    );
    const ccPassedList = R.pathOr(
      [],
      ["navigation", "state", "params", "ccList"],
      this.props
    );
    let subject = R.pathOr(
      "",
      ["navigation", "state", "params", "subject"],
      this.props
    );
    this.content = R.pathOr(
      "",
      ["navigation", "state", "params", "content"],
      this.props
    );

    let attachments = R.pathOr(
      [],
      ["navigation", "state", "params", "attachments"],
      this.props
    );
    attachments = attachments.map((item) =>
      Object.assign(item, { persist: true })
    );

    let attachmentViews = R.pathOr(
      [],
      ["navigation", "state", "params", "attachments"],
      this.props
    );
    attachmentViews = attachmentViews.map((item) =>
      Object.assign(item, { persist: true })
    );

    this.state = {
      switchValue: false,
      sendButtonLoading: false,
      messageBody: this.content
        ? `\n--------------------------------\n${this.content}`
        : "",
      attachments,
      attachmentViews,

      showLookUp: false,
      toList: toPassedList,
      ccList: ccPassedList,
      mode: "TO",
      subject: subject,
      reference: null,
      priority: null,
      loadingMore: false,
    };
  }

  async onLoadMore() {
    if (!!this.state.searchText || this.state.loadingMore) return;
    this.setState({ loadingMore: true });
    if (userStore.persons.length % PAGE_SIZE == 0) {
      await getPersonsLookupQuery(
        Math.floor(userStore.persons.length / PAGE_SIZE)
      );
    }
    this.setState({ loadingMore: false });
  }

  toggleModal() {
    this.setState({ showLookUp: !this.state.showLookUp });
  }

  onPressAddIcon(mode) {
    this.setState({ showLookUp: true, mode });
  }

  onPressCloseModal() {
    this.setState({ showLookUp: false });
  }

  async componentDidMount() {
    await getPriorityLookupQuery();
    await getReferenceTypeLookupQuery();
    const reference = R.pathOr(null, ["referenceTypes", "0", "id"], userStore);
    const priority = R.pathOr(null, ["priorities", "0", "id"], userStore);
    await this.setState({
      reference,
      priority: 0,
    });
  }

  setAttchments(attachments) {
    this.setState({ attachments });
  }

  async addItemToList(item, mode) {
    const { userId, username } = item;
    const { toList, ccList } = this.state;
    switch (mode) {
      case "TO":
        if (toList.find((item) => item.name == username)) return;
        await this.setState({
          toList: [...toList, { name: username, id: userId }],
          showLookUp: false,
        });

        break;
      case "CC":
        if (ccList.find((item) => item.name == username)) return;
        await this.setState({
          ccList: [...ccList, { name: username, id: userId }],
          showLookUp: false,
        });

        break;
    }
  }

  async deleteItemFromList(item, mode) {
    switch (mode) {
      case "TO":
        await this.setState({
          toList: this.state.toList.filter(
            (listItem) => listItem.name !== item.name
          ),
          showLookUp: false,
        });
        break;
      case "CC":
        await this.setState({
          ccList: this.state.ccList.filter(
            (listItem) => listItem.name !== item.name
          ),
          showLookUp: false,
        });
        break;
    }
  }

  async onSendPress() {
    this.setState({ sendButtonLoading: true });
    const {
      switchValue: isSecure,
      messageBody: message,
      toList,
      ccList,
      subject,
      reference,
      priority,
    } = this.state;
    let response = null;
    try {
      let finalMessage = message;
      if (this.content) {
        const newMessage = message.split(
          "\n--------------------------------\n"
        )[0];
        finalMessage = `${newMessage}###${this.content}`;
      }
      response = await postNewCorrespondence(
        {
          isSecure,
          message: finalMessage,
          toList,
          ccList,
          subject,
          reference,
          priority,
        },
        this.randomId,
        this.letterNo,
        this.number
      );
    } catch (e) {}
    this.setState({ sendButtonLoading: false });

    if (!!response) {
      this.props.navigation.pop();
      this.refs.successToast.show(
        <ToastView message="Successfully Sent" />,
        2000
      );
    } else {
      this.refs.errorToast.show(
        <ToastView message="Error in Composing Correspondence" />,
        2000
      );
    }
  }

  async onChangePicker(value, type) {
    switch (type) {
      case "Reference":
        await this.setState({ reference: value });
        break;
      case "Priority":
        await this.setState({ priority: value });
        break;
    }
  }

  onBackPress() {
    this.props.navigation.pop();
  }

  onAttach() {
    this.props.navigation.navigate("AttachFile", {
      onAttach: (attachments, attachmentViews) =>
        this.setAttachments(attachments, attachmentViews),
      randomId: this.randomId,
      attachments: this.state.attachments,
      attachmentViews: this.state.attachmentViews,
      number: this.number,
    });
  }

  setAttachments(attachments, attachmentViews) {
    this.setState({ attachments, attachmentViews });
  }

  onCancel() {
    this.props.navigation.goBack();
  }

  _renderItems() {
    return (
      <View style={styles.itemsContainer}>
        <ReceiverRow
          title="To"
          onPress={() => this.onPressAddIcon("TO")}
          onDelete={(item, mode) => this.deleteItemFromList(item, mode)}
          icon="add"
          list={this.state.toList}
          type="TO"
        />
        <ReceiverRow
          title="Cc"
          onPress={() => this.onPressAddIcon("CC")}
          icon="add"
          list={this.state.ccList}
          type="CC"
          onDelete={(item, mode) => this.deleteItemFromList(item, mode)}
        />
        <ReceiverInput
          title="Subject"
          value={this.state.subject}
          onChange={(text) => this.setState({ subject: text })}
        />
        <View style={[headerStyles.itemsStyle, { alignItems: "center" }]}>
          <HeaderRowWithPicker
            title="Referal Type"
            pickerList={userStore.referenceTypes}
            type="Reference"
            onChangeValue={(value, type) => this.onChangePicker(value, type)}
            selectedValue={this.state.reference}
          />
        </View>
        <View style={[headerStyles.itemsStyle, { alignItems: "center" }]}>
          <HeaderRowWithPicker
            title="Priority"
            pickerList={[{ id: 1, text: "none" }, ...userStore.priorities]}
            containerStyle={{
              borderRightWidth: 1,
            }}
            type="Priority"
            onChangeValue={(value, type) => this.onChangePicker(value, type)}
            selectedValue={this.state.priority}
          />
          <HeaderRowWithSwitch
            title="Confidential"
            value={this.state.switchValue}
            onChange={(switchValue) => this.setState({ switchValue })}
          />
        </View>
        <FormInput
          staticMessage={this.content}
          message={this.state.messageBody}
          onChangeMessage={(messageBody) =>
            this.onChangeMessageBody(messageBody)
          }
          style={{ height: 200 }}
        />
        <Footer
          onPressSend={() => this.onSendPress()}
          onPressAttach={() => this.onAttach()}
          onPressCancel={() => this.onCancel()}
          loading={this.state.sendButtonLoading}
          disabled={
            !this.state.toList ||
            this.state.toList.length == 0 ||
            !this.state.subject
          }
          attachmentCount={this.state.attachments.length}
        />
      </View>
    );
  }

  onChangeMessageBody(message) {
    this.setState({ messageBody: message });
  }

  render() {
    return (
      <WithKeyboardAvoiding>
        <View style={{ flex: 1 }}>
          <Header
            left={{
              icon: userStore.userPicture
                ? { uri: `data:image/png;base64,${userStore.userPicture}` }
                : images.icon_user,
            }}
          />

          <TouchableOpacity
            style={{
              marginStart: 16,
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => this.onBackPress()}
          >
            <Icon
              name="keyboard-arrow-left"
              style={{
                fontSize: 15,
                color: Colors.lightGreyColor,
                marginTop: 2,
              }}
            />
            <Text style={[generalStyles.englishText, styles.text]}>
              Compose
            </Text>
          </TouchableOpacity>

          <ScrollView>{this._renderItems()}</ScrollView>
          <LookUpModal
            toggleModal={() => this.toggleModal()}
            data={userStore.persons}
            type={this.state.mode}
            onPress={(username, mode) => this.addItemToList(username, mode)}
            visible={this.state.showLookUp}
            onLoadMore={() => this.onLoadMore()}
            loadingMore={this.state.loadingMore}
          />
          <Toast
            ref="errorToast"
            style={{ backgroundColor: Colors.lightRed }}
            position="top"
            positionValue={32}
            textStyle={{ color: Colors.white }}
          />
          <Toast
            ref="successToast"
            style={{
              backgroundColor: Colors.lightGreen,
              width: 200,
              alignItems: "center",
            }}
            position="top"
            positionValue={32}
            textStyle={{ color: Colors.white }}
          />
        </View>
      </WithKeyboardAvoiding>
    );
  }
}

const styles = StyleSheet.create({
  itemsContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    margin: 16,
  },
  text: {
    color: Colors.lightGreyColor,
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default observer(Compose);
