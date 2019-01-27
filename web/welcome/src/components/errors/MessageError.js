import React, { Component } from 'react';
import './styles.css';

class MessageError extends Component {
  render() {
    if (this.props.error) {
      return (<div className="messageError"><i className="material-icons">error_outline</i>{this.getMessage()}</div>);
    } else {
      return null;
    }
  }

  getMessage() {
    switch (this.props.error) {
      case 'incorrect_email':
        return (<span>Неправильный формат e-mail</span>);
      case 'password_length':
        return (<span>Длина пароля должна быть не менее 5 знаков</span>);
      case 'password_diff':
        return (<span>Пароли не совпадают</span>);
      case 'login_busy':
        return (<span>Такой e-mail уже занят</span>);
      default:
        return (<span>Произошла непредвиденная ошибка!</span>);
    }
  }
}

export default MessageError;
