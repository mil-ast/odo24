import React, { Component } from 'react';
import MessageError from '../errors/messageError';

class FormRepair extends Component {
  constructor() {
    super();

    this.state = {
      email: '',
      error: null,
    };
  }

  render() {
    return (<div>
      <h3 className="form-block__title">
        <i className="material-icons">alternate_email</i>
        <span>Восстановление пароля</span>
      </h3>
      <form id="repair_form" method="POST" onSubmit={this.submit.bind(this)} action="/api/profile/recovery">
        <div className="form__row">
          <input autoFocus tabIndex="1" className="form__input" type="text" value={this.state.email} onChange={this.onChangeEmail.bind(this)} name="email" required autoComplete="off" placeholder="E-mail" />
          <p>Укажите ваш e-mail, куда будет отправлен код подтверждения</p>
        </div>
        <div>
          <button type="submit">Отправить</button>
        </div>
        <MessageError error={this.state.error} />
      </form>
      <button onClick={this.clickBack.bind(this)}>Назад</button>
    </div>);
  }

  onChangeEmail(event) {
    this.setState({ email: event.target.value });
  }

  submit(event) {
    event.preventDefault();

    const email = event.target.email.value;

    try {
      this.setState({ error: null });

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('incorrect_email');
      }

      const body = {
        email : email,
      };

      const request = {
          method: 'POST',
          body: JSON.stringify(body)
      };
      fetch(event.target.action, request).then((res) => {
        // OK
      }).catch((e) => {
        this.setError(e.message);
      });
    } catch (e) {
      switch (e.message) {
        case 'incorrect_email':
          event.target.email.className = 'form__input form__input__error';
          break;
        default:
      }

      this.setError(e.message);
    }
  }

  clickBack() {
    this.props.stage.emit('change', 1);
  }

  setError(err) {
    this.setState({ error: err });
  }
}

export default FormRepair;
