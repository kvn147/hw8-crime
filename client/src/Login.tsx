import React, { ChangeEvent, Component } from 'react';

type LoginProps = {
  /** Grabs account info - called onClick of Create/Login Button */
  onAccess: (username: string, password: string) => void
}

type LoginState = {
  username: string,
  password: string
}

/**
 * Login page where users can type in a NEW username & password to create an
 * account, or type in an existing username & password to attempt to log in
*/
export class Login extends Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);

    this.state = {
      username: "",
      password: ""
    };
  }

  render = (): JSX.Element => {
    return (<div style={{ fontFamily: "sans-serif" }}>
      <h3>Login</h3>
      <p>
        <label>Username: </label>
        <input type="string" name="input"
          value={this.state.username}
          onChange={this.doUsernameChange}></input>
      </p>
      <p>
        <label>Password: </label>
        <input type="string" name="input"
          value={this.state.password}
          onChange={this.doPasswordChange}></input>
      </p>
      <button onClick={this.doAccessClick}>Create Account / Login</button>
    </div>);
  }

  doUsernameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ username: evt.target.value.trim() });
  }

  doPasswordChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ password: evt.target.value });
  }

  doAccessClick = (): void => {
    if (this.state.username === "" || this.state.password === "") {
      alert("Username and password must be non-empty")
    } else {
      this.props.onAccess(this.state.username, this.state.password);
    }
  }
}