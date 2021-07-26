/* eslint-disable no-async-promise-executor */
'use strict'
const { bufferToU8a, stringToU8a, u8aConcat, u8aToHex, hexToU8a, hexToString, stringToHex } = require('@polkadot/util')

// Debug
var debug = require('debug')('did:debug:sub')

/**
 * Functions dealing with the management of classes and tokens non-fungibles.
 */
module.exports = class ClassNFTs {
  /**
   * Issue a new class of non-fungible assets from a public origin.
   * This new asset class has no assets initially and its owner is the origin.
   *
   * The origin must be Signed and the sender must have sufficient funds free.
   *
   * `AssetDeposit` funds of sender are reserved.
   *
   * Parameters:
   * - `classid`: The identifier of the new asset class. This must not be currently in use.
   * - `admin`: The admin of this class of assets. The admin is the initial address of each
   *    member of the asset class's admin team.
   *
   * Emits `Created` event when successful.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The identifier of the new class of tokens.
   * @param {object} admin The admin of this class of tokens.
   * @returns {Promise} of transaction
   */
  async createNFTClass (exec, keypair, classid, admin) {
    const transaction = await exec.api.tx.classNfts.create(classid, admin)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Issue a new class of non-fungible assets from a privileged origin.
   * This new asset class has no assets initially.
   *
   * The origin must conform to `ForceOrigin`.
   *
   * Unlike `create`, no funds are reserved.
   *
   * - `classid`: The identifier of the new asset. This must not be currently in use.
   * - `owner`: The owner of this class of assets. The owner has full superuser permissions
   *    over this asset, but may later change and configure the permissions using
   *    `transferOwnership` and `setTeam`.
   *
   * Emits `ForceCreated` event when successful.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The identifier of the new class of tokens.
   * @param {object} owner The admin of this class of tokens.
   * @param {bool} freeHolding The free Holdinfg of this class of tokens.
   * @returns 
   */
  async forceCreateNFTClass (exec, keypair, classid, owner, freeHolding) {
    const transaction = await exec.api.tx.classNfts.forceCreate(classid, owner, freeHolding)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Destroy a class of non-fungible assets.
   * The origin must conform to `ForceOrigin` or must be `Signed` and the sender must be the
   * owner of the asset `class`.
   *
   * - `classid`: The identifier of the asset class to be destroyed.
   * - `witness`: Information on the instances minted in the asset class. This must be correct.
   *
   * Emits `Destroyed` event when successful.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The identifier of the new class of tokens.
   * @param {object} witness Information on the instances minted in the asset class.
   * @returns {Promise} of transaction
   */
  async destroyNFTClass (exec, keypair, classid, witness) {
    const transaction = await exec.api.tx.classNfts.destroy(classid, witness)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Mint an asset instance of a particular class.
   *
   * The origin must be Signed and the sender must be the Issuer of the asset `class`.
   *
   * - `classid`: The class of the asset to be minted.
   * - `instanceid`: The instance value of the asset to be minted.
   * - `owner`: The initial owner of the minted asset.
   *
   * Emits `Issued` event when successful.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The identifier of the new class of tokens.
   * @param {object} instanceid The instance value of the asset to be minted.
   * @param {object} owner The initial owner of the minted asset.
   * @returns {Promise} of transaction
   */
  async mintNFTInstance (exec, keypair, classid, instanceid, owner) {
    const transaction = await exec.api.tx.classNfts.mint(classid, instanceid, owner)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Destroy a single asset instance.
   *
   * Origin must be Signed and the sender should be the Admin of the asset `class`.
   *
   * - `classid`: The class of the asset to be burned.
   * - `instanceid`: The instance of the asset to be burned.
   * - `check_owner`: If `Some` then the operation will fail with `WrongOwner` unless the
   *   asset is owned by this value.
   *
   * Emits `Burned` with the actual amount burned.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The identifier of the new class of tokens.
   * @param {object} instanceid The instance value of the asset to be minted.
   * @param {object} checkOwner Checks Owner.
   * @returns {Promise} of transaction
   */
  async burnNFTInstance (exec, keypair, classid, instanceid, checkOwner) {
    const transaction = await exec.api.tx.classNfts.burn(classid, instanceid, checkOwner)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Move an asset from the sender account to another.
   *
   * Origin must be Signed and the signing account must be either:
   * - the Admin of the asset `class`;
   * - the Owner of the asset `instance`;
   * - the approved delegate for the asset `instance` (in this case, the approval is reset).
   *
   * Arguments:
   * - `classid`: The class of the asset to be transferred.
   * - `instanceid`: The instance of the asset to be transferred.
   * - `dest`: The account to receive ownership of the asset.
   *
   * Emits `Transferred`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The identifier of the new class of tokens. 
   * @param {object} instanceid The instance value of the asset to be minted. 
   * @param {object} dest The account to receive ownership of the asset. 
   * @returns {Promise} of transaction
   */
  async transferNFTInstance (exec, keypair, classid, instanceid, dest) {
    const transaction = await exec.api.tx.classNfts.transfer(classid, instanceid, dest)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Reevaluate the deposits on some assets.
   *
   * Origin must be Signed and the sender should be the Owner of the asset `class`.
   *
   * - `classid`: The class of the asset to be frozen.
   * - `instances`: The instances of the asset class whose deposits will be reevaluated.
   *
   * NOTE: This exists as a best-effort function. Any asset instances which are unknown or
   * in the case that the owner account does not have reservable funds to pay for a
   * deposit increase are ignored. Generally the owner isn't going to call this on instances
   * whose existing deposit is less than the refreshed deposit as it would only cost them,
   * so it's of little consequence.
   *
   * It will still return an error in the case that the class is unknown of the signer is
   * not permitted to call it.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The identifier of the new class of tokens. 
   * @param {object} instances The instances of the asset class whose deposits will be reevaluated. 
   * @returns {Promise} of transaction
   */
  async redepositNFTInstances (exec, keypair, classid, instances) {
    const transaction = await exec.api.tx.classNfts.redeposit(classid, instances)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Disallow further unprivileged transfer of an asset instance.
   *
   * Origin must be Signed and the sender should be the Freezer of the asset `class`.
   *
   * - `classid`: The class of the asset to be frozen.
   * - `instanceid`: The instance of the asset to be frozen.
   *
   * Emits `Frozen`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset to be frozen. 
   * @param {object} instanceid The instance of the asset to be frozen. 
   * @returns {Promise} of transaction
   */
  async freezeNFTInstance (exec, keypair, classid, instanceid) {
    const transaction = await exec.api.tx.classNfts.freeze(classid, instanceid)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Re-allow unprivileged transfer of an asset instance.
   *
   * Origin must be Signed and the sender should be the Freezer of the asset `class`.
   *
   * - `classid`: The class of the asset to be thawed.
   * - `instanceid`: The instance of the asset to be thawed.
   *
   * Emits `Thawed`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset to be frozen. 
   * @param {object} instanceid The instance of the asset to be frozen. 
   * @returns {Promise} of transaction
   */
  async unfrozenNFTInstance (exec, keypair, classid, instanceid) {
    const transaction = await exec.api.tx.classNfts.thaw(classid, instanceid)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Disallow further unprivileged transfers for a whole asset class.
   *
   * Origin must be Signed and the sender should be the Freezer of the asset `class`.
   *
   * - `classid`: The asset class to be frozen.
   *
   * Emits `ClassFrozen`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset to be frozen. 
   * @returns {Promise} of transaction
   */
  async freezeNFTClass (exec, keypair, classid) {
    const transaction = await exec.api.tx.classNfts.freezeClass(classid)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Re-allow unprivileged transfers for a whole asset class.
   *
   * Origin must be Signed and the sender should be the Admin of the asset `class`.
   *
   * - `classid`: The class to be thawed.
   *
   * Emits `ClassThawed`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset to be unfrozen. 
   * @returns {Promise} of transaction
   */
  async unfrozenNFTClass (exec, keypair, classid) {
    const transaction = await exec.api.tx.classNfts.thawClass(classid)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Change the Owner of an asset class.
   *
   * Origin must be Signed and the sender should be the Owner of the asset `class`.
   *
   * - `classid`: The asset class whose owner should be changed.
   * - `owner`: The new Owner of this asset class.
   *
   * Emits `OwnerChanged`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset to be transfer. 
   * @param {object} owner The new Owner of this asset class.
   * @returns {Promise} of transaction
   */
  async transferOwnershipOfNFTClass (exec, keypair, classid, owner) {
    const transaction = await exec.api.tx.classNfts.transferOwnership(classid, owner)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Change the Issuer, Admin and Freezer of an asset class.
   *
   * Origin must be Signed and the sender should be the Owner of the asset `class`.
   *
   * - `classid`: The asset class whose team should be changed.
   * - `issuer`: The new Issuer of this asset class.
   * - `admin`: The new Admin of this asset class.
   * - `freezer`: The new Freezer of this asset class.
   *
   * Emits `TeamChanged`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset to be frozen. 
   * @param {object} issuer The new Issuer of this asset class.
   * @param {object} admin The new AdminOwner of this asset class.
   * @param {object} freezer The new Freezer of this asset class.
   * @returns {Promise} of transaction
   */
  async setTeamOfNFTClass (exec, keypair, classid, issuer, admin, freezer) {
    const transaction = await exec.api.tx.classNfts.setTeam(classid, issuer, admin, freezer)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Approve an instance to be transferred by a delegated third-party account.
   *
   * Origin must be Signed and must be the owner of the asset `instance`.
   *
   * - `classid`: The class of the asset to be approved for delegated transfer.
   * - `instanceid`: The instance of the asset to be approved for delegated transfer.
   * - `delegate`: The account to delegate permission to transfer the asset.
   *
   * Emits `ApprovedTransfer` on success.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset to be frozen. 
   * @param {object} instanceid The instance of the asset to be approved for delegated transfer..
   * @param {object} delegate The account to delegate permission to transfer the asset.
   * @returns {Promise} of transaction
   */
  async approveTransferOfNFTInstance (exec, keypair, classid, instanceid, delegate) {
    const transaction = await exec.api.tx.classNfts.approveTransfer(classid, instanceid, delegate)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Cancel the prior approval for the transfer of an asset by a delegate.
   *
   * Origin must be either:
   * - the `Force` origin;
   * - `Signed` with the signer being the Admin of the asset `class`;
   * - `Signed` with the signer being the Owner of the asset `instance`;
   *
   * Arguments:
   * - `classid`: The class of the asset of whose approval will be cancelled.
   * - `instanceid`: The instance of the asset of whose approval will be cancelled.
   * - `maybe_check_delegate`: If `Some` will ensure that the given account is the one to
   *    which permission of transfer is delegated.
   *
   * Emits `ApprovalCancelled` on success.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset to be frozen. 
   * @param {object} instanceid The instance of the asset to be approved for delegated transfer..
   * @param {object} maybeCheckDelegate Check delegate.
   * @returns {Promise} of transaction
   */
  async cancelApprovalOfTransferOfNFTInstance (exec, keypair, classid, instanceid, maybeCheckDelegate) {
    const transaction = await exec.api.tx.classNfts.cancelApproval(classid, instanceid, maybeCheckDelegate)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Alter the attributes of a given asset.
   *
   * Origin must be `ForceOrigin`.
   *
   * - `classid`: The identifier of the asset.
   * - `owner`: The new Owner of this asset.
   * - `issuer`: The new Issuer of this asset.
   * - `admin`: The new Admin of this asset.
   * - `freezer`: The new Freezer of this asset.
   * - `free_holding`: Whether a deposit is taken for holding an instance of this asset
   *   class.
   * - `is_frozen`: Whether this asset class is frozen except for permissioned/admin
   * instructions.
   *
   * Emits `AssetStatusChanged` with the identity of the asset.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset. 
   * @param {object} owner The new Owner of this asset.
   * @param {object} issuer The new Owner of this asset.
   * @param {object} admin The new Owner of this asset.
   * @param {object} freezer The new Owner of this asset.
   * @param {object} freeHolding Free holding.
   * @param {object} isFrozen Frozen?.
   * @returns {Promise} of transaction
   */
  async forceTokenStatusOfNFTClass (exec, keypair, classid, owner, issuer, admin, freezer, freeHolding, isFrozen) {
    const transaction = await exec.api.tx.classNfts.forceAssetStatus(classid, owner, issuer, admin, freezer, freeHolding, isFrozen)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Set an attribute for an asset class or instance.
   *
   * Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
   * asset `class`.
   *
   * If the origin is Signed, then funds of signer are reserved according to the formula:
   * `MetadataDepositBase + DepositPerByte * (key.len + value.len)` taking into
   * account any already reserved funds.
   *
   * - `classid`: The identifier of the asset class whose instance's metadata to set.
   * - `maybeInstance`: The identifier of the asset instance whose metadata to set.
   * - `key`: The key of the attribute.
   * - `value`: The value to which to set the attribute.
   *
   * Emits `AttributeSet`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset. 
   * @param {object} maybeInstance The identifier of the asset instance whose metadata to set.
   * @param {object} key The key of the attribute.
   * @param {object} value The value to which to set the attribute.
   * @returns {Promise} of transaction
   */
  async setAttributeOfNFT (exec, keypair, classid, maybeInstance, key, value) {
    const transaction = await exec.api.tx.classNfts.setAttribute(classid, maybeInstance, key, value)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Set an attribute for an asset class or instance.
   *
   * Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
   * asset `class`.
   *
   * If the origin is Signed, then funds of signer are reserved according to the formula:
   * `MetadataDepositBase + DepositPerByte * (key.len + value.len)` taking into
   * account any already reserved funds.
   *
   * - `classid`: The identifier of the asset class whose instance's metadata to set.
   * - `maybeInstance`: The identifier of the asset instance whose metadata to set.
   * - `key`: The key of the attribute.
   * - `value`: The value to which to set the attribute.
   *
   * Emits `AttributeSet`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset. 
   * @param {object} maybeInstance The identifier of the asset instance whose metadata to set.
   * @param {object} key The key of the attribute.
   * @returns {Promise} of transaction
   */
  async clearAttributeOfNFT (exec, keypair, classid, maybeInstance, key) {
    const transaction = await exec.api.tx.classNfts.clearAttribute(classid, maybeInstance, key)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Set the metadata for an asset instance.
   *
   * Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
   * asset `class`.
   *
   * If the origin is Signed, then funds of signer are reserved according to the formula:
   * `MetadataDepositBase + DepositPerByte * data.len` taking into
   * account any already reserved funds.
   *
   * - `classid`: The identifier of the asset class whose instance's metadata to set.
   * - `instanceid`: The identifier of the asset instance whose metadata to set.
   * - `data`: The general information of this asset. Limited in length by `StringLimit`.
   * - `isFrozen`: Whether the metadata should be frozen against further changes.
   *
   * Emits `MetadataSet`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset. 
   * @param {number} instanceid The identifier of the asset instance whose metadata to set.
   * @param {object} data The general information of this asset. Limited in length by `StringLimit`.
   * @param {object} isFrozen Frozen?.
   * @returns {Promise} of transaction
   */
  async setMetadataOfNFTInstance (exec, keypair, classid, instanceid, data, isFrozen) {
    const transaction = await exec.api.tx.classNfts.setMetadata(classid, instanceid, data, isFrozen)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Clear the metadata for an asset instance.
   *
   * Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
   * asset `instance`.
   *
   * Any deposit is freed for the asset class owner.
   *
   * - `classid`: The identifier of the asset class whose instance's metadata to clear.
   * - `instanceid`: The identifier of the asset instance whose metadata to clear.
   *
   * Emits `MetadataCleared`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset. 
   * @param {number} instanceid The identifier of the asset instance whose metadata to clear.
   * @returns {Promise} of transaction
   */
  async clearMetadataOfNFTInstance (exec, keypair, classid, instanceid) {
    const transaction = await exec.api.tx.classNfts.clearMetadata(classid, instanceid)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Set the metadata for an asset class.
   *
   * Origin must be either `ForceOrigin` or `Signed` and the sender should be the Owner of
   * the asset `class`.
   *
   * If the origin is `Signed`, then funds of signer are reserved according to the formula:
   * `MetadataDepositBase + DepositPerByte * data.len` taking into
   * account any already reserved funds.
   *
   * - `classid`: The identifier of the asset whose metadata to update.
   * - `data`: The general information of this asset. Limited in length by `StringLimit`.
   * - `isFrozen`: Whether the metadata should be frozen against further changes.
   *
   * Emits `ClassMetadataSet`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset.
   * @param {object} data The general information of this asset. Limited in length by `StringLimit`.
   * @param {object} isFrozen Frozen?.
   * @returns {Promise} of transaction
   */
  async setMetadataOfNFTClass (exec, keypair, classid, data, isFrozen) {
    const transaction = await exec.api.tx.classNfts.setClassMetadata(classid, data, isFrozen)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Clear the metadata for an asset class.
   *
   * Origin must be either `ForceOrigin` or `Signed` and the sender should be the Owner of
   * the asset `class`.
   *
   * Any deposit is freed for the asset class owner.
   *
   * - `classid`: The identifier of the asset class whose metadata to clear.
   *
   * Emits `ClassMetadataCleared`.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair. Signs transaction
   * @param {number} classid The class of the asset.
   * @returns {Promise} of transaction
   */
  async clearMetadataOfNFTClass (exec, keypair, classid) {
    const transaction = await exec.api.tx.classNfts.clearClassMetadata(classid)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Get details of an NFT asset class..
   *
   * @param {object} exec Executor class.
   * @param {string} classid NFT Class Id
   * @returns {object} Class Details
   */
  async getNFTClassDetails (exec, classid) {
    const classDetails = await exec.api.query.classNfts.class(classid)
    return JSON.parse(classDetails)
  }

  /**
   * Check if a NFT is owned by an account.
   *
   * @param {object} exec Executor class.
   * @param {string} who Account
   * @param {string} classid Class Id
   * @param {string} instanceid Instance Id
   * @returns {object} Class Details
   */
  async checkNFTOwnership (exec, who, classid, instanceid) {
    const result = await exec.api.query.classNfts.account(who, classid, instanceid)
    if (result.isNone) {
      return false
    }
    return result.unwrap()
  }

  /**
   * Get all the Non-Fungible Tokens of an account and a class
   * account can be enumerated.
   *
   * @param {object} exec Executor class.
   * @returns {object} List of all NFT instances classed by Account and Class Id
   */
  async getAllNFTs (exec) {
    const nftsEntries = await exec.api.query.classNfts.accountNfts.entries()
    // accounTest(AccountId, NtfsClassId) for the types of the key args
    const nfts = []
    nftsEntries.forEach(([{ args: [acc, klass] }, value]) => {
      nfts.push({ account: acc.toHuman(), class: klass.toHuman(), instances: value.toHuman() })
    })
    return nfts
  }

  /**
   * The assets held by any given account; set out this way so that assets owned by a single
   * account can be enumerated.
   *
   * @param {object} exec Executor class.
   * @param {string} who Account
   * @returns {object} Class Details
   */
  async getNFTsFromAccount (exec, who) {
    const nftsEntries = await exec.api.query.classNfts.accountNfts.entries(who)
    const nfts = []
    nftsEntries.forEach(([{ args: [acc, klass] }, value]) => {
      nfts.push({ account: acc.toHuman(), class: klass.toHuman(), instances: value.toHuman() })
    })
    return nfts
  }

  /**
   * The tokens in existence and their ownership details.
   *
   * @param {object} exec Executor class.
   * @param {string} classid Class Id
   * @param {string} instanceid Instance Id
   * @returns {object} Class Details
   */
  async getNFTOwner (exec, classid, instanceid) {
    const nfts = await exec.api.query.classNfts.asset(classid, instanceid)
    return JSON.parse(nfts)
  }

  /**
   * Metadata of an asset class.
   *
   * @param {object} exec Executor class.
   * @param {string} classid Class Id
   * @returns {object} Class Details
   */
  async getNFTClassMetadata (exec, classid) {
    const nfts = await exec.api.query.classNfts.classMetadataOf(classid)
    return JSON.parse(nfts)
  }

  /**
   * Metadata of an asset instance.
   *
   * @param {object} exec Executor class.
   * @param {string} classid Class Id
   * @param {string} instanceid Instance Id
   * @returns {object} Class Details
   */
  async getNFTInstanceMetadata (exec, classid, instanceid) {
    const nfts = await exec.api.query.classNfts.instanceMetadataOf(classid, instanceid)
    return JSON.parse(nfts)
  }

  /**
   * Attribute of an asset class/instance.
   *
   * @param {object} exec Executor class.
   * @param {string} classid Class Id
   * @param {string} instanceid Instance Id
   * @param {string} key Attribute key
   * @returns {object} Class Details
   */
  async getNFTAttribute (exec, classid, instanceid, key) {
    const nfts = await exec.api.query.classNfts.attribute(classid, instanceid, key)
    return JSON.parse(nfts)
  }
}