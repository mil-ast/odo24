import React, { Component } from 'react';
import MessageError from '../errors/messageError';
import '../form.css';

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
      case 4:
        layer = this.renderSuccess();
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
        <form id="repair_get_email" method="POST" onSubmit={this.submitEmail.bind(this)} action="/api/profile/recovery">
          <div className="form__row">
            <input autoFocus tabIndex="1" className="form__input" type="text" name="email" required autoComplete="off" placeholder="E-mail" />
            <p>Укажите ваш e-mail, куда будет отправлен код подтверждения</p>
          </div>
          <div>
            <button type="submit" className="form__button">Отправить</button>
          </div>
          <MessageError error={this.state.error} />
        </form>
        <div className="bottom-links">
          <a href="/" className="underline" onClick={this.clickBack.bind(this)}>В начало</a>
        </div>
      </div>
    );
  }

  renderGetCode() {
    return (
      <div>
        <form id="repair_get_code" method="POST" onSubmit={this.submitCode.bind(this)} action="/api/profile/confirm_code">
          <div className="form__row">
            <input autoFocus tabIndex="1" className="form__input" type="number" name="code" required autoComplete="off" placeholder="Код подтверждения" />
            <p>Укажите код подтверждения</p>
          </div>
          <div>
            <button type="submit" className="form__button">Отправить</button>
          </div>
          <MessageError error={this.state.error} />
        </form>
        <div className="bottom-links">
          <a href="/" className="underline" onClick={this.clickBack.bind(this)}>В начало</a>
        </div>
      </div>
    );
  }

  renderNewPassword() {
    return (
      <div>
        <form id="repair_new_passwd" method="POST" onSubmit={this.submitResetPassword.bind(this)} action="/api/profile/reset_password">
          <div className="form__row">
            <input autoFocus tabIndex="1" className="form__input" type="password" name="passwd1" required autoComplete="off" placeholder="Новый пароль" />
            <p>Придумайте новый пароль</p>
          </div>
          <div className="form__row">
            <input autoFocus tabIndex="2" className="form__input" type="password" name="passwd2" required autoComplete="off" placeholder="Повторите пароль" />
            <p>Придумайте новый пароль</p>
          </div>
          <div>
            <button type="submit" className="form__button">Сохранить</button>
          </div>
          <MessageError error={this.state.error} />
        </form>
        <div className="bottom-links">
          <a href="/" className="underline" onClick={this.clickBack.bind(this)}>В начало</a>
        </div>
      </div>
    );
  }

  renderSuccess() {
    return (<div>
      <h2>Пароль успешно изменён!</h2>
      <p>Теперь можно перейти к <a href="/book/">авторизации</a></p>
    </div>);
  }

  submitEmail(event) {
    try {
      event.preventDefault();

      const email = event.target.email.value;
      this.setState({ error: null });

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Неправильный формат e-mail');
      }

      const body = {
        email : email,
      };
      const request = {
          method: 'POST',
          body: JSON.stringify(body)
      };
      fetch(event.target.action, request).then((res) => {
        if (res.status !== 204) {
          throw new Error('Email либо не существует, либо недопустимый.');
        }
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
        if (res.status === 400) {
          throw new Error('Вы ввели неправильный код подтверждения');
        } else if (res.status !== 204) {
          throw new Error('Произошла ошибка при получении кода подтверждения');
        }
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

      const passwd1 = event.target.passwd1.value;
      const passwd2 = event.target.passwd2.value;
      if (!passwd1) {
        throw new Error('Необходимо придумать пароль');
      }

      if (passwd1.length < 4) {
        throw new Error('Пароль слишком короткий');
      }

      if (passwd1 !== passwd2) {
        throw new Error('Пароли не совпадают');
      }

      const request = {
        method: 'POST',
        body: JSON.stringify({
          email: this.state.email,
          password: passwd1,
        })
      };
      fetch(event.target.action, request).then((res) => {
        if (res.status !== 204) {
          throw new Error('Произошла непредвиденная ошибка!');
        }
        
        this.setState({
          stage: 4,
        });
      }).catch((e) => {
        console.log(e.message);
        this.setError(e.message);
      });
    } catch (e) {
      this.setError(e.message);
    }
  }
  
  clickBack(event) {
    event.preventDefault();
    this.props.stage.emit('change', 1);
  }

  setError(err) {
    this.setState({ error: err });
  }
}

export default FormRepair;
