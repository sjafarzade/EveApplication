import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  DocumentPicker,
  DocumentPickerUtil,
} from "react-native-document-picker";
import { Bar } from "react-native-progress";
import RNFetchBlob from "rn-fetch-blob";
import * as mime from "react-native-mime-types";
import * as R from "ramda";

import { Header } from "@components";
import generalStyles from "../constants/styles";
import images from "@assets/images";
import Colors from "../constants/colors";
import { userStore } from "../stores";
import {
  uploadAttachmentQuery,
  removeAttachmentQuery,
} from "../network/queries";

let { width, height } = Dimensions.get("window");
if (width < height) {
  [width, height] = [height, width];
}

class AttachmentsItems extends Component {
  constructor(props) {
    super(props);
    this.uploadTask = null;
    this.state = {
      progress: R.pathOr(false, ["file", "done"], props) ? 100 : 0,
      done: R.pathOr(false, ["file", "done"], props),
      uploading: false,
      barWidth: 0,
      uploadedFile: R.pathOr(null, ["uploadedFile"], props),
    };
  }

  componentDidMount() {
    const done = R.pathOr(false, ["file", "done"], this.props);
    if (done) return;
    this.setState({ progress: 0, done: false, uploading: true });
    this.onUploadingStart();
  }

  setProgress(progress) {
    this.setState({ progress });
  }

  setUploadTask(task) {
    this.uploadTask = task;
  }

  onUploadingStart() {
    const { path, type, fileName } = this.props.file;
    this.props.setUploading(true);
    this.props.onUpload(
      path,
      fileName,
      type,
      (response) => this.onUploadingEnd(response),
      () => this.onUploadingCancel(false),
      (progress) => this.setProgress(progress),
      (task) => this.setUploadTask(task)
    );
  }

  onUploadingCancel(userInteraction = false) {
    const self = this;
    if (userInteraction) {
      if (!!this.uploadTask) {
        this.uploadTask.cancel((err) => {
          if (!err) {
            setTimeout(async function () {
              self.onRemoveFile(false);
              self.props.setUploading(false);
            }, 200);
          }
        });
      }
    } else {
      this.onRemoveFile(false);
      this.props.setUploading(false);
    }
  }

  onRemoveFile() {
    if (this.state.done) {
      this.props.onRemove(this.props.file, true, this.state.uploadedFile);
    } else {
      this.props.onRemove(this.props.file, false, null);
    }
  }

  onUploadingEnd(response) {
    this.setState({
      done: true,
      uploading: false,
      progress: 100,
      uploadedFile: response,
    });
    this.props.onAddUploadedFile(response);
    this.props.setUploading(false);
  }

  onlayout(event) {
    const { width } = event.nativeEvent.layout;
    this.setState({ barWidth: width - 12 });
    this.forceUpdate();
  }

  render() {
    const {
      file: { fileName, persist },
    } = this.props;
    const { uploading, done, progress } = this.state;
    return (
      <View style={attachmentItemsStyle.attachContainer}>
        <View style={attachmentItemsStyle.container}>
          <View
            style={[
              attachmentItemsStyle.subContainer,
              !!persist && { marginBottom: 8 },
            ]}
          >
            <Image
              style={attachmentItemsStyle.attachIcon}
              source={images.icon_attachment}
            />
            <Text
              style={[
                generalStyles.englishText,
                { fontSize: 12, color: Colors.textLightColor },
              ]}
              numberOfLines={1}
            >
              {" "}
              {fileName}
            </Text>
          </View>
          {!persist && (
            <TouchableOpacity
              style={{ paddingHorizontal: 8, paddingVertical: 4 }}
              onPress={() => {
                if (done) {
                  this.onRemoveFile(true);
                } else if (uploading) {
                  this.onUploadingCancel(true);
                }
              }}
            >
              <Icon
                name={done ? "delete" : "cancel"}
                style={attachmentItemsStyle.actionIcon}
              />
            </TouchableOpacity>
          )}
        </View>
        <View
          style={{ marginStart: 8 }}
          onLayout={(event) => this.onlayout(event)}
        >
          <Bar
            width={this.state.barWidth}
            height={4}
            color={Colors.loginBackgroundColor}
            unfilledColor={Colors.lightGreyColor}
            borderWidth={0}
            borderRadius={2}
            useNativeDriver={true}
            progress={progress}
          />
        </View>
      </View>
    );
  }
}

const attachmentItemsStyle = StyleSheet.create({
  attachContainer: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: "#EBEDEF",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attachIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    marginEnd: 4,
  },
  actionIcon: {
    fontSize: 18,
    color: Colors.textLightColor,
  },
  subContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginEnd: 8,
  },
});

export default class AttachFile extends Component {
  constructor(props) {
    super(props);
    this.randomId = this.props.navigation.state.params.randomId;
    this.number = R.pathOr(
      null,
      ["navigation", "state", "params", "number"],
      this.props
    );
    const uploadedFiles = R.pathOr(
      [],
      ["navigation", "state", "params", "attachments"],
      this.props
    );
    this.state = {
      files: this.props.navigation.state.params.attachmentViews.map((item) =>
        Object.assign(item, { done: true })
      ),
      uploadedFiles,
      uploading: false,
    };
  }

  onBackPress() {
    this.props.navigation.goBack();
  }

  onPickFile() {
    const self = this;
    if (Platform.OS == "ios" && Platform.isPad) {
      const { pageX, pageY } = event.nativeEvent;

      DocumentPicker.show(
        {
          top: pageY,
          left: pageX,
          filetype: ["public.allFiles"],
        },
        (error, url) => {
          alert(url);
        }
      );
    } else {
      DocumentPicker.show(
        {
          filetype: [DocumentPickerUtil.allFiles()],
        },
        (error, res) => {
          const { uri, type, fileName, fileSize } = res;

          const files = [
            ...self.state.files,
            {
              path: uri,
              type: mime.lookup(fileName),
              fileName,
              fileSize,
            },
          ];
          self.setState({ files });
        }
      );
    }
  }

  onAddUploadedFile(file) {
    this.setState({ uploadedFiles: [...this.state.uploadedFiles, file] });
  }

  setUploading(state) {
    this.setState({
      uploading: state,
    });
  }

  async onRemoveFile(file, isUploaded = false, uploadedFile) {
    this.setState({
      files: this.state.files.filter(
        (item) =>
          item.type + item.fileName + item.fileSize !==
          file.type + file.fileName + file.fileSize
      ),
    });
    if (isUploaded) {
      // const response = await removeAttachmentQuery(uploadedFile.ID);
      // if (response) {
      this.setState({
        uploadedFiles: this.state.uploadedFiles.filter(
          (item) =>
            item.Extension + item.ID !==
            uploadedFile.Extension + uploadedFile.ID
        ),
      });
      // } else {
      //TODO: show error
      // }
    }
  }

  onAttach() {
    this.props.navigation.state.params.onAttach(
      this.state.uploadedFiles,
      this.state.files
    );
    this.props.navigation.pop();
  }

  render() {
    return (
      <View style={generalStyles.container}>
        <Header
          left={{
            icon: userStore.userPicture
              ? { uri: `data:image/png;base64,${userStore.userPicture}` }
              : images.icon_user,
          }}
        />
        <View
          style={[
            generalStyles.mailContainer,
            { justifyContent: "flex-start" },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => this.onBackPress()}
          >
            <Icon name="keyboard-arrow-left" style={styles.backIcon} />
            <Text style={[generalStyles.englishText, styles.text]}>
              Attach File
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View style={styles.attachContainer}>
              <FlatList
                data={this.state.files}
                renderItem={({ item, index }) => (
                  <AttachmentsItems
                    file={item}
                    onRemove={(file, isUploaded, uploadedFile) =>
                      this.onRemoveFile(file, isUploaded, uploadedFile)
                    }
                    uploadedFile={this.state.uploadedFiles[index]}
                    onUpload={(
                      fileAddress,
                      fileName,
                      fileType,
                      onUploadEnd,
                      onUploadCancel,
                      setProgress,
                      setTask
                    ) =>
                      uploadAttachmentQuery(
                        fileAddress,
                        fileName,
                        fileType,
                        onUploadEnd,
                        onUploadCancel,
                        setProgress,
                        setTask,
                        this.randomId,
                        this.number
                      )
                    }
                    onAddUploadedFile={(file) => this.onAddUploadedFile(file)}
                    setUploading={(state) => this.setUploading(state)}
                  />
                )}
                extraData={this.state.files}
              />
              <TouchableOpacity
                style={styles.touchableAttach}
                onPress={() => this.onPickFile()}
              >
                <Icon name="cloud-upload" style={styles.attachIcon} />
                <Text style={styles.text}>Upload a file</Text>
                <Text
                  style={[styles.lightText, { color: Colors.lightBlueColor }]}
                >
                  Click here
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => this.onAttach()}
            >
              <Text style={[styles.lightText, { color: "white" }]}>ATTACH</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 15,
    color: Colors.lightGreyColor,
    marginTop: 2,
  },
  attachContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  touchableAttach: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1.5,
    padding: 32,
    borderColor: Colors.disabledTextColor,
  },
  attachIcon: {
    fontSize: 36,
    color: Colors.greyColor,
    marginBottom: 8,
  },
  boldText: {
    fontSize: 16,
    color: Colors.greyColor,
    fontWeight: "bold",
    padding: 8,
  },
  lightText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  button: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.darkYellowColor,
    borderRadius: 8,
  },
  text: {
    color: Colors.lightGreyColor,
    fontWeight: "bold",
    fontSize: 12,
  },
});
