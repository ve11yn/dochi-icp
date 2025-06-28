import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'addFocusTime' : ActorMethod<[string, bigint], boolean>,
  'getAllFocusData' : ActorMethod<[], Array<[string, bigint]>>,
  'getFocusTime' : ActorMethod<[string], bigint>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
