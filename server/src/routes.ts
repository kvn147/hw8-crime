import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { Bank, openBank } from "./bank";


// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check

// NOTE: @requires mentioned for these server routes may cause 500 errors
//   if they aren't met. Ideally server would send 400s instead.

/** Contains the saved contents (of unknown type) for each file name */
const bank: Bank = openBank();

/**
 * Creates a new account for user
 * @param req body must contain string 'username' and 'password' for
 *    new user to create or existing user to log in for
 * @param res with 200 status containing record of new user data:
 *    {username: string, balance: number, pendingRequests: Request[]}
 *   - or 400 status with error message if parameters were missing/incorrect
 */
export const access = (req: SafeRequest, res: SafeResponse): void => {
  const username = req.body.username;
  if (typeof username !== 'string') {
    res.status(400).send('missing or invalid "name" in POST body');
    return;
  }

  const password = req.body.password;
  if (typeof password !== 'string') {
    res.status(400).send('missing or invalid "password" in POST body');
    return;
  }

  if (bank.hasAccount(username)) { // Login
    const userData = bank.validateLogin(username, password);
    if (userData === undefined) {
      res.status(400).send("Password was wrong");
      return;
    }
    res.json(userData);
  } else { // Create
    // Save to list of all accounts with initial balance of $100
    const userData = bank.openAccount(username, password, 100);
    res.json(userData);
  }

};

/**
 * Initializes a transfer of money from user to friend.
 * @param req body must contain
 *  - string username of 'user' and 'friend'
 *  - numerical 'amount' to transfer
 *  - the transfer type ('send' or 'request')
 * @requires that 'amount' be greater than 'user's current balance
 * @param res with 200 status containing confirmation that transfer was
 *    'initialized' and updated 'balance' for user
 *   - or 400 status with error message if parameters were missing/incorrect
 *     or user's do not have distinct, existing accounts
 */
export const initializeTransfer = (req: SafeRequest, res: SafeResponse): void => {
  const username = req.body.username;
  if (typeof username !== 'string') {
    res.status(400).send('missing or invalid "username" in POST body');
    return;
  }

  const friend = req.body.friend;
  if (typeof friend !== 'string') {
    res.status(400).send('missing or invalid "friend" in POST body');
    return;
  }

  if (!bank.hasAccount(username) || !bank.hasAccount(friend)) {
    res.status(400).send(`${username} or ${friend} do not have accounts!`);
    return;
  }

  if (username === friend) {
    res.status(400).send("Attempted to initialize transfer to self!");
    return;
  }

  const amount = req.body.amount;
  if (typeof amount !== 'number') {
    res.status(400).send('missing or invalid "amount" in POST body');
    return;
  }

  const type = req.body.type;
  if (type !== 'send' && type !== "request") {
    res.status(400).send('missing or invalid "type" in POST body');
    return;
  }

  const balance = bank.initializeTransfer(username, friend, amount, type);
  res.json({ initialized: true, newBalance: balance });
}

/**
 * Completes a money request made by 'friend' to 'user'
 * @param req body must contain
 *  - string username of 'user' and 'friend'
 *  - numerical 'amount' requested by friend
 *  - T/F indicating to 'accept' the request or not
 * @requires that 'amount' be greater than 'user's current balance,
 *    and that request exists
 * @param res with 200 status containing confirmation that request was
 *    'completed' and updated 'balance' and list of 'pendingRequests' for user
*   - or 400 status with error message if parameters were missing/incorrect
 *     or user's do not have distinct, existing accounts
 */
export const completeRequest = (req: SafeRequest, res: SafeResponse): void => {
  const username = req.body.username;
  if (typeof username !== 'string') {
    res.status(400).send('missing or invalid "username" in POST body');
    return;
  }

  const friend = req.body.friend;
  if (typeof friend !== 'string') {
    res.status(400).send('missing or invalid "friend" in POST body');
    return;
  }

  if (!bank.hasAccount(username) || !bank.hasAccount(friend)) {
    res.status(400).send(`${username} or ${friend} do not have accounts!`);
    return;
  }

  if (username === friend) {
    res.status(400).send("Attempted to complete transfer to self!");
    return;
  }

  const accept = req.body.accept;
  if (typeof accept !== 'boolean') {
    res.status(400).send('missing or invalid "accept" in POST body');
    return;
  }

  const amount = req.body.amount;
  if (typeof amount !== 'number') {
    res.status(400).send('missing or invalid "amount" in POST body');
    return;
  }

  const [balance, pending] = bank.completeRequest(username, { requester: friend, amount }, accept);
  res.json({ completed: true, newBalance: balance, pendingRequests: pending });
}

/**
 * FOR TESTING PURPOSES ONLY ! lol and crime don't tell
 * @param res contains 'data' a list of all users' usernames, passwords, and
 *  balances, sorted in decreasing order of balance with 200 status
 */
export const getAllAccountData = (_req: SafeRequest, res: SafeResponse): void => {
  res.json({ data: bank.getAccounts() });
}


// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
const first = (param: unknown): string | undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};
