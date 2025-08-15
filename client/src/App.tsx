import React, { Component } from "react";
import { isRecord } from "./record";
import { Transactions } from "./Transactions";
import { Login } from "./Login";
import './App.css';

export type Transfer = "send" | "request";
export type Requests = { readonly requester: string, readonly amount: number }

/** Describes set of possible app page views */
type Page =
  {kind: "login"} |
  {kind: "transactions", username: string, balance: number, pendingRequests: Requests[]};

type AppState = {
  page: Page
};

/** Displays the entire application & manages server accesses. */
export class App extends Component<{}, AppState> {

  constructor(props: {}) {
    super(props);

    // default to login page
    this.state = {page: {kind: "login"}};
  }

  render = (): JSX.Element => {
    if (this.state.page.kind === "login") {
      return <Login onAccess={this.doAccessClick}></Login>
    } else { // Transaction Page
      return <Transactions
        username={this.state.page.username}
        balance={this.state.page.balance}
        pendingRequests={this.state.page.pendingRequests}
        onTransactionStart={this.doTransactionStartClick}
        onTransactionComplete={this.doTransactionCompleteClick}
        onLogOut={this.doLogOutClick}
      ></Transactions>
    }
  };

  doAccessClick = (username: string, password: string): void => {
    const body = { username: username, password: password };
    fetch("/api/access", {
      method: 'POST', body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })
      .then((res) => this.doAccessResp(res))
      .catch(this.doAccessError);
  }

  doAccessResp = (res: Response): void => {
    if (res.status === 200) {
      res.json()
        .then(this.doAccessJson)
        .catch((e) => this.doAccessError(`Error parsing 200 response. ${e}`));
    } else if (res.status === 400) {
      res.text().then(this.doAccessError)
        .catch(() => this.doAccessError("Error parsing 400 response"));
    } else {
      this.doAccessError("Bad status code");
    }
  };

  doAccessJson = (val: unknown): void => {
    if (!isRecord(val)) {
      throw new Error(`val is not a record: ${typeof val}`);
    }
    if (typeof val.username !== "string") {
      throw new Error('Invalid username from /api/access');
    }
    if (typeof val.balance !== "number") {
      throw new Error('Invalid balance from /api/access');
    }
    if (!Array.isArray(val.pendingRequests)) {
      throw new Error('Invalid requests from /api/access');
    }

    for (const request of val.pendingRequests) {
      if (typeof request.requester !== "string" ||
        typeof request.amount !== "number") {
        throw new Error('Invalid request from /api/access');
      }
    }

    this.setState({page:
      {kind: "transactions", username: val.username, balance: val.balance,
      pendingRequests: val.pendingRequests}
    });
  }

  doAccessError = (msg: string): void => {
    alert(msg);
    console.error(`Error fetching /api/access: ${msg}`);
  }

  doLogOutClick = (): void => {
    this.setState({ page: {kind: "login"}});
  }

  doTransactionStartClick = (username: string, friend: string,
    amount: number, type: Transfer): void => {

    // TODO (Task 3): make a fetch request to "/api/transactionStart"
    console.log(`remove this! just for pesky unused variable erros ${username} ${friend} ${amount} ${type}`)
  }

  doTransactionCompleteClick = (username: string, friend: string,
    amount: number, accept: boolean): void => {

    // TODO (Task 4): make a fetch request to "/api/completeRequest"
    console.log(`remove this! just for pesky unused variable erros ${username} ${friend} ${amount} ${accept}`)
  }
}
