export const idlFactory = ({ IDL }) => {
  const AppointmentInput = IDL.Record({
    'startTime' : IDL.Text,
    'title' : IDL.Text,
    'endTime' : IDL.Text,
    'color' : IDL.Opt(IDL.Text),
    'category' : IDL.Text,
  });
  const Appointment = IDL.Record({
    'id' : IDL.Nat,
    'startTime' : IDL.Text,
    'title' : IDL.Text,
    'endTime' : IDL.Text,
    'color' : IDL.Text,
    'completed' : IDL.Bool,
    'category' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : Appointment, 'err' : IDL.Text });
  const CategoryInput = IDL.Record({
    'name' : IDL.Text,
    'color' : IDL.Text,
    'textColor' : IDL.Opt(IDL.Text),
  });
  const Category = IDL.Record({
    'name' : IDL.Text,
    'color' : IDL.Text,
    'textColor' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : Category, 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const AppointmentUpdate = IDL.Record({
    'startTime' : IDL.Opt(IDL.Text),
    'title' : IDL.Opt(IDL.Text),
    'endTime' : IDL.Opt(IDL.Text),
    'color' : IDL.Opt(IDL.Text),
    'completed' : IDL.Opt(IDL.Bool),
    'category' : IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    'createAppointment' : IDL.Func(
        [IDL.Text, AppointmentInput],
        [Result_1],
        [],
      ),
    'createCategory' : IDL.Func([CategoryInput], [Result], []),
    'deleteAppointment' : IDL.Func([IDL.Text, IDL.Nat], [Result_2], []),
    'deleteCategory' : IDL.Func([IDL.Text], [Result_2], []),
    'getAppointments' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(Appointment)))],
        ['query'],
      ),
    'getAppointmentsByDate' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(Appointment)],
        ['query'],
      ),
    'getAppointmentsByDateRange' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(Appointment)))],
        ['query'],
      ),
    'getCategories' : IDL.Func([], [IDL.Vec(Category)], ['query']),
    'initializeSampleData' : IDL.Func([], [IDL.Text], []),
    'moveAppointment' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [Result_1], []),
    'searchAppointments' : IDL.Func(
        [IDL.Text],
        [
          IDL.Vec(
            IDL.Record({ 'appointment' : Appointment, 'date' : IDL.Text })
          ),
        ],
        ['query'],
      ),
    'toggleAppointmentComplete' : IDL.Func([IDL.Text, IDL.Nat], [Result_1], []),
    'updateAppointment' : IDL.Func(
        [IDL.Text, IDL.Nat, AppointmentUpdate],
        [Result_1],
        [],
      ),
    'updateCategory' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
