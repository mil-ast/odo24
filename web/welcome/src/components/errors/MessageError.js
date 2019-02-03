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
      case 'login_busy':
        return (<span>Такой e-mail уже занят</span>);
      default:
        return (<span>{this.props.error}</span>);
    }
  }
}

export default MessageError;
