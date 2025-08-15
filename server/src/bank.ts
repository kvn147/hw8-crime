import { sortDescending } from "./sort";


/** Factory function to creates a new bank with no accounts */
export const openBank = (): Bank => {
  return new AccountList();
}

type Transfer = "send" | "request";
type Request = { readonly requester: string, readonly amount: number }
type AccountData = { username: string, balance: number, pendingRequests: Request[] };

/**
 * Represents a bank: a list of (username, bank account) pairs.
 * Each bank account consists of a user's password, current balance (which must
 * not become negative), and a list of any pending requests for money from
 * other users
*/
export interface Bank {
  /**
   * Initializes user's account with given
   * @param username must not be held by any existing users
   * @param password
   * @param initialBalance in dollars
   */
  openAccount: (username: string, password: string, initialBalance: number) => AccountData;

  /**
   * Verifies user's login credentials, then responds with their public
   *   account info
   * @param username of user attempting to log in
   * @param password of user attempting to log in
   * @throws Error if username does not match that of an existing user,
   *   or if password was incorrect
   * @returns record containing user's 'username', current 'balance' and list
   *   'pendingRequests' (each containing the 'requester' and request 'amount')
   */
  validateLogin: (username: string, password: string) => AccountData | undefined;

  /**
   * Initializes a transfer of money from user1 to user2. If transfer is a 'send,'
   *   process is complete after this method, otherwise user2 must complete transfer.
   * @param user1 sending or requesting money
   * @param user2 recieving money or request
   * @param amount of money being exchanged.
   * @param type indicates if money is being sent or requested
   * @requires user1.balance >= amount if attempting to send money, and
   *   user1 and user2 must both have accounts in bank and be distinct users
   * @modifies obj
   * @effects if type = send: user1Acc.balance -= amount and user2Acc.balance += amount
   *   if type = request: user2Acc.pendingRequests = user2.pendingRequests_0 ++ [user1, amount]
   *   -> where user1Acc = get-value(obj, user1) and user2Acc = get-value(obj, user2)
   * @returns user1's balance after the transfer has initialized
   */
  initializeTransfer: (user1: string, user2: string, amount: number, type: Transfer) => number;

  /**
   * Completes a money request
   * @param user1 sending money to complete request
   * @param request containing user that made request and amount to send,
   * @param amount of money being exchanged
   * @param accept indicates whether request was accepted or not
   * @requires user1's pendinglist must contain request, and user1 and user
   *   in request must both have accounts in bank and be distinct users,
   *   and if accept = true, user1.balance >= amount
   * @modifies obj
   * @effects user1Acc.pendingRequests = user1Acc.pendingRequests_0 ++ [user2, amount]
   *   if accept = true, user1Acc.balance -= amount and user2Acc.balance += amount.
   *   -> where user1Acc = get-value(obj, user1) and user2Acc = get-value(obj, user2)
   * @returns user1's balance and updated pendingRequests after transfer
   */
  completeRequest: (user1: string, request: Request, accept: boolean) => [number, Request[]];

  /**
   * Check if an account exists in the bank with given username
   * @param username to be used to determine if it exists
   * @returns true if the account exists and false if does not
   */
  hasAccount: (username: string) => Boolean;

  /**
   * Gets all bank account info, if user has proper access
   * @param accessKey attempting to access acount info
   * @throws Error if accessKey is incorrect
   * @returns a list of all bank accounts, sorted in decreasing order
   *   by balance
   */
  getAccounts: () => AccountData[];
}


/** Implements a bank by storing accounts in a map with user names as they key */
class AccountList implements Bank {
  // RI: get-value(accounts, k).balance >= 0 for all k in get-keys(accounts), and
  //  pending requests for each account must only have requesters that are other users
  // AF: obj = this.accounts
  accounts: Map<string, Account>;

  constructor() {
    this.accounts = new Map();
  }

  openAccount = (username: string, password: string, initialBalance: number): AccountData => {
    const account = new Account(username, password, initialBalance);
    this.accounts.set(username, account);

    return { username, balance: initialBalance, pendingRequests: [] };
  }

  validateLogin = (username: string, password: string): AccountData | undefined => {
    const account = this.accounts.get(username);
    if (account === undefined) {
      throw new Error(`${username} does not have an account`);
    }

    if (account.validatePassword(password)) {
      return { username: username, balance: account.getBalance(), pendingRequests: account.getPendingRequests() };
    } else {
      return undefined;
    }
  }

  initializeTransfer = (user1: string, user2: string, amount: number, type: Transfer): number => {
    const user1Acc = this.accounts.get(user1);
    const user2Acc = this.accounts.get(user2);

    if (user1Acc === undefined || user2Acc === undefined) {
      throw new Error("Both user1 and user2 must have accounts in the bank");
    }

    if (type === 'send') {
      if (user1Acc.getBalance() - amount < 0) {
        throw new Error(`${user1} does not have enough money in their account`)
      }

      // remove money from user1 and add to user2 to complete 'send'
      user1Acc.updateBalance(-amount);
      user2Acc.updateBalance(amount);
    } else { // 'request'
      // Add request to pending list
      user2Acc.addRequest({ requester: user1, amount });
    }

    return user1Acc.getBalance(); // only will have changed for a 'send'
  }

  completeRequest = (user1: string, request: Request, accept: boolean): [number, Request[]] => {
    const user1Acc = this.accounts.get(user1);
    const user2Acc = this.accounts.get(request.requester);

    if (user1Acc === undefined || user2Acc === undefined) {
      throw new Error("Both user1 and user2 must have accounts in the bank");
    }

    // remove request from user1's pending list
    //  done BEFORE removing amount, as error (defensive programming) will be
    //  thrown if request does not exist
    user1Acc.removeRequest(request);

    if (accept === true) {
      if (user1Acc.getBalance() - request.amount < 0) {
        throw new Error(`${user1} does not have enough money in their account`)
      }

      // remove money from user1 and add to user2 to complete user2's request
      user1Acc.updateBalance(-request.amount);
      user2Acc.updateBalance(request.amount);
    } // otherwise, denied request, shouldn't update balance

    return [user1Acc.getBalance(), user1Acc.getPendingRequests()];
  }

  hasAccount = (username: string): Boolean => {
    return this.accounts.has(username);
  }

  getAccounts = (): AccountData[] => {
    const accounts = [];
    for (const account of this.accounts.values()) {
      accounts.push({
        username: account.username,
        password: account.password,
        balance: account.getBalance(),
        pendingRequests: account.getPendingRequests()
      });
    }

    // Sort accounts by decreasing balance first
    sortDescending(accounts, accountComparator);
    return accounts;
  }
}

// Returns a positive number if a > b, 0 if a = b, negative if a < b
// by balance
const accountComparator = (a: AccountData, b: AccountData): number => {
  return a.balance - b.balance;
}



/**
 * PRIVATE interface describing an account for the bank containing a user's
 * username, password, balance (which must not become negative),
 * and a list of any pendingRequests for money from other users
*/
interface BankAccount {
  /**
   * Confirms if the given password is correct for this account
   * @param password to compare to real account password
   * @returns password = obj.password
   */
  validatePassword: (password: string) => boolean;

  /**
   * Gets the balance of this bank account
   * @returns obj.balance
   */
  getBalance: () => number;

  /**
   * Gets the list of (requester, amount) pairs for all pending
   *    requests made to this account
   * @returns obj.pendingRequests
   */
  getPendingRequests: () => Request[];

  /**
   * Adusts users balance by given amount
   * @param amount to add to users account, obj_0.balance + amount must be >= 0
   * @modifies obj
   * @effects obj.balance = obj_0.balance + amount
   */
  updateBalance: (amount: number) => void;

  /**
   * Adds the given (requester, amount) pair to the list of pending
   *    requests made to this account
   * @param request to add
   * @modifies obj
   * @effects obj.pendingRequests = obj_0.pendingRequests ++ [request]
   */
  addRequest: (request: Request) => void;

  /**
   * Removes the given (requester, amount) pair from the list of pending
   *    requests made to this account, only removes 1 if duplicates exist
   * @param request to remove
   * @throws error if request does not exist in obj_0.pendingRequests
   * @effects obj_0.pendingRequests = obj.pendingRequests ++ [request]
   */
  removeRequest: (request: Request) => void;
}


/** Simple representation of a bank account */
class Account implements BankAccount {
  // RI: this.balance >= 0
  // AF: obj = {this.username, this.password, this.balance, this.pendingRequests}
  readonly username: string;
  readonly password: string;
  balance: number;
  pendingRequests: Request[]

  constructor(username: string, password: string, balance: number) {
    this.username = username;
    this.password = password;
    this.balance = balance;
    this.pendingRequests = [];
  }

  validatePassword = (password: string): boolean => {
    // Thankfully this is NOT how password storage & validation works irl
    return this.password === password;
  }

  getBalance = (): number => {
    return this.balance;
  }

  getPendingRequests = (): Request[] => {
    // Requests is immutable, so slice() is sufficient
    return this.pendingRequests.slice();
  }

  updateBalance = (amount: number): void => {
    this.balance = this.balance + amount;
  }

  addRequest = (request: Request): void => {
    this.pendingRequests.push(request);
  }

  removeRequest = (request: Request): void => {
    let i = 0;
    const newList = []
    // Inv: newList[0..i-1] = this.pendingRequests[0..i-1]
    //      and this.pendingRequests[k] != request for all 0 <= k < i-1
    while (i < this.pendingRequests.length &&
      (this.pendingRequests[i].requester !== request.requester ||
        this.pendingRequests[i].amount !== request.amount)) {
      const r: Request = this.pendingRequests[i];
      newList.push(r);
      i = i + 1;
    }

    // If we reached the end of the list, request to remove was not found
    if (i === this.pendingRequests.length) {
      throw new Error("Request to remove does not exist in user's pending requests")
    }

    this.pendingRequests = newList.concat(this.pendingRequests.slice(i + 1))
  }
}