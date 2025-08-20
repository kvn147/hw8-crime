import React, { ChangeEvent, Component } from 'react';
import { Requests, Transfer } from './App';

type TransactionProps = {
  username: string
  balance: number
  pendingRequests: Requests[]

  /** Called on Logout click, returns to login page */
  onLogOut: () => void

  /** Transaction Handler for 'Send' and 'Request' clicks */
  onTransactionStart: (username: string, friend: string,
    amount: number, type: Transfer) => void

  /** Transaction resolver for 'accept' or 'deny' */
  onTransactionComplete: (username: string, friend: string,
    amount: number, accept: boolean) => void
}

type TransactionState = {
  username: string,
  balance: number,
  pendingRequests: Requests[],
  requestAmount: number,
  friend: string
}

/**
 * Page where user can see their balance, send money to other users,
 * request money from other users, and deny or accept other users' requests
 */
export class Transactions extends Component<TransactionProps, TransactionState> {
  constructor(props: TransactionProps) {
    super(props);

    this.state = {
      username: this.props.username,
      balance: this.props.balance,
      pendingRequests: this.props.pendingRequests,
      requestAmount: 0,
      friend: ""
    };
  }

  componentDidUpdate = (prevProps: Readonly<TransactionProps>, _: Readonly<TransactionState>): void => {
    if (prevProps !== this.props) {
      this.setState({ 
        balance: this.props.balance,
        pendingRequests: this.props.pendingRequests,
        username: this.props.username,
        requestAmount: 0,
        friend: ""
      });
    }
  }

  render = (): JSX.Element => {
    return (<div style={{ fontFamily: "sans-serif" }}>
      <h2>Hi {this.state.username}!</h2>
      <div>Balance: {this.state.balance}</div>
      <h3>Start Transaction</h3>
      <p>
        <label>Amount: </label>
        <input
          type="number"
          name="input"
          min="0"
          value={this.state.requestAmount}
          onChange={this.doAmountChange}
        />
      </p>
      <p>
        <label>Friend: </label>
        <input type="string" name="input"
          value={this.state.friend}
          onChange={this.doFriendChange}></input>
      </p>
      <button onClick={() => this.doTransactionStartClick("send")}>Send</button>
      <button onClick={() => this.doTransactionStartClick("request")}>Request</button>
      <button onClick={this.doLogOutClick}>Logout</button>
      {this.renderRequests()}
    </div>);
  }

  renderRequests = (): JSX.Element => {
    const requests: Array<JSX.Element> = [];

    if (this.state.pendingRequests.length === 0) {
      requests.push(<p key={"none"}>None</p>)
    }

    for (const r of this.state.pendingRequests) {
      const id = `${r.requester}_check`;
      requests.push(
        <div className="request" key={r.requester}>
          <label htmlFor={id}>{r.requester}: {r.amount}</label>{' '}
          <button id={id} className="approve"
            onClick={() => this.doTransactionCompleteClick(r.requester, r.amount, true)}
          >Approve</button>
          <button id={id} className="deny"
            onClick={() => this.doTransactionCompleteClick(r.requester, r.amount, false)}
          >Deny</button>
        </div>);
    }

    return <div>
      <h3>Pending Requests:</h3>
      {requests}
    </div>
  };

  doAmountChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    const amount = parseFloat(evt.target.value);
    if (evt.target.value === "") {
      this.setState({ requestAmount: 0 })
    }
    if (!isNaN(amount)) {
      this.setState({ requestAmount: amount });
    }
  }

  doFriendChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ friend: evt.target.value.trim() });
  }

  doTransactionStartClick = (type: Transfer): void => {
    // TODO (Task 3): implement
    if (!this.state.friend) {
      alert("Friend must be non-empty");
      return;
    }
    if (!(this.state.requestAmount >= 0)) {
      alert("Amount must be a non-negative number");
      return;
    }
    if (type === "send" && this.state.requestAmount > this.state.balance) {
      alert("Insufficient balance to send");
      return;
    }
    this.props.onTransactionStart(this.state.username, this.state.friend, this.state.requestAmount, type);
  }

  doTransactionCompleteClick = (friend: string, amount: number, accept: boolean): void => {
    // TODO (Task 4): implement
    if (accept && this.state.balance < amount) {
      alert("Insufficient balance to accept request");
      return;
    }
    this.props.onTransactionComplete(this.state.username, friend, amount, accept);
  }

  doLogOutClick = (): void => {
    this.props.onLogOut();
  }
}