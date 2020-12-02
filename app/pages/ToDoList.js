import React, { Component } from 'react';
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';

import generalStyles from '../constants/styles';

import { Header } from '@components';
import Colors from '../constants/colors';
import images from '@assets/images';
import {
  TODO_STATUS_DONE,
  TODO_STATUS_PENDING,
  TODO_STATUS_EXPIRED,
} from '../constants/constants';
import { userStore } from '../stores';
import { observer } from 'mobx-react/native';

let { width, height } = Dimensions.get('window');

const CheckView = ({ done, style = {} }) => (
  <View
    style={[
      {
        height: 18,
        width: 18,
        borderRadius: 9,
        borderWidth: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: Colors.lightGreyColor,
        backgroundColor: done ? Colors.doneColor : Colors.white,
      },
      style,
    ]}
  >
    {done && (
      <Image
        style={{
          height: 12,
          width: 12,
          resizeMode: 'contain',
          tintColor: 'white',
        }}
        source={images.icon_tick}
      />
    )}
  </View>
);

const TodoListRow = ({ todo, onPress }) => {
  return (
    <View>
      <TouchableOpacity
        style={{
          backgroundColor: Colors.white,
          padding: 8,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => onPress(todo)}
      >
        <CheckView
          done={todo.status == TODO_STATUS_DONE}
          style={{ marginEnd: 16 }}
        />
        <Text
          style={[
            {
              color:
                todo.status == TODO_STATUS_EXPIRED
                  ? Colors.textDarkColor
                  : Colors.textColorBlack,
            },
            generalStyles.englishText,
          ]}
        >
          {todo.text}
        </Text>
      </TouchableOpacity>
      <View
        style={{
          marginStart: 16,
          marginEnd: 8,
          height: 0.5,
          backgroundColor: Colors.lightGreyColor,
        }}
      />
    </View>
  );
};

const TodoItems = observer(
  class TodoItems extends Component {
    toggleTodo(todo) {
      userStore.updateTodo({
        ...todo,
        ...{
          status:
            todo.status == TODO_STATUS_DONE
              ? todo.perviousStatus == TODO_STATUS_EXPIRED
                ? TODO_STATUS_EXPIRED
                : TODO_STATUS_PENDING
              : TODO_STATUS_DONE,
          perviousStatus: todo.status,
        },
      });
    }

    render() {
      return (
        <View style={{ flex: 1 }}>
          <FlatList
            data={this.props.data}
            renderItem={todo => (
              <TodoListRow
                todo={todo.item}
                onPress={todo => this.toggleTodo(todo)}
              />
            )}
            style={{ flex: 1 }}
            contentContainerStyle={{ backgroundColor: 'white' }}
          />
        </View>
      );
    }
  },
);

class ToDoList extends Component {
  openDrawer() {
    this.props.navigation.navigate('DrawerOpen');
  }

  render() {
    const doneTodoArray = userStore.todoList.filter(
      item => item.status == TODO_STATUS_DONE,
    );
    const pendingTodoArray = userStore.todoList.filter(
      item => item.status == TODO_STATUS_PENDING,
    );
    const expiredTodoArray = userStore.todoList.filter(
      item => item.status == TODO_STATUS_EXPIRED,
    );

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <Header
          right={{
            icon: images.icon_menu,
            onPress: () => this.openDrawer(),
            style: { tintColor: 'white', height: 24, width: 24 },
          }}
          left={{
            icon: userStore.userPicture
              ? { uri: `data:image/png;base64,${userStore.userPicture}` }
              : images.icon_user,
          }}
        />
        <View style={{ flex: 1, padding: 10 }}>
          <Text
            style={[
              generalStyles.englishText,
              styles.text,
              { marginBottom: 8 },
            ]}
          >
            Overview
          </Text>
          <TodoItems
            data={[...pendingTodoArray, ...doneTodoArray, ...expiredTodoArray]}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    color: Colors.lightGreyColor,
    fontWeight: 'bold',
    fontSize: 14,
    marginStart: 4,
  },
});

export default observer(ToDoList);
