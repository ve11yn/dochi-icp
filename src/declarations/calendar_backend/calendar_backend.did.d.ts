import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Appointment {
  'id' : bigint,
  'startTime' : string,
  'title' : string,
  'endTime' : string,
  'color' : string,
  'completed' : boolean,
  'category' : string,
}
export interface AppointmentInput {
  'startTime' : string,
  'title' : string,
  'endTime' : string,
  'color' : [] | [string],
  'category' : string,
}
export interface AppointmentUpdate {
  'startTime' : [] | [string],
  'title' : [] | [string],
  'endTime' : [] | [string],
  'color' : [] | [string],
  'completed' : [] | [boolean],
  'category' : [] | [string],
}
export interface Category {
  'name' : string,
  'color' : string,
  'textColor' : string,
}
export interface CategoryInput {
  'name' : string,
  'color' : string,
  'textColor' : [] | [string],
}
export type Result = { 'ok' : Category } |
  { 'err' : string };
export type Result_1 = { 'ok' : Appointment } |
  { 'err' : string };
export type Result_2 = { 'ok' : string } |
  { 'err' : string };
export interface _SERVICE {
  'createAppointment' : ActorMethod<[string, AppointmentInput], Result_1>,
  'createCategory' : ActorMethod<[CategoryInput], Result>,
  'deleteAppointment' : ActorMethod<[string, bigint], Result_2>,
  'deleteCategory' : ActorMethod<[string], Result_2>,
  'getAppointments' : ActorMethod<[], Array<[string, Array<Appointment>]>>,
  'getAppointmentsByDate' : ActorMethod<[string], Array<Appointment>>,
  'getAppointmentsByDateRange' : ActorMethod<
    [string, string],
    Array<[string, Array<Appointment>]>
  >,
  'getCategories' : ActorMethod<[], Array<Category>>,
  'initializeSampleData' : ActorMethod<[], string>,
  'moveAppointment' : ActorMethod<[string, bigint, string], Result_1>,
  'searchAppointments' : ActorMethod<
    [string],
    Array<{ 'appointment' : Appointment, 'date' : string }>
  >,
  'toggleAppointmentComplete' : ActorMethod<[string, bigint], Result_1>,
  'updateAppointment' : ActorMethod<
    [string, bigint, AppointmentUpdate],
    Result_1
  >,
  'updateCategory' : ActorMethod<
    [string, [] | [string], [] | [string], [] | [string]],
    Result
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
