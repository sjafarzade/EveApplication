import React, { Component } from 'react';
import {
  Platform,
  Text,
  View,
  ScrollView,
  TextInput,
  Dimensions,
  Image,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  AsyncStorage,
} from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import { observer } from 'mobx-react/native';
import { DotsLoader } from 'react-native-indicator';
import Toast, { DURATION } from 'react-native-easy-toast';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import generalStyles from '../constants/styles';
import Colors from '../constants/colors';
import images from '@assets/images';
import {
  loginQuery,
  getUsernameQuery,
  userInfoQuery,
  getFoldersQuery,
  getPersonsLookupQuery,
} from '../network/queries';
import { userStore } from '../stores';
import { ToastView } from '@components';
import WithKeyboardAvoiding from '../hoc/withKeyboardAvoiding';

let { width, height } = Dimensions.get('window');
if (width < height) {
  [height, width] = [width, height];
}

class LoginFormRow extends Component {
  onFocus() {
    this.textInput.focus();
  }

  render() {
    const {
      title,
      secure,
      keyboardType = 'default',
      returnKeyType = 'next',
      onChange,
      value,
      type,
      onSubmit,
      style = {},
      autoCapitalize = 'sentences',
    } = this.props;
    return (
      <View style={[loginFormRowStyles.container, style]}>
        <Text style={[generalStyles.englishText, loginFormRowStyles.title]}>
          {title}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TextInput
            ref={ref => (this.textInput = ref)}
            onChangeText={text => onChange(type, text)}
            autoCorrect={false}
            keyboardType={keyboardType}
            returnKeyType={returnKeyType}
            underlineColorAndroid="transparent"
            secureTextEntry={secure}
            style={[
              loginFormRowStyles.textInput,
              Platform.OS == 'ios' ? { padding: 12 } : { padding: 2 },
            ]}
            value={value}
            blurOnSubmit={false}
            onSubmitEditing={() => onSubmit()}
            autoCapitalize={autoCapitalize}
          />
        </View>
      </View>
    );
  }
}

const loginFormRowStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    color: 'white',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    textAlignVertical: 'center',
    textAlign: 'center',
    flex: 1,
    borderRadius: 4,
    backgroundColor: 'white',
  },
});

const FormButton = ({ onPress, title, loading, disabled }) => (
  <View style={{ flexDirection: 'row' }}>
    <TouchableOpacity
      style={formButtonStyles.button}
      onPress={onPress}
      disabled={disabled}
    >
      {!loading ? (
        <Text style={[generalStyles.englishText, formButtonStyles.text]}>
          {title}
        </Text>
      ) : (
        <DotsLoader color="white" />
      )}
    </TouchableOpacity>
  </View>
);

const formButtonStyles = StyleSheet.create({
  button: {
    height: 40,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.darkYellowColor,
    borderRadius: 8,
  },
  text: { color: 'white', fontSize: 13, fontWeight: 'bold' },
});

class LoginForm extends Component {
  constructor() {
    super();
    this.firstInput = null;
    this.secondInput = null;
    this.thirdInput = null;
  }

  state = {
    username: '',
    password: '',
    code: '',
    remember: false,
  };

  async componentDidMount() {
    await this.onSetRemember(false);
  }

  onChangeInputs(key, value) {
    this.setState({ [key]: value });
  }

  async onSetRemember(remember) {
    await AsyncStorage.setItem('remember', JSON.stringify(remember));
  }

  async getUsername(username) {
    const selected = await AsyncStorage.getItem('selectedCompany');
    if (!selected) {
      return;
    }
    const res = await getUsernameQuery(username);
    if (res.status && res.username != false) {
      this.setState({ username: res.username });
    }
  }

  async changeRemember(remember) {
    await this.setState({ remember });
    this.onSetRemember(remember);
  }

  render() {
    const { onSubmit, loading } = this.props;

    return (
      <View style={loginFormStyles.container}>
        <LoginFormRow
          title="Personal Code"
          onChange={(key, value) => {
            this.onChangeInputs(key, value);
            this.getUsername(value);
          }}
          value={this.state.code}
          type="code"
          keyboardType="numeric"
          onSubmit={() => this.secondInput.onFocus()}
        />
        <LoginFormRow
          ref={ref => (this.secondInput = ref)}
          title="Username"
          onChange={(key, value) => this.onChangeInputs(key, value)}
          value={this.state.username}
          type="username"
          onSubmit={() => this.thirdInput.onFocus()}
        />
        <LoginFormRow
          ref={ref => (this.thirdInput = ref)}
          title="Password"
          secure
          onChange={(key, value) => this.onChangeInputs(key, value)}
          value={this.state.password}
          type="password"
          returnKeyType="done"
          onSubmit={() => onSubmit(this.state)}
        />
        <View style={{ marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => this.changeRemember(!this.state.remember)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Image
              source={
                this.state.remember
                  ? images.icon_checked_fill
                  : images.icon_checked_empty
              }
              style={loginFormStyles.icon}
            />
            <Text
              style={[generalStyles.englishText, loginFormStyles.forgetText]}
            >
              Remember me
            </Text>
          </TouchableOpacity>
        </View>

        <FormButton
          loading={loading}
          disabled={loading}
          title="LOG IN"
          onPress={() => {
            onSubmit(this.state);
          }}
        />
      </View>
    );
  }
}

const loginFormStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.loginBackgroundColor,
    paddingBottom: 64,
    paddingTop: 16,
  },
  forgetText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  icon: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
});

class CompanyListButton extends Component {
  state = { selected: false };
  render() {
    const {
      onPress,
      selected,
      company: { label, value },
      company,
      onDelete,
    } = this.props;
    return (
      <TouchableOpacity
        style={companyListButtonStyles.container}
        onPress={() => onPress(company)}
        onLongPress={() => this.setState({ selected: !this.state.selected })}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <View
            style={[
              companyListButtonStyles.indicator,
              {
                backgroundColor:
                  selected.value == company.value
                    ? Colors.darkYellowColor
                    : Colors.disabledTextColor,
              },
            ]}
          />
          <Text
            style={{
              color:
                selected.value == company.value
                  ? Colors.textColorBlack
                  : Colors.disabledTextColor,
              fontSize: 12,
            }}
          >
            {label}
          </Text>
        </View>
        {this.state.selected && (
          <View
            style={{
              flexDirection: 'row',
              marginStart: 32,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: Colors.greyColor, fontSize: 12, flex: 1 }}>
              {value}
            </Text>
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => onDelete(company)}
            >
              <Image
                source={images.icon_delete}
                style={{
                  height: 18,
                  width: 18,
                  tintColor: Colors.headerBackgroundColor,
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  }
}

const companyListButtonStyles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: Colors.disabledTextColor,
  },
  indicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    margin: 8,
  },
});

const CompanySettingForm = observer(
  class CompanySettingForm extends Component {
    state = {
      companyName: '',
      companyWebServer: '',
    };

    async onSave() {
      const res = await this.props.onSaveSetting(this.state);
      if (!!res) {
        this.setState({
          companyName: '',
          companyWebServer: '',
        });
      }
    }

    render() {
      const {
        companyList,
        selectedValue,

        onChangeSelected,
        onDelete,
      } = this.props;
      return (
        <View style={companySettingFormStyles.container}>
          <LoginFormRow
            title="Account ID"
            keyboardType="default"
            onChange={(type, companyName) => this.setState({ companyName })}
            value={this.state.companyName}
            type="AccountID"
            returnKeyType="next"
            onSubmit={() => this.secondInput.onFocus()}
          />

          <LoginFormRow
            ref={ref => (this.secondInput = ref)}
            title="IP Address"
            keyboardType="default"
            onChange={(type, companyWebServer) =>
              this.setState({ companyWebServer })
            }
            value={this.state.companyWebServer}
            type="IpAddress"
            returnKeyType="done"
            onSubmit={() => this.onSave()}
            style={{ marginTop: 4 }}
            autoCapitalize="none"
          />

          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={companySettingFormStyles.listContainer}>
              <Text style={companySettingFormStyles.title}>Company list</Text>
              <View style={{ flex: 1 }}>
                <ScrollView
                  style={{
                    borderRadius: 4,
                    backgroundColor: 'white',
                    flex: 1,
                  }}
                >
                  {companyList.map((company, index) => (
                    <CompanyListButton
                      onPress={company => onChangeSelected(company)}
                      onDelete={company => onDelete(company)}
                      company={company}
                      selected={selectedValue}
                      key={index}
                    />
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
          <FormButton title="SAVE" onPress={() => this.onSave()} />
        </View>
      );
    }
  },
);

const companySettingFormStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.loginBackgroundColor,
    paddingTop: 32,
    paddingBottom: 64,
  },
  title: {
    color: 'white',
    fontSize: 13,
    marginBottom: 10,
  },
  listContainer: {
    flex: 1,
    marginVertical: 8,
  },
});

function HeaderButton({ text, type, onSelect, selected, loading }) {
  return (
    <TouchableOpacity style={{ flex: 1 }} onPress={() => onSelect(type)}>
      <Text
        style={[
          headerButtonStyles.text,
          {
            opacity: type == selected ? 1 : 0.5,
            fontSize: 16,
          },
        ]}
      >
        {text}
      </Text>

      <View
        style={{
          height: type == selected ? 1 : 0.5,
          backgroundColor: 'white',
          opacity: type == selected ? 1 : 0.5,
        }}
      />
    </TouchableOpacity>
  );
}

const headerButtonStyles = StyleSheet.create({
  text: {
    color: 'white',
    paddingVertical: 16,
    textAlign: 'center',
  },
});

class Login extends React.Component {
  state = {
    selectedTab: 'Login',
    selectedCompany: { value: 'Not defiend' },
    loginLoading: false,
    companySettings: [],
  };

  async componentDidMount() {
    const selected = await AsyncStorage.getItem('selectedCompany');
    const settings = await AsyncStorage.getItem('companySettings');
    if (!!settings) {
      this.setState({ companySettings: await JSON.parse(settings) });
      if (!!selected) {
        this.setState({ selectedCompany: await JSON.parse(selected) });
      }
    }
  }

  async onSaveCompanySetting(newCompanySetting) {
    Keyboard.dismiss();
    const { companyName, companyWebServer } = newCompanySetting;
    const reptetiveSetting = this.state.companySettings.find(
      item => item.value == companyWebServer,
    );
    if (!!reptetiveSetting) {
      this.refs.errorToast.show(
        <ToastView message="This Company Settings already entered!" />,
        2000,
      );
      return false;
    }

    if (!companyName || !companyWebServer) {
      this.refs.errorToast.show(
        <ToastView message="Please Fill in all fields!" />,
        2000,
      );
      return false;
    }
    await this.setState({
      companySettings: [
        ...this.state.companySettings,
        {
          label: companyName,
          value: companyWebServer,
        },
      ],
    });
    await AsyncStorage.setItem(
      'companySettings',
      JSON.stringify(this.state.companySettings),
    );
    this.refs.successToast.show(
      <ToastView message="Successfully Added!" />,
      2000,
    );
    return true;
  }

  async onChangeSelectedCompany(company) {
    Keyboard.dismiss();
    await AsyncStorage.setItem('selectedCompany', JSON.stringify(company));
    this.setState({ selectedCompany: company });
  }

  async onDeleteCompanySettings(company) {
    const filteredSettings = this.state.companySettings.filter(
      item => item.value !== company.value,
    );
    const { selectedCompany } = this.state;
    if (selectedCompany && selectedCompany.value == company.value) {
      await AsyncStorage.setItem('selectedCompany', '');
      this.setState({
        selectedCompany: { value: 'Not Specified' },
      });
    }
    await AsyncStorage.setItem(
      'companySettings',
      JSON.stringify(filteredSettings),
    );
    this.setState({
      companySettings: filteredSettings,
    });
  }

  render() {
    return (
      <WithKeyboardAvoiding>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image style={styles.logo} source={images.logo_eve} />
          </View>
          <View style={styles.footerContainer}>
            <View style={{ flex: 1, marginHorizontal: 8 }}>
              <View style={{ flexDirection: 'row' }}>
                <HeaderButton
                  text="Login"
                  type="Login"
                  onSelect={type => this.setState({ selectedTab: type })}
                  selected={this.state.selectedTab}
                />
                <HeaderButton
                  text="Company Setting"
                  type="Company Setting"
                  onSelect={type => this.setState({ selectedTab: type })}
                  selected={this.state.selectedTab}
                />
              </View>
              {this.state.selectedTab == 'Login' ? (
                <LoginForm
                  onSubmit={loginData => this.onSubmitLogin(loginData)}
                  loading={this.state.loginLoading}
                />
              ) : (
                <CompanySettingForm
                  selectedValue={this.state.selectedCompany}
                  companyList={this.state.companySettings}
                  onSaveSetting={companySettings =>
                    this.onSaveCompanySetting(companySettings)
                  }
                  onChangeSelected={selected =>
                    this.onChangeSelectedCompany(selected)
                  }
                  onDelete={company => this.onDeleteCompanySettings(company)}
                />
              )}
            </View>
          </View>

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
              alignItems: 'center',
            }}
            position="top"
            positionValue={32}
            textStyle={{ color: Colors.white }}
          />
        </View>
      </WithKeyboardAvoiding>
    );
  }

  async onSubmitLogin(data) {
    Keyboard.dismiss();
    const selected = await AsyncStorage.getItem('selectedCompany');
    if (!selected) {
      this.refs.errorToast.show(
        <ToastView message="Please Enter and Select your company settings!" />,
        2000,
      );
      return;
    }
    this.setState({ loginLoading: true });
    const { username, password } = data;
    const loginStatus = await loginQuery(username, password);
    if (loginStatus) {
      await userInfoQuery();
      await getPersonsLookupQuery();
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Main' })],
      });
      this.props.navigation.dispatch(resetAction);
      AsyncStorage.setItem('username', username);
      AsyncStorage.setItem('password', password);
    } else {
      this.refs.errorToast.show(
        <ToastView message="Login Failed. Please check your username and password!" />,
        2000,
      );
    }
    this.setState({ loginLoading: false });
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.loginBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    resizeMode: 'contain',
  },
  footerContainer: {
    flex: 2,
    paddingLeft: 8,
    paddingRight: 8,
    flexDirection: 'row',
  },
  tabStyle: {
    backgroundColor: Colors.loginBackgroundColor,
    borderBottomWidth: 1,
    borderColor: Colors.tabviewBorderColor,
  },
  activeTabStyle: {
    backgroundColor: Colors.loginBackgroundColor,
  },
  activeTabTextStyle: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'normal',
  },
  tabTextStyle: { color: Colors.tabviewBorderColor },
});

export default observer(Login);
