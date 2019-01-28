import React, { Component } from 'react';
import MessageError from '../errors/messageError';

class FormRepair extends Component {
  constructor() {
    super();

    this.state = {
      email: '',
      error: null,
      stage: 1
    };
  }

  render() {
    let layer;
    switch (this.state.stage) {
      case 2:
        layer = this.renderGetCode();
      break;
      case 3:
        layer = this.renderNewPassword();
      break;
      default:
        layer = this.renderGetEmail();
    }

    return (<div>
      <h3 className="form-block__title">
        <i className="material-icons">alternate_email</i>
        <span>Восстановление пароля</span>
      </h3>
      {layer}
    </div>);
  }

  renderGetEmail() {
    return (
      <div>
        <form id="repair_form" method="POST" onSubmit={this.submitEmail.bind(this)} action="/api/profile/recovery">
          <div className="form__row">
            <input autoFocus tabIndex="1" className="form__input" type="text" name="email" required autoComplete="off" placeholder="E-mail" />
            <p>Укажите ваш e-mail, куда будет отправлен код подтверждения</p>
          </div>
          <div>
            <button type="submit">Отправить</button>
          </div>
          <MessageError error={this.state.error} />
        </form>
        <button onClick={this.clickBack.bind(this)}>Назад</button>
      </div>
    );
  }

  renderGetCode() {
    return (
      <div>
        <form id="repair_form" method="POST" onSubmit={this.submitCode.bind(this)} action="/api/profile/confirm_code">
          <div className="form__row">
            <input autoFocus tabIndex="1" className="form__input" type="number" name="code" required autoComplete="off" placeholder="Код подтверждения" />
            <p>Укажите код подтверждения</p>
          </div>
          <div>
            <button type="submit">Отправить</button>
          </div>
          <MessageError error={this.state.error} />
        </form>
        <button onClick={this.clickBack.bind(this)}>Назад</button>
      </div>
    );
  }

  renderNewPassword() {
    return (
      <div>
        <form id="repair_form" method="POST" onSubmit={this.submitResetPassword.bind(this)} action="/api/profile/reset_password">
          <div className="form__row">
            <input autoFocus tabIndex="1" className="form__input" type="password" name="passwd1" required autoComplete="off" placeholder="Новый пароль" />
            <p>Придумайте новый пароль</p>
          </div>
          <div className="form__row">
            <input autoFocus tabIndex="2" className="form__input" type="password" name="passwd2" required autoComplete="off" placeholder="Повторите пароль" />
            <p>Придумайте новый пароль</p>
          </div>
          <div>
            <button type="submit">Сохранить</button>
          </div>
          <MessageError error={this.state.error} />
        </form>
        <button onClick={this.clickBack.bind(this)}>Назад</button>
      </div>
    );
  }

  submitEmail(event) {
    try {
      event.preventDefault();

      const email = event.target.email.value;
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
        this.setState({
          email: email,
          stage: 2,
        });
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

  submitCode(event) {
    try {
      event.preventDefault();
      this.setState({ error: null });

      const body = {
        email: this.state.email,
        code : parseInt(event.target.code.value, 10),
      };
      const request = {
          method: 'POST',
          body: JSON.stringify(body)
      };
      fetch(event.target.action, request).then((res) => {
        this.setState({
          stage: 3,
        });
      }).catch((e) => {
        this.setError(e.message);
      });
    } catch (e) {
      this.setError(e.message);
    }
  }

  submitResetPassword(event) {
    try {
      event.preventDefault();
      this.setState({ error: null });
    } catch (e) {

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
