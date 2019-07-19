import React from 'react';
import { TextInput, Text, View, AsyncStorage } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'; // 0.3.0
import { TouchableOpacity, FlatList } from 'react-native-gesture-handler';
import User from '../../User';
import firebase from 'firebase';

export default class Chatting extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: (navigation.state.params || {}).name || 'Chat!'
  });

  constructor(props) {
    super(props);
    this.state = {
        person: {
          name: props.navigation.getParam('name'),
          email: props.navigation.getParam('email'),
          uid: props.navigation.getParam('userUid')
        },
        textMessage: '',
        messageList:[]
    }
  }

  componentWillMount(){
    firebase.database().ref('messages').child(User.uid).child(this.state.person.uid)
      .on('child_added',(value)=>{
        this.setState((prevState)=>{
          console.warn(prevState.messageList, value.val())
          return {
            messageList: GiftedChat.append(prevState.messageList, value.val())
          }
        })
      })
  }

  handleChange = key => val => {
    this.setState({ [key]: val })
  }

  // get user() {
  //   return {
  //     name: this.props.navigation.state.params.name,
  //     email: this.props.navigation.state.params.email,
  //     avatar: this.props.navigation.state.params.avatar,
  //     id: firebaseSDK.uid,
  //     _id: firebaseSDK.uid
  //   };
  // }
  sendMessage = async () => {
    let msgId = firebase.database().ref('messages').child(User.uid).child(this.state.person.uid).push().key
    let updates  = {}
    let message = {
      _id: msgId,
      text: this.state.textMessage,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      user: {
        _id: User.uid
      },
    }
    updates['messages/'+ User.uid + '/' + this.state.person.uid + '/' + msgId] = message 
    updates['messages/'+ this.state.person.uid + '/' + User.uid + '/' + msgId] = message 
    firebase.database().ref().update(updates);
    this.setState({ textMessage: '' });
  }

  render() {
    console.warn(this.state.person.uid)
    return (
      <GiftedChat
        text={this.state.textMessage}
        messages={this.state.messageList}
        user={{
            _id : User.uid
        }}
        onInputTextChanged={this.handleChange('textMessage')}
        onSend={this.sendMessage}
      />
    );
  }
}