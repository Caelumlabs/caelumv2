/* eslint-disable no-async-promise-executor */

const Utils = require('./utils');
const { bufferToU8a } = require('@polkadot/util');
const util = require('util');

// Debug
const debug = require('debug')('did:debug:sub');
/**
 * Functions dealing with token management.
 */
module.exports = class Token {
  /**
   * Issue a new class of fungible tokens from a public origin.
   * This new token class has no tokens initially and its owner is the origin.
   * The origin must be Signed (Keypair) and the sender must have sufficient funds free.
   * Funds of sender are reserved by `TokenDeposit`.
   *
   * Parameters:
   * - `id`: The identifier of the new token. This must not be currently in use to identify an existing token.
   * - `admin`: The admin of this class of tokens. The admin is the initial address of each member of the token class's admin team.
   * - `minBalance`: The minimum balance of this new token that any single account must have.
   *    If an account's balance is reduced below this, then it collapses to zero.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the new token.
   * @param {object} admin The admin of this class of tokens.
   * @param {number} minBalance The minimum balance.
   * @returns {Promise} of transaction
   */
  // async createNewToken (exec, keypair, id, admin, minBalance) {
  //   console.log(id, ' - ', admin, ' - ', minBalance)
  //   const transaction = await exec.api.tx.assets.createNewToken(id, minBalance)
  //   return await exec.execTransaction(keypair, transaction)
  // }

  async createToken(exec, keypair, id, admin, minBalance) {
    const transaction = await exec.api.tx.assets.create(id, admin, minBalance, true);
    return await exec.execTransaction(keypair, transaction);
  }

  async createNewToken(exec, keypair, id, admin, minBalance) {
    const transaction = await exec.api.tx.assets.create(id, admin, minBalance);
    const result = await exec.execTransaction(keypair, transaction);
    if (result == true) {
      const trx = await exec.api.tx.assets.forceAssetStatus(id, admin, admin, admin, admin, minBalance, true, false);
      return await exec.execTransaction(keypair, trx);
    }
    return false;
  }

  /**
   * Issue a new class of fungible tokens from a privileged origin.
   * This new token class has no tokens initially.
   * The origin must conform to `ForceOrigin`.
   * Unlike `create`, no funds are reserved.
   *
   * - `id`: The identifier of the new token. This must not be currently in use to identify an existing token.
   * - `owner`: The owner of this class of tokens. The owner has full superuser permissions over this token,
   *    but may later change and configure the permissions using `transfer_ownership`and `set_team`.
   * - `isSufficient`: Controls that the account should have sufficient tokens free.
   * - `minBalance`: The minimum balance of this new token that any single account must have.
   *    If an account's balance is reduced below this, then it collapses to zero.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the new token.
   * @param {object} owner The owner of this class of tokens.
   * @param {bool} isSufficient Controls that the account should have sufficient tokens free.
   * @param {number} minBalance The minimum balance.
   * @returns {Promise} of transaction
   */
  async forceCreateToken(exec, keypair, id, owner, isSufficient, minBalance) {
    const transaction = await exec.api.tx.assets.forceCreate(id, owner, isSufficient, minBalance);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Destroy a class of fungible tokens.
   * The origin must conform to `ForceOrigin` or must be Signed and the sender must be the
   * owner of the token `id`.
   *
   * - `id`: The identifier of the token to be destroyed. This must identify an existing token.
   *   Emits `Destroyed` event when successful.
   * - `witness`: The identifier of the token to be destroyed. This must identify an existing token.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} witness The identifier of the token to be destroyed..
   * @returns {Promise} of transaction
   */
  async destroyToken(exec, keypair, id, witness) {
    const transaction = await exec.api.tx.assets.destroy(id, witness);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Mint tokens of a particular class.
   * The origin must be Signed and the sender must be the Issuer of the token `id`.
   * - `id`: The identifier of the token to have some amount minted.
   * - `beneficiary`: The account to be credited with the minted tokens.
   * - `amount`: The amount of the token to be minted.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} beneficiary The account to be credited with the minted tokenss.
   * @param {number} amount The amount of the token to be minted.
   * @returns {Promise} of transaction
   */
  async mintToken(exec, keypair, id, beneficiary, amount) {
    const transaction = await exec.api.tx.assets.mint(id, beneficiary, amount);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Reduce the balance of `who` by as much as possible up to `amount` tokens of `id`.
   * Origin must be Signed and the sender should be the Manager of the token `id`.
   * Bails with `BalanceZero` if the `who` is already dead.
   *
   * - `id`: The identifier of the token to have some amount burned.
   * - `who`: The account to be debited from.
   * - `amount`: The maximum amount by which `who`'s balance should be reduced.
   *
   *    Modes: Post-existence of `who`; Pre & post Zombie-status of `who`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} who The account to be debited from.
   * @param {number} amount The maximum amount by which `who`'s balance should be reduced.
   * @returns {Promise} of transaction
   */
  async burnToken(exec, keypair, id, who, amount) {
    const transaction = await exec.api.tx.assets.burn(id, who, amount);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Move some tokens from the sender account to another.
   *
   * - `id`: The identifier of the token to have some amount transferred.
   * - `target`: The account to be credited.
   * - `amount`: The amount by which the sender's balance of tokens should be reduced
   * - `target`'s balance increased. The amount actually transferred may be slightly greater in
   *    the case that the transfer would otherwise take the sender balance above zero but below
   *    the minimum balance. Must be greater than zero.
   *
   * Modes: Pre-existence of `target`; Post-existence of sender; Prior & post zombie-status
   * of sender; Account pre-existence of `target`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} target The account to be credited.
   * @param {number} amount The amount by which the sender's balance of tokens should be reduced.
   * @returns {Promise} of transaction
   */
  async transferToken(exec, keypair, id, target, amount) {
    const transaction = await exec.api.tx.assets.transfer(id, target, amount);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Move some tokens from the sender account to another, keeping the sender account alive.
   *
   * - `id`: The identifier of the token to have some amount transferred.
   * - `target`: The account to be credited.
   * - `amount`: The amount by which the sender's balance of tokens should be reduced
   * - `target`'s balance increased. The amount actually transferred may be slightly greater in
   *    the case that the transfer would otherwise take the sender balance above zero but below
   *    the minimum balance. Must be greater than zero.
   * Modes: Pre-existence of `target`; Post-existence of sender; Prior & post zombie-status
   * of sender; Account pre-existence of `target`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} target The amount actually transferred may be slightly greater.
   * @param {number} amount The amount actually transferred.
   * @returns {Promise} of transaction
   */
  async transferTokenKeepAlive(exec, keypair, id, target, amount) {
    const transaction = await exec.api.tx.assets.transferKeepAlive(id, target, amount);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Move some tokens from one account to another.
   * The sender should be the Admin of the token `id`.
   *
   * - `id`: The identifier of the token to have some amount transferred.
   * - `source`: The account to be debited.
   * - `dest`: The account to be credited.
   * - `amount`: The amount by which the `source`'s balance of tokens should be reduced and
   * - `dest`'s balance increased. The amount actually transferred may be slightly greater in
   * the case that the transfer would otherwise take the `source` balance above zero but
   * below the minimum balance. Must be greater than zero.
   * Modes: Pre-existence of `dest`; Post-existence of `source`; Prior & post zombie-status
   * of `source`; Account pre-existence of `dest`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} source The account to be debited.
   * @param {object} dest The account to be credited.
   * @param {number} amount The amount by which the `source`'s balance of tokens should be reduced.
   * @returns {Promise} of transaction
   */
  async forceTransferToken(exec, keypair, id, source, dest, amount) {
    const transaction = await exec.api.tx.assets.forceTransfer(id, source, dest, amount);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Disallow further unprivileged transfers from an account.
   * Sender should be the Freezer of the token `id`.
   *
   * - `id`: The identifier of the token to be frozen.
   * - `who`: The account to be frozen.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {string} who The account to be frozen.
   * @returns {Promise} of transaction
   */
  async freezeAccountForToken(exec, keypair, id, who) {
    const transaction = await exec.api.tx.assets.freeze(id, who);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Allow unprivileged transfers from an account again.
   * Sender should be the Admin of the token `id`.
   *
   * - `id`: The identifier of the token to be frozen.
   * - `who`: The account to be unfrozen.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} who The account to be unfrozen.
   * @returns {Promise} of transaction
   */
  async unfrozenAccountForToken(exec, keypair, id, who) {
    const transaction = await exec.api.tx.assets.thaw(id, who);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Disallow further unprivileged transfers for the token class.
   * Sender should be the Freezer of the token `id`.
   *
   * - `id`: The identifier of the token to be frozen.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @returns {Promise} of transaction
   */
  async freezeToken(exec, keypair, id) {
    const transaction = await exec.api.tx.assets.freezeToken(id);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Allow unprivileged transfers for the token again.
   * Sender should be the Admin of the token `id`.
   *
   * - `id`: The identifier of the token to be frozen.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @returns {Promise} of transaction
   */
  async unfrozenToken(exec, keypair, id) {
    const transaction = await exec.api.tx.assets.thawToken(id);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Change the Owner of a token.
   * Sender should be the Owner of the token `id`.
   *
   * - `id`: The identifier of the token.
   * - `owner`: The new Owner of this token.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} owner The new Owner of this token.
   * @returns {Promise} of transaction
   */
  async transferTokenOwnership(exec, keypair, id, owner) {
    const transaction = await exec.api.tx.assets.transferOwnership(id, owner);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Change the Issuer, Admin and Freezer of a token.
   * Sender should be the Owner of the token `id`.
   *
   * - `id`: The identifier of the token to be frozen.
   * - `issuer`: The new Issuer of this token.
   * - `admin`: The new Admin of this token.
   * - `freezer`: The new Freezer of this token.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} issuer The new Issuer of this token.
   * @param {object} admin The new Admin of this token.
   * @param {object} freezer The new Freezer of this toke.
   * @returns {Promise} of transaction
   */
  async setTokenTeam(exec, keypair, id, issuer, admin, freezer) {
    const transaction = await exec.api.tx.assets.setTeam(id, issuer, admin, freezer);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Set the metadata for a token.
   * Sender should be the Owner of the token `id`.
   *
   * Funds of sender are reserved according to the formula:
   * `MetadataDepositBase + MetadataDepositPerByte * (name.len + symbol.len)` taking into
   * account any already reserved funds.
   *
   * - `id`: The identifier of the token to update.
   * - `name`: The user friendly name of this token. Limited in length by `StringLimit`.
   * - `symbol`: The exchange symbol for this token. Limited in length by `StringLimit`.
   * - `decimals`: The number of decimals this token uses to represent one unit.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {string} name The user friendly name of this token. Limited in length by `StringLimit.
   * @param {string} symbol The exchange symbol for this token. Limited in length by `StringLimit`n.
   * @param {number} decimals The number of decimals this token uses to represent one unit.
   * @returns {Promise} of transaction
   */
  async setTokenMetadata(exec, keypair, id, name, symbol, decimals) {
    const transaction = await exec.api.tx.assets.setMetadata(id, name, symbol, decimals);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Clear the metadata for a token.
   * Sender should be the Owner of the token `id`.
   *
   * Any deposit is freed for the token owner.
   *
   * - `id`: The identifier of the token to clear.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @returns {Promise} of transaction
   */
  async clearTokenMetadata(exec, keypair, id) {
    const transaction = await exec.api.tx.assets.clearMetadata(id);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Force the metadata for a token to some value.
   *
   * Any deposit is left alone.
   *
   * - `id`: The identifier of the token to update.
   * - `name`: The user friendly name of this token. Limited in length by `StringLimit`.
   * - `symbol`: The exchange symbol for this token. Limited in length by `StringLimit`.
   * - `decimals`: The number of decimals this token uses to represent one unit.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {atring} name The user friendly name of this token. Limited in length by `StringLimit`.
   * @param {string} symbol The exchange symbol for this token. Limited in length by `StringLimit`.
   * @param {number} decimals The number of decimals this token uses to represent one unit.
   * @param {bool} isFrozen The identifier of the token.
   * @returns {Promise} of transaction
   */
  async forceSetTokenMetadata(exec, keypair, id, name, symbol, decimals, isFrozen) {
    const transaction = await exec.api.tx.assets.forceSetMetadata(id, name, symbol, decimals, isFrozen);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Clear the metadata for a token.
   *
   * Any deposit is returned.
   *
   * - `id`: The identifier of the token to clear.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @returns {Promise} of transaction
   */
  async forceClearTokenMetadata(exec, keypair, id) {
    const transaction = await exec.api.tx.assets.forceClearMetadata(id);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Alter the attributes of a given token.
   *
   * - `id`: The identifier of the token.
   * - `owner`: The new Owner of this token.
   * - `issuer`: The new Issuer of this token.
   * - `admin`: The new Admin of this token.
   * - `freezer`: The new Freezer of this token.
   * - `min_balance`: The minimum balance of this token that any single account must
   *    have. If an account's balance is reduced below this, then it collapses to zero.
   * - `is_sufficient`: Whether a non-zero balance of this token is deposit of sufficient
   *    value to account for the state bloat associated with its balance storage. If set to
   * - `true`, then non-zero balances may be stored without a `consumer` reference (and thus
   *    an ED in the Balances pallet or whatever else is used to control user-account state
   *    growth).
   * - `is_frozen`: Whether this token class is frozen except for permissioned/admin
   *    instructions.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} owner The new Owner of this token.
   * @param {object} issuer The new Issuer of this token.
   * @param {object} admin The new Admin of this token.
   * @param {object} freezer The new Freezer of this token.
   * @param {number} minBalance The minimum balance of this token.
   * @param {bool} isSufficient Whether a non-zero balance of this token is deposit of sufficient.
   * @param {bool} isFrozen Whether this token class is frozen except for permissioned/admin instructions.
   * @returns {Promise} of transaction
   */
  async forceTokenStatus(exec, keypair, id, owner, issuer, admin, freezer, minBalance, isSufficient, isFrozen) {
    const transaction = await exec.api.tx.assets.forceTokenStatus(id, owner, issuer, admin, freezer, minBalance, isSufficient, isFrozen);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Approve an amount of token for transfer by a delegated third-party account.
   *
   * Ensures that `TokenApprovalDeposit` worth of `Currency` is reserved from signing account
   * for the purpose of holding the approval. If some non-zero amount of tokens is already
   * approved from signing account to `delegate`, then it is topped up or unreserved to
   * meet the right value.
   *
   * NOTE: The signing account does not need to own `amount` of tokens at the point of
   * making this call.
   *
   * - `id`: The identifier of the token.
   * - `delegate`: The account to delegate permission to transfer token.
   * - `amount`: The amount of token that may be transferred by `delegate`. If there is
   *    already an approval in place, then this acts additively.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} delegate The account to delegate permission to transfer token.
   * @param {number} amount The amount of token that may be transferred by `delegate`.
   * @returns {Promise} of transaction
   */
  async approveTokenTransfer(exec, keypair, id, delegate, amount) {
    const transaction = await exec.api.tx.assets.approveTransfer(id, delegate, amount);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Cancel all of some token approved for delegated transfer by a third-party account.
   *
   * Origin must be Signed and there must be an approval in place between signer and `delegate`.
   *
   * Unreserves any deposit previously reserved by `approve_transfer` for the approval.
   *
   * - `id`: The identifier of the token.
   * - `delegate`: The account delegated permission to transfer token.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} delegate The account delegated permission to transfer token.
   * @returns {Promise} of transaction
   */
  async cancelApprovalTokenTransfer(exec, keypair, id, delegate) {
    const transaction = await exec.api.tx.assets.cancelApproval(id, delegate);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Cancel all of some token approved for delegated transfer by a third-party account.
   * Origin must be either ForceOrigin or Signed origin with the signer being the Admin
   * account of the token `id`.
   *
   * Unreserves any deposit previously reserved by `approve_transfer` for the approval.
   *
   * - `id`: The identifier of the token.
   * - `delegate`: The account delegated permission to transfer token.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} owner The new Owner of this token.
   * @param {object} delegate The account delegated permission to transfer token.
   * @returns {Promise} of transaction
   */
  async forceCancelApprovalTokenTransfer(exec, keypair, id, owner, delegate) {
    const transaction = await exec.api.tx.assets.forceCancelApproval(id, owner, delegate);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Transfer some token balance from a previously delegated account to some third-party
   * account.
   * Origin must be Signed and there must be an approval in place by the `owner` to the
   * signer.
   *
   * If the entire amount approved for transfer is transferred, then any deposit previously
   * reserved by `approve_transfer` is unreserved.
   *
   * - `id`: The identifier of the token.
   * - `owner`: The account which previously approved for a transfer of at least `amount` and
   *    from which the token balance will be withdrawn.
   * - `destination`: The account to which the token balance of `amount` will be transferred.
   * - `amount`: The amount of tokens to transfer.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} id The identifier of the token.
   * @param {object} owner The account which previously approved for a transfer of at least `amount`.
   * @param {object} destination The account to which the token balance of `amount` will be transferred.
   * @param {number} amount The amount of tokens to transfer.
   * @returns {Promise} of transaction
   */
  async transferTokenApproval(exec, keypair, id, owner, destination, amount) {
    const transaction = await exec.api.tx.assets.transferApproved(id, owner, destination, amount);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Get Token details data.
   *
   * @param {object} exec Executor class.
   * @param {string} id TokeId
   * @returns {Promise} of Transaction
   */
  async getTokenDetails(exec, id) {
    const tokenDetails = await exec.api.query.assets.asset(id);
    return JSON.parse(tokenDetails);
  }

  /**
   * Get Token metadata.
   *
   * @param {object} exec Executor class.
   * @param {string} id TokeId
   * @returns {Promise} of Transaction
   */
  async getTokenMetadata(exec, id) {
    const metadata = await exec.api.query.assets.metadata(id);
    return JSON.parse(metadata);
  }

  /**
   * Get Account Token data.
   *
   * @param {object} exec Executor class.
   * @param {string} id TokeId
   * @param {string} who Account
   * @returns {Promise} of Transaction
   */
  async getAccountTokenData(exec, id, who) {
    const accountData = await exec.api.query.assets.account(id, who);
    return JSON.parse(accountData);
  }
};
