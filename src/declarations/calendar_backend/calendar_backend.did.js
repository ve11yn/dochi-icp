export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const Category = IDL.Record({
    'name' : IDL.Text,
    'color' : IDL.Text,
    'textColor' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const CreateAppointmentRequest = IDL.Record({
    'startTime' : IDL.Text,
    'title' : IDL.Text,
    'endTime' : IDL.Text,
    'date' : IDL.Text,
    'category' : IDL.Text,
  });
  const AppointmentId = IDL.Nat;
  const Time = IDL.Int;
  const Appointment = IDL.Record({
    'id' : AppointmentId,
    'startTime' : IDL.Text,
    'title' : IDL.Text,
    'endTime' : IDL.Text,
    'userId' : UserId,
    'date' : IDL.Text,
    'createdAt' : Time,
    'color' : IDL.Text,
    'completed' : IDL.Bool,
    'updatedAt' : Time,
    'category' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : Appointment, 'err' : IDL.Text });
  const UserProfile = IDL.Record({
    'categories' : IDL.Vec(Category),
    'userId' : UserId,
    'createdAt' : Time,
  });
  const UpdateAppointmentRequest = IDL.Record({
    'id' : AppointmentId,
    'startTime' : IDL.Opt(IDL.Text),
    'title' : IDL.Opt(IDL.Text),
    'endTime' : IDL.Opt(IDL.Text),
    'completed' : IDL.Opt(IDL.Bool),
    'category' : IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    'addCategory' : IDL.Func([UserId, Category], [Result_1], []),
    'createAppointment' : IDL.Func(
        [UserId, CreateAppointmentRequest],
        [Result],
        [],
      ),
    'deleteAppointment' : IDL.Func([UserId, AppointmentId], [Result_1], []),
    'deleteCategory' : IDL.Func([UserId, IDL.Text], [Result_1], []),
    'getAllAppointments' : IDL.Func(
        [UserId],
        [IDL.Vec(Appointment)],
        ['query'],
      ),
    'getAppointmentsByDate' : IDL.Func(
        [UserId, IDL.Text],
        [IDL.Vec(Appointment)],
        ['query'],
      ),
    'getAppointmentsByDateRange' : IDL.Func(
        [UserId, IDL.Text, IDL.Text],
        [IDL.Vec(Appointment)],
        ['query'],
      ),
    'getAppointmentsGroupedByDate' : IDL.Func(
        [UserId],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(Appointment)))],
        ['query'],
      ),
    'getUserProfile' : IDL.Func([UserId], [UserProfile], ['query']),
    'toggleAppointmentCompletion' : IDL.Func(
        [UserId, AppointmentId],
        [Result],
        [],
      ),
    'updateAppointment' : IDL.Func(
        [UserId, UpdateAppointmentRequest],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
