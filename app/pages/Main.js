import React, { Component } from "react";
import {
  Text,
  View,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  FlatList,
  TextInput,
  AsyncStorage,
} from "react-native";
import { observer } from "mobx-react";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import { DrawerActions } from "react-navigation";
import Toast, { DURATION } from "react-native-easy-toast";
import { NavigationActions, StackActions } from "react-navigation";
import Modal from "react-native-modal";
import {
  ifIphoneX,
  getStatusBarHeight,
  getBottomSpace,
} from "react-native-iphone-x-helper";

import { Header, ToastView, LogoutModal } from "@components";
import { Correspondence, Cartbot } from "@screens";
import Colors from "../constants/colors";
import images from "@assets/images";
import {
  getUserpictureQuery,
  getFoldersQuery,
  getCorrespondenceQuery,
  getConfirmationQuery,
} from "../network/queries";
import { userStore } from "../stores";
import {
  CONFIRMATION_DEFAULT_FILTER,
  CORRESPONDENCE_DEFAULT_FILTER,
} from "../constants/constants";

const { width, height } = Dimensions.get("window");
const keyExtractor = (item, index) => index;

const tabRoutes = [
  {
    key: "cartbot",
    title: "Cartbot",
    image: images.icon_cartbot,
    align: "flex-end",
    margin: 24,
  },
  {
    key: "correspondence",
    title: "Correspondence",
    image: images.icon_correspondence,
    align: "flex-start",
    margin: 0,
  },
];

const FooterButton = ({
  selectedIndex,
  index,
  options: { align, margin, image, title },
  onPress,
}) => (
  <TouchableOpacity
    key={index}
    style={[footerStyles.buttonContainer, { alignItems: align }]}
    onPress={() => onPress({ index })}
  >
    <View style={{ alignItems: "center", marginEnd: margin }}>
      <Image
        style={[
          footerStyles.buttonImage,
          {
            tintColor:
              selectedIndex === index
                ? Colors.headerBackgroundColor
                : Colors.tabviewBorderColor,
          },
        ]}
        source={image}
      />
      <Animated.Text
        style={{
          color:
            selectedIndex === index
              ? Colors.headerBackgroundColor
              : Colors.tabviewBorderColor,
          fontSize: 13,
        }}
      >
        {title}
      </Animated.Text>
    </View>
  </TouchableOpacity>
);

const Footer = ({ routes, selectedIndex, onSelect }) => {
  return (
    <View style={footerStyles.container}>
      {routes.map((route, index) => {
        return (
          <FooterButton
            selectedIndex={selectedIndex}
            index={index}
            options={route}
            key={index}
            onPress={(index) => onSelect(index)}
          />
        );
      })}
    </View>
  );
};

const footerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: Colors.listBorder,
    paddingTop: 4,
    ...ifIphoneX(
      {
        paddingBottom: getBottomSpace() + 4,
      },
      {
        paddingBottom: 4,
      }
    ),
  },
  buttonContainer: { flex: 1, padding: 8 },
  buttonImage: {
    resizeMode: "contain",
    height: 24,
    width: 24,
  },
});

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      showMenu: false,
      loadingCorrespondences: false,
      loadingConfirmations: false,
      correspondenceError: false,
      cartbotError: false,
      showLogoutModal: false,
    };
  }

  async componentDidMount() {
    this.setState({ loadingCorrespondences: true, loadingConfirmations: true });
    const correspondenceRes = await getCorrespondenceQuery(
      0,
      "",
      true,
      CORRESPONDENCE_DEFAULT_FILTER
    );

    const cartbotRes = await getConfirmationQuery(
      0,
      "",
      true,
      CONFIRMATION_DEFAULT_FILTER
    );

    if (!correspondenceRes) {
      this.setState({ correspondenceError: true });
    }
    if (!cartbotRes) {
      this.setState({ cartbotError: true });
    }

    await getUserpictureQuery();
    await getFoldersQuery();
    this.setState({
      loadingCorrespondences: false,
      loadingConfirmations: false,
    });
  }

  openDrawer() {
    this.props.navigation.openDrawer();
  }

  onPressCompose() {
    this.props.navigation.navigate("MailCompose");
  }

  onPressCorrespondence(correspondence) {
    this.props.navigation.navigate("MailView", {
      correspondence,
    });
  }

  onChangeSelectedTab({ index }) {
    this.setState({ showMenu: !!index, selectedIndex: index });
  }

  onPressConfirmation(confirmation) {
    this.props.navigation.navigate("CartbotView", {
      confirmation
    });
  }

  toggleCorrespondenceError(error) {
    this.setState({ correspondenceError: error });
  }

  toggleConfirmationError(error) {
    this.setState({ cartbotError: error });
  }

  async onLogout() {
    try {
      await AsyncStorage.removeItem("username");
      await AsyncStorage.removeItem("password");
      await AsyncStorage.removeItem("remember");
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: "Login" })],
      });
      this.props.navigation.dispatch(resetAction);
      userStore.setUserPicture(null);
    } catch (exception) {
      this.refs.errorToast.show(
        <ToastView message="Error in Logging Out!" />,
        2000
      );
    }
  }

  toggleLogoutModal() {
    this.setState({ showLogoutModal: !this.state.showLogoutModal });
  }

  onBackPress() {
    this.setState({ showLogoutModal: false });
  }

  onBackdropPress() {
    this.setState({ showLogoutModal: false });
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
        <Header
          right={
            this.state.showMenu
              ? {
                  icon: images.icon_menu,
                  onPress: () => this.openDrawer(),
                  style: { tintColor: "white", height: 24, width: 24 },
                }
              : null
          }
          left={{
            icon: userStore.userPicture
              ? { uri: `data:image/png;base64,${userStore.userPicture}` }
              : images.icon_user,
            showLogout: true,
            onPress: () => this.toggleLogoutModal(),
          }}
        />
        <Modal
          isVisible={this.state.showLogoutModal}
          onBackButtonPress={() => this.onBackPress()}
          onBackdropPress={() => this.onBackdropPress()}
          animationIn="fadeIn"
          animationOut="fadeOut"
          animationInTiming={100}
          animationOutTiming={100}
        >
          <LogoutModal
            image={
              userStore.userPicture
                ? { uri: `data:image/png;base64,${userStore.userPicture}` }
                : images.icon_user
            }
            onLogout={() => this.onLogout()}
            username={userStore.username}
          />
        </Modal>

        <TabView
          renderScene={SceneMap({
            cartbot: () => (
              <Cartbot
                onPressConfirmation={(confirmation) =>
                  this.onPressConfirmation(confirmation)
                }
                loading={this.state.loadingConfirmations}
                error={this.state.cartbotError}
                toggleError={(error) => this.toggleConfirmationError(error)}
              />
            ),
            correspondence: () => (
              <Correspondence
                onPressCorrespondence={(correspondence) =>
                  this.onPressCorrespondence(correspondence)
                }
                onPressCompose={() => this.onPressCompose()}
                loading={this.state.loadingCorrespondences}
                error={this.state.correspondenceError}
                toggleError={(error) => this.toggleCorrespondenceError(error)}
              />
            ),
          })}
          renderTabBar={(props) => {
            return (
              <Footer
                routes={tabRoutes}
                selectedIndex={this.state.selectedIndex}
                onSelect={(index) => this.onChangeSelectedTab(index)}
              />
            );
          }}
          navigationState={{
            index: this.state.selectedIndex,
            routes: tabRoutes,
          }}
          onIndexChange={(index) => this.setState({ selectedIndex: index })}
          swipeEnabled={false}
          tabBarPosition={"bottom"}
          initialLayout={{ width }}
        />
        <Toast
          ref="errorToast"
          style={{ backgroundColor: Colors.lightRed }}
          position="top"
          positionValue={32}
          textStyle={{ color: Colors.white }}
        />
      </View>
    );
  }
}

export default observer(Main);
