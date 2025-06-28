import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AuthResponse { 'user' : User, 'isFirstTime' : boolean }
export type LoginError = { 'InvalidInput' : null } |
  { 'NotFound' : null } |
  { 'NotAuthorized' : null } |
  { 'AlreadyExists' : null };
export type Result = { 'ok' : User } |
  { 'err' : LoginError };
export type Result_1 = { 'ok' : AuthResponse } |
  { 'err' : LoginError };
export type Result_2 = { 'ok' : boolean } |
  { 'err' : LoginError };
export interface User {
  'principal' : string,
  'name' : string,
  'createdAt' : bigint,
}
export interface _SERVICE {
  'checkUserExists' : ActorMethod<[], [] | [User]>,
  'createUserProfile' : ActorMethod<[string], Result>,
  'deleteUserProfile' : ActorMethod<[], Result_2>,
  'getLoginStats' : ActorMethod<
    [],
    { 'canisterMemory' : bigint, 'totalUsers' : bigint }
  >,
  'getMyProfile' : ActorMethod<[], [] | [User]>,
  'getUserProfile' : ActorMethod<[Principal], [] | [User]>,
  'healthCheck' : ActorMethod<[], string>,
  'loginUser' : ActorMethod<[], Result_1>,
  'updateUserProfile' : ActorMethod<[string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
